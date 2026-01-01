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
      screenRecording: true,
      companyId: 'demo-company',
      timezone: 'UTC',
      planAtCreation: SubscriptionPlan.FREE
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
    clearError
  } = useInterview(user, resumeText, handleAnswer, handleProctoring, () => finalizeSession('time_up'), sessionId || undefined);

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
  }, [interviewInfo]);

  // Periodic polling to check interview status (every 2 minutes)
  useEffect(() => {
    if (isDemo || !token) return;

    const checkStatus = async () => {
      try {
        const status = await interviewsApi.getInterviewStatus(token);
        // Update local state if needed based on status changes
        console.log('[Interview] Status check:', status);
      } catch (err) {
        console.error('[Interview] Status check failed:', err);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 2 minutes (120000ms)
    const interval = setInterval(checkStatus, 120000);
    return () => clearInterval(interval);
  }, [token, isDemo]);

  // Handle waiting logic with candidate-specific windows
  useEffect(() => {
    if (interviewInfo?.interviewStartTime || interviewInfo?.job?.interviewStartTime) {
      const startTime = new Date(interviewInfo.interviewStartTime || interviewInfo.job.interviewStartTime).getTime();
      const endTime = new Date(interviewInfo.interviewEndTime || interviewInfo.job.interviewEndTime).getTime();

      const update = () => {
        const now = Date.now();
        const diffToStart = startTime - now;
        const diffToEnd = endTime - now;

        // Check if interview has expired
        if (diffToEnd <= 0) {
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
  }, [interviewInfo]);

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
        // Mocking text extraction for now, usually needs a specialist API or model
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
    if (isDemo) {
      setSessionId('demo-session');
      startInterview();
      return;
    }

    const settings = interviewInfo?.job;
    if (settings?.fullScreenMode && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        toast.error("Full screen is required for this interview. Please enable it to continue.");
        return;
      }
    }

    try {
      const session = await startInterviewMutation.mutateAsync({
        interviewToken: token,
        resumeUrl,
        resumeText
      });
      setSessionId(session.id);
      startInterview();
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  // Full screen enforcement listener
  useEffect(() => {
    const settings = interviewInfo?.job;
    if (!settings?.fullScreenMode || !interviewStarted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isPaused && !isFinishing) {
        handleProctoring('abrupt_end', 'high', 'Exited full screen mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [interviewInfo, interviewStarted, isPaused, isFinishing, handleProctoring]);

  if (!user) {
    router.push('/login');
    return null;
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

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          <div className="md:w-1/2 bg-gray-900 p-8 flex flex-col items-center justify-center">
            <div className="w-full aspect-video bg-gray-800 rounded-3xl mb-6 border border-white/5 flex items-center justify-center">
              <svg className="w-20 h-20 text-white/10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.53 6.47a1 1 0 011.415 0 3.5 3.5 0 004.23 0 1 1 0 111.415 1.414 5.5 5.5 0 01-7.06 0 1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setIsMicOn(!isMicOn)} className={`w-12 h-12 rounded-full flex items-center justify-center ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
              <button onClick={() => setIsCamOn(!isCamOn)} className={`w-12 h-12 rounded-full flex items-center justify-center ${isCamOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
            </div>
          </div>
          <div className="md:w-1/2 p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-black text-gray-900 mb-2">HireAI Session</h1>
            <p className="text-gray-500 font-medium mb-8">Role: {interviewInfo?.job?.title || 'Assessment'}</p>
            <Button onClick={() => setIsJoined(true)} className="w-full py-4 text-lg rounded-2xl">Join Room</Button>
          </div>
        </div>
      </div>
    );
  }

  // Skip resume upload screen if user already has resume in profile
  // This section is now optional and will auto-skip if profile resume exists
  if (!isResumeSubmitted && !user?.resumeUrl) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8">
        <Card className="max-w-lg w-full p-12 text-center shadow-2xl border-none rounded-[3rem]">
          <h2 className="text-3xl font-black mb-2 text-gray-900">Resume Required</h2>
          <p className="text-sm text-gray-500 mb-10 font-medium">Please add a resume URL to your profile before starting an interview.</p>

          <Button
            onClick={() => router.push('/profile')}
            className="w-full py-4 text-lg rounded-2xl"
          >
            Go to Profile
          </Button>
        </Card>
      </div>
    );
  }

  if (isResumeSubmitted && !interviewStarted && chat.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8">
        <Card className="max-w-xl w-full p-12 shadow-2xl border-none rounded-[3rem]">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Profile Details</h2>
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100 italic text-sm text-gray-600">
            &quot;{resumeSnippet}&quot;
          </div>
          <LoadingButton
            onClick={handleStart}
            disabled={isWaiting || isExpired}
            loading={startInterviewMutation.isPending}
            className="w-full py-4 rounded-2xl shadow-xl shadow-blue-500/20 text-lg font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExpired ? 'Interview Window Expired' : isWaiting ? `Starts in ${formatWaitTime(timeToWait)}` : 'Begin AI Assessment'}
          </LoadingButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-meet flex flex-col text-white overflow-hidden font-inter relative">
      {(isPaused || isFlagged) && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center transition-all animate-in fade-in duration-500">
          <div className={cn(
            "w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse border-2",
            isFlagged ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-orange-500/20 text-orange-500 border-orange-500/30"
          )}>
            {isFlagged ? (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>

          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">
            {isFlagged ? "Interview Terminated" : "Security Warning"}
          </h2>

          <p className="text-gray-400 max-w-md font-medium mb-10 leading-relaxed text-lg">
            {isFlagged
              ? "Multiple integrity violations have been recorded. This session is now closed for manual review by the hiring team."
              : `Security interruption detected. This is warning ${warningCount}/3. Further violations will result in immediate termination.`
            }
          </p>

          {!isFlagged && (
            <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full">
                <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3">Integrity Instruction</p>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">Please ensure you are in full-screen mode, alone, and not switching tabs. Click below to acknowledge and resume.</p>
              </div>

              <Button
                onClick={acknowledgeWarning}
                className="w-full py-5 text-lg rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20 font-black uppercase tracking-widest"
              >
                I Acknowledge & Resume
              </Button>
            </div>
          )}

          {isFlagged && (
            <Button
              onClick={() => router.push('/dashboard')}
              className="px-12 py-4 rounded-2xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all font-bold uppercase tracking-widest"
            >
              Return to Dashboard
            </Button>
          )}

          <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-gray-500">
            {isFlagged ? "Audit Report Generated" : "Warning Logged"} &bull; SESSION ID: {sessionId || 'DEMO'}
          </p>
        </div>
      )}


      <div className="h-16 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 backdrop-blur-xl z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">H</div>
          <div className="flex flex-col">
            <span className="font-black text-[10px] uppercase tracking-widest leading-none">HireAI Live Assessment</span>
            <span className="text-[10px] font-bold text-blue-400 tracking-tighter mt-1 truncate max-w-[200px]">{interviewInfo?.job?.title} &bull; {interviewInfo?.job?.companyName}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isAnalyzing ? (
            <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Analyzing Response...</span>
            </div>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI Proctoring Active</span>
            </>
          )}
          {timeLeft !== null && (
            <>
              <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                timeLeft < 60 ? "bg-red-500 text-white" : "text-blue-400"
              )}>
                Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow flex p-6 space-x-6 overflow-hidden">
        <VideoFeed
          isCamOn={isCamOn}
          isMicOn={isMicOn && !isAITalking && !isAnalyzing}
          userName={user?.name || 'Candidate'}
          isAITalking={isAITalking}
          isListening={isListening}
        />
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
        totalSteps={questions.length}
      />
    </div>
  );
}
