# Arnifi Job App — Sovereign Executive Platform

A full-stack executive job marketplace with JWT authentication, role-based access control, and a premium dark UI — deployed entirely on **Netlify** (frontend + serverless backend + database).

**Live:** https://arnifijobapp.netlify.app

---

## System Architecture

```mermaid
graph TB
    subgraph Browser["🌐 Browser"]
        SPA["React 18 SPA<br/>(Vite + Redux Toolkit + Tailwind CSS)"]
        LS["localStorage<br/>(JWT token + user object)"]
        SPA <-->|"persist / hydrate auth"| LS
    end

    subgraph Netlify["☁️ Netlify (arnifijobapp.netlify.app)"]
        CDN["CDN Edge<br/>(client/dist — static assets)"]
        REDIR["Redirect Rule<br/>/api/* → /.netlify/functions/api/:splat"]
        FN["Serverless Function<br/>(Express + serverless-http)<br/>netlify/functions/api.js"]

        CDN --> REDIR
        REDIR --> FN
    end

    subgraph Auth["🔐 Auth Layer (inside Function)"]
        JWT["JWT Middleware<br/>authenticateToken()"]
        RBAC["RBAC Middleware<br/>authorizeRole('admin' | 'user')"]
        JWT --> RBAC
    end

    subgraph API["📡 REST Endpoints"]
        A1["POST /api/auth/signup<br/>POST /api/auth/login"]
        A2["GET /api/jobs<br/>GET /api/jobs/:id"]
        A3["POST /api/jobs<br/>PUT /api/jobs/:id<br/>DELETE /api/jobs/:id<br/>— admin only —"]
        A4["POST /api/jobs/:id/apply<br/>— user only —"]
        A5["GET /api/applications<br/>PATCH /api/applications/:id/status<br/>— admin only —"]
    end

    subgraph DB["🗄️ Supabase (PostgreSQL)"]
        U[("users<br/>id · name · email<br/>password_hash · role")]
        J[("jobs<br/>id · title · company<br/>location · type · description<br/>compensation · posted_by")]
        APP[("applications<br/>id · job_id · applicant_id<br/>cover_letter · status")]
        U -->|"1 : many"| J
        U -->|"1 : many"| APP
        J -->|"1 : many"| APP
    end

    SPA -->|"fetch /api/*<br/>(Bearer JWT)"| CDN
    FN --> Auth
    Auth --> API
    A1 -->|"Sequelize ORM<br/>bcrypt · SSL pool"| U
    A2 -->|"Sequelize ORM"| J
    A3 -->|"Sequelize ORM"| J
    A4 -->|"Sequelize ORM"| APP
    A5 -->|"Sequelize ORM"| APP

    style Browser fill:#0d0d1a,stroke:#c9a84c,color:#e8e8f0
    style Netlify fill:#0d1a0d,stroke:#4caf50,color:#e8e8f0
    style Auth fill:#1a0d0d,stroke:#ef5350,color:#e8e8f0
    style API fill:#0d0d1a,stroke:#c9a84c,color:#e8e8f0
    style DB fill:#0d1a1a,stroke:#26c6da,color:#e8e8f0
```

---

## Data Flow

```mermaid
sequenceDiagram
    actor User as 👤 User / Admin
    participant SPA as React SPA
    participant LS as localStorage
    participant FN as Netlify Function
    participant DB as Supabase PostgreSQL

    Note over User,DB: Authentication
    User->>SPA: Enter email + password
    SPA->>FN: POST /api/auth/login
    FN->>DB: SELECT user WHERE email = ?
    DB-->>FN: User row (with password_hash)
    FN->>FN: bcrypt.compare(password, hash)
    FN-->>SPA: { token (JWT), user }
    SPA->>LS: Store token + user
    SPA-->>User: Redirect → /dashboard

    Note over User,DB: Applying to a Job (user role)
    User->>SPA: Click "Submit Application"
    SPA->>FN: POST /api/jobs/:id/apply<br/>Authorization: Bearer <JWT>
    FN->>FN: authenticateToken() — verify JWT
    FN->>FN: authorizeRole('user') — check role
    FN->>DB: INSERT INTO applications
    DB-->>FN: New application row
    FN-->>SPA: { applicationId, status: 'pending' }
    SPA-->>User: Success banner + link to /applications

    Note over User,DB: Update Application Status (admin role)
    User->>SPA: Click status button (admin)
    SPA->>FN: PATCH /api/applications/:id/status<br/>{ status: 'accepted' }
    FN->>FN: authenticateToken() + authorizeRole('admin')
    FN->>DB: UPDATE applications SET status = ?
    DB-->>FN: Updated row
    FN-->>SPA: { id, status }
    SPA->>SPA: Redux store updated (optimistic UI)
    SPA-->>User: Status badge updates instantly
```

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
