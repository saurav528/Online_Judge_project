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
    const fs = require("fs");
    const path = require("path");

    // 1. Fetch problem signature if any
    let problemSlug = "";
    const p = await prisma.problem.findUnique({ where: { id: problemId } });
    if (p) problemSlug = p.slug;
    
    let signature = undefined;
    if (problemSlug) {
      const content = await getProblemContent(problemSlug);
      signature = content?.signature ?? SEEDED_SIGNATURES[problemSlug] ?? undefined;
    }

    // 2. Fetch the first 2 test cases to run
    const testCases = await prisma.testCase.findMany({
      where: { problemId },
      orderBy: { order: "asc" },
      take: 2,
    });

    if (testCases.length === 0) {
      throw new Error("No test cases found for this problem.");
    }

    // 3. Consolidate inputs & expected outputs
    let consolidatedInput = signature ? `${testCases.length}\n` : "";
    let consolidatedOutput = "";

    for (const tc of testCases) {
      const inputFullPath = path.join(process.cwd(), "..", tc.inputPath);
      const outputFullPath = path.join(process.cwd(), "..", tc.outputPath);

      if (!fs.existsSync(inputFullPath) || !fs.existsSync(outputFullPath)) {
        throw new Error(`Missing testcase files at ${tc.inputPath}`);
      }

      consolidatedInput += fs.readFileSync(inputFullPath, "utf-8").trim() + "\n";
      consolidatedOutput += fs.readFileSync(outputFullPath, "utf-8").trim() + "\n";
    }

    // 4. Wrap the code if a signature is present
    let wrappedCode = sourceCode;
    if (signature) {
      wrappedCode = WrapperService.wrapSolution(sourceCode, signature, language);
    }

    // 5. Find Language ID
    const langConfig = LANGUAGE_REGISTRY[language as keyof typeof LANGUAGE_REGISTRY];
    if (!langConfig) throw new Error(`Unsupported language: ${language}`);

    const encodeBase64 = (str: string) => Buffer.from(str).toString("base64");
    const decodeBase64 = (str: string | null) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

    // 6. Call Judge0 API synchronously (wait=true)
    const judge0Url = `${process.env.JUDGE0_API_URL || "http://localhost:2358"}/submissions?base64_encoded=true&wait=true`;
    const apiKey = process.env.JUDGE0_API_KEY || "";
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["x-rapidapi-key"] = apiKey;
      headers["x-rapidapi-host"] = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
    }

    const response = await fetch(judge0Url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: encodeBase64(wrappedCode),
        language_id: langConfig.judge0Id,
        stdin: encodeBase64(consolidatedInput),
        expected_output: encodeBase64(consolidatedOutput),
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
