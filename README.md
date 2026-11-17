# InternshipJunction

**A career and learning platform for students beginning their professional journey.**

InternshipJunction brings learning, practical projects, internships, jobs, and mentorship into one place. The goal is to help students move from building skills to applying for opportunities and tracking their progress.

> **Project status:** Development/demo build. The repository contains a broad frontend, REST API, MySQL schema, and sample seed data. It still needs environment-specific setup and full deployment/production verification.

## What it includes

- **Public catalog:** courses, internships, fellowships, jobs, mentors, pricing, and program details.
- **Student dashboard:** course learning, enrollments, assignments, projects, classes, calendar, certificates, community, notifications, and profile settings.
- **Career tools:** resume builder, ATS resume checker, job listings, and mock interview practice.
- **Mentor area:** student, course, and project views.
- **Admin area:** user, course, content, payment, certificate, and analytics pages.
- **REST API:** authentication, role-protected routes, catalog, learning, community, mentor, and admin operations.
- **Data layer:** MySQL schema, repository modules, migrations, and demo seed data.
- **Optional integrations:** Razorpay payment support and an OpenAI-compatible AI service. Payments can be simulated and AI features use a fallback when those services are disabled.

## Purpose

Students often have to use separate services to learn, find internships, get feedback, and prepare for interviews. InternshipJunction is a development project exploring a single workflow for those needs: learn a skill, build a project, get mentor feedback, and discover relevant opportunities.

## Technology

| Area | Languages and tools |
| --- | --- |
| Frontend | TypeScript/TSX, React 19, Vite, Tailwind CSS v4, React Router, TanStack Query, Axios |
| Backend | JavaScript (ES modules), Node.js, Express |
| Database | SQL, MySQL |
| Other | CSS, JWT authentication, Razorpay integration, OpenAI-compatible API |

The frontend is a single-page React application. It calls the Express API under /api; the API reads and writes application data through MySQL.

~~~mermaid
flowchart LR
    Visitor[Student, mentor, or admin] --> Web[React + TypeScript frontend]
    Web --> API[Express REST API]
    API --> DB[(MySQL)]
    API -. optional .-> AI[AI provider]
    API -. optional .-> Pay[Razorpay]
~~~

## Current progress

| Area | Status |
| --- | --- |
| Public pages and role-based dashboards | Present in the frontend |
| Authentication and REST API routes | Present in the backend |
| MySQL schema and sample seed data | Included |
| Local frontend development server | Available through Vite |
| Live payments and AI provider | Require credentials and configuration |
| Production deployment and end-to-end verification | Still to be completed |

This status describes what is present in the source; it is not a claim that every workflow has been verified in a deployed environment.

## Project layout

~~~text
.
├── frontend/
│   ├── src/pages/          # Public, student, mentor, and admin screens
│   ├── src/components/     # Shared layouts and UI components
│   ├── src/lib/            # API client, queries, and TypeScript types
│   └── public/
├── backend/
│   └── src/
│       ├── routes/         # Express API routes
│       ├── repositories/   # MySQL data access
│       ├── db/             # Schema, seed data, and mappers
│       ├── services/       # AI and payment integrations
│       └── middleware/
├── scripts/                # Local development helpers
├── index.js                # Production entry point
└── package.json            # Workspace commands
~~~

## Run locally

### Requirements

- Node.js **20.19+** or **22.12+**
- npm
- MySQL for backend features

### Install packages

Run from the repository root:

~~~bash
npm install
~~~

### Configure the backend

Copy the example environment file and fill in the required values:

~~~powershell
Copy-Item backend/.env.example backend/.env
~~~

Set your MySQL connection details and strong JWT secrets in backend/.env. The backend requires a reachable MySQL database and has no in-memory database fallback. You can generate JWT secrets with:

~~~bash
npm run secrets
~~~

Keep backend/.env private. Never commit real passwords, API keys, or JWT secrets.

### Start development

From the repository root:

~~~bash
npm run dev
~~~

This starts both the backend and frontend. By default, the frontend runs at http://localhost:5173 and the API at http://localhost:5000.

To start only the frontend:

~~~bash
npm run dev:frontend
~~~

The frontend can render without the backend, but API-backed data and actions need the backend and MySQL running.

### Build

~~~bash
npm run build
~~~

This creates frontend/dist. The workspace config points VS Code Live Server to that built folder, so run the build before using **Go Live**. For normal development with source changes updating immediately, use npm run dev.

## Useful commands

| Command | Purpose |
| --- | --- |
| npm run dev | Start frontend and backend |
| npm run dev:frontend | Start the Vite frontend |
| npm run dev:backend | Start the Express backend |
| npm run check:ports | Check default development ports |
| npm run secrets | Generate JWT secrets |
| npm run build | Build the frontend into frontend/dist |
| npm start | Start the backend/production entry point |
| npm run lint | Lint the frontend |

## Notes

- The backend loads configuration from backend/.env and validates required values on startup.
- backend/.env.example and frontend/.env.example are templates; replace example values before using integrations.
- Razorpay and AI features require their own credentials to use live providers.
- The repository does not yet declare a license.
