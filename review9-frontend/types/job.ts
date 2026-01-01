import { SubscriptionPlan } from './auth';
import { Candidate } from './candidate';

export interface ProctoringSettings {
    tabTracking: boolean;
    eyeTracking: boolean;
    multiFaceDetection: boolean;
    screenRecording: boolean;
    fullScreenMode: boolean;
    noTextTyping: boolean;
}

export interface JobPosting {
    id: string;
    title: string;
    roleCategory: string;
    description: string;
    notes?: string;
    companyName?: string;
    companyId: string;
    interviewStartTime: string;
    interviewEndTime: string;
    planAtCreation: SubscriptionPlan;
    tabTracking: boolean;
    eyeTracking: boolean;
    multiFaceDetection: boolean;
    screenRecording: boolean;
    fullScreenMode: boolean;
    videoRequired: boolean;
    micRequired: boolean;
    noTextTyping: boolean;
    timezone: string;
    createdAt?: string;
    candidates?: Candidate[];
}
