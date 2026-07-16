"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { SubmissionForm } from "@/components/problems/submission-form";
import { TabPanel } from "@/components/ui/tab-panel";

interface DuelState {
  id: string;
  status: "MATCHMAKING" | "PLAYING" | "FINISHED" | "CANCELLED";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  player1Id: string;
  player2Id: string | null;
  player1Score: number;
  player2Score: number;
  problemId: string | null;
  problem: { title: string; slug: string; difficulty: string } | null;
  startedAt: string | null;
  endsAt: string | null;
  winnerId: string | null;
  player1Name: string;
  player1Rating: number;
  player2Name: string;
  player2Rating: number;
  isPlayer1: boolean;
  isPlayer2: boolean;
}

interface ProblemContent {
  statement: string;
  inputSpecification: string;
  outputSpecification: string;
  constraints: string;
  examples: Array<{ input: string; output: string; explanation?: string; displayOrder: number }>;
  explanation?: string;
  signature?: any;
}

export default function DuelArenaPage() {
  const router = useRouter();
  const { roomId } = useParams() as { roomId: string };
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [problemContent, setProblemContent] = useState<ProblemContent | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch duel status and poll
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/duels/${roomId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load duel");

        setDuel(data);

        // Fetch problem filesystem content if we haven't already
        if (data.problem && !problemContent) {
          const pRes = await fetch(`/api/problems/${data.problem.slug}`);
          // Wait! Let's build a quick client helper to fetch the problem statement,
          // or we can fetch it directly from a API route.
          // Wait! Do we have a GET /api/problems/[slug] endpoint? Let's check or build it!
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, [roomId, problemContent]);

  // Fetch problem content once problem slug is available
  useEffect(() => {
    const slug = duel?.problem?.slug;
    if (!slug) return;

    async function fetchProblem() {
      try {
        const res = await fetch(`/api/problems/${slug}`);
        if (!res.ok) return;
        const data = await res.json();
        setProblemContent(data);
      } catch {
        // ignore
      }
    }
    fetchProblem();
  }, [duel?.problem?.slug]);

  // 2. Timer countdown
  useEffect(() => {
    if (!duel?.endsAt || duel.status !== "PLAYING") return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(duel.endsAt!).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [duel?.endsAt, duel?.status]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div className="spinner" style={{ width: "32px", height: "32px", borderTopColor: "#6d28d9" }} />
      </div>
    );
  }

  if (error || !duel) {
    return (
      <div className="alert alert-error" style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <span>⚠️</span> {error || "Duel not found"}
      </div>
    );
  }

  const isMyScore100 = duel.isPlayer1 ? duel.player1Score === 100 : duel.player2Score === 100;
  const isOpponentScore100 = duel.isPlayer1 ? duel.player2Score === 100 : duel.player1Score === 100;

  const opponentName = duel.isPlayer1 ? duel.player2Name : duel.player1Name;
  const opponentScore = duel.isPlayer1 ? duel.player2Score : duel.player1Score;
  const myScore = duel.isPlayer1 ? duel.player1Score : duel.player2Score;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "1250px", margin: "0 auto", width: "100%", position: "relative" }}>
      
      {/* 🏆 Duel Winner Backdrop Overlay */}
      {duel.status === "FINISHED" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 300ms ease",
        }}>
          <div className="card" style={{
            width: "100%", maxWidth: "440px", padding: "2.5rem 2rem", textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            background: "#fff", borderRadius: "16px",
          }}>
            {duel.winnerId === (duel.isPlayer1 ? duel.player1Id : duel.player2Id) ? (
              <div>
                <span style={{ fontSize: "4.5rem" }}>🎉</span>
                <h2 style={{ fontSize: "1.8rem", color: "#16a34a", fontWeight: 800, margin: "1rem 0 0.5rem" }}>
                  VICTORY!
                </h2>
                <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "2rem" }}>
                  You solved the problem fastest and won the match! New Rating Elo points gained.
                </p>
              </div>
            ) : duel.winnerId === null ? (
              <div>
                <span style={{ fontSize: "4.5rem" }}>🤝</span>
                <h2 style={{ fontSize: "1.8rem", color: "#d97706", fontWeight: 800, margin: "1rem 0 0.5rem" }}>
                  DRAW!
                </h2>
                <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "2rem" }}>
                  Time ran out! Both players ended with the same score.
                </p>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: "4.5rem" }}>😢</span>
                <h2 style={{ fontSize: "1.8rem", color: "#dc2626", fontWeight: 800, margin: "1rem 0 0.5rem" }}>
                  DEFEAT
                </h2>
                <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "2rem" }}>
                  Your opponent got 100% correct code before you. Keep practicing to bounce back!
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link href="/duels" className="btn btn-primary" style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", textDecoration: "none" }}>
                Play Again ⚔️
              </Link>
              <Link href="/dashboard" className="btn btn-ghost" style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", textDecoration: "none" }}>
                Dashboard 🏠
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ⚔️ Duel Header Scoreboard */}
      <div className="card" style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
        color: "#fff",
        padding: "1.25rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1.5rem",
      }}>
        {/* Left player */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%", background: "#4f46e5",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem"
          }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>You</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>⭐ {duel.isPlayer1 ? duel.player1Rating : duel.player2Rating}</div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, marginLeft: "1.5rem", color: myScore === 100 ? "#10b981" : "#fff" }}>
            {myScore} pts
          </div>
        </div>

        {/* Center: Timer & Status */}
        <div style={{ textAlign: "center" }}>
          <span style={{
            fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.65rem", borderRadius: "999px",
            background: "rgba(239, 68, 68, 0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)"
          }}>
            LIVE DUEL
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "monospace", marginTop: "0.25rem", color: timeLeft && timeLeft < 60 ? "#ef4444" : "#fff" }}>
            {timeLeft != null ? formatTimer(timeLeft) : "00:00"}
          </div>
        </div>

        {/* Right player */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: "row-reverse" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%", background: "#dc2626",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem"
          }}>
            🤖
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{opponentName}</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>⭐ {duel.isPlayer1 ? duel.player2Rating : duel.player1Rating}</div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, marginRight: "1.5rem", color: opponentScore === 100 ? "#10b981" : "#fff" }}>
            {opponentScore} pts
          </div>
        </div>
      </div>

      {/* Main duel arena split layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: "1.25rem", alignItems: "start" }}>
        
        {/* Left: Problem statement */}
        <div className="card" style={{ padding: "1.5rem", minHeight: "500px" }}>
          {problemContent ? (
            <div style={{ color: "#374151", lineHeight: 1.7 }}>
              <h2 style={{ color: "#111827", fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.85rem" }}>
                {duel.problem?.title}
              </h2>
              <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", marginBottom: "1.75rem" }}>{problemContent.statement}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>
                <div>
                  <h3 style={{ color: "#111827", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Input Format</h3>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem" }}>{problemContent.inputSpecification}</p>
                </div>
                <div>
                  <h3 style={{ color: "#111827", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Output Format</h3>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem" }}>{problemContent.outputSpecification}</p>
                </div>
              </div>

              <h3 style={{ color: "#111827", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Constraints</h3>
              <pre style={{ background: "#0d1117", color: "#e6edf3", padding: "0.85rem 1.1rem", borderRadius: "8px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", overflowX: "auto", marginBottom: "1.75rem" }}>
                {problemContent.constraints}
              </pre>

              {problemContent.examples && problemContent.examples.length > 0 && (
                <div>
                  <h3 style={{ color: "#111827", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>Examples</h3>
                  {problemContent.examples.slice(0, 2).map((ex, idx) => (
                    <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", marginBottom: "1rem" }}>
                      <div style={{ padding: "0.5rem 1rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "0.78rem", fontWeight: 700, color: "#6b7280" }}>
                        Example {idx + 1}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        <div style={{ padding: "0.75rem 1rem", borderRight: "1px solid #e5e7eb" }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", marginBottom: "0.25rem", textTransform: "uppercase" }}>Input</div>
                          <pre style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem" }}>{ex.input}</pre>
                        </div>
                        <div style={{ padding: "0.75rem 1rem" }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", marginBottom: "0.25rem", textTransform: "uppercase" }}>Output</div>
                          <pre style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem" }}>{ex.output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
              <p style={{ color: "#6b7280" }}>Loading problem description...</p>
            </div>
          )}
        </div>

        {/* Right: Code editor */}
        {duel.problemId && duel.problem?.slug && (
          <div style={{ position: "sticky", top: "80px" }}>
            <SubmissionForm
              problemId={duel.problemId}
              problemSlug={duel.problem?.slug}
              problemSignature={problemContent?.signature}
            />
          </div>
        )}

      </div>
    </div>
  );
}
