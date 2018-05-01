#!/usr/bin/python3

from process import get_output
from pathlib import Path
import glob

s = str(Path("./vue-compiled/src/").resolve())

files = glob.glob("./vue-compiled/src/**/*.js.o", recursive=True)
files = [Path(f).resolve() for f in files]

d = {}

for f in files:
    d[f] = get_output(f)



for k, v in d.items():
    print(str(k)[len(s)+1:],':',len(v))
