import { prisma } from "@/config/db";
import { saveProblemContent, deleteProblemContent } from "@/lib/problems-fs";

export class ProblemService {
  /**
   * Creates a new problem metadata record in the database and writes its contents to the file system.
   * If the file system write fails, it performs an atomic rollback of database changes.
   */
  static async createProblem(data: any, adminId: string) {
    // 1. Check for slug conflict
    const existing = await prisma.problem.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new Error("A problem with this slug already exists.");
    }

    let dbProblem;

    // 2. Perform database transaction
    try {
      const tagConnectOrCreate = [];
      for (const tagName of data.tags) {
        const tagRecord = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        tagConnectOrCreate.push({ id: tagRecord.id });
      }

      dbProblem = await prisma.problem.create({
        data: {
          title: data.title,
          slug: data.slug,
          difficulty: data.difficulty,
          timeLimit: data.timeLimit,
          memoryLimit: data.memoryLimit,
          published: data.published,
          createdById: adminId === "admin-system-bypass" ? null : adminId,
          tags: {
            connect: tagConnectOrCreate,
          },
        },
      });

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
      console.error("Database write failed for problem creation:", e);
      throw new Error("Failed to save problem metadata to the database.");
    }

    // 3. Write problem content and testcases to disk
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
      // Atomic Rollback
      await prisma.problem.delete({ where: { id: dbProblem.id } });
      throw new Error("Failed to write files to disk. Database creation rolled back.");
    }

    return dbProblem;
  }

  /**
   * Updates an existing problem metadata in the database and synces modified statements/tests on disk.
   */
  static async updateProblem(id: string, data: any) {
    const existing = await prisma.problem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new Error("Problem not found.");
    }

    if (existing.slug !== data.slug) {
      const duplicate = await prisma.problem.findUnique({
        where: { slug: data.slug },
      });
      if (duplicate) {
        throw new Error("A problem with this slug already exists.");
      }
    }

    const oldSlug = existing.slug;

    try {
      const tagConnectOrCreate = [];
      for (const tagName of data.tags) {
        const tagRecord = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        tagConnectOrCreate.push({ id: tagRecord.id });
      }

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
            set: [],
            connect: tagConnectOrCreate,
          },
        },
      });

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
      console.error("Database update failed:", e);
      throw new Error("Failed to update problem metadata in the database.");
    }

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
      console.error("Filesystem update failed:", e);
      throw new Error("Failed to write modified files to disk.");
    }
  }

  /**
   * Deletes a problem database record and cleans up filesystem test files.
   */
  static async deleteProblem(id: string) {
    const problem = await prisma.problem.findUnique({
      where: { id },
    });
    if (!problem) {
      throw new Error("Problem not found.");
    }

    try {
      await deleteProblemContent(problem.slug);
      await prisma.problem.delete({
        where: { id },
      });
    } catch (e) {
      console.error("Database deletion failed:", e);
      throw new Error("Failed to delete problem.");
    }
  }
}
