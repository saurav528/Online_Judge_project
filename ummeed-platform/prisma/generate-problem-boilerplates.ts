import fs from "fs";
import path from "path";
import { saveProblemContent, getProblemContent } from "../src/lib/problems-fs";
import { SEEDED_SIGNATURES } from "../src/lib/services/executor";

async function generateAllBoilerplates() {
  const problemsDir = path.join(process.cwd(), "..", "problems");
  if (!fs.existsSync(problemsDir)) {
    console.error("Problems directory not found at:", problemsDir);
    return;
  }

  const entries = fs.readdirSync(problemsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const slug = entry.name;
      console.log(`Processing problem: ${slug}...`);

      const content = await getProblemContent(slug);
      if (!content) {
        console.warn(`Skipping ${slug}: problem.json not found.`);
        continue;
      }

      // Resolve signature
      const signature = content.signature || SEEDED_SIGNATURES[slug];
      if (!signature) {
        console.warn(`Skipping ${slug}: No signature found.`);
        continue;
      }

      // Re-save problem content to generate boilerplate/ & boilerplate_full/ directories
      await saveProblemContent(slug, {
        statement: content.statement,
        inputSpecification: content.inputSpecification,
        outputSpecification: content.outputSpecification,
        constraints: content.constraints,
        explanation: content.explanation,
        examples: content.examples,
        testCases: content.testCases,
        signature: signature,
      });

      console.log(`✓ Boilerplate files successfully generated for ${slug}`);
    }
  }

  console.log("\n✅ Done! All problem folders now contain boilerplate and boilerplate_full directories.");
}

generateAllBoilerplates().catch((err) => {
  console.error("Error generating boilerplates:", err);
});
