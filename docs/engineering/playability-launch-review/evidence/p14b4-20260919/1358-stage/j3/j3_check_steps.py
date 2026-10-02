"""1358-J3 check 1: each production step commit against its cumulative staged patch and the step-4 reference.
Read-only: git diff/rev-parse/ls-tree/show in the repo and the planner scratch repo; no writes."""
import hashlib, re, subprocess, sys
R = '/Users/zacheryspector/The-Movies-headless-program'
REF = '/Users/zacheryspector/studio-scratch/1358-n/tree'
E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
BASE = '65515b668c8e66750ec720e06f5e8c21a8fcd979'
STEPS = ['9eb1e66e', '8df1858e', '615adeb2', '83d1030d']
SHA = ['95d5a5d9', 'eaa026e2', '510c361b', '2004b500']

def git(repo, *a):
    return subprocess.run(['git', '-C', repo, *a], check=True, capture_output=True).stdout

def norm(diff):
    # drop index lines (abbreviation length differs between repositories)
    return b''.join(l for l in diff.splitlines(True) if not l.startswith(b'index '))

ok = True
prev = BASE
for k, c in enumerate(STEPS, 1):
    p = open(f'{R}/{E}/1358-stage/1358-rel-sliceB-production-step{k}-r2.patch', 'rb').read()
    sha = hashlib.sha256(p).hexdigest()
    cum = git(R, 'diff', BASE, c, '--', 'src', 'bridge', 'generated')
    same = norm(cum) == norm(p)
    allpaths = git(R, 'diff', '--name-only', prev, c).decode().split()
    outside = [x for x in allpaths if not re.match(r'^(src|bridge|generated)/', x)]
    full = git(R, 'diff', '--name-only', BASE, c).decode().split()
    print(f'step {k} {c}: patch sha256 {sha[:8]} (want {SHA[k-1]}) cumulative diff == patch: {same}; '
          f'increment files {len(allpaths)}; outside src/bridge/generated: {outside}; base..commit paths outside: '
          f'{[x for x in full if not re.match(r"^(src|bridge|generated)/", x)]}')
    ok &= same and sha.startswith(SHA[k-1]) and not outside
    prev = c

# final 13 files against tag step4 in the planner scratch repo
files = git(R, 'diff', '--name-only', BASE, STEPS[-1]).decode().split()
eq = 0
for f in files:
    a = git(R, 'rev-parse', f'{STEPS[-1]}:{f}').decode().strip()
    b = git(REF, 'rev-parse', f'step4:{f}').decode().strip()
    eq += a == b
    print(('equal ' if a == b else 'DIFF  ') + f + ' ' + a + ('' if a == b else ' vs ' + b))
print(f'{eq} of {len(files)} files blob-equal to step4')
for t in ['src', 'bridge', 'generated']:
    a = git(R, 'rev-parse', f'{STEPS[-1]}:{t}').decode().strip()
    b = git(REF, 'rev-parse', f'step4:{t}').decode().strip()
    base_ref = git(REF, 'rev-parse', f'base:{t}').decode().strip()
    base_repo = git(R, 'rev-parse', f'{BASE}:{t}').decode().strip()
    print(f'tree {t}: 83d1030d {a} step4 {b} equal {a == b}; base(65515b66) {base_repo} ref base {base_ref} equal {base_repo == base_ref}')
    ok &= a == b
print('ALL OK' if ok and eq == len(files) == 13 else 'NOT OK')
