import { useState } from 'react';
import { paymentsApi } from '../services/api';

export interface PaymentTransaction {
    id: string;
    plan: 'PRO' | 'ULTRA';
    amount: number;
    currency: string;
    status: string;
    subscriptionStart: string;
    subscriptionEnd: string;
    createdAt: string;
}

export interface CheckoutResponse {
    checkoutUrl: string;
    plan: string;
    amount: number;
    currency: string;
}

export interface PaymentVerification {
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
}

export const usePaymentApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCheckoutSession = async (plan: 'PRO' | 'ULTRA', returnUrl?: string): Promise<CheckoutResponse | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentsApi.createCheckoutSession(plan, returnUrl);
            return response;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create checkout session';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentId: string): Promise<PaymentVerification | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentsApi.verifyPayment(paymentId);
            return response;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to verify payment';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getPaymentHistory = async (): Promise<PaymentTransaction[]> => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentsApi.getPaymentHistory();
            return response;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch payment history';
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        createCheckoutSession,
        verifyPayment,
        getPaymentHistory,
        loading,
        error,
    };
};
