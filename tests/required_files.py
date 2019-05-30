import re
from pathlib import Path

reg1 = re.compile("require\\(\'(.*)\'\\)")
reg2 = re.compile("import .* from \'(.*)\'")
reg3 = re.compile("import \'(.*)\'(?! from)")
reg4 = re.compile("export .* from \'(.*)\'")


def match_to_path(match):
    if match.endswith('.js') or match.endswith('.ts') or match.endswith('.vue'):
        return match
    else:
        return match + '.js'


def get_requires(path):
    """ Returns list of imports in path """
    f = path.open()
    text = f.read()
    f.close()

    matches1 = reg1.findall(text)
    matches2 = reg2.findall(text)
    matches3 = reg3.findall(text)
    matches4 = reg4.findall(text)

    # lst1 = [m + '.js' for m in matches1]
    # lst2 = [m + '.js' for m in matches2]
    # lst3 = [m + '.js' for m in matches3]
    # lst4 = [m + '.js' for m in matches4]

    lst1 = [match_to_path(m) for m in matches1]
    lst2 = [match_to_path(m) for m in matches2]
    lst3 = [match_to_path(m) for m in matches3]
    lst4 = [match_to_path(m) for m in matches4]

    lst = lst1 + lst2 + lst3 + lst4

    return lst


def collect_requires(path):
    """ Recursively descends imports and returns all imported files """
    read_files = []
    unread_files = [path]

    while unread_files:
        uf = unread_files.pop(0)

        if uf in read_files:
            continue

        read_files.append(uf.resolve())
        required_files = get_requires(uf)

        for rf in required_files:
            rp = uf.parent.joinpath(rf)
            if rp and rp.exists():
                unread_files.append(rp.resolve())

    return read_files
