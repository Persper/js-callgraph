module EcmaScript

import ParseTree;
import IO;
import vis::Figure;
import vis::ParseTree;
import vis::Render;
import String;
import List;
import Map;
import Set;

/*
 * This grammar supports EcmaScript 5 at the moment which means that the following (non-exhaustive list)
 * of functions are not supported at the moment:
 * - Yield
 * - Generators
 * - Let bindings
 * - ...
 */
start syntax Source 
  = source: SourceElement head Source tail !>> [\n]
  |
  ;

syntax SourceElement
  = stat:Statement
  | FunctionDeclaration
  ;

syntax ZeroOrMoreSourceElements
	= SourceElement NoNL ZeroOrMoreSourceElements
	|
	;

syntax FunctionDeclaration 
  = "function" Id "(" {Id ","}* ")" Block
  ;
  
// TODO add EOF

lexical NoPrecedingEnters =
	[\n] !<< [\ \t]*;
  
syntax Statement 
  = block:Block
  | variableNoSemi: "var" {VariableDeclaration ","}+ NoNL () $
  | variableSemi: "var" {VariableDeclaration ","}+ NoNL ";"

  | returnExp: "return" NoNL Expression NoNL ";"
  | returnExpNoSemi: "return" NoNL Expression NoNL () $
  | returnExpNoSemiBlockEnd: "return" NoNL Expression NoNL () >> [}]
  | returnNoExp: "return" NoNL ";"
  | returnNoExpNoSemi: "return" NoNL () $
  | returnNoExpNoSemiBlockEnd: "return" NoNL () >> [}]  

  | throwExp: "throw" NoNL Expression NoNL ";"
  | throwExpNoSemi: "throw" NoNL Expression NoNL () $
  | throwExpNoSemiBlockEnd: "throw" NoNL Expression NoNL () >> [}]
  | throwNoExp: "throw" NoNL ";"
  | throwNoExpNoSemi: "throw" NoNL () $
  | throwNoExpNoSemiBlockEnd: "throw" NoNL () >> [}]
    
  | empty: ";" NoNL () !>> [}]
  | emptyBlockEnd: ";" NoNL () !>> [\n] >> [}]
  | expressionSemi: Expression!function!objectDefinition NoNL ";"
  | expressionLoose: Expression!function!objectDefinition NoNL () !>> [\n] NoNL () $
  | expressionBlockEnd: Expression!function!objectDefinition NoNL () !>> [\n] >> [}]
  | expressionNL: Expression!function!objectDefinition NoNL OneOrMoreNewLines

  | ifThen: "if" "(" Expression ")" Statement !>> "else"
  | ifThenElse: "if" "(" Expression ")" Statement "else" Statement
  | doWhile: "do" Statement "while" "(" Expression ")" ";"? 
  | whileDo: "while" "(" Expression ")" Statement
  | forDo: "for" "(" ExpressionNoIn? ";" Expression? ";" Expression? ")" Statement
  | forDo: "for" "(" "var" VariableDeclarationNoIn ";" Expression? ";" Expression? ")" Statement
  | forIn: "for" "(" Expression "in" Expression ")" Statement // left-hand side expr "in" ???
  | forIn: "for" "(" "var" Id "in" Expression ")" Statement
          
  | continueLabel: "continue" NoNL Id NoNL ";"
  | continueNoLabel: "continue" NoNL ";"
  | continueLabelNoSemi: "continue" NoNL Id NoNL () $
  | continueLabelNoSemiBlockEnd: "continue" NoNL Id NoNL () >> [}]
  | continueNoLabelNoSemi: "continue" NoNL () $
  | continueNoLabelNoSemiBlockEnd: "continue" NoNL () >> [}]
  
  | breakLabel: "break" NoNL Id NoNL ";"
  | breakNoLabel: "break" NoNL ";"
  | breakLabelNoSemi: "break" NoNL Id NoNL () $
  | breakLabelNoSemiBlockEnd: "break" NoNL Id NoNL () >> [}]
  | breakNoLabelNoSemi: "break" NoNL () $
  | breakNoLabelNoSemiBlockEnd: "break" NoNL () >> [}]
  
  | withDo: "with" "(" Expression ")" Statement
  | switchCase: SwitchBlock //TODO: newline eating here too?
  | labeled: Spaces Id NoNL ":" Statement
  | trBlock: TryBlock
  | debugger: "debugger" ";"?
  ;

syntax SwitchBlock = "switch" "(" Expression ")" CaseBlock; 


syntax TryBlock =
  tryCatch: "try" Block "catch" "(" Id ")" Block
  | tryFinally: "try" Block "finally" Block
  | tryCatchFinally: "try" Block "catch" "(" Id ")" Block "finally" Block 
  ;

syntax Block
  = emptyBlock: "{" "}" NoNL ZeroOrMoreNewLines NoNL () !>> [\n]
  	| block: "{" BlockStatements "}" NoNL ZeroOrMoreNewLines NoNL () !>> [\n]
  ;
  
//TODO: find out if not-follows restriction can be removed.
syntax BlockStatements
// start with [\n]* 
  = blockStatements: BlockStatement head NoNL BlockStatements tail
  | blockStatementLast: LastBlockStatement
  | tailEnd: BlockStatement >> ()
  ;

syntax BlockStatement
  =  
  	// statetements that do not end with a semicolon and one or more new lines
  	 newLine: Statement!variableSemi!expressionSemi!returnExp!throwExp!returnNoExp!throwNoExp!continueLabel!continueNoLabel!breakLabel!breakNoLabel!empty!expressionLoose!emptyBlockEnd!continueLabelNoSemiBlockEnd!breakLabelNoSemiBlockEnd!continueNoLabelNoSemiBlockEnd!breakNoLabelNoSemiBlockEnd!returnExpNoSemiBlockEnd!returnNoExpNoSemiBlockEnd!throwExpNoSemiBlockEnd!throwNoExpNoSemiBlockEnd!expressionBlockEnd!block!ifThen!ifThenElse!doWhile!whileDo!forDo!forIn!trBlock!switchCase NoNL ZeroOrMoreNewLines NoNL () !>> [\n]
  	// statements that end with a semicolon, not ending the block
  	// Do not forget to create block ending versions of statements and exclude them here
    | semiColon: Statement!variableNoSemi!expressionNoSemi!returnNoExpNoSemi!returnExpNoSemi!throwExpNoSemi!continueLabelNoSemi!continueNoLabelNoSemi!breakLabelNoSemi!breakNoLabelNoSemi!returnExpNoSemiBlockEnd!throwExpNoSemiBlockEnd!returnNoExpNoSemiBlockEnd!throwNoExpNoSemiBlockEnd!continueNoLabelNoSemiBlockEnd!breakNoLabelNoSemiBlockEnd!continueLabelNoSemiBlockEnd!breakLabelNoSemiBlockEnd!expressionLoose!expressionNL!emptyBlockEnd!expressionBlockEnd!block!ifThen!ifThenElse!doWhile!whileDo!forDo!forIn!trBlock!switchCase NoNL ZeroOrMoreNewLines NoNL () !>> [\n]
  	| nestedBlock: Block
  	// Excludes everything except statements containing blocks which in turn contain statements. These don't have to end in newlines or semicolons.
  	| statementContainingNested: Statement!variableNoSemi!variableSemi!returnExp!returnExpNoSemi!returnExpNoSemiBlockEnd!returnNoExp!returnNoExpNoSemi!returnNoExpNoSemiBlockEnd!throwExp!throwExpNoSemi!throwExpNoSemiBlockEnd!throwNoExp!throwNoExpNoSemi!throwNoExpNoSemiBlockEnd!throwExp!throwExpNoSemi!throwExpNoSemiBlockEnd!throwNoExp!throwNoExpNoSemi!throwNoExpNoSemiBlockEnd!empty!emptyBlockEnd!expressionSemi!expressionLoose!expressionBlockEnd!expressionNL!breakLabel!breakNoLabel!breakLabelNoSemi!breakLabelNoSemiBlockEnd!breakNoLabelNoSemi!breakNoLabelNoSemiBlockEnd!continueNoLabel!continueLabelNoSemi!continueLabelNoSemiBlockEnd!continueNoLabelNoSemi!continueNoLabelNoSemiBlockEnd!labeled!debugger!trBlock!switchCase
  	| functionDecl: FunctionDeclaration
  	| switchBlock: SwitchBlock
  	| tryBlock: TryBlock
  ;
  
syntax LastBlockStatement
	// statements that do not end with a semicolon and are not followed by new lines, but are followed by } (end of block)
  = last: Statement!variableSemi!expressionSemi!returnNoExp!throwNoExp!continueLabel!continueNoLabel!breakLabel!breakNoLabel!empty!returnExp!throwExp!expressionNL!block!ifThen!ifThenElse!doWhile!whileDo!forDo!forIn!trBlock!switchCase NoNL () !>> [\n] >> [}]
  ;
  
// TODO:
// parseAndView("appelkoek:{ break appelkoek;\n2;;;1\n+2;\n\n }");
// parseAndView("appelkoek:{ break appelkoek;\n2;;;1\n+2;\n\n\n }");
// parseAndView("appelkoek:{ break appelkoek;\n2;;;1\n+2;\n\n\n\n }"); each extra \n adds ambiguity

lexical OneOrMoreNewLines =
	[\n] NoNL () NoNL ZeroOrMoreNewLines NoNL () !>> [\n];

lexical ZeroOrMoreNewLines =
	| [\n] NoNL ZeroOrMoreNewLines
	|
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
  = "{" CaseClauses+ "}" !>> ";"
  ;

syntax CaseClauses = 
 caseClause: CaseClause
 | defaultClause: DefaultClause
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

// Todo: Check associativity https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
// Todo: Right now you can put any type of Expression on the lhs of a variableAssignment like: 5 = y; We only want to do this for a few cases however
// Rather than exclude everything other than those cases it would be much easier to whitelist the few that ARE allowed.
syntax Expression
  = 
   array: "[" {Expression!comma ","}+ "]"
  | emptyArray: "[" "]"
  | "{" {PropertyAssignment ","}+ "," "}"
  | objectDefinition:"{" {PropertyAssignment ","}* "}"
  > function: "function" Id? "(" {Id ","}* ")" Block
  | Expression "." Id //Can be on LHS of variableAssignment
  > Expression "(" { Expression!comma ","}+ ")" //Can be on LHS of variableAssignment
  | Expression "(" ")" //Can be on LHS of variableAssignment
  | Expression "[" Expression "]" //Can be on LHS of variableAssignment
  | "this"
  | Id //Can be on LHS of variableAssignment
  | Literal
  > "new" Expression
  > Expression !>> [\n\r] "++"
  | Expression !>> [\n\r] "--"
  > "delete" Expression
    | "void" Expression
    | "typeof" Expression
    | "++" Expression
    | "--" Expression
    | prefixPlus: "+" !>> [+=] Expression
    | prefixMin: "-" !>> [\-=] Expression
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
  > // right???
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
  > right Expression "^" !>> [=] Expression
  > right Expression "|" !>> [|=] Expression
  > left Expression "&&" Expression
  > left Expression "||" Expression
  > right (
      variableAssignment:Expression "=" !>> ([=][=]?) Expression
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
  > nestedExpression: "(" Expression ")" //Can be on LHS of variableAssignment
  > right Expression "?" Expression ":" Expression
  > left comma: Expression "," Expression
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
  = [\"] DoubleStringChar* [\"]
  | [\'] SingleStringChar* [\']
  ;

lexical DoubleStringChar
  = ![\"\\\n]
  | [\\] EscapeSequence
  //| LineContinuation
  ;

lexical SingleStringChar
  = NonSingleStringEscapeCharacter // ![\'\\\n]
  | [\\] EscapeSequence
  //| LineContinuation
  ;

lexical LineContinuation
  = [\\] NoNL OneOrMoreNewLines
  ;

lexical EscapeSequence
  = CharacterEscapeSequence
  // | [0] !>> [0-9]
  | HexEscapeSequence
  | UnicodeEscapeSequence
  ;

lexical CharacterEscapeSequence
  = 
  NonEscapeCharacter
  | SingleEscapeCharacter
  ;

lexical SingleEscapeCharacter
  = [\'\"\\bfnrtv]
  ;

lexical NonSingleStringEscapeCharacter = ![\n\'\\bfnrtv];

lexical NonEscapeCharacter
  = ![\n\"\\bfnrtvux]
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
  = ![*/\[\n\\]
  | RegularExpressionBackslashSequence
  | RegularExpressionClass
  ;

lexical RegularExpressionChar
  = ![/\[\n\\]
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
  = ![\n\]\\]
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
  
lexical MultLineComment = @category="Comment" "/*" CommentChar* "*/";

lexical ZeroOrMoreChars =
        | ![\n] NoNL ZeroOrMoreChars
        |
        ;
lexical SingleLineComment = @category="Comment" "//" NoNL ZeroOrMoreChars NoNL [\n];

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

layout NoNL = @manual [\ \t]* !>> [\ \t];
layout NoNLAfter = @manual [\ \t\n]* !>> [\ \t];
layout OneNL = @manual [\ \t]* >> [\n]? >> [\ \t]* !>> [\ \t\n]; 

lexical Spaces = [\ \t]* !>> [\ \t\n];

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

Source source(SourceElement head, LAYOUTLIST l, Source tail) {	
	// Prioritizes add and subtract expressions in multiline returns over positive and negative numbers 	
	if (tail.args != [] 
			&& (isReturnWithExpression(head) || isThrowWithExpression(head) || isVariableDeclaration(head))
			&& unparse(tail) != ""
			&& (isPlusExpression(tail.args[0]) || isMinusExpression(tail.args[0]))
			&& findFirst(unparse(l), "\n") != -1) {
		filter;		
	}
	
	if (tail.args != [] 
		&& (isExpression(head) || isExpressionNL(head))
		&& unparse(tail) != ""
		&& (isPlusExpression(tail.args[0]) || isMinusExpression(tail.args[0]) || isParenthesesExpression(tail.args[0]))) {
		filter; 
	}
	
	fail;
}

//Validate statements starting with +
// { 1
//   return +1
// }
// {
//    return 1
//    + 3
// }
// TODO: make sure this doesn't filter. Currently it DOES.
BlockStatements blockStatements(BlockStatement head, NoNL l, BlockStatements tail) {
	//println("I was called");
	if (head is newLine && size(tail.args) > 0) {
		// candidate for invalid parse tree
		if (isLeftMostPlusMinus(tail.args[0])) {
			println("and filtered");
			filter;
		}
	}
	fail;
}

bool isLeftMostPlusMinus(Tree t) {
	Tree lefty = getLeftMost(#Expression, t);
	return (Expression)`+ <Expression _>` := lefty 
		|| (Expression)`- <Expression _>` := lefty;
}

tuple[int,int] getBeginPosition(Tree t) = (t@\loc).begin ? <-1,1>;

Tree getLeftMost(type[&T] tp, Tree t) {
	currentMin = t@\loc.end;
	result = t;
	visit (t) {
		case &T child : {
			pos1 = getBeginPosition(child);
			if (pos1 != <-1,-1>, pos1 < currentMin) {
				result = child;
				currentMin = pos1;
			}
		}
	}
	return result;
}

/*
private bool containsInvalidBlockStatement(Tree t) {
	if (/blockStatements(head, tail) := t) {
		// still kinda wrong, isPlus/isMinus search too deep!
		return tail.args != []
			&& unparse(tail) != ""
			&& (isPlusExpression(tail.args[0]) || isMinusExpression(tail.args[0]));
	}
	return false;
}

public Tree amb(set[Tree] alternatives) {
	result = { a | a <- alternatives, !containsInvalidBlockStatement(a)};
	if ({Tree r} := result)
		return r;
	fail amb;
}
*/
//Parsing
public Source parse(loc file) = parse(#start[Source], file).top;
public Source parse(str txt) = parse(#start[Source], txt).top;
public void parseAndView(loc file) = parseAndView(parse(file));
public void parseAndView(str txt) = parseAndView(parse(txt));
public void parseAndView(Tree tree) = render(space(visParsetree(tree),std(gap(8,30)),std(resizable(true))));

//UTILITY FUNCTIONS
private bool isReturnWithExpression(element) = /(Statement)`return <Expression e>` := element;
private bool isThrowWithExpression(element) = /(Statement)`throw <Expression e>` := element;
private bool isVariableDeclaration(element) = /(Statement)`var <VariableDeclaration v>` := element;
	
private bool isExpression(element) = /(Statement)`<Expression e>` := element;
private bool isExpressionSemi(element) = /(Statement)`<Expression e>;` := element;
private bool isExpressionNL(element) = /(Statement)`<Expression e> <OneOrMoreNewLines n>` := element;
private bool isPlusExpression(element) = /(Expression)`+ <Expression n1>` := element;
private bool isMinusExpression(element) = /(Expression)`- <Expression n1>` := element;
private bool isParenthesesExpression(element) = /(Expression)`( <Expression n1> )` := element;
private bool isEmptyStatement(element) = /(Statement)`;` := element;