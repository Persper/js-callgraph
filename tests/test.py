#!/usr/bin/python3

from process import precision_recall
from os import listdir, getcwd
from os.path import isfile, join, dirname, isdir
import sys

tests_dir = dirname(sys.argv[0])

test_directories = ['basics', 'unexpected', 'classes', 'es6',
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

print()
print('RUNNING REGRESSION TESTS')

num_passed = 0
num_failed = 0


for d in test_directories:
    print('='*5, d, '='*5)

    d = tests_dir + '/' + d

    files = [f for f in listdir(d) if not isdir(join(d, f))]
    test_files = [f[:-3] for f in files if f[-3:] == '.js']
    output_files = [f[:-6] for f in files if f[-6:] == '.truth']

    for tf in test_files:
        if tf in output_files:
            print(tf + '.js', end='')

            _, wo_natives = precision_recall(d + '/' + tf + '.js', d + '/' + tf + '.truth')

            if wo_natives[0] == 100 and wo_natives[1] == 100:
                print('\r' + tf + '.js ✓')
                num_passed += 1
            else:
                print('\r' + tf + '.js ❌')
                num_failed += 1

print()
print('Number passed: ' + str(num_passed))
print('Number failed: ' + str(num_failed))

if num_failed > 0:
    exit(1)
