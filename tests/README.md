# Test Documentation

## Overview

Our tests consist of two parts: unit tests run by jest and integration tests run by a test framework written in python. The jest component is relatively straightforward, so we'll focus more on the python test framework.

Each test case in the python framework again has two parts: the Javascript source code and the ground truth file containing the correct call graph. The python framework runs our tool against the js source code and compares the output with the ground truth file.

* `test/test.py`: the entry point, loops over all the test directories and finds all js files. They it tries to find a .truth file that has the same name with the js file. These two files together form a test case. It calls `precision_recall` function and determine the correctness of a test case.
* `test/process.py`: implements the `precision_recall` function. Given the tool's output and the truth file, computes the precision and recall.
* `test/callgraph.py`: runs our tool and captures the call graph output through subprocess.
* `test/required_files.py`: given a js file, find the other js files that it requires.

## How to add a new test case

Simply add all the js files and a truth file under one of the test directories specified in `test/test.py`. The python framework will automatically collect the new test case. Note that the truth file needs to have the same name with one of the js files, only within which function calls are checked.

## Details

* `test/process.py` and `test/callgraph.py` ignore edges that have at least one native end point.
* If a test case is composed of multiple js files, only the function calls in the one that has same name with the truth file are checked.
