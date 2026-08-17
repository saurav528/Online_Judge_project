import java.util.*;
import java.io.*;

// INSERT_STUDENT_CODE_HERE

public class Main {
    private static StringTokenizer tokenizer = null;
    private static String readNextToken(BufferedReader reader) throws Exception {
        while (tokenizer == null || !tokenizer.hasMoreTokens()) {
            String line = reader.readLine();
            if (line == null) return null;
            tokenizer = new StringTokenizer(line);
        }
        return tokenizer.nextToken();
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String tStr = readNextToken(reader);
        if (tStr == null) return;
        int t = Integer.parseInt(tStr);
        while (t-- > 0) {
        int n = Integer.parseInt(readNextToken(reader));
        String[] grades = new String[n];
        for(int i = 0; i < n; i++) {
            grades[i] = readNextToken(reader);
        }
        Solution solver = new Solution();
        String[] result = solver.sortGrades(n, grades);
        for(int i = 0; i < result.length; i++) {
            System.out.print(result[i] + (i == result.length - 1 ? "" : " "));
        }
        System.out.println();
        }
    }
}