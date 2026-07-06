import React from "react";
import { ProblemForm } from "@/components/admin/problem-form";

export default function NewProblemPage() {
  return (
    <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>Create New Problem</h2>
      <ProblemForm />
    </div>
  );
}
