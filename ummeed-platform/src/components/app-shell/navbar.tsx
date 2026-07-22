"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "./user-menu";

const NAV_LINKS = [
  { href: "/dashboard",   label: "Home" },
  { href: "/problems",    label: "Problems" },
  { href: "/contests",    label: "Contests" },
  { href: "/submissions", label: "Submissions" },
  { href: "/duels",        label: "1v1 Duels" },
];

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      height: "60px",
      backgroundColor: "var(--surface-card)",
      borderBottom: "1px solid var(--gray-200)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
    }}>
      {/* Left: Logo */}
      <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          background: "var(--surface-card)",
          borderRadius: "8px",
          padding: "3px",
          border: "1px solid var(--gray-200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Image src="/umeed-logo.jpg" alt="Umeed" width={36} height={28} style={{ objectFit: "contain" }} />
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--brand-primary)", letterSpacing: "-0.01em" }}>
            Ummeed
          </span>
          {isAdmin && (
            <span style={{
              marginLeft: "0.5rem", fontSize: "0.7rem", fontWeight: 700,
              background: "var(--verdict-wa-bg)", color: "var(--brand-red)", padding: "0.1rem 0.4rem",
              borderRadius: "4px",
            }}>
              ADMIN
            </span>
          )}
        </div>
      </Link>

      {/* Center: Navigation Links */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        height: "60px",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)"
      }}>
        {NAV_LINKS.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} />
        ))}
        {isAdmin && (
          <NavLink href="/admin" label="Admin Panel" adminStyle />
        )}
      </nav>

      {/* Right: User menu */}
      <UserMenu />
    </header>
  );
}

function NavLink({ href, label, adminStyle }: { href: string; label: string; adminStyle?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        padding: "0 0.9rem",
        fontSize: "0.88rem",
        fontWeight: 500,
        color: adminStyle ? "var(--brand-red)" : "var(--gray-500)",
        textDecoration: "none",
        borderBottom: "2px solid transparent",
        transition: "color 150ms ease, border-color 150ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = adminStyle ? "var(--brand-red)" : "var(--brand-primary)";
        e.currentTarget.style.borderBottomColor = adminStyle ? "var(--brand-red)" : "var(--brand-primary)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = adminStyle ? "var(--brand-red)" : "var(--gray-500)";
        e.currentTarget.style.borderBottomColor = "transparent";
      }}
    >
      {label}
    </Link>
  );
}
