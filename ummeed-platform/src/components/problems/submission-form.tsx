"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmissionAction } from "@/app/actions/submissions";

interface SubmissionFormProps {
  problemId: string;
}

export function SubmissionForm({ problemId }: SubmissionFormProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<"CPP" | "PYTHON" | "JAVA" | "JAVASCRIPT">("CPP");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");

    const res = await createSubmissionAction({
      problemId,
      language,
      sourceCode,
    });

    setLoading(false);
    if (!res.success) {
      if (res.errors) {
        setErrors(res.errors as Record<string, string[]>);
      } else if (res.error) {
        setGlobalError(res.error);
      }
    } else {
      router.push(`/submissions/${res.submissionId}`);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
        fontFamily: "sans-serif",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>Submit Solution</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {globalError && (
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              borderRadius: "0.25rem",
              fontSize: "0.9rem",
            }}
          >
            {globalError}
          </div>
        )}

        <div>
          <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Select Language
          </label>
          <select
            value={language}
            onChange={(e: any) => setLanguage(e.target.value)}
            style={{ padding: "0.5rem", minWidth: "150px", fontSize: "0.95rem" }}
            disabled={loading}
          >
            <option value="CPP">C++ (GCC 14)</option>
            <option value="PYTHON">Python (3.12)</option>
            <option value="JAVA">Java (OpenJDK 21)</option>
            <option value="JAVASCRIPT">JavaScript (Node.js 22)</option>
          </select>
          {errors.language && (
            <div style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.language[0]}</div>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Source Code
          </label>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            rows={15}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontFamily: "monospace",
              fontSize: "0.95rem",
              boxSizing: "border-box",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
            placeholder="// Type or paste your code here (minimum 10 characters)..."
            required
            disabled={loading}
          />
          {errors.sourceCode && (
            <div style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.sourceCode[0]}</div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "0",
              borderRadius: "0.25rem",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Code"}
          </button>
        </div>
      </form>
    </div>
  );
}
