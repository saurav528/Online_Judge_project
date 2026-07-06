"use client";

import React, { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup attempt with:", { name, email, password });
    // UI placeholder - actual auth client integration will occur in future tickets
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h2>Sign Up (Placeholder)</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
          />
        </div>
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
          Register
        </button>
      </form>

      <p style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}
