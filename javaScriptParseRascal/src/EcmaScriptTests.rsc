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

public test bool returnExpNewlinePlusExpMinExpSemi() {
	return outcomeIsCorrect("return 1\n+2-2;", "|Return [1\n+2-2];|");
}

public test bool returnExpNewlinePlusExpNewlineMinExpSemi() {
	return outcomeIsCorrect("return 1\n+2\n-2;", "|Return [1\n+2\n-2];|");
}

/**
 * THROW STATEMENTS
 */

public test bool throwNoSemi() {
	return outcomeIsCorrect("throw", "|Throw|");	
}

public test bool throwSemi() {
	return outcomeIsCorrect("throw;", "|Throw;|");	
}

public test bool throwExpNoSemi() {
	return outcomeIsCorrect("throw 1", "|Throw [1]|");	
}

public test bool throwExpSemi() {
	return outcomeIsCorrect("throw 1;", "|Throw [1];|");	
}

public test bool throwExpSemiExpSemi() {
	return outcomeIsCorrect("throw 1; 1;", "|Throw [1];|Expression [1];|");	
}

public test bool throwExpNoSemiNewlineExpressionSemi() {
	return outcomeIsCorrect("throw 1 \n 1;", "|Throw [1]|Expression [1];|");
}

public test bool throwSemiSemi() {
	return outcomeIsCorrect("throw;;", "|Throw;|Empty|");
}

public test bool throwExpNewlineSemi() {
	return outcomeIsCorrect("throw 1\n;", "|Throw [1]|Empty|");
}

public test bool throwExpNewlinePlusExpSemi() {
	return outcomeIsCorrect("throw 1\n+2;", "|Throw [1\n+2];|");
}

//Initially filtering only worked if the elements were the first SourceElements.
public test bool throwExpExpNewlineSemi() {
	return outcomeIsCorrect("1;throw 1\n+2;", "|Expression [1];|Throw [1\n+2];|");
}

public test bool throwExpNewlineSemi() {
	return outcomeIsCorrect("throw 1\n\n;", "|Throw [1]|Empty|");
}

public test bool throwSpacesNewlines() {
	return outcomeIsCorrect("throw    \n\n", "|Throw|");
}

public test bool throwExpNewlinePlusExpMinExpSemi() {
	return outcomeIsCorrect("throw 1\n+2-2;", "|Throw [1\n+2-2];|");
}

public test bool throwExpNewlinePlusExpNewlineMinExpSemi() {
	return outcomeIsCorrect("throw 1\n+2\n-2;", "|Throw [1\n+2\n-2];|");
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
public test bool emptyBlock() {
	return outcomeIsCorrect("{ }", "|Block []|");
}
 
public test bool blockOneNewlineTwo() {
	return outcomeIsCorrect("{ 1\n 2 }", "|Block [1\n 2 ]|");
}

public test bool blockOneNewlineNewlineTwo() {
	return outcomeIsCorrect("{ 1\n\n 2 }", "|Block [1\n\n 2 ]|");
}
 
//No multiple /n's are shown
public test bool blockOneNewlineTwoWithoutThree() {
	return outcomeIsCorrect("{ 1\n 2 } 3", "|Block [1\n 2 ]|Expression [3]|");
}

public test bool blockOneNewlinePlusTwo() {
	return outcomeIsCorrect("{ 1\n+2; }", "|Block [1\n+2; ]|");
}

public test bool blockEmptyStatement() {
	return outcomeIsCorrect("{ ; }", "|Block [; ]|");
}

public test bool blockEmptyNewline() {
	return outcomeIsCorrect("{ ;\n }", "|Block [;\n ]|");
}

public test bool blockOneNoWhitespaceBothSides() {
	return outcomeIsCorrect("{1}", "|Block [1]|");
}

public test bool blockOneNoWhitespaceLeft() {
	return outcomeIsCorrect("{1 }", "|Block [1 ]|");
}

public test bool blockOneNoWhitespaceRight() {
	return outcomeIsCorrect("{ 1}", "|Block [1]|");
}

/** 
 * MISCELLANEOUS TESTS
 **/
// TODO: parseAndView("{ a + 3\n\n\nb\n+2; }")
public test bool assignBtoAIncrementC() {
	return outcomeIsCorrect("a=b isVariableDeclaration\n c++", "|Expression [a=b]|Expression [c++]|");
}

public test bool separateInvalidToken() {
	return outcomeThrowsParseError("!");
}

public test bool simpleBreak() {
	return outcomeIsCorrect("break", "|Break|");
}

public test bool simpleBreakSemi() {
	return outcomeIsCorrect("break;", "|Break;|");
}

public test bool simpleBreakLabel() {
	return outcomeIsCorrect("break id", "|Break [id]|");
}

public test bool simpleBreakLabelSemi() {
	return outcomeIsCorrect("break id;", "|Break [id];|");
}

public test bool simpleBreakSemiBlock() {
	return outcomeIsCorrect("{ break; }", "|Block [break; ]|");
}

//Last part is seen as a function call of c.
public test bool cNewlineDPlusEPrint() {
	return outcomeIsCorrect("a = b + c\n(d+e);", "|Expression [a = b + c\n(d+e)];|");
}

public test bool callAWithParameterB() {
	return outcomeIsCorrect("a(b)", "|Expression [a(b)]|");
}

public test bool callAWithParameterBSemi() {
	return outcomeIsCorrect("a(b);", "|Expression [a(b)];|");
}

public test bool callAWithParameterBNewline() {
	return outcomeIsCorrect("a(b)\n", "|Expression [a(b)]\n|");
}

public test bool callAWithParameterBSemiNewline() {
	return outcomeIsCorrect("a(b);\n", "|Expression [a(b)];|");
}

public bool outcomeIsCorrect(str source, str expectedOutcome) {
	parsed = parse(source);
	bool isAmbiguous = /amb(_) := parsed;
	if (isAmbiguous) {
		throw source + " is ambiguous.";
	}
	str outcome = showTypes(parsed);
	if (outcome != expectedOutcome) {
		throw "Expected <expectedOutcome> but was <outcome>.";
	}
	return true; //All test conditions are met.
}

public bool outcomeThrowsParseError(str source) {
	bool threwError;
	try
		parse(source);
	catch ParseError: {
		threwError = true;
	}
	return threwError;
}

public str showTypes(str source) {
	return showTypes(parse(source));
}