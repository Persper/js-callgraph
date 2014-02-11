module EcmaScriptTests

import EcmaScript;
import EcmaScriptTypePrinter;

public test bool returnNoSemi() {
	return printedParseEquals("return", "|Return|");	
}

public test bool returnSemi() {
	return printedParseEquals("return;", "|Return;|");	
}

public test bool returnExpNoSemi() {
	return printedParseEquals("return 1", "|Return [1]|");	
}

public test bool returnExpSemi() {
	return printedParseEquals("return 1;", "|Return [1];|");	
}

public test bool returnExpSemiExpSemi() {
	return printedParseEquals("return 1; 1;", "|Return [1];|Expression [1];|");	
}

public test bool returnExpNoSemiNewlineExpressionSemi() {
	return printedParseEquals("return 1 \n 1;", "|Return [1]|Expression [1];|");
}

public test bool returnSemiSemi() {
	return printedParseEquals("return;;", "|Return;|Empty|");
}

public test bool returnExpNewlineSemi() {
	return printedParseEquals("return 1\n;", "|Return [1]|Empty|");
}

public test bool returnExpNewlineSemi() {
	return printedParseEquals("return 1\n\n;", "|Return [1]|Empty|");
}

public test bool returnSpacesNewlines() {
	return printedParseEquals("return    \n\n", "|Return|");
}

private bool printedParseEquals(str source, str typePrint) {
	return showTypes(parse(source)) == typePrint;
}