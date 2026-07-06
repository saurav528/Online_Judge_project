"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });
    // UI placeholder - actual auth client integration will occur in future tickets
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h2>Login (Placeholder)</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
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
          />
        </div>
        <button type="submit" style={{ padding: "0.5rem", cursor: "pointer" }}>
          Log In
        </button>
      </form>

      <div style={{ margin: "1.5rem 0", textAlign: "center", color: "#666" }}>or</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => console.log("OAuth GitHub Redirect")}
          style={{ padding: "0.5rem", cursor: "pointer" }}
        >
          Sign in with GitHub
        </button>
        <button
          type="button"
          onClick={() => console.log("OAuth Google Redirect")}
          style={{ padding: "0.5rem", cursor: "pointer" }}
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
