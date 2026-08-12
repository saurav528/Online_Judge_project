#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

// INSERT_STUDENT_CODE_HERE

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);
    int t;
    if (!(std::cin >> t)) return 0;
    while (t--) {
    std::string s;
    std::cin >> s;
    Solution solver;
    auto result = solver.isPalindrome(s);
    std::cout << result << std::endl;
    }
    return 0;
}