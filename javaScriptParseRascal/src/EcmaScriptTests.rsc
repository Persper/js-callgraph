module EcmaScriptTests

import EcmaScript;
import EcmaScriptTypePrinter;

public test bool returnNoSemi() {
	return printedParseEquals("return", "|Return term []|");	
}

public test bool returnSemi() {
	return printedParseEquals("return;", "|Return term [;]|");	
}

public test bool returnExpNoSemi() {
	return printedParseEquals("return 1", "|Return [1] term []|");	
}

public test bool returnExpSemi() {
	return printedParseEquals("return 1;", "|Return [1] term [;]|");	
}

public test bool returnExpSemiExpSemi() {
	return printedParseEquals("return 1; 1;", "|Return [1] term [; ]|Expression [1];|");	
}

public test bool returnExpNoSemiNewlineExpressionSemi() {
	return printedParseEquals("return 1 \n 1;", "|Return [1] term [\n ]|Expression [1];|");
}

public test bool returnSemiSemi() {
	return printedParseEquals("return;;", "|Return term [;]|Empty|");
}

public test bool returnExpNewlineSemi() {
	return printedParseEquals("return 1\n;", "|Return [1] term [\n]|Empty|");
}

public test bool returnExpNewlineSemi() {
	return printedParseEquals("return 1\n\n;", "|Return [1] term [\n]|Empty|");
}

private bool printedParseEquals(str source, str typePrint) {
	return showTypes(parse(source)) == typePrint;
}