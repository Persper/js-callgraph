#!/usr/bin/python3

import sys
from pathlib import Path
import re
import subprocess
from resolve_path import resolve_path

assert len(sys.argv) > 2, "Incorrect number of arguments: process.py FILENAME ROOT_PATH <TEST_FILE>"

reg = re.compile("require\(\'(.*)\'\)")

def get_requires(path):
    try:
        f = path.open()
        text = f.read()
        f.close()
        matches = reg.findall(text)
        return [m + '.js.o' for m in matches]
    except:
        return []

read_files = []
unread_files = [resolve_path(sys.argv[1], root)]

while unread_files:
    uf = unread_files.pop(0)
    print(uf)

    if uf in read_files:
        continue

    read_files.append(uf.resolve())

    required_files = get_requires(uf)

    for rf in required_files:
        rp = resolve_path(rf, uf.parent)
        if rp:
            unread_files.append(rp.resolve())

strd_files = [str(rf) for rf in read_files]

node_program = '../src'

program = ['node', node_program, '--cg', *strd_files]
process = subprocess.run(program, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

out = process.stdout

lines = str(out)[2:].split('\\n')

# print(lines[:10])

reg2 = re.compile('.*\(' + read_files[0].name + '@.*\) ->.*')

filtered_out = [line for line in lines if reg2.match(line)]
# print(filtered_out)
# for f in filtered_out:
#     print(f)

reg_func = re.compile(r'.*\(([^1-9]*)@([0-9]*):[0-9]*-[0-9]*\) -> .* \'(.*)\' \(([^1-9]*)@([0-9]*):[0-9]*-[0-9]*\)')
reg_native = re.compile(r'.*\(([^1-9]*)@([0-9]*):[0-9]*-[0-9]*\) -> NativeVertex (.*)')

def format_func(out):
    m = reg_func.match(out)

    file1 = m.group(1)
    line1 = m.group(2)

    fn_name = m.group(3)

    file2 = m.group(4)
    line2 = m.group(5)

    return '{0}:{1} -> {3}:{2}:{4}'.format(file1, line1, fn_name, file2, line2)

def format_native(out):
    m = reg_native.match(out)

    file1 = m.group(1)
    line1 = m.group(2)

    native_name = m.group(3)

    return '{0}:{1} -> NativeVertex'.format(file1, line1)

def format_output(out):
    # print(out)
    if 'NativeVertex' in out:
        return format_native(out)
    else:
        return format_func(out)

fo = []

for f in filtered_out:
    fo.append(format_output(f))

if len(sys.argv) >= 4:
    f = open(sys.argv[3])

    lines = [line[:-1] for line in f]
    print(lines)
    print(fo)

    count1 = len([l for l in lines if l in fo])
    count2 = len([l for l in fo if l in lines])

    wo_native1 = [l for l in lines if 'Native' not in l and '_interopRequireDefault' not in l]
    wo_native2 = [l for l in fo if 'Native' not in l and '_interopRequireDefault' not in l]

    count3 = len([l for l in wo_native1 if l in wo_native2])
    count4 = len([l for l in wo_native2 if l in wo_native1])

    print(count1, len(fo))
    print(count2, len(lines))

    print(wo_native1)
    print(wo_native2)
    print(count3, len(wo_native2))
    print(count4, len(wo_native1))

for f in wo_native2:
    print(f)
