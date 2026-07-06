import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-utils";
import { SubmissionService } from "@/lib/services/submission";

interface SubmissionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const submission = await SubmissionService.getSubmission(id);
  if (!submission) {
    notFound();
  }

  // Authorization Check: Students can only view their own submissions
  const isOwner = submission.userId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect("/submissions");
  }

  // Determine if we should poll for updates (QUEUED, RUNNING, PENDING)
  const isProcessing =
    submission.status === "PENDING" || submission.status === "QUEUED" || submission.status === "RUNNING";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        fontFamily: "sans-serif",
        color: "#374151",
      }}
    >
      {/* Conditionally inject meta-refresh tag for polling if processing */}
      {isProcessing && <meta httpEquiv="refresh" content="2" />}

      {/* Top Breadcrumb Header */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem 2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
            <Link href="/submissions" style={{ color: "#2563eb", textDecoration: "none" }}>
              &larr; Back to Submissions
            </Link>
          </div>
          <h1 style={{ margin: 0, color: "#111827", fontSize: "1.5rem" }}>
            Submission Details: {submission.problem.title}
          </h1>
          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
            ID: <code>{submission.id}</code>
          </div>
        </div>

        {isProcessing && (
          <div
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#fef3c7",
              color: "#b45309",
              borderRadius: "0.25rem",
              fontWeight: "600",
              fontSize: "0.9rem",
              animation: "pulse 1.5s infinite",
            }}
          >
            ⏳ Processing... Auto-Refreshing
          </div>
        )}
      </div>

      {/* Grid: Left Column stats, Right Column code */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* Left Column: Metadata Details */}
        <div
          style={{
            flex: "1 1 300px",
            backgroundColor: "#ffffff",
            padding: "1.5rem 2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <h3 style={{ margin: 0, borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem", color: "#111827" }}>
            Metadata & Verdict
          </h3>

          <div>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Problem:</span>
            <Link
              href={`/problems/${submission.problem.slug}`}
              style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}
            >
              {submission.problem.title}
            </Link>
          </div>

          <div>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Language:</span>
            <strong>{submission.language}</strong>
          </div>

          <div>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Submitted By:</span>
            <span>{submission.user.name} ({submission.user.email})</span>
          </div>

          <div>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Status:</span>
            <span
              style={{
                display: "inline-block",
                padding: "0.2rem 0.5rem",
                borderRadius: "0.25rem",
                fontSize: "0.85rem",
                fontWeight: "600",
                backgroundColor:
                  submission.status === "COMPLETED"
                    ? "#dcfce7"
                    : submission.status === "RUNNING"
                    ? "#dbeafe"
                    : submission.status === "QUEUED"
                    ? "#fef3c7"
                    : "#f3f4f6",
                color:
                  submission.status === "COMPLETED"
                    ? "#15803d"
                    : submission.status === "RUNNING"
                    ? "#1d4ed8"
                    : submission.status === "QUEUED"
                    ? "#b45309"
                    : "#4b5563",
              }}
            >
              {submission.status}
            </span>
          </div>

          <div>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Verdict:</span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color:
                  submission.verdict === "ACCEPTED"
                    ? "#166534"
                    : submission.verdict === "PENDING"
                    ? "#6b7280"
                    : "#991b1b",
              }}
            >
              {submission.verdict}
            </span>
          </div>

          {submission.status === "COMPLETED" && (
            <>
              <div>
                <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>
                  Execution Time:
                </span>
                <strong>{submission.executionTime} ms</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>
                  Memory Used:
                </span>
                <strong>
                  {submission.memoryUsed ? (submission.memoryUsed / 1024).toFixed(2) : 0} MB
                </strong>
              </div>
            </>
          )}

          <div>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold" }}>Submitted:</span>
            <span style={{ fontSize: "0.9rem" }}>{new Date(submission.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Right Column: Code and Execution Logs */}
        <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Source Code Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem 2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", color: "#111827" }}>Submitted Source Code</h3>
            <pre
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "1rem",
                borderRadius: "0.375rem",
                fontFamily: "monospace",
                fontSize: "0.95rem",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {submission.sourceCode}
            </pre>
          </div>

          {/* Execution outputs (Compile/Runtime logs) */}
          {submission.status === "COMPLETED" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "1.5rem 2rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#111827" }}>Execution Output Logs</h3>

              {submission.compileOutput && (
                <div>
                  <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    Compilation Output:
                  </span>
                  <pre
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: "0.75rem",
                      borderRadius: "0.25rem",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {submission.compileOutput}
                  </pre>
                </div>
              )}

              {submission.runtimeOutput && (
                <div>
                  <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    Runtime Output / Testcase Results:
                  </span>
                  <pre
                    style={{
                      backgroundColor: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #bbf7d0",
                      padding: "0.75rem",
                      borderRadius: "0.25rem",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {submission.runtimeOutput}
                  </pre>
                </div>
              )}

              {submission.errorOutput && (
                <div>
                  <span style={{ display: "block", fontSize: "0.8rem", color: "#6b7280", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    Error Output:
                  </span>
                  <pre
                    style={{
                      backgroundColor: "#fef2f2",
                      color: "#991b1b",
                      border: "1px solid #fca5a5",
                      padding: "0.75rem",
                      borderRadius: "0.25rem",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {submission.errorOutput}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
