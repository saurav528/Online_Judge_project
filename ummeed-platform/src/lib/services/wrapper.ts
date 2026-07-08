import { ProblemSignature } from "../boilerplate/types";
import { BoilerplateGenerator } from "../boilerplate/generator";
import { LANGUAGE_REGISTRY } from "../boilerplate/languages";

export class WrapperService {
  /**
   * Receives student solution code, problem metadata signature, and target language,
   * then builds the complete executable program code ready for Judge0 compilation.
   */
  static wrapSolution(
    studentCode: string,
    signature: ProblemSignature,
    language: string
  ): string {
    const langDef = LANGUAGE_REGISTRY[language];
    if (!langDef) {
      throw new Error(`Unsupported programming language: ${language}`);
    }

    if (!studentCode || studentCode.trim().length === 0) {
      throw new Error("Student code cannot be empty");
    }

    if (!signature || !signature.className || !signature.functionName) {
      throw new Error("Invalid problem signature metadata");
    }

    // 1. Generate the standard execution driver wrapper for this signature
    const executionWrapper = BoilerplateGenerator.generateExecutionWrapper(language, signature);

    // 2. Inject the student code snippet into the wrapper placeholder
    const finalSource = executionWrapper.replace("// INSERT_STUDENT_CODE_HERE", studentCode);

    return finalSource;
  }
}
