const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '..', '..', 'problems');

const MORE_L2_PROBLEMS = [
  {
    slug: "check-file-extension-l2",
    title: "Check File Extension L2",
    difficulty: "EASY",
    statement: "Write a program that takes a filename as input and checks if it ends with the `'.pdf'` extension using the `endswith()` method. Return `True` or `False`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python, you can write `return filename.endswith('.pdf')`!*",
    inputSpecification: "A single string representing the filename.",
    outputSpecification: "Print `True` if the file ends with '.pdf', else print `False`.",
    constraints: "$1 \\le |\\text{filename}| \\le 500$",
    examples: [
      { input: "document.pdf", output: "True", displayOrder: 1 },
      { input: "image.png", output: "False", displayOrder: 2 },
      { input: "notes.txt", output: "False", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "isPdf",
      returnType: "boolean",
      parameters: [
        { name: "filename", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "document.pdf", output: "True" },
      { order: 2, isSample: true, input: "image.png", output: "False" },
      { order: 3, isSample: true, input: "notes.txt", output: "False" },
      { order: 4, isSample: false, input: "resume.PDF", output: "False" },
      { order: 5, isSample: false, input: "filepdf", output: "False" },
      { order: 6, isSample: false, input: ".pdf", output: "True" },
      { order: 7, isSample: false, input: "my.pdf.doc", output: "False" },
      { order: 8, isSample: false, input: "report.pdf", output: "True" },
      { order: 9, isSample: false, input: "pdf.pdf", output: "True" },
      { order: 10, isSample: false, input: "hello", output: "False" }
    ],
    tags: ["L2", "String", "Methods", "Basics"]
  },
  {
    slug: "format-name-l2",
    title: "Format Name L2",
    difficulty: "EASY",
    statement: "Write a program that takes a lowercase word as input and uses the `capitalize()` method to capitalize its first character, then prints the result.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return word.capitalize()`!*",
    inputSpecification: "A single lowercase string $W$.",
    outputSpecification: "Print the capitalized string.",
    constraints: "$1 \\le |W| \\le 500$",
    examples: [
      { input: "python", output: "Python", displayOrder: 1 },
      { input: "java", output: "Java", displayOrder: 2 },
      { input: "hello", output: "Hello", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "capitalizeWord",
      returnType: "string",
      parameters: [
        { name: "word", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "python", output: "Python" },
      { order: 2, isSample: true, input: "java", output: "Java" },
      { order: 3, isSample: true, input: "hello", output: "Hello" },
      { order: 4, isSample: false, input: "world", output: "World" },
      { order: 5, isSample: false, input: "apple", output: "Apple" },
      { order: 6, isSample: false, input: "banana", output: "Banana" },
      { order: 7, isSample: false, input: "cat", output: "Cat" },
      { order: 8, isSample: false, input: "dog", output: "Dog" },
      { order: 9, isSample: false, input: "elephant", output: "Elephant" },
      { order: 10, isSample: false, input: "zebra", output: "Zebra" }
    ],
    tags: ["L2", "String", "Methods", "Basics"]
  },
  {
    slug: "replace-word-l2",
    title: "Replace Word L2",
    difficulty: "EASY",
    statement: "Write a program that takes a sentence, a word to replace (`old`), and a new word (`new`). Use the `replace()` function to replace all occurrences of the old word with the new word and return the updated sentence.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return sentence.replace(oldWord, newWord)`!*",
    inputSpecification: "Three space-separated strings: `sentence`, `oldWord`, and `newWord`.",
    outputSpecification: "Print the updated string with words replaced.",
    constraints: "$1 \\le |\\text{sentence}| \\le 1000$",
    examples: [
      { input: "I_love_apples apples oranges", output: "I_love_oranges", displayOrder: 1 },
      { input: "cat_dog_cat cat bird", output: "bird_dog_bird", displayOrder: 2 },
      { input: "hello_world world python", output: "hello_python", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "replaceWord",
      returnType: "string",
      parameters: [
        { name: "sentence", type: "string" },
        { name: "oldWord", type: "string" },
        { name: "newWord", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "I_love_apples apples oranges", output: "I_love_oranges" },
      { order: 2, isSample: true, input: "cat_dog_cat cat bird", output: "bird_dog_bird" },
      { order: 3, isSample: true, input: "hello_world world python", output: "hello_python" },
      { order: 4, isSample: false, input: "blue_sky blue dark", output: "dark_sky" },
      { order: 5, isSample: false, input: "123_123 1 9", output: "923_923" },
      { order: 6, isSample: false, input: "test_case case run", output: "test_run" },
      { order: 7, isSample: false, input: "good_morning good bad", output: "bad_morning" },
      { order: 8, isSample: false, input: "a_b_c b z", output: "a_z_c" },
      { order: 9, isSample: false, input: "python_programming python java", output: "java_programming" },
      { order: 10, isSample: false, input: "x_y_x x y", output: "y_y_y" }
    ],
    tags: ["L2", "String", "Methods", "Basics"]
  },
  {
    slug: "find-the-substring-l2",
    title: "Find the Substring L2",
    difficulty: "EASY",
    statement: "Write a program that takes a string $S$ and a target substring. Use the `find()` function to print the first 0-based index of the target substring. If not found, print `-1`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return s.find(target)`!*",
    inputSpecification: "Two space-separated strings: $S$ and $\\text{target}$.",
    outputSpecification: "Print the 0-based first occurrence index, or `-1` if not found.",
    constraints: "$1 \\le |\\text{target}| \\le |S| \\le 1000$",
    examples: [
      { input: "hello_world world", output: "6", displayOrder: 1 },
      { input: "I_am_a_coder am", output: "2", displayOrder: 2 },
      { input: "python_is_fun is", output: "7", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "findSubstring",
      returnType: "int",
      parameters: [
        { name: "s", type: "string" },
        { name: "target", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "hello_world world", output: "6" },
      { order: 2, isSample: true, input: "I_am_a_coder am", output: "2" },
      { order: 3, isSample: true, input: "python_is_fun is", output: "7" },
      { order: 4, isSample: false, input: "abc z", output: "-1" },
      { order: 5, isSample: false, input: "programming gram", output: "3" },
      { order: 6, isSample: false, input: "test_cases case", output: "5" },
      { order: 7, isSample: false, input: "123456 45", output: "3" },
      { order: 8, isSample: false, input: "finding_nemo nemo", output: "8" },
      { order: 9, isSample: false, input: "apple p", output: "1" },
      { order: 10, isSample: false, input: "banana na", output: "2" }
    ],
    tags: ["L2", "String", "Searching", "Basics"]
  },
  {
    slug: "count-occurrences-l2",
    title: "Count Occurrences L2",
    difficulty: "EASY",
    statement: "Write a program that takes a string $S$ and a target substring. Use the `count()` method to print the number of times the substring appears in the string.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return s.count(target)`!*",
    inputSpecification: "Two space-separated strings: $S$ and $\\text{target}$.",
    outputSpecification: "Print the count of occurrences.",
    constraints: "$1 \\le |\\text{target}| \\le |S| \\le 1000$",
    examples: [
      { input: "hello l", output: "2", displayOrder: 1 },
      { input: "banana a", output: "3", displayOrder: 2 },
      { input: "mississippi iss", output: "2", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "countSubstring",
      returnType: "int",
      parameters: [
        { name: "s", type: "string" },
        { name: "target", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "hello l", output: "2" },
      { order: 2, isSample: true, input: "banana a", output: "3" },
      { order: 3, isSample: true, input: "mississippi iss", output: "2" },
      { order: 4, isSample: false, input: "abc z", output: "0" },
      { order: 5, isSample: false, input: "112211 1", output: "4" },
      { order: 6, isSample: false, input: "I_am_a_coder _", output: "3" },
      { order: 7, isSample: false, input: "ababab ab", output: "3" },
      { order: 8, isSample: false, input: "test t", output: "2" },
      { order: 9, isSample: false, input: "python_python python", output: "2" },
      { order: 10, isSample: false, input: "aaaaa aa", output: "2" }
    ],
    tags: ["L2", "String", "Counting", "Basics"]
  },
  {
    slug: "remove-spaces-l2",
    title: "Remove Spaces L2",
    difficulty: "EASY",
    statement: "Write a program that takes a string $S$ containing underscore separators `_` and uses the `replace()` function to remove all underscores (replacing `'_'` with empty string `''`). Print the modified string.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return s.replace('_', '')`!*",
    inputSpecification: "A single string $S$.",
    outputSpecification: "Print the string after removing all underscores.",
    constraints: "$1 \\le |S| \\le 1000$",
    examples: [
      { input: "hello_world", output: "helloworld", displayOrder: 1 },
      { input: "a_b_c", output: "abc", displayOrder: 2 },
      { input: "python_is_fun", output: "pythonisfun", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "removeSpaces",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "hello_world", output: "helloworld" },
      { order: 2, isSample: true, input: "a_b_c", output: "abc" },
      { order: 3, isSample: true, input: "python_is_fun", output: "pythonisfun" },
      { order: 4, isSample: false, input: "_1_2_3_", output: "123" },
      { order: 5, isSample: false, input: "no_spaces_here", output: "no_spaces_here" },
      { order: 6, isSample: false, input: "_____", output: "" },
      { order: 7, isSample: false, input: "t_e_s_t", output: "test" },
      { order: 8, isSample: false, input: "_city_college_", output: "citycollege" },
      { order: 9, isSample: false, input: "I_am_a_coder", output: "Iamacoder" },
      { order: 10, isSample: false, input: "_one_", output: "one" }
    ],
    tags: ["L2", "String", "Methods", "Basics"]
  },
  {
    slug: "first-name-length-l2",
    title: "First Name Length L2",
    difficulty: "EASY",
    statement: "Write a program that takes a student's first name and returns its length using the `len()` function.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return len(name)`!*",
    inputSpecification: "A single string $\\text{name}$.",
    outputSpecification: "Print the integer length of the name.",
    constraints: "$1 \\le |\\text{name}| \\le 100$",
    examples: [
      { input: "Amit", output: "4", displayOrder: 1 },
      { input: "Priyanka", output: "8", displayOrder: 2 },
      { input: "Raj", output: "3", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "getNameLength",
      returnType: "int",
      parameters: [
        { name: "name", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "Amit", output: "4" },
      { order: 2, isSample: true, input: "Priyanka", output: "8" },
      { order: 3, isSample: true, input: "Raj", output: "3" },
      { order: 4, isSample: false, input: "Christopher", output: "11" },
      { order: 5, isSample: false, input: "A", output: "1" },
      { order: 6, isSample: false, input: "Meera", output: "5" },
      { order: 7, isSample: false, input: "Siddharth", output: "9" },
      { order: 8, isSample: false, input: "Jo", output: "2" },
      { order: 9, isSample: false, input: "Elizabeth", output: "9" },
      { order: 10, isSample: false, input: "Ravi_Kumar", output: "10" }
    ],
    tags: ["L2", "String", "Basics"]
  },
  {
    slug: "occurrence-of-three-l2",
    title: "Occurrence of '3' L2",
    difficulty: "EASY",
    statement: "Write a program to find and print the number of occurrences of the character `'3'` in a given string.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return s.count('3')`!*",
    inputSpecification: "A single string $S$.",
    outputSpecification: "Print the count of character '3' in string $S$.",
    constraints: "$1 \\le |S| \\le 1000$",
    examples: [
      { input: "123453", output: "2", displayOrder: 1 },
      { input: "33333", output: "5", displayOrder: 2 },
      { input: "Hello_World", output: "0", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "countThrees",
      returnType: "int",
      parameters: [
        { name: "s", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "123453", output: "2" },
      { order: 2, isSample: true, input: "33333", output: "5" },
      { order: 3, isSample: true, input: "Hello_World", output: "0" },
      { order: 4, isSample: false, input: "I_am_13_years_old", output: "1" },
      { order: 5, isSample: false, input: "3", output: "1" },
      { order: 6, isSample: false, input: "No_threes_here!", output: "0" },
      { order: 7, isSample: false, input: "303030", output: "3" },
      { order: 8, isSample: false, input: "12456789", output: "0" },
      { order: 9, isSample: false, input: "3a3b3c", output: "3" },
      { order: 10, isSample: false, input: "99887766", output: "0" }
    ],
    tags: ["L2", "String", "Counting", "Basics"]
  },
  {
    slug: "student-grading-system-l2",
    title: "Student Grading System L2",
    difficulty: "EASY",
    statement: "Write a program to grade students based on their marks using conditional statements:\n- If $\\text{marks} \\ge 90$, grade is `'A'`.\n- If $80 \\le \\text{marks} < 90$, grade is `'B'`.\n- If $70 \\le \\text{marks} < 80$, grade is `'C'`.\n- If $\\text{marks} < 70$, grade is `'D'`.\n\n💡 **Note:** *This problem is designed for Python practice. Use an `if-elif-else` chain!*",
    inputSpecification: "A single integer representing student marks ($0 \\le \\text{marks} \\le 100$).",
    outputSpecification: "Print the corresponding grade ('A', 'B', 'C', or 'D').",
    constraints: "$0 \\le \\text{marks} \\le 100$",
    examples: [
      { input: "95", output: "A", displayOrder: 1 },
      { input: "90", output: "A", displayOrder: 2 },
      { input: "89", output: "B", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "getStudentGrade",
      returnType: "string",
      parameters: [
        { name: "marks", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "95", output: "A" },
      { order: 2, isSample: true, input: "90", output: "A" },
      { order: 3, isSample: true, input: "89", output: "B" },
      { order: 4, isSample: false, input: "80", output: "B" },
      { order: 5, isSample: false, input: "79", output: "C" },
      { order: 6, isSample: false, input: "70", output: "C" },
      { order: 7, isSample: false, input: "69", output: "D" },
      { order: 8, isSample: false, input: "50", output: "D" },
      { order: 9, isSample: false, input: "0", output: "D" },
      { order: 10, isSample: false, input: "100", output: "A" }
    ],
    tags: ["L2", "Conditionals", "Basics"]
  },
  {
    slug: "string-length-category-l2",
    title: "String Length Category L2",
    difficulty: "EASY",
    statement: "Write a program that takes a string $S$ as input. Using conditional statements, check its length. If the length is greater than or equal to 10 (`len(s) >= 10`), return `'Long'`, otherwise return `'Short'`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return 'Long' if len(s) >= 10 else 'Short'`!*",
    inputSpecification: "A single string $S$.",
    outputSpecification: "Print 'Long' if $|S| \\ge 10$, else print 'Short'.",
    constraints: "$1 \\le |S| \\le 1000$",
    examples: [
      { input: "Hello", output: "Short", displayOrder: 1 },
      { input: "Programming", output: "Long", displayOrder: 2 },
      { input: "1234567890", output: "Long", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "categorizeLength",
      returnType: "string",
      parameters: [
        { name: "s", type: "string" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "Hello", output: "Short" },
      { order: 2, isSample: true, input: "Programming", output: "Long" },
      { order: 3, isSample: true, input: "1234567890", output: "Long" },
      { order: 4, isSample: false, input: "123456789", output: "Short" },
      { order: 5, isSample: false, input: "A_very_long_string", output: "Long" },
      { order: 6, isSample: false, input: "Hi", output: "Short" },
      { order: 7, isSample: false, input: "City_College", output: "Long" },
      { order: 8, isSample: false, input: "Python", output: "Short" },
      { order: 9, isSample: false, input: "Data", output: "Short" },
      { order: 10, isSample: false, input: "Absolutely", output: "Long" }
    ],
    tags: ["L2", "String", "Conditionals", "Basics"]
  },
  {
    slug: "pass-or-fail-status-l2",
    title: "Pass or Fail Status L2",
    difficulty: "EASY",
    statement: "Write a program to check student marks. Print `'Pass'` if marks are greater than or equal to 70 ($\\text{marks} \\ge 70$), otherwise print `'Fail'`.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return 'Pass' if marks >= 70 else 'Fail'`!*",
    inputSpecification: "A single integer representing student marks ($0 \\le \\text{marks} \\le 100$).",
    outputSpecification: "Print 'Pass' if marks >= 70, else print 'Fail'.",
    constraints: "$0 \\le \\text{marks} \\le 100$",
    examples: [
      { input: "75", output: "Pass", displayOrder: 1 },
      { input: "70", output: "Pass", displayOrder: 2 },
      { input: "69", output: "Fail", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "checkPassFail",
      returnType: "string",
      parameters: [
        { name: "marks", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "75", output: "Pass" },
      { order: 2, isSample: true, input: "70", output: "Pass" },
      { order: 3, isSample: true, input: "69", output: "Fail" },
      { order: 4, isSample: false, input: "40", output: "Fail" },
      { order: 5, isSample: false, input: "100", output: "Pass" },
      { order: 6, isSample: false, input: "85", output: "Pass" },
      { order: 7, isSample: false, input: "0", output: "Fail" },
      { order: 8, isSample: false, input: "99", output: "Pass" },
      { order: 9, isSample: false, input: "71", output: "Pass" },
      { order: 10, isSample: false, input: "65", output: "Fail" }
    ],
    tags: ["L2", "Conditionals", "Basics"]
  },
  {
    slug: "odd-or-even-l2",
    title: "Odd or Even L2",
    difficulty: "EASY",
    statement: "Write a program to check if an integer $N$ is odd or even. Print `'Even'` if it is divisible by 2 ($N \\% 2 == 0$), and `'Odd'` otherwise.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return 'Even' if n % 2 == 0 else 'Odd'`!*",
    inputSpecification: "A single integer $N$.",
    outputSpecification: "Print 'Even' if N is even, else print 'Odd'.",
    constraints: "$-10^9 \\le N \\le 10^9$",
    examples: [
      { input: "4", output: "Even", displayOrder: 1 },
      { input: "7", output: "Odd", displayOrder: 2 },
      { input: "0", output: "Even", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "checkOddEven",
      returnType: "string",
      parameters: [
        { name: "n", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "4", output: "Even" },
      { order: 2, isSample: true, input: "7", output: "Odd" },
      { order: 3, isSample: true, input: "0", output: "Even" },
      { order: 4, isSample: false, input: "-2", output: "Even" },
      { order: 5, isSample: false, input: "-5", output: "Odd" },
      { order: 6, isSample: false, input: "100", output: "Even" },
      { order: 7, isSample: false, input: "99", output: "Odd" },
      { order: 8, isSample: false, input: "13", output: "Odd" },
      { order: 9, isSample: false, input: "1024", output: "Even" },
      { order: 10, isSample: false, input: "-999", output: "Odd" }
    ],
    tags: ["L2", "Conditionals", "Math", "Basics"]
  },
  {
    slug: "greatest-of-three-numbers-l2",
    title: "Greatest of Three Numbers L2",
    difficulty: "EASY",
    statement: "Write a program to find and return the greatest of 3 numbers $A, B$, and $C$.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return max(a, b, c)`!*",
    inputSpecification: "Three space-separated integers: $A, B, C$.",
    outputSpecification: "Print the greatest of the three numbers.",
    constraints: "$-10^9 \\le A, B, C \\le 10^9$",
    examples: [
      { input: "10 20 30", output: "30", displayOrder: 1 },
      { input: "50 10 5", output: "50", displayOrder: 2 },
      { input: "1 100 2", output: "100", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "findGreatest",
      returnType: "int",
      parameters: [
        { name: "a", type: "int" },
        { name: "b", type: "int" },
        { name: "c", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "10 20 30", output: "30" },
      { order: 2, isSample: true, input: "50 10 5", output: "50" },
      { order: 3, isSample: true, input: "1 100 2", output: "100" },
      { order: 4, isSample: false, input: "-5 -1 -10", output: "-1" },
      { order: 5, isSample: false, input: "0 0 0", output: "0" },
      { order: 6, isSample: false, input: "7 7 3", output: "7" },
      { order: 7, isSample: false, input: "15 15 15", output: "15" },
      { order: 8, isSample: false, input: "-100 0 50", output: "50" },
      { order: 9, isSample: false, input: "99 101 100", output: "101" },
      { order: 10, isSample: false, input: "3 2 3", output: "3" }
    ],
    tags: ["L2", "Conditionals", "Basics"]
  },
  {
    slug: "multiple-of-seven-l2",
    title: "Multiple of 7 L2",
    difficulty: "EASY",
    statement: "Write a program to check if an integer $N$ is a multiple of 7. Print `True` if it is divisible by 7 ($N \\% 7 == 0$), and `False` otherwise.\n\n💡 **Note:** *This problem is designed for Python practice. In Python: `return n % 7 == 0`!*",
    inputSpecification: "A single integer $N$.",
    outputSpecification: "Print `True` if N is a multiple of 7, else print `False`.",
    constraints: "$-10^9 \\le N \\le 10^9$",
    examples: [
      { input: "14", output: "True", displayOrder: 1 },
      { input: "15", output: "False", displayOrder: 2 },
      { input: "7", output: "True", displayOrder: 3 }
    ],
    signature: {
      className: "Solution",
      functionName: "isMultipleOfSeven",
      returnType: "boolean",
      parameters: [
        { name: "n", type: "int" }
      ]
    },
    testCases: [
      { order: 1, isSample: true, input: "14", output: "True" },
      { order: 2, isSample: true, input: "15", output: "False" },
      { order: 3, isSample: true, input: "7", output: "True" },
      { order: 4, isSample: false, input: "0", output: "True" },
      { order: 5, isSample: false, input: "-21", output: "True" },
      { order: 6, isSample: false, input: "70", output: "True" },
      { order: 7, isSample: false, input: "100", output: "False" },
      { order: 8, isSample: false, input: "77", output: "True" },
      { order: 9, isSample: false, input: "-8", output: "False" },
      { order: 10, isSample: false, input: "49", output: "True" }
    ],
    tags: ["L2", "Conditionals", "Math", "Basics"]
  }
];

function createMoreL2Problems() {
  for (const prob of MORE_L2_PROBLEMS) {
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

    console.log(`✓ Created L2 problem: ${prob.slug}`);
  }
}

createMoreL2Problems();
