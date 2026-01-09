'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button, Card, Skeleton } from '@/components/UI';
import { jobsApi } from '@/services/api';

interface CompanyProfile {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  jobs: Array<{
    id: string;
    title: string;
    roleCategory: string;
    description: string;
  }>;
}

export default function CompanyPublicProfile() {
  const params = useParams();
  const companyId = params.companyId as string;
  const router = useRouter();
  const { user } = useStore();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      jobsApi.getCompanyProfile(companyId)
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch company profile:", err);
          setLoading(false);
        });
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="px-10 py-6 border-b flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="text-2xl font-black text-blue-600">IntervAI</div>
        </header>
        <main className="max-w-6xl mx-auto px-10 py-16">
          <div className="flex flex-col md:flex-row items-start gap-12 mb-20 animate-pulse">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-200 rounded-[40px]"></div>
            <div className="flex-grow pt-4">
              <div className="h-12 bg-gray-200 w-3/4 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-100 w-1/2 rounded-lg mb-8"></div>
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-gray-50 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">404</h1>
          <p className="text-gray-500 font-medium mb-8">Company profile not found.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-10 py-6 border-b flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10 font-bold">
        <div className="text-2xl font-black text-blue-600 cursor-pointer" onClick={() => router.push('/')}>IntervAI</div>
        <div className="flex space-x-4">
          <Button variant="ghost" onClick={() => router.push('/scheduled')}>My Interviews</Button>
          {!user ? (
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          ) : (
            <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-10 py-16">
        <div className="flex flex-col md:flex-row items-start gap-12 mb-20">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-900 rounded-[40px] flex items-center justify-center text-white text-6xl font-black shadow-2xl uppercase">
            {profile.name[0]}
          </div>
          <div className="flex-grow pt-4">
            <h1 className="text-5xl font-black text-gray-900 mb-4">{profile.name}</h1>
            <p className="text-xl text-gray-500 font-medium mb-8 max-w-2xl leading-relaxed">
              {profile.bio || "Building the next generation of solutions. Leading with innovation and excellence."}
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="px-6 py-2 bg-gray-100 rounded-full font-bold text-sm text-gray-600">{profile.location || 'Remote'}</span>
              <span className="px-6 py-2 bg-gray-100 rounded-full font-bold text-sm text-gray-600">Company Profile</span>
              <span className="px-6 py-2 bg-blue-50 rounded-full font-bold text-sm text-blue-600">Active Openings</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-3xl font-black text-gray-900">Open Roles</h2>
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{profile.jobs.length} Positions</span>
            </div>

            {profile.jobs.length === 0 ? (
              <Card className="py-20 text-center border-dashed border-2">
                <p className="text-gray-400 font-bold italic">No active openings at the moment.</p>
              </Card>
            ) : (
              profile.jobs.map(job => (
                <Card key={job.id} className="p-8 hover:border-blue-500 border-2 border-transparent transition-all cursor-pointer group shadow-lg rounded-[2rem] overflow-hidden relative">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                    <div>
                      <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{job.roleCategory}</div>
                      <h3 className="text-2xl font-black text-gray-900 transition-colors mb-2">{job.title}</h3>
                      <p className="text-gray-500 font-medium text-sm line-clamp-2 max-w-xl">{job.description}</p>
                    </div>
                    <Button onClick={() => router.push(`/interview/demo?jobId=${job.id}`)} className="shadow-lg shadow-blue-500/20 px-8 py-3 rounded-xl whitespace-nowrap">View & Apply</Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-12">
            <div className="bg-gray-50 p-10 rounded-[2.5rem]">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Work Culture</h3>
              <ul className="space-y-6">
                {['Visionary Leadership', 'Global Collaboration', 'AI-Enhanced Workflows', 'Competitive Benefits'].map(b => (
                  <li key={b} className="flex items-center space-x-4 text-gray-700 font-bold">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
