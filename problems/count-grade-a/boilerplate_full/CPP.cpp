#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

// INSERT_STUDENT_CODE_HERE

int main() {
    // Enable fast I/O
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int t;
    if (!(std::cin >> t)) return 0;
    while (t--) {
    int n;
    std::cin >> n;
    std::vector<std::string> grades(n);
    for(int i = 0; i < n; ++i) {
        std::cin >> grades[i];
    }
    Solution solver;
    auto result = solver.countGradeA(n, grades);
    std::cout << result << std::endl;
    }

    return 0;
}