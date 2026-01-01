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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('🧹 Cleaning existing data...');
    await prisma.finalEvaluation.deleteMany();
    await prisma.proctoringLog.deleteMany();
    await prisma.interviewResponse.deleteMany();
    await prisma.interviewSession.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();
    const hashedCompanyPassword = await bcrypt.hash('company123', 10);
    const hashedCandidate1Password = await bcrypt.hash('candidate123', 10);
    const hashedCandidate2Password = await bcrypt.hash('candidate456', 10);
    const company = await prisma.user.create({
        data: {
            email: 'company@hireai.com',
            password: hashedCompanyPassword,
            name: 'Innovation Labs Inc.',
            role: client_1.Role.COMPANY,
            plan: client_1.Plan.ULTRA,
        },
    });
    console.log(`✅ Created company user: ${company.email}`);
    const candidate1 = await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            password: hashedCandidate1Password,
            name: 'John Doe',
            role: client_1.Role.CANDIDATE,
            plan: client_1.Plan.FREE,
        },
    });
    console.log(`✅ Created candidate user: ${candidate1.email}`);
    const candidate2 = await prisma.user.create({
        data: {
            email: 'jane.smith@example.com',
            password: hashedCandidate2Password,
            name: 'Jane Smith',
            role: client_1.Role.CANDIDATE,
            plan: client_1.Plan.FREE,
        },
    });
    console.log(`✅ Created candidate user: ${candidate2.email}`);
    const job = await prisma.job.create({
        data: {
            title: 'Senior Full Stack Developer',
            roleCategory: 'Engineering',
            description: `We are looking for an experienced Full Stack Developer to join our growing team. 
      
Key Responsibilities:
- Design and develop scalable web applications
- Work with React, Node.js, and PostgreSQL
- Collaborate with cross-functional teams
- Mentor junior developers

Requirements:
- 5+ years of experience in full-stack development
- Strong proficiency in TypeScript, React, and Node.js
- Experience with cloud services (AWS/GCP)
- Excellent problem-solving skills`,
            notes: 'Priority hire for Q1 2025',
            companyId: company.id,
            interviewStartTime: new Date(Date.now() - 5 * 60 * 1000),
            interviewEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            planAtCreation: client_1.Plan.ULTRA,
            tabTracking: true,
            eyeTracking: true,
            multiFaceDetection: true,
            screenRecording: false,
        },
    });
    console.log(`✅ Created job posting: ${job.title}`);
    const jobCandidate1 = await prisma.candidate.create({
        data: {
            jobId: job.id,
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'PENDING',
            resumeText: `John Doe - Senior Software Engineer

Experience:
- 6 years at Tech Corp as Lead Developer
- Expertise in React, Node.js, TypeScript
- Built microservices architecture handling 1M+ requests/day

Education:
- B.S. Computer Science, MIT

Skills:
- Languages: JavaScript, TypeScript, Python, Go
- Frontend: React, Next.js, Vue.js
- Backend: Node.js, Express, NestJS
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Docker, Kubernetes`,
            interviewLink: `interview_${Date.now()}_john`,
        },
    });
    console.log(`✅ Created job candidate: ${jobCandidate1.name}`);
    const jobCandidate2 = await prisma.candidate.create({
        data: {
            jobId: job.id,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'PENDING',
            resumeText: `Jane Smith - Full Stack Developer

Experience:
- 4 years at StartupXYZ as Software Engineer
- Led frontend team of 5 developers
- Implemented CI/CD pipelines reducing deployment time by 60%

Education:
- M.S. Computer Science, Stanford University

Skills:
- Languages: JavaScript, TypeScript, Java
- Frontend: React, Angular, Tailwind CSS
- Backend: Node.js, Spring Boot, GraphQL
- Databases: PostgreSQL, MySQL, MongoDB
- Tools: Git, Jenkins, Docker`,
            interviewLink: `interview_${Date.now()}_jane`,
        },
    });
    console.log(`✅ Created job candidate: ${jobCandidate2.name}`);
    console.log('\n📋 Seed Summary:');
    console.log('================');
    console.log('👔 Company Account:');
    console.log(`   Email: company@hireai.com`);
    console.log(`   Password: company123`);
    console.log(`   Plan: ULTRA`);
    console.log('');
    console.log('👤 Candidate Account 1:');
    console.log(`   Email: john.doe@example.com`);
    console.log(`   Password: candidate123`);
    console.log('');
    console.log('👤 Candidate Account 2:');
    console.log(`   Email: jane.smith@example.com`);
    console.log(`   Password: candidate456`);
    console.log('');
    console.log('📝 Sample Job Created: Senior Full Stack Developer');
    console.log('================');
    console.log('\n🎉 Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map