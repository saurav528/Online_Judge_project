import sys
import json
from typing import List

// INSERT_STUDENT_CODE_HERE

def main():
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
        year = int(next_token())
        solver = Solution()
        result = solver.isLeap(year)
        print(result)

if __name__ == "__main__":
    main()