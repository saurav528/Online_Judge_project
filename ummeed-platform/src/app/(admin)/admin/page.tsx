import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { prisma } from "@/config/db";

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  // Fetch dashboard stats from database
  const problemCount = await prisma.problem.count();
  const contestCount = await prisma.contest.count();
  const activeContestCount = await prisma.contest.count({
    where: {
      startTime: { lte: new Date() },
      endTime: { gte: new Date() },
      published: true,
    },
  });

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Welcome Header */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#111827", fontSize: "1.75rem", fontWeight: 800 }}>
          Admin Overview Dashboard
        </h2>
        <p style={{ color: "#4b5563", fontSize: "0.95rem", margin: "0 0 1rem 0" }}>
          Welcome back, <strong>{user?.name || "System Admin"}</strong>. Here is the current system status and quick access to management tools.
        </p>
        <span
          style={{
            fontSize: "0.85rem",
            color: "#166534",
            backgroundColor: "#f0fdf4",
            padding: "0.4rem 0.8rem",
            borderRadius: "0.375rem",
            border: "1px solid #bbf7d0",
            fontWeight: 600,
            display: "inline-block",
          }}
        >
          ✓ Authorized Session: SYSTEM ADMINISTRATOR
        </span>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {/* Metric 1 */}
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #2563eb" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Total Problems
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0.5rem 0" }}>
            {problemCount}
          </div>
          <Link href="/admin/problems" style={{ fontSize: "0.875rem", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
            Manage Problems →
          </Link>
        </div>

        {/* Metric 2 */}
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Total Contests
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0.5rem 0" }}>
            {contestCount}
          </div>
          <Link href="/admin/contests" style={{ fontSize: "0.875rem", color: "#10b981", textDecoration: "none", fontWeight: 600 }}>
            Manage Contests →
          </Link>
        </div>

        {/* Metric 3 */}
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Active Contests
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0.5rem 0" }}>
            {activeContestCount}
          </div>
          <span style={{ fontSize: "0.875rem", color: "#f59e0b", fontWeight: 600 }}>
            Running Right Now
          </span>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "1.25rem" }}>Quick Administrative Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/admin/problems/new"
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "0.375rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "background-color 0.2s",
            }}
          >
            + Create New Problem
          </Link>
          <Link
            href="/admin/contests/new"
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "0.375rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "background-color 0.2s",
            }}
          >
            + Create New Contest
          </Link>
        </div>
      </div>
    </div>
  );
}

