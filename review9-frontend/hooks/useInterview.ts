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
  sessionId?: string,
  jobSettings?: JobPosting,
  isMicEnabled: boolean = true
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
  const isProcessingMalpracticeRef = useRef(false);
  const isPausedRef = useRef(false);
  const lastProcessedTimeRef = useRef<number>(0);

  const setSystemStateWithRef = (newState: ConversationState) => {
    setSystemState(newState);
    systemStateRef.current = newState;
  };

  const setIsPausedWithRef = (paused: boolean) => {
    setIsPaused(paused);
    isPausedRef.current = paused;
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

  // Settings are now passed from the parent to avoid 404s and async races
  const settings = jobSettings;

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

  const primeSTT = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      // Start and immediately stop to "prime" the browser's speech context
      recognitionRef.current.start();
      setTimeout(() => {
        if (systemStateRef.current === 'LISTENING') {
          recognitionRef.current?.stop();
        }
      }, 100);
    } catch (err) {
      console.log("[STT] Priming skipped or already active");
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !interviewStarted || isPaused || !isUserTurnRef.current || !isMicEnabled) return;
    if (systemStateRef.current === 'PROCESSING' || systemStateRef.current === 'SPEAKING') return;

    // Small timeout for Chrome to ensure previous session is fully aborted/ended
    setTimeout(() => {
      try {
        console.log("[STT] Attempting to start recognition...");
        recognitionRef.current?.start();
      } catch (e) {
        // If already running, we're good. If not, retry once
        console.log("[STT] Start failed (likely already running or transitioning)");
      }
    }, 200);
  }, [interviewStarted, isPaused, isMicEnabled]);

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
    if (!sessionId || !answer.trim()) return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // Stop listening immediately
    setIsUserTurn(false);
    setSystemStateWithRef('PROCESSING');

    // Clear transcript references to avoid stale data in next turn
    finalTranscriptRef.current = "";
    setCandidateInterimText("");

    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: answer, timestamp: new Date() };
    setChat(prev => [...prev, userMsg]);

    const plan = settings?.planAtCreation || user?.plan || SubscriptionPlan.FREE;
    const isInteractive = APP_CONFIG.PLANS[plan as keyof typeof APP_CONFIG.PLANS].interactive;
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

        // Dynamic Question Injection: Append AI reply as the next question
        setQuestions(prev => {
          const newQs = [...prev];
          newQs[nextIdx] = reply;
          return newQs;
        });

        speak(reply);

        const planConfig = APP_CONFIG.PLANS[plan as keyof typeof APP_CONFIG.PLANS];
        const targetCount = planConfig.fixedQuestionCount || 8;

        if (nextIdx < targetCount) {
          setCurrentStep(nextIdx);
        } else {
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
  }, [sessionId, user?.plan, questions, saveTranscriptMutation, completeInterviewMutation, speak, settings]);

  const acknowledgeWarning = useCallback(async () => {
    if (!sessionId) return;
    try {
      console.log("[Interview] Acknowledging warning for session:", sessionId);
      await interviewsApi.acknowledgeWarning(sessionId);
      setIsPausedWithRef(false);
      isProcessingMalpracticeRef.current = false;
      setError(null);
      if (isUserTurnRef.current) {
        startListening();
      }
    } catch (err) {
      console.error('[Interview] Failed to acknowledge warning:', err);
    }
  }, [sessionId, startListening]);

  const handleUserAnswerRef = useRef(handleUserAnswer);
  useEffect(() => {
    handleUserAnswerRef.current = handleUserAnswer;
  }, [handleUserAnswer]);

  const setCandidateInterimTextRef = useRef(setCandidateInterimText);
  useEffect(() => {
    setCandidateInterimTextRef.current = setCandidateInterimText;
  }, [setCandidateInterimText]);

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
    recognition.lang = APP_CONFIG.SPEECH.lang || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[STT] Session started");
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
        console.log("[STT] Final transcript updated:", finalTranscriptRef.current);
      }

      const fullVisibleText = (finalTranscriptRef.current + " " + interim).trim();

      if (!isPausedRef.current) {
        setCandidateInterimTextRef.current(fullVisibleText);

        // Auto-submit logic after silence (Debounced)
        if (isUserTurnRef.current && fullVisibleText.split(/\s+/).length >= (APP_CONFIG.SPEECH.minAutoSubmitLength || 5)) {
          silenceTimerRef.current = setTimeout(() => {
            if (isUserTurnRef.current && systemStateRef.current === 'LISTENING') {
              console.log("[STT] Auto-submitting due to silence");
              handleUserAnswerRef.current(fullVisibleText);
            }
          }, APP_CONFIG.SPEECH.silenceTimeout || 4000);
        }
      }
    };

    recognition.onend = () => {
      console.log("[STT] Session ended. Turn:", isUserTurnRef.current, "State:", systemStateRef.current);

      const shouldBeListening = isUserTurnRef.current &&
        !isPausedRef.current &&
        systemStateRef.current !== 'PROCESSING' &&
        systemStateRef.current !== 'SPEAKING';

      if (shouldBeListening) {
        // Only restart if we're supposed to be listening
        try {
          recognition.start();
        } catch (e) {
          // If start fails (already running or audio error), retry after a short delay
          setTimeout(() => {
            if (isUserTurnRef.current && !isPausedRef.current && systemStateRef.current !== 'LISTENING') {
              try { recognition.start(); } catch (err) { }
            }
          }, 500);
        }
      } else if (systemStateRef.current === 'LISTENING') {
        setSystemStateWithRef('IDLE');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[STT] Error encountered:", event.error);

      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError("Microphone permission denied for Speech API. Please check your browser settings.");
          break;
        case 'network':
          setError("Network issue with Speech Recognition. Retrying...");
          break;
        case 'no-speech':
          // Standard timeout, onend will handle restart
          break;
        case 'aborted':
          console.log("[STT] Recognition aborted.");
          break;
        default:
          // For other errors, we might want to notify or just let it restart
          break;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        try {
          recognitionRef.current.abort();
        } catch (e) { }
      }
    };
  }, []);

  const handleMalpractice = useCallback(async (reason: string, type: 'tab_switch' | 'eye_tracking' | 'face_detection') => {
    // Cooldown logic to prevent duplicate rapid-fire alerts (e.g. blur + visibilitychange + fullscreenexit)
    const now = Date.now();
    if (isProcessingMalpracticeRef.current || (lastProcessedTimeRef.current && now - lastProcessedTimeRef.current < 2000)) {
      console.log("[Interview] Malpractice handling suppressed (cooldown or active).");
      return;
    }

    if (!interviewStarted || !sessionId || isFlagged || isPausedRef.current) return;

    isProcessingMalpracticeRef.current = true;
    lastProcessedTimeRef.current = now;
    setIsPausedWithRef(true);

    console.log(`[Interview] Malpractice detected: ${type} - ${reason}`);

    const isDemoSession = sessionId === 'demo-session';
    const activeSettings = isDemoSession ? {
      tabTracking: true,
      eyeTracking: true,
      multiFaceDetection: true,
      fullScreenMode: true
    } : settings;

    // Strict Full-Screen Check: Always override reason if FS is required but missing
    const isFsActive = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
    if (activeSettings?.fullScreenMode && !isFsActive) {
      reason = "Secure full-screen mode was exited. Please re-enable it to continue.";
      type = 'face_detection';
    }

    // Settings-based filtering
    if (type === 'tab_switch' && !activeSettings?.tabTracking) {
      isProcessingMalpracticeRef.current = false;
      setIsPausedWithRef(false);
      return;
    }
    if (type === 'eye_tracking' && !activeSettings?.eyeTracking) {
      isProcessingMalpracticeRef.current = false;
      setIsPausedWithRef(false);
      return;
    }
    if (type === 'face_detection' && !activeSettings?.multiFaceDetection && !activeSettings?.fullScreenMode) {
      isProcessingMalpracticeRef.current = false;
      setIsPausedWithRef(false);
      return;
    }

    stopSpeaking();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
    }

    try {
      let result;
      if (!isDemoSession) {
        result = await interviewsApi.logProctoring(sessionId, { type, severity: 'high' });
      } else {
        const nextCount = warningCount + 1;
        result = { warningCount: nextCount, status: nextCount > 3 ? 'FLAGGED' : 'WARNING' };
      }

      const newWarningCount = result.warningCount;
      const status = result.status as 'WARNING' | 'FLAGGED';

      setWarningCount(newWarningCount);

      if (status === 'FLAGGED' || newWarningCount > 3) {
        setIsFlagged(true);
        setError(`Interview Flagged: Persistent security violations (${newWarningCount}/3). This session is now locked for review.`);
      } else {
        setError(`Security Warning ${newWarningCount}/3: ${reason}`);
      }

      logProctoring(type, 'high');
    } catch (err) {
      console.error('Failed to log proctoring:', err);
      // Fallback local enforcement
      const nextCount = warningCount + 1;
      setWarningCount(nextCount);
      if (nextCount > 3) setIsFlagged(true);
      setError(`Security Warning ${nextCount}/3: ${reason}`);
    } finally {
      // Small delay before allowing next malpractice to ensure UI reflects state
      setTimeout(() => {
        isProcessingMalpracticeRef.current = false;
      }, 500);
    }
  }, [interviewStarted, sessionId, isFlagged, stopSpeaking, logProctoring, settings, warningCount]);

  // Integrated Proctoring Listeners
  useEffect(() => {
    if (!interviewStarted || isFlagged) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isPausedRef.current) {
        handleMalpractice('Tab switched or browser minimized.', 'tab_switch');
      }
    };

    const handleBlur = () => {
      // Small timeout to skip focus loss to native browser dialogs (like mic permission)
      setTimeout(() => {
        if (!isPausedRef.current && document.visibilityState === 'visible') {
          // Only trigger if window is still visible but lost focus (e.g. alt-tab or another app)
          handleMalpractice('Security alert: Focus lost. Please stay within the interview window.', 'tab_switch');
        }
      }, 100);
    };

    const handleFullscreenChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
      if (settings?.fullScreenMode && !isFs && !isPausedRef.current) {
        handleMalpractice('Secure environment exited. Standard window mode is not allowed.', 'face_detection');
      }
    };

    const blockCheat = (e: KeyboardEvent) => {
      // Cross-platform check
      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const isOptionOrShift = isMac ? e.altKey : e.shiftKey;

      if (
        e.key === 'F12' ||
        // Inspect / Console / Element Selector (I, J, C)
        (isCmdOrCtrl && isOptionOrShift && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) ||
        // Firefox Console (K)
        (isCmdOrCtrl && isOptionOrShift && ['k', 'K'].includes(e.key)) ||
        // View Source (U)
        (isCmdOrCtrl && ['u', 'U'].includes(e.key)) ||
        // Save (S)
        (isCmdOrCtrl && ['s', 'S'].includes(e.key)) ||
        // Print (P)
        (isCmdOrCtrl && ['p', 'P'].includes(e.key))
      ) {
        e.preventDefault();
        setError("Security alert: Access to developer tools and system shortcuts is restricted.");
      }
    };

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();

    // Anti-Debug: DevTools detection
    // Detects if DevTools is open by checking console timing
    const antiDebug = setInterval(() => {
      if (interviewStarted && !isPausedRef.current) {
        const start = performance.now();
        // This debugger statement will pause execution if DevTools is open
        debugger;
        const end = performance.now();

        // If DevTools is open, the time difference will be significant
        if (end - start > 100) {
          handleMalpractice('Developer tools detected. Please close them to continue.', 'tab_switch');
        }
      }
    }, 1000);

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', blockCheat);
    window.addEventListener('contextmenu', preventContextMenu);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', blockCheat);
      window.removeEventListener('contextmenu', preventContextMenu);
      clearInterval(antiDebug);
    };
  }, [interviewStarted, isFlagged, handleMalpractice, settings?.fullScreenMode]);

  useEffect(() => {
    if (!interviewStarted || timeLeft === null || isPaused) return;

    if (timeLeft <= 0) {
      setInterviewStarted(false);
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, timeLeft, isPaused, onTimeUp]);

  const startInterview = async (providedSessionId?: string) => {
    const activeSessionId = providedSessionId || sessionId;
    if (!activeSessionId) return;

    // Final check for fullscreen if required
    if (settings?.fullScreenMode) {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
      if (!isFs) {
        setError("Secure Full Screen must be enabled before launching the session.");
        return;
      }
    }

    setInterviewStarted(true);
    setIsPaused(false);
    primeSTT();

    const plan = settings?.planAtCreation || user?.plan || SubscriptionPlan.FREE;
    setTimeLeft(plan === SubscriptionPlan.FREE ? 25 * 60 : 45 * 60);

    try {
      const initialQs = await interviewsApi.getInitialQuestions(activeSessionId);
      setQuestions(initialQs);
      speak(initialQs[0]);
    } catch (err) {
      setError("Initialization failed. Please refresh.");
    }
  };

  // Trigger STT when turn starts or mic is toggled
  useEffect(() => {
    if (isUserTurn && !isPaused && isMicEnabled) {
      // Small delay to ensure any previous abort has resolved
      const timer = setTimeout(() => {
        finalTranscriptRef.current = "";
        setCandidateInterimText("");
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      if (recognitionRef.current) {
        console.log("[STT] Stopping/Aborting (Turn:", isUserTurn, "Paused:", isPaused, "MicEnabled:", isMicEnabled, ")");
        try {
          // Abort is better than stop for immediate turn switching
          recognitionRef.current.abort();
        } catch (e) { }
      }
    }
  }, [isUserTurn, isPaused, isMicEnabled, startListening]);

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
    targetQuestionCount: APP_CONFIG.PLANS[(settings?.planAtCreation || user?.plan || SubscriptionPlan.FREE) as keyof typeof APP_CONFIG.PLANS].fixedQuestionCount || 8,
    setIsUserTurn,
    startInterview,
    logProctoring,
    submitManualAnswer: (text: string) => handleUserAnswer(text),
    acknowledgeWarning,
    stopSpeaking,
    clearError: () => setError(null),
    handleMalpractice
  };
};
