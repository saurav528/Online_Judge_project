"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginAdminAction({ username, password });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin");
        router.refresh();
      }
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
      padding: "1.5rem",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "rgba(24, 24, 27, 0.75)",
        border: "1px solid rgba(63, 63, 70, 0.4)",
        borderRadius: "16px",
        padding: "2.5rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(12px)",
        boxSizing: "border-box",
      }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            color: "#ef4444",
            marginBottom: "1rem",
          }}>
            <svg
              style={{ width: "24px", height: "24px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", margin: "0 0 0.5rem 0" }}>
            Admin Console
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", margin: 0 }}>
            Sign in with system administrator credentials
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#f87171",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#d4d4d8", marginBottom: "0.4rem" }}>
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="System Username"
              disabled={isPending}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "#09090b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
              onBlur={(e) => (e.target.style.borderColor = "#3f3f46")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#d4d4d8", marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isPending}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "#09090b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
              onBlur={(e) => (e.target.style.borderColor = "#3f3f46")}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "#ef4444",
              border: "none",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginTop: "0.5rem",
            }}
            onMouseOver={(e) => { if (!isPending) e.currentTarget.style.background = "#dc2626"; }}
            onMouseOut={(e) => { if (!isPending) e.currentTarget.style.background = "#ef4444"; }}
          >
            {isPending ? "Authenticating..." : "Access Console"}
          </button>
        </form>
      </div>
    </div>
  );
}
