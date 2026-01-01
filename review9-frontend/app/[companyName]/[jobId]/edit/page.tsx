'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { JobDetailLayout } from '@/components/JobDetailLayout';
import { Card, Input, Button, LoadingButton } from '@/components/UI';
import { SubscriptionPlan, ProctoringSettings } from '@/types';
import { useJobApi } from '@/hooks/api/useJobApi';
import { jobsApi } from '@/services/api';

const ToggleRow = ({ label, enabled, onClick, locked }: { label: string; enabled: boolean; onClick: () => void; locked?: boolean }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border ${locked ? 'bg-gray-50 opacity-50' : 'bg-white'}`}>
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <button
      onClick={onClick}
      disabled={locked}
      className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'} ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
);

export default function JobEdit() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const companyName = params.companyName as string;
  const { jobs: storeJobs, updateJob: updateLocalJob, user } = useStore();
  const { useJobQuery } = useJobApi(jobId);
  const { data: backendJob, isLoading, refetch } = useJobQuery();

  const storeJob = storeJobs.find(j => j.id === jobId);
  const job = backendJob || storeJob;

  const [formData, setFormData] = useState({
    title: '',
    role: '',
    description: '',
  });

  const [proctoring, setProctoring] = useState<ProctoringSettings>({
    tabTracking: true,
    eyeTracking: false,
    multiFaceDetection: false,
    screenRecording: false,
    fullScreenMode: false,
    noTextTyping: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when job loads
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        role: job.roleCategory || '',
        description: job.description || '',
      });
      setProctoring({
        tabTracking: job.tabTracking ?? true,
        eyeTracking: job.eyeTracking ?? false,
        multiFaceDetection: job.multiFaceDetection ?? false,
        screenRecording: job.screenRecording ?? false,
        fullScreenMode: job.fullScreenMode ?? false,
        noTextTyping: job.noTextTyping ?? false,
      });
    }
  }, [job]);

  const handleToggle = (key: keyof ProctoringSettings) => {
    if (key === 'eyeTracking' && job?.planAtCreation === SubscriptionPlan.FREE) {
      alert('PRO plan required');
      return;
    }
    if (key === 'multiFaceDetection' && job?.planAtCreation !== SubscriptionPlan.ULTRA) {
      alert('ULTRA plan required');
      return;
    }

    setProctoring(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!job) return;

    setSaving(true);
    setError(null);

    try {
      await jobsApi.update(jobId, {
        title: formData.title,
        roleCategory: formData.role,
        description: formData.description,
        ...proctoring,
      });

      // Also update local store for consistency
      if (updateLocalJob && storeJob) {
        updateLocalJob({ ...storeJob, ...formData, ...proctoring } as any);
      }

      // Refetch job data
      await refetch();

      alert('Settings updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!job && !isLoading) {
    router.push('/dashboard');
    return null;
  }

  return (
    <JobDetailLayout jobTitle={job?.title || 'Loading...'} companyName={companyName || job?.companyName || ''}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 shadow-xl border-none">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">General Information</h3>
            <div className="space-y-4">
              <Input
                label="Job Title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                label="Role Category"
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, role: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-48 text-sm leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-8 shadow-xl border-none">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Security Config</h3>
            <div className="space-y-4">
              <ToggleRow
                label="Tab Tracking"
                enabled={proctoring.tabTracking}
                onClick={() => handleToggle('tabTracking')}
              />
              <ToggleRow
                label="Eye Tracking"
                enabled={proctoring.eyeTracking}
                onClick={() => handleToggle('eyeTracking')}
                locked={job?.planAtCreation === SubscriptionPlan.FREE}
              />
              <ToggleRow
                label="Face Detection"
                enabled={proctoring.multiFaceDetection}
                onClick={() => handleToggle('multiFaceDetection')}
                locked={job?.planAtCreation !== SubscriptionPlan.ULTRA}
              />
              <ToggleRow
                label="Screen Sharing"
                enabled={proctoring.screenRecording}
                onClick={() => handleToggle('screenRecording')}
              />
              <ToggleRow
                label="Strict Full Screen"
                enabled={proctoring.fullScreenMode}
                onClick={() => handleToggle('fullScreenMode')}
              />
              <ToggleRow
                label="Disable Typing (Verbal Only)"
                enabled={proctoring.noTextTyping}
                onClick={() => handleToggle('noTextTyping')}
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mt-8">
              <LoadingButton
                onClick={handleSave}
                loading={saving}
                className="w-full py-4 shadow-xl shadow-blue-500/20"
              >
                Save All Changes
              </LoadingButton>
            </div>
          </Card>
        </div>
      </div>
    </JobDetailLayout>
  );
}
