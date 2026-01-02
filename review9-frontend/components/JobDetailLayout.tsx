'use client';

import React from 'react';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { Button } from './UI';

interface JobDetailLayoutProps {
  children: React.ReactNode;
  jobTitle: string;
  companyName: string;
  onInviteClick?: () => void;
}

export const JobDetailLayout: React.FC<JobDetailLayoutProps> = ({ children, jobTitle, companyName, onInviteClick }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const jobId = params.jobId as string;
  const companyId = searchParams.get('companyId') || searchParams.get('companyid');

  // Encode company name for URL
  const encodedCompanyName = encodeURIComponent(companyName.replace(/\s+/g, '-').toLowerCase());

  const tabs = [
    { label: 'Overview', path: `/${encodedCompanyName}/${jobId}${companyId ? `?companyId=${companyId}` : ''}` },
    { label: 'Responses', path: `/${encodedCompanyName}/${jobId}/responses${companyId ? `?companyId=${companyId}` : ''}` },
    { label: 'Analytics', path: `/${encodedCompanyName}/${jobId}/analytics${companyId ? `?companyId=${companyId}` : ''}` },
    { label: 'Edit & Config', path: `/${encodedCompanyName}/${jobId}/edit${companyId ? `?companyId=${companyId}` : ''}` },
  ];

  const handleExport = () => {
    window.print();
  };

  const handleInvite = () => {
    if (onInviteClick) {
      onInviteClick();
    } else {
      alert('Invite functionality - integrate with your email service');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b px-8 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-5">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Button>
            <div className="h-10 w-[1px] bg-gray-200"></div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-none tracking-tight">{jobTitle}</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase mt-1.5 tracking-[0.2em]">{companyName.replace(/-/g, ' ')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-6 h-12 rounded-xl" onClick={handleExport}>Export Stats</Button>
            <Button className="text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-xl shadow-blue-500/20" onClick={handleInvite}>Invite Candidate</Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 flex space-x-10">
          {tabs.map(tab => {
            // Check if current path matches or starts with tab path
            const decodedPathname = decodeURIComponent(pathname);
            const decodedTabPath = decodeURIComponent(tab.path);
            const isActive = decodedPathname === decodedTabPath ||
              (tab.label === 'Overview' && decodedPathname.split('/').length === 3);
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${isActive
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-10">
        {children}
      </main>
    </div>
  );
};

