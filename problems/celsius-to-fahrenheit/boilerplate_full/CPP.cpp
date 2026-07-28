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
            double c;
    std::cin >> c;

            Solution solver;
    auto result = solver.convert(c);

            std::cout << result << std::endl;
    }

    return 0;
}