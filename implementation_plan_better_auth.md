# Implementation Plan - Better Auth Integration

This plan covers the installation, configuration, and integration of Better Auth for the Ummeed Coding Platform.

---

## User Review Required

> [!IMPORTANT]
> We will install the required NPM packages using `pnpm` (which aligns with the `pnpm-lock.yaml` file in the project). 
> 
> The packages to be installed are:
> - `better-auth` (core authentication library)
> - `@prisma/client` (database client)
> - `prisma` (as a development dependency)

---

## Proposed Changes

### Packages & Dependencies
We will run the following installation commands:
```bash
pnpm add better-auth @prisma/client
pnpm add -D prisma
```

---

### Library Files

#### [NEW] [prisma.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/prisma.ts)
Defines a singleton `PrismaClient` instance to prevent active connection exhaustion during Next.js hot-reloads.

#### [NEW] [auth.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/auth.ts)
Better Auth configuration using the Prisma adapter. Includes Email/Password, GitHub, and Google OAuth configurations.

#### [NEW] [auth-utils.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/auth-utils.ts)
Helper functions to fetch session context and enforce permissions on Server Components / API handlers:
- `getCurrentUser()`: Fetches the active user object or returns `null`.
- `requireAuth()`: Enforces authentication, redirecting to `/login` if no session is active.
- `requireAdmin()`: Enforces that the authenticated user possesses the `ADMIN` role.

---

### Route Handling & Middleware

#### [NEW] [route.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/api/auth/%5B...all%5D/route.ts)
A catch-all API Route Handler (`/api/auth/[...all]`) using `toNextJsHandler` to route all auth requests (e.g. login, signup, social redirects) to Better Auth.

#### [NEW] [middleware.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/middleware.ts)
A lightweight Next.js middleware using edge-compatible session cookie validation:
- Redirects unauthenticated requests trying to access `/dashboard`, `/submissions`, or `/admin` to `/login`.
- Redirects authenticated requests trying to access `/login` or `/signup` to `/dashboard`.

---

### UI Placeholders

#### [NEW] [page.tsx (login)](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/login/page.tsx)
Simple un-styled HTML form for login.

#### [NEW] [page.tsx (signup)](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/signup/page.tsx)
Simple un-styled HTML form for signup.

---

### Environment Variables

#### [MODIFY] [.env.example](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/.env.example)
Appends the following variables with placeholders:
- `AUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## Verification Plan

### Automated Verification
- We will execute `pnpm run build` inside `ummeed-platform` to verify that all imports, types, enums, and components compile successfully.
