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
    auto result = solver.sortGrades(n, grades);
    for(size_t i = 0; i < result.size(); ++i) {
        std::cout << result[i] << (i == result.size() - 1 ? "" : " ");
    }
    std::cout << std::endl;
    }

    return 0;
}