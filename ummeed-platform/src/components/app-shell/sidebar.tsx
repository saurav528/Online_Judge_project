"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  icon: string;
  label: string;
  badge?: string | number;
}

function SidebarLink({ href, icon, label, badge }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <li>
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          padding: "0.55rem 0.85rem",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "0.9rem",
          fontWeight: isActive ? 600 : 400,
          color: isActive ? "var(--brand-primary)" : "var(--gray-500)",
          background: isActive ? "var(--gray-100)" : "transparent",
          transition: "all 150ms ease",
          position: "relative",
        }}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "var(--gray-100)";
            e.currentTarget.style.color = "var(--gray-900)";
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--gray-500)";
          }
        }}
      >
        {icon && <span style={{ fontSize: "1rem", width: "20px", textAlign: "center", flexShrink: 0 }}>{icon}</span>}
        <span style={{ flex: 1 }}>{label}</span>
        {badge !== undefined && (
          <span style={{
            fontSize: "0.7rem", fontWeight: 700,
            background: isActive ? "var(--gray-200)" : "var(--gray-100)",
            color: isActive ? "var(--brand-primary)" : "var(--gray-500)",
            padding: "0.1rem 0.45rem", borderRadius: "999px",
          }}>
            {badge}
          </span>
        )}
        {isActive && (
          <div style={{
            position: "absolute", left: 0, top: "25%", height: "50%",
            width: "3px", background: "var(--brand-primary)", borderRadius: "0 3px 3px 0",
          }} />
        )}
      </Link>
    </li>
  );
}

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <aside style={{
      width: "220px",
      flexShrink: 0,
      borderRight: "1px solid var(--gray-200)",
      backgroundColor: "var(--surface-card)",
      padding: "1.25rem 0.85rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.75rem",
      boxSizing: "border-box",
      minHeight: "calc(100vh - 60px)",
    }}>
      {/* Main nav */}
      {!isAdmin && (
        <div>
          <p style={{
            textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700,
            color: "var(--gray-400)", letterSpacing: "0.08em", margin: "0 0 0.5rem 0.85rem",
          }}>
            Main
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <SidebarLink href="/dashboard"    icon="" label="Home" />
            <SidebarLink href="/problems"     icon="" label="Problems" />
            <SidebarLink href="/contests"     icon="" label="Contest Hub" />
            <SidebarLink href="/submissions"  icon="" label="My Submissions" />
            <SidebarLink href="/leaderboard"  icon="" label="Leaderboard" />
            <SidebarLink href="/duels"        icon="" label="1v1 Duels" />
          </ul>
        </div>
      )}

      {/* Admin section */}
      {isAdmin && (
        <div>
          <p style={{
            textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700,
            color: "var(--brand-red)", letterSpacing: "0.08em", margin: "0 0 0.5rem 0.85rem",
          }}>
            Admin
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <SidebarLink href="/admin" icon="" label="Overview" />
            <SidebarLink href="/admin/problems" icon="" label="Manage Problems" />
            <SidebarLink href="/admin/contests" icon="" label="Manage Contests" />
          </ul>
        </div>
      )}

      {/* Bottom section */}
      <div style={{ marginTop: "auto", padding: "0 0.5rem" }}>
        <div style={{
          fontSize: "0.75rem", color: "var(--gray-400)", textAlign: "center",
          paddingTop: "1rem", borderTop: "1px solid var(--gray-200)",
        }}>
          Ummeed Platform<br />
          <span style={{ color: "var(--gray-500)" }}>by iCFDR</span>
        </div>
      </div>
    </aside>
  );
}
