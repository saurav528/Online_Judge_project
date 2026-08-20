import React from "react";
import Link from "next/link";
import { prisma } from "@/server/db/db";
import { ProblemSearchSchema } from "@/server/validation/problem";
import { requireAuth } from "@/server/auth/auth-utils";

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

  // Prioritize lecture tags (like L1, L2, L3) first, then alphabetical
  const sortedAllTags = [...allTags].sort((a, b) => {
    const isLectureA = /^L\d+/i.test(a.name);
    const isLectureB = /^L\d+/i.test(b.name);
    if (isLectureA && !isLectureB) return -1;
    if (!isLectureA && isLectureB) return 1;
    return a.name.localeCompare(b.name);
  });

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
        {sortedAllTags.length > 0 && (
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", width: "100%", marginTop: "0.25rem" }}>
            {sortedAllTags.map((t: any) => {
              const isLecture = /^L\d+/i.test(t.name);
              const isActive = tag === t.name;
              return (
                <Link
                  key={t.id}
                  href={getFilterUrl({ tag: isActive ? undefined : t.name })}
                  style={{
                    padding: isLecture ? "0.25rem 0.8rem" : "0.25rem 0.6rem",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: isLecture ? 800 : 600,
                    textDecoration: "none",
                    background: isActive
                      ? (isLecture ? "#7c3aed" : "var(--gray-800)")
                      : (isLecture ? "#f5f3ff" : "var(--gray-100)"),
                    color: isActive
                      ? "#ffffff"
                      : (isLecture ? "#7c3aed" : "var(--gray-600)"),
                    border: `1.5px solid ${
                      isActive
                        ? (isLecture ? "#6d28d9" : "var(--gray-800)")
                        : (isLecture ? "#ddd6fe" : "var(--gray-200)")
                    }`,
                    transition: "all 150ms ease",
                  }}
                >
                  {isLecture ? `📚 ${t.name}` : t.name}
                </Link>
              );
            })}
            {tag && (
              <Link
                href={getFilterUrl({ tag: undefined })}
                style={{
                  padding: "0.25rem 0.65rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: "var(--verdict-wa-bg)",
                  color: "var(--brand-red)",
                  border: "1px solid var(--brand-red)",
                }}
              >
                ✕ Clear filter
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
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
                        {(() => {
                          const sortedTags = [...problem.tags].sort((a: any, b: any) => {
                            const isLectureA = /^L\d+/i.test(a.name);
                            const isLectureB = /^L\d+/i.test(b.name);
                            if (isLectureA && !isLectureB) return -1;
                            if (!isLectureA && isLectureB) return 1;
                            return 0;
                          });

                          return (
                            <>
                              {sortedTags.slice(0, 4).map((t: any) => {
                                const isLecture = /^L\d+/i.test(t.name);
                                return (
                                  <Link
                                    key={t.id}
                                    href={getFilterUrl({ tag: t.name })}
                                    style={{
                                      fontSize: "0.72rem",
                                      fontWeight: isLecture ? 800 : 500,
                                      background: isLecture ? "#ede9fe" : "var(--gray-100)",
                                      color: isLecture ? "#6d28d9" : "var(--gray-600)",
                                      border: isLecture ? "1px solid #c4b5fd" : "1px solid transparent",
                                      padding: isLecture ? "0.15rem 0.5rem" : "0.1rem 0.45rem",
                                      borderRadius: "999px",
                                      textDecoration: "none",
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {isLecture ? `📚 ${t.name}` : t.name}
                                  </Link>
                                );
                              })}
                              {sortedTags.length > 4 && (
                                <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>+{sortedTags.length - 4}</span>
                              )}
                            </>
                          );
                        })()}
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
