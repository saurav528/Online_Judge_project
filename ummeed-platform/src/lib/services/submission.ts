import { prisma } from "@/lib/prisma";
import { Language, SubmissionStatus, Verdict } from "@prisma/client";
import { submissionExecutor } from "./executor";

export interface CreateSubmissionInput {
  userId: string;
  problemId: string;
  language: Language;
  sourceCode: string;
}

export class SubmissionService {
  /**
   * Creates a new submission in the database, sets its initial status to PENDING,
   * and triggers the executor in a non-blocking background process.
   */
  static async createSubmission(input: CreateSubmissionInput) {
    const submission = await prisma.submission.create({
      data: {
        userId: input.userId,
        problemId: input.problemId,
        language: input.language,
        sourceCode: input.sourceCode,
        status: SubmissionStatus.PENDING,
        verdict: Verdict.PENDING,
      },
      include: {
        problem: true,
      },
    });

    // Trigger non-blocking execution
    await submissionExecutor.execute(submission.id);

    return submission;
  }

  /**
   * Retrieves a submission by ID, including its associated user and problem metadata.
   */
  static async getSubmission(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        problem: { select: { id: true, title: true, slug: true, difficulty: true } },
      },
    });
  }

  /**
   * Paginated list of submissions for a specific user.
   */
  static async listUserSubmissions(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [submissions, totalCount] = await Promise.all([
      prisma.submission.findMany({
        where: { userId },
        include: {
          problem: { select: { id: true, title: true, slug: true, difficulty: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.submission.count({ where: { userId } }),
    ]);

    return {
      submissions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Paginated list of all submissions (for admins).
   */
  static async listAllSubmissions(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [submissions, totalCount] = await Promise.all([
      prisma.submission.findMany({
        include: {
          user: { select: { id: true, name: true } },
          problem: { select: { id: true, title: true, slug: true, difficulty: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.submission.count(),
    ]);

    return {
      submissions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Updates only the execution status of a submission (e.g. QUEUED, RUNNING).
   */
  static async updateSubmissionStatus(id: string, status: SubmissionStatus) {
    return prisma.submission.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Finalizes the compilation and test case results for a submission.
   */
  static async updateSubmissionResult(
    id: string,
    params: {
      status: SubmissionStatus;
      verdict: Verdict;
      executionTime?: number;
      memoryUsed?: number;
      compileOutput?: string;
      runtimeOutput?: string;
      errorOutput?: string;
      score?: number;
    }
  ) {
    return prisma.submission.update({
      where: { id },
      data: {
        status: params.status,
        verdict: params.verdict,
        executionTime: params.executionTime,
        memoryUsed: params.memoryUsed,
        compileOutput: params.compileOutput,
        runtimeOutput: params.runtimeOutput,
        errorOutput: params.errorOutput,
        score: params.score,
      },
    });
  }
}
