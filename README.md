# 🚀 Smart Project & Task Collaboration System

A premium, high-performance collaborative workspace designed for modern team productivity. This application consists of a robust TypeScript Express backend backed by Prisma and MongoDB, paired with a dynamic and responsive Next.js 16 frontend powered by Tailwind CSS v4 and React 19.

---

## 🌟 Key Features

### 👤 User Authentication & Role-Based Access Control (RBAC)
- **Roles**: Admin, Project Manager, and Team Member.
- **Security**: JWT-based stateless authentication with cookies and secure password hashing via `bcryptjs`.
- **Authorization**: Granular route guards restricting access to administrative features like project creation and member assignments.

### 📁 Project Management
- **Dashboard**: Track overall project progression, active/completed tasks, and team participation.
- **Control**: Create, edit, and archive projects (restricted to Admins and Project Managers).
- **Collaboration**: Dynamically assign team members to projects.

### 📋 Task Board
- **Granular Control**: Set task priority (`HIGH`, `MEDIUM`, `LOW`), status (`TODO`, `IN_PROGRESS`, `COMPLETED`), and due dates.
- **Interactivity**: Add comments to tasks and attach file uploads (handled via `multer` storage on the backend).
- **Field-level RBAC**: Tasks can only be updated by project members, with restricted fields depending on roles.

### 🔔 Activity Logs & Notifications
- **Audit Trails**: Global activity logging tracking system changes (e.g., project/task creation, status changes).
- **Notifications**: Instant user-specific notifications for important events like task allocations and status updates.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)** | Modern react framework with server-side rendering capability. |
| | **React 19** | Latest react features and hook optimizations. |
| | **Tailwind CSS v4** | Rapid utility-first styling with the new CSS-first configuration engine. |
| | **shadcn / Base UI** | Premium component primitives for accessible and interactive design. |
| | **Recharts** | Interactive charts for data analysis on the dashboard. |
| | **Sonner** | Clean and elegant toast notifications. |
| **Backend** | **Node.js & Express** | Fast, minimalist backend framework using TypeScript. |
| | **Prisma ORM** | Type-safe database queries and migrations. |
| | **MongoDB** | Flexible, document-oriented NoSQL database. |
| | **Multer** | Middleware for managing local file and attachment uploads. |

---

## 📂 Project Architecture

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Configurations & Env variables
│   │   ├── middleware/      # Auth validation & error handlers
│   │   ├── modules/         # Feature-based logic (Auth, Projects, Tasks, Users, Notifications, Logs)
│   │   ├── prisma/          # Prisma schema and seed script
│   │   ├── index.ts         # Express application config
│   │   └── server.ts        # Database connection & server start
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router pages, layouts, and views
│   │   ├── components/      # UI design elements and custom controls
│   │   ├── context/         # React context providers (e.g., AuthContext)
│   │   └── lib/             # API client wrapper
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas cluster)

---

### 1. Backend Setup

1. **Navigate to backend and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"
   JWT_SECRET="your_jwt_secret_key"
   FRONTEND_URL="http://localhost:3000"
   ```

3. **Prisma Generation & Migration:**
   Generate the Prisma Client and push the schema to MongoDB:
   ```bash
   npm run prisma:generate
   npm run prisma:db-push
   ```

4. **Seed the Database:**
   Populate the database with default demo roles and project logs:
   ```bash
   npx prisma db seed
   ```

5. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. **Navigate to frontend and install dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables (Optional):**
   Create a `.env.local` file in the `frontend/` directory if you need to point to a different API host:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

3. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The site will be running at `http://localhost:3000`.

---

## 🔑 Demo Credentials

After seeding the database, you can log in using any of the following pre-configured test users (password for all accounts is **`Password123`**):

| Name | Email | Role | Access Level |
| :--- | :--- | :--- | :--- |
| **Alice Admin** | `admin@example.com` | `ADMIN` | Full control over projects, tasks, and users. |
| **Bob PM** | `pm@example.com` | `PROJECT_MANAGER` | Create & update projects, create tasks. |
| **Adib Member** | `member@example.com` | `TEAM_MEMBER` | View projects, update assigned tasks, comment, upload files. |
| **David Member** | `member2@example.com` | `TEAM_MEMBER` | View projects, update assigned tasks, comment, upload files. |

---

## 🔌 API Endpoints Summary

All backend API endpoints are prefix-guarded by `/api` and require authenticated cookie sessions (via JWT).

| Route Prefix | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **`/auth`** | POST | `/api/auth/register` | Register new user accounts. |
| | POST | `/api/auth/login` | Login and acquire HTTP-only auth cookies. |
| | POST | `/api/auth/logout` | Clear authenticated session cookies. |
| | GET | `/api/auth/me` | Fetch authenticated user data. |
| **`/projects`**| GET | `/api/projects` | Get all projects user is a member of. |
| | POST | `/api/projects` | Create a new project *(Admin/PM only)*. |
| | PUT | `/api/projects/:id` | Update project metadata *(Admin/PM only)*. |
| | POST | `/api/projects/:id/members` | Add a user to a project *(Admin/PM only)*. |
| **`/tasks`** | GET | `/api/tasks` | Get all tasks. |
| | POST | `/api/tasks` | Create a new task under a project *(Admin/PM only)*. |
| | PUT | `/api/tasks/:id` | Update status, priority, or details of a task. |
| | POST | `/api/tasks/:id/comments` | Post a comment on a task. |
| | POST | `/api/tasks/:id/attachments` | Upload file attachment to a task. |
| **`/notifications`**| GET | `/api/notifications` | Get user notifications. |
| **`/logs`** | GET | `/api/logs` | Fetch system audit logs. |
