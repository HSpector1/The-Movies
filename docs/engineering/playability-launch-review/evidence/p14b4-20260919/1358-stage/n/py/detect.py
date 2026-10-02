#!/usr/bin/env python3
"""1358-N detectors. Reads the scratch tree checked out at tag `base` (HEAD 5245072a without tests/fixtures).
Writes /Users/zacheryspector/studio-scratch/1358-n/candidates.json: one entry per (file, line) with every detector tag.
Read-only on the repository; prints counts."""
import os, re, glob, json, collections
T = '/Users/zacheryspector/studio-scratch/1358-n/tree'
OUT = '/Users/zacheryspector/studio-scratch/1358-n/candidates.json'
os.chdir(T)
RED_ONLY = {'tests/p14b10-romance.test.ts', 'tests/p14b10-save-v44.test.ts', 'tests/p14b10-labels.test.ts',
            'tests/p14b10-competitions-log.test.ts', 'tests/bridge-p14b10-relationship-labels.test.ts'}
def scope():
    fs = set(glob.glob('tests/**/*.ts', recursive=True))
    fs |= {f for f in glob.glob('ui/src/**/*.ts*', recursive=True) if re.search(r'\.test\.tsx?$', f) or f.startswith('ui/src/test/')}
    fs |= set(glob.glob('bridge/testing/*.ts')) | set(glob.glob('scripts/**/*.ts', recursive=True)) | set(glob.glob('scripts/**/*.mts', recursive=True))
    return sorted(f for f in fs if not os.path.islink(f) and '/fixtures/' not in f and f not in RED_ONLY)
COMMENT = re.compile(r'^\s*(//|\*|/\*)')
D = {
 'v43': re.compile(r'validateSaveV43\b'),
 'lit43': re.compile(r'(?<![\w.:-])43(?![\d])'),
 'lit44': re.compile(r'(?<![\w.:-])44(?![\d])'),
 'through': re.compile(r'through 4[34]\b'),
 'chain': re.compile(r'convertV43ToV42\b'),
 'lift': re.compile(r'convertV42ToV43\('),
 'relroot': re.compile(r'validateRelationshipsRoot\('),
 'edge': re.compile(r'sharedCompetitions\b'),
 'sf43': re.compile(r'\bSaveFileV43\b|ReturnType<typeof validateSaveV43>'),
 's5helper': re.compile(r'withEmptyScreenplayShelving\(|withSharedCompetitions(Zero)?\('),
 'downgrade': re.compile(r'cannot downgrade|migrateToV(?:[1-3]\d|4[0-3])\(|makeSaveV\d+\('),
 'lit56': re.compile(r'(?<![\w.:-])56(?![\d])'),
 'proj': re.compile(r'projection-56|projection-v5[56]|PROJECTION_VERSION|SNAPSHOT_VERSION|snapshotVersion|projectionVersion|INCOMING_PROJECTION|ProjectionVersion'),
 'roster': re.compile(r'SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS'),
 'schemaid': re.compile(r'349b2d3ec0614f2c|8414a793|4382f43e|a0f316eb|11ec9999e052|f62253f540a1'),
 'rowkeys': re.compile(r"'tierLabel'\]|'sharedPictures', 'sign', 'tierLabel'"),
 'title': re.compile(r"""\b(it|test|describe)(\.each\([^)]*\))?\(\s*['"`]"""),
}
rows = {}
for f in scope():
    for n, line in enumerate(open(f, encoding='utf-8', errors='replace'), 1):
        if COMMENT.match(line): continue
        tags = [k for k, rx in D.items() if rx.search(line)]
        if not tags: continue
        # keep titles only when they name a moved number
        if tags == ['title']: continue
        if 'title' in tags and not re.search(r'(?<![\w.:-])(4[234]|5[56])(?![\d])|LIVE_SAVE_VERSION|1 through', line): tags.remove('title')
        if tags in (['lit43'], ['lit44'], ['lit56'], ['downgrade']):
            # bare numbers or downgrade calls without context are noise unless the line is save/projection related
            if not re.search(r'saveVersion|LIVE_SAVE|version|Version|toBe\(4[34]\)|toBe\(56\)|cannot downgrade|projection', line): continue
        rows[f'{f}:{n}'] = {'file': f, 'line': n, 'text': line.rstrip('\n'), 'tags': tags}
json.dump(rows, open(OUT, 'w'), indent=0)
c = collections.Counter(t for r in rows.values() for t in r['tags'])
print(len(rows), 'lines;', dict(c))
print(len({r['file'] for r in rows.values()}), 'files')
