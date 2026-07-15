import { prisma } from "@/lib/prisma";
import { SubmissionStatus, Verdict } from "@prisma/client";
import fs from "fs";
import path from "path";
import { ProblemSignature } from "../boilerplate/types";
import { WrapperService } from "./wrapper";
import { LANGUAGE_REGISTRY } from "../boilerplate/languages";
import { ContestService } from "./contest";
import { DuelService } from "./duel";


export interface SubmissionExecutor {
  execute(submissionId: string): Promise<void>;
}

// Mapped signatures for the 12 default seeded school-level problems
export const SEEDED_SIGNATURES: Record<string, ProblemSignature> = {
  "add-two-numbers": {
    className: "Solution",
    functionName: "add",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
    ],
  },
  "even-or-odd": {
    className: "Solution",
    functionName: "check",
    returnType: "string",
    parameters: [{ name: "n", type: "int" }],
  },
  "celsius-to-fahrenheit": {
    className: "Solution",
    functionName: "convert",
    returnType: "double",
    parameters: [{ name: "c", type: "double" }],
  },
  "find-maximum": {
    className: "Solution",
    functionName: "max",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
    ],
  },
  factorial: {
    className: "Solution",
    functionName: "factorial",
    returnType: "int",
    parameters: [{ name: "n", type: "int" }],
  },
  "leap-year-check": {
    className: "Solution",
    functionName: "isLeap",
    returnType: "string",
    parameters: [{ name: "year", type: "int" }],
  },
  "palindrome-check": {
    className: "Solution",
    functionName: "isPalindrome",
    returnType: "string",
    parameters: [{ name: "s", type: "string" }],
  },
  "fibonacci-number": {
    className: "Solution",
    functionName: "getFib",
    returnType: "int",
    parameters: [{ name: "n", type: "int" }],
  },
  "count-vowels": {
    className: "Solution",
    functionName: "count",
    returnType: "int",
    parameters: [{ name: "s", type: "string" }],
  },
  "prime-number-check": {
    className: "Solution",
    functionName: "isPrime",
    returnType: "string",
    parameters: [{ name: "n", type: "int" }],
  },
  "sum-of-array": {
    className: "Solution",
    functionName: "sum",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" },
      { name: "arr", type: "int[]" },
    ],
  },
  "reversed-string": {
    className: "Solution",
    functionName: "reverse",
    returnType: "string",
    parameters: [{ name: "s", type: "string" }],
  },
};

export class Judge0Executor implements SubmissionExecutor {
  async execute(submissionId: string): Promise<void> {
    this.runExecution(submissionId).catch((err) => {
      console.error(`Judge0 execution trigger failed for submission ${submissionId}:`, err);
    });
  }

  private async runExecution(submissionId: string): Promise<void> {
    // 1. Fetch submission and its problem metadata
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: {
          include: {
            testCases: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!submission) {
      console.error(`Submission ${submissionId} not found in database.`);
      return;
    }

    const problem = submission.problem;

    // 2. Resolve problem signature (use custom signature saved in json if available, otherwise fallback to seeded mapping)
    const problemDir = path.join(process.cwd(), "..", "problems", problem.slug);
    const jsonPath = path.join(problemDir, "problem.json");

    let signature = SEEDED_SIGNATURES[problem.slug];

    if (fs.existsSync(jsonPath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        if (fileContent.signature) {
          signature = fileContent.signature;
        }
      } catch (e) {
        console.warn("Could not read signature from problem.json", e);
      }
    }

    // 3. Construct the wrapped executable program
    let wrappedCode = submission.sourceCode;
    if (signature) {
      try {
        wrappedCode = WrapperService.wrapSolution(
          submission.sourceCode,
          signature,
          submission.language
        );
      } catch (e: any) {
        console.error("Code wrapping failed", e);
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.FAILED,
            verdict: Verdict.INTERNAL_ERROR,
            errorOutput: `Code wrapping failed: ${e.message || e}`,
          },
        });
        return;
      }
    }

    // 4. Consolidate all testcases into a single stream (with testcase count T at the top if signature exists)
    let consolidatedInput = signature ? `${problem.testCases.length}\n` : "";
    let consolidatedOutput = "";

    try {
      for (const tc of problem.testCases) {
        const inputFullPath = path.join(process.cwd(), "..", tc.inputPath);
        const outputFullPath = path.join(process.cwd(), "..", tc.outputPath);

        if (!fs.existsSync(inputFullPath) || !fs.existsSync(outputFullPath)) {
          throw new Error(`Missing testcase files at ${tc.inputPath}`);
        }

        consolidatedInput += fs.readFileSync(inputFullPath, "utf-8").trim() + "\n";
        consolidatedOutput += fs.readFileSync(outputFullPath, "utf-8").trim() + "\n";
      }
    } catch (e: any) {
      console.error("Consolidating test cases failed", e);
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.FAILED,
          verdict: Verdict.INTERNAL_ERROR,
          errorOutput: `Failed to load test cases: ${e.message || e}`,
        },
      });
      return;
    }

    // 5. Send POST batch payload to Judge0 API using base64 encoding
    const base64Source = Buffer.from(wrappedCode).toString("base64");
    const base64Input = Buffer.from(consolidatedInput).toString("base64");
    const base64Output = Buffer.from(consolidatedOutput).toString("base64");

    const langDef = LANGUAGE_REGISTRY[submission.language];

    // Wait=true to get the execution result synchronously
    const apiUrl = `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`;
    const apiKey = process.env.JUDGE0_API_KEY || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["x-rapidapi-key"] = apiKey;
      headers["x-rapidapi-host"] = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
    }

    try {
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
      
      const { token, status, stdout, stderr, compile_output, time, memory } = resBody;

      function decodeBase64(str: string | null | undefined): string {
        if (!str) return "";
        try {
          return Buffer.from(str, "base64").toString("utf-8");
        } catch (e) {
          return str;
        }
      }

      const statusId = status?.id;
      let dbStatus: SubmissionStatus = SubmissionStatus.COMPLETED;
      let dbVerdict: Verdict = Verdict.INTERNAL_ERROR;

      switch (statusId) {
        case 1: dbStatus = SubmissionStatus.QUEUED; dbVerdict = Verdict.PENDING; break;
        case 2: dbStatus = SubmissionStatus.RUNNING; dbVerdict = Verdict.PENDING; break;
        case 3: dbStatus = SubmissionStatus.COMPLETED; dbVerdict = Verdict.ACCEPTED; break;
        case 4: dbStatus = SubmissionStatus.COMPLETED; dbVerdict = Verdict.WRONG_ANSWER; break;
        case 5: dbStatus = SubmissionStatus.COMPLETED; dbVerdict = Verdict.TLE; break;
        case 6: dbStatus = SubmissionStatus.COMPLETED; dbVerdict = Verdict.COMPILATION_ERROR; break;
        case 7:
        case 8:
        case 9:
        case 10:
        case 11: dbStatus = SubmissionStatus.COMPLETED; dbVerdict = Verdict.RUNTIME_ERROR; break;
        case 12: dbStatus = SubmissionStatus.FAILED; dbVerdict = Verdict.RUNTIME_ERROR; break;
        case 13: dbStatus = SubmissionStatus.FAILED; dbVerdict = Verdict.INTERNAL_ERROR; break;
        case 14: dbStatus = SubmissionStatus.FAILED; dbVerdict = Verdict.INTERNAL_ERROR; break;
        default: dbStatus = SubmissionStatus.FAILED; dbVerdict = Verdict.INTERNAL_ERROR; break;
      }

      // Calculate passed test cases count
      let passedCount = 0;
      if (dbVerdict === Verdict.ACCEPTED) {
        passedCount = problem.testCases.length;
      } else if (dbVerdict === Verdict.WRONG_ANSWER) {
        const expectedLines = consolidatedOutput.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        const actualLines = decodeBase64(stdout).split("\n").map(l => l.trim()).filter(l => l.length > 0);
        for (let i = 0; i < expectedLines.length; i++) {
          if (actualLines[i] === expectedLines[i]) {
            passedCount++;
          }
        }
      }

      // 6. Update submission record with execution results synchronously
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: dbStatus,
          verdict: dbVerdict,
          judgeToken: token || undefined,
          executionTime: executionTimeMs,
          memoryUsed: memoryUsedKb,
          compileOutput: decodeBase64(compile_output),
          runtimeOutput: decodeBase64(stdout),
          errorOutput: decodeBase64(stderr),
          score: passedCount,
        },
      });

      // 7. If this is a contest submission, recalculate the participant's score
      if (updatedSubmission.contestId) {
        ContestService.recalculateScore(updatedSubmission.contestId, updatedSubmission.userId).catch(
          (err) => console.error("Failed to recalculate contest score:", err)
        );
      }

      // 8. If the user is in an active duel room, update their score
      DuelService.handleSubmission(
        updatedSubmission.userId,
        updatedSubmission.problemId,
        updatedSubmission.verdict
      ).catch((err) => console.error("Failed to update duel score:", err));

    } catch (e: any) {
      console.error("Failed to forward code to Judge0", e);
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.FAILED,
          verdict: Verdict.INTERNAL_ERROR,
          errorOutput: `Failed to contact Judge0 compiler: ${e.message || e}`,
        },
      });
    }
  }
}

export const submissionExecutor: SubmissionExecutor = new Judge0Executor();
