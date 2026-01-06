'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button, Card, LoadingButton } from '@/components/UI';
import { InterviewSession, InterviewResponse, SubscriptionPlan, Candidate, JobPosting } from '@/types';
import { useInterview } from '@/hooks/useInterview';
import { VideoFeed } from '@/components/VideoFeed';
import { TranscriptSidebar } from '@/components/TranscriptSidebar';
import { InterviewControls } from '@/components/interview/InterviewControls';
import { useInterviewPageApi } from '@/hooks/api/useInterviewPageApi';
import { APP_CONFIG } from '@/config';
import { cn } from '@/lib/utils';
import { jobsApi, interviewsApi } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { useProctoring } from '@/hooks/proctoring/useProctoring';
import { useRef } from 'react';
import { CheckCircle2, Circle, Monitor, Camera, Mic, Layout, ShieldAlert } from 'lucide-react';

export default function InterviewPage() {
  const params = useParams();
  const token = params.id as string;
  const { user } = useStore();
  const router = useRouter();
  const toast = useToast();

  const {
    useInterviewByToken,
    startInterviewMutation,
    updateCandidateResumeMutation,
    saveTranscriptMutation,
    logProctoringMutation,
    completeInterviewMutation
  } = useInterviewPageApi();

  const { data: backendInfo, isLoading: backendLoading } = useInterviewByToken(token);
  const isDemo = token === 'demo';
  const infoLoading = !isDemo && backendLoading;

  const interviewInfo = isDemo ? {
    id: 'demo-id',
    candidateId: 'demo-id',
    jobId: 'demo-job',
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@example.com',
    status: 'INVITED',
    interviewLink: '/interview/demo',
    job: {
      id: 'demo-job',
      title: 'Senior Product Designer (Demo)',
      roleCategory: 'DESIGN',
      companyName: 'Innovation Labs',
      description: 'This is a demo session to experience the HireAI platform. You will be asked technical and behavioral questions based on your resume.',
      interviewStartTime: new Date().toISOString(),
      interviewEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      tabTracking: true,
      eyeTracking: true,
      multiFaceDetection: true,
      fullScreenMode: true,
      videoRequired: true,
      micRequired: true,
      noTextTyping: true,
      companyId: 'demo-company',
      timezone: 'UTC',
      planAtCreation: SubscriptionPlan.ULTRA
    }
  } as (Candidate & { job: JobPosting }) : (backendInfo as (Candidate & { job: JobPosting }));

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isResumeSubmitted, setIsResumeSubmitted] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeSnippet, setResumeSnippet] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [timeToWait, setTimeToWait] = useState<number>(0);

  // Security Verification State
  const [securityStatus, setSecurityStatus] = useState({
    fullscreen: false,
    camera: false,
    mic: false,
    screenShare: false,
  });

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [redirectReason, setRedirectReason] = useState<string>('');

  // Persistence callbacks
  const handleAnswer = useCallback((question: string, answer: string) => {
    if (isDemo) return;
    if (sessionId) {
      saveTranscriptMutation.mutate({
        sessionId,
        questionText: question,
        candidateAnswer: answer,
        aiAcknowledgment: "Acknowledged."
      });
    }
  }, [sessionId, saveTranscriptMutation, isDemo]);

  const handleProctoring = useCallback((type: string, severity: string, reason?: string) => {
    if (isDemo) return;
    if (sessionId) {
      logProctoringMutation.mutate({
        sessionId,
        type,
        severity,
        reason
      });
    }
  }, [sessionId, logProctoringMutation, isDemo]);

  const {
    interviewStarted,
    setInterviewStarted,
    questions,
    currentStep,
    chat,
    isAITalking,
    isListening,
    proctorLogs,
    error,
    aiActiveText,
    aiHighlightIndex,
    candidateInterimText,
    targetQuestionCount,
    setCandidateInterimText,
    timeLeft,
    isPaused,
    isAnalyzing,
    isSTTProcessing,
    isUserTurn,
    warningCount,
    isFlagged,
    setIsUserTurn,
    startInterview,
    logProctoring,
    submitManualAnswer,
    acknowledgeWarning,
    handleMalpractice,
    clearError
  } = useInterview(user, resumeText, handleAnswer, handleProctoring, () => finalizeSession('time_up'), sessionId || undefined, interviewInfo?.job);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Advanced Proctoring Hook Integration
  const { isReady: proctoringReady, metrics: proctoringMetrics } = useProctoring({
    videoRef,
    enabled: interviewStarted && !isPaused && !isFlagged,
    onEvent: (event) => {
      let reason = "";
      let type: 'tab_switch' | 'eye_tracking' | 'face_detection' = 'tab_switch';

      switch (event.type) {
        case 'multiple_faces':
          reason = "Multiple faces detected";
          type = 'face_detection';
          handleMalpractice(reason, type);
          break;
        case 'no_face':
          reason = "No face detected";
          type = 'face_detection';
          handleMalpractice(reason, type);
          break;
        case 'attention_deviation':
          // Eye tracking: Show toast warning only, don't flag
          toast.warning("⚠️ Please maintain focus on the screen", 3000);
          // Log for analytics but don't pause
          if (sessionId && !isDemo) {
            handleProctoring('eye_tracking', 'low', 'Attention deviation detected');
          }
          break;
      }
    }
  });

  // Handle system errors with toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, toast, clearError]);

  const finalizeSession = useCallback(async (reason: 'normal' | 'intrusion' | 'manual' | 'time_up') => {
    if (isFinishing || (!sessionId && !isDemo)) return;
    setIsFinishing(true);
    setInterviewStarted(false);
    setIsCamOn(false);
    setIsMicOn(false);

    if (reason === 'time_up') {
      toast.error("Interview time has expired. Submitting your responses...", 5000);
    }

    if (isDemo) {
      setTimeout(() => router.push('/dashboard'), 2000);
      return;
    }

    try {
      await completeInterviewMutation.mutateAsync(sessionId!);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      console.error('Failed to complete interview:', err);
      router.push('/dashboard');
    }
  }, [sessionId, isFinishing, router, setInterviewStarted, completeInterviewMutation, isDemo]);

  // Handle proctoring termination
  useEffect(() => {
    const highSeverity = proctorLogs.filter(l => l.severity === 'high');
    if (highSeverity.length >= APP_CONFIG.PROCTORING.highSeverityThreshold && interviewStarted && !isFinishing) {
      logProctoring('abrupt_end', 'high');
      toast.warning("Integrity flags detected. Closing session for review.", 5000);
      finalizeSession('intrusion');
    }
  }, [proctorLogs, interviewStarted, isFinishing, logProctoring, finalizeSession]);


  // Handle status update to INVITED when candidate opens the page
  useEffect(() => {
    const terminalStatuses = ['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED', 'SHORTLISTED', 'EXPIRED'];
    if (interviewInfo && (terminalStatuses.includes(interviewInfo.status) || isExpired)) {
      if (redirectCountdown === null && !isFinishing && !interviewStarted) {
        setRedirectReason(isExpired ? "Time Expired" : "Interview Ended");
        setRedirectCountdown(3);
      }
    }

    if (interviewInfo && interviewInfo.status === 'PENDING') {
      const updateStatus = async () => {
        try {
          await jobsApi.updateCandidateStatus(interviewInfo.id, 'INVITED');
        } catch (err) {
          console.error("Failed to update status to INVITED:", err);
        }
      };
      updateStatus();
    }
  }, [interviewInfo, isExpired, redirectCountdown, isFinishing, interviewStarted]);

  // Redirection timer components
  useEffect(() => {
    if (redirectCountdown !== null) {
      if (redirectCountdown <= 0) {
        router.push('/dashboard');
        return;
      }
      const timer = setTimeout(() => setRedirectCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectCountdown, router]);

  // Handle waiting logic with candidate-specific windows
  useEffect(() => {
    if (interviewInfo?.interviewStartTime || interviewInfo?.job?.interviewStartTime) {
      const startTime = new Date(interviewInfo.interviewStartTime || interviewInfo.job.interviewStartTime).getTime();
      let endTimeDate = new Date(interviewInfo.interviewEndTime || interviewInfo.job.interviewEndTime);

      // Rule: if requested for re-interview, extend by 2 hours
      if ((interviewInfo as any).isReInterviewed) {
        endTimeDate = new Date(endTimeDate.getTime() + 2 * 60 * 60 * 1000);
      }
      const endTime = endTimeDate.getTime();

      const update = () => {
        const now = Date.now();
        const diffToStart = startTime - now;
        const diffToEnd = endTime - now;

        // Don't mark as expired if:
        // 1. Interview has started (session exists) - matches backend logic
        // 2. Time is still left (diffToEnd > 0)
        const hasTimeLeft = diffToEnd > 0;
        const interviewStarted = sessionId !== null;

        // Only mark as expired if:
        // - No time left AND
        // - Interview hasn't started
        // This matches backend: don't expire if session is ongoing
        if (diffToEnd <= 0 && !interviewStarted) {
          setIsWaiting(false);
          setIsExpired(true);
          return;
        }

        // Check if interview hasn't started yet
        if (diffToStart > 0) {
          setTimeToWait(Math.floor(diffToStart / 1000));
          setIsWaiting(true);
          setIsExpired(false);
        } else {
          // Interview window is open
          setIsWaiting(false);
          setIsExpired(false);
        }
      };

      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [interviewInfo, sessionId]);

  const formatWaitTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (isDemo || interviewInfo?.candidateId)) {
      setIsExtracting(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const mockExtracted = `Profile: ${user?.name}. Senior Dev. Skills: React, TypeScript, Node.`;

        setResumeText(mockExtracted);
        setResumeUrl(base64String);
        setResumeSnippet(mockExtracted.substring(0, 100) + "...");

        if (isDemo) {
          setIsExtracting(false);
          setIsResumeSubmitted(true);
          return;
        }

        try {
          await updateCandidateResumeMutation.mutateAsync({
            candidateId: interviewInfo!.id,
            resumeText: mockExtracted
          });
          setIsExtracting(false);
          setIsResumeSubmitted(true);
        } catch (err) {
          console.error("Failed to save resume:", err);
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCamOn(true);
      setSecurityStatus(prev => ({ ...prev, camera: true }));
      // Be careful: if we stop the stream, VideoFeed might not show it later if it doesn't re-request
      // Usually VideoFeed will request its own stream, so this is just for verification
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      toast.error("Camera access denied.");
    }
  };

  const verifyMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicOn(true);
      setSecurityStatus(prev => ({ ...prev, mic: true }));
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      toast.error("Microphone access denied.");
    }
  };

  const verifyFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        // Create a promise that resolves when fullscreen is actually active
        const fullscreenPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Fullscreen timeout"));
          }, 3000); // 3 second timeout

          const cleanup = () => {
            clearTimeout(timeout);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
            document.removeEventListener('mozfullscreenchange', onFullscreenChange);
            document.removeEventListener('MSFullscreenChange', onFullscreenChange);
            document.removeEventListener('fullscreenerror', onFullscreenError);
          };

          const onFullscreenChange = () => {
            const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
            if (isFs) {
              cleanup();
              resolve();
            }
          };

          const onFullscreenError = () => {
            cleanup();
            reject(new Error("Fullscreen request denied"));
          };

          document.addEventListener('fullscreenchange', onFullscreenChange);
          document.addEventListener('webkitfullscreenchange', onFullscreenChange);
          document.addEventListener('mozfullscreenchange', onFullscreenChange);
          document.addEventListener('MSFullscreenChange', onFullscreenChange);
          document.addEventListener('fullscreenerror', onFullscreenError);
        });

        // Request fullscreen
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }

        // Wait for the actual fullscreen change event
        await fullscreenPromise;
      }

      setSecurityStatus(prev => ({ ...prev, fullscreen: true }));
      toast.success("Secure Full Screen Enabled");
    } catch (err) {
      console.error("Fullscreen failed:", err);
      toast.error("Fullscreen request failed. Please enable it to continue.");
      throw err; // Re-throw to be caught by handleStart
    }
  };

  const verifyScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        // Hint to prefer current tab or entire screen if needed
      });
      setSecurityStatus(prev => ({ ...prev, screenShare: true }));
      // Keep track of the stream to ensure it's still active
      stream.getTracks().forEach(t => {
        t.onended = () => {
          setSecurityStatus(prev => ({ ...prev, screenShare: false }));
          if (interviewStarted) {
            handleMalpractice("Screen sharing was stopped.", "tab_switch");
          }
        };
      });
      toast.success("Screen Sharing Verified");
    } catch (err) {
      console.error("Screen share failed:", err);
      toast.error("Screen sharing permission is required.");
    }
  };

  // Sync security status with actual browser state
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
      setSecurityStatus(prev => ({ ...prev, fullscreen: isFs }));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  // Automatically use profile resume on mount if available
  useEffect(() => {
    if (user?.resumeUrl && !isResumeSubmitted) {
      setResumeUrl(user.resumeUrl);
      const mockExtracted = `Profile: ${user?.name}. Senior Dev. (Loaded from Profile)`;
      setResumeText(mockExtracted);
      setResumeSnippet("Using resume from your profile...");
      setIsResumeSubmitted(true);
    }
  }, [user, isResumeSubmitted]);

  const handleStart = async () => {
    const settings = interviewInfo?.job;

    // 1. Strict Full-Screen Gate (Enforced for both Demo and Real)
    if (settings?.fullScreenMode && !document.fullscreenElement) {
      try {
        console.log("[Interview] Full-screen required. Requesting...");
        await verifyFullscreen();
        // verifyFullscreen now waits for the actual fullscreen state, no need to check again
      } catch (err) {
        toast.error("Full screen mode is strictly required to begin.");
        return;
      }
    }


    if (isDemo) {
      const demoSessionId = 'demo-session';
      setSessionId(demoSessionId);
      startInterview(demoSessionId);
      return;
    }

    // 3. Start Real Session only after security gated
    try {
      console.log("[Interview] Security checks passed. Initializing session...");
      const session = await startInterviewMutation.mutateAsync({
        interviewToken: token,
        resumeUrl,
        resumeText
      });
      setSessionId(session.id);
      // Pass session.id directly instead of relying on state update
      startInterview(session.id);
    } catch (err) {
      console.error("Failed to start session:", err);
      toast.error("An error occurred while starting the session.");
    }
  };


  if (!user && !isDemo) return null;

  if (redirectCountdown !== null) {
    return (
      <div className="min-h-screen bg-[#202124] flex flex-col items-center justify-center p-8 text-white">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-[2rem] flex items-center justify-center mb-8 border border-red-500/30 animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Interview Ended</h2>
        <p className="text-gray-400 font-medium text-center max-w-sm mb-8">
          {redirectReason === "Time Expired"
            ? "The assessment window has expired."
            : "You have already completed this session."}
        </p>
        <div className="flex items-center space-x-3 text-sm font-black uppercase tracking-widest text-blue-400">
          <span>Redirecting to Dashboard</span>
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (interviewInfo?.status === 'COMPLETED' || interviewInfo?.status === 'REVIEW') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Interview Completed</h2>
          <p className="text-gray-500 font-medium mb-8 text-sm">You have already completed this assessment. The results are being processed.</p>
          <Button onClick={() => router.push('/dashboard')} className="w-full py-4 rounded-xl font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (infoLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">Connecting to Secure Server...</p>
      </div>
    );
  }

  if (isFinishing) {
    return (
      <div className="min-h-screen bg-[#202124] flex flex-col items-center justify-center p-8 text-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-black mb-2 uppercase tracking-widest">
          {isFinishing && !interviewStarted && timeLeft === 0 ? "Time's Up! Submitting" : "Generating Audit Report"}
        </h2>
        <p className="text-gray-400 font-medium text-center max-w-sm">Comparing responses with role categories and performance benchmarks...</p>
      </div>
    );
  }

  // 1. Privacy Consent
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-black/80 backdrop-blur-md flex items-center justify-center p-6 bg-meet">
        <div className="max-w-md w-full bg-[#161618] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Privacy & Proctoring</h2>
          <div className="space-y-4 text-gray-400 text-sm leading-relaxed mb-8">
            <p>To ensure interview integrity, this session uses **real-time local proctoring**.</p>
            <p>Our system analyzes your camera feed directly in your browser to detect attention signals and multiple faces.</p>
            <p className="p-3 bg-blue-600/10 rounded-xl border border-blue-500/20 text-blue-400 font-bold italic">
              ⚠️ No video, images, or biometric data ever leave your device or are stored on our servers.
            </p>
          </div>
          <Button onClick={() => setIsJoined(true)} className="w-full py-4 rounded-2xl text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
            I Understand & Consent
          </Button>
        </div>
      </div>
    );
  }

  // 2. Waiting Room
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Ready for your Interview?</h2>
          <p className="text-gray-500 font-medium mb-8">The AI interviewer will be ready in <span className="text-blue-600 font-bold">{formatWaitTime(timeToWait)}</span></p>
          <div className="bg-gray-50 rounded-2xl p-8 text-left border border-gray-100 mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Job Details</h3>
            <p className="text-xl font-bold text-gray-900 mb-1">{interviewInfo?.job?.title}</p>
            <p className="text-sm font-black text-blue-600 mb-4 uppercase tracking-tighter">{interviewInfo?.job?.companyName}</p>
            <div className="h-[1px] bg-gray-200 mb-4"></div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-4">{interviewInfo?.job?.description}</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Please stay on this page. The session will start automatically.</p>
        </div>
      </div>
    );
  }

  // 3. Resume Check
  if (!isResumeSubmitted && !user?.resumeUrl) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8">
        <Card className="max-w-lg w-full p-12 text-center shadow-2xl border-none rounded-[3rem]">
          <h2 className="text-3xl font-black mb-2 text-gray-900">Resume Required</h2>
          <p className="text-sm text-gray-500 mb-10 font-medium">Please add a resume to your profile before starting.</p>
          <Button onClick={() => router.push('/profile')} className="w-full py-4 text-lg rounded-2xl">Go to Profile</Button>
        </Card>
      </div>
    );
  }

  // 3b. Expired state
  // Don't show expired if interview has started or if there's still time left
  // This matches backend logic: don't expire if session is ongoing
  const actuallyExpired = isExpired && !interviewStarted && !sessionId;

  if (actuallyExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Window Closed</h2>
          <p className="text-gray-500 font-medium mb-8 text-sm">This interview session has expired or the window has closed. Please contact your recruiter.</p>
          <Button onClick={() => router.push('/dashboard')} className="w-full py-4 rounded-xl font-bold uppercase tracking-widest bg-gray-900 hover:bg-black text-white">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // 4. Security Onboarding (Interactive Check)
  if (isResumeSubmitted && !interviewStarted && chat.length === 0) {
    const settings = interviewInfo?.job;
    const isFsRequired = settings?.fullScreenMode;
    const allVerified = (!isFsRequired || securityStatus.fullscreen) && securityStatus.camera && securityStatus.mic;

    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8">
        <Card className="max-w-2xl w-full p-12 shadow-2xl border-none rounded-[3rem]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Setup Required</h2>
              <p className="text-sm font-medium text-gray-500">Security verification is mandatory for this assessment.</p>
            </div>
            <div className={`p-4 rounded-3xl ${allVerified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-4 mb-10">
            {isFsRequired && (
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${securityStatus.fullscreen ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}><Layout className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-black text-gray-900 leading-none mb-1 uppercase tracking-tight">Full Screen Mode</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No tabs or address bar visible</p>
                  </div>
                </div>
                {!securityStatus.fullscreen ? (
                  <Button variant="secondary" onClick={verifyFullscreen} className="text-[10px] px-4 py-2 font-black uppercase tracking-widest rounded-xl">Enable</Button>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600 font-black text-[10px] uppercase">
                    <span>Active</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${securityStatus.camera ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}><Camera className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-black text-gray-900 leading-none mb-1 uppercase tracking-tight">Camera Access</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Face & eye tracking</p>
                </div>
              </div>
              {!securityStatus.camera ? <Button variant="secondary" onClick={verifyCamera} className="text-[10px] px-4 py-2 font-black uppercase tracking-widest rounded-xl">Verify</Button> : <CheckCircle2 className="w-6 h-6 text-green-500" />}
            </div>

            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${securityStatus.mic ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}><Mic className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-black text-gray-900 leading-none mb-1 uppercase tracking-tight">Microphone</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Audio input check</p>
                </div>
              </div>
              {!securityStatus.mic ? <Button variant="secondary" onClick={verifyMic} className="text-[10px] px-4 py-2 font-black uppercase tracking-widest rounded-xl">Verify</Button> : <CheckCircle2 className="w-6 h-6 text-green-500" />}
            </div>


          </div>

          <LoadingButton
            onClick={handleStart}
            disabled={!allVerified || isWaiting || isExpired}
            loading={startInterviewMutation.isPending}
            className="w-full py-5 rounded-2xl shadow-xl shadow-blue-500/20 text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
          >
            Launch Secure Session
          </LoadingButton>
          <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic text-center">
              * Note: Browser F11 mode is not sufficient. Please use the "Enable" buttons above to grant specific system-level permissions.
            </p>
          </div>
        </Card>
      </div>
    );
  }


  // 5. Main Interview Room
  return (
    <div className="h-screen bg-meet flex flex-col text-white overflow-hidden font-inter relative">
      {(isPaused || isFlagged) && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center transition-all animate-in fade-in duration-500">
          <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse border-2 shadow-2xl", isFlagged ? "bg-red-500/20 text-red-500 border-red-500/30 shadow-red-500/20" : "bg-blue-500/20 text-blue-500 border-blue-500/30 shadow-blue-500/20")}>
            {isFlagged ? (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter text-white">{isFlagged ? "Session Paused & Flagged" : "Security Alert"}</h2>
          <p className="text-gray-300 max-w-2xl font-semibold mb-12 leading-relaxed text-xl">
            {isFlagged ? (
              "This session has been flagged for manual review due to persistent violations."
            ) : (
              error || `Security interruption (Warning ${warningCount}/3). Please restore secure environment.`
            )}
          </p>
          {!isFlagged && (
            <Button onClick={async () => {
              if (interviewInfo?.job?.fullScreenMode && !document.fullscreenElement) {
                try { await document.documentElement.requestFullscreen(); } catch (err) { toast.error("Full screen required."); return; }
              }
              acknowledgeWarning();
            }} className="px-12 py-6 text-xl rounded-[2rem] bg-blue-600 font-black uppercase tracking-widest">Resume Interview</Button>
          )}
          {isFlagged && <Button onClick={() => router.push('/dashboard')} className="px-12 py-4 rounded-2xl border border-white/10 text-gray-400 font-bold uppercase tracking-widest">Dashboard</Button>}
        </div>
      )}

      <div className="h-16 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 backdrop-blur-xl z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">AI</div>
          <div className="flex flex-col">
            <span className="font-black text-[10px] uppercase tracking-widest leading-none">HireAI Live</span>
            <span className="text-[10px] font-bold text-blue-400 mt-1 truncate max-w-[200px]">{interviewInfo?.job?.title}</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {timeLeft !== null && (
            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded", timeLeft < 60 ? "bg-red-500 text-white" : "text-blue-400")}>
              Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      <div className="flex-grow flex p-6 space-x-6 overflow-hidden">
        <VideoFeed ref={videoRef} isCamOn={isCamOn} isMicOn={isMicOn && !isAITalking && !isAnalyzing} userName={user?.name || 'Candidate'} isAITalking={isAITalking} isListening={isListening} proctoringMetrics={proctoringMetrics} />
        <div className="w-[450px] flex flex-col h-full">
          <TranscriptSidebar
            chat={chat}
            plan={interviewInfo?.job?.planAtCreation || user?.plan || 'FREE'}
            interimText={candidateInterimText}
            onTextChange={setCandidateInterimText}
            onSubmit={submitManualAnswer}
            isAnalyzing={isAnalyzing}
            isSTTProcessing={isSTTProcessing}
            isMicActive={isUserTurn}
            isAITalking={isAITalking}
            aiActiveText={aiActiveText}
            aiHighlightIndex={aiHighlightIndex}
            noTextTyping={interviewInfo?.job?.noTextTyping}
          />
        </div>
      </div>

      <InterviewControls
        isMicOn={isMicOn && !isAITalking && !isAnalyzing}
        isCamOn={isCamOn}
        setIsMicOn={setIsMicOn}
        setIsCamOn={setIsCamOn}
        onEndCall={() => finalizeSession('manual')}
        interviewStarted={interviewStarted}
        onStart={handleStart}
        currentStep={currentStep}
        totalSteps={targetQuestionCount}
      />
    </div>
  );
}
