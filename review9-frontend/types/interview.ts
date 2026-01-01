import { FinalEvaluation } from './evaluation';

export interface InterviewResponse {
    id: string;
    sessionId: string;
    questionText: string;
    candidateAnswer: string;
    aiAcknowledgment?: string;
    techScore?: number;
    commScore?: number;
    overfitScore?: number;
    aiFlagged?: boolean;
    turnFeedback?: string;
    timestamp: string;
}

export interface ProctoringLog {
    id?: string;
    timestamp: Date;
    type: 'tab_switch' | 'multiple_faces' | 'eye_distraction' | 'no_face' | 'abrupt_end' | 'eye_tracking' | 'face_detection' | string;
    severity: 'low' | 'medium' | 'high' | string;
}

export interface InterviewSession {
    id: string;
    jobId: string;
    candidateId: string;
    startTime: string;
    endTime?: string;
    status: 'PENDING' | 'ONGOING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | string;
    responses: InterviewResponse[];
    proctoringLogs: ProctoringLog[];
    warningCount: number;
    isFlagged: boolean;
    overallScore?: number;
    evaluation?: FinalEvaluation;
}

export interface ChatMessage {
    id: string;
    role: 'ai' | 'user';
    text: string;
    timestamp: Date;
}
