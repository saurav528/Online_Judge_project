import React from "react";
import Link from "next/link";
import { prisma } from "@/config/db";
import { deleteContestAction } from "@/app/actions/contests";

// Server action wrapper to handle delete from the list directly
async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) {
    await deleteContestAction(id);
  }
}

export default async function AdminContestsPage() {
  const contests = await prisma.contest.findMany({
    orderBy: { startTime: "desc" },
    include: {
      _count: {
        select: { problems: true },
      },
    },
  });

  return (
    <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, color: "#111827" }}>Manage Contests</h2>
        <Link
          href="/admin/contests/new"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#10b981",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "0.25rem",
            fontWeight: "600",
            fontSize: "0.9rem",
          }}
        >
          + Add New Contest
        </Link>
      </div>

      {contests.length === 0 ? (
        <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>No contests created yet. Get started by creating one!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#374151" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 0.5rem" }}>Title</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Timeline</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Problems Count</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Visibility</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contests.map((contest) => {
              const startStr = new Date(contest.startTime).toLocaleString();
              const endStr = new Date(contest.endTime).toLocaleString();

              return (
                <tr key={contest.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    <div style={{ fontWeight: "600", color: "#111827" }}>{contest.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {contest.description || "No description"}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem" }}>
                    <div>Start: {startStr}</div>
                    <div style={{ color: "#6b7280", marginTop: "0.25rem" }}>End: {endStr}</div>
                  </td>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color:
                          contest.status === "RUNNING"
                            ? "#10b981"
                            : contest.status === "UPCOMING"
                            ? "#2563eb"
                            : "#9ca3af",
                      }}
                    >
                      {contest.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.85rem", fontWeight: "600" }}>
                    {contest._count.problems} linked
                  </td>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        backgroundColor: contest.published ? "#dcfce7" : "#f3f4f6",
                        color: contest.published ? "#166534" : "#4b5563",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      {contest.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.5rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <Link
                        href={`/admin/contests/${contest.id}/edit`}
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
                        <input type="hidden" name="id" value={contest.id} />
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
