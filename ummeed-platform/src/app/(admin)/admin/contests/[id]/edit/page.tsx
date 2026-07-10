import React from "react";
import { notFound } from "next/navigation";
import { ContestForm } from "@/components/admin/contest-form";
import { prisma } from "@/lib/prisma";

export default async function EditContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Retrieve the contest with linked problems
  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        orderBy: { sequence: "asc" },
      },
    },
  });

  if (!contest) {
    notFound();
  }

  // Fetch all problems for linking dropdown list
  const problemsList = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { title: "asc" },
  });

  // Map database relation shape to form initialData shape
  const initialData = {
    id: contest.id,
    title: contest.title,
    description: contest.description,
    startTime: contest.startTime,
    endTime: contest.endTime,
    published: contest.published,
    problems: contest.problems.map((p) => ({
      problemId: p.problemId,
      points: p.points,
      sequence: p.sequence,
    })),
  };

  return (
    <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontFamily: "sans-serif" }}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>Edit Contest</h2>
      <ContestForm initialData={initialData} problemsList={problemsList} />
    </div>
  );
}
