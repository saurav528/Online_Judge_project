import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/config/db";
import { requireAuth } from "@/lib/auth/auth-utils";
import { ContestService } from "@/lib/services/contest";
import { getProblemContent } from "@/lib/problems-fs";
import { SEEDED_SIGNATURES } from "@/lib/services/executor";
import { ContestCountdown } from "../../contest-client";
import { ContestSubmissionForm } from "./contest-submission-form";
import { RichText } from "@/components/rich-text";

export default async function ContestProblemPage({
  params,
}: {
  params: Promise<{ id: string; problemId: string }>;
}) {
  const { id: contestId, problemId } = await params;
  const user = await requireAuth();

  // Fetch contest with problems
  const [contest, contestProblem, problem, isRegistered] = await Promise.all([
    ContestService.getContest(contestId),
    prisma.contestProblem.findUnique({
      where: { contestId_problemId: { contestId, problemId } },
      include: { problem: { include: { tags: true } } },
    }),
    prisma.problem.findUnique({ where: { id: problemId } }),
    ContestService.isRegistered(contestId, user.id),
  ]);

  if (!contest || !contestProblem || !problem) notFound();

  // Gate: contest must be RUNNING and user must be registered
  if (contest.status !== "RUNNING") {
    redirect(`/contests/${contestId}`);
  }
  if (!isRegistered) {
    redirect(`/contests/${contestId}`);
  }

  // Load problem content
  const content = await getProblemContent(problem.slug);
  const signature =
    content?.signature ?? SEEDED_SIGNATURES[problem.slug] ?? undefined;

  // Get all contest problems for navigation
  const allContestProblems = await prisma.contestProblem.findMany({
    where: { contestId },
    include: { problem: { select: { id: true, title: true } } },
    orderBy: { sequence: "asc" },
  });

  const SEQUENCE_LABELS = ["A", "B", "C", "D", "E", "F"];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb + Problem Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            <Link href="/contests" style={{ color: "#2563eb", textDecoration: "none" }}>
              ← Contest Hub
            </Link>
            {" / "}
            <Link href={`/contests/${contestId}`} style={{ color: "#2563eb", textDecoration: "none" }}>
              {contest.title}
            </Link>
            {" / "}
            <strong style={{ color: "#111827" }}>{problem.title}</strong>
          </div>

          {/* Time Remaining Timer */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.6rem", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "6px", fontSize: "0.8rem", color: "#dc2626", fontWeight: 700 }}>
            <span>⏱️ Time Left:</span>
            <ContestCountdown endTime={contest.endTime.toISOString()} style={{ fontSize: "0.85rem", color: "#dc2626" }} />
          </div>
        </div>

        {/* Problem switcher */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {allContestProblems.map((cp, idx) => (
            <Link
              key={cp.problemId}
              href={`/contests/${contestId}/problems/${cp.problemId}`}
              style={{
                padding: "0.3rem 0.7rem",
                borderRadius: "0.3rem",
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
                backgroundColor: cp.problemId === problemId ? "#15803d" : "#f3f4f6",
                color: cp.problemId === problemId ? "#ffffff" : "#374151",
                border: "1px solid",
                borderColor: cp.problemId === problemId ? "#15803d" : "#d1d5db",
              }}
            >
              {SEQUENCE_LABELS[idx]}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Left: Problem Statement */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "2rem",
            borderRadius: "0.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflowY: "auto",
            maxHeight: "85vh",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h2 style={{ margin: 0, color: "#111827", fontSize: "1.3rem" }}>
                {SEQUENCE_LABELS[contestProblem.sequence]}. {problem.title}
              </h2>
              <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    backgroundColor:
                      problem.difficulty === "EASY" ? "#dcfce7" : problem.difficulty === "MEDIUM" ? "#fef9c3" : "#fee2e2",
                    color:
                      problem.difficulty === "EASY" ? "#166534" : problem.difficulty === "MEDIUM" ? "#854d0e" : "#991b1b",
                  }}
                >
                  {problem.difficulty}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                  }}
                >
                  {contestProblem.points} pts
                </span>
              </div>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
              <div>⏱ {problem.timeLimit} ms</div>
              <div>💾 {problem.memoryLimit} MB</div>
            </div>
          </div>

          {content ? (
            <>
              <section style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>Problem Statement</h4>
                <p style={{ color: "#4b5563", lineHeight: 1.7 }}><RichText>{content.statement}</RichText></p>
              </section>

              <section style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>Input</h4>
                <p style={{ color: "#4b5563", lineHeight: 1.6 }}><RichText>{content.inputSpecification}</RichText></p>
              </section>

              <section style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>Output</h4>
                <p style={{ color: "#4b5563", lineHeight: 1.6 }}><RichText>{content.outputSpecification}</RichText></p>
              </section>

              <section style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>Constraints</h4>
                <div style={{
                  background: "#f8fafc", color: "#0f172a",
                  border: "1px solid #e2e8f0",
                  padding: "0.85rem 1.1rem", borderRadius: "8px",
                  fontFamily: "var(--font-mono, monospace)", fontSize: "0.875rem",
                  overflowX: "auto", margin: 0,
                }}>
                  <RichText style={{ color: "#0f172a" }}>{content.constraints}</RichText>
                </div>
              </section>

              {content.examples.length > 0 && (
                <section>
                  <h4 style={{ color: "#374151", marginBottom: "0.75rem" }}>Examples</h4>
                  {content.examples.map((ex, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "1rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        fontSize: "0.9rem",
                      }}
                    >
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        <div style={{ padding: "0.75rem", borderRight: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                          <div style={{ fontWeight: 700, marginBottom: "0.3rem", color: "#374151" }}>Input {i + 1}</div>
                          <pre style={{ margin: 0, fontFamily: "monospace", color: "#111827" }}>{ex.input}</pre>
                        </div>
                        <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb" }}>
                          <div style={{ fontWeight: 700, marginBottom: "0.3rem", color: "#374151" }}>Output {i + 1}</div>
                          <pre style={{ margin: 0, fontFamily: "monospace", color: "#111827" }}>{ex.output}</pre>
                        </div>
                      </div>
                      {ex.explanation && (
                        <div style={{ padding: "0.6rem 0.75rem", borderTop: "1px solid #e5e7eb", fontSize: "0.85rem", color: "#6b7280" }}>
                          💡 <RichText>{ex.explanation}</RichText>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </>
          ) : (
            <p style={{ color: "#9ca3af" }}>Problem content not found.</p>
          )}
        </div>

        {/* Right: Submission Form */}
        <div>
          <ContestSubmissionForm
            contestId={contestId}
            problemId={problemId}
            problemSignature={signature}
          />
        </div>
      </div>
    </div>
  );
}
