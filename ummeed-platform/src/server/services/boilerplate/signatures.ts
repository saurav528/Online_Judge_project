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
  },
  "distinct-numbers-count-extras": {
    className: "Solution",
    functionName: "countDistinct",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
      { name: "d", type: "int" },
      { name: "e", type: "int" }
    ]
  },
  "most-frequent-digit-extras": {
    className: "Solution",
    functionName: "mostFrequent",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
      { name: "d", type: "int" },
      { name: "e", type: "int" }
    ]
  },
  "common-elements-intersection-extras": {
    className: "Solution",
    functionName: "countCommon",
    returnType: "int",
    parameters: [
      { name: "a1", type: "int" },
      { name: "a2", type: "int" },
      { name: "b1", type: "int" },
      { name: "b2", type: "int" }
    ]
  },
  "lonely-numbers-extras": {
    className: "Solution",
    functionName: "countLonely",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
      { name: "d", type: "int" }
    ]
  },
  "sum-of-unique-elements-extras": {
    className: "Solution",
    functionName: "sumUnique",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
      { name: "d", type: "int" }
    ]
  },
  "slice-and-sum-extras": {
    className: "Solution",
    functionName: "sliceAndSum",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
      { name: "d", type: "int" }
    ]
  },
  "pop-and-multiply-extras": {
    className: "Solution",
    functionName: "popAndMultiply",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" }
    ]
  },
  "tuple-occurrence-counter-extras": {
    className: "Solution",
    functionName: "countInTuple",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
      { name: "target", type: "int" }
    ]
  },
  "sort-and-pick-extras": {
    className: "Solution",
    functionName: "sortAndPick",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" },
      { name: "d", type: "int" }
    ]
  },
  "reverse-difference-extras": {
    className: "Solution",
    functionName: "reverseDifference",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" }
    ]
  },
  "string-length-conditional-extras": {
    className: "Solution",
    functionName: "checkStringLength",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" }
    ]
  },
  "binary-replacement-extras": {
    className: "Solution",
    functionName: "replaceBinary",
    returnType: "int",
    parameters: [
      { name: "s", type: "string" }
    ]
  },
  "first-occurrence-index-extras": {
    className: "Solution",
    functionName: "findFirstOccurrence",
    returnType: "int",
    parameters: [
      { name: "a", type: "string" },
      { name: "b", type: "string" }
    ]
  },
  "divisibility-grade-extras": {
    className: "Solution",
    functionName: "checkDivisibility",
    returnType: "int",
    parameters: [
      { name: "n", type: "int" }
    ]
  },
  "greatest-is-even-extras": {
    className: "Solution",
    functionName: "isGreatestEven",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" }
    ]
  },
  "the-exponent-formula-extras": {
    className: "Solution",
    functionName: "calculateExponent",
    returnType: "int",
    parameters: [
      { name: "base", type: "int" },
      { name: "power", type: "int" }
    ]
  },
  "type-casting-magic-extras": {
    className: "Solution",
    functionName: "concatAndAddTen",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" }
    ]
  },
  "modulo-arithmetic-extras": {
    className: "Solution",
    functionName: "moduloSum",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
      { name: "c", type: "int" }
    ]
  },
  "area-vs-perimeter-check-extras": {
    className: "Solution",
    functionName: "isAreaGreater",
    returnType: "int",
    parameters: [
      { name: "side", type: "int" }
    ]
  },
  "relational-operators-test-extras": {
    className: "Solution",
    functionName: "isNotEqual",
    returnType: "int",
    parameters: [
      { name: "a", type: "int" },
      { name: "b", type: "int" }
    ]
  }
};
