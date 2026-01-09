'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { usePaymentApi, PaymentTransaction } from '@/hooks/usePaymentApi';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';

export default function BillingPage() {
    const router = useRouter();
    const { user } = useStore();
    const { getPaymentHistory, loading } = usePaymentApi();
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            const history = await getPaymentHistory();
            setPayments(history);

            // Calculate subscription info
            if (user.plan && user.plan !== 'FREE') {
                const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
                const now = new Date();
                const daysRemaining = expiresAt
                    ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                setSubscriptionInfo({
                    plan: user.plan,
                    expiresAt,
                    daysRemaining,
                    isExpiringSoon: daysRemaining !== null && daysRemaining <= 3,
                    progressPercentage: daysRemaining !== null ? Math.max(0, Math.min(100, (daysRemaining / 30) * 100)) : 0,
                });
            }

            // Trigger fade-in animation
            setTimeout(() => setIsLoaded(true), 100);
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, router]);

    if (!user) return null;

    const getDaysRemainingColor = (days: number | null) => {
        if (days === null) return 'text-gray-500';
        if (days > 7) return 'text-emerald-600';
        if (days > 3) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getDaysRemainingBg = (days: number | null) => {
        if (days === null) return 'bg-gray-50';
        if (days > 7) return 'bg-emerald-50 border-emerald-200';
        if (days > 3) return 'bg-amber-50 border-amber-200';
        return 'bg-rose-50 border-rose-200';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage > 50) return 'bg-emerald-500';
        if (percentage > 25) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 text-slate-900">
            <div className="flex relative z-10">
                <Sidebar />

                <main className="flex-grow p-4 lg:p-12 max-w-[1400px] mx-auto w-full">
                    {/* Header */}
                    <header className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                        <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    Billing
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                                Subscription & Billing
                                <span className="text-blue-600">.</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-2xl flex items-center justify-center text-slate-700 font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                                {user.name[0]}
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Current Subscription */}
                        <div className="lg:col-span-2 space-y-8">
                            <section className={`p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-blue-100/50 transition-all duration-700 delay-100 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
                                        Current Subscription
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plan</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-3xl font-black text-gray-900">{user.plan || 'FREE'}</p>
                                                {user.plan !== 'FREE' && (
                                                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {subscriptionInfo && subscriptionInfo.daysRemaining !== null && (
                                            <div className={`px-6 py-3 rounded-2xl border-2 ${getDaysRemainingBg(subscriptionInfo.daysRemaining)} transition-all duration-300 hover:scale-105`}>
                                                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1 font-bold">
                                                    Days Remaining
                                                </p>
                                                <p className={`text-2xl font-black ${getDaysRemainingColor(subscriptionInfo.daysRemaining)}`}>
                                                    {subscriptionInfo.daysRemaining}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    {subscriptionInfo && subscriptionInfo.progressPercentage !== undefined && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-600">
                                                <span className="font-semibold">Subscription Progress</span>
                                                <span className="font-bold">{Math.round(subscriptionInfo.progressPercentage)}%</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full ${getProgressColor(subscriptionInfo.progressPercentage)} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                                                    style={{ width: `${subscriptionInfo.progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {subscriptionInfo && subscriptionInfo.expiresAt && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <Calendar className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium">
                                                Expires on{' '}
                                                <span className="font-bold text-gray-900" suppressHydrationWarning={true}>
                                                    {subscriptionInfo.expiresAt.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        timeZone: 'UTC'
                                                    })}
                                                </span>
                                            </span>
                                        </div>
                                    )}

                                    {subscriptionInfo && subscriptionInfo.isExpiringSoon && (
                                        <div className="bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 p-5 rounded-xl shadow-md animate-pulse">
                                            <div className="flex items-start">
                                                <AlertCircle className="w-6 h-6 text-rose-600 mr-3 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-rose-900">
                                                        ⚠️ Subscription Expiring Soon!
                                                    </p>
                                                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                                                        Your subscription will expire in {subscriptionInfo.daysRemaining}{' '}
                                                        day{subscriptionInfo.daysRemaining !== 1 ? 's' : ''}. Renew now to avoid interruption of service.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-200">
                                        {subscriptionInfo && subscriptionInfo.daysRemaining !== null && subscriptionInfo.daysRemaining > 0 ? (
                                            <div className="space-y-3">
                                                <button
                                                    disabled
                                                    className="w-full bg-gray-300 text-gray-500 font-bold py-4 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Zap className="w-5 h-5" />
                                                    Renew Subscription
                                                </button>
                                                <p className="text-xs text-gray-600 text-center italic">
                                                    Renewal available in {subscriptionInfo.daysRemaining} day{subscriptionInfo.daysRemaining !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => router.push('/payment')}
                                                className="group w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                                            >
                                                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                                {user.plan === 'FREE' ? 'Upgrade Plan' : 'Renew Subscription'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Payment History */}
                            <section className={`p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-purple-100/50 transition-all duration-700 delay-200 hover:shadow-xl hover:shadow-purple-200/50 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
                                        Payment History
                                    </h2>
                                </div>

                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                                        <p className="text-sm text-gray-500 mt-4 font-medium">Loading payment history...</p>
                                    </div>
                                ) : payments.length === 0 ? (
                                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-200">
                                        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 font-bold text-lg">No payment history yet</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Your payment transactions will appear here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200">
                                                    <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                                                        Plan
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                                                        Period
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((payment, index) => (
                                                    <tr
                                                        key={payment.id}
                                                        className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 hover:shadow-md"
                                                        style={{
                                                            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                                                        }}
                                                    >
                                                        <td className="py-5 px-4 text-sm text-gray-700 font-medium" suppressHydrationWarning={true}>
                                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                timeZone: 'UTC'
                                                            })}
                                                        </td>
                                                        <td className="py-5 px-4">
                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                                                                {payment.plan}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-4 text-sm font-bold text-gray-900">
                                                            <span className="text-lg">${payment.amount}</span>
                                                            <span className="text-xs text-gray-500 ml-1">{payment.currency}</span>
                                                        </td>
                                                        <td className="py-5 px-4 text-xs text-gray-600 font-medium" suppressHydrationWarning={true}>
                                                            {new Date(payment.subscriptionStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                                                            {new Date(payment.subscriptionEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="py-5 px-4">
                                                            <span
                                                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${payment.status === 'SUCCEEDED'
                                                                    ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                                                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                                                                    }`}
                                                            >
                                                                {payment.status === 'SUCCEEDED' && (
                                                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                )}
                                                                {payment.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Pricing Info */}
                        <div className="space-y-6">
                            <div className={`p-6 rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-200/50 shadow-lg transition-all duration-700 delay-300 hover:shadow-xl hover:-translate-y-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="flex items-center gap-2 mb-5">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Subscription Plans</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-blue-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-black text-gray-900 text-lg">PRO</span>
                                            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">$9<span className="text-sm">/mo</span></span>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">30-day subscription</p>
                                    </div>
                                    <div className="p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-purple-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-black text-gray-900 text-lg">ULTRA</span>
                                            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$27<span className="text-sm">/mo</span></span>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">30-day subscription</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-lg transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-black text-amber-900 mb-2 uppercase tracking-wide">Important</h4>
                                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                            Subscriptions require manual renewal each month. You'll see a warning on this page when 3 or fewer days remain before expiration.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
