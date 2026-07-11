/**
 * Buildify AI - AI Client Library
 * Copyright (c) 2024 Sajal
 *
 * Multi-provider AI client with MiniMax and Gemini fallback support
 * @author Sajal
 * @license MIT
 */

import { StartupOverview, ProductSpec, StartupInput } from '@/types';

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export interface AIResponse {
  content: string;
  model: 'minimax' | 'gemini' | 'fallback';
  error?: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callMinimaxAPI(
  messages: AIMessage[],
  modelName: string = 'MiniMax-M2.5'
): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error('MINIMAX_API_KEY not configured');
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiniMax API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('Invalid response structure from MiniMax API');
  }

  return data.choices[0].message.content;
}

async function callGeminiAPI(messages: AIMessage[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  const contents = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}

export async function callMinimaxChat(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const formattedMessages: AIMessage[] = messages.map((msg) => ({
    role: msg.role === 'cto' || msg.role === 'assistant' ? 'assistant' : 
          msg.role === 'user' ? 'user' : 'system',
    content: msg.content
  }));

  const minimaxModels = ['MiniMax-M2.7', 'MiniMax-M2.5', 'MiniMax-Text-01'];
  let lastError = '';

  for (const model of minimaxModels) {
    try {
      const content = await callMinimaxAPI(formattedMessages, model);
      if (content && content.trim()) {
        return content;
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'Unknown error';
      console.error(`MiniMax ${model} failed:`, lastError);
    }
  }

  throw new Error(`All MiniMax models failed. Last error: ${lastError}`);
}

export async function callGeminiChat(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const formattedMessages: AIMessage[] = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  return callGeminiAPI(formattedMessages);
}

export async function generateSynthesizedMasterplan(
  userContext: Partial<{
    idea: string;
    targetAudience: string;
    platform: string;
    features: string;
    techStack: string;
    challenges: string;
  }>
): Promise<{ content: string; model: string }> {
  const masterplanPrompt = `You are an expert CTO creating a comprehensive masterplan blueprint. This document should guide development decisions and communicate the vision to stakeholders.

**Startup:** ${userContext.idea || 'N/A'}
**Target Audience:** ${userContext.targetAudience || 'N/A'}
**Platform:** ${userContext.platform || 'N/A'}
**Core Features:** ${userContext.features || 'N/A'}
**Anticipated Challenges:** ${userContext.challenges || 'N/A'}

Generate a 10-section masterplan that serves as a high-level blueprint:

1. **Executive Summary** - What is this product, what problem does it solve, and what's the vision?

2. **Target Audience Analysis** - Deep dive into user personas, their jobs-to-be-done, pain points, and how this product addresses them.

3. **Core Feature Specification** - Detailed breakdown of MVP features with user value and technical considerations. What constitutes the "happy path"?

4. **User Experience Principles** - High-level UI/UX philosophy. Key interaction patterns. Accessibility considerations.

5. **Technical Architecture** - Recommended architecture style, key components, how they interact. Consider ${userContext.platform || 'platform'} requirements.

6. **Data Model Design** - Core entities, relationships, and data flow. What data is critical and how should it be structured?

7. **Security Considerations** - Authentication approach, data protection, compliance needs, common vulnerabilities to address.

8. **Development Phases** - Break down into logical milestones (Phase 1: Foundation, Phase 2: Core MVP, Phase 3: Polish). Realistic timelines.

9. **Potential Challenges & Mitigations** - Technical challenges, market risks, resource constraints. Propose mitigations for each.

10. **Future Expansion** - What does v2/v3 look like? What architectural decisions enable future growth?

Each section should be 3-5 paragraphs with specific, actionable guidance. This is a living document for development decisions.`;

  const errors: string[] = [];
  let minimaxDraft = '';
  let geminiDraft = '';

  if (MINIMAX_API_KEY) {
    try {
      minimaxDraft = await callMinimaxChat([
        { role: 'user', content: masterplanPrompt }
      ]);
    } catch (e) {
      errors.push(`MiniMax: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  if (GEMINI_API_KEY) {
    try {
      geminiDraft = await callGeminiChat([
        { role: 'user', content: masterplanPrompt }
      ]);
    } catch (e) {
      errors.push(`Gemini: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  if (minimaxDraft && geminiDraft) {
    try {
      const synthesisPrompt = `You are a Lead CTO finalizing a masterplan. Combine the best ideas from both drafts into one cohesive document.

Draft 1 (MiniMax):
${minimaxDraft}

Draft 2 (Gemini):
${geminiDraft}

Create a final, unified 10-section Masterplan that combines the strongest elements from both. Output ONLY the Markdown document, no explanations.`;

      const synthesized = await callGeminiAPI([
        { role: 'user', content: synthesisPrompt }
      ]);
      
      return { content: synthesized, model: 'synthesized (minimax + gemini)' };
    } catch (e) {
      console.error('Synthesis failed:', e);
    }
  }

  if (minimaxDraft) {
    return { content: minimaxDraft, model: 'minimax' };
  }
  
  if (geminiDraft) {
    return { content: geminiDraft, model: 'gemini' };
  }

  throw new Error(`AI generation failed. Errors: ${errors.join('; ')}`);
}

export async function chatWithFallback(
  messages: Array<{ role: string; content: string }>,
  fallbackResponse: string
): Promise<AIResponse> {
  const errors: string[] = [];

  if (MINIMAX_API_KEY) {
    try {
      const content = await callMinimaxChat(messages);
      return { content, model: 'minimax' };
    } catch (e) {
      errors.push(`MiniMax: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  if (GEMINI_API_KEY) {
    try {
      const content = await callGeminiChat(messages);
      return { content, model: 'gemini' };
    } catch (e) {
      errors.push(`Gemini: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  return {
    content: fallbackResponse,
    model: 'fallback',
    error: errors.length > 0 ? errors.join('; ') : 'No AI API keys configured'
  };
}

async function generateJsonWithFallback<T>(
  prompt: string,
  validate: (data: unknown) => data is T
): Promise<{ data: T; model: 'minimax' | 'gemini' } | null> {
  const attempts: Array<{ model: 'minimax' | 'gemini'; call: () => Promise<string> }> = [];

  if (MINIMAX_API_KEY) {
    attempts.push({
      model: 'minimax',
      call: () =>
        callMinimaxAPI(
          [
            { role: 'system', content: 'You must respond with ONLY valid JSON, no markdown or explanation.' },
            { role: 'user', content: prompt },
          ],
          'MiniMax-Text-01'
        ),
    });
  }

  if (GEMINI_API_KEY) {
    attempts.push({ model: 'gemini', call: () => callGeminiAPI([{ role: 'user', content: prompt }]) });
  }

  for (const { model, call } of attempts) {
    try {
      const raw = await call();
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (validate(parsed)) {
        return { data: parsed, model };
      }
      console.warn(`${model} returned invalid data structure`);
    } catch (e) {
      console.error(`${model} generation failed:`, e);
    }
  }

  return null;
}

function validateOverviewData(data: unknown): data is StartupOverview {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.problemStatement === 'string' &&
    typeof d.targetAudience === 'string' &&
    typeof d.marketOpportunity === 'string' &&
    typeof d.monetizationStrategy === 'string' &&
    Array.isArray(d.mvpFeatures) &&
    typeof d.feasibilityScore === 'number' &&
    typeof d.oneLinePitch === 'string'
  );
}

function validateProductSpecData(data: unknown): data is ProductSpec {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.coreFeatures) &&
    Array.isArray(d.pages) &&
    Array.isArray(d.userFlow) &&
    typeof d.techStack === 'object' &&
    typeof d.scalingConsiderations === 'string'
  );
}

export async function generateOverviewWithFallback(
  input: StartupInput
): Promise<{ data: StartupOverview; model: 'minimax' | 'gemini' | 'fallback' }> {
  const prompt = `You are an expert startup strategist and CTO advisor. Analyze this startup idea deeply and provide a comprehensive overview.

Startup Name: ${input.name}
Description: ${input.description || 'Not specified'}

Think through these dimensions:

1. **Problem Understanding**: What specific pain point does this solve? Why does this problem exist? Who experiences it most acutely?

2. **Target Audience**: Define the primary user segments. What are their characteristics, behaviors, and what jobs-to-be-done drive them?

3. **Market Opportunity**: What is the market size and trajectory? What trends make this viable now? Who are indirect competitors?

4. **Value Proposition**: What makes this solution unique? Why would users switch from alternatives?

5. **Monetization**: What business model fits best (subscription, transaction, freemium, etc.)? What's the revenue potential?

6. **MVP Features**: What are the absolute must-have features that deliver core value? (Max 5 for MVP)

7. **Feasibility Score**: Rate 1-10 considering: technical complexity, development time, initial cost, market readiness, competitive landscape

Return ONLY this exact JSON structure with no markdown:
{"problemStatement":"1-2 sentences on the core pain point and why it matters","targetAudience":"Specific user segments with demographics and behaviors","marketOpportunity":"Market size context, timing, and competitive landscape","monetizationStrategy":"Recommended model with pricing rationale","mvpFeatures":["Feature 1 that delivers core value","Feature 2","Feature 3"],"feasibilityScore":6-8,"oneLinePitch":"Compelling 10-15 word pitch that highlights unique value"}`;

  const fallbackData: StartupOverview = {
    problemStatement: `Users need better solutions for: ${input.description || 'this challenge'}`,
    targetAudience: 'Early adopters, tech-savvy professionals aged 25-45',
    marketOpportunity: 'Growing market with significant untapped potential',
    monetizationStrategy: 'Freemium model with premium features',
    mvpFeatures: [
      'User authentication and profile management',
      'Core functionality dashboard',
      'Basic analytics and reporting',
      'Email notifications',
      'Mobile responsive design'
    ],
    feasibilityScore: 7,
    oneLinePitch: `${input.name} helps users achieve more with less effort`
  };

  const result = await generateJsonWithFallback(prompt, validateOverviewData);
  return result ?? { data: fallbackData, model: 'fallback' };
}

export async function generateProductSpecWithFallback(
  overview: StartupOverview,
  startupName: string
): Promise<{ data: ProductSpec; model: 'minimax' | 'gemini' | 'fallback' }> {
  const prompt = `You are a senior product manager working with a CTO. Create a comprehensive product specification.

Startup: ${startupName}
Problem Being Solved: ${overview.problemStatement}
Target Audience: ${overview.targetAudience}
MVP Features: ${overview.mvpFeatures.join(', ')}

Think through:

1. **Core Features**: Expand each MVP feature into specific capabilities. What's the user interaction model? What actions can they take?

2. **Pages/Screens**: Define the main pages/screens needed. For each:
   - What's its purpose in the user journey?
   - What key elements must be present?
   - What's the primary user action on this screen?

3. **User Flow**: Map out the critical paths:
   - How does a new user sign up and get started?
   - How do they accomplish the core value proposition?
   - How do they return and continue using the product?

4. **Tech Stack Recommendations**: Suggest appropriate technologies:
   - Frontend: Consider complexity, team skills, performance needs
   - Backend: API style, language suitability, ecosystem
   - Database: Data model fit, scalability, cost
   - Deployment: DevOps complexity, scaling, reliability

5. **Scaling Considerations**: Think about:
   - Expected initial load and growth trajectory
   - Data volume implications
   - Third-party service dependencies
   - Where bottlenecks might emerge

Return ONLY this exact JSON structure with no markdown:
{"coreFeatures":["Feature with user interaction detail","..."],"pages":[{"name":"Page/Screen name","purpose":"User value and context","keyElements":["Element 1","Element 2"]}],"userFlow":["Entry point → Key action → Value realization","Alternative paths"],"techStack":{"frontend":"Recommendation with rationale","backend":"Recommendation with rationale","database":"Recommendation with rationale","deployment":"Recommendation with rationale"},"scalingConsiderations":"Key scalability considerations and bottlenecks to plan for"}`;

  const fallbackData: ProductSpec = {
    coreFeatures: [
      'User authentication and onboarding',
      'Interactive dashboard with real-time data',
      'Search and filtering capabilities',
      'User settings and preferences',
      'Analytics and insights',
      'Notification system'
    ],
    pages: [
      { name: 'Landing Page', purpose: 'First impression and value proposition', keyElements: ['Hero section', 'Features overview', 'CTA'] },
      { name: 'Dashboard', purpose: 'Main workspace for users', keyElements: ['Quick stats', 'Recent activity', 'Quick actions'] },
      { name: 'Settings', purpose: 'User preferences management', keyElements: ['Profile', 'Notifications', 'Privacy'] }
    ],
    userFlow: ['Sign up → Onboarding → Dashboard → Use features → Track progress'],
    techStack: {
      frontend: 'Next.js + Tailwind CSS',
      backend: 'Node.js with Express',
      database: 'PostgreSQL',
      deployment: 'Vercel'
    },
    scalingConsiderations: 'Consider microservices architecture and CDN for assets'
  };

  const result = await generateJsonWithFallback(prompt, validateProductSpecData);
  return result ?? { data: fallbackData, model: 'fallback' };
}
