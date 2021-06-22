# Summary: Methods for collecting callgraph output
#          and formatting it into truth file output

import re
import subprocess

NODE_PROGRAM = 'js-callgraph'

# Regex representing call graph
call_func = r'\'(.*)\' \(([^@]*)@([0-9]*):[0-9]*-[0-9]*\)'
native = r'\'(.*)\' \(Native\)'

reg_func = re.compile(call_func + ' -> ' + call_func)
reg_native = re.compile(call_func + ' -> ' + native)


def callgraph(files, mode):
    """Returns raw standard output from callgraph generator"""
    program = ['node', NODE_PROGRAM, '--cg', *files, '--strategy', mode]
    cp = subprocess.run(program, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if cp.returncode != 0:
        print(cp.stderr.decode("utf-8"))

    return cp.stdout


def callgraph_formatted(files, keep='', natives=True, mode="DEMAND"):
    """Returns reformatted standard output from callgraph generator

    Arguments:
        files - list of files to run callgraph on
         keep - set to a filename if only that file's calls are desired
      natives - set to False to filter out native calls
    """
    stdout = callgraph(files, mode)
    lines = str(stdout)[2:-1].split('\\n')[:-1]

    formatted_lines = []
    for line in lines:
        # ignore exceptions caused by formatting js output other than call edges (for example, warnings)
        try:
            formatted_line = format_output(line)
        except Exception:
            continue
        formatted_lines.append(formatted_line)

    if keep:
        reg = re.compile(keep + r':.*:[0-9]+ ->.*')
        formatted_lines = [line for line in formatted_lines if reg.match(line)]

    if not natives:
        formatted_lines = [line for line in formatted_lines if 'Native' not in line]

    return formatted_lines


def format_func(out):
    """Convert function call to truth file format.

    >>> format_func("'global' (arrow.js@3:33-46) -> 'anon' (arrow.js@1:12-30)")
    'arrow.js:global:3 -> arrow.js:anon:1'
    """
    m = reg_func.match(out)

    fn_name1 = m.group(1)
    file1 = m.group(2)
    line1 = m.group(3)

    fn_name2 = m.group(4)
    file2 = m.group(5)
    line2 = m.group(6)

    output = '{0}:{1}:{2} -> {3}:{4}:{5}'

    return output.format(file1, fn_name1, line1, file2, fn_name2, line2)


def format_native(out):
    """Convert native call to truth file format

    >>> format_native("'global' (a.js@1:1-3) -> 'eval' (Native)")
    'a.js:global:1 -> Native'
    """
    m = reg_native.match(out)

    fn_name1 = m.group(1)
    file1 = m.group(2)
    line1 = m.group(3)

    native_name = m.group(4)

    output = '{0}:{1}:{2} -> Native'

    return output.format(file1, fn_name1, line1)


def format_output(out):
    """Convert either a function call or a native call to truth file format

    >>> format_output("'global' (arrow.js@3:3-16) -> 'anon' (arrow.js@1:12-30)")
    'arrow.js:global:3 -> arrow.js:anon:1'
    >>> format_output("'global' (a.js@1:1-3) -> 'eval' (Native)")
    'a.js:global:1 -> Native'
    """
    if reg_native.match(out):
        return format_native(out)
    else:
        return format_func(out)
