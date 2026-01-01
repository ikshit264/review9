"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const common_module_1 = require("./common/common.module");
const auth_module_1 = require("./auth/auth.module");
const jobs_module_1 = require("./jobs/jobs.module");
const interviews_module_1 = require("./interviews/interviews.module");
const billing_module_1 = require("./billing/billing.module");
const upload_module_1 = require("./upload/upload.module");
const notifications_module_1 = require("./notifications/notifications.module");
const email_module_1 = require("./email/email.module");
const core_1 = require("@nestjs/core");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                ignoreEnvFile: false,
                expandVariables: false,
                cache: false,
            }),
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            jobs_module_1.JobsModule,
            interviews_module_1.InterviewsModule,
            billing_module_1.BillingModule,
            upload_module_1.UploadModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map