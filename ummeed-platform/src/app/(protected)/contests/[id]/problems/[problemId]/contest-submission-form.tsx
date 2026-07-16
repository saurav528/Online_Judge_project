"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProblemSignature } from "@/lib/boilerplate/types";
import { CodeWorkspace, Language, RunResultPayload, SubmitResultPayload } from "@/components/problems/code-workspace";

interface ContestSubmissionFormProps {
  contestId: string;
  problemId: string;
  problemSignature?: ProblemSignature;
}

export function ContestSubmissionForm({
  contestId,
  problemId,
  problemSignature,
}: ContestSubmissionFormProps) {
  const router = useRouter();

  const handleRun = async (code: string, language: Language): Promise<RunResultPayload> => {
    const res = await fetch(`/api/contests/${contestId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId, language, sourceCode: code }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Execution failed." };
    }
    return { success: true, result: data };
  };

  const handleSubmit = async (code: string, language: Language): Promise<SubmitResultPayload> => {
    const res = await fetch(`/api/contests/${contestId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId, language, sourceCode: code }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Submission failed." };
    }
    router.push(`/submissions/${data.id}`);
    return { success: true, submissionId: data.id };
  };

  return (
    <CodeWorkspace
      problemId={problemId}
      problemSignature={problemSignature}
      onRun={handleRun}
      onSubmit={handleSubmit}
      savedCodeKey={`ummeed:contest:${contestId}:${problemId}`}
      isContestMode={true}
    />
  );
}
