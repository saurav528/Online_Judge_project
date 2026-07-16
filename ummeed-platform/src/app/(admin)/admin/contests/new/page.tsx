import React from "react";
import { ContestForm } from "@/components/admin/contest-form";
import { prisma } from "@/config/db";

export default async function NewContestPage() {
  // Fetch existing problems in the database to link to this contest
  const problemsList = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { title: "asc" },
  });

  return (
    <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontFamily: "sans-serif" }}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>Create New Contest</h2>
      <ContestForm problemsList={problemsList} />
    </div>
  );
}
