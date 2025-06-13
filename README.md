# Job Hiring Platform

A full-stack job hiring platform that connects employees and HRs, enabling job seekers to create profiles, upload resumes (with OCR support), and apply for jobs, while HRs can post jobs and manage applicants.

---

## Features

- Employee and HR authentication (signup/login)
- Employee profile management with resume upload (PDF/DOC/DOCX/TXT, OCR extraction)
- Job matching based on resume content and skills
- Job application tracking and status updates
- HR job posting and applicant management
- Modern UI with React, Tailwind CSS, and Lucide icons
- RESTful backend with Express and MongoDB

---

## File Structure

```
project-job_hiring/
│
├── backend/
│   ├── models/
│   │   └── Employee.js
│   ├── routes/
│   │   └── employeeRoutes.js
│   ├── utils/
│   │   └── mlMatcher.js
│   ├── server.js
│   └── ... (other backend files)
│
├── project/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── JobCard.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── JobDetailsPage.tsx
│   │   │   └── ... (other pages)
│   │   ├── utils/
│   │   │   └── api.ts
│   │   └── App.tsx
│   ├── .env
│   └── ... (other frontend files)
│
├── .env
├── README.md
└── .gitignore
```

---

## Workflow

### 1. Employee Registration & Login

- Employees sign up and log in via the frontend.
- Backend validates and stores user data in MongoDB.

### 2. Profile & Resume Management

- Employees can update their profile, add skills, and upload resumes.
- Resume files (PDF/DOC/DOCX/TXT) are processed on the frontend using OCR.space API for text extraction.
- Extracted text is stored in the employee's profile for job matching.

### 3. Job Matching

- The backend uses the employee's resume and skills to calculate job matches using a matching utility (`mlMatcher.js`).
- Matches are fetched and displayed on the employee dashboard.

### 4. Job Application

- Employees can apply to matched jobs.
- Applications are tracked with status updates (applied, reviewing, shortlisted, rejected).

### 5. HR Workflow

- HRs can post jobs and view/manage applicants.
- Company information is displayed on job detail pages.

---



## Getting Started

### Prerequisites

- Node.js
- MongoDB
- (Optional) OCR.space API key (already included in `.env`)

### Setup

1. **Clone the repository:**
   ```
   git clone <repo-url>
   cd project-job_hiring
   ```

2. **Install dependencies:**
   - Backend:
     ```
     cd backend
     npm install
     ```
   - Frontend:
     ```
     cd ../project
     npm install
     ```

3. **Configure environment variables:**
   - Edit `.env` and `project/.env` as needed (see provided `.env` for OCR API key and MongoDB URI).

4. **Run the backend:**
   ```
   cd backend
   npm start
   ```

5. **Run the frontend:**
   ```
   cd ../project
   npm run dev
   ```

6. **Access the app:**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Notes

- Resume text extraction uses OCR.space API. For best results, upload clear PDF/DOC/DOCX/TXT files.
- All sensitive data (API keys, DB URIs) should be kept in `.env` files and not committed to version control.

---

## License

MIT License

