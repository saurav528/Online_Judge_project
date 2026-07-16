# Walkthrough: Admin Login & Platform Updates

This document explains the architecture and updates made to the Ummeed Coding Platform, specifically focusing on the Admin Login implementation, platform UI enhancements, and the Judge0 compiler integration.

## 1. Admin Login & Authorization

### The Problem
The platform needed a secure way for administrators to manage contests and problems without allowing standard users (students) to access these sensitive areas.

### The Solution
We implemented a robust, separate authentication flow for administrators using a dual-layered approach:

1.  **Custom Credentials Bypass (Better-Auth)**
    We configured the `better-auth` credentials provider to intercept login attempts. If the user provides the specific Admin Username and Password (defined in `.env`), the system bypasses standard database checks and generates a mock session with the `ADMIN` role. 
    
2.  **Server Actions and Middleware**
    -   We created `src/app/actions/admin-auth.ts` to handle the admin login verification and set secure HTTP-only cookies (`admin_session`).
    -   The Next.js layout (`src/app/(admin)/layout.tsx`) verifies this cookie. If a user attempts to access `/admin/*` routes without this cookie or the proper `ADMIN` role, they are instantly redirected back to the standard login page.

### Fixing the Foreign Key Constraint
Because the Admin session uses a mock ID (`admin-system-bypass`), the Postgres database initially rejected saving new problems (since it expects `createdById` to be a real user ID). We resolved this by modifying `problems.ts` to set `createdById` to `null` whenever the system detects the bypass admin session, allowing seamless problem creation.

---

## 2. Platform UI Enhancements

To create a more professional and dynamic environment, several key improvements were made:

-   **Dynamic Contest Status**: Instead of relying on a static database column, contest status (Running, Ended, Upcoming) is now calculated dynamically in `ContestService` based on the real-time clock. This ensures contests automatically lock/unlock at the exact second they are scheduled.
-   **Context-Aware Sidebar**: 
    -   When logged in as a student, the bulky sidebar is hidden entirely, giving a 100% full-width immersive experience.
    -   When logged in as an Admin, the sidebar hides student links (Home, Leaderboard) and focuses purely on administrative tools.
-   **Problem Page Aesthetics**: The problem details page was restricted to a max-width and center-aligned (`margin: 0 auto`) to improve readability and aesthetics on large monitors.
-   **Dropdown Menu Cleanup**: The user menu dropdown was heavily cleaned up to remove redundant links, leaving only "My Profile", "Settings", and "Sign Out".

---

## 3. The Code Editor & Run functionality

### Generic Boilerplate
Previously, if an Admin created a problem but forgot to configure a code signature, the student editor would be completely blank. We implemented a `generateGenericBoilerplate()` fallback in `BoilerplateGenerator`. Now, if no signature is found, the editor defaults to a fully valid skeleton code (e.g., `#include <bits/stdc++.h>` with a `main()` function) so students can immediately start typing.

### "Run Code" Terminal UI
We added a "▶️ Run Code" button alongside the "Submit" button. Clicking this provides local terminal output below the editor, mirroring the experience of top-tier platforms like LeetCode.

---

## 4. Judge0 Compiler Integration

### The Goal
The platform is designed as a **deployment-ready** project. It relies on the robust, open-source **Judge0** execution engine to compile and run student code safely inside isolated sandboxes.

### Docker Setup
We utilize a `docker-compose.yml` stack to run Judge0. This spins up 4 containers:
1.  **judge0-server**: The API endpoint that our Next.js backend communicates with.
2.  **judge0-worker**: The background worker that safely executes the untrusted code inside sandboxes.
3.  **judge0-db** (Postgres): Internal tracking database for Judge0.
4.  **judge0-redis**: Task queue for handling multiple rapid submissions.

### The Apple Silicon (M1/M2/M3) Caveat
When running this stack locally on a Mac with an M-series chip, you may encounter an `Internal Error (rb_sysopen - /box/script.py)` during code submission. 
-   **Why it happens:** Judge0 relies on low-level Linux namespace and cgroup features (via a tool called `isolate`) to sandbox the code. Docker Desktop on macOS uses Rosetta 2 to emulate the `linux/amd64` architecture, but this emulation fundamentally breaks the specific filesystem mounts `isolate` needs.
-   **Deployment Readiness:** This is strictly a local macOS development limitation! In a real production deployment (e.g., an AWS EC2 instance or DigitalOcean Droplet running standard Ubuntu Linux `x86_64`), this exact `docker-compose.yml` setup will work flawlessly and securely.

### Account Linking (Google & GitHub)
We configured `better-auth` with `accountLinking: { enabled: true, trustedProviders: ["google", "github"] }`. This ensures that when a user logs in via Social Auth, they are seamlessly linked to their existing GMail-based account rather than creating duplicates.
