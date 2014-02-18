module EcmaScriptTypePrinter

import EcmaScript;
import IO;

public str showTypes(tree) {
	str returnValue = "|";
	visit(tree) {
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
		case (Statement)`;`: {
			returnValue += "Empty|";
		}
		case (Statement)`<Expression e>`: {
			returnValue += "Expression [<e>]|";
		}
		case (Statement)`<Expression e>;`: {
			returnValue += "Expression [<e>];|";
		}
		case (VariableDeclaration)`<Id id> = <Expression e>`: {
			returnValue += "Varassign [<id>] expr [<e>]|";
		}
		case (Statement)`{ <BlockStatement* blocks> <LastBlockStatement lastBlock> }`: {
			returnValue += "Blocks [<blocks>] lastBlock [<lastBlock>]";
		}
	}
	return returnValue;
}