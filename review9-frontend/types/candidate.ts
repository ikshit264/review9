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
    status: 'PENDING' | 'INVITED' | 'REVIEW' | 'COMPLETED' | 'REJECTED' | 'CONSIDERED' | 'SHORTLISTED' | 'EXPIRED' | string;
    interviewLink: string;
    sessionId?: string;
    isReInterviewed?: boolean;
    score?: number;
    aiFeedback?: string;
}
