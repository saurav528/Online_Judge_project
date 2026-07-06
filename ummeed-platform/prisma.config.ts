import { join } from "path";
import { existsSync } from "fs";
import { loadEnvFile } from "process";

const envPath = join(process.cwd(), ".env");
if (existsSync(envPath)) {
  try {
    loadEnvFile(envPath);
  } catch (e) {
    // Fail silently if not supported
  }
}

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://mock_user:mock_pass@localhost:5432/mock_db?schema=public",
  },
};
