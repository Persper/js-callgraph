#!/usr/bin/python3

# Author: Alex Stennet
# Description: Provides a testing framework for the call graph genereation
#
# An example of how to run:
#       ./process.py core/vdom/create-component.js.o ground_truths/create-component.txt
#
# The current implementation requires that the filestructure be of the form:
#    /javascript-call-graph/tests/process.py
#    /vue-compiled/
#
# To make this work with a different filestructure, change root in resolve_path.py
# If the different filestructure has a different means of resolving require paths
# it may be required to change the resolve_path function too

import sys
from pathlib import Path
import re
from required_files import collect_requires
from resolve_path import resolve_path
from callgraph import callgraph
from format_callgraph import format_output

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

    lines = [line[:-1] for line in f]

    output_lines = set(fo)
    expected_lines = set(lines)

    intersection = output_lines & expected_lines

    output_no_natives = [l for l in fo if 'Native' not in l and
                                   '_interopRequireDefault' not in l and
                                   l[-1] != '>']
    expected_no_natives = [l for l in lines if 'Native' not in l and
                                      '_interopRequireDefault' not in l and
                                      l[-1] != '>']

    output_set_wo_natives = set(output_no_natives)
    expected_set_wo_natives = set(expected_no_natives)

    interesection_wo_natives = output_set_wo_natives & expected_set_wo_natives

    if display:
        print('Actual Output (w/o natives)')
        for f in output_no_natives:
            print(f)
        print()
        print('Expected Output (w/o natives)')
        for f in expected_no_natives:
            print(f)
        print()
        print('INCLUDING NATIVES')
        print('Precision:', 100*len(intersection) // len(output_lines), '% (', len(intersection), '/', len(output_lines), ')')
        print('Recall: ', 100*len(intersection) // len(expected_lines), '% (', len(intersection), '/', len(expected_lines), ')')
        print()
        print('EXCLUDING NATIVES')
        print('Precision:', 100*len(interesection_wo_natives) // len(output_set_wo_natives),
              '% (', len(interesection_wo_natives), '/', len(output_set_wo_natives), ')')
        print('Recall: ', 100*len(interesection_wo_natives) // len(expected_set_wo_natives),
              '% (', len(interesection_wo_natives), '/', len(expected_set_wo_natives), ')')

    w_natives_precision = 100*len(intersection) // (len(output_lines) if len(output_lines) > 0 else -1)
    w_natives_recall = 100*len(intersection) // (len(expected_lines) if len(expected_lines) > 0 else -1)
    w_natives_intersection = len(intersection)
    w_natives_output = len(output_lines)
    w_natives_expected = len(expected_lines)

    w_natives = (w_natives_precision, w_natives_recall, w_natives_intersection, w_natives_output, w_natives_expected)

    wo_natives_precision = 100*len(interesection_wo_natives) // (len(output_set_wo_natives) if len(output_set_wo_natives) > 0 else -1)
    wo_natives_recall = 100*len(interesection_wo_natives) // (len(expected_set_wo_natives) if len(expected_set_wo_natives) > 0 else -1)
    wo_natives_intersection = len(interesection_wo_natives)
    wo_natives_output = len(output_set_wo_natives)
    wo_natives_expected = len(expected_set_wo_natives)

    wo_natives = (wo_natives_precision, wo_natives_recall, wo_natives_intersection, wo_natives_output, wo_natives_expected)

    return w_natives, wo_natives

if __name__ == "__main__":
    assert len(sys.argv) == 3, "Incorrect number of arguments: process.py FILENAME TEST_FILE"
    precision_recall(sys.argv[1], sys.argv[2], display=True)
