export interface Candidate {
    id: string;
    candidateId?: string;
    jobId: string;
    name: string;
    email: string;
    resumeUrl?: string;
    resumeText?: string;
    interviewStartTime?: string;
    interviewEndTime?: string;
    status: 'PENDING' | 'INVITED' | 'REVIEW' | 'REJECTED' | 'CONSIDERED' | 'SHORTLISTED' | 'EXPIRED' | string;
    sessionId?: string;
    isReInterviewed?: boolean;
    score?: number;
    aiFeedback?: string;
}
