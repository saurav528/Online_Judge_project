import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProblemContent } from "@/lib/problems-fs";
import Link from "next/link";
import { SubmissionForm } from "@/components/problems/submission-form";

interface StudentProblemDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StudentProblemDetailsPage({ params }: StudentProblemDetailsPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Retrieve problem metadata from database
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: { tags: true },
  });

  // Verify problem exists and is published
  if (!problem || !problem.published) {
    notFound();
  }

  // Retrieve Git-backed statements and examples
  const fileContent = await getProblemContent(slug);
  if (!fileContent) {
    notFound();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", fontFamily: "sans-serif" }}>
      {/* Top Banner: Breadcrumb & Title */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem 2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
          <Link href="/problems" style={{ color: "#2563eb", textDecoration: "none" }}>
            &larr; Back to Problems
          </Link>
        </div>
        <h1 style={{ margin: "0 0 0.5rem 0", color: "#111827" }}>{problem.title}</h1>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
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
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Time Limit: <strong>{problem.timeLimit} ms</strong>
          </span>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Memory Limit: <strong>{problem.memoryLimit} MB</strong>
          </span>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {problem.tags.map((t) => (
              <span
                key={t.id}
                style={{
                  fontSize: "0.75rem",
                  backgroundColor: "#f3f4f6",
                  color: "#4b5563",
                  padding: "0.1rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Description, Right Side Code Form */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div
          style={{
            flex: "3 1 600px",
            backgroundColor: "#ffffff",
            padding: "2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            lineHeight: "1.6",
            color: "#374151",
          }}
        >
          {/* Description Section */}
          <section style={{ marginBottom: "2rem" }}>
            <h3 style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem", color: "#111827" }}>
              Problem Statement
            </h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{fileContent.statement}</p>
          </section>

          {/* Input / Output Specs */}
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <div style={{ flex: "1 1 250px" }}>
              <h3 style={{ borderBottom: "1px solid #e5e7eb", color: "#111827" }}>Input Specification</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{fileContent.inputSpecification}</p>
            </div>
            <div style={{ flex: "1 1 250px" }}>
              <h3 style={{ borderBottom: "1px solid #e5e7eb", color: "#111827" }}>Output Specification</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{fileContent.outputSpecification}</p>
            </div>
          </div>

          {/* Constraints */}
          <section style={{ marginBottom: "2rem" }}>
            <h3 style={{ borderBottom: "1px solid #e5e7eb", color: "#111827" }}>Constraints</h3>
            <pre
              style={{
                backgroundColor: "#f9fafb",
                padding: "1rem",
                borderRadius: "0.375rem",
                fontFamily: "monospace",
                fontSize: "0.95rem",
                border: "1px solid #e5e7eb",
                margin: 0,
              }}
            >
              {fileContent.constraints}
            </pre>
          </section>

          {/* Examples Section */}
          {fileContent.examples && fileContent.examples.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ borderBottom: "1px solid #e5e7eb", color: "#111827" }}>Examples</h3>
              {fileContent.examples
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((ex, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.375rem",
                      padding: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                      Example #{ex.displayOrder}
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      <div style={{ flex: "1 1 200px" }}>
                        <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Input:</span>
                        <pre
                          style={{
                            backgroundColor: "#f3f4f6",
                            padding: "0.5rem",
                            borderRadius: "0.25rem",
                            fontFamily: "monospace",
                            margin: "0.25rem 0 0 0",
                          }}
                        >
                          {ex.input}
                        </pre>
                      </div>
                      <div style={{ flex: "1 1 200px" }}>
                        <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Output:</span>
                        <pre
                          style={{
                            backgroundColor: "#f3f4f6",
                            padding: "0.5rem",
                            borderRadius: "0.25rem",
                            fontFamily: "monospace",
                            margin: "0.25rem 0 0 0",
                          }}
                        >
                          {ex.output}
                        </pre>
                      </div>
                    </div>
                    {ex.explanation && (
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#4b5563",
                          borderTop: "1px dashed #e5e7eb",
                          paddingTop: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        <strong>Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
            </section>
          )}

          {/* Explanation Section */}
          {fileContent.explanation && (
            <section>
              <h3 style={{ borderBottom: "1px solid #e5e7eb", color: "#111827" }}>Explanation</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{fileContent.explanation}</p>
            </section>
          )}
        </div>

        {/* Right Column: Code Submission Box */}
        <div style={{ flex: "2 1 400px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <SubmissionForm problemId={problem.id} />
        </div>
      </div>
    </div>
  );
}
