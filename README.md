# SkillSetu (कौशल सेतु)

> **Academia-Industry Skill Intelligence & Verifiable Credential Platform**  
> Developed for **Smart India Hackathon (SIH 2026) — Problem Statement 26044**

---

## Overview

Traditional campus hiring and skill certification rely heavily on unverified resumes, fragmented spreadsheets, and static academic transcripts. **SkillSetu** bridges the gap between academic curricula and live industry demand by introducing an evidence-backed intelligence layer.

Every proficiency score on SkillSetu traces back to a completed assessment, verified repository/project, or faculty-evaluated milestone — eliminating self-reported inflation and giving employers deterministic proof of competence.

---

## Core Capabilities

- **Role-Based Portals**: Dedicated workspaces tailored to the operational needs of 5 stakeholders:
  - **🎓 Student**: Skill radar, deterministic gap analysis, diagnostic assessments, and job matching.
  - **🔬 Academician / Technician**: Curriculum alignment tracking, department skill gaps, and Faculty Development Programs (FDP).
  - **🏛️ Institution (Admin / TPO)**: Cohort-level analytics, placement readiness index, and evidence audit queues.
  - **💼 Industry / Employer**: Posting live openings, reviewing verified candidate profiles with skill-match rationales, and collaborating on syllabi.
  - **⚙️ Platform Admin**: System health monitoring, taxonomy management, and global credential verification.
- **Digital Skill Passport**: Tamper-evident credentialing summarizing verified competencies, assessment history, and direct project evidence.
- **Industry–Academia Collaboration Hub**: Direct marketplace for curriculum co-creation, guest lectures, internships, and faculty exchange programs.
- **Multilingual Support**: Fully localized in **12 Indian regional languages** (Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, English).
- **Modern Adaptive UI**: Engineered with a warm champagne-amber / ivory palette, smooth dark/light mode switching, and glassmorphic micro-interactions.

---

## Tech Stack

- **Frontend**: React 18, Vite, Sass/SCSS, React Router 6, Bootstrap 5.3
- **Backend**: Node.js (ES modules), Express, Mongoose (MongoDB), Joi validation, JSON Web Tokens (JWT)
- **Database**: MongoDB Atlas or local MongoDB instance

---

## Project Structure

```text
skillsetu/
├── backend/               # Express REST API (default port 5050)
│   ├── src/
│   │   ├── config/        # Environment & MongoDB connection
│   │   ├── controllers/   # Business logic & request handlers
│   │   ├── middleware/    # JWT auth guard, role-based ACL, error handlers
│   │   ├── models/        # Mongoose schemas (Users, Skills, Portfolios, etc.)
│   │   ├── routes/        # Modular API route definitions
│   │   └── seed/          # Initial seed dataset with realistic demo personas
│   └── package.json
│
├── frontend/              # React + Vite client (default port 5173)
│   ├── src/
│   │   ├── api/           # Centralized API client with interceptors
│   │   ├── components/    # Reusable UI widgets, guards, layout shells
│   │   ├── context/       # Auth, Theme (Dark/Light), and Language contexts
│   │   ├── locales/       # JSON dictionaries for 12 Indian languages
│   │   ├── pages/         # Screen views (Landing, Login, Register, Dashboards)
│   │   └── styles/        # SCSS design system tokens & theme overrides
│   └── package.json
│
└── README.md
```

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v20 or higher
- **MongoDB**: Local `mongod` instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repository
```bash
git clone git@github.com:Apoorv-Tripathi/SkillSetu.git
cd SkillSetu
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` with your credentials:
```env
PORT=5050
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/skillsetu?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Seed the database with realistic demo records:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Server listens on http://localhost:5050
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Vite runs at http://localhost:5173
```

---

## Demo Credentials

The login screen includes **1-Click Demo Pills** that automatically populate and authenticate these accounts:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | Aditi Sharma | `student@demo.skillsetu.local` | `Demo@1234` |
| **Academician** | Dr. Anil Kapoor | `academician@demo.skillsetu.local` | `Demo@1234` |
| **Institution Admin** | Dr. Meena Kulkarni | `admin@demo.skillsetu.local` | `Demo@1234` |
| **Industry Partner** | Rakesh Verma | `industry@demo.skillsetu.local` | `Demo@1234` |
| **Platform Admin** | Platform Administrator | `platformadmin@demo.skillsetu.local` | `Demo@1234` |

---

## Deployment Guide (Render / Cloud)

### 1. Backend Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `PORT`: `5050`
  - `MONGODB_URI`: `<your-mongodb-connection-string>`
  - `JWT_SECRET`: `<secure-random-string>`
  - `CLIENT_ORIGIN`: `<your-frontend-render-url>`

### 2. Frontend Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **SPA Rewrite Rule**: `/*` → `/index.html`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `<your-backend-render-url>/api`

---

## License

Created for Smart India Hackathon 2026. All rights reserved.
