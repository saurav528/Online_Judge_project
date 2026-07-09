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
          color: isActive ? "#1a56db" : "#4b5563",
          background: isActive ? "#eff6ff" : "transparent",
          transition: "all 150ms ease",
          position: "relative",
        }}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "#f3f4f6";
            e.currentTarget.style.color = "#111827";
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#4b5563";
          }
        }}
      >
        <span style={{ fontSize: "1rem", width: "20px", textAlign: "center", flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {badge !== undefined && (
          <span style={{
            fontSize: "0.7rem", fontWeight: 700,
            background: isActive ? "#dbeafe" : "#e5e7eb",
            color: isActive ? "#1a56db" : "#6b7280",
            padding: "0.1rem 0.45rem", borderRadius: "999px",
          }}>
            {badge}
          </span>
        )}
        {isActive && (
          <div style={{
            position: "absolute", left: 0, top: "25%", height: "50%",
            width: "3px", background: "#1a56db", borderRadius: "0 3px 3px 0",
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
      borderRight: "1px solid #e5e7eb",
      backgroundColor: "#ffffff",
      padding: "1.25rem 0.85rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.75rem",
      boxSizing: "border-box",
      minHeight: "calc(100vh - 60px)",
    }}>
      {/* Main nav */}
      <div>
        <p style={{
          textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700,
          color: "#9ca3af", letterSpacing: "0.08em", margin: "0 0 0.5rem 0.85rem",
        }}>
          Main
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <SidebarLink href="/dashboard"    icon="🏠" label="Home" />
          <SidebarLink href="/problems"     icon="📋" label="Problems" />
          <SidebarLink href="/contests"     icon="🏆" label="Contest Hub" />
          <SidebarLink href="/submissions"  icon="📜" label="My Submissions" />
          <SidebarLink href="/leaderboard"  icon="🥇" label="Leaderboard" />
        </ul>
      </div>

      {/* Admin section */}
      {isAdmin && (
        <div>
          <p style={{
            textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700,
            color: "#f87171", letterSpacing: "0.08em", margin: "0 0 0.5rem 0.85rem",
          }}>
            Admin
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <SidebarLink href="/admin" icon="⚙️" label="Admin Panel" />
          </ul>
        </div>
      )}

      {/* Bottom section */}
      <div style={{ marginTop: "auto", padding: "0 0.5rem" }}>
        <div style={{
          fontSize: "0.75rem", color: "#9ca3af", textAlign: "center",
          paddingTop: "1rem", borderTop: "1px solid #f3f4f6",
        }}>
          Ummeed Platform<br />
          <span style={{ color: "#d1d5db" }}>by iCFDR</span>
        </div>
      </div>
    </aside>
  );
}
