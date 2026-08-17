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
    std::string m1;
    std::cin >> m1;
    std::string m2;
    std::cin >> m2;
    std::string m3;
    std::cin >> m3;
    Solution solver;
    auto result = solver.storeMovies(m1, m2, m3);
    for(size_t i = 0; i < result.size(); ++i) {
        std::cout << result[i] << (i == result.size() - 1 ? "" : " ");
    }
    std::cout << std::endl;
    }

    return 0;
}