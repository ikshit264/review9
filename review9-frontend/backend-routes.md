
# Required Backend API Routes for HireAI

## Authentication (JWT Based)
- `POST /api/auth/register`: Register new company or candidate.
- `POST /api/auth/login`: Authenticate and return JWT token. **Rule:** Check `active_sessions` table to enforce "1 ID = 1 login" policy.
- `GET /api/auth/me`: Validate JWT and return user profile + subscription plan.
- `POST /api/auth/logout`: Invalidate session and clear `active_sessions`.

## Subscription Management
- `POST /api/billing/subscribe`: Handle Stripe/Razorpay payment and upgrade plan.
- `GET /api/billing/status`: Check current subscription tier and candidate usage limits (Free = 30).

## Company & Jobs
- `POST /api/jobs`: Create a new job posting with proctoring config.
- `GET /api/jobs`: List all job postings for the company.
- `POST /api/jobs/:id/candidates`: Bulk upload emails and trigger region-synced email invites.
- `GET /api/jobs/:id/analytics`: Aggregate data for bar charts and incident counts.

## Interview & Proctoring (Live Support)
- `GET /api/interviews/:id`: Retrieve session metadata (candidate specific).
- `POST /api/interviews/:id/start`: Log start time and lock the candidate's session ID.
- `POST /api/interviews/:id/transcript`: Real-time streaming or batch saving of Q&A rounds.
- `POST /api/interviews/:id/proctoring`: Log red-flag events (tab switching, eye tracking, multi-face).
- `POST /api/interviews/:id/complete`: Terminate session and trigger Gemini evaluation worker.

## Assets
- `POST /api/upload/resume`: Store resume PDF and return OCR text for Gemini context.
- `GET /api/resume/:id`: Securely retrieve resume for company viewing.

## Feedback & Results
- `GET /api/interviews/:id/evaluation`: Retrieve the final fit/unfit report and score breakdown.
