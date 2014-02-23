module EcmaScriptTypePrinter

import EcmaScript;
import IO;

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
		case (Statement)`{ <BlockStatements blockStatements> }`: {
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
	}
	return returnValue;
}