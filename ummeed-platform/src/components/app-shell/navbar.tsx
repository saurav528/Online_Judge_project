"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "./user-menu";

const NAV_LINKS = [
  { href: "/dashboard",   label: "Home",        icon: "🏠" },
  { href: "/problems",    label: "Problems",     icon: "📋" },
  { href: "/contests",    label: "Contests",     icon: "🏆" },
  { href: "/submissions", label: "Submissions",  icon: "📜" },
  { href: "/duels",        label: "1v1 Duels",    icon: "⚔️" },
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
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      {/* Left: Logo */}
      <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Image src="/umeed-logo.png" alt="Umeed" width={90} height={30} style={{ objectFit: "contain", display: "block" }} />
        {isAdmin && (
          <span style={{
            fontSize: "0.7rem", fontWeight: 700,
            background: "#fee2e2", color: "#dc2626", padding: "0.1rem 0.4rem",
            borderRadius: "4px",
          }}>
            ADMIN
          </span>
        )}
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
        color: adminStyle ? "#dc2626" : "#4b5563",
        textDecoration: "none",
        borderBottom: "2px solid transparent",
        transition: "color 150ms ease, border-color 150ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = adminStyle ? "#991b1b" : "#1a56db";
        e.currentTarget.style.borderBottomColor = adminStyle ? "#991b1b" : "#1a56db";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = adminStyle ? "#dc2626" : "#4b5563";
        e.currentTarget.style.borderBottomColor = "transparent";
      }}
    >
      {label}
    </Link>
  );
}
