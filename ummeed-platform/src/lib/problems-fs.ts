import fs from "fs";
import path from "path";

// Locate the problems directory in the root of the workspace
const PROBLEMS_DIR = path.join(process.cwd(), "..", "problems");

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
  displayOrder: number;
}

export interface ProblemTestCase {
  order: number;
  isSample: boolean;
  input: string;
  output: string;
}

export interface ProblemContent {
  statement: string;
  inputSpecification: string;
  outputSpecification: string;
  constraints: string;
  explanation?: string;
  examples: ProblemExample[];
  testCases: ProblemTestCase[];
  signature?: any;
}

/**
 * Ensures that the root problems directory exists.
 */
function ensureProblemsDir() {
  if (!fs.existsSync(PROBLEMS_DIR)) {
    fs.mkdirSync(PROBLEMS_DIR, { recursive: true });
  }
}

/**
 * Saves a problem's Git-backed content (statement, specs, examples, and test cases) to the filesystem.
 */
export async function saveProblemContent(slug: string, content: ProblemContent): Promise<void> {
  ensureProblemsDir();
  const problemDir = path.join(PROBLEMS_DIR, slug);
  const testsDir = path.join(problemDir, "tests");

  // Create problem and tests directories
  fs.mkdirSync(testsDir, { recursive: true });

  // 1. Save problem description metadata (omitting raw test case contents)
  const metadataContent = {
    statement: content.statement,
    inputSpecification: content.inputSpecification,
    outputSpecification: content.outputSpecification,
    constraints: content.constraints,
    explanation: content.explanation,
    examples: content.examples,
    // Store only test case references (without body text) in the JSON to keep it lightweight
    testCases: content.testCases.map((tc) => ({
      order: tc.order,
      isSample: tc.isSample,
      inputPath: `problems/${slug}/tests/${tc.order}.in`,
      outputPath: `problems/${slug}/tests/${tc.order}.out`,
    })),
  };

  fs.writeFileSync(
    path.join(problemDir, "problem.json"),
    JSON.stringify(metadataContent, null, 2),
    "utf-8"
  );

  // 2. Save individual raw test case files for Judge0
  for (const tc of content.testCases) {
    fs.writeFileSync(path.join(testsDir, `${tc.order}.in`), tc.input, "utf-8");
    fs.writeFileSync(path.join(testsDir, `${tc.order}.out`), tc.output, "utf-8");
  }
}

/**
 * Reads a problem's Git-backed content from the filesystem.
 */
export async function getProblemContent(slug: string): Promise<ProblemContent | null> {
  const problemDir = path.join(PROBLEMS_DIR, slug);
  const jsonPath = path.join(problemDir, "problem.json");

  if (!fs.existsSync(jsonPath)) {
    return null;
  }

  const jsonRaw = fs.readFileSync(jsonPath, "utf-8");
  const metadata = JSON.parse(jsonRaw);

  // Hydrate the test cases by reading their input/output files from disk
  const hydratedTestCases: ProblemTestCase[] = [];
  const testsDir = path.join(problemDir, "tests");

  if (fs.existsSync(testsDir)) {
    for (const tcRef of metadata.testCases || []) {
      const inputPath = path.join(testsDir, `${tcRef.order}.in`);
      const outputPath = path.join(testsDir, `${tcRef.order}.out`);

      const input = fs.existsSync(inputPath) ? fs.readFileSync(inputPath, "utf-8") : "";
      const output = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf-8") : "";

      hydratedTestCases.push({
        order: tcRef.order,
        isSample: tcRef.isSample,
        input,
        output,
      });
    }
  }

  return {
    statement: metadata.statement,
    inputSpecification: metadata.inputSpecification,
    outputSpecification: metadata.outputSpecification,
    constraints: metadata.constraints,
    explanation: metadata.explanation,
    examples: metadata.examples || [],
    testCases: hydratedTestCases,
    signature: metadata.signature,
  };
}

/**
 * Deletes a problem's Git-backed content directory.
 */
export async function deleteProblemContent(slug: string): Promise<void> {
  const problemDir = path.join(PROBLEMS_DIR, slug);
  if (fs.existsSync(problemDir)) {
    fs.rmSync(problemDir, { recursive: true, force: true });
  }
}
