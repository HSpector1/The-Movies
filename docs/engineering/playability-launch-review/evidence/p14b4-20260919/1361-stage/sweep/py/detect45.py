#!/usr/bin/env python3
"""1361-N detector: 1358-N's detect.py shifted one era (V44 for V43, 44/45 for 43/44). Reads HEAD's working tree
read-only; skips tests/fixtures, links and the P15 RED files. Writes candidates45.json in the scratchpad."""
import os, re, json, collections
R='/Users/zacheryspector/The-Movies-headless-program'
S='/private/tmp/claude-501/-Users-zacheryspector-Downloads-project-studio-p13-owner-direction-inputs-01/60db833c-4cf7-4685-b2ec-8aac42c6dac1/scratchpad'
P15_RED={'tests/p15a1-market-integration.test.ts','tests/p15a1-market-integration-atomicity.test.ts','tests/p15a1-market-integration-phases.test.ts',
 'tests/p15a2-power-ranking-archive.test.ts','tests/p15a2-power-ranking-archive-isolation.test.ts','tests/p15a2-power-ranking-archive-harness.test.ts',
 'tests/p15c2-campaign-legacy-integration.test.ts','tests/helpers/p15-roots.ts','tests/helpers/p15a1-market-route.ts',
 'tests/helpers/p15c2-legacy.ts','tests/helpers/p15c2-route-l.ts'}
def walk(top, keep):
    out=[]
    for dp, dns, fns in os.walk(os.path.join(R,top)):
        rel=os.path.relpath(dp,R)
        dns[:]=[d for d in dns if not (rel=='tests' and d=='fixtures') and d!='node_modules' and not os.path.islink(os.path.join(dp,d))]
        for fn in fns:
            p=os.path.join(dp,fn); rp=os.path.relpath(p,R)
            if os.path.islink(p) or not keep(rp): continue
            out.append(rp)
    return out
files=walk('tests', lambda f: f.endswith('.ts') and '/fixtures/' not in f)
files+=walk('ui/src', lambda f: re.search(r'\.test\.tsx?$', f) or f.startswith('ui/src/test/'))
files+=walk('bridge/testing', lambda f: f.endswith('.ts'))
files+=walk('scripts', lambda f: f.endswith('.ts') or f.endswith('.mts'))
files=sorted(f for f in set(files) if f not in P15_RED)
COMMENT=re.compile(r'^\s*(//|\*|/\*)')
D={
 'v44': re.compile(r'validateSaveV44\b'),
 'lit44': re.compile(r'(?<![\w.:-])44(?![\d])'),
 'lit45': re.compile(r'(?<![\w.:-])45(?![\d])'),
 'through': re.compile(r'through 4[45]\b'),
 'unknown': re.compile(r'unknown saveVersion'),
 'chain': re.compile(r'convertV44ToV43\b'),
 'lift': re.compile(r'convertV43ToV44\('),
 'sf44': re.compile(r'\bSaveFileV44\b|ReturnType<typeof validateSaveV44>|\bGameStateV44\b'),
 's5helper': re.compile(r'withEmptyCompetitionsAndRomance\(|withEmptyScreenplayShelving\('),
 'downgrade': re.compile(r'cannot downgrade|migrateToV(?:[1-3]\d|4[0-4]|[4-9])\(|makeSaveV\d+\('),
 'canon': re.compile(r'canonical V4[45]'),
 'live': re.compile(r'LIVE_SAVE_VERSION'),
 'title': re.compile(r"""\b(it|test|describe)(\.each\([^)]*\))?\(\s*['"`]"""),
}
rows={}
for f in files:
    for n, line in enumerate(open(os.path.join(R,f), encoding='utf-8', errors='replace'), 1):
        if COMMENT.match(line): continue
        tags=[k for k,rx in D.items() if rx.search(line)]
        if not tags: continue
        if tags==['title']: continue
        if 'title' in tags and not re.search(r'(?<![\w.:-])(4[345])(?![\d])|LIVE_SAVE_VERSION|1 through', line): tags.remove('title')
        if tags in (['lit44'],['lit45'],['downgrade'],['live']):
            if not re.search(r'saveVersion|LIVE_SAVE|version|Version|toBe\(4[45]\)|cannot downgrade', line): continue
        if not tags: continue
        rows[f'{f}:{n}']={'file':f,'line':n,'text':line.rstrip('\n'),'tags':tags}
json.dump(rows, open(S+'/candidates45.json','w'), indent=0)
c=collections.Counter(t for r in rows.values() for t in r['tags'])
print(len(files),'files scanned;',len(rows),'lines;',dict(c))
print(len({r['file'] for r in rows.values()}),'files with hits')
