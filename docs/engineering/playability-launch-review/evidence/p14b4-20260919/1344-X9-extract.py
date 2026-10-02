"""usage: python3 x-extract.py <raw vitest output> <out>: the 'Failed Tests' section, one block per failure, blank
lines dropped, each block cut to its first 16 lines and each line to 240 characters, then the run summary."""
import re, sys
lines = open(sys.argv[1], encoding='utf-8', errors='replace').read().splitlines()
start = next(i for i, l in enumerate(lines) if re.search(r'⎯ Failed Tests \d+ ⎯', l))
out, block = [lines[start]], []
for l in lines[start + 1:]:
    if re.fullmatch(r'⎯+\[\d+/\d+\]⎯', l.strip()):
        out += [b[:240] for b in block if b.strip()][:16] + [l]
        block = []
    else:
        block.append(l)
tail = [l[:240] for l in block if re.match(r'\s+(Test Files|Tests|Start at|Duration)\b', l)]
open(sys.argv[2], 'x').write('\n'.join(out + tail) + '\n')
print(sum(1 for l in out if l.startswith(' FAIL ')), 'FAIL lines;', len(tail), 'summary lines')
