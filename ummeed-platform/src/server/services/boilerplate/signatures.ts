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
  },
  "word-dictionary-meaning": {
    className: "Solution",
    functionName: "getMeaning",
    returnType: "string",
    parameters: [
      { name: "word", type: "string" }
    ]
  },
  "count-classrooms-needed": {
    className: "Solution",
    functionName: "countClassrooms",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" },
      { name: "subjects", type: "string[]" }
    ]
  },
  "subject-marks-total": {
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
  "store-int-and-float-in-set": {
    className: "Solution",
    functionName: "countDistinctTyped",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "double" }
    ]
  }
};
