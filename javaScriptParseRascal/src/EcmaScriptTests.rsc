module EcmaScriptTests

import EcmaScript;
import EcmaScriptTypePrinter;

/**
 * EXPRESSIONS
 */

public test bool onePlusTwo() {
	return outcomeIsCorrect("1+2", "|Expression [1+2]|");
}

public test bool oneMinusOnePlusTwo() {
	return outcomeIsCorrect("1\n-1\n+3;", "|Expression [1\n-1\n+3];|");
}

/**
 * RETURN STATEMENTS
 */

public test bool returnNoSemi() {
	return outcomeIsCorrect("return", "|Return|");	
}

public test bool returnSemi() {
	return outcomeIsCorrect("return;", "|Return;|");	
}

public test bool returnExpNoSemi() {
	return outcomeIsCorrect("return 1", "|Return [1]|");	
}

public test bool returnExpSemi() {
	return outcomeIsCorrect("return 1;", "|Return [1];|");	
}

public test bool returnExpSemiExpSemi() {
	return outcomeIsCorrect("return 1; 1;", "|Return [1];|Expression [1];|");	
}

public test bool returnExpNoSemiNewlineExpressionSemi() {
	return outcomeIsCorrect("return 1 \n 1;", "|Return [1]|Expression [1];|");
}

public test bool returnSemiSemi() {
	return outcomeIsCorrect("return;;", "|Return;|Empty|");
}

public test bool returnExpNewlineSemi() {
	return outcomeIsCorrect("return 1\n;", "|Return [1]|Empty|");
}

public test bool returnExpNewlinePlusExpSemi() {
	return outcomeIsCorrect("return 1\n+2;", "|Return [1\n+2];|");
}

//Initially filtering only worked if the elements were the first SourceElements.
public test bool returnExpExpNewlineSemi() {
	return outcomeIsCorrect("1;return 1\n+2;", "|Expression [1];|Return [1\n+2];|");
}

public test bool returnExpNewlineSemi() {
	return outcomeIsCorrect("return 1\n\n;", "|Return [1]|Empty|");
}

public test bool returnSpacesNewlines() {
	return outcomeIsCorrect("return    \n\n", "|Return|");
}

/**
 * VARIABLE ASSIGNMENTS
 */
public test bool simpleVariableAssignment() {
	return outcomeIsCorrect("var i = 1;", "|Varassign [i] expr [1]|");
}
 
public test bool variableAssignment() {
	return outcomeIsCorrect("var x = 1\n-1\n+3;", "|Varassign [x] expr [1\n-1\n+3]|");
}


public test bool variableAssignmentEmptyStatement() {
	return outcomeIsCorrect("var a = 1\n+4\n;x\n", "|Varassign [a] expr [1\n+4]|Empty|Expression [x]|");
}

/**
 * BLOCK STATEMENTS
 */
public test bool blockOneTwoWithoutThree() {
	return outcomeIsCorrect("{ 1\n 2 } 3", "|Blocks [1\n] lastBlock [2 ]Expression [3]|");
}
 
public test bool blockOneNewlineTwo() {
	
}

public test bool blockOneNewlineNewlineTwo() {
	
}

public test bool blockOneNewlineTwo() {
	
}

public test bool blockEmpty() {

}

public test bool blockEmptyNewline() {

}

public test bool blockNoWhitespaceOne() {
	return outcomeIsCorrect("{1}", "|Blocks [] lastBlock[1]|");
}


public bool outcomeIsCorrect(str source, str expectedOutcome) {
	parsed = parse(source);
	bool expectedOutcomeEqual = showTypes(parsed) == expectedOutcome;
	bool isUnambiguous = /amb(_) !:= parsed;
	return expectedOutcomeEqual && isUnambiguous;
}

public str showTypes(str source) {
	return showTypes(parse(source));
}