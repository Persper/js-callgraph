#!/usr/bin/python3

import os, sys, glob, time
from os.path import isfile, join, dirname, isdir, basename
from process import precision_recall

# -------------- Configuration --------------

# Only scan the following directories for test cases
test_dirs = ['basics',
             'unexpected',
             'classes',
             'es6',
             'import-export/define',
             'import-export/es6',
             'import-export/module.exports',
             'typescript',
             'vue']

# Only consider test cases in the following languages
langs = ['*.js', '*.ts', '*.vue']

# -------------------------------------------

print()
print('RUNNING REGRESSION TESTS')

test_root_dir = dirname(sys.argv[0])
num_passed = 0
num_failed = 0


def find_truth_file(test_file):
    truth_file = test_file.rsplit('.', 1)[0] + '.truth'
    if os.path.isfile(truth_file):
        return truth_file
    else:
        return None

start = time.time()

for d in test_dirs:
    print('\n' + '='*5, d, '='*5 + '\n')
    d = join(test_root_dir, d)

    for lang in langs:
        for test_file in glob.iglob(d + '/**/' + lang, recursive=True):
            truth_file = find_truth_file(test_file)
            if not truth_file:
                continue
            precision, recall = precision_recall(test_file, truth_file)

            print(basename(test_file), end='')
            if precision == 100 and recall == 100:
                print('\r' + test_file + ' ✓')
                num_passed += 1
            else:
                print('\rFAILED: ' + test_file + ' ❌\n')
                num_failed += 1

end = time.time()

print()
print('Number passed: ' + str(num_passed))
print('Number failed: ' + str(num_failed))
print('Total time: ' + str(end - start))

if num_failed > 0:
    exit(1)
