"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BoilerplateGenerator } from "@/lib/boilerplate/generator";
import { ProblemSignature } from "@/lib/boilerplate/types";

interface ContestSubmissionFormProps {
  contestId: string;
  problemId: string;
  problemSignature?: ProblemSignature;
}

type Language = "CPP" | "PYTHON" | "JAVA" | "JAVASCRIPT";

const LANGUAGES = [
  { value: "CPP",        label: "C++ (GCC 14)" },
  { value: "PYTHON",     label: "Python 3.12" },
  { value: "JAVA",       label: "Java 21" },
  { value: "JAVASCRIPT", label: "JavaScript (Node 22)" },
] as const;

function storageKey(contestId: string, problemId: string, lang: Language) {
  return `ummeed:contest:${contestId}:${problemId}:${lang}`;
}
function saveCode(contestId: string, problemId: string, lang: Language, code: string) {
  try { localStorage.setItem(storageKey(contestId, problemId, lang), code); } catch {}
}
function loadCode(contestId: string, problemId: string, lang: Language): string | null {
  try { return localStorage.getItem(storageKey(contestId, problemId, lang)); } catch { return null; }
}

export function ContestSubmissionForm({
  contestId,
  problemId,
  problemSignature,
}: ContestSubmissionFormProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("CPP");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = loadCode(contestId, problemId, "CPP");
    if (stored) setSourceCode(stored);
    else if (problemSignature) setSourceCode(BoilerplateGenerator.generateStudentBoilerplate("CPP", problemSignature));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const stored = loadCode(contestId, problemId, language);
    if (stored) setSourceCode(stored);
    else if (problemSignature) setSourceCode(BoilerplateGenerator.generateStudentBoilerplate(language, problemSignature));
    else setSourceCode("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isClient]);

  const handleCodeChange = useCallback((code: string) => {
    setSourceCode(code);
    setSavedIndicator(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCode(contestId, problemId, language, code);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2500);
    }, 800);
  }, [contestId, problemId, language]);

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/contests/${contestId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, language, sourceCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Submission failed."); setLoading(false); return; }
      router.push(`/submissions/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const lineCount = sourceCode.split("\n").length;

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.92rem" }}>Code Editor</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#dcfce7", color: "#16a34a", padding: "0.1rem 0.45rem", borderRadius: "999px" }}>Contest</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {savedIndicator && <span style={{ fontSize: "0.78rem", color: "#16a34a" }}>✓ Auto-saved</span>}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} disabled={loading}
            style={{ padding: "0.35rem 0.65rem", fontSize: "0.82rem", fontWeight: 600, border: "1.5px solid #e5e7eb", borderRadius: "6px", background: "#fff", color: "#374151", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ margin: "0.75rem 1.25rem 0", padding: "0.7rem 1rem", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "0.88rem" }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "44px", bottom: 0, background: "#f9fafb", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "flex-end", paddingTop: "0.85rem", paddingRight: "8px", userSelect: "none", pointerEvents: "none", overflow: "hidden" }}>
            {Array.from({ length: Math.max(lineCount, 18) }, (_, i) => (
              <span key={i} style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono, monospace)", color: "#d1d5db", lineHeight: "1.65", minHeight: "1.65em" }}>{i + 1}</span>
            ))}
          </div>
          <textarea
            value={sourceCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            rows={20}
            spellCheck={false}
            placeholder="// Write your contest solution here..."
            required
            disabled={loading}
            style={{ display: "block", width: "100%", paddingTop: "0.85rem", paddingBottom: "0.85rem", paddingLeft: "56px", paddingRight: "1.25rem", fontFamily: "var(--font-mono, monospace)", fontSize: "0.875rem", lineHeight: "1.65", border: "none", outline: "none", resize: "vertical", minHeight: "340px", background: "#fdfdfd", color: "#1f2937", boxSizing: "border-box", tabSize: 4 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.25rem", borderTop: "1px solid #f3f4f6", background: "#f9fafb" }}>
          <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{lineCount} lines · Auto-saved locally</span>
          <button type="submit" disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.5rem", background: loading ? "#9ca3af" : "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", transition: "all 150ms ease" }}>
            {loading ? <><span className="spinner" /> Judging...</> : <>⚡ Submit to Contest</>}
          </button>
        </div>
      </form>
    </div>
  );
}


