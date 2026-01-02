# Environment Variables Required for Section 1 Implementation

## Cloudinary Configuration
Add these variables to your `.env` file for PDF resume storage:

```env
# Cloudinary Configuration (Required for resume uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### How to get Cloudinary credentials:
1. Sign up at https://cloudinary.com (free tier available)
2. Go to Dashboard → Settings
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### Existing Environment Variables (Already in use):
```env
# Email Configuration (Already exists)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=your_sendgrid_username
MAIL_PASSWORD=your_sendgrid_password
MAIL_FROM=noreply@hireai.com
MAIL_ENABLED=true

# Database (Already exists)
DATABASE_URL=your_database_url

# JWT (Already exists)
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=30d

# App URLs (Already exists)
APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

## Installation Required

After adding the environment variables, run:

```bash
cd review9-backend
npm install
```

This will install:
- `pdf-parse` - For extracting text from PDF files
- `cloudinary` - For cloud storage of PDF files
- `@types/pdf-parse` - TypeScript types for pdf-parse

## Testing

After setup, test the resume upload endpoint:
- **Endpoint:** `POST /api/upload/resume`
- **Auth:** Required (JWT token)
- **Body:** Form-data with `file` field (PDF only, max 10MB)
- **Response:** Returns `resumeUrl` (Cloudinary URL) and `extractedText`

