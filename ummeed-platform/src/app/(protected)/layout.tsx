import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import { UserProvider, AuthUser } from "@/components/providers/user-provider";
import { Navbar } from "@/components/app-shell/navbar";
import { Sidebar } from "@/components/app-shell/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  // Cast type to AuthUser interface for context safety
  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role || "STUDENT",
    rating: user.rating ?? 1200,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return (
    <UserProvider user={authUser}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar isAdmin={authUser.role === "ADMIN"} />
        <div style={{ display: "flex", flex: 1 }}>
          {authUser.role === "ADMIN" && <Sidebar isAdmin={true} />}
          <main style={{ flex: 1, padding: "2rem", backgroundColor: "var(--surface-bg, #f0f2f5)", minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
