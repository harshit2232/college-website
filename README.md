# IEM (Institute of Engineering & Management) - Admissions Portal (MERN Stack)

A full-stack, enterprise-grade **College Admission Portal** built for **IEM (Institute of Engineering & Management)** using MongoDB, Express.js, React.js, Node.js, and Tailwind CSS. The application follows role-based access control (RBAC) across **Student**, **Faculty**, and **Admin** modules with real-time lifecycle tracking, document verification, payment simulator, and visual executive analytics.

---

## 🏛️ System Architecture & Credentials

### Default Seeded Accounts
| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `rajh36073@gmail.com` | `harshit@500` | Program CRUD, User Management, Executive Analytics, Global Overrides, CSV Exports |
| **Faculty** | `faculty@iem.edu.in` / `faculty@nexis.edu` | `faculty@500` | Computer Science evaluation queue, document inspection, score submission |
| **Faculty (Business)** | `business.faculty@nexis.edu` | `faculty@500` | Business & Management admissions queue |
| **Student** | `student@iem.edu.in` / `student@nexis.edu` | `student@500` | Application wizard, credential locker, payment receipt, offer letter |

> **Quick Login Tip:** On the `/login` page, click any of the **1-Click Quick Demo** buttons at the top to auto-fill credentials for instant testing!

---

## 🚀 Key Modules & Capabilities

### 1. 🎓 Student Module
- **Public Degree Catalog (`/programs`)**:
  - Filterable by Degree (`B.Tech`, `M.Tech`, `MBA`, `M.Sc`, `B.Sc`), Department, and application fee.
  - Detailed modal with full curriculum overview, seat capacities, and admission criteria.
- **5-Step Application Wizard (`/student/apply`)**:
  - **Step 1:** Program & Intake Term Selection (`Fall 2026`, `Spring 2027`).
  - **Step 2:** Personal Details & Contact Records (auto-fills from student profile).
  - **Step 3:** Academic Qualifications, Standardized Test Scores (`SAT`, `GRE`, `IELTS`), and Statement of Purpose (SOP).
  - **Step 4:** Document Uploads with validation (Transcripts, Marksheet, ID Proof, Photo) and inline preview/remove.
  - **Step 5:** Application Fee Payment Simulator & Final Submission.
- **Application Status & Offer Letter (`/student/applications/:id`)**:
  - Real-time `TimelineTracker` showing progression: `Draft` → `Submitted` → `Under Review` → `Verified` → `Approved / Admitted`.
  - **Official Admission Offer Letter**: If status is `Approved`, celebration confetti triggers and candidate can view and print their official university acceptance letter with presidential seal.
  - **Printable Fee Receipt**: Official bursar voucher with transaction ID and receipt number.
- **Document Locker (`/student/documents`)**:
  - Upload, inspect, and track verification feedback from faculty.
- **Candidate Profile (`/student/profile`)**:
  - Completion score calculation, contact information, emergency contacts, and academic history.

### 2. 👨‍🏫 Faculty Module
- **Evaluation Queue (`/faculty/queue`)**:
  - Filter applications by department, degree, and lifecycle status.
- **Candidate Review Workbench (`/faculty/review/:id`)**:
  - Candidate background and statement of purpose.
  - **Document Verification Interface**: Approve or Reject individual documents with inline feedback comments.
  - **Evaluation Scorecard**: Submit scores for Academic Record (0-100), Interview (0-100), Statement of Purpose (0-100), and auto-calculate composite score.
  - **Recommendation**: Set committee status (`recommend`, `waitlist`, `reject`, `need_info`) and update application lifecycle status (`Under Review`, `Verified`, `Approved`, `Waitlisted`, `Rejected`).

### 3. 🛡️ Admin Module
- **Executive Analytics Dashboard (`/admin/dashboard`)**:
  - Recharts visual charts: Applications by Department Bar Chart, Application Status Pie/Donut Chart.
  - Metric cards: Total Applications, Acceptance Rate (%), Fee Revenue ($), Registered Students, Enrolled Seats.
  - Live stream of recent admissions.
- **Academic Programs Management (`/admin/programs`)**:
  - Full CRUD operations: Create, Edit, and Delete/Archive academic programs.
  - Set eligibility requirements, seat capacities, intake deadlines, application fees, and active/closed status.
- **User Management & RBAC (`/admin/users`)**:
  - View all student, faculty, and administrator accounts.
  - Create new authorized faculty accounts with department assignments.
  - One-click active/inactive security status toggling.
- **Master Applications Table (`/admin/applications`)**:
  - Global search and status override modal with audit note logging.
- **Reports & Data Export (`/admin/reports`)**:
  - Departmental breakdown ledger and one-click export to CSV.

---

## 🛠️ Project Structure

```
college website/
├── server/                         # Node.js & Express REST Backend
│   ├── config/db.js                # MongoDB connection + Embedded MongoMemoryServer fallback
│   ├── controllers/                # Modular controllers (auth, program, application, document, payment, faculty, admin, report, notification)
│   ├── middleware/                 # auth (JWT & RBAC), upload (multer), errorHandler
│   ├── models/                     # User, StudentProfile, Program, Application, Document, Payment, Notification
│   ├── routes/                     # REST API route endpoints
│   ├── uploads/                    # Physical document file storage
│   ├── utils/seedData.js           # Sample programs & realistic test datasets
│   ├── seed.js                     # Auto-run / standalone database seeder
│   ├── server.js                   # Main Express application entry point (Port 5050)
│   ├── package.json
│   └── .env
└── client/                         # Modern React Vite Frontend
    ├── src/
    │   ├── api/                    # Axios client & organized API endpoints
    │   ├── components/             # StatusBadge, TimelineTracker, Modals (Receipt, Offer Letter, Document Preview), Navbar, Footer
    │   ├── context/                # AuthContext (session & RBAC), ToastContext (rich alert toasts)
    │   ├── pages/
    │   │   ├── auth/               # LoginPage, RegisterPage
    │   │   ├── student/            # StudentDashboard, ApplicationWizard, MyApplications, ApplicationDetail, StudentDocuments, StudentProfilePage
    │   │   ├── faculty/            # FacultyDashboard, FacultyReviewPage
    │   │   ├── admin/              # AdminDashboard, ProgramManagement, UserManagement, AllApplications, ReportsPage
    │   │   └── LandingPage.jsx, ProgramsPage.jsx
    │   ├── App.jsx                 # Client routing & protected routes
    │   ├── main.jsx
    │   └── index.css               # Tailwind CSS & print media stylesheets
    ├── vite.config.js              # Vite dev server with proxy to backend port 5050
    └── package.json
```

---

## ⚡ Running Locally

### 1. Start the Backend API Server
```bash
cd server
npm install
node server.js
```
The server will run at `http://localhost:5050`. It automatically connects to your local MongoDB or launches an embedded in-memory MongoDB instance with zero configuration required!

### 2. Start the Frontend React Client
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` (or the port shown in terminal, e.g. `http://localhost:5174`) in your web browser.
