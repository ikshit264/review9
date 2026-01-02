'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { JobDetailLayout } from '@/components/JobDetailLayout';
import { Card, Skeleton } from '@/components/UI';
import { useJobApi } from '@/hooks/api/useJobApi';
import { SubscriptionPlan } from '@/types';

export default function JobAnalytics() {
  const params = useParams();
  const jobId = params.jobId as string;
  const companyName = params.companyName as string;
  const { user } = useStore();
  const { useJobQuery, useJobAnalytics } = useJobApi(jobId);
  const { data: backendJob, isLoading: jobLoading } = useJobQuery();
  const { data: analytics, isLoading: analyticsLoading } = useJobAnalytics();

  const job = backendJob || {
    id: jobId,
    title: 'Job Details',
    roleCategory: 'Role',
    description: '',
    companyName: user?.name || 'Company',
    companyId: user?.id || '',
    interviewStartTime: new Date().toISOString(),
    interviewEndTime: new Date().toISOString(),
    planAtCreation: SubscriptionPlan.FREE,
    tabTracking: true,
    eyeTracking: false,
    multiFaceDetection: false,
    fullScreenMode: false,
    videoRequired: false,
    micRequired: false,
    noTextTyping: false,
    timezone: 'UTC',
    candidates: []
  };

  const isLoading = jobLoading || analyticsLoading;

  // Dynamic stats from backend
  const stats = [
    { label: 'Completion Rate', value: analytics ? `${analytics.completionRate}%` : '-', icon: '📈' },
    { label: 'Avg Integrity', value: analytics ? `${analytics.integrityRate}%` : '-', icon: '🛡️' },
    { label: 'AI Passed', value: analytics ? `${analytics.fitCandidates}/${analytics.completedSessions}` : '-', icon: '🤖' },
    { label: 'Time Saved', value: analytics ? `${analytics.timeSavedHours} hrs` : '-', icon: '⚡' },
  ];

  // Score distribution from backend (7 buckets normalized to percentages)
  const scoreDistribution = analytics?.scoreDistribution || [0, 0, 0, 0, 0, 0, 0];
  const maxScore = Math.max(...scoreDistribution, 1);
  const normalizedScores = scoreDistribution.map(s => Math.round((s / maxScore) * 100));

  // Incident tracking from backend
  const incidents = analytics?.incidentCounts || { tab_switch: 0, eye_distraction: 0, multiple_faces: 0, no_face: 0, other: 0 };
  const incidentData = [
    { type: 'Tab Switches', count: incidents.tab_switch, color: 'bg-red-500' },
    { type: 'Eye Distractions', count: incidents.eye_distraction, color: 'bg-yellow-500' },
    { type: 'Multiple Faces', count: incidents.multiple_faces, color: 'bg-orange-500' },
    { type: 'No Face Detected', count: incidents.no_face, color: 'bg-gray-400' },
    { type: 'Other', count: incidents.other, color: 'bg-purple-500' },
  ];

  return (
    <JobDetailLayout jobTitle={job.title} companyName={companyName || job.companyName || 'Company'}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map(s => (
          <Card key={s.label} className="p-6 border-none shadow-xl flex items-center space-x-4">
            <div className="text-3xl">{s.icon}</div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <div className="text-2xl font-black text-gray-900">{s.value}</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution Chart */}
        <Card className="p-8 shadow-xl border-none h-96">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Score Distribution</h3>
          {isLoading ? (
            <div className="flex items-end space-x-4 h-56 mt-4">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <Skeleton key={i} className="flex-1 h-32" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-end space-x-4 h-56 mt-4">
                {normalizedScores.map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-100 rounded-t-lg relative group transition-all hover:bg-blue-200">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {scoreDistribution[i]} candidates
                    </div>
                    <div className="w-full bg-blue-600 rounded-t-lg transition-all" style={{ height: `${h || 2}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400">
                <span>0-20</span>
                <span>20-40</span>
                <span>40-50</span>
                <span>50-60</span>
                <span>60-70</span>
                <span>70-80</span>
                <span>80-100</span>
              </div>
            </>
          )}
        </Card>

        {/* Incident Tracking */}
        <Card className="p-8 shadow-xl border-none">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Incident Tracking</h3>
          <div className="space-y-6">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))
            ) : (
              incidentData.map(inc => (
                <div key={inc.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${inc.color}`}></div>
                    <span className="font-bold text-gray-700">{inc.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black">{inc.count}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Status Summary */}
      {analytics && (
        <Card className="p-8 shadow-xl border-none mt-8">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Candidate Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(analytics.statusCounts).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-black text-gray-900">{count}</div>
                <div className="text-xs font-bold text-gray-500 uppercase mt-1">{status}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </JobDetailLayout>
  );
}
