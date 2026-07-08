"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(signInError.message || "Failed to sign in");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHub = async () => {
    setError("");
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setError(err.message || "GitHub sign in failed");
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setError(err.message || "Google sign in failed");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h2>Login</h2>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" style={{ padding: "0.5rem", cursor: "pointer" }} disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </button>
      </form>

      <div style={{ margin: "1.5rem 0", textAlign: "center", color: "#666" }}>or</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={handleGitHub}
          style={{ padding: "0.5rem", cursor: "pointer" }}
          disabled={loading}
        >
          Sign in with GitHub
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          style={{ padding: "0.5rem", cursor: "pointer" }}
          disabled={loading}
        >
          Sign in with Google
        </button>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
