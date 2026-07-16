import { z } from "zod";

export const ContestProblemFormSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID format"),
  points: z.number().int().positive("Points must be positive").default(100),
  sequence: z.number().int().nonnegative("Sequence must be non-negative"),
});

export const ContestFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  published: z.boolean().default(false),
  problems: z.array(ContestProblemFormSchema).default([]),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});
