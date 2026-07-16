# Walkthrough: Role-Based Authorization and Layout Foundation

## 1. Major Goal

The major goal of this phase was to establish the **application layout shell and role-based authorization rules** for the Ummeed Coding Platform.

Specifically, we needed to:
- Restructure the application using App Router route groups (`(protected)` and `(admin)`) to isolate authenticated and administrative routes.
- Enforce authentication and authorization checks at the layout level so pages don't require duplicate authorization checks.
- Establish the application shell (Navbar, Sidebar, User Menu) with dynamic context sharing using React Context.
- Implement client-side session sign-out actions and build page placeholders to verify the flow.

---

## 2. File-by-File Breakdown

### Shared Auth client & User Context
*   **[src/lib/auth-client.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/auth-client.ts)**: Configures and exports the Better Auth client helper `authClient` to let Client Components trigger browser authentication actions (like logging out).
*   **[src/components/providers/user-provider.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/components/providers/user-provider.tsx)**: Declares a React Context Provider `UserProvider` containing the session user metadata. Exposes a `useUser()` hook to let client components access user state cleanly without prop drilling.

### App Shell UI Elements
*   **[src/components/app-shell/user-menu.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/components/app-shell/user-menu.tsx)**: A Client Component displaying user details (email, role, rating) and a functional logout button calling `authClient.signOut()`.
*   **[src/components/app-shell/navbar.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/components/app-shell/navbar.tsx)**: Renders the site branding header, navigation links, and embeds the client user menu. Changes color dynamically when loaded in admin pages to clearly indicate admin state.
*   **[src/components/app-shell/sidebar.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/components/app-shell/sidebar.tsx)**: Displays secondary route links (Problems, Submissions, Contests). Conditionally renders the "Admin Actions" menu section ONLY if the logged-in user is an `ADMIN`.

### Route Group Layouts & Protection
*   **[src/app/(protected)/layout.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(protected)/layout.tsx)**: Catches all routes under `/dashboard`, `/problems`, `/submissions`, etc.
    - Resolves authorization via `requireAuth()` server-side.
    - Wraps components in the `UserProvider` and applies the common layout framework (Navbar/Sidebar).
*   **[src/app/(protected)/dashboard/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(protected)/dashboard/page.tsx)**: The authenticated landing page. It verifies user profiles from `getCurrentUser()` and lists their rating and database roles.
*   **[src/app/(admin)/layout.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(admin)/layout.tsx)**: Restricts child routes (like `/admin/*`) using `requireAdmin()`. Applies an admin ribbon indicator and enforces that students cannot access it.
*   **[src/app/(admin)/admin/page.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/app/(admin)/admin/page.tsx)**: Admin Dashboard placeholder page.

---

## 3. Critical Decisions & The Heart of the Implementation

The "heart" of this implementation features two critical design architectures:

### A. Layout-Level Guard Verification
Rather than calling authorization checks (`requireAuth()` or `requireAdmin()`) inside individual pages (which is error-prone and leads to code duplication), we centralized checks at the Next.js **Layout** level.
- **Why it matters**: Since Next.js Layouts wrap all child routes, placing `await requireAuth()` or `await requireAdmin()` inside `ProtectedLayout` and `AdminLayout` automatically protects any page placed under their respective folders. If a developer creates `/admin/problems`, it is secure by default without adding a single line of auth checks to the page.

### B. Client context hydration from Server Components
Next.js App Router relies heavily on Server Components, but user metadata (like names and roles) is often needed inside interactive client components (like headers or settings pages).
- **Why it matters**: We resolved session details server-side inside `ProtectedLayout` and passed them down to the client via `UserProvider`. This hydrates our client context instantly on load, preventing flickering UIs (no "loading session..." placeholders on page load) and improving initial page response speeds.
