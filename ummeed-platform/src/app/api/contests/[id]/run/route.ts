import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth-utils";
import { ContestService } from "@/lib/services/contest";
import { prisma } from "@/config/db";
import { WrapperService } from "@/lib/services/wrapper";
import { LANGUAGE_REGISTRY } from "@/lib/boilerplate/languages";
import { SEEDED_SIGNATURES } from "@/lib/services/executor";
import fs from "fs";
import path from "path";

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

    // 1. Validate contest
    const contest = await ContestService.getContest(contestId);
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }
    if (contest.status !== "RUNNING") {
      return NextResponse.json({ error: "Contest is not running" }, { status: 400 });
    }

    // Validate registration
    const isRegistered = await ContestService.isRegistered(contestId, user.id);
    if (!isRegistered) {
      return NextResponse.json({ error: "Not registered" }, { status: 403 });
    }

    // 2. Fetch problem
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: { orderBy: { order: "asc" } } },
    });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Resolve signature
    const jsonPath = path.join(process.cwd(), "..", "problems", problem.slug, "problem.json");
    let signature = SEEDED_SIGNATURES[problem.slug];
    if (fs.existsSync(jsonPath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        if (fileContent.signature) signature = fileContent.signature;
      } catch {}
    }

    // 3. Wrap code
    let wrappedCode = sourceCode;
    if (signature) {
      try {
        wrappedCode = WrapperService.wrapSolution(sourceCode, signature, language);
      } catch (e: any) {
        return NextResponse.json({ error: `Code wrapping failed: ${e.message || e}` }, { status: 400 });
      }
    }

    // 4. Load sample testcases
    const sampleCases = problem.testCases.filter((tc) => tc.isSample);
    const casesToRun = sampleCases.length > 0 ? sampleCases : problem.testCases.slice(0, 1);

    if (casesToRun.length === 0) {
      return NextResponse.json({ error: "No testcases available for this problem" }, { status: 400 });
    }

    let consolidatedInput = signature ? `${casesToRun.length}\n` : "";
    let consolidatedOutput = "";
    const testcaseDetails: any[] = [];

    for (const tc of casesToRun) {
      const inputFullPath = path.join(process.cwd(), "..", tc.inputPath);
      const outputFullPath = path.join(process.cwd(), "..", tc.outputPath);
      const inputVal = fs.readFileSync(inputFullPath, "utf-8").trim();
      const outputVal = fs.readFileSync(outputFullPath, "utf-8").trim();

      consolidatedInput += inputVal + "\n";
      consolidatedOutput += outputVal + "\n";
      testcaseDetails.push({ input: inputVal, expected: outputVal });
    }

    // 5. Send to Judge0
    const base64Source = Buffer.from(wrappedCode).toString("base64");
    const base64Input = Buffer.from(consolidatedInput).toString("base64");
    const base64Output = Buffer.from(consolidatedOutput).toString("base64");
    const langDef = LANGUAGE_REGISTRY[language as keyof typeof LANGUAGE_REGISTRY];

    const apiUrl = `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`;
    const apiKey = process.env.JUDGE0_API_KEY || "";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["x-rapidapi-key"] = apiKey;
      headers["x-rapidapi-host"] = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: base64Source,
        language_id: langDef.judge0Id,
        stdin: base64Input,
        expected_output: base64Output,
      }),
    });

    if (!response.ok) {
      throw new Error(`Judge0 responded with status ${response.status}`);
    }

    const resBody = await response.json();
    const decodeBase64 = (str: string | null) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

    const stdout = decodeBase64(resBody.stdout);
    const stderr = decodeBase64(resBody.stderr);
    const compileOutput = decodeBase64(resBody.compile_output);

    return NextResponse.json({
      statusId: resBody.status?.id,
      statusDescription: resBody.status?.description,
      stdout,
      stderr,
      compileOutput,
      time: resBody.time,
      memory: resBody.memory,
      testcases: testcaseDetails,
    });
  } catch (err: any) {
    console.error("Run code error:", err);
    return NextResponse.json({ error: `Run code error: ${err.message || err}` }, { status: 500 });
  }
}
