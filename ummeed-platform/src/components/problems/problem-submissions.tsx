import React from "react";
import Link from "next/link";
import { prisma } from "@/config/db";

interface ProblemSubmissionsProps {
  problemId: string;
  userId: string;
}

const VERDICT_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  ACCEPTED:           { bg: "#dcfce7", color: "#16a34a", icon: "✓" },
  WRONG_ANSWER:       { bg: "#fee2e2", color: "#dc2626", icon: "✗" },
  TIME_LIMIT_EXCEEDED:{ bg: "#fef3c7", color: "#d97706", icon: "⏱" },
  TLE:                { bg: "#fef3c7", color: "#d97706", icon: "⏱" },
  RUNTIME_ERROR:      { bg: "#fce7f3", color: "#db2777", icon: "💥" },
  COMPILATION_ERROR:  { bg: "#ede9fe", color: "#7c3aed", icon: "⚙" },
  PENDING:            { bg: "#f3f4f6", color: "#6b7280", icon: "…" },
};

function timeSince(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export async function ProblemSubmissions({ problemId, userId }: ProblemSubmissionsProps) {
  const submissions = await prisma.submission.findMany({
    where: { problemId, userId },
    orderBy: { submittedAt: "desc" },
    take: 10,
  });

  if (submissions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
        <p style={{ fontSize: "0.9rem" }}>No submissions yet for this problem.</p>
      </div>
    );
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
            <th style={{ padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Verdict</th>
            <th style={{ padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Language</th>
            <th style={{ padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Time</th>
            <th style={{ padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Memory</th>
            <th style={{ padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>When</th>
            <th style={{ padding: "0.6rem 0.75rem", textAlign: "right" }}></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => {
            const vs = VERDICT_STYLE[sub.verdict] || VERDICT_STYLE.PENDING;
            return (
              <tr key={sub.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "0.25rem",
                    padding: "0.2rem 0.65rem", borderRadius: "999px",
                    fontSize: "0.78rem", fontWeight: 700,
                    background: vs.bg, color: vs.color,
                  }}>
                    {vs.icon} {sub.verdict.replace(/_/g, " ")}
                  </span>
                </td>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>
                  {sub.language}
                </td>
                <td style={{ padding: "0.75rem", color: "#374151", fontSize: "0.85rem" }}>
                  {sub.executionTime != null ? `${sub.executionTime} ms` : "—"}
                </td>
                <td style={{ padding: "0.75rem", color: "#374151", fontSize: "0.85rem" }}>
                  {sub.memoryUsed != null ? `${(sub.memoryUsed / 1024).toFixed(1)} MB` : "—"}
                </td>
                <td style={{ padding: "0.75rem", color: "#9ca3af", fontSize: "0.82rem" }}>
                  {timeSince(sub.submittedAt)}
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <Link
                    href={`/submissions/${sub.id}`}
                    style={{
                      fontSize: "0.78rem", color: "#1a56db", fontWeight: 600,
                      textDecoration: "none", padding: "0.2rem 0.65rem",
                      border: "1px solid #dbeafe", borderRadius: "6px",
                      background: "#eff6ff",
                    }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
