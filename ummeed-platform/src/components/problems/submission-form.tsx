"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSubmissionAction, runCodeAction } from "@/app/actions/submissions";
import { BoilerplateGenerator } from "@/lib/boilerplate/generator";
import { ProblemSignature } from "@/lib/boilerplate/types";

interface SubmissionFormProps {
  problemId: string;
  problemSlug?: string;
  problemSignature?: ProblemSignature;
}

const LANGUAGES = [
  { value: "CPP",        label: "C++ (GCC 14)" },
  { value: "PYTHON",     label: "Python 3.12" },
  { value: "JAVA",       label: "Java 21" },
  { value: "JAVASCRIPT", label: "JavaScript (Node 22)" },
] as const;

type Language = (typeof LANGUAGES)[number]["value"];

function storageKey(problemId: string, lang: Language) {
  return `ummeed:code:${problemId}:${lang}`;
}

/** Save code to localStorage (design-time persistence) */
function saveCode(problemId: string, lang: Language, code: string) {
  try { localStorage.setItem(storageKey(problemId, lang), code); } catch {}
}

/** Load code from localStorage */
function loadCode(problemId: string, lang: Language): string | null {
  try { return localStorage.getItem(storageKey(problemId, lang)); } catch { return null; }
}

const VERDICT_DISPLAY: Record<string, { color: string; icon: string; label: string }> = {
  ACCEPTED:           { color: "#16a34a", icon: "✅", label: "Accepted" },
  WRONG_ANSWER:       { color: "#dc2626", icon: "❌", label: "Wrong Answer" },
  TIME_LIMIT_EXCEEDED:{ color: "#d97706", icon: "⏱", label: "Time Limit Exceeded" },
  TLE:                { color: "#d97706", icon: "⏱", label: "Time Limit Exceeded" },
  RUNTIME_ERROR:      { color: "#db2777", icon: "💥", label: "Runtime Error" },
  COMPILATION_ERROR:  { color: "#7c3aed", icon: "⚙️", label: "Compilation Error" },
  PENDING:            { color: "#6b7280", icon: "⏳", label: "Pending" },
};

export function SubmissionForm({ problemId, problemSlug, problemSignature }: SubmissionFormProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("CPP");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const stored = loadCode(problemId, language);
    if (stored) {
      setSourceCode(stored);
    } else if (problemSignature) {
      setSourceCode(BoilerplateGenerator.generateStudentBoilerplate(language, problemSignature));
    } else {
      setSourceCode(BoilerplateGenerator.generateGenericBoilerplate(language));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When language changes, try to load stored code for that language
  useEffect(() => {
    if (!isClient) return;
    const stored = loadCode(problemId, language);
    if (stored) {
      setSourceCode(stored);
    } else if (problemSignature) {
      setSourceCode(BoilerplateGenerator.generateStudentBoilerplate(language, problemSignature));
    } else {
      setSourceCode(BoilerplateGenerator.generateGenericBoilerplate(language));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isClient]);

  // Auto-save on every keystroke (debounced 800ms) — Design Time
  const handleCodeChange = useCallback((code: string) => {
    setSourceCode(code);
    setSavedIndicator(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCode(problemId, language, code);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2500);
    }, 800);
  }, [problemId, language]);

  // Clean up on unmount
  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const handleReset = () => {
    if (problemSignature) {
      const boilerplate = BoilerplateGenerator.generateStudentBoilerplate(language, problemSignature);
      setSourceCode(boilerplate);
      saveCode(problemId, language, boilerplate);
    } else {
      const boilerplate = BoilerplateGenerator.generateGenericBoilerplate(language);
      setSourceCode(boilerplate);
      saveCode(problemId, language, boilerplate);
    }
  };

  const [runLoading, setRunLoading] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");

    const res = await createSubmissionAction({ problemId, language, sourceCode });

    setLoading(false);
    if (!res.success) {
      if (res.errors) setErrors(res.errors as Record<string, string[]>);
      else if (res.error) setGlobalError(res.error);
    } else {
      router.push(`/submissions/${res.submissionId}`);
    }
  };

  const handleRun = async () => {
    setRunLoading(true);
    setRunOutput(null);
    setErrors({});
    setGlobalError("");
    
    const res = await runCodeAction({ problemId, language, sourceCode });
    
    setRunLoading(false);
    
    if (!res.success) {
      setGlobalError(res.error || "Failed to run code.");
      return;
    }
    
    let output = "";
    if (res.status) output += `Status: ${res.status}\n`;
    if (res.time) output += `Time: ${res.time}s\n`;
    if (res.memory) output += `Memory: ${res.memory}KB\n\n`;
    
    if (res.compileOutput) output += `[Compilation Output]\n${res.compileOutput}\n\n`;
    if (res.runtimeOutput) output += `[Runtime Output]\n${res.runtimeOutput}\n\n`;
    if (res.errorOutput) output += `[Error Output]\n${res.errorOutput}\n\n`;
    
    if (!res.compileOutput && !res.runtimeOutput && !res.errorOutput) {
      output += "No output.";
    }
    
    setRunOutput(output.trim());
  };

  const lineCount = sourceCode.split("\n").length;

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 1.25rem",
        borderBottom: "1px solid #f3f4f6",
        background: "#f9fafb",
      }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.92rem" }}>Code Editor</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {savedIndicator && (
            <span style={{ fontSize: "0.78rem", color: "#16a34a", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              ✓ Auto-saved
            </span>
          )}
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            disabled={loading}
            style={{
              padding: "0.35rem 0.65rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              border: "1.5px solid #e5e7eb",
              borderRadius: "6px",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <button
            type="button"
            onClick={handleReset}
            title="Reset to boilerplate"
            style={{
              padding: "0.35rem 0.65rem",
              fontSize: "0.78rem",
              border: "1.5px solid #e5e7eb",
              borderRadius: "6px",
              background: "#fff",
              color: "#6b7280",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {globalError && (
          <div style={{ margin: "0.75rem 1.25rem 0", padding: "0.7rem 1rem", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "0.88rem" }}>
            ⚠️ {globalError}
          </div>
        )}

        {/* Code textarea with line number gutter appearance */}
        <div style={{ position: "relative" }}>
          {/* Line numbers */}
          <div style={{
            position: "absolute",
            top: 0, left: 0,
            width: "44px",
            bottom: 0,
            background: "#f9fafb",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            paddingTop: "0.85rem",
            paddingRight: "8px",
            userSelect: "none",
            pointerEvents: "none",
            overflow: "hidden",
          }}>
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <span key={i} style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono, monospace)", color: "#d1d5db", lineHeight: "1.65", minHeight: "1.65em" }}>
                {i + 1}
              </span>
            ))}
          </div>

          <textarea
            value={sourceCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            rows={22}
            spellCheck={false}
            placeholder={`// Write your ${language === "PYTHON" ? "Python" : language === "JAVA" ? "Java" : language === "JAVASCRIPT" ? "JavaScript" : "C++"} solution here...`}
            required
            disabled={loading}
            style={{
              display: "block",
              width: "100%",
              paddingTop: "0.85rem",
              paddingBottom: "0.85rem",
              paddingLeft: "56px",
              paddingRight: "1.25rem",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: "0.875rem",
              lineHeight: "1.65",
              border: "none",
              outline: "none",
              resize: "vertical",
              minHeight: "380px",
              background: "#fdfdfd",
              color: "#1f2937",
              boxSizing: "border-box",
              tabSize: 4,
            }}
          />
        </div>

        {errors.sourceCode && (
          <div style={{ margin: "0 1.25rem", color: "#dc2626", fontSize: "0.82rem", padding: "0.35rem 0" }}>{errors.sourceCode[0]}</div>
        )}

        {/* Footer bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1.25rem",
          borderTop: "1px solid #f3f4f6",
          background: "#f9fafb",
        }}>
          <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
            {lineCount} lines · Code auto-saved locally
          </span>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              disabled={loading || runLoading}
              onClick={handleRun}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.25rem",
                background: runLoading ? "#e5e7eb" : "#f3f4f6",
                color: runLoading ? "#9ca3af" : "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: (loading || runLoading) ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              {runLoading ? <span className="spinner" style={{borderColor: "#9ca3af", borderTopColor: "transparent"}}/> : "▶️ Run Code"}
            </button>
            <button
              type="submit"
              disabled={loading || runLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.5rem",
                background: (loading || runLoading) ? "#9ca3af" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: (loading || runLoading) ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              {loading ? (
                <><span className="spinner" /> Submitting...</>
              ) : (
                <>⚡ Submit</>
              )}
            </button>
          </div>
        </div>

        {/* Run Output Terminal */}
        {runOutput && (
          <div style={{
            background: "#1e1e1e",
            color: "#d4d4d4",
            padding: "1rem 1.25rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.85rem",
            borderTop: "1px solid #333",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#858585" }}>
              <span style={{ fontWeight: 600 }}>Terminal Output</span>
              <button 
                type="button" 
                onClick={() => setRunOutput(null)}
                style={{ background: "none", border: "none", color: "#858585", cursor: "pointer", fontSize: "0.85rem" }}
              >
                ✕ Close
              </button>
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{runOutput}</pre>
          </div>
        )}
      </form>
    </div>
  );
}
