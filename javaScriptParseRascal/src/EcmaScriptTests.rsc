module EcmaScriptTests

import EcmaScript;
import EcmaScriptTypePrinter;

/**
 * EXPRESSIONS
 */

public test bool onePlusTwo() {
	return printedParseEquals("1+2", "|Expression [1+2]|");
}

public test bool oneMinusOnePlusTwo() {
	return printedParseEquals("1\n-1\n+3;", "|Expression [1\n-1\n+3];|");
}

/**
 * RETURN STATEMENTS
 */

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

public test bool returnExpNewlinePlusExpSemi() {
	return printedParseEquals("return 1\n+2;", "|Return [1\n+2];|");
}

//Initially filtering only worked if the elements were the first SourceElements.
public test bool returnExpExpNewlineSemi() {
	return printedParseEquals("1;return 1\n+2;", "|Expression [1];|Return [1\n+2];|");
}

public test bool returnExpNewlineSemi() {
	return printedParseEquals("return 1\n\n;", "|Return [1]|Empty|");
}

public test bool returnSpacesNewlines() {
	return printedParseEquals("return    \n\n", "|Return|");
}

/**
 * VARIABLE ASSIGNMENTS
 */
public test bool simpleVariableAssignment() {
	return printedParseEquals("var i = 1;", "|Varassign [i] expr [1]|");
}
 
public test bool variableAssignment() {
	return printedParseEquals("var x = 1\n-1\n+3;", "|Varassign [x] expr [1\n-1\n+3]");
}

public bool printedParseEquals(str source, str typePrint) {
	return showTypes(source) == typePrint;
}

public str showTypes(str source) {
	return showTypes(parse(source));
}