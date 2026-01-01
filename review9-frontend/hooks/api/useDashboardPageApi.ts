'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { JobPosting, SubscriptionPlan } from '@/types';
import { jobsApi } from '@/services/api';

export const useDashboardPageApi = () => {
  const { addJob, user } = useStore();
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
      screenRecording?: boolean;
    }) => {
      const response = await jobsApi.create(data);

      // Transform backend response to frontend JobPosting format
      const newJob: JobPosting = {
        id: response.id,
        title: response.title,
        role: response.roleCategory,
        description: response.description,
        companyName: user?.name || 'Company',
        companyId: response.companyId,
        date: response.interviewStartTime, // Use start time for display
        candidates: [],
        planAtCreation: response.planAtCreation as SubscriptionPlan,
        proctoringSettings: {
          tabTracking: data.tabTracking || true,
          eyeTracking: data.eyeTracking || false,
          multiFaceDetection: data.multiFaceDetection || false,
          screenRecording: data.screenRecording || false,
        },
      };

      addJob(newJob);
      return newJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const useJobsQuery = () => {
    const { jobs: storeJobs } = useStore();

    return useQuery({
      queryKey: ['jobs'],
      queryFn: async () => {
        try {
          const backendJobs = await jobsApi.getAll();

          // Transform backend response to frontend format
          return backendJobs.map((job) => ({
            id: job.id,
            title: job.title,
            role: job.roleCategory,
            description: job.description,
            companyName: user?.name || 'Company',
            companyId: user?.id || '',
            date: job.scheduledTime,
            candidates: job.candidates.map((c: any) => ({
              id: c.id,
              name: c.name,
              email: c.email,
              interviewTime: '',
              status: c.status,
            })),
            planAtCreation: job.planAtCreation as SubscriptionPlan,
            proctoringSettings: {
              tabTracking: true,
              eyeTracking: false,
              multiFaceDetection: false,
              screenRecording: false,
            },
          })) as JobPosting[];
        } catch (error) {
          console.error('Failed to fetch jobs from backend, using store:', error);
          return storeJobs;
        }
      },
      enabled: user?.role === 'COMPANY', // Only fetch for company users
      staleTime: 30000, // 30 seconds
    });
  };

  const useJobAnalytics = (jobId: string) => {
    return useQuery({
      queryKey: ['job-analytics', jobId],
      queryFn: () => jobsApi.getAnalytics(jobId),
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
      return jobsApi.inviteCandidates(jobId, { candidates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    createJobMutation,
    useJobsQuery,
    useJobAnalytics,
    inviteCandidatesMutation,
  };
};
