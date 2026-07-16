import { NextRequest, NextResponse } from "next/server";
import { getProblemContent } from "@/lib/problems-fs";
import { prisma } from "@/config/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const problem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (!problem || !problem.published) {
      return NextResponse.json({ error: "Problem not found or not published" }, { status: 404 });
    }

    const fileContent = await getProblemContent(slug);
    if (!fileContent) {
      return NextResponse.json({ error: "Problem details not found on disk" }, { status: 404 });
    }

    return NextResponse.json(fileContent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
