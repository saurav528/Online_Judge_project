"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DuelLobbyPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [inQueue, setInQueue] = useState(false);
  const [matchingTime, setMatchingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Poll matching status when in queue
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let queuePoll: ReturnType<typeof setInterval>;

    if (inQueue) {
      setMatchingTime(0);
      timer = setInterval(() => {
        setMatchingTime((t) => t + 1);
      }, 1000);

      queuePoll = setInterval(async () => {
        try {
          const res = await fetch("/api/duels/queue");
          const data = await res.json();
          if (data.matched && data.roomId) {
            router.push(`/duels/${data.roomId}`);
          } else if (!data.inQueue && !data.matched) {
            // Unexpectedly kicked from queue
            setInQueue(false);
          }
        } catch {
          // ignore
        }
      }, 2000);
    }

    return () => {
      clearInterval(timer);
      clearInterval(queuePoll);
    };
  }, [inQueue, router]);

  // Clean up queue if user navigates away or unmounts while in queue
  useEffect(() => {
    return () => {
      if (inQueue) {
        fetch("/api/duels/queue", { method: "DELETE", keepalive: true }).catch(() => {});
      }
    };
  }, [inQueue]);

  // Initial check on mount if user is already in a running match or queue
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/duels/queue");
        const data = await res.json();
        if (data.matched && data.roomId) {
          router.push(`/duels/${data.roomId}`);
        } else if (data.inQueue) {
          setInQueue(true);
        }
      } catch {
        // ignore
      }
    }
    checkStatus();
  }, [router]);

  const handleJoinQueue = async () => {
    setError(null);
    try {
      const res = await fetch("/api/duels/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      if (res.status === 401) {
        setShowAuthModal(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join queue");

      if (data.matched && data.roomId) {
        router.push(`/duels/${data.roomId}`);
      } else {
        setInQueue(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await fetch("/api/duels/queue", { method: "DELETE" });
      setInQueue(false);
    } catch {
      // ignore
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header card */}
      <div className="card" style={{
        background: "linear-gradient(135deg, #0c2511 0%, #000000 100%)",
        color: "#fff",
        padding: "2rem",
        textAlign: "center",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          1v1 Coding Duel
        </h2>
        <p style={{ opacity: 0.8, fontSize: "0.95rem", marginTop: "0.4rem" }}>
          Match with another coder in real-time. Solve the problem fastest to gain ELO rating points!
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Main interaction card */}
      <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
        {!inQueue ? (
          <div>
            <h3 style={{ margin: "0 0 1.25rem", color: "var(--gray-900)", fontSize: "1.1rem", fontWeight: 700 }}>
              Choose Match Difficulty
            </h3>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem" }}>
              {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "2px solid",
                    borderColor: difficulty === diff ? (diff === "EASY" ? "#22c55e" : diff === "MEDIUM" ? "#eab308" : "#ef4444") : "var(--gray-200)",
                    background: difficulty === diff ? (diff === "EASY" ? "rgba(34,197,94,0.15)" : diff === "MEDIUM" ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)") : "var(--surface-card)",
                    color: difficulty === diff ? (diff === "EASY" ? "#22c55e" : diff === "MEDIUM" ? "#eab308" : "#ef4444") : "var(--gray-500)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>

            <button
              onClick={handleJoinQueue}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "1.05rem",
                borderRadius: "12px",
                background: "var(--brand-primary)",
                boxShadow: "0 4px 14px rgba(34, 197, 94, 0.3)",
              }}
            >
              Find Match
            </button>
          </div>
        ) : (
          <div style={{ padding: "1rem 0" }}>
            <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 1.5rem" }}>
              <div className="spinner" style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                borderWidth: "4px",
                borderTopColor: "var(--brand-primary)",
              }} />
            </div>

            <h3 style={{ margin: "0 0 0.5rem", color: "var(--gray-900)", fontSize: "1.2rem", fontWeight: 700 }}>
              Finding Opponent...
            </h3>
            <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              Difficulty: <strong style={{ color: "var(--brand-primary)" }}>{difficulty}</strong> · Time elapsed: {formatTime(matchingTime)}
            </p>

            <button
              onClick={handleLeaveQueue}
              className="btn btn-danger"
              style={{ padding: "0.55rem 2rem", borderRadius: "10px" }}
            >
              Cancel Matchmaking
            </button>
          </div>
        )}
      </div>

      {/* Rules list */}
      <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <h4 style={{ margin: "0 0 0.6rem", color: "var(--gray-800)", fontSize: "0.9rem", fontWeight: 700 }}>
          Duel Rules
        </h4>
        <ul style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "0.82rem", color: "var(--gray-500)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <li>Both coders solve the exact same random problem at the same time.</li>
          <li>First coder to get all test cases correct (**100 points**) wins instantly.</li>
          <li>If the 15-minute timer runs out, the coder with the highest score wins.</li>
          <li>Elo ratings are recalculated immediately based on the match outcome.</li>
        </ul>
      </div>

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
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚔️</div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#111827", fontWeight: 800 }}>
              Authentication Required
            </h3>
            <p style={{ margin: "0 0 1.5rem 0", color: "#6b7280", fontSize: "0.92rem", lineHeight: 1.5 }}>
              Please log in or create an account to participate in 1v1 real-time coding duels.
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
