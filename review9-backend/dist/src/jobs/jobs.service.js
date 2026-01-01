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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const email_service_1 = require("../common/email.service");
const config_1 = require("@nestjs/config");
const notifications_service_1 = require("../notifications/notifications.service");
const client_2 = require("@prisma/client");
let JobsService = class JobsService {
    constructor(prisma, emailService, configService, notificationsService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.invitationProgress = new Map();
    }
    async createJob(userId, userPlan, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== client_1.Role.COMPANY) {
            throw new common_1.ForbiddenException('Only companies can create jobs');
        }
        const startTime = new Date(dto.interviewStartTime);
        const endTime = new Date(dto.interviewEndTime);
        const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        if (diffMinutes < 0) {
            throw new common_1.BadRequestException('Interview end time cannot be before start time');
        }
        if (diffMinutes < 30) {
            throw new common_1.BadRequestException('Interview end time must be at least 30 minutes after start time');
        }
        let jobSettings = {
            tabTracking: dto.tabTracking ?? true,
            eyeTracking: dto.eyeTracking ?? false,
            multiFaceDetection: dto.multiFaceDetection ?? false,
            screenRecording: dto.screenRecording ?? false,
            fullScreenMode: dto.fullScreenMode ?? false,
            noTextTyping: dto.noTextTyping ?? false,
        };
        if (userPlan === client_1.Plan.FREE) {
            jobSettings.eyeTracking = false;
            jobSettings.multiFaceDetection = false;
            jobSettings.screenRecording = false;
        }
        if (userPlan === client_1.Plan.PRO) {
            jobSettings.multiFaceDetection = false;
        }
        const job = await this.prisma.job.create({
            data: {
                title: dto.title,
                roleCategory: dto.roleCategory,
                description: dto.description,
                notes: dto.notes,
                companyId: userId,
                interviewStartTime: new Date(dto.interviewStartTime),
                interviewEndTime: new Date(dto.interviewEndTime),
                planAtCreation: userPlan ?? client_1.Plan.FREE,
                timezone: dto.timezone,
                customQuestions: dto.customQuestions || [],
                aiSpecificRequirements: dto.aiSpecificRequirements,
                ...jobSettings,
            },
        });
        return job;
    }
    async getJobs(userId) {
        const jobs = await this.prisma.job.findMany({
            where: { companyId: userId },
            include: {
                candidates: true,
                sessions: {
                    include: {
                        candidate: { select: { email: true } }
                    }
                },
                _count: {
                    select: { candidates: true, sessions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return jobs.map(job => ({
            ...job,
            candidates: job.candidates.map(candidate => {
                const session = job.sessions.find(s => s.candidate.email === candidate.email);
                return this.mapCandidateWithSession(candidate, session);
            })
        }));
    }
    async getJobById(jobId, userId) {
        const job = await this.prisma.job.findFirst({
            where: { id: jobId, companyId: userId },
            include: {
                candidates: true,
                sessions: {
                    include: {
                        evaluation: true,
                        candidate: { select: { id: true, email: true } }
                    },
                },
            },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        return {
            ...job,
            candidates: job.candidates.map(candidate => {
                const session = job.sessions.find(s => s.candidate.email === candidate.email);
                return this.mapCandidateWithSession(candidate, session);
            })
        };
    }
    async inviteCandidates(jobId, userId, userPlan, dto) {
        const job = await this.prisma.job.findFirst({
            where: { id: jobId, companyId: userId },
            include: { candidates: true, company: true },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        if (userPlan === client_1.Plan.FREE) {
            const totalCandidates = job.candidates.length + dto.candidates.length;
            if (totalCandidates > 30) {
                throw new common_1.ForbiddenException('Free plan limited to 30 candidates per job. Upgrade to Pro for unlimited.');
            }
        }
        const progressKey = `${jobId}-${userId}`;
        this.invitationProgress.set(progressKey, {
            total: dto.candidates.length,
            current: 0,
            succeeded: 0,
            failed: 0,
            details: dto.candidates.map(c => ({
                email: c.email,
                status: 'pending',
            })),
            completed: false,
        });
        this.processInvitationsAsync(jobId, userId, userPlan, dto, job, progressKey)
            .catch(err => console.error('[Jobs] Invitation processing error:', err));
        return {
            message: 'Invitation processing started',
            progressKey,
            total: dto.candidates.length,
        };
    }
    async processInvitationsAsync(jobId, userId, userPlan, dto, job, progressKey) {
        const appUrl = this.configService.get('APP_URL');
        const progress = this.invitationProgress.get(progressKey);
        for (let i = 0; i < dto.candidates.length; i++) {
            const candidateDto = dto.candidates[i];
            try {
                if (progress) {
                    progress.details[i].status = 'sending';
                    progress.current = i + 1;
                }
                let candidate = await this.prisma.candidate.findFirst({
                    where: {
                        jobId,
                        email: candidateDto.email
                    }
                });
                if (candidate) {
                    candidate = await this.prisma.candidate.update({
                        where: { id: candidate.id },
                        data: {
                            name: candidateDto.name,
                            invitedAt: new Date()
                        }
                    });
                }
                else {
                    const interviewLink = (0, uuid_1.v4)();
                    candidate = await this.prisma.candidate.create({
                        data: {
                            jobId,
                            name: candidateDto.name,
                            email: candidateDto.email,
                            interviewLink,
                            invitedAt: new Date(),
                        },
                    });
                }
                await this.emailService.sendInterviewInvite({
                    to: candidate.email,
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    companyName: job.company.name,
                    scheduledTime: job.interviewStartTime,
                    interviewLink: `${appUrl}/interview/${candidate.interviewLink}`,
                    notes: job.notes,
                });
                const candidateUser = await this.prisma.user.findUnique({
                    where: { email: candidate.email }
                });
                const duration = job.planAtCreation === client_1.Plan.FREE ? '25 mins' : 'Unlimited';
                await this.notificationsService.create({
                    title: 'New Interview Scheduled',
                    message: `${job.company.name} has scheduled an interview for ${job.title} on ${job.interviewStartTime.toLocaleString()}. Duration: ${duration}.`,
                    link: `/interview/${candidate.interviewLink}`,
                    type: client_2.NotificationType.INAPP,
                    email: candidate.email
                }, candidateUser?.id);
                if (progress) {
                    progress.details[i].status = 'success';
                    progress.succeeded++;
                }
            }
            catch (error) {
                console.error(`[Jobs] Failed to invite ${candidateDto.email}:`, error);
                if (progress) {
                    progress.details[i].status = 'error';
                    progress.details[i].error = error.message || 'Failed to send invitation';
                    progress.failed++;
                }
            }
        }
        if (progress) {
            progress.completed = true;
        }
        setTimeout(() => {
            this.invitationProgress.delete(progressKey);
            console.log(`[Jobs] Cleaned up progress for ${progressKey}`);
        }, 5 * 60 * 1000);
    }
    async getJobAnalytics(jobId, userId) {
        const job = await this.prisma.job.findFirst({
            where: { id: jobId, companyId: userId },
            include: {
                candidates: true,
                sessions: {
                    include: {
                        evaluation: true,
                        proctoringLogs: true,
                    },
                },
            },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        const totalCandidates = job.candidates.length;
        const completedSessions = job.sessions.filter(s => s.status === 'COMPLETED').length;
        const fitCandidates = job.sessions.filter(s => s.evaluation?.isFit).length;
        const unfitCandidates = job.sessions.filter(s => s.evaluation && !s.evaluation.isFit).length;
        const incidentCounts = {
            tab_switch: 0,
            eye_distraction: 0,
            multiple_faces: 0,
            no_face: 0,
            other: 0,
        };
        let totalIncidents = 0;
        job.sessions.forEach(session => {
            session.proctoringLogs.forEach(log => {
                totalIncidents++;
                if (log.type in incidentCounts) {
                    incidentCounts[log.type]++;
                }
                else {
                    incidentCounts.other++;
                }
            });
        });
        const scoreDistribution = [0, 0, 0, 0, 0, 0, 0];
        let totalScore = 0;
        let scoredSessions = 0;
        job.sessions.forEach(session => {
            if (session.evaluation?.overallScore !== undefined) {
                const score = session.evaluation.overallScore;
                totalScore += score;
                scoredSessions++;
                if (score <= 20)
                    scoreDistribution[0]++;
                else if (score <= 40)
                    scoreDistribution[1]++;
                else if (score <= 50)
                    scoreDistribution[2]++;
                else if (score <= 60)
                    scoreDistribution[3]++;
                else if (score <= 70)
                    scoreDistribution[4]++;
                else if (score <= 80)
                    scoreDistribution[5]++;
                else
                    scoreDistribution[6]++;
            }
        });
        const statusCounts = {
            pending: job.candidates.filter((c) => c.status === 'PENDING').length,
            invited: job.candidates.filter((c) => c.status === 'INVITED').length,
            review: job.candidates.filter((c) => c.status === 'REVIEW').length,
            rejected: job.candidates.filter((c) => c.status === 'REJECTED').length,
            considered: job.candidates.filter((c) => c.status === 'CONSIDERED').length,
            shortlisted: job.candidates.filter((c) => c.status === 'SHORTLISTED').length,
        };
        const completionRate = totalCandidates > 0 ? Math.round((completedSessions / totalCandidates) * 100) : 0;
        const avgScore = scoredSessions > 0 ? Math.round(totalScore / scoredSessions) : 0;
        const integrityRate = completedSessions > 0
            ? Math.round(((completedSessions * 10 - totalIncidents) / (completedSessions * 10)) * 100)
            : 100;
        const timeSavedHours = Math.round(completedSessions * 0.75);
        return {
            totalCandidates,
            completedSessions,
            fitCandidates,
            unfitCandidates,
            pendingCandidates: totalCandidates - completedSessions,
            completionRate,
            avgScore,
            integrityRate,
            timeSavedHours,
            incidentCounts,
            scoreDistribution,
            statusCounts,
        };
    }
    async updateJob(jobId, userId, userPlan, dto) {
        const job = await this.prisma.job.findFirst({
            where: { id: jobId, companyId: userId },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        const updateData = { ...dto };
        if (dto.interviewStartTime) {
            updateData.interviewStartTime = new Date(dto.interviewStartTime);
        }
        if (dto.interviewEndTime) {
            updateData.interviewEndTime = new Date(dto.interviewEndTime);
        }
        if (userPlan === client_1.Plan.FREE) {
            updateData.eyeTracking = false;
            updateData.multiFaceDetection = false;
            updateData.screenRecording = false;
        }
        if (userPlan === client_1.Plan.PRO) {
            updateData.multiFaceDetection = false;
        }
        return this.prisma.job.update({
            where: { id: jobId },
            data: {
                ...updateData,
                timezone: dto.timezone || job.timezone,
                fullScreenMode: dto.fullScreenMode !== undefined ? dto.fullScreenMode : job.fullScreenMode,
                noTextTyping: dto.noTextTyping !== undefined ? dto.noTextTyping : job.noTextTyping,
                customQuestions: dto.customQuestions !== undefined ? dto.customQuestions : job.customQuestions,
                aiSpecificRequirements: dto.aiSpecificRequirements !== undefined ? dto.aiSpecificRequirements : job.aiSpecificRequirements,
            },
        });
    }
    async getJobCandidates(jobId, userId) {
        const job = await this.prisma.job.findFirst({
            where: { id: jobId, companyId: userId },
            include: {
                candidates: true,
                sessions: {
                    include: {
                        evaluation: true,
                        candidate: { select: { id: true, email: true } }
                    },
                },
            },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        const candidatesWithData = job.candidates.map(candidate => {
            const session = job.sessions.find(s => s.candidate.email === candidate.email);
            return this.mapCandidateWithSession(candidate, session);
        });
        return candidatesWithData;
    }
    mapCandidateWithSession(candidate, session) {
        return {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            status: session ? session.status : candidate.status,
            invitedAt: candidate.invitedAt,
            createdAt: candidate.createdAt,
            interviewLink: candidate.interviewLink,
            sessionId: session?.id,
            score: session?.evaluation?.overallScore,
            isFit: session?.evaluation?.isFit,
            completedAt: session?.endTime,
            resumeText: candidate.resumeText,
        };
    }
    async updateCandidateStatus(candidateId, userId, status) {
        const candidate = await this.prisma.candidate.findFirst({
            where: { id: candidateId },
            include: { job: true },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (candidate.job.companyId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this candidate');
        }
        return this.prisma.candidate.update({
            where: { id: candidateId },
            data: { status: status },
        });
    }
    async updateCandidateResume(candidateId, resumeText) {
        return this.prisma.candidate.update({
            where: { id: candidateId },
            data: { resumeText },
        });
    }
    async reInterviewCandidate(candidateId, userId, newScheduledTime) {
        console.log(`[Jobs] Re-interview request for candidate ID: ${candidateId} by user: ${userId}`);
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                job: {
                    include: {
                        company: { select: { id: true, name: true } }
                    }
                }
            },
        });
        if (!candidate) {
            console.warn(`[Jobs] Candidate not found: ${candidateId}`);
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (candidate.job.companyId !== userId) {
            console.error(`[Jobs] Unauthorized re-interview attempt by ${userId} for candidate ${candidateId}`);
            throw new common_1.ForbiddenException('You do not have access to this candidate');
        }
        console.log(`[Jobs] Resetting status to INVITED for ${candidate.name} (${candidate.email})`);
        const now = new Date();
        const startTime = newScheduledTime ? new Date(newScheduledTime) : now;
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
        console.log(`[Jobs] Extending interview window for candidate: Start=${startTime.toISOString()}, End=${endTime.toISOString()}`);
        await this.prisma.candidate.update({
            where: { id: candidateId },
            data: {
                status: client_1.CandidateStatus.INVITED,
                invitedAt: new Date(),
                interviewStartTime: startTime,
                interviewEndTime: endTime,
                isReInterviewed: true,
            }
        });
        console.log(`[Jobs] Deleting previous sessions for candidate email: ${candidate.email} on job: ${candidate.jobId}`);
        const deleteResult = await this.prisma.interviewSession.deleteMany({
            where: {
                jobId: candidate.jobId,
                candidate: { email: candidate.email }
            }
        });
        const appUrl = this.configService.get('APP_URL');
        await this.emailService.sendInterviewInvite({
            to: candidate.email,
            candidateName: candidate.name,
            jobTitle: candidate.job.title,
            companyName: candidate.job.company.name,
            scheduledTime: startTime,
            interviewLink: `${appUrl}/interview/${candidate.interviewLink}`,
            notes: candidate.job.notes,
        });
        const candidateUser = await this.prisma.user.findUnique({
            where: { email: candidate.email }
        });
        const duration = candidate.job.planAtCreation === client_1.Plan.FREE ? '25 mins' : 'Unlimited';
        await this.notificationsService.create({
            title: 'Re-Interview Scheduled',
            message: `${candidate.job.company.name} has requested a re-interview for ${candidate.job.title}. You can start immediately. Duration: ${duration}. Valid until: ${endTime.toLocaleString()}.`,
            link: `/interview/${candidate.interviewLink}`,
            type: client_2.NotificationType.INAPP,
            email: candidate.email
        }, candidateUser?.id);
        console.log(`[Jobs] Deleted ${deleteResult.count} previous sessions. Re-interview reset complete. Window: ${startTime.toISOString()} to ${endTime.toISOString()}`);
        return {
            ...deleteResult,
            message: 'Re-interview scheduled and notifications sent',
            interviewWindow: {
                start: startTime,
                end: endTime,
                validFor: '2 hours'
            }
        };
    }
    async getCompanyPublic(companyId) {
        const user = await this.prisma.user.findUnique({
            where: { id: companyId },
            include: {
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        roleCategory: true,
                        description: true,
                    },
                },
            },
        });
        if (!user || user.role !== 'COMPANY') {
            throw new common_1.NotFoundException('Company profile not found');
        }
        return user;
    }
    async getInvitationProgress(jobId, userId) {
        const progressKey = `${jobId}-${userId}`;
        const progress = this.invitationProgress.get(progressKey);
        if (!progress) {
            return {
                found: false,
                message: 'No active invitation process found',
            };
        }
        return {
            found: true,
            ...progress,
        };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map