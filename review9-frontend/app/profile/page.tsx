'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { LoadingButton } from '@/components/UI';
import { authApi, billingApi } from '@/services/api';
import { UserRole, SubscriptionPlan } from '@/types';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { useToast } from '@/hooks/useToast';
import { ResumeUpload } from '@/components/upload/ResumeUpload';
import {
   User as UserIcon,
   MapPin,
   Globe,
   Phone,
   FileText,
   Sparkles,
   CheckCircle2,
   Crown,
   Rocket,
   Zap,
   ShieldCheck,
   BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { getAllTimezones, TimezoneInfo, detectUserTimezone } from '@/lib/timezones';

function ProfileContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const toast = useToast();
   const { user, updateUser } = useStore();
   const companyId = searchParams.get('companyId') || searchParams.get('companyid') || undefined;
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [detecting, setDetecting] = useState(false);

   const [formData, setFormData] = useState({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'UTC',
      resumeUrl: user?.resumeUrl || '',
      skills: user?.skills || [],
      workExperience: user?.workExperience || [],
   });

   const [timezones, setTimezones] = useState<TimezoneInfo[]>([]);

   useEffect(() => {
      setTimezones(getAllTimezones());
   }, []);

   const isMandatoryMode = searchParams.get('mandatory') === 'true' || !user?.isProfileComplete;

   if (!user) return null;

   const handleAutoDetect = async () => {
      setDetecting(true);
      try {
         // Use local JSON-based detection instead of API
         const data = detectUserTimezone();
         setFormData(prev => ({
            ...prev,
            timezone: data.timezone
         }));
         toast.success("Timezone detected locally!");
      } catch (err) {
         toast.error("Detection failed");
      } finally {
         setDetecting(false);
      }
   };

   const handleSave = async () => {
      if (!formData.name || !formData.phone || !formData.timezone || !formData.location) {
         setError('Please fill all mandatory fields (Name, Phone, Timezone, Location)');
         return;
      }

      setSaving(true);
      setError(null);
      try {
         const dataToSend = {
            ...formData,
            isProfileComplete: true
         };
         const updatedUser = await authApi.updateProfile(dataToSend);
         updateUser(updatedUser);
         toast.success("Profile synchronized!");
         if (isMandatoryMode) {
            router.push('/dashboard');
         }
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to save profile');
         toast.error("Update failed");
      } finally {
         setSaving(false);
      }
   };

   const handleUpdatePlan = async (plan: SubscriptionPlan) => {
      if (plan === user.plan) return;

      try {
         toast.info(`Requesting ${plan} upgrade...`);

         const result = await billingApi.subscribe(plan);

         updateUser({ ...user, plan });
         toast.success(result.message || `Upgraded to ${plan}!`);
      } catch (err: any) {
         toast.error(err.message || "Upgrade failed. You might need to contact support.");
      }
   };

   const plans = [
      {
         id: SubscriptionPlan.FREE,
         name: 'Free Starter',
         price: '$0',
         icon: Rocket,
         color: 'text-slate-400',
         bg: 'bg-slate-50',
         features: ['30 Candidates / Job', 'Basic AI Interviews', 'Standard Analytics']
      },
      {
         id: SubscriptionPlan.PRO,
         name: 'Pro Professional',
         price: '$49/mo',
         icon: Zap,
         color: 'text-blue-600',
         bg: 'bg-blue-50',
         features: ['Unlimited Candidates', 'Interactive AI', 'Advanced Proctors', 'Priority Support']
      },
      {
         id: SubscriptionPlan.ULTRA,
         name: 'Ultra Enterprise',
         price: '$99/mo',
         icon: Crown,
         color: 'text-indigo-600',
         bg: 'bg-indigo-50',
         features: ['Full Suite Access', 'Screen Recording', 'Custom Branding', 'dedicated AI nodes']
      },
   ];

   return (
      <div className="min-h-screen bg-[#FDFDFE] text-slate-900 selection:bg-blue-100">
         <div className="flex relative z-10">
            <Sidebar />

            <main className="flex-grow p-4 lg:p-12 max-w-[1400px] mx-auto w-full">
               {/* Header Area with Visual Flair */}
               <header className="relative mb-16 rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-10 lg:p-14 group">
                  <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-110">
                     <img
                        src="/profile_page_accent.png"
                        alt="Profile Background"
                        className="w-full h-full object-cover"
                     />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                     <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                           <div className="px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                              {user.role} Authority
                           </div>
                           <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Portal</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white leading-none">
                           {isMandatoryMode ? 'Initialize' : 'Manage'} <br />
                           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                              Your Identity.
                           </span>
                        </h1>
                     </div>

                     <div className="flex items-center gap-6">
                        <NotificationDropdown />
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-2xl font-black shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-transform hover:scale-110 hover:rotate-3">
                           {user.name[0]}
                        </div>
                     </div>
                  </div>
               </header>

               <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  <div className="xl:col-span-2 space-y-12 transition-all duration-700 delay-100">
                     {/* Identity Section */}
                     <section className="relative p-10 lg:p-14 rounded-[3.5rem] bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-blue-600 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12 translate-x-1/4 -translate-y-1/4">
                           <UserIcon className="w-64 h-64" />
                        </div>

                        <div className="flex items-center space-x-4 mb-14 relative z-10">
                           <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm transition-transform group-hover:scale-110">
                              <UserIcon className="w-7 h-7" />
                           </div>
                           <div>
                              <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-900 mb-1">Core Identity</h2>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel & Authorization Details</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                           <div className="space-y-4 group/input">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em] group-focus-within/input:text-blue-600 transition-colors">Legal Full Name</label>
                              <div className="relative">
                                 <input
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-300"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Alexander Pierce"
                                 />
                                 <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
                              </div>
                           </div>

                           <div className="space-y-4 group/input">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em] group-focus-within/input:text-blue-600 transition-colors">Primary Contact</label>
                              <div className="relative">
                                 <input
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-300"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                 />
                                 <Phone className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                              </div>
                           </div>

                           <div className="space-y-4 group/input">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em] group-focus-within/input:text-blue-600 transition-colors">Current Base</label>
                              <div className="relative">
                                 <input
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-300"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Silicon Valley, CA"
                                 />
                                 <button
                                    onClick={handleAutoDetect}
                                    disabled={detecting}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 p-2 hover:bg-white rounded-xl transition-all active:scale-90"
                                    title="Auto-detect location"
                                 >
                                    <Globe className={cn("w-4 h-4", detecting && "animate-spin")} />
                                 </button>
                                 <MapPin className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity" />
                              </div>
                           </div>

                           <div className="space-y-4 group/input">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em] group-focus-within/input:text-blue-600 transition-colors">Operational Timezone</label>
                              <div className="relative">
                                 <select
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold transition-all text-sm appearance-none text-slate-900 cursor-pointer"
                                    value={formData.timezone}
                                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                 >
                                    {timezones.map(tz => (
                                       <option key={tz.value} value={tz.value}>{tz.label}</option>
                                    ))}
                                 </select>
                                 <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </section>

                     {/* Professional Dossier for Candidates */}
                     {user.role === UserRole.CANDIDATE && (
                        <section className="relative p-10 lg:p-14 rounded-[3.5rem] bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] overflow-hidden group transition-all hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.04)]">
                           <div className="flex items-center space-x-4 mb-14">
                              <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm transition-transform group-hover:scale-110">
                                 <FileText className="w-7 h-7" />
                              </div>
                              <div>
                                 <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-900 mb-1">Professional Dossier</h2>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience & Qualification Repository</p>
                              </div>
                           </div>

                           <div className="space-y-12">
                              <div className="space-y-4 group/input">
                                 <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em] group-focus-within/input:text-indigo-600 transition-colors">Executive Summary (Bio)</label>
                                 <textarea
                                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none font-bold transition-all h-48 text-sm resize-none text-slate-900 leading-relaxed placeholder:text-slate-300"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Synthesize your professional journey and key achievements..."
                                 />
                              </div>

                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Validated Credentials (Resume)</label>
                                 <div className="bg-slate-50 rounded-[2rem] p-2 border border-slate-100 overflow-hidden">
                                    <ResumeUpload
                                       currentResumeUrl={formData.resumeUrl}
                                       onUploadSuccess={(resumeUrl) => {
                                          setFormData({ ...formData, resumeUrl });
                                          toast.success('Resume synchronized with cloud vault');
                                       }}
                                    />
                                 </div>
                              </div>
                           </div>
                        </section>
                     )}

                     {/* Global Action Sync */}
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-8 p-10 lg:p-14 bg-gradient-to-br from-slate-900 to-black rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="space-y-2 relative z-10 text-center sm:text-left">
                           <h3 className="text-white font-black text-xl tracking-tight leading-none">Ready to Synchronize?</h3>
                           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Changes will be propagated across the Entrext ecosystem.</p>
                        </div>

                        <div className="flex items-center gap-6 relative z-10">
                           {error && (
                              <div className="text-rose-500 text-[10px] font-black uppercase tracking-widest animate-[pulse_2s_infinite] max-w-[200px] text-right">
                                 {error}
                              </div>
                           )}
                           <LoadingButton
                              onClick={handleSave}
                              loading={saving}
                              className="px-12 py-6 bg-white hover:bg-white-50 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center gap-3 overflow-hidden group/btn"
                           >
                              <span className="relative z-10 text-black group-hover/btn:text-white">{isMandatoryMode ? 'Initialize Experience' : 'Sync Profile'}</span>
                              <Rocket className="w-4 h-4 text-blue-600 group-hover/btn:text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                           </LoadingButton>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Maturity Sidebar */}
                  <div className="space-y-8 animate-in fade-in slide-in-from-right duration-1000">
                     {/* Profile Maturity Section */}
                     <section className="p-8 lg:p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full animate-pulse"></div>

                        <div className="flex items-center space-x-3 mb-8">
                           <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                              <ShieldCheck className="w-5 h-5" />
                           </div>
                           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Account Maturity</h3>
                        </div>

                        <div className="space-y-8">
                           {/* Maturity Meter */}
                           <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strength Indicator</span>
                                 <span className="text-2xl font-black text-white">{user.isProfileComplete ? '100' : '45'}<span className="text-xs text-slate-500 ml-1">%</span></span>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                                 <div
                                    className={cn(
                                       "h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                                       user.isProfileComplete ? "w-full" : "w-[45%]"
                                    )}
                                 />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10 group/item">
                                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                                    <CheckCircle2 className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Email Verified</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase">{user.email.split('@')[0]}@...</p>
                                 </div>
                              </div>

                              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10 group/item">
                                 <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center border transition-all group-hover/item:scale-110",
                                    user.isProfileComplete ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                 )}>
                                    {user.isProfileComplete ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Profile Data</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase">{user.isProfileComplete ? 'Fully Validated' : 'Action Required'}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group hover:from-white/10 transition-all cursor-default">
                           <div className="flex items-center space-x-2 mb-3">
                              <BrainCircuit className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">AI Intelligence Insight</span>
                           </div>
                           <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                              "{user.role === UserRole.CANDIDATE
                                 ? "Complete your bio for better AI question matching during interviews."
                                 : "Add your location and timezone to optimize candidate interaction windows."}"
                           </p>
                        </div>
                     </section>

                     {/* Security/Support Mini-Card */}
                     <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 group transition-all hover:bg-indigo-100/50">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Crown className="w-6 h-6 text-indigo-600" />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-900 leading-none mb-1">Elite Support</h4>
                              <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest leading-none">24/7 Concierge Access</p>
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

export default function ProfilePage() {
   return (
      <Suspense fallback={
         <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
         </div>
      }>
         <ProfileContent />
      </Suspense>
   );
}
