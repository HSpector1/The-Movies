# 731-T — the B.7 requirement suite patched on three findings from W's pass

Source `14a1489c` (branch `wip/headless-program-20260916-ts`). Brief:
`730-T-b7-red-patch-brief.md`. Independent test engineer, same author as the original suite
(evidence 725-T). Boundaries honored: no production file touched (`git status --porcelain src/
bridge/` empty throughout and at finish); no pin weakened; nothing committed, pushed, or run
through `record-check.mjs`; the full suite was not run, only the two files this patch owns plus
one archived disposable probe (below).

## File identities

| file | sha256 | lines |
|---|---|---|
| `tests/p14b7-promise-waiver.test.ts` (engine-only, patched) | `09c9f09bd00c4215c2a14b05e1fc45a4e263cce45e7f78e9c72dfb8a878fc66c` | 651 |
| `tests/bridge-p14b7-promise-waiver.test.ts` (new, bridge-only) | `e6c7ae4df13b77b7d7067e0bcc5e9a3501d04f3146e17a6ce10d8b772007a5ed` | 185 |

Before this patch: `tests/p14b7-promise-waiver.test.ts` alone, sha256 `68c76efe…` (matches the
brief's stated prefix exactly), 619 lines, 29/29 green. Test count after the patch: 28 in the
engine file + 5 in the bridge file = 33 (net +4: the group9 version-pin `it()` split into two,
+1; two new item-18 text-pin cases in group10, +2; the new exploit-pinning case in group6, +1).

## Finding 1 — the exploit, THE LAW, and what moved

**New pin.** `tests/p14b7-promise-waiver.test.ts` group6, case `730-T FINDING 1 — item 17's
substitute half (previously pinned NOWHERE): a substitute whose window opens ON the waiver week
is refused, closing the live exploit measured on this exact fixture and draft` (lines 503-543).
Reproduces the brief's exact measurement on `genuine-v31-part-served-p1` with group6's own former
acceptance draft (`windowStartWeek: today, dueWeekExclusive: today+60`, today=113). Three layers:
1. Independent oracle: `realFeasibility(...)` is REASONABLY_ACHIEVABLE (this window was already
   proven feasible by the ORIGINAL, unmoved group6 acceptance case) — isolates the refusal to THE
   LAW, not infeasibility.
2. Independent confirmation of the cause: calls the actual production `qualifyingTakes` (not a
   reimplementation) on a minimal probe with the exploit's own window, and asserts it already
   returns a qualifying take today (unfixed) — ties the pin to the named root cause
   (`promises.ts:637-641`'s `take.week < windowStartWeek` bound) rather than only to its symptom.
3. THE LAW itself: `accepted(...)` must return a refusal reason for `windowStartWeek === today`;
   `waive(...)` must throw. Then, defense in depth regardless of which function ends up enforcing
   the law: if the mint is NOT refused, the test still requires `progress === 0` and
   `outcome === null` after one `advancePromisesWeek`, i.e. it fails exactly the way the brief
   specified ("fails if a substitute is ever credited with a take that predates its own window")
   independent of implementation strategy.

**Drafts moved** (every one audited for `windowStartWeek` vs. the waiver week, per "check every
other draft"):
- group6 `PRESERVES progress and evidenceRefs` acceptance draft: `today` → `today+1`,
  `today+60` → `today+61` (part-served-p1, today=113; new window [114,174) still inside the real
  contract [104,208), measured).
- group5 isolation draft: `[60,100)` → `[71,101)` (distrusted-issuer, today=70; new window still
  inside the real contract [52,104), measured — the original brief's suggestion of simply
  `today+1..100` would have overrun the contract by 7 weeks, so the due week was pulled in too,
  not just the start).
- group3's `irrelevantDraft(today)` helper: `windowStartWeek: today` → `today+1`. Not named by the
  brief, found in the sweep: this helper backs three refusal tests whose STATED purpose is that
  "the refusal must come from the ORIGINAL's own state, not the substitute" (already-satisfied,
  already-broken, unbound). Left unmoved, `windowStartWeek === today` would ALSO trigger THE LAW's
  own refusal after the writer's second pass, so a real regression in the "refuses a
  not-evaluable() original" rule could hide behind the window law and these three tests would
  keep passing for the wrong reason — the isolation claim, not the pass/fail outcome, was at risk.

**Found in the sweep, NOT fixed, disclosed here.** group6's FIRST case (`REFUSES a substitute
identical to the original in family, class, count and window`) builds its draft as
`windowStartWeek: promise.windowStartWeek`. On `bound-open-p1`, promise-0's own window opens at
week 52, which is also that fixture's `today` (both pinned at 52 in `V31_PINS`). After THE LAW
lands, this window will ALSO independently trigger the window refusal (52 is not `> 52`), so this
case's refusal becomes doubly-caused: the "identical substitute" rule AND THE LAW. The test's
literal assertion ("refused though independently feasible") stays true and the case keeps passing
both now and after the second pass — nothing here goes red or green incorrectly — but a future
regression that deleted the "identical substitute" check specifically would no longer be caught by
this case, because THE LAW would still refuse it for an unrelated reason. I did not fix this: the
only fix is a different fixture whose own promise-0 window opens strictly after that fixture's own
tick, and this suite's own convention is explicit that T1 does not mint new fixtures and I have not
independently verified any of the other eight T0 fixtures has that shape without a live probe,
which is a bigger, riskier change than "moves a draft's week." Flagging it is the correct
disposition under this task's own instruction to expose an unsupported claim rather than paper
over it.

## Finding 2 — LIVE_SAVE_VERSION

`tests/p14b7-promise-waiver.test.ts` group9, first case renamed and re-pinned:
`LIVE_SAVE_VERSION is the value this slice's own V31->V32 step must produce (720 item 11)` now
asserts `expect(LIVE_SAVE_VERSION).toBe(32)` (was `31`). This is RED right now (see below) and
correctly so — the writer has not landed the V31→V32 bump yet. `PROJECTION_VERSION === 49` is
unchanged in value and moved (not removed) to a new case, `tests/bridge-p14b7-promise-
waiver.test.ts` group9b — it could not stay in the engine file (see Finding 3).

## Finding 3 — the typecheck split

**Measured cause, independently confirmed.** `npx tsc --noEmit` at `14a1489c` with the original
single file: 131 errors, exit 1. 13 of those errors are directly on the original file's own lines
(imports and locals); the other 118 cascade through the `bridge/` module graph (every `bridge/*.ts`
file imports its neighbors with a literal `.ts` extension — `bridge/trust.ts`, `bridge/protocol.ts`,
`bridge/schema/*.ts`, all of it — and the ROOT `tsconfig.json` has no
`allowImportingTsExtensions`, so once ANY bridge import is reachable from a root-included file,
TS5097 fires on every `.ts`-extension import bridge/ contains, plus its `ui/src/engine/adapter.ts`
dependents reached via `bridge/industry.ts` → `bridge/snapshot-build-context.ts`). This is a
stronger and simpler cause than "this file's imports happen to reach `ui/`": it is not merely
`industryPage` that is dangerous — `PROJECTION_VERSION`'s own single-hop import from
`bridge/schema/bridge-schema.ts` fails on its own import line (TS5097) with no `ui/` involvement at
all, which is why PROJECTION_VERSION's pin had to move too, not just group10/group11. I confirmed
this by tracing every bridge/*.ts import chain by hand before splitting (not by mutating
`tsconfig.json`, which the sandbox's own classifier declined as a "security test removal" when I
attempted a temporary diagnostic exclude — noted below), then by making the real split and
measuring the result directly.

**What moved to `tests/bridge-p14b7-promise-waiver.test.ts`:** group10 (bridge/trust.ts attention
row, item 18), group11 (bridge/industry.ts fold exclusion, the coordinator's 11th pin), and a new
group9b carrying PROJECTION_VERSION's pin alone. The file duplicates its own minimal fixture
loader (`boundOpenP1()`, sha256-pinned) and the Industry Pulse helper rather than importing them
from the sibling file, matching the established convention in `tests/bridge-p14b2-trust.test.ts`
(no cross-file test-helper sharing observed anywhere in this repo's test suite) — and matching the
"ladder": only the ONE fixture (`bound-open-p1`) these two groups actually use is carried, not the
whole nine-entry `V31_PINS` table.

**Item 18, row TEXT (the second header-prose defect, resolved as coverage, not just prose).**
`tests/bridge-p14b7-promise-waiver.test.ts` group10 gained two new cases: a HARD NEGATIVE (the
attention row's `reason` must not match `/\bkept\b/i` or `/\bbroken\b/i`) and a SOFT/INTERPRETIVE
case, separately labelled per interpretation I5, asserting the reason matches `/waived/i`. Both
pass right now — inspecting `bridge/trust.ts:16-20` directly, the writer's implementation already
uses a `PROMISE_OUTCOME_WORD` lookup table (not the ternary the header describes) with
`WAIVED: 'waived'` present. These two new cases are therefore pure regression pins on
already-correct behavior, not new RED. (The header's "ternary has no third arm today" phrasing,
preserved verbatim from before this patch, is now stale against the shipped implementation; I left
it as-is because the file's own established convention — see the RED MECHANISM section's present-
tense description of functions that now exist — is to preserve the historical RED-authoring
rationale rather than keep source-fact claims current. This was not one of the two header-prose
defects the brief named, so I did not treat it as in scope to rewrite.)

**Two typecheck-blocking defects found and fixed that the brief did not name.** Independent of the
bridge-extension problem, the original file's own import line
`type PromiseFamily, type PromiseFeasibilityReceipt` from `'../src/core/promises.js'` does not
typecheck (TS2459 / TS2724): both types are DEFINED in `src/core/types.ts` and only imported, not
re-exported, by `promises.ts`. Fixed by moving both to the existing `'../src/core/types.js'` type
import in the engine file. This is a genuine test-file authoring defect (mine, from the original
T1 pass), not a production defect and not caused by the bridge extension issue — `npx tsc --noEmit`
still reported it even when I traced the file's imports one at a time by hand. No production file
was touched to fix it.

**The 7 unused locals (TS6133), confirmed by direct measurement against the original file before
any other edit:** `qualifyingTakes` (96,41), `trustDrivers` (96,75), `makeSave` (102,22), `player`
(112,26), and three separate dead `const today = state.market.tick` locals (262,11 / 513,11 /
605,11 — group1's item-16 case, group8's case, and the original group11 case respectively).
Disposition: `trustDrivers`, `makeSave`, `player`, and all three dead `today` locals were removed.
`qualifyingTakes` was NOT removed — it is now genuinely used, as the independent cause-confirmation
oracle in the new exploit-pinning case (see Finding 1), which resolves the same TS6133 by giving
the import a job rather than deleting it; this is additive, not a loophole around "remove 7 unused
locals," since the intent (no more TS6133 on that name) is satisfied either way and the file is
measurably stronger for it.

**Header prose, the "New group12" defect.** Removed the false claim. The CLOSED
trust-label/driver-purity requirement (a waiver moves no trust label, mints no driver) is NOT
pinned anywhere in either file after this patch — I did not author a new `group12`. The brief
scoped this finding as a prose correction ("fix two header-prose defects"), not as new coverage,
and unlike item 18's row-TEXT correction the brief gave no explicit "pin X" instruction for this
one. The header now says so explicitly rather than silently dropping the acknowledgment: this is a
real, disclosed, open gap, not a decision I made unilaterally to skip it.

## Disposable probe (archived per record 726, not silently deleted)

One probe was written, run, and deleted during this patch, to measure the real employment-contract
intervals for the two fixtures whose draft windows moved (needed to avoid shrinking a window past
its real contract end — group5's draft would have overrun `distrusted-issuer`'s contract by 7 weeks
if I had used the brief's literal `today+1..100` suggestion unchanged). Full text, run once via
`npx vitest run`, then `rm`'d (confirmed via `git status --porcelain tests/` showing no residue):

```ts
// DISPOSABLE PROBE (730-T patch prep). Archived per record 726's rule; not part of any suite.
// Measures real contract intervals for the fixtures whose waiver draft windows move in 730-T's
// patch, so the shifted windows (today+1) still land inside the real contract.
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, it } from 'vitest'
import { validateSaveV31 } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'

function load(name: string): GameState {
  const raw = gunzipSync(readFileSync(`tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-${name}.json.gz`)).toString('utf8')
  return validateSaveV31(JSON.parse(raw)).state as unknown as GameState
}

describe('probe', () => {
  it('prints contract bounds', () => {
    for (const name of ['distrusted-issuer', 'part-served-p1', 'bound-open-p1']) {
      const state = load(name)
      const promise = state.promises.find((p) => p.promiseId === 'promise-0')!
      const emp = state.hollywood!.employment.find((e) => e.contractId === promise.contractId)!
      console.log(name, 'today=', state.market.tick, 'promise window=', [promise.windowStartWeek, promise.dueWeekExclusive], 'contract=', [emp.terms.startWeek, emp.terms.endWeekExclusive])
    }
  })
})
```

Measured output:
```
distrusted-issuer today= 70 promise window= [ 52, 92 ] contract= [ 52, 104 ]
part-served-p1 today= 113 promise window= [ 104, 194 ] contract= [ 104, 208 ]
bound-open-p1 today= 52 promise window= [ 52, 92 ] contract= [ 52, 104 ]
```

A separate attempt to run a diagnostic `tsc --noEmit` with the p14b7 file added to `tsconfig.json`'s
own `exclude` (to directly measure the bridge-vs-non-bridge error split before deciding the split
boundary) was declined by the sandbox's permission classifier as "Security Test Removal." I did not
attempt to route around this; I confirmed the same fact by tracing every `bridge/*.ts` import by
hand instead (see Finding 3), and the real post-split `tsc --noEmit` run below is the authoritative
measurement regardless.

## RED results — reproduced verbatim

`npx vitest run tests/p14b7-promise-waiver.test.ts tests/bridge-p14b7-promise-waiver.test.ts
--reporter=verbose`, run from `/Users/zacheryspector/The-Movies-headless-program`:

```
Test Files  1 failed | 1 passed (2)
     Tests  2 failed | 31 passed (33)
```

The two failures, exactly the two the brief said must be red, for exactly the stated reasons:

```
FAIL |core|  tests/p14b7-promise-waiver.test.ts > P14B.7 group6 — identical-substitute refusal,
progress/evidenceRefs preserved, a stated outcomeCause > 730-T FINDING 1 — item 17's substitute
half (previously pinned NOWHERE): a substitute whose window opens ON the waiver week is refused,
closing the live exploit measured on this exact fixture and draft
AssertionError: THE LAW: a substitute window opening ON (or before) the waiver week must be
refused: expected null not to be null
 ❯ tests/p14b7-promise-waiver.test.ts:524:111

FAIL |core|  tests/p14b7-promise-waiver.test.ts > P14B.7 group9 — Save V31 -> V32:
supersededByPromiseId opens null, downgrade refuses non-null > LIVE_SAVE_VERSION is the value this
slice's own V31->V32 step must produce (720 item 11)
AssertionError: expected 31 to be 32 // Object.is equality
 ❯ tests/p14b7-promise-waiver.test.ts:608:31
```

The exploit failure's message (`expected null not to be null`) confirms `accepted(...)` currently
ACCEPTS the exploit draft (no refusal reason), i.e. the exploit is live in the currently-landed
implementation exactly as measured by W — this is not an import-resolution or fixture-integrity
failure; the two assertions immediately BEFORE the failing line (the `realFeasibility` oracle and
the direct `qualifyingTakes` cause-confirmation) both passed first, so the failure is isolated to
the one law under test. The V32 failure (`expected 31 to be 32`) confirms `LIVE_SAVE_VERSION` is
still 31 in the current source, i.e. the writer has not landed the bump.

All other 31 cases passed, including every drift-repaired draft (group3, group5, group6's
acceptance case) and all five bridge-file cases (group9b, group10 ×3, group11).

## `npx tsc --noEmit` — whole repo

Before this patch (measured against `14a1489c` with the original single file in place): **131
errors, exit 1**.

After this patch: **0 errors, exit 0** (`npx tsc --noEmit`). Also ran the second half of
`npm run typecheck`, `npx tsc -p ui/tsconfig.json --noEmit`: **0 errors, exit 0**. Neither command
was modified to reach this result — `tsconfig.json` is byte-identical to `14a1489c` throughout (the
diagnostic exclude attempt above was declined and never applied).

## Things this brief gets wrong or leaves incomplete

1. **The root cause is broader than the two examples it names.** The brief frames Finding 3 as "the
   trust.ts attention row, the industry.ts fold exclusion, anything importing bridge/" as if the
   first two were the load-bearing examples and the parenthetical was a soft catch-all. In fact the
   measured cause makes the parenthetical the WHOLE story: `PROJECTION_VERSION`'s bare import from
   `bridge/schema/bridge-schema.ts` fails on its own line with no `ui/` cascade needed at all, so it
   HAD to move regardless of whether `bridge/trust.ts` or `bridge/industry.ts` were involved. The
   brief's own Finding 2 text ("keep PROJECTION_VERSION === 49... and pin LIVE_SAVE_VERSION ===
   32") reads as if PROJECTION_VERSION's assertion could simply stay put in group9; it could not,
   for a typecheck reason Finding 2's text does not anticipate. I resolved this by treating "anything
   importing bridge/" as the controlling rule and splitting group9's single test into two, one per
   file — consistent with both findings, but the brief itself does not connect them.
2. **"Check every other draft" surfaced a real, disclosed, unfixed gap** (group6's identical-
   substitute case, above) that the brief's specific instructions do not cover and that I judged out
   of scope to fix given the suite's own "no new fixtures" constraint. The brief's boundary section
   does not anticipate a case where the RIGHT fix requires fixture-authoring authority T1 does not
   have; I have surfaced it rather than silently leaving it undocumented or unilaterally minting a
   fixture.
3. **Everything else in the brief held up.** The measured exploit trace, the chosen law
   (`windowStartWeek > waiverWeek`), the V31→V32 provenance and the "T1's own bad instruction"
   framing (I did not check the literal wording of the original T1 brief myself, but the pin I am
   replacing is verifiably a pin the current source contradicts, per 720 item 11 and the
   nine-fixture T0 provenance both already cited in this suite's own header before I touched it),
   the exact 7-unused-locals count, and the 131/0 typecheck delta all reproduced exactly as stated
   once independently measured.

## Scope note

Not run: the full test suite, `record-check.mjs`, native/Unity, any UI/browser surface. This patch
touches only `tests/p14b7-promise-waiver.test.ts` and the new `tests/bridge-p14b7-promise-
waiver.test.ts`; `git status --porcelain src/ bridge/` is empty. The two RED cases are expected to
turn green only after the writer's second pass (THE LAW in `src/core/promises.ts`'s
`waiverAccepted`, and the V31→V32 save migration bump) — no further action on this suite is taken
or required from this seat until that pass lands.
