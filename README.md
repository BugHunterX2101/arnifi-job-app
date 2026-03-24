# Arnifi Job App — Sovereign Executive Platform

> A full-stack executive job platform with JWT authentication, role-based access control, and a premium dark UI — deployed entirely on **Netlify** (frontend + serverless backend).

**Live Demo:** https://arnifi-job-app.netlify.app

**Stack:** React · Redux Toolkit · Node.js · Express · PostgreSQL (Supabase) · Sequelize · Tailwind CSS · Netlify Functions

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Netlify                        │
│                                                  │
│  ┌──────────────────┐   ┌──────────────────────┐ │
│  │  Static Frontend │   │  Serverless Functions │ │
│  │  React + Vite    │──▶│  Express via          │ │
│  │  /client/dist    │   │  serverless-http      │ │
│  └──────────────────┘   └──────────┬───────────┘ │
└──────────────────────────────────  │  ───────────┘
                                     │
                              ┌──────▼──────┐
                              │  Supabase   │
                              │  PostgreSQL │
                              └─────────────┘
```

- **Frontend** — React SPA built with Vite, served as static files from Netlify CDN
- **Backend** — Express app wrapped with `serverless-http`, deployed as a Netlify Function at `/.netlify/functions/api`
- **Routing** — `netlify.toml` rewrites `/api/*` → `/.netlify/functions/api/*` transparently
- **Database** — Supabase PostgreSQL (free tier), connected via `DATABASE_URL`

---

## Features

**User (applicant)**
- Browse and search executive job listings by title, company, or location
- Filter by engagement type: Full-Time, Part-Time, Contract, Remote
- Apply with an optional cover letter
- Track application status in real time (pending → reviewed → accepted → rejected)

**Admin (recruiter)**
- Post and remove executive job opportunities
- View all candidates across all postings with cover letters
- Update application status through the pipeline

**Platform**
- JWT authentication with 30-day sessions, persisted in localStorage
- Role-based route guards on both client and API
- Fully serverless — zero cold-start Express on Netlify Functions
- Sovereign Executive dark theme (gold + platinum)

---

## Test Credentials

| Role  | Email                    | Password      |
|-------|--------------------------|---------------|
| Admin | `admin@sovereign.com`    | `Password123!` |
| User  | `user@sovereign.com`     | `Password123!` |

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) — `npm install -g netlify-cli`
- A PostgreSQL database (Supabase free tier recommended)

### 1. Clone & install

```bash
git clone https://github.com/BugHunterX2101/arnifi-job-app.git
cd arnifi-job-app

# Install root deps
npm install

# Install function deps
cd netlify/functions && npm install && cd ../..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure environment

Create `netlify/.env` (used by `netlify dev`):

```env
DATABASE_URL=postgresql://postgres:yourpassword@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

### 3. Seed the database

```bash
# Create a server/.env pointing at the same DATABASE_URL, then:
npm run seed
```

This creates 2 accounts and 6 executive job listings.

### 4. Run locally

```bash
netlify dev
```

This starts:
- React dev server at `http://localhost:8888`
- Netlify Functions at `http://localhost:8888/.netlify/functions/api`
- `/api/*` proxied automatically — no CORS issues

---

## Deployment (Netlify — Full Stack)

Everything deploys to a **single Netlify site**. No separate backend service needed.

### Step 1 — Database (Supabase)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, set a strong password, pick a region close to you
3. Navigate to **Project Settings → Database → Connection String → URI**
4. Copy the URI — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial sovereign executive platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/arnifi-job-app.git
git push -u origin main
```

### Step 3 — Deploy on Netlify

**Option A — Netlify UI (recommended)**

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
2. Connect your GitHub repo
3. Netlify auto-detects `netlify.toml` — build settings are pre-configured
4. Under **Site configuration → Environment variables**, add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://postgres:...@db.xxx.supabase.co:5432/postgres` |
   | `JWT_SECRET` | A random 32+ character string |
   | `JWT_EXPIRES_IN` | `30d` |
   | `NODE_ENV` | `production` |

5. Click **Deploy site** — done in ~2 minutes

**Option B — Netlify CLI**

```bash
netlify login
netlify init          # link to your GitHub repo
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set JWT_SECRET "your_secret_here"
netlify env:set JWT_EXPIRES_IN "30d"
netlify env:set NODE_ENV "production"
netlify deploy --prod
```

### Step 4 — Seed the production database

Run the seeder once to populate the DB:

```bash
# Locally with your production DATABASE_URL set:
DATABASE_URL="postgresql://..." npm run seed
```

---

## API Reference

All endpoints are served at `https://your-site.netlify.app/api` in production and `http://localhost:8888/api` in development.

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/auth/signup` | — | — |
| POST | `/api/auth/login` | — | — |
| GET | `/api/jobs` | — | — |
| GET | `/api/jobs/:id` | — | — |
| POST | `/api/jobs` | ✓ | admin |
| PUT | `/api/jobs/:id` | ✓ | admin |
| DELETE | `/api/jobs/:id` | ✓ | admin |
| POST | `/api/jobs/:id/apply` | ✓ | user |
| GET | `/api/applications` | ✓ | both |
| PATCH | `/api/applications/:id/status` | ✓ | admin |
| GET | `/api/health` | — | — |

---

## Project Structure

```
arnifi-job-app/
├── netlify.toml                 Netlify build + redirect config
├── netlify/
│   └── functions/
│       ├── api.js               Full Express app as a single serverless function
│       ├── db.js                Sequelize connection (singleton)
│       ├── models.js            User · Job · Application (cached)
│       └── package.json         Function-specific dependencies
├── server/                      Standalone Express server (local dev alternative)
│   ├── db.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── seed.js
│   └── server.js
└── client/                      React + Vite frontend
    └── src/
        ├── api/                 axios instance
        ├── store/               authSlice · jobsSlice · applicationsSlice
        ├── pages/               Login · Signup · Dashboard · Jobs · Applications
        └── components/          Navbar · JobCard · ProtectedRoute
```

---

## Environment Variables Reference

### Netlify Functions (set in Netlify dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string from Supabase |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | Token expiry, e.g. `30d` |
| `NODE_ENV` | ✅ | Set to `production` on Netlify |

### Client (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Override API base URL (not needed on Netlify) |

---

## Bugs Fixed vs Original

| Issue | Location | Fix |
|-------|----------|-----|
| `DATABASE_URL` leaked in `.gitignore` | `.gitignore` line 1 | Removed — credentials must never be committed |
| `_id` used instead of `id` | `jobsSlice.js` | Fixed — Sequelize returns UUID `id`, not MongoDB `_id` |
| Sensitive DB info logged to stdout | `server/db.js` | Removed — no credentials in logs |
| Vercel-specific `vercel.json` + `api/[[...path]].js` | Root | Removed — replaced with `netlify.toml` + Netlify Functions |
| `render.yaml` + `server/railway.json` | Root / server | Removed — not needed for Netlify |
| `sovereign_executive.md` stale doc | Root | Removed |
| No admin "Post Job" link in navbar | `Navbar.jsx` | Added nav link for admin role |
| CORS `CLIENT_ORIGIN` single-origin only | `server/server.js` | Now supports comma-separated list of origins |

---

*© 2024 Sovereign Executive Group · Arnifi*
