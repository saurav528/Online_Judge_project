import React from "react";
import Link from "next/link";
import { prisma } from "@/config/db";
import { ProblemSearchSchema } from "@/lib/validation/problem";
import { requireAuth } from "@/lib/auth/auth-utils";

interface StudentProblemsPageProps {
  searchParams: Promise<{
    q?: string;
    difficulty?: string;
    tag?: string;
    page?: string;
  }>;
}

const DIFF_STYLE: Record<string, { color: string; bg: string }> = {
  EASY:   { color: "#16a34a", bg: "#dcfce7" },
  MEDIUM: { color: "#d97706", bg: "#fef3c7" },
  HARD:   { color: "#dc2626", bg: "#fee2e2" },
};

export default async function StudentProblemsPage({ searchParams }: StudentProblemsPageProps) {
  const user = await requireAuth();
  const resolvedParams = await searchParams;

  const parsed = ProblemSearchSchema.parse({
    q: resolvedParams.q || undefined,
    difficulty: resolvedParams.difficulty || undefined,
    tag: resolvedParams.tag || undefined,
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
  });

  const { q, difficulty, tag, page, limit } = parsed;
  const skip = (page - 1) * limit;

  const where: any = { published: true };
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }];
  if (difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD") where.difficulty = difficulty;
  if (tag) where.tags = { some: { name: tag } };

  const [problems, totalCount, allTags, solvedProblemIds, attemptedProblemIds] = await Promise.all([
    prisma.problem.findMany({ where, include: { tags: true, _count: { select: { submissions: { where: { verdict: "ACCEPTED" } } } } }, orderBy: { title: "asc" }, skip, take: limit }),
    prisma.problem.count({ where }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    // Problems this user solved
    prisma.submission.findMany({ where: { userId: user.id, verdict: "ACCEPTED" }, select: { problemId: true }, distinct: ["problemId"] }).then((r: any) => new Set(r.map((s: any) => s.problemId))),
    // Problems this user attempted (any submission)
    prisma.submission.findMany({ where: { userId: user.id }, select: { problemId: true }, distinct: ["problemId"] }).then((r: any) => new Set(r.map((s: any) => s.problemId))),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const getPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);
    params.set("page", targetPage.toString());
    return `/problems?${params.toString()}`;
  };

  const getFilterUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q, difficulty, tag, ...updates };
    if (merged.q) params.set("q", merged.q);
    if (merged.difficulty) params.set("difficulty", merged.difficulty);
    if (merged.tag) params.set("tag", merged.tag);
    params.set("page", "1");
    return `/problems?${params.toString()}`;
  };

  const solvedCount = problems.filter((p: any) => solvedProblemIds.has(p.id)).length;

  return (
    <div style={{ maxWidth: "1000px", display: "flex", flexDirection: "column", gap: "1.25rem", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ margin: 0, color: "#111827", fontSize: "1.4rem", fontWeight: 800 }}>Practice Problems</h2>
          <p style={{ margin: "0.2rem 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            {totalCount} problems · You solved {solvedCount} on this page
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <form method="get" action="/problems" style={{ display: "flex", gap: "0.5rem", flex: "1 1 250px" }}>
          {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search problems..."
            className="form-input"
            style={{ flex: 1, padding: "0.5rem 0.85rem" }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>Search</button>
        </form>

        {/* Difficulty filter */}
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {["ALL", "EASY", "MEDIUM", "HARD"].map((d) => {
            const isActive = d === "ALL" ? !difficulty : difficulty === d;
            const ds = DIFF_STYLE[d] || { color: "#4b5563", bg: "#f3f4f6" };
            return (
              <Link
                key={d}
                href={getFilterUrl({ difficulty: d === "ALL" ? undefined : d })}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  background: isActive ? ds.bg : "#f3f4f6",
                  color: isActive ? ds.color : "#6b7280",
                  border: `1.5px solid ${isActive ? (d === "ALL" ? "#d1d5db" : ds.color) : "transparent"}`,
                  transition: "all 150ms ease",
                }}
              >
                {d}
              </Link>
            );
          })}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {allTags.slice(0, 8).map((t: any) => (
              <Link
                key={t.id}
                href={getFilterUrl({ tag: tag === t.name ? undefined : t.name })}
                style={{
                  padding: "0.25rem 0.6",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: tag === t.name ? "var(--gray-200)" : "var(--gray-100)",
                  color: tag === t.name ? "var(--brand-primary)" : "var(--gray-500)",
                  border: `1px solid ${tag === t.name ? "var(--brand-primary)" : "var(--gray-200)"}`,
                  transition: "all 150ms ease",
                }}
              >
                {t.name}
              </Link>
            ))}
            {tag && (
              <Link href={getFilterUrl({ tag: undefined })} style={{ padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", background: "var(--verdict-wa-bg)", color: "var(--brand-red)", border: "1px solid var(--brand-red)" }}>
                Clear tag
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Problems Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {problems.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-500)" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--gray-400)" }}>No Problems Found</div>
            <p style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>No problems match your filters.</p>
            <Link href="/problems" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none", fontSize: "0.88rem" }}>Clear filters →</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Status</th>
                <th>Problem</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th style={{ textAlign: "center" }}>Accepted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem: any, idx: number) => {
                const isSolved    = solvedProblemIds.has(problem.id);
                const isAttempted = attemptedProblemIds.has(problem.id);
                const ds = DIFF_STYLE[problem.difficulty] ?? DIFF_STYLE.EASY;

                return (
                  <tr key={problem.id}>
                    <td style={{ color: "#9ca3af", fontWeight: 500, fontSize: "0.82rem" }}>
                      {skip + idx + 1}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {isSolved ? (
                        <span title="Solved" style={{ fontSize: "0.9rem", color: "var(--brand-primary)" }}>✓</span>
                      ) : isAttempted ? (
                        <span title="Attempted" style={{ fontSize: "0.9rem", color: "var(--verdict-tle)" }}>•</span>
                      ) : (
                        <span title="Not attempted" style={{ fontSize: "0.9rem", opacity: 0.25 }}>○</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/problems/${problem.slug}`}
                        style={{ fontWeight: 600, color: isSolved ? "var(--brand-primary)" : "var(--gray-900)", textDecoration: "none", fontSize: "0.92rem" }}
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", background: ds.bg, color: ds.color }}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        {problem.tags.slice(0, 3).map((t: any) => (
                          <span key={t.id} style={{ fontSize: "0.72rem", background: "var(--gray-100)", color: "var(--gray-500)", padding: "0.1rem 0.45rem", borderRadius: "999px" }}>
                            {t.name}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>+{problem.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#16a34a", fontWeight: 700, fontSize: "0.88rem" }}>
                      {problem._count.submissions}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/problems/${problem.slug}`}
                        className="btn btn-ghost"
                        style={{ padding: "0.3rem 0.85rem", fontSize: "0.82rem" }}
                      >
                        Solve →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", padding: "1.25rem", borderTop: "1px solid #f3f4f6" }}>
            {page > 1 && (
              <Link href={getPageUrl(page - 1)} className="btn btn-ghost" style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}>← Prev</Link>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pNum = i + 1;
              return (
                <Link
                  key={pNum}
                  href={getPageUrl(pNum)}
                  style={{
                    padding: "0.4rem 0.75rem", borderRadius: "6px", fontSize: "0.85rem",
                    textDecoration: "none", fontWeight: 600,
                    background: pNum === page ? "#1a56db" : "transparent",
                    color: pNum === page ? "#fff" : "#374151",
                    border: `1px solid ${pNum === page ? "#1a56db" : "#e5e7eb"}`,
                  }}
                >
                  {pNum}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link href={getPageUrl(page + 1)} className="btn btn-ghost" style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}>Next →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
