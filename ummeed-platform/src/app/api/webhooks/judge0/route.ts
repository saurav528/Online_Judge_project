import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubmissionService } from "@/lib/services/submission";
import { SubmissionStatus, Verdict } from "@prisma/client";

function decodeBase64(str: string | null | undefined): string {
  if (!str) return "";
  try {
    return Buffer.from(str, "base64").toString("utf-8");
  } catch (e) {
    return str;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, status, stdout, stderr, compile_output, time, memory } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
    }

    // Retrieve submission by matching Judge0 token
    const submission = await prisma.submission.findUnique({
      where: { judgeToken: token },
    });

    if (!submission) {
      // Return 200 even if missing, to prevent Judge0 retrying infinite webhook delivery
      console.warn(`Webhook received for unknown judgeToken: ${token}`);
      return NextResponse.json({ message: "Submission not found in registry" }, { status: 200 });
    }

    const statusId = status?.id;
    let dbStatus: SubmissionStatus = SubmissionStatus.COMPLETED;
    let dbVerdict: Verdict = Verdict.INTERNAL_ERROR;

    // Map Judge0 Execution Status Codes
    switch (statusId) {
      case 1: // In Queue
        dbStatus = SubmissionStatus.QUEUED;
        dbVerdict = Verdict.PENDING;
        break;
      case 2: // Processing
        dbStatus = SubmissionStatus.RUNNING;
        dbVerdict = Verdict.PENDING;
        break;
      case 3: // Accepted
        dbStatus = SubmissionStatus.COMPLETED;
        dbVerdict = Verdict.ACCEPTED;
        break;
      case 4: // Wrong Answer
        dbStatus = SubmissionStatus.COMPLETED;
        dbVerdict = Verdict.WRONG_ANSWER;
        break;
      case 5: // Time Limit Exceeded
        dbStatus = SubmissionStatus.COMPLETED;
        dbVerdict = Verdict.TLE;
        break;
      case 6: // Compilation Error
        dbStatus = SubmissionStatus.COMPLETED;
        dbVerdict = Verdict.COMPILATION_ERROR;
        break;
      case 7:  // Runtime Error (SIGXFSZ)
      case 8:  // Runtime Error (SIGFPE)
      case 9:  // Runtime Error (SIGABRT)
      case 10: // Runtime Error (NZEC)
      case 11: // Runtime Error (Other)
        dbStatus = SubmissionStatus.COMPLETED;
        dbVerdict = Verdict.RUNTIME_ERROR;
        break;
      case 12: // Internal Error
        dbStatus = SubmissionStatus.FAILED;
        dbVerdict = Verdict.INTERNAL_ERROR;
        break;
      case 13: // Executed (Format Error)
        dbStatus = SubmissionStatus.COMPLETED;
        dbVerdict = Verdict.WRONG_ANSWER;
        break;
      default:
        dbStatus = SubmissionStatus.FAILED;
        dbVerdict = Verdict.INTERNAL_ERROR;
        break;
    }

    // Convert time (seconds string) to milliseconds
    const executionTimeMs = time ? Math.round(parseFloat(time) * 1000) : undefined;
    // Memory used (KB string)
    const memoryUsedKb = memory ? Math.round(parseFloat(memory)) : undefined;

    // Update database record
    await SubmissionService.updateSubmissionResult(submission.id, {
      status: dbStatus,
      verdict: dbVerdict,
      executionTime: executionTimeMs,
      memoryUsed: memoryUsedKb,
      compileOutput: decodeBase64(compile_output),
      runtimeOutput: decodeBase64(stdout),
      errorOutput: decodeBase64(stderr),
    });

    return NextResponse.json({ message: "Result updated successfully" });
  } catch (err: any) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Judge0 defaults to PUT for webhooks
export async function PUT(request: Request) {
  return POST(request);
}
