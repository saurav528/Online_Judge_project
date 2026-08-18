const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '..', '..', 'problems');

const EXTRAS_PROBLEMS = [
  {
    slug: "distinct-numbers-count-extras",
    title: "Distinct Numbers Count - Extras",
    difficulty: "EASY",
    statement: "Given 5 integers, find and output the total count of **unique (distinct)** integers among them.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can store elements in a `set` (like `len(set([a, b, c, d, e]))`) to easily count unique items!*",
    inputSpecification: "Five space-separated integers: $a, b, c, d, e$.",
    outputSpecification: "Print a single integer representing the count of distinct values.",
    constraints: "$-10^9 \\le a, b, c, d, e \\le 10^9$",
    examples: [
      { input: "1 1 1 1 1", output: "1", displayOrder: 1 },
      { input: "1 2 3 4 5", output: "5", displayOrder: 2 },
      { input: "1 2 2 3 3", output: "3", displayOrder: 3 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "1 1 1 1 1", output: "1" },
      { order: 2, isSample: true, input: "1 2 3 4 5", output: "5" },
      { order: 3, isSample: true, input: "1 2 2 3 3", output: "3" },
      { order: 4, isSample: false, input: "9 9 8 8 7", output: "3" },
      { order: 5, isSample: false, input: "0 0 0 1 2", output: "3" },
      { order: 6, isSample: false, input: "4 5 4 5 4", output: "2" },
      { order: 7, isSample: false, input: "7 8 9 10 10", output: "4" },
      { order: 8, isSample: false, input: "2 4 6 8 10", output: "5" },
      { order: 9, isSample: false, input: "3 3 3 4 4", output: "2" },
      { order: 10, isSample: false, input: "1 10 1 10 1", output: "2" },
      { order: 11, isSample: false, input: "5 6 7 5 6", output: "3" },
      { order: 12, isSample: false, input: "8 8 8 8 9", output: "2" },
      { order: 13, isSample: false, input: "12 13 14 15 12", output: "4" },
      { order: 14, isSample: false, input: "20 20 20 20 20", output: "1" },
      { order: 15, isSample: false, input: "1 3 5 7 9", output: "5" }
    ],
    tags: ["Python", "Set", "Basics"]
  },
  {
    slug: "most-frequent-digit-extras",
    title: "Most Frequent Digit - Extras",
    difficulty: "EASY",
    statement: "Given 5 integers, find which integer appears the most frequent number of times. Output that integer.\n\n💡 **Note:** *This problem is designed for Python practice. You can use a Python dictionary `dict` to count occurrences of each number!*",
    inputSpecification: "Five space-separated integers: $a, b, c, d, e$.",
    outputSpecification: "Print the most frequent integer.",
    constraints: "$-10^9 \\le a, b, c, d, e \\le 10^9$",
    examples: [
      { input: "1 1 2 3 4", output: "1", displayOrder: 1 },
      { input: "5 5 5 2 1", output: "5", displayOrder: 2 },
      { input: "9 8 9 8 9", output: "9", displayOrder: 3 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "1 1 2 3 4", output: "1" },
      { order: 2, isSample: true, input: "5 5 5 2 1", output: "5" },
      { order: 3, isSample: true, input: "9 8 9 8 9", output: "9" },
      { order: 4, isSample: false, input: "2 2 3 3 3", output: "3" },
      { order: 5, isSample: false, input: "0 1 0 1 0", output: "0" },
      { order: 6, isSample: false, input: "7 7 7 7 8", output: "7" },
      { order: 7, isSample: false, input: "4 5 6 4 4", output: "4" },
      { order: 8, isSample: false, input: "1 2 1 1 5", output: "1" },
      { order: 9, isSample: false, input: "8 9 8 9 8", output: "8" },
      { order: 10, isSample: false, input: "3 4 5 5 5", output: "5" },
      { order: 11, isSample: false, input: "6 6 1 2 6", output: "6" },
      { order: 12, isSample: false, input: "2 2 2 1 0", output: "2" },
      { order: 13, isSample: false, input: "4 4 4 4 4", output: "4" },
      { order: 14, isSample: false, input: "10 10 11 10 12", output: "10" },
      { order: 15, isSample: false, input: "9 1 1 1 9", output: "1" }
    ],
    tags: ["Python", "Dictionary", "Counting"]
  },
  {
    slug: "common-elements-intersection-extras",
    title: "Common Elements Intersection - Extras",
    difficulty: "EASY",
    statement: "Given 4 integers, treat the first two integers as **Set A** and the last two integers as **Set B**.\n\nOutput the total number of common unique elements between Set A and Set B (the size of their intersection).\n\n💡 **Note:** *This problem is designed for Python practice. You can use Python set intersection: `len(set([a1, a2]) & set([b1, b2]))`!*",
    inputSpecification: "Four space-separated integers: $a_1, a_2, b_1, b_2$.",
    outputSpecification: "Print a single integer representing the count of common unique elements.",
    constraints: "$-10^9 \\le a_1, a_2, b_1, b_2 \\le 10^9$",
    examples: [
      { input: "1 2 1 2", output: "2", displayOrder: 1 },
      { input: "1 2 3 4", output: "0", displayOrder: 2 },
      { input: "1 1 1 2", output: "1", displayOrder: 3 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "1 2 1 2", output: "2" },
      { order: 2, isSample: true, input: "1 2 3 4", output: "0" },
      { order: 3, isSample: true, input: "1 1 1 2", output: "1" },
      { order: 4, isSample: false, input: "5 6 6 7", output: "1" },
      { order: 5, isSample: false, input: "8 9 8 9", output: "2" },
      { order: 6, isSample: false, input: "0 1 2 3", output: "0" },
      { order: 7, isSample: false, input: "4 4 4 4", output: "1" },
      { order: 8, isSample: false, input: "2 3 3 2", output: "2" },
      { order: 9, isSample: false, input: "1 5 5 1", output: "2" },
      { order: 10, isSample: false, input: "7 8 9 10", output: "0" },
      { order: 11, isSample: false, input: "3 4 4 5", output: "1" },
      { order: 12, isSample: false, input: "9 9 8 7", output: "0" },
      { order: 13, isSample: false, input: "6 7 6 6", output: "1" },
      { order: 14, isSample: false, input: "10 11 10 12", output: "1" },
      { order: 15, isSample: false, input: "1 2 2 1", output: "2" }
    ],
    tags: ["Python", "Set", "Basics"]
  },
  {
    slug: "lonely-numbers-extras",
    title: "Lonely Numbers - Extras",
    difficulty: "EASY",
    statement: "Given 4 integers, count how many of them are **lonely numbers** (numbers that appear **exactly once** among the 4 inputs).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can count frequencies with a dictionary and check `sum(1 for v in count.values() if v == 1)`!*",
    inputSpecification: "Four space-separated integers: $a, b, c, d$.",
    outputSpecification: "Print the count of numbers that appear exactly once.",
    constraints: "$-10^9 \\le a, b, c, d \\le 10^9$",
    examples: [
      { input: "1 2 3 4", output: "4", displayOrder: 1 },
      { input: "1 1 2 3", output: "2", displayOrder: 2 },
      { input: "1 1 1 1", output: "0", displayOrder: 3 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "1 2 3 4", output: "4" },
      { order: 2, isSample: true, input: "1 1 2 3", output: "2" },
      { order: 3, isSample: true, input: "1 1 1 1", output: "0" },
      { order: 4, isSample: false, input: "1 1 1 2", output: "1" },
      { order: 5, isSample: false, input: "5 5 6 6", output: "0" },
      { order: 6, isSample: false, input: "8 9 10 8", output: "2" },
      { order: 7, isSample: false, input: "3 4 4 4", output: "1" },
      { order: 8, isSample: false, input: "7 8 9 10", output: "4" },
      { order: 9, isSample: false, input: "2 2 3 2", output: "1" },
      { order: 10, isSample: false, input: "0 1 0 1", output: "0" },
      { order: 11, isSample: false, input: "5 6 7 8", output: "4" },
      { order: 12, isSample: false, input: "9 9 8 7", output: "2" },
      { order: 13, isSample: false, input: "4 5 4 5", output: "0" },
      { order: 14, isSample: false, input: "1 2 2 2", output: "1" },
      { order: 15, isSample: false, input: "3 3 3 3", output: "0" }
    ],
    tags: ["Python", "Dictionary", "Counting"]
  },
  {
    slug: "sum-of-unique-elements-extras",
    title: "Sum of Unique Elements - Extras",
    difficulty: "EASY",
    statement: "Given 4 integers, remove all duplicate numbers using a set, and calculate the **sum of the remaining unique elements**.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can simply write `sum(set([a, b, c, d]))`!*",
    inputSpecification: "Four space-separated integers: $a, b, c, d$.",
    outputSpecification: "Print the sum of all unique numbers.",
    constraints: "$-10^9 \\le a, b, c, d \\le 10^9$",
    examples: [
      { input: "1 1 1 1", output: "1", displayOrder: 1 },
      { input: "1 2 3 4", output: "10", displayOrder: 2 },
      { input: "2 2 4 4", output: "6", displayOrder: 3 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "1 1 1 1", output: "1" },
      { order: 2, isSample: true, input: "1 2 3 4", output: "10" },
      { order: 3, isSample: true, input: "2 2 4 4", output: "6" },
      { order: 4, isSample: false, input: "5 5 5 10", output: "15" },
      { order: 5, isSample: false, input: "0 0 1 1", output: "1" },
      { order: 6, isSample: false, input: "3 3 6 6", output: "9" },
      { order: 7, isSample: false, input: "1 2 1 2", output: "3" },
      { order: 8, isSample: false, input: "7 7 8 8", output: "15" },
      { order: 9, isSample: false, input: "4 5 6 4", output: "15" },
      { order: 10, isSample: false, input: "9 9 9 0", output: "9" },
      { order: 11, isSample: false, input: "2 3 4 5", output: "14" },
      { order: 12, isSample: false, input: "10 10 10 5", output: "15" },
      { order: 13, isSample: false, input: "8 8 1 1", output: "9" },
      { order: 14, isSample: false, input: "0 0 0 0", output: "0" },
      { order: 15, isSample: false, input: "6 7 8 9", output: "30" }
    ],
    tags: ["Python", "Set", "Math"]
  },
  {
    slug: "slice-and-sum-extras",
    title: "Slice and Sum - Extras",
    difficulty: "EASY",
    statement: "Given 4 integers stored in a list, extract the elements at **index 1** and **index 2** (using list slicing `lst[1:3]`), and output their sum.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, slicing `lst[1:3]` extracts index 1 and index 2!*",
    inputSpecification: "Four space-separated integers: $a, b, c, d$.",
    outputSpecification: "Print the sum of elements at index 1 and index 2.",
    constraints: "$-10^9 \\le a, b, c, d \\le 10^9$",
    examples: [
      { input: "10 20 30 40", output: "50", displayOrder: 1 },
      { input: "1 2 3 4", output: "5", displayOrder: 2 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "10 20 30 40", output: "50" },
      { order: 2, isSample: true, input: "1 2 3 4", output: "5" },
      { order: 3, isSample: false, input: "0 0 0 0", output: "0" },
      { order: 4, isSample: false, input: "5 10 15 20", output: "25" },
      { order: 5, isSample: false, input: "9 8 7 6", output: "15" },
      { order: 6, isSample: false, input: "1 5 5 1", output: "10" },
      { order: 7, isSample: false, input: "4 4 4 4", output: "8" },
      { order: 8, isSample: false, input: "2 8 2 8", output: "10" },
      { order: 9, isSample: false, input: "7 0 0 7", output: "0" },
      { order: 10, isSample: false, input: "12 1 2 12", output: "3" },
      { order: 11, isSample: false, input: "5 6 7 8", output: "13" },
      { order: 12, isSample: false, input: "10 10 10 10", output: "20" },
      { order: 13, isSample: false, input: "3 9 1 4", output: "10" },
      { order: 14, isSample: false, input: "2 2 3 3", output: "5" },
      { order: 15, isSample: false, input: "8 1 1 8", output: "2" }
    ],
    tags: ["Python", "List", "Slicing"]
  },
  {
    slug: "pop-and-multiply-extras",
    title: "Pop and Multiply - Extras",
    difficulty: "EASY",
    statement: "Given 3 integers stored in a list, remove (pop) the element at index 1 using `lst.pop(1)`. Then, output the product of the popped element and the new length of the list (`popped * len(lst)`).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, `popped = lst.pop(1)` removes index 1 and leaves 2 elements!*",
    inputSpecification: "Three space-separated integers: $a, b, c$.",
    outputSpecification: "Print the product of the popped element and the remaining length of the list.",
    constraints: "$-10^9 \\le a, b, c \\le 10^9$",
    examples: [
      { input: "5 10 15", output: "20", displayOrder: 1 },
      { input: "1 2 3", output: "4", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "popAndMultiply",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" },
        { name: "c", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "5 10 15", output: "20" },
      { order: 2, isSample: true, input: "1 2 3", output: "4" },
      { order: 3, isSample: false, input: "0 5 0", output: "10" },
      { order: 4, isSample: false, input: "8 8 8", output: "16" },
      { order: 5, isSample: false, input: "4 1 4", output: "2" },
      { order: 6, isSample: false, input: "7 0 7", output: "0" },
      { order: 7, isSample: false, input: "2 6 2", output: "12" },
      { order: 8, isSample: false, input: "9 3 9", output: "6" },
      { order: 9, isSample: false, input: "10 20 30", output: "40" },
      { order: 10, isSample: false, input: "5 5 5", output: "10" },
      { order: 11, isSample: false, input: "1 1 1", output: "2" },
      { order: 12, isSample: false, input: "3 4 5", output: "8" },
      { order: 13, isSample: false, input: "6 7 8", output: "14" },
      { order: 14, isSample: false, input: "2 9 2", output: "18" },
      { order: 15, isSample: false, input: "0 0 0", output: "0" }
    ],
    tags: ["Python", "List", "Methods"]
  },
  {
    slug: "tuple-occurrence-counter-extras",
    title: "Tuple Occurrence Counter - Extras",
    difficulty: "EASY",
    statement: "Given 4 integers, create a tuple from the first 3 integers `(a, b, c)`. Output how many times the 4th integer `target` appears in the tuple using `tup.count(target)`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, `tup = (a, b, c); return tup.count(target)`!*",
    inputSpecification: "Four space-separated integers: $a, b, c, \\text{target}$.",
    outputSpecification: "Print the count of occurrences of the target in the tuple.",
    constraints: "$-10^9 \\le a, b, c, \\text{target} \\le 10^9$",
    examples: [
      { input: "1 2 1 1", output: "2", displayOrder: 1 },
      { input: "5 5 5 5", output: "3", displayOrder: 2 },
      { input: "1 2 3 4", output: "0", displayOrder: 3 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "1 2 1 1", output: "2" },
      { order: 2, isSample: true, input: "5 5 5 5", output: "3" },
      { order: 3, isSample: true, input: "1 2 3 4", output: "0" },
      { order: 4, isSample: false, input: "8 9 8 9", output: "1" },
      { order: 5, isSample: false, input: "2 2 3 2", output: "2" },
      { order: 6, isSample: false, input: "4 5 6 5", output: "1" },
      { order: 7, isSample: false, input: "0 0 1 0", output: "2" },
      { order: 8, isSample: false, input: "7 7 7 8", output: "0" },
      { order: 9, isSample: false, input: "1 1 2 1", output: "2" },
      { order: 10, isSample: false, input: "3 4 3 3", output: "2" },
      { order: 11, isSample: false, input: "9 9 9 9", output: "3" },
      { order: 12, isSample: false, input: "6 1 6 1", output: "1" },
      { order: 13, isSample: false, input: "2 4 6 8", output: "0" },
      { order: 14, isSample: false, input: "5 0 5 0", output: "1" },
      { order: 15, isSample: false, input: "3 3 1 3", output: "2" }
    ],
    tags: ["Python", "Tuple", "Counting"]
  },
  {
    slug: "sort-and-pick-extras",
    title: "Sort and Pick - Extras",
    difficulty: "EASY",
    statement: "Given 4 integers stored in a list, sort the list in ascending order (using `lst.sort()`), and output the element at **index 2** (the 3rd element in 0-based indexing).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, `lst = [a, b, c, d]; lst.sort(); return lst[2]`!*",
    inputSpecification: "Four space-separated integers: $a, b, c, d$.",
    outputSpecification: "Print the element at index 2 after sorting.",
    constraints: "$-10^9 \\le a, b, c, d \\le 10^9$",
    examples: [
      { input: "4 1 3 2", output: "3", displayOrder: 1 },
      { input: "10 40 20 30", output: "30", displayOrder: 2 }
    ],
    signature: {
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
    testCases: [
      { order: 1, isSample: true, input: "4 1 3 2", output: "3" },
      { order: 2, isSample: true, input: "10 40 20 30", output: "30" },
      { order: 3, isSample: false, input: "1 1 1 1", output: "1" },
      { order: 4, isSample: false, input: "9 5 7 3", output: "7" },
      { order: 5, isSample: false, input: "2 8 4 6", output: "6" },
      { order: 6, isSample: false, input: "0 3 1 2", output: "2" },
      { order: 7, isSample: false, input: "5 5 6 6", output: "6" },
      { order: 8, isSample: false, input: "8 2 8 2", output: "8" },
      { order: 9, isSample: false, input: "7 9 8 10", output: "9" },
      { order: 10, isSample: false, input: "12 15 11 14", output: "14" },
      { order: 11, isSample: false, input: "1 5 2 4", output: "4" },
      { order: 12, isSample: false, input: "3 3 2 2", output: "3" },
      { order: 13, isSample: false, input: "6 0 6 0", output: "6" },
      { order: 14, isSample: false, input: "4 7 5 8", output: "7" },
      { order: 15, isSample: false, input: "10 10 9 9", output: "10" }
    ],
    tags: ["Python", "List", "Sorting"]
  },
  {
    slug: "reverse-difference-extras",
    title: "Reverse Difference - Extras",
    difficulty: "EASY",
    statement: "Given 3 integers in a list `[a, b, c]`, reverse the list (using `lst.reverse()`). Then, subtract the new element at index 2 from the new element at index 0 and output the result (`new_lst[0] - new_lst[2]`).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, `lst.reverse()` flips the list!*",
    inputSpecification: "Three space-separated integers: $a, b, c$.",
    outputSpecification: "Print the difference `lst[0] - lst[2]` after reversing.",
    constraints: "$-10^9 \\le a, b, c \\le 10^9$",
    examples: [
      { input: "10 20 30", output: "20", displayOrder: 1 },
      { input: "1 2 3", output: "2", displayOrder: 2 },
      { input: "8 4 0", output: "-8", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "reverseDifference",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" },
        { name: "c", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "10 20 30", output: "20" },
      { order: 2, isSample: true, input: "1 2 3", output: "2" },
      { order: 3, isSample: true, input: "8 4 0", output: "-8" },
      { order: 4, isSample: false, input: "5 5 5", output: "0" },
      { order: 5, isSample: false, input: "1 5 9", output: "8" },
      { order: 6, isSample: false, input: "7 8 9", output: "2" },
      { order: 7, isSample: false, input: "20 10 0", output: "-20" },
      { order: 8, isSample: false, input: "4 4 6", output: "2" },
      { order: 9, isSample: false, input: "3 2 1", output: "-2" },
      { order: 10, isSample: false, input: "0 5 10", output: "10" },
      { order: 11, isSample: false, input: "6 6 2", output: "-4" },
      { order: 12, isSample: false, input: "9 1 9", output: "0" },
      { order: 13, isSample: false, input: "2 4 8", output: "6" },
      { order: 14, isSample: false, input: "15 10 5", output: "-10" },
      { order: 15, isSample: false, input: "1 0 1", output: "0" }
    ],
    tags: ["Python", "List", "Methods"]
  },
  {
    slug: "string-length-conditional-extras",
    title: "String Length Conditional - Extras",
    difficulty: "EASY",
    statement: "Given an integer $N$, convert it to a string. If the number of characters in the string is strictly greater than 2 (`len(str(n)) > 2`), output `1`, otherwise output `0`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can use `len(str(n))` with an `if-else` condition!*",
    inputSpecification: "A single non-negative integer $N$.",
    outputSpecification: "Print `1` if length of $N$ as a string is $> 2$, else print `0`.",
    constraints: "$0 \\le N \\le 10^9$",
    examples: [
      { input: "10", output: "0", displayOrder: 1 },
      { input: "100", output: "1", displayOrder: 2 },
      { input: "5", output: "0", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "checkStringLength",
      returnType: "int",
      parameters: [
        { name: "n", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "10", output: "0" },
      { order: 2, isSample: true, input: "100", output: "1" },
      { order: 3, isSample: true, input: "5", output: "0" },
      { order: 4, isSample: false, input: "999", output: "1" },
      { order: 5, isSample: false, input: "12", output: "0" },
      { order: 6, isSample: false, input: "1000", output: "1" },
      { order: 7, isSample: false, input: "0", output: "0" },
      { order: 8, isSample: false, input: "99", output: "0" },
      { order: 9, isSample: false, input: "101", output: "1" },
      { order: 10, isSample: false, input: "5000", output: "1" },
      { order: 11, isSample: false, input: "8", output: "0" },
      { order: 12, isSample: false, input: "256", output: "1" },
      { order: 13, isSample: false, input: "42", output: "0" },
      { order: 14, isSample: false, input: "12345", output: "1" },
      { order: 15, isSample: false, input: "77", output: "0" }
    ],
    tags: ["Python", "String", "Conditionals"]
  },
  {
    slug: "binary-replacement-extras",
    title: "Binary Replacement - Extras",
    difficulty: "EASY",
    statement: "Given a binary string $S$ containing only digits `'0'` and `'1'`, replace all occurrences of `'0'` with `'1'`. Convert the resulting string to an integer and output it.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can use `s.replace('0', '1')`!*",
    inputSpecification: "A single binary string $S$.",
    outputSpecification: "Print the integer obtained after replacing all '0's with '1's.",
    constraints: "$1 \\le |S| \\le 18$, $S$ consists only of '0' and '1'.",
    examples: [
      { input: "10", output: "11", displayOrder: 1 },
      { input: "101", output: "111", displayOrder: 2 }
    ],
    signature: {
      className: "Solution",
      functionName: "replaceBinary",
      returnType: "int",
      parameters: [
        { name: "s", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "10", output: "11" },
      { order: 2, isSample: true, input: "101", output: "111" },
      { order: 3, isSample: false, input: "0", output: "1" },
      { order: 4, isSample: false, input: "111", output: "111" },
      { order: 5, isSample: false, input: "1000", output: "1111" },
      { order: 6, isSample: false, input: "1010", output: "1111" },
      { order: 7, isSample: false, input: "1", output: "1" },
      { order: 8, isSample: false, input: "1001", output: "1111" },
      { order: 9, isSample: false, input: "110", output: "111" },
      { order: 10, isSample: false, input: "100", output: "111" },
      { order: 11, isSample: false, input: "1110", output: "1111" },
      { order: 12, isSample: false, input: "10000", output: "11111" },
      { order: 13, isSample: false, input: "10101", output: "11111" },
      { order: 14, isSample: false, input: "11011", output: "11111" },
      { order: 15, isSample: false, input: "100", output: "111" }
    ],
    tags: ["Python", "String", "Methods"]
  },
  {
    slug: "first-occurrence-index-extras",
    title: "First Occurrence Index - Extras",
    difficulty: "EASY",
    statement: "Given two strings $A$ and $B$, find the 0-based index of the **first occurrence** of string $B$ inside string $A$. If $B$ is not found inside $A$, output `-1`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can use `a.find(b)`!*",
    inputSpecification: "Two space-separated strings: $A$ and $B$.",
    outputSpecification: "Print the 0-based first occurrence index, or `-1` if not found.",
    constraints: "$1 \\le |B| \\le |A| \\le 1000$",
    examples: [
      { input: "1234 3", output: "2", displayOrder: 1 },
      { input: "5678 9", output: "-1", displayOrder: 2 },
      { input: "1010 0", output: "1", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "findFirstOccurrence",
      returnType: "int",
      parameters: [
        { name: "a", type: "string" },
        { name: "b", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "1234 3", output: "2" },
      { order: 2, isSample: true, input: "5678 9", output: "-1" },
      { order: 3, isSample: true, input: "1010 0", output: "1" },
      { order: 4, isSample: false, input: "9999 9", output: "0" },
      { order: 5, isSample: false, input: "1212 2", output: "1" },
      { order: 6, isSample: false, input: "4567 45", output: "0" },
      { order: 7, isSample: false, input: "8910 10", output: "2" },
      { order: 8, isSample: false, input: "3333 4", output: "-1" },
      { order: 9, isSample: false, input: "159 5", output: "1" },
      { order: 10, isSample: false, input: "741 1", output: "2" },
      { order: 11, isSample: false, input: "852 8", output: "0" },
      { order: 12, isSample: false, input: "369 69", output: "1" },
      { order: 13, isSample: false, input: "1000 0", output: "1" },
      { order: 14, isSample: false, input: "2468 68", output: "2" },
      { order: 15, isSample: false, input: "123 456", output: "-1" }
    ],
    tags: ["Python", "String", "Searching"]
  },
  {
    slug: "divisibility-grade-extras",
    title: "Divisibility Grade - Extras",
    difficulty: "EASY",
    statement: "Given an integer $N$, check its divisibility based on these conditions:\n- If $N$ is a multiple of **both 3 and 4**, output `12`.\n- Else if $N$ is a multiple of **3 only**, output `3`.\n- Else if $N$ is a multiple of **4 only**, output `4`.\n- Otherwise, output `0`.\n\n💡 **Note:** *This problem is designed for Python practice. Use an `if-elif-else` chain with the `%` operator!*",
    inputSpecification: "A single positive integer $N$.",
    outputSpecification: "Print `12`, `3`, `4`, or `0` according to the rules.",
    constraints: "$1 \\le N \\le 10^9$",
    examples: [
      { input: "12", output: "12", displayOrder: 1 },
      { input: "9", output: "3", displayOrder: 2 },
      { input: "8", output: "4", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "checkDivisibility",
      returnType: "int",
      parameters: [
        { name: "n", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "12", output: "12" },
      { order: 2, isSample: true, input: "9", output: "3" },
      { order: 3, isSample: true, input: "8", output: "4" },
      { order: 4, isSample: false, input: "5", output: "0" },
      { order: 5, isSample: false, input: "24", output: "12" },
      { order: 6, isSample: false, input: "15", output: "3" },
      { order: 7, isSample: false, input: "16", output: "4" },
      { order: 8, isSample: false, input: "36", output: "12" },
      { order: 9, isSample: false, input: "27", output: "3" },
      { order: 10, isSample: false, input: "20", output: "4" },
      { order: 11, isSample: false, input: "7", output: "0" },
      { order: 12, isSample: false, input: "60", output: "12" },
      { order: 13, isSample: false, input: "33", output: "3" },
      { order: 14, isSample: false, input: "40", output: "4" },
      { order: 15, isSample: false, input: "1", output: "0" }
    ],
    tags: ["Python", "Conditionals", "Math"]
  },
  {
    slug: "greatest-is-even-extras",
    title: "Greatest is Even - Extras",
    difficulty: "EASY",
    statement: "Given 3 integers $a, b, c$, find the **greatest number** among them. If that greatest number is **even**, output `1`, otherwise output `0`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can find the maximum using `m = max(a, b, c)` and check `1 if m % 2 == 0 else 0`!*",
    inputSpecification: "Three space-separated integers: $a, b, c$.",
    outputSpecification: "Print `1` if the greatest of the three numbers is even, else print `0`.",
    constraints: "$-10^9 \\le a, b, c \\le 10^9$",
    examples: [
      { input: "2 4 6", output: "1", displayOrder: 1 },
      { input: "1 3 5", output: "0", displayOrder: 2 },
      { input: "10 5 8", output: "1", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "isGreatestEven",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" },
        { name: "c", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "2 4 6", output: "1" },
      { order: 2, isSample: true, input: "1 3 5", output: "0" },
      { order: 3, isSample: true, input: "10 5 8", output: "1" },
      { order: 4, isSample: false, input: "7 9 2", output: "0" },
      { order: 5, isSample: false, input: "4 4 4", output: "1" },
      { order: 6, isSample: false, input: "5 5 5", output: "0" },
      { order: 7, isSample: false, input: "12 15 14", output: "0" },
      { order: 8, isSample: false, input: "20 18 22", output: "1" },
      { order: 9, isSample: false, input: "1 2 1", output: "1" },
      { order: 10, isSample: false, input: "8 7 9", output: "0" },
      { order: 11, isSample: false, input: "30 40 50", output: "1" },
      { order: 12, isSample: false, input: "11 33 22", output: "0" },
      { order: 13, isSample: false, input: "100 99 98", output: "1" },
      { order: 14, isSample: false, input: "7 13 5", output: "0" },
      { order: 15, isSample: false, input: "6 2 4", output: "1" }
    ],
    tags: ["Python", "Conditionals", "Basics"]
  },
  {
    slug: "the-exponent-formula-extras",
    title: "The Exponent Formula - Extras",
    difficulty: "EASY",
    statement: "Given two non-negative integers $\\text{base}$ and $\\text{power}$, calculate the value of $\\text{base}$ raised to the power ($\\text{base}^{\\text{power}}$).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can use the exponentiation operator `base ** power`!*",
    inputSpecification: "Two space-separated non-negative integers: $\\text{base}$ and $\\text{power}$.",
    outputSpecification: "Print the calculated value of $\\text{base}^{\\text{power}}$.",
    constraints: "$0 \\le \\text{base} \\le 20, 0 \\le \\text{power} \\le 10$",
    examples: [
      { input: "2 3", output: "8", displayOrder: 1 },
      { input: "3 2", output: "9", displayOrder: 2 },
      { input: "5 2", output: "25", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "calculateExponent",
      returnType: "int",
      parameters: [
        { name: "base", type: "int" },
        { name: "power", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "2 3", output: "8" },
      { order: 2, isSample: true, input: "3 2", output: "9" },
      { order: 3, isSample: true, input: "5 2", output: "25" },
      { order: 4, isSample: false, input: "10 2", output: "100" },
      { order: 5, isSample: false, input: "2 4", output: "16" },
      { order: 6, isSample: false, input: "4 3", output: "64" },
      { order: 7, isSample: false, input: "1 10", output: "1" },
      { order: 8, isSample: false, input: "10 3", output: "1000" },
      { order: 9, isSample: false, input: "6 2", output: "36" },
      { order: 10, isSample: false, input: "7 2", output: "49" },
      { order: 11, isSample: false, input: "2 5", output: "32" },
      { order: 12, isSample: false, input: "3 3", output: "27" },
      { order: 13, isSample: false, input: "8 2", output: "64" },
      { order: 14, isSample: false, input: "9 2", output: "81" },
      { order: 15, isSample: false, input: "0 5", output: "0" }
    ],
    tags: ["Python", "Operators", "Math"]
  },
  {
    slug: "type-casting-magic-extras",
    title: "Type Casting Magic - Extras",
    difficulty: "EASY",
    statement: "Given two integers $a$ and $b$, convert both numbers to strings, concatenate them together, convert the resulting combined string back to an integer, and add `10` to it. Output the final result.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can typecast using `int(str(a) + str(b)) + 10`!*",
    inputSpecification: "Two space-separated non-negative integers: $a$ and $b$.",
    outputSpecification: "Print the final integer after concatenation and adding 10.",
    constraints: "$0 \\le a, b \\le 10^4$",
    examples: [
      { input: "1 2", output: "22", displayOrder: 1 },
      { input: "5 0", output: "60", displayOrder: 2 },
      { input: "9 9", output: "109", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "concatAndAddTen",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "1 2", output: "22" },
      { order: 2, isSample: true, input: "5 0", output: "60" },
      { order: 3, isSample: true, input: "9 9", output: "109" },
      { order: 4, isSample: false, input: "10 5", output: "115" },
      { order: 5, isSample: false, input: "2 4", output: "34" },
      { order: 6, isSample: false, input: "7 1", output: "81" },
      { order: 7, isSample: false, input: "3 3", output: "43" },
      { order: 8, isSample: false, input: "4 0", output: "50" },
      { order: 9, isSample: false, input: "8 8", output: "98" },
      { order: 10, isSample: false, input: "1 1", output: "21" },
      { order: 11, isSample: false, input: "6 2", output: "72" },
      { order: 12, isSample: false, input: "5 5", output: "65" },
      { order: 13, isSample: false, input: "2 0", output: "30" },
      { order: 14, isSample: false, input: "3 8", output: "48" },
      { order: 15, isSample: false, input: "9 0", output: "100" }
    ],
    tags: ["Python", "Type Casting", "Basics"]
  },
  {
    slug: "modulo-arithmetic-extras",
    title: "Modulo Arithmetic - Extras",
    difficulty: "EASY",
    statement: "Given 3 integers $A, B$, and $C$, calculate the remainder of their sum $(A + B)$ when divided by $C$ (i.e. $(A + B) \\pmod C$).\n\n💡 **Note:** *This problem is designed for Python practice. In Python, the remainder operator is `%`: `(a + b) % c`!*",
    inputSpecification: "Three space-separated integers: $A, B, C$ ($C > 0$).",
    outputSpecification: "Print the remainder of $(A + B) \\% C$.",
    constraints: "$0 \\le A, B \\le 10^9, 1 \\le C \\le 10^9$",
    examples: [
      { input: "2 3 4", output: "1", displayOrder: 1 },
      { input: "5 5 10", output: "0", displayOrder: 2 },
      { input: "1 2 2", output: "1", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "moduloSum",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" },
        { name: "c", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "2 3 4", output: "1" },
      { order: 2, isSample: true, input: "5 5 10", output: "0" },
      { order: 3, isSample: true, input: "1 2 2", output: "1" },
      { order: 4, isSample: false, input: "10 5 6", output: "3" },
      { order: 5, isSample: false, input: "8 2 5", output: "0" },
      { order: 6, isSample: false, input: "7 3 8", output: "2" },
      { order: 7, isSample: false, input: "4 4 3", output: "2" },
      { order: 8, isSample: false, input: "9 1 7", output: "3" },
      { order: 9, isSample: false, input: "6 4 11", output: "10" },
      { order: 10, isSample: false, input: "2 2 4", output: "0" },
      { order: 11, isSample: false, input: "15 5 7", output: "6" },
      { order: 12, isSample: false, input: "3 3 5", output: "1" },
      { order: 13, isSample: false, input: "8 8 9", output: "7" },
      { order: 14, isSample: false, input: "1 1 3", output: "2" },
      { order: 15, isSample: false, input: "10 10 15", output: "5" }
    ],
    tags: ["Python", "Operators", "Math"]
  },
  {
    slug: "area-vs-perimeter-check-extras",
    title: "Area vs Perimeter Check - Extras",
    difficulty: "EASY",
    statement: "Given an integer $\\text{side}$ representing the length of a side of a square:\n- Calculate its **Area** = $\\text{side} \\times \\text{side}$.\n- Calculate its **Perimeter** = $4 \\times \\text{side}$.\n\nIf the Area is strictly greater than the Perimeter ($\\text{Area} > \\text{Perimeter}$), output `1`, otherwise output `0`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `1 if side * side > 4 * side else 0`!*",
    inputSpecification: "A single non-negative integer $\\text{side}$.",
    outputSpecification: "Print `1` if Area > Perimeter, else print `0`.",
    constraints: "$0 \\le \\text{side} \\le 10^5$",
    examples: [
      { input: "2", output: "0", displayOrder: 1 },
      { input: "5", output: "1", displayOrder: 2 },
      { input: "4", output: "0", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "isAreaGreater",
      returnType: "int",
      parameters: [
        { name: "side", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "2", output: "0" },
      { order: 2, isSample: true, input: "5", output: "1" },
      { order: 3, isSample: true, input: "4", output: "0" },
      { order: 4, isSample: false, input: "3", output: "0" },
      { order: 5, isSample: false, input: "6", output: "1" },
      { order: 6, isSample: false, input: "1", output: "0" },
      { order: 7, isSample: false, input: "10", output: "1" },
      { order: 8, isSample: false, input: "0", output: "0" },
      { order: 9, isSample: false, input: "7", output: "1" },
      { order: 10, isSample: false, input: "8", output: "1" },
      { order: 11, isSample: false, input: "9", output: "1" },
      { order: 12, isSample: false, input: "15", output: "1" },
      { order: 13, isSample: false, input: "20", output: "1" },
      { order: 14, isSample: false, input: "100", output: "1" },
      { order: 15, isSample: false, input: "50", output: "1" }
    ],
    tags: ["Python", "Conditionals", "Math"]
  },
  {
    slug: "relational-operators-test-extras",
    title: "Relational Operators Test - Extras",
    difficulty: "EASY",
    statement: "Given two integers $A$ and $B$, check if $A$ is **not equal** to $B$ ($A \\neq B$). If they are not equal, output `1`, otherwise output `0`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, `int(a != b)` returns `1` if they differ and `0` if they are equal!*",
    inputSpecification: "Two space-separated integers: $A$ and $B$.",
    outputSpecification: "Print `1` if $A \\neq B$, else print `0`.",
    constraints: "$-10^9 \\le A, B \\le 10^9$",
    examples: [
      { input: "5 5", output: "0", displayOrder: 1 },
      { input: "5 6", output: "1", displayOrder: 2 },
      { input: "10 10", output: "0", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "isNotEqual",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "5 5", output: "0" },
      { order: 2, isSample: true, input: "5 6", output: "1" },
      { order: 3, isSample: true, input: "10 10", output: "0" },
      { order: 4, isSample: false, input: "1 2", output: "1" },
      { order: 5, isSample: false, input: "0 0", output: "0" },
      { order: 6, isSample: false, input: "9 8", output: "1" },
      { order: 7, isSample: false, input: "100 100", output: "0" },
      { order: 8, isSample: false, input: "4 5", output: "1" },
      { order: 9, isSample: false, input: "7 7", output: "0" },
      { order: 10, isSample: false, input: "3 2", output: "1" },
      { order: 11, isSample: false, input: "8 8", output: "0" },
      { order: 12, isSample: false, input: "15 16", output: "1" },
      { order: 13, isSample: false, input: "20 20", output: "0" },
      { order: 14, isSample: false, input: "42 24", output: "1" },
      { order: 15, isSample: false, input: "11 11", output: "0" }
    ],
    tags: ["Python", "Operators", "Conditionals"]
  }
];

function createExtras() {
  for (const prob of EXTRAS_PROBLEMS) {
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

    console.log(`✓ Created extras problem: ${prob.slug}`);
  }
}

createExtras();
