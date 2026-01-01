import { useStore } from '@/store/useStore';

export const useToast = () => {
    const addToast = useStore((state) => state.addToast);

    return {
        success: (message: string, duration?: number) => addToast(message, 'success', duration),
        error: (message: string, duration?: number) => addToast(message, 'error', duration),
        info: (message: string, duration?: number) => addToast(message, 'info', duration),
        warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    };
};
