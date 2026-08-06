"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { BoilerplateGenerator } from "@/lib/boilerplate/generator";
import { ProblemSignature } from "@/lib/boilerplate/types";

interface ContestSubmissionFormProps {
  contestId: string;
  problemId: string;
  problemSignature?: ProblemSignature;
  preloadedBoilerplate?: Record<string, string>;
}

type Language = "CPP" | "PYTHON" | "JAVA" | "JAVASCRIPT";

const LANGUAGES = [
  { value: "CPP",        label: "C++ (GCC 14)" },
  { value: "PYTHON",     label: "Python 3.12" },
  { value: "JAVA",       label: "Java 21" },
  { value: "JAVASCRIPT", label: "JavaScript (Node 22)" },
] as const;

const MONACO_LANGUAGES: Record<Language, string> = {
  CPP: "cpp",
  PYTHON: "python",
  JAVA: "java",
  JAVASCRIPT: "javascript",
};

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
  preloadedBoilerplate,
}: ContestSubmissionFormProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("CPP");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to load boilerplate for selected language
  const getBoilerplateCode = (lang: Language) => {
    if (preloadedBoilerplate && preloadedBoilerplate[lang]) {
      return preloadedBoilerplate[lang];
    }
    if (problemSignature) {
      return BoilerplateGenerator.generateStudentBoilerplate(lang, problemSignature);
    }
    return BoilerplateGenerator.generateGenericBoilerplate(lang);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const stored = loadCode(contestId, problemId, language);
    if (stored) setSourceCode(stored);
    else setSourceCode(getBoilerplateCode(language));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isClient, problemSignature, preloadedBoilerplate]);

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

  const handleRunCode = async () => {
    setRunningCode(true);
    setError("");
    setRunResult(null);
    try {
      const res = await fetch(`/api/contests/${contestId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, language, sourceCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Execution failed.");
      } else {
        setRunResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRunningCode(false);
    }
  };

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
          {savedIndicator && <span style={{ fontSize: "0.78rem", color: "var(--brand-primary)" }}>Auto-saved</span>}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} disabled={loading || runningCode}
            style={{ padding: "0.35rem 0.65rem", fontSize: "0.82rem", fontWeight: 600, border: "1.5px solid #e5e7eb", borderRadius: "6px", background: "#fff", color: "#374151", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ margin: "0.75rem 1.25rem 0", padding: "0.7rem 1rem", background: "var(--verdict-wa-bg)", color: "var(--verdict-wa)", border: "1px solid var(--brand-red)", borderRadius: "8px", fontSize: "0.88rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Monaco Code Editor */}
        <div style={{ borderRadius: "0 0 8px 8px", overflow: "hidden", borderTop: "1px solid #1e293b", background: "#1e1e1e" }}>
          <Editor
            height="440px"
            language={MONACO_LANGUAGES[language]}
            value={sourceCode}
            onChange={(value) => handleCodeChange(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              autoIndent: "full",
              formatOnType: true,
              padding: { top: 12, bottom: 12 },
              lineNumbersMinChars: 3,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            }}
          />
        </div>

        {/* Run Results */}
        {runResult && (
          <div style={{ margin: "1rem 1.25rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb" }}>
            <h4 style={{ margin: "0 0 0.75rem 0", color: "#111827", fontSize: "0.95rem", fontWeight: 700 }}>Test Result</h4>
            
            <div style={{ display: "flex", gap: "1rem", marginBottom: "0.85rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ 
                fontWeight: 700, fontSize: "0.85rem", padding: "0.2rem 0.6rem", borderRadius: "999px",
                backgroundColor: runResult.statusId === 3 ? "#dcfce7" : "#fee2e2",
                color: runResult.statusId === 3 ? "#15803d" : "#ef4444"
              }}>
                {runResult.statusDescription || "Finished"}
              </span>
              {runResult.time && <span style={{ fontSize: "0.82rem", color: "var(--gray-500)" }}>{Math.round(parseFloat(runResult.time) * 1000)} ms</span>}
              {runResult.memory && <span style={{ fontSize: "0.82rem", color: "var(--gray-500)" }}>{runResult.memory} KB</span>}
            </div>

            {runResult.compileOutput && (
              <div style={{ marginBottom: "0.85rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.3rem" }}>Compiler Output</div>
                <pre style={{ margin: 0, padding: "0.5rem", background: "#fef2f2", color: "#991b1b", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", overflowX: "auto", whiteSpace: "pre-wrap" }}>{runResult.compileOutput}</pre>
              </div>
            )}

            {runResult.stderr && (
              <div style={{ marginBottom: "0.85rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.3rem" }}>Runtime Error Log</div>
                <pre style={{ margin: 0, padding: "0.5rem", background: "#fef2f2", color: "#991b1b", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", overflowX: "auto", whiteSpace: "pre-wrap" }}>{runResult.stderr}</pre>
              </div>
            )}

            {runResult.testcases && runResult.testcases.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {runResult.testcases.map((tc: any, index: number) => {
                  const stdoutLines = runResult.stdout.trim().split("\n");
                  const actualOutput = stdoutLines[index] || stdoutLines.join("\n") || "";
                  return (
                    <div key={index} style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", fontSize: "0.82rem" }}>
                      <div style={{ padding: "0.5rem 0.75rem", background: "#f3f4f6", fontWeight: 700, color: "#374151" }}>Example {index + 1}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", padding: "0.5rem 0.75rem", backgroundColor: "#fff" }}>
                        <div>
                          <div style={{ fontWeight: 600, color: "#6b7280", marginBottom: "0.2rem" }}>Input</div>
                          <pre style={{ margin: 0, padding: "0.25rem", background: "#f9fafb", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{tc.input}</pre>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#6b7280", marginBottom: "0.2rem" }}>Expected Output</div>
                          <pre style={{ margin: 0, padding: "0.25rem", background: "#f9fafb", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{tc.expected}</pre>
                        </div>
                      </div>
                      {runResult.statusId !== 6 && (
                        <div style={{ padding: "0.5rem 0.75rem", borderTop: "1px solid #f3f4f6", backgroundColor: "#fff" }}>
                          <div style={{ fontWeight: 600, color: "#6b7280", marginBottom: "0.2rem" }}>Your Output</div>
                          <pre style={{ margin: 0, padding: "0.25rem", background: "#f9fafb", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: actualOutput.trim() === tc.expected.trim() ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{actualOutput}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.25rem", borderTop: "1px solid #f3f4f6", background: "#f9fafb" }}>
          <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{lineCount} lines · Auto-saved locally</span>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" onClick={handleRunCode} disabled={loading || runningCode}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", background: "transparent", border: "1.5px solid #d1d5db", borderRadius: "8px", color: "#374151", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.9rem", cursor: (loading || runningCode) ? "not-allowed" : "pointer", transition: "all 150ms ease" }}>
              {runningCode ? "Running..." : "▶ Run Code"}
            </button>
            <button type="submit" disabled={loading || runningCode}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.5rem", background: (loading || runningCode) ? "#9ca3af" : "var(--brand-primary)", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem", cursor: (loading || runningCode) ? "not-allowed" : "pointer", transition: "all 150ms ease" }}>
              {loading ? <><span className="spinner" /> Submitting...</> : <>Submit to Contest</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


