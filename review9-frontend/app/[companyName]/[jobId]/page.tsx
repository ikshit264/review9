'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button, Card, Modal, Input } from '@/components/UI';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { SubscriptionPlan, JobPosting } from '@/types';
import { JobDetailLayout } from '@/components/JobDetailLayout';
import { useJobApi } from '@/hooks/api/useJobApi';

export default function CompanyInterviewDetail() {
  const params = useParams();
  const jobId = params.jobId as string;
  const companyName = params.companyName as string;
  const router = useRouter();
  const { user } = useStore();
  const { useJobQuery, useJobCandidatesQuery, inviteCandidatesMutation } = useJobApi(jobId);
  const { data: backendJob, isLoading: jobLoading } = useJobQuery();
  const { data: candidates = [], isLoading: candidatesLoading } = useJobCandidatesQuery();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [candidateEmails, setCandidateEmails] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Get job from backend
  const job: JobPosting = backendJob || {
    id: jobId || 'job-1',
    title: 'Loading...',
    roleCategory: 'Loading...',
    description: 'Loading job details...',
    companyName: user?.name || 'Company',
    companyId: user?.id || 'comp_1',
    interviewStartTime: new Date().toISOString(),
    interviewEndTime: new Date().toISOString(),
    planAtCreation: user?.plan || SubscriptionPlan.FREE,
    tabTracking: true,
    eyeTracking: false,
    multiFaceDetection: false,
    fullScreenMode: false,
    noTextTyping: false,
    videoRequired: false,
    micRequired: false,
    timezone: 'UTC',
    candidates: []
  };

  // Combine job metadata with fetched candidates
  const jobWithCandidates = {
    ...job,
    candidates: candidates || []
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'PAUSED': return 'text-orange-600 bg-orange-50 animate-pulse';
      case 'ONGOING': return 'text-blue-600 bg-blue-50';
      case 'INVITED': return 'text-blue-600 bg-blue-50';
      case 'SHORTLISTED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleInviteCandidates = async () => {
    if (!candidateEmails.trim()) return;

    setIsInviting(true);
    try {
      const emails = candidateEmails.split(',').map(e => e.trim()).filter(Boolean);
      const candidates = emails.map(email => ({
        name: email.split('@')[0],
        email,
      }));

      await inviteCandidatesMutation.mutateAsync({ candidates });
      setCandidateEmails('');
      setIsInviteModalOpen(false);
      alert('Candidates invited successfully!');
    } catch (error) {
      console.error('Failed to invite candidates:', error);
      alert('Failed to invite candidates. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const { resumeInterviewMutation } = {
    resumeInterviewMutation: {
      mutateAsync: async (sessionId: string) => {
        const { interviewsApi } = await import('@/services/api');
        return interviewsApi.resumeInterview(sessionId);
      }
    }
  };

  const handleResume = async (sessionId: string) => {
    try {
      await resumeInterviewMutation.mutateAsync(sessionId);
      alert('Interview resumed successfully!');
      router.refresh(); // Refresh to update status
    } catch (error) {
      console.error('Failed to resume interview:', error);
      alert('Failed to resume interview.');
    }
  };

  // Calculate stats
  const completedCount = jobWithCandidates.candidates?.length || 0;
  const avgScore = (jobWithCandidates.candidates?.filter(c => c.score)?.reduce((acc, c) => acc + (c.score || 0), 0) || 0) / (completedCount || 1);

  const isLoading = jobLoading || candidatesLoading;

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <JobDetailLayout jobTitle="Loading..." companyName={companyName}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </JobDetailLayout>
    );
  }

  return (
    <JobDetailLayout
      jobTitle={job.title}
      companyName={companyName || job.companyName || 'Company'}
      onInviteClick={() => setIsInviteModalOpen(true)}
    >
      <LoadingOverlay isLoading={isInviting} message="Sending invitations..." />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8 border-none shadow-xl relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Job Overview</h2>
            <p className="text-gray-500 mb-8 max-w-2xl">{job.description}</p>
            <div className="flex space-x-6 border-t border-gray-50 pt-8">
              <div className="flex-1">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Candidates</div>
                <div className="text-3xl font-black text-gray-900">{jobWithCandidates.candidates?.length || 0}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Completed</div>
                <div className="text-3xl font-black text-gray-900">{completedCount}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Average Score</div>
                <div className="text-3xl font-black text-blue-600 ">{avgScore > 0 ? `${Math.round(avgScore)}` : '--'} <span className="text-xl font-black text-gray-400 uppercase tracking-widest">PTS</span> </div>
              </div>
            </div>
          </Card>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900">Candidates</h3>
              <Button variant="ghost" className="text-blue-600 font-bold text-sm" onClick={() => router.push(`/${companyName || job.companyName}/${jobId}/responses`)}>View All Responses &rarr;</Button>
            </div>
            {(jobWithCandidates.candidates?.length || 0) === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="font-bold">No candidates yet</p>
                <p className="text-sm mt-2">Click "Invite Candidate" to add candidates to this job</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white border-b">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Candidate</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">AI Score</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobWithCandidates.candidates?.map(candidate => (
                    <tr key={candidate.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-gray-900">{candidate.name}</div>
                        <div className="text-xs text-gray-400">{candidate.email}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {candidate.score ? (
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs mr-3 border border-blue-100">{candidate.score}</div>
                            <span className="text-[10px] text-gray-400 font-bold">PTS</span>
                          </div>
                        ) : <span className="text-gray-300">--</span>}
                      </td>
                      <td className="px-8 py-5 flex space-x-2">
                        {candidate.status === 'PAUSED' && candidate.sessionId && (
                          <Button
                            variant="primary"
                            className="text-xs font-bold rounded-xl px-4 py-2 bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleResume(candidate.sessionId!)}
                          >
                            Resume
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="text-xs font-bold rounded-xl px-4 py-2"
                          onClick={() => router.push(`/${companyName || job.companyName}/${jobId}/responses`)}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 border-none shadow-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Security</h3>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'tabTracking', label: 'Tab Tracking' },
                { key: 'eyeTracking', label: 'Eye Tracking' },
                { key: 'multiFaceDetection', label: 'Multi-Face' },
                { key: 'screenRecording', label: 'Screen Share' },
                { key: 'fullScreenMode', label: 'Strict Fullscreen' },
                { key: 'noTextTyping', label: 'Verbal Only' },
              ].map(({ key, label }) => {
                const enabled = (job as any)[key];
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">{label}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${enabled ? 'bg-blue-600/10 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      {enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 text-center">
              <Button variant="ghost" onClick={() => router.push(`/${companyName || job.companyName}/${jobId}/edit`)} className="text-blue-600 text-xs font-black uppercase tracking-widest">Modify Settings</Button>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl bg-[#202124] text-white">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-gray-500">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => setIsInviteModalOpen(true)}
                className="w-full py-3 rounded-xl text-sm"
              >
                + Invite Candidates
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/${companyName || job.companyName}/${jobId}/analytics`)}
                className="w-full py-3 rounded-xl text-sm bg-white/10 border-0 text-white hover:bg-white/20"
              >
                View Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Invite Candidates Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Candidates">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Emails (comma separated)</label>
            <textarea

              value={candidateEmails}
              onChange={(e) => setCandidateEmails(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              placeholder="john@example.com, jane@example.com..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleInviteCandidates} disabled={isInviting} className="flex-1">
              {isInviting ? 'Inviting...' : 'Send Invites'}
            </Button>
          </div>
        </div>
      </Modal>
    </JobDetailLayout>
  );
}
