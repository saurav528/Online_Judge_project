"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BoilerplateGenerator } from "@/lib/boilerplate/generator";
import { ProblemSignature } from "@/lib/boilerplate/types";

export type Language = "CPP" | "PYTHON" | "JAVA" | "JAVASCRIPT";

const LANGUAGES = [
  { value: "CPP",        label: "C++ (GCC 14)" },
  { value: "PYTHON",     label: "Python 3.12" },
  { value: "JAVA",       label: "Java 21" },
  { value: "JAVASCRIPT", label: "JavaScript (Node 22)" },
] as const;

const DEFAULT_BOILERPLATES: Record<Language, string> = {
  CPP: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`,
  PYTHON: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()\n`,
  JAVA: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n`,
  JAVASCRIPT: `// Write your code here\nconst fs = require('fs');\n\nfunction main() {\n    // Read input if needed\n    // const input = fs.readFileSync(0, 'utf-8');\n}\n\nmain();\n`,
};

export interface RunResultPayload {
  success: boolean;
  error?: string;
  // Option A (Plain Terminal Log)
  output?: string | null;
  // Option B (Structured Contest Results)
  result?: any;
}

export interface SubmitResultPayload {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  submissionId?: string;
}

export interface CodeWorkspaceProps {
  problemId: string;
  problemSignature?: ProblemSignature;
  onRun: (code: string, language: Language) => Promise<RunResultPayload>;
  onSubmit: (code: string, language: Language) => Promise<SubmitResultPayload>;
  savedCodeKey: string;
  isContestMode?: boolean;
}

// Load from localStorage helper
const getStoredCode = (savedCodeKey: string, lang: Language): string | null => {
  try {
    return localStorage.getItem(`${savedCodeKey}:${lang}`);
  } catch {
    return null;
  }
};

// Save to localStorage helper
const setStoredCode = (savedCodeKey: string, lang: Language, code: string) => {
  try {
    localStorage.setItem(`${savedCodeKey}:${lang}`, code);
  } catch {}
};

export function CodeWorkspace({
  problemSignature,
  onRun,
  onSubmit,
  savedCodeKey,
  isContestMode = false,
}: CodeWorkspaceProps) {
  const [language, setLanguage] = useState<Language>("CPP");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  
  // Results
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<any>(null);
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = getStoredCode(savedCodeKey, "CPP");
    if (stored) {
      setSourceCode(stored);
    } else if (problemSignature) {
      setSourceCode(BoilerplateGenerator.generateStudentBoilerplate("CPP", problemSignature));
    } else {
      setSourceCode(DEFAULT_BOILERPLATES["CPP"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const stored = getStoredCode(savedCodeKey, language);
    if (stored) {
      setSourceCode(stored);
    } else if (problemSignature) {
      setSourceCode(BoilerplateGenerator.generateStudentBoilerplate(language, problemSignature));
    } else {
      setSourceCode(DEFAULT_BOILERPLATES[language]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isClient]);

  const handleCodeChange = useCallback((code: string) => {
    setSourceCode(code);
    setSavedIndicator(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setStoredCode(savedCodeKey, language, code);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2500);
    }, 800);
  }, [savedCodeKey, language]);

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your editor to the default template?")) {
      let boilerplate = "";
      if (problemSignature) {
        boilerplate = BoilerplateGenerator.generateStudentBoilerplate(language, problemSignature);
      } else {
        boilerplate = DEFAULT_BOILERPLATES[language];
      }
      setSourceCode(boilerplate);
      setStoredCode(savedCodeKey, language, boilerplate);
    }
  };

  const handleRun = async () => {
    setRunningCode(true);
    setErrors({});
    setGlobalError("");
    setRunOutput(null);
    setRunResult(null);

    try {
      const res = await onRun(sourceCode, language);
      if (!res.success) {
        setGlobalError(res.error || "Failed to run code.");
      } else {
        if (res.output) {
          setRunOutput(res.output);
        } else if (res.result) {
          setRunResult(res.result);
        }
      }
    } catch {
      setGlobalError("An unexpected error occurred during execution.");
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");

    try {
      const res = await onSubmit(sourceCode, language);
      if (!res.success) {
        if (res.errors) setErrors(res.errors);
        else if (res.error) setGlobalError(res.error);
      }
    } catch {
      setGlobalError("An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.92rem" }}>Code Editor</span>
          {isContestMode && (
            <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#dcfce7", color: "#16a34a", padding: "0.1rem 0.45rem", borderRadius: "999px" }}>Contest</span>
          )}
        </div>
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
            disabled={loading || runningCode}
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
            disabled={loading || runningCode}
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
              disabled={loading || runningCode}
              onClick={handleRun}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.25rem",
                background: runningCode ? "#e5e7eb" : "#f3f4f6",
                color: runningCode ? "#9ca3af" : "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: (loading || runningCode) ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              {runningCode ? <span className="spinner" style={{borderColor: "#9ca3af", borderTopColor: "transparent"}}/> : "▶️ Run Code"}
            </button>
            <button
              type="submit"
              disabled={loading || runningCode}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.5rem",
                background: (loading || runningCode) ? "#9ca3af" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: (loading || runningCode) ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              {loading ? (
                <><span className="spinner" /> Submitting...</>
              ) : (
                <>⚡ {isContestMode ? "Submit to Contest" : "Submit"}</>
              )}
            </button>
          </div>
        </div>

        {/* Structured Results Display (Option B - Contest Mode) */}
        {runResult && (
          <div style={{ margin: "1rem 1.25rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h4 style={{ margin: 0, color: "#111827", fontSize: "0.95rem", fontWeight: 700 }}>Test Result</h4>
              <button 
                type="button" 
                onClick={() => setRunResult(null)}
                style={{ background: "none", border: "none", color: "#858585", cursor: "pointer", fontSize: "0.85rem" }}
              >
                ✕ Close
              </button>
            </div>
            
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

        {/* Plain Terminal Output Display (Option A - Standard Mode) */}
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
