import sys
import json
from typing import List

// INSERT_STUDENT_CODE_HERE

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
        m1 = next_token()
        m2 = next_token()
        m3 = next_token()
        solver = Solution()
        result = solver.storeMovies(m1, m2, m3)
        print(" ".join(map(str, result)))

if __name__ == "__main__":
    main()