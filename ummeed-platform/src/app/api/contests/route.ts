import { NextResponse } from "next/server";
import { ContestService } from "@/lib/services/contest";

export async function GET() {
  try {
    const contests = await ContestService.listContests();
    return NextResponse.json(contests);
  } catch (err) {
    console.error("Failed to list contests:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
