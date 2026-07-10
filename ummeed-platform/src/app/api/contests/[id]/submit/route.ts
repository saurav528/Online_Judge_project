import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { ContestService } from "@/lib/services/contest";
import { SubmissionService } from "@/lib/services/submission";
import { prisma } from "@/lib/prisma";
import { Language } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: contestId } = await params;
    const body = await req.json();
    const { problemId, language, sourceCode } = body;

    if (!problemId || !language || !sourceCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate contest exists and is RUNNING
    const contest = await ContestService.getContest(contestId);
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }
    if (contest.status !== "RUNNING") {
      return NextResponse.json({ error: "Contest is not currently running" }, { status: 400 });
    }

    // Validate user is registered
    const registered = await ContestService.isRegistered(contestId, user.id);
    if (!registered) {
      return NextResponse.json({ error: "You are not registered for this contest" }, { status: 403 });
    }

    // Validate problem belongs to this contest
    const contestProblem = await prisma.contestProblem.findUnique({
      where: { contestId_problemId: { contestId, problemId } },
    });
    if (!contestProblem) {
      return NextResponse.json({ error: "Problem not found in this contest" }, { status: 404 });
    }

    // Validate language enum
    const validLanguages = Object.values(Language) as string[];
    if (!validLanguages.includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    const submission = await SubmissionService.createSubmission({
      userId: user.id,
      problemId,
      language: language as Language,
      sourceCode,
      contestId,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error("Contest submission error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
