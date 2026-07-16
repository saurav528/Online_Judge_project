# Architecture Redesign Walkthrough

I have refactored the codebase to follow Clean Architecture principles, decoupling presentation controllers (Server Actions) from business logic transaction services, and resolved code duplication inside editor panels.

## 🛠️ Changes Executed

### 1. Separation of Configuration (Config Layer)
- Moved `/src/lib/prisma.ts` to `/src/config/db.ts` to establish database connection pooling isolation.
- Refactored 37 import references to point to the new configuration client.

### 2. Grouped Security Modules (Auth)
- Created the `/src/lib/auth/` directory.
- Moved `auth.ts`, `auth-client.ts`, and `auth-utils.ts` into `/src/lib/auth/` to bundle security configuration in a cohesive directory.

### 3. Decoupled Validation Schemas
- Created `/src/lib/validation/` to split the giant schema model file `src/lib/validation.ts` into isolated modules:
  - `shared.ts`: Common schemas (e.g. Difficulty, Language).
  - `problem.ts`: Schemas related to problem form metadata.
  - `contest.ts`: Schemas for contest configurations.
  - `submission.ts`: Code submission validation schemas.

### 4. Service Layer Transactions Extraction
- Created `/src/lib/services/problem.ts` (`ProblemService`) to encapsulate problem CRUD operations and database updates.
- Refactored `ContestService` (`/src/lib/services/contest.ts`) to manage contest creation/updates in transactions.
- Stripped database execution logic out of Server Actions (`actions/problems.ts` & `actions/contests.ts`) and updated actions to serve as pure controllers calling services.

### 5. Consolidated Presentation Code (DRY Editor Workspace)
- Abstracted code workspace logic (autosaving, gutters, rendering outputs, compare logs) into a single reusable component: `/src/components/problems/code-workspace.tsx`.
- Refactored `submission-form.tsx` and `contest-submission-form.tsx` into thin wrappers passing handlers as prop callbacks to `<CodeWorkspace />`.
- Fixed the ESLint warnings (missing hook dependencies).

### 6. Fixed Measurement Metrics Bug
- Corrected the database logging of `executionTime` and `memoryUsed` inside `executor.ts` (lines 237-238) by parsing destructured response data.

---

## 🏛️ Documentation
A complete architecture design walkthrough, request flow, and interview Q&A guide has been created:
- **Architecture & Interview Guide**: [architecture.md](file:///Users/anshrajdhakad/Scripts/01_Projects/coding_platform/Online_Judge_project/docs/architecture.md)
