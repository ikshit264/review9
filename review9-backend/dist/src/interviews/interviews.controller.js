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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewsController = void 0;
const common_1 = require("@nestjs/common");
const interviews_service_1 = require("./interviews.service");
const jwt_1 = require("@nestjs/jwt");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
const client_1 = require("@prisma/client");
let InterviewsController = class InterviewsController {
    constructor(interviewsService, jwtService) {
        this.interviewsService = interviewsService;
        this.jwtService = jwtService;
    }
    async getTestSession(plan) {
        const { session, user, candidate } = await this.interviewsService.getOrCreateTestEnvironment(plan);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            sessionToken: user.activeSessionToken
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            sessionId: session.id,
            user,
            candidate,
            interviewToken: candidate.interviewLink
        };
    }
    async getMyInvitations(email) {
        return this.interviewsService.getCandidateInvitations(email);
    }
    async getInterviewByToken(token) {
        return this.interviewsService.getInterviewByToken(token);
    }
    async getInterviewStatus(token) {
        return this.interviewsService.getInterviewByToken(token);
    }
    async getSession(sessionId) {
        return this.interviewsService.getInterviewSession(sessionId);
    }
    async startInterview(token, dto, userId) {
        dto.interviewToken = token;
        return this.interviewsService.startInterview(dto, userId);
    }
    async saveTranscript(sessionId, dto) {
        return this.interviewsService.saveTranscript(sessionId, dto);
    }
    async logProctoringEvent(sessionId, dto) {
        return this.interviewsService.logProctoringEvent(sessionId, dto);
    }
    async completeInterview(sessionId) {
        return this.interviewsService.completeInterview(sessionId);
    }
    async pauseInterview(sessionId, dto) {
        return this.interviewsService.pauseInterview(sessionId, dto.reason);
    }
    async resumeInterview(sessionId, userId) {
        return this.interviewsService.resumeInterview(sessionId, userId);
    }
    async acknowledgeWarning(sessionId, userId) {
        return this.interviewsService.acknowledgeWarning(sessionId, userId);
    }
    async getInitialQuestions(sessionId) {
        return this.interviewsService.getInitialQuestions(sessionId);
    }
    async respondToInterview(sessionId, dto, res) {
        return this.interviewsService.respondToInterview(sessionId, dto.answer, res);
    }
    async respondToInterviewSync(sessionId, dto) {
        return this.interviewsService.respondToInterviewSync(sessionId, dto.answer);
    }
    async getEvaluation(sessionId) {
        return this.interviewsService.getEvaluation(sessionId);
    }
    async getSessionReport(sessionId) {
        return this.interviewsService.getSessionReport(sessionId);
    }
};
exports.InterviewsController = InterviewsController;
__decorate([
    (0, common_1.Get)('test-me'),
    __param(0, (0, common_1.Query)('plan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getTestSession", null);
__decorate([
    (0, common_1.Get)('my-invitations'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, decorators_1.CurrentUser)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Get)('token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getInterviewByToken", null);
__decorate([
    (0, common_1.Get)('token/:token/status'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getInterviewStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)(':token/start'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.StartInterviewDto, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "startInterview", null);
__decorate([
    (0, common_1.Post)(':id/transcript'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SaveResponseDto]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "saveTranscript", null);
__decorate([
    (0, common_1.Post)(':id/proctoring'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ProctoringLogDto]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "logProctoringEvent", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "completeInterview", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PauseInterviewDto]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "pauseInterview", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "resumeInterview", null);
__decorate([
    (0, common_1.Post)(':id/acknowledge-warning'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "acknowledgeWarning", null);
__decorate([
    (0, common_1.Get)(':id/initial-questions'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getInitialQuestions", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RespondDto, Object]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "respondToInterview", null);
__decorate([
    (0, common_1.Post)(':id/respond-sync'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RespondDto]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "respondToInterviewSync", null);
__decorate([
    (0, common_1.Get)(':id/evaluation'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getEvaluation", null);
__decorate([
    (0, common_1.Get)(':id/report'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getSessionReport", null);
exports.InterviewsController = InterviewsController = __decorate([
    (0, common_1.Controller)('interviews'),
    __metadata("design:paramtypes", [interviews_service_1.InterviewsService,
        jwt_1.JwtService])
], InterviewsController);
//# sourceMappingURL=interviews.controller.js.map