import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { DuelService } from "@/lib/services/duel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { roomId } = resolvedParams;

    const status = await DuelService.getRoomStatus(roomId, user.id);
    if (!status) {
      return NextResponse.json({ error: "Duel room not found" }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch room status" }, { status: 500 });
  }
}
