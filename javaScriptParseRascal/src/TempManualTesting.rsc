module TempManualTesting

import EcmaScript;
import util::Benchmark;
import ParseTree;
import IO;

public bool parsesUnambiguously(source) {
	int before = getMilliTime();
	Tree parsed = parse(source);
	int after = getMilliTime();
	println("Parsing took <after - before> milliseconds");
	return /amb(_) !:= parsed;
}