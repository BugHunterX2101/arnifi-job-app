# Arnifi Job App — Sovereign Executive Platform

A full-stack executive job marketplace with JWT authentication, role-based access control, and a premium dark UI — deployed entirely on **Netlify** (frontend + serverless backend + database).

**Live:** https://arnifijobapp.netlify.app

---

## File Structure

```
arnifi-job-app/
│
├── .env.example                  # Root env template (for netlify dev + seed)
├── .gitignore
├── .node-version                 # Pins Node 18 for Netlify builds
├── .nvmrc                        # Pins Node 18 for local dev via nvm
├── netlify.toml                  # Netlify build, dev, redirect & function config
├── package.json                  # Root: build/dev/seed scripts + concurrently
├── README.md
│
├── client/                       # React 18 SPA (Vite + Redux Toolkit + Tailwind)
│   ├── index.html                # HTML shell — Google Fonts (Inter, Playfair Display)
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js        # Custom sovereign colour palette + animations
│   ├── vite.config.js            # Vite config — proxies /api/* → localhost:8888
│   ├── .env.example              # VITE_API_URL for standalone (non-Netlify) deploys
│   └── src/
│       ├── main.jsx              # React root — Redux Provider + setStore(store)
│       ├── App.jsx               # BrowserRouter + all Route definitions
│       ├── index.css             # Tailwind directives + custom component classes
│       ├── api/
│       │   └── axios.js          # Axios instance — JWT interceptor + 401 auto-logout
│       ├── components/
│       │   ├── JobCard.jsx       # Reusable job listing card (with admin delete button)
│       │   ├── Navbar.jsx        # Fixed top nav — role-aware links + sign out
│       │   └── ProtectedRoute.jsx # <ProtectedRoute> + <RoleGuard> wrappers
│       ├── pages/
│       │   ├── LoginPage.jsx     # Email/password login form
│       │   ├── SignupPage.jsx    # Registration — role selector (admin / user)
│       │   ├── DashboardPage.jsx # Command Centre — stats, recent jobs & apps
│       │   ├── JobsPage.jsx      # Job browser — search + type filter + grid
│       │   ├── JobDetailPage.jsx # Single job view — apply form (user) / delete (admin)
│       │   ├── PostJobPage.jsx   # Create new job listing (admin only)
│       │   └── ApplicationsPage.jsx # Applications list — status update (admin)
│       └── store/
│           ├── index.js          # configureStore — auth + jobs + applications
│           ├── authSlice.js      # Auth state — login/signup thunks + localStorage sync
│           ├── jobsSlice.js      # Jobs CRUD + apply thunks
│           └── applicationsSlice.js # Applications fetch + status update
│
├── netlify/
│   └── functions/
│       ├── package.json          # Function deps: express, sequelize, pg, jwt, bcrypt…
│       ├── api.js                # Main serverless handler — all 10 REST endpoints
│       ├── db.js                 # Sequelize singleton — Supabase SSL pool config
│       └── models.js             # User / Job / Application models + associations
│
└── server/                       # Standalone Express server (optional local/Render deploy)
    ├── package.json
    ├── .env.example
    ├── server.js                 # Express app — CORS, routes, DB sync + listen
    ├── db.js                     # Sequelize — prod SSL / dev plain config
    ├── seed.js                   # Seeds 2 users + 6 jobs + 1 application
    ├── middleware/
    │   ├── auth.js               # authenticateToken + authorizeRole middleware
    │   └── errorHandler.js       # Sequelize-aware global error handler
    ├── models/
    │   ├── index.js              # Loads all models + sets up associations
    │   ├── User.js               # User model — bcrypt hooks + comparePassword
    │   ├── Job.js                # Job model — UUID PK, ENUM type
    │   └── Application.js        # Application model — unique (jobId, applicantId)
    └── routes/
        ├── auth.js               # POST /signup  POST /login
        ├── jobs.js               # GET / GET /:id  POST  PUT /:id  DELETE /:id  POST /:id/apply
        └── applications.js       # GET /  PATCH /:id/status
```

---

## System Architecture

```
Browser (React SPA)
  └── fetch /api/*
        └── Netlify CDN Edge
              └── /api/* → /.netlify/functions/api
                    └── Serverless Function (Express + serverless-http)
                          └── Sequelize ORM (SSL pool)
                                └── Supabase PostgreSQL
                                      └── tables: users · jobs · applications
```

---

## Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18, React Router v6, Redux Toolkit, Tailwind CSS  |
| Backend    | Node.js, Express, Sequelize ORM, serverless-http        |
| Database   | PostgreSQL via Supabase (free tier)                     |
| Deployment | Netlify (frontend + serverless functions — single site) |

---

## Features

**Admin (Recruiter)** — Post/remove jobs · View all candidates · Update application pipeline status

**User (Applicant)** — Browse & filter jobs · Apply with cover letter · Track application status in real time

**Platform** — 10 REST endpoints · JWT auth (30-day) · Role-based guards at route, middleware & data layers · Zero CORS complexity (same-origin deployment)

---

## API Reference

| Method | Endpoint                        | Auth | Role  |
|--------|---------------------------------|------|-------|
| POST   | `/api/auth/signup`              | —    | —     |
| POST   | `/api/auth/login`               | —    | —     |
| GET    | `/api/jobs`                     | —    | —     |
| GET    | `/api/jobs/:id`                 | —    | —     |
| POST   | `/api/jobs`                     | ✓    | admin |
| PUT    | `/api/jobs/:id`                 | ✓    | admin |
| DELETE | `/api/jobs/:id`                 | ✓    | admin |
| POST   | `/api/jobs/:id/apply`           | ✓    | user  |
| GET    | `/api/applications`             | ✓    | both  |
| PATCH  | `/api/applications/:id/status`  | ✓    | admin |

---

## Quick Start

### Prerequisites

* Node.js 18+ · [Netlify CLI](https://docs.netlify.com/cli/get-started/)

### Local Setup

```bash
git clone https://github.com/BugHunterX2101/arnifi-job-app.git
cd arnifi-job-app
npm install --prefix netlify/functions
npm install --prefix client
```

Create **`.env`** in the **repo root**:

```env
DATABASE_URL=postgresql://postgres:yourpassword@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

```bash
npm run seed        # seed DB with 2 accounts + 6 job listings
netlify dev         # starts at http://localhost:8888
```

### Deploy to Netlify

1. Push to GitHub
2. Connect repo at [app.netlify.com](https://app.netlify.com)
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=30d`, `NODE_ENV=production`
4. Deploy. Then seed production DB once: `DATABASE_URL="postgresql://..." npm run seed`

---

## Test Credentials

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | `admin@sovereign.com`  | `Password123!` |
| User  | `user@sovereign.com`   | `Password123!` |

---

*© 2024 Sovereign Executive Group · Arnifi*
