# AI Job Board & Candidate Job Tracker (AIGravulate)

A production-ready, full-stack web application designed for seamless corporate recruitment and interactive candidate job search tracking. This platform connects employers with job seekers, offering advanced searching, custom notes, and a status progress pipeline.

---

## Architecture Overview

```mermaid
graph TD
    subgraph Client [React Frontend - Vercel]
        UI[Tailwind & Lucide UI Components]
        Context[Auth & Theme Contexts]
        AxiosClient[Axios API Wrapper]
    end

    subgraph Server [Express Backend - Render/Railway]
        Index[Express Entrypoint]
        Auth[Auth Middleware]
        Multer[Multer File Upload]
        Controllers[MVC Controllers]
        Prisma[Prisma ORM Client]
    end

    subgraph Database [PostgreSQL - Neon]
        DB[(PostgreSQL Tables)]
    end

    UI --> Context
    UI --> AxiosClient
    AxiosClient -->|HTTPS + JWT| Index
    Index --> Auth
    Index --> Multer
    Index --> Controllers
    Controllers --> Prisma
    Prisma -->|Queries| DB
```

---

## Folder Structure

```
job-board/
├── .github/
│   └── workflows/
│       └── ci-cd.yml               # GitHub Actions CI/CD Pipeline
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma schema definition
│   │   └── seed.js                 # Seeding script with mock profiles
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Centralized Prisma Client exporter
│   │   ├── controllers/            # Controller layers (Express Controllers)
│   │   ├── middleware/             # Route guards & uploads middleware
│   │   ├── routes/                 # Express Router maps
│   │   └── index.js                # Server entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable Navbar, Footer, layouts
│   │   ├── context/                # Theme and Auth states
│   │   ├── hooks/                  # Debounce custom hooks
│   │   ├── pages/                  # Browser, Details, Dashboards views
│   │   ├── services/               # Axios request handlers
│   │   └── main.jsx
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                 # Vercel SPA routing rewrites
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── docs/
│   └── api-spec.md                 # REST API Specifications
└── README.md                       # Platform documentation manual
```

---

## Database Schema (PostgreSQL)

Defined in [schema.prisma](file:///C:/Users/Anilkumar/.gemini/antigravity/worktrees/Job%20Board%20Application/init-job-board-app/job-board/backend/prisma/schema.prisma):

- **User**: Name, unique Email, password hash (bcrypt), Role enum (`CANDIDATE`, `RECRUITER`), and profile `resumeUrl`.
- **Company**: Corporate details, logo link, website, size metric, and location details.
- **Job**: Recruiter ID, Company ID, title, description (text), salary text range, experience level, job type (Full-time/Part-time/etc.), work mode (Onsite/Hybrid/Remote), and list of required skills.
- **Application**: Candidate ID, Job ID, submitted resume PDF URL, custom cover letter, tracking Notes, and Application Status enum. Unique constraint on `[candidateId, jobId]`.
- **SavedJob**: Bookmark connector linking Candidates to Job IDs. Unique constraint on `[candidateId, jobId]`.

---

## Features

### 👤 Candidate View
- **Interactive Job Search**: Filter listings by location, categories, work mode, and experience with debounced keypresses.
- **Save Listings**: Bookmark jobs for later application reviews.
- **Application Submission**: Upload custom resumes (.pdf, .doc, .docx) and write introductory cover letters.
- **Kanban Timeline Journey**: View and edit tracking progress stages (Wishlist → Applied → Screening → Assessment → Interview → HR Round → Offer → Joined).
- **Personal Notes Tracker**: Edit and save personal interview notes directly on the tracking drawer.

### 🏢 Recruiter View
- **Stats Dashboard**: Review Active/Closed job figures and total applications submitted.
- **Job CRUD**: Create, edit, toggle active status, or delete job postings.
- **Applicant Review**: Search applicant lists, inspect cover letters, check submitted CVs, and update application stages.

### 🎨 Design System
- Curated indigo/violet and teal color palettes.
- Sticky glassmorphic menus.
- Responsive grids, back-to-top helpers, and dark/light themes.

---

## Installation & Setup

### 1. Prerequisites
- Node.js (v18 or v20)
- PostgreSQL database instance (local or Neon/Supabase link)

### 2. Backend Configurations
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Configure your environment settings in a new `.env` file based on `.env.example`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/jobboard?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   FRONTEND_URL="http://localhost:5173"
   ```
4. Deploy the database schema structures using Prisma:
   ```bash
   npx prisma db push
   ```
5. Seed initial mock companies, jobs, recruiters, and candidate records:
   ```bash
   npx prisma db seed
   ```
6. Start the development API server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configurations
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## REST API Specifications

The Express API server mounts the following endpoints:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a candidate/recruiter | Public |
| **POST** | `/api/auth/login` | Authenticate and return JWT token | Public |
| **GET** | `/api/auth/me` | Fetch active user credentials | Private (Any) |
| **PUT** | `/api/auth/resume` | Upload profile default CV file | Private (Candidate) |
| **GET** | `/api/jobs` | Retrieve job listings (search/filter/sort) | Public |
| **GET** | `/api/jobs/my-postings` | Retrieve jobs posted by recruiter | Private (Recruiter) |
| **POST** | `/api/jobs` | Publish a new job opening | Private (Recruiter) |
| **PUT** | `/api/jobs/:id` | Update job parameters/status | Private (Recruiter) |
| **DELETE** | `/api/jobs/:id` | Delete job posting permanently | Private (Recruiter) |
| **GET** | `/api/applications` | Review applications (context-filtered) | Private (Any) |
| **POST** | `/api/applications/apply` | Submit resume to a job position | Private (Candidate) |
| **PUT** | `/api/applications/:id/status` | Advance candidate hiring stage | Private (Recruiter) |
| **PUT** | `/api/applications/:id/notes` | Edit custom candidate tracker notes | Private (Candidate) |
| **GET** | `/api/saved` | Fetch bookmarked job listings | Private (Candidate) |
| **POST** | `/api/saved` | Bookmark a job posting | Private (Candidate) |
| **DELETE** | `/api/saved/:id` | Remove a bookmarked listing | Private (Candidate) |

---

## Deployment & Pipeline Guides

### Vercel (Frontend)
The React application bundle contains a `vercel.json` file to support rewrite paths. In Vercel, import the `frontend/` directory, set the build command to `npm run build`, output directory to `dist`, and define `VITE_API_URL` pointing to your hosted Express API.

### Render/Railway (Backend)
Deploy the `backend/` directory. Configure the start command as `npm start`. Define environment variables: `DATABASE_URL` (Neon PostgreSQL link), `JWT_SECRET`, and `FRONTEND_URL` pointing to your hosted Vercel site.

### GitHub Actions CI/CD Pipeline
The workflow configuration is defined in [.github/workflows/ci-cd.yml](file:///C:/Users/Anilkumar/.gemini/antigravity/worktrees/Job%20Board%20Application/init-job-board-app/job-board/.github/workflows/ci-cd.yml). On push events to the `main` branch, it executes packages installation, ESLint lint checks, test suites runs, Prisma CLI builds, and deploys the React bundle to Vercel production automatically if secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) are configured.
