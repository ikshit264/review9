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
    IntervAINotification as Notification
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
        // Redirect to login if unauthorized and not on a public page
        if (typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
            const publicPaths = ['/', '/login', '/register', '/interview/demo', '/terms', '/privacy'];
            const isPublicPage = publicPaths.includes(window.location.pathname);

            if (!isPublicPage) {
                window.location.href = '/login?error=session_expired';
            }
        }

        const error = await response.json().catch(() => ({ message: 'Unauthorized' }));
        throw new Error(error.message || 'Unauthorized - Please log in again');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        let message = error.message || `HTTP error! status: ${response.status}`;

        // Handle NestJS validation errors which are often arrays
        if (Array.isArray(message)) {
            message = message.join(', ');
        }

        throw new Error(message);
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

    getProfile: async (userId?: string) => {
        const url = userId ? `/auth/me?userId=${userId}` : '/auth/me';
        return apiRequest<User>(url);
    },

    updateProfile: async (data: Partial<User>) => {
        return apiRequest<User>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    verifyToken: async (token: string) => {
        return apiRequest<{ message: string; email: string }>('/auth/verify-link', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },
    resendVerification: async (email: string) => {
        return apiRequest<{ message: string; email: string }>('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },
};

// Jobs API
export const jobsApi = {
    getAll: async (companyId?: string) => {
        const url = companyId ? `/jobs?companyId=${companyId}` : '/jobs';
        return apiRequest<any[]>(url);
    },

    getById: async (id: string, companyId?: string) => {
        const url = companyId ? `/jobs/${id}?companyId=${companyId}` : `/jobs/${id}`;
        return apiRequest<any>(url);
    },

    create: async (data: Partial<JobPosting>, companyId?: string) => {
        const url = companyId ? `/jobs?companyId=${companyId}` : '/jobs';
        return apiRequest<any>(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: Partial<JobPosting>, companyId?: string) => {
        const url = companyId ? `/jobs/${id}?companyId=${companyId}` : `/jobs/${id}`;
        return apiRequest<any>(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string, companyId?: string) => {
        const url = companyId ? `/jobs/${id}?companyId=${companyId}` : `/jobs/${id}`;
        return apiRequest<{ success: boolean }>(url, {
            method: 'DELETE',
        });
    },

    inviteCandidate: async (jobId: string, data: { email: string; name: string }, companyId?: string) => {
        const url = companyId ? `/jobs/${jobId}/candidates?companyId=${companyId}` : `/jobs/${jobId}/candidates`;
        return apiRequest<Candidate>(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    inviteCandidates: async (jobId: string, data: { candidates: { email: string; name: string }[] }, companyId?: string) => {
        const url = companyId ? `/jobs/${jobId}/candidates?companyId=${companyId}` : `/jobs/${jobId}/candidates`;
        return apiRequest<{ success: boolean }>(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getInvitationProgress: async (jobId: string, companyId?: string) => {
        const url = companyId ? `/jobs/${jobId}/candidates/invitation-progress?companyId=${companyId}` : `/jobs/${jobId}/candidates/invitation-progress`;
        return apiRequest<{
            found: boolean;
            total: number;
            current: number;
            succeeded: number;
            failed: number;
            completed: boolean;
            details: any[];
        }>(url);
    },

    getCandidates: async (jobId: string, companyId?: string) => {
        const url = companyId ? `/jobs/${jobId}/candidates?companyId=${companyId}` : `/jobs/${jobId}/candidates`;
        return apiRequest<Candidate[]>(url);
    },

    reInterviewCandidate: async (jobId: string, candidateId: string, companyId?: string) => {
        const url = companyId ? `/candidates/${candidateId}/re-interview?companyId=${companyId}` : `/candidates/${candidateId}/re-interview`;
        return apiRequest<{ success: boolean }>(url, {
            method: 'POST',
        });
    },

    updateCandidateStatus: async (candidateId: string, status: Candidate['status'], companyId?: string) => {
        const url = companyId ? `/candidates/${candidateId}/status?companyId=${companyId}` : `/candidates/${candidateId}/status`;
        return apiRequest<Candidate>(url, {
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

    resendInvite: async (jobId: string, data: { name: string; email: string }, companyId?: string) => {
        const url = companyId ? `/jobs/${jobId}/candidates/resend?companyId=${companyId}` : `/jobs/${jobId}/candidates/resend`;
        return apiRequest<{ success: boolean }>(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getAnalytics: async (jobId: string, companyId?: string) => {
        const url = companyId ? `/jobs/${jobId}/analytics?companyId=${companyId}` : `/jobs/${jobId}/analytics`;
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
        }>(url);
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

    getSession: async (id: string, companyId?: string) => {
        const url = companyId ? `/interviews/${id}?companyId=${companyId}` : `/interviews/${id}`;
        return apiRequest<InterviewSession>(url);
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

    resumeInterview: async (sessionId: string, companyId?: string) => {
        const url = companyId ? `/interviews/${sessionId}/resume?companyId=${companyId}` : `/interviews/${sessionId}/resume`;
        return apiRequest<{ success: boolean }>(url, {
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

    getEvaluation: async (sessionId: string, companyId?: string) => {
        const url = companyId ? `/interviews/${sessionId}/evaluation?companyId=${companyId}` : `/interviews/${sessionId}/evaluation`;
        return apiRequest<FinalEvaluation>(url);
    },

    getSessionReport: async (sessionId: string, companyId?: string) => {
        const url = companyId ? `/interviews/${sessionId}/report?companyId=${companyId}` : `/interviews/${sessionId}/report`;
        return apiRequest(url);
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

// Payments API
export const paymentsApi = {
    createCheckoutSession: async (plan: 'PRO' | 'ULTRA', returnUrl?: string) => {
        return apiRequest<{
            checkoutUrl: string;
            plan: string;
            amount: number;
            currency: string;
        }>('/payments/create-checkout', {
            method: 'POST',
            body: JSON.stringify({ plan, returnUrl }),
        });
    },

    verifyPayment: async (paymentId: string) => {
        return apiRequest<{
            verified: boolean;
            message?: string;
            payment?: {
                id: string;
                plan: string;
                amount: number;
                currency: string;
                status: string;
                subscriptionStart: string;
                subscriptionEnd: string;
            };
            user?: {
                id: string;
                email: string;
                name: string;
                plan: string;
                subscriptionExpiresAt: string;
            };
        }>(`/payments/verify/${paymentId}`);
    },

    getPaymentHistory: async () => {
        return apiRequest<Array<{
            id: string;
            plan: 'PRO' | 'ULTRA';
            amount: number;
            currency: string;
            status: string;
            subscriptionStart: string;
            subscriptionEnd: string;
            createdAt: string;
        }>>('/payments/history');
    },
};

// Admin API
export const adminApi = {
    getCompanies: async (page: number = 1, limit: number = 10) => {
        return apiRequest<any>(`/admin/companies?page=${page}&limit=${limit}`);
    },
    approveCompany: async (id: string) => {
        return apiRequest<{ message: string }>(`/admin/companies/${id}/approve`, { method: 'POST' });
    },
    rejectCompany: async (id: string) => {
        return apiRequest<{ message: string }>(`/admin/companies/${id}/reject`, { method: 'POST' });
    },
    getActivities: async () => {
        return apiRequest<any>('/admin/activities');
    }
};
