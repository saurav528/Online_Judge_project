import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProblemAction } from "@/app/actions/problems";
import { revalidatePath } from "next/cache";

// Server action wrapper to handle delete from the list directly
async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) {
    await deleteProblemAction(id);
  }
}

export default async function AdminProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  });

  return (
    <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, color: "#111827" }}>Manage Problems</h2>
        <Link
          href="/admin/problems/new"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "0.25rem",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          + Add New Problem
        </Link>
      </div>

      {problems.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>No problems seeded yet. Get started by adding a problem!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#374151" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 0.5rem" }}>Title</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Difficulty</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Limits</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "1rem 0.5rem" }}>
                  <div style={{ fontWeight: "600", color: "#111827" }}>{problem.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{problem.slug}</div>
                  <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}>
                    {problem.tags.map((tag) => (
                      <span
                        key={tag.id}
                        style={{
                          fontSize: "0.75rem",
                          backgroundColor: "#f3f4f6",
                          color: "#4b5563",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "0.25rem",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "1rem 0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "500",
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
                <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem" }}>
                  {problem.timeLimit} ms / {problem.memoryLimit} MB
                </td>
                <td style={{ padding: "1rem 0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      backgroundColor: problem.published ? "#dcfce7" : "#f3f4f6",
                      color: problem.published ? "#166534" : "#4b5563",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    {problem.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td style={{ padding: "1rem 0.5rem", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                    <Link
                      href={`/admin/problems/${problem.id}/edit`}
                      style={{
                        padding: "0.3rem 0.6rem",
                        backgroundColor: "#f3f4f6",
                        color: "#4b5563",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        borderRadius: "0.25rem",
                        border: "1px solid #d1d5db",
                      }}
                    >
                      Edit
                    </Link>
                    <form action={handleDelete} style={{ margin: 0 }}>
                      <input type="hidden" name="id" value={problem.id} />
                      <button
                        type="submit"
                        style={{
                          padding: "0.3rem 0.6rem",
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          fontSize: "0.85rem",
                          borderRadius: "0.25rem",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
