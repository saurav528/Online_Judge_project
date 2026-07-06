import { prisma } from "@/lib/prisma";
import { SubmissionStatus, Verdict } from "@prisma/client";

export interface SubmissionExecutor {
  /**
   * Triggers asynchronous execution of the submission.
   * Resolves immediately to allow non-blocking client interaction.
   */
  execute(submissionId: string): Promise<void>;
}

export class PlaceholderExecutor implements SubmissionExecutor {
  async execute(submissionId: string): Promise<void> {
    // Execute asynchronously (fire-and-forget) to not block the server thread
    this.runSimulation(submissionId).catch((err) => {
      console.error(`Simulation failed for submission ${submissionId}:`, err);
    });
  }

  private async runSimulation(submissionId: string): Promise<void> {
    // 1. Update state: PENDING -> QUEUED
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.QUEUED },
    });

    // Simulate queue processing latency (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 2. Update state: QUEUED -> RUNNING
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.RUNNING },
    });

    // Simulate code execution latency (1200ms)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // 3. Update state: RUNNING -> COMPLETED with simulated success metrics
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.COMPLETED,
        verdict: Verdict.ACCEPTED,
        executionTime: Math.floor(Math.random() * 80) + 15, // 15ms to 95ms
        memoryUsed: Math.floor(Math.random() * 4000) + 12000, // ~12MB to 16MB
        compileOutput: "✓ Compiled successfully. Zero errors.\nTarget platform: Linux x86_64.",
        runtimeOutput: "All sample and hidden test cases passed successfully.\nTotal test cases: 5/5.",
        errorOutput: "",
      },
    });
  }
}

// Global executor instance (can be swapped with queue publisher later)
export const submissionExecutor: SubmissionExecutor = new PlaceholderExecutor();
