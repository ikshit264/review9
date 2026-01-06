export type LoadingVariant = 'email' | 'page' | 'data' | 'form' | 'auth';

export interface VariantConfig {
    icon: string;
    defaultMessage: string;
    defaultSubmessage: string;
    colorClass: string;
    bgClass: string;
    iconBgClass: string;
}

export const variantConfigs: Record<LoadingVariant, VariantConfig> = {
    email: {
        icon: 'mail',
        defaultMessage: 'Sending email...',
        defaultSubmessage: 'Please wait while we send your message',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50',
        iconBgClass: 'bg-blue-100',
    },
    page: {
        icon: 'layout',
        defaultMessage: 'Loading page...',
        defaultSubmessage: 'Please wait while we prepare your content',
        colorClass: 'text-slate-600',
        bgClass: 'bg-slate-50',
        iconBgClass: 'bg-slate-100',
    },
    data: {
        icon: 'database',
        defaultMessage: 'Fetching data...',
        defaultSubmessage: 'Please wait while we retrieve your information',
        colorClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50',
        iconBgClass: 'bg-emerald-100',
    },
    form: {
        icon: 'send',
        defaultMessage: 'Submitting...',
        defaultSubmessage: 'Please wait while we process your request',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50',
        iconBgClass: 'bg-blue-100',
    },
    auth: {
        icon: 'shield',
        defaultMessage: 'Authenticating...',
        defaultSubmessage: 'Please wait while we verify your credentials',
        colorClass: 'text-indigo-600',
        bgClass: 'bg-indigo-50',
        iconBgClass: 'bg-indigo-100',
    },
};
