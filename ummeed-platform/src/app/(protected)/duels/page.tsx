"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DuelLobbyPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [inQueue, setInQueue] = useState(false);
  const [matchingTime, setMatchingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
        background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
        color: "#fff",
        padding: "2rem",
        textAlign: "center",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(30, 27, 75, 0.25)",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⚔️</div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          1v1 Coding Duel
        </h2>
        <p style={{ opacity: 0.8, fontSize: "0.95rem", marginTop: "0.4rem" }}>
          Match with another coder in real-time. Solve the problem fastest to gain ELO rating points!
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Main interaction card */}
      <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
        {!inQueue ? (
          <div>
            <h3 style={{ margin: "0 0 1.25rem", color: "#111827", fontSize: "1.1rem", fontWeight: 700 }}>
              Choose Match Difficulty
            </h3>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem" }}>
              {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: difficulty === diff ? (diff === "EASY" ? "#16a34a" : diff === "MEDIUM" ? "#d97706" : "#dc2626") : "#e5e7eb",
                    background: difficulty === diff ? (diff === "EASY" ? "#dcfce7" : diff === "MEDIUM" ? "#fef3c7" : "#fee2e2") : "#fff",
                    color: difficulty === diff ? (diff === "EASY" ? "#15803d" : diff === "MEDIUM" ? "#b45309" : "#b91c1c") : "#6b7280",
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
                background: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
                boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
              }}
            >
              Find Match 🔍
            </button>
          </div>
        ) : (
          <div style={{ padding: "1rem 0" }}>
            <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 1.5rem" }}>
              <div className="spinner" style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                borderWidth: "4px",
                borderTopColor: "#6d28d9",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem",
              }}>
                🔍
              </div>
            </div>

            <h3 style={{ margin: "0 0 0.5rem", color: "#111827", fontSize: "1.2rem", fontWeight: 700 }}>
              Finding Opponent...
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              Difficulty: <strong style={{ color: "#6d28d9" }}>{difficulty}</strong> · Time elapsed: {formatTime(matchingTime)}
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
        <h4 style={{ margin: "0 0 0.6rem", color: "#374151", fontSize: "0.9rem", fontWeight: 700 }}>
          ⚔️ Duel Rules
        </h4>
        <ul style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "0.82rem", color: "#6b7280", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <li>Both coders solve the exact same random problem at the same time.</li>
          <li>First coder to get all test cases correct (**100 points**) wins instantly.</li>
          <li>If the 15-minute timer runs out, the coder with the highest score wins.</li>
          <li>Elo ratings are recalculated immediately based on the match outcome.</li>
        </ul>
      </div>
    </div>
  );
}
