#!/usr/bin/python3

# Author: Alex Stennet
# Description: Provides a testing framework for the call graph genereation
#
# An example of how to run:
#   ./process.py basics/arrow.js basics/arrow.truth


import sys
from pathlib import Path
import re
from required_files import collect_requires
from callgraph import callgraph_formatted


def get_output(test_file):
    # Recursively descend through require's to find all files that
    # must be included to fill the callgraph
    required_files = collect_requires(Path(test_file).resolve())
    strd_files = [str(rf) for rf in required_files]

    # Run the javascript call graph program and capture the output
    output = callgraph_formatted(strd_files, keep=required_files[0].name,
                                 natives=False)

    return output


def precision_recall(test_file, expected_output):
    fo = get_output(test_file)

    # Reading in expected output file and comparing with output
    f = open(expected_output)

    lines = [line.rstrip('\n') for line in f if 'Native' not in line]

    output_lines = set(fo)
    expected_lines = set(lines)

    intersection = output_lines & expected_lines
    difference = output_lines ^ expected_lines

    if len(difference) != 0:
        missing_output = expected_lines - output_lines
        extra_output = output_lines - expected_lines

        print()

        for l in intersection:
            print('\t' + l)

        for l in extra_output:
            print('\t+', l)

        for l in missing_output:
            print('\t-', l)

    if len(output_lines) > 0:
        precision = 100 * len(intersection) // len(output_lines)
    else:
        precision = 0

    recall = 100*len(intersection) // len(expected_lines)

    return precision, recall


if __name__ == "__main__":
    assert len(sys.argv) == 3,\
           "Incorrect number of arguments: process.py FILENAME TEST_FILE"

    precision_recall(sys.argv[1], sys.argv[2])
