# HRMS Lite - Elite Fullstack

A modern, production-ready Human Resource Management System (HRMS) built with highly scalable architecture, focusing on clean UI, robust performance, and excellent user experience. 

## Project Overview

HRMS Lite is designed as a foundational employee management tool catering to an admin workflow. It efficiently manages a company directory, tracking employees, and handling daily attendance records seamlessly.

Key features include:
- **Employee Directory**: Create, read, update, and delete employee records entirely intuitively.
- **Attendance Logging**: Mark, fetch, and summarize attendance data effectively.
- **Dynamic Dashboard**: Monitor real-time statistics including total workforce and attendance summary (Present/Absent statuses).
- **Premium User Interface**: Implemented with glassmorphism touches, micro-animations, vibrant gradients, and top-tier typography (Plus Jakarta Sans) for a state-of-the-art feel.

## Tech Stack Used

### Frontend
- **React 18** (via Vite): Minimalist and exceptionally fast frontend toolchain.
- **Vanilla CSS3**: Used for extreme customizability without overhead, implementing a modern design system entirely from scratch.
- **Axios**: Promised-based HTTP client for API interactions.

### Backend (Included structure)
- **FastAPI**: Unbelievably fast, modern Python backend framework.
- **SQLAlchemy (SQLite default)**: Capable ORM handling database models and relational structures seamlessly.

## Steps to Run the Project Locally

To run the full stack locally, you need to run both the backend API and the frontend client simultaneously.

### 1. Start the Backend API
1. Navigate to the `backend` directory: `cd backend`
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API Server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The API will be available at `http://localhost:8000`*

### 2. Start the Frontend Client
1. Open a new terminal window and navigate to the `frontend` directory: `cd frontend`
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The React app will typically be available at `http://localhost:5173`*

## Assumptions & Limitations
- **Single Admin View**: This app has no login mechanism. Everyone who accesses the web port acts as the singular Admin.
- **Scope Restriction**: Leave management, payroll, and complex permissions are intentionally outside the boundary of this initial iteration to maintain ultra-fast performance.
- **Data Persistence**: Uses a local SQLite database setup in FastAPI (`sql_app.db`), implying it's not immediately horizontally scalable without migrating to Postgres/MySQL.
- **Emails Validation**: The system ensures no duplicate emails are taken natively on the backend, ensuring data integrity.
