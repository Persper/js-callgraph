import re
from resolve_path import resolve_path, root

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

def collect_requires(path):
    read_files = []
    unread_files = [resolve_path(path, root)]

    while unread_files:
        uf = unread_files.pop(0)

        if uf in read_files:
            continue

        read_files.append(uf.resolve())

        required_files = get_requires(uf)

        for rf in required_files:
            rp = resolve_path(rf, uf.parent)
            if rp:
                unread_files.append(rp.resolve())

    return read_files
