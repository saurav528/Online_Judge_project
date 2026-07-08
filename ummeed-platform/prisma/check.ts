import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { loadEnvFile } from "process";

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  try {
    loadEnvFile(envPath);
  } catch (e) {}
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const subs = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      problem: true
    }
  });
  console.log(JSON.stringify(subs, null, 2));
}

main().finally(() => pool.end());
