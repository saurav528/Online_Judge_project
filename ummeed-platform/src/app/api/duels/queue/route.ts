import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/auth-utils";
import { DuelService } from "@/server/services/duel";
import { prisma } from "@/server/db/db";
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

    // 1. Check if the user is in an active (unexpired) duel room
    const activeRoom = await DuelService.getActiveRoomForUser(user.id);
    if (activeRoom) {
      return NextResponse.json({ matched: true, roomId: activeRoom.id });
    }

    // 2. Check if user is currently in queue
    const queueEntry = await prisma.duelQueue.findUnique({
      where: { userId: user.id },
    });

    if (queueEntry) {
      // Send heartbeat ping to keep queue entry alive while polling
      await DuelService.heartbeatQueue(user.id);
      return NextResponse.json({
        matched: false,
        inQueue: true,
      });
    }

    return NextResponse.json({
      matched: false,
      inQueue: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
