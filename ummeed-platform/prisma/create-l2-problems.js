const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '..', '..', 'problems');

const L2_PROBLEMS = [
  {
    slug: "first-character-extraction-l2",
    title: "First Character Extraction L2",
    difficulty: "EASY",
    statement: "Write a program that asks the user to input a string and prints only the very first character of that string using indexing (`s[0]`).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can access the first character with `s[0]`!*",
    inputSpecification: "A single string $S$.",
    outputSpecification: "Print the first character of $S$.",
    constraints: "$1 \\le |S| \\le 1000$",
    examples: [
      { input: "Python", output: "P", displayOrder: 1 },
      { input: "Apple", output: "A", displayOrder: 2 },
      { input: "12345", output: "1", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "getFirstChar",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "Python", output: "P" },
      { order: 2, isSample: true, input: "Apple", output: "A" },
      { order: 3, isSample: true, input: "12345", output: "1" },
      { order: 4, isSample: false, input: "Hello", output: "H" },
      { order: 5, isSample: false, input: "Z", output: "Z" },
      { order: 6, isSample: false, input: "!world", output: "!" },
      { order: 7, isSample: false, input: "city", output: "c" },
      { order: 8, isSample: false, input: "99balloons", output: "9" },
      { order: 9, isSample: false, input: "_underscore", output: "_" },
      { order: 10, isSample: false, input: "School", output: "S" }
    ],
    tags: ["L2", "String", "Indexing", "Basics"]
  },
  {
    slug: "last-character-extraction-l2",
    title: "Last Character Extraction L2",
    difficulty: "EASY",
    statement: "Write a program that asks the user to input a string and uses negative indexing (`s[-1]`) to print the last character of the string.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, negative indexing `s[-1]` accesses the last character directly!*",
    inputSpecification: "A single string $S$.",
    outputSpecification: "Print the last character of $S$.",
    constraints: "$1 \\le |S| \\le 1000$",
    examples: [
      { input: "Python", output: "n", displayOrder: 1 },
      { input: "Apple", output: "e", displayOrder: 2 },
      { input: "12345", output: "5", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "getLastChar",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "Python", output: "n" },
      { order: 2, isSample: true, input: "Apple", output: "e" },
      { order: 3, isSample: true, input: "12345", output: "5" },
      { order: 4, isSample: false, input: "Hello", output: "o" },
      { order: 5, isSample: false, input: "Z", output: "Z" },
      { order: 6, isSample: false, input: "world!", output: "!" },
      { order: 7, isSample: false, input: "city", output: "y" },
      { order: 8, isSample: false, input: "99", output: "9" },
      { order: 9, isSample: false, input: "underscore_", output: "_" },
      { order: 10, isSample: false, input: "School", output: "l" }
    ],
    tags: ["L2", "String", "Indexing", "Basics"]
  },
  {
    slug: "the-nth-character-l2",
    title: "The Nth Character L2",
    difficulty: "EASY",
    statement: "Write a program that accepts a string $S$ and an integer $\\text{index}$. Print the character located at that specific 0-based index in the string (`s[index]`).\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return s[index]`!*",
    inputSpecification: "Two lines: the first line contains string $S$, and the second line contains an integer $\\text{index}$.",
    outputSpecification: "Print the character at the specified index.",
    constraints: "$1 \\le |S| \\le 1000, 0 \\le \\text{index} < |S|$",
    examples: [
      { input: "City_College\n0", output: "C", displayOrder: 1 },
      { input: "City_College\n4", output: "_", displayOrder: 2 },
      { input: "Python\n2", output: "t", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "getNthChar",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" },
        { name: "index", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "City_College 0", output: "C" },
      { order: 2, isSample: true, input: "City_College 4", output: "_" },
      { order: 3, isSample: true, input: "Python 2", output: "t" },
      { order: 4, isSample: false, input: "Hello 4", output: "o" },
      { order: 5, isSample: false, input: "12345 1", output: "2" },
      { order: 6, isSample: false, input: "apple 3", output: "l" },
      { order: 7, isSample: false, input: "Z 0", output: "Z" },
      { order: 8, isSample: false, input: "Coding 5", output: "g" },
      { order: 9, isSample: false, input: "Test 2", output: "s" },
      { order: 10, isSample: false, input: "Cases 1", output: "a" }
    ],
    tags: ["L2", "String", "Indexing", "Basics"]
  },
  {
    slug: "extract-first-n-characters-l2",
    title: "Extract First N Characters L2",
    difficulty: "EASY",
    statement: "Write a program that takes a string $S$ and an integer $N$. Use string slicing to extract and print the first $N$ characters of the string (`s[:n]`).\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return s[:n]`!*",
    inputSpecification: "Two lines: the first line contains string $S$, and the second line contains an integer $N$.",
    outputSpecification: "Print the first $N$ characters of string $S$.",
    constraints: "$1 \\le |S| \\le 1000, 0 \\le N \\le |S|$",
    examples: [
      { input: "City_College\n4", output: "City", displayOrder: 1 },
      { input: "Python\n2", output: "Py", displayOrder: 2 },
      { input: "Hello\n4", output: "Hell", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "extractFirstN",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" },
        { name: "n", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "City_College 4", output: "City" },
      { order: 2, isSample: true, input: "Python 2", output: "Py" },
      { order: 3, isSample: true, input: "Hello 4", output: "Hell" },
      { order: 4, isSample: false, input: "12345 1", output: "1" },
      { order: 5, isSample: false, input: "apple 5", output: "apple" },
      { order: 6, isSample: false, input: "Z 1", output: "Z" },
      { order: 7, isSample: false, input: "Coding 3", output: "Cod" },
      { order: 8, isSample: false, input: "School 0", output: "" },
      { order: 9, isSample: false, input: "Test 2", output: "Te" },
      { order: 10, isSample: false, input: "Cases 4", output: "Case" }
    ],
    tags: ["L2", "String", "Slicing", "Basics"]
  },
  {
    slug: "mid-slice-removing-edges-l2",
    title: "Mid-Slice (Removing Edges) L2",
    difficulty: "EASY",
    statement: "Write a program that takes a string $S$ of at least 3 characters and uses slicing to print the string without its first and last characters (`s[1:-1]`).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, slicing `s[1:-1]` trims off the first and last characters!*",
    inputSpecification: "A single string $S$ of length at least 3.",
    outputSpecification: "Print the middle slice of string $S$.",
    constraints: "$3 \\le |S| \\le 1000$",
    examples: [
      { input: "Python", output: "ytho", displayOrder: 1 },
      { input: "Hello", output: "ell", displayOrder: 2 },
      { input: "12345", output: "234", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "removeEdges",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "Python", output: "ytho" },
      { order: 2, isSample: true, input: "Hello", output: "ell" },
      { order: 3, isSample: true, input: "12345", output: "234" },
      { order: 4, isSample: false, input: "apple", output: "ppl" },
      { order: 5, isSample: false, input: "City_College", output: "ity_Colleg" },
      { order: 6, isSample: false, input: "Coding", output: "odin" },
      { order: 7, isSample: false, input: "School", output: "choo" },
      { order: 8, isSample: false, input: "Test", output: "es" },
      { order: 9, isSample: false, input: "Cases", output: "ase" },
      { order: 10, isSample: false, input: "cat", output: "a" }
    ],
    tags: ["L2", "String", "Slicing", "Basics"]
  },
  {
    slug: "extracting-a-specific-substring-l2",
    title: "Extracting a Specific Substring L2",
    difficulty: "EASY",
    statement: "Write a program that takes a string $S$, a starting index $\\text{start}$, and an ending index $\\text{end}$. Print the sliced substring using those bounds (`s[start:end]`). Remember that in slicing, the ending index is not included.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return s[start:end]`!*",
    inputSpecification: "Three space-separated or line-separated inputs: string $S$, integer $\\text{start}$, and integer $\\text{end}$.",
    outputSpecification: "Print the sliced substring from start to end (exclusive).",
    constraints: "$1 \\le |S| \\le 1000, 0 \\le \\text{start} \\le \\text{end} \\le |S|$",
    examples: [
      { input: "CityCollege\n1\n4", output: "ity", displayOrder: 1 },
      { input: "Python\n2\n5", output: "tho", displayOrder: 2 },
      { input: "Hello\n0\n4", output: "Hell", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "extractSubstring",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" },
        { name: "start", type: "int" },
        { name: "end", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "CityCollege 1 4", output: "ity" },
      { order: 2, isSample: true, input: "Python 2 5", output: "tho" },
      { order: 3, isSample: true, input: "Hello 0 4", output: "Hell" },
      { order: 4, isSample: false, input: "12345 1 3", output: "23" },
      { order: 5, isSample: false, input: "apple 0 5", output: "apple" },
      { order: 6, isSample: false, input: "Coding 2 4", output: "di" },
      { order: 7, isSample: false, input: "School 1 5", output: "choo" },
      { order: 8, isSample: false, input: "Test 1 2", output: "e" },
      { order: 9, isSample: false, input: "Cases 2 5", output: "ses" },
      { order: 10, isSample: false, input: "Zebra 0 1", output: "Z" }
    ],
    tags: ["L2", "String", "Slicing", "Basics"]
  }
];

function createL2Problems() {
  for (const prob of L2_PROBLEMS) {
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

    console.log(`✓ Created L2 problem: ${prob.slug}`);
  }
}

createL2Problems();
