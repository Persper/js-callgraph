module EcmaScript

import ParseTree;
import IO;
import vis::Figure;
import vis::ParseTree;
import vis::Render;
import String;

/*
 * TODO
 * - Check for newlines in continue Id etc.
 * - Do semicolon insertion right.
 */

start syntax Source 
  = SourceElement*
  ;

syntax SourceElement
  = stat:Statement
  | FunctionDeclaration
  ;

syntax FunctionDeclaration 
  = "function" Id "(" {Id ","}* ")" "{" SourceElement* "}"
  ;

lexical Term
  = [\ \t]* [\n] [\ \t\n]* !>> [\ \t\n]
  | [\n] !<< [\ \t]* ";" [\ \t]* !>> [\ \t]
  ;

syntax Statement 
  = block: "{" Statement* "}"
  | variable: "var" {VariableDeclaration ","}+ 
//  var x = 3, y = 4 is amb with =/, expr
// TODO: need semantic action
  | returnExp: "return" Expression Term
  | returnNoExp: "return" Term
  | empty: ";"
  | expression: [{]!<< "function" !<< Expression ";"
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
  

syntax ExpressionNoIn // inlining this doesn't work.
  = Expression!inn
  ;

syntax NoCurlyOrFunction 
  = () !>> [{] !>> [f][u][n][c][t][i][o][n]
  ; 

syntax NoElse
  = () !>> [e][l][s][e]
  ;

syntax VariableDeclaration 
  = Id "=" Expression!comma
  | Id
  ;

syntax VariableDeclarationNoIn
  = Id "=" Expression!inn
  | Id
  ;

syntax CaseBlock 
  = "{" CaseClause* DefaultClause? CaseClause* "}"
  ;

syntax CaseClause 
  = "case" Expression ":" Statement*
  ;

syntax DefaultClause 
  = "default" ":" Statement*
  ;



// TODO: should be copied/ renaming Expression to ExpressionNoIN
// and removing instanceof.


syntax Elts
  = ","*
  | ","* Expression ","+ Elts
  | Expression
  ;
  
// Commas (Expression Comma+)* Expression?
// missed case in parsergen.

syntax Expression
  = "this"
  | Id
  | Literal
  | bracket "(" Expression ")"
  | "[" Elts  "]"
  | "{" {PropertyAssignment ","}+ "," "}"
  | "{" {PropertyAssignment ","}* "}"
  > function: "function" Id? "(" {Id ","}* ")" "{" SourceElement* "}"
  | Expression "(" { Expression!comma ","}* ")"
  | Expression "[" Expression "]"
  | Expression "." Id
  > "new" Expression
  > Expression !>> [\n\r] "++" 
  | Expression !>> [\n\r] "--"
  > "delete" Expression
    | "void" Expression
    | "typeof" Expression
    | "++" Expression
    | "--" Expression
    | "+" !>> [+=] Expression
    | "-" !>> [\-=] Expression
    | "~" Expression
    | "!" !>> [=] Expression
  > 
  left ( 
    Expression "*" !>> [*=] Expression
    | Expression "/" !>> [/=] Expression
    | Expression "%" !>> [%=] Expression
  )
  >
  left ( 
    Expression "+" !>> [+=] Expression
    | Expression "-" !>> [\-=] Expression
  )
  >  // right???
  left (
    Expression "\<\<" Expression
    | Expression "\>\>" Expression
    | Expression "\>\>\>" Expression
  )
  >
  non-assoc (
    Expression "\<" Expression
    | Expression "\<=" Expression
    | Expression "\>" Expression
    | Expression "\>=" Expression
    | Expression "instanceof" Expression
    | inn: Expression "in" Expression // remove in NoIn Expressions
  )
  >
  right (
      Expression "===" Expression
    | Expression "!==" Expression
    | Expression "==" !>> [=] Expression
    | Expression "!=" !>> [=] Expression
  )
  > right Expression "&" !>> [&=] Expression
  > right Expression "^"  !>> [=] Expression
  > right Expression "|" !>> [|=] Expression
  > right Expression "&&" Expression
  > right Expression "||" Expression
  > Expression "?" Expression ":" Expression
  > right (
      Expression "=" !>> ([=][=]?) Expression
    | Expression "*=" Expression
    | Expression "/=" Expression
    | Expression "%=" Expression
    | Expression "+=" Expression
    | Expression "-=" Expression
    | Expression "\<\<=" Expression
    | Expression "\>\>=" Expression
    | Expression "\>\>\>=" Expression
    | Expression "&=" Expression
    | Expression "^=" Expression
    | Expression "|=" Expression
  )
  > right comma: Expression "," Expression
  ;


syntax PropertyName
 = Id
 | String
 | Numeric
 ;

syntax PropertyAssignment
  = PropertyName ":" Expression
  | "get" PropertyName "(" ")" "{" FunctionBody "}"
  | "set" PropertyName "(" Id ")" "{" FunctionBody "}"
  ;


syntax Literal
 = "null"
 | Boolean
 | Numeric
 | String
 | RegularExpression
 ;

syntax Boolean
  = "true"
  | "false"
  ;

syntax Numeric
  = [a-zA-Z$_0-9] !<< Decimal
  | [a-zA-Z$_0-9] !<< HexInteger
  ;

lexical Decimal
  = DecimalInteger [.] [0-9]* ExponentPart?
  | [.] [0-9]+ ExponentPart?
  | DecimalInteger ExponentPart?
  ;

lexical DecimalInteger
  = [0]
  | [1-9][0-9]*
  !>> [0-9]
  ;

lexical ExponentPart 
  = [eE] SignedInteger
  ;

lexical SignedInteger 
  = [+\-]? [0-9]+ 
  !>> [0-9]
  ;

lexical HexInteger 
  = [0] [Xx] [0-9a-fA-F]+ 
  !>> [a-zA-Z_]
  ;

lexical String 
  =  [\"] DoubleStringChar* [\"]
  |  [\'] SingleStringChar* [\']
  ;

lexical DoubleStringChar
  = ![\"\\\n]
  | [\\] EscapeSequence
  | LineContinuation
  ;

lexical SingleStringChar
  = ![\'\\\n]
  | [\\] EscapeSequence
  | LineContinuation
  ;

lexical LineContinuation
  = [\\][\\] LineTerminatorSequence
  ;

lexical EscapeSequence 
  = CharacterEscapeSequence
  | [0] !>> [0-9]
  | HexEscapeSequence 
  | UnicodeEscapeSequence
  ;

lexical CharacterEscapeSequence
  = SingleEscapeCharacter
  | NonEscapeCharacter
  ;

lexical SingleEscapeCharacter
  = [\'\"\\bfnrtv]
  ;

lexical NonEscapeCharacter
  = ![\n\"\\bfnrtv]
  ;

lexical EscapeCharacter
  = SingleEscapeCharacter
  | [0-9]
  | [xu]
  ;
  
lexical HexDigit
  = [a-fA-F0-9]
  ;

lexical HexEscapeSequence
  = [x] HexDigit
  ;

syntax UnicodeEscapeSequence
  = "u" HexDigit HexDigit HexDigit HexDigit
  ;

lexical RegularExpression
  = [/] RegularExpressionBody [/] RegularExpressionFlags
  ;

lexical RegularExpressionBody 
  = RegularExpressionFirstChar RegularExpressionChar*
  ;

lexical RegularExpressionFirstChar
  = ![*/\[\n]
  | RegularExpressionBackslashSequence
  | RegularExpressionClass
  ;

lexical RegularExpressionChar
  = ![/\[\n]
  | RegularExpressionBackslashSequence
  | RegularExpressionClass
  ;

lexical RegularExpressionBackslashSequence
  = [\\] ![\n]
  ;

lexical RegularExpressionClass 
  = [\[] RegularExpressionClassChar* [\]]
  ;

lexical RegularExpressionClassChar
  = ![\n\]]
  | RegularExpressionBackslashSequence
  ;

lexical RegularExpressionFlags
  = IdPart*
  ;


lexical Whitespace
  = [\t-\n\r\ ]
  ;

lexical Comment 
  = MultLineComment
  | SingleLineComment
  ;
  
lexical MultLineComment = @category="Comment"  "/*" CommentChar* "*/";
lexical SingleLineComment =  @category="Comment"  "//" ![\n]* [\n];

lexical CommentChar 
  = ![*] 
  | Asterisk 
  ;

lexical Asterisk 
  = [*] !>> [/] 
  ;


lexical LAYOUT 
  = Whitespace  
  | Comment
  ;


layout LAYOUTLIST 
  = LAYOUT* 
  !>> [\t\ ] 
  !>> "/*" 
  !>> "//" ;


lexical Id 
  = ([a-zA-Z$_0-9] !<< IdStart IdPart* !>> [a-zA-Z$_0-9]) \ Reserved
  ;

lexical IdStart
  = [$_a-zA-Z]
  ; // "\\" UnicodeEscapeSequence

lexical IdPart
  = [a-zA-Z$_0-9]
  ;


keyword Reserved =
    "break" |
    "case" |
    "catch" |
    "continue" |
    "debugger" |
    "default" |
    "delete" |
    "do" |
    "else" |
    "finally" |
    "for" |
    "function" |
    "if" |
    "instanceof" |
    "in" |
    "new" |
    "return" |
    "switch" |
    "this" |
    "throw" |
    "try" |
    "typeof" |
    "var" |
    "void" |
    "while" |
    "with"
    "abstract" |
    "boolean" |
    "byte" |
    "char" |
    "class" |
    "const" |
    "double" |
    "enum" |
    "export" |
    "extends" |
    "final" |
    "float" |
    "goto" |
    "implements" |
    "import" |
    "interface" |
    "int" |
    "long" |
    "native" |
    "package" |
    "private" |
    "protected" |
    "public" |
    "short" |
    "static" |
    "super" |
    "synchronized" |
    "throws" |
    "transient" |
    "volatile" |
    "null" |
    "true" |
    "false"
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

Statement returnExp("return" _, LAYOUTLIST l1, Expression _, LAYOUTLIST l2, ";" _) { 
  if (findFirst(unparse(l1), "\n") != -1 || findFirst(unparse(l2), "\n") != -1 ) {
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

Statement returnExpNoSemi("return" _, LAYOUTLIST l1, Expression _) {
	  if (findFirst(unparse(l1), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }

//Parsing
public Source parse(loc file) = parse(#Source, file);
public Source parse(str txt) = parse(#Source, txt);
public void parseAndView(loc file) {
	render(visParsetree(parse(file)));
}
public void parseAndView(str txt) {
	render(space(visParsetree(parse(txt)),std(gap(8,30)),std(resizable(true))));
	//render(
	//	box(
	//		box(
	//			visParsetree(parse(txt)), size(100,50), fillColor("lightGray")
	//		), grow(6), fillColor("blue"))
	//);
}

public Source tryToParse(content) {
	try
		return parse(content);
	catch ParseError(loc l):
		println("I found a parse error at line <l.begin.line>, column <l.begin.column>");
}

//public void testje(Tree parseTree) {
//	visit(parseTree) {
//		case statement:(Statement)`return <Expression a>`: {
//			println("bovenste");
//			//str unparsed = unparse(statement);
//			//if (/return [\n]+/ := unparsed) {
//			//	println("Contains newlines!");
//			//	println("Adapted: return; <a>");
//			//}
//			return;
//		}
//		case (Statement)`return;`: {
//			println("Onderste");
//		}
//	}
//}