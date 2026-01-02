'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { geminiService } from '@/services/geminiService';
import { interviewsApi, jobsApi } from '@/services/api';
import { SubscriptionPlan } from '@/types';

export const useInterviewPageApi = () => {
  // AI-based question generation (uses Gemini directly)
  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ role, resumeText, plan }: { role: string; resumeText: string; plan: SubscriptionPlan }) => {
      return await geminiService.generateInterviewQuestions(role, resumeText, plan);
    }
  });

  // AI-based dynamic response (uses Gemini directly)
  const getDynamicResponseMutation = useMutation({
    mutationFn: async ({ context, answer, plan }: { context: string; answer: string; plan: SubscriptionPlan }) => {
      return await geminiService.getDynamicResponse(context, answer, 0, plan);
    }
  });

  // AI-based evaluation (uses Gemini directly)
  const evaluateInterviewMutation = useMutation({
    mutationFn: async ({ resumeText, transcript, role }: { resumeText: string; transcript: { q: string, a: string }[]; role: string }) => {
      return await geminiService.evaluateInterview(resumeText, transcript, role);
    }
  });

  // Backend integration for interview session management
  const useInterviewByToken = (token: string) => {
    return useQuery({
      queryKey: ['interview-token', token],
      queryFn: () => interviewsApi.getByToken(token),
      enabled: !!token && token !== 'demo',
      refetchInterval: 120000, // Poll every 2 minutes
      staleTime: 60000, // Consider data fresh for 1 minute
    });
  };

  const useInterviewSession = (sessionId: string) => {
    return useQuery({
      queryKey: ['interview-session', sessionId],
      queryFn: () => interviewsApi.getSession(sessionId),
      enabled: !!sessionId,
    });
  };

  const startInterviewMutation = useMutation({
    mutationFn: async (data: { interviewToken: string; resumeUrl?: string | null; resumeText?: string }) => {
      return interviewsApi.startInterview(data.interviewToken, data);
    }
  });

  const updateCandidateResumeMutation = useMutation({
    mutationFn: async ({ candidateId, resumeText }: { candidateId: string; resumeText: string }) => {
      return jobsApi.updateCandidateResume(candidateId, resumeText);
    }
  });

  const saveTranscriptMutation = useMutation({
    mutationFn: async ({
      sessionId,
      questionText,
      candidateAnswer,
      aiAcknowledgment
    }: {
      sessionId: string;
      questionText: string;
      candidateAnswer: string;
      aiAcknowledgment?: string;
    }) => {
      return interviewsApi.saveTranscript(sessionId, {
        questionText,
        candidateAnswer,
        aiAcknowledgment,
      });
    }
  });

  const logProctoringMutation = useMutation({
    mutationFn: async ({
      sessionId,
      type,
      severity,
      reason
    }: {
      sessionId: string;
      type: string;
      severity: string;
      reason?: string;
    }) => {
      return interviewsApi.logProctoring(sessionId, { type, severity, reason });
    }
  });

  const completeInterviewMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return interviewsApi.completeInterview(sessionId);
    }
  });

  const useEvaluation = (sessionId: string) => {
    return useQuery({
      queryKey: ['interview-evaluation', sessionId],
      queryFn: () => interviewsApi.getEvaluation(sessionId),
      enabled: !!sessionId,
    });
  };

  return {
    // AI services (Gemini)
    generateQuestionsMutation,
    getDynamicResponseMutation,
    evaluateInterviewMutation,
    // Backend interview session management
    useInterviewByToken,
    useInterviewSession,
    startInterviewMutation,
    updateCandidateResumeMutation,
    saveTranscriptMutation,
    logProctoringMutation,
    completeInterviewMutation,
    useEvaluation,
  };
};
