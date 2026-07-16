import React from "react";
import Link from "next/link";
import { ContestService } from "@/lib/services/contest";
import { ContestStatus } from "@prisma/client";

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
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

const STATUS_STYLES: Record<ContestStatus, { bg: string; color: string; label: string }> = {
  UPCOMING: { bg: "#eff6ff", color: "#1d4ed8", label: "Upcoming" },
  RUNNING:  { bg: "#f0fdf4", color: "#15803d", label: "● Live Now" },
  ENDED:    { bg: "#f3f4f6", color: "#6b7280", label: "Ended" },
};

export default async function ContestHubPage() {
  const contests = await ContestService.listContests();

  const upcoming = contests.filter((c) => c.status === "UPCOMING");
  const running  = contests.filter((c) => c.status === "RUNNING");
  const ended    = contests.filter((c) => c.status === "ENDED");

  const ContestCard = ({ contest }: { contest: (typeof contests)[0] }) => {
    const st = STATUS_STYLES[contest.status];
    return (
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#111827", fontWeight: 700 }}>
            {contest.title}
          </h3>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              backgroundColor: st.bg,
              color: st.color,
              whiteSpace: "nowrap",
            }}
          >
            {st.label}
          </span>
        </div>

        {/* Description */}
        <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.5 }}>
          {contest.description}
        </p>

        {/* Meta row */}
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.82rem", color: "#6b7280", flexWrap: "wrap" }}>
          <span>🕐 Start: {formatDate(contest.startTime)}</span>
          <span>⏱ Duration: {getDuration(contest.startTime, contest.endTime)}</span>
          <span>📋 {contest.problems.length} Problems</span>
          <span>👥 {contest._count.participants} Registered</span>
        </div>

        {/* Problem labels */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {contest.problems.map((cp, idx) => (
            <span
              key={cp.problemId}
              title={cp.problem.title}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.15rem 0.5rem",
                borderRadius: "0.25rem",
                backgroundColor:
                  cp.problem.difficulty === "EASY"
                    ? "#dcfce7"
                    : cp.problem.difficulty === "MEDIUM"
                    ? "#fef9c3"
                    : "#fee2e2",
                color:
                  cp.problem.difficulty === "EASY"
                    ? "#166534"
                    : cp.problem.difficulty === "MEDIUM"
                    ? "#854d0e"
                    : "#991b1b",
              }}
            >
              {SEQUENCE_LABELS[idx]}: {cp.problem.title}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
          <Link
            href={`/contests/${contest.id}`}
            style={{
              padding: "0.45rem 1.1rem",
              backgroundColor: contest.status === "RUNNING" ? "#15803d" : contest.status === "UPCOMING" ? "#1d4ed8" : "#374151",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "0.4rem",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {contest.status === "RUNNING" ? "Enter Contest →" : contest.status === "UPCOMING" ? "View Details" : "View Contest"}
          </Link>
          {contest.status === "ENDED" && (
            <Link
              href={`/contests/${contest.id}/leaderboard`}
              style={{
                padding: "0.45rem 1.1rem",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                textDecoration: "none",
                borderRadius: "0.4rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                border: "1px solid #d1d5db",
              }}
            >
              🏆 Leaderboard
            </Link>
          )}
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    icon,
    items,
    emptyMsg,
  }: {
    title: string;
    icon: string;
    items: (typeof contests);
    emptyMsg: string;
  }) => (
    <div style={{ marginBottom: "2.5rem" }}>
      <h3
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#6b7280",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {icon} {title}
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            backgroundColor: "#f3f4f6",
            color: "#374151",
            padding: "0.1rem 0.5rem",
            borderRadius: "999px",
          }}
        >
          {items.length}
        </span>
      </h3>
      {items.length === 0 ? (
        <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "0.9rem" }}>{emptyMsg}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((c) => (
            <ContestCard key={c.id} contest={c} />
          ))}
        </div>
      )}
    </div>
  );

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
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ margin: 0, color: "#111827", fontSize: "1.5rem" }}>🏟 Contest Hub</h2>
        <p style={{ margin: "0.4rem 0 0", color: "#6b7280", fontSize: "0.95rem" }}>
          Compete in timed coding contests and climb the leaderboard!
        </p>
      </div>

      <Section title="Live Now" icon="🔴" items={running} emptyMsg="No contests are currently running." />
      <Section title="Upcoming" icon="📅" items={upcoming} emptyMsg="No upcoming contests scheduled yet." />
      <Section title="Past Contests" icon="📜" items={ended} emptyMsg="No past contests yet." />
    </div>
  );
}
