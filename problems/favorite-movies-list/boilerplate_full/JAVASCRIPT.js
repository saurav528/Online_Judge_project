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
    const m1 = nextToken();
    const m2 = nextToken();
    const m3 = nextToken();
    const solver = new Solution();
    const result = solver.storeMovies(m1, m2, m3);
    console.log(result.join(' '));
    }
}

main();