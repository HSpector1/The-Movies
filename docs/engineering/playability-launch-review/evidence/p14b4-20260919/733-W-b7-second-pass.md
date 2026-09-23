# 733-W — the B.7 writer's second pass: THE LAW and the live V31 → V32 bump

Source `8fad77c8`, worktree `wip/headless-program-20260916-ts`. Brief: `732-W-b7-second-pass-brief.md`.
First pass `14a1489c` intact; this is additive. **Nothing committed, nothing pushed.**

## 1. Verdict

PARTIAL. Both pieces of work land and the two named RED cases are green. The bump then breaks two
OTHER cases inside the B.7 suite itself, and 186 root-typecheck errors, all of them in `tests/`.
Every one is the live-version sweep the brief assigns to the test-author. Section 6 lists them.

## 2. The two named cases, before and after

| case | before | after |
| --- | --- | --- |
| group6 "THE LAW: a substitute window opening ON (or before) the waiver week must be refused" | FAIL (`expected null not to be null`) | PASS |
| group9 "LIVE_SAVE_VERSION is the value this slice's own V31->V32 step must produce" | FAIL (`expected 31 to be 32`) | PASS |

Both suite files re-read from disk at the END of the pass, unmodified:

| file | sha256 | lines |
| --- | --- | --- |
| `tests/p14b7-promise-waiver.test.ts` | `09c9f09bd00c4215c2a14b05e1fc45a4e263cce45e7f78e9c72dfb8a878fc66c` | 651 |
| `tests/bridge-p14b7-promise-waiver.test.ts` | `e6c7ae4df13b77b7d7067e0bcc5e9a3501d04f3146e17a6ce10d8b772007a5ed` | 185 |

`git status --porcelain tests/` is EMPTY. No test file, no fixture, no helper was touched.

## 3. Files and hunks

11 files, `195 insertions(+), 59 deletions(-)`. No wire change; `PROJECTION_VERSION` is untouched at
49 and the bridge suite's `group9b` pin passes.

### `src/core/promises.ts`

| hunk | reason |
| --- | --- |
| `waiverAccepted`: new branch `substitute.windowStartWeek <= week` | THE LAW. Placed AFTER the identical-substitute check and before the strength check — see §4 for the ordering decision and why it is a decision |
| all NINE refusal sentences rewritten to differ within their first SIX characters | the brief's stability constraint; four of them previously opened `the substitute …` and a truncation at 14 chars collapsed them |
| `waiverAccepted` doc comment | states THE LAW, the measured cause (`qualifyingTakes` excludes only `take.week < windowStartWeek`), and why the comparison closes the class where a scan closes only the instance |
| `PromiseSettlement` gains `supersededByPromiseId` | the WAIVED branch is the only settlement naming a successor, and it must be written in the same `settle()` call that freezes the outcome |
| `waivePromise`: `supersededByPromiseId: substituteId` on the settled original; `null` on the minted substitute | 720 item 11's typed link. `outcomeCause` prose is KEPT (item 9) but is no longer what a reader resolves the successor by |
| `attachPromise`'s `base` gains `supersededByPromiseId: null` | a freshly attached promise supersedes nothing |
| `evaluable()` parameter narrowed to `Pick<ProfessionalPromiseV30, 'outcome' \| 'contractId'>` | `promisedCastMasks` reads a FROZEN V30 row; the predicate reads only two fields, identical on every version |
| NEW `validateWaivedPromiseLinks(state)` | the V32 field validated where the boundary can name the fault (R22). Present on every row, `string \| null`, and when set it names a DIFFERENT promise of this world on a row that really settled WAIVED |

### `src/core/types.ts`

`ProfessionalPromise = ProfessionalPromiseV32`, `GameState = GameStateV32`, and the
`ProfessionalPromiseV32` comment corrected from "NOT the live shape" to the live shape. The V32
types themselves were already written by the first pass and are unchanged.

### `src/core/save.ts`

`SaveFileV32` into the `SaveFile` union; NEW `validateSaveV32` (validates its own field, then hands
the frozen V31 chain `stripV32Field(raw)` — the `stripV31Root` strip-and-delegate device one level
down, at the row instead of the root); dispatch `if (s.saveVersion === 32)` and the sentinel
`1 through 32 only`; `LIVE_SAVE_VERSION = 32`; `makeSave` returns `SaveFileV32` stamping 32 through
`validateSaveV32`; `convertV31ToV32` now returns through `validateSaveV32` rather than a bare
literal; NEW `migrateToV32`; `migrateToV31` gains the `=== 32` route back; **18 downgrade refusals**
(`cannot downgrade SaveFileV32 or discard the waived-promise link`) and **5 downgrade routes**
(`migrateToV26/27/28/29/30` recurse through `convertV32ToV31`) inserted mechanically above their
V31 siblings and verified by count.

`convertV32ToV31` is UNCHANGED: it still refuses a non-null link through `projectPromisesPreV32`,
asked BEFORE envelope validation.

### The rest

`src/core/index.ts` — exports `validateSaveV32`, `migrateToV32`, `convertV31ToV32`,
`convertV32ToV31`, `SaveFileV32`, `GameStateV32`, `ProfessionalPromiseV32`.

`bridge/session.ts`, `bridge/runtime-checkpoint.ts`, `bridge/runtime/campaign-library.ts`,
`ui/src/engine/adapter.ts`, `src/harness/d16/run-d17b-week86.ts`,
`src/harness/d16/run-d17b-continuation.ts` — every LIVE load route moves `migrateToV31` →
`migrateToV32`, and `runtime-checkpoint`'s current-envelope type and its three V31 literals move to
V32. This is not scope creep: left at V31 a live V32 save would either lose its waiver link
silently on load or, once a waiver exists, crash `convertV32ToV31`. It mirrors the V30 → V31 step
exactly — `f5310afb` (src) plus `c3f916a7` (bridge session, runtime checkpoint, campaign library,
UI adapter), both the same writer.

`src/harness/p14/legacy-v28-fixtures.ts` — `emit`'s union widened to accept `SaveFileV32`. The
fixtures on disk are NOT re-minted and this harness was NOT run.

## 4. The ordering decision inside `waiverAccepted`

THE LAW overlaps the identical-substitute rule. **The identical rule is checked FIRST**, so an
identical substitute returns `an identical substitute changes nothing this studio owes`, matching
that case's own name. THE LAW's sentence is reserved for the exploit shape. Measured, not assumed
— probe output in §7.

The nine reasons, in evaluation order:

1. `this promise already settled ${outcome}, and a terminal outcome is never rewritten`
2. `nobody took up this promise, so there is no commitment to waive`
3. `the employment contract this promise rode in on is no longer on the record`
4. `an identical substitute changes nothing this studio owes`
5. `a substitute is a forward obligation, and this window opens no later than the week of the waiver` ← THE LAW
6. `the part offered is weaker than the part promised`
7. `only ${n} of the ${m} pictures still owed would be covered`
8. `this person no longer trusts this studio enough to accept a substitute for what was promised`
9. `what remains of the contract cannot reasonably carry the substitute — ${bottleneck}`

No string is reused and none is composed from a shared prefix. The pair that comes closest is 1 and
8, which diverge at character 6 (`this pro` / `this per`).

## 5. Checks actually run

Baselines were measured on the unmodified tree BEFORE any edit.

| check | baseline | after |
| --- | --- | --- |
| `npx tsc --noEmit` | 0 | **186**, ALL in `tests/`; **0 in `src/`** |
| `npx tsc -p tsconfig.bridge.json --noEmit` | 0 | **50**, ALL in `tests/bridge*`; **0 in `bridge/`** |
| `npx tsc -p ui/tsconfig.json --noEmit` | 0 | **0** |
| `npx vitest run` on the two B.7 suite files | 2 failed / 31 passed (33) | **2 failed / 31 passed (33)** — a DIFFERENT two |

Not run, per the brief: the evidence runner, the full suite, any native or Unity check.

## 6. What the bump breaks, listed and NOT fixed

Root typecheck residue, by error class: 170 × TS2379 and 9 × TS2375 (`GameStateV31` where
`GameStateV32` is expected — a hand-built state whose promise rows predate the field) and 7 × TS2322
(`SaveFileV32 is not assignable to SaveFileV31` — a `makeSave` result annotated at the old live
version). Bridge typecheck residue is the same two classes. Top files: `p14b4-material-evidence-core`
(40), `bridge-p14b4-cast-class` (30), `p11-finance-report` (13), `cash-ledger-checkpoint-v11` (12),
`c1-m6-identity-not-coordinates` (11), `bridge-p11-finance` (9), `p13b-s1-save-v21` (8).

**The 0-error instruction cannot be met across this bump.** The root tsconfig includes `tests/**`, so
a live save bump necessarily reddens it until the sweep lands. The precedent is exact: the V30 → V31
writer commit `f5310afb` touched five source files and zero tests, and the sweep arrived separately
as `662-T2` — "121 files under `tests/` and `ui/`". I report the number rather than bend either the
type or a test to hide it.

Candidate sweep sites (upper bound — `662-T2` records that every FROZEN-corpus reader correctly
stays on its own frozen validator, so a large share of these must NOT move):

| literal | occurrences in `tests/` + `ui/src` |
| --- | --- |
| `migrateToV31` | 139 |
| `validateSaveV31(` | 113 |
| `toBe(31)` | 79 |
| `SaveFileV31` | 40 |
| `1 through 31` | 18 |
| `saveVersion: 31` | 7 |
| distinct files carrying any of these | 101 |

**Two casualties inside the B.7 suite itself.** Both were passing at baseline; both are sweep-class;
neither is reachable without editing a test, which I do not own.

1. `tests/p14b7-promise-waiver.test.ts` → group3 → "REFUSES waiving an UNBOUND promise".
   `Error: validateSaveV31: expected version 31`, thrown from
   `tests/helpers/p14b2-fixtures.ts:122`, which reads
   `validateSaveV31(JSON.parse(JSON.stringify(makeSave(state))))`. `makeSave` now stamps 32. The fix
   is the one-token live pin `validateSaveV31` → `validateSaveV32`. **56 test files import this
   helper**, so this single line is the highest-leverage item in the sweep.

2. `tests/bridge-p14b7-promise-waiver.test.ts` → group11 → "the promiseOutcome receipt exists after
   a waiver, and no industry Pulse activity carries its eventId".
   `Error: validateSaveV32: state.promises[1].supersededByPromiseId is missing`, thrown from
   `makeSave` ← `exportSaveJson` ← `bridge/snapshot-build-context.ts` `stateDigest` ← `industryPage`.
   The suite's `boundOpenP1()` returns a raw V31 state (`validateSaveV31(...).state`) and feeds it
   to a live path. The fix is `convertV31ToV32(validateSaveV31(...)).state`.

   This failure is a LOUD refusal by design and I did not soften it. Letting
   `validateWaivedPromiseLinks` read a missing field as `null` would make `makeSave` stamp V32 onto
   16-key promise rows, and every later reader would see `undefined` where the contract says `null`.
   `validateSaveV31` refuses a missing `relationships` root for the same reason.

## 7. Probe, archived verbatim (record 726)

Run with `npx vite-node` from a scratch directory inside the repo, removed after the run; the text
is preserved here and in the session scratchpad. It asks four things the suites do not: which reason
each of the two OVERLAPPING refusals returns, whether the typed link lands on the waived original
only, and whether a save carrying a waiver survives the live V32 writer.

```ts
// 733-W disposable probe (record 726: archived, never silently deleted).
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { validateSaveV31, convertV31ToV32, convertV32ToV31, makeSave, exportSave, importSave, migrateToV32, LIVE_SAVE_VERSION } from '../src/core/save.js'
import { waiverAccepted, waivePromise } from '../src/core/promises.js'
import type { GameState } from '../src/core/types.js'

const raw = gunzipSync(readFileSync('tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-part-served-p1.json.gz')).toString('utf8')
const v32 = convertV31ToV32(validateSaveV31(JSON.parse(raw)))
const state = v32.state as unknown as GameState
const promise = state.promises.find((p) => p.promiseId === 'promise-0')!
const today = state.market.tick
console.log('LIVE_SAVE_VERSION', LIVE_SAVE_VERSION, 'week', today, 'count', promise.predicate.count, 'progress', promise.progress)

const exploit = { family: 'APPEARANCE_COUNT' as const, predicate: { count: 1 }, windowStartWeek: today, dueWeekExclusive: today + 60 }
const identical = { family: promise.family, predicate: { count: promise.predicate.count }, windowStartWeek: promise.windowStartWeek, dueWeekExclusive: promise.dueWeekExclusive }
const legal = { family: 'APPEARANCE_COUNT' as const, predicate: { count: 1 }, windowStartWeek: today + 1, dueWeekExclusive: today + 61 }
console.log('REASON exploit  :', JSON.stringify(waiverAccepted(state, promise, exploit as never, today)))
console.log('REASON identical:', JSON.stringify(waiverAccepted(state, promise, identical as never, today)))
console.log('REASON legal    :', JSON.stringify(waiverAccepted(state, promise, legal as never, today)))

const after = waivePromise(state, { promiseId: 'promise-0', substitute: legal as never })
for (const p of after.promises) console.log('ROW', p.promiseId, p.outcome, JSON.stringify(p.supersededByPromiseId), 'progress', p.progress)

const save = makeSave(after)
console.log('makeSave saveVersion', save.saveVersion)
const json = exportSave(save)
const round = migrateToV32(importSave(json))
console.log('round trip byte-identical:', exportSave(round) === json)
try { convertV32ToV31(save); console.log('DOWNGRADE: ACCEPTED (wrong)') }
catch (e) { console.log('DOWNGRADE refused:', (e as Error).message) }
```

Output, verbatim:

```
LIVE_SAVE_VERSION 32 week 113 count 2 progress 1
REASON exploit  : "a substitute is a forward obligation, and this window opens no later than the week of the waiver"
REASON identical: "an identical substitute changes nothing this studio owes"
REASON legal    : null
ROW promise-0 WAIVED "promise-1" progress 1
ROW promise-1 null null progress 0
makeSave saveVersion 32
round trip byte-identical: true
DOWNGRADE refused: migrateToV31: cannot downgrade SaveFileV32 or discard the waived-promise link — frozen save projection cannot discard the substitute "promise-1" a waived promise was superseded by
```

Probe B, testing ONE claim in the brief that the ordering turns on (§8 finding 2):

```ts
// 733-W disposable probe B (record 726).
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { validateSaveV31, convertV31ToV32 } from '../src/core/save.js'
import { waiverAccepted } from '../src/core/promises.js'
import type { GameState } from '../src/core/types.js'

for (const name of ['part-served-p1', 'bound-open-p1', 'bound-open-p2-lead', 'distrusted-issuer', 'rival-current-p1-and-p2', 'with-edges']) {
  const raw = gunzipSync(readFileSync(`tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-${name}.json.gz`)).toString('utf8')
  const state = convertV31ToV32(validateSaveV31(JSON.parse(raw))).state as unknown as GameState
  const today = state.market.tick
  for (const p of state.promises) {
    const identical = { family: p.family, predicate: 'kind' in p.predicate ? { ...p.predicate } : { count: p.predicate.count }, windowStartWeek: p.windowStartWeek, dueWeekExclusive: p.dueWeekExclusive }
    console.log(name, p.promiseId, 'today', today, 'windowStart', p.windowStartWeek,
      'lawWouldFire', p.windowStartWeek <= today, 'outcome', p.outcome,
      '| reason:', JSON.stringify(waiverAccepted(state, p, identical as never, today)))
  }
}
```

101 rows over six T0 fixtures. **48 read `lawWouldFire false`** — every one of them UNBOUND
(`nobody took up this promise…`), i.e. not waivable for an unrelated reason. Zero rows are both
waivable and outside THE LAW. The identical-substitute reason is returned on every row where both
rules could fire.

## 8. Where 720 or the brief is wrong

**Finding 1 — record 720's CURRENT bytes still do not carry the first pass's correction.** §2 item 17
reads as though minting the substitute at `progress: 0` with `evidenceRefs: []` discharges "do not
count it again". It does not: `qualifyingTakes` re-credits at the next weekly pass. THE LAW exists
only in the T1 suite's header and in brief 732; **no numbered item of 720 states it.** 720 has now
been amended by the parent three times, and this is a fourth gap. The requirement is not in dispute
— the RECORD is behind the code. Item 11 by contrast is accurate and is implemented as written.

**Finding 2 — the brief's word "necessarily" is wrong, harmlessly.** 732 §3 says an identical
substitute "carries the original's window, which has NECESSARILY already opened, so both fire."
Nothing enforces that. `promiseFeasibility` refuses `windowStartWeek < contract startWeek` and the
promise-row validator refuses a contract that has not started, so a bound promise's CONTRACT has
always started — but a bound promise's WINDOW may still open later than today, and then THE LAW does
not fire on an identical substitute. Measured: no such row exists in the T0 corpus (probe B), so the
overlap is USUAL, not necessary. The implementation is unaffected; the doc comment says "usually".

**Finding 3 — the "`npx tsc --noEmit` must stay at 0" instruction is not satisfiable** alongside "do
not touch a test", for the reason in §6. Reported rather than worked around.

**Observation** — `bridge/schema/bridge-schema.ts:246` reads "`LIVE_SAVE_VERSION` stays 31". It is a
true historical statement about the P14B.6 slice's own scope, so it is left verbatim. A reader
skimming for the live version could misread it; it is not a defect.

## 9. Evidence limits and the next concrete action

LOGIC VERIFIED · UNITY NOT VERIFIED · NOT OWNER-ACCEPTED. No native input, no UI run, no full core
run, no evidence runner, no pre-registered prediction. The 24 inherited core failures were not
re-measured: the full suite was out of scope this pass and is now confounded by the un-swept
live-version pins in any case.

Next: the test-author's values-only V31 → V32 sweep, on this candidate, starting with
`tests/helpers/p14b2-fixtures.ts:122` and the bridge suite's `boundOpenP1()`. Only after it lands can
the B.7 suites read a clean 33/33 and a full core run mean anything.
