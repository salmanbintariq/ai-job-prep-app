<div align="center">

# 🤖 AI Job Prep App

**An AI-powered interview preparation platform that turns your resume and a job description into a personalized hiring roadmap.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://ai-job-prep-app.vercel.app/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini API](https://img.shields.io/badge/Google-Gemini_API-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

**[🔗 Live Demo](https://ai-job-prep-app.vercel.app/)** · [Features](#-features) · [Tech Stack](#️-tech-stack) · [Architecture](#️-architecture) · [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

Job hunting shouldn't mean guessing what an interviewer will ask. **AI Job Prep App** analyzes your resume against a real job description, scores your fit, surfaces the exact skills you're missing, and builds you a day-by-day plan to close the gap — then generates the tailored, ATS-friendly resume to go with it.

## 📸 Screenshots

<table>
<tr>
<td align="center"><b>Login</b><br><img src="/screenshots/login-page.png" width="400"/></td>
<td align="center"><b>Home</b><br><img src="/screenshots/home-page.png" width="400"/></td>
</tr>
<tr>
<td align="center"><b>Interview Report</b><br><img src="/screenshots/recent-interviews.png" width="400"/></td>
<td align="center"><b>Skill Gaps & Prep Plan</b><br><img src="/screenshots/analysis-page.png" width="400"/></td>
</tr>
</table>

---

## ✨ Features

### 📄 Resume Analysis
Upload your existing resume as a PDF and let the app extract and parse your experience, skills, and projects automatically.

### 🎯 Job Description Matching
Paste a target job description and get an AI-generated compatibility score based on how well your resume aligns with the role's requirements.

### 🧠 AI-Generated Interview Questions
For every analysis, the app generates:
- 5 technical interview questions
- 5 behavioral interview questions
- The interviewer's intent behind each question
- Suggested model answers
- Behavioral answers structured with the **STAR method**

### 🔍 Skill Gap Analysis
Identifies the skills missing from your resume relative to the target role, each tagged by severity:

| Severity | Meaning |
|:---:|---|
| 🟢 Low | Nice-to-have, minor gap |
| 🟡 Medium | Worth addressing before applying |
| 🔴 High | Likely a dealbreaker — prioritize this |

### 📅 Personalized 7-Day Preparation Plan
A day-by-day study plan built from your current skills, the target job's requirements, your identified skill gaps, and the generated interview questions.

### 📄 AI Resume Builder
Generates a tailored, ATS-friendly resume from your existing resume, the job description, and a short self-description — then renders it as a downloadable PDF.

### 🔐 Authentication
Secure register, login, and logout, with each user's interview reports scoped to their own account.

### 💾 Report History
Every generated interview report is saved to MongoDB, so you can revisit past prep sessions anytime.

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="25%">

**Frontend**
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- JavaScript

</td>
<td valign="top" width="25%">

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer

</td>
<td valign="top" width="25%">

**AI**
- Google Gemini API (`@google/genai`)
- Zod (response validation)

</td>
<td valign="top" width="25%">

**PDF Processing**
- `unpdf` — extract text from uploaded resumes
- Puppeteer — render generated HTML resumes to PDF

</td>
</tr>
</table>

**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database) · Google Gemini API (AI processing)

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │        User          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend     │
                    │       (Vercel)        │
                    └──────────┬───────────┘
                               │
                        REST API / Axios
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Express Backend      │
                    │       (Render)         │
                    └──────┬───────┬────────┘
                           │       │
              ┌────────────┘       └─────────────┐
              ▼                                   ▼
     ┌──────────────────┐               ┌────────────────────┐
     │   MongoDB Atlas    │               │    Gemini API        │
     │     Database         │               │  AI Processing       │
     └──────────────────┘               └──────────┬─────────┘
                                                     │
                                                     ▼
                                          ┌────────────────────┐
                                          │  Generated Resume     │
                                          │        (HTML)          │
                                          └──────────┬─────────┘
                                                     │
                                                     ▼
                                          ┌────────────────────┐
                                          │      Puppeteer         │
                                          │     HTML → PDF          │
                                          └────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas connection string
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/salmanbintariq/ai-job-prep-app.git
cd ai-job-prep-app

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file inside `server/` with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Create a `.env` file inside `client/` with:

```env
VITE_API_URL=http://localhost:5000
```

### Run Locally

```bash
# Start the backend
cd server
npm run dev

# In a separate terminal, start the frontend
cd client
npm run dev
```

---

## 📂 Project Structure

```text
ai-job-prep-app/
├── client/          # React + Vite frontend
├── server/          # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── middleware/
└── screenshots/      # README images
```

---

## 🗺️ Roadmap

- [ ] Mock interview mode with voice input
- [ ] Multi-resume comparison against a single job description
- [ ] Export preparation plan as a calendar (.ics)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue.

---

<div align="center">

Built with ❤️ as a full-stack AI resume project.

</div>