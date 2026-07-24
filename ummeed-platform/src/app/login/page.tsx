"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      if (signInError) {
        setError(signInError.message || "Invalid credentials. Please try again.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "var(--font-sans)",
      background: "linear-gradient(135deg, #000000 0%, #0c2511 50%, #000000 100%)",
    }}>
      {/* Left panel — Branding */}
      <div style={{
        flex: "1 1 50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(34,197,94,0.1)", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(34,197,94,0.05)", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "420px" }}>
          {/* Umeed Logo */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.97)",
            borderRadius: "24px",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <Image src="/umeed-logo.jpg" alt="Umeed Logo" width={180} height={100} style={{ objectFit: "contain" }} priority />
          </div>

          <h1 style={{ color: "#ffffff", fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            Umeed Coding Platform
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
            Sharpen your skills. Compete in contests.<br />Build your coding future.
          </p>

          {/* Feature highlights */}
          {[
            { text: "Real-time code execution in C++, Python, Java & JS" },
            { text: "Compete in live contests with ICPC-style rankings" },
            { text: "Track your progress on every problem you attempt" },
          ].map((feat, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "12px",
              marginBottom: "0.6rem",
              textAlign: "left",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>{feat.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Login Form */}
      <div style={{
        flex: "0 0 460px",
        background: "var(--surface-card)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 3.5rem",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gray-900)", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
              Welcome back
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.95rem" }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.4rem" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@ummeed.org"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.4rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: "1rem",
                    padding: "0.25rem",
                  }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "0.25rem", borderRadius: "10px" }}
            >
              {loading ? <><span className="spinner" /> Signing in...</> : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            <span style={{ color: "#9ca3af", fontSize: "0.82rem", fontWeight: 500 }}>or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={async () => { try { await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" }); } catch {} }}
              disabled={loading}
              style={{
                flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "10px",
                background: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600,
                color: "#374151", fontFamily: "var(--font-sans)",
                transition: "all 150ms ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub
            </button>
            <button
              type="button"
              onClick={async () => { try { await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" }); } catch {} }}
              disabled={loading}
              style={{
                flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "10px",
                background: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600,
                color: "#374151", fontFamily: "var(--font-sans)",
                transition: "all 150ms ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "#64748b", fontSize: "0.88rem" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>

          <p style={{ textAlign: "center", marginTop: "0.75rem", color: "#64748b", fontSize: "0.88rem" }}>
            Are you an administrator?{" "}
            <Link href="/admin-login" style={{ color: "#ef4444", fontWeight: 600, textDecoration: "none" }}>
              Admin Console
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
