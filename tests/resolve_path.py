from pathlib import Path

def resolve_path(path, current_loc):
    path = Path(path)
    parts = path.parts
    top = parts[0]

    return current_loc.joinpath(path)
