# Author: Alex Stennet
# Description: Provides a testing framework for the call graph genereation

from pathlib import Path

from callgraph import callgraph_formatted
from required_files import collect_requires


def get_output(test_file, mode):
    # Recursively descend through require's to find all files that
    # must be included to fill the callgraph
    required_files = collect_requires(Path(test_file).resolve())
    strd_files = [str(rf) for rf in required_files]

    # Run the javascript call graph program and capture the output
    output = callgraph_formatted(strd_files, keep=required_files[0].name, natives=False, mode=mode)

    return output


def precision_recall(test_file, expected_output, mode):
    fo = get_output(test_file, mode)

    # In case we want to rewrite the reference output
    # with open(expected_output, 'w') as f:
    #     if len(fo) > 0:
    #         f.write('\n'.join(fo))
    #         f.write('\n')
    # return 100, 100

    # Reading in expected output file and comparing with output
    with open(expected_output) as fp:
        lines = [line.rstrip('\n') for line in fp if 'Native' not in line]

    output_lines = set(fo)
    expected_lines = set(lines)

    # If the reference output is empty
    if len(output_lines) == 0 and len(expected_lines) == 0:
        return 100, 100

    intersection = output_lines & expected_lines
    difference = output_lines ^ expected_lines

    if len(difference) != 0:
        missing_output = expected_lines - output_lines
        extra_output = output_lines - expected_lines

        print("Intersection")
        for l in intersection:
            print('\t' + l)

        print("Unexpected output")
        for l in extra_output:
            print('\t+', l)

        print("Missing output")
        for l in missing_output:
            print('\t-', l)

    if len(output_lines) > 0:
        precision = 100 * len(intersection) // len(output_lines)
    else:
        precision = 0

    recall = 100 * len(intersection) // len(expected_lines)

    return precision, recall
