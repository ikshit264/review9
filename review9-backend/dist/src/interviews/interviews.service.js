"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const gemini_service_1 = require("../common/gemini.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let InterviewsService = class InterviewsService {
    constructor(prisma, geminiService, notificationsService) {
        this.prisma = prisma;
        this.geminiService = geminiService;
        this.notificationsService = notificationsService;
    }
    async getInterviewByToken(token) {
        console.log(`[Interviews] Searching for candidate with token: ${token}`);
        let candidate;
        if (token === 'test-me') {
            await this.getOrCreateTestEnvironment();
            candidate = await this.prisma.candidate.findFirst({
                where: { email: 'test-candidate@example.com' },
                include: {
                    job: {
                        include: {
                            company: { select: { id: true, name: true } },
                        },
                    },
                },
            });
        }
        else {
            candidate = await this.prisma.candidate.findUnique({
                where: { interviewLink: token },
                include: {
                    job: {
                        include: {
                            company: { select: { id: true, name: true } },
                        },
                    },
                },
            });
        }
        if (!candidate) {
            console.warn(`[Interviews] Candidate NOT FOUND for token: ${token}`);
            throw new common_1.NotFoundException('Interview not found');
        }
        console.log(`[Interviews] Found candidate: ${candidate.name} (${candidate.email}) for job: ${candidate.job.title}`);
        const now = new Date();
        const startTime = new Date(candidate.interviewStartTime || candidate.job.interviewStartTime);
        const endTime = new Date(candidate.interviewEndTime || candidate.job.interviewEndTime);
        const timeUntilStart = startTime.getTime() - now.getTime();
        const timeUntilEnd = endTime.getTime() - now.getTime();
        const canStartNow = now >= startTime && now < endTime;
        const isExpired = now >= endTime;
        const isBeforeStart = now < startTime;
        if (candidate.status === client_1.CandidateStatus.INVITED && isExpired) {
            const ongoingSession = await this.prisma.interviewSession.findFirst({
                where: { jobId: candidate.jobId, candidate: { email: candidate.email }, status: client_1.Status.ONGOING },
            });
            if (!ongoingSession) {
                candidate = await this.prisma.candidate.update({
                    where: { id: candidate.id },
                    data: { status: client_1.CandidateStatus.EXPIRED },
                    include: {
                        job: {
                            include: {
                                company: { select: { id: true, name: true } },
                            },
                        },
                    },
                });
            }
        }
        return {
            candidateId: candidate.id,
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            status: candidate.status,
            interviewStartTime: candidate.interviewStartTime || candidate.job.interviewStartTime,
            interviewEndTime: candidate.interviewEndTime || candidate.job.interviewEndTime,
            canStartNow,
            isExpired,
            isBeforeStart,
            timeUntilStart: Math.max(0, timeUntilStart),
            timeUntilEnd: Math.max(0, timeUntilEnd),
            job: {
                id: candidate.job.id,
                title: candidate.job.title,
                roleCategory: candidate.job.roleCategory,
                description: candidate.job.description,
                interviewStartTime: candidate.job.interviewStartTime,
                interviewEndTime: candidate.job.interviewEndTime,
                tabTracking: candidate.job.tabTracking,
                eyeTracking: candidate.job.eyeTracking,
                multiFaceDetection: candidate.job.multiFaceDetection,
                screenRecording: candidate.job.screenRecording,
                companyName: candidate.job.company.name,
                timezone: candidate.job.timezone,
            },
        };
    }
    async getInterviewSession(sessionId) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                responses: { orderBy: { timestamp: 'asc' } },
                proctoringLogs: { orderBy: { timestamp: 'desc' } },
                job: true,
                candidate: { select: { id: true, name: true, email: true } },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return session;
    }
    async startInterview(dto, userId) {
        const { interviewToken: token, resumeUrl, resumeText } = dto;
        const candidate = await this.prisma.candidate.findUnique({
            where: { interviewLink: token },
            include: { job: true },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Interview not found');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isProfileComplete) {
            throw new common_1.ForbiddenException('Please complete your profile before starting the interview');
        }
        const now = new Date();
        const startTime = new Date(candidate.interviewStartTime || candidate.job.interviewStartTime);
        const endTime = new Date(candidate.interviewEndTime || candidate.job.interviewEndTime);
        if (now < startTime) {
            throw new common_1.ForbiddenException(`Interview has not started yet. It will begin at ${startTime.toLocaleString()}`);
        }
        if (now >= endTime) {
            throw new common_1.ForbiddenException('Interview window has expired. Please contact the company for a re-interview.');
        }
        if (candidate.status === client_1.CandidateStatus.REVIEW ||
            candidate.status === client_1.CandidateStatus.REJECTED ||
            candidate.status === client_1.CandidateStatus.CONSIDERED ||
            candidate.status === client_1.CandidateStatus.SHORTLISTED) {
            throw new common_1.ForbiddenException('Interview already completed');
        }
        if (candidate.status === client_1.CandidateStatus.EXPIRED) {
            throw new common_1.ForbiddenException('Interview window has expired. Please contact the company for a re-interview.');
        }
        if (candidate.status !== client_1.CandidateStatus.INVITED) {
            throw new common_1.ForbiddenException('You must accept the interview invitation before starting');
        }
        const existingSession = await this.prisma.interviewSession.findFirst({
            where: { candidateId: userId, jobId: candidate.jobId },
        });
        if (existingSession) {
            if (existingSession.status === client_1.Status.PAUSED) {
                throw new common_1.ForbiddenException('Interview is paused due to malpractice. Please contact the company to resume.');
            }
            if (existingSession.hasStarted && existingSession.status === client_1.Status.COMPLETED) {
                throw new common_1.ForbiddenException('Interview already completed');
            }
            if (!existingSession.hasStarted) {
                await this.prisma.interviewSession.update({
                    where: { id: existingSession.id },
                    data: { hasStarted: true, status: client_1.Status.ONGOING }
                });
            }
            return existingSession;
        }
        const session = await this.prisma.interviewSession.create({
            data: {
                candidateId: userId,
                jobId: candidate.jobId,
                status: client_1.Status.ONGOING,
                hasStarted: true,
            },
        });
        if (resumeText) {
            await this.prisma.candidate.update({
                where: { id: candidate.id },
                data: {
                    resumeText,
                    status: client_1.CandidateStatus.INVITED
                },
            });
            if (resumeUrl) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { resumeUrl }
                });
            }
        }
        else {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user?.resumeUrl && !candidate.resumeText) {
            }
            await this.prisma.candidate.update({
                where: { id: candidate.id },
                data: { status: client_1.CandidateStatus.INVITED },
            });
        }
        return session;
    }
    async pauseInterview(sessionId, reason) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                job: {
                    include: { company: true }
                }
            }
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const updatedSession = await this.prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: client_1.Status.PAUSED,
                isInterrupted: true,
                malpracticeCount: { increment: 1 }
            }
        });
        await this.notificationsService.create({
            title: 'Interview Paused - Malpractice Detected',
            message: `Candidate session ${sessionId} paused. Reason: ${reason}`,
            link: `/dashboard`,
            type: client_1.NotificationType.INAPP,
            email: session.job.company?.email || ''
        }, session.job.companyId);
        return updatedSession;
    }
    async resumeInterview(sessionId, userId) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { job: true }
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.job.companyId !== userId) {
            throw new common_1.ForbiddenException('Only the company can resume this interview');
        }
        return this.prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: client_1.Status.ONGOING,
                isInterrupted: false
            }
        });
    }
    async getInitialQuestions(sessionId) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { job: { include: { company: true } } }
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const user = await this.prisma.user.findUnique({ where: { id: session.candidateId } });
        const candidate = await this.prisma.candidate.findUnique({
            where: { jobId_email: { jobId: session.jobId, email: user?.email || '' } }
        });
        const plan = session.job.planAtCreation;
        const count = plan === 'FREE' ? 12 : 1;
        const questions = await this.geminiService.generateQuestions({
            jobTitle: session.job.title,
            jobDescription: session.job.description,
            roleCategory: session.job.roleCategory,
            resumeText: candidate?.resumeText || '',
            customQuestions: session.job.customQuestions,
            aiSpecificRequirements: session.job.aiSpecificRequirements,
        }, count);
        return questions;
    }
    async respondToInterview(sessionId, answer, res) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                job: true,
                responses: { orderBy: { timestamp: 'asc' } }
            }
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.Status.ONGOING)
            throw new common_1.ForbiddenException('Interview is not active');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        const context = {
            jobTitle: session.job.title,
            jobDescription: session.job.description,
            resumeText: ''
        };
        const history = session.responses.map(r => ({
            question: r.questionText,
            answer: r.candidateAnswer
        }));
        try {
            const stream = this.geminiService.getStreamResponse(context, history, answer);
            let fullAIText = '';
            for await (const chunk of stream) {
                fullAIText += chunk;
                res.write(chunk);
            }
            const lastResponse = session.responses[session.responses.length - 1];
            let techScore = null;
            let commScore = null;
            let overfitScore = null;
            let aiFlagged = false;
            let turnFeedback = null;
            if (session.job.planAtCreation !== 'FREE') {
                try {
                    const rating = await this.geminiService.rateTurn(lastResponse?.questionText || "Initial Question", answer);
                    techScore = rating.techScore;
                    commScore = rating.commScore;
                    overfitScore = rating.overfitScore;
                    aiFlagged = rating.aiFlagged;
                    turnFeedback = rating.feedback;
                }
                catch (e) {
                    console.error("Turn rating failed:", e);
                }
            }
            await this.prisma.interviewResponse.create({
                data: {
                    sessionId,
                    questionText: lastResponse?.questionText || "Initial Question",
                    candidateAnswer: answer,
                    aiAcknowledgment: fullAIText.split('?')[0] || '',
                    techScore,
                    commScore,
                    overfitScore,
                    aiFlagged,
                    turnFeedback
                }
            });
            if (aiFlagged) {
                await this.logProctoringEvent(sessionId, {
                    type: 'AI_DETECTION',
                    severity: 'high'
                });
            }
            res.end();
        }
        catch (error) {
            console.error('Streaming error:', error);
            res.status(500).end('Error generating response');
        }
    }
    async respondToInterviewSync(sessionId, answer) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                job: true,
                responses: { orderBy: { timestamp: 'asc' } }
            }
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.Status.ONGOING)
            throw new common_1.ForbiddenException('Interview is not active');
        const context = {
            jobTitle: session.job.title,
            jobDescription: session.job.description,
            resumeText: ''
        };
        const history = session.responses.map(r => ({
            question: r.questionText,
            answer: r.candidateAnswer
        }));
        const stream = this.geminiService.getStreamResponse(context, history, answer);
        let fullAIText = '';
        for await (const chunk of stream) {
            fullAIText += chunk;
        }
        const lastResponse = session.responses[session.responses.length - 1];
        let techScore = null;
        let commScore = null;
        let overfitScore = null;
        let aiFlagged = false;
        let turnFeedback = null;
        if (session.job.planAtCreation !== 'FREE') {
            try {
                const rating = await this.geminiService.rateTurn(lastResponse?.questionText || "Initial Question", answer);
                techScore = rating.techScore;
                commScore = rating.commScore;
                overfitScore = rating.overfitScore;
                aiFlagged = rating.aiFlagged;
                turnFeedback = rating.feedback;
            }
            catch (e) {
                console.error("Turn rating failed:", e);
            }
        }
        await this.prisma.interviewResponse.create({
            data: {
                sessionId,
                questionText: lastResponse?.questionText || "Initial Question",
                candidateAnswer: answer,
                aiAcknowledgment: fullAIText.split('?')[0] || '',
                techScore,
                commScore,
                overfitScore,
                aiFlagged,
                turnFeedback
            }
        });
        if (aiFlagged) {
            await this.logProctoringEvent(sessionId, {
                type: 'AI_DETECTION',
                severity: 'high'
            });
        }
        return { reply: fullAIText };
    }
    async saveTranscript(sessionId, dto) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { job: true }
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.status !== client_1.Status.ONGOING) {
            throw new common_1.BadRequestException('Session is not active');
        }
        let techScore, commScore, overfitScore, aiFlagged, turnFeedback;
        try {
            const rating = await this.geminiService.rateTurn(dto.questionText, dto.candidateAnswer);
            techScore = rating.techScore;
            commScore = rating.commScore;
            overfitScore = rating.overfitScore;
            aiFlagged = rating.aiFlagged;
            turnFeedback = rating.feedback;
        }
        catch (e) {
            console.error('Turn rating failed:', e);
        }
        const response = await this.prisma.interviewResponse.create({
            data: {
                sessionId,
                questionText: dto.questionText,
                candidateAnswer: dto.candidateAnswer,
                aiAcknowledgment: dto.aiAcknowledgment,
                techScore,
                commScore,
                overfitScore,
                aiFlagged,
                turnFeedback,
            },
        });
        if (aiFlagged) {
            await this.logProctoringEvent(sessionId, {
                type: 'AI_DETECTION',
                severity: 'high'
            });
        }
        return response;
    }
    async logProctoringEvent(sessionId, dto) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const log = await this.prisma.proctoringLog.create({
            data: {
                sessionId,
                type: dto.type,
                severity: dto.severity,
            },
        });
        if (dto.severity === 'high') {
            const newWarningCount = session.warningCount + 1;
            if (newWarningCount >= 3) {
                await this.prisma.interviewSession.update({
                    where: { id: sessionId },
                    data: {
                        isFlagged: true,
                        status: client_1.Status.FAILED,
                        endTime: new Date(),
                        warningCount: newWarningCount
                    }
                });
                return { log, status: 'FLAGGED', warningCount: newWarningCount, terminated: true };
            }
            else {
                await this.prisma.interviewSession.update({
                    where: { id: sessionId },
                    data: {
                        status: client_1.Status.PAUSED,
                        warningCount: newWarningCount,
                        isInterrupted: true
                    }
                });
                return { log, status: 'WARNING', warningCount: newWarningCount, terminated: false };
            }
        }
        return { log, status: 'LOGGED', terminated: false };
    }
    async acknowledgeWarning(sessionId, userId) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.candidateId !== userId)
            throw new common_1.ForbiddenException('Unauthorized');
        if (session.status !== client_1.Status.PAUSED || !session.isInterrupted) {
            return session;
        }
        return this.prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: client_1.Status.ONGOING,
                isInterrupted: false
            }
        });
    }
    async completeInterview(sessionId) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                responses: true,
                job: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const candidate = await this.prisma.candidate.findFirst({
            where: { jobId: session.jobId },
        });
        const evaluation = await this.geminiService.evaluateInterview({
            jobTitle: session.job.title,
            jobDescription: session.job.description,
            roleCategory: session.job.roleCategory,
            resumeText: candidate?.resumeText || '',
            responses: session.responses.map(r => ({
                question: r.questionText,
                answer: r.candidateAnswer,
            })),
            aiSpecificRequirements: session.job.aiSpecificRequirements,
        });
        const savedEvaluation = await this.prisma.finalEvaluation.upsert({
            where: { sessionId },
            update: {
                overallScore: evaluation.overallScore,
                isFit: evaluation.isFit,
                reasoning: evaluation.reasoning,
                behavioralNote: evaluation.behavioralNote,
                metrics: evaluation.metrics,
            },
            create: {
                sessionId,
                overallScore: evaluation.overallScore,
                isFit: evaluation.isFit,
                reasoning: evaluation.reasoning,
                behavioralNote: evaluation.behavioralNote,
                metrics: evaluation.metrics,
            },
        });
        await this.prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: client_1.Status.COMPLETED,
                endTime: new Date(),
                overallScore: evaluation.overallScore,
            },
        });
        if (candidate) {
            await this.prisma.candidate.update({
                where: { id: candidate.id },
                data: { status: client_1.CandidateStatus.REVIEW },
            });
            const company = await this.prisma.user.findUnique({ where: { id: session.job.companyId } });
            await this.notificationsService.create({
                title: 'Interview Completed',
                message: `Candidate ${candidate.name} has completed the interview for ${session.job.title}. Result: ${evaluation.isFit ? 'Fit' : 'Unfit'} (${evaluation.overallScore}%)`,
                link: `/dashboard`,
                type: client_1.NotificationType.INAPP,
                email: company?.email || ''
            }, session.job.companyId);
        }
        return savedEvaluation;
    }
    async getEvaluation(sessionId) {
        const evaluation = await this.prisma.finalEvaluation.findUnique({
            where: { sessionId },
            include: {
                session: {
                    include: {
                        job: { select: { title: true, roleCategory: true } },
                        candidate: { select: { name: true, email: true } },
                        responses: true,
                        proctoringLogs: true,
                    },
                },
            },
        });
        if (!evaluation) {
            throw new common_1.NotFoundException('Evaluation not found');
        }
        return evaluation;
    }
    async getSessionReport(sessionId) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                job: {
                    include: { company: true }
                },
                candidate: true,
                responses: {
                    orderBy: { timestamp: 'asc' }
                },
                evaluation: true,
                proctoringLogs: {
                    orderBy: { timestamp: 'asc' }
                }
            }
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return {
            session: {
                id: session.id,
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status,
                overallScore: session.overallScore,
                isFlagged: session.isFlagged,
                warningCount: session.warningCount,
                malpracticeCount: session.malpracticeCount,
            },
            job: {
                title: session.job.title,
                description: session.job.description,
                roleCategory: session.job.roleCategory,
                company: session.job.company?.name,
            },
            candidate: session.candidate ? {
                name: session.candidate.name,
                email: session.candidate.email,
            } : null,
            responses: session.responses.map(r => ({
                id: r.id,
                questionText: r.questionText,
                candidateAnswer: r.candidateAnswer,
                aiAcknowledgment: r.aiAcknowledgment,
                techScore: r.techScore,
                commScore: r.commScore,
                overfitScore: r.overfitScore,
                aiFlagged: r.aiFlagged,
                turnFeedback: r.turnFeedback,
                timestamp: r.timestamp,
            })),
            evaluation: session.evaluation,
            proctoringLogs: session.proctoringLogs.map(log => ({
                id: log.id,
                type: log.type,
                severity: log.severity,
                timestamp: log.timestamp,
            })),
        };
    }
    async getCandidateInvitations(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        const invitations = await this.prisma.candidate.findMany({
            where: { email },
            include: {
                job: {
                    include: {
                        company: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const result = [];
        for (const invitation of invitations) {
            let session = null;
            if (user) {
                session = await this.prisma.interviewSession.findFirst({
                    where: { candidateId: user.id, jobId: invitation.jobId },
                    select: { id: true, status: true, hasStarted: true, startTime: true, endTime: true }
                });
            }
            result.push({
                ...invitation,
                session: session || null,
                interviewStartTime: invitation.interviewStartTime,
                interviewEndTime: invitation.interviewEndTime,
                isReInterviewed: invitation.isReInterviewed,
                currentStatus: session ? (session.status === client_1.Status.COMPLETED ? 'COMPLETED' : session.hasStarted ? 'ONGOING' : session.status) : invitation.status
            });
        }
        return result;
    }
    async terminateSession(sessionId, status) {
        await this.prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status,
                endTime: new Date(),
            },
        });
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
        });
        if (session) {
            await this.prisma.candidate.updateMany({
                where: { jobId: session.jobId },
                data: { status: client_1.CandidateStatus.REVIEW },
            });
        }
    }
    async getOrCreateTestEnvironment(requestedPlan) {
        const planToUse = requestedPlan || client_1.Plan.FREE;
        let company = await this.prisma.user.findFirst({
            where: { email: 'test-company@example.com' }
        });
        if (!company) {
            company = await this.prisma.user.create({
                data: {
                    email: 'test-company@example.com',
                    password: 'test-password',
                    name: 'Test Company',
                    role: client_1.Role.COMPANY,
                    isProfileComplete: true,
                }
            });
        }
        let job = await this.prisma.job.findFirst({
            where: { title: 'Full Stack Intern - Test', companyId: company.id }
        });
        if (!job) {
            job = await this.prisma.job.create({
                data: {
                    title: 'Full Stack Intern - Test',
                    description: 'This is a test job for a Full Stack Intern position. Requirements: React, Node.js, Prisma, PostgreSQL.',
                    roleCategory: 'Engineering',
                    companyId: company.id,
                    planAtCreation: planToUse,
                    interviewStartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    interviewEndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            });
        }
        else if (job.planAtCreation !== planToUse) {
            job = await this.prisma.job.update({
                where: { id: job.id },
                data: { planAtCreation: planToUse }
            });
        }
        let candidateUser = await this.prisma.user.findFirst({
            where: { email: 'test-candidate@example.com' }
        });
        if (!candidateUser) {
            candidateUser = await this.prisma.user.create({
                data: {
                    email: 'test-candidate@example.com',
                    password: 'test-password',
                    name: 'Test Candidate',
                    role: client_1.Role.CANDIDATE,
                    plan: planToUse,
                    isProfileComplete: true,
                    activeSessionToken: 'test-session-token',
                }
            });
        }
        else if (candidateUser.plan !== planToUse) {
            candidateUser = await this.prisma.user.update({
                where: { id: candidateUser.id },
                data: { plan: planToUse }
            });
        }
        let candidate = await this.prisma.candidate.findUnique({
            where: { jobId_email: { jobId: job.id, email: candidateUser.email } }
        });
        const resumeText = `
            EXPERIENCE
            Full Stack Development Personal Projects
            - Built a robust task management application using React, Node.js, and MongoDB.
            - Implemented user authentication with JWT and secure password hashing.
            - Designed and integrated a responsive user interface with CSS3 and Tailwind CSS.
 
            SKILLS
            - Languages: JavaScript (ES6+), HTML5, CSS3, SQL
            - Frameworks/Libraries: React, Node.js, Express, Next.js
            - Tools: Git, Docker, Prisma, PostgreSQL
            - Soft Skills: Problem-solving, Team collaboration, Technical writing
        `;
        if (!candidate) {
            candidate = await this.prisma.candidate.create({
                data: {
                    jobId: job.id,
                    email: candidateUser.email,
                    name: candidateUser.name,
                    interviewLink: 'test-me-token-' + Date.now(),
                    status: client_1.CandidateStatus.INVITED,
                    resumeText,
                }
            });
        }
        else {
            candidate = await this.prisma.candidate.update({
                where: { id: candidate.id },
                data: {
                    status: client_1.CandidateStatus.INVITED,
                    interviewLink: 'test-me-token-' + Date.now(),
                    resumeText
                }
            });
        }
        let session = await this.prisma.interviewSession.findFirst({
            where: { candidateId: candidateUser.id, jobId: job.id }
        });
        if (session && session.status === client_1.Status.COMPLETED) {
            await this.prisma.interviewSession.delete({ where: { id: session.id } });
            session = null;
        }
        if (!session) {
            session = await this.prisma.interviewSession.create({
                data: {
                    candidateId: candidateUser.id,
                    jobId: job.id,
                    status: client_1.Status.ONGOING,
                    hasStarted: true,
                }
            });
        }
        return {
            session,
            user: candidateUser,
            candidate,
        };
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gemini_service_1.GeminiService,
        notifications_service_1.NotificationsService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map