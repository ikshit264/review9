# HireAI Backend Blueprint

This document specifies the complete backend architecture, database schema, and API logic required to support the HireAI frontend.

## 1. Tech Stack
- **Runtime:** Node.js with Express/Fastify.
- **Database:** PostgreSQL (highly recommended for relational integrity).
- **ORM:** Prisma.
- **Auth:** JWT (JSON Web Tokens).
- **Email:** Nodemailer / SendGrid / AWS SES.
- **Validation:** Zod.

---

## 2. Database Schema (Prisma)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  COMPANY
  CANDIDATE
}

enum Plan {
  FREE
  PRO
  ULTRA
}

enum Status {
  PENDING
  ONGOING
  COMPLETED
  FAILED
}

model User {
  id                 String    @id @default(uuid())
  email              String    @unique
  password           String    // Hashed
  name               String
  role               Role
  plan               Plan?     @default(FREE)
  activeSessionToken String?   // For "1 ID login only" enforcement
  createdAt          DateTime  @default(now())
  
  // Relations
  jobs               Job[]     // As a Company
  interviews         InterviewSession[] // As a Candidate
}

model Job {
  id                 String    @id @default(uuid())
  title              String
  roleCategory       String
  description        String
  notes              String?   // Email custom content
  companyId          String
  company            User      @relation(fields: [companyId], references: [id])
  scheduledTime      DateTime  // Stored in UTC
  planAtCreation     Plan
  
  // Settings
  tabTracking        Boolean   @default(true)
  eyeTracking        Boolean   @default(false)
  multiFaceDetection Boolean   @default(false)
  screenRecording    Boolean   @default(false)

  candidates         Candidate[]
  sessions           InterviewSession[]
  createdAt          DateTime  @default(now())
}

model Candidate {
  id             String    @id @default(uuid())
  jobId          String
  job            Job       @relation(fields: [jobId], references: [id])
  name           String
  email          String
  status         Status    @default(PENDING)
  resumeText     String?   @db.Text
  interviewLink  String    @unique // Unique secure token for the meet
  createdAt      DateTime  @default(now())
}

model InterviewSession {
  id             String    @id @default(uuid())
  candidateId    String
  candidate      User      @relation(fields: [candidateId], references: [id])
  jobId          String
  job            Job       @relation(fields: [jobId], references: [id])
  startTime      DateTime  @default(now())
  endTime        DateTime?
  status         Status    @default(ONGOING)
  overallScore   Int?
  
  responses      InterviewResponse[]
  proctoringLogs ProctoringLog[]
  evaluation     FinalEvaluation?
}

model InterviewResponse {
  id               String           @id @default(uuid())
  sessionId        String
  session          InterviewSession @relation(fields: [sessionId], references: [id])
  questionText     String           @db.Text
  candidateAnswer  String           @db.Text
  aiAcknowledgment String?          @db.Text
  timestamp        DateTime         @default(now())
}

model ProctoringLog {
  id        String           @id @default(uuid())
  sessionId String
  session   InterviewSession @relation(fields: [sessionId], references: [id])
  type      String           // tab_switch, eye_distraction, etc.
  severity  String           // low, medium, high
  timestamp DateTime         @default(now())
}

model FinalEvaluation {
  id             String           @id @default(uuid())
  sessionId      String           @unique
  session        InterviewSession @relation(fields: [sessionId], references: [id])
  overallScore   Int
  isFit          Boolean
  reasoning      String           @db.Text
  behavioralNote String?          @db.Text
  metrics        Json             // Array of {name, score, feedback}
}
```

---

## 3. Core Logic & Middlewares

### A. JWT & Session Enforcement (1 ID Login Only)
Whenever a user logs in:
1. Generate a unique `sessionToken` (e.g., a UUID).
2. Generate the JWT containing this `sessionToken` in the payload.
3. Update the `User` record in the database, setting `activeSessionToken = sessionToken`.

**Auth Middleware:**
```javascript
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, SECRET);
  
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  
  // ENFORCEMENT: If the token in the DB is different from the token in this JWT, 
  // it means the user logged in elsewhere.
  if (user.activeSessionToken !== payload.sessionToken) {
    return res.status(401).json({ error: "Session expired. Logged in from another device." });
  }
  
  req.user = user;
  next();
}
```

### B. Timezone Synchronization
- **Input:** When the company sets `7:00 AM India Time`, the frontend sends the ISO UTC string.
- **Storage:** All times in the database are stored in **UTC**.
- **Output:** When the candidate in the US fetches the job, the backend returns the UTC string. The frontend uses `Intl.DateTimeFormat` or `dayjs` to display it in the candidate's local time (e.g., 9:30 PM Previous Day).

---

## 4. API Endpoints

### AUTH
- `POST /api/auth/register`: standard registration.
- `POST /api/auth/login`: Handles session token generation as described above.
- `GET /api/auth/me`: Validates session and returns profile + current subscription tier.

### COMPANY
- `POST /api/jobs`: Creates a job. **Enforcement:** If `user.plan === FREE` and `jobs.count >= 30 candidates`, reject.
- `GET /api/jobs`: List all jobs with candidate summaries.
- `POST /api/jobs/:id/invite`: 
    - Generates a unique `interviewLink` token for each candidate email.
    - Triggers a background job to send emails at the `scheduledTime`.
    - Emails must include the "Must Include Info" from the form.

### CANDIDATE
- `POST /api/interviews/join`: Takes the unique token from the URL, validates it, and starts an `InterviewSession`.
- `POST /api/interviews/resume`: Accepts PDF/Word, extracts text (using `pdf-parse` or similar), and saves to `Candidate.resumeText`.
- `POST /api/interviews/step`: Saves an AI question and the candidate's answer into the `InterviewResponse` table.

### PROCTORING
- `POST /api/interviews/:id/log`: Logs events like `tab_switch` or `multiple_faces`.
- `PATCH /api/interviews/:id/terminate`: For high-severity incidents (e.g., 3 high severity logs).

### ANALYTICS & AI
- `POST /api/interviews/:id/evaluate`:
    - This is called when the interview ends.
    - Backend sends the transcript (all `InterviewResponse` records) + `resumeText` to Gemini API.
    - Saves result to `FinalEvaluation`.

---

## 5. Subscription Plan Enforcement
- **FREE:** 
    - Max 30 candidates per job.
    - `Job.interactive` field is `false`.
    - `Job.eyeTracking` forced to `false`.
- **PRO:** 
    - Unlimited candidates.
    - `Job.interactive = true`.
    - Access to basic proctoring logs.
- **ULTRA:** 
    - Full detection suite (multi-face, eye tracking).
    - Dedicated priority for AI scoring.

---

## 6. Email Template Logic
The email must be sent at the `scheduledTime`.
**Subject:** Interview Invite: {{job_title}} at {{company_name}}
**Body:**
"Hello {{candidate_name}}, you are invited to a remote AI interview.
**Time:** {{local_formatted_time}}
**Link:** {{app_url}}/interview/{{unique_token}}
**Note:** {{company_custom_notes}}"
