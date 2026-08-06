import { z } from "zod";

export const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export const LanguageSchema = z.enum(["CPP", "PYTHON", "JAVA", "JAVASCRIPT"]);
