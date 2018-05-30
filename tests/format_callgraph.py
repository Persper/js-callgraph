# Summary: Methods for converting the callgraph output
#          into truth file output

import re

# Regex for representing the call graph itself
call_func = r'\'(.*)\' \(([^@]*)@([0-9]*):[0-9]*-[0-9]*\)'
native = r'\'(.*)\' \(Native\)'

reg_func = re.compile(call_func + ' -> ' + call_func)
reg_native = re.compile(call_func + ' -> ' + native)

def format_func(out):
    """Convert function call to truth file format.

    >>> format_output("'global' (basic-class2.js@8:55-67) -> 'grow' (basic-class2.js@2:21-30)")
    'basic-class2.js:global:8 -> basic-class2.js:grow:2'
    """
    m = reg_func.match(out)

    fn_name1 = m.group(1)
    file1 = m.group(2)
    line1 = m.group(3)

    fn_name2 = m.group(4)
    file2 = m.group(5)
    line2 = m.group(6)

    return '{0}:{1}:{2} -> {3}:{4}:{5}'.format(file1, fn_name1, line1, file2, fn_name2, line2)

def format_native(out):
    """Convert native call to truth file format

    >>> format_output("'global' (require.js@3:98-159) -> 'console_log' (Native)")
    'require.js:global:3 -> Native'
    """
    m = reg_native.match(out)

    fn_name1 = m.group(1)
    file1 = m.group(2)
    line1 = m.group(3)

    native_name = m.group(4)

    return '{0}:{1}:{2} -> Native'.format(file1, fn_name1, line1)

def format_output(out):
    """Convert either a function call or a native call to truth file format

    >>> format_output("'global' (basic-class2.js@8:55-67) -> 'grow' (basic-class2.js@2:21-30)")
    'basic-class2.js:global:8 -> basic-class2.js:grow:2'
    >>> format_output("'global' (require.js@3:98-159) -> 'console_log' (Native)")
    'require.js:global:3 -> Native'
    """
    if reg_native.match(out):
        return format_native(out)
    else:
        return format_func(out)
