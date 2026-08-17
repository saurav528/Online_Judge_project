import { ProblemSignature } from "./types";

export const STANDARD_SIGNATURES: Record<string, ProblemSignature> = {
  "two-sum": {
    className: "Solution",
    functionName: "twoSum",
    returnType: "int[]",
    parameters: [
      { name: "n", type: "int" },
      { name: "target", type: "int" },
      { name: "nums", type: "int[]" }
    ]
  },
  "valid-parentheses": {
    className: "Solution",
    functionName: "isValid",
    returnType: "boolean",
    parameters: [
      { name: "s", type: "string" }
    ]
  },
  "longest-substring-without-repeating-characters": {
    className: "Solution",
    functionName: "lengthOfLongestSubstring",
    returnType: "int",
    parameters: [
      { name: "s", type: "string" }
    ]
  },
  "maximum-subarray-sum": {
    className: "Solution",
    functionName: "maxSubArray",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" },
      { name: "nums", type: "int[]" }
    ]
  },
  "trapping-rain-water": {
    className: "Solution",
    functionName: "trap",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" },
      { name: "height", type: "int[]" }
    ]
  }
};
