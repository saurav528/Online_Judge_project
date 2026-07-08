import { LanguageDefinition, ParamType } from "./types";

export const LANGUAGE_REGISTRY: Record<string, LanguageDefinition> = {
  CPP: {
    name: "C++",
    extension: "cpp",
    judge0Id: 54, // C++ (GCC 9.2.0) or custom GCC 14 id
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
    judge0Id: 62, // Java (OpenJDK 13.0.1)
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
    judge0Id: 71, // Python (3.8.1)
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

# INSERT_STUDENT_CODE_HERE

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
        # INSERT_PARSING_CODE_HERE

        # INSERT_INVOCATION_CODE_HERE

        # INSERT_SERIALIZATION_CODE_HERE

if __name__ == "__main__":
    main()
`,
  },

  JAVASCRIPT: {
    name: "JavaScript",
    extension: "js",
    judge0Id: 63, // JavaScript (Node.js 12.14.0)
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
