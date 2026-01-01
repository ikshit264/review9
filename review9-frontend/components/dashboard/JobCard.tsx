'use client';

import React from 'react';
import { JobPosting } from '@/types';
import { Card } from '../UI';

interface JobCardProps {
  job: JobPosting;
  onViewDetails: (id: string, companyName: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => (
  <Card
    className="group hover:border-blue-500 transition-all duration-300 border-2 border-transparent bg-white shadow-xl rounded-[2rem] cursor-pointer"
    onClick={() => onViewDetails(job.id, job.companyName?.replace(/\s+/g, '-').toLowerCase() ?? '')}
  >
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{job.roleCategory}</p>
      </div>
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
    </div>
    <p className="text-sm text-gray-600 line-clamp-2 mb-8 h-10 font-medium leading-relaxed">{job.description}</p>
    <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
      <div className="flex -space-x-2">
        {(job.candidates ?? []).slice(0, 3).map(c => (
          <div key={c.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600 shadow-sm">
            {c.name[0]}
          </div>
        ))}
        {(job.candidates?.length ?? 0) > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
            +{(job.candidates?.length ?? 0) - 3}
          </div>
        )}
      </div>
      <div className="text-blue-600 text-xs font-black uppercase tracking-widest">
        View Detail &rarr;
      </div>
    </div>
  </Card>
);
