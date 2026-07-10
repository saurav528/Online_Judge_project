"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { ContestFormSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

/**
 * Helper to determine ContestStatus based on times.
 */
function getContestStatus(startTime: Date, endTime: Date): "UPCOMING" | "RUNNING" | "ENDED" {
  const now = new Date();
  if (now >= endTime) {
    return "ENDED";
  }
  if (now >= startTime) {
    return "RUNNING";
  }
  return "UPCOMING";
}

/**
 * Server action to create a new contest.
 */
export async function createContestAction(formData: any) {
  await requireAdmin();

  // Validate request schema
  const result = ContestFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const status = getContestStatus(data.startTime, data.endTime);

  try {
    const contest = await prisma.contest.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        status,
        published: data.published,
        problems: {
          create: data.problems.map((p) => ({
            problem: { connect: { id: p.problemId } },
            points: p.points,
            sequence: p.sequence,
          })),
        },
      },
    });

    revalidatePath("/admin/contests");
    revalidatePath("/contests");
    return { success: true, contestId: contest.id };
  } catch (e: any) {
    console.error("Database write failed for contest creation:", e);
    return { success: false, error: "Failed to save contest to the database." };
  }
}

/**
 * Server action to update an existing contest.
 */
export async function updateContestAction(id: string, formData: any) {
  await requireAdmin();

  // Validate request schema
  const result = ContestFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const status = getContestStatus(data.startTime, data.endTime);

  try {
    // Check if contest exists
    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Contest not found." };
    }

    // Delete existing relation records and update contest in a transaction
    await prisma.$transaction(async (tx) => {
      // Clear current problems linked to this contest
      await tx.contestProblem.deleteMany({
        where: { contestId: id },
      });

      // Update contest and link new problems
      await tx.contest.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          status,
          published: data.published,
          problems: {
            create: data.problems.map((p) => ({
              problem: { connect: { id: p.problemId } },
              points: p.points,
              sequence: p.sequence,
            })),
          },
        },
      });
    });

    revalidatePath("/admin/contests");
    revalidatePath(`/admin/contests/${id}/edit`);
    revalidatePath("/contests");
    revalidatePath(`/contests/${id}`);
    return { success: true };
  } catch (e: any) {
    console.error("Database update failed for contest:", e);
    return { success: false, error: "Failed to update contest in database." };
  }
}

/**
 * Server action to delete a contest.
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
