module EcmaScriptTypePrinter

import EcmaScript;
import ParseTree;
import IO;
import String;

public str showTypes(tree) {
	str returnValue = "|";
	top-down-break visit (tree) {
		case (Statement)`return <Expression e>`: {
			returnValue += "Return [<e>]|";
		}
		case (Statement)`return <Expression e>;`: {
			returnValue += "Return [<e>];|";
		}
		case (Statement)`return`: {
			returnValue += "Return|";
		}
		case (Statement)`return;`: {
			returnValue += "Return;|";
		}
		case (Statement)`throw <Expression e>`: {
			returnValue += "Throw [<e>]|";
		}
		case (Statement)`throw <Expression e>;`: {
			returnValue += "Throw [<e>];|";
		}
		case (Statement)`throw`: {
			returnValue += "Throw|";
		}
		case (Statement)`throw;`: {
			returnValue += "Throw;|";
		}
		case (Block)`{ }`: {
			returnValue += "EmptyBlock|";
		}
		case (Block)`{ <BlockStatements blockStatements> }`: {
			returnValue += "Block [<blockStatements>]|";
		}
		case (Statement)`;`: {
			returnValue += "Empty|";
		}
		case (Statement)`<Expression e>`: {
			returnValue += "Expression [<e>]|";
		}
		case (Statement)`<Expression e>;`: {
			returnValue += "Expression [<e>];|";
		}
		case (Statement)`<Expression e> <OneOrMoreNewLines n>`: {
			returnValue += "Expression [<e>]\n|";
		}
		case (VariableDeclaration)`<Id id> = <Expression e>`: {
			returnValue += "Varassign [<id>] expr [<e>]|";
		}
		case (Statement)`break;`: {
			returnValue += "Break;|";
		}		
		case (Statement)`break`: {
			returnValue += "Break|";
		}
		case (Statement)`break <Id id>`: {
			returnValue += "Break [<id>]|";
		}
		case (Statement)`break <Id id>;`: {
			returnValue += "Break [<id>];|";
		}
		case (Statement)`continue;`: {
			returnValue += "Continue;|";
		}		
		case (Statement)`continue`: {
			returnValue += "Continue|";
		}
		case (Statement)`continue <Id id>`: {
			returnValue += "Continue [<id>]|";
		}
		case (Statement)`continue <Id id>;`: {
			returnValue += "Continue [<id>];|";
		}
		case (FunctionDeclaration)`function <Id id> ( <{Id ","}* params> ) <Block b>`: {
			returnValue += "FunctionDecl id [<id>] params: [<params>] body: [<b>]|";
		}
	}
	return returnValue;
}

public num evaluate(tree) {
	top-down-break visit(tree) {
		case (Expression)`<Literal l>`: {
			return toInt(unparse(l));
		}
		case (Expression)`<Expression a> * <Expression b>`: {
			return evaluate(a) * evaluate(b);
		}
		case (Expression)`<Expression a> / <Expression b>`: {
			return evaluate(a) / evaluate(b);
		}
		case (Expression)`<Expression a> + <Expression b>`: {
			return evaluate(a) + evaluate(b);
		}
		case (Expression)`<Expression a> - <Expression b>`: {
			return evaluate(a) - evaluate(b);
		}
	}
}