#!/usr/bin/env python3
"""1358-N classifier, pass 1: rule-based classes for detector hits; prints the residue that needs reading."""
import json, re, collections, sys
C = json.load(open('/Users/zacheryspector/studio-scratch/1358-n/candidates.json'))
SAVE43_TEST = 'tests/p14d1-rival-shelving-save-v43.test.ts'
def is_import(t): return bool(re.match(r'\s*import\b', t)) or bool(re.match(r'\s*[\w$]+(\s*,\s*(type\s+)?[\w$]+)*\s*,?\s*(\}\s*from\s*.*)?$', t)) and 'validateSave' in t and '(' not in t
res = {}
def put(k, cls, edit, status, why):
    res[k] = dict(C[k], cls=cls, edit=edit, status=status, why=why)
for k, r in C.items():
    f, n, t, tags = r['file'], r['line'], r['text'], r['tags']
    s = t.strip()
    # ---------- titles (P5) ----------
    if 'title' in tags:
        put(k, 'P5', 'rename the title to the moved number; record old -> new identity', 'certain', 'title names a moved number'); continue
    # ---------- S1 ----------
    if 'v43' in tags:
        if f == SAVE43_TEST:
            put(k, 'KEEP', 'none', 'certain', 'Save43 test: a V43 envelope or the V43 API itself'); continue
        if 'typeof' in t:
            put(k, 'KEEP', 'none', 'certain', 'existence check of the frozen V43 function'); continue
        if 'ReturnType<typeof validateSaveV43>' in t:
            put(k, 'S4', 'type the live envelope as ReturnType<typeof validateSaveV44>', 'certain', 'typed helper over live output'); continue
        if re.search(r"'validateSaveV43'", t):
            put(k, 'S1', "'validateSaveV43' -> 'validateSaveV44'", 'certain', 'live validator looked up by name'); continue
        if re.search(r'validateSaveV43\s*:\s*\(|validateSaveV43\(input: unknown\)', t):
            put(k, 'S1', 'rename the typed member to validateSaveV44', 'certain', 'typed live-validator member'); continue
        if re.match(r'\s*import\b', t) or ('(' not in t and re.search(r'validateSaveV43\s*,?', t)):
            put(k, 'S1', 'import validateSaveV44 in place of validateSaveV43', 'certain', 'import of the live validator'); continue
        if 'validateSaveV43(' in t:
            put(k, 'S1', 'validateSaveV43( -> validateSaveV44(', 'certain', 'live envelope'); continue
    if 'relroot' in tags and re.search(r',\s*42\)', t):
        put(k, 'S1', 'validateRelationshipsRoot(<live>, 42) -> (<live>, 44)', 'certain', 'engine-written live root; era 42 refuses the new keys'); continue
    res.setdefault(k, None)
resid = [k for k, v in res.items() if v is None]
print('classified', sum(1 for v in res.values() if v), 'residue', len(resid))
json.dump({k: v for k, v in res.items() if v}, open('/Users/zacheryspector/studio-scratch/1358-n/pass1.json', 'w'), indent=0)
by = collections.Counter(v['cls'] for v in res.values() if v)
print(dict(by))
