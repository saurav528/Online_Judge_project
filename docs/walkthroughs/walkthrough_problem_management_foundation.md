# Walkthrough: Problem Management Foundation

## 1. Major Goal

The major goal of this phase was to establish a **Problem Management Foundation** for the Ummeed Coding Platform.

Specifically, we needed to:
- Define database schemas to map searchable problem metadata (slugs, difficulties, limits, tags) and testcase execution orders in PostgreSQL.
- Construct a Git-backed filesystem layout to store rich content (statements, constraints, specs, and example inputs/outputs) in JSON and raw text files, keeping our database light and clean.
- Create an administrative dashboard supporting full CRUD actions (create, edit, delete, publish status) for problems.
- Implement a student-facing portal to search, filter (by tags and difficulty), paginate, and view published problem specifications.
- Build a realistic seed script that prepares 12 simple school-level coding challenges on both disk and database.

---

## 2. File-by-File Breakdown

### Database & Environment Setup
*   **[prisma/schema.prisma](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/prisma/schema.prisma)**:
    - Updated `Problem` to relate to `Tag` and `TestCase` models.
    - Introduced a separate `Tag` model supporting a clean many-to-many relation.
    - Added the `TestCase` model to PostgreSQL to manage order and sample/hidden status without storing raw input/output data in SQL.
*   **[prisma.config.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/prisma.config.ts)**: Configured to natively load `.env` variables via `process.loadEnvFile()`.
*   **[prisma/seed.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/prisma/seed.ts)**: Installs default student/admin logins and seeds 12 realistic school-level programming tasks. It writes testcase text files to the repository filesystem and maps metadata to PostgreSQL.

### Utilities and Validation
*   **[src/lib/problems-fs.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/problems-fs.ts)**: Filesystem layer containing helpers (`saveProblemContent`, `getProblemContent`, `deleteProblemContent`) that handle the atomic read/write of JSON metadata and test case inputs/outputs under the `/problems` folder.
*   **[src/lib/validation.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/validation.ts)**: Defines Zod validation schemas for problem creation forms (`ProblemFormSchema`) and student search queries (`ProblemSearchSchema`).

### Server Actions (CRUD logic)
*   **[src/app/actions/problems.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/actions/problems.ts)**: Implements server actions with built-in admin authentication validation (`requireAdmin()`):
    - `createProblemAction`: Performs atomic transactions. If writing JSON statement files fails, it rolls back database creations automatically.
    - `updateProblemAction`: Re-maps database tags and updates statement files on disk. Handles directory cleanup if the slug name changes.
    - `deleteProblemAction`: Cleans up directories on disk and triggers cascading delete actions in SQL.

### Admin Dashboard Pages
*   **[src/components/admin/problem-form.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/components/admin/problem-form.tsx)**: A client component providing dynamic inputs to edit example objects, test case order, and tags.
*   **[src/app/(admin)/admin/problems/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(admin)/admin/problems/page.tsx)**: Lists all database problems. Provides links to create/edit problems and delete triggers.
*   **[src/app/(admin)/admin/problems/new/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(admin)/admin/problems/new/page.tsx)**: Embeds the `<ProblemForm />` to handle problem creation.
*   **[src/app/(admin)/admin/problems/[id]/edit/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(admin)/admin/problems/%5Bid%5D/edit/page.tsx)**: Retrieves database metadata, hydates statements from the file system, and populates the edit form.

### Student Browsing Pages
*   **[src/app/(protected)/problems/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(protected)/problems/page.tsx)**: Standard React Server Component which queries Prisma and handles full search, paginating, and filters via query parameters.
*   **[src/app/(protected)/problems/[slug]/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(protected)/problems/%5Bslug%5D/page.tsx)**: Hydrates problem statements from disk and renders the title, difficulty, limits, and examples. It never exposes hidden test cases.

---

## 3. Critical Decisions & The Heart of the Implementation

### A. Atomic Syncing Between Filesystem & Database
A common challenge in Git-backed CMS engines is maintaining consistency: if the database write succeeds but writing file descriptors to disk fails, the system enters an inconsistent state.
- **The Heart**: Inside `createProblemAction`, we execute database writes first inside a `try/catch` wrapper. If the filesystem write `saveProblemContent` throws an error, the catch block intercepts it, executes an immediate `rollback` (deleting the database entry), and returns the error message to the client. This guarantees atomic consistency across files and databases.

### B. Lightweight Database Footprint (TestCase Referencing)
Storing large input/output datasets inside PostgreSQL can slow down query response speeds and increase database storage costs.
- **The Heart**: The `TestCase` database model only contains metadata (order, sample status, and path strings: `inputPath` / `outputPath`). The actual test case contents are stored directly as `.in` and `.out` files in the repository. When needed (e.g. for editing or future Judge0 compilation), our filesystem utility loads them on-the-fly, keeping PostgreSQL queries fast.

### C. Zero-JS Form Filters in Server Components
Using client-side state for search inputs increases bundle size and can lead to lag on initial load.
- **The Heart**: The student `/problems` list page is a pure Server Component. It wraps filters inside a standard `<form method="GET" action="/problems">` submission. Next.js processes query string modifications automatically on-server, resulting in extremely fast page rendering and a minimal client JavaScript footprint.
