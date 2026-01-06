'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/api/useAuth';
import { UserRole, SubscriptionPlan } from '@/types';
import { JobCard } from '@/components/dashboard/JobCard';
import { JobModal } from '@/components/dashboard/JobModal';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { useDashboardPageApi } from '@/hooks/api/useDashboardPageApi';
import { useToast } from '@/hooks/useToast';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { LoadingScreen } from '@/components/loading';
import { cn } from '@/lib/utils';

import {
  Briefcase,
  Plus,
  User as UserIcon,
  Monitor,
  Calendar,
  ChevronRight,
  BrainCircuit,
  TrendingUp,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch
} from 'lucide-react';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const { user } = useStore();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || searchParams.get('companyid') || undefined;

  const { logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const { createJobMutation, useJobsQuery } = useDashboardPageApi(companyId);
  const { data: jobs = [], isLoading: jobsLoading } = useJobsQuery();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  const [targetCompany, setTargetCompany] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'ADMIN' && companyId) {
      import('@/services/api').then(({ authApi }) => {
        authApi.getProfile(companyId).then(setTargetCompany).catch(console.error);
      });
    }
  }, [user, companyId]);

  const displayName = targetCompany?.name || user?.name || 'User';
  const displayRole = targetCompany?.role || user?.role || 'User';
  const displayId = targetCompany?.id || user?.id || '';

  // Polling state for invitations
  const [isInviting, setIsInviting] = useState(false);
  const [invitationProgress, setInvitationProgress] = useState<{
    total: number;
    current: number;
    succeeded: number;
    failed: number;
    details: any[];
  }>({ total: 0, current: 0, succeeded: 0, failed: 0, details: [] });

  // Job creation state (must be declared before any early returns)
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  useEffect(() => {
    if (user?.role === UserRole.CANDIDATE) {
      setInvitesLoading(true);
      import('@/services/api').then(({ interviewsApi }) => {
        interviewsApi.getMyInvitations()
          .then(data => {
            setInvitations(data);
            setInvitesLoading(false);
          })
          .catch(err => {
            console.error("Failed to fetch invitations:", err);
            setInvitesLoading(false);
          });
      });
    }
  }, [user]);

  // Helper for status badges
  const renderStatusBadge = (status: string, startTime?: string, endTime?: string, isReInterviewed?: boolean) => {
    const now = new Date();
    const start = startTime ? new Date(startTime) : null;
    let end = endTime ? new Date(endTime) : null;

    // Rule: if requested for re-interview, extend by 2 hours
    if (isReInterviewed && end) {
      end = new Date(end.getTime() + 2 * 60 * 60 * 1000);
    }

    if (status === 'COMPLETED') {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Completed</span>
        </div>
      );
    }

    if (status === 'REVIEW') {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
          <FileSearch className="w-3 h-3 text-blue-500" />
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Under Review</span>
        </div>
      );
    }

    if (status === 'EXPIRED' || (end && now > end)) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 rounded-full border border-red-100">
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em]">Expired</span>
        </div>
      );
    }

    if (start && now < start) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
          <Clock className="w-3 h-3 text-amber-500" />
          <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em]">Starts Soon</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
        <Clock className="w-3 h-3 text-indigo-500 animate-pulse" />
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">Live Session</span>
      </div>
    );
  };

  if (!user) return null;

  const isLoading = jobsLoading || invitesLoading;

  const handleCreateJob = async (data: any) => {
    setIsCreatingJob(true);
    try {
      const newJob = await createJobMutation.mutateAsync({
        ...data,
        description: data.notes || 'No description provided.',
        roleCategory: data.role,
      });
      toast.success("Job posted successfully!");

      if (data.emails?.length > 0) {
        setIsInviting(true);
        const { jobsApi } = await import('@/services/api');
        await jobsApi.inviteCandidates(newJob.id, {
          candidates: data.emails.map((email: string) => ({
            name: email.split('@')[0],
            email
          }))
        });
        setIsInviting(false);
        setIsJobModalOpen(false);
      } else {
        setIsJobModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to post job.");
      setIsInviting(false);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const dashboardStats = [
    { label: 'Active Jobs', value: jobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Applicants', value: jobs.reduce((acc, j) => acc + (j.candidateCount || 0), 0), icon: UserIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Efficiency Gain', value: '+24%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'AI Match Rate', value: '89%', icon: BrainCircuit, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const isProcessing = isCreatingJob || isInviting;

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 selection:bg-blue-100">
      {isCreatingJob && (
        <LoadingScreen
          variant="form"
          message="Creating job posting"
          submessage="Setting up your new opportunity..."
        />
      )}
      {isInviting && (
        <LoadingScreen
          variant="email"
          message="Sending invitations"
          submessage="Notifying candidates about the opportunity..."
        />
      )}
      <div className="flex relative z-10">
        <Sidebar />
        {/* Main Content */}
        <main className="flex-grow p-4 lg:p-12 max-w-[1600px] mx-auto w-full">
          {/* Header Area */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">{displayRole}</span>
                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workspace ID: {displayId?.slice(0, 8)}</span>
                {user?.role === 'ADMIN' && companyId && (
                  <span className="ml-4 px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest">Admin Viewing</span>
                )}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                Welcome back, {displayName.split(' ')[0]}
                <span className="text-blue-600">.</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <div className="h-10 w-[1px] bg-gray-100 mx-2"></div>
              {(user.role === UserRole.COMPANY || user.role === 'ADMIN') ? (
                <button
                  onClick={() => setIsJobModalOpen(true)}
                  className="group flex items-center space-x-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Opportunity</span>
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{displayName}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayRole}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-inner">
                    {displayName[0]}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Content Grid */}
          <div className="space-y-12">
            {(user.role === UserRole.COMPANY || user.role === 'ADMIN') && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-black tracking-tighter mb-1 text-slate-900">{stat.value}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Jobs / Interviews Section */}
            <section>


              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-72 rounded-[2.5rem] bg-gray-50/50 animate-pulse border border-gray-100"></div>
                  ))}
                </div>
              ) : (user.role === UserRole.COMPANY || user.role === 'ADMIN') ? (
                jobs.length === 0 ? (
                  <div className="relative p-24 rounded-[3rem] border-2 border-dashed border-gray-100 bg-gray-50/30 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-gray-50">
                      <Plus className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-2">No active pipelines</h3>
                    <p className="text-gray-400 font-medium max-w-xs text-sm leading-relaxed">Your hiring dashboard is empty. Post your first job to start using HireAI.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {jobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onViewDetails={(id, name) => router.push(`/${name}/${id}`)}
                      />
                    ))}
                  </div>
                )
              ) : (
                /* Candidate View Implementation */
                <div className="space-y-12">
                  {invitations.length === 0 ? (
                    <div className="p-24 rounded-[3rem] border-2 border-dashed border-gray-100 bg-gray-50/30 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-gray-50">
                        <Monitor className="w-8 h-8 text-indigo-500" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-2">Dashboard Clear</h3>
                      <p className="text-gray-400 font-medium text-sm max-w-xs">You have no pending AI assessments. New invitations will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {invitations.map(inv => (
                        <div
                          key={inv.id}
                          className={cn(
                            "group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 transition-all backdrop-blur-xl",
                            ['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED', 'SHORTLISTED', 'EXPIRED'].includes(inv.status)
                              ? "bg-gray-50/80 opacity-70 cursor-not-allowed grayscale-[0.8]"
                              : "bg-white hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 cursor-pointer shadow-sm"
                          )}
                          onClick={() => {
                            if (!['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED', 'SHORTLISTED', 'EXPIRED'].includes(inv.status)) {
                              router.push(`/interview/${inv.interviewLink}`);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500`}>
                              <Monitor className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1.5">{inv.job.company.name}</span>
                              {renderStatusBadge(inv.status, inv.job.interviewStartTime || inv.job.scheduledTime, inv.job.interviewEndTime, inv.isReInterviewed)}
                            </div>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase group-hover:text-indigo-600 transition-colors tracking-tight leading-none">{inv.job.title}</h3>
                          <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-2 leading-relaxed">{inv.job.description}</p>

                          <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5 text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span className="text-[11px] font-bold text-slate-600">{new Date(inv.job.interviewStartTime || inv.job.scheduledTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const url = `${window.location.origin}/interview/${inv.interviewLink}`;
                                  navigator.clipboard.writeText(url);
                                  toast.success("Interview link copied!");
                                }}
                                className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center space-x-1"
                                title="Copy Interview Link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Link</span>
                              </button>
                              <button
                                disabled={['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED', 'SHORTLISTED', 'EXPIRED'].includes(inv.status)}
                                className={cn(
                                  "flex items-center space-x-2 text-[11px] font-black uppercase tracking-widest transition-all",
                                  ['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED', 'SHORTLISTED', 'EXPIRED'].includes(inv.status) ? "text-gray-300" : "text-slate-400 group-hover:text-slate-900"
                                )}
                              >
                                <span>{['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED', 'SHORTLISTED', 'EXPIRED'].includes(inv.status) ? 'Done' : 'Enter'}</span>
                                <ChevronRight className={cn("w-5 h-5 transition-transform", !['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED', 'SHORTLISTED', 'EXPIRED'].includes(inv.status) && "group-hover:translate-x-1")} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => !isInviting && setIsJobModalOpen(false)}
        onSubmit={handleCreateJob}
        plan={user.plan || SubscriptionPlan.FREE}
        isInviting={isInviting}
        invitationProgress={invitationProgress}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingScreen variant="page" message="Loading dashboard..." />}>
      <DashboardContent />
    </Suspense>
  );
}
