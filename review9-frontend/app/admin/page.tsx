'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { Card } from '@/components/UI';
import {
    Loader2,
    Briefcase,
    Clock,
    TrendingUp,
    BrainCircuit,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const activityData = await adminApi.getActivities();
            setStats(activityData.stats);
            setActivities(activityData);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading && !stats) {
        return (
            <div className="min-h-screen bg-[#FDFDFE] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFE] text-slate-900 selection:bg-blue-100">
            <div className="flex relative z-10">
                <Sidebar />
                <main className="flex-grow p-4 lg:p-12 max-w-[1400px] mx-auto w-full font-inter">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">Admin Control</span>
                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Overview</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                                Dashboard
                                <span className="text-blue-600">.</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                        </div>
                    </header>

                    <div className="space-y-12">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Active Companies', value: stats?.activeCompanies || 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Trial Users', value: stats?.trialUsers || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: 'Platform Growth', value: '+12%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'AI Interviews', value: stats?.totalInterviews || 1420, icon: BrainCircuit, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            ].map((stat, i) => (
                                <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group">
                                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black tracking-tighter mb-1 text-slate-900">{stat.value}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="p-10 rounded-[3rem] bg-white border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    Security Logs
                                </h3>
                                <div className="space-y-6">
                                    {activities?.recentActivity.map((log: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-900 leading-tight mb-1">{log.message}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter">{format(new Date(log.timestamp), 'ppp')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
                                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[80px]" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 mb-8 relative z-10">System Status</h3>
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">API Gateway</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Operational</span>
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">AI Matching Engine</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">Operational</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
