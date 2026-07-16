"use server";

import { requireAdmin } from "@/lib/auth/auth-utils";
import { ProblemFormSchema } from "@/lib/validation/problem";
import { ProblemService } from "@/lib/services/problem";
import { revalidatePath } from "next/cache";

/**
 * Server action to create a new problem.
 * Authenticates, validates payload via Zod, and delegates execution to ProblemService.
 */
export async function createProblemAction(formData: any) {
  const admin = await requireAdmin();

  // Validate form data payload
  const result = ProblemFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const dbProblem = await ProblemService.createProblem(result.data, admin.id);

    revalidatePath("/admin/problems");
    revalidatePath("/problems");

    return { success: true, problemId: dbProblem.id };
  } catch (e: any) {
    return { success: false, error: e.message || "An unexpected error occurred during creation." };
  }
}

/**
 * Server action to update an existing problem.
 * Authenticates, validates payload, and delegates to ProblemService.
 */
export async function updateProblemAction(id: string, formData: any) {
  await requireAdmin();

  // Validate form data payload
  const result = ProblemFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await ProblemService.updateProblem(id, result.data);

    revalidatePath("/admin/problems");
    revalidatePath(`/admin/problems/${id}`);
    revalidatePath("/problems");
    revalidatePath(`/problems/${result.data.slug}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "An unexpected error occurred during update." };
  }
}

/**
 * Server action to delete a problem.
 * Authenticates and delegates to ProblemService.
 */
export async function deleteProblemAction(id: string) {
  await requireAdmin();

  try {
    await ProblemService.deleteProblem(id);

    revalidatePath("/admin/problems");
    revalidatePath("/problems");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "An unexpected error occurred during deletion." };
  }
}
