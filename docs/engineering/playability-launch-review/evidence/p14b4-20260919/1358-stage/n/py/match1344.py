#!/usr/bin/env python3
"""For each validateSaveV43 line at base, find whether the Save43 sweep (1344) classified the same text as a live S1 edit. Prints."""
import json, os, re, glob, collections
T='/Users/zacheryspector/studio-scratch/1358-n/tree'; os.chdir(T)
E='/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
rows=json.load(open(E+'/1344-stage/1344-save43-sweep-classification.json'))['rows']
by=collections.defaultdict(list)
for r in rows: by[r['file']].append(r)
norm=lambda s: re.sub(r'\s+','',s)
out=[]
fs=sorted(set(glob.glob('tests/**/*.ts',recursive=True)+glob.glob('ui/src/**/*.ts*',recursive=True)+glob.glob('bridge/testing/*.ts')+glob.glob('scripts/**/*.ts',recursive=True)))
stats=collections.Counter()
for f in fs:
    for n,line in enumerate(open(f,encoding='utf-8',errors='replace'),1):
        if 'validateSaveV43(' not in line and "'validateSaveV43'" not in line: continue
        if re.match(r'\s*(//|\*)',line): stats['comment']+=1; continue
        m=None
        for r in by.get(f,[]):
            nt=r.get('newText') or ''
            if nt and (norm(nt) in norm(line) or norm(line.strip()) in norm(nt)) and 'V43' in nt:
                m=r; break
        key='1344:'+m['class'] if m else 'nomatch'
        stats[key]+=1
        out.append((f,n,key,line.strip()[:150]))
for k,v in sorted(stats.items()): print(k,v)
with open('/Users/zacheryspector/studio-scratch/1358-n/v43-lines.txt','w') as w:
    for f,n,k,t in out: w.write(f'{f}:{n}\t{k}\t{t}\n')
