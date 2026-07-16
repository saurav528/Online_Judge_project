import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContestService } from "@/lib/services/contest";
import { requireAuth } from "@/lib/auth/auth-utils";
import { ContestCountdown, RegisterButton } from "./contest-client";

const SEQUENCE_LABELS = ["A", "B", "C", "D", "E", "F"];

function formatDate(date: Date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDuration(start: Date, end: Date) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const DIFF_COLORS: Record<string, { bg: string; color: string }> = {
  EASY:   { bg: "#dcfce7", color: "#166534" },
  MEDIUM: { bg: "#fef9c3", color: "#854d0e" },
  HARD:   { bg: "#fee2e2", color: "#991b1b" },
};

export default async function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contest, user] = await Promise.all([
    ContestService.getContest(id),
    requireAuth(),
  ]);

  if (!contest) notFound();

  const isRegistered = await ContestService.isRegistered(id, user.id);
  const isRunning = contest.status === "RUNNING";
  const isUpcoming = contest.status === "UPCOMING";
  const isEnded = contest.status === "ENDED";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.25rem", fontSize: "0.85rem", color: "#6b7280" }}>
        <Link href="/contests" style={{ color: "#2563eb", textDecoration: "none" }}>
          ← Contest Hub
        </Link>
      </div>

      {/* Contest Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#111827", fontSize: "1.6rem" }}>{contest.title}</h2>
          <p style={{ margin: "0.4rem 0 0", color: "#4b5563", fontSize: "0.95rem" }}>
            {contest.description}
          </p>
        </div>

        {/* Live countdown or status badge */}
        {isRunning && (
          <div
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.6rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: 600, marginBottom: "0.2rem" }}>
              TIME REMAINING
            </div>
            <ContestCountdown endTime={contest.endTime.toISOString()} />
          </div>
        )}
        {isUpcoming && (
          <div
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "0.6rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 600, marginBottom: "0.2rem" }}>
              STARTS AT
            </div>
            <span style={{ fontWeight: 700, color: "#1d4ed8" }}>{formatDate(contest.startTime)}</span>
          </div>
        )}
        {isEnded && (
          <span
            style={{
              padding: "0.4rem 1rem",
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            Contest Ended
          </span>
        )}
      </div>

      {/* Meta strip */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          padding: "0.85rem 1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          fontSize: "0.85rem",
          color: "#374151",
          flexWrap: "wrap",
          marginBottom: "1.75rem",
        }}
      >
        <span>🕐 Start: <strong>{formatDate(contest.startTime)}</strong></span>
        <span>🏁 End: <strong>{formatDate(contest.endTime)}</strong></span>
        <span>⏱ Duration: <strong>{getDuration(contest.startTime, contest.endTime)}</strong></span>
        <span>👥 <strong>{contest._count.participants}</strong> registered</span>
      </div>

      {/* Registration / Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {(isRunning || isUpcoming) && (
          <RegisterButton contestId={id} isRegistered={isRegistered} />
        )}
        {isEnded && (
          <Link
            href={`/contests/${id}/leaderboard`}
            style={{
              padding: "0.55rem 1.4rem",
              backgroundColor: "#374151",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "0.4rem",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            🏆 View Leaderboard
          </Link>
        )}
        {isEnded && (
          <Link
            href="/contests"
            style={{ fontSize: "0.9rem", color: "#6b7280", textDecoration: "underline" }}
          >
            Back to Hub
          </Link>
        )}
      </div>

      {/* Problems Table */}
      <h3 style={{ margin: "0 0 1rem", color: "#111827", fontSize: "1.05rem" }}>
        Problems ({contest.problems.length})
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
            <th style={{ padding: "0.6rem 0.5rem", color: "#6b7280" }}>#</th>
            <th style={{ padding: "0.6rem 0.5rem", color: "#6b7280" }}>Problem</th>
            <th style={{ padding: "0.6rem 0.5rem", color: "#6b7280" }}>Difficulty</th>
            <th style={{ padding: "0.6rem 0.5rem", color: "#6b7280", textAlign: "center" }}>Points</th>
            <th style={{ padding: "0.6rem 0.5rem", color: "#6b7280", textAlign: "right" }}>
              {isRunning && isRegistered ? "Action" : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {contest.problems.map((cp, idx) => {
            const diff = DIFF_COLORS[cp.problem.difficulty] ?? DIFF_COLORS.EASY;
            return (
              <tr key={cp.problemId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.9rem 0.5rem", fontWeight: 700, color: "#374151" }}>
                  {SEQUENCE_LABELS[idx]}
                </td>
                <td style={{ padding: "0.9rem 0.5rem" }}>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{cp.problem.title}</span>
                </td>
                <td style={{ padding: "0.9rem 0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "999px",
                      backgroundColor: diff.bg,
                      color: diff.color,
                    }}
                  >
                    {cp.problem.difficulty}
                  </span>
                </td>
                <td style={{ padding: "0.9rem 0.5rem", textAlign: "center", fontWeight: 700, color: "#1d4ed8" }}>
                  {cp.points}
                </td>
                <td style={{ padding: "0.9rem 0.5rem", textAlign: "right" }}>
                  {isRunning && isRegistered ? (
                    <Link
                      href={`/contests/${id}/problems/${cp.problemId}`}
                      style={{
                        padding: "0.35rem 0.85rem",
                        backgroundColor: "#15803d",
                        color: "#ffffff",
                        textDecoration: "none",
                        borderRadius: "0.35rem",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      Solve →
                    </Link>
                  ) : isRunning && !isRegistered ? (
                    <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>Register first</span>
                  ) : isEnded ? (
                    <Link
                      href={`/problems/${cp.problem.slug}`}
                      style={{ color: "#2563eb", fontSize: "0.82rem", textDecoration: "underline" }}
                    >
                      Practice
                    </Link>
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Hint for upcoming */}
      {isUpcoming && (
        <p
          style={{
            marginTop: "1.5rem",
            padding: "0.85rem 1rem",
            backgroundColor: "#eff6ff",
            borderRadius: "0.5rem",
            color: "#1d4ed8",
            fontSize: "0.9rem",
          }}
        >
          📋 Register now to be ready when the contest starts. Problems will unlock automatically at start time.
        </p>
      )}
    </div>
  );
}
