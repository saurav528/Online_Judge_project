import React from "react";
import Link from "next/link";

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <aside
      style={{
        width: "240px",
        borderRight: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        boxSizing: "border-box",
        minHeight: "calc(100vh - 65px)",
      }}
    >
      <div>
        <h4
          style={{
            textTransform: "uppercase",
            fontSize: "0.75rem",
            color: "#9ca3af",
            letterSpacing: "0.05em",
            margin: "0 0 0.75rem 0",
          }}
        >
          Student Dashboard
        </h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li>
            <Link href="/dashboard" style={{ textDecoration: "none", color: "#374151", fontSize: "0.95rem" }}>
              Dashboard Home
            </Link>
          </li>
          <li>
            <Link href="/problems" style={{ textDecoration: "none", color: "#374151", fontSize: "0.95rem" }}>
              Problems list
            </Link>
          </li>
          <li>
            <Link href="/submissions" style={{ textDecoration: "none", color: "#374151", fontSize: "0.95rem" }}>
              My Submissions
            </Link>
          </li>
          <li>
            <Link href="/contests" style={{ textDecoration: "none", color: "#374151", fontSize: "0.95rem" }}>
              Contest Hub
            </Link>
          </li>
        </ul>
      </div>

      {isAdmin && (
        <div>
          <h4
            style={{
              textTransform: "uppercase",
              fontSize: "0.75rem",
              color: "#f87171",
              letterSpacing: "0.05em",
              margin: "0 0 0.75rem 0",
            }}
          >
            Admin Panel
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>
              <Link href="/admin" style={{ textDecoration: "none", color: "#b91c1c", fontSize: "0.95rem", fontWeight: "bold" }}>
                Admin Portal Home
              </Link>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}
