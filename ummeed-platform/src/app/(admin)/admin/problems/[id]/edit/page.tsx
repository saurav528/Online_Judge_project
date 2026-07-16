import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/config/db";
import { getProblemContent } from "@/lib/problems-fs";
import { ProblemForm } from "@/components/admin/problem-form";

interface EditProblemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Retrieve metadata from database
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!problem) {
    notFound();
  }

  // Retrieve statement/testcase content from Git-backed filesystem
  const fileContent = await getProblemContent(problem.slug);

  if (!fileContent) {
    notFound();
  }

  // Format data for the ProblemForm component
  const initialData = {
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
    published: problem.published,
    tags: problem.tags.map((t) => t.name),
    statement: fileContent.statement,
    inputSpecification: fileContent.inputSpecification,
    outputSpecification: fileContent.outputSpecification,
    constraints: fileContent.constraints,
    explanation: fileContent.explanation || "",
    examples: fileContent.examples,
    testCases: fileContent.testCases,
  };

  return (
    <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>Edit Problem</h2>
      <ProblemForm initialData={initialData} />
    </div>
  );
}
