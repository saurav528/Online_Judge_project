const fs = require('fs');

// INSERT_STUDENT_CODE_HERE

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
    if (input.length === 0 || input[0] === "") return;
    
    let tokenIdx = 0;
    function nextToken() {
        if (tokenIdx >= input.length) return "";
        return input[tokenIdx++];
    }

    const tStr = nextToken();
    if (!tStr) return;
    const t = parseInt(tStr, 10);
    for (let i = 0; i < t; i++) {
    const n = parseInt(nextToken(), 10);
    const grades = [];
    for(let i = 0; i < n; i++) {
        grades.push(nextToken());
    }
    const solver = new Solution();
    const result = solver.countGradeA(n, grades);
    console.log(result);
    }
}

main();