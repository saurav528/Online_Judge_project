import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { loadEnvFile } from "process";

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  try {
    loadEnvFile(envPath);
  } catch (e) {}
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Clearing dummy data for production launch...");

  // Delete user-generated transactional data
  const submissionsDeleted = await prisma.submission.deleteMany();
  console.log(`Deleted ${submissionsDeleted.count} submissions.`);

  const contestParticipantsDeleted = await prisma.contestParticipant.deleteMany();
  console.log(`Deleted ${contestParticipantsDeleted.count} contest participants.`);

  const duelRoomsDeleted = await prisma.duelRoom.deleteMany();
  console.log(`Deleted ${duelRoomsDeleted.count} duel rooms.`);

  const duelQueuesDeleted = await prisma.duelQueue.deleteMany();
  console.log(`Deleted ${duelQueuesDeleted.count} duel queues.`);

  // Delete sessions and accounts
  const sessionsDeleted = await prisma.session.deleteMany();
  console.log(`Deleted ${sessionsDeleted.count} sessions.`);

  const accountsDeleted = await prisma.account.deleteMany();
  console.log(`Deleted ${accountsDeleted.count} accounts.`);

  // Delete all non-admin users
  const usersDeleted = await prisma.user.deleteMany({
    where: {
      role: {
        not: "ADMIN",
      },
    },
  });
  console.log(`Deleted ${usersDeleted.count} student users.`);

  // Update admin rating back to default
  await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: { rating: 1500 },
  });

  console.log("Database cleared successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
