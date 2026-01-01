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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const PLAN_LIMITS = {
    FREE: {
        maxCandidatesPerJob: 30,
        features: ['Basic interview', 'Tab tracking only', 'Limited analytics'],
    },
    PRO: {
        maxCandidatesPerJob: -1,
        features: ['Interactive interviews', 'Eye tracking', 'Full analytics', 'Priority support'],
    },
    ULTRA: {
        maxCandidatesPerJob: -1,
        features: ['All Pro features', 'Multi-face detection', 'Screen recording', 'Priority AI scoring', 'Custom branding'],
    },
};
let BillingService = class BillingService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async getSubscriptionStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                jobs: {
                    include: {
                        _count: { select: { candidates: true } },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const currentPlan = user.plan || client_1.Plan.FREE;
        const limits = PLAN_LIMITS[currentPlan];
        const totalJobs = user.jobs.length;
        const totalCandidates = user.jobs.reduce((sum, job) => sum + job._count.candidates, 0);
        let nearLimit = false;
        if (currentPlan === client_1.Plan.FREE) {
            nearLimit = user.jobs.some(job => job._count.candidates >= 25);
        }
        return {
            plan: currentPlan,
            limits,
            usage: {
                totalJobs,
                totalCandidates,
                candidatesPerJobLimit: limits.maxCandidatesPerJob,
            },
            nearLimit,
            canUpgrade: currentPlan !== client_1.Plan.ULTRA,
            pricing: {
                PRO: { monthly: 49, yearly: 470 },
                ULTRA: { monthly: 99, yearly: 950 },
            },
        };
    }
    async subscribe(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const planOrder = { FREE: 0, PRO: 1, ULTRA: 2 };
        if (planOrder[dto.plan] <= planOrder[user.plan || 'FREE']) {
            throw new common_1.BadRequestException('Cannot downgrade or select same plan');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { plan: dto.plan },
            select: { id: true, email: true, name: true, plan: true },
        });
        return {
            success: true,
            message: `Successfully upgraded to ${dto.plan}`,
            user: updatedUser,
            features: PLAN_LIMITS[dto.plan].features,
        };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], BillingService);
//# sourceMappingURL=billing.service.js.map