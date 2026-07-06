import React from "react";
import { UserMenu } from "./user-menu";
import Link from "next/link";

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: isAdmin ? "#fff5f5" : "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link
          href="/dashboard"
          style={{ textDecoration: "none", color: "#111827", fontWeight: "bold", fontSize: "1.2rem" }}
        >
          Ummeed Platform {isAdmin && <span style={{ color: "#dc2626", fontSize: "0.9rem" }}>(Admin Control)</span>}
        </Link>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", color: "#4b5563" }}>
            Dashboard
          </Link>
          {isAdmin && (
            <Link href="/admin" style={{ textDecoration: "none", color: "#dc2626", fontWeight: "600" }}>
              Admin Panel
            </Link>
          )}
        </nav>
      </div>
      <UserMenu />
    </header>
  );
}
