import fs from "fs";
import path from "path";
import { ProblemSignature } from "../src/server/services/boilerplate/types";
import { BoilerplateGenerator } from "../src/server/services/boilerplate/generator";
import { LANGUAGE_REGISTRY } from "../src/server/services/boilerplate/languages";

const PROBLEMS_DIR = path.join(process.cwd(), "..", "problems");

interface ProblemSignatureMap {
  [slug: string]: ProblemSignature;
}

// Built-in standard signatures for common DSA problem patterns
export const STANDARD_SIGNATURES: ProblemSignatureMap = {
  "two-sum": {
    className: "Solution",
    functionName: "twoSum",
    returnType: "int[]",
    parameters: [
      { name: "n", type: "int" },
      { name: "target", type: "int" },
      { name: "nums", type: "int[]" }
    ]
  },
  "valid-parentheses": {
    className: "Solution",
    functionName: "isValid",
    returnType: "boolean",
    parameters: [
      { name: "s", type: "string" }
    ]
  },
  "longest-substring-without-repeating-characters": {
    className: "Solution",
    functionName: "lengthOfLongestSubstring",
    returnType: "int",
    parameters: [
      { name: "s", type: "string" }
    ]
  },
  "maximum-subarray-sum": {
    className: "Solution",
    functionName: "maxSubArray",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" },
      { name: "nums", type: "int[]" }
    ]
  },
  "trapping-rain-water": {
    className: "Solution",
    functionName: "trap",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" },
      { name: "height", type: "int[]" }
    ]
  }
};

/**
 * Generates and saves student boilerplate & execution driver code files
 * for a given problem slug and its signature.
 */
export function generateBoilerplateForProblem(slug: string, signature: ProblemSignature) {
  const problemDir = path.join(PROBLEMS_DIR, slug);
  const jsonPath = path.join(problemDir, "problem.json");

  if (!fs.existsSync(problemDir)) {
    fs.mkdirSync(problemDir, { recursive: true });
  }

  // 1. Update problem.json with the signature metadata
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const metadata = JSON.parse(raw);
    metadata.signature = signature;
    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), "utf-8");
  }

  // 2. Prepare directories
  const boilerplateDir = path.join(problemDir, "boilerplate");
  const boilerplateFullDir = path.join(problemDir, "boilerplate_full");
  fs.mkdirSync(boilerplateDir, { recursive: true });
  fs.mkdirSync(boilerplateFullDir, { recursive: true });

  // 3. Generate boilerplate code for all 4 supported languages
  for (const [langKey, langDef] of Object.entries(LANGUAGE_REGISTRY)) {
    try {
      const studentStub = BoilerplateGenerator.generateStudentBoilerplate(langKey, signature);
      const executionWrapper = BoilerplateGenerator.generateExecutionWrapper(langKey, signature);

      const fileName = `${langKey}.${langDef.extension}`;
      fs.writeFileSync(path.join(boilerplateDir, fileName), studentStub, "utf-8");
      fs.writeFileSync(path.join(boilerplateFullDir, fileName), executionWrapper, "utf-8");

      console.log(`  ✓ Generated ${langKey} boilerplate for ${slug}`);
    } catch (err) {
      console.error(`  ✗ Failed ${langKey} generation for ${slug}:`, err);
    }
  }
}

/**
 * CLI runner to generate boilerplate for all problems with signatures or specified target slug.
 */
function main() {
  const targetSlug = process.argv[2];

  if (targetSlug) {
    const sig = STANDARD_SIGNATURES[targetSlug];
    if (!sig) {
      console.error(`No pre-defined signature found for slug '${targetSlug}'.`);
      process.exit(1);
    }
    console.log(`Generating boilerplate for target problem '${targetSlug}'...`);
    generateBoilerplateForProblem(targetSlug, sig);
  } else {
    console.log("Generating boilerplate for all standard problems...");
    for (const [slug, sig] of Object.entries(STANDARD_SIGNATURES)) {
      console.log(`Processing problem: ${slug}`);
      generateBoilerplateForProblem(slug, sig);
    }
  }

  console.log("\n✨ Boilerplate code & execution drivers generated successfully!");
}

if (require.main === module) {
  main();
}
