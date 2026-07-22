import React from "react";
import Link from "next/link";
import { prisma } from "@/config/db";
import { requireAuth } from "@/lib/auth/auth-utils";

export default async function GlobalLeaderboardPage() {
  const user = await requireAuth();

  const topUsers = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { rating: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      rating: true,
      _count: {
        select: {
          submissions: { where: { verdict: "ACCEPTED" } },
        },
      },
    },
  });

  // Get distinct solved problems per user
  const solvedCounts = await prisma.submission.groupBy({
    by: ["userId"],
    where: { verdict: "ACCEPTED", user: { role: "STUDENT" } },
    _count: { problemId: true },
  });
  const solvedMap = Object.fromEntries(solvedCounts.map((s) => [s.userId, s._count.problemId]));


  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--gray-900)" }}>Global Leaderboard</h2>
        <p style={{ margin: "0.25rem 0 0", color: "var(--gray-500)", fontSize: "0.88rem" }}>Top students ranked by Elo rating</p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>Rank</th>
              <th>Student</th>
              <th style={{ textAlign: "center" }}>Rating</th>
              <th style={{ textAlign: "center" }}>Problems Solved</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((u, idx) => {
              const rank = idx + 1;
              const isMe = u.id === user.id;
              return (
                <tr key={u.id} style={{ background: isMe ? "var(--gray-100)" : "transparent" }}>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    <span style={{ color: rank <= 3 ? "var(--brand-primary)" : "var(--gray-400)" }}>#{rank}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: isMe ? "var(--brand-primary)" : "var(--gray-900)", fontSize: "0.9rem" }}>
                      {u.name}
                      {isMe && (
                        <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", fontWeight: 700, background: "var(--gray-200)", color: "var(--brand-primary)", padding: "0.1rem 0.4rem", borderRadius: "999px" }}>You</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{u.email}</div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--brand-primary)" }}>{u.rating}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{solvedMap[u.id] ?? 0}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/contests" className="btn btn-primary" style={{ display: "inline-flex" }}>
          View Contests
        </Link>
      </div>
    </div>
  );
}
