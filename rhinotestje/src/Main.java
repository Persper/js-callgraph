import sun.org.mozilla.javascript.internal.Parser;
import sun.org.mozilla.javascript.internal.ast.AstRoot;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;

public class Main {

    public static void main(String[] args) throws IOException {
        Parser parser = new Parser();
        String file = "src/test.js";
        Reader reader = new FileReader(file);
        AstRoot root = parser.parse(reader, file, 1);
        root.getfu
        int i = 0;
    }
}
