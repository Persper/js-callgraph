#!/usr/bin/python3

import glob
import os
import sys
import time
from os.path import join, dirname

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

is_windows = sys.platform.startswith('win')
test_root_dir = os.path.join(dirname(sys.argv[0]), "input")


def platform_dependent_symbols(status):
    if status == 'ok':
        return "ok" if is_windows else "✓"
    if status == 'fail':
        return "fail" if is_windows else "❌"


def find_truth_file(test_file, mode):
    truth_file = test_file.rsplit('.', 1)[0] + '.truth'
    truth_file_path = truth_file.split(r"/")
    truth_file = os.path.join(dirname(sys.argv[0]), 'reference', mode, *truth_file_path)
    if os.path.isfile(truth_file):
        return truth_file
    else:
        return None


def main():
    results = dict()
    start = time.time()

    for mode in ['ONESHOT', 'DEMAND']:
        results[mode] = dict(num_passed=0, num_failed=0, total_time=0.0)
        print(f'\n==========  {mode} ========== ')
        start_current = time.time()

        for d in test_dirs:
            print(f'\n ===== {d} ({mode}) =====')
            d = join(test_root_dir, d)

            for lang in langs:
                for test_file in glob.iglob(d + '/**/' + lang, recursive=True):
                    test_input_file = test_file[len(test_root_dir) + 1:]
                    truth_file = find_truth_file(test_input_file, mode)
                    if not truth_file:
                        continue

                    print(f'  {test_input_file}', end='')
                    precision, recall = precision_recall(test_file, truth_file, mode)
                    if precision == 100 and recall == 100:
                        print(f'\r  {test_input_file} {platform_dependent_symbols("ok")}')
                        results[mode]['num_passed'] += 1
                    else:
                        print(f'\rX {test_input_file} {platform_dependent_symbols("fail")}')
                        results[mode]['num_failed'] += 1

        end_current = time.time()
        results[mode]['total_time'] = end_current - start_current

    end = time.time()
    total_passed = 0
    total_failed = 0
    print("\n\n")
    for mode, stats in results.items():
        print(f"=== {mode} ===")
        print(f"  Passed: {stats['num_passed']}")
        print(f"  Failed: {stats['num_failed']}")
        print(f"  Execution time: {stats['total_time']} seconds")
        total_passed += stats['num_passed']
        total_failed += stats['num_failed']

    print(f"\nTotal passed: {total_passed}")
    print(f"Total failed: {total_failed}")
    print(f"Total time: {end - start} seconds")

    if total_failed > 0:
        exit(1)


if __name__ == '__main__':
    main()
