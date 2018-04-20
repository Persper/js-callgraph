#!/usr/bin/python3

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
for rf in strd_files:
    print(rf)

# Run the javascript call graph program and capture the output
output = callgraph(strd_files)
lines = str(output)[2:].split('\\n')
# for line in lines:
#     print(line)

# The output will contain lines for all files that were required
# This will filter out so only one's relevant to the file selected are shown
reg_input_file_name = re.compile(r'.*\(' + required_files[0].name + r'@[0-9]*:[0-9]*-[0-9]*\) ->.*')
filtered_out = [line for line in lines if reg_input_file_name.match(line)]
# print(len(lines))
# Format output to align with the expected output
fo = []
for f in filtered_out:
    fo.append(format_output(f))

# print(fo)
# print(len(fo))

# Reading in expected output file and comparing with output
if len(sys.argv) >= 3:
    f = open(sys.argv[2])

    lines = [line[:-1] for line in f]

    count1 = len([l for l in lines if l in fo])
    count2 = len([l for l in fo if l in lines])

    wo_native1 = [l for l in lines if 'Native' not in l and '_interopRequireDefault' not in l and l[-2:-1] != '->']
    wo_native2 = [l for l in fo if 'Native' not in l and '_interopRequireDefault' not in l and l[-2:-1] != '->']

    count3 = len([l for l in wo_native1 if l in wo_native2])
    count4 = len([l for l in wo_native2 if l in wo_native1])

    print(count1, len(fo))
    print(count2, len(lines))

    # print(wo_native1)
    # print(wo_native2)
    print(count3, len(wo_native2))
    print(count4, len(wo_native1))

    print('Actual Output (w/o natives)')
    for f in wo_native2:
        print(f)

    print('\nExpected Output (w/o natives)')
    for f in wo_native1:
        print(f)
