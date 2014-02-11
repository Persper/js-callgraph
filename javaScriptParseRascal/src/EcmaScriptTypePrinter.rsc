module EcmaScriptTypePrinter

import EcmaScript;
import IO;

public str showTypes(tree) {
	str returnValue = "|";
	visit(tree) {
		case (Statement)`return <Expression e> <Term t>`: {
			returnValue += "Return [<e>] term [<t>]|";
		}
		case (Statement)`return <Term t>`: {
			returnValue += "Return term [<t>]|";
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
	}
	return returnValue;
}