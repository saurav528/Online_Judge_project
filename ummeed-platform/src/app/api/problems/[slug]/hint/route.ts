import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProblemContent } from "@/lib/problems-fs";
import { getCurrentUser } from "@/lib/auth-utils";
import { GoogleGenAI } from "@google/genai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { sourceCode, language } = body;

    const problem = await prisma.problem.findUnique({ where: { slug } });
    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

    const fileContent = await getProblemContent(slug);
    if (!fileContent) return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // Initialize the official new unified Google Gen AI client
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a helpful coding tutor on a competitive programming platform called Ummeed Coding Platform.
Your job is to give a student a constructive hint based on their current progress.
Rules:
1. NEVER write any complete code or solution blocks for the student.
2. If they have not written much code, guide them on the general algorithmic approach (e.g. "Try using a sliding window").
3. If they have code with bugs, explain the logical error or corner case they might have missed, and give a tiny example trace.
4. Keep the tone encouraging, educational, and concise. Format the response clearly using Markdown (bolding, bullet points).`;

    const userPrompt = `
Problem: "${problem.title}"
Statement:
${fileContent.statement}

Constraints:
${fileContent.constraints}

Student's Programming Language: ${language}
Student's Current Source Code:
\`\`\`${language.toLowerCase()}
${sourceCode || "// No code written yet."}
\`\`\`

Analyze the student's code (or lack thereof) against the problem statement. Generate a helpful, constructive, step-by-step hint or bug pointer. Remember: Do not give away the full solution code.
`;

    // Using gemini-3.5-flash which is the standard free-tier model with active quotas in 2026
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt + "\n\n" + userPrompt,
    });

    const hint = response.text || "No hint generated.";
    return NextResponse.json({ hint });
  } catch (error: any) {
    console.error("Gemini New API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate hint" }, { status: 500 });
  }
}
