import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/config/db";
import { getProblemContent } from "@/lib/problems-fs";
import Link from "next/link";
import { SubmissionForm } from "@/components/problems/submission-form";
import { ProblemSubmissions } from "@/components/problems/problem-submissions";
import { AIHintPanel } from "@/components/problems/ai-hint-panel";
import { TabPanel } from "@/components/ui/tab-panel";
import { SEEDED_SIGNATURES } from "@/lib/services/executor";
import { requireAuth } from "@/lib/auth/auth-utils";
import { RichText } from "@/components/rich-text";

export default async function StudentProblemDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const user = await requireAuth();

  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: { tags: true },
  });

  if (!problem || !problem.published) notFound();

  const fileContent = await getProblemContent(slug);
  if (!fileContent) notFound();

  const submissionCount = await prisma.submission.count({
    where: { problemId: problem.id, userId: user.id },
  });

  const solved = await prisma.submission.findFirst({
    where: { problemId: problem.id, userId: user.id, verdict: "ACCEPTED" },
  });

  const DIFF: Record<string, { color: string; bg: string }> = {
    EASY:   { color: "#16a34a", bg: "#dcfce7" },
    MEDIUM: { color: "#d97706", bg: "#fef3c7" },
    HARD:   { color: "#dc2626", bg: "#fee2e2" },
  };
  const diff = DIFF[problem.difficulty] ?? DIFF.EASY;

  const statementContent = (
    <div style={{ color: "#374151", lineHeight: 1.7 }}>
      {/* Problem Statement */}
      <section style={{ marginBottom: "1.75rem" }}>
        <h3 style={{ color: "#111827", fontSize: "1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Problem Statement</h3>
        <p style={{ fontSize: "0.95rem" }}><RichText>{fileContent.statement}</RichText></p>
      </section>

      {/* Input / Output Specs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>
        <div>
          <h3 style={{ color: "#111827", fontSize: "1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Input Format</h3>
          <p style={{ fontSize: "0.9rem" }}><RichText>{fileContent.inputSpecification}</RichText></p>
        </div>
        <div>
          <h3 style={{ color: "#111827", fontSize: "1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Output Format</h3>
          <p style={{ fontSize: "0.9rem" }}><RichText>{fileContent.outputSpecification}</RichText></p>
        </div>
      </div>

      {/* Constraints */}
      <section style={{ marginBottom: "1.75rem" }}>
        <h3 style={{ color: "#111827", fontSize: "1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Constraints</h3>
        <div style={{
          background: "#f8fafc", color: "#0f172a",
          border: "1px solid #e2e8f0",
          padding: "0.85rem 1.1rem", borderRadius: "8px",
          fontFamily: "var(--font-mono, monospace)", fontSize: "0.875rem",
          overflowX: "auto", margin: 0,
        }}>
          <RichText style={{ color: "#0f172a" }}>{fileContent.constraints}</RichText>
        </div>
      </section>

      {/* Examples */}
      {fileContent.examples && fileContent.examples.length > 0 && (
        <section style={{ marginBottom: "1.75rem" }}>
          <h3 style={{ color: "#111827", fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Examples</h3>
          {fileContent.examples
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((ex, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #e5e7eb", borderRadius: "10px",
                  overflow: "hidden", marginBottom: "1rem",
                }}
              >
                <div style={{ padding: "0.5rem 1rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: 700, color: "#6b7280" }}>
                  Example {idx + 1}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div style={{ padding: "0.85rem 1rem", borderRight: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", marginBottom: "0.35rem", textTransform: "uppercase" }}>Input</div>
                    <pre style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.875rem", color: "#1f2937" }}>{ex.input}</pre>
                  </div>
                  <div style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", marginBottom: "0.35rem", textTransform: "uppercase" }}>Output</div>
                    <pre style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.875rem", color: "#1f2937" }}>{ex.output}</pre>
                  </div>
                </div>
                {ex.explanation && (
                  <div style={{ padding: "0.65rem 1rem", background: "#f9fafb", borderTop: "1px solid #e5e7eb", fontSize: "0.85rem", color: "#4b5563" }}>
                    💡 <strong>Explanation:</strong> {ex.explanation}
                  </div>
                )}
              </div>
            ))}
        </section>
      )}

      {fileContent.explanation && (
        <section>
          <h3 style={{ color: "#111827", fontSize: "1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Explanation</h3>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{fileContent.explanation}</p>
        </section>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ marginBottom: "0.5rem", fontSize: "0.82rem" }}>
          <Link href="/problems" style={{ color: "#1a56db", textDecoration: "none", fontWeight: 500 }}>
            ← Problems
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem", color: "#111827", fontSize: "1.4rem", fontWeight: 800 }}>
              {problem.title}
            </h1>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{
                fontSize: "0.78rem", fontWeight: 700, padding: "0.2rem 0.65rem",
                borderRadius: "999px", background: diff.bg, color: diff.color,
              }}>
                {problem.difficulty}
              </span>
              {problem.tags.map((t) => (
                <span key={t.id} style={{ fontSize: "0.75rem", background: "#f3f4f6", color: "#4b5563", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                  {t.name}
                </span>
              ))}
              {solved && (
                <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "0.2rem 0.65rem", borderRadius: "999px", background: "#dcfce7", color: "#16a34a" }}>
                  ✓ Solved
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.82rem", color: "#9ca3af" }}>
            <span>⏱ {problem.timeLimit} ms</span>
            <span>💾 {problem.memoryLimit} MB</span>
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: "1.25rem", alignItems: "start" }}>
        {/* Left: Problem statement + Submissions tab + AI Assistant */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <TabPanel
            tabs={[
              { id: "statement",   label: "Problem",     icon: "📋" },
              { id: "submissions", label: "My Submissions", icon: "📜", count: submissionCount },
              { id: "ai_hint",     label: "AI Hint",     icon: "🤖" },
            ]}
            defaultTab="statement"
          >
            {{
              statement: statementContent,
              submissions: <ProblemSubmissions problemId={problem.id} userId={user.id} />,
              ai_hint: <AIHintPanel problemId={problem.id} problemSlug={problem.slug} />,
            }}
          </TabPanel>
        </div>

        {/* Right: Code editor */}
        <div style={{ position: "sticky", top: "80px" }}>
          <SubmissionForm
            problemId={problem.id}
            problemSlug={problem.slug}
            problemSignature={fileContent.signature || SEEDED_SIGNATURES[problem.slug]}
          />
        </div>
      </div>
    </div>
  );
}

