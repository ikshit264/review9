'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { JobPosting, SubscriptionPlan } from '@/types';
import { jobsApi } from '@/services/api';

export const useDashboardPageApi = (companyId?: string) => {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const createJobMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      roleCategory: string;
      description: string;
      notes?: string;
      interviewStartTime: string;
      interviewEndTime: string;
      timezone: string;
      tabTracking?: boolean;
      eyeTracking?: boolean;
      multiFaceDetection?: boolean;
      fullScreenMode?: boolean;
      noTextTyping?: boolean;
    }) => {
      const response = await jobsApi.create(data, companyId);

      // Transform backend response to frontend JobPosting format
      const newJob: JobPosting = {
        id: response.id,
        title: response.title,
        roleCategory: response.roleCategory,
        description: response.description,
        companyName: user?.name || 'Company',
        companyId: response.companyId,
        interviewStartTime: response.interviewStartTime,
        interviewEndTime: response.interviewEndTime,
        timezone: response.timezone,
        candidates: [],
        planAtCreation: response.planAtCreation as SubscriptionPlan,
        tabTracking: data.tabTracking ?? true,
        eyeTracking: data.eyeTracking ?? false,
        multiFaceDetection: data.multiFaceDetection ?? false,
        fullScreenMode: data.fullScreenMode ?? false,
        noTextTyping: data.noTextTyping ?? false,
        videoRequired: false,
        micRequired: false,
      };

      return newJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', companyId] });
    },
  });

  const useJobsQuery = () => {
    return useQuery({
      queryKey: ['jobs', companyId],
      queryFn: async () => {
        try {
          const backendJobs = await jobsApi.getAll(companyId);

          // Transform backend response to frontend format
          return backendJobs.map((job) => ({
            id: job.id,
            title: job.title,
            roleCategory: job.roleCategory,
            description: job.description,
            companyName: user?.name || 'Company',
            companyId: companyId || user?.id || '',
            interviewStartTime: job.interviewStartTime || job.scheduledTime,
            interviewEndTime: job.interviewEndTime,
            timezone: job.timezone || 'UTC',
            candidates: [],
            candidateCount: job.candidateCount || job.candidates?.length || 0,
            sessionCount: job.sessionCount || 0,
            planAtCreation: job.planAtCreation as SubscriptionPlan,
            tabTracking: job.tabTracking ?? true,
            eyeTracking: job.eyeTracking ?? false,
            multiFaceDetection: job.multiFaceDetection ?? false,
            fullScreenMode: job.fullScreenMode ?? false,
            noTextTyping: job.noTextTyping ?? false,
            videoRequired: job.videoRequired ?? false,
            micRequired: job.micRequired ?? false,
          })) as JobPosting[];
        } catch (error) {
          console.error('Failed to fetch jobs from backend:', error);
          return [];
        }
      },
      enabled: user?.role === 'COMPANY' || user?.role === 'ADMIN',
      staleTime: 30000, // 30 seconds
    });
  };

  const useJobAnalytics = (jobId: string) => {
    return useQuery({
      queryKey: ['job-analytics', jobId, companyId],
      queryFn: () => jobsApi.getAnalytics(jobId, companyId),
      enabled: !!jobId,
    });
  };

  const inviteCandidatesMutation = useMutation({
    mutationFn: async ({
      jobId,
      candidates,
    }: {
      jobId: string;
      candidates: Array<{ name: string; email: string }>;
    }) => {
      return jobsApi.inviteCandidates(jobId, { candidates }, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', companyId] });
    },
  });

  return {
    createJobMutation,
    useJobsQuery,
    useJobAnalytics,
    inviteCandidatesMutation,
  };
};
