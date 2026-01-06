'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { JobDetailLayout } from '@/components/JobDetailLayout';
import { Card, Input, Button, LoadingButton } from '@/components/UI';
import { LoadingOverlay } from '@/components/LoadingOverlay';
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

import { Suspense } from 'react';

function JobEditContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || searchParams.get('companyid') || undefined;
  const jobId = params.jobId as string;
  const companyName = params.companyName as string;
  const { user } = useStore();
  const { useJobQuery } = useJobApi(jobId, companyId);
  const { data: backendJob, isLoading, refetch } = useJobQuery();

  const job = backendJob;

  const [formData, setFormData] = useState({
    title: '',
    role: '',
    description: '',
  });

  const [proctoring, setProctoring] = useState<ProctoringSettings>({
    tabTracking: true,
    eyeTracking: false,
    multiFaceDetection: false,
    fullScreenMode: false,
    noTextTyping: false,
  });

  const [customQuestions, setCustomQuestions] = useState<string[]>(['']);
  const [aiRequirements, setAiRequirements] = useState('');

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
        fullScreenMode: job.fullScreenMode ?? false,
        noTextTyping: job.noTextTyping ?? false,
      });
      setCustomQuestions(job.customQuestions && job.customQuestions.length > 0 ? job.customQuestions : ['']);
      setAiRequirements(job.aiSpecificRequirements || '');
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
      const filteredQuestions = customQuestions.filter(q => q.trim() !== '');

      await jobsApi.update(jobId, {
        title: formData.title,
        roleCategory: formData.role,
        description: formData.description,
        ...proctoring,
        customQuestions: filteredQuestions.length > 0 ? filteredQuestions : undefined,
        aiSpecificRequirements: aiRequirements.trim() || undefined,
      }, companyId);

      // Refetch job data to get updated values
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
      <LoadingOverlay isLoading={saving} message="Saving job changes..." />
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

          <Card className="p-8 shadow-xl border-none">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">🎯 Custom Interview Questions</h3>
            <p className="text-xs text-gray-500 mb-4">Add specific questions you want the AI to ask in every interview</p>

            <div className="space-y-2">
              {customQuestions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => {
                      const newQuestions = [...customQuestions];
                      newQuestions[index] = e.target.value;
                      setCustomQuestions(newQuestions);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    placeholder={`Question ${index + 1}`}
                  />
                  {customQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCustomQuestions(customQuestions.filter((_, i) => i !== index))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCustomQuestions([...customQuestions, ''])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Question
              </button>
            </div>
          </Card>

          <Card className="p-8 shadow-xl border-none">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">🤖 AI-Specific Requirements</h3>
            <p className="text-xs text-gray-500 mb-4">Provide additional context for the AI to generate better questions and evaluations</p>
            <textarea
              value={aiRequirements}
              onChange={(e) => setAiRequirements(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed"
              placeholder="e.g., Focus on React 18+ features, TypeScript proficiency, and micro-frontend architecture experience..."
            />
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
              {job?.planAtCreation !== SubscriptionPlan.FREE && (
                <ToggleRow
                  label="Eye Tracking"
                  enabled={proctoring.eyeTracking}
                  onClick={() => handleToggle('eyeTracking')}
                />
              )}
              {job?.planAtCreation === SubscriptionPlan.ULTRA && (
                <ToggleRow
                  label="Multi-Face Detection"
                  enabled={proctoring.multiFaceDetection}
                  onClick={() => handleToggle('multiFaceDetection')}
                />
              )}
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

export default function JobEdit() {
  return (
    <Suspense fallback={
      <JobDetailLayout jobTitle="Loading..." companyName="">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </JobDetailLayout>
    }>
      <JobEditContent />
    </Suspense>
  );
}
