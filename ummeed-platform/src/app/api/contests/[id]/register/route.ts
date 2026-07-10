import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { ContestService } from "@/lib/services/contest";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: contestId } = await params;

    const contest = await ContestService.getContest(contestId);
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.status === "ENDED") {
      return NextResponse.json(
        { error: "Registration is closed for ended contests" },
        { status: 400 }
      );
    }

    const participant = await ContestService.registerParticipant(contestId, user.id);
    return NextResponse.json(participant, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
