#!/usr/bin/python3

from process import precision_recall
from os import listdir
from os.path import isfile, join
import bcolors
import sys

test_directories = ['basics', 'unexpected', 'classes',
                    'import-export/define', 'import-export/es6', 'import-export/module.exports']

total_w_natives_intersection = 0
total_w_natives_output = 0
total_w_natives_expected = 0

total_wo_natives_intersection = 0
total_wo_natives_output = 0
total_wo_natives_expected = 0

if len(sys.argv) > 1:
    if sys.argv[1] == 'import-export':
        test_directories = test_directories[-3:]

for d in test_directories:
    print(bcolors.HEADER + bcolors.BOLD + '='*5, d, '='*5 + bcolors.ENDC)

    files = [f for f in listdir(d) if isfile(join(d, f))]
    test_files = [f[:-3] for f in files if f[-3:] == '.js']
    output_files = [f[:-6] for f in files if f[-6:] == '.truth']

    dir_w_natives_intersection = 0
    dir_w_natives_output = 0
    dir_w_natives_expected = 0

    dir_wo_natives_intersection = 0
    dir_wo_natives_output = 0
    dir_wo_natives_expected = 0

    for tf in test_files:
        if tf not in output_files:
            print(bcolors.FAIL + tf + '.js', 'missing output file' + bcolors.ENDC)

    for tf in test_files:
        if tf in output_files:
            w_natives, wo_natives = precision_recall(d + '/' + tf + '.js', d + '/' + tf + '.truth')
            print(bcolors.OKGREEN + tf + '.js' + bcolors.ENDC)
            print('\twith natives:', str(w_natives[0]) + '% precision,', str(w_natives[1]) + '% recall')
            print('\twithout natives:', str(wo_natives[0]) + '% precision,', str(wo_natives[1]) + '% recall')

            dir_w_natives_intersection += w_natives[2]
            dir_w_natives_output += w_natives[3]
            dir_w_natives_expected += w_natives[4]

            dir_wo_natives_intersection += wo_natives[2]
            dir_wo_natives_output += wo_natives[3]
            dir_wo_natives_expected += wo_natives[4]


    print()

    if (dir_w_natives_output > 0 and dir_w_natives_expected > 0):
        dir_w_natives_precision = 100*dir_w_natives_intersection // dir_w_natives_output
        dir_w_natives_recall = 100*dir_w_natives_intersection // dir_w_natives_expected

        print('with natives:', str(dir_w_natives_precision) + '% precision,', str(dir_w_natives_recall) + '% recall')

    if (dir_wo_natives_output > 0 and dir_wo_natives_expected > 0):
        dir_wo_natives_precision = 100*dir_wo_natives_intersection // dir_wo_natives_output
        dir_wo_natives_recall = 100*dir_wo_natives_intersection // dir_wo_natives_expected

        print('without natives:', str(dir_wo_natives_precision) + '% precision,', str(dir_wo_natives_recall) + '% recall')

    print()

    total_w_natives_intersection += dir_w_natives_intersection
    total_w_natives_output += dir_w_natives_output
    total_w_natives_expected += dir_w_natives_expected

    total_wo_natives_intersection += dir_wo_natives_intersection
    total_wo_natives_output += dir_wo_natives_output
    total_wo_natives_expected += dir_wo_natives_expected

print(bcolors.HEADER + bcolors.BOLD + '='*5, 'SUMMARY', '='*5 + bcolors.ENDC)
if (total_w_natives_output > 0 and total_w_natives_expected > 0):
    total_w_natives_precision = 100*total_w_natives_intersection // total_w_natives_output
    total_w_natives_recall = 100*total_w_natives_intersection // total_w_natives_expected

    print('with natives:', str(total_w_natives_precision) + '% precision,', str(total_w_natives_recall) + '% recall')

if (total_wo_natives_output > 0 and total_wo_natives_expected > 0):
    total_wo_natives_precision = 100*total_wo_natives_intersection // total_wo_natives_output
    total_wo_natives_recall = 100*total_wo_natives_intersection // total_wo_natives_expected

    print('without natives:', str(total_wo_natives_precision) + '% precision,', str(total_wo_natives_recall) + '% recall')
