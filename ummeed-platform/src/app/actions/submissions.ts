"use server";

import { requireAuth } from "@/lib/auth-utils";
import { SubmissionCreateSchema } from "@/lib/validation";
import { SubmissionService } from "@/lib/services/submission";
import { revalidatePath } from "next/cache";
import { WrapperService } from "@/lib/services/wrapper";
import { LANGUAGE_REGISTRY } from "@/lib/boilerplate/languages";
import { SEEDED_SIGNATURES } from "@/lib/services/executor";
import { getProblemContent } from "@/lib/problems-fs";
import { prisma } from "@/lib/prisma";

export async function createSubmissionAction(payload: any) {
  const user = await requireAuth();

  // Validate request inputs using Zod
  const result = SubmissionCreateSchema.safeParse(payload);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { problemId, language, sourceCode } = result.data;

  try {
    const submission = await SubmissionService.createSubmission({
      userId: user.id,
      problemId,
      language,
      sourceCode,
    });

    revalidatePath("/submissions");
    revalidatePath(`/submissions/${submission.id}`);
    revalidatePath(`/problems/${submission.problem.slug}`);

    return { success: true, submissionId: submission.id };
  } catch (error) {
    console.error("Submission action failed:", error);
    return { success: false, error: "An unexpected error occurred during submission." };
  }
}

export async function runCodeAction(payload: any) {
  const user = await requireAuth();

  const { problemId, language, sourceCode } = payload;

  try {
    // 1. Fetch problem signature if any
    let problemSlug = "";
    const p = await prisma.problem.findUnique({ where: { id: problemId } });
    if (p) problemSlug = p.slug;
    
    let signature = undefined;
    if (problemSlug) {
      const content = await getProblemContent(problemSlug);
      signature = content?.signature ?? SEEDED_SIGNATURES[problemSlug] ?? undefined;
    }

    // 2. Wrap the code if a signature is present
    let wrappedCode = sourceCode;
    if (signature) {
      wrappedCode = WrapperService.wrapSolution(sourceCode, signature, language);
    }

    // 3. Find Language ID
    const langConfig = LANGUAGE_REGISTRY[language as keyof typeof LANGUAGE_REGISTRY];
    if (!langConfig) throw new Error(`Unsupported language: ${language}`);

    const encodeBase64 = (str: string) => Buffer.from(str).toString("base64");
    const decodeBase64 = (str: string | null) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

    // 4. Call Judge0 API synchronously (wait=true)
    const judge0Url = process.env.JUDGE0_API_URL || "http://localhost:2358";
    
    const response = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: encodeBase64(wrappedCode),
        language_id: langConfig.judge0Id,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Judge0 returned ${response.status}: ${await response.text()}` };
    }

    const data = await response.json();
    
    return {
      success: true,
      compileOutput: decodeBase64(data.compile_output),
      runtimeOutput: decodeBase64(data.stdout),
      errorOutput: decodeBase64(data.stderr),
      time: data.time,
      memory: data.memory,
      status: data.status?.description || "Unknown",
    };

  } catch (error: any) {
    console.error("Run code failed:", error);
    return { success: false, error: error.message || "An unexpected error occurred during execution." };
  }
}
