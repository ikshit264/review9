import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface InviteEmailData {
  to: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  companyDescription?: string | null;
  scheduledTime: Date;
  interviewLink: string;
  registrationLink?: string | null;
  needsRegistration: boolean;
  notes?: string | null;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.sendgrid.net',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      auth: {
        user: this.configService.get<string>('MAIL_USER') || '',
        pass: this.configService.get<string>('MAIL_PASSWORD') || '',
      },
    });
  }

  async sendInterviewInvite(data: InviteEmailData): Promise<void> {
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
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; }
            .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
            .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
            .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
            .button-secondary { background-color: #f1f5f9; color: #0f172a !important; border: 1px solid #e2e8f0; box-shadow: none; }
            .note { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; color: #92400e; font-size: 14px; }
            .company-desc { font-size: 14px; color: #475569; font-style: italic; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px; }
            .footer { padding: 30px; text-align: center; font-size: 13px; color: #94a3b8; background-color: #f8fafc; }
            .badge { display: inline-block; background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div style="background-color: #f3f4f6; padding: 40px 20px;">
            <div class="container">
              <div class="header">
                <h1>Interview Invitation</h1>
                <p>${data.jobTitle} @ ${data.companyName}</p>
              </div>
              <div class="content">
                <p style="font-size: 18px; margin-top: 0;">Hi <strong>${data.candidateName}</strong>,</p>
                <p>Great news! You've been invited to an AI-powered technical interview at <strong>${data.companyName}</strong>.</p>
                
                <div class="section">
                  <div class="section-title">Interview Details</div>
                  <div class="info-box">
                    <div style="margin-bottom: 8px;"><strong>Role:</strong> ${data.jobTitle}</div>
                    <div><strong>Time:</strong> ${formattedTime} (UTC)</div>
                  </div>
                </div>

                ${data.needsRegistration ? `
                <div class="section">
                  <div class="section-title">Action Required: Registration</div>
                  <p style="font-size: 14px; color: #64748b;">Since you don't have an account yet, please register using the link below before joining the interview.</p>
                  <a href="${data.registrationLink}" class="button button-secondary">Step 1: Create Account</a>
                </div>
                ` : ''}

                <div class="section">
                  <div class="section-title">${data.needsRegistration ? 'Step 2: Join Interview' : 'Join Interview'}</div>
                  <p style="font-size: 14px; color: #64748b;">When you're ready, use the link below to enter the AI interview room.</p>
                  <a href="${data.interviewLink}" class="button">🚀 Enter Interview Room</a>
                </div>

                ${data.notes ? `
                <div class="section">
                  <div class="note">
                    <strong>Note from Company:</strong><br>
                    ${data.notes}
                  </div>
                </div>
                ` : ''}

                ${data.companyDescription ? `
                <div class="company-desc">
                  <div class="section-title" style="margin-bottom: 8px;">About ${data.companyName}</div>
                  ${data.companyDescription}
                </div>
                ` : ''}
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} IntervAI Platform. All rights reserved.</p>
                <p>Designed for the next generation of hiring.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailData = {
      from: this.configService.get<string>('MAIL_FROM') || 'noreply@intervai.com',
      to: data.to,
      subject: `Interview Invite: ${data.jobTitle} at ${data.companyName}`,
      html,
    };

    this.logger.log(
      `Preparing to send interview invitation email to ${data.to}`,
    );

    try {
      const mailEnabled =
        this.configService.get<string>('MAIL_ENABLED') !== 'false';

      if (!mailEnabled) {
        this.logger.warn(
          `Mail disabled (MAIL_ENABLED=false). Invitation to ${data.to} log-only.`,
        );
        return;
      }

      await this.transporter.sendMail(mailData);
      this.logger.log(
        `Successfully sent interview invitation email to ${data.to}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send interview invitation email to ${data.to}:`,
        errorMessage,
      );

      // Throw error for critical email failures
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        typeof error.response === 'string' &&
        error.response.includes('Maximum credits exceeded')
      ) {
        throw new InternalServerErrorException(
          `Email service quota exceeded. Failed to send invitation to ${data.to}. Please contact support.`,
        );
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new InternalServerErrorException(
          `Failed to send interview invitation email to ${data.to}. Error: ${errorMessage}`,
        );
      }
    }
  }
}
