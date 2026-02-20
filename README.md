<div align="center">

<h1>📚 AssignPortal</h1>

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg" width="60" />&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg" width="60" />&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" width="60" />&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" width="60" />

<p><strong>A full-featured Assignment Submission Portal built with the MERN stack</strong></p>



<p>
  <a href="#-features"><img src="https://img.shields.io/badge/Features-8-6366f1?style=for-the-badge" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Stack-MERN-10b981?style=for-the-badge" /></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Setup-5%20min-f59e0b?style=for-the-badge" /></a>
  <img src="https://img.shields.io/badge/License-MIT-gray?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/badge/React-18.2-61dafb?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

<br/>

> A modern, dark-themed assignment management system with role-based access for Students, Teachers, and Admins — featuring real-time deadline countdowns, drag-and-drop file uploads, and a comprehensive grading workflow.

</div>

---

## ✨ Features

### 🎓 Students
- Browse active assignments with **live countdown timers** (Days : Hours : Mins : Secs)
- **Drag & drop** multi-file uploader with preview and file removal
- Submit with optional comments; automatically flagged as **Late** if past deadline
- View grade, percentage score bar, and teacher feedback
- Personal dashboard with submission stats

### 👩‍🏫 Teachers
- Create assignments with subject, description, deadline, max marks, and file attachments
- View per-assignment submission list in a sortable table
- **Grade submissions** with marks + written feedback on a side-by-side panel
- **Quick mark buttons** (25% / 50% / 75% / 100%)
- Return submissions for revision

### ⚙️ Admins
- Platform-wide **statistics dashboard** (users, assignments, submissions, avg scores)
- **User management**: create, search, filter by role, activate/deactivate, delete
- View all submissions across the entire platform
- 3-tab admin panel: Overview · Users · Submissions

### 🔐 Security
- JWT authentication (7-day expiry)
- Bcrypt password hashing (12 salt rounds)
- Role-based access control (RBAC) on every route
- Input validation with express-validator
- File type whitelist + 50MB upload limit

---

## 🖼️ Screenshots

| Student Dashboard | Teacher — Grade Submission |
|---|---|
| Assignment cards with live countdown timers, status badges, and submission shortcuts | Side-by-side file viewer with sticky grading panel and score progress bar |

| Admin Panel | Submit Assignment |
|---|---|
| Stats overview, user management table with activate/deactivate controls | Drag & drop upload zone with file type icons and inline preview |

---

## 🗂️ Project Structure

```
assignment-portal/
├── 📁 backend/
│   ├── 📁 models/
│   │   ├── User.js            # Roles: student | teacher | admin
│   │   ├── Assignment.js      # Title, subject, deadline, maxMarks, attachments
│   │   └── Submission.js      # Files, status, marks, feedback, gradedBy
│   ├── 📁 routes/
│   │   ├── auth.js            # Register · Login · Me · Update Profile
│   │   ├── assignments.js     # CRUD + per-assignment submissions
│   │   ├── submissions.js     # Upload · Grade · Return
│   │   └── admin.js           # Stats · User CRUD · All submissions
│   ├── 📁 middleware/
│   │   ├── auth.js            # protect() + restrictTo(...roles)
│   │   └── upload.js          # Multer with dynamic folder + type filter
│   ├── seed.js                # Demo data seeder
│   ├── server.js              # Express entry point
│   └── .env.example
│
└── 📁 frontend/
    └── 📁 src/
        ├── 📁 context/
        │   └── AuthContext.js       # Global auth state + axios token injection
        ├── 📁 components/
        │   ├── Layout.js            # Responsive sidebar navigation
        │   ├── CountdownTimer.js    # Live seconds-level deadline ticker
        │   └── StatusBadge.js       # Color-coded status chips
        └── 📁 pages/
            ├── LoginPage.js         # Auth form + demo credential shortcuts
            ├── RegisterPage.js      # Role-select registration
            ├── StudentDashboard.js  # Filtered assignment grid with stats
            ├── TeacherDashboard.js  # Create form + submissions table
            ├── AdminDashboard.js    # 3-tab admin panel
            ├── AssignmentDetail.js  # Full detail + countdown + grade reveal
            ├── SubmitAssignment.js  # Drag & drop file uploader
            ├── GradeSubmission.js   # Grading panel with score bar
            └── MySubmissions.js     # Student history + score tracking
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone

```bash
git clone https://github.com/yourusername/assignment-portal.git
cd assignment-portal
```

### 2. Backend

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb://localhost:27017/assignment_portal
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
```

```bash
# Optional: seed demo data
node seed.js

# Start server
npm run dev       # development (nodemon)
npm start         # production
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

### 4. Open

| Service | URL |
|---|---|
| React App | http://localhost:3000 |
| API | http://localhost:5000/api |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🎓 Student | `student@demo.com` | `demo123` |
| 👩‍🏫 Teacher | `teacher@demo.com` | `demo123` |
| ⚙️ Admin | `admin@demo.com` | `demo123` |

> Run `node backend/seed.js` to populate demo users, assignments, and submissions.

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create account |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/auth/me` | Any | Get current user |
| `PUT` | `/api/auth/profile` | Any | Update name/password |

### Assignments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/assignments` | Any | List all active assignments |
| `GET` | `/api/assignments/:id` | Any | Get single assignment |
| `POST` | `/api/assignments` | Teacher/Admin | Create (multipart/form-data) |
| `PUT` | `/api/assignments/:id` | Teacher/Admin | Update assignment |
| `DELETE` | `/api/assignments/:id` | Teacher/Admin | Soft-delete |
| `GET` | `/api/assignments/:id/submissions` | Teacher/Admin | All submissions for assignment |

### Submissions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/submissions` | Student | Upload files + submit |
| `GET` | `/api/submissions/my` | Student | Personal submission history |
| `GET` | `/api/submissions/:id` | Any | Submission detail |
| `PUT` | `/api/submissions/:id/grade` | Teacher/Admin | Assign marks + feedback |
| `PUT` | `/api/submissions/:id/return` | Teacher/Admin | Return for revision |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Platform statistics |
| `GET` | `/api/admin/users` | Admin | All users (search + filter) |
| `POST` | `/api/admin/users` | Admin | Create user |
| `PUT` | `/api/admin/users/:id/toggle` | Admin | Activate/Deactivate |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user |
| `GET` | `/api/admin/submissions` | Admin | All platform submissions |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6 |
| **Styling** | Tailwind CSS (dark theme, custom palette) |
| **HTTP Client** | Axios with JWT interceptors |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT) |
| **File Uploads** | Multer (multipart/form-data) |
| **Password Hashing** | bcryptjs (12 rounds) |
| **Validation** | express-validator |
| **Dates** | date-fns |
| **Toasts** | react-hot-toast |

---

## 🗺️ Database Schema

```
User
├── name, email, password (hashed)
├── role: "student" | "teacher" | "admin"
└── isActive: Boolean

Assignment
├── title, description, subject
├── teacher → User
├── deadline: Date
├── maxMarks: Number
└── attachments: [{ filename, originalName, path, size }]

Submission
├── assignment → Assignment
├── student → User
├── files: [{ filename, originalName, path, size, mimetype }]
├── status: "submitted" | "late" | "graded" | "returned"
├── marks: Number (null until graded)
├── feedback: String
└── gradedBy → User
```

---

## 📄 License

MIT © 2025 — Free to use and modify.

---

<div align="center">

**[⬆ Back to top](#-assignportal)**

Made with ❤️ using the MERN stack

</div>
