"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createProblemAction, updateProblemAction } from "@/app/actions/problems";

interface ProblemFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    timeLimit: number;
    memoryLimit: number;
    published: boolean;
    tags: string[];
    statement: string;
    inputSpecification: string;
    outputSpecification: string;
    constraints: string;
    explanation?: string;
    examples: {
      input: string;
      output: string;
      explanation?: string;
      displayOrder: number;
    }[];
    testCases: {
      order: number;
      isSample: boolean;
      input: string;
      output: string;
    }[];
  };
}

export function ProblemForm({ initialData }: ProblemFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(initialData?.difficulty || "EASY");
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 1000);
  const [memoryLimit, setMemoryLimit] = useState(initialData?.memoryLimit || 256);
  const [published, setPublished] = useState(initialData?.published || false);
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(", ") || "");

  // Git-backed content
  const [statement, setStatement] = useState(initialData?.statement || "");
  const [inputSpec, setInputSpec] = useState(initialData?.inputSpecification || "");
  const [outputSpec, setOutputSpec] = useState(initialData?.outputSpecification || "");
  const [constraints, setConstraints] = useState(initialData?.constraints || "");
  const [explanation, setExplanation] = useState(initialData?.explanation || "");

  // Examples
  const [examples, setExamples] = useState(
    initialData?.examples || [{ input: "", output: "", explanation: "", displayOrder: 1 }]
  );

  // Test cases
  const [testCases, setTestCases] = useState(
    initialData?.testCases || [{ order: 1, isSample: true, input: "", output: "" }]
  );

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  // Example management
  const addExample = () => {
    setExamples([...examples, { input: "", output: "", explanation: "", displayOrder: examples.length + 1 }]);
  };
  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };
  const updateExample = (index: number, key: string, val: any) => {
    setExamples(examples.map((ex, i) => (i === index ? { ...ex, [key]: val } : ex)));
  };

  // Test case management
  const addTestCase = () => {
    setTestCases([...testCases, { order: testCases.length + 1, isSample: false, input: "", output: "" }]);
  };
  const removeTestCase = (index: number) => {
    setTestCases(
      testCases
        .filter((_, i) => i !== index)
        .map((tc, idx) => ({ ...tc, order: idx + 1 })) // Re-index order sequences
    );
  };
  const updateTestCase = (index: number, key: string, val: any) => {
    setTestCases(testCases.map((tc, i) => (i === index ? { ...tc, [key]: val } : tc)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");

    // Prepare tags
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      slug,
      difficulty,
      timeLimit: Number(timeLimit),
      memoryLimit: Number(memoryLimit),
      published,
      tags,
      statement,
      inputSpecification: inputSpec,
      outputSpecification: outputSpec,
      constraints,
      explanation,
      examples,
      testCases,
    };

    let res;
    if (isEdit && initialData) {
      res = await updateProblemAction(initialData.id, payload);
    } else {
      res = await createProblemAction(payload);
    }

    setLoading(false);
    if (!res.success) {
      if (res.errors) {
        setErrors(res.errors as Record<string, string[]>);
      } else if (res.error) {
        setGlobalError(res.error);
      }
    } else {
      router.push("/admin/problems");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {globalError && (
        <div style={{ padding: "0.75rem", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "0.25rem" }}>
          {globalError}
        </div>
      )}

      {/* Row 1: Title & Slug */}
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            placeholder="e.g. Add Two Numbers"
            required
          />
          {errors.title && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.title[0]}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            placeholder="e.g. add-two-numbers"
            required
          />
          {errors.slug && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.slug[0]}</span>}
        </div>
      </div>

      {/* Row 2: Difficulty, Limits, Published */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ minWidth: "150px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e: any) => setDifficulty(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>

        <div style={{ minWidth: "150px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Time Limit (ms)</label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
          />
          {errors.timeLimit && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.timeLimit[0]}</span>}
        </div>

        <div style={{ minWidth: "150px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Memory Limit (MB)</label>
          <input
            type="number"
            value={memoryLimit}
            onChange={(e) => setMemoryLimit(Number(e.target.value))}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            required
          />
          {errors.memoryLimit && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.memoryLimit[0]}</span>}
        </div>

        <div style={{ minWidth: "200px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            placeholder="e.g. Math, Basics, Loops"
            required
          />
          {errors.tags && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.tags[0]}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600", cursor: "pointer" }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publish immediately
          </label>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #e5e7eb" }} />

      {/* Statement Specs (Markdown Supported) */}
      <div>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Problem Statement</label>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={6}
          style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", boxSizing: "border-box" }}
          placeholder="Detailed problem statement markdown..."
          required
        />
        {errors.statement && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.statement[0]}</span>}
      </div>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Input Specification</label>
          <textarea
            value={inputSpec}
            onChange={(e) => setInputSpec(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", boxSizing: "border-box" }}
            placeholder="Format of input details..."
            required
          />
          {errors.inputSpecification && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.inputSpecification[0]}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Output Specification</label>
          <textarea
            value={outputSpec}
            onChange={(e) => setOutputSpec(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", boxSizing: "border-box" }}
            placeholder="Format of output details..."
            required
          />
          {errors.outputSpecification && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.outputSpecification[0]}</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Constraints</label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", boxSizing: "border-box" }}
            placeholder="Constraints info..."
            required
          />
          {errors.constraints && <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>{errors.constraints[0]}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Explanation (Optional)</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", boxSizing: "border-box" }}
            placeholder="Explanation notes..."
          />
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #e5e7eb" }} />

      {/* Examples Form Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Examples</h3>
          <button
            type="button"
            onClick={addExample}
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", cursor: "pointer" }}
          >
            + Add Example
          </button>
        </div>
        {errors.examples && <div style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{errors.examples[0]}</div>}
        {examples.map((ex, index) => (
          <div key={index} style={{ border: "1px solid #d1d5db", padding: "1rem", borderRadius: "0.25rem", marginBottom: "1rem", backgroundColor: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <strong>Example #{index + 1}</strong>
              {examples.length > 1 && (
                <button type="button" onClick={() => removeExample(index)} style={{ color: "#dc2626", cursor: "pointer", fontSize: "0.8rem", border: "0", background: "none" }}>
                  Remove
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.85rem" }}>Example Input</label>
                <textarea
                  value={ex.input}
                  onChange={(e) => updateExample(index, "input", e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "0.25rem", fontFamily: "monospace" }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.85rem" }}>Example Output</label>
                <textarea
                  value={ex.output}
                  onChange={(e) => updateExample(index, "output", e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "0.25rem", fontFamily: "monospace" }}
                  required
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.85rem" }}>Explanation</label>
              <textarea
                value={ex.explanation}
                onChange={(e) => updateExample(index, "explanation", e.target.value)}
                rows={2}
                style={{ width: "100%", padding: "0.25rem" }}
              />
            </div>
          </div>
        ))}
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #e5e7eb" }} />

      {/* Test Cases Form Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Test Cases</h3>
          <button
            type="button"
            onClick={addTestCase}
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", cursor: "pointer" }}
          >
            + Add Test Case
          </button>
        </div>
        {errors.testCases && <div style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{errors.testCases[0]}</div>}
        {testCases.map((tc, index) => (
          <div key={index} style={{ border: "1px solid #d1d5db", padding: "1rem", borderRadius: "0.25rem", marginBottom: "1rem", backgroundColor: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <strong>Test Case #{tc.order}</strong>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tc.isSample}
                    onChange={(e) => updateTestCase(index, "isSample", e.target.checked)}
                  />
                  Is Sample Example
                </label>
                {testCases.length > 1 && (
                  <button type="button" onClick={() => removeTestCase(index)} style={{ color: "#dc2626", cursor: "pointer", fontSize: "0.8rem", border: "0", background: "none" }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.85rem" }}>Raw Input Data</label>
                <textarea
                  value={tc.input}
                  onChange={(e) => updateTestCase(index, "input", e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "0.25rem", fontFamily: "monospace" }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.85rem" }}>Expected Output Data</label>
                <textarea
                  value={tc.output}
                  onChange={(e) => updateTestCase(index, "output", e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "0.25rem", fontFamily: "monospace" }}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #e5e7eb" }} />

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => router.push("/admin/problems")}
          style={{ padding: "0.5rem 1rem", cursor: "pointer", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{ padding: "0.5rem 1rem", cursor: "pointer", backgroundColor: "#2563eb", color: "#ffffff", border: "0" }}
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Problem"}
        </button>
      </div>
    </form>
  );
}
