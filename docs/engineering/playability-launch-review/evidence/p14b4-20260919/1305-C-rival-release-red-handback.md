# 1305-C: R3 rival-release RED handback

Independent-test-engineer authored, mode IMPLEMENT (staged test source + evidence only — no
live-tree edit, no execution). Worktree `/Users/zacheryspector/The-Movies-headless-program`,
branch `wip/headless-program-20260916-ts`, published HEAD `993e6b010e7406ea783c2bd5cb420d7fc148aaad`.
Run environment: static source reading only (Read/Bash for inspection, no vitest/tsc/node/vite-node
executed against project code, per the assigned mode's explicit prohibition — the 1302 broad gate
was reported in progress). One exception, disclosed: `gzip`/`python3 -c "import gzip,json"` was
used twice to peek at the byte layout of two already-committed fixture files
(`tests/fixtures/p14/genuine-v38-pre-p3/genuine-v38-p3-natural-week208.json.gz`) — this is file
inspection with generic OS/stdlib tools, not execution of any TypeScript/JavaScript project source,
and is disclosed here in full for the record.

## Status: DONE (all three assigned test files + this handback staged; two strategy leaves and
one R1 leaf explicitly STOPPED and reported, not silently omitted — see below)

## Staged files (create-only, under `E/1305-stage/` and `E/`, `E` =
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/`)

| Path (relative to repo root) | Bytes | SHA-256 |
|---|---:|---|
| `E/1305-stage/tests/p14r3-rival-release.test.ts` | 23116 | `873116352ca6d56a49f3effb9002da3588ac9c5371d6892db3785a5d10becfe1` |
| `E/1305-stage/tests/p14r3-save-v41.test.ts` | 14808 | `7ba8a00049e1c11369bb3c0f7bdd7ba18c1142cada04be39c3166b60a620e7c0` |
| `E/1305-stage/tests/p13b-rival-scientist-staffing.test.ts` | 8058 | `a213f524e1de7115b8f66955606359d12340771240518da596aefc9e5a890e4f` |
| `E/1305-C-rival-release-red-handback.md` | (this file) | — |

Bytes/SHA-256 above are the FINAL values, taken after one self-review pass on
`p14r3-rival-release.test.ts` that removed a fragile cash-delta assertion (same-week
`studioRevenue`/other credits could have made it false-fail independent of the real R3 defect)
and added two sanity assertions to the condition-(b) leaf (isolating that condition from
(a)/(c) explicitly, matching the happy-path leaf's own rigor) — both are ordinary authoring
self-checks, not corrections to a defect found by execution (none occurred).

Bytes/SHA-256 computed via `wc -c` / `shasum -a 256` immediately after writing, 2026-09-28.

None of the three test files were executed. Expectations below are derived from 1305-A (frozen
parent proposal), 1305-B (independent contract-auditor review, REFINE + 3 amendments) and 1305-F
(parent adoption, amendments 1-3 controlling), all read in full, plus direct source reads of
`hollywoodTick.ts`, `hollywood.ts`, `hollywoodTypes.ts`, `hollywoodValidation.ts`, `rivalResearch.ts`,
`hollywoodStartingData.ts`, `employment.ts`, `talentMarket.ts`, `professionTransitions.ts`,
`careerLifecycle.ts`, `save.ts`, `types.ts`, and the precedent test files `p14a1-rival-trigger.test.ts`
and `bridge-p13b-s8-rivals.test.ts` (both read in full).

---

## File 1: `p14r3-rival-release.test.ts` — leaf-by-leaf

Fixture: `p13aGeneratedStudio()` (harness default seed `p13a-core-causal-01`), row-2 rival
(`ROW2`), founding craft employee `person-${ROW2}-5`. Confirmed by source read: row 2 enters
week 0 (`RIVAL_ARRIVAL_WEEKS[1]===0`), 208-week founding contracts for all six roles starting
week 0, `HOLLYWOOD_DECISION_WEEKS===1` so `staff()`/`decide()` run every week. Synthetic
surplus mechanism (the ONE fabrication in every non-skipped leaf): a single labeled
`Talent.role` rewrite of this craft employee, `'craft' -> 'actor'`, nothing else touched.

| Leaf | Seed/week/rival/person | Expected RED cause today |
|---|---|---|
| Decision + effects (happy path) | `p13a-core-causal-01`, week 20, row-2 rival, `person-${ROW2}-5` | `staff()` today has NO release logic at all (confirmed: read `hollywoodTick.ts:93-174` in full, no charge/end/receipt code exists for any own-employee not filling a slot). Every assertion after `tick()` fails: `period.movements.termination` is `undefined` (key doesn't exist on `RivalFinancePeriod` — `hollywoodTypes.ts:53-55`); the employment row is never ended (`row.endedWeek` stays `null`); no end receipt is ever appended; `next.freeAgents` never contains the craft id (nothing in `finishHollywoodWeek` today unions early-terminated rival rows — only `endWeekExclusive<=week` rows, `hollywoodTick.ts:374`). |
| Condition (b) fails (week 190, 18 weeks remain) | same seed/rival/person | Currently trivially GREEN, not RED — the person stays employed today for the SAME reason R3 doesn't exist (there is no release to prevent). This leaf will only become meaningful once R3 exists; it is a **negative-space assertion** that is expected to already pass before and after a correct implementation, and is included per the task's explicit "one leaf per failed condition" instruction. Flagged here so the reviewer does not mistake an already-green leaf for a broken RED test. |
| Condition (a) fails (bounded search, weeks 1-150) | same seed/rival/person; found week is NOT hand-picked — the test scans `industryBusyTalentIds` on the unmodified fixture and throws with a clear message if no week in [1,150) qualifies | **UNVERIFIED REACHABILITY.** I could not execute to confirm the rival's founding craft employee is ever naturally busy (seated on the rival's own single-production-at-a-time pipeline, `hollywoodTick.ts:187`) within this bound. If the search fails to find a week, the leaf throws its own diagnostic (not a normal assertion failure) — this is a distinguishable, self-reporting outcome, not a silent skip. **Parent action if this throws:** either accept "condition (a) is not independently leaf-tested" and rely on the R2 precedent's own busy-set correctness, or re-run with a wider bound. |
| Condition (c) (promise) | **STOPPED — `it.skip`, not written** | `attachPromise` (`promises.ts:690-705`) requires an existing proposal from issuer to person, which under P14A only exists inside an OPEN CASE (renewal window, remaining≤12) — structurally incompatible with condition (b) (remaining>26) on the SAME contract. Reaching it needs either a full public proposal/settlement cycle for a rival (not confirmed to exist as a player-drivable public route) or a forged promise/proposal pair, which is fabrication beyond the one labeled role rewrite. **Parent must provide:** confirmation of a public route to attach a rival-issued promise that survives into a later, longer contract, or explicit authorization to fabricate a promise/proposal pair for this one leaf. |
| Condition (d) (cash) | **STOPPED — `it.skip`, not written** | Founding capital $20M-$38M vs. ~$1e5/week operating cost (companion §3.5 E4's own worked MID-team figure) — reaching "cash within one termination charge of reserve" via ticks alone is not reachable within any bound I could state without executing the simulation to check. **Parent must provide:** either a genuine natural week (on some seed) where a specific rival's cash is already known to be near its reserve floor, or explicit authorization to hand-set `account.cash` for this one leaf. |
| Scientists never released | `p13b-s8-bridge-probe-01`, week 265, `businesses[0]` (r01) | Reuses the ALREADY-MEASURED, ALREADY-LANDED fact from `tests/bridge-p13b-s8-rivals.test.ts` (read in full, its own header states "probed 2026-09-18 via `npx vite-node`... never invented"): 4 Scientists seated week 265. This leaf's own assertions (no scientist ends this week, no rival termination receipt) are trivially true TODAY (nothing releases anyone yet) — same negative-space caveat as condition (b) above; it becomes a meaningful regression guard once R3 exists. |
| Worlds without surplus, byte-identical | `p13a-core-causal-01`, weeks 1-150, all 4 founding rivals | Comparison method stated in-file: R3's own logic (once implemented) must find zero surplus on this natural world (own-employee-per-role counts never exceed `RIVAL_TEAM_ROLES` targets — checked directly, not assumed) and therefore write zero rival termination receipts. This does NOT depend on R3 being absent — it re-derives from the same receipts/rows R3 itself would write, and is trivially true today for the same reason as the two negative-space leaves above. |

## File 2: `p14r3-save-v41.test.ts` — leaf-by-leaf

Genuine V40 input: reconstructed at test-run time from the already-committed genuine V38
corpus `tests/fixtures/p14/genuine-v38-pre-p3/genuine-v38-p3-natural-week208.json.gz` (4 rival
businesses, 5 finance periods each, confirmed by direct `gzip`+`json` inspection, disclosed
above) via the already-landed, version-pinned `migrateToV40` chain — **no new fixture file was
minted**, deliberately deviating from the task's literal "write against a prospective fixture
path" fallback because a strictly better option existed (see the file's own header,
"GENUINE V40 INPUT — DEVIATION NAMED"). If 1305-D judges this insufficient, the fallback is:
mint `tests/fixtures/p14/genuine-v40-pre-r3/` at the last Save40 writer, exactly per the
original instruction — **parent prerequisite, conditional on 1305-D's call.**

| Leaf | Expected RED cause |
|---|---|
| `LIVE_SAVE_VERSION === 41` | Fails today: `save.ts:6538` pins it to `40`. |
| `makeSave` stamps 41 | Fails today: stamps `40`. |
| `migrateToV41`/`convertV40ToV41`/`convertV41ToV40`/`validateSaveV41` exist and dispatch correctly | **Import-level RED**: none of the four exist in `save.ts` at HEAD `993e6b01` (confirmed absent by `grep -n` against the full file). Whether this surfaces as a module-load `SyntaxError` (real ESM) or an `undefined`-call `TypeError` (vitest/esbuild transform) depends on the harness's exact module resolution, which was not executed to confirm — either is a legitimate, non-spurious RED per the "RED-first tests import from a missing module" caution, and every one of the four names is actually CALLED in the file (not merely imported unused), which avoids the "spurious pass" failure mode that caution warns about. |
| fresh V41 validates | Same import-level RED; would also need `validateSaveV41` to correctly seed `termination:0` via `newFinancePeriod`. |
| 40->41 adds ONLY `termination:0` | Same import-level RED; the leaf's own byte-diff (strip the one new key, restamp `saveVersion:40`, deep-equal against the original V40 envelope) is the precise mechanism for "nothing else changes." |
| frozen `validateSaveV40` still admits its own version | **Not RED** — this is a regression pin, already true today (V41 doesn't exist yet, so V40 obviously still validates); included because the task asked for "frozen readers unchanged" to be checked, flagged here so it isn't mistaken for a broken RED assertion. |
| 41->40 downgrade lossless (zero movements, no receipt) | Same import-level RED. |
| 41->40 downgrade refused (forged nonzero `termination` movement, no receipt) | Same import-level RED; construction is a direct JSON tamper of an already-migrated envelope (established idiom in this codebase, see `p14c4-save-v35.test.ts`'s own D3/D4 tamperings) — NOT the "no fabricated state" stop rule, which is scoped to the OTHER file's live-simulation leaves only. |
| `validateSaveV41` refused (forged rival termination receipt, matching movement deliberately left at 0) | Same import-level RED. **Named uncertainty:** the exact validator clause that fires (movement reconciliation vs. some other structural check) is not pinned — the test asserts `.toThrow()` generically, not a specific message regex, and says so in its own comment. If it comes back GREEN post-implementation for an unrelated reason (or doesn't throw at all), that is a reportable finding per the file's own comment, not a silently accepted pass. |

---

## File 3: `p13b-rival-scientist-staffing.test.ts` — leaf-by-leaf

Seed `p13b-s8-bridge-probe-01` (reused verbatim, not searched), player Research Laboratory
committed week 0, advanced to week 265 (also reused verbatim from
`tests/bridge-p13b-s8-rivals.test.ts`, which states this route was itself measured via
`vite-node`, not invented). Rival `businesses[0]` (r01).

| Leaf | Expected outcome |
|---|---|
| Precondition (4 Scientists employed, operational Laboratory) at week 265 | Expected to PASS (citing an already-measured, already-landed fact from a sibling file's own header — not independently re-verified by execution in this pass). If it fails, that is itself a finding: either the cited fact has drifted since 2026-09-18, or my re-derivation of it (same seed, same placement call, same week) has a mistake — the two are distinguishable by which specific `expect` fails. |
| Deficit-zero across weeks 265-270 (affordable weeks only) | **This is a genuine witness, not a guaranteed-RED test.** If 1305-F's hypothesis is correct (retained-into-deficit-slots under-hires), this fails (RED, witnessing the defect). If the hypothesis is wrong for this particular seed/window, this passes GREEN — which is itself informative, not a broken test. Derivation note (disclosed, not hidden): `rivalScientistDemand`'s return value only proves `employed >= min(capacity,demanded)` directly; exact equality relies on the ADDITIONAL fact that the mechanism cannot overshoot its own weekly target (argued in-file, not independently re-proven). |
| Self-reporting stop condition | If NO week in [265,270] has cash above `reserve + $2,000,000` (an explicitly named, untuned margin), the leaf throws its own diagnostic distinguishing "affordability precondition never met" from "witnessed no defect" — per instruction, this is not extended into a seed or route search. |

---

## Existing-test sweep input (for the later pin sweep, reusing the 1301 classification style)

Grep commands run (read-only, against `tests/`, no code executed):

- `grep -rl "RIVAL_MONEY_KINDS" tests/` → **0 files.** No existing test imports or asserts
  against the `RIVAL_MONEY_KINDS` roster directly. Widening it to 15 kinds (adding
  `termination`) has no direct pin conflict in `tests/`.
- `grep -rln "LIVE_SAVE_VERSION).toBe(40)" tests/*.test.ts` → **20 files**, each with an exact
  live-version literal pin that will need bumping to `41` once the parent's commit lands:
  `tests/bridge-p14a2-market.test.ts`, `tests/bridge-p14a3-world.test.ts` (two occurrences,
  same file), `tests/bridge-p14b1-promises.test.ts`, `tests/bridge-p14b2-trust.test.ts`,
  `tests/bridge-p14b3-promise-command.test.ts`, `tests/bridge-p14b4-runtime47-compatibility.test.ts`,
  `tests/bridge-p14b5-relationships.test.ts`, `tests/bridge-p14b6-relationship-read-models.test.ts`,
  `tests/bridge-p14c2rm-runtime.test.ts`, `tests/bridge-p14c2s-scientist-runtime.test.ts`,
  `tests/bridge-p14c3-runtime.test.ts`, `tests/p14b4-save-v30-compatibility.test.ts`,
  `tests/p14b5-save-v31.test.ts`, `tests/p14b7-promise-waiver.test.ts`,
  `tests/p14c1-materialized-aging.test.ts`, `tests/p14c2a-save-and-settlement.test.ts`,
  `tests/p14c2b-save-v36.test.ts`, `tests/p14c3-save-v38.test.ts`, `tests/p14c4-save-v35.test.ts`,
  `tests/p14p4p5-opportunities.test.ts` (this last one via `saves.LIVE_SAVE_VERSION`).
  **Not swept here:** `tests/p14b8-waiver-surface-oracle.test.ts:177` pins
  `LIVE_SAVE_VERSION` to `38` **deliberately** ("B.8 moves no save law; a bump here is a plan
  amendment, not an implementation detail" — its own comment) — do **not** bump this one
  reflexively; and `tests/bridge-p14b5-relationships.test.ts:404` uses
  `toBeGreaterThan(30)`, which needs no change.
- `grep -n "movements).*length\|Object.keys(.*movements" tests/*.test.ts` → one exact-count
  hit, `tests/p13b-s8-finance.test.ts:178`:
  `expect(Object.keys(v26Period.movements)).toHaveLength(10)`. **Checked, no impact**: this
  pins the FROZEN V26-era shape (ten kinds, pre-S8), not the live roster — widening the live
  `RIVAL_MONEY_KINDS` to 15 does not touch this assertion, which is about a historical era's
  frozen validator, not today's.
- `grep -rln "RivalMoneyKind\b"` (the TYPE, not the const array) → `tests/p13b-s8-save-v27.test.ts`,
  `tests/p13b-s7-independence.test.ts` — both reference the type/name in **comments only**
  (confirmed by direct read of the matched lines), not in an executable exact-key assertion;
  no pin risk found.
- No test anywhere asserts an exact-key roster of `RivalFinancePeriod.movements` at the LIVE
  (V27+) shape via a literal array or `toHaveLength(14)` — only the one frozen-era `10` pin
  above.

**Net for the parent's pin sweep:** 20 files need their `LIVE_SAVE_VERSION` literal bumped from
40 to 41 (list above, exact paths); the `RIVAL_MONEY_KINDS` widening itself has no existing
test-side pin to update.

---

## Summary of what the parent must provide / decide

1. **Condition (c) leaf (promise) and condition (d) leaf (cash)** in
   `p14r3-rival-release.test.ts`: explicitly STOPPED (`it.skip`) per the stop rule. Parent must
   either supply a genuine public route (a rival-authored promise surviving past its
   originating case; a rival naturally near its cash reserve floor) or explicitly authorize a
   named, minimal fabrication beyond the one labeled role rewrite for these two leaves only.
2. **R1 re-hire-pricing leaf**: not written at all (not even skipped as a placeholder, since it
   was judged out of scope for a different reason — see file 1's header, INTERPRETATIONS/STOP
   RULE section). `releaseFloor`/`studioOffer` (`talentMarket.ts:209-259`) are independently
   confirmed, by direct source read, to already be releasing-studio-generic — this is a
   SEQUENCING gap (R1 pricing needs a real prior release to observe), not a missing production
   fact. Recommend testing R1's rival path in the post-implementation GREEN/neighbor gate,
   where a real release from the newly-landed R3 can seed a genuine termination receipt,
   rather than in this RED pass.
3. **Condition (a) leaf (busy)**: a bounded (1-150 week), self-reporting natural search: may
   throw its own diagnostic instead of exercising R3 if the rival's founding craft employee is
   never naturally busy in that window — reachability was not confirmed by execution.
4. **Save41 genuine-V40 input**: reconstructed from the existing V38 corpus via
   `migrateToV40`, not a new minted fixture — flagged as a DEVIATION from the literal
   instruction for 1305-D to explicitly accept or reject; fallback path named if rejected.
5. **Pin sweep**: 20 exact `LIVE_SAVE_VERSION` file pins enumerated above, ready for the parent
   to bump in the same commit that lands R3+Save41, reusing the 1301 classification style. One
   deliberately-frozen `38` pin (`p14b8-waiver-surface-oracle.test.ts`) must NOT be swept.

## What this handback does not claim

No test in this batch was executed. "RED" above is a derived expectation from reading
`hollywoodTick.ts`/`hollywood.ts`/`hollywoodValidation.ts`/`save.ts` at HEAD `993e6b01` and
confirming the relevant symbols/logic do not exist, not an observed failure. The scientist
witness (file 3) is explicitly NOT guaranteed to fail — it is an honest measurement, and a
GREEN result there is a legitimate, informative outcome, not a defect in the test.
