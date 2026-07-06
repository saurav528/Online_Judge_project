import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-utils";
import { SubmissionService } from "@/lib/services/submission";

interface SubmissionsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function SubmissionsPage({ searchParams }: SubmissionsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        Error: You must be logged in to view submissions.
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? Number(resolvedParams.page) : 1;
  const limit = 15;

  const isAdmin = user.role === "ADMIN";

  // Fetch data depending on authorization role
  const { submissions, totalPages } = isAdmin
    ? await SubmissionService.listAllSubmissions(page, limit)
    : await SubmissionService.listUserSubmissions(user.id, page, limit);

  // Helper to generate pagination URLs
  const getPageUrl = (targetPage: number) => {
    return `/submissions?page=${targetPage}`;
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
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>
        {isAdmin ? "All Platform Submissions" : "My Submissions"}
      </h2>

      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#6b7280" }}>No submissions recorded yet.</div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#374151" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 0.5rem" }}>Problem</th>
                {isAdmin && <th style={{ padding: "0.75rem 0.5rem" }}>User</th>}
                <th style={{ padding: "0.75rem 0.5rem" }}>Language</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Verdict</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Metrics</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Time</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    <Link
                      href={`/problems/${sub.problem.slug}`}
                      style={{ fontWeight: "600", color: "#2563eb", textDecoration: "none" }}
                    >
                      {sub.problem.title}
                    </Link>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem" }}>
                      {(sub as any).user?.name || "Unknown"}
                    </td>
                  )}
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem", fontWeight: "bold", color: "#4b5563" }}>
                    {sub.language}
                  </td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontWeight: "500",
                        backgroundColor:
                          sub.status === "COMPLETED"
                            ? "#dcfce7"
                            : sub.status === "RUNNING"
                            ? "#dbeafe"
                            : sub.status === "QUEUED"
                            ? "#fef3c7"
                            : "#f3f4f6",
                        color:
                          sub.status === "COMPLETED"
                            ? "#15803d"
                            : sub.status === "RUNNING"
                            ? "#1d4ed8"
                            : sub.status === "QUEUED"
                            ? "#b45309"
                            : "#4b5563",
                      }}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color:
                          sub.verdict === "ACCEPTED"
                            ? "#166534"
                            : sub.verdict === "PENDING"
                            ? "#6b7280"
                            : "#991b1b",
                      }}
                    >
                      {sub.verdict}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
                    {sub.status === "COMPLETED" && sub.executionTime !== null
                      ? `${sub.executionTime} ms / ${(sub.memoryUsed ? sub.memoryUsed / 1024 : 0).toFixed(1)} MB`
                      : "--"}
                  </td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "1rem 0.5rem", textAlign: "right" }}>
                    <Link
                      href={`/submissions/${sub.id}`}
                      style={{
                        padding: "0.35rem 0.75rem",
                        backgroundColor: "#f3f4f6",
                        color: "#4b5563",
                        border: "1px solid #d1d5db",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        borderRadius: "0.25rem",
                        fontWeight: "500",
                      }}
                    >
                      View Code
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
