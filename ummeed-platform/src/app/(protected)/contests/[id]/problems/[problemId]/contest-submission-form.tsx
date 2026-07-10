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

const DEFAULT_BOILERPLATES: Record<Language, string> = {
  CPP: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`,
  PYTHON: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()\n`,
  JAVA: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n`,
  JAVASCRIPT: `// Write your code here\nconst fs = require('fs');\n\nfunction main() {\n    // Read input if needed\n    // const input = fs.readFileSync(0, 'utf-8');\n}\n\nmain();\n`,
};

export function ContestSubmissionForm({
  contestId,
  problemId,
  problemSignature,
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

  useEffect(() => {
    setIsClient(true);
    const stored = loadCode(contestId, problemId, "CPP");
    if (stored) setSourceCode(stored);
    else if (problemSignature) setSourceCode(BoilerplateGenerator.generateStudentBoilerplate("CPP", problemSignature));
    else setSourceCode(DEFAULT_BOILERPLATES["CPP"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const stored = loadCode(contestId, problemId, language);
    if (stored) setSourceCode(stored);
    else if (problemSignature) setSourceCode(BoilerplateGenerator.generateStudentBoilerplate(language, problemSignature));
    else setSourceCode(DEFAULT_BOILERPLATES[language]);
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
          {savedIndicator && <span style={{ fontSize: "0.78rem", color: "#16a34a" }}>✓ Auto-saved</span>}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} disabled={loading || runningCode}
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
            disabled={loading || runningCode}
            style={{ display: "block", width: "100%", paddingTop: "0.85rem", paddingBottom: "0.85rem", paddingLeft: "56px", paddingRight: "1.25rem", fontFamily: "var(--font-mono, monospace)", fontSize: "0.875rem", lineHeight: "1.65", border: "none", outline: "none", resize: "vertical", minHeight: "340px", background: "#fdfdfd", color: "#1f2937", boxSizing: "border-box", tabSize: 4 }}
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
              {runResult.time && <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>⏱️ {Math.round(parseFloat(runResult.time) * 1000)} ms</span>}
              {runResult.memory && <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>💾 {runResult.memory} KB</span>}
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
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.5rem", background: (loading || runningCode) ? "#9ca3af" : "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem", cursor: (loading || runningCode) ? "not-allowed" : "pointer", transition: "all 150ms ease" }}>
              {loading ? <><span className="spinner" /> Submitting...</> : <>⚡ Submit to Contest</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


