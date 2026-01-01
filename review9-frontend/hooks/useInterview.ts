'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SubscriptionPlan, ChatMessage, ProctoringLog, User, Candidate, JobPosting } from '@/types';
import { APP_CONFIG } from '@/config';
import { useInterviewPageApi } from './api/useInterviewPageApi';
import { interviewsApi } from '@/services/api';

type ConversationState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

// Browser Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export const useInterview = (
  user: User | null,
  resumeText: string,
  onAnswer?: (question: string, answer: string) => void,
  onProctoring?: (type: string, severity: string) => void,
  onTimeUp?: () => void,
  sessionId?: string
) => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [systemState, setSystemState] = useState<ConversationState>('IDLE');
  const [proctorLogs, setProctorLogs] = useState<ProctoringLog[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [isFlagged, setIsFlagged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiActiveText, setAiActiveText] = useState("");
  const [aiHighlightIndex, setAiHighlightIndex] = useState(-1);
  const [candidateInterimText, setCandidateInterimText] = useState("");
  const [isSTTProcessing, setIsSTTProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isUserTurn, setIsUserTurn] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const finalTranscriptRef = useRef("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef(0);
  const systemStateRef = useRef<ConversationState>('IDLE');
  const isUserTurnRef = useRef(false);

  const setSystemStateWithRef = (newState: ConversationState) => {
    setSystemState(newState);
    systemStateRef.current = newState;
  };

  useEffect(() => {
    isUserTurnRef.current = isUserTurn;
  }, [isUserTurn]);

  // Sync refs for use in event handlers
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const {
    saveTranscriptMutation,
    completeInterviewMutation,
    useInterviewByToken
  } = useInterviewPageApi();

  const { data: interviewData } = useInterviewByToken(sessionId || "");

  const logProctoring = useCallback((type: ProctoringLog['type'], severity: ProctoringLog['severity']) => {
    setProctorLogs(prev => [{ timestamp: new Date(), type, severity }, ...prev]);
    if (onProctoring) {
      onProctoring(type, severity);
    }
  }, [onProctoring]);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current?.speaking) {
      synthesisRef.current.cancel();
      setSystemStateWithRef('IDLE');
      setAiHighlightIndex(-1);
      setAiActiveText("");
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !interviewStarted || isPaused || !isUserTurnRef.current) return;
    if (systemStateRef.current === 'PROCESSING' || systemStateRef.current === 'SPEAKING') return;

    try {
      recognitionRef.current.start();
    } catch (e) {
      // console.warn("[STT] Already running or resetting...");
    }
  }, [interviewStarted, isPaused]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthesisRef.current) return;

    synthesisRef.current.cancel();
    setSystemStateWithRef('SPEAKING');
    setAiActiveText(text);
    setAiHighlightIndex(-1);

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v =>
      APP_CONFIG.SPEECH.defaultVoices.some(name => v.name.includes(name))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const spokenPart = text.substring(0, event.charIndex + event.charLength);
        const wordCount = spokenPart.trim().split(/\s+/).length - 1;
        setAiHighlightIndex(wordCount);
      }
    };

    utterance.onend = () => {
      setSystemStateWithRef('IDLE');
      setAiHighlightIndex(-1);
      setAiActiveText("");

      // AI finished speaking, it's now the user's turn
      setIsUserTurn(true);

      onEnd?.();
    };

    utterance.onerror = () => {
      setSystemStateWithRef('IDLE');
      setTimeout(() => {
        if (systemStateRef.current === 'IDLE') {
          startListening();
        }
      }, 500);
    };

    synthesisRef.current.speak(utterance);
    setChat(prev => [...prev, { id: Date.now().toString(), role: 'ai', text, timestamp: new Date() }]);
  }, [startListening, stopSpeaking]);

  const handleUserAnswer = useCallback(async (answer: string) => {
    if (!sessionId) return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setSystemStateWithRef('PROCESSING');
    setCandidateInterimText("");

    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: answer, timestamp: new Date() };
    setChat(prev => [...prev, userMsg]);

    const plan = interviewData?.job?.planAtCreation || user?.plan || SubscriptionPlan.FREE;
    const isInteractive = APP_CONFIG.PLANS[plan].interactive;
    const nextIdx = currentStepRef.current + 1;

    try {
      if (!isInteractive) {
        // FREE plan: Standard HTTP request (One-shot)
        await saveTranscriptMutation.mutateAsync({
          sessionId,
          questionText: questions[currentStepRef.current] || "Introduction",
          candidateAnswer: answer
        });

        if (nextIdx < questions.length) {
          setCurrentStep(nextIdx);
          speak(questions[nextIdx]);
        } else {
          speak("Interview complete. Evaluation in progress...", () => {
            completeInterviewMutation.mutate(sessionId);
            setInterviewStarted(false);
          });
        }
      } else {
        // PRO/ULTRA: Standard HTTP (Full response, No Streaming)
        const { reply } = await interviewsApi.respondToInterviewSync(sessionId, answer);
        speak(reply);

        if (nextIdx < questions.length) {
          setCurrentStep(nextIdx);
        } else if (chat.length > 20) {
          speak("This concludes our session.", async () => {
            await completeInterviewMutation.mutateAsync(sessionId);
            setInterviewStarted(false);
          });
        }
      }
    } catch (err) {
      console.error('Error handling answer:', err);
      setError("Network issue. Please continue.");
      setSystemStateWithRef('IDLE');
    }

    // End user's turn after submission
    setIsUserTurn(false);
  }, [sessionId, user?.plan, questions, saveTranscriptMutation, completeInterviewMutation, speak, chat.length, interviewData]);

  const acknowledgeWarning = useCallback(async () => {
    if (!sessionId) return;
    try {
      await interviewsApi.acknowledgeWarning(sessionId);
      setIsPaused(false);
      setError(null);
      if (isUserTurnRef.current) {
        startListening();
      }
    } catch (err) {
      console.error('Failed to acknowledge warning:', err);
    }
  }, [sessionId, startListening]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as unknown as Window & {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      setError("Browser STT not supported.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = APP_CONFIG.SPEECH.lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setSystemStateWithRef('LISTENING');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      let interim = '';
      let final = '';
      let hasFinal = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
          hasFinal = true;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setIsSTTProcessing(!hasFinal && interim.length > 0);

      if (final) {
        finalTranscriptRef.current += (finalTranscriptRef.current ? " " : "") + final.trim();
      }

      const fullVisibleText = (finalTranscriptRef.current + " " + interim).trim();
      setCandidateInterimText(fullVisibleText);

      // Auto-submit logic after silence
      if (isUserTurnRef.current && fullVisibleText.split(/\s+/).length >= (APP_CONFIG.SPEECH.minAutoSubmitLength || 5)) {
        silenceTimerRef.current = setTimeout(() => {
          if (isUserTurnRef.current && systemStateRef.current === 'LISTENING') {
            handleUserAnswer(finalTranscriptRef.current + " " + interim);
          }
        }, APP_CONFIG.SPEECH.silenceTimeout || 4000);
      }
    };

    recognition.onend = () => {
      // Robust restart: only if still user's turn and not processing/speaking
      if (isUserTurnRef.current && systemStateRef.current === 'LISTENING' && !isPaused) {
        try {
          recognition.start();
        } catch (e) {
          // If start fails, retry after a short delay
          setTimeout(() => {
            if (isUserTurnRef.current && systemStateRef.current === 'LISTENING') {
              try { recognition.start(); } catch (err) { }
            }
          }, 300);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[STT] Error:", event.error);
      if (event.error === 'no-speech') return;
      // Don't change system state here, let onend handle it
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []); // Remove handleUserAnswer dependency to avoid unnecessary resets

  const handleMalpractice = useCallback(async (reason: string, type: 'tab_switch' | 'eye_tracking' | 'face_detection') => {
    if (!interviewStarted || !sessionId || isPaused) return;

    const settings = interviewData?.job;
    if (type === 'tab_switch' && !settings?.tabTracking) return;
    if (type === 'eye_tracking' && !settings?.eyeTracking) return;
    if (type === 'face_detection' && !settings?.multiFaceDetection) return;

    setIsPaused(true);
    stopSpeaking();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      const result = await interviewsApi.logProctoring(sessionId, { type, severity: 'high' });
      setWarningCount(result.warningCount);

      if (result.status === 'FLAGGED') {
        setIsFlagged(true);
        setError(`Interview Terminated: Too many malpractice warnings.`);
        setInterviewStarted(false);
      } else if (result.status === 'WARNING') {
        setError(`Warning ${result.warningCount}/3: ${reason}. Please acknowledge to continue.`);
      } else {
        setError(`Proctoring Alert: ${reason}`);
      }

      logProctoring(type, 'high');
    } catch (err) {
      console.error('Failed to log proctoring:', err);
    }
  }, [interviewStarted, sessionId, isPaused, stopSpeaking, logProctoring, interviewData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleMalpractice('Tab switched or minimized', 'tab_switch');
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleMalpractice]);

  useEffect(() => {
    if (!interviewStarted || timeLeft === null) return;

    if (timeLeft <= 0) {
      setInterviewStarted(false);
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, timeLeft, speak, onTimeUp]);

  const startInterview = async () => {
    if (!sessionId) return;
    setInterviewStarted(true);
    setIsPaused(false);

    const plan = interviewData?.job?.planAtCreation || user?.plan || SubscriptionPlan.FREE;
    setTimeLeft(plan === SubscriptionPlan.FREE ? 25 * 60 : 45 * 60);

    try {
      const initialQs = await interviewsApi.getInitialQuestions(sessionId);
      setQuestions(initialQs);
      speak(initialQs[0]);
    } catch (err) {
      setError("Init failed.");
    }
  };

  // Trigger STT when turn starts
  useEffect(() => {
    if (isUserTurn) {
      finalTranscriptRef.current = "";
      setCandidateInterimText("");
      startListening();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isUserTurn, startListening]);

  return {
    interviewStarted,
    setInterviewStarted,
    questions,
    currentStep,
    chat,
    isAITalking: systemState === 'SPEAKING',
    isListening: systemState === 'LISTENING',
    proctorLogs,
    error,
    aiActiveText,
    aiHighlightIndex,
    candidateInterimText,
    setCandidateInterimText,
    timeLeft,
    isPaused,
    isAnalyzing: systemState === 'PROCESSING',
    isFlagged,
    isSTTProcessing,
    isUserTurn,
    warningCount,
    setIsUserTurn,
    startInterview,
    logProctoring,
    submitManualAnswer: (text: string) => handleUserAnswer(text),
    acknowledgeWarning,
    stopSpeaking,
    clearError: () => setError(null)
  };
};
