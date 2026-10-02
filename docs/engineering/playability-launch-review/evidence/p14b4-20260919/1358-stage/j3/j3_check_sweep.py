"""1358-J3 check 2: the sweep commit f458680b against the r4 patch and scratch branch sweep-r4. Read-only."""
import hashlib, re, subprocess
R = '/Users/zacheryspector/The-Movies-headless-program'
M = '/Users/zacheryspector/studio-scratch/1358-sweep/merge'
E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
P, C = '83d1030d', 'f458680b'

def git(repo, *a):
    return subprocess.run(['git', '-C', repo, *a], check=True, capture_output=True).stdout

def norm(d):
    return b''.join(l for l in d.splitlines(True) if not l.startswith(b'index '))

patch = open(f'{R}/{E}/1358-stage/sweep-r4/1358-sweep-r4.patch', 'rb').read()
print('r4 patch sha256', hashlib.sha256(patch).hexdigest())
pfiles = re.findall(rb'^diff --git a/(\S+) b/\S+$', patch, re.M)
pfiles = [f.decode() for f in pfiles]
cfiles = git(R, 'diff', '--name-only', P, C).decode().split()
print('patch files', len(pfiles), 'commit files', len(cfiles), 'same set', set(pfiles) == set(cfiles))
print('outside tests/ and ui/src/:', [f for f in cfiles if not (f.startswith('tests/') or f.startswith('ui/src/'))])
print('under tests/fixtures:', [f for f in cfiles if f.startswith('tests/fixtures/')])
print('new/deleted/mode lines in patch:', re.findall(rb'^(new file|deleted file|old mode|new mode|rename|similarity).*$', patch, re.M))
d = git(R, 'diff', P, C)
print('git diff 83d1030d f458680b == r4 patch (index lines dropped):', norm(d) == norm(patch))
num = git(R, 'diff', '--numstat', P, C).decode().split('\n')
ins = sum(int(l.split()[0]) for l in num if l.strip()); dele = sum(int(l.split()[1]) for l in num if l.strip())
print(f'numstat +{ins}/-{dele}')
neq = []
for f in cfiles:
    a = git(R, 'rev-parse', f'{C}:{f}').decode().strip()
    b = git(M, 'rev-parse', f'sweep-r4:{f}').decode().strip()
    if a != b: neq.append((f, a, b))
print('blobs differing from sweep-r4:', neq or 'none', f'({len(cfiles)} checked)')
# whole tests (fixtures excluded) and ui trees: f458680b against sweep-r4
def tree(repo, rev, top, skip=()):
    out = {}
    for line in git(repo, 'ls-tree', rev, top + '/').decode().splitlines():
        meta, path = line.split('\t', 1)
        mode, typ, oid = meta.split()
        if path in skip: continue
        if typ == 'tree':
            for l in git(repo, 'ls-tree', '-r', rev, path + '/').decode().splitlines():
                m2, p2 = l.split('\t', 1); out[p2] = m2.split()[2]
        else:
            out[path] = oid
    return out
for top, skip in (('tests', ('tests/fixtures',)), ('ui/src', ())):
    a = tree(R, C, top, skip); b = tree(M, 'sweep-r4', top, skip)
    diff = sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k))
    print(f'{top} (fixtures skipped): repo {len(a)} entries, sweep-r4 {len(b)}; differing: {diff or "none"}')
r3 = open(f'{R}/{E}/1358-stage/sweep-r3/1358-sweep-r3.patch', 'rb').read()
print('r3 patch sha256', hashlib.sha256(r3).hexdigest(), '== git diff step4 sweep-r3 -- tests ui:',
      norm(git(M, 'diff', 'step4', 'sweep-r3', '--', 'tests', 'ui')) == norm(r3))
print('r4 patch == git diff step4 sweep-r4 -- tests ui:', norm(git(M, 'diff', 'step4', 'sweep-r4', '--', 'tests', 'ui')) == norm(patch))
print('step4 tests/ui blobs equal 83d1030d for the 154 files:',
      all(git(R, 'rev-parse', f'{P}:{f}') == git(M, 'rev-parse', f'step4:{f}') for f in cfiles))
g = git(R, 'show', f'{C}:tests/bridge-contract-generator.test.ts').decode()
for n, l in enumerate(g.splitlines(), 1):
    if re.search(r'F1[012]_CURRENT', l) and ':' in l and "'" in l: print(f'f458680b bridge-contract-generator:{n}: {l.strip()}')
