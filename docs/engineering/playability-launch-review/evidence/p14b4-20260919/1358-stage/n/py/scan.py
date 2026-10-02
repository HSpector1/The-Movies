#!/usr/bin/env python3
"""1358-N candidate scan. Reads the scratch tree at tag `base` (HEAD 5245072a, no fixtures). Prints counts only."""
import os, re, sys, glob, collections, json
T = '/Users/zacheryspector/studio-scratch/1358-n/tree'
os.chdir(T)
def files():
    out = set()
    for pat in ['tests/**/*.ts', 'ui/src/**/*.ts', 'ui/src/**/*.tsx', 'bridge/testing/*.ts', 'scripts/**/*.ts']:
        out.update(glob.glob(pat, recursive=True))
    return sorted(f for f in out if not os.path.islink(f) and '/fixtures/' not in f)
CATS = {
 'v43call': r'validateSaveV43\b',
 'v44call': r'validateSaveV44\b',
 'lit43': r'(?<![\d.])43(?![\d])',
 'lit44': r'(?<![\d.])44(?![\d])',
 'c43to42': r'convertV43ToV42\b',
 'c42to43': r'convertV42ToV43\b',
 'migrate43': r'migrateToV43\b',
 'sf43': r'\bSaveFileV43\b|\bGameStateV43\b',
 'through43': r'through 43',
 'proj56': r'(?<![\d.])56(?![\d])',
 'projv55': r'projection-v55|projection-v56|SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS',
 'schemaid': r'349b2d3e|8414a793|4382f43e|a0f316eb',
 'sharedComp': r'sharedCompetitions\s*:',
 'relroot42': r'validateRelationshipsRoot\([^)]*\b42\b',
 'shelvingHelper': r'withEmptyScreenplayShelving|withRivalTermination',
}
fs = files()
print('files', len(fs))
for name, pat in CATS.items():
    rx = re.compile(pat)
    hits = collections.Counter()
    for f in fs:
        for n, line in enumerate(open(f, encoding='utf-8', errors='replace'), 1):
            if rx.search(line): hits[f] += 1
    print(f'{name}: {sum(hits.values())} lines in {len(hits)} files')
