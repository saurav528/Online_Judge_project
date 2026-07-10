"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

interface CountdownProps {
  endTime: string;
  style?: React.CSSProperties;
}

export function ContestCountdown({ endTime, style }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: "1.4rem",
        fontWeight: 700,
        color: "#15803d",
        letterSpacing: "0.05em",
        ...style,
      }}
    >
      {timeLeft}
    </span>
  );
}

interface RegisterButtonProps {
  contestId: string;
  isRegistered: boolean;
}

export function RegisterButton({ contestId, isRegistered: initialRegistered }: RegisterButtonProps) {
  const router = useRouter();
  const [registered, setRegistered] = useState(initialRegistered);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contests/${contestId}/register`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
      } else {
        setRegistered(true);
        startTransition(() => router.refresh());
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.5rem 1.2rem",
          backgroundColor: "#dcfce7",
          color: "#15803d",
          borderRadius: "0.4rem",
          fontWeight: 700,
          fontSize: "0.9rem",
        }}
      >
        ✓ Registered
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleRegister}
        disabled={loading || isPending}
        style={{
          padding: "0.55rem 1.4rem",
          backgroundColor: loading ? "#9ca3af" : "#1d4ed8",
          color: "#ffffff",
          border: "none",
          borderRadius: "0.4rem",
          fontSize: "0.9rem",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Registering..." : "Register for Contest"}
      </button>
      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.85rem", margin: "0.4rem 0 0" }}>{error}</p>
      )}
    </div>
  );
}
