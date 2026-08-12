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
    int n;
    std::cin >> n;
    int size_arr;
    std::cin >> size_arr;
    std::vector<int> arr(size_arr);
    for(int i = 0; i < size_arr; ++i) {
        std::cin >> arr[i];
    }
    Solution solver;
    auto result = solver.sum(n, arr);
    std::cout << result << std::endl;
    }
    return 0;
}