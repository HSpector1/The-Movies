#!/usr/bin/env python3
"""1358-N census builder. Reads the scratch tree at tag `base` (repo HEAD 5245072a, no tests/fixtures; the
worktree must be checked out at `base`), the detector output candidates.json, 1358-E's pins.txt and the
1348-I baseline. Writes census.json and census.md under /Users/zacheryspector/studio-scratch/1358-n/.
Read-only on the repository. One row per (site, class): a line that needs two kinds of edit gets two rows."""
import json, re, os, collections, subprocess

S = '/Users/zacheryspector/studio-scratch/1358-n'
T = S + '/tree'
E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
os.chdir(T)
C = json.load(open(S + '/candidates.json'))
CORE_LIST = set(open('/Users/zacheryspector/studio-scratch/1358-m2/core-list.txt').read().split())
RETAINED = collections.Counter(r['file'] for r in json.load(open(E + '/1348-I-core-failures.json'))['rows'])
SAVE43_TEST = 'tests/p14d1-rival-shelving-save-v43.test.ts'

def text(f, n):
    return open(f, encoding='utf-8', errors='replace').read().split('\n')[n - 1]

# ── pins.txt (1358-E gen/pins.py) and 1358-J's list, for the `source` column ─────────────────────────────
PINS = collections.defaultdict(set)
cat = None
for line in open(E + '/1358-stage/prod-gen/pins.txt'):
    m = re.match(r'## (\S+)', line)
    if m:
        cat = m.group(1); continue
    m = re.match(r'\s+(\S+): ([\d, ]+)$', line)
    if m and cat:
        for n in m.group(2).split(','):
            PINS[(m.group(1), int(n))].add(cat)

J = {}  # (file, line) -> 1358-J item
def j(item, f, *lines):
    for n in lines: J[(f, n)] = item
j('J2', 'tests/p14b5-relationships.test.ts', 93, 220, 228)
j('J3a', 'ui/src/saves.test.tsx', 126); j('J3a', 'ui/src/session.test.tsx', 332, 360, 387)
j('J3a', 'ui/src/engine/d17-save-migration.test.ts', 131, 155); j('J3a', 'ui/src/engine/film-chronicle-adapter.test.ts', 289)
j('J3a', 'ui/src/lot/snapshot/v14SetHolderBoundary.test.ts', 46)
j('J3b', 'tests/d17a-adv-migration.test.ts', 274); j('J3b', 'tests/d17b-save-v7.test.ts', 163)
j('J3c', 'tests/helpers/p14c2b-fixtures.ts', 69); j('J3c', 'tests/helpers/p14c4-fixtures.ts', 71)
j('J3c', 'tests/helpers/p14c3-canonical-rival-fixtures.ts', 198); j('J3c', 'tests/helpers/p14p3-fixtures.ts', 110)
for f, n in [('tests/p14c3-dual-extensions.test.ts', 178), ('tests/p14c3-offmenu-extensions.test.ts', 235),
             ('tests/p14c3-profession-history.test.ts', 119), ('tests/p14c3-transitions.test.ts', 175),
             ('tests/p14c3-transitions.test.ts', 207), ('tests/p14c3-cohort-transition.test.ts', 287)]:
    j('J3d', f, n)
j('J3e', 'tests/p14c1-materialized-aging.test.ts', 175); j('J3e', 'tests/p14b9-save-v42.test.ts', 183)
j('J3e', 'tests/p14d1-rival-shelving.test.ts', 561); j('J3e', 'tests/bridge-p14b2-checkpoint.test.ts', 92)
j('J3f', 'tests/p14p4p5-post-capacity.test.ts', 347); j('J3f', 'tests/p14b5-relationships.test.ts', 582, 660)
j('J3g', 'tests/p14b5-t-failure-tuning.test.ts', 117, 123, 433, 489); j('J3g', 'tests/p14b5-relationships.test.ts', 1301)
j('J3h', 'tests/p14b4-material-evidence-core.test.ts', 40)
j('J3i', 'tests/p14c2rm-writer-continuation.test.ts', 218, 232, 241, 242, 254); j('J3i', 'tests/p12-starting-world.test.ts', 52)
j('J3j', 'tests/bridge-schema.test.ts', 341, 576); j('J3j', 'tests/bridge-p14b6-relationship-read-models.test.ts', 103)
j('J3j', 'tests/bridge-p14a1-release-busy-set.test.ts', 214)
j('J3k', 'tests/film-chronicle.test.ts', 923); j('J3k', 'tests/p14b1-save-v29.test.ts', 110)
j('J3k', 'tests/p14c3-queued-writing-proof.test.ts', 27)
for f, n in [('tests/p13b-s7-announcements.test.ts', 86), ('tests/p14b5-save-v31.test.ts', 195), ('tests/p14b9-save-v42.test.ts', 212),
             ('tests/p14d1-rival-shelving.test.ts', 186), (SAVE43_TEST, 45), ('tests/save.test.ts', 453),
             ('tests/p13b-s2-save-v22.test.ts', 211), ('tests/p13b-s3-save-v23.test.ts', 124), ('tests/p13b-s8-save-v27.test.ts', 211),
             ('tests/p14a1-save-v28.test.ts', 252), ('tests/p14b1-save-v29.test.ts', 202)]:
    j('J3k', f, n)
j('J3l', 'tests/bridge-contract-generator.test.ts', 724, 725)
j('J3m', 'tests/bridge-runtime-checkpoint.test.ts', 763, 782)
j('J1', 'tests/helpers/p14c3-genuine-evidence-fixtures.ts', 17, 18)

rows = []
def add(f, n, cls, edit, status, why, src_extra=None):
    t = text(f, n)
    src = []
    if (f, n) in PINS: src.append('pins.txt:' + '+'.join(sorted(PINS[(f, n)])))
    if (f, n) in J: src.append('1358-' + J[(f, n)])
    if src_extra: src.append(src_extra)
    if not src: src.append('scan')
    rows.append(dict(file=f, line=n, text=t.strip(), cls=cls, edit=edit, status=status, why=why, source=src))

done = set()  # (file, line) handled by a manual table before the rules run
def manual(f, n, cls, edit, status, why, src=None):
    done.add((f, n)); add(f, n, cls, edit, status, why, src)

# ════════════════════════════════════════════════════════════════════════════════════════════════════════
# Manual tables (read in context at base)
# ════════════════════════════════════════════════════════════════════════════════════════════════════════

# ── S1/S2: the helpers the whole suite inherits (acceptedEvidence first, 1358-F7/F8) ──
for f, imp, s2, s1 in [('tests/helpers/p14c3-genuine-evidence-fixtures.ts', 8, 17, 18),
                       ('tests/helpers/p14c3-history-boundary-fixtures.ts', 6, 26, 27),
                       ('tests/helpers/p14c3-second-episode-fixtures.ts', 8, 27, 28)]:
    manual(f, imp, 'S1', 'import validateSaveV44 in place of validateSaveV43', 'certain', 'helper import of the live validator')
    manual(f, s2, 'S2', 'toBe(43) -> toBe(44)', 'certain', 'makeSave(state) in the helper is the live writer (LIVE_SAVE_VERSION 44 at save.ts:6567, step 1)')
    manual(f, s1, 'S1', 'validateSaveV43(saved) -> validateSaveV44(saved)', 'certain', 'makeSave output; validateSaveV43 refuses with "expected version 43" (save.ts:10717)')
manual('tests/helpers/p14c3-fixtures.ts', 64, 'S1', 'rename the SaveAPI key validateSaveV43 -> validateSaveV44 (the 1309-X3 ruling 1 live-name key); every saveApi(\'validateSaveV43\') caller follows in the same unit', 'certain', 'the key names the live validator; 1344 renamed it 42 -> 43 (f8c48ec pattern)')
manual('tests/helpers/p14c3-fixtures.ts', 134, 'S2', 'toBe(43) -> toBe(44)', 'certain', 'envelope38() wraps save.makeSave(state): the live writer')

# ── S6: hand-built edges and the p14b5 local Edge type (1358-J item 2; F7 ruling 1) ──
EDGE_EDIT = 'add `competitions: []` and `romance: null` to the literal'
TYPE_EDIT = 'add `competitions` and `romance` to the local Edge type (typed from RelationshipEdge, so the strict Picks of step 3 accept it)'
manual('tests/p14b5-relationships.test.ts', 93, 'S6', TYPE_EDIT, 'certain', '1358-J finding 15: step 3 strict Picks (currentTier/currentCloseness/romanceStatus) reject the local Edge at ~20 sites, including the RED lines :1137 and :1147')
manual('tests/p14b5-relationships.test.ts', 220, 'S6', EDGE_EDIT + ' in mintedEdge()', 'certain', 'minted-edge oracles :582 and :660 compare engine edges, which carry both fields from step 1 (newEdge)')
manual('tests/p14b5-relationships.test.ts', 228, 'S6', EDGE_EDIT + ' in stagedEdge(); stage() then passes the Save44 validator', 'certain', 'stage() -> live() -> makeSave -> validateSaveV44 exact keys (relationships.ts EDGE_KEYS_V44)')
manual('tests/p14b5-relationships.test.ts', 582, 'S6', 'no edit: mintedEdge() carries the fields after the :220 edit', 'certain', 'whole-edge oracle under toEqual (1358-J 3f)')
manual('tests/p14b5-relationships.test.ts', 660, 'S6', 'no edit: mintedEdge() carries the fields after the :220 edit', 'certain', 'whole-edge oracle under toEqual (1358-J 3f)')
manual('tests/bridge-p14b5-relationships.test.ts', 227, 'S6', TYPE_EDIT, 'certain', 'the staged edge below goes through makeSave (validator-admitted staging)')
manual('tests/bridge-p14b5-relationships.test.ts', 493, 'S6', EDGE_EDIT, 'certain', 'makeSave({...relationships: [..., edge]}) -> validateSaveV44 exact keys')
manual('tests/bridge-p14b6-d2-withheld-employment-claim.test.ts', 70, 'S6', TYPE_EDIT, 'certain', 'admitted() runs makeSave on the staged root')
manual('tests/bridge-p14b6-d2-withheld-employment-claim.test.ts', 92, 'S6', EDGE_EDIT + ' in stagedEdge()', 'certain', 'admitted() -> makeSave -> validateSaveV44 exact keys')
manual('tests/bridge-p14b6-relationship-read-models.test.ts', 148, 'S6', TYPE_EDIT, 'certain', 'admitted() runs makeSave on the staged root')
manual('tests/bridge-p14b6-relationship-read-models.test.ts', 288, 'S6', EDGE_EDIT + ' in stageEdge()', 'certain', 'admitted() -> makeSave -> validateSaveV44 exact keys')
manual('tests/p14b10-conflict-evidence.test.ts', 110, 'S6', EDGE_EDIT + ' before `...extra` in stagedEdge()', 'certain', '1358-J finding 15: TS error at step 1 (the fields arrive only through Partial<RelationshipEdge>); live()/stage() then pass validateSaveV44')
manual('tests/p14p4p5-post-capacity.test.ts', 347, 'S6', 'add `competitions: [], romance: null` to the expected edge', 'certain', 'whole-edge oracle under toEqual on an engine edge (1358-J 3f)')
manual('tests/p14b5-t-failure-tuning.test.ts', 295, 'S6', 'add `romance: null` to the currentTier Pick literal', 'certain', 'step 3 strict Pick names romance (relationships.ts:236); 1358-J finding 15')
manual('tests/p14b5-t-failure-tuning.test.ts', 373, 'S6', 'add `romance: null` to the currentTier Pick literal', 'certain', 'step 3 strict Pick names romance (relationships.ts:236); 1358-J finding 15')

# ── S7: shape pins and reader-only relabels ──
manual('tests/p14c2s-scientist-retirement.test.ts', 300, 'S7', 'also delete `competitions` and `romance` from every edge in the reader-only V34-V36 relabel (beside sharedCompetitions)', 'certain', 'the frozen era-31 readers refuse the two new edge keys; same reader-only adjustment the 1327-C and 1344 sweeps made at :300 and :315')

# ── S5: hand-lifted "live" states that stop at V43 (1358-J 3e) ──
manual('tests/p14b9-save-v42.test.ts', 183, 'S5', 'lift through convertV43ToV44 as well: mods.convertV43ToV44(mods.convertV42ToV43(v42)).state; add the member to the mods type (:172-178)', 'certain', 'the state is greenlit and saved as live; at step 2 a contested pair with an existing edge throws "is not iterable" at relationships.ts:548 (1358-J finding 16)')
manual('tests/p14c1-materialized-aging.test.ts', 175, 'S5', 'append convertV43ToV44(...) to the V40 -> V43 lift so `live` is a Save44 envelope', 'certain', 'the lifted envelope is used as live; the chain stops at V43 and its edges lack the two fields')
manual('tests/p14d1-rival-shelving.test.ts', 561, 'S5', 'lift genuineV43 through convertV43ToV44 before the canonical comparison with the week-93 live state', 'measure', 'live edges at week 93 carry `competitions` and `romance`; the comparison holds only if the route wrote no log row or bond by week 93 (M2)')
manual('tests/bridge-p14b2-checkpoint.test.ts', 92, 'S2', 'saveVersion: 43 -> 44 in the expected export', 'certain', 'migrateToLive(...) of a genuine V29 slot; the source has `relationships: []`, so no S5 field is needed')

# ── S5: migration comparisons whose expectation is built from an old state that holds edges ──
S5_EDIT = 'apply the file\'s one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never literals) beside withSharedCompetitions'
for f, n in [('tests/p14p4p5-cross-owner.test.ts', 102), ('tests/bridge-p14c3-promise-digest-continuity.test.ts', 158),
             ('tests/p14p4p5-delayed-retirement.test.ts', 182), ('tests/bridge-p14p3-directing-promises.test.ts', 134),
             ('tests/bridge-p14p3-directing-promises.test.ts', 370), ('tests/p14p4p5-casting-reservation.test.ts', 204),
             ('tests/p14c3-save-v38.test.ts', 87), ('tests/p14p4p5-scenery-capacity.test.ts', 197),
             ('tests/bridge-p14c2rm-runtime.test.ts', 56), ('tests/bridge-p14r2r3-prior55.test.ts', 190),
             ('tests/bridge-p14c2s-scientist-runtime.test.ts', 136), ('tests/bridge-p14p4p5-opportunities.test.ts', 93),
             ('tests/bridge-p14p4p5-opportunities.test.ts', 511), ('tests/p14p3-directing-promises.test.ts', 402),
             ('tests/p14p4p5-queued-project-outcome.test.ts', 181), ('tests/p14p4p5-opportunities.test.ts', 370)]:
    manual(f, n, 'S5', S5_EDIT, 'measure', 'migrateToLive of a genuine V31-V41 input; convertV43ToV44 adds both fields to every edge (save.ts:10776-10781). The expectation already maps edges (withSharedCompetitions), so edges exist; M2 confirms which leaves fail')
for f, n, why in [('tests/bridge-p14b5-relationships.test.ts', 470, 'compares .hollywood only'),
                  ('tests/bridge-p14b4-runtime47-compatibility.test.ts', 257, 'compares .hollywood only'),
                  ('tests/p14c2rm-writer-continuation.test.ts', 265, 'compares .hollywood only'),
                  ('tests/p14b4-save-v30-compatibility.test.ts', 216, 'V30 input: the expectation states `relationships: []`'),
                  ('tests/p14b3-rule-revision.test.ts', 174, 'V29 input: the expectation states `relationships: []`; LIVE_SAVE_VERSION is dynamic'),
                  ('tests/p14bf2-acting-discipline.test.ts', 366, 'V29 input: the expectation states `relationships: []`; LIVE_SAVE_VERSION is dynamic')]:
    manual(f, n, 'KEEP', 'none', 'certain', 'S5 candidate that needs no edit: ' + why)

# ── S4: live-to-older chains (insert convertV44ToV43 first) and their imports / typed APIs ──
CHAIN_EDIT = 'insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>))'
chains = [
    ('tests/p14b9-save-v42.test.ts', 207, 'mods.convertV43ToV42(newSave): newSave = makeSave(greenlit)'),
    ('tests/p14c3-dual-extensions.test.ts', 178, 'saved is a live envelope'),
    ('tests/p06a-w1-release-authority.test.ts', 406, 'makeSave(ready)'),
    ('tests/p14c3-offmenu-extensions.test.ts', 235, 'saved is a live envelope'),
    ('tests/p14c2rm-writer-continuation.test.ts', 254, 'current = makeSave(f.finishing)'),
    ('tests/p14c3-profession-history.test.ts', 119, 'save.makeSave(f.state)'),
    ('tests/p14c3-transitions.test.ts', 175, 'envelope38(reopened) wraps makeSave'),
    ('tests/p14c3-transitions.test.ts', 207, 'envelope38(reopened) wraps makeSave'),
    ('tests/p14r3-save-v41.test.ts', 374, 'lawfulTerminatedSave() returns makeSave(restored)'),
    ('tests/save.test.ts', 370, 'makeSave(cancelled)'), ('tests/save.test.ts', 419, 'makeSave(cancelled)'),
    ('tests/p14c3-cohort-transition.test.ts', 287, 'control = makeSave(state)'),
    ('tests/p12-starting-world.test.ts', 52, 'makeSave(state) at founding'),
    ('tests/p14c3-promise-digest-continuity.test.ts', 279, 'current = migrateToLive(...)'),
    ('tests/p14p3-directing-promises.test.ts', 387, 'saves.makeSave(a.state)'),
    ('tests/p14p3-directing-promises.test.ts', 693, 'save is a live envelope'),
    ('tests/p14p4p5-screenplay-status.test.ts', 320, 'save is a live envelope'),
    ('tests/p14p4p5-opportunities.test.ts', 326, 'valid = JSON.parse(bytes(admittedGenre)): live bytes'),
    ('tests/p14p4p5-opportunities.test.ts', 374, 'current is the live migration'),
    ('tests/p14p4p5-opportunities.test.ts', 394, 'bad = clone(positive): live bytes'),
    ('tests/p14p4p5-opportunities.test.ts', 810, 'released is a live envelope'),
    ('tests/contracts/v14-boundary-guards.contract.test.ts', 63, 'makeSave(state)'),
    ('tests/helpers/p14c3-canonical-rival-fixtures.ts', 198, 'live = makeSave(...)'),
    ('tests/helpers/p14c4-fixtures.ts', 71, 'makeSave(state)'),
    ('tests/helpers/p14c2b-fixtures.ts', 69, 'makeSave(state)'),
    ('tests/helpers/p14p3-fixtures.ts', 110, 'steps.convertV43ToV42(input) inside the V39 projection helper fed live envelopes'),
]
NO_S9 = {
    ('tests/p14c3-promise-digest-continuity.test.ts', 279): 'no S9 risk: current migrates genuine bytes, so every log is empty and every romance null, and the round trip stays byte-equal',
    ('tests/p14p4p5-opportunities.test.ts', 374): 'no S9 risk: current migrates genuine bytes, so every log is empty and every romance null, and the round trip stays byte-equal',
    ('tests/p14p4p5-opportunities.test.ts', 394): 'no S9 risk: validateSaveV44 inside convertV44ToV43 refuses each mutation before the log or romance guard, and the pattern names the field',
    ('tests/helpers/p14c3-canonical-rival-fixtures.ts', 198): 'no S9 or S10 risk: the state sits at tick 0 with no edge (:200), so the V38 projection keeps CANONICAL_INITIAL_SHA',
}
for f, n, why in chains:
    extra = ('; ' + NO_S9[(f, n)]) if (f, n) in NO_S9 else ''
    manual(f, n, 'S4', CHAIN_EDIT, 'certain', why + '; convertV43ToV42 now refuses a 44 envelope with "validateSaveV43: expected version 43"' + extra)
for f, n in [('tests/p14c3-dual-extensions.test.ts', 8), ('tests/p06a-w1-release-authority.test.ts', 32), ('tests/p14c3-offmenu-extensions.test.ts', 10),
             ('tests/p14c2rm-writer-continuation.test.ts', 12), ('tests/p14c3-transitions.test.ts', 8), ('tests/p14r3-save-v41.test.ts', 122),
             ('tests/save.test.ts', 35), ('tests/p14c3-cohort-transition.test.ts', 9), ('tests/p12-starting-world.test.ts', 2),
             ('tests/p14c3-promise-digest-continuity.test.ts', 14), ('tests/contracts/v14-boundary-guards.contract.test.ts', 34),
             ('tests/helpers/p14c3-canonical-rival-fixtures.ts', 8), ('tests/helpers/p14c4-fixtures.ts', 12), ('tests/helpers/p14c2b-fixtures.ts', 23)]:
    manual(f, n, 'S4', 'add convertV44ToV43 to the import', 'certain', 'import for the inserted step')
manual('tests/p14b9-save-v42.test.ts', 176, 'S4', 'add convertV44ToV43 (and convertV43ToV44 for :183) to the mods type', 'certain', 'typed dynamic API')
manual('tests/p14p4p5-opportunities.test.ts', 37, 'S4', 'add `convertV44ToV43(input: unknown): unknown` to the api type', 'certain', 'typed dynamic API used by the chains at :326, :374, :394')
manual('tests/helpers/p14p3-fixtures.ts', 82, 'S4', 'add `convertV44ToV43: (input: unknown) => unknown` to the steps type', 'certain', 'typed dynamic API')
manual('tests/helpers/p14p3-fixtures.ts', 92, 'S4', "add an existence assertion for steps.convertV44ToV43 beside this one", 'certain', 'the helper asserts each step it calls')
for f, n, why in [('tests/p14d1-rival-shelving.test.ts', 191, 'existence check of the frozen V43 step'),
                  ('tests/p14p4p5-opportunities.test.ts', 84, 'existence check of the V43 -> V42 step, still public'),
                  (SAVE43_TEST, 37, 'Save43 test: the V43 API'), (SAVE43_TEST, 49, 'Save43 test: existence'),
                  (SAVE43_TEST, 223, 'Save43 test: a V43 envelope'), (SAVE43_TEST, 235, 'Save43 test: a V43 envelope'),
                  (SAVE43_TEST, 251, 'Save43 test: a V43 envelope'), (SAVE43_TEST, 263, 'Save43 test: a V43 envelope')]:
    manual(f, n, 'KEEP', 'none', 'certain', why)

# ── S4: typed helpers over live output ──
manual('tests/p14b4-material-evidence-core.test.ts', 40, 'S4', 'type EnvelopeV33 = ReturnType<typeof validateSaveV44> (or LiveSaveFile)', 'certain', '1358-J finding 15: :293 assigns migrateToLive\'s SaveFileV44 to it (root type gate, step 1)')
manual('tests/p14b9-save-v42.test.ts', 71, 'S1', 'add SaveFileV44 to the type import for the renamed member at :175 (SaveFileV43 stays for :174)', 'certain', '1358-J finding 15 calls this line a false positive for the step-3 type gate; it still moves with :175')
manual('tests/p14b9-save-v42.test.ts', 174, 'KEEP', 'none', 'certain', 'convertV42ToV43 signature; 1358-J finding 15 false positive')

# ── S9: first-guard masking by convertV44ToV43, exact-message leaves on live saves (measure) ──
S9_EDIT = 'after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log|romance of <edgeId>"), add the 1344-N S9 masking comment naming the test that still covers the older guard'
for f, n, why in [
    ('tests/p14c3-dual-extensions.test.ts', 178, 'expects the V43 shelving guard; a log row or a romance track on the long route would refuse first'),
    ('tests/p14c3-offmenu-extensions.test.ts', 235, 'expects the V43 shelving guard'),
    ('tests/p14c3-profession-history.test.ts', 119, 'expects the V43 shelving guard'),
    ('tests/p14c3-transitions.test.ts', 175, 'expects the V43 shelving-count guard'),
    ('tests/p14c3-transitions.test.ts', 207, 'expects the V37 profession-transition guard'),
    ('tests/p14c3-cohort-transition.test.ts', 287, 'expects the V43 shelving guard'),
    ('tests/p14b9-save-v42.test.ts', 207, 'bare .toThrow() whose title names convertV42ToV41; the greenlit cast writes log rows from step 2, so convertV44ToV43 refuses first'),
    ('tests/p14c2rm-writer-continuation.test.ts', 254, 'bare .toThrow() (1358-J finding 17): pin the measured first guard'),
    ('tests/p12-starting-world.test.ts', 52, '/cannot downgrade/ would match the Save44 refusal (finding 17); founding state holds no edge, so tighten to the makeSaveV18 guard the leaf names'),
    ('tests/p14r3-save-v41.test.ts', 374, 'expects /termination/i from convertV41ToV40'),
    ('tests/p14p4p5-screenplay-status.test.ts', 324, 'exact V39 guard message after the :320 chain'),
    ('tests/p14p4p5-opportunities.test.ts', 810, 'expects the V39 opportunity-predicate guard'),
    ('tests/p14b5-relationships.test.ts', 1394, 'migrateToV30(admitted) expects the V43 rejection-count guard; admitted is a live takeWorld() save'),
    ('tests/p14b5-relationships.test.ts', 1411, 'migrateToV29..V26(admitted) expect the same guard'),
    ('tests/p14b5-relationships.test.ts', 1426, 'migrateToV25(admitted) expects the same guard'),
    ('tests/p14b5-relationships.test.ts', 1447, 'migrateToV30(empty): empty has no edges, so convertV44ToV43 cannot refuse it; expected unchanged'),
    ('tests/p06a-w1-release-authority.test.ts', 447, 'migrateToV15(live) expects the V39 subject guard'),
    ('tests/p13b-s3-save-v23.test.ts', 115, 'migrateToV22(live) expects the V39 subject guard'),
    ('tests/p13b-s3-save-v23.test.ts', 116, 'migrateToV21(live) expects the V39 subject guard'),
    ('tests/p13b-s3-save-v23.test.ts', 117, 'migrateToV20(live) expects the V39 subject guard'),
    ('tests/p08a-w0-studio-history.test.ts', 398, 'migrateToV16(live) expects the V18 guard; low risk on a short route'),
    ('tests/p08a-w0-studio-history.test.ts', 399, 'migrateToV15(live) expects the V18 guard; low risk on a short route'),
    ('tests/p14p3-directing-promises.test.ts', 689, 'futureSave().convertV39ToV38(save) expects /director|predicate|promise/i; the helper chain (p14p3-fixtures:110) gains convertV44ToV43, and P3 routes run casting contests, which write log rows from step 2'),
]:
    add(f, n, 'S9', S9_EDIT if n != 1447 else 'none expected (no edge, no log, no romance); confirm in M2', 'measure', why)
S9_CHAIN_EDIT = 'none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report for a ruling (an input without a log row or track, or a recorded reduction)'
for f, n, why in [
    ('tests/p06a-w1-release-authority.test.ts', 406, 'projects a founded, release-ready world to V37 for makeSaveV15; one picture makes a Friends-tier track unlikely, but a contested casting writes a log row'),
    ('tests/save.test.ts', 370, 'projects a cancelled managed picture to V37; short route'),
    ('tests/save.test.ts', 419, 'projects a cancelled managed picture to V37; short route'),
    ('tests/p14p3-directing-promises.test.ts', 387, 'projects a P3 live state to V40 for the frozen builders; P3 routes run casting contests'),
    ('tests/p14p3-directing-promises.test.ts', 693, 'projects a P3 live state to V40 for the frozen builders; P3 routes run casting contests'),
    ('tests/p14p4p5-opportunities.test.ts', 326, 'projects admittedGenre to V40; the V39 refusal at :327 needs this chain to succeed'),
    ('tests/contracts/v14-boundary-guards.contract.test.ts', 63, 'historicalWorkflowCarrier projects a managed in-flight picture to V37'),
    ('tests/helpers/p14c2b-fixtures.ts', 69, 'liveEnvelopeV36 projects each caller\'s live state to V36 (five importers); the callers\' routes decide the risk'),
    ('tests/helpers/p14c4-fixtures.ts', 71, 'liveEnvelope projects each caller\'s live state to V35 (two importers); the callers\' routes decide the risk'),
]:
    add(f, n, 'S9', S9_CHAIN_EDIT, 'measure', why)

# ── S8: refusal messages masked by validateSaveV44, and the vacuous passes of 1358-J finding 17 ──
for n in (218, 232, 241, 242):
    add('tests/p14c2rm-writer-continuation.test.ts', n, 'S8', 'after the S1 rename, pin the refusal the live validator gives for the tamper (measured, cited by source line) in place of the bare .toThrow()', 'measure',
        '1358-J finding 17: envelope() stamps LIVE_SAVE_VERSION (:37), so at Save44 every bare .toThrow() on validateSaveV43 passes on "expected version 43" alone')
add('tests/p14b5-relationships.test.ts', 1297, 'S8', 'none expected: the family-10 patterns name the tampered field; confirm each refusal still matches at era 44 (validateSaveV44 checks the root at save.ts:10768, before the V43 chain)', 'measure',
    'relationship tampers now meet validateRelationshipsRoot(raw, 44); messages carry the validateSaveV44: prefix (relationships.ts fail())')

# ── S10: natural-chain values and bytes (re-derived from the step-4 routes, never copied) ──
for f, n, why in [
    ('tests/bridge-p14b5-relationships.test.ts', 540, 'retained 1348-I row (ledger length 48 vs 41/43): its primary embeds a count Save44 may move'),
    ('tests/bridge-p14b5-relationships.test.ts', 560, 'retained 1348-I rows (two digests): each primary embeds a digest Save44 may move (+33 bytes per edge)'),
    ('tests/p14b4-rival-seating-preference.test.ts', 498, 'retained 1348-I row (seed-b digest): its primary embeds a digest'),
    ('tests/p13a-scientist-foundation.test.ts', 32, 'retained 1348-I rows (three digests)'),
    ('tests/p14c3-save-v38.test.ts', 100, 'retained 1348-I C20 row: its primary embeds the live version, so it reads 44 after the sweep (the 1344 C20 precedent)'),
]:
    add(f, n, 'S10', 'no edit: retained identity; attribute the CHANGED primary in the gate compare', 'measure', why)
add('tests/p14b5-relationships.test.ts', 236, 'S10', 'none expected: bytes() strips the whole relationships root before the frozen postTakeDigestStripped pin', 'measure', 'confirm in M2 that the frozen digest holds')

# ── P2: schema identity, roster lists, sizes and digests ──
NEW_ID = 'sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253'
OUT56 = 'sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1'
manual('tests/bridge-contract-generator.test.ts', 569, 'P2', f'schema identity 349b2d3e… -> {NEW_ID} (the step-4 manifest schemaId; confirm with generate:bridge-contract --check)', 'certain', 'pins the current schema identity')
manual('tests/bridge-contract-generator.test.ts', 572, 'P2', f'schemaIdentity(schema) 349b2d3e… -> {NEW_ID}', 'certain', 'pins the current schema identity')
manual('tests/bridge-p14b5-relationships.test.ts', 381, 'P2', f'SCHEMA_ID 349b2d3e… -> {NEW_ID}', 'certain', 'pins the current schema identity (1358-E)')
for f, n in [('tests/bridge-p14b5-relationships.test.ts', 384), ('tests/bridge-p14b5-relationships.test.ts', 433),
             ('tests/bridge-p14b4-runtime47-compatibility.test.ts', 211), ('tests/bridge-p14b6-relationship-read-models.test.ts', 791)]:
    manual(f, n, 'P2', f'append the outgoing56 id {OUT56[:23]}… (a named OUTGOING_56 constant) to the full prior-roster key list', 'certain', 'step 4 registers projection-v56 (runtime-checkpoint.ts:64)')
manual('tests/bridge-runtime-checkpoint.test.ts', 977, 'P2', f"insert '{OUT56}' in sorted position (after 2c377b6f…) with its provenance comment", 'certain', 'exact prior-roster key list')
manual('tests/bridge-p14b8-waiver-surface.test.ts', 788, 'P2', 'roster size toBe(44) -> toBe(45)', 'certain', 'step 4 adds one prior identity')
manual('tests/bridge-p14b6-relationship-read-models.test.ts', 794, 'P2', 'roster size toBe(44) -> toBe(45)', 'certain', 'step 4 adds one prior identity')
manual('tests/bridge-p14r2r3-prior55.test.ts', 171, 'P2', 'older roster length toHaveLength(43) -> 44', 'certain', 'older = roster minus projection-v55; step 4 adds projection-v56')
manual('tests/bridge-p14r2r3-prior55.test.ts', 172, 'P2', "older roster digest 11ec9999… -> d25c64254ac090a8470cc43b2f02740e149b6f29f75966ba4d2d1684b26654a6 (recomputed from the step-4 map by py/roster.py, which reproduces the base pin; the author recomputes it the same way)", 'certain', 'canonicalJson of the sorted older roster')
manual('tests/bridge-p14p4p5-opportunities.test.ts', 503, 'P2', 'older roster length toHaveLength(43) -> 44', 'certain', 'older = roster minus projection-v54')
manual('tests/bridge-p14p4p5-opportunities.test.ts', 504, 'P2', "older roster digest f62253f5… -> afae82e478438adcd177592fca60fc283c0e73bdc5eefc1101a8115de28cce58 (py/roster.py; reproduces the base pin)", 'certain', 'canonicalJson of the sorted older roster')
manual('tests/bridge-runtime-checkpoint.test.ts', 763, 'P2', 'no edit: the it.each gains a projection-v56 case, a new test identity', 'certain', '1358-J 3m; record the identity')

# ── P3: row key lists ──
manual('tests/bridge-p14b6-relationship-read-models.test.ts', 402, 'P3', "['counterpartId', 'counterpartName', 'drivers', 'labels', 'romance', 'sharedPictures', 'sign', 'tierLabel']", 'certain', 'step 4 adds labels and romance to StudioRelationshipRow (bridge-schema.ts:2812, :2814)')

# ── P4: the generator test's whole-schema declaration bodies ──
manual('tests/bridge-contract-generator.test.ts', 724, 'P4', 'F10 a0f316eb… -> the value of a recorded producer run on the step-4 source (cross-check 1dadf88fb7230405a6232fff3a37e3aee9014718200dfdb8baf4ff385ab71fa4, 420,340 bytes); update the provenance comment at :716-722', 'certain', 'renders the whole current schema; F12 (:726) must not move')
manual('tests/bridge-contract-generator.test.ts', 725, 'P4', 'F11: same value and provenance as F10', 'certain', 'renders the whole current schema')
manual('tests/bridge-contract-generator.test.ts', 726, 'KEEP', 'none: F12 is the frozen P05 subset', 'certain', '1358-J finding 10')

# ── P1 specials ──
manual('tests/bridge-p14b6-relationship-read-models.test.ts', 103, 'P1', 'INCOMING_PROJECTION = 56 -> 57 (read at :777, :782, :802, :803)', 'certain', '1358-J 3j')
manual('tests/bridge-contract-generator.test.ts', 567, 'P1', 'generateCsharpContract({..., projectionVersion: 56}) -> 57', 'certain', 'the current-contract render beside the identity pins')
manual('tests/bridge-schema.test.ts', 341, 'P1', '/expected literal 56/ -> /expected literal 57/', 'certain', '1358-J 3j')
manual('tests/bridge-schema.test.ts', 576, 'P1', "'public const int ProjectionVersion = 56;' -> 57", 'certain', '1358-J 3j')

# ── pins.txt false positives ──
for f, n, why in [('tests/d17a-adv-cliff.test.ts', 192, 'releaseTick 56, not a projection'),
                  ('tests/p15a2-power-ranking.test.ts', 365, 'a Power Ranking score of 56'),
                  ('tests/p15a2-power-ranking.test.ts', 416, 'a Power Ranking score of 56'),
                  ('tests/p15a2-power-ranking.test.ts', 421, 'a Power Ranking score of 56'),
                  ('tests/p14b9-casting-competition.test.ts', 339, '1358-J finding 15: edgeOf returns a state RelationshipEdge')]:
    manual(f, n, 'KEEP', 'none', 'certain', 'pins.txt false positive: ' + why)

# ── P5: titles that name a moved number (one new identity each) ──
TITLES = {
    'tests/p14b9-save-v42.test.ts:212': "'LIVE_SAVE_VERSION is 44'",
    'tests/p14b9-save-v42.test.ts:216': "'... unknown-version message (\"1 through 44\")'",
    'tests/p13b-r07-save-v25.test.ts:273': "'an unknown saveVersion 45 is refused, naming the handled range \"1 through 44 only\" (...)'",
    'tests/bridge-p14a1-release-busy-set.test.ts:214': "'schema leaf: PROJECTION_VERSION is 57, ...'",
    'tests/p14d1-rival-shelving.test.ts:186': "'save.ts LIVE_SAVE_VERSION is 44, and validateSaveV43/convertV42ToV43/convertV43ToV42 exist'",
    'tests/p13b-s8-save-v27.test.ts:211': "'an unknown saveVersion 45 is refused, naming the handled range \"1 through 44 only\" (...)'",
    'tests/p13b-s6-save-v26.test.ts:221': "'an unknown saveVersion 45 is refused, naming the handled range \"1 through 44 only\" (...)'",
    'tests/p13b-s7-announcements.test.ts:86': "'LIVE_SAVE_VERSION is 44 (...)'",
    SAVE43_TEST + ':45': "'... exist as functions; LIVE_SAVE_VERSION is 44'",
    SAVE43_TEST + ':82': "'migrateToLive carries a genuine V42 save to V44 (LIVE_SAVE_VERSION)'",
    'tests/p14a1-save-v28.test.ts:252': "'an unknown saveVersion 45 is refused, naming the handled range \"1 through 44 only\" (...)'",
    'tests/save.test.ts:453': "'rejects an unknown saveVersion 45 with the updated range, ...'",
    'tests/p13b-s2-save-v22.test.ts:211': "'refuses an unknown saveVersion 45 with the updated range (...)'",
    'tests/p13b-s3-save-v23.test.ts:124': "'an unknown saveVersion 45 is refused, naming the handled range (...)'",
    'tests/p14b5-save-v31.test.ts:195': "'LIVE_SAVE_VERSION is the literal 44 the live writer stamps (...)'",
    'tests/p14b1-save-v29.test.ts:202': "'an unknown saveVersion 45 is refused, naming the handled range \"1 through 44 only\" (...)'",
    'tests/p13b-s5-save-v24.test.ts:213': "'an unknown saveVersion 45 is refused, naming the handled range \"1 through 44 only\" (...)'",
}
for k, new in TITLES.items():
    f, n = k.rsplit(':', 1)
    manual(f, int(n), 'P5', 'rename the title to ' + new + '; record old -> new identity in the handback', 'certain', 'the title states a number the body moves')

# ── out of scope ──
manual('bridge/testing/c3-active-endurance-observer.ts', 41, 'OUT', 'none', 'certain', 'asserts PROJECTION_VERSION 53, stale at HEAD 56 (1358-E; 1358-J item 5)')
manual('tests/bridge-owner-ux-projection20-migration.test.ts', 65, 'OUT', 'none', 'certain', 'asserts PROJECTION_VERSION 53, stale at HEAD; the file is outside the 440-file gate (1296-A Owner-input hold)')

# ════════════════════════════════════════════════════════════════════════════════════════════════════════
# Rules over the remaining detector hits
# ════════════════════════════════════════════════════════════════════════════════════════════════════════
SAVE43_KEEP = {35, 36, 47, 57, 58, 76, 124, 139, 147, 156, 165, 180, 191, 199, 211, 216, 229, 243, 257}
for k, r in sorted(C.items(), key=lambda kv: (kv[1]['file'], kv[1]['line'])):
    f, n, t, tags = r['file'], r['line'], r['text'], r['tags']
    if (f, n) in done: continue
    if f == SAVE43_TEST and n in SAVE43_KEEP:
        add(f, n, 'KEEP', 'none', 'certain', 'Save43 test: a V43 envelope, the V43 API, or its V43 output'); continue
    if f == SAVE43_TEST and n in (46, 85):
        add(f, n, 'S2', 'toBe(43) -> toBe(44)', 'certain', 'LIVE_SAVE_VERSION / migrateToLive output'); continue
    lifted = False
    # S3 sentinels and range messages
    if re.search(r'saveVersion: 44\b', t):
        add(f, n, 'S3', 'sentinel saveVersion 44 -> 45', 'certain', '44 is now a valid version; validateSave dispatches it to validateSaveV44 (save.ts:5443)'); lifted = True
    if re.search(r'unknown saveVersion 44', t) and 'it(' not in t:
        add(f, n, 'S3', '"unknown saveVersion 44" -> 45', 'certain', 'the dispatcher message names the stamped version'); lifted = True
    if re.search(r'through 43', t) and not re.search(r"\bit\(", t):
        add(f, n, 'S3', '"1 through 43" -> "1 through 44"', 'certain', 'validateSave names the new ceiling (save.ts:5445)'); lifted = True
    if lifted: continue
    # S1 validator selection (calls, keys, imports, typed members)
    if 'v43' in tags:
        if 'typeof' in t and 'validateSaveV43' in t:
            if 'p14p3-fixtures' in f or 'p14p4p5-opportunities' in f:
                add(f, n, 'S1', 'rename to validateSaveV44 with its typed member (the helper names the live validator)', 'certain', 'existence check of the live validator the helper calls')
            else:
                add(f, n, 'KEEP', 'none', 'certain', 'existence check of the frozen V43 function')
            continue
        if re.search(r"'validateSaveV43'", t):
            add(f, n, 'S1', "'validateSaveV43' -> 'validateSaveV44'", 'certain', 'the live validator looked up by name (saveApi or requireFunction)'); continue
        if re.search(r'validateSaveV43\s*:\s*\(|validateSaveV43\(input: unknown\)', t):
            add(f, n, 'S1', 'rename the typed member to validateSaveV44', 'certain', 'typed member for the live validator'); continue
        if re.match(r'\s*import\b', t) or ('(' not in t):
            add(f, n, 'S1', 'import validateSaveV44 in place of validateSaveV43', 'certain', 'import of the live validator'); continue
        two = re.search(r'toBe\(43\)', t)
        add(f, n, 'S1', 'validateSaveV43( -> validateSaveV44(', 'certain', 'live envelope (makeSave, migrateToLive, a live stamp, or a helper returning one)')
        if two: add(f, n, 'S2', 'toBe(43) -> toBe(44)', 'certain', 'the same line pins the live version')
        continue
    if 'relroot' in tags and re.search(r',\s*42\)', t):
        add(f, n, 'S1', 'validateRelationshipsRoot(<live>, 42) -> (<live>, 44)', 'certain', 'engine-written live root; era 42 exact keys refuse `competitions` and `romance`'); continue
    # S2 live literals and P1 projection pins (one line can carry both)
    if re.search(r'toBe\(43\)|!== 43\b|saveVersion: 43\b', t) and 'lit43' in tags:
        add(f, n, 'S2', '43 -> 44', 'certain', 'states the live writer\'s version')
    if re.search(r'PROJECTION_VERSION\)\.toBe\(56\)|projectionVersion\)\.toBe\(56\)|snapshotVersion\)\.toBe\(56\)|SNAPSHOT_VERSION\)\.toBe\(56\)|projectionVersion: 56\b', t):
        add(f, n, 'P1', '56 -> 57', 'certain', 'pins the live projection')
    if 'projection-56' in t and 'BRIDGE_SCHEMA.$id' in t:
        add(f, n, 'P1', 'projection-56 -> projection-57 in the schema $id', 'certain', 'pins the live schema $id')

# Lines the rules skipped on purpose are not rows (dynamic PROJECTION_VERSION reads, roster .get/.has reads, imports
# of unchanged names, historical envelopes). The residue below is printed for review.
seen = {(r['file'], r['line']) for r in rows}
resid = [r for k, r in C.items() if (r['file'], r['line']) not in seen]
json.dump(sorted(resid, key=lambda r: (r['file'], r['line'])), open(S + '/residue.json', 'w'), indent=0)

# ── annotate ──
for r in rows:
    r['inGate'] = r['file'] in CORE_LIST or r['file'].startswith('ui/')
    r['retainedIdentitiesInFile'] = RETAINED.get(r['file'], 0)
json.dump(rows, open(S + '/rows-pass.json', 'w'), indent=0)
c = collections.Counter(r['cls'] for r in rows)
print(len(rows), 'rows;', dict(sorted(c.items())))
print('residue', len(resid))
