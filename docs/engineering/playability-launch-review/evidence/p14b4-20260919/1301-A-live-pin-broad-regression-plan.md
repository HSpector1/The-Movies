# 1301-A: live-version pin maintenance, then one broad core/UI regression

Parent plan, source-only. It closes the P4/P5 register's open "broader core/Bridge/UI" limit and the logic-first
directive's slice-boundary requirement ("run relevant core/bridge/type checks and applicable full suites at slice
boundaries"). No project code, compiler or test ran to produce it. The source identity at adoption is the
published 1300 closure checkpoint; the parent records the actual HEAD in F.

## Why now, and why maintenance first

The last complete suites are 1100 core and 1101 UI on `6e63f4c82a286dc67271cce0d53a0e586a6b523b` (C.3, Save38,
projection53). P3 moved live to Save39/projection54 and P4/P5 to Save40/projection55/evaluator7. P3 corrected
stale pins only in its selected neighbor files (1197/1202); 1299 corrected one more. No later record runs the
remaining suite.

A parent grep (command below) finds 57 direct pins of a live constant at a superseded value in 37 test files:
`expect(LIVE_SAVE_VERSION).toBe(38|39)`, `expect(PROJECTION_VERSION).toBe(53|54)` and
`expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(53|54)`. The live declarations are
`src/core/save.ts:6538` (40) and `bridge/schema/bridge-schema.ts:281` (55). One site sits in
`tests/bridge-owner-ux-projection20-migration.test.ts`, which 1296-A excludes; it stays unedited and unrun.
The other 56 sites in 36 files would each fail at that assertion and mask the rest of its leaf. Running the
broad suite before correcting them spends about 90 minutes to rediscover source-proven stale metadata and hides
the assertions behind them, the reasoning 1299-A applied to one file. Lesson GN still holds: the broad run, not
this inventory, is the authority on what fails.

```sh
python3 - <<'PY'   # parent inventory; filename-scoped, no fixture reads
import re,subprocess
files=[f for f in subprocess.check_output(['git','ls-files','tests','ui/src']).decode().split('\n')
       if re.search(r'\.test\.tsx?$',f) and not f.startswith('tests/fixtures/')]
pat=re.compile(r"expect\((LIVE_SAVE_VERSION|PROJECTION_VERSION|BRIDGE_SCHEMA\[.x-project-studio.\]\.projectionVersion)\)\.toBe\((\d+)\)")
for f in files:
  for i,l in enumerate(open(f,encoding='utf8'),1):
    for m in pat.finditer(l):
      live=40 if m.group(1)=='LIVE_SAVE_VERSION' else 55
      if int(m.group(2))!=live: print(f,i,m.group(1),m.group(2))
PY
```

A second, derived class exists: about 114 grep hits for `saveVersion` 38/39 literals and schema `sha256:` pins.
Many are legitimate history (a frozen V38 reader, a genuine prior-save input, an old schema id registered as a
prior). Only a site whose value comes from the current writer or current generator is live. This class needs
per-site classification by the test author; the parent does not pre-judge it.

## Increment 1301-C: one staged maintenance patch, scoped by cause

The cause is "a live-version literal left at a superseded value after the Save39/Save40 and projection54/55
bumps". Test-author stages one patch under `1301-stage/` with a per-site table:

1. Every direct site above: replace the literal with the current live value (40 or 55), keeping a literal, never
   the imported constant, so each remains an independent guard. Update a leaf title only where it names the old
   literal; record every old and new title.
2. Derived sites: change a `saveVersion` literal only where the asserted save is produced by the current writer
   in that test (new game, `makeSave`, current export/import, hydrated current slot). Change a schema-id pin
   only where the test compares the current generated schema, taking the new id from the committed generated
   artifact by reading it. Every change cites the producing line.
3. Leave unchanged, and list with the reason: frozen or historical readers, genuine prior inputs, prior schema
   registrations, downgrade targets, receipts, digest pins, fixture bytes, timeouts, and any site the author
   cannot classify from source. The broad run attributes those.
4. The six 1296-A files are neither edited nor run.

The patch changes tests only. It adds no case, skip, filter or timeout, and no production edit. The handback
proves the complete inverse per file and lists the full changed-site table. Independent 1301-D review precedes
parent application (1301-E) and publication. No compiler run for literal-only edits: Vitest types `toBe` as
`<E>(expected: E) => void`, and a title is a string. If the reviewed patch changes anything else, the parent
reassesses.

## Gates 1302 and 1303: one broad observation each

Run sequentially as the only heavy process, bounded guard pre/post around each, no commit until both posts
close (lesson GJ):

| Gate | Command | Collection |
|---|---|---|
| 1302-p4p5-broad-core | `node_modules/.bin/vitest run --project core <411 explicit paths>` | 417 core files minus the six 1296-A exclusions; explicit paths are an allowlist applied before collection |
| 1303-p4p5-broad-ui | `node_modules/.bin/vitest run --project ui` | all 204 UI test files; 1296-A found no Owner-input consumer among them |

Default file parallelism matches 1100/1101 so their identities and timings remain comparable. No allowlist path
is a substring of an excluded path (parent check, filenames only). The bounded guard records `advanceCap` -1,
meaning no source-route cap for a broad collection; it is a recorded label, not a measured counter. There is no
manual companion: tests load their own fixtures, which the guards deliberately do not hash (1296-B). Known
operational effects: `tests/bridge-supervisor.test.ts` builds `dist/studio` (gitignored) and spawns local
processes; scenery exporter and UI PNG tests write temporary outputs. The recorder's fixed-source check covers
the consumed source roots only.

## Pre-registered predictions (lesson GM)

- None of the 1301-changed sites fails at its changed line. A failure there falsifies the classification.
- Inherited identities attributed in 1119-A/B that no later record repaired recur with the same primary:
  canonical L1/L2 premise, R8 timeouts, FU1/FU2 Inspector bodies, NextEvent navigation, missing-PIL PNG paths and
  the UI unhandled `hollywoodPerformance` error. A vanished identity needs its repairing record named.
- Every `tests/p14p4p5-*` leaf that passed in its isolated Q gate passes here. A failure there would indicate
  collection-order or parallel interference, and it stops attribution of that file until isolated.
- Sites left unchanged under rule 3 may fail. Each such failure is attributed individually, never bulk-labelled.

## Attribution and closure

Test-author attributes each gate against 1100/1101 with the 1119-A identity method: RETAINED, CHANGED, NEW,
VANISHED, each NEW failure traced to a cause before any expectation changes, first failure separated from masked
assertions. Contract-auditor reviews independently; parent closes with K. A repair found necessary becomes its
own reviewed increment. No rerun, filter, timeout change or weakened assertion follows from a failure, and no
all-green or full-suite claim is made while the six exclusions and any failures stand.

Budget: two broad runs (about 70 and 15 minutes at 1100/1101 rates), test-only maintenance, same two specialists,
parent sole live writer and heavy process. R3 rival early release and the open rival material-policy witness
follow this baseline. Unity/native and Owner campaigns stay deferred.
