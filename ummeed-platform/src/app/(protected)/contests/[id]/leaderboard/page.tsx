import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContestService } from "@/lib/services/contest";
import { requireAuth } from "@/lib/auth/auth-utils";
import { prisma } from "@/config/db";

const SEQUENCE_LABELS = ["A", "B", "C", "D", "E", "F"];

const RANK_STYLES: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: "var(--surface-elevated)", color: "var(--brand-primary)", label: "1" },
  2: { bg: "var(--surface-elevated)", color: "var(--gray-700)", label: "2" },
  3: { bg: "var(--surface-elevated)", color: "var(--gray-600)", label: "3" },
};

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contest, leaderboard, user] = await Promise.all([
    prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          include: { problem: { select: { id: true, title: true } } },
          orderBy: { sequence: "asc" },
        },
      },
    }),
    ContestService.getLeaderboard(id),
    requireAuth(),
  ]);

  if (!contest) notFound();

  const isEnded = new Date() > new Date(contest.endTime);
  const isAdmin = user.role === "ADMIN";

  if (!isEnded && !isAdmin) {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "3rem 2rem",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          fontFamily: "sans-serif",
          textAlign: "center",
          maxWidth: "600px",
          margin: "3rem auto",
        }}
      >
        <h2 style={{ color: "var(--gray-900)", margin: "0 0 1rem", fontSize: "1.5rem" }}>Leaderboard is Locked</h2>
        <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          The leaderboard for this contest will become available once the contest has officially ended.
        </p>
        <Link
          href={`/contests/${id}`}
          style={{
            display: "inline-block",
            padding: "0.55rem 1.4rem",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "0.4rem",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          Return to Contest Detail
        </Link>
      </div>
    );
  }

  const { rows } = leaderboard;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
        maxWidth: "1100px",
        margin: "0 auto",
        width: "100%",
        overflowX: "auto",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.25rem", fontSize: "0.85rem", color: "#6b7280" }}>
        <Link href="/contests" style={{ color: "#2563eb", textDecoration: "none" }}>
          ← Contest Hub
        </Link>
        {" / "}
        <Link href={`/contests/${id}`} style={{ color: "#2563eb", textDecoration: "none" }}>
          {contest.title}
        </Link>
        {" / Leaderboard"}
      </div>

      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ margin: 0, color: "var(--gray-900)", fontSize: "1.5rem" }}>
          {contest.title} — Leaderboard
        </h2>
        <p style={{ margin: "0.3rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
          Ranked by total score (descending), then penalty minutes (ascending). Each wrong submission before AC adds 20 min penalty.
        </p>
      </div>

      {rows.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#9ca3af",
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
          }}
        >
          No participants yet. Be the first to register and submit!
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", minWidth: "700px" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "0.75rem 0.5rem", color: "#6b7280", fontWeight: 700, width: "60px" }}>Rank</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "#6b7280", fontWeight: 700 }}>Participant</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "#6b7280", fontWeight: 700, textAlign: "center" }}>
                Score
              </th>
              <th style={{ padding: "0.75rem 0.5rem", color: "#6b7280", fontWeight: 700, textAlign: "center" }}>
                Penalty
              </th>
              {contest.problems.map((cp, idx) => (
                <th
                  key={cp.problemId}
                  style={{
                    padding: "0.75rem 0.5rem",
                    color: "#6b7280",
                    fontWeight: 700,
                    textAlign: "center",
                    minWidth: "90px",
                  }}
                  title={cp.problem.title}
                >
                  {SEQUENCE_LABELS[idx]}
                  <br />
                  <span style={{ fontSize: "0.7rem", fontWeight: 400 }}>({cp.points} pts)</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isCurrentUser = row.userId === user.id;
              const rankStyle = RANK_STYLES[row.rank];

              return (
                <tr
                  key={row.userId}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor: isCurrentUser
                      ? "#eff6ff"
                      : rankStyle?.bg ?? "transparent",
                  }}
                >
                  {/* Rank */}
                  <td style={{ padding: "0.85rem 0.5rem", textAlign: "center" }}>
                    {rankStyle ? (
                      <span style={{ fontSize: "1.2rem" }}>{rankStyle.label}</span>
                    ) : (
                      <span style={{ fontWeight: 700, color: "#374151" }}>#{row.rank}</span>
                    )}
                  </td>

                  {/* Name */}
                  <td style={{ padding: "0.85rem 0.5rem" }}>
                    <span style={{ fontWeight: 600, color: "#111827" }}>
                      {row.name}
                      {isCurrentUser && (
                        <span
                          style={{
                            marginLeft: "0.4rem",
                            fontSize: "0.7rem",
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "999px",
                            fontWeight: 600,
                          }}
                        >
                          You
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Score */}
                  <td style={{ padding: "0.85rem 0.5rem", textAlign: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1d4ed8" }}>
                      {row.score}
                    </span>
                  </td>

                  {/* Penalty */}
                  <td style={{ padding: "0.85rem 0.5rem", textAlign: "center" }}>
                    <span style={{ color: row.penalty > 0 ? "#dc2626" : "#6b7280", fontWeight: 600 }}>
                      {row.penalty > 0 ? `+${row.penalty}m` : "—"}
                    </span>
                  </td>

                  {/* Per-problem statuses */}
                  {row.problemStatuses.map((ps) => (
                    <td key={ps.problemId} style={{ padding: "0.85rem 0.5rem", textAlign: "center" }}>
                      {ps.solved ? (
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              backgroundColor: "#dcfce7",
                              color: "#15803d",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "0.3rem",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            AC
                          </span>
                          {ps.attempts > 1 && (
                            <div style={{ fontSize: "0.7rem", color: "#dc2626", marginTop: "0.15rem" }}>
                              ({ps.attempts - 1} WA)
                            </div>
                          )}
                        </div>
                      ) : ps.attempts > 0 ? (
                        <span
                          style={{
                            display: "inline-block",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.3rem",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                          }}
                        >
                          ×{ps.attempts}
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: "0.9rem" }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Scoring legend */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "0.85rem 1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          fontSize: "0.82rem",
          color: "#6b7280",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <span>AC = Accepted (full points earned)</span>
        <span>×N = N wrong submissions (no points yet)</span>
        <span>Penalty = wrong attempts before AC × 20 min</span>
      </div>
    </div>
  );
}
