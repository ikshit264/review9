import { SubscriptionPlan } from './types';

export const APP_CONFIG = {
  MODELS: {
    PRIMARY: 'gemini-3-pro-preview',
    FLASH: 'gemini-3-flash-preview',
  },
  PLANS: {
    [SubscriptionPlan.FREE]: {
      maxCandidatesPerJob: 30,
      fixedQuestionCount: 10,
      interactive: false,
      features: ['Up to 30 candidates', 'Static interview flow', 'Basic proctoring', 'Standard analytics'],
      price: '$0'
    },
    [SubscriptionPlan.PRO]: {
      maxCandidatesPerJob: Infinity,
      fixedQuestionCount: 8,
      interactive: true,
      features: ['Unlimited candidates', 'Interactive AI flow', 'Advanced proctoring (Eye/Tab)', 'Resume-based dynamic logic'],
      price: '$99'
    },
    [SubscriptionPlan.ULTRA]: {
      maxCandidatesPerJob: Infinity,
      fixedQuestionCount: 12,
      interactive: true,
      features: ['Full Proctoring Suite', 'Multi-face detection', 'Custom AI personas', 'Priority API access'],
      price: '$249'
    }
  },
  EVALUATION: {
    maxScore: 100,
    metrics: [
      'Technical Competence',
      'Communication Clarity',
      'Problem Solving',
      'Role Alignment'
    ],
    defaultScore: 50,
    systemInstruction: "You are a world-class hiring auditor. Provide evidence-based, strict scoring. Use JSON."
  },
  SPEECH: {
    lang: 'en-US',
    preferredVoice: 'Google US English',
    interruptionThreshold: 5,
    acknowledgmentMaxLength: 25,
    defaultVoices: ['Google US English', 'Microsoft David Desktop', 'en-US'],
    silenceTimeout: 4000,
    minAutoSubmitLength: 5
  },
  PROCTORING: {
    highSeverityThreshold: 3,
    tabTrackingEnabled: true,
    eyeTrackingEnabled: true,
    faceDetectionEnabled: true
  },
  INTERVIEW: {
    minAnswerLength: 2,
    mockParsingDelay: 1500,
    mockFinalizationDelay: 2000,
    fallbackQuestions: [
      "Could you walk me through the most technically challenging project on your resume?",
      "How do you handle conflict or differing technical opinions within a team?",
      "What is your approach to ensuring the scalability and maintainability of your code?",
      "Can you explain a complex technical concept to a non-technical stakeholder?",
      "Where do you see your technical skills evolving in the next two years?"
    ]
  }
};
