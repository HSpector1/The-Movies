"""1358-J3 check 3: recompute the p57 source manifest pins at eb1c2512 through `git show`, compare the input list with the
producer's inputPaths, and list which pinned inputs the landing commits changed. Read-only. The one input under
tests/fixtures is NOT read: its size comes from `git cat-file -s` and its sha256 from the producer's runtime check."""
import hashlib, json, re, subprocess
R = '/Users/zacheryspector/The-Movies-headless-program'
E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
MAN = f'{E}/1358-p57-declaration-source-manifest.json'

def git(*a):
    return subprocess.run(['git', '-C', R, *a], check=True, capture_output=True).stdout

body = git('show', f'eb1c2512:{MAN}')
print('manifest sha256 at eb1c2512', hashlib.sha256(body).hexdigest())
m = json.loads(body)
prod = git('show', f'eb1c2512:{E}/1358-p57-declaration-measurement.ts').decode()
paths = re.findall(r"'([^']+)'", re.search(r"const inputPaths = \[(.*?)\]\n", prod, re.S).group(1))
print('inputs', len(m['inputs']), 'producer inputPaths', len(paths), 'same order:', [i['path'] for i in m['inputs']] == paths)
out = json.loads(open(f'{R}/{E}/1358-p57-declaration.txt').read().split('\n\n')[-1])
bad = 0
for pin in m['inputs'] + [m['producer'], m['compilerConfig']]:
    p = pin['path']
    if p.startswith('tests/fixtures/'):
        size = int(git('cat-file', '-s', f'eb1c2512:{p}'))
        ok = size == pin['bytes'] and out['inputsSha256'][p] == pin['sha256']
        how = f'size {size} by cat-file -s; sha256 from producer inputsSha256 (not read)'
    else:
        b = git('show', f'eb1c2512:{p}')
        ok = len(b) == pin['bytes'] and hashlib.sha256(b).hexdigest() == pin['sha256']
        how = f'{len(b)} bytes, sha256 {hashlib.sha256(b).hexdigest()[:12]}'
        if p in out['inputsSha256']: ok &= out['inputsSha256'][p] == pin['sha256']
    bad += not ok
    print(('OK  ' if ok else 'BAD ') + p + ': ' + how)
print('producer output producerSha256 == manifest producer pin:', out['producerSha256'] == m['producer']['sha256'])
print('mismatches:', bad)
# which pinned inputs moved across the landing
revs = ['65515b66', '83d1030d', 'f458680b', 'eb1c2512', '282ad680', '5ac4b738', 'b60db650']
for p in [i['path'] for i in m['inputs']] + [m['producer']['path'], m['compilerConfig']['path']]:
    ids = [git('rev-parse', f'{r}:{p}').decode().strip()[:8] for r in revs]
    moves = [f'{revs[i-1]}->{revs[i]}' for i in range(1, len(revs)) if ids[i] != ids[i-1]]
    if moves: print('moved:', p, moves)
print('producer blob b17e8ac2 vs b60db650 vs disk:',
      git('rev-parse', f'b17e8ac2:{E}/1358-p57-declaration-measurement.ts').decode().strip()[:12],
      git('rev-parse', f'b60db650:{E}/1358-p57-declaration-measurement.ts').decode().strip()[:12],
      hashlib.sha256(open(f'{R}/{E}/1358-p57-declaration-measurement.ts', 'rb').read()).hexdigest()[:12])
