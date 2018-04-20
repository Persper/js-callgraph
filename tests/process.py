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
from resolve_path import resolve_path, root
from callgraph import callgraph
from format_callgraph import format_output

assert len(sys.argv) > 1, "Incorrect number of arguments: process.py FILENAME <TEST_FILE>"

# Recursively descend through require's to find all files that
# must be included to fill the callgraph
required_files = collect_requires(sys.argv[1])
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

# Reading in expected output file and comparing with output
if len(sys.argv) >= 3:
    f = open(sys.argv[2])

    lines = [line[:-1] for line in f]

    output_lines = set(fo)
    expected_lines = set(lines)

    intersection = output_lines & expected_lines

    output_no_natives = [l for l in fo if 'Native' not in l and
                                   '_interopRequireDefault' not in l and
                                   l[-2:-1] != '->']
    expected_no_natives = [l for l in lines if 'Native' not in l and
                                      '_interopRequireDefault' not in l and
                                      l[-2:-1] != '->']

    output_set_wo_natives = set(output_no_natives)
    expected_set_wo_natives = set(expected_no_natives)

    interesection_wo_natives = output_set_wo_natives & expected_set_wo_natives

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
