"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createSubmissionAction, runCodeAction } from "@/app/actions/submissions";
import { ProblemSignature } from "@/lib/boilerplate/types";
import { CodeWorkspace, Language, RunResultPayload, SubmitResultPayload } from "./code-workspace";

interface SubmissionFormProps {
  problemId: string;
  problemSignature?: ProblemSignature;
}

export function SubmissionForm({ problemId, problemSignature }: SubmissionFormProps) {
  const router = useRouter();

  const handleRun = async (code: string, language: Language): Promise<RunResultPayload> => {
    const res = await runCodeAction({ problemId, language, sourceCode: code });
    if (!res.success) {
      return { success: false, error: res.error || "Failed to run code." };
    }

    return { success: true, result: res };
  };

  const handleSubmit = async (code: string, language: Language): Promise<SubmitResultPayload> => {
    const res = await createSubmissionAction({ problemId, language, sourceCode: code });
    if (!res.success) {
      return { 
        success: false, 
        errors: res.errors as Record<string, string[]> | undefined,
        error: res.error 
      };
    }

    router.push(`/submissions/${res.submissionId}`);
    return { success: true, submissionId: res.submissionId };
  };

  return (
    <CodeWorkspace
      problemId={problemId}
      problemSignature={problemSignature}
      onRun={handleRun}
      onSubmit={handleSubmit}
      savedCodeKey={`ummeed:code:${problemId}`}
      isContestMode={false}
    />
  );
}
