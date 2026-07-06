import React from "react";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#111827" }}>Admin Portal (Placeholder)</h2>
      <p style={{ color: "#4b5563" }}>
        Welcome to the administrator panel, <strong>{user?.name}</strong>. This section is strictly restricted to
        users with the <code>ADMIN</code> role.
      </p>

      <div style={{ marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
        <h3 style={{ marginTop: 0, color: "#374151" }}>Administrative Status</h3>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#166534",
            backgroundColor: "#f0fdf4",
            padding: "0.75rem",
            borderRadius: "0.25rem",
            border: "1px solid #bbf7d0",
            display: "inline-block",
            margin: 0,
          }}
        >
          ✓ Authorization Verified: You are logged in with role <strong>{user?.role}</strong>.
        </p>
      </div>
    </div>
  );
}
