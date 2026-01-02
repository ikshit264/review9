'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../UI';
import { SubscriptionPlan } from '@/types';
import { APP_CONFIG } from '@/config';
import { useToast } from '@/hooks/useToast';
import { getUserTimezone, localToUTC } from '@/lib/timezone';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    role: string;
    emails: string[];
    interviewStartTime: string;
    interviewEndTime: string;
    timezone: string;
    notes?: string;
    tabTracking?: boolean;
    eyeTracking?: boolean;
    multiFaceDetection?: boolean;
    fullScreenMode?: boolean;
    noTextTyping?: boolean;
    customQuestions?: string[];
    aiSpecificRequirements?: string;
  }) => void;
  plan: SubscriptionPlan;
  isInviting?: boolean;
  invitationProgress?: {
    total: number;
    current: number;
    succeeded: number;
    failed: number;
    details: Array<{
      email: string;
      status: 'pending' | 'sending' | 'success' | 'error';
      error?: string;
    }>;
  };
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  plan,
  isInviting = false,
  invitationProgress
}) => {
  const [candidateEmails, setCandidateEmails] = useState('');
  const [timeError, setTimeError] = useState('');
  const [tabTracking, setTabTracking] = useState(true);
  const [eyeTracking, setEyeTracking] = useState(false);
  const [multiFaceDetection, setMultiFaceDetection] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [noTextTyping, setNoTextTyping] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<string[]>(['']);
  const [aiRequirements, setAiRequirements] = useState('');
  const toast = useToast();
  const planLimits = APP_CONFIG.PLANS[plan];

  const validateTimeGap = (start: string, end: string): boolean => {
    if (!start || !end) return true; // Skip if not filled yet

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

    if (diffMinutes < 0) {
      setTimeError('End time cannot be before start time');
      return false;
    }

    if (diffMinutes < 30) {
      setTimeError('Interview must be at least 30 minutes long');
      return false;
    }

    setTimeError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const startTime = formData.get('interviewStartTime') as string;
    const endTime = formData.get('interviewEndTime') as string;

    // Validate before submit
    if (!validateTimeGap(startTime, endTime)) {
      return;
    }

    const emails = candidateEmails.split(',').map(e => e.trim()).filter(Boolean);

    if (emails.length > planLimits.maxCandidatesPerJob) {
      toast.warning(`${plan} plan is limited to ${planLimits.maxCandidatesPerJob} candidates. Please upgrade.`);
      return;
    }

    const timezone = formData.get('timezone') as string;

    const filteredQuestions = customQuestions.filter(q => q.trim() !== '');

    onSubmit({
      title: formData.get('jobTitle') as string,
      role: formData.get('role') as string,
      emails,
      interviewStartTime: localToUTC(startTime),
      interviewEndTime: localToUTC(endTime),
      timezone: timezone,
      notes: formData.get('notes') as string,
      tabTracking,
      eyeTracking,
      multiFaceDetection,
      fullScreenMode,
      noTextTyping,
      customQuestions: filteredQuestions.length > 0 ? filteredQuestions : undefined,
      aiSpecificRequirements: aiRequirements.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isInviting && onClose()} title="Post New Job Opening">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="jobTitle" label="Job Title" placeholder="e.g. Senior Product Engineer" required disabled={isInviting} />

        <div className="grid grid-cols-2 gap-4">
          <Input name="role" label="Role Category" placeholder="e.g. Frontend" required disabled={isInviting} />
          <Input
            name="interviewStartTime"
            label="Interview Start"
            type="datetime-local"
            required
            disabled={isInviting}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const form = e.target.form;
              const endTime = form?.elements.namedItem('interviewEndTime') as HTMLInputElement;
              if (endTime?.value) validateTimeGap(e.target.value, endTime.value);
            }}
          />
        </div>

        <div>
          <Input
            name="interviewEndTime"
            label="Interview End"
            type="datetime-local"
            required
            disabled={isInviting}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const form = e.target.form;
              const startTime = form?.elements.namedItem('interviewStartTime') as HTMLInputElement;
              if (startTime?.value) validateTimeGap(startTime.value, e.target.value);
            }}
          />
          {timeError && (
            <p className="text-red-500 text-xs mt-1">{timeError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            name="timezone"
            defaultValue={getUserTimezone()}
            disabled={isInviting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={getUserTimezone()}>{getUserTimezone()} (Detected)</option>
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invitation Email Content</label>
          <textarea
            name="notes"
            rows={2}
            disabled={isInviting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Any specific requirements for candidates?"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-2 border-t border-gray-100 mt-4">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={tabTracking}
              onChange={(e) => setTabTracking(e.target.checked)}
              disabled={isInviting}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">🌐 Tab Tracking</span>
          </label>
          {plan !== SubscriptionPlan.FREE && (
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={eyeTracking}
                onChange={(e) => setEyeTracking(e.target.checked)}
                disabled={isInviting}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">👁️ Eye Tracking</span>
            </label>
          )}
          {plan === SubscriptionPlan.ULTRA && (
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={multiFaceDetection}
                onChange={(e) => setMultiFaceDetection(e.target.checked)}
                disabled={isInviting}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">👥 Multi-Face</span>
            </label>
          )}
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={fullScreenMode}
              onChange={(e) => setFullScreenMode(e.target.checked)}
              disabled={isInviting}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">🔒 Full Screen</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={noTextTyping}
              onChange={(e) => setNoTextTyping(e.target.checked)}
              disabled={isInviting}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">🎙️ Verbal Only</span>
          </label>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">🎯 Custom Interview Questions (Optional)</h3>
          <p className="text-xs text-gray-500 mb-3">Add specific questions you want the AI to ask in every interview</p>

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
                  disabled={isInviting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={`Question ${index + 1}`}
                />
                {customQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setCustomQuestions(customQuestions.filter((_, i) => i !== index))}
                    disabled={isInviting}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCustomQuestions([...customQuestions, ''])}
              disabled={isInviting}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              + Add Question
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">🤖 AI-Specific Requirements (Optional)</h3>
          <p className="text-xs text-gray-500 mb-3">Provide additional context for the AI to generate better questions and evaluations</p>
          <textarea
            value={aiRequirements}
            onChange={(e) => setAiRequirements(e.target.value)}
            rows={3}
            disabled={isInviting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g., Focus on React 18+ features, TypeScript proficiency, and micro-frontend architecture experience..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidate List (Emails separated by comma)</label>
          <textarea
            value={candidateEmails}
            onChange={(e) => setCandidateEmails(e.target.value)}
            rows={3}
            disabled={isInviting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="dev1@email.com, dev2@email.com..."
            required
          />
          <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
            {plan} Limit: {planLimits.maxCandidatesPerJob === Infinity ? 'Unlimited' : planLimits.maxCandidatesPerJob}
          </p>
        </div>

        {/* Progress Display */}
        {isInviting && invitationProgress && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-blue-900">Sending Invitations</h4>
              <span className="text-xs font-bold text-blue-600">
                {invitationProgress.current}/{invitationProgress.total}
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {invitationProgress.details.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded">
                  <span className="truncate flex-1 text-gray-700">{detail.email}</span>
                  {detail.status === 'pending' && (
                    <span className="text-gray-400 text-xs">Pending...</span>
                  )}
                  {detail.status === 'sending' && (
                    <span className="text-blue-600 animate-pulse text-xs">Sending...</span>
                  )}
                  {detail.status === 'success' && (
                    <span className="text-green-600 font-semibold">✓ Sent</span>
                  )}
                  {detail.status === 'error' && (
                    <span className="text-red-600 font-semibold" title={detail.error}>✗ Failed</span>
                  )}
                </div>
              ))}
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${(invitationProgress.current / invitationProgress.total) * 100}%`
                }}
              />
            </div>

            <p className="text-xs text-gray-600 mt-2 text-center">
              {invitationProgress.succeeded} succeeded, {invitationProgress.failed} failed
            </p>
          </div>
        )}

        <div className="flex space-x-3 pt-6 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 rounded-xl"
            disabled={isInviting}
          >
            Discard
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-xl shadow-lg shadow-blue-500/10"
            disabled={isInviting}
          >
            {isInviting ? 'Sending...' : 'Post & Invite'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
