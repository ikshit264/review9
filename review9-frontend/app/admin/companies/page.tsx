'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { Card } from '@/components/UI';
import {
    Loader2,
    Search,
    Briefcase,
    ArrowUpRight,
    MapPin,
    Mail,
    Calendar,
    Globe
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { format } from 'date-fns';

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async (page: number = 1) => {
        setIsLoading(true);
        try {
            const companiesRes = await adminApi.getCompanies(page, 10);
            setCompanies(companiesRes.data);
            setPagination({
                page: companiesRes.page,
                totalPages: companiesRes.totalPages,
                total: companiesRes.total
            });
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage);
        }
    };

    const filteredCompanies = companies.filter((c: any) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FDFDFE] text-slate-900 selection:bg-blue-100">
            <div className="flex relative z-10">
                <Sidebar />
                <main className="flex-grow p-4 lg:p-12 max-w-[1400px] mx-auto w-full font-inter">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">Admin Portal</span>
                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Management</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                                Companies
                                <span className="text-blue-600">.</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                        </div>
                    </header>

                    <div className="space-y-8">
                        {/* Search Bar */}
                        <div className="relative group max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search companies by name or email..."
                                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-sm shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Companies List */}
                        <div className="grid grid-cols-1 gap-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-20">
                                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                </div>
                            ) : filteredCompanies.length === 0 ? (
                                <div className="text-center p-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-widest">No matching companies</h3>
                                    <p className="text-gray-400 font-medium text-sm">Adjust your search criteria and try again</p>
                                </div>
                            ) : (
                                filteredCompanies.map((company: any) => (
                                    <Card key={company.id} className="bg-white border-gray-100 p-8 hover:border-blue-100 hover:shadow-md transition-all group rounded-[2.5rem]">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/50 group-hover:scale-110 transition-transform">
                                                    <Briefcase className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{company.name || 'Unnamed Company'}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${company.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                company.approvalStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {company.approvalStatus}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {company.email}</span>
                                                        <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Joined {format(new Date(company.createdAt), 'MMM yyyy')}</span>
                                                        <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> {company.plan} Plan</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => window.open(`/dashboard?companyId=${company.id}`, '_blank')}
                                                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" /> View Dashboard
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {!isLoading && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-8">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-6 py-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Prev
                                </button>
                                <div className="flex gap-2">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-12 h-12 rounded-xl border transition-all font-black text-[11px] ${pagination.page === p
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:text-slate-900 shadow-sm'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-6 py-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
