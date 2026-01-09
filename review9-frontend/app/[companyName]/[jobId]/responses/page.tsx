'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { JobDetailLayout } from '@/components/JobDetailLayout';
import { Card, Button, Table, CandidateStatusBadge, ScoreIndicator, FitIndicator, Dropdown, Skeleton, Modal } from '@/components/UI';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { SubscriptionPlan } from '@/types';
import { useJobApi } from '@/hooks/api/useJobApi';
import { jobsApi } from '@/services/api';
import { useToast } from '@/hooks/useToast';

// Local candidate type extending global Candidate type
import { Candidate as GlobalCandidate } from '@/types';

interface Candidate extends GlobalCandidate {
  createdAt: string;
  interviewLink: string;
  isFit?: boolean;
  completedAt?: string;
  invitedAt?: string;
}

import { Suspense } from 'react';

function JobResponsesContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || searchParams.get('companyid') || undefined;
  const jobId = params.jobId as string;
  const companyName = params.companyName as string;
  const { user } = useStore();
  const toast = useToast();
  const { useJobQuery, useJobCandidatesQuery } = useJobApi(jobId, companyId);
  const { data: backendJob, isLoading: jobLoading } = useJobQuery();
  const { data: fetchedCandidates = [], isLoading: candidatesLoading, refetch: refetchCandidates } = useJobCandidatesQuery();

  const candidates = fetchedCandidates as Candidate[];
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchSession = async (sessionId: string) => {
    setSessionLoading(true);
    try {
      const { interviewsApi } = await import('@/services/api');
      const data = await interviewsApi.getSessionReport(sessionId, companyId);
      setSessionData(data);
    } catch (err) {
      console.error("Failed to fetch session:", err);
    } finally {
      setSessionLoading(false);
    }
  };

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

  const handleStatusChange = async (candidateId: string, newStatus: Candidate['status']) => {
    setUpdating(candidateId);
    try {
      await jobsApi.updateCandidateStatus(candidateId, newStatus, companyId);
      refetchCandidates();
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Candidate status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const [reInterviewConfirm, setReInterviewConfirm] = useState<string | null>(null);

  const handleReInterview = async (candidateId: string) => {
    setSendingEmail(true);
    try {
      await jobsApi.reInterviewCandidate(jobId, candidateId, companyId);
      toast.success('Candidate scheduled for re-interview. An email has been sent.');
      setReInterviewConfirm(null);
      // Refresh candidates
      refetchCandidates();
    } catch (err) {
      toast.error('Failed to schedule re-interview');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleResume = async (sessionId: string) => {
    try {
      const { interviewsApi } = await import('@/services/api');
      await interviewsApi.resumeInterview(sessionId, companyId);
      toast.success('Interview resumed successfully!');
      // Refresh local state
      refetchCandidates();
    } catch (error) {
      console.error('Failed to resume interview:', error);
      toast.error('Failed to resume interview.');
    }
  };

  const getStatusActions = (candidate: Candidate) => {
    const actions = [];

    // Always allow viewing details
    actions.push({
      label: 'View Full Report',
      onClick: () => {
        setSelectedCandidate(candidate);
        if (candidate.sessionId) fetchSession(candidate.sessionId);
      }
    });

    // Direct Shortlist/Reject for all active or completed candidates
    if (!['PENDING', 'INVITED', 'EXPIRED'].includes(candidate.status)) {
      if (candidate.status !== 'SHORTLISTED') {
        actions.push({ label: '✓ Shortlist', onClick: () => handleStatusChange(candidate.id, 'SHORTLISTED') });
      }
      if (candidate.status !== 'REJECTED') {
        actions.push({ label: '✗ Reject', onClick: () => handleStatusChange(candidate.id, 'REJECTED'), variant: 'danger' as const });
      }
    } else if (candidate.status === 'INVITED') {
      // Even if INVITED, allow direct rejection if they are definitely not a fit
      actions.push({ label: '✗ Reject Directly', onClick: () => handleStatusChange(candidate.id, 'REJECTED'), variant: 'danger' as const });
    }

    // Re-interview visibility: Enabled for ALL candidates as requested
    actions.push({
      label: '↺ Re-interview',
      onClick: () => setReInterviewConfirm(candidate.id)
    });

    // Resend Invite option
    if (candidate.status === 'PENDING' || candidate.status === 'INVITED') {
      actions.push({
        label: '↺ Resend Invite',
        onClick: async () => {
          setSendingEmail(true);
          try {
            await jobsApi.resendInvite(jobId, { name: candidate.name, email: candidate.email }, companyId);
            toast.success(`Invite resent to ${candidate.email}`);
          } catch (err) {
            console.error("Failed to resend invite:", err);
            toast.error("Failed to resend invite. Please try again.");
          } finally {
            setSendingEmail(false);
          }
        }
      });
    }

    // Resume action for PAUSED
    if (candidate.status === 'PAUSED' && candidate.sessionId) {
      actions.push({
        label: '▶ Resume Session',
        onClick: () => handleResume(candidate.sessionId!)
      });
    }

    return actions;
  };

  const isLoading = jobLoading || candidatesLoading;

  return (
    <JobDetailLayout jobTitle={job.title || 'Job Details'} companyName={companyName || job.companyName || 'Company'}>
      <LoadingOverlay isLoading={sendingEmail} message="Sending email invitation..." />
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total', count: Array.isArray(candidates) ? candidates.length : 0, color: 'bg-gray-100 text-gray-700' },
          { label: 'Pending', count: Array.isArray(candidates) ? candidates.filter(c => c.status === 'PENDING').length : 0, color: 'bg-gray-100 text-gray-600' },
          { label: 'Invited', count: Array.isArray(candidates) ? candidates.filter(c => c.status === 'INVITED').length : 0, color: 'bg-blue-100 text-blue-700' },
          { label: 'Review', count: Array.isArray(candidates) ? candidates.filter(c => c.status === 'REVIEW' || (c.status as string) === 'COMPLETED').length : 0, color: 'bg-purple-100 text-purple-700' },
          { label: 'Shortlisted', count: Array.isArray(candidates) ? candidates.filter(c => c.status === 'SHORTLISTED').length : 0, color: 'bg-green-100 text-green-700' },
          { label: 'Rejected', count: Array.isArray(candidates) ? candidates.filter(c => c.status === 'REJECTED').length : 0, color: 'bg-red-100 text-red-700' },
        ].map(stat => (
          <div key={stat.label} className={`p-4 rounded-xl text-center ${stat.color}`}>
            <div className="text-2xl font-black">{isLoading ? '-' : stat.count}</div>
            <div className="text-xs font-bold uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Candidates Table */}
      <Card className="p-0 border-none shadow-xl min-h-[500px]">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48 ml-auto" />
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-2">No Candidates Yet</h3>
            <p className="text-gray-400 text-sm">Invite candidates to start receiving responses.</p>
          </div>
        ) : (
          <Table headers={['Candidate', 'Status', 'Score', 'Fit', 'Interview Date', 'Actions']}>
            {candidates.map(candidate => (
              <tr key={candidate.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {
                setSelectedCandidate(candidate);
                if (candidate.sessionId) fetchSession(candidate.sessionId);
              }}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {candidate.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{candidate.name}</div>
                      <div className="text-xs text-gray-500">{candidate.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <CandidateStatusBadge status={candidate.status} />
                </td>
                <td className="px-6 py-4">
                  <ScoreIndicator score={candidate.score} />
                </td>
                <td className="px-6 py-4">
                  <FitIndicator isFit={candidate.isFit} />
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 font-medium" suppressHydrationWarning={true}>
                  {candidate.completedAt
                    ? `${new Date(candidate.completedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })} (UTC)`
                    : candidate.invitedAt
                      ? `Invited ${new Date(candidate.invitedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })} (UTC)`
                      : 'Pending'
                  }
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  {updating === candidate.id ? (
                    <span className="text-xs text-gray-400 animate-pulse font-black">Updating...</span>
                  ) : (
                    <Dropdown
                      trigger={
                        <Button variant="ghost" className="p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </Button>
                      }
                      items={getStatusActions(candidate)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Candidate Detail Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => { setSelectedCandidate(null); setSessionData(null); }}
        title={selectedCandidate?.name || 'Candidate Details'}
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {selectedCandidate.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selectedCandidate.name}</h3>
                  <p className="text-sm font-bold text-gray-500">{selectedCandidate.email}</p>
                </div>
              </div>
              {/* Re-interview visibility: Enabled for ALL candidates as requested */}
              <Button variant="secondary" className="text-xs font-black uppercase tracking-widest border-2" onClick={() => setReInterviewConfirm(selectedCandidate.id)}>↺ Re-Interview</Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Current Status</div>
                <CandidateStatusBadge status={selectedCandidate.status} />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Overall Score</div>
                <div className="flex items-center space-x-2">
                  <ScoreIndicator score={sessionData?.session?.overallScore || selectedCandidate.score} />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">AI Assessment</div>
                <FitIndicator isFit={sessionData?.evaluation?.isFit ?? selectedCandidate.isFit} />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Integrity</div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${sessionData?.session?.isFlagged ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-green-100 text-green-600 border border-green-200'}`}>
                    {sessionData?.session?.isFlagged ? 'FLAGGED' : 'CLEAR'}
                  </span>
                  {sessionData?.session?.warningCount > 0 && (
                    <span className="text-[10px] font-black text-orange-600">({sessionData.session.warningCount} W)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Evaluation Metrics */}
            {sessionData?.evaluation?.metrics && (
              <div className="mt-6">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Evaluation Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(Array.isArray(sessionData.evaluation.metrics) ? sessionData.evaluation.metrics : []).map((metric: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">{metric.name}</span>
                        <span className="text-lg font-black text-blue-600">{metric.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">{metric.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation Summary */}
            {sessionData?.evaluation && (
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2">AI Reasoning</h4>
                <p className="text-sm text-blue-800 leading-relaxed">{sessionData.evaluation.reasoning}</p>
                {sessionData.evaluation.behavioralNote && (
                  <>
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 mt-4">Behavioral Note</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">{sessionData.evaluation.behavioralNote}</p>
                  </>
                )}
              </div>
            )}

            {/* Conversation History */}
            <div className="mt-8">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Interview Conversation</h4>
              <div className="bg-gray-50 rounded-[2rem] border-2 border-gray-100 p-6 max-h-[500px] overflow-y-auto space-y-6">
                {sessionLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-gray-400 uppercase mt-4 tracking-widest">Loading Transcript...</p>
                  </div>
                ) : sessionData?.responses?.length > 0 ? (
                  sessionData.responses.map((resp: any, idx: number) => (
                    <div key={resp.id} className="space-y-4">
                      {/* AI Question */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black">AI</div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-800 font-medium leading-relaxed">
                          {resp.questionText}
                        </div>
                      </div>
                      {/* Candidate Answer */}
                      <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black">YOU</div>
                        <div className="flex flex-col items-end w-full">
                          <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-md text-sm text-white font-medium leading-relaxed max-w-[80%]">
                            {resp.candidateAnswer}
                          </div>
                          {/* Turn Rating */}
                          {(resp.techScore || resp.commScore || resp.overfitScore || resp.aiFlagged) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {resp.techScore && (
                                <div className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[9px] font-black uppercase border border-green-100">TECH: {resp.techScore}%</div>
                              )}
                              {resp.commScore && (
                                <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase border border-blue-100">COMM: {resp.commScore}%</div>
                              )}
                              {resp.overfitScore && (
                                <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${resp.overfitScore > 70 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                  ROBOTIC: {resp.overfitScore}%
                                </div>
                              )}
                              {resp.aiFlagged && (
                                <div className="px-2 py-1 bg-red-600 text-white rounded-md text-[9px] font-black uppercase border border-red-700 animate-pulse">AI FLAG: MALPRACTICE</div>
                              )}
                            </div>
                          )}
                          {resp.turnFeedback && <p className="text-[10px] text-gray-400 mt-1 italic pr-2">{resp.turnFeedback}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400 font-bold italic">No transcript available for this session.</div>
                )}
              </div>
            </div>

            {/* Proctoring Events */}
            {sessionData?.proctoringLogs && sessionData.proctoringLogs.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Proctoring Events</h4>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {sessionData.proctoringLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded">
                        <span className="font-medium text-gray-700">{log.type}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.severity === 'high' ? 'bg-red-100 text-red-600' : log.severity === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {log.severity}
                          </span>
                          <span className="text-gray-400" suppressHydrationWarning={true}>{new Date(log.timestamp).toLocaleTimeString()} (UTC)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!['PENDING', 'INVITED', 'EXPIRED'].includes(selectedCandidate.status) && (
              <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-100">
                {selectedCandidate.status !== 'SHORTLISTED' && (
                  <Button variant="secondary" className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-xs" onClick={() => handleStatusChange(selectedCandidate.id, 'SHORTLISTED')}>✓ Shortlist</Button>
                )}
                {selectedCandidate.status !== 'REJECTED' && (
                  <Button variant="ghost" className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-xs text-red-500 hover:bg-red-50" onClick={() => handleStatusChange(selectedCandidate.id, 'REJECTED')}>✗ Reject</Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Re-interview Confirmation Modal */}
      <Modal
        isOpen={!!reInterviewConfirm}
        onClose={() => setReInterviewConfirm(null)}
        title="Confirm Re-interview"
      >
        <div className="space-y-6 py-4">
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start space-x-3">
            <span className="text-2xl mt-1">⚠️</span>
            <div>
              <p className="text-orange-800 font-black text-sm uppercase tracking-wider mb-1">Important Action</p>
              <p className="text-orange-700 text-sm font-bold">This will reset the candidate's interview session and allow them to take it again from the beginning. A new invitation email will be sent automatically with a **UTC** timestamp.</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="secondary" className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-xs" onClick={() => setReInterviewConfirm(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200" onClick={() => handleReInterview(reInterviewConfirm!)}>Confirm & Send Invite</Button>
          </div>
        </div>
      </Modal>
    </JobDetailLayout>
  );
}

export default function JobResponses() {
  return (
    <Suspense fallback={
      <JobDetailLayout jobTitle="Loading..." companyName="">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </JobDetailLayout>
    }>
      <JobResponsesContent />
    </Suspense>
  );
}
