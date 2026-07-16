import { z } from "zod";
import { LanguageSchema } from "./shared";

export const SubmissionCreateSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID format"),
  language: LanguageSchema,
  sourceCode: z
    .string()
    .min(10, "Source code must be at least 10 characters")
    .max(65536, "Source code cannot exceed 64 KB"),
});
