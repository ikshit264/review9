'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button, Card, LoadingButton } from '@/components/UI';
import { authApi } from '@/services/api';
import { getUserTimezone, getTimezoneLabel } from '@/lib/timezone';
import { UserRole } from '@/types';

export default function ProfilePage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { user, updateUser, token } = useStore();
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
      if (!token) {
         router.push('/login');
      }
   }, [token, router]);

   const handleAutoDetect = async () => {
      setDetecting(true);
      try {
         const data = await authApi.detectTimezone();
         setFormData(prev => ({
            ...prev,
            timezone: data.timezone,
            location: data.location
         }));
      } catch (err) {
         console.error('Detection failed', err);
      } finally {
         setDetecting(false);
      }
   };


   const handleSave = async () => {
      if (!formData.name || !formData.phone || !formData.timezone || !formData.location) {
         setError('Please fill all mandatory fields (Name, Phone, Timezone, Location)');
         return;
      }

      console.log('[Profile] Saving profile...');
      console.log('[Profile] Form data:', formData);
      console.log('[Profile] Current user isProfileComplete:', user?.isProfileComplete);

      setSaving(true);
      setError(null);
      try {
         const dataToSend = {
            ...formData,
            isProfileComplete: true
         };
         console.log('[Profile] Sending to API:', dataToSend);

         const updatedUser = await authApi.updateProfile(dataToSend);
         console.log('[Profile] Received from API:', updatedUser);
         console.log('[Profile] API returned isProfileComplete:', updatedUser.isProfileComplete);

         updateUser(updatedUser);
         console.log('[Profile] Updated store with user data');

         // Verify store was updated
         setTimeout(() => {
            console.log('[Profile] Store user after update:', user);
         }, 100);

         router.push('/dashboard');
      } catch (err) {
         console.error('[Profile] Save failed:', err);
         setError(err instanceof Error ? err.message : 'Failed to save profile');
      } finally {
         setSaving(false);
      }
   };

   if (!user) return null;

   return (
      <div className="min-h-screen bg-[#F0F2F5] py-12 px-4">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 animate-in fade-in slide-in-from-left-2 duration-700">
               <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tighter">
                  {isMandatoryMode ? 'Complete Your Profile' : 'Professional Profile'}
               </h1>
               <p className="text-gray-500 font-medium text-lg">
                  {isMandatoryMode
                     ? "We need a few details to get you started with HireAI."
                     : "Manage your personal and professional information."}
               </p>
            </div>

            <Card className="p-10 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[40px] bg-white animate-in fade-in slide-in-from-right-4 duration-1000">
               <div className="space-y-10">
                  {/* Section: Basic Info */}
                  <div className="relative">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-2xl bg-blue-50 flex items-center justify-center mr-3 shadow-sm border border-blue-100">01</span>
                        Identity
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                           <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Full Name *</label>
                           <input
                              className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-gray-900 placeholder:text-gray-300"
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              placeholder="John Doe"
                           />
                        </div>
                        <div className="space-y-2 group">
                           <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Phone Number *</label>
                           <input
                              className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-gray-900 placeholder:text-gray-300"
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+1 234 567 890"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Section: Location & Time */}
                  <div className="relative">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-2xl bg-blue-50 flex items-center justify-center mr-3 shadow-sm border border-blue-100">02</span>
                        Regional Sync
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                           <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Location *</label>
                           <input
                              className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-gray-900 placeholder:text-gray-300"
                              value={formData.location}
                              onChange={e => setFormData({ ...formData, location: e.target.value })}
                              placeholder="San Francisco, USA"
                           />
                        </div>
                        <div className="space-y-2 group">
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Timezone *</label>
                              <button
                                 onClick={handleAutoDetect}
                                 disabled={detecting}
                                 className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                              >
                                 {detecting ? 'Detecting...' : 'Auto-Detect'}
                              </button>
                           </div>
                           <div className="relative">
                              <select
                                 className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all appearance-none text-gray-900 shadow-sm"
                                 value={formData.timezone}
                                 onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                              >
                                 <option value={formData.timezone}>{formData.timezone} (Currently Set)</option>
                                 <option value="UTC">UTC</option>
                                 <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                 <option value="America/New_York">America/New_York (EST)</option>
                                 <option value="Europe/London">Europe/London (GMT)</option>
                              </select>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Section: Professional (Candidate Only) */}
                  {user.role === UserRole.CANDIDATE && (
                     <div className="relative">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center">
                           <span className="w-8 h-8 rounded-2xl bg-blue-50 flex items-center justify-center mr-3 shadow-sm border border-blue-100">03</span>
                           Professional Profile
                        </h3>
                        <div className="space-y-8">
                           <div className="space-y-2 group">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Professional Bio</label>
                              <textarea
                                 className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all h-32 text-gray-900 placeholder:text-gray-300 resize-none"
                                 value={formData.bio}
                                 onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                 placeholder="Expert software engineer with 5+ years of experience in distributed systems..."
                              />
                           </div>
                           <div className="space-y-2 group">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">Resume URL *</label>
                              <input
                                 className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[24px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all text-gray-900 placeholder:text-gray-300"
                                 value={formData.resumeUrl}
                                 onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                                 placeholder="https://drive.google.com/file/d/your-resume-link"
                              />
                              <p className="text-[9px] text-gray-400 font-bold ml-1 uppercase tracking-wider">Provide a public link to your resume (Google Drive, Dropbox, etc.)</p>
                           </div>
                        </div>
                     </div>
                  )}

                  {error && (
                     <div className="p-5 bg-red-50 text-red-600 rounded-[20px] text-[11px] font-black uppercase tracking-widest border border-red-100 flex items-center shadow-sm animate-in shake-x">
                        <svg className="w-4 h-4 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {error}
                     </div>
                  )}

                  <LoadingButton
                     onClick={handleSave}
                     loading={saving}
                     className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 active:scale-[0.97] transition-all duration-300"
                  >
                     {isMandatoryMode ? 'Initialize Experience' : 'Sync Profile'}
                  </LoadingButton>
               </div>
            </Card>
         </div>
      </div>
   );
}
