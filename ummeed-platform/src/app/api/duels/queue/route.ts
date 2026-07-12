import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { DuelService } from "@/lib/services/duel";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const difficulty = (body.difficulty || "EASY") as Difficulty;

    const result = await DuelService.joinQueue(user.id, difficulty);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Matchmaking error:", error);
    return NextResponse.json({ error: error.message || "Matchmaking failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await DuelService.leaveQueue(user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to leave queue" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is in an active duel room (status = PLAYING)
    const activeRoom = await prisma.duelRoom.findFirst({
      where: {
        status: "PLAYING",
        OR: [{ player1Id: user.id }, { player2Id: user.id }],
      },
    });

    if (activeRoom) {
      return NextResponse.json({ matched: true, roomId: activeRoom.id });
    }

    // Check if still in queue
    const queueEntry = await prisma.duelQueue.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      matched: false,
      inQueue: !!queueEntry,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
