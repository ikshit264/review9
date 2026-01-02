'use client';

import React from 'react';
import { JobPosting } from '@/types';
import { Card } from '../UI';

interface JobCardProps {
  job: JobPosting;
  onViewDetails: (id: string, companyName: string) => void;
}

import { Briefcase, Users, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => (
  <div
    className="group relative p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(8,112,255,0.05)] transition-all duration-500 cursor-pointer overflow-hidden"
    onClick={() => onViewDetails(job.id, job.companyName?.replace(/\s+/g, '-').toLowerCase() ?? '')}
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-500">
          <Briefcase className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
          <Users className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-600">
            {job.candidates?.length ?? 0} Applied
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">
          {job.title}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-blue-600/80 uppercase tracking-[0.2em]">
            {job.roleCategory}
          </span>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock className="w-3 h-3 mr-1" />
            Active
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-8 font-medium leading-relaxed group-hover:text-gray-600 transition-colors">
        {job.description}
      </p>

      <div className="pt-6 border-t border-gray-50 flex justify-between items-center group/btn">
        <div className="flex -space-x-2.5">
          {(job.candidates ?? []).slice(0, 3).map((c, i) => (
            <div
              key={c.id}
              className="w-9 h-9 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[11px] font-black text-gray-600 shadow-sm ring-1 ring-gray-100"
              style={{ zIndex: 10 - i }}
            >
              {c.name[0]}
            </div>
          ))}
          {(job.candidates?.length ?? 0) > 3 && (
            <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[11px] font-black text-white shadow-md z-0 ring-1 ring-blue-100">
              +{(job.candidates?.length ?? 0) - 3}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-gray-400 group-hover:text-blue-600 transition-all text-[11px] font-black uppercase tracking-widest">
          <span>Manage Pipeline</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  </div>
);
