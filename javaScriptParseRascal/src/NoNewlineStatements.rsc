module NoNewlineStatementNoWhitespaces
import ParseTree;
import IO;
import vis::Figure;
import vis::ParseTree;
import vis::Render;
import String;

import EcmaScript;

lexical WhitespaceNoNewline
  = [\t-\ ]
  ;

lexical LAYOUTNONEWLINE 
  = WhitespaceNoNewline  
  ;

layout LAYOUTLISTNONEWLINE
  = LAYOUTNONEWLINE* 
    !>> [\t-\ ]
  ;
  
  syntax PropertyNameNoWhitespace
 = Id
 | String
 | NumericNoWhitespace
 ;
  
  start syntax Source 
  = SourceElement*
  ;

syntax SourceElement
  = StatementNoWhitespace
  | stat:Statement
  | FunctionDeclaration
  ;
  
  syntax LiteralNoWhitespace
 = "null"
 | Boolean
 | NumericNoWhitespace
 | String
 ;
 
 lexical DecimalNoWhitespace
  = [0-9]
  ;
 
  
  syntax NumericNoWhitespace
  = [a-zA-Z$_0-9] !<< DecimalNoWhitespace
  ;

syntax ExpressionNoWhitespace
  = "this"
  | Id
  | LiteralNoWhitespace
  | bracket "(" ExpressionNoWhitespace ")"
  | "[" Elts  "]"
  | "{" {PropertyAssignment ","}+ "," "}"
  | "{" {PropertyAssignment ","}* "}"
  | ExpressionNoWhitespace "(" { ExpressionNoWhitespace!comma ","}* ")"
  | ExpressionNoWhitespace "[" ExpressionNoWhitespace "]"
  | ExpressionNoWhitespace "." Id
  > "new" ExpressionNoWhitespace
  > ExpressionNoWhitespace !>> [\n\r] "++" 
  | ExpressionNoWhitespace !>> [\n\r] "--"
  > "delete" ExpressionNoWhitespace
    | "void" ExpressionNoWhitespace
    | "typeof" ExpressionNoWhitespace
    | "++" ExpressionNoWhitespace
    | "--" ExpressionNoWhitespace
    | "+" !>> [+=] ExpressionNoWhitespace
    | "-" !>> [\-=] ExpressionNoWhitespace
    | "~" ExpressionNoWhitespace
    | "!" !>> [=] ExpressionNoWhitespace
  > 
  left ( 
    ExpressionNoWhitespace "*" !>> [*=] ExpressionNoWhitespace
    | ExpressionNoWhitespace "/" !>> [/=] ExpressionNoWhitespace
    | ExpressionNoWhitespace "%" !>> [%=] ExpressionNoWhitespace
  )
  >
  left ( 
    ExpressionNoWhitespace "+" !>> [+=] ExpressionNoWhitespace
    | ExpressionNoWhitespace "-" !>> [\-=] ExpressionNoWhitespace
  )
  >  // right???
  left (
    ExpressionNoWhitespace "\<\<" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\>\>" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\>\>\>" ExpressionNoWhitespace
  )
  >
  non-assoc (
    ExpressionNoWhitespace "\<" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\<=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\>" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\>=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "instanceof" ExpressionNoWhitespace
    | inn: ExpressionNoWhitespace "in" ExpressionNoWhitespace // remove in NoIn ExpressionNoWhitespaces
  )
  >
  right (
      ExpressionNoWhitespace "===" ExpressionNoWhitespace
    | ExpressionNoWhitespace "!==" ExpressionNoWhitespace
    | ExpressionNoWhitespace "==" !>> [=] ExpressionNoWhitespace
    | ExpressionNoWhitespace "!=" !>> [=] ExpressionNoWhitespace
  )
  > right ExpressionNoWhitespace "&" !>> [&=] ExpressionNoWhitespace
  > right ExpressionNoWhitespace "^"  !>> [=] ExpressionNoWhitespace
  > right ExpressionNoWhitespace "|" !>> [|=] ExpressionNoWhitespace
  > right ExpressionNoWhitespace "&&" ExpressionNoWhitespace
  > right ExpressionNoWhitespace "||" ExpressionNoWhitespace
  > ExpressionNoWhitespace "?" ExpressionNoWhitespace ":" ExpressionNoWhitespace
  > right (
      ExpressionNoWhitespace "=" !>> ([=][=]?) ExpressionNoWhitespace
    | ExpressionNoWhitespace "*=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "/=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "%=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "+=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "-=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\<\<=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\>\>=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "\>\>\>=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "&=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "^=" ExpressionNoWhitespace
    | ExpressionNoWhitespace "|=" ExpressionNoWhitespace
  )
  > right comma: ExpressionNoWhitespace "," ExpressionNoWhitespace
  ;

syntax StatementNoWhitespace 
  = returnExp: "return" ExpressionNoWhitespace ";"
  | returnExpNoSemi: "return" ExpressionNoWhitespace () !>> ";" $
  ;
  
  StatementNoWhitespace returnExp("return" _, LAYOUTLISTNONEWLINE l1, ExpressionNoWhitespace exp, LAYOUTLISTNONEWLINE l2, ";" _) { 
  println("Exp: <unparse(exp)>, L1: <unparse(l1)>, L2: <unparse(l2)>");
  if (findFirst(unparse(exp), "\n") != -1) {
    println("filtering");
    filter;
  }
  fail;
  }
  
  StatementNoWhitespace returnExpNoSemi("return" _, LAYOUTLIST l1, ExpressionNoWhitespace _) {
	  if (findFirst(unparse(l1), "\n") != -1 ) {
	    println("filtering");
	    filter;
	  }
	  fail;
  }