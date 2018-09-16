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
    output = callgraph(strd_files)
    lines = str(output)[2:].split('\\n')

    # The output will contain lines for all files that were required
    # This will filter out so only one's relevant to the file selected are shown
    reg_input_file_name = re.compile(r'.*\(' + required_files[0].name + r'@[0-9]*:[0-9]*-[0-9]*\) ->.*')
    filtered_out = [line for line in lines if reg_input_file_name.match(line)]

    # Format output to align with the expected output
    fo = []
    for f in filtered_out:
        fo.append(format_output(f))

    return fo

def precision_recall(test_file, expected_output=None, display=False):
    fo = get_output(test_file)

    if expected_output == None:
        return fo

    # Reading in expected output file and comparing with output
    f = open(expected_output)

    lines = [line[:-1] for line in f if 'Native' not in line]

    output_lines = set(fo)
    expected_lines = set(lines)

    intersection = output_lines & expected_lines

    if len(output_lines) > 0:
        precision = 100 * len(intersection) // len(output_lines)
    else:
        precision = 0

    recall = 100*len(intersection) // len(expected_lines)

    return precision, recall


if __name__ == "__main__":
    assert len(sys.argv) == 3, "Incorrect number of arguments: process.py FILENAME TEST_FILE"
    precision_recall(sys.argv[1], sys.argv[2], display=True)
