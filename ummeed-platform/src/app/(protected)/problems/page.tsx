import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProblemSearchSchema } from "@/lib/validation";

interface StudentProblemsPageProps {
  searchParams: Promise<{
    q?: string;
    difficulty?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function StudentProblemsPage({ searchParams }: StudentProblemsPageProps) {
  const resolvedParams = await searchParams;

  // Validate search parameters with Zod
  const parsed = ProblemSearchSchema.parse({
    q: resolvedParams.q || undefined,
    difficulty: resolvedParams.difficulty || undefined,
    tag: resolvedParams.tag || undefined,
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
  });

  const { q, difficulty, tag, page, limit } = parsed;
  const skip = (page - 1) * limit;

  // Build database query filters
  const where: any = {
    published: true, // Only show published problems to students
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  if (difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD") {
    where.difficulty = difficulty;
  }

  if (tag) {
    where.tags = {
      some: {
        name: tag,
      },
    };
  }

  // Fetch problems, total count, and all tags for filter UI
  const [problems, totalCount, allTags] = await Promise.all([
    prisma.problem.findMany({
      where,
      include: { tags: true },
      orderBy: { title: "asc" },
      skip,
      take: limit,
    }),
    prisma.problem.count({ where }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Helper to generate pagination URLs
  const getPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);
    params.set("page", targetPage.toString());
    return `/problems?${params.toString()}`;
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>Coding Problems</h2>

      {/* Filter and Search Form */}
      <form
        method="GET"
        action="/problems"
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.375rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ flex: "1 1 250px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            Search Problems
          </label>
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search by title or slug..."
            style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ minWidth: "150px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            Difficulty
          </label>
          <select name="difficulty" defaultValue={difficulty || ""} style={{ width: "100%", padding: "0.4rem" }}>
            <option value="">All Difficulties</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>

        <div style={{ minWidth: "180px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            Tag
          </label>
          <select name="tag" defaultValue={tag || ""} style={{ width: "100%", padding: "0.4rem" }}>
            <option value="">All Tags</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <button
            type="submit"
            style={{
              padding: "0.45rem 1rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "0",
              borderRadius: "0.25rem",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Apply Filters
          </button>
          <Link
            href="/problems"
            style={{
              padding: "0.45rem 1rem",
              backgroundColor: "#f3f4f6",
              color: "#4b5563",
              textDecoration: "none",
              borderRadius: "0.25rem",
              border: "1px solid #d1d5db",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Problems Table */}
      {problems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#6b7280" }}>
          No problems found matching your filters.
        </div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#374151" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 0.5rem" }}>Problem</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Difficulty</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Limits</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    <Link
                      href={`/problems/${problem.slug}`}
                      style={{
                        fontWeight: "600",
                        color: "#2563eb",
                        textDecoration: "none",
                        fontSize: "1.05rem",
                      }}
                    >
                      {problem.title}
                    </Link>
                    <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}>
                      {problem.tags.map((t) => (
                        <span
                          key={t.id}
                          style={{
                            fontSize: "0.7rem",
                            backgroundColor: "#f3f4f6",
                            color: "#4b5563",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "0.25rem",
                          }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color:
                          problem.difficulty === "EASY"
                            ? "#166534"
                            : problem.difficulty === "MEDIUM"
                            ? "#854d0e"
                            : "#991b1b",
                      }}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem", color: "#4b5563" }}>
                    {problem.timeLimit} ms / {problem.memoryLimit} MB
                  </td>
                  <td style={{ padding: "1rem 0.5rem", textAlign: "right" }}>
                    <Link
                      href={`/problems/${problem.slug}`}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        borderRadius: "0.25rem",
                        fontWeight: "500",
                      }}
                    >
                      Solve
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
              {page > 1 && (
                <Link
                  href={getPageUrl(page - 1)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    border: "1px solid #d1d5db",
                    textDecoration: "none",
                    color: "#374151",
                    borderRadius: "0.25rem",
                  }}
                >
                  &laquo; Prev
                </Link>
              )}

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pNum = idx + 1;
                const isCurrent = pNum === page;
                return (
                  <Link
                    key={pNum}
                    href={getPageUrl(pNum)}
                    style={{
                      padding: "0.4rem 0.8rem",
                      border: "1px solid #d1d5db",
                      textDecoration: "none",
                      color: isCurrent ? "#ffffff" : "#374151",
                      backgroundColor: isCurrent ? "#2563eb" : "transparent",
                      borderColor: isCurrent ? "#2563eb" : "#d1d5db",
                      borderRadius: "0.25rem",
                      fontWeight: isCurrent ? "bold" : "normal",
                    }}
                  >
                    {pNum}
                  </Link>
                );
              })}

              {page < totalPages && (
                <Link
                  href={getPageUrl(page + 1)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    border: "1px solid #d1d5db",
                    textDecoration: "none",
                    color: "#374151",
                    borderRadius: "0.25rem",
                  }}
                >
                  Next &raquo;
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
