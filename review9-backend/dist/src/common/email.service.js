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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST') || 'smtp.sendgrid.net',
            port: this.configService.get('MAIL_PORT') || 587,
            auth: {
                user: this.configService.get('MAIL_USER') || '',
                pass: this.configService.get('MAIL_PASSWORD') || '',
            },
        });
    }
    async sendInterviewInvite(data) {
        const formattedTime = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'UTC',
        }).format(data.scheduledTime);
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .note { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Invitation</h1>
              <p>${data.jobTitle} at ${data.companyName}</p>
            </div>
            <div class="content">
              <p>Hello ${data.candidateName},</p>
              <p>You are invited to a remote AI-powered interview for the position of <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>.</p>
              
              <p><strong>Scheduled Time:</strong> ${formattedTime} (UTC)</p>
              
              <a href="${data.interviewLink}" class="button">Join Interview</a>
              
              <p>Please ensure you:</p>
              <ul>
                <li>Have a stable internet connection</li>
                <li>Use a desktop/laptop with webcam and microphone</li>
                <li>Are in a quiet, well-lit environment</li>
                <li>Have your resume ready to upload</li>
              </ul>
              
              ${data.notes ? `<div class="note"><strong>Note from Company:</strong><br>${data.notes}</div>` : ''}
              
              <p>Best of luck!</p>
              <p>The HireAI Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
        const mailData = {
            from: this.configService.get('MAIL_FROM') || 'noreply@hireai.com',
            to: data.to,
            subject: `Interview Invite: ${data.jobTitle} at ${data.companyName}`,
            html,
        };
        console.log('--- EMAIL DATA START ---');
        console.log(`To: ${mailData.to}`);
        console.log(`Subject: ${mailData.subject}`);
        console.log(`Candidate: ${data.candidateName}`);
        console.log(`Job: ${data.jobTitle}`);
        console.log(`Company: ${data.companyName}`);
        console.log(`Scheduled Time: ${formattedTime}`);
        console.log(`Link: ${data.interviewLink}`);
        console.log('--- EMAIL DATA END ---');
        try {
            const mailEnabled = this.configService.get('MAIL_ENABLED') !== 'false';
            if (!mailEnabled) {
                console.log(`[EmailService] Mail disabled (MAIL_ENABLED=false). Invitation to ${data.to} log-only.`);
                return;
            }
            await this.transporter.sendMail(mailData);
            console.log(`[EmailService] Invitation sent to ${data.to}`);
        }
        catch (error) {
            if (error.response && error.response.includes('Maximum credits exceeded')) {
                console.warn(`[EmailService] FAILED: Email quota reached (451). skipping email to ${data.to}. Note: Use in-app notifications instead.`);
            }
            else {
                console.error('[EmailService] Failed to send email:', error.message || error);
            }
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map