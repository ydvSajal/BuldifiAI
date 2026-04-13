/**
 * Buildify AI - CTO Chat API Route
 * Copyright (c) 2024 Sajal
 *
 * @author Sajal
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatWithFallback, generateSynthesizedMasterplan } from '@/lib/ai-client';

// CTO System Prompt following PROMPT.md guidelines
const CTO_SYSTEM_PROMPT = `You are a professional CTO who is very friendly and supportive.

Your task is to help a developer understand and plan their app idea through a conversation. Follow these instructions:

1. Begin by explaining that you'll be asking questions to understand their app idea at a high level, and once you have a clear picture, you'll generate a comprehensive masterplan.

2. Ask questions one at a time in a conversational manner. Use the developer's previous answers to inform your next questions.

3. Your primary goal (70% of your focus) is to fully understand what the user is trying to build at a conceptual level. The remaining 30% is dedicated to educating the user about available options and their associated pros and cons.

4. When discussing technical aspects (e.g., choosing a database or framework), offer high-level alternatives with pros and cons. Always provide your best suggestion along with a brief explanation, but keep the discussion conceptual rather than technical.

5. Be proactive in your questioning. If the user's idea seems to require certain technologies or services (e.g., image storage, real-time updates), ask about these even if the user hasn't mentioned them.

6. Try to understand the 'why' behind what the user is building. This will help you offer better advice and suggestions.

7. Ask if the user has any diagrams or wireframes they would like to share or describe.

8. Cover key aspects including:
   - Core features and functionality
   - Target audience
   - Platform (web, mobile, desktop)
   - User interface and experience concepts
   - Data storage and management needs
   - User authentication and security requirements
   - Potential third-party integrations
   - Scalability considerations
   - Potential technical challenges

9. When you feel you have a comprehensive understanding (after at least 4-5 exchanges covering the basics), inform the user that you're ready to create the masterplan.

10. Generate a comprehensive masterplan with these 10 sections:
    - Executive Summary
    - Target Audience Analysis
    - Core Feature Specification
    - Technical Architecture
    - Data Model Design
    - UI/UX Principles
    - Security Considerations
    - Development Milestones
    - Potential Challenges
    - Future Expansion

Important: Do not generate any code. Focus on concepts and architecture. Keep responses conversational and under 150 words unless the user asks for the masterplan.`;

interface ConversationState {
  stage: 'intro' | 'exploring' | 'wrapping_up' | 'generating';
  gatheredInfo: {
    startupName?: string;
    idea?: string;
    targetAudience?: string;
    platform?: string;
    features: string[];
    challenges?: string;
  };
  messageCount: number;
}

// Parse startup context from the first message
function parseStartupContext(message: string): { startupName?: string; idea?: string } {
  const nameMatch = message.match(/Name:\s*([^\n-]+)/i);
  const descMatch = message.match(/Description:\s*([^\n-]+)/i);

  return {
    startupName: nameMatch ? nameMatch[1].trim() : undefined,
    idea: descMatch ? descMatch[1].trim() : message.substring(0, 100)
  };
}

function buildConversationState(messages: Array<{ role: string; content: string }>): ConversationState {
  const userMessages = messages.filter((m) => m.role === 'user');
  const state: ConversationState = {
    stage: 'intro',
    gatheredInfo: { features: [] },
    messageCount: userMessages.length
  };

  if (userMessages.length === 0) {
    return state;
  }

  const firstMessage = userMessages[0]?.content || '';
  const parsed = parseStartupContext(firstMessage);
  if (parsed.startupName) state.gatheredInfo.startupName = parsed.startupName;
  if (parsed.idea) state.gatheredInfo.idea = parsed.idea;
  state.stage = 'exploring';

  if (userMessages[1]?.content) {
    state.gatheredInfo.targetAudience = userMessages[1].content;
  }

  if (userMessages[2]?.content) {
    state.gatheredInfo.platform = userMessages[2].content;
  }

  if (userMessages[3]?.content) {
    state.gatheredInfo.features = parseFeaturesFromMessage(userMessages[3].content);
  }

  if (userMessages[4]?.content) {
    state.gatheredInfo.challenges = userMessages[4].content;
  }

  return state;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, action } = body;

    // Reset conversation if explicitly requested
    if (action === 'reset') {
      return NextResponse.json({
        content: `Hey there! Great to connect with you.

I'm your virtual CTO advisor - a friendly technical partner who wants to help you turn your app idea into a solid plan.

Here's how this works: I'll ask you some questions to understand what you want to build and why. Once I have a clear picture, I'll create a comprehensive masterplan that serves as your high-level blueprint.

This is a brainstorming session, so don't worry about having all the answers perfectly polished. Just think out loud!

What's the app idea you're thinking about building?`,
        stage: 'intro',
        context: {}
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const conversationState = buildConversationState(messages);

    // Build context string for the AI
    const info = conversationState.gatheredInfo;
    let contextString = '';
    if (info.startupName) contextString += `Startup: ${info.startupName}\n`;
    if (info.idea) contextString += `Idea: ${info.idea}\n`;
    if (info.targetAudience) contextString += `Target Audience: ${info.targetAudience}\n`;
    if (info.platform) contextString += `Platform: ${info.platform}\n`;
    if (info.features.length > 0) contextString += `Features: ${info.features.join(', ')}\n`;
    if (info.challenges) contextString += `Challenges: ${info.challenges}\n`;

    // Determine what to ask about next
    let questionTopic = '';
    if (!info.targetAudience) {
      questionTopic = "targetAudience";
    } else if (!info.platform) {
      questionTopic = "platform";
    } else if (info.features.length === 0) {
      questionTopic = "features";
    } else if (!info.challenges) {
      questionTopic = "challenges";
    }

    // Build the prompt for the AI
    let prompt = CTO_SYSTEM_PROMPT;

    if (contextString) {
      prompt += `\n\nHere is what you already know about the user's idea:\n${contextString}`;
    }

    if (questionTopic) {
      const questionPrompts: Record<string, string> = {
        targetAudience: "Ask about the target audience - who is the ideal user, their demographics, and their main goals.",
        platform: "Ask about the platform - web, mobile (iOS/Android), or both.",
        features: "Ask about the core features they envision for the MVP.",
        challenges: "Ask about potential challenges or constraints they foresee."
      };
      prompt += `\n\nYour next question should be about: ${questionPrompts[questionTopic]}`;
    }

    if (conversationState.messageCount >= 5 && info.features.length > 0 && !info.challenges) {
      prompt += `\n\nYou now have enough information. Let the user know you're ready to create the masterplan.`;
    }

    // Try AI generation
    let response: string;
    let model: string = 'fallback';

    try {
      const aiResponse = await chatWithFallback(
        [{ role: 'system', content: prompt }, ...messages],
        ''
      );
      response = aiResponse.content;
      model = aiResponse.model;

      if (aiResponse.model === 'fallback' || !response) {
        response = generateFallbackResponse(conversationState);
      }
    } catch {
      response = generateFallbackResponse(conversationState);
    }

    // Check if ready for masterplan
    const infoAfterUpdate = conversationState.gatheredInfo;
    const hasEnoughInfo =
      infoAfterUpdate.startupName &&
      infoAfterUpdate.targetAudience &&
      infoAfterUpdate.platform &&
      infoAfterUpdate.features.length > 0;

    // Generate masterplan if we have enough messages
    if (conversationState.messageCount >= 5 && hasEnoughInfo && conversationState.stage !== 'generating') {
      conversationState.stage = 'generating';

      try {
        const synthesis = await generateSynthesizedMasterplan({
          idea: infoAfterUpdate.startupName,
          targetAudience: infoAfterUpdate.targetAudience,
          platform: infoAfterUpdate.platform,
          features: infoAfterUpdate.features.join(', '),
          challenges: infoAfterUpdate.challenges
        });

        return NextResponse.json({
          content: `${response}

---

# ${infoAfterUpdate.startupName || 'Your App'} - Masterplan

${synthesis.content}

---

**That's your masterplan!** Would you like me to adjust anything or dive deeper into any section?`,
          isMasterplan: true,
          stage: 'generating',
          context: conversationState.gatheredInfo,
          model: synthesis.model
        });
      } catch (e) {
        console.error('Masterplan generation failed:', e);
        // Continue with conversation if masterplan fails
      }
    }

    return NextResponse.json({
      content: response,
      stage: conversationState.stage,
      context: conversationState.gatheredInfo,
      model,
      questionTopic
    });

  } catch (error) {
    console.error('Error in CTO chat:', error);
    return NextResponse.json({
      content: "I'm sorry, I ran into an issue. Could you tell me more about your app idea?",
      stage: 'error',
      error: true
    });
  }
}

function parseFeaturesFromMessage(message: string): string[] {
  return message
    .split(/[,;.\n]|and(?=\s)/)
    .map((f) => f.trim())
    .filter((f) => f.length > 2)
    .slice(0, 7);
}

function generateFallbackResponse(state: ConversationState): string {
  const msgCount = state.messageCount;
  const info = state.gatheredInfo;

  if (msgCount === 1) {
    return `That's a great starting point! I'd love to learn more.

Who is your target audience? What kind of people would use "${info.startupName || 'this app'}"? Tell me about them - age, role, what they're trying to achieve.`;
  }

  if (msgCount === 2) {
    return `Got it! So you're targeting ${info.targetAudience}.

How do you envision users accessing this? Is it a web app, mobile (iOS/Android), or both?`;
  }

  if (msgCount === 3) {
    return `Perfect! ${info.platform} makes sense for this type of app.

What are the core features you're envisioning for the MVP? What should a user be able to do?`;
  }

  if (msgCount === 4) {
    return `Excellent! Those are solid core features.

Before I create your masterplan, what challenges or concerns do you foresee? Budget, timeline, technical complexity - anything on your mind?`;
  }

  if (msgCount === 5) {
    return `That's really helpful context! You have a clear vision.

I'm going to generate your masterplan now. Give me just a moment...`;
  }

  return `Tell me more about what you're building. What aspects would you like to explore further?`;
}
