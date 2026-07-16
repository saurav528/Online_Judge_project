import { ProblemSignature } from "./types";
import { LANGUAGE_REGISTRY } from "./languages";

export class BoilerplateGenerator {
  static generateGenericBoilerplate(langKey: string): string {
    switch (langKey) {
      case "CPP":
        return `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}\n`;
      case "JAVA":
        return `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}\n`;
      case "PYTHON":
        return `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()\n`;
      case "JAVASCRIPT":
        return `function main() {\n    // Write your code here\n    \n}\n\nmain();\n`;
      default:
        return "// Write your code here\n";
    }
  }

  static generateStudentBoilerplate(langKey: string, sig: ProblemSignature): string {
    const lang = LANGUAGE_REGISTRY[langKey];
    if (!lang) {
      throw new Error(`Unsupported language key: ${langKey}`);
    }

    const defaultReturn = lang.defaultReturns[sig.returnType] || "";

    switch (langKey) {
      case "CPP": {
        const paramsStr = sig.parameters
          .map((p) => {
            const mappedType = lang.typeMappings[p.type];
            // Pass vectors by reference to match standard C++ coding conventions
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
        throw new Error(`Unsupported language generation rules for ${langKey}`);
    }
  }

  /**
   * Generates the wrapper execution code that parses inputs from stdin,
   * invokes the solution class, and serializes output results to stdout.
   */
  static generateExecutionWrapper(langKey: string, sig: ProblemSignature): string {
    const lang = LANGUAGE_REGISTRY[langKey];
    if (!lang) {
      throw new Error(`Unsupported language key: ${langKey}`);
    }

    // 1. Generate Input Parsing Code
    const parsingCode = this.generateParsingCode(langKey, sig);

    // 2. Generate Invocation Code
    const invocationCode = this.generateInvocationCode(langKey, sig);

    // 3. Generate Serialization Code
    const serializationCode = this.generateSerializationCode(langKey, sig);

    // 4. Inject into the language wrapper template
    let wrapper = lang.wrapperTemplate;
    wrapper = wrapper.replace("// INSERT_PARSING_CODE_HERE", parsingCode);
    wrapper = wrapper.replace("// INSERT_INVOCATION_CODE_HERE", invocationCode);
    wrapper = wrapper.replace("// INSERT_SERIALIZATION_CODE_HERE", serializationCode);

    return wrapper.trim();
  }

  /**
   * Generates the step-by-step reading code for parameters.
   */
  private static generateParsingCode(langKey: string, sig: ProblemSignature): string {
    const lines: string[] = [];

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
        } else if (p.type === "int[][]") {
          lines.push(
            `    int rows_${p.name}, cols_${p.name};\n    std::cin >> rows_${p.name} >> cols_${p.name};\n    std::vector<std::vector<int>> ${p.name}(rows_${p.name}, std::vector<int>(cols_${p.name}));\n    for(int i = 0; i < rows_${p.name}; ++i) {\n        for(int j = 0; j < cols_${p.name}; ++j) {\n            std::cin >> ${p.name}[i][j];\n        }\n    }`
          );
        }
      } else if (langKey === "JAVA") {
        // Read tokens step-by-step using BufferedReader and custom Tokenizer logic
        if (p.type === "int") {
          lines.push(
            `        int ${p.name} = Integer.parseInt(readNextToken(reader));`
          );
        } else if (p.type === "double") {
          lines.push(
            `        double ${p.name} = Double.parseDouble(readNextToken(reader));`
          );
        } else if (p.type === "string") {
          lines.push(`        String ${p.name} = readNextToken(reader);`);
        } else if (p.type === "boolean") {
          lines.push(
            `        boolean ${p.name} = Boolean.parseBoolean(readNextToken(reader));`
          );
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
        } else if (p.type === "int[][]") {
          lines.push(
            `        int rows_${p.name} = Integer.parseInt(readNextToken(reader));\n        int cols_${p.name} = Integer.parseInt(readNextToken(reader));\n        int[][] ${p.name} = new int[rows_${p.name}][cols_${p.name}];\n        for(int i = 0; i < rows_${p.name}; i++) {\n            for(int j = 0; j < cols_${p.name}; j++) {\n                ${p.name}[i][j] = Integer.parseInt(readNextToken(reader));\n            }\n        }`
          );
        }
      } else if (langKey === "PYTHON") {
        if (p.type === "int") {
          lines.push(`    ${p.name} = int(next_token())`);
        } else if (p.type === "double") {
          lines.push(`    ${p.name} = float(next_token())`);
        } else if (p.type === "string") {
          lines.push(`    ${p.name} = next_token()`);
        } else if (p.type === "boolean") {
          lines.push(
            `    ${p.name} = next_token().lower() in ("true", "1")`
          );
        } else if (p.type === "int[]") {
          const pIndex = sig.parameters.indexOf(p);
          const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
          const sizeDecl = precedingSizeParam ? "" : `    size_${p.name} = int(next_token())\n`;
          const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
          lines.push(
            `${sizeDecl}    ${p.name} = [int(next_token()) for _ in range(${sizeVar})]`
          );
        } else if (p.type === "string[]") {
          const pIndex = sig.parameters.indexOf(p);
          const precedingSizeParam = sig.parameters.slice(0, pIndex).find((param) => param.type === "int");
          const sizeDecl = precedingSizeParam ? "" : `    size_${p.name} = int(next_token())\n`;
          const sizeVar = precedingSizeParam ? precedingSizeParam.name : `size_${p.name}`;
          lines.push(
            `${sizeDecl}    ${p.name} = [next_token() for _ in range(${sizeVar})]`
          );
        } else if (p.type === "int[][]") {
          lines.push(
            `    rows_${p.name} = int(next_token())\n    cols_${p.name} = int(next_token())\n    ${p.name} = [[int(next_token()) for _ in range(cols_${p.name})] for _ in range(rows_${p.name})]`
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
          lines.push(
            `    const ${p.name} = nextToken().toLowerCase() === "true" || nextToken() === "1";`
          );
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
        } else if (p.type === "int[][]") {
          lines.push(
            `    const rows_${p.name} = parseInt(nextToken(), 10);\n    const cols_${p.name} = parseInt(nextToken(), 10);\n    const ${p.name} = [];\n    for(let i = 0; i < rows_${p.name}; i++) {\n        const row = [];\n        for(let j = 0; j < cols_${p.name}; j++) {\n            row.push(parseInt(nextToken(), 10));\n        }\n        ${p.name}.push(row);\n    }`
          );
        }
      }
    }



    return lines.join("\n");
  }

  /**
   * Generates code invoking the student function inside the wrapper.
   */
  private static generateInvocationCode(langKey: string, sig: ProblemSignature): string {
    const argsStr = sig.parameters.map((p) => p.name).join(", ");

    switch (langKey) {
      case "CPP":
        return `    ${sig.className} solver;\n    auto result = solver.${sig.functionName}(${argsStr});`;
      case "JAVA":
        return `        ${sig.className} solver = new ${sig.className}();\n        ${LANGUAGE_REGISTRY.JAVA.typeMappings[sig.returnType]} result = solver.${sig.functionName}(${argsStr});`;
      case "PYTHON":
        return `    solver = ${sig.className}()\n    result = solver.${sig.functionName}(${argsStr})`;
      case "JAVASCRIPT":
        return `    const solver = new ${sig.className}();\n    const result = solver.${sig.functionName}(${argsStr});`;
      default:
        return "";
    }
  }

  /**
   * Generates code writing output results to stdout.
   */
  private static generateSerializationCode(langKey: string, sig: ProblemSignature): string {
    switch (langKey) {
      case "CPP": {
        if (sig.returnType === "boolean") {
          return '    std::cout << (result ? "true" : "false") << std::endl;';
        } else if (sig.returnType.includes("[]")) {
          // Serialize 1D or 2D vectors
          if (sig.returnType === "int[]" || sig.returnType === "string[]") {
            return `    for(size_t i = 0; i < result.size(); ++i) {\n        std::cout << result[i] << (i == result.size() - 1 ? "" : " ");\n    }\n    std::cout << std::endl;`;
          } else {
            return `    for(size_t i = 0; i < result.size(); ++i) {\n        for(size_t j = 0; j < result[i].size(); ++j) {\n            std::cout << result[i][j] << (j == result[i].size() - 1 ? "" : " ");\n        }\n        std::cout << std::endl;\n    }`;
          }
        }
        return "    std::cout << result << std::endl;";
      }

      case "JAVA": {
        if (sig.returnType === "int[]" || sig.returnType === "string[]") {
          return `        for(int i = 0; i < result.length; i++) {\n            System.out.print(result[i] + (i == result.length - 1 ? "" : " "));\n        }\n        System.out.println();`;
        } else if (sig.returnType === "int[][]") {
          return `        for(int i = 0; i < result.length; i++) {\n            for(int j = 0; j < result[i].length; j++) {\n                System.out.print(result[i][j] + (j == result[i].length - 1 ? "" : " "));\n            }\n            System.out.println();\n        }`;
        }
        return "        System.out.println(result);";
      }

      case "PYTHON": {
        if (sig.returnType === "boolean") {
          return '    print(str(result).lower())';
        } else if (sig.returnType === "int[]" || sig.returnType === "string[]") {
          return '    print(" ".join(map(str, result)))';
        } else if (sig.returnType === "int[][]") {
          return '    for row in result:\n        print(" ".join(map(str, row)))';
        }
        return "    print(result)";
      }

      case "JAVASCRIPT": {
        if (sig.returnType === "boolean") {
          return "    console.log(result.toString());";
        } else if (sig.returnType === "int[]" || sig.returnType === "string[]") {
          return "    console.log(result.join(' '));";
        } else if (sig.returnType === "int[][]") {
          return "    result.forEach(row => console.log(row.join(' ')));";
        }
        return "    console.log(result);";
      }

      default:
        return "";
    }
  }
}
