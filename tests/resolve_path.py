from pathlib import Path

root = Path('./vue-compiled/src/').resolve()

def resolve_path(path, current_loc):
    path = Path(path)
    parts = path.parts
    top = parts[0]

    if top in ['compiler', 'core', 'shared', 'server', 'entries', 'sfc']:
        return root.joinpath(path)

    elif top in ['web', 'weex']:
        return root.joinpath('platforms').joinpath(path)

    else:
        return current_loc.joinpath(path)
