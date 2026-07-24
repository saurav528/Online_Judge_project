import { z } from "zod";
import { DifficultySchema } from "./shared";

export const ProblemExampleSchema = z.object({
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
  explanation: z.string().optional(),
  displayOrder: z.number().int().nonnegative(),
});

export const ProblemTestCaseSchema = z.object({
  order: z.number().int().nonnegative(),
  isSample: z.boolean().default(false),
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
});

export const ParamTypeSchema = z.enum([
  "int",
  "double",
  "string",
  "boolean",
  "int[]",
  "string[]",
  "int[][]",
]);

export const ParameterSchema = z.object({
  name: z.string().min(1, "Parameter name is required"),
  type: ParamTypeSchema,
});

export const ProblemSignatureSchema = z.object({
  className: z.string().min(1, "Class name is required").default("Solution"),
  functionName: z.string().min(1, "Function name is required"),
  returnType: ParamTypeSchema,
  parameters: z.array(ParameterSchema),
});

export const ProblemFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  difficulty: DifficultySchema,
  timeLimit: z.number().int().positive("Time limit must be positive (ms)"),
  memoryLimit: z.number().int().positive("Memory limit must be positive (MB)"),
  published: z.boolean().default(false),
  tags: z.array(z.string()).min(1, "At least one tag is required"),

  // Git-backed rich text content
  statement: z.string().min(10, "Statement must be at least 10 characters"),
  inputSpecification: z.string().min(1, "Input specification is required"),
  outputSpecification: z.string().min(1, "Output specification is required"),
  constraints: z.string().min(1, "Constraints are required"),
  explanation: z.string().optional(),
  examples: z.array(ProblemExampleSchema).min(1, "At least one example is required"),
  testCases: z.array(ProblemTestCaseSchema).min(3, "At least 3 test cases are required"),
  signature: ProblemSignatureSchema.optional(),
});

export const ProblemSearchSchema = z.object({
  q: z.string().optional(),
  difficulty: DifficultySchema.or(z.literal("")).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
