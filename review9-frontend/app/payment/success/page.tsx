'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePaymentApi } from '@/hooks/usePaymentApi';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyPayment } = usePaymentApi();

    const [verifying, setVerifying] = useState(true);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');

        if (!paymentId) {
            setError('No payment ID found');
            setVerifying(false);
            return;
        }

        const verify = async () => {
            const result = await verifyPayment(paymentId);

            if (result && result.verified) {
                setPaymentData(result);
            } else {
                setError(result?.message || 'Payment verification failed');
            }

            setVerifying(false);

            // Redirect to billing tab after 3 seconds
            setTimeout(() => {
                router.push('/profile#billing');
            }, 3000);
        };

        verify();
    }, [searchParams, verifyPayment, router]);

    if (verifying) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
                    <p className="text-gray-600">Please wait while we confirm your payment.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/payment')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">Your subscription has been activated.</p>

                {paymentData && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plan:</span>
                                <span className="font-semibold text-gray-900">{paymentData.payment?.plan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-semibold text-gray-900">
                                    ${paymentData.payment?.amount} {paymentData.payment?.currency}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Expires:</span>
                                <span className="font-semibold text-gray-900">
                                    {new Date(paymentData.payment?.subscriptionEnd).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
                    <p className="text-sm text-blue-700">
                        You will be redirected to your billing page in a few seconds...
                    </p>
                </div>

                <button
                    onClick={() => router.push('/profile#billing')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    Go to Billing Now
                </button>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
