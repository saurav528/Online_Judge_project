import React from "react";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function DashboardPage() {
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
      <h2 style={{ marginTop: 0, color: "#111827" }}>Dashboard Home</h2>
      <p style={{ color: "#4b5563" }}>
        Welcome back to the Ummeed Coding Platform! This dashboard verifies that your session has been
        successfully resolved on the server.
      </p>

      <div style={{ marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
        <h3 style={{ marginTop: 0, color: "#374151" }}>User Session Metadata</h3>
        <table style={{ width: "100%", maxWidth: "500px", borderCollapse: "collapse", color: "#374151" }}>
          <tbody>
            <tr>
              <td style={{ padding: "0.5rem 0", fontWeight: "bold", width: "150px" }}>User ID:</td>
              <td style={{ padding: "0.5rem 0", fontFamily: "monospace", fontSize: "0.9rem" }}>{user?.id}</td>
            </tr>
            <tr>
              <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Name:</td>
              <td style={{ padding: "0.5rem 0" }}>{user?.name}</td>
            </tr>
            <tr>
              <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Email:</td>
              <td style={{ padding: "0.5rem 0" }}>{user?.email}</td>
            </tr>
            <tr>
              <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Platform Role:</td>
              <td style={{ padding: "0.5rem 0" }}>
                <span
                  style={{
                    backgroundColor: user?.role === "ADMIN" ? "#fef2f2" : "#f0fdf4",
                    color: user?.role === "ADMIN" ? "#991b1b" : "#166534",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  {user?.role}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Elo Rating:</td>
              <td style={{ padding: "0.5rem 0" }}>{user?.rating}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
