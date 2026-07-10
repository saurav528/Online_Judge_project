"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createContestAction, updateContestAction } from "@/app/actions/contests";

interface ProblemOption {
  id: string;
  title: string;
  slug: string;
}

interface SelectedProblem {
  problemId: string;
  points: number;
  sequence: number;
}

interface ContestFormProps {
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    startTime: Date;
    endTime: Date;
    published: boolean;
    problems: SelectedProblem[];
  };
  problemsList: ProblemOption[];
}

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ContestForm({ initialData, problemsList }: ContestFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startTime, setStartTime] = useState(
    initialData?.startTime ? formatDateForInput(initialData.startTime) : ""
  );
  const [endTime, setEndTime] = useState(
    initialData?.endTime ? formatDateForInput(initialData.endTime) : ""
  );
  const [published, setPublished] = useState(initialData?.published || false);

  // Linked problems
  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>(
    initialData?.problems || []
  );

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const addProblem = () => {
    // Pick the first available problem that is not already selected (if any)
    const alreadySelectedIds = selectedProblems.map((p) => p.problemId);
    const available = problemsList.find((p) => !alreadySelectedIds.includes(p.id));
    const defaultProblemId = available ? available.id : problemsList[0]?.id || "";

    setSelectedProblems([
      ...selectedProblems,
      {
        problemId: defaultProblemId,
        points: 100,
        sequence: selectedProblems.length,
      },
    ]);
  };

  const removeProblem = (index: number) => {
    setSelectedProblems(
      selectedProblems
        .filter((_, i) => i !== index)
        .map((p, idx) => ({ ...p, sequence: idx })) // Re-sequence order
    );
  };

  const updateProblem = (index: number, key: keyof SelectedProblem, val: any) => {
    setSelectedProblems(
      selectedProblems.map((p, i) => (i === index ? { ...p, [key]: val } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");

    const payload = {
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      published,
      problems: selectedProblems.map((p) => ({
        problemId: p.problemId,
        points: Number(p.points),
        sequence: Number(p.sequence),
      })),
    };

    let res;
    if (isEdit && initialData) {
      res = await updateContestAction(initialData.id, payload);
    } else {
      res = await createContestAction(payload);
    }

    setLoading(false);
    if (!res.success) {
      if (res.errors) {
        setErrors(res.errors as Record<string, string[]>);
      } else if (res.error) {
        setGlobalError(res.error);
      }
    } else {
      router.push("/admin/contests");
      router.refresh();
    }
  };

  // Convert sequences (0, 1, 2) to problem letters (A, B, C...)
  const getProblemLetter = (seq: number) => String.fromCharCode(65 + seq);

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {globalError && (
        <div style={{ padding: "0.75rem", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "0.25rem" }}>
          {globalError}
        </div>
      )}

      {/* Row 1: Title */}
      <div>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Contest Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          placeholder="e.g. Weekly Contest #1"
          required
        />
        {errors.title && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.title[0]}</span>}
      </div>

      {/* Row 2: Description */}
      <div>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Description (Markdown Supported)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          placeholder="Welcome details, scoring instructions..."
        />
        {errors.description && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.description[0]}</span>}
      </div>

      {/* Row 3: Timings & Published */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
          />
          {errors.startTime && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.startTime[0]}</span>}
        </div>

        <div style={{ flex: 1, minWidth: "220px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
          />
          {errors.endTime && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.endTime[0]}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600", cursor: "pointer" }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publish immediately
          </label>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #e5e7eb" }} />

      {/* Dynamic Problems Selector */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#111827" }}>Contest Problems</h3>
          <button
            type="button"
            onClick={addProblem}
            disabled={problemsList.length === 0}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: "pointer", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "0.25rem" }}
          >
            + Add Problem
          </button>
        </div>

        {problemsList.length === 0 && (
          <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>
            No problems exist in the database yet. You must create problems before linking them to a contest.
          </p>
        )}

        {errors.problems && <div style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{errors.problems[0]}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {selectedProblems.map((prob, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 1rem",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
              }}
            >
              {/* Badge/Sequence */}
              <span style={{ fontWeight: 800, color: "#4b5563", fontSize: "1.1rem", minWidth: "24px" }}>
                {getProblemLetter(prob.sequence)}
              </span>

              {/* Problem Selection Dropdown */}
              <div style={{ flex: 2 }}>
                <select
                  value={prob.problemId}
                  onChange={(e) => updateProblem(index, "problemId", e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem" }}
                >
                  {problemsList.map((pOption) => (
                    <option key={pOption.id} value={pOption.id}>
                      {pOption.title} ({pOption.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Points */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Points:</span>
                <input
                  type="number"
                  value={prob.points}
                  onChange={(e) => updateProblem(index, "points", Number(e.target.value))}
                  style={{ width: "80px", padding: "0.4rem", boxSizing: "border-box" }}
                  min={10}
                  required
                />
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeProblem(index)}
                style={{
                  color: "#dc2626",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Remove
              </button>
            </div>
          ))}
          {selectedProblems.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: "0.9rem", textAlign: "center", padding: "1rem", border: "1px dashed #d1d5db", borderRadius: "0.375rem" }}>
              No problems linked to this contest yet. Click "+ Add Problem" to link some.
            </p>
          )}
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #e5e7eb" }} />

      {/* Form Submission Actions */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => router.push("/admin/contests")}
          style={{ padding: "0.5rem 1rem", cursor: "pointer", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "0.25rem" }}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{ padding: "0.5rem 1rem", cursor: "pointer", backgroundColor: "#10b981", color: "#ffffff", border: "0", borderRadius: "0.25rem", fontWeight: "600" }}
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Contest"}
        </button>
      </div>
    </form>
  );
}
