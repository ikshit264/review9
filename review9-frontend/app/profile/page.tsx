'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { LoadingButton } from '@/components/UI';
import { authApi, billingApi } from '@/services/api';
import { getUserTimezone } from '@/lib/timezone';
import { UserRole, SubscriptionPlan } from '@/types';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { useToast } from '@/hooks/useToast';
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

export default function ProfilePage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const toast = useToast();
   const { user, updateUser } = useStore();
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [detecting, setDetecting] = useState(false);

   const [formData, setFormData] = useState({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || '',
      timezone: user?.timezone || getUserTimezone(),
      resumeUrl: user?.resumeUrl || '',
      skills: user?.skills || [],
      workExperience: user?.workExperience || [],
   });

   const isMandatoryMode = searchParams.get('mandatory') === 'true' || !user?.isProfileComplete;

   useEffect(() => {
      if (!user) {
         router.push('/login');
      }
   }, [user, router]);

   if (!user) return null;

   const handleAutoDetect = async () => {
      setDetecting(true);
      try {
         const data = await authApi.detectTimezone();
         setFormData(prev => ({
            ...prev,
            timezone: data.timezone,
            location: data.location
         }));
         toast.success("Location detected!");
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
               {/* Header */}
               <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div className="space-y-1">
                     <div className="flex items-center space-x-3">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest">Active Profile</span>
                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role} Portal</span>
                     </div>
                     <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                        {isMandatoryMode ? 'Initialize Experience' : 'Your Workspace'}
                        <span className="text-blue-600">.</span>
                     </h1>
                  </div>
                  <div className="flex items-center gap-4">
                     <NotificationDropdown />
                     <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold">
                        {user.name[0]}
                     </div>
                  </div>
               </header>

               <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  {/* Left Column: Forms */}
                  <div className="xl:col-span-2 space-y-12">
                     {/* Personal Details */}
                     <section className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                           <BrainCircuit className="w-32 h-32" />
                        </div>
                        <div className="flex items-center space-x-3 mb-10">
                           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                              <UserIcon className="w-5 h-5" />
                           </div>
                           <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Core Identity</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2 group">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Full Name</label>
                              <div className="relative">
                                 <input
                                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2 group">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Contact Phone</label>
                              <input
                                 className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-sm"
                                 value={formData.phone}
                                 onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                 placeholder="+1 (555) 000-0000"
                              />
                           </div>
                           <div className="space-y-2 group">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Base Location</label>
                              <div className="relative">
                                 <input
                                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-sm"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Silicon Valley, CA"
                                 />
                                 <button
                                    onClick={handleAutoDetect}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 p-1 transition-colors"
                                    title="Auto-detect location"
                                 >
                                    <Globe className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                           <div className="space-y-2 group">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Operational Timezone</label>
                              <select
                                 className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-sm appearance-none"
                                 value={formData.timezone}
                                 onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                              >
                                 <option value={formData.timezone}>{formData.timezone}</option>
                                 <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                 <option value="America/New_York">America/New_York (EST)</option>
                                 <option value="Europe/London">Europe/London (GMT)</option>
                                 <option value="UTC">UTC</option>
                              </select>
                           </div>
                        </div>
                     </section>

                     {/* Professional Details (Candidate Only) */}
                     {user.role === UserRole.CANDIDATE && (
                        <section className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
                           <div className="flex items-center space-x-3 mb-10">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                                 <FileText className="w-5 h-5" />
                              </div>
                              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Professional Dossier</h2>
                           </div>

                           <div className="space-y-8">
                              <div className="space-y-2 group">
                                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Executive Bio</label>
                                 <textarea
                                    className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all h-40 text-sm resize-none"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Brief summary of your professional expertise..."
                                 />
                              </div>
                              <div className="space-y-2 group">
                                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Resume Ledger (Public URL)</label>
                                 <div className="relative">
                                    <input
                                       className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-sm"
                                       value={formData.resumeUrl}
                                       onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                                       placeholder="https://drive.google.com/..."
                                    />
                                 </div>
                              </div>
                           </div>
                        </section>
                     )}

                     {/* Actions */}
                     <div className="flex items-center justify-between gap-6">
                        <LoadingButton
                           onClick={handleSave}
                           loading={saving}
                           className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all"
                        >
                           {isMandatoryMode ? 'Initialize Experience' : 'Synchronize Profile'}
                        </LoadingButton>
                        {error && (
                           <div className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                              {error}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Right Column: Experience/Plans */}
                  <div className="space-y-12">
                     {user.role === UserRole.COMPANY ? (
                        <section className="space-y-6">
                           <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100">
                                 <Sparkles className="w-4 h-4" />
                              </div>
                              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Subscription Tier</h2>
                           </div>

                           <div className="space-y-4">
                              {plans.map((plan) => {
                                 const isCurrent = user.plan === plan.id;
                                 return (
                                    <div
                                       key={plan.id}
                                       className={cn(
                                          "p-6 rounded-[2rem] border transition-all relative overflow-hidden group cursor-pointer",
                                          isCurrent
                                             ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200"
                                             : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"
                                       )}
                                       onClick={() => handleUpdatePlan(plan.id)}
                                    >
                                       {isCurrent && (
                                          <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                                             <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                          </div>
                                       )}

                                       <div className="flex items-center space-x-4 mb-4">
                                          <div className={cn(
                                             "w-10 h-10 rounded-xl flex items-center justify-center border",
                                             isCurrent ? "bg-white/10 border-white/10 text-white" : `${plan.bg} ${plan.color} border-current/10`
                                          )}>
                                             <plan.icon className="w-5 h-5" />
                                          </div>
                                          <div>
                                             <h3 className="font-black text-xs uppercase tracking-widest">{plan.name}</h3>
                                             <p className={cn("text-[10px] font-bold", isCurrent ? "text-slate-400" : "text-gray-400")}>{plan.price}</p>
                                          </div>
                                       </div>

                                       <ul className="space-y-2">
                                          {plan.features.map((f, i) => (
                                             <li key={i} className="flex items-center text-[9px] font-bold uppercase tracking-wider">
                                                <div className={cn("w-1 h-1 rounded-full mr-2", isCurrent ? "bg-blue-400" : "bg-gray-300")}></div>
                                                {f}
                                             </li>
                                          ))}
                                       </ul>

                                       {!isCurrent && (
                                          <div className="mt-6 flex justify-end">
                                             <button className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 group-hover:underline">Upgrade Now</button>
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>

                           <div className="p-6 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 mt-8">
                              <div className="flex items-start space-x-4">
                                 <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                                 <div>
                                    <h4 className="text-[10px] font-black uppercase text-indigo-900 tracking-wider mb-1">Secure Billing</h4>
                                    <p className="text-[9px] text-indigo-600 font-bold leading-relaxed">Payments are processed securely via Stripe. Invoices will be sent to {user.email}.</p>
                                 </div>
                              </div>
                           </div>
                        </section>
                     ) : (
                        <section className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
                           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[60px]"></div>
                           <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6 relative z-10">Verification Status</h2>

                           <div className="space-y-6 relative z-10">
                              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Email Verified</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{user.email}</p>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Profile Strength</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{user.isProfileComplete ? 'Maximum Efficiency' : 'Baseline'}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/5 relative z-10 group cursor-pointer hover:bg-white/10 transition-all">
                              <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-wider mb-2">Pro Tip</h4>
                              <p className="text-[10px] text-gray-300 font-medium leading-relaxed italic">"Keep your bio updated. Our AI uses this to tailor technical questions to your expertise levels."</p>
                           </div>
                        </section>
                     )}
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
