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
    ACCEPTED:          { bg: "#dcfce7", color: "#16a34a", icon: "✓" },
    WRONG_ANSWER:      { bg: "#fee2e2", color: "#dc2626", icon: "✗" },
    TIME_LIMIT_EXCEEDED:{ bg: "#fef3c7", color: "#d97706", icon: "⏱" },
    TLE:               { bg: "#fef3c7", color: "#d97706", icon: "⏱" },
    RUNTIME_ERROR:     { bg: "#fce7f3", color: "#db2777", icon: "💥" },
    COMPILATION_ERROR: { bg: "#ede9fe", color: "#7c3aed", icon: "⚙" },
    PENDING:           { bg: "#f3f4f6", color: "#6b7280", icon: "…" },
  };

  const DIFF_STYLE: Record<string, { color: string }> = {
    EASY:   { color: "#16a34a" },
    MEDIUM: { color: "#d97706" },
    HARD:   { color: "#dc2626" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: "1100px" }}>

      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1a56db 0%, #0e3fa5 100%)",
        borderRadius: "16px",
        padding: "1.75rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(26,86,219,0.3)",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Welcome back, {user.name.split(" ")[0]}! 👋
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
          { label: "Problems Solved", value: solvedCount, total: totalProblems, icon: "✅", color: "#16a34a", bg: "#dcfce7" },
          { label: "Attempted",       value: attemptedCount, total: totalProblems, icon: "🎯", color: "#1a56db", bg: "#dbeafe" },
          { label: "Total Submissions",value: totalSubmissions, icon: "📤", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Solve Rate",      value: `${solveRate}%`, icon: "📈", color: "#d97706", bg: "#fef3c7" },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.25rem", flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                {stat.value}
                {stat.total !== undefined && (
                  <span style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 500 }}>/{stat.total}</span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.2rem" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Quick Access
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {[
            { href: "/problems", icon: "📋", title: "Practice Problems", desc: `${totalProblems} problems available`, color: "#1a56db", bg: "linear-gradient(135deg, #dbeafe, #eff6ff)" },
            { href: "/contests", icon: "🏟️", title: "Contest Hub",       desc: `${runningContests.length} live now`, color: "#16a34a", bg: "linear-gradient(135deg, #dcfce7, #f0fdf4)" },
            { href: "/duels",    icon: "⚔️", title: "1v1 Duels",         desc: "Real-time matchmaking", color: "#dc2626", bg: "linear-gradient(135deg, #fee2e2, #fef2f2)" },
            { href: "/submissions", icon: "📜", title: "My Submissions",  desc: `${totalSubmissions} total submissions`, color: "#7c3aed", bg: "linear-gradient(135deg, #ede9fe, #f5f3ff)" },
            { href: "/leaderboard", icon: "🏆", title: "Leaderboard",    desc: "See top performers", color: "#d97706", bg: "linear-gradient(135deg, #fef3c7, #fffbeb)" },
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
                  background: card.bg,
                  borderRadius: "14px",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{card.icon}</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>{card.title}</div>
                <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Contests Banner */}
      {runningContests.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          border: "1px solid #bbf7d0",
          borderRadius: "14px",
          padding: "1.25rem 1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
            <span className="live-dot" />
            <span style={{ fontWeight: 700, color: "#15803d", fontSize: "0.95rem" }}>
              {runningContests.length} Contest{runningContests.length > 1 ? "s" : ""} Live Right Now!
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {runningContests.map((c) => (
              <Link key={c.id} href={`/contests/${c.id}`} style={{ textDecoration: "none" }}>
                <div className="contest-pill-hover" style={{
                  background: "#fff", borderRadius: "10px", padding: "0.65rem 1.1rem",
                  border: "1px solid #bbf7d0", fontSize: "0.88rem", fontWeight: 600,
                  color: "#15803d", display: "flex", alignItems: "center", gap: "0.5rem",
                }}
                >
                  🏁 {c.title} →
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
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>Recent Submissions</h3>
            <Link href="/submissions" style={{ fontSize: "0.82rem", color: "#1a56db", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚀</div>
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
                      padding: "0.85rem 1.5rem", borderBottom: "1px solid #f9fafb",
                    }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.88rem" }}>{sub.problem.title}</div>
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
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>Upcoming Contests</h3>
            <Link href="/contests" style={{ fontSize: "0.82rem", color: "#1a56db", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
          </div>
          {upcomingContests.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
              <p style={{ fontSize: "0.9rem" }}>No upcoming contests scheduled.</p>
            </div>
          ) : (
            <div>
              {upcomingContests.map((c) => (
                <Link key={c.id} href={`/contests/${c.id}`} style={{ textDecoration: "none" }}>
                  <div className="list-item-hover" style={{
                    padding: "1rem 1.5rem", borderBottom: "1px solid #f9fafb",
                  }}
                  >
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.88rem", marginBottom: "0.25rem" }}>{c.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                      📅 {new Date(c.startTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div style={{ marginTop: "0.4rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, background: "#eff6ff", color: "#1a56db", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
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
