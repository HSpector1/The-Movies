#!/usr/bin/env python3
"""Expected pin moves for Save44 + projection 57, by grep. Reads the scratch tree's tests (never tests/fixtures,
which is a link), bridge/ and scripts/. Prints only."""
import glob, os, re, sys
TREE = sys.argv[1]
os.chdir(TREE)
files = sorted(set(glob.glob('tests/*.ts') + glob.glob('tests/helpers/*.ts') + glob.glob('tests/contracts/**/*.ts', recursive=True)
                   + glob.glob('tests/three-visual-regression/**/*.ts', recursive=True) + glob.glob('bridge/testing/*.ts') + glob.glob('scripts/*.ts')))
files = [f for f in files if not os.path.islink(f)]
CATEGORIES = [
    ('save-live-43', re.compile(r'LIVE_SAVE_VERSION\)\.toBe\(43\)|saveVersion[^\n]{0,60}\)\.toBe\(43\)|\.toBe\(43\)[^\n]*(?:live|save|Save)|1 through 43|equal\([^\n]*saveVersion[^\n]*43\)')),
    ('validateSaveV43-call', re.compile(r'validateSaveV43\(')),
    ('SaveFileV43-type', re.compile(r'\bSaveFileV43\b')),
    ('projection-56', re.compile(r'PROJECTION_VERSION\)\.toBe\(56\)|ProjectionVersion\)\.toBe\(56\)|snapshotVersion[^\n]{0,40}\b56\b|projection-56|projectionVersion[^\n]{0,20}\b56\b|PROJECTION_VERSION, 56|=== 56\b|toBe\(56\)')),
    ('schema-id-56', re.compile(r'349b2d3ec0614f2c|8414a793393e3e4c|4382f43ed550f9e6')),
    ('prior-schema-roster', re.compile(r'SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS|projection-v55')),
]
red = {'tests/p14b10-romance.test.ts', 'tests/p14b10-save-v44.test.ts', 'tests/p14b10-labels.test.ts', 'tests/p14b10-competitions-log.test.ts',
       'tests/bridge-p14b10-relationship-labels.test.ts'}
for name, pattern in CATEGORIES:
    hits = {}
    for f in files:
        if f in red:
            continue
        for n, line in enumerate(open(f, encoding='utf-8', errors='replace'), 1):
            if pattern.search(line):
                hits.setdefault(f, []).append(n)
    total = sum(len(v) for v in hits.values())
    print(f'## {name}: {total} lines in {len(hits)} files')
    for f, lines in hits.items():
        print(f'  {f}: {", ".join(map(str, lines))}')
# Staged edges lacking the slice B fields: files that write `sharedCompetitions:` in an edge literal but never `competitions:`.
print('## staged-edges-without-slice-B-fields')
for f in files:
    if f in red:
        continue
    text = open(f, encoding='utf-8', errors='replace').read()
    if re.search(r'sharedCompetitions\s*:', text) and not re.search(r'(?<!shared)\bcompetitions\s*:', text):
        devices = sorted(set(re.findall(r'\b(makeSave|live|stage|admitted|validateSaveV4\d|currentTier|currentCloseness|pairChemistry|tiersOnRoster|relationshipBlockFor|peopleProjection)\(', text)))
        print(f'  {f}: devices {", ".join(devices)}')
