export enum UserRole {
    COMPANY = 'COMPANY',
    CANDIDATE = 'CANDIDATE'
}

export enum SubscriptionPlan {
    FREE = 'FREE',
    PRO = 'PRO',
    ULTRA = 'ULTRA'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    plan?: SubscriptionPlan;
    avatar?: string;
    bio?: string;
    location?: string;
    phone?: string;
    timezone?: string;
    isProfileComplete?: boolean;
    resumeUrl?: string;
    workExperience?: any;
    skills?: string[];
}
