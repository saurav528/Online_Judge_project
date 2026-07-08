import { PrismaClient, Difficulty, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { loadEnvFile } from "process";

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  try {
    loadEnvFile(envPath);
  } catch (e) {
    // Fail silently
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Resolve paths relative to this seed file
const PROBLEMS_DIR = path.join(__dirname, "..", "..", "problems");

interface SeedProblem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  statement: string;
  inputSpecification: string;
  outputSpecification: string;
  constraints: string;
  explanation?: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
    displayOrder: number;
  }[];
  testCases: {
    order: number;
    isSample: boolean;
    input: string;
    output: string;
  }[];
}

const seedProblems: SeedProblem[] = [
  {
    slug: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Math", "Basics"],
    statement: "Write a program that takes two integers as input and prints their sum.",
    inputSpecification: "A single line containing two space-separated integers, $A$ and $B$.",
    outputSpecification: "Print a single integer representing the sum of $A$ and $B$.",
    constraints: "$-10^9 \\le A, B \\le 10^9$",
    explanation: "For input `3 5`, the sum is $3 + 5 = 8$.",
    examples: [
      { input: "3 5", output: "8", explanation: "3 + 5 = 8", displayOrder: 1 },
      { input: "-2 7", output: "5", explanation: "-2 + 7 = 5", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "3 5", output: "8" },
      { order: 2, isSample: true, input: "-2 7", output: "5" },
      { order: 3, isSample: false, input: "0 0", output: "0" }
    ]
  },
  {
    slug: "even-or-odd",
    title: "Even or Odd",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Conditionals", "Basics"],
    statement: "Given an integer $N$, determine whether it is even or odd.",
    inputSpecification: "A single integer $N$.",
    outputSpecification: "Print `Even` if the number is even, and `Odd` if it is odd.",
    constraints: "$-10^9 \\le N \\le 10^9$",
    examples: [
      { input: "4", output: "Even", displayOrder: 1 },
      { input: "7", output: "Odd", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "4", output: "Even" },
      { order: 2, isSample: true, input: "7", output: "Odd" },
      { order: 3, isSample: false, input: "0", output: "Even" },
      { order: 4, isSample: false, input: "-102", output: "Even" },
      { order: 5, isSample: false, input: "999999999", output: "Odd" }
    ]
  },
  {
    slug: "celsius-to-fahrenheit",
    title: "Celsius to Fahrenheit",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Math", "Basics"],
    statement: "Write a program that converts a temperature in Celsius to Fahrenheit. The formula is: $F = C \\times 1.8 + 32$.",
    inputSpecification: "A decimal number $C$ representing the temperature in Celsius.",
    outputSpecification: "Print the corresponding temperature in Fahrenheit. Round to 1 decimal place.",
    constraints: "$-100.0 \\le C \\le 100.0$",
    examples: [
      { input: "0", output: "32.0", displayOrder: 1 },
      { input: "37.5", output: "99.5", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "0", output: "32.0" },
      { order: 2, isSample: true, input: "37.5", output: "99.5" },
      { order: 3, isSample: false, input: "-40", output: "-40.0" },
      { order: 4, isSample: false, input: "100", output: "212.0" },
      { order: 5, isSample: false, input: "-12.3", output: "9.9" }
    ]
  },
  {
    slug: "find-maximum",
    title: "Find Maximum of Three",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Conditionals"],
    statement: "Given three integers, find and print the maximum value.",
    inputSpecification: "Three space-separated integers, $A$, $B$, and $C$.",
    outputSpecification: "Print the maximum of the three numbers.",
    constraints: "$-10^5 \\le A, B, C \\le 10^5$",
    examples: [
      { input: "3 8 5", output: "8", displayOrder: 1 },
      { input: "12 12 4", output: "12", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "3 8 5", output: "8" },
      { order: 2, isSample: true, input: "12 12 4", output: "12" },
      { order: 3, isSample: false, input: "-5 -10 -2", output: "-2" },
      { order: 4, isSample: false, input: "0 0 0", output: "0" },
      { order: 5, isSample: false, input: "100 200 150", output: "200" }
    ]
  },
  {
    slug: "factorial",
    title: "Factorial",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Loops", "Math"],
    statement: "Given an integer $N$, calculate and print its factorial ($N! = 1 \\times 2 \\times 3 \\dots \\times N$). For $N=0$, the factorial is $1$.",
    inputSpecification: "A single integer $N$.",
    outputSpecification: "Print a single integer representing $N!$.",
    constraints: "$0 \\le N \\le 12$",
    examples: [
      { input: "4", output: "24", displayOrder: 1 },
      { input: "0", output: "1", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "4", output: "24" },
      { order: 2, isSample: true, input: "0", output: "1" },
      { order: 3, isSample: false, input: "1", output: "1" },
      { order: 4, isSample: false, input: "5", output: "120" },
      { order: 5, isSample: false, input: "12", output: "479001600" }
    ]
  },
  {
    slug: "leap-year-check",
    title: "Leap Year Check",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Conditionals"],
    statement: "Write a program that determines if a given year is a leap year. A year is a leap year if it is divisible by 4, except for end-of-century years, which must be divisible by 400.",
    inputSpecification: "A single integer year $Y$.",
    outputSpecification: "Print `Leap Year` or `Not Leap Year` accordingly.",
    constraints: "$1 \\le Y \\le 3000$",
    examples: [
      { input: "2024", output: "Leap Year", displayOrder: 1 },
      { input: "1900", output: "Not Leap Year", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "2024", output: "Leap Year" },
      { order: 2, isSample: true, input: "1900", output: "Not Leap Year" },
      { order: 3, isSample: false, input: "2000", output: "Leap Year" },
      { order: 4, isSample: false, input: "2023", output: "Not Leap Year" },
      { order: 5, isSample: false, input: "4", output: "Leap Year" }
    ]
  },
  {
    slug: "palindrome-check",
    title: "Palindrome Check",
    difficulty: "MEDIUM",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["String"],
    statement: "Given a lowercase string, determine if it is a palindrome (reads the same backwards as forwards).",
    inputSpecification: "A single word $S$ consisting of lowercase English letters.",
    outputSpecification: "Print `Yes` if the word is a palindrome, otherwise print `No`.",
    constraints: "$1 \\le |S| \\le 100$",
    examples: [
      { input: "racecar", output: "Yes", displayOrder: 1 },
      { input: "hello", output: "No", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "racecar", output: "Yes" },
      { order: 2, isSample: true, input: "hello", output: "No" },
      { order: 3, isSample: false, input: "a", output: "Yes" },
      { order: 4, isSample: false, input: "abba", output: "Yes" },
      { order: 5, isSample: false, input: "abcdefg", output: "No" }
    ]
  },
  {
    slug: "fibonacci-number",
    title: "N-th Fibonacci Number",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Loops", "Loops", "Loops"],
    statement: "The Fibonacci sequence starts with $F_0 = 0, F_1 = 1$. The terms are calculated as $F_n = F_{n-1} + F_{n-2}$. Print the $N$-th Fibonacci number.",
    inputSpecification: "A single integer $N$.",
    outputSpecification: "Print the value of $F_N$.",
    constraints: "$0 \\le N \\le 30$",
    examples: [
      { input: "5", output: "5", displayOrder: 1 },
      { input: "1", output: "1", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "5", output: "5" },
      { order: 2, isSample: true, input: "1", output: "1" },
      { order: 3, isSample: false, input: "0", output: "0" },
      { order: 4, isSample: false, input: "10", output: "55" },
      { order: 5, isSample: false, input: "30", output: "832040" }
    ]
  },
  {
    slug: "count-vowels",
    title: "Count Vowels",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["String", "Loops"],
    statement: "Given a string, count and print the total number of vowels (a, e, i, o, u) present in it, ignoring case.",
    inputSpecification: "A single string $S$ (may contain spaces).",
    outputSpecification: "Print the count of vowels.",
    constraints: "$1 \\le |S| \\le 1000$",
    examples: [
      { input: "Hello World", output: "3", displayOrder: 1 },
      { input: "Ummeed Platform", output: "5", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "Hello World", output: "3" },
      { order: 2, isSample: true, input: "Ummeed Platform", output: "5" },
      { order: 3, isSample: false, input: "xyz", output: "0" },
      { order: 4, isSample: false, input: "aeiouAEIOU", output: "10" },
      { order: 5, isSample: false, input: "Competitive Programming", output: "7" }
    ]
  },
  {
    slug: "prime-number-check",
    title: "Prime Number Check",
    difficulty: "MEDIUM",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Math", "Loops"],
    statement: "Given an integer $N$ ($N > 1$), check whether it is a prime number.",
    inputSpecification: "A single integer $N$.",
    outputSpecification: "Print `Prime` if the number is prime, otherwise print `Not Prime`.",
    constraints: "$2 \\le N \\le 10^5$",
    examples: [
      { input: "7", output: "Prime", displayOrder: 1 },
      { input: "10", output: "Not Prime", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "7", output: "Prime" },
      { order: 2, isSample: true, input: "10", output: "Not Prime" },
      { order: 3, isSample: false, input: "2", output: "Prime" },
      { order: 4, isSample: false, input: "997", output: "Prime" },
      { order: 5, isSample: false, input: "10000", output: "Not Prime" }
    ]
  },
  {
    slug: "sum-of-array",
    title: "Sum of Array Elements",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["Array", "Loops"],
    statement: "Given an array of $N$ integers, calculate and print their sum.",
    inputSpecification: "The first line contains an integer $N$. The second line contains $N$ space-separated integers.",
    outputSpecification: "Print the sum of the array elements.",
    constraints: "$1 \\le N \\le 100$, each element fits in a standard integer.",
    examples: [
      { input: "4\n1 2 3 4", output: "10", displayOrder: 1 },
      { input: "3\n-5 10 2", output: "7", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "4\n1 2 3 4", output: "10" },
      { order: 2, isSample: true, input: "3\n-5 10 2", output: "7" },
      { order: 3, isSample: false, input: "1\n99", output: "99" },
      { order: 4, isSample: false, input: "5\n0 0 0 0 0", output: "0" },
      { order: 5, isSample: false, input: "6\n10 20 -30 40 50 -60", output: "30" }
    ]
  },
  {
    slug: "reversed-string",
    title: "Reverse String",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ["String"],
    statement: "Given a single word, reverse it and print it out.",
    inputSpecification: "A single word $S$.",
    outputSpecification: "Print the reversed string.",
    constraints: "$1 \\le |S| \\le 100$",
    examples: [
      { input: "coder", output: "redoc", displayOrder: 1 },
      { input: "school", output: "loohcs", displayOrder: 2 }
    ],
    testCases: [
      { order: 1, isSample: true, input: "coder", output: "redoc" },
      { order: 2, isSample: true, input: "school", output: "loohcs" },
      { order: 3, isSample: false, input: "a", output: "a" },
      { order: 4, isSample: false, input: "radar", output: "radar" },
      { order: 5, isSample: false, input: "steponnopets", output: "steponnopets" }
    ]
  }
];

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing database values in correct dependency order
  await prisma.contestParticipant.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.contestProblem.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Clean filesystem problems folder
  if (fs.existsSync(PROBLEMS_DIR)) {
    fs.rmSync(PROBLEMS_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(PROBLEMS_DIR, { recursive: true });

  // 2. Create seed users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@ummeed.org",
      emailVerified: true,
      role: Role.ADMIN,
      rating: 1500
    }
  });

  const student = await prisma.user.create({
    data: {
      name: "Student User",
      email: "student@ummeed.org",
      emailVerified: true,
      role: Role.STUDENT,
      rating: 1200
    }
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@ummeed.org",
      emailVerified: true,
      role: Role.STUDENT,
      rating: 1350
    }
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "rahul@ummeed.org",
      emailVerified: true,
      role: Role.STUDENT,
      rating: 1100
    }
  });

  console.log("Seeded users:", { admin: admin.email, student: student.email });

  // 3. Create tags map to prevent double creation
  const tagCache: Record<string, string> = {};

  // 4. Seeding problems
  const problemIdMap: Record<string, string> = {};

  for (const prob of seedProblems) {
    console.log(`Processing problem: ${prob.title}`);

    // Create or connect tags
    const tagConnectOrCreate = [];
    for (const tagName of prob.tags) {
      if (!tagCache[tagName]) {
        const tagRecord = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
        tagCache[tagName] = tagRecord.id;
      }
      tagConnectOrCreate.push({ id: tagCache[tagName] });
    }

    // Create database Problem entry
    const dbProblem = await prisma.problem.create({
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

    problemIdMap[prob.slug] = dbProblem.id;

    // Create database Test Case metadata entries (no body contents)
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

    // 5. Write problem.json and raw testcase files to the Git-backed directory
    const problemDir = path.join(PROBLEMS_DIR, prob.slug);
    const testsDir = path.join(problemDir, "tests");
    fs.mkdirSync(testsDir, { recursive: true });

    const metadataContent = {
      statement: prob.statement,
      inputSpecification: prob.inputSpecification,
      outputSpecification: prob.outputSpecification,
      constraints: prob.constraints,
      explanation: prob.explanation,
      examples: prob.examples,
      testCases: prob.testCases.map((tc) => ({
        order: tc.order,
        isSample: tc.isSample,
        inputPath: `problems/${prob.slug}/tests/${tc.order}.in`,
        outputPath: `problems/${prob.slug}/tests/${tc.order}.out`
      }))
    };

    fs.writeFileSync(
      path.join(problemDir, "problem.json"),
      JSON.stringify(metadataContent, null, 2),
      "utf-8"
    );

    for (const tc of prob.testCases) {
      fs.writeFileSync(path.join(testsDir, `${tc.order}.in`), tc.input, "utf-8");
      fs.writeFileSync(path.join(testsDir, `${tc.order}.out`), tc.output, "utf-8");
    }
  }

  // 6. Seed 3 Contests
  console.log("Seeding contests...");

  const now = new Date();

  // Contest A — Beginner Blitz (ENDED)
  const pastStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const pastEnd   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000); // 2hr duration

  const contestA = await prisma.contest.create({
    data: {
      title: "Beginner Blitz",
      description: "A beginner-friendly contest covering the fundamentals of programming — math, conditionals, and simple I/O. Perfect for your first competitive programming experience!",
      startTime: pastStart,
      endTime: pastEnd,
      status: "ENDED",
      published: true,
    }
  });

  await prisma.contestProblem.createMany({
    data: [
      { contestId: contestA.id, problemId: problemIdMap["add-two-numbers"],      points: 100, sequence: 0 },
      { contestId: contestA.id, problemId: problemIdMap["even-or-odd"],           points: 100, sequence: 1 },
      { contestId: contestA.id, problemId: problemIdMap["celsius-to-fahrenheit"], points: 150, sequence: 2 },
      { contestId: contestA.id, problemId: problemIdMap["find-maximum"],          points: 150, sequence: 3 },
    ]
  });

  // Seed realistic participants and scores for Beginner Blitz leaderboard demo
  await prisma.contestParticipant.createMany({
    data: [
      { contestId: contestA.id, userId: student2.id,  score: 400, penalty: 0  },  // Priya: all AC, no penalty
      { contestId: contestA.id, userId: student.id,   score: 350, penalty: 40 },  // Student: 3 solved, 2 WA
      { contestId: contestA.id, userId: student3.id,  score: 200, penalty: 20 },  // Rahul: 2 solved, 1 WA
      { contestId: contestA.id, userId: admin.id,     score: 100, penalty: 0  },  // Admin: 1 solved
    ]
  });

  // Contest B — Weekend Warrior (RUNNING)
  const runStart = new Date(now.getTime() - 30 * 60 * 1000);                       // started 30 min ago
  const runEnd   = new Date(now.getTime() + 90 * 60 * 1000);                       // ends in 90 min

  const contestB = await prisma.contest.create({
    data: {
      title: "Weekend Warrior",
      description: "A 2-hour sprint for intermediate coders. Problems range from loops and recursion to string manipulation. Jump in, register, and start solving!",
      startTime: runStart,
      endTime: runEnd,
      status: "RUNNING",
      published: true,
    }
  });

  await prisma.contestProblem.createMany({
    data: [
      { contestId: contestB.id, problemId: problemIdMap["factorial"],       points: 100, sequence: 0 },
      { contestId: contestB.id, problemId: problemIdMap["palindrome-check"], points: 150, sequence: 1 },
      { contestId: contestB.id, problemId: problemIdMap["prime-number-check"], points: 200, sequence: 2 },
      { contestId: contestB.id, problemId: problemIdMap["count-vowels"],    points: 100, sequence: 3 },
    ]
  });

  // Contest C — The Grand Challenge (UPCOMING)
  const futureStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);           // 2 days from now
  const futureEnd   = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000); // 3hr duration

  const contestC = await prisma.contest.create({
    data: {
      title: "The Grand Challenge",
      description: "Our most ambitious contest yet! Featuring mixed difficulty problems covering arrays, strings, loops, and classic algorithms. Only the sharpest minds will claim the top rank.",
      startTime: futureStart,
      endTime: futureEnd,
      status: "UPCOMING",
      published: true,
    }
  });

  await prisma.contestProblem.createMany({
    data: [
      { contestId: contestC.id, problemId: problemIdMap["fibonacci-number"],  points: 100, sequence: 0 },
      { contestId: contestC.id, problemId: problemIdMap["sum-of-array"],       points: 150, sequence: 1 },
      { contestId: contestC.id, problemId: problemIdMap["reversed-string"],    points: 150, sequence: 2 },
      { contestId: contestC.id, problemId: problemIdMap["leap-year-check"],    points: 200, sequence: 3 },
    ]
  });

  console.log("Seeded contests: Beginner Blitz, Weekend Warrior, The Grand Challenge");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


