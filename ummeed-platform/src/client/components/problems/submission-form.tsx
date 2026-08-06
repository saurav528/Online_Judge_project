"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { createSubmissionAction, runCodeAction } from "@/server/actions/submissions";
import { BoilerplateGenerator } from "@/server/services/boilerplate/generator";
import { ProblemSignature } from "@/server/services/boilerplate/types";

interface SubmissionFormProps {
  problemId: string;
  problemSlug?: string;
  problemSignature?: ProblemSignature;
  preloadedBoilerplate?: Record<string, string>;
}

const LANGUAGES = [
  { value: "CPP",        label: "C++ (GCC 14)" },
  { value: "PYTHON",     label: "Python 3.12" },
  { value: "JAVA",       label: "Java 21" },
  { value: "JAVASCRIPT", label: "JavaScript (Node 22)" },
] as const;

type Language = (typeof LANGUAGES)[number]["value"];

const MONACO_LANGUAGES: Record<Language, string> = {
  CPP: "cpp",
  PYTHON: "python",
  JAVA: "java",
  JAVASCRIPT: "javascript",
};

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
  ACCEPTED:           { color: "#16a34a", icon: "", label: "Accepted" },
  WRONG_ANSWER:       { color: "#dc2626", icon: "", label: "Wrong Answer" },
  TIME_LIMIT_EXCEEDED:{ color: "#d97706", icon: "", label: "Time Limit Exceeded" },
  TLE:                { color: "#d97706", icon: "", label: "Time Limit Exceeded" },
  RUNTIME_ERROR:      { color: "#db2777", icon: "", label: "Runtime Error" },
  COMPILATION_ERROR:  { color: "#7c3aed", icon: "", label: "Compilation Error" },
  PENDING:            { color: "#6b7280", icon: "", label: "Pending" },
};

export function SubmissionForm({ problemId, problemSlug, problemSignature, preloadedBoilerplate }: SubmissionFormProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("CPP");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isClient, setIsClient] = useState(false);

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

  // Hydrate on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // When language changes or boilerplate props load asynchronously, set source code
  useEffect(() => {
    if (!isClient) return;
    const stored = loadCode(problemId, language);
    if (stored) {
      setSourceCode(stored);
    } else {
      setSourceCode(getBoilerplateCode(language));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isClient, problemSignature, preloadedBoilerplate]);

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
  const [runResult, setRunResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");

    const res = await createSubmissionAction({ problemId, language, sourceCode });

    setLoading(false);
    if (!res.success) {
      if ((res as any).requireAuth) {
        setShowAuthModal(true);
      } else if (res.errors) {
        setErrors(res.errors as Record<string, string[]>);
      } else if (res.error) {
        setGlobalError(res.error);
      }
    } else {
      router.push(`/submissions/${res.submissionId}`);
    }
  };

  const handleRun = async () => {
    setRunLoading(true);
    setRunResult(null);
    setErrors({});
    setGlobalError("");
    
    const res = await runCodeAction({ problemId, language, sourceCode });
    
    setRunLoading(false);
    
    if (!res.success) {
      if ((res as any).requireAuth) {
        setShowAuthModal(true);
      } else {
        setGlobalError(res.error || "Failed to run code.");
      }
      return;
    }
    
    setRunResult(res);
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
              border: "1.5px solid var(--gray-200)",
              borderRadius: "6px",
              background: "var(--surface-card)",
              color: "var(--gray-500)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {globalError && (
          <div style={{ margin: "0.75rem 1.25rem 0", padding: "0.7rem 1rem", background: "var(--verdict-wa-bg)", color: "var(--brand-red)", border: "1px solid var(--brand-red)", borderRadius: "8px", fontSize: "0.88rem" }}>
            {globalError}
          </div>
        )}

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
                background: runLoading ? "var(--gray-200)" : "var(--gray-100)",
                color: runLoading ? "var(--gray-500)" : "var(--gray-800)",
                border: "1px solid var(--gray-300)",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: (loading || runLoading) ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              {runLoading ? <span className="spinner" style={{borderColor: "var(--gray-400)", borderTopColor: "transparent"}}/> : "Run Code"}
            </button>
            <button
              type="submit"
              disabled={loading || runLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.5rem",
                background: (loading || runLoading) ? "var(--gray-300)" : "var(--brand-primary)",
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
                <>Submit</>
              )}
            </button>
          </div>
        </div>

        {/* Run Output Test Cases Panel */}
        {runResult && (
          <div style={{
            background: "#ffffff",
            color: "var(--gray-900)",
            padding: "1.25rem",
            fontSize: "0.85rem",
            borderTop: "1px solid var(--gray-200)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--gray-800)", fontSize: "0.95rem" }}>Execution Results</span>
              <button 
                type="button" 
                onClick={() => setRunResult(null)}
                style={{ background: "none", border: "none", color: "var(--gray-500)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
              >
                Close
              </button>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ 
                fontWeight: 700, fontSize: "0.82rem", padding: "0.25rem 0.75rem", borderRadius: "999px",
                backgroundColor: runResult.statusId === 3 ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                color: runResult.statusId === 3 ? "#16a34a" : "#ef4444"
              }}>
                {runResult.statusDescription || "Finished"}
              </span>
              {runResult.time && <span style={{ fontSize: "0.82rem", color: "var(--gray-500)", fontWeight: 600 }}>{Math.round(parseFloat(runResult.time) * 1000)} ms</span>}
              {runResult.memory && <span style={{ fontSize: "0.82rem", color: "var(--gray-500)", fontWeight: 600 }}>{runResult.memory} KB</span>}
            </div>

            {runResult.compileOutput && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.4rem" }}>Compilation Output</div>
                <pre style={{ margin: 0, padding: "0.75rem", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", overflowX: "auto", whiteSpace: "pre-wrap", border: "1px solid #fca5a5" }}>{runResult.compileOutput}</pre>
              </div>
            )}

            {runResult.stderr && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.4rem" }}>Runtime Error</div>
                <pre style={{ margin: 0, padding: "0.75rem", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", overflowX: "auto", whiteSpace: "pre-wrap", border: "1px solid #fca5a5" }}>{runResult.stderr}</pre>
              </div>
            )}

            {runResult.testcases && runResult.testcases.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {runResult.testcases.map((tc: any, index: number) => {
                  const stdoutLines = runResult.stdout ? runResult.stdout.trim().split("\n") : [];
                  const actualOutput = stdoutLines[index] || "";
                  const isCorrect = actualOutput.trim() === tc.expected.trim();
                  
                  return (
                    <div key={index} style={{ border: "1px solid var(--gray-200)", borderRadius: "8px", overflow: "hidden", fontSize: "0.85rem", background: "#ffffff" }}>
                      {/* Case Header */}
                      <div style={{ 
                        padding: "0.6rem 0.85rem", 
                        background: "var(--gray-50)", 
                        borderBottom: "1px solid var(--gray-200)",
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center" 
                      }}>
                        <span style={{ fontWeight: 700, color: "var(--gray-800)" }}>Test Case {index + 1}</span>
                        <span style={{ 
                          fontWeight: 700, 
                          color: isCorrect ? "#16a34a" : "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}>
                          {isCorrect ? "✓ Passed" : "✗ Failed"}
                        </span>
                      </div>
                      
                      {/* Case Details */}
                      <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--gray-500)", marginBottom: "0.25rem", fontSize: "0.78rem" }}>Input</div>
                          <pre style={{ margin: 0, padding: "0.5rem", background: "var(--gray-50)", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--gray-800)", border: "1px solid var(--gray-200)" }}>{tc.input}</pre>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--gray-500)", marginBottom: "0.25rem", fontSize: "0.78rem" }}>Expected Output</div>
                            <pre style={{ margin: 0, padding: "0.5rem", background: "var(--gray-50)", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--gray-800)", border: "1px solid var(--gray-200)" }}>{tc.expected}</pre>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--gray-500)", marginBottom: "0.25rem", fontSize: "0.78rem" }}>Your Output</div>
                            <pre style={{ 
                              margin: 0, 
                              padding: "0.5rem", 
                              background: isCorrect ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", 
                              borderRadius: "6px", 
                              fontFamily: "var(--font-mono)", 
                              fontSize: "0.8rem", 
                              color: isCorrect ? "#16a34a" : "#ef4444", 
                              fontWeight: 600,
                              border: isCorrect ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)"
                            }}>{actualOutput || "(No output)"}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Auth Required Modal Overlay for Guests */}
      {showAuthModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "2.25rem 2rem",
            maxWidth: "420px",
            width: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔒</div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#111827", fontWeight: 800 }}>
              Authentication Required
            </h3>
            <p style={{ margin: "0 0 1.5rem 0", color: "#6b7280", fontSize: "0.92rem", lineHeight: 1.5 }}>
              Please log in or create an account to run test cases and submit code solutions.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{ padding: "0.5rem 1.1rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f3f4f6", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem" }}
              >
                Cancel
              </button>
              <Link
                href="/login"
                style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "var(--brand-primary)", color: "#ffffff", textDecoration: "none", fontWeight: 700, fontSize: "0.88rem" }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#111827", color: "#ffffff", textDecoration: "none", fontWeight: 700, fontSize: "0.88rem" }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
