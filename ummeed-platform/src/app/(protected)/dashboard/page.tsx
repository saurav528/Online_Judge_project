import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/auth-utils";
import { prisma } from "@/config/db";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch stats in parallel
  const [
    totalProblems,
    solvedCount,
    attemptedCount,
    totalSubmissions,
    recentSubmissions,
    runningContests,
    upcomingContests,
  ] = await Promise.all([
    prisma.problem.count({ where: { published: true } }),
    prisma.submission.groupBy({
      by: ["problemId"],
      where: { userId: user.id, verdict: "ACCEPTED" },
    }).then((r) => r.length),
    prisma.submission.groupBy({
      by: ["problemId"],
      where: { userId: user.id },
    }).then((r) => r.length),
    prisma.submission.count({ where: { userId: user.id } }),
    prisma.submission.findMany({
      where: { userId: user.id },
      include: { problem: { select: { title: true, slug: true, difficulty: true } } },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
    prisma.contest.findMany({ where: { status: "RUNNING", published: true }, take: 3 }),
    prisma.contest.findMany({ where: { status: "UPCOMING", published: true }, orderBy: { startTime: "asc" }, take: 3 }),
  ]);

  const solveRate = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const VERDICT_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
    ACCEPTED:          { bg: "var(--verdict-ac-bg)", color: "var(--verdict-ac)", icon: "✓" },
    WRONG_ANSWER:      { bg: "var(--verdict-wa-bg)", color: "var(--verdict-wa)", icon: "✗" },
    TIME_LIMIT_EXCEEDED:{ bg: "var(--verdict-tle-bg)", color: "var(--verdict-tle)", icon: "" },
    TLE:               { bg: "var(--verdict-tle-bg)", color: "var(--verdict-tle)", icon: "" },
    RUNTIME_ERROR:     { bg: "var(--verdict-re-bg)", color: "var(--verdict-re)", icon: "" },
    COMPILATION_ERROR: { bg: "var(--verdict-ce-bg)", color: "var(--verdict-ce)", icon: "" },
    PENDING:           { bg: "var(--verdict-pending-bg)", color: "var(--verdict-pending)", icon: "…" },
  };

  const DIFF_STYLE: Record<string, { color: string }> = {
    EASY:   { color: "#22c55e" },
    MEDIUM: { color: "#eab308" },
    HARD:   { color: "#ef4444" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>

      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0c2511 0%, #000000 100%)",
        borderRadius: "16px",
        padding: "1.75rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Welcome back, {user.name.split(" ")[0]}!
          </h2>
          <p style={{ margin: "0.3rem 0 0", opacity: 0.8, fontSize: "0.95rem" }}>
            {solvedCount > 0
              ? `You've solved ${solvedCount} problem${solvedCount !== 1 ? "s" : ""} so far. Keep going!`
              : "Start solving problems and track your progress!"}
          </p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.15)",
          borderRadius: "12px",
          padding: "0.85rem 1.5rem",
          backdropFilter: "blur(4px)",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.2)",
        }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{user.rating}</div>
          <div style={{ fontSize: "0.78rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Elo Rating</div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Problems Solved", value: solvedCount, total: totalProblems, color: "var(--brand-primary)", bg: "var(--gray-100)" },
          { label: "Attempted",       value: attemptedCount, total: totalProblems, color: "var(--brand-accent)", bg: "var(--gray-100)" },
          { label: "Total Submissions",value: totalSubmissions, color: "var(--gray-800)", bg: "var(--gray-100)" },
          { label: "Solve Rate",      value: `${solveRate}%`, color: "var(--verdict-tle)", bg: "var(--gray-100)" },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                {stat.value}
                {stat.total !== undefined && (
                  <span style={{ fontSize: "0.85rem", color: "var(--gray-400)", fontWeight: 500 }}>/{stat.total}</span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Quick Access
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {[
            { href: "/problems", title: "Practice Problems", desc: `${totalProblems} problems available` },
            { href: "/contests", title: "Contest Hub",       desc: `${runningContests.length} live now` },
            { href: "/duels",    title: "1v1 Duels",         desc: "Real-time matchmaking" },
            { href: "/submissions", title: "My Submissions",  desc: `${totalSubmissions} total submissions` },
            { href: "/leaderboard", title: "Leaderboard",    desc: "See top performers" },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card interactive-card"
                style={{
                  padding: "1.5rem",
                  background: "var(--surface-card)",
                  borderRadius: "14px",
                  cursor: "pointer",
                  border: "1px solid var(--gray-200)",
                }}
              >
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-900)", marginBottom: "0.25rem" }}>{card.title}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--gray-500)" }}>{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Contests Banner */}
      {runningContests.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, var(--gray-100), var(--gray-50))",
          border: "1px solid var(--brand-primary)",
          borderRadius: "14px",
          padding: "1.25rem 1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
            <span className="live-dot" />
            <span style={{ fontWeight: 700, color: "var(--brand-primary)", fontSize: "0.95rem" }}>
              {runningContests.length} Contest{runningContests.length > 1 ? "s" : ""} Live Right Now!
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {runningContests.map((c) => (
              <Link key={c.id} href={`/contests/${c.id}`} style={{ textDecoration: "none" }}>
                <div className="contest-pill-hover" style={{
                  background: "var(--surface-elevated)", borderRadius: "10px", padding: "0.65rem 1.1rem",
                  border: "1px solid var(--brand-primary)", fontSize: "0.88rem", fontWeight: 600,
                  color: "var(--brand-primary)", display: "flex", alignItems: "center", gap: "0.5rem",
                }}
                >
                  {c.title} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Grid: Recent Submissions + Upcoming Contests */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Recent Submissions */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--gray-900)" }}>Recent Submissions</h3>
            <Link href="/submissions" style={{ fontSize: "0.82rem", color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gray-500)" }}>
              <p style={{ fontSize: "0.9rem" }}>No submissions yet. Start coding!</p>
              <Link href="/problems" className="btn btn-primary" style={{ display: "inline-flex", marginTop: "0.75rem", fontSize: "0.85rem", padding: "0.5rem 1rem" }}>Browse Problems</Link>
            </div>
          ) : (
            <div>
              {recentSubmissions.map((sub) => {
                const vs = VERDICT_STYLE[sub.verdict] || VERDICT_STYLE.PENDING;
                const ds = DIFF_STYLE[sub.problem.difficulty] || DIFF_STYLE.EASY;
                return (
                  <Link key={sub.id} href={`/submissions/${sub.id}`} style={{ textDecoration: "none" }}>
                    <div className="list-item-hover" style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.85rem 1.5rem", borderBottom: "1px solid var(--gray-100)",
                    }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--gray-900)", fontSize: "0.88rem" }}>{sub.problem.title}</div>
                        <div style={{ fontSize: "0.76rem", color: ds.color, fontWeight: 600, marginTop: "0.1rem" }}>{sub.problem.difficulty} • {sub.language}</div>
                      </div>
                      <span style={{
                        padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.76rem", fontWeight: 700,
                        background: vs.bg, color: vs.color,
                      }}>
                        {vs.icon} {sub.verdict.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Contests */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--gray-900)" }}>Upcoming Contests</h3>
            <Link href="/contests" style={{ fontSize: "0.82rem", color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
          </div>
          {upcomingContests.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gray-500)" }}>
              <p style={{ fontSize: "0.9rem" }}>No upcoming contests scheduled.</p>
            </div>
          ) : (
            <div>
              {upcomingContests.map((c) => (
                <Link key={c.id} href={`/contests/${c.id}`} style={{ textDecoration: "none" }}>
                  <div className="list-item-hover" style={{
                    padding: "1rem 1.5rem", borderBottom: "1px solid var(--gray-100)",
                  }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--gray-900)", fontSize: "0.88rem", marginBottom: "0.25rem" }}>{c.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>
                      {new Date(c.startTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div style={{ marginTop: "0.4rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, background: "var(--gray-200)", color: "var(--brand-primary)", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                        UPCOMING
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
