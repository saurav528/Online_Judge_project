const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '..', '..', 'problems');

const LANGUAGE_REGISTRY = {
  CPP: {
    name: "C++",
    extension: "cpp",
    typeMappings: {
      int: "int",
      double: "double",
      string: "std::string",
      boolean: "bool",
      "int[]": "std::vector<int>",
      "string[]": "std::vector<std::string>",
      "int[][]": "std::vector<std::vector<int>>",
    },
    defaultReturns: {
      int: "return 0;",
      double: "return 0.0;",
      string: 'return "";',
      boolean: "return false;",
      "int[]": "return {};",
      "string[]": "return {};",
      "int[][]": "return {};",
    },
    wrapperTemplate: `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

// INSERT_STUDENT_CODE_HERE

int main() {
    // Enable fast I/O
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int t;
    if (!(std::cin >> t)) return 0;
    while (t--) {
        // INSERT_PARSING_CODE_HERE

        // INSERT_INVOCATION_CODE_HERE

        // INSERT_SERIALIZATION_CODE_HERE
    }

    return 0;
}
`,
  },
  JAVA: {
    name: "Java",
    extension: "java",
    typeMappings: {
      int: "int",
      double: "double",
      string: "String",
      boolean: "boolean",
      "int[]": "int[]",
      "string[]": "String[]",
      "int[][]": "int[][]",
    },
    defaultReturns: {
      int: "return 0;",
      double: "return 0.0;",
      string: 'return "";',
      boolean: "return false;",
      "int[]": "return new int[0];",
      "string[]": "return new String[0];",
      "int[][]": "return new int[0][0];",
    },
    wrapperTemplate: `
import java.util.*;
import java.io.*;

// INSERT_STUDENT_CODE_HERE

public class Main {
    private static StringTokenizer tokenizer = null;
    private static String readNextToken(BufferedReader reader) throws Exception {
        while (tokenizer == null || !tokenizer.hasMoreTokens()) {
            String line = reader.readLine();
            if (line == null) return null;
            tokenizer = new StringTokenizer(line);
        }
        return tokenizer.nextToken();
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String tStr = readNextToken(reader);
        if (tStr == null) return;
        int t = Integer.parseInt(tStr);
        while (t-- > 0) {
            // INSERT_PARSING_CODE_HERE

            // INSERT_INVOCATION_CODE_HERE

            // INSERT_SERIALIZATION_CODE_HERE
        }
    }
}
`,
  },
  PYTHON: {
    name: "Python",
    extension: "py",
    typeMappings: {
      int: "int",
      double: "float",
      string: "str",
      boolean: "bool",
      "int[]": "List[int]",
      "string[]": "List[str]",
      "int[][]": "List[List[int]]",
    },
    defaultReturns: {
      int: "return 0",
      double: "return 0.0",
      string: 'return ""',
      boolean: "return False",
      "int[]": "return []",
      "string[]": "return []",
      "int[][]": "return [[]]",
    },
    wrapperTemplate: `
import sys
import json
from typing import List

// INSERT_STUDENT_CODE_HERE

def main():
    # Read all tokens from standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        return
        
    token_idx = 0
    
    def next_token():
        nonlocal token_idx
        if token_idx >= len(input_data):
            return ""
        val = input_data[token_idx]
        token_idx += 1
        return val

    t_str = next_token()
    if not t_str:
        return
    t = int(t_str)
    for _ in range(t):
// INSERT_PARSING_CODE_HERE

// INSERT_INVOCATION_CODE_HERE

// INSERT_SERIALIZATION_CODE_HERE

if __name__ == "__main__":
    main()
`,
  },
  JAVASCRIPT: {
    name: "JavaScript",
    extension: "js",
    typeMappings: {
      int: "",
      double: "",
      string: "",
      boolean: "",
      "int[]": "",
      "string[]": "",
      "int[][]": "",
    },
    defaultReturns: {
      int: "return 0;",
      double: "return 0.0;",
      string: 'return "";',
      boolean: "return false;",
      "int[]": "return [];",
      "string[]": "return [];",
      "int[][]": "return [[]];",
    },
    wrapperTemplate: `
const fs = require('fs');

// INSERT_STUDENT_CODE_HERE

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length === 0 || input[0] === "") return;
    
    let tokenIdx = 0;
    function nextToken() {
        if (tokenIdx >= input.length) return "";
        return input[tokenIdx++];
    }

    const tStr = nextToken();
    if (!tStr) return;
    const t = parseInt(tStr, 10);
    for (let i = 0; i < t; i++) {
        // INSERT_PARSING_CODE_HERE

        // INSERT_INVOCATION_CODE_HERE

        // INSERT_SERIALIZATION_CODE_HERE
    }
}

main();
`,
  },
};

function generateStudentBoilerplate(langKey, sig) {
  const lang = LANGUAGE_REGISTRY[langKey];
  const defaultReturn = lang.defaultReturns[sig.returnType] || "";

  switch (langKey) {
    case "CPP": {
      const paramsStr = sig.parameters
        .map((p) => {
          const mappedType = lang.typeMappings[p.type];
          const isVector = p.type.includes("[]");
          return `${mappedType}${isVector ? " &" : " "}${p.name}`;
        })
        .join(", ");
      const returnTypeStr = lang.typeMappings[sig.returnType];

      return `class ${sig.className} {
public:
    ${returnTypeStr} ${sig.functionName}(${paramsStr}) {
        // Write your solution here
        ${defaultReturn}
    }
};
`;
    }

    case "JAVA": {
      const paramsStr = sig.parameters
        .map((p) => `${lang.typeMappings[p.type]} ${p.name}`)
        .join(", ");
      const returnTypeStr = lang.typeMappings[sig.returnType];

      return `class ${sig.className} {
    public ${returnTypeStr} ${sig.functionName}(${paramsStr}) {
        // Write your solution here
        ${defaultReturn}
    }
}
`;
    }

    case "PYTHON": {
      const paramsStr = ["self"]
        .concat(
          sig.parameters.map((p) => `${p.name}: ${lang.typeMappings[p.type]}`)
        )
        .join(", ");
      const returnTypeStr = lang.typeMappings[sig.returnType];

      return `class ${sig.className}:
    def ${sig.functionName}(${paramsStr}) -> ${returnTypeStr}:
        # Write your solution here
        ${defaultReturn}
`;
    }

    case "JAVASCRIPT": {
      const paramsStr = sig.parameters.map((p) => p.name).join(", ");

      return `class ${sig.className} {
    ${sig.functionName}(${paramsStr}) {
        // Write your solution here
        ${defaultReturn}
    }
}
`;
    }
    default:
      return "";
  }
}

function generateExecutionWrapper(langKey, sig) {
  const lang = LANGUAGE_REGISTRY[langKey];
  const lines = [];

  for (const p of sig.parameters) {
    if (langKey === "CPP") {
      if (p.type === "int") {
        lines.push(`    int ${p.name};\n    std::cin >> ${p.name};`);
      } else if (p.type === "double") {
        lines.push(`    double ${p.name};\n    std::cin >> ${p.name};`);
      } else if (p.type === "string") {
        lines.push(`    std::string ${p.name};\n    std::cin >> ${p.name};`);
      } else if (p.type === "boolean") {
        lines.push(
          `    bool ${p.name};\n    {\n        std::string temp;\n        std::cin >> temp;\n        ${p.name} = (temp == "true" || temp == "1");\n    }`
        );
      } else if (p.type === "int[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `    int size_${p.name};\n    std::cin >> size_${p.name};\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}    std::vector<int> ${p.name}(${sizeVar});\n    for(int i = 0; i < ${sizeVar}; ++i) {\n        std::cin >> ${p.name}[i];\n    }`
        );
      } else if (p.type === "string[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `    int size_${p.name};\n    std::cin >> size_${p.name};\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}    std::vector<std::string> ${p.name}(${sizeVar});\n    for(int i = 0; i < ${sizeVar}; ++i) {\n        std::cin >> ${p.name}[i];\n    }`
        );
      }
    } else if (langKey === "JAVA") {
      if (p.type === "int") {
        lines.push(`        int ${p.name} = Integer.parseInt(readNextToken(reader));`);
      } else if (p.type === "double") {
        lines.push(`        double ${p.name} = Double.parseDouble(readNextToken(reader));`);
      } else if (p.type === "string") {
        lines.push(`        String ${p.name} = readNextToken(reader);`);
      } else if (p.type === "boolean") {
        lines.push(`        boolean ${p.name} = Boolean.parseBoolean(readNextToken(reader));`);
      } else if (p.type === "int[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `        int size_${p.name} = Integer.parseInt(readNextToken(reader));\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}        int[] ${p.name} = new int[${sizeVar}];\n        for(int i = 0; i < ${sizeVar}; i++) {\n            ${p.name}[i] = Integer.parseInt(readNextToken(reader));\n        }`
        );
      } else if (p.type === "string[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `        int size_${p.name} = Integer.parseInt(readNextToken(reader));\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}        String[] ${p.name} = new String[${sizeVar}];\n        for(int i = 0; i < ${sizeVar}; i++) {\n            ${p.name}[i] = readNextToken(reader);\n        }`
        );
      }
    } else if (langKey === "PYTHON") {
      if (p.type === "int") {
        lines.push(`        ${p.name} = int(next_token())`);
      } else if (p.type === "double") {
        lines.push(`        ${p.name} = float(next_token())`);
      } else if (p.type === "string") {
        lines.push(`        ${p.name} = next_token()`);
      } else if (p.type === "boolean") {
        lines.push(`        ${p.name} = next_token().lower() in ("true", "1")`);
      } else if (p.type === "int[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `        size_${p.name} = int(next_token())\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}        ${p.name} = [int(next_token()) for _ in range(${sizeVar})]`
        );
      } else if (p.type === "string[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `        size_${p.name} = int(next_token())\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}        ${p.name} = [next_token() for _ in range(${sizeVar})]`
        );
      }
    } else if (langKey === "JAVASCRIPT") {
      if (p.type === "int") {
        lines.push(`    const ${p.name} = parseInt(nextToken(), 10);`);
      } else if (p.type === "double") {
        lines.push(`    const ${p.name} = parseFloat(nextToken());`);
      } else if (p.type === "string") {
        lines.push(`    const ${p.name} = nextToken();`);
      } else if (p.type === "boolean") {
        lines.push(`    const ${p.name} = nextToken().toLowerCase() === "true" || nextToken() === "1";`);
      } else if (p.type === "int[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `    const size_${p.name} = parseInt(nextToken(), 10);\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}    const ${p.name} = [];\n    for(let i = 0; i < ${sizeVar}; i++) {\n        ${p.name}.push(parseInt(nextToken(), 10));\n    }`
        );
      } else if (p.type === "string[]") {
        const pIndex = sig.parameters.indexOf(p);
        const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
        const sizeDecl = precedingSizeParam ? "" : `    const size_${p.name} = parseInt(nextToken(), 10);\n`;
        const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
        lines.push(
          `${sizeDecl}    const ${p.name} = [];\n    for(let i = 0; i < ${sizeVar}; i++) {\n        ${p.name}.push(nextToken());\n    }`
        );
      }
    }
  }

  const parsingCode = lines.join("\n");
  const argsStr = sig.parameters.map((p) => p.name).join(", ");

  let invocationCode = "";
  switch (langKey) {
    case "CPP":
      invocationCode = `    ${sig.className} solver;\n    auto result = solver.${sig.functionName}(${argsStr});`;
      break;
    case "JAVA":
      invocationCode = `        ${sig.className} solver = new ${sig.className}();\n        ${LANGUAGE_REGISTRY.JAVA.typeMappings[sig.returnType]} result = solver.${sig.functionName}(${argsStr});`;
      break;
    case "PYTHON":
      invocationCode = `        solver = ${sig.className}()\n        result = solver.${sig.functionName}(${argsStr})`;
      break;
    case "JAVASCRIPT":
      invocationCode = `    const solver = new ${sig.className}();\n    const result = solver.${sig.functionName}(${argsStr});`;
      break;
  }

  let serializationCode = "";
  switch (langKey) {
    case "CPP":
      if (sig.returnType === "boolean") {
        serializationCode = '    std::cout << (result ? "true" : "false") << std::endl;';
      } else if (sig.returnType === "int[]" || sig.returnType === "string[]") {
        serializationCode = `    for(size_t i = 0; i < result.size(); ++i) {\n        std::cout << result[i] << (i == result.size() - 1 ? "" : " ");\n    }\n    std::cout << std::endl;`;
      } else {
        serializationCode = "    std::cout << result << std::endl;";
      }
      break;
    case "JAVA":
      if (sig.returnType === "int[]" || sig.returnType === "string[]") {
        serializationCode = `        for(int i = 0; i < result.length; i++) {\n            System.out.print(result[i] + (i == result.length - 1 ? "" : " "));\n        }\n        System.out.println();`;
      } else {
        serializationCode = "        System.out.println(result);";
      }
      break;
    case "PYTHON":
      if (sig.returnType === "boolean") {
        serializationCode = '        print(str(result).lower())';
      } else if (sig.returnType === "int[]" || sig.returnType === "string[]") {
        serializationCode = '        print(" ".join(map(str, result)))';
      } else {
        serializationCode = "        print(result)";
      }
      break;
    case "JAVASCRIPT":
      if (sig.returnType === "boolean") {
        serializationCode = "    console.log(result.toString());";
      } else if (sig.returnType === "int[]" || sig.returnType === "string[]") {
        serializationCode = "    console.log(result.join(' '));";
      } else {
        serializationCode = "    console.log(result);";
      }
      break;
  }

  let wrapper = lang.wrapperTemplate;
  wrapper = wrapper.replace(/\s*(\/\/|#)\s*INSERT_PARSING_CODE_HERE/, "\n" + parsingCode);
  wrapper = wrapper.replace(/\s*(\/\/|#)\s*INSERT_INVOCATION_CODE_HERE/, "\n" + invocationCode);
  wrapper = wrapper.replace(/\s*(\/\/|#)\s*INSERT_SERIALIZATION_CODE_HERE/, "\n" + serializationCode);

  return wrapper.trim();
}

function saveProblem(slug, problemData) {
  const problemDir = path.join(PROBLEMS_DIR, slug);
  const testsDir = path.join(problemDir, "tests");
  const boilerplateDir = path.join(problemDir, "boilerplate");
  const boilerplateFullDir = path.join(problemDir, "boilerplate_full");

  fs.mkdirSync(testsDir, { recursive: true });
  fs.mkdirSync(boilerplateDir, { recursive: true });
  fs.mkdirSync(boilerplateFullDir, { recursive: true });

  const metadataContent = {
    statement: problemData.statement,
    inputSpecification: problemData.inputSpecification,
    outputSpecification: problemData.outputSpecification,
    constraints: problemData.constraints,
    explanation: problemData.explanation,
    examples: problemData.examples,
    signature: problemData.signature,
    testCases: problemData.testCases.map((tc) => ({
      order: tc.order,
      isSample: tc.isSample,
      inputPath: `problems/${slug}/tests/${tc.order}.in`,
      outputPath: `problems/${slug}/tests/${tc.order}.out`,
    })),
  };

  fs.writeFileSync(
    path.join(problemDir, "problem.json"),
    JSON.stringify(metadataContent, null, 2),
    "utf-8"
  );

  for (const tc of problemData.testCases) {
    fs.writeFileSync(path.join(testsDir, `${tc.order}.in`), tc.input, "utf-8");
    fs.writeFileSync(path.join(testsDir, `${tc.order}.out`), tc.output, "utf-8");
  }

  if (problemData.signature) {
    for (const [langKey, langDef] of Object.entries(LANGUAGE_REGISTRY)) {
      const studentStub = generateStudentBoilerplate(langKey, problemData.signature);
      const executionWrapper = generateExecutionWrapper(langKey, problemData.signature);

      const fileName = `${langKey}.${langDef.extension}`;
      fs.writeFileSync(path.join(boilerplateDir, fileName), studentStub, "utf-8");
      fs.writeFileSync(path.join(boilerplateFullDir, fileName), executionWrapper, "utf-8");
    }
  }
}

const PROBLEMS = [
  {
    slug: "favorite-movies-list",
    statement: "Write a program that takes the names of three favorite movies entered by the user and stores them in a list/array in the exact order they were entered.",
    inputSpecification: "Three space-separated single-word strings representing movie names $M_1$, $M_2$, and $M_3$.",
    outputSpecification: "Print the three movie names separated by a single space.",
    constraints: "$1 \\le |M_1|, |M_2|, |M_3| \\le 50$, each movie name consists of alphanumeric characters.",
    examples: [
      { input: "Inception Avatar Titanic", output: "Inception Avatar Titanic", displayOrder: 1 },
      { input: "Interstellar Oppenheimer Batman", output: "Interstellar Oppenheimer Batman", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "storeMovies",
      returnType: "string[]",
      parameters: [
        { name: "m1", type: "string" },
        { name: "m2", type: "string" },
        { name: "m3", type: "string" },
      ],
    },
    testCases: [
      { order: 1, isSample: true, input: "Inception Avatar Titanic", output: "Inception Avatar Titanic" },
      { order: 2, isSample: true, input: "Interstellar Oppenheimer Batman", output: "Interstellar Oppenheimer Batman" },
      { order: 3, isSample: false, input: "Matrix Dune Gladiator", output: "Matrix Dune Gladiator" },
      { order: 4, isSample: false, input: "Ironman Thor Hulk", output: "Ironman Thor Hulk" },
      { order: 5, isSample: false, input: "Spiderman Superman Batman", output: "Spiderman Superman Batman" }
    ]
  },
  {
    slug: "list-palindrome-check",
    statement: "Given a list/array of $N$ integers, determine whether the list is a palindrome (reads the same forwards and backwards).",
    inputSpecification: "The first line contains an integer $N$. The second line contains $N$ space-separated integers representing the elements of the list.",
    outputSpecification: "Print `Yes` if the list is a palindrome, otherwise print `No`.",
    constraints: "$1 \\le N \\le 10^5$, $-10^9 \\le \\text{arr}[i] \\le 10^9$.",
    examples: [
      { input: "5\n1 2 3 2 1", output: "Yes", displayOrder: 1 },
      { input: "4\n1 2 3 4", output: "No", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "isListPalindrome",
      returnType: "string",
      parameters: [
        { name: "n", type: "int" },
        { name: "arr", type: "int[]" },
      ],
    },
    testCases: [
      { order: 1, isSample: true, input: "5\n1 2 3 2 1", output: "Yes" },
      { order: 2, isSample: true, input: "4\n1 2 3 4", output: "No" },
      { order: 3, isSample: false, input: "1\n42", output: "Yes" },
      { order: 4, isSample: false, input: "6\n10 20 30 30 20 10", output: "Yes" },
      { order: 5, isSample: false, input: "5\n1 2 3 4 1", output: "No" }
    ]
  },
  {
    slug: "count-grade-a",
    statement: "Given a sequence of $N$ student grades represented as uppercase character strings (e.g. `'A'`, `'B'`, `'C'`, `'D'`), count and return the total number of students who received grade `'A'`.",
    inputSpecification: "The first line contains an integer $N$. The second line contains $N$ space-separated uppercase strings representing the grades.",
    outputSpecification: "Print a single integer representing the count of students with grade `A`.",
    constraints: "$1 \\le N \\le 10^5$, each grade string is an uppercase letter.",
    examples: [
      { input: "7\nC D A A B B A", output: "3", displayOrder: 1 },
      { input: "5\nB B C D F", output: "0", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "countGradeA",
      returnType: "int",
      parameters: [
        { name: "n", type: "int" },
        { name: "grades", type: "string[]" },
      ],
    },
    testCases: [
      { order: 1, isSample: true, input: "7\nC D A A B B A", output: "3" },
      { order: 2, isSample: true, input: "5\nB B C D F", output: "0" },
      { order: 3, isSample: false, input: "4\nA A A A", output: "4" },
      { order: 4, isSample: false, input: "6\nA B A C A D", output: "3" },
      { order: 5, isSample: false, input: "1\nA", output: "1" }
    ]
  },
  {
    slug: "sort-grades",
    statement: "Given a list of $N$ student letter grades (such as `'A'`, `'B'`, `'C'`, `'D'`), sort them in non-decreasing (alphabetical) order from `'A'` to `'D'` and return the sorted list.",
    inputSpecification: "The first line contains an integer $N$. The second line contains $N$ space-separated uppercase grade strings.",
    outputSpecification: "Print the sorted grades separated by a single space.",
    constraints: "$1 \\le N \\le 10^5$.",
    examples: [
      { input: "7\nC D A A B B A", output: "A A A B B C D", displayOrder: 1 },
      { input: "4\nD C B A", output: "A B C D", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "sortGrades",
      returnType: "string[]",
      parameters: [
        { name: "n", type: "int" },
        { name: "grades", type: "string[]" },
      ],
    },
    testCases: [
      { order: 1, isSample: true, input: "7\nC D A A B B A", output: "A A A B B C D" },
      { order: 2, isSample: true, input: "4\nD C B A", output: "A B C D" },
      { order: 3, isSample: false, input: "3\nB A B", output: "A B B" },
      { order: 4, isSample: false, input: "5\nA A A A A", output: "A A A A A" },
      { order: 5, isSample: false, input: "6\nC A B D C B", output: "A B B C C D" }
    ]
  },
  {
    slug: "multiple-of-seven",
    statement: "Given an integer $N$, determine whether it is a multiple of 7.",
    inputSpecification: "A single integer $N$.",
    outputSpecification: "Print `Yes` if $N$ is a multiple of 7, otherwise print `No`.",
    constraints: "$-10^9 \\le N \\le 10^9$",
    examples: [
      { input: "14", output: "Yes", displayOrder: 1 },
      { input: "20", output: "No", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "isMultipleOfSeven",
      returnType: "string",
      parameters: [{ name: "n", type: "int" }],
    },
    testCases: [
      { order: 1, isSample: true, input: "14", output: "Yes" },
      { order: 2, isSample: true, input: "20", output: "No" },
      { order: 3, isSample: false, input: "0", output: "Yes" },
      { order: 4, isSample: false, input: "49", output: "Yes" },
      { order: 5, isSample: false, input: "-21", output: "Yes" },
      { order: 6, isSample: false, input: "100", output: "No" }
    ]
  }
];

console.log("Generating problem directories, tests, problem.json and boilerplates...");
for (const p of PROBLEMS) {
  saveProblem(p.slug, p);
  console.log(`✓ Saved ${p.slug}`);
}
console.log("All problems created successfully!");
