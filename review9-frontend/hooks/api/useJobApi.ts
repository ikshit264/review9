'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/services/api';
import { JobPosting, SubscriptionPlan } from '@/types';
import { useStore } from '@/store/useStore';

export const useJobApi = (jobId?: string) => {
    const queryClient = useQueryClient();
    const { user } = useStore();

    // Fetch a single job by ID
    const useJobQuery = () => {
        return useQuery({
            queryKey: ['job', jobId],
            queryFn: async () => {
                if (!jobId) return null;

                try {
                    const backendJob = await jobsApi.getById(jobId);

                    // Transform to frontend format
                    const job: JobPosting = {
                        id: backendJob.id,
                        title: backendJob.title,
                        role: backendJob.roleCategory,
                        description: backendJob.description,
                        companyName: user?.name || 'Company',
                        companyId: user?.id || '',
                        date: backendJob.scheduledTime,
                        candidates: backendJob.candidates.map((c: any) => ({
                            id: c.id,
                            name: c.name,
                            email: c.email,
                            interviewTime: '',
                            status: c.status,
                            resumeText: c.resumeText,
                            sessionId: c.sessionId,
                            score: c.score,
                        })),
                        planAtCreation: backendJob.planAtCreation as SubscriptionPlan,
                        proctoringSettings: {
                            tabTracking: backendJob.tabTracking,
                            eyeTracking: backendJob.eyeTracking,
                            multiFaceDetection: backendJob.multiFaceDetection,
                            screenRecording: backendJob.screenRecording,
                        },
                        // Include new fields
                        tabTracking: backendJob.tabTracking,
                        eyeTracking: backendJob.eyeTracking,
                        multiFaceDetection: backendJob.multiFaceDetection,
                        screenRecording: backendJob.screenRecording,
                        fullScreenMode: backendJob.fullScreenMode,
                        noTextTyping: backendJob.noTextTyping,
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

    // Invite candidates to a job
    const inviteCandidatesMutation = useMutation({
        mutationFn: async ({
            candidates,
        }: {
            candidates: Array<{ name: string; email: string }>;
        }) => {
            if (!jobId) throw new Error('Job ID is required');
            return jobsApi.inviteCandidates(jobId, { candidates });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', jobId] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });

    // Get job analytics
    const useJobAnalytics = () => {
        return useQuery({
            queryKey: ['job-analytics', jobId],
            queryFn: () => {
                if (!jobId) throw new Error('Job ID is required');
                return jobsApi.getAnalytics(jobId);
            },
            enabled: !!jobId,
        });
    };

    return {
        useJobQuery,
        useJobAnalytics,
        inviteCandidatesMutation,
    };
};

export default useJobApi;
