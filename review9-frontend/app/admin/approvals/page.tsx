'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { Card } from '@/components/UI';
import {
    Loader2,
    Briefcase,
    CheckCircle2,
    XCircle,
    Mail,
    Calendar,
    ShieldAlert
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { format } from 'date-fns';
import { useToast } from '@/hooks/useToast';

export default function AdminApprovalsPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    const fetchPending = async () => {
        setIsLoading(true);
        try {
            // We fetch all companies and filter for PENDING on the client for now
            // or we could add a specific backend endpoint later if needed.
            // Using a large limit to capture most pending ones for now.
            const res = await adminApi.getCompanies(1, 100);
            setCompanies(res.data.filter((c: any) => c.approvalStatus === 'PENDING'));
        } catch (error) {
            console.error('Failed to fetch pending companies:', error);
            toast.error("Failed to load approvals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await adminApi.approveCompany(id);
            setCompanies(companies.filter(c => c.id !== id));
            toast.success("Company approved successfully");
        } catch (error) {
            console.error('Approval failed:', error);
            toast.error("Approval failed");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await adminApi.rejectCompany(id);
            setCompanies(companies.filter(c => c.id !== id));
            toast.success("Company rejected");
        } catch (error) {
            console.error('Rejection failed:', error);
            toast.error("Rejection failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFE] text-slate-900 selection:bg-blue-100">
            <div className="flex relative z-10">
                <Sidebar />
                <main className="flex-grow p-4 lg:p-12 max-w-[1400px] mx-auto w-full font-inter">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest">Awaiting Review</span>
                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Control</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                                Approvals
                                <span className="text-amber-500">.</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="text-center p-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Queue Clear</h3>
                            <p className="text-gray-400 font-medium text-sm max-w-xs mx-auto">All company registrations have been processed. Great job!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {companies.map((company) => (
                                <Card key={company.id} className="bg-white border-gray-100 p-10 hover:border-amber-100 hover:shadow-md transition-all group rounded-[3rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                        <ShieldAlert className="w-64 h-64" />
                                    </div>

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                                                <Briefcase className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{company.name}</h3>
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">Pending Approval</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                                                    <span className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-300" /> {company.email}</span>
                                                    <span className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-300" /> Requested {format(new Date(company.createdAt), 'ppp')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleReject(company.id)}
                                                className="p-5 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm"
                                                title="Reject Registration"
                                            >
                                                <XCircle className="w-7 h-7" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(company.id)}
                                                className="flex items-center gap-4 px-10 py-5 bg-emerald-500 text-white font-black text-[12px] uppercase tracking-[0.25em] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]"
                                            >
                                                <CheckCircle2 className="w-6 h-6" /> Approve Growth
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
