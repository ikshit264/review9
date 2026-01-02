'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button, Card, Skeleton } from '@/components/UI';
import { interviewsApi } from '@/services/api';

interface Invitation {
  id: string;
  name: string;
  email: string;
  status: string;
  interviewLink: string;
  job: {
    id: string;
    title: string;
    companyId: string;
    company: {
      name: string;
    };
  };
}

export default function ScheduledInterviews() {
  const router = useRouter();
  const { user } = useStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      interviewsApi.getMyInvitations()
        .then(data => {
          setInvitations(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch invitations:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
          <span className="font-bold text-xl tracking-tight text-gray-900">HireAI</span>
        </div>
        <div className="flex space-x-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          <Button variant="ghost" onClick={() => router.push('/profile')}>My Profile</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Your Interviews</h1>
        <p className="text-gray-500 mb-10 font-medium">Manage your upcoming AI assessments and review previous feedback.</p>

        <div className="space-y-6">
          {loading ? (
            [1, 2].map(i => (
              <Card key={i} className="p-0 border-none shadow-xl overflow-hidden h-40">
                <div className="flex animate-pulse h-full">
                  <div className="w-1/4 bg-gray-200"></div>
                  <div className="flex-grow p-8 space-y-4">
                    <div className="h-6 bg-gray-200 w-1/2 rounded"></div>
                    <div className="h-4 bg-gray-100 w-1/3 rounded"></div>
                    <div className="h-10 bg-gray-200 w-full rounded-xl"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : invitations.length === 0 ? (
            <Card className="text-center py-20 border-dashed border-2">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-500 font-bold">No interviews scheduled yet.</p>
              <Button variant="ghost" className="mt-4 text-blue-600" onClick={() => router.push('/')}>Find Companies</Button>
            </Card>
          ) : (() => {
            const now = new Date();
            const getInviteTimes = (inv: any) => {
              const start = new Date(inv.interviewStartTime || inv.job.scheduledTime || inv.job.interviewStartTime);
              const end = new Date(inv.interviewEndTime || inv.job.interviewEndTime);
              return { start, end };
            };

            return invitations.map(invitation => {
              const { start, end } = getInviteTimes(invitation);
              const isInterviewActive = invitation.status === 'INVITED' && now >= start && now < end;
              const isInterviewUpcoming = invitation.status === 'INVITED' && now < start;
              const isInterviewCompleted = invitation.status !== 'INVITED' || now >= end;

              let buttonText = 'View Feedback';
              let buttonDisabled = false;
              let statusLabel = '';
              let statusColorClass = '';

              if (isInterviewActive) {
                buttonText = 'Enter Interview Room';
                buttonDisabled = false;
                statusLabel = 'Active';
                statusColorClass = 'bg-green-100 text-green-700';
              } else if (isInterviewUpcoming) {
                buttonText = 'Enter Interview Room';
                buttonDisabled = true;
                statusLabel = 'Upcoming';
                statusColorClass = 'bg-blue-100 text-blue-700';
              } else {
                buttonText = 'View Feedback';
                buttonDisabled = invitation.status === 'INVITED' && now >= end;
                statusLabel = invitation.status === 'REVIEW' ? 'Under Review' : 'Completed';
                statusColorClass = invitation.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';
              }

              return (
                <Card key={invitation.id} className="p-0 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 bg-blue-600 p-8 text-white flex flex-col justify-center items-center text-center">
                      <div className="text-sm font-black uppercase opacity-60 mb-1">Status</div>
                      <div className="text-xl font-black uppercase text-white">{statusLabel}</div>
                      <div className="mt-2 text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">Remote</div>
                    </div>
                    <div className="flex-grow p-8 bg-white flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-black text-gray-900">{invitation.job.title}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${statusColorClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-gray-500 font-medium text-sm mb-4">
                          {invitation.job.company.name} &bull; AI Interview
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => router.push(`/interview/${invitation.interviewLink}`)}
                          className="flex-1 py-3 shadow-lg shadow-blue-500/20"
                          disabled={buttonDisabled}
                        >
                          {buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            });
          })()}
        </div>
      </main>
    </div>
  );
}
