# Walkthrough: Boilerplate Generation System

## 1. Major Goal

The major goal of this phase was to establish the **Boilerplate Generation System** for the Ummeed Coding Platform.

Specifically, we needed to:
- Generate **Student Boilerplates** (the function/class template shown in the code editor for students to write their solutions).
- Generate **Execution Boilerplates** (the backend driver wrappers that import libraries, parse inputs from stdin, execute the student's solution, and print results to stdout).
- Support C++, Java, Python, and JavaScript as interchangeable languages, configuring them through centralized metadata templates.
- Create a Code Wrapping Service that injects student snippets into driver code, returning a complete source file ready for compilation on Judge0.

---

## 2. File-by-File Breakdown

### Boilerplate Engine (Business Logic)
*   **[src/lib/boilerplate/types.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/boilerplate/types.ts)**: Configures type interfaces representing parameters, problem signatures, and language definitions.
*   **[src/lib/boilerplate/languages.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/boilerplate/languages.ts)**: The registry containing type maps, default return variables, and wrapper structures for all supported languages.
*   **[src/lib/boilerplate/generator.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/boilerplate/generator.ts)**: The generator class that interpolates signatures, building:
    - Student template code.
    - Stdin parsers (reading parameters step-by-step).
    - Driver execution statements.
    - Stdout printers (serializing arrays, matrices, and primitives).

### Wrapping Service
*   **[src/lib/services/wrapper.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/services/wrapper.ts)**: Validates input payloads and merges the student's submission code directly into the generated driver wrapper file.

---

## 3. Critical Decisions & The Heart of the Implementation

### A. Inline Parser & Serializer Generation
Rather than manually writing parser files for every programming language and problem permutation (which is highly repetitive and error-prone), we designed the generator to assemble the parsing code dynamically:
- **The Heart**: Inside `generator.ts`, the `generateParsingCode` and `generateSerializationCode` methods iterate over the parameter types in the problem signature. It outputs language-appropriate stream reader calls (like `cin >> var` in C++, or `Integer.parseInt(readNextToken(reader))` in Java) for each parameter sequentially. This allows the platform to support any parameter count and type combination.

### B. Unified Stdin Tokenization
Parsing whitespace-separated tokens differs heavily across languages (Python is trivial, whereas Java requires buffered parsing).
- **The Heart**: We unified input reading inside our wrapper templates. We embedded standard tokenization helpers (like `readNextToken` using `StringTokenizer` in Java, or `nextToken()` splits in JavaScript/Python) directly in each language's execution template. The generated parsing blocks call these helpers uniformly, allowing the generator logic to remain clean and simple.

### C. Scalable Decoupled Architecture
We kept code wrapping entirely separate from execution (Judge0/BullMQ) rules.
- **The Heart**: The `WrapperService` takes pure string parameters and returns a consolidated executable string. It knows nothing about databases or networks. In the next milestone, when the submission pipeline is integrated, we can simply pass the wrapped code string directly to the Judge0 API payload, ensuring a clean separation of concerns.
