"""Rule-based classification of the detector's candidate lines (HEAD tests), shifted one era from 1358-N."""
import re
KEEP_FILES_V44 = {'tests/p14b10-save-v44.test.ts'}
TITLE_RENAME = {  # titles whose bodies move (1358-F9 ruling 5): old fragment -> new fragment
 'tests/p13b-s7-announcements.test.ts:86': '"LIVE_SAVE_VERSION is 44" -> "is 45"',
 'tests/p14b5-save-v31.test.ts:195': '"the literal 44" -> "the literal 45"',
 'tests/p14b9-save-v42.test.ts:228': '"LIVE_SAVE_VERSION is 44" -> "is 45"',
 'tests/p14b9-save-v42.test.ts:232': '("1 through 44") -> ("1 through 45")',
 'tests/p14b10-save-v44.test.ts:118': '"LIVE_SAVE_VERSION is 44" -> "is 45" (the named V44 functions stay)',
 'tests/p14b10-save-v44.test.ts:361': '"makeSave stamps 44" -> "makeSave stamps 45" and "to Save44" -> "to Save45"',
 'tests/p14d1-rival-shelving-save-v43.test.ts:45': '"LIVE_SAVE_VERSION is 44" -> "is 45"',
 'tests/p14d1-rival-shelving-save-v43.test.ts:82': '"to V44 (LIVE_SAVE_VERSION)" -> "to V45 (LIVE_SAVE_VERSION)"',
 'tests/p14d1-rival-shelving.test.ts:186': '"LIVE_SAVE_VERSION is 44" -> "is 45"',
 'tests/p13b-r07-save-v25.test.ts:273': 'sentinel 45 -> 46 and "1 through 44 only" -> "1 through 45 only"',
 'tests/p13b-s2-save-v22.test.ts:211': 'sentinel 45 -> 46',
 'tests/p13b-s3-save-v23.test.ts:124': 'sentinel 45 -> 46',
 'tests/p13b-s5-save-v24.test.ts:213': 'sentinel 45 -> 46 and "1 through 44 only" -> "1 through 45 only"',
 'tests/p13b-s6-save-v26.test.ts:221': 'sentinel 45 -> 46 and "1 through 44 only" -> "1 through 45 only"',
 'tests/p13b-s8-save-v27.test.ts:232': 'sentinel 45 -> 46 and "1 through 44 only" -> "1 through 45 only"',
 'tests/p14a1-save-v28.test.ts:252': 'sentinel 45 -> 46 and "1 through 44 only" -> "1 through 45 only"',
 'tests/p14b1-save-v29.test.ts:202': 'sentinel 45 -> 46 and "1 through 44 only" -> "1 through 45 only"',
 'tests/save.test.ts:453': 'sentinel 45 -> 46',
}
# downgrade pins on a live input (S9). value: (prediction, status)
S9 = {
 'tests/p13b-s8-save-v27.test.ts:194': ('P15 Power Ranking refusal predicted (same natural route as :206, which M2 measured); masked by :187', 'measure'),
 'tests/p13b-s8-save-v27.test.ts:206': ('P15 Power Ranking refusal, measured in M2', 'certain'),
 'tests/p14b5-relationships.test.ts:1400': ('pinned V42 shelving guard predicted unchanged: takeWorld() sits at week 61 after a migration at week 60, before quarter 65, so the archive is empty', 'measure'),
 'tests/p14b5-relationships.test.ts:1417': ('as :1400', 'measure'),
 'tests/p14b5-relationships.test.ts:1432': ('as :1400', 'measure'),
 'tests/p14b5-relationships.test.ts:1453': ('as :1400', 'measure'),
 'tests/p14b9-save-v42.test.ts:223': ('pinned competitions-log guard predicted unchanged: the lifted state is greenlit without a tick, so its archive is empty', 'measure'),
 'tests/p14c2b-save-v36.test.ts:83': ('P15 refusal predicted: the week-52 capture is advanced to 92 and 98, past quarters 65, 78, 91', 'measure'),
 'tests/p14c2b-save-v36.test.ts:98': ('P15 refusal predicted, as :83', 'measure'),
 'tests/p14c2rm-writer-continuation.test.ts:287': ('unknown: depends on whether `current` crossed a quarter since its migration', 'measure'),
 'tests/p14c2s-scientist-retirement.test.ts:287': ('P15 refusal predicted: scientistAt(hardResearch, 566) ticks the week-520 corpus past 533, 546, 559', 'measure'),
 'tests/p14c2s-scientist-retirement.test.ts:288': ('P15 refusal predicted, as :287', 'measure'),
 'tests/p14c3-cohort-transition.test.ts:288': ('unknown: depends on the c4/c3 route weeks since migration', 'measure'),
 'tests/p14c3-dual-extensions.test.ts:180': ('unknown: depends on the route weeks since migration', 'measure'),
 'tests/p14c3-offmenu-extensions.test.ts:237': ('unknown: depends on the route weeks since migration', 'measure'),
 'tests/p14c3-profession-history.test.ts:119': ('unknown: depends on the fixture route', 'measure'),
 'tests/p14c3-transitions.test.ts:175': ('unknown: depends on `reopened`', 'measure'),
 'tests/p14c3-transitions.test.ts:207': ('unknown: depends on `reopened`', 'measure'),
 'tests/p14p3-directing-promises.test.ts:387': ('P15 refusal predicted: p13a routes run past week 13', 'measure'),
 'tests/p14p3-directing-promises.test.ts:418': ('P15 refusal predicted, as :387', 'measure'),
 'tests/p14p3-directing-promises.test.ts:482': ('P15 refusal predicted, as :387', 'measure'),
 'tests/p14p3-directing-promises.test.ts:740': ('P15 refusal predicted, as :387', 'measure'),
 'tests/p14p3-directing-promises.test.ts:748': ('P15 refusal predicted, as :387', 'measure'),
 'tests/p14p4p5-opportunities.test.ts:827': ('unknown: `released` starts from the week-45 capture; a tick past 52 records a quarter', 'measure'),
 'tests/p14p4p5-screenplay-status.test.ts:328': ('pinned romance guard predicted unchanged: the route runs from the week-45 capture to week 48, before quarter 52', 'measure'),
 'tests/p14r3-save-v41.test.ts:381': ('P15 refusal predicted: p13aGeneratedStudio ticked to week 23, past quarter 13', 'measure'),
 'tests/contracts/v14-boundary-guards.contract.test.ts:211': ('loose /cannot downgrade/; no industry, predicted unchanged; no edit unless the probe shows the P15 refusal (1358-F10 ruling 3)', 'measure'),
 'tests/contracts/v14-boundary-guards.contract.test.ts:250': ('as :211', 'measure'),
 'tests/contracts/v14-boundary-guards.contract.test.ts:275': ('as :211', 'measure'),
 'tests/contracts/v14-boundary-guards.contract.test.ts:300': ('as :211', 'measure'),
 'tests/v14-migration.contract.test.ts:244': ('loose /cannot downgrade/; founded cells without an industry, predicted unchanged; no edit unless the probe shows the P15 refusal', 'measure'),
 'tests/cash-ledger-checkpoint-v11.test.ts:381': ('pinned V11 guard predicted unchanged: generateWorld has no industry; masked by :364', 'measure'),
}
# S9 chains that must succeed (refuse rather than strip: 1358-F9 ruling 2)
MUST_SUCCEED = {
 'tests/helpers/p14c2b-fixtures.ts:69': 'caller p14c2b-save-v36:64 (`live`, never ticked) must succeed',
 'tests/helpers/p14c4-fixtures.ts:71': 'no caller in tests (type gate only)',
 'tests/helpers/p14c3-canonical-rival-fixtures.ts:198': 'tick 0, no quarter: must succeed',
 'tests/helpers/p14p3-fixtures.ts:113': 'futureSave chain; callers p14p3-directing-promises :387, :482, :740 are S9 leaves',
 'tests/contracts/v14-boundary-guards.contract.test.ts:63': 'no industry: must succeed',
 'tests/p06a-w1-release-authority.test.ts:406': 'founded studio, no industry: must succeed',
 'tests/save.test.ts:370': 'contendedStudio, no industry: must succeed',
 'tests/save.test.ts:419': 'as :370',
 'tests/p14c3-promise-digest-continuity.test.ts:279': 'genuine bytes, no tick: must succeed',
 'tests/p14p4p5-opportunities.test.ts:335': 'valid (week-45 capture, attached without a tick): must succeed',
 'tests/p14p4p5-opportunities.test.ts:386': 'genuine bytes, no tick: must succeed',
 'tests/p14p4p5-opportunities.test.ts:406': 'the validator refuses the mutation first; unchanged',
 'tests/p12-starting-world.test.ts:55': 'week 0: chain succeeds, makeSaveV18 refuses as pinned',
}
HOLLYWOOD_ONLY = {'tests/bridge-p14b4-runtime47-compatibility.test.ts:258', 'tests/bridge-p14b5-relationships.test.ts:474',
                  'tests/p14c2rm-writer-continuation.test.ts:298'}
S5_LINES = {  # comparison sites that gain the four P15 roots (per-file helper withEmptyP15Roots)
 'tests/bridge-p14b2-checkpoint.test.ts:93', 'tests/bridge-p14c2rm-runtime.test.ts:61', 'tests/bridge-p14c2s-scientist-runtime.test.ts:141',
 'tests/bridge-p14c3-promise-digest-continuity.test.ts:164', 'tests/bridge-p14p3-directing-promises.test.ts:140',
 'tests/bridge-p14p3-directing-promises.test.ts:376', 'tests/bridge-p14p4p5-opportunities.test.ts:99', 'tests/bridge-p14p4p5-opportunities.test.ts:519',
 'tests/bridge-p14r2r3-prior55.test.ts:201', 'tests/p14b3-rule-revision.test.ts:174', 'tests/p14b4-save-v30-compatibility.test.ts:216',
 'tests/p14bf2-acting-discipline.test.ts:366', 'tests/p14c3-save-v38.test.ts:92', 'tests/p14p3-directing-promises.test.ts:440',
 'tests/p14p4p5-casting-reservation.test.ts:209', 'tests/p14p4p5-cross-owner.test.ts:107', 'tests/p14p4p5-delayed-retirement.test.ts:189',
 'tests/p14p4p5-opportunities.test.ts:382', 'tests/p14p4p5-queued-project-outcome.test.ts:186', 'tests/p14p4p5-scenery-capacity.test.ts:202',
}
FALSE_POS = {'tests/tick.test.ts:286', 'tests/tick.test.ts:328', 'ui/src/screens/d17a-decision-truth.test.tsx:587', 'ui/src/screens/d17a-decision-truth.test.tsx:589',
             'tests/film-chronicle.test.ts:534', 'tests/reception-verdict-canonical.test.ts:47', 'ui/src/components/FilmPoster.test.tsx:148',
             'tests/bridge-p14a3-world.test.ts:296', 'tests/bridge-p14b6-relationship-read-models.test.ts:856', 'tests/p14b5-relationships.test.ts:656',
             'tests/bridge-p14b6-relationship-read-models.test.ts:799', 'tests/bridge-p14b8-waiver-surface.test.ts:788'}

_SRC = {}
def _lines(f):
    if f not in _SRC: _SRC[f] = open('/Users/zacheryspector/The-Movies-headless-program/' + f, encoding='utf8').read().split('\n')
    return _SRC[f]
def refusal_context(c):
    """True when the validator call sits in a refusal assertion that spans lines, or in a try/catch capture."""
    lines = _lines(c['file']); i = c['line'] - 1; t = c['text']
    prev = lines[i - 1].strip() if i > 0 else ''
    win = ' '.join(x.strip() for x in lines[i:i + 8])
    inexp = prev.endswith('expect(() =>') or re.search(r'expect\(\(\)\s*=>', t)
    if inexp and re.search(r'\)\s*\.toThrow\(', win) and 'not.toThrow' not in t: return True
    return bool(re.search(r'try\s*\{\s*(saves\.|api\.)?validateSaveV44\(', t) or (prev.endswith('try {') and re.match(r'\s*validateSaveV44\(', t)))

def classify(c):
    """Return (cls, edit, status) for one candidate, or ('KEEP', reason, 'keep')."""
    k = f"{c['file']}:{c['line']}"; t = c['text']; tags = c['tags']; f = c['file']
    if k in FALSE_POS: return ('KEEP', 'false positive: a week, tick, score, label boundary or roster size', 'keep')
    if 'title' in tags:
        if k in TITLE_RENAME: return ('T', 'rename the title: ' + TITLE_RENAME[k] + '; record old and new identity', 'certain')
        return ('KEEP', 'stale or unrelated title; the body does not state the moved number (1358-F9 ruling 5)', 'keep')
    if f in KEEP_FILES_V44:
        if 'lit44' in tags and re.search(r'LIVE_SAVE_VERSION\)\.toBe\(44\)|live\.saveVersion\)\.toBe\(44\)|stamped\.saveVersion\)\.toBe\(44\)|validateSave\(stamped\)\.saveVersion\)\.toBe\(44\)', t):
            return ('S2', 'toBe(44) -> toBe(45): a live-version pin', 'certain')
        return ('KEEP', 'Save44 test: a genuine V44 envelope or the frozen V44 API', 'keep')
    if k in S9:
        pred, st = S9[k]
        pre = 'insert convertV45ToV44 innermost (S4); then ' if 'chain' in tags else ''
        return ('S9', pre + 'pin the measured first guard in the S9 form (comment names the masked guard\'s own-era cover); prediction: ' + pred, st)
    if 'toBe(44)' in t and 'validateSaveV44' in t:
        first = 'S2' if t.index('toBe(44)') < t.index('validateSaveV44') else 'S1'
        return (first, 'toBe(44) -> toBe(45) and validateSaveV44( -> validateSaveV45( on this line (and the import)', 'certain')
    if re.match(r'\s*(import\b|[\w, ]+,\s*$)', t) and 'convertV44ToV43' in t and 'validateSaveV44' in t:
        return ('S4', 'add convertV45ToV44 and replace validateSaveV44 with validateSaveV45 in the import', 'certain')
    if 'chain' in tags:
        if re.match(r'\s*import\b', t) or ('(' not in t and 'convertV44ToV43' in t and ':' not in t):
            return ('S4', 'add convertV45ToV44 to the import', 'certain')
        if re.search(r'convertV44ToV43\s*:\s*\(|convertV44ToV43\(input: unknown\)\s*:', t):
            return ('S4', 'add a typed convertV45ToV44 member beside it (typed dynamic API)', 'certain')
        if 'typeof' in t:
            return ('S4', 'add the same existence check for convertV45ToV44', 'certain')
        note = MUST_SUCCEED.get(k, '')
        return ('S4', 'insert convertV45ToV44 innermost: convertV44ToV43(convertV45ToV44(<live>))' + ('; S9 risk: ' + note if note else ''), 'measure' if note else 'certain')
    if 'v44' in tags:
        if 'typeof' in t and 'ReturnType' not in t:
            return ('S1', 'rename the existence check with its typed member to validateSaveV45 (the public live validator)', 'certain')
        if re.search(r"'validateSaveV44'", t):
            if refusal_context(c): return ('S8', "saveApi key 'validateSaveV44' -> 'validateSaveV45'; keep the refusal pattern (message probe confirms)", 'measure')
            return ('S1', "by-name lookup 'validateSaveV44' -> 'validateSaveV45'", 'certain')
        if refusal_context(c) and not re.match(r'\s*import\b', t):
            return ('S8', 'validateSaveV44( -> validateSaveV45( inside a refusal assertion or capture; keep the pattern (message probe confirms)', 'measure')
        if 'ReturnType<typeof validateSaveV44>' in t: return ('S1', 'type the live envelope as ReturnType<typeof validateSaveV45>', 'certain')
        if re.search(r'validateSaveV44\s*:\s*\(|validateSaveV44\(input: unknown\)\s*:', t):
            return ('S1', 'rename the typed member to validateSaveV45 (and its return type to SaveFileV45 where typed)', 'certain')
        if re.match(r'\s*import\b', t) or ('(' not in t):
            return ('S1', 'import validateSaveV45 in place of validateSaveV44', 'certain')
        if 'not.toThrow' in t: return ('S1', 'validateSaveV44( -> validateSaveV45( under not.toThrow', 'certain')
        if re.search(r'toThrow\(\)', t): return ('S8', 'rename to validateSaveV45; the bare .toThrow() must reach the tampered field\'s own guard (message probe); pin it if it does not', 'measure')
        if 'toThrow(' in t or re.search(r'\)\.toThrow\s*\($', t): return ('S8', 'validateSaveV44( -> validateSaveV45(; keep the refusal pattern (message probe confirms)', 'measure')
        return ('S1', 'validateSaveV44( -> validateSaveV45(', 'certain')
    if 'canon' in tags: return ('S2', '/canonical V44 save bytes exactly/ -> /canonical V45 save bytes exactly/', 'certain')
    if 'lift' in tags:
        if k == 'tests/p14d1-rival-shelving.test.ts:569': return ('S5', 'week-93 control: the genuine side stays at its V44 lift; the candidate drops its P15 roots under guard (1358-F12 form)', 'ruling')
        return ('S5', 'hand lift gains one governed step: convertV44ToV45(...)', 'certain')
    if 'sf44' in tags:
        if k == 'tests/p14b9-save-v42.test.ts:71': return ('S1', 'add SaveFileV45 to the type import for the renamed member', 'certain')
        if k == 'tests/p14b9-save-v42.test.ts:175': return ('KEEP', 'the V43->V44 lift member keeps its V44 return type', 'keep')
    if 's5helper' in tags:
        if k in HOLLYWOOD_ONLY: return ('KEEP', 'compares .hollywood only (1361-R Part 3.3)', 'keep')
        if re.match(r'\s*function\b', t): return ('KEEP', 'helper definition; the per-file withEmptyP15Roots goes beside it', 'keep')
        if k in S5_LINES:
            extra = '; the stamp 44 -> 45 on the same line (S2)' if 'saveVersion: 44' in t else ''
            return ('S5', 'the expected side gains the four P15 roots at the input week (per-file helper withEmptyP15Roots)' + extra, 'measure')
    if ('lit45' in tags or 'unknown' in tags or 'through' in tags):
        if re.search(r'saveVersion:\s*45\b', t): return ('S3', 'sentinel stamp 45 -> 46', 'certain')
        if re.search(r'unknown saveVersion 45|through 44', t):
            return ('S3', '"unknown saveVersion 45" -> 46 and "1 through 44" -> "1 through 45"', 'certain')
        if 'lit45' in tags and not ('lit44' in tags): return ('KEEP', 'not a save version (a week, tick, size or score)', 'keep')
        if 'unknown' in tags and not re.search(r'45', t): return ('KEEP', 'another unknown-version sentinel (99, title or describe)', 'keep')
    if 'lit44' in tags:
        if f.startswith('ui/src/'): return ('UI', 'toBe(44) -> toBe(45): the UI adapter writes the live version', 'certain')
        if re.search(r'saveVersion:\s*44\b', t): return ('S2', 'the live-envelope stamp 44 -> 45', 'certain')
        if re.search(r'!==\s*44', t): return ('S2', 'the guard 44 -> 45 (moves with :922, 1358-J 3k)', 'certain')
        if re.search(r'toBe\(44\)', t): return ('S2', 'toBe(44) -> toBe(45)', 'certain')
    if 'downgrade' in tags:
        return ('KEEP', 'the input is an older-era envelope or state, or the leaf passed in M2; the pinned guard is unchanged', 'keep')
    if 'live' in tags: return ('KEEP', 'reads LIVE_SAVE_VERSION; moves on its own', 'keep')
    return ('KEEP', 'no moved number', 'keep')
