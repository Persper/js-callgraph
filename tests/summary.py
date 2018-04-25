#!/usr/bin/python3

from process import precision_recall
from os import listdir
from os.path import isfile, join

test_directories = ['basics', 'limits', 'unexpected']

for d in test_directories:
    print('='*5, d, '='*5)

    files = [f for f in listdir(d) if isfile(join(d, f))]
    test_files = [f[:-3] for f in files if f[-3:] == '.js']
    output_files = [f[:-6] for f in files if f[-6:] == '.truth']

    for tf in test_files:
        if tf in output_files:
            w_natives, wo_natives = precision_recall(d + '/' + tf + '.js', d + '/' + tf + '.truth')
            print(tf + '.js')
            print('\twith natives:', str(w_natives[0]) + '% precision,', str(w_natives[1]) + '% recall')
            print('\twith natives:', str(wo_natives[0]) + '% precision,', str(wo_natives[1]) + '% recall')
        else:
            print(tf + '.js', 'missing output file')

    print()
