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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UploadService = class UploadService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadResume(file, candidateId) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedMimes = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only PDF and Word documents are allowed');
        }
        let extractedText = '';
        try {
            if (file.mimetype === 'application/pdf') {
                extractedText = `[Resume content extracted from ${file.originalname}]`;
            }
            else {
                extractedText = `[Resume content extracted from ${file.originalname}]`;
            }
        }
        catch (error) {
            console.error('PDF parsing error:', error);
            extractedText = '[Could not extract text - manual review required]';
        }
        if (candidateId) {
            await this.prisma.candidate.update({
                where: { id: candidateId },
                data: { resumeText: extractedText },
            });
        }
        return {
            filename: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            extractedText,
            candidateId,
        };
    }
    async getResume(candidateId, companyId) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                job: { select: { companyId: true } },
            },
        });
        if (!candidate) {
            throw new common_1.BadRequestException('Candidate not found');
        }
        if (candidate.job.companyId !== companyId) {
            throw new common_1.BadRequestException('Unauthorized access');
        }
        return {
            candidateId: candidate.id,
            candidateName: candidate.name,
            resumeText: candidate.resumeText,
        };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UploadService);
//# sourceMappingURL=upload.service.js.map