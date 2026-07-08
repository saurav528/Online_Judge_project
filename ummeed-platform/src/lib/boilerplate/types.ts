export type ParamType =
  | "int"
  | "double"
  | "string"
  | "boolean"
  | "int[]"
  | "string[]"
  | "int[][]";

export interface Parameter {
  name: string;
  type: ParamType;
}

export interface ProblemSignature {
  className: string;
  functionName: string;
  returnType: ParamType;
  parameters: Parameter[];
}

export interface LanguageDefinition {
  name: string;
  extension: string;
  judge0Id: number; // For future Judge0 routing
  typeMappings: Record<ParamType, string>;
  defaultReturns: Record<ParamType, string>;
  
  // Custom templates to build the main/driver code wrapper
  wrapperTemplate: string;
}
