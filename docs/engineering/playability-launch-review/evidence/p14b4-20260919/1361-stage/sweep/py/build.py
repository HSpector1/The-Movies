"""1361-N: build the classification JSON from M2's parsed rows, the raw-log frames, the type-gate text and the
detector census. Reads only; writes /Users/zacheryspector/studio-scratch/1361-sweep/1361-N-classification.json."""
import json, re, collections, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from msgs import *
from units import unit_of
from special import SPECIAL
from census import classify
SP = '/private/tmp/claude-501/-Users-zacheryspector-Downloads-project-studio-p13-owner-direction-inputs-01/60db833c-4cf7-4685-b2ec-8aac42c6dac1/scratchpad/'
E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
R = '/Users/zacheryspector/The-Movies-headless-program/'
OUT = '/Users/zacheryspector/studio-scratch/1361-sweep/1361-N-classification.json'
rows = json.load(open(SP + 'rows-frames.json'))
P15 = {'tests/p15a1-market-integration.test.ts', 'tests/p15a1-market-integration-atomicity.test.ts', 'tests/p15a1-market-integration-phases.test.ts'}
src_cache = {}
def src(path, line):
    if path not in src_cache: src_cache[path] = open(R + path, encoding='utf8').read().split('\n')
    return src_cache[path][line - 1]
def inner(r):
    for f in r['frames']:
        m = re.search(r'((?:tests|ui/src)/[^\s:()]+\.tsx?):(\d+):(\d+)', f)
        if m: return f'{m.group(1)}:{m.group(2)}'
    return None
def is_helper(path): return path.startswith('tests/helpers/') or path == 'tests/contracts/_v14Contract.ts'
def full_measured(r):
    msg = r['primary'] or ''
    fm = r.get('fullMsg') or ''
    rec = re.search(r'\+ Received: \n(.*)', fm)
    if rec and '…' in msg: msg = msg + ' [received in full: ' + rec.group(1).strip() + ']'
    return msg
decl = {}
for l in open(E + '1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv'):
    if l.strip():
        a = l.rstrip('\n').split('\t'); decl[('tests/' + a[0], ' '.join(a[1].split()))] = a[2]
HELPER_EXPECT = {
 'tests/helpers/p14c3-fixtures.ts:136': ('S2', "envelope38: toBe(44) -> toBe(45) at :136 (keep the label); the saveApi key 'validateSaveV44' -> 'validateSaveV45' at :66 moves with its four callers", 'makeSave writes 45; root38 then checks the lifecycle root'),
 'tests/helpers/p14c3-genuine-evidence-fixtures.ts:17': ('S2', 'acceptedEvidence: toBe(44) -> toBe(45) at :17; validateSaveV44 -> validateSaveV45 at :18 and the import :8', 'saved.saveVersion is 45 and validateSaveV45(saved) returns saved'),
 'tests/helpers/p14c3-second-episode-fixtures.ts:27': ('S2', 'accepted: toBe(44) -> toBe(45) at :27; validateSaveV44 -> validateSaveV45 at :28 and the import :8', 'save.saveVersion is 45 and validateSaveV45(save) returns save'),
 'tests/helpers/p14c3-history-boundary-fixtures.ts:26': ('S2', 'acceptBoundary: toBe(44) -> toBe(45) at :26; validateSaveV44 -> validateSaveV45 at :27 and the import :6', 'saved.saveVersion is 45 and validateSaveV45(saved) returns saved'),
 'tests/helpers/p14c2rm-fixtures.ts:24': ('S1', 'admitted(): validateSaveV44 -> validateSaveV45 at :24 and the import :6 (also clears TS2375 at (24,3) in all three gates)', E_S1),
 'tests/helpers/p14b2-fixtures.ts:122': ('S1', 'validateSaveV44 -> validateSaveV45 at :122, :244, :259 and the import :7', E_S1),
 'tests/helpers/p14c2c-fixtures.ts:29': ('S1', 'savedState(): validateSaveV44 -> validateSaveV45 at :29 and the import :8 (also clears TS2375 at (29,3) in all three gates)', E_S1),
 'tests/helpers/p14p3-fixtures.ts:112': ('S1', 'futureSave steps: the typed member validateSaveV44 (:78), its existence check (:89) and the call (:112) move to validateSaveV45; the chain at :113 gains convertV45ToV44 (S4, with its member :83 and check :94)', 'the futureSave validator admits the live envelope'),
}
out_rows = []
def add(r, cls, unit, edit, expected, measured, **kw):
    fr = r.get('frame')
    line = int(fr.rsplit(':', 2)[1]) if fr and fr.rsplit(':', 2)[0] == r['file'].split(' [')[0] else None
    d = {'identity': r['identity'], 'file': r['file'].split(' [')[0], 'line': line, 'class': cls, 'unit': unit, 'edit': edit, 'expected': expected, 'measured': measured}
    d.update(kw); out_rows.append(d)
counts = collections.Counter()
for r in rows:
    if r['status'] == 'SAME': continue
    if r['file'] in P15:
        tail = ' '.join(r['identity'][len(r['file']) + 3:].replace(' > ', ' ').split())
        add(r, 'RED-1355', 'none', 'none: a declared 1355 leaf that waits for P15A.1 (c) (1361-F5 ruling 2 and Amendment 1)',
            'fails with its declared message: ' + decl[(r['file'], tail)], full_measured(r), m2Status=r['status'], site=None, decision='certain',
            note='declared in 1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv; M2 message equals the declared one')
        continue
    site = inner(r); sfile, sline = site.rsplit(':', 1); sline = int(sline); text = src(sfile, sline)
    prim = r['primary'] or ''
    meas = full_measured(r)
    kw = dict(m2Status=r['status'], site=site)
    if r['status'] == 'CHANGED' and 'ENOENT' not in prim and site != 'tests/p14c3-save-v38.test.ts:105':
        # the seven retained rows that a helper pin now masks
        hk = site
        hx = HELPER_EXPECT.get(hk)
        add(r, 'S10', unit_of(sfile), (hx[1] if hx else 'H edit at ' + site) + '; no edit at the retained leaf',
            'fails again with its 1358-I primary: ' + (r['basePrimary'] or ''), meas, decision='measure', kind='retained',
            measuredSource=(SRC_LIVE45 if '45 to be 44' in prim else SRC_V44), note='retained 1358-I identity masked by a Save45 helper pin; the probe after H confirms the base primary returns', **kw)
        continue
    if site in SPECIAL:
        d = SPECIAL[site]
        cls = d['cls']
        add(r, cls, 'none' if cls in ('ENV',) else ('parent' if cls == 'X' else unit_of(sfile)), d['edit'], d['expected'], meas,
            decision=d['status'], kind=cls, note=d.get('note', ''), **kw)
        continue
    if site in HELPER_EXPECT:
        kind, edit, exp = HELPER_EXPECT[site]
        add(r, kind, 'H', edit, exp, meas, decision='certain', kind=kind, via='helper',
            measuredSource=(SRC_LIVE45 if kind == 'S2' else SRC_V44), note='shared helper pin; one edit clears every row behind it', **kw)
        continue
    if '45 to be 44' in prim and 'toBe(44)' in text:
        both = ' and validateSaveV44( -> validateSaveV45( on the same line (and the import)' if 'validateSaveV44' in text else ''
        add(r, 'S2', unit_of(sfile), f'toBe(44) -> toBe(45) at :{sline}' + both, E_S2, meas, decision='certain', kind='S2', measuredSource=SRC_LIVE45, note='', **kw)
        continue
    if prim.startswith('Error: validateSaveV44: expected version 44') and 'validateSaveV44(' in text:
        add(r, 'S1', unit_of(sfile), f'validateSaveV44( -> validateSaveV45( at :{sline} (and the import)', E_S1, meas, decision='certain', kind='S1', measuredSource=SRC_V44, note='', **kw)
        continue
    if 'to not throw an error but' in prim and 'validateSaveV44' in prim and 'validateSaveV44(' in text:
        add(r, 'S1', unit_of(sfile), f'validateSaveV44( -> validateSaveV45( under not.toThrow at :{sline} (and the import)', E_S1, meas, decision='certain', kind='S1', measuredSource=SRC_V44, note='', **kw)
        continue
    raise SystemExit('unclassified ' + site + ' ' + prim[:120])
# ---- UI rows ----
ui = json.load(open(E + '1361-stage/m2/m2-ui-vs1358I2.json'))
for r in ui['rows']:
    f = r['file']; fr = r['frame']; line = int(fr.rsplit(':', 2)[1]) if fr else None
    if 'StudioCalendar.career' in f:
        out_rows.append(dict(identity=r['identity'], file=f, line=line, unit='H', kind='S2', via='helper', **{'class': 'S2'},
            edit='none in the UI file: acceptedEvidence (tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18) moves to 45 and validateSaveV45',
            expected='the surface fixture route passes acceptedEvidence; the leaf reaches its own assertions', measured=r['primary'], m2Status='NEW',
            site='tests/helpers/p14c3-genuine-evidence-fixtures.ts:17', decision='certain', measuredSource=SRC_LIVE45,
            note='frames: acceptedEvidence :17, then tests/helpers/p14c3-surface-fixtures.ts:52, then StudioCalendar.career.test.tsx:29'))
    else:
        out_rows.append(dict(identity=r['identity'], file=f, line=line, unit='G3', kind='S2', **{'class': 'S2'},
            edit=f'toBe(44) -> toBe(45) at :{line}; the trailing comment may name the live writer', expected=E_S2 + '; the UI adapter writes LIVE_SAVE_VERSION (ui/src/engine/adapter.ts:3795)',
            measured=r['primary'], m2Status='NEW', site=f'{f}:{line}', decision='certain', measuredSource=SRC_LIVE45, note=''))
# ---- type-gate sites ----
tsc = open(E + '1361-stage/m2/m2-tsc.txt').read()
gates = {}
cur = None
for line in tsc.split('\n'):
    m = re.match(r'== (\S+)', line)
    if m: cur = {'tsconfig.json': 'root', 'ui/tsconfig.json': 'ui', 'tsconfig.bridge.json': 'bridge'}[m.group(1)]; continue
    m = re.match(r'((?:tests|ui)/[^(]+)\((\d+),(\d+)\): error (TS\d+): (.*)', line)
    if m:
        key = (m.group(1), int(m.group(2)), int(m.group(3)), m.group(4))
        gates.setdefault(key, {'gates': [], 'msg': m.group(5)})['gates'].append(cur)
TYPE_FIX = {  # (file, line) -> (cls, unit-file, edit)
 ('tests/helpers/p14c2c-fixtures.ts', 29): ('S1', 'validateSaveV44 -> validateSaveV45 at :29 (the return type follows)'),
 ('tests/helpers/p14c2rm-fixtures.ts', 24): ('S1', 'validateSaveV44 -> validateSaveV45 at :24'),
 ('tests/p14b1-first-take.test.ts', 301): ('S1', 'rename at :294 types roundTripped as SaveFileV45'),
 ('tests/p14b1-t4-regressions.test.ts', 168): ('S1', 'rename at :166'),
 ('tests/p14b3-reservations.test.ts', 96): ('S1', 'rename at :94'),
 ('tests/p14b4-material-evidence-core.test.ts', 147): ('S1', 'type EnvelopeV33 = ReturnType<typeof validateSaveV45> at :40; rename at :109'),
 ('tests/p14b4-material-evidence-core.test.ts', 293): ('S1', 'the alias at :40 (TS2322 clears)'),
 ('tests/p14b4-material-evidence-core.test.ts', 294): ('S1', 'the alias at :40'),
 ('tests/p14b4-material-evidence-core.test.ts', 364): ('S1', 'the alias at :40 and the rename at :362'),
 ('tests/p14b4-material-evidence-core.test.ts', 409): ('S1', 'the alias at :40'),
 ('tests/p14b4-material-evidence-core.test.ts', 439): ('S1', 'the alias at :40'),
 ('tests/p14c2a-save-and-settlement.test.ts', 347): ('S1', 'rename at :346'),
 ('tests/p14c4-save-v35.test.ts', 279): ('S1', 'renames at :277 and :278'),
 ('tests/p14p3-directing-promises.test.ts', 425): ('S6', 'type `invalid` as the frozen V40 state it is (`typeof bound40`, the convertV39ToV40 output of directorCapture40 at :113) instead of the live GameState; :424 already passes bound40 to the same builders and type-checks; runtime unchanged'),
 ('tests/p14p4p5-receipt-freeze.test.ts', 363): ('S1', 'rename at :361'),
 ('tests/bridge-p14b2-trust.test.ts', 470): ('S1', 'rename at :468'),
 ('tests/bridge-p14p3-directing-promises.test.ts', 378): ('S1', 'rename at :374'),
 ('tests/bridge-p14p4p5-opportunities.test.ts', 520): ('S1', 'rename at :518'),
 ('tests/bridge-p14p4p5-opportunities.test.ts', 525): ('S1', 'rename at :523'),
 ('tests/bridge-p14p4p5-opportunities.test.ts', 526): ('S1', 'rename at :524'),
}
type_rows = []
for (f, ln, col, code), v in sorted(gates.items()):
    if code in ('TS2345', 'TS2322') and 'SaveFileV45' in v['msg'] and (f, ln) not in TYPE_FIX:
        cls, edit = 'S4', f'insert convertV45ToV44 innermost at :{ln}, and add it to the import where the file imports by name; the chain then types'
    else:
        cls, edit = TYPE_FIX[(f, ln)]
    type_rows.append(dict(identity=f'tsc {"+".join(v["gates"])} {f}({ln},{col}) {code}', file=f, line=ln, **{'class': cls},
        unit=unit_of(f), kind='type', edit=edit, expected='no error in ' + ', '.join(v['gates']) + ' gate(s)', measured=f'{code}: ' + v['msg'],
        gates=v['gates'], m2Status='TYPE', site=f'{f}:{ln}', decision='certain', note=''))
# ---- census of edit sites from the detector ----
C = json.load(open(SP + 'candidates45.json'))
measured_sites = collections.Counter(r['site'] for r in out_rows if r.get('site'))
sites = []
for k, c in sorted(C.items(), key=lambda kv: (kv[1]['file'], kv[1]['line'])):
    cls, edit, st = classify(c)
    sites.append(dict(site=k, file=c['file'], line=c['line'], text=c['text'].strip()[:200], unit=('none' if cls == 'KEEP' else unit_of(c['file'])),
        edit=edit, status=st, measuredRows=measured_sites.get(k, 0), **{'class': cls}))
# extra census sites not caught by the detector but named by the classification
EXTRA = [
 ('tests/contracts/_v14Contract.ts', 377, 'S7', 'projectToV13State drops the four P15 roots under the file\'s emptiness precondition', 'measure'),
 ('tests/facility-move-demolish.test.ts', 869, 'S7', 'forgedV11 deletes the four P15 roots, each only while empty', 'certain'),
 ('tests/p13b-r07-save-v25.test.ts', 149, 'S7', 'asV25Envelope deletes the four P15 roots, each only while empty', 'certain'),
 ('tests/p14c2s-scientist-retirement.test.ts', 325, 'S7', 'the reader-only V34-V36 relabel deletes the four P15 roots', 'certain'),
 ('tests/p14b5-relationships.test.ts', 272, 'S10', 'bytes() guards and strips the four P15 roots; FROZEN.postTakeDigestStripped stays', 'measure'),
 ('tests/p14d1-rival-shelving.test.ts', 616, 'S5', 'withoutSliceB-style P15 strip on the candidate under guard (ruling)', 'ruling'),
 ('tests/p14p3-directing-promises.test.ts', 425, 'S6', 'type `invalid` as `typeof bound40` (the frozen V40 state) instead of the live GameState; runtime unchanged', 'certain'),
 ('tests/p14b1-t4-regressions.test.ts', 86, 'S8', 'bare .toThrow() after the rename: the message probe must show each case at its tampered field\'s guard; pin it otherwise', 'measure'),
 ('tests/p14c2rm-writer-continuation.test.ts', 379, 'S8', 'bare .toThrow() after the rename (1358-F12 rule 3 precedent: no edit when the probe shows each own guard)', 'measure'),
 ('tests/p14c3-save-v38.test.ts', 121, 'S8', 'bare .toThrow() through validate = saveApi(...) after the key rename (same rule)', 'measure'),
 ('tests/save.test.ts', 289, 'S3', 'pin the bare .toThrow() as /unknown saveVersion 46/ (1358-N S3 named this bare leaf; at Save45 the stamp 45 is valid and M2 measured no throw)', 'certain'),
 ('tests/bridge-process-restart.test.ts', 797, 'S2', 'toBe(44) -> toBe(45)', 'certain'),
 ('tests/bridge-process-restart.test.ts', 799, 'S2', 'toBe(44) -> toBe(45)', 'certain'),
]
have = {s['site'] for s in sites}
for f, ln, cls, edit, st in EXTRA:
    k = f'{f}:{ln}'
    if k in have:
        for s in sites:
            if s['site'] == k: s.update({'class': cls, 'edit': edit, 'status': st, 'unit': unit_of(f)})
        continue
    sites.append(dict(site=k, file=f, line=ln, text=src(f, ln).strip()[:200], unit=unit_of(f), edit=edit, status=st, measuredRows=measured_sites.get(k, 0), **{'class': cls}))
sites.sort(key=lambda s: (s['file'], s['line']))
# ---- counts ----
allrows = out_rows + type_rows
cnt_cls = collections.Counter(r['class'] for r in out_rows)
cnt_unit = collections.Counter(r['unit'] for r in out_rows)
core = [r for r in out_rows if not r['file'].startswith('ui/')]
uirows = [r for r in out_rows if r['file'].startswith('ui/')]
summary = dict(
  coreRows=len(core), uiRows=len(uirows), typeSites=len(type_rows),
  coreByClass=dict(collections.Counter(r['class'] for r in core)), uiByClass=dict(collections.Counter(r['class'] for r in uirows)),
  typeByClass=dict(collections.Counter(r['class'] for r in type_rows)),
  rowsByUnit=dict(collections.Counter(r['unit'] for r in out_rows)),
  coreRowsByUnit=dict(collections.Counter(r['unit'] for r in core)),
  typeSitesByUnit=dict(collections.Counter(r['unit'] for r in type_rows)),
  decisionByClass={c: dict(collections.Counter(r['decision'] for r in out_rows if r['class'] == c)) for c in sorted(cnt_cls)},
  censusByClass=dict(collections.Counter(s['class'] for s in sites)),
  censusEditSitesByUnit=dict(collections.Counter(s['unit'] for s in sites if s['class'] != 'KEEP')),
  censusStatus=dict(collections.Counter(s['status'] for s in sites)),
  m2Status=dict(collections.Counter(r['m2Status'] for r in out_rows)),
)
doc = dict(record='1361-N', title='Save45 pin sweep: classification of the 1361-M2 fallout',
  inputs=dict(m2core='1361-stage/m2/m2-core-vs1358I.json', m2ui='1361-stage/m2/m2-ui-vs1358I2.json', tsc='1361-stage/m2/m2-tsc.txt',
    rawCore='/Users/zacheryspector/studio-scratch/1361-m2/m2-core.txt (frames read with grep and sed)', declared1355='1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv',
    candidate='writer tree /Users/zacheryspector/studio-scratch/1361-prod/tree at p15c-c-r1', head='5a6378d1; its tests, ui/src, src and bridge tree ids equal those of a0e51c93, the tree M2 measured'),
  fields=dict(**{'class': 'the 1358-N class (S1 to S10, T for a title; RED-1355, ENV and X stay out of the sweep)'}, via='helper when the edit sits in a shared helper', identity='M2 identity, or tsc gate and site for a type row', file='test file (UI or core)', line='line of the first test-file frame; null when every frame is in a helper',
    unit='author unit', edit='what changes', expected='the value or message after the edit', measured='the M2 primary (full received text appended when M2 truncated it)',
    site='the innermost tests frame: the line that throws', decision='certain, measure (dry run decides) or ruling (parent)', kind="the row's kind: its class, or 'retained' for a retained 1358-I identity that a Save45 helper pin masks", gates='type rows only: the M2 gates that report the site', m2Status='NEW or CHANGED against 1358-I (UI rows against 1358-I2), or TYPE'),
  summary=summary, rows=allrows, sites=sites)
json.dump(doc, open(OUT, 'w'), indent=1, ensure_ascii=False)
print(json.dumps(summary, indent=1))
