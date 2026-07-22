"use client";

import React, { useState } from "react";
import { RichText } from "@/components/rich-text";

interface AIHintPanelProps {
  problemId: string;
  problemSlug: string;
}

const LANGUAGES = [
  { value: "CPP",        label: "C++ (GCC 14)" },
  { value: "PYTHON",     label: "Python 3.12" },
  { value: "JAVA",       label: "Java 21" },
  { value: "JAVASCRIPT", label: "JavaScript (Node 22)" },
] as const;

type Language = (typeof LANGUAGES)[number]["value"];

function getStoredCode(problemId: string, lang: Language): string {
  try {
    return localStorage.getItem(`ummeed:code:${problemId}:${lang}`) || "";
  } catch {
    return "";
  }
}

export function AIHintPanel({ problemId, problemSlug }: AIHintPanelProps) {
  const [language, setLanguage] = useState<Language>("CPP");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateHint = async () => {
    setLoading(true);
    setError(null);
    setHint(null);

    const sourceCode = getStoredCode(problemId, language);

    try {
      const res = await fetch(`/api/problems/${problemSlug}/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode, language }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate hint");
      }

      setHint(data.hint);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ color: "#374151", minHeight: "260px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        background: "linear-gradient(135deg, var(--gray-100), var(--gray-50))",
        border: "1px solid var(--gray-300)",
        borderRadius: "12px",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}>
        <div>
          <h4 style={{ margin: 0, color: "var(--brand-primary)", fontSize: "0.95rem", fontWeight: 700 }}>
            AI Coding Tutor
          </h4>
          <p style={{ margin: "0.15rem 0 0", color: "var(--gray-400)", fontSize: "0.78rem" }}>
            Stuck? Get personalized algorithmic hints without spoiling the answer.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{
              padding: "0.35rem 0.65rem",
              fontSize: "0.8rem",
              border: "1.5px solid var(--gray-300)",
              borderRadius: "6px",
              background: "var(--surface-card)",
              color: "var(--gray-900)",
              fontWeight: 600,
            }}
          >
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <button
            onClick={handleGenerateHint}
            disabled={loading}
            className="btn"
            style={{
              background: "var(--brand-primary)",
              color: "var(--gray-50)",
              padding: "0.35rem 1rem",
              fontSize: "0.82rem",
              borderRadius: "6px",
            }}
          >
            {loading ? "Thinking..." : "Get Hint →"}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", gap: "1rem" }}>
          <div className="spinner" style={{ borderTopColor: "var(--brand-primary)", width: "24px", height: "24px" }} />
          <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", animation: "pulse-dot 1.2s infinite" }}>
            Analyzing your current solution code and statement...
          </p>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ fontSize: "0.88rem" }}>
          {error}
        </div>
      )}

      {hint && (
        <div className="fade-in" style={{
          padding: "1.25rem 1.5rem",
          background: "#fafafa",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          lineHeight: 1.7,
        }}>
          <div style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
            borderBottom: "1px solid #f3f4f6",
            paddingBottom: "0.4rem",
            display: "flex",
            justifyContent: "space-between",
          }}>
            <span>Tutor Feedback</span>
            <span>gemini-3.5-flash</span>
          </div>
          <div style={{
            fontSize: "0.92rem",
            color: "#1f2937",
          }}>
            <RichText>{hint}</RichText>
          </div>
        </div>
      )}
    </div>
  );
}
