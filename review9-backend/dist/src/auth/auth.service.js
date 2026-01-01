"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const geolocation_service_1 = require("../common/geolocation.service");
const notifications_service_1 = require("../notifications/notifications.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, geoService, notificationsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.geoService = geoService;
        this.notificationsService = notificationsService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                role: dto.role,
                plan: dto.role === 'COMPANY' ? 'FREE' : null,
            },
        });
        await this.notificationsService.attachNotificationsToUser(user.email, user.id);
        const { password, ...result } = user;
        return result;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
                plan: true,
                bio: true,
                location: true,
                phone: true,
                timezone: true,
                isProfileComplete: true,
                resumeUrl: true,
                workExperience: true,
                skills: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const sessionToken = (0, uuid_1.v4)();
        console.log('[Auth] Generated sessionToken:', sessionToken, 'for user:', user.email);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { activeSessionToken: sessionToken },
        });
        await this.notificationsService.attachNotificationsToUser(user.email, user.id);
        const payload = { sub: user.id, email: user.email, role: user.role, sessionToken };
        const accessToken = this.jwtService.sign(payload);
        console.log('[Auth] JWT signed with sessionToken:', sessionToken);
        const { password, ...userData } = user;
        console.log('[Auth] Login successful for:', user.email);
        console.log('[Auth] User isProfileComplete:', userData.isProfileComplete);
        return { accessToken, user: userData };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                bio: true,
                location: true,
                phone: true,
                timezone: true,
                isProfileComplete: true,
                resumeUrl: true,
                workExperience: true,
                skills: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async updateProfile(userId, data) {
        console.log('[Auth] updateProfile called for user:', userId);
        console.log('[Auth] Received data:', JSON.stringify(data, null, 2));
        const updateData = { ...data };
        if (data.isProfileComplete === undefined || data.isProfileComplete === null) {
            console.log('[Auth] isProfileComplete not provided, checking mandatory fields...');
            const mandatoryFields = ['name', 'phone', 'timezone', 'location'];
            const allPresent = mandatoryFields.every(field => data[field] || (field === 'name' && data.name));
            console.log('[Auth] All mandatory fields present:', allPresent);
            if (allPresent) {
                updateData.isProfileComplete = true;
                console.log('[Auth] Auto-setting isProfileComplete = true');
            }
        }
        else {
            console.log('[Auth] isProfileComplete explicitly provided:', data.isProfileComplete);
        }
        console.log('[Auth] Final updateData:', JSON.stringify(updateData, null, 2));
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                bio: true,
                location: true,
                phone: true,
                timezone: true,
                isProfileComplete: true,
                resumeUrl: true,
                workExperience: true,
                skills: true,
                createdAt: true,
            },
        });
        console.log('[Auth] Updated user isProfileComplete:', user.isProfileComplete);
        console.log('[Auth] Returning user data to frontend');
        return user;
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { activeSessionToken: null },
        });
        return { message: 'Logged out successfully' };
    }
    async validateSession(userId, sessionToken) {
        let user;
        try {
            user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
        }
        catch (error) {
            console.error('[Auth] validateSession: Database error during findUnique:', error);
            throw error;
        }
        if (!user) {
            console.log('[Auth] validateSession: User not found:', userId);
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.activeSessionToken !== sessionToken) {
            console.log('[Auth] validateSession: Token mismatch!');
            console.log('[Auth] Expected (DB):', user.activeSessionToken);
            console.log('[Auth] Received (JWT):', sessionToken);
            throw new common_1.UnauthorizedException('Session expired. Logged in from another device.');
        }
        return user;
    }
    async detectTimezone(ip) {
        return this.geoService.getTimezoneFromIp(ip);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        geolocation_service_1.GeolocationService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map