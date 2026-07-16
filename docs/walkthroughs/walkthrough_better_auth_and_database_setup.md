# Walkthrough: Database Setup and Better Auth Integration

## 1. Major Goal

The major goal of this phase was to establish a secure, performant, and type-safe data and authentication foundation for the **Ummeed Coding Platform**. 

Specifically, we needed to:
- Configure a local PostgreSQL database container.
- Design a Prisma schema mapping user authentication, code execution metadata, and contest models.
- Fully integrate **Better Auth** with support for Email/Password and GitHub/Google OAuth providers.
- Protect application routes using Next.js Middleware and provide robust server-side authentication helper utilities.
- Ensure the setup is compatible with **Prisma 7**'s architectural guidelines and successfully compiles under Next.js.

---

## 2. File-by-File Breakdown

Here is what each file does to contribute to the major goal:

### Core Configuration & Database Environment
*   **[docker-compose.yml](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/docker-compose.yml)**: Defers the creation of local PostgreSQL and pgAdmin containers. By isolating the services in Docker, we ensure that every developer works against the exact same database engine version with zero local installation overhead.
*   **[.env.example](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/.env.example)**: Provides a configuration template containing placeholders for the database connection string, Better Auth encryption secret (`AUTH_SECRET`), and OAuth app keys for Google and GitHub.

### Prisma & ORM Configuration
*   **[prisma/schema.prisma](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/prisma/schema.prisma)**: The source-of-truth definition for our database models.
    - Defines enums (`Role`, `Difficulty`, `SubmissionStatus`, `Verdict`, `Language`, `ContestStatus`).
    - Maps the relationship models between users, submissions, contests, and problems.
    - Sets up explicit indexes (`@@index`) on foreign keys to optimize query lookup times.
*   **[prisma.config.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/prisma.config.ts)**: Replaces the deprecated method of storing connection URLs in `schema.prisma`. It acts as the configuration entrypoint for the Prisma CLI to identify schema paths and retrieve database urls.
*   **[src/lib/prisma.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/prisma.ts)**: Handles the runtime instantiation of `PrismaClient`. It uses a singleton pattern on `globalThis` to prevent connection leaks during development hot-reloads.

### Better Auth Configuration & API
*   **[src/lib/auth.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/auth.ts)**: Configures the Better Auth instance. It links the Prisma database adapter, declares credentials and OAuth providers, and registers the Next.js cookies sync plugin.
*   **[src/app/api/auth/\[...all\]/route.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/api/auth/%5B...all%5D/route.ts)**: A catch-all Next.js API Route Handler that maps incoming authentication requests (e.g. `/api/auth/sign-in`, `/api/auth/callback/github`) to the Better Auth backend logic.

### Routing Security & Helpers
*   **[src/lib/auth-utils.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/auth-utils.ts)**: Provides server-side helper utilities.
    - `getCurrentUser()`: Fetches the authenticated user profile using context headers.
    - `requireAuth()`: Safeguards Server Components and actions by redirecting unauthenticated users.
    - `requireAdmin()`: Restricts access to users containing the `ADMIN` role.
*   **[src/middleware.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/middleware.ts)**: Intercepts request routing. It checks for the existence of session cookies to perform redirects (e.g., redirecting logged-out users to `/login` when accessing `/dashboard`, and redirecting logged-in users away from the login page).

### UI Placeholders
*   **[src/app/login/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/login/page.tsx)** & **[src/app/signup/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/signup/page.tsx)**: Placeholder login and signup client forms to verify route loading and middleware redirection.

---

## 3. Critical Decisions & The Heart of the Implementation

Three critical architectural implementation decisions form the "heart" of this setup:

### A. The Prisma 7 Driver Adapter and Fallback Connection
Prisma 7 enforces the use of database driver adapters (like `pg` and `@prisma/adapter-pg`) over raw binaries for PostgreSQL clients.
- **The Issue**: Instantiating `new PrismaClient()` without an adapter throws a constructor validation error. However, during `next build`, Next.js compiles pages and routes without loading the local `.env` variables, leaving `DATABASE_URL` undefined and causing the build to crash.
- **The Heart**: Inside `src/lib/prisma.ts` and `prisma.config.ts`, we implemented a fallback URL schema check:
  ```typescript
  const connectionString = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock?schema=public";
  ```
  This ensures that Next.js compilation succeeds during the static analysis build phase, while resolving the driver adapter requirement natively at runtime when environment variables are populated.

### B. Securing Roles Against Self-Escalation
We needed custom attributes (`role` and `rating`) on the user table, which are not part of Better Auth's default schema.
- **The Heart**: We declared these fields inside the `user.additionalFields` configuration block in `src/lib/auth.ts` and disabled user input (`input: false`):
  ```typescript
  role: {
    type: "string",
    defaultValue: "STUDENT",
    input: false, // Prevents injection during signup
  }
  ```
  This ensures Better Auth's TypeScript typing engine exposes `session.user.role` correctly, while preventing malicious actors from registering as an `ADMIN` during signup.

### C. Lightweight Middleware Redirects
Next.js middleware runs on the Edge runtime before reaching page routers.
- **The Heart**: Instead of checking the database on every middleware execution (which is slow and would crash on Edge because Prisma requires TCP connections), we used an **optimistic cookie check** via `getSessionCookie(request)`. If the cookie is present, the request proceeds, and full verification is deferred to the Server Component or API handler. This yields maximum page loading performance.
