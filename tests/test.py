#!/usr/bin/python3

from process import precision_recall
from os import listdir, getcwd
from os.path import isfile, join, dirname, isdir
import sys

tests_dir = dirname(sys.argv[0])

test_directories = ['basics', 'unexpected', 'classes', 'es6',
                    'import-export/define', 'import-export/es6',
                    'import-export/module.exports']

print()
print('RUNNING REGRESSION TESTS')

num_passed = 0
num_failed = 0

for d in test_directories:
    print('\n' + '='*5, d, '='*5 + '\n')

    d = tests_dir + '/' + d

    files = [f for f in listdir(d) if not isdir(join(d, f))]
    test_files = [f[:-3] for f in files if f[-3:] == '.js']
    output_files = [f[:-6] for f in files if f[-6:] == '.truth']

    for tf in test_files:
        if tf in output_files:
            print(tf + '.js', end='')

            test_file = d + '/' + tf + '.js'
            truth_file = d + '/' + tf + '.truth'
            precision, recall = precision_recall(test_file, truth_file)

            if precision == 100 and recall == 100:
                print('\r' + tf + '.js ✓')
                num_passed += 1
            else:
                print('FAILED: ' + tf + '.js ❌\n')
                num_failed += 1

print()
print('Number passed: ' + str(num_passed))
print('Number failed: ' + str(num_failed))

if num_failed > 0:
    exit(1)
