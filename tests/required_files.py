import re
from resolve_path import resolve_path

reg1 = re.compile("require\(\'(.*)\'\)");
reg2 = re.compile("import .* from \'(.*)\'");
reg3 = re.compile("import \'(.*)\'(?! from)");
reg4 = re.compile("export .* from \'(.*)\'");

def get_requires(path):
    try:
        f = path.open()
        text = f.read()
        f.close()
        matches1 = reg1.findall(text)
        matches2 = reg2.findall(text)
        matches3 = reg3.findall(text)
        matches4 = reg4.findall(text)

        lst1 = [m + '.js' for m in matches1]
        lst2 = [m + '.js' for m in matches2]
        lst3 = [m + '.js' for m in matches3]
        lst4 = [m + '.js' for m in matches4]

        lst = lst1 + lst2 + lst3 + lst4
        
        return lst
    except:
        return []

def collect_requires(path):
    read_files = []
    unread_files = [resolve_path(path, path.parent)]

    while unread_files:
        uf = unread_files.pop(0)

        if uf in read_files:
            continue

        read_files.append(uf.resolve())
        required_files = get_requires(uf)

        for rf in required_files:
            rp = resolve_path(rf, uf.parent)
            if rp and rp.exists():
                unread_files.append(rp.resolve())
    return read_files
