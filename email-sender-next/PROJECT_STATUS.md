
# Project Status & Documentation: Email Sender (Next.js)

## 1. Project Overview
This project is a **Next.js 16 (App Router)** application for managing email campaigns. It allows users to manage contacts, create email templates, send campaigns, and track delivery statistics.

### Technology Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript / React 19
- **Database**: MongoDB (via Mongoose)
- **Styling**: TailwindCSS v4
- **UI Libraries**: Framer Motion (animations), Lucide React (icons)
- **Auth**: JWT-based authentication (HTTP-Only Cookies)
- **Email**: Nodemailer (SMTP)

## 2. Recent Updates & Fixes
We have recently resolved critical stability and performance issues:

### ✅ Fixed: Login 500 Error
- **Issue**: The login API was crashing with a 500 error because the request body was being sent as `[object Object]`.
- **Fix**: Updated `lib/api.ts` to automatically `JSON.stringify` request bodies that are plain objects.

### ✅ Fixed: API Rate Limiting / Flooding
- **Issue**: The Dashboard and Campaigns pages were auto-refreshing every 5-10 seconds, causing a flood of GET requests (`/api/campaigns/stats/dashboard`).
- **Fix**: 
    - Removed `setInterval` auto-refresh logic from `app/(dashboard)/page.tsx` and `app/(dashboard)/campaigns/page.tsx`.
    - Added manual **"↻ Refresh"** buttons to both pages for better user control and reduced server load.

### 🏗️ Refactored: Architecture Overhaul
- **Folder Structure**: Adopted a clean architecture with `services/`, `validation/`, `features/`, `types/`, and `config/`.
- **Authentication**: Migrated from `localStorage` to **HTTP-only cookies** for better security. `middleware.ts` now protects routes.
- **Validation**: Added **Zod** schemas for Auth and Campaigns.
- **Service Layer**: Moved business logic out of API routes into `services/auth.service.ts` and `services/campaign.service.ts`.
- **Queue System**: Implemented `services/queue.service.ts` and a cron endpoint `api/cron/process-queue` for background email processing.

## 3. Project Structure
```
/app
  /(dashboard)       # Protected routes (Dashboard, Campaigns, etc.)
  /api               # Backend API routes (Route Handlers)
    /auth            # Auth routes
    /campaigns       # Campaign routes
    /cron            # Cron jobs
  /login             # Login page
  /register          # Registration page
  /pages_migration   # ⚠️ OLD/Reference files (To be deprecated)
/services            # Business Logic (Auth, Campaign, Queue)
/validation          # Zod Schemas
/lib                 # Utilities (DB, API Response, Auth Helpers)
/models              # Mongoose Schemas
/types               # TypeScript Definitions
/config              # Configuration Constants
```

## 4. Pending Tasks & Roadmap
The following items are recommended for the next phase of development:

### 🧹 Cleanup & Migration
- **Audit `app/pages_migration`**: Compare these old files with the new `app/**` routes. If all features are ported, delete this directory.
- **Frontend Refactor**: Update frontend components to use the new API response format (`{ success, data, message }`).

### 🚀 Future Improvements
- **Worker Process**: Set up a separate worker or external cron (e.g., Vercel Cron) to hit `api/cron/process-queue` every minute.
- **Real-time Updates**: Consider WebSockets/SSE for live dashboard updates instead of manual refresh.
