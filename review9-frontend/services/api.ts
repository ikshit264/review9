'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
import {
    User,
    JobPosting,
    Candidate,
    InterviewSession,
    FinalEvaluation,
    SubscriptionPlan,
    InterviewResponse,
    ProctoringLog,
    HireAINotification as Notification
} from '@/types';

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include', // Send cookies with requests
    });

    if (response.status === 401) {
        // Redirect to login if unauthorized
        if (typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
            window.location.href = '/login?error=session_expired';
        }

        const error = await response.json().catch(() => ({ message: 'Unauthorized' }));
        throw new Error(error.message || 'Unauthorized - Please log in again');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Auth API
export const authApi = {
    register: async (data: {
        email: string;
        password: string;
        name: string;
        role: 'COMPANY' | 'CANDIDATE';
    }) => {
        return apiRequest<User>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login: async (data: { email: string; password: string }) => {
        return apiRequest<{
            user: User & { createdAt: string };
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getProfile: async () => {
        return apiRequest<User>('/auth/me');
    },

    updateProfile: async (data: Partial<User>) => {
        return apiRequest<User>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    detectTimezone: async (ip?: string) => {
        return apiRequest<{ timezone: string; location: string }>('/auth/detect-timezone', {
            method: 'POST',
            body: JSON.stringify({ ip }),
        });
    },
};

// Jobs API
export const jobsApi = {
    getAll: async () => {
        return apiRequest<any[]>('/jobs');
    },

    getById: async (id: string) => {
        return apiRequest<any>(`/jobs/${id}`);
    },

    create: async (data: Partial<JobPosting>) => {
        return apiRequest<any>('/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: Partial<JobPosting>) => {
        return apiRequest<any>(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return apiRequest<{ success: boolean }>(`/jobs/${id}`, {
            method: 'DELETE',
        });
    },

    inviteCandidate: async (jobId: string, data: { email: string; name: string }) => {
        return apiRequest<Candidate>(`/jobs/${jobId}/candidates`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    inviteCandidates: async (jobId: string, data: { candidates: { email: string; name: string }[] }) => {
        return apiRequest<{ success: boolean }>(`/jobs/${jobId}/candidates`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getInvitationProgress: async (jobId: string) => {
        return apiRequest<{
            found: boolean;
            total: number;
            current: number;
            succeeded: number;
            failed: number;
            completed: boolean;
            details: any[];
        }>(`/jobs/${jobId}/candidates/invitation-progress`);
    },

    getCandidates: async (jobId: string) => {
        return apiRequest<Candidate[]>(`/jobs/${jobId}/candidates`);
    },

    reInterviewCandidate: async (jobId: string, candidateId: string) => {
        return apiRequest<{ success: boolean }>(`/candidates/${candidateId}/re-interview`, {
            method: 'POST',
        });
    },

    updateCandidateStatus: async (candidateId: string, status: Candidate['status']) => {
        return apiRequest<Candidate>(`/candidates/${candidateId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    updateCandidateResume: async (candidateId: string, resumeText: string) => {
        return apiRequest<Candidate>(`/candidates/${candidateId}/resume`, {
            method: 'PATCH',
            body: JSON.stringify({ resumeText }),
        });
    },

    resendInvite: async (jobId: string, data: { name: string; email: string }) => {
        return apiRequest<{ success: boolean }>(`/jobs/${jobId}/candidates/resend`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getAnalytics: async (jobId: string) => {
        return apiRequest<{
            completionRate: number;
            integrityRate: number;
            fitCandidates: number;
            completedSessions: number;
            timeSavedHours: number;
            scoreDistribution: number[];
            incidentCounts: {
                tab_switch: number;
                eye_distraction: number;
                multiple_faces: number;
                no_face: number;
                other: number;
            };
            statusCounts: Record<string, number>;
        }>(`/jobs/${jobId}/analytics`);
    },

    getCompanyProfile: async (id: string) => {
        return apiRequest<any>(`/companies/${id}`);
    }
};

// Interviews API
export const interviewsApi = {
    getTestSession: async () => {
        return apiRequest<InterviewSession>('/interviews/test-me');
    },

    getMyInvitations: async () => {
        return apiRequest<any[]>('/interviews/my-invitations');
    },

    getByToken: async (token: string) => {
        return apiRequest<Candidate & { job: JobPosting }>(`/interviews/token/${token}`);
    },

    getInterviewStatus: async (token: string) => {
        return apiRequest<{ status: string }>(`/interviews/token/${token}/status`);
    },

    getSession: async (id: string) => {
        return apiRequest<InterviewSession>(`/interviews/${id}`);
    },

    startInterview: async (token: string, data: { resumeUrl?: string | null, resumeText?: string }) => {
        return apiRequest<InterviewSession>(`/interviews/${token}/start`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    saveTranscript: async (sessionId: string, data: {
        questionText: string;
        candidateAnswer: string;
        aiAcknowledgment?: string;
    }) => {
        return apiRequest<InterviewResponse>(`/interviews/${sessionId}/transcript`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    logProctoring: async (sessionId: string, data: {
        type: string;
        severity: string;
        reason?: string;
    }) => {
        return apiRequest<{
            log: ProctoringLog;
            status: 'LOGGED' | 'WARNING' | 'FLAGGED';
            warningCount: number;
            terminated: boolean;
            reason?: string
        }>(`/interviews/${sessionId}/proctoring`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    completeInterview: async (sessionId: string) => {
        return apiRequest<{ success: boolean }>(`/interviews/${sessionId}/complete`, {
            method: 'POST',
        });
    },

    pauseInterview: async (sessionId: string, reason: string) => {
        return apiRequest<{ success: boolean }>(`/interviews/${sessionId}/pause`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },

    resumeInterview: async (sessionId: string) => {
        return apiRequest<{ success: boolean }>(`/interviews/${sessionId}/resume`, {
            method: 'POST',
        });
    },

    acknowledgeWarning: async (sessionId: string) => {
        return apiRequest<InterviewSession>(`/interviews/${sessionId}/acknowledge-warning`, {
            method: 'POST',
        });
    },

    getInitialQuestions: async (sessionId: string) => {
        return apiRequest<string[]>(`/interviews/${sessionId}/initial-questions`);
    },

    respondToInterviewStream: async (
        sessionId: string,
        answer: string,
        onChunk: (chunk: string) => void
    ) => {
        const response = await fetch(`${API_BASE_URL}/interviews/${sessionId}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ answer }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Streaming failed' }));
            throw new Error(error.message || 'Streaming failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                onChunk(chunk);
            }
        }
    },

    respondToInterviewSync: async (sessionId: string, answer: string) => {
        return apiRequest<{ reply: string }>(`/interviews/${sessionId}/respond-sync`, {
            method: 'POST',
            body: JSON.stringify({ answer }),
        });
    },

    getEvaluation: async (sessionId: string) => {
        return apiRequest<FinalEvaluation>(`/interviews/${sessionId}/evaluation`);
    },

    getSessionReport: async (sessionId: string) => {
        return apiRequest(`/interviews/${sessionId}/report`);
    },
};

// Billing API
export const billingApi = {
    getSubscription: async () => {
        return apiRequest<{ plan: SubscriptionPlan, status: string }>('/billing/subscription');
    },

    createCheckoutSession: async (plan: 'PRO' | 'ULTRA') => {
        return apiRequest<{ url: string }>('/billing/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan }),
        });
    },

    subscribe: async (plan: SubscriptionPlan) => {
        return apiRequest<{ success: boolean, message: string, user: User }>('/billing/subscribe', {
            method: 'POST',
            body: JSON.stringify({ plan }),
        });
    },
};

// Upload API
export const uploadApi = {
    getPresignedUrl: async (filename: string, fileType: string) => {
        return apiRequest<{ url: string; publicUrl: string }>('/uploads/presigned-url', {
            method: 'POST',
            body: JSON.stringify({ filename, fileType }),
        });
    },

    uploadToS3: async (url: string, file: File) => {
        const response = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to upload file to S3');
        }
    },
};

// Notifications API
export const notificationsApi = {
    getAll: async (params?: { cursor?: string; take?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.cursor) queryParams.append('cursor', params.cursor);
        if (params?.take) queryParams.append('take', params.take.toString());

        const query = queryParams.toString();
        return apiRequest<{
            notifications: Notification[],
            unreadCount: number,
            nextCursor: string | null,
            hasMore: boolean
        }>(`/notifications${query ? `?${query}` : ''}`);
    },
    markAsRead: async (id: string) => {
        return apiRequest<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
    },
    markAllAsRead: async () => {
        return apiRequest<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' });
    },
    delete: async (id: string) => {
        return apiRequest<{ success: boolean }>(`/notifications/${id}`, { method: 'DELETE' });
    }
};
