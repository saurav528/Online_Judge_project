import React from "react";
import { requireAdmin } from "@/lib/auth/auth-utils";
import { UserProvider, AuthUser } from "@/components/providers/user-provider";
import { Navbar } from "@/components/app-shell/navbar";
import { Sidebar } from "@/components/app-shell/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  // Cast type to AuthUser interface for context safety
  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role || "ADMIN",
    rating: user.rating ?? 1200,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return (
    <UserProvider user={authUser}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "sans-serif" }}>
        <Navbar isAdmin={true} />
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar isAdmin={true} />
          <main style={{ flex: 1, padding: "2rem", backgroundColor: "#fff5f5" }}>
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
                border: "1px solid #fca5a5",
              }}
            >
              ⚠️ Administrative Control Area — Restricted Access
            </div>
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
