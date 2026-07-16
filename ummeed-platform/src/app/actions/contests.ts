"use server";

import { prisma } from "@/config/db";
import { requireAdmin } from "@/lib/auth/auth-utils";
import { ContestFormSchema } from "@/lib/validation/contest";
import { ContestService } from "@/lib/services/contest";
import { revalidatePath } from "next/cache";

/**
 * Server action to create a new contest.
 * Authenticates, validates inputs, and delegates to ContestService.
 */
export async function createContestAction(formData: any) {
  await requireAdmin();

  // Validate request schema
  const result = ContestFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const contest = await ContestService.createContest(result.data);

    revalidatePath("/admin/contests");
    revalidatePath("/contests");
    return { success: true, contestId: contest.id };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save contest to the database." };
  }
}

/**
 * Server action to update an existing contest.
 * Authenticates, validates schema, and delegates to ContestService.
 */
export async function updateContestAction(id: string, formData: any) {
  await requireAdmin();

  // Validate request schema
  const result = ContestFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await ContestService.updateContest(id, result.data);

    revalidatePath("/admin/contests");
    revalidatePath(`/admin/contests/${id}/edit`);
    revalidatePath("/contests");
    revalidatePath(`/contests/${id}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update contest in database." };
  }
}

/**
 * Server action to delete a contest.
 * Authenticates and deletes contest.
 */
export async function deleteContestAction(id: string) {
  await requireAdmin();

  try {
    // Cascading rules in Prisma schema clean up links automatically
    await prisma.contest.delete({
      where: { id },
    });

    revalidatePath("/admin/contests");
    revalidatePath("/contests");
    return { success: true };
  } catch (e: any) {
    console.error("Database deletion failed for contest:", e);
    return { success: false, error: "Failed to delete contest." };
  }
}
