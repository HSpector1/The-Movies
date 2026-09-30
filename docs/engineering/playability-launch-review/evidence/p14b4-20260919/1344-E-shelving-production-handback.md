# 1344-E: rival screenplay shelving production handback (D-1329-1, Save43)

Role: sim-core, the single production writer. Authority: Owner ruling D-1329-1 ([1340-O](1340-O-owner-rulings-20260929.md)),
charter [1344-A](1344-A-rival-screenplay-shelving-charter.md) as amended by [1344-F](1344-F-parent-shelving-charter-adoption.md),
parent decisions [1344-X2](1344-X2-shelving-red-dry-run-and-decisions.md) and [1344-F2](1344-F2-parent-response-to-1344-D.md),
RED r2 [1344-shelving-red-r2.patch](1344-stage/1344-shelving-red-r2.patch).

**Verdict: PARTIAL.** The production implements the whole charter and Save43. Over RED r2 it passes 44 of 51 leaves.
The 7 failing leaves are test defects: each fails on a premise or an assertion that a lawful implementation cannot meet,
and each passes on this candidate with the one correction named in §5 (scratch probes, run on the candidate). No test was
edited. The next step is a RED r3 from the test author, not a production change.

## 1. Base check

- BASE at start: `58d485a1c48199e1049e267ceafbe3751544586b` (`git rev-parse HEAD`). RED r2 sha256
  `3575ee67777c3f7176f4aa292fc7df51ccd37fca9b0a481de190822ab3d7f63b`, applied cleanly; the resulting
  `tests/p14d1-rival-shelving.test.ts` blob is `d786f73e…`, the blob 1344-C2 recorded.
- HEAD moved during the task, to `37d70170` (P15A.1 `sharedMarket.ts`, P15A.2 `powerRanking.ts`, 24 new `tuning.ts`
  lines) and then to `3329b1f5` (docs only).
- [1344-D2](1344-D2-shelving-red-r2-review.md), which the brief names as the RED r2 ACCEPT, is not in the evidence
  directory at any of those three HEADs. I relied on the brief's statement of it.
- In the real repository I wrote only the six handback files in §9.

## 2. Method

1327-C scratch method, as in the brief: tree `scratchpad/1344-prod/tree`, base `7708c6c`, red-r2 `d62a76e`, then one
scratch commit per step: `d00105f`, `2c33ab8`, `096e699`, `6427745`, `8e63551`. Each step patch is a full diff of `src/`
against red-r2; no path under `tests/` differs (`git diff d62a76e 8e63551 -- tests` is empty).

Two more scratch trees:
- a worktree at red-r2 (unchanged HEAD source) for the baseline type gates and the HEAD side of probe P4;
- `tree-head2`, built the same way at `37d70170`, with red-r2 and the step-5 patch, which reran the RED files and all
  three gates on the moved HEAD.

**TUNING anchor.** My first patch set placed the three constants after `HOLLYWOOD_POLICY_PREFERENCE_COST`. At
`37d70170`, the POWER_RANKING block occupies those lines, so steps 2-5 no longer applied. I moved the block to follow
`HOLLYWOOD_DECISION_WEEKS`, whose context is identical in both bases, and replayed steps 3-5 unchanged. No other file
changed. The src tree of `58d485a1 + red-r2 + step5` (temporary index) equals the scratch tree:
`3dfc43fda1ca2bef98d7c16ecc2ffdc326d1d342`.

## 3. Steps (line numbers are in the final tree)

| Step | Content | Lines, files |
|---|---|---|
| 1 | Chooser search | 55, 1 |
| 2 | Law in `decide`, receipt, identity switch, chart output | 304, 7 |
| 3 | Save43-era validation | 391, 7 |
| 4 | Save43 | 1,210, 10 |
| 5 | Readers, `rivalPromiseProjectCandidates` | 1,334, 13 |

**Step 1.** `hollywoodPolicy.ts:40` adds `searchIndustryPackages(input, policy, options)`, which returns
`{ choice, affordable, unaffordable, viable }`. It counts `:62` (cash gate: unaffordable or affordable) and `:74`
(viability gate passed). `:83` `chooseIndustryPackage` keeps its signature and returns `.choice`. No behaviour changes.

**Step 2.**
- `tuning.ts:30-35`: the three constants, with the provisional-tuning comment.
- `hollywoodTypes.ts:97` `ScreenplayShelving`, `:119` `RivalBusiness.screenplayShelving`, and `:138` the
  `screenplayShelved` receipt.
- `hollywood.ts:206`: `enterRival` mints the empty state.
- `productionIdentity.ts:112`: the switch case, which names no production.
- `hollywoodTick.ts`:
  - `:213` `evaluate` classifies one opportunity as `staffingBlocked`, `viable`, `cashBlocked` or
    `economicRejection`. It calls `chooseIndustryPackage` exactly as before, so the existing and RED spies observe
    the same calls. On a refusal it calls `searchIndustryPackages` with the same arguments and reads `unaffordable`.
  - `:239` `greenlight` is the old greenlight body, moved unchanged.
  - `:259-282` is the ready loop. A greenlight clears the count. Only an economic rejection counts, capped at 13.
    `:270` holds the promise guard: an open promise from this studio whose `projectOpportunity` names the screenplay.
    A shelving (`:275-281`) removes the ordinal from the index and keeps status, ScriptProject and cost row. It moves
    no money, adds `{ordinal, week, retryWeek: week+26}`, sets the hold to `week+13` and appends the receipt.
  - `:286-299` is the retry (Amendment 1). With no production and a free slot, the loop takes the lowest-ordinal due
    entry and reads it directly. A viable package appends the ordinal (sorted), removes the entry, then greenlights.
    An economic rejection sets `retryWeek = week+26`. A blocked retry changes nothing. At most one retry runs per
    decision.
  - `:302` is the commission hold.
  - `:460`: chart output counts `produced` screenplays plus the unchanged authored term. When nothing is shelved this
    equals the old count. It lands in step 2 because the step that starts shelving must keep the chart equal to the
    released films.
  - `hollywoodValidation.ts` carries an interim `screenplayShelved: undefined` so step 2 type-checks. Step 3 replaces
    it.

**Step 3.** All in `hollywoodValidation.ts`:
- `:72` new trailing parameter `rivalShelving = false`;
- `:228` business key, era 43 only;
- `:347-368` shape checks:
  - version 1, both lists sorted and unique by ordinal, and an integer hold;
  - each rejection names an active `ready` ordinal, with a count in `[1, 13]`;
  - each shelved entry names a `ready`, non-active ordinal, with `week <= tick` and `retryWeek > week`;
- `:369` the frozen rule becomes "unproduced ⇔ active or shelved" (exclusive by `:347-368`);
- `:477` receipt keys, era 43 only;
- `:536-544` each receipt names a costed screenplay of its rival with the same `conceptId`, has
  `integer(rejections, 1)`, and names a screenplay that is either shelved now at the receipt's week or no longer
  `ready` (retried into a greenlight);
- `:549` at most one receipt per studio and screenplay;
- `:578-581` every shelved entry has exactly one receipt at its week.

Every message names shelving, so each validator leaf's pattern matches the real cause.

**Step 4.** `save.ts`:
- `SaveFileV43`, `LiveSaveFile`, the `SaveFile` union, and `validateSave` handling 43;
- `LIVE_SAVE_VERSION` 43 (`:6560`), and `makeSave` stamping 43 (`:6564`);
- a V43 line ahead of the V42 line in all 37 frozen `migrateToVN`, plus `migrateToV41`, `migrateToV42` and
  `migrateToLive` (`:10138`, now `migrateToV43`);
- the Save41 pattern: `rivalShelving` threaded through all 14 frozen validator signatures and their 14 calls into
  `validateHollywood`, and `proveProfessionSave(…, rivalShelving)` (`:10434`, `:10444`);
- `validatedLiveProfessionContext` proves the live state with the flag on (`:10461`);
- `validateSaveV42Era` (`:10626`); `validateSaveV42` is unchanged in behaviour;
- `validateSaveV43` (`:10668`) and `convertV42ToV43` (`:10678`), which adds `[]`, `[]`, `0` to every business;
- `convertV43ToV42` (`:10689`), which validates, then refuses by name a receipt, a rejection count, a shelved entry or
  a nonzero hold, and drops only the empty state;
- `migrateToV43` (`:10706`);
- `convertV18ToV19` strips the entry-minted empty state (`:8071-8076`), as it already strips `termination`;
- `projectHollywoodPreV27` refuses the receipt (`:8806-8808`).

Also `types.ts:2298` and `:2536` (`GameStateV43`), and the `index.ts` exports.

**Step 5.**
- `hollywoodTypes.ts:142` `shelvedScriptIds(hollywood, studioId)`: a rival's unproduced screenplays outside its
  active index. It is empty for the player.
- `promises.ts:281-285`: `unproducedScripts` excludes them. `:405` and `:414`: so does the feasibility digest list.
  `:445` appends `['shelvedScripts', ids]` only when the set is non-empty, so every other digest stays byte-identical.
- `opportunityPromises.ts:140-144`: `impossiblePath(id, 'the named script project is shelved')` for project and genre
  predicates.
- `talentMarket.ts:1444` `rivalPromiseProjectCandidates(state, studioId)`: non-produced, non-shelved, sorted by id,
  first two. `:1474` `authorRivalPromise` uses it, so its genre candidates derive from the same list.

**Design choice.** Readers derive "shelved" from the active index; they do not read `screenplayShelving.shelved`. On
any valid Save43 state the two are equal (validator `:347-369`). The RED digest leaf removes ordinal 6 from the index
without writing a shelved entry, and only the derived definition changes that digest.

## 4. Checks run

**RED r2**, on the final tree `8e63551`: `node_modules/.bin/vitest run --project core tests/p14d1-rival-shelving*.test.ts`,
exit 1: **44 passed, 7 failed (51)**, 43.0 s wall.

| File | Result | Duration |
|---|---|---:|
| `p14d1-rival-shelving-save-v43.test.ts` | 18/18 | 11.5 s |
| `p14d1-rival-shelving.test.ts` | 21/28 | 28.1 s |
| `p14d1-rival-shelving-natural.test.ts` | 5/5 | 37.5 s |

Budgeted leaves (the three files ran in parallel):
- natural route: 12.4, 6.0, 6.2 and 5.9 s against 60 s; the same four took 2.5-4.4 s when their file ran alone;
- determinism: 7.0 s against 120 s;
- genesis-to-100: 7.9 s against 30 s;
- save/load mid-count: 7.2 s against 20 s;
- stalled route: 3.4 s against 20 s.

Every default-budget leaf ran under 5 s.

The same command on `tree-head2` (`37d70170 + red-r2 + step5`) gives 44/7, with the same 7 FAIL lines, in 37.6 s.
Before the TUNING move the result was also 44/7, with the same failures.

**Type gates** (`tsc --noEmit -p tsconfig.json`, `tsc -p ui/tsconfig.json --noEmit`, `tsc -p tsconfig.bridge.json --noEmit`):

| Gate | Baseline red-r2 at 58d485a1 | Final at 58d485a1 | Final at 37d70170 |
|---|---:|---:|---:|
| root | 2 | 21 | 19 |
| ui | 0 | 2 | 2 |
| bridge | 0 | 2 | 2 |

- No error is in `src/`, `bridge/` or `ui/src/`.
- The two baseline root errors are the P15A.1 RED importing the then-missing `src/core/sharedMarket.js`. They are gone
  at `37d70170`.
- Every new error has the form `Argument of type 'SaveFileV43' is not assignable to parameter of type 'SaveFileV42'`
  (TS2345/TS2322). These are live saves passed to V42-named types in tests, the Save43 pin sweep (1344-M), which the
  brief excludes. Root:
  - `tests/contracts/v14-boundary-guards.contract.test.ts`;
  - helpers `p14c2b-fixtures`, `p14c3-canonical-rival-fixtures`, `p14c4-fixtures`;
  - `p06a-w1-release-authority`, `p12-starting-world`, `p14b4-material-evidence-core`, `p14c2rm-writer-continuation`;
  - `p14c3-cohort-transition`, `p14c3-dual-extensions`, `p14c3-offmenu-extensions`, `p14c3-profession-history`,
    `p14c3-promise-digest-continuity`;
  - `p14p3-directing-promises` ×2, `p14p4p5-opportunities`, `p14p4p5-screenplay-status`, `save` ×2.
- UI and bridge: `tests/helpers/p14c2b-fixtures.ts:69` and `tests/helpers/p14c4-fixtures.ts:71`.

**Apply check** (scratch `GIT_INDEX_FILE` only): `read-tree <base>`, `apply --cached` red-r2, then `apply --cached --check`
for each step patch. All five pass on `58d485a1`, `37d70170` and `3329b1f5`.

**Bridge and Unity.** No change. The Bridge type gate has no source error, `bridge/industry.ts:133` drops the new
kind, and the projection version is unchanged.

## 5. The seven failing leaves (line numbers in `tests/p14d1-rival-shelving.test.ts`)

Each probe below re-runs the leaf on the candidate with only the named correction. All probes passed (probe files and
logs are in `scratchpad/1344-prod/probe-out/`; none is in any patch).

1. **stalled route, `:347`**: expected length 1, got 2.
   - Cause: at week 142 four screenplays shelve: r01 `script-0006` and `script-0011`, and r02 `script-0011` and
     `script-0013`. The `:347` filter matches `scriptProjectId` alone, but screenplay ids are per studio
     (`canonicalScriptProjectId(ordinal)`), so r02's `script-0011` matches too.
   - Correction: add `r.studioId === RIVAL_R01`.
   - Probe P1: with the filter, every other assertion passes. The count is 12 the week before and the receipt carries
     13; conceptId, `ready`, ScriptProject and cost row are unchanged. The movement kinds `{facilityOpex, overhead,
     payroll}` equal the control week's, and the promises are unchanged.
2. **staffingBlocked, `:410`**: count 2, expected 1.
   - Cause: ending one actor's employment does not block staffing. `staff()` runs before `decide()` in the same
     weekly pass (`advanceHollywoodWeek`) and re-hires the same actor (receipt: employment, `renewal`, week 131). So
     `decide` seats three actors and records an economic rejection.
   - Probe P2: the same removal with r01's cash at reserve + 1, so the re-hire's signing bonus fails the reserve. The
     counts are [1, 1, 1], r01 makes no chooser call, and r01 holds 2 actors.
   - Correction: use that construction, or another that leaves an actor unseatable when `decide` runs.
3. **mixed sequence, `:479`**: count 3, expected 0. Same cause as 2.
   - Probe P3: three weeks of the P2 block (count stays 0), then employment and cash restored. The counts run
     1..12, and the screenplay shelves on the 13th economic rejection.
4. **genesis to week 100, `:519`**: the states differ.
   - Cause: the premise "no screenplay reaches the threshold" is false before week 100. r01's `script-0006` has 13
     evaluated economic rejections, at weeks 57-60, 69-72, 81-84 and 93. Each shows 54 affordable, 0 unaffordable
     and 0 viable candidates. At weeks 61-68, 73-80 and 85-92 r01 had a production running, which leaves the count
     unchanged (1344-A §3.1). The screenplay shelves at week 93.
   - Probe P4: the candidate's week-93 state, with the key deleted from every business, equals HEAD's week-93 state
     byte for byte (`stableStringify`; HEAD source run in the red-r2 worktree), with r01's count at 12. At week 94
     the states differ by the shelving receipt (week 93, `industry-event-143`) and the renumbered later receipts of
     that tick.
   - Correction: end the window at week 93, or derive its end from the first `screenplayShelved` receipt.
5. **promise guard, `:738` and `:746`**: 3 receipts, expected 0.
   - Cause: at the deferral tick (week 142) three other screenplays lawfully shelve: r01 `script-0011`, and r02
     `script-0011` and `script-0013`. The guard covers only the named screenplay (§3.3), but both assertions count
     every studio's shelvings.
   - Correction: filter to `r.studioId === RIVAL_R01 && r.scriptProjectId === scriptProjectId`.
   - Probe P5: the count holds at 13 through weeks 142-144, ordinal 6 stays active and no named receipt appears.
     The tick after settlement (week 145) shelves the screenplay.
6. **opportunity paths, `:830`**: REASONABLY_ACHIEVABLE, expected IMPOSSIBLE.
   - Cause: the leaf never shelves anything. It quotes `script-0006` on the unmodified week-130 state, where the
     screenplay is active and ready.
   - Correction: `markShelved(state, RIVAL_R01, 6, week, week + 26)` before the quote.
   - Probe P6: unshelved gives REASONABLY_ACHIEVABLE / null. Shelved gives IMPOSSIBLE / `the named script project is
     shelved`, and that state passes `validateSaveV43(makeSave(...))`.
7. **chart output, `:856`**: 12, expected 10.
   - Cause: a chart row counts released films. A fresh-origin rival in rows 1-4 holds two `authored-start/v1`
     films: `hollywoodTick.ts:460` keeps that term unchanged, and the validator's chart check counts authored films.
   - Probe P7: at week 143 r01 has 10 produced + 2 authored = 12, which equals the validator's formula, and
     `validateSaveV43` passes.
   - Correction: expect `producedCount` plus r01's authored films.

## 6. Production shapes against the tests' local future-shape types (1344-F2)

| Item | Production (`hollywoodTypes.ts`) | Test-local type (all three files) | Diff |
|---|---|---|---|
| `version` | `1` | `1` | none |
| `rejections[]` | `{ ordinal: number; count: number }[]` | `readonly { ordinal: number; count: number }[]` | `readonly` only |
| `shelved[]` | `{ ordinal: number; week: number; retryWeek: number }[]` | `readonly { ordinal; week; retryWeek }[]` | `readonly` only |
| `commissionHoldUntilWeek` | `number` | `number` | none |
| receipt | `{eventId; week; studioId} & {kind: 'screenplayShelved'; scriptProjectId; conceptId; rejections: number}` | `{eventId; week; studioId; kind: 'screenplayShelved'; scriptProjectId; conceptId; rejections: number}` | none |

Compiler check: a scratch file asserts with an `Equals<A, B>` type the key set, `version`, each element type,
`commissionHoldUntilWeek`, and the flattened receipt against the test-local copies. It also assigns a production value
to the test type, and `tsc --strict` exits 0. Renaming `rejections` to `rejection` and `retryWeek` to `retry` in the
test copies produced three errors, so the check detects field-name drift. The validator's `exact` key lists pin the
same names at runtime.

## 7. Natural route facts (genuine week 130 to 260, the RED's route; measurement, no pin)

Shelving receipts by studio and week:
- r01: 142, 142, 199, 206;
- r02: 142, 142, 178, 181, 209, 212;
- r03: 150;
- r04: none.

At most four per 52 weeks: r02 has exactly four in [142, 194) and in [178, 230).

Retries, from weekly snapshots:

| Week | Studio | Screenplay | Result |
|---:|---|---|---|
| 178 | r02 | 0011 | unviable |
| 179 | r01 | 0006 | unviable |
| 179 | r02 | 0013 | unviable |
| 191 | r01 | 0011 | unviable |
| 205 | r01 | 0006 | unviable |
| 209 | r02 | 0011 | unviable |
| 210 | r02 | 0013 | unviable |
| 211 | r02 | 0015 | unviable |
| 212 | r02 | 0016 | unviable |
| 217 | r01 | 0011 | viable: greenlit, `film:11` announced 217, released 225 |

- After the first shelving, the first commissions come at week 155, exactly the 13-week hold: r01 `script-0012`,
  r02 `script-0014`.
- The first films after the stall are announced at 157 (r02) and 161 (r01).
- filmAnnounced weeks: r01 161, 170, 182, 217, 226, 235, 247, 259; r02 157, 228, 240.
- Industry releases after week 140 through 260: 10.
- At week 260:
  - r01 holds 3 shelved screenplays and cash $3.58M;
  - r02 holds 6 shelved screenplays and cash $6.63M;
  - r03 has cash −$2.96M;
  - r04 has cash −$12.0M, and was already −$33,191 at week 130.

## 8. Findings

1. **RED r2 has seven defective leaves** (§5). No lawful production change can pass them. Some would require breaking
   the validator's chart rule, the per-studio screenplay identity, or the charter's count semantics; others test a
   state they never construct. Each needs a RED r3 correction; the probes show the corrected leaves pass.
2. **The genesis route shelves at week 93.** That is 17 weeks before the stall 1329-A dated at about week 110:
   `script-0006` of the week-130 stall has been unviable since week 57, while r01 made other films. This follows
   §3.1: unevaluated weeks leave the count. Natural-route tests that cross week 93 on this seed will move. That movement
   is 1344-M's and §7's to attribute.
3. **Refusals cost a second search.** `evaluate` keeps calling `chooseIndustryPackage`, because the RED 1344-D
   Blocking 1 spy, `tests/helpers/p14p3-fixtures.ts` and `p14b4-rival-seating-preference` observe `decide` through it.
   It re-runs `searchIndustryPackages` only on a null choice. Alternative: `decide` calls the search once and stops
   calling `chooseIndustryPackage`, which hides decide from those spies. I recommend keeping the current design. The
   measured natural leaves ran faster at GREEN (2.5-4.4 s alone) than at RED (5.9-9.0 s), because the stall ends.
4. **Shelved lists only grow.** The charter keeps history: r02 holds 6 entries at week 260, and each costs one retry
   evaluation per 26 weeks while it stays unviable. v1 has no pruning, and none is chartered. This is input for the
   §7 measurement and later tuning.
5. **Negative rival cash** (r03, r04) predates shelving and is P15B's distress scope.

## 9. Handback files

| File | sha256 |
|---|---|
| `1344-stage/1344-shelving-production-step1.patch` | `25ff612e368fd3255aba230e56604d9a826cd7aa0a784187a3878acba417154b` |
| `1344-stage/1344-shelving-production-step2.patch` | `a7900dcf508f8d414032bce31afbb624063f74e97b5dc01a40b97b6c5d982332` |
| `1344-stage/1344-shelving-production-step3.patch` | `56ad46cd8ec18974ff01974bdc0325c13a0db46058fff95d13f2c41bf3dde722` |
| `1344-stage/1344-shelving-production-step4.patch` | `c9cb8e67e470498dc2faea87ff3433ad4cae84ba92ee233cff8cc7d2584dc751` |
| `1344-stage/1344-shelving-production-step5.patch` | `567ccec3cbb1290b7b3f4b136e075dd767af4c3037f670d2bf2b429d6cbb4ea0` |
| `1344-E-shelving-production-handback.md` | this record |

## 10. Next

1. The test author stages RED r3 with the seven corrections in §5.
2. The parent dry-runs r3 over the step-5 patch; the expected result is 51/51.
3. Then the 1344-M sweep, the implementation review (with the §6 table), and the §7 verification.
