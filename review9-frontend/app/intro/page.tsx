'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Target,
    Shield,
    ChevronRight,
    Play,
    Users,
    Cpu,
    BarChart3,
    MessageSquare,
    MousePointer2,
    CheckCircle2,
    ArrowRight,
    Building2,
    UserCircle,
    LayoutDashboard,
    FileText,
    Settings,
    CreditCard,
    ShieldAlert,
    Mic2,
    Clock,
    Globe,
    Briefcase,
    TrendingUp,
    BrainCircuit,
    Plus,
    Monitor,
    Calendar,
    Copy,
    LogOut,
    Crown,
    ShieldCheck,
    BookOpen,
    User as UserIcon,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/UI';
import { useRouter } from 'next/navigation';

// --- Improved Miniature UI Components (High Fidelity) ---

const MiniSidebar = ({ activePage }: { activePage: string }) => (
    <div className="w-16 lg:w-32 h-full bg-white border-r border-gray-100 flex flex-col p-2 lg:p-4 shrink-0 transition-all">
        <div className="flex items-center gap-1.5 mb-8">
            <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <Cpu className="w-3 h-3 text-white" />
            </div>
            <div className="hidden lg:block text-[8px] font-black tracking-tighter uppercase">IntervAI</div>
        </div>
        <div className="space-y-3 flex-grow">
            {[
                { i: LayoutDashboard, l: "Dashboard", p: "/dashboard" },
                { i: UserIcon, l: "Profile", p: "/profile" },
                { i: CreditCard, l: "Billing", p: "/billing" },
                { i: BookOpen, l: "User Guide", p: "/intro" }
            ].map((item, i) => {
                const isActive = activePage === item.p;
                return (
                    <div key={i} className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${isActive ? 'bg-blue-50 text-blue-600 border-blue-100' : 'text-slate-400 border-transparent'}`}>
                        <item.i className="w-3.5 h-3.5" />
                        <div className="hidden lg:block text-[7px] font-bold uppercase tracking-widest">{item.l}</div>
                    </div>
                );
            })}
        </div>
        <div className="pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2.5 p-2 text-rose-500 bg-rose-50 rounded-xl border border-rose-100 opacity-50">
                <LogOut className="w-3.5 h-3.5" />
                <div className="hidden lg:block text-[7px] font-black uppercase tracking-widest">Sign Out</div>
            </div>
        </div>
    </div>
);

const MiniDashboard = ({ userRole }: { userRole: 'COMPANY' | 'CANDIDATE' }) => (
    <div className="flex-grow bg-[#FDFDFE] p-6 lg:p-10 overflow-hidden relative">
        <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
                <div className="text-[7px] font-bold text-blue-600 uppercase tracking-widest">Workspace Dashboard</div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Welcome back, {userRole === 'COMPANY' ? 'Acme Corp' : 'Alexander'}<span className="text-blue-600">.</span></h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-slate-400"><Calendar className="w-3 h-3" /></div>
                {userRole === 'COMPANY' && <div className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200"><Plus className="w-3 h-3" /> Post Opportunity</div>}
            </div>
        </div>

        {userRole === 'COMPANY' ? (
            <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { l: "ACTIVE JOBS", v: "12", c: "text-blue-600", b: "bg-blue-50", i: Briefcase },
                        { l: "APPLICANTS", v: "124", c: "text-indigo-600", b: "bg-indigo-50", i: UserIcon },
                        { l: "EFFICIENCY", v: "+28%", c: "text-emerald-600", b: "bg-emerald-50", i: TrendingUp },
                        { l: "MATCH RATE", v: "84%", c: "text-amber-600", b: "bg-amber-50", i: BrainCircuit }
                    ].map((s, i) => (
                        <div key={i} className="p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
                            <div className={`w-8 h-8 ${s.b} ${s.c} rounded-xl mb-3 flex items-center justify-center`}>
                                <s.i className="w-4 h-4" />
                            </div>
                            <div className="text-md font-black text-slate-900 leading-none mb-1">{s.v}</div>
                            <div className="text-[6px] font-black text-slate-400 uppercase tracking-widest">{s.l}</div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                        { t: "Software Engineer", d: "Backend Systems Lab", s: "Live" },
                        { t: "Product Designer", d: "UX Research Division", s: "Draft" }
                    ].map((j, i) => (
                        <div key={i} className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-slate-50 border rounded-xl text-slate-900 shadow-sm"><Briefcase className="w-4 h-4" /></div>
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${i === 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                    {i === 0 && <CheckCircle2 className="w-2.5 h-2.5" />} {j.s}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{j.t}</h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{j.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                    { t: "Senior Backend Developer", c: "Netflix Ops", s: "LIVE", h: "14:00" },
                    { t: "Staff UI Engineer", c: "Meta Reality Labs", s: "UPCOMING", h: "tomorrow" }
                ].map((inv, idx) => (
                    <div key={idx} className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-xl flex flex-col justify-between h-56 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-[1.25rem] flex items-center justify-center text-indigo-600 shadow-sm"><Monitor className="w-6 h-6" /></div>
                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${inv.s === 'LIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                {inv.s}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{inv.t}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{inv.c}</p>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-900">{inv.h} <span className="text-slate-400">UTC</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                Enter Arena <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const MiniJobView = () => (
    <div className="flex-grow bg-[#F8F9FA] flex flex-col h-full overflow-hidden">
        <div className="bg-white border-b px-8 py-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm"><ArrowLeft className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-none">Senior Systems Architect</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">NVIDIA SYSTEMS GROUP</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm text-slate-400"><Monitor className="w-5 h-5" /></div>
                    <div className="px-6 h-10 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">Invite Personnel</div>
                </div>
            </div>
            <div className="flex space-x-10">
                {['Overview', 'Responses', 'Analytics', 'Settings'].map((t, i) => (
                    <div key={i} className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all cursor-default ${i === 0 ? 'text-blue-600 border-blue-600' : 'text-slate-300 border-transparent'}`}>
                        {t}
                    </div>
                ))}
            </div>
        </div>
        <div className="p-10 grid grid-cols-12 gap-10">
            <div className="col-span-8 space-y-8">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Pipeline Requirements</h3>
                    <div className="space-y-3">
                        <div className="h-3 w-full bg-slate-50 rounded-full" />
                        <div className="h-3 w-full bg-slate-50 rounded-full" />
                        <div className="h-3 w-4/5 bg-slate-50 rounded-full" />
                    </div>
                </div>
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-5 border-b bg-slate-50/50 flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Candidate Matrix</h4>
                        <div className="text-[8px] font-black text-blue-600 underline uppercase tracking-widest">Global Report &rarr;</div>
                    </div>
                    <div className="p-5 space-y-3">
                        {[
                            { n: "Alexander Pierce", s: "Completed", sc: "92" },
                            { n: "Marcus Wright", s: "Ongoing", sc: "--" },
                            { n: "David Eliah", s: "Pending", sc: "--" }
                        ].map((c, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-50 rounded-[1.5rem] hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 font-black">{c.n[0]}</div>
                                    <div>
                                        <div className="text-[11px] font-black text-slate-900 leading-none mb-1">{c.n}</div>
                                        <div className="text-[8px] text-slate-400 uppercase tracking-widest">auth-v7-x{i}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${c.s === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {c.s}
                                    </div>
                                    <div className="text-[12px] font-black text-indigo-600 w-10 text-right">{c.sc} <span className="text-[7px] text-slate-300">PTS</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="col-span-4 space-y-8">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 h-64 flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Coordination Window</h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <div className="h-2 w-24 bg-slate-200 rounded-full" />
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <div className="h-2 w-24 bg-slate-200 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 text-[8px] font-black uppercase tracking-widest text-center">Monitoring Active</div>
                </div>
                <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl h-48 flex flex-col justify-center gap-4">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Neural Analytics Node</div>
                    <div className="h-12 w-full bg-blue-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center shadow-lg shadow-blue-500/20">View Detail Matrix</div>
                </div>
            </div>
        </div>
    </div>
);

const MiniArena = () => (
    <div className="flex-grow bg-slate-900 h-full flex flex-col items-center justify-center relative p-16">
        <div className="absolute top-8 left-10 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">AI Arena Node: #X-90-TR</div>
        </div>
        <div className="absolute top-8 right-10 flex items-center gap-4">
            <div className="h-10 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-black text-white tracking-widest">42:12</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-white/20"><Monitor className="w-6 h-6 text-white" /></div>
        </div>

        <div className="relative w-64 h-64 mb-16">
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-x-0 -bottom-16 h-4 bg-blue-500 blur-[80px] rounded-full"
            />
            <div className="absolute inset-4 bg-slate-800 rounded-full border-[8px] border-white/5 flex flex-col items-center justify-center overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative">
                <div className="absolute inset-4 border border-blue-500/20 rounded-full animate-spin-slow" />
                <div className="w-full h-full bg-[#1e293b] flex flex-col items-center justify-center gap-6">
                    <Cpu className="w-28 h-28 text-blue-500/10" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Neural Link Engaged</div>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex gap-3 items-end h-16 mb-16">
            {[0.4, 0.9, 0.5, 0.8, 0.3, 0.9, 0.6, 0.4, 0.7, 0.9, 0.5, 0.8, 0.4, 0.7, 0.2].map((h, i) => (
                <motion.div
                    key={i}
                    animate={{ height: [`${h * 30}%`, `${h * 100}%`, `${h * 30}%`] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
                    className={`w-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] ${h > 0.8 ? 'bg-gradient-to-t from-blue-600 to-white' : 'bg-white/20'}`}
                />
            ))}
        </div>

        <div className="flex items-center gap-6 bg-[#0F172A]/80 p-6 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-2xl max-w-xl">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border-2 border-white/10 shrink-0"><Mic2 className="w-8 h-8" /></div>
            <div className="space-y-1.5">
                <div className="text-sm font-black text-white uppercase tracking-widest leading-none">AI Agent Active</div>
                <div className="text-[11px] text-white/50 font-medium leading-relaxed">"Based on your architecture choice, how would you ensure data consistency across the sharded nodes under high write pressure?"</div>
            </div>
        </div>
    </div>
);

const MiniProfile = () => (
    <div className="flex-grow bg-[#FDFDFE] flex flex-col h-full overflow-hidden">
        <div className="m-10 rounded-[3.5rem] bg-slate-900 p-12 h-48 shadow-2xl relative overflow-hidden flex flex-col justify-end group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-bl-full animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent z-0" />
            <div className="relative z-10 space-y-3">
                <div className="px-4 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block">Security Dossier: V9-SYNC</div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Personnel Initialization<span className="text-blue-600">.</span></h2>
            </div>
        </div>
        <div className="px-10 pb-10 grid grid-cols-12 gap-10 flex-grow">
            <div className="col-span-8 space-y-10">
                <div className="p-10 bg-white rounded-[3.5rem] border border-gray-100 shadow-sm space-y-10">
                    <div className="flex items-center gap-5 border-b pb-8">
                        <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner"><UserIcon className="w-8 h-8" /></div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Acme Corporation Hub</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Primary Identity Node</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                        {[
                            { l: "Organization Name", p: "Acme Corporation" },
                            { l: "Primary Jurisdiction", p: "North America (US-WEST)" },
                            { l: "Communication Protocol", p: "ops@acme.systems" },
                            { l: "Technical Tier", p: "Enterprise V9" }
                        ].map((f, i) => (
                            <div key={i} className="space-y-3">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.l}</div>
                                <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 flex items-center text-[11px] font-bold text-slate-900 shadow-inner">{f.p}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="col-span-4 p-10 bg-white rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col space-y-10">
                <div className="flex items-center gap-4 border-b pb-6">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm"><ShieldCheck className="w-6 h-6" /></div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Verification Node</h4>
                </div>
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase text-slate-400">SYNC STRENGTH</span>
                            <span className="text-xl font-black text-blue-600">85%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden shadow-inner p-0.5">
                            <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 rounded-full shadow-lg" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { l: "Domain Authority", s: true },
                            { l: "Security Handshake", s: true },
                            { l: "Team Initialization", s: false }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-900">{item.l}</div>
                                {item.s ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 border-2 border-slate-200 rounded-full" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- End Miniature UI Components ---

export default function IntroPage() {
    const router = useRouter();
    const [activeRole, setActiveRole] = useState<'COMPANY' | 'CANDIDATE'>('COMPANY');
    const [activeStep, setActiveStep] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const companyPages = [
        {
            title: "Command Center",
            page: "/dashboard",
            description: "High-level operational overview. Monitor active deployment pipelines, real-time KPI metrics, and system status across all hiring divisions.",
            actions: ["Initiate new Job Flow", "Monitor global efficiency (+28%)", "Track total candidate authorizations"],
            icon: <LayoutDashboard className="w-4 h-4" />,
            visual: <div className="flex h-full w-full"><MiniSidebar activePage="/dashboard" /><MiniDashboard userRole="COMPANY" /></div>
        },
        {
            title: "Pipeline Manager",
            page: "/[organization]/[jobId]",
            description: "Granular control over specific roles. Track individual candidate progression from 'Authorization' to 'Analysis Completion' in real-time.",
            actions: ["Invite new personnel into flow", "Configure UTC interview windows", "Monitor live assessment sessions"],
            icon: <Users className="w-4 h-4" />,
            visual: <div className="flex h-full w-full"><MiniSidebar activePage="/[organization]/[jobId]" /><MiniJobView /></div>
        },
        {
            title: "Dossier Analysis",
            page: "/[jobId]/responses",
            description: "Detailed AI-generated technical reports for every candidate. Review full transcripts, technical proficiency scores, and behavioral analysis.",
            actions: ["Review technical proficiency scores", "Audit session integrity matrix", "Export executive summaries (PDF)"],
            icon: <FileText className="w-4 h-4" />,
            visual: (
                <div className="flex h-full w-full">
                    <MiniSidebar activePage="/[jobId]/responses" />
                    <div className="flex-grow bg-[#F8F9FA] p-12 space-y-12 overflow-hidden">
                        <div className="p-10 bg-white rounded-[4rem] shadow-2xl space-y-10 relative border border-slate-100">
                            <div className="flex justify-between border-b pb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-none uppercase">Alexander Pierce</h3>
                                    <p className="text-[11px] text-blue-600 font-black uppercase tracking-[0.2em] mt-3 italic">Technical Alpha Node #420</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-5xl font-black text-indigo-600">92<span className="text-xl ml-1 text-slate-300">PTS</span></div>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Compatibility</div>
                                </div>
                            </div>
                            <div className="space-y-5">
                                {[
                                    { q: "Tell me about Microservices experience?", v: 95 },
                                    { q: "Handling state in complex React apps?", v: 88 }
                                ].map((i, idx) => (
                                    <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${idx === 0 ? 'bg-blue-600' : 'bg-indigo-600'}`}>{idx === 0 ? 'Q' : 'A'}</div>
                                        <div className="flex-grow space-y-2">
                                            <div className="h-2 w-full bg-slate-200 rounded-full" />
                                            <div className="h-1.5 w-4/5 bg-slate-200/50 rounded-full" />
                                        </div>
                                        <div className="text-sm font-black text-slate-900">{i.v}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Organizational Profile",
            page: "/profile",
            description: "Manage your company's identity and operational credentials. Ensure all sync nodes are verified for platform-wide propagation.",
            actions: ["Update organization identity", "Verify technical operational tier", "Synchronize communication protocols"],
            icon: <UserIcon className="w-4 h-4" />,
            visual: <div className="flex h-full w-full shadow-2xl"><MiniSidebar activePage="/profile" /><MiniProfile /></div>
        },
        {
            title: "Billing Terminal",
            page: "/billing",
            description: "Integrated financial node. Manage recruitment tier access, track usage quotas, and synchronize billing cycles.",
            actions: ["Monitor active tier quota", "Synchronize billing cycles", "Audit recruitment operational costs"],
            icon: <CreditCard className="w-4 h-4" />,
            visual: (
                <div className="flex h-full w-full">
                    <MiniSidebar activePage="/billing" />
                    <div className="flex-grow bg-[#FDFDFE] p-16 space-y-12">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Billing Matrix</h2>
                            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase border border-blue-100">PRO PLAN ACTIVE</div>
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2 p-12 bg-white rounded-[4rem] shadow-2xl border border-slate-50 space-y-10">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-black text-slate-900 uppercase">Current Usage Node</h4>
                                    <span className="text-[10px] font-bold text-slate-400">RESET IN 12 DAYS</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[11px] font-black uppercase"><span>Job Postings</span> <span>8 / 20</span></div>
                                        <div className="h-3 w-full bg-slate-50 border rounded-full overflow-hidden p-0.5"><div className="h-full w-[40%] bg-blue-600 rounded-full" /></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[11px] font-black uppercase"><span>AI Minutes</span> <span>420 / 1000</span></div>
                                        <div className="h-3 w-full bg-slate-50 border rounded-full overflow-hidden p-0.5"><div className="h-full w-[42%] bg-indigo-600 rounded-full" /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 bg-slate-900 rounded-[4rem] text-white flex flex-col justify-between shadow-2xl">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Next Charge</h4>
                                    <div className="text-4xl font-black">$49<span className="text-lg opacity-40 ml-1">/mo</span></div>
                                </div>
                                <div className="h-12 w-full bg-blue-600 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-[10px]">Manage Plan</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const candidatePages = [
        {
            title: "Candidate Profile",
            page: "/profile",
            description: "Personnel initialization protocol. Securely upload credentials and technical bio to prime the AI core for your unique background.",
            actions: ["Upload legal credentials", "Define technical operational bio", "Synchronize experience matrix"],
            icon: <UserIcon className="w-4 h-4" />,
            visual: <div className="flex h-full w-full shadow-2xl"><MiniSidebar activePage="/profile" /><MiniProfile /></div>
        },
        {
            title: "Personnel Terminal",
            page: "/dashboard",
            description: "Centralized hub for all authorized assessments. Track coordination windows (UTC) and enter the Arena for active cycles.",
            actions: ["Monitor assessment authorizations", "Track schedule windows (UTC)", "Access real-time proctoring status"],
            icon: <LayoutDashboard className="w-4 h-4" />,
            visual: <div className="flex h-full w-full"><MiniSidebar activePage="/dashboard" /><MiniDashboard userRole="CANDIDATE" /></div>
        },
        {
            title: "Neural Arena",
            page: "/interview/[token]",
            description: "The primary assessment lab where you interact with the AI core via voice synthesis. High-fidelity proctoring is standard practice.",
            actions: ["Engage with AI Voice node", "Follow Neural assessment protocol", "Maintain environmental integrity"],
            icon: <Mic2 className="w-4 h-4" />,
            visual: <MiniArena />
        }
    ];

    const steps = activeRole === 'COMPANY' ? companyPages : candidatePages;
    const currentStep = steps[activeStep] || steps[0];

    useEffect(() => {
        // Reset step if role changes
        setActiveStep(0);
    }, [activeRole]);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-inter selection:bg-blue-100 selection:text-blue-900 flex flex-col overflow-x-hidden">
            {/* --- TOP SECTION: Header & Scrollable Nav --- */}
            <section className="bg-slate-900 text-white shrink-0">
                <div className="max-w-[1600px] mx-auto px-10 py-10 lg:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-10 overflow-hidden">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"><Cpu className="w-5 h-5" /></div>
                                    <h1 className="text-xl font-black tracking-tight uppercase italic">IntervAI Operational Manual</h1>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Core Interface Navigation Matrix</p>
                            </div>

                            <Button
                                onClick={() => router.push('/dashboard')}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/10 h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group transition-all"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Dashboard
                            </Button>
                        </div>

                        <div className="inline-flex p-1.5 bg-white/5 rounded-[2rem] border border-white/10 shrink-0 backdrop-blur-xl">
                            <button
                                onClick={() => setActiveRole('COMPANY')}
                                className={`px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] ${activeRole === 'COMPANY' ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
                            >
                                Organization Flow
                            </button>
                            <button
                                onClick={() => setActiveRole('CANDIDATE')}
                                className={`px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] ${activeRole === 'CANDIDATE' ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
                            >
                                Personnel Flow
                            </button>
                        </div>
                    </div>

                    {/* Horizontally Scrollable Section List */}
                    <div className="relative group/scroll pb-4">
                        <div
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth p-2 -m-2"
                        >
                            {steps.map((step, i) => (
                                <motion.button
                                    key={step.title}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveStep(i)}
                                    className={`shrink-0 flex items-center gap-5 px-10 py-6 rounded-[2.5rem] border transition-all duration-500 ${activeStep === i ? 'bg-blue-600 border-blue-500 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                                >
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${activeStep === i ? 'bg-white/20' : 'bg-white/5'}`}>
                                        {step.icon}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">{step.title}</h4>
                                        <p className="text-[8px] font-bold uppercase opacity-40 mt-0.5">{step.page}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MIDDLE SECTION: Laptop View Image --- */}
            <section className="bg-[#F8F9FA] px-10 py-16 flex-grow flex items-center justify-center overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-900 via-slate-900/5 to-transparent pointer-events-none" />
                <div className="w-full max-w-[1400px] aspect-[16/10] bg-slate-900 rounded-[4rem] p-1.5 shadow-[0_100px_200px_-50px_rgba(0,0,0,0.3)] border-[18px] border-slate-900 relative group/laptop">
                    {/* Browser Header / Laptop Frame Accent */}
                    <div className="absolute top-0 left-0 right-0 h-14 flex items-center px-12 bg-slate-900 shrink-0 select-none">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                        </div>
                        <div className="mx-auto text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] font-mono opacity-50 italic">intervai.arena.node{currentStep?.page?.toLowerCase()}</div>
                    </div>

                    <div className="w-full h-full pt-14 rounded-[3rem] bg-white overflow-hidden relative shadow-inner">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeRole + activeStep}
                                initial={{ opacity: 0, scale: 0.99, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 1.01, filter: 'blur(10px)' }}
                                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                                className="w-full h-full"
                            >
                                {currentStep?.visual}
                            </motion.div>
                        </AnimatePresence>
                        {/* Interactive Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* --- BOTTOM SECTION: Info & Usage Guide --- */}
            <section className="bg-white border-t border-slate-100 px-10 py-20 lg:py-32 shrink-0">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32">
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Functional Node Analysis</span>
                            </div>
                            <h3 className="text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">{currentStep?.title}</h3>
                        </div>
                        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 p-6 opacity-5"><Globe className="w-16 h-16" /></div>
                            <p className="text-lg font-medium text-slate-500 leading-relaxed italic relative z-10">
                                "{currentStep?.description}"
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center text-white"><Settings className="w-5 h-5 animate-spin-slow" /></div>
                                <h5 className="text-[12px] font-black uppercase tracking-[0.2em] italic">Available Interactions</h5>
                            </div>
                            <div className="space-y-5">
                                {currentStep?.actions?.map((action, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] group hover:bg-slate-900 transition-all duration-500 border border-transparent hover:border-slate-800 cursor-default"
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                                        <span className="text-xs font-black text-slate-600 group-hover:text-white uppercase tracking-tight">{action}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-lg flex items-center justify-center text-indigo-600"><ShieldCheck className="w-5 h-5" /></div>
                                <h5 className="text-[12px] font-black uppercase tracking-[0.2em] italic">Ecosystem Handshake</h5>
                            </div>
                            <div className="p-10 bg-[#0A0A0B] rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[60px]" />
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><BrainCircuit className="w-40 h-40" /></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 inline-block pb-2 border-b border-blue-500/20">Operational Maturity Tier+</p>
                                    <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                        This node is fully audited and synchronized with the core Entrext-Maja V9 engine. All data propagations follow the standard zero-latency protocol.
                                    </p>
                                    <Button
                                        onClick={() => router.push(currentStep?.page?.replace(/\[.*?\]/g, 'dashboard') || '/dashboard')}
                                        className="mt-10 w-full h-16 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:text-white transition-all shadow-white/5 active:scale-95"
                                    >
                                        Initialize Protocol
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-10 border-t border-slate-50 bg-[#FDFDFE] shrink-0">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Cpu className="w-6 h-6" /></div>
                        <span className="text-lg font-black uppercase tracking-tighter">IntervAI</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 italic uppercase tracking-[0.5em]">© 2026 Entrext-Systems High-Fidelity Infrastructure. Global Node V9.0 Active.</p>
                    <div className="flex gap-10">
                        {['Security', 'Verification', 'Dossier'].map(item => (
                            <button key={item} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">{item}</button>
                        ))}
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
