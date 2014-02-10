module NewlineStatements

import EcmaScript;

syntax Statement 
  = block: "{" Statement* "}"
  | variable: "var" {VariableDeclaration ","}+ 
//  var x = 3, y = 4 is amb with =/, expr
// TODO: need semantic action
  | returnNoExp: "return" ";"
  | returnNoExpNoSemi: "return" () !>> ";" $
  | empty: ";"
  | expression: ^ [{]!<< "function" !<< Expression ";"
  | expression: [{]!<< "function" !<< Expression $
  | ifThen: "if" "(" Expression ")" Statement !>> "else"
  | ifThenElse: "if" "(" Expression ")" Statement "else" Statement
  | doWhile: "do" Statement "while" "(" Expression ")" ";"? 
  | whileDo: "while" "(" Expression ")" Statement
  | forDo: "for" "(" ExpressionNoIn? ";" Expression? ";" Expression? ")" Statement
  | forDo: "for" "(" "var" VariableDeclarationNoIn ";" Expression? ";" Expression? ")" Statement
  | forIn: "for" "(" Expression "in" Expression ")" Statement // left-hand side expr "in" ???
  
  | continueLabel: "continue"  Id ";" 
  | continueNoLabel: "continue" ";"
  | breakLabel: "break" Id ";"
  | breakNoLabel: "break" ";"
  | throwExp: "throw" Expression ";" 
  | throwNoExp: "throw" ";"
  
  | continueLabelNoSemi: "continue"  Id  
  | continueNoLabelNoSemi: "continue" 
  | breakLabelNoSemi: "break" Id 
  | breakNoLabelNoSemi: "break" 
  | throwExpNoSemi: "throw" Expression  
  | throwNoExpNoSemi: "throw" 
  
  
  | withDo: "with" "(" Expression ")" Statement
  | switchCase: "switch" "(" Expression ")" CaseBlock
  | labeled: Id ":" Statement
  | tryCatch: "try" "{" SourceElement* "}" "catch" "(" Id ")" "{" Statement* "}"
  | tryFinally: "try" "{" Statement* "}" "finally" "{" Statement* "}"
  | tryCatchFinally: "try" "{" Statement* "}" 
       "catch" "(" Id ")" "{" Statement* "}" "finally" "{" Statement* "}"
  | debugger: "debugger" ";"?
  ;
  
  // Todo: throw, and others?

Statement breakLabel("break" _, LAYOUTLIST l1, Id id, LAYOUTLIST l2, ";" _) { 
	  if (findFirst(unparse(l1), "\n") != -1 || findFirst(unparse(l2), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

Statement breakNoLabel("break" _, LAYOUTLIST l1, ";" _) {
	  if (findFirst(unparse(l1), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

Statement continueLabel("continue" _, LAYOUTLIST l1, Id id, LAYOUTLIST l2, ";" _) { 
	  if (findFirst(unparse(l1), "\n") != -1 || findFirst(unparse(l2), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

Statement continueNoLabel("break" _, LAYOUTLIST l1, ";" _) {
	  if (findFirst(unparse(l1), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

Statement returnNoExp("return" _, LAYOUTLIST l1, ";" _) {
	  if (findFirst(unparse(l1), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

Statement breakLabel("break" _, LAYOUTLIST l1, Id id, LAYOUTLIST l2, ";" _) { 
	  if (findFirst(unparse(l1), "\n") != -1 || findFirst(unparse(l2), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

Statement breakNoLabel("break" _, LAYOUTLIST l1, ";" _) {
	  if (findFirst(unparse(l1), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

Statement continueLabelNoSemi("continue" _, LAYOUTLIST l1, Id id) {
	  if (findFirst(unparse(l1), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }