"use server";

import { requireAuth } from "@/lib/auth-utils";
import { SubmissionCreateSchema } from "@/lib/validation";
import { SubmissionService } from "@/lib/services/submission";
import { revalidatePath } from "next/cache";

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
