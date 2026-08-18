const { PrismaClient, Difficulty } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL || "postgresql://ummeed_admin:ummeed_secure_password@localhost:5432/ummeed_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PROBLEMS = [
  {
    slug: "favorite-movies-list",
    title: "Store Favorite Movies",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["List", "Basics", "Array"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  },
  {
    slug: "list-palindrome-check",
    title: "List Palindrome Check",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Array", "List", "Two Pointers"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  },
  {
    slug: "count-grade-a",
    title: "Count Grade A Students",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Array", "Tuple", "Counting"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  },
  {
    slug: "sort-grades",
    title: "Sort Student Grades",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Array", "Sorting", "String"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  },
  {
    slug: "multiple-of-seven",
    title: "Multiple of 7 Check",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Math", "Conditionals", "Basics"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false },
      { order: 6, isSample: false }
    ]
  },
  {
    slug: "word-dictionary-meaning",
    title: "Word Dictionary Lookup",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Python", "Dictionary", "Basics"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  },
  {
    slug: "count-classrooms-needed",
    title: "Count Classrooms Needed",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Python", "Set", "Array", "Basics"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  },
  {
    slug: "subject-marks-total",
    title: "Store Subject Marks in Dictionary",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Python", "Dictionary", "Math", "Basics"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  },
  {
    slug: "store-int-and-float-in-set",
    title: "Store Integer and Float in Set",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Python", "Set", "Data Types"],
    testCases: [
      { order: 1, isSample: true },
      { order: 2, isSample: true },
      { order: 3, isSample: false },
      { order: 4, isSample: false },
      { order: 5, isSample: false }
    ]
  }
];

async function main() {
  console.log("Upserting new problems to database...");

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  }) || await prisma.user.findFirst();

  if (!admin) {
    throw new Error("No user found in database");
  }

  for (const prob of PROBLEMS) {
    console.log(`Processing: ${prob.title}`);

    // Create or connect tags
    const tagConnectOrCreate = [];
    for (const tagName of prob.tags) {
      const tagRecord = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });
      tagConnectOrCreate.push({ id: tagRecord.id });
    }

    // Upsert Problem
    const existingProblem = await prisma.problem.findUnique({
      where: { slug: prob.slug }
    });

    let dbProblem;
    if (existingProblem) {
      dbProblem = await prisma.problem.update({
        where: { id: existingProblem.id },
        data: {
          title: prob.title,
          difficulty: prob.difficulty,
          timeLimit: prob.timeLimit,
          memoryLimit: prob.memoryLimit,
          published: true,
          tags: {
            set: tagConnectOrCreate
          }
        }
      });
    } else {
      dbProblem = await prisma.problem.create({
        data: {
          title: prob.title,
          slug: prob.slug,
          difficulty: prob.difficulty,
          timeLimit: prob.timeLimit,
          memoryLimit: prob.memoryLimit,
          published: true,
          createdById: admin.id,
          tags: {
            connect: tagConnectOrCreate
          }
        }
      });
    }

    // Delete existing test cases for this problem and re-create them
    await prisma.testCase.deleteMany({
      where: { problemId: dbProblem.id }
    });

    for (const tc of prob.testCases) {
      await prisma.testCase.create({
        data: {
          order: tc.order,
          isSample: tc.isSample,
          inputPath: `problems/${prob.slug}/tests/${tc.order}.in`,
          outputPath: `problems/${prob.slug}/tests/${tc.order}.out`,
          problemId: dbProblem.id
        }
      });
    }

    console.log(`✓ Synced ${prob.slug}`);
  }

  console.log("All problems upserted to database successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
