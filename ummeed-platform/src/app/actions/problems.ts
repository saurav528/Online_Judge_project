"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { ProblemFormSchema } from "@/lib/validation";
import { saveProblemContent, deleteProblemContent } from "@/lib/problems-fs";
import { revalidatePath } from "next/cache";

/**
 * Server action to create a new problem.
 * Validates data, writes metadata to database, and writes statement + tests to disk.
 */
export async function createProblemAction(formData: any) {
  const admin = await requireAdmin();

  // Validate form data payload
  const result = ProblemFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  // Check for slug conflicts
  const existing = await prisma.problem.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    return { success: false, errors: { slug: ["A problem with this slug already exists."] } };
  }

  let dbProblem;
  try {
    // Upsert tags in the database
    const tagConnectOrCreate = [];
    for (const tagName of data.tags) {
      const tagRecord = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      tagConnectOrCreate.push({ id: tagRecord.id });
    }

    // Write metadata record to PostgreSQL
    dbProblem = await prisma.problem.create({
      data: {
        title: data.title,
        slug: data.slug,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        published: data.published,
        createdById: admin.id,
        tags: {
          connect: tagConnectOrCreate,
        },
      },
    });

    // Save testcase metadata references (no contents)
    for (const tc of data.testCases) {
      await prisma.testCase.create({
        data: {
          order: tc.order,
          isSample: tc.isSample,
          inputPath: `problems/${data.slug}/tests/${tc.order}.in`,
          outputPath: `problems/${data.slug}/tests/${tc.order}.out`,
          problemId: dbProblem.id,
        },
      });
    }
  } catch (e: any) {
    console.error("Database write failed for problem creation", e);
    return { success: false, error: "Failed to save problem metadata to the database." };
  }

  // Save statement files and testcase inputs/outputs to filesystem
  try {
    await saveProblemContent(data.slug, {
      statement: data.statement,
      inputSpecification: data.inputSpecification,
      outputSpecification: data.outputSpecification,
      constraints: data.constraints,
      explanation: data.explanation,
      examples: data.examples,
      testCases: data.testCases,
    });
  } catch (e) {
    console.error("Filesystem write failed, rolling back database changes...", e);
    // Atomic rollback
    await prisma.problem.delete({ where: { id: dbProblem.id } });
    return { success: false, error: "Failed to write files to disk. Database creation rolled back." };
  }

  revalidatePath("/admin/problems");
  revalidatePath("/problems");

  return { success: true, problemId: dbProblem.id };
}

/**
 * Server action to update an existing problem.
 * Validates data, updates database metadata, and writes modified statement + tests to disk.
 */
export async function updateProblemAction(id: string, formData: any) {
  const admin = await requireAdmin();

  // Validate form data payload
  const result = ProblemFormSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  // Retrieve existing record
  const existing = await prisma.problem.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Problem not found." };
  }

  // Check for slug conflicts if slug has changed
  if (existing.slug !== data.slug) {
    const duplicate = await prisma.problem.findUnique({
      where: { slug: data.slug },
    });
    if (duplicate) {
      return { success: false, errors: { slug: ["A problem with this slug already exists."] } };
    }
  }

  const oldSlug = existing.slug;

  try {
    // Upsert tags in the database
    const tagConnectOrCreate = [];
    for (const tagName of data.tags) {
      const tagRecord = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      tagConnectOrCreate.push({ id: tagRecord.id });
    }

    // Update metadata record in PostgreSQL
    await prisma.problem.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        published: data.published,
        tags: {
          set: [], // Remove existing tags connections
          connect: tagConnectOrCreate,
        },
      },
    });

    // Reset and create testcase metadata references
    await prisma.testCase.deleteMany({ where: { problemId: id } });
    for (const tc of data.testCases) {
      await prisma.testCase.create({
        data: {
          order: tc.order,
          isSample: tc.isSample,
          inputPath: `problems/${data.slug}/tests/${tc.order}.in`,
          outputPath: `problems/${data.slug}/tests/${tc.order}.out`,
          problemId: id,
        },
      });
    }
  } catch (e) {
    console.error("Database update failed", e);
    return { success: false, error: "Failed to update problem metadata in the database." };
  }

  // Update statement files and testcase inputs/outputs on filesystem
  try {
    if (oldSlug !== data.slug) {
      await deleteProblemContent(oldSlug);
    }

    await saveProblemContent(data.slug, {
      statement: data.statement,
      inputSpecification: data.inputSpecification,
      outputSpecification: data.outputSpecification,
      constraints: data.constraints,
      explanation: data.explanation,
      examples: data.examples,
      testCases: data.testCases,
    });
  } catch (e) {
    console.error("Filesystem update failed", e);
    return { success: false, error: "Failed to write modified files to disk." };
  }

  revalidatePath("/admin/problems");
  revalidatePath(`/admin/problems/${id}`);
  revalidatePath("/problems");
  revalidatePath(`/problems/${data.slug}`);

  return { success: true };
}

/**
 * Server action to delete a problem.
 * Cleans up files and deletes the metadata database record.
 */
export async function deleteProblemAction(id: string) {
  await requireAdmin();

  const problem = await prisma.problem.findUnique({
    where: { id },
  });
  if (!problem) {
    return { success: false, error: "Problem not found." };
  }

  try {
    // Delete files first
    await deleteProblemContent(problem.slug);

    // Delete database record (onDelete: Cascade cleans up TestCases automatically)
    await prisma.problem.delete({
      where: { id },
    });
  } catch (e) {
    console.error("Database deletion failed", e);
    return { success: false, error: "Failed to delete problem." };
  }

  revalidatePath("/admin/problems");
  revalidatePath("/problems");

  return { success: true };
}
