# Buildify AI

<h1 align="center">
  <strong>Buildify AI</strong> - AI-Powered Startup Planning Assistant
</h1>

<p align="center">
  Transform your startup ideas into comprehensive product specifications and CTO-grade masterplans
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**Buildify AI** is an intelligent virtual CTO and highly-structured technical planning assistant application built with Next.js. It is explicitly designed to help non-technical founders and developers brainstorm, architect, and blueprint their startup ideas from scratch.

The application features an active, fluid conversational interface that asks deep, nuanced questions about your Target Audience, Platform requirements, Tech Stack preferences, and anticipated Challenges. Once it has collected enough contextual depth, it dynamically generates an Engineering-Grade Masterplan using advanced LLM backends.

### Key Features

- **Conversational CTO Advisor**: Mimics an expert CTO using multi-turn memory to uncover hidden layers within your core idea
- **Multi-Stage Pipeline**: Three-stage flow - Overview Generation → Product Specification → CTO Masterplan
- **Dynamic Content Generation**: Leverages MiniMax AI API and Google Gemini for synthesis
- **10-Tier Architectural Outputs**: Final Masterplan includes Executive Summary, Target Audience Analysis, Core Feature Specification, Technical Architecture, Data Model Design, UI/UX Principles, Security Considerations, Development Milestones, Potential Challenges, and Future Expansion
- **Glassmorphic UI**: Modern, production-tier styling with Tailwind CSS, gradient overlays, and smooth animations

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Next.js 14 (App Router), TypeScript |
| **Styling** | Tailwind CSS 3.4, Custom Glassmorphic Components |
| **Animations** | Framer Motion 11 |
| **Icons** | Lucide React |
| **AI Backend** | Next.js API Routes |
| **AI Providers** | MiniMax API, Google Gemini |

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MiniMax API Key** (required for primary AI features)
- **Google Gemini API Key** (required for fallback/synthesis)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/saksham-source/BUILDIFY-AI.git
   cd BUILDIFY-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your API keys to `.env.local`:
   ```env
   MINIMAX_API_KEY=your_minimax_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   - Get your MiniMax API key from: [MiniMax Platform](https://platform.minimaxi.com/)
   - Get your Gemini API key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

5. Run the development server:
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

---

## Project Structure

```
BUILDIFY-AI/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API Routes
│   │   │   ├── cto-chat/              # CTO conversational AI endpoint
│   │   │   ├── generate-overview/     # Startup overview generation
│   │   │   └── generate-product-spec/ # Product specification generation
│   │   ├── cto-chat/           # CTO Chat page
│   │   ├── masterplan/         # Masterplan display page
│   │   ├── overview/           # Startup overview page
│   │   ├── processing/         # Processing/loading page
│   │   ├── product-spec/       # Product specification page
│   │   ├── report/             # Final report page
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── OverviewCard.tsx        # Overview card component
│   │   ├── FeasibilityScore.tsx    # Feasibility score display
│   │   ├── ProcessingLoader.tsx    # Loading animation
│   │   └── ReportSection.tsx       # Report section component
│   │
│   ├── lib/                    # Library utilities
│   │   ├── ai-client.ts        # AI client with fallback logic
│   │   └── startup-session.ts  # Shared session storage helpers
│   │
│   └── types/                  # TypeScript type definitions
│       ├── chat.ts             # Chat-related types
│       └── index.ts            # Main type exports
│
├── .env.example                # Environment variables template
├── .eslintrc.json              # ESLint configuration
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── PROMPT.md                   # CTO system prompt guidelines
└── LICENSE                     # MIT License
```

---

## Application Flow

```
┌─────────────────┐
│   Landing Page  │  User enters startup name & description
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Processing Page │  AI generates initial startup overview
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Overview Page   │  Display: Problem, Audience, Market, Features
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CTO Chat Page  │  Conversational AI asks deep questions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Masterplan Page │  10-section CTO-grade masterplan generated
└─────────────────┘
```

---

## Architecture

### AI Integration Strategy

The application uses a **multi-provider fallback strategy** to ensure reliability:

1. **Primary**: MiniMax API (abab6.5s-chat model)
2. **Fallback**: Google Gemini API
3. **Final Fallback**: Built-in template responses

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate-overview` | POST | Generate startup overview from name/description |
| `/api/generate-product-spec` | POST | Generate detailed product specification |
| `/api/cto-chat` | POST | Conversational CTO advisor |

### State Management

- **Session Storage**: Intermediate data persistence between pages
- **Component State**: React useState/useRef for UI state
- **Server State**: API calls via fetch in useEffect hooks

---

## Masterplan Structure (10 Sections)

1. **Executive Summary** - Product vision and problem statement
2. **Target Audience Analysis** - User personas and pain points
3. **Core Feature Specification** - MVP feature breakdown
4. **User Experience Principles** - UI/UX philosophy
5. **Technical Architecture** - Recommended architecture style
6. **Data Model Design** - Core entities and relationships
7. **Security Considerations** - Auth, data protection, compliance
8. **Development Phases** - Milestones and timelines
9. **Potential Challenges & Mitigations** - Risks and mitigations
10. **Future Expansion** - v2/v3 roadmap

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MINIMAX_API_KEY` | Yes | MiniMax API key for primary AI features |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for fallback/synthesis |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

This is a standard Next.js application. Deploy to any platform that supports Node.js:

- **Vercel** (Recommended)
- **Netlify**
- **Railway**
- **AWS Amplify**

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Sajal** - [GitHub](https://github.com/saksham-source)

---

<p align="center">
  Built with passion for helping founders turn ideas into reality
</p>