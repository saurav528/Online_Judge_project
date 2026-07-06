# Walkthrough: Submission Infrastructure Foundation

## 1. Major Goal

The major goal of this phase was to establish the **Submission Infrastructure Foundation** for the Ummeed Coding Platform.

Specifically, we needed to:
- Expand the database schema with detailed diagnostics logs (compile, runtime, error outputs) and standard competitive programming verdicts.
- Build a decoupled execution layer (`SubmissionExecutor` interface) that runs in the background. V1 simulates background testing via a `PlaceholderExecutor`, allowing us to plug in a real Judge0 worker queue in V2 without rewriting any pages, forms, or actions.
- Implement an interactive code submission panel on the student problem detail pages.
- Create secure submission history and detailed diagnostic views, guaranteeing that students can only view their own code while admins can audit all submissions.

---

## 2. File-by-File Breakdown

### Database Schema Updates
*   **[prisma/schema.prisma](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/prisma/schema.prisma)**:
    - Updated `SubmissionStatus` and `Verdict` enums with correct competitive programming statuses.
    - Added `compileOutput`, `runtimeOutput`, and `errorOutput` columns to store compiler diagnostics.

### Services Layer (Business Logic)
*   **[src/lib/services/executor.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/services/executor.ts)**: Declares the execution interface and a background `PlaceholderExecutor` subclass which simulates queue and runtime delays before updating state metrics.
*   **[src/lib/services/submission.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/services/submission.ts)**: Configures submission records, triggers the executor, and handles paginated retrieval checks.

### Server Actions & Validation
*   **[src/lib/validation.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/validation.ts)**: Declares `SubmissionCreateSchema` ensuring code conforms to size limits.
*   **[src/app/actions/submissions.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/actions/submissions.ts)**: Validates session state and invokes the Submission Service.

### User Interface Pages
*   **[src/components/problems/submission-form.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/components/problems/submission-form.tsx)**: The dropdown selector and textarea form.
*   **[src/app/(protected)/problems/[slug]/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(protected)/problems/%5Bslug%5D/page.tsx)**: restyled into a split-pane layout to support code submission on the right.
*   **[src/app/(protected)/submissions/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(protected)/submissions/page.tsx)**: Displays paginated submission history. Applies authorization rules to restrict students.
*   **[src/app/(protected)/submissions/[id]/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(protected)/submissions/%5Bid%5D/page.tsx)**: Renders code and logs. Inserts a `<meta http-equiv="refresh" />` polling tag for real-time visual updates.

---

## 3. Critical Decisions & The Heart of the Implementation

### A. Non-Blocking Execution Architecture
When a student submits code, calling an execution queue synchronously would lock up the HTTP request, leading to browser timeouts and a laggy experience.
- **The Heart**: Our `PlaceholderExecutor` uses a fire-and-forget background microtask. `createSubmission()` saves the database entry, invokes `executor.execute()` which runs in its own non-blocking promise thread, and immediately returns the submission ID to the client. The client redirects to the details page instantly while execution compiles in the background.

### B. Pure HTML Auto-Polling (Zero-JS)
Usually, real-time status updates require complex socket configurations or client-side JavaScript polling intervals.
- **The Heart**: We implemented a pure, lightweight HTML polling approach. On the `/submissions/[id]` Server Component page, if the submission status is incomplete (`PENDING`, `QUEUED`, or `RUNNING`), we conditionally inject `<meta http-equiv="refresh" content="2" />` into the HTML head. The browser automatically refetches the server page every 2 seconds. The moment status updates to `COMPLETED`, the tag disappears and polling halts with zero JS overhead.

### C. Decoupled Executor Contract Interface
We defined a strict `SubmissionExecutor` interface. 
- **The Heart**: This abstraction guarantees that our API routes and pages depend only on the `.execute()` signature. In the next milestone, when we replace the mock executor with BullMQ + Judge0, we only need to edit `executor.ts` to forward the submission ID to a Redis queue. No pages, forms, or actions will need to change.
