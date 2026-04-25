# ApplyPilot 🚀

Your AI-powered internship companion that automates the boring parts of job hunting.

## Features

- **Automated Applications**: Automatically fill and submit job applications.
- **Real-time Dashboard**: Track your applications and success rates.
- **API Key Management**: Securely manage your Gemini and other service keys.
- **Scalable Architecture**: Built with Node.js, Redis (BullMQ), and Supabase.
- **Premium UI**: Modern, glassmorphic design built with React and Tailwind CSS v4.

## Getting Started

### Prerequisites

- Node.js 20+
- Redis server
- Supabase project
- Gemini API Key

### Backend Setup

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials.
4. `npm run dev`

### Frontend Setup

1. `cd web`
2. `npm install`
3. Create `.env.local` with your Supabase credentials.
4. `npm run dev`

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Zustand, Lucide React.
- **Backend**: Express, BullMQ, Redis, Zod, Morgan, Helmet.
- **Database**: Supabase (PostgreSQL).
- **Automation**: Custom workers for application processing.

## Deployment Checklist ✅

Before moving to production, ensure the following are configured:

### 1. Supabase Setup
- Enable **Row Level Security (RLS)** on all tables.
- Add indexes for common filter fields (`user_id`, `status`, `job_url`).
- Configure Auth Redirect URLs to your production domain.

### 2. Environment Variables
Ensure these secrets are set in your hosting provider (Railway, Vercel, etc.):
- `DATABASE_URL`: Your Supabase Postgres connection string.
- `REDIS_URL`: For BullMQ job processing.
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: For backend service access.
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: For the frontend.
- `ENCRYPTION_SECRET`: A strong 32-character key for API key storage.
- `RESEND_WEBHOOK_SECRET`: For incoming email automation.
- `FRONTEND_URL`: To restrict CORS.

### 3. Monitoring & Scaling
- **Bull Board**: Monitor queue health at `/admin/queues`.
- **Structured Logging**: Logs are JSON-formatted for aggregation (e.g., Logtail, Datadog).
- **Health Checks**: Monitor `https://your-api.com/health`.

### 4. CI/CD
- Add `RAILWAY_TOKEN` to GitHub Secrets for automated backend deployment.
- Configure your frontend host (Vercel/Netlify) to build from the `web` directory.

## License

MIT
