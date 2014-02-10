module MergedGrammar

import ParseTree;
import IO;
import vis::Figure;
import vis::ParseTree;
import vis::Render;
import String;

import EcmaScript;
import NewlineStatements;
import NoNewlineStatements;

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

public void testje(Tree parseTree) {
	visit(parseTree) {
		case statement:(Statement)`return <Expression a>`: {
			println("bovenste");
			//str unparsed = unparse(statement);
			//if (/return [\n]+/ := unparsed) {
			//	println("Contains newlines!");
			//	println("Adapted: return; <a>");
			//}
			return;
		}
		case (Statement)`return;`: {
			println("Onderste");
		}
	}
}