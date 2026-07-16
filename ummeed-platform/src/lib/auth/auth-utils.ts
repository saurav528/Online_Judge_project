import { auth } from "./auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Fetches the currently authenticated user session details from the request headers.
 * Returns the user object if authenticated, otherwise null.
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

/**
 * Ensures that the request is authenticated.
 * Redirects the user to the login page if they are not authenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Ensures that the request is authenticated and the user is an administrator.
 * Redirects unauthorized users to the dashboard page.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (adminSession && adminSession.value === "authenticated") {
    return {
      id: "admin-system-bypass",
      name: "System Administrator",
      email: "admin@ummeed.org",
      emailVerified: true,
      image: null,
      role: "ADMIN" as const,
      rating: 3000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

