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

                    Solution solver = new Solution();
        int result = solver.factorial(n);

                    System.out.println(result);
        }
    }
}