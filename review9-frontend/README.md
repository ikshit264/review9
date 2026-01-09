# IntervAI - AI-Powered Recruitment Platform

A Next.js application for AI-led technical and behavioral interviews with advanced proctoring features.

## Features

- 🤖 **AI-Powered Interviews** - Gemini-powered interview questions and real-time responses
- 📹 **Video Conferencing** - Google Meet-style UI with camera/mic controls
- 🔒 **Advanced Proctoring** - Tab tracking, eye tracking, and multi-face detection
- 📊 **Analytics Dashboard** - Score distribution, integrity tracking, and detailed reports
- 🎯 **Subscription Tiers** - FREE, PRO, and ULTRA plans with different features

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and navigate to the project:
```bash
cd review9
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Gemini API key:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

- **Company Account**: `company@gmail.com` / `company@gmail.com`
- **Candidate Account**: `candidate@gmail.com` / `candidate@gmail.com`

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Login page
│   ├── dashboard/                # Dashboard
│   ├── profile/                  # Candidate profile
│   ├── scheduled/                # Scheduled interviews
│   ├── interview/[id]/           # Interview room
│   ├── company-view/[companyId]/ # Company public profile
│   └── [companyName]/[jobId]/    # Job management routes
│       ├── page.tsx              # Job overview
│       ├── edit/                 # Job edit & config
│       ├── analytics/            # Job analytics
│       └── responses/            # Candidate responses
├── components/                   # React components
│   ├── UI.tsx                    # Base UI components
│   ├── dashboard/                # Dashboard-specific components
│   └── interview/                # Interview-specific components
├── hooks/                        # Custom React hooks
│   └── api/                      # API hooks with React Query
├── services/                     # External service integrations
├── store/                        # Zustand state management
├── types.ts                      # TypeScript type definitions
└── config.ts                     # App configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
