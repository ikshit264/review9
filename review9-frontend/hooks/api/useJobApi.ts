'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/services/api';
import { JobPosting, SubscriptionPlan } from '@/types';
import { useStore } from '@/store/useStore';

export const useJobApi = (jobId?: string, companyId?: string) => {
    const queryClient = useQueryClient();
    const { user } = useStore();

    // Fetch only job metadata (lightweight)
    const useJobQuery = () => {
        return useQuery({
            queryKey: ['job', jobId, companyId],
            queryFn: async () => {
                if (!jobId) return null;

                try {
                    const backendJob = await jobsApi.getById(jobId, companyId);

                    const job: JobPosting = {
                        id: backendJob.id,
                        title: backendJob.title,
                        roleCategory: backendJob.roleCategory,
                        description: backendJob.description,
                        companyName: user?.name || 'Company',
                        companyId: companyId || user?.id || '',
                        interviewStartTime: backendJob.interviewStartTime || backendJob.scheduledTime,
                        interviewEndTime: backendJob.interviewEndTime,
                        timezone: backendJob.timezone || 'UTC',
                        planAtCreation: backendJob.planAtCreation as SubscriptionPlan,
                        tabTracking: backendJob.tabTracking,
                        eyeTracking: backendJob.eyeTracking,
                        multiFaceDetection: backendJob.multiFaceDetection ?? false,
                        fullScreenMode: backendJob.fullScreenMode ?? false,
                        noTextTyping: backendJob.noTextTyping,
                        videoRequired: backendJob.videoRequired || false,
                        micRequired: backendJob.micRequired || false,
                        candidates: [], // Candidates fetched separately
                    };

                    return job;
                } catch (error) {
                    console.error('Failed to fetch job:', error);
                    return null;
                }
            },
            enabled: !!jobId,
            staleTime: 30000,
        });
    };

    // Fetch candidates separately
    const useJobCandidatesQuery = () => {
        return useQuery({
            queryKey: ['job-candidates', jobId, companyId],
            queryFn: async () => {
                if (!jobId) return [];
                return jobsApi.getCandidates(jobId, companyId);
            },
            enabled: !!jobId,
            staleTime: 10000,
        });
    };

    // Invite candidates to a job
    const inviteCandidatesMutation = useMutation({
        mutationFn: async ({
            candidates,
        }: {
            candidates: Array<{ name: string; email: string }>;
        }) => {
            if (!jobId) throw new Error('Job ID is required');
            return jobsApi.inviteCandidates(jobId, { candidates }, companyId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', jobId, companyId] });
            queryClient.invalidateQueries({ queryKey: ['job-candidates', jobId, companyId] });
            queryClient.invalidateQueries({ queryKey: ['jobs', companyId] });
        },
    });

    // Get job analytics
    const useJobAnalytics = () => {
        return useQuery({
            queryKey: ['job-analytics', jobId, companyId],
            queryFn: () => {
                if (!jobId) throw new Error('Job ID is required');
                return jobsApi.getAnalytics(jobId, companyId);
            },
            enabled: !!jobId,
        });
    };

    return {
        useJobQuery,
        useJobCandidatesQuery,
        useJobAnalytics,
        inviteCandidatesMutation,
    };
};

export default useJobApi;
