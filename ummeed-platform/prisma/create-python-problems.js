const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '..', '..', 'problems');

const NEW_PROBLEMS = [
  {
    slug: "word-dictionary-meaning",
    title: "Word Dictionary Lookup",
    difficulty: "EASY",
    statement: "In this problem, you need to look up the meaning of an English word using a dictionary.\n\nThe dictionary contains the following words and meanings:\n- `table` : `a piece of furniture`\n- `cat` : `a small animal`\n- `book` : `a set of printed pages`\n- `sun` : `the star at the center of the solar system`\n\nGiven a word $W$, return its definition from the dictionary. If the word is not in the dictionary, return `Word not found`.\n\n💡 **Note:** *This question is designed for Python practice. Using a Python dictionary (`dict`) is recommended!*",
    inputSpecification: "A single string $W$ representing the word to search.",
    outputSpecification: "Print the meaning of the word. If not found, print `Word not found`.",
    constraints: "$1 \\le |W| \\le 50$, $W$ contains lowercase English letters.",
    examples: [
      { input: "table", output: "a piece of furniture", displayOrder: 1 },
      { input: "cat", output: "a small animal", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "getMeaning",
      returnType: "string",
      parameters: [
        { name: "word", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "table", output: "a piece of furniture" },
      { order: 2, isSample: true, input: "cat", output: "a small animal" },
      { order: 3, isSample: false, input: "book", output: "a set of printed pages" },
      { order: 4, isSample: false, input: "sun", output: "the star at the center of the solar system" },
      { order: 5, isSample: false, input: "computer", output: "Word not found" }
    ],
    tags: ["Python", "Dictionary", "Basics"]
  },
  {
    slug: "count-classrooms-needed",
    title: "Count Classrooms Needed",
    difficulty: "EASY",
    statement: "A school offers several subjects to students. You are given a list of $N$ subject names chosen by students.\n\nAssume **one classroom is required for 1 unique subject**.\n\nFind the total number of classrooms required so that all distinct subjects can be taught.\n\n💡 **Note:** *This question is designed for Python practice. In Python, you can use a `set` (`set(subjects)`) to easily find unique items and `len()` to count them!*",
    inputSpecification: "The first line contains an integer $N$. The second line contains $N$ space-separated strings representing the subjects.",
    outputSpecification: "Print a single integer representing the total number of unique classrooms needed.",
    constraints: "$1 \\le N \\le 10^5$, each subject name is a non-empty string.",
    examples: [
      { input: "10\npython java C++ python javascript java python java C++ C", output: "5", displayOrder: 1 },
      { input: "4\nmath science math english", output: "3", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "countClassrooms",
      returnType: "int",
      parameters: [
        { name: "n", type: "int" },
        { name: "subjects", type: "string[]" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "10\npython java C++ python javascript java python java C++ C", output: "5" },
      { order: 2, isSample: true, input: "4\nmath science math english", output: "3" },
      { order: 3, isSample: false, input: "3\nphysics physics physics", output: "1" },
      { order: 4, isSample: false, input: "5\nart music sports dance drama", output: "5" },
      { order: 5, isSample: false, input: "1\nrobotics", output: "1" }
    ],
    tags: ["Python", "Set", "Array", "Basics"]
  },
  {
    slug: "subject-marks-total",
    title: "Store Subject Marks in Dictionary",
    difficulty: "EASY",
    statement: "Write a program that takes the names and marks of 3 subjects entered by a student, stores them in a dictionary (with subject name as key and marks as value), and returns the **total sum of all marks**.\n\n💡 **Note:** *This question is designed for Python practice. Start with an empty dictionary `marks = {}`, add each subject with `marks[sub] = score`, and use `sum(marks.values())` to calculate the total!*",
    inputSpecification: "Six space-separated values: `sub1 m1 sub2 m2 sub3 m3`, where each `sub` is a subject name (string) and each `m` is the score (integer).",
    outputSpecification: "Print a single integer representing the total marks.",
    constraints: "$0 \\le \\text{marks} \\le 100$, subject names consist of lowercase English letters.",
    examples: [
      { input: "physics 97 chemistry 98 math 95", output: "290", displayOrder: 1 },
      { input: "english 85 hindi 90 computer 95", output: "270", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "calculateTotalMarks",
      returnType: "int",
      parameters: [
        { name: "sub1", type: "string" },
        { name: "m1", type: "int" },
        { name: "sub2", type: "string" },
        { name: "m2", type: "int" },
        { name: "sub3", type: "string" },
        { name: "m3", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "physics 97 chemistry 98 math 95", output: "290" },
      { order: 2, isSample: true, input: "english 85 hindi 90 computer 95", output: "270" },
      { order: 3, isSample: false, input: "science 100 social 100 art 100", output: "300" },
      { order: 4, isSample: false, input: "biology 75 physics 80 chemistry 85", output: "240" },
      { order: 5, isSample: false, input: "math 0 science 50 english 50", output: "100" }
    ],
    tags: ["Python", "Dictionary", "Math", "Basics"]
  },
  {
    slug: "store-int-and-float-in-set",
    title: "Store Integer and Float in Set",
    difficulty: "EASY",
    statement: "In Python, integers and floating-point numbers with the same numeric value (such as `9` and `9.0`) are treated as equal by a standard set (`9 == 9.0`), so `{9, 9.0}` only keeps a single element.\n\nTo store both `9` and `9.0` as separate, distinct items in a set, we can store each value paired with its data type label (for example, `(value, \"int\")` and `(value, \"float\")`).\n\nGiven an integer $A$ and a float $B$, store both items in a set as `(value, type)` pairs and return the count of distinct elements in the set.\n\n💡 **Note:** *This question is designed for Python practice. Using Python tuples inside a set `s.add((val, 'int'))` is recommended!*",
    inputSpecification: "Two space-separated values: an integer $A$ and a decimal number $B$.",
    outputSpecification: "Print the count of unique elements stored in the typed set.",
    constraints: "$-10^9 \\le A, B \\le 10^9$",
    examples: [
      { input: "9 9.0", output: "2", displayOrder: 1 },
      { input: "5 5.5", output: "2", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "countDistinctTyped",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "double" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "9 9.0", output: "2" },
      { order: 2, isSample: true, input: "5 5.5", output: "2" },
      { order: 3, isSample: false, input: "0 0.0", output: "2" },
      { order: 4, isSample: false, input: "100 100.0", output: "2" },
      { order: 5, isSample: false, input: "42 42.0", output: "2" }
    ],
    tags: ["Python", "Set", "Data Types"]
  }
];

function createProblems() {
  for (const prob of NEW_PROBLEMS) {
    const problemDir = path.join(PROBLEMS_DIR, prob.slug);
    const testsDir = path.join(problemDir, "tests");
    fs.mkdirSync(testsDir, { recursive: true });

    const metadataContent = {
      statement: prob.statement,
      inputSpecification: prob.inputSpecification,
      outputSpecification: prob.outputSpecification,
      constraints: prob.constraints,
      examples: prob.examples,
      signature: prob.signature,
      testCases: prob.testCases.map(tc => ({
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

    console.log(`✓ Created problem: ${prob.slug}`);
  }
}

createProblems();
