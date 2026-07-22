"use client";

import React, { useState } from "react";
import { useUser } from "../providers/user-provider";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutAdminAction } from "@/app/actions/admin-auth";

export function UserMenu() {
  const user = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {},
      },
    });
    await logoutAdminAction();
    router.push("/login");
    router.refresh();
  };


  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.35rem 0.5rem",
          border: "1.5px solid var(--gray-200)",
          borderRadius: "10px",
          background: open ? "var(--gray-100)" : "var(--surface-card)",
          cursor: "pointer",
          transition: "all 150ms ease",
          fontFamily: "var(--font-sans)",
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "var(--gray-100)"; }}
        onMouseOut={(e) => { if (!open) e.currentTarget.style.background = "var(--surface-card)"; }}
      >
        {/* Avatar circle */}
        <div style={{
          width: "32px", height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: "0.78rem",
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ textAlign: "left", maxWidth: "130px" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--gray-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>Rating: {user.rating}</div>
        </div>
        <span style={{ color: "var(--gray-400)", fontSize: "0.7rem" }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 100,
            minWidth: "220px",
            background: "var(--surface-card)",
            border: "1px solid var(--gray-200)",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            overflow: "hidden",
            animation: "fadeIn 150ms ease",
          }}>
            {/* User info */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--gray-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: "0.9rem" }}>{user.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--gray-400)", marginTop: "0.1rem" }}>{user.email}</div>
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "var(--gray-200)", color: "var(--brand-primary)", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                  {user.role}
                </span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "var(--gray-200)", color: "var(--gray-700)", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                  Elo: {user.rating}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "0.4rem" }}>
              {[
                { href: "/dashboard", label: "My Profile" },
                { href: "#",          label: "Settings" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.55rem 0.85rem", borderRadius: "8px",
                    textDecoration: "none", color: "var(--gray-700)", fontSize: "0.88rem",
                    transition: "background 150ms ease",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "var(--gray-100)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: "0.4rem", borderTop: "1px solid var(--gray-200)" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  width: "100%", padding: "0.55rem 0.85rem",
                  borderRadius: "8px", border: "none", cursor: "pointer",
                  background: "transparent", color: "var(--brand-red)", fontSize: "0.88rem",
                  fontFamily: "var(--font-sans)", fontWeight: 500,
                  transition: "background 150ms ease",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "var(--verdict-wa-bg)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
