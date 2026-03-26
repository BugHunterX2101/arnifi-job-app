# Arnifi Job App — Sovereign Executive Platform

A full-stack executive job marketplace with JWT authentication, role-based access control, and a premium dark UI — deployed entirely on **Netlify** (frontend + serverless backend + database).

**Live:** https://arnifijobapp.netlify.app 


---

## System Architecture

```mermaid
graph TB
    subgraph Client["Browser"]
        SPA["React 18 SPA<br/>(Vite + Redux Toolkit)"]
    end

    subgraph Netlify["Netlify (Single Site — arnifijobapp.netlify.app)"]
        CDN["CDN Edge<br/>client/dist (Static)"]
        REWRITE["/api/* → /.netlify/functions/api"]
        FN["Serverless Function<br/>Express + serverless-http"]
    end

    subgraph Supabase["Supabase (PostgreSQL)"]
        DB[("PostgreSQL DB<br/>users · jobs · applications")]
    end

    SPA -->|"fetch /api/*"| CDN
    CDN --> REWRITE
    REWRITE --> FN
    FN -->|"Sequelize ORM<br/>SSL pool (max 2)"| DB

    SPA -.->|"localStorage<br/>(JWT + user)"| SPA
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Redux Toolkit, Tailwind CSS |
| Backend | Node.js, Express, Sequelize ORM, serverless-http |
| Database | PostgreSQL via Supabase (free tier) |
| Deployment | Netlify (frontend + serverless functions — single site) |

---

## Features

**Admin (Recruiter)** — Post/remove jobs · View all candidates · Update application pipeline status

**User (Applicant)** — Browse & filter jobs · Apply with cover letter · Track application status in real time

**Platform** — 10 REST endpoints · JWT auth (30-day) · Role-based guards at route, middleware & data layers · Zero CORS complexity (same-origin deployment)

---

## API Reference

| Method | Endpoint | Auth | Role |
|---|---|---|---|
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

---

## Quick Start

### Prerequisites
- Node.js 18+ · [Netlify CLI](https://docs.netlify.com/cli/get-started/)

### Local Setup

```bash
git clone https://github.com/BugHunterX2101/arnifi-job-app.git
cd arnifi-job-app
npm install --prefix netlify/functions
npm install --prefix client
```

Create **`.env`** in the **repo root** (Netlify CLI reads this automatically via the `[dev].envFile` setting in `netlify.toml`):

```env
DATABASE_URL=postgresql://postgres:yourpassword@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

> ⚠️ The `.env` file must be in the **repo root**, not in `netlify/`. See `.env.example` for a template.

```bash
npm run seed        # seed DB with 2 accounts + 6 job listings
netlify dev         # starts at http://localhost:8888
```

### Deploy to Netlify

1. Push to GitHub
2. Connect repo at [app.netlify.com](https://app.netlify.com)
3. Set environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase connection string |
| `JWT_SECRET` | 32+ char secret |
| `JWT_EXPIRES_IN` | `30d` |
| `NODE_ENV` | `production` |

4. Deploy — done in ~2 minutes. Then seed production DB once:

```bash
DATABASE_URL="postgresql://..." npm run seed
```

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@sovereign.com` | `Password123!` |
| User | `user@sovereign.com` | `Password123!` |

---

*© 2024 Sovereign Executive Group · Arnifi*
