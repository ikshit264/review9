'use client';

import React from 'react';
import { ProctoringLog } from '@/types';

interface ProctoringLogsProps {
  logs: ProctoringLog[];
}

export const ProctoringLogs: React.FC<ProctoringLogsProps> = ({ logs }) => {
  return (
    <div className="h-64 bg-[#202124] rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Proctoring Events</h4>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
      </div>
      <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="flex items-center text-emerald-400 p-3 bg-emerald-400/5 rounded-xl border border-emerald-400/20">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[11px] font-bold">Session Integrity High</span>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex justify-between items-center bg-red-500/10 p-3 rounded-xl border border-red-500/20 group transition-all">
              <div className="flex items-center">
                <div className={`w-1.5 h-1.5 rounded-full mr-3 ${log.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                <span className="text-red-400 text-[11px] font-bold uppercase tracking-tight">{log.type.replace('_', ' ')}</span>
              </div>
              <span className="text-[10px] text-gray-600 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
