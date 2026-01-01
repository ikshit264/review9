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
exports.CompaniesController = exports.CandidatesController = exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const jobs_service_1 = require("./jobs.service");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
const client_1 = require("@prisma/client");
let JobsController = class JobsController {
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async createJob(user, dto) {
        return this.jobsService.createJob(user.id, user.plan || client_1.Plan.FREE, dto);
    }
    async getJobs(userId) {
        return this.jobsService.getJobs(userId);
    }
    async getJob(jobId, userId) {
        return this.jobsService.getJobById(jobId, userId);
    }
    async updateJob(jobId, user, dto) {
        return this.jobsService.updateJob(jobId, user.id, user.plan || client_1.Plan.FREE, dto);
    }
    async inviteCandidates(jobId, user, dto) {
        return this.jobsService.inviteCandidates(jobId, user.id, user.plan || client_1.Plan.FREE, dto);
    }
    async getJobCandidates(jobId, userId) {
        return this.jobsService.getJobCandidates(jobId, userId);
    }
    async getAnalytics(jobId, userId) {
        return this.jobsService.getJobAnalytics(jobId, userId);
    }
    async getInvitationProgress(jobId, userId) {
        return this.jobsService.getInvitationProgress(jobId, userId);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateJobDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "createJob", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getJobs", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getJob", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.UpdateJobDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Post)(':id/candidates'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.InviteCandidatesDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "inviteCandidates", null);
__decorate([
    (0, common_1.Get)(':id/candidates'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getJobCandidates", null);
__decorate([
    (0, common_1.Get)(':id/analytics'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)(':id/invitation-progress'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getInvitationProgress", null);
exports.JobsController = JobsController = __decorate([
    (0, common_1.Controller)('jobs'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
let CandidatesController = class CandidatesController {
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async updateStatus(candidateId, userId, dto) {
        return this.jobsService.updateCandidateStatus(candidateId, userId, dto.status);
    }
    async updateResume(candidateId, resumeText) {
        return this.jobsService.updateCandidateResume(candidateId, resumeText);
    }
    async reInterview(candidateId, userId, newScheduledTime) {
        return this.jobsService.reInterviewCandidate(candidateId, userId, newScheduledTime);
    }
};
exports.CandidatesController = CandidatesController;
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateCandidateStatusDto]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/resume'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('resumeText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "updateResume", null);
__decorate([
    (0, common_1.Post)(':id/re-interview'),
    (0, decorators_1.Roles)(client_1.Role.COMPANY),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)('newScheduledTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "reInterview", null);
exports.CandidatesController = CandidatesController = __decorate([
    (0, common_1.Controller)('candidates'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], CandidatesController);
let CompaniesController = class CompaniesController {
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async getCompany(companyId) {
        return this.jobsService.getCompanyPublic(companyId);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "getCompany", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, common_1.Controller)('companies'),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], CompaniesController);
//# sourceMappingURL=jobs.controller.js.map