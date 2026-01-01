'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button, Card } from '@/components/UI';
import { UserRole, SubscriptionPlan, ProctoringSettings } from '@/types';
import { JobCard } from '@/components/dashboard/JobCard';
import { JobModal } from '@/components/dashboard/JobModal';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { useDashboardPageApi } from '@/hooks/api/useDashboardPageApi';
import { useToast } from '@/hooks/useToast';

export default function Dashboard() {
  const { user, logout } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const { createJobMutation, useJobsQuery, inviteCandidatesMutation } = useDashboardPageApi();
  const { data: jobs = [], isLoading: jobsLoading } = useJobsQuery();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  // Polling state
  const [isInviting, setIsInviting] = useState(false);
  const [invitationProgress, setInvitationProgress] = useState<{
    total: number;
    current: number;
    succeeded: number;
    failed: number;
    details: Array<{
      email: string;
      status: 'pending' | 'sending' | 'success' | 'error';
      error?: string;
    }>;
  }>({
    total: 0,
    current: 0,
    succeeded: 0,
    failed: 0,
    details: []
  });

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

  const isLoading = jobsLoading || invitesLoading;

  const getDefaultSettings = (plan: SubscriptionPlan): ProctoringSettings => ({
    tabTracking: true,
    eyeTracking: plan !== SubscriptionPlan.FREE,
    multiFaceDetection: plan === SubscriptionPlan.ULTRA,
    screenRecording: plan !== SubscriptionPlan.FREE,
    fullScreenMode: false,
    noTextTyping: false,
  });

  const handleCreateJob = async (data: {
    title: string;
    role: string;
    emails: string[];
    interviewStartTime: string;
    interviewEndTime: string;
    timezone: string;
    notes?: string;
    fullScreenMode?: boolean;
    noTextTyping?: boolean;
    customQuestions?: string[];
    aiSpecificRequirements?: string;
  }) => {
    const currentPlan = user?.plan || SubscriptionPlan.FREE;
    const settings = getDefaultSettings(currentPlan);

    const jobData = {
      title: data.title,
      roleCategory: data.role,
      description: data.notes || 'No description provided.',
      notes: data.notes,
      interviewStartTime: data.interviewStartTime,
      interviewEndTime: data.interviewEndTime,
      timezone: data.timezone,
      tabTracking: settings.tabTracking,
      eyeTracking: settings.eyeTracking,
      multiFaceDetection: settings.multiFaceDetection,
      screenRecording: settings.screenRecording,
      fullScreenMode: data.fullScreenMode ?? false,
      noTextTyping: data.noTextTyping ?? false,
      customQuestions: data.customQuestions,
      aiSpecificRequirements: data.aiSpecificRequirements,
    };

    try {
      // Step 1: Create job
      const newJob = await createJobMutation.mutateAsync(jobData);
      toast.success("Job posted successfully!");

      // Step 2: If no emails, close and done
      if (data.emails.length === 0) {
        setIsJobModalOpen(false);
        return;
      }

      // Step 3: Set up polling
      setIsInviting(true);
      setInvitationProgress({
        total: data.emails.length,
        current: 0,
        succeeded: 0,
        failed: 0,
        details: data.emails.map(email => ({ email, status: 'pending' }))
      });

      // Step 4: Add beforeunload protection
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Invitations are being sent. Are you sure you want to leave?';
        return e.returnValue;
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Step 5: Start invitation process on backend
      const { jobsApi } = await import('@/services/api');
      await jobsApi.inviteCandidates(newJob.id, {
        candidates: data.emails.map(email => ({
          name: email.split('@')[0],
          email
        }))
      });

      // Step 6: Poll for progress
      let pollCount = 0;
      const maxPolls = 600; // 5 minutes max (600 * 500ms)

      const pollInterval = setInterval(async () => {
        try {
          pollCount++;
          const progress = await jobsApi.getInvitationProgress(newJob.id);

          if (progress.found && progress.details) {
            // Update progress state
            setInvitationProgress({
              total: progress.total || 0,
              current: progress.current || 0,
              succeeded: progress.succeeded || 0,
              failed: progress.failed || 0,
              details: progress.details
            });

            // Show individual toasts for status changes
            progress.details.forEach((detail, idx) => {
              const prevDetail = invitationProgress.details[idx];
              if (prevDetail && prevDetail.status !== detail.status) {
                if (detail.status === 'success') {
                  toast.success(`✓ Invited ${detail.email}`);
                } else if (detail.status === 'error') {
                  toast.error(`✗ Failed: ${detail.email}`);
                }
              }
            });

            // If completed, stop polling
            if (progress.completed) {
              clearInterval(pollInterval);
              window.removeEventListener('beforeunload', handleBeforeUnload);
              setIsInviting(false);
              toast.success(`Sent ${progress.succeeded}/${progress.total} invitations`);
              setTimeout(() => setIsJobModalOpen(false), 2000);
            }
          } else if (!progress.found) {
            // Progress not found, might be completed or error
            clearInterval(pollInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            setIsInviting(false);
          }

          // Safety timeout
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            setIsInviting(false);
            toast.warning('Polling timeout - some invitations may still be processing');
          }
        } catch (err) {
          console.error('Failed to fetch progress:', err);
        }
      }, 500); // Poll every 500ms

    } catch (err) {
      console.error("Failed to create job:", err);
      toast.error("Failed to post job. Please try again.");
      setIsInviting(false);
    }
  };

  const handleViewJob = (id: string, companyName: string) => {
    router.push(`/${companyName}/${id}`);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  // --- Render content based on role and state ---
  let mainContent;

  if (isLoading) {
    mainContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(n => <div key={n} className="h-48 bg-gray-100 animate-pulse rounded-[2rem]"></div>)}
      </div>
    );
  } else if (user.role === UserRole.COMPANY) {
    mainContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.length === 0 ? (
          <div className="col-span-full py-20 bg-gray-100 rounded-[3rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <p className="text-xl font-black uppercase tracking-widest">No active jobs</p>
            <p className="font-medium mt-2">Start by posting your first job opening.</p>
          </div>
        ) : (
          jobs.map(job => (
            <JobCard key={job.id} job={job} onViewDetails={handleViewJob} />
          ))
        )}
      </div>
    );
  } else {
    // Candidate view
    const now = new Date();
    const getInviteTimes = (inv: any) => {
      const start = new Date(inv.interviewStartTime || inv.job.scheduledTime || inv.job.interviewStartTime);
      const end = new Date(inv.interviewEndTime || inv.job.interviewEndTime);
      return { start, end };
    };

    const activeInvites = invitations.filter(inv => {
      const { start, end } = getInviteTimes(inv);
      const isWithinWindow = now >= start && now < end;
      return isWithinWindow && !['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED'].includes(inv.currentStatus);
    });

    const upcomingInvites = invitations.filter(inv => {
      const { start } = getInviteTimes(inv);
      return now < start && !['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED'].includes(inv.currentStatus);
    });

    const completedInvites = invitations.filter(inv => {
      const { end } = getInviteTimes(inv);
      return now >= end || ['COMPLETED', 'REVIEW', 'REJECTED', 'CONSIDERED'].includes(inv.currentStatus);
    });

    mainContent = (
      <div className="space-y-12">
        {activeInvites.length > 0 && (
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Active Sessions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeInvites.map(inv => (
                <Card key={inv.id} className="border-none bg-white shadow-2xl p-8 rounded-[2.5rem] relative overflow-hidden group border-l-4 border-l-blue-600">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {inv.currentStatus}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{inv.job.company.name}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{inv.job.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2">{inv.job.description}</p>
                  <Button onClick={() => router.push(`/interview/${inv.interviewLink}`)} className="w-full py-4 text-sm rounded-xl shadow-lg shadow-blue-500/20 font-black uppercase">
                    {inv.currentStatus === 'PAUSED' ? 'View Status' : 'Resume Interview'}
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Upcoming Interviews</h2>
          </div>
          {upcomingInvites.length === 0 ? (
            <div className="bg-gray-50 rounded-[2rem] p-12 text-center text-gray-400 font-medium">
              No upcoming interviews scheduled yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingInvites.map(inv => (
                <Card key={inv.id} className="hover:shadow-xl transition-all cursor-pointer p-8 rounded-[2rem] border-gray-100" onClick={() => router.push(`/interview/${inv.interviewLink}`)}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400">
                      {inv.job.company.name[0]}
                    </div>
                    <div className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">
                      {new Date(inv.job.scheduledTime).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900 leading-tight mb-1">{inv.job.title}</h3>
                  <p className="text-xs text-gray-500 font-bold mb-4">{inv.job.company.name}</p>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time: {new Date(inv.job.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {completedInvites.length > 0 && (
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Completed</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedInvites.map(inv => (
                <Card key={inv.id} className="bg-gray-50/50 border-gray-100 p-8 rounded-[2rem] grayscale opacity-80">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase">COMPLETED</span>
                    <span className="text-[10px] font-bold text-gray-400">{new Date(inv.job.scheduledTime).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-black text-gray-800 leading-tight mb-1">{inv.job.title}</h3>
                  <p className="text-xs text-gray-400 font-bold">{inv.job.company.name}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <div className="text-xl font-black text-gray-900 tracking-tight">HireAI</div>
          </div>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <div className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">
            {user.role} Portal
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-black text-gray-900 leading-none">{user.name}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{user.email}</div>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black border-2 border-white shadow-lg">
            {user.name?.[0]}
          </div>
          <NotificationDropdown />
          <Button variant="ghost" onClick={() => { logout(); router.push('/'); }} className="text-gray-500 font-black text-xs">LOGOUT</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Active Recruitment</h1>
            <p className="text-gray-500 mt-2 font-medium">Managing hiring for <span className="text-blue-600 font-black">{user.name}</span> &bull; Plan: <span className="font-black uppercase">{user.plan || 'Free'}</span></p>
          </div>
          {user.role === UserRole.COMPANY && (
            <Button onClick={() => setIsJobModalOpen(true)} className="h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20 text-sm font-black uppercase tracking-widest">
              + Post New Job
            </Button>
          )}
        </div>

        {mainContent}
      </main>

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
