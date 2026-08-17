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
        String m1 = readNextToken(reader);
        String m2 = readNextToken(reader);
        String m3 = readNextToken(reader);
        Solution solver = new Solution();
        String[] result = solver.storeMovies(m1, m2, m3);
        for(int i = 0; i < result.length; i++) {
            System.out.print(result[i] + (i == result.length - 1 ? "" : " "));
        }
        System.out.println();
        }
    }
}