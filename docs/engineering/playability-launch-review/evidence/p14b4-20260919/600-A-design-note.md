# 600-A — sim-core READ-ONLY design note: coordinated P14B.4 core/save/runtime/wire cutover

Status: PAPER ONLY. HEAD `5e6ac5dc8d877097719847defc2858e6a5908c4f` (worktree
`/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`, tree
clean at start). No source, test, fixture or generated edit; no vitest/tsc/npm/node/vite-node; shell
only for grep/sed/cat/wc/ls/gunzip and read-only git. Every GREEN/RED statement about a future change
is a paper prediction from the test bodies and source, not an executed result. Test files named in the
600-T scope were read from `git show HEAD:tests/<file>` (committed bytes), never from the working tree.

Law designed to: record 600 §2 (D1 (a), D2 (i-c), 515 §6 (c)), the amended plan
`plans/P14B4-HEADLESS-PLAN.md:9-58` ("Owner ruling 2026-09-21 (record 600)"), record 26 §2–§4, record
23, record 17, records 553/574 (adapter + enumerator stay UNWIRED at evaluator 4), records 110/554
(trust test 6 = coordinated tagged-P2 activation). Plan citations below use the post-amendment
numbering (records ≤ 599 cite n − 51 for lines > 8).

Sections: 1 HEAD verification · 2 per-file design S1–S5 · 3 per-step patch plan · 4 paper effect on the
installed RED and controls · 5 frozen list · 6 risks/open questions · 7 evidence limits.

---

## 1. HEAD verification table

Source drift since 69d16f8 (the 537-A base), from `git diff --stat 69d16f8..HEAD -- src bridge ui
scripts generated`: only `src/core/promiseCapacityOwners.ts` (new, 553), `src/core/promiseCapacityEnumerator.ts`
(new, 574), `src/core/promiseCapacityOwnerReplay.ts` (+20/−? at 598) and `src/core/promises.ts` (two
`export` heads at :548/:555, zero body lines, 553). Every other file cited by 26 and 537-A is
byte-identical to 69d16f8, so every line drift listed below is a CITATION drift in 26/537-A, not a
source move. `promises.ts` line numbers are unchanged by 553 (same line count).

### 1.1 Record 26 §2 rows (core activation)

| 26 row | Current file:line at HEAD | Status |
|---|---|---|
| `types.ts:2233–2234` live aliases | `src/core/types.ts:2233-2234` (`ProfessionalPromise = ProfessionalPromiseV29`, `GameState = GameStateV29`); comment :2231-2232; `CastRoleCountPredicate` :2214-2218; `ProfessionalPromiseV30` :2220-2225; `GameStateV30` :2227-2229 | present, still V29 (cutover target) |
| `promises.ts:184,430,459` draft/attachment union, full copy | `PromiseDraft` :189-202 (predicate `{ count }` :193); `PromiseAttachment` :435-440 (predicate :437); `attachPromise` :463-524; count-only copy :495; version stamp :492 | present, still count-only (drift: 26's :490 → :495, already noted in 537 §1) |
| `promises.ts:288,361,414` evaluator + digest + rules 4 | `reservedByActivePromises` :285-288; `feasibilityInputs` :293-326 (draft tuple :306-307); `expectedFirstTakeWeek` :335-348; `promiseFeasibility` :366-413 (NOT_OFFERED :371-372, `reserved` :386, `nMax` loop :390-394, IMPOSSIBLE bounds :395-396, `existingPath` :398-400, buffer :403-405, existing-path :406-408, slack :409-411); `PROMISE_RULES_VERSION = 3` :42; stamp :217; `NOT_OFFERED_IN_B1` :204-209 (P2 line :205) | present, rules 3, class-agnostic, gross buffer |
| `promises.ts:539–629` outcomes | `evaluable` :544-546; `promiseCastSlots` :548-553 (exported at 553); `qualifyingTakes` :555-569 (exported); `advancePromisesWeek` :605-645 | present, GREEN-covered (`p14b4-material-evidence-core` 17 PASS in 536/549/570) |
| `promises.ts:552` settle narrowing | `settle` :571-593, `next: Partial<ProfessionalPromise>` :574 | present, still broad |
| `talentMarket.ts:735,1026,1077–1124` freeze/material/commit | `attachedFeasibility` :756-772 (whole `promise.predicate` :765); `survivesFreeze` :1052-1094 (`materialTermsChanged` :1083-1085, `promiseNotFeasible` :1090-1092); `commitWinningPromise` :1100-1112 (receipt replaced, root version kept :1110-1111); `settleCase` :1114 (freeze before commit :1121-1124) | present, already carries the whole predicate; no edit needed for the carry |
| `save.ts:6396–6404` | `LIVE_SAVE_VERSION = 29` :6396 (comment :6392-6395); `makeSave` :6398-6405 (`validateSaveV29`, `SaveFileV29`) | present, still 29 |
| `index.ts` | promise exports :1395-1427 (`PROMISE_RULES_VERSION` :1415; `PromiseAttachment`/`PromiseDraft` types :1421-1422); save exports :1287-1296 (`validateSaveV30`/`migrateToV30`/`convertV29ToV30`/`convertV30ToV29` :1293-1296, comment :1292 "live writer stays V29 until cutover"); `SaveFileV30` :1335; `GameStateV30` :101, `ProfessionalPromiseV30` :103, `CastRoleCountPredicate` :104; `publicPriorityOrder`/`publicPreferredTerm` :1362-1363 (no `publicPreferredOpportunity`); `DisclosedPromise` :1390 | present; no new export is REQUIRED (bridge imports `talentMarket.ts` directly, see S3) |
| `tick.ts:1099–1110` order | `appendFirstTakes` :1102-1108 → `advancePromisesWeek` → `advanceTalentMarketWeek` :1110 | present, unchanged |
| `breakPromisesOnCancel:656` | :676-694, causal coupling `reclassifyPromise(...).classification !== 'IMPOSSIBLE'` :685; cancel site `actions.ts:599`; termination `actions.ts:2637` | present; no installed RED reaches it (§2 S1, record-only) |
| `talentMarket.ts:680` isProven, `bandsFor:776` D3, `authorRivalPromise:1237`, `hollywoodTick.ts:162`, `hollywoodPolicy.ts:32–63` | `isProven` :680-683; `publicPreferredOpportunity` :722-724; `promiseMatchesPreferredOpportunity` :728-739; `bandsFor` :774-811 (D3 :797-802); `authorRivalPromise` doc :1252-1259, body :1260-1277 (P1/count 1 only :1263-1268); `hollywoodTick.ts` `decide` :152, initial three actors :162; `hollywoodPolicy.ts` `chooseIndustryPackage` :31-66 (BILLINGS loop :37) | present; authoring is S2; seating/initial-cast record-only (no installed RED) |

### 1.2 Record 26 §3 rows (load/runtime)

| 26 row | Current file:line | Status |
|---|---|---|
| `bridge/session.ts:41,132–136` | import :41 (`LIVE_SAVE_VERSION, migrateToV29`); `importSaveJsonCurrent` :132-140 (`converted` :135, `migrateToV29(save).state` :136); intent path :1896-1926 (payload clone :1902, `opaqueIntentId` :1909, pending :1916-1922) | present; `migrateToV29` consumer |
| `bridge/runtime/campaign-library.ts:5,48,127` | import :5; summary read :48; active-record read :127 | present; `migrateToV29` consumers |
| `ui/src/engine/adapter.ts:112,3790–3822` | import :111-112; `exportSaveJson` :3779-3781 (→ `exportCurrentState`); `importSaveJson` :3790-3800 (`migrateToV29` :3796); V2 arm :3804-3814 (:3808); V1 arm :3818-3828 (:3822) | present; three `migrateToV29` sites |
| `run-d17b-continuation.ts:37,183`, `run-d17b-week86.ts:35,124` | :37/:183 and :35/:124 exactly | present (§2 S4: typecheck passes untouched; see Q4) |
| `runtime-checkpoint.ts:6–7, 439–461, 839–850, 992` | import :6-7; hydrated type :256-257 (`CurrentEnvelopeSave`); `type CurrentEnvelopeSave = SaveFileV29` :439; `validateCanonicalCurrentSave` :441-463 (strict `!== 29` :454-455, byte message :458); `importPriorSaveViaCanonicalChain` :840-851 (`SaveFileV29['state']` :843, `let migrated: SaveFileV29` :844, `migrateToV29` :846); `migratePriorProtocol4Checkpoint` :871-1023 (two canonical-chain calls :984-987, R05 guard :989-1006 with `SaveFileV29['state']` :992, runtime reset :1008-1022); unknown-id refusal :1054 | present (drift: strict check is :454-458, not :452) |
| prior registry `:59` | `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` :59-172, 34 entries (31 literals + `PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID` :37, `ACCEPTED_P12_SCHEMA_ID` :39, `R05_NATIVE_FOUNDING_SCHEMA_ID` :41); `584bdd…` absent (grep) | present; outgoing46 not yet registered |
| `migratePriorProtocol4Checkpoint:976–1022` | function :871-1023; the two-slot chain + reset sit at :984-1022 | present (drift in 26/537-A: function start is :871) |

### 1.3 Record 26 §4 rows (wire/generator)

| 26 row | Current file:line | Status |
|---|---|---|
| `bridge-schema.ts:1756` draft | `PROMISE_FAMILIES` :1729-1732; `StudioMarketProposalPromiseDraftPayload` :1756-1761 (closed `{family,count,windowStartWeek,dueWeekExclusive}`); `promise: optional(reference(...))` :1771; definitions entry :3262; exported type :3474 | present; count-only |
| `bridge/contract.ts:338,358,434–480,589` | `MarketPromiseDraft` :338-343; `copyMarketProposalDraft` :358-361; `prepareMarketProposal` :443-478 (quote :461-466, attach `predicate: { count }` :469-474); `playerProposalDraft` :589-597 | present |
| `bridge/promises.ts:43,111–137` | `PromiseQuoteDraft` :42-49; `promiseHistoryFor` :83-106 (row :93-103); `promiseQuoteSnapshot` :113-136 (`predicate: { count: draft.count }` :124) | present (drift: :111-137 → :113-136, :80-104 → :83-106) |
| `session.ts:1897–1925` | :1896-1926 | present |
| `talentMarket.ts:458,535` disclosure | `DisclosedPromise` :458-464; `disclosedPromise` :535-547 | present; count-only |
| schema own snapshot/history `:2219,2229` | `StudioMarketPromiseSnapshot` :2219-2226; `StudioMarketPromiseHistoryRow` :2229-2241; own row :2242-2251; undisclosed row :2252-2261 (whole `UNKNOWN` :2260); union precedent `StudioMarketProposalSnapshot` :2262-2265 | present |
| `people.ts:1000`, `trust.ts:30`, `market.ts:230` shared history | `bridge/people.ts:1000` (`promiseHistoryFor`), :523 and `bridge/market.ts:230` (`promiseRowsForPerson`), `bridge/trust.ts:30-36` (delegates to `promiseHistoryFor`) | present; one history owner |
| preferences `:2283`, `people.ts:978–989` | `StudioMarketPreferencesSnapshot` :2283-2291; `bridge/people.ts` import :41-43, `priorityOrder` :977, `preferredTermWeeks` :978, object :986-990; `bridge/market.ts:223` reuses `block.preferences` | present; no `preferredOpportunity` |
| `industry.ts:135–147` Pulse | untouched by this design (public receipt join stays verbatim) | present |
| `PROJECTION_VERSION` `:222`, `protocol.ts:34–35` | `bridge/schema/bridge-schema.ts:222` (`46`), header paragraphs :207-221; `bridge/protocol.ts:34-35` (`SNAPSHOT_VERSION`, `SCHEMA_ID = schemaIdentity(BRIDGE_SCHEMA)`) | present |
| generator + three artifacts | `scripts/generate-bridge-contract.ts:160-217` (`--check` :162/:211-214, outputs :190-203: `bridge/schema/project-studio-bridge.schema.json`, `generated/unity/StudioBridgeDtos.Generated.cs`, `generated/unity/project-studio-bridge.contract-manifest.json`; `--unity-project` :163 must NOT be passed); `package.json:12-15` (`generate:bridge-contract`, `check:bridge-contract`, `check:bridge-contract:fixtures`) | present |
| F10/F11 vs frozen aggregate | `tests/fixtures/bridge-contract-union-fixtures.ts:226-233` (F10/F11 = whole `BRIDGE_SCHEMA`); frozen aggregate :260-267 (F01–F04/F09/F12); the F10/F11 declaration-hash pins live in `tests/bridge-contract-generator.test.ts:656-657` and the projection-46 identity pins at :554-560 | present |

### 1.4 537-A §1 table rows (re-verified)

| 537-A row | Current file:line | Status / drift |
|---|---|---|
| `types.ts` 2212-2229 / 2233-2234 | :2214-2229 / :2233-2234 | present |
| evaluations: service 366-417, reclassify 419-433, inputs 293-333, rules 42, NOT_OFFERED 204-209/371, seated 262-272, expected 335-352, buffer 404 | :366-413, :419-431, :293-326, :42, :204-209/:371-372, :262-267, :335-348, :403 | present; six range drifts (537-C already noted four) |
| attachment: attachPromise 463-528, copy 490, version 487 | :463-524, :495, :492 | present; three drifts (537 §1 noted the copy) |
| outcomes: advance 605-650, settle 571-576, cancel 676-694 | :605-645, :571-593 (Partial :574), :676-694 | present; one drift |
| validation 818-1031 | :818-1023 (V30 branch :915-925, V29 exact `['count']` :928, evidence mask :980-985) | present; one drift |
| talentMarket: 722, 728-740, 795-798, 756-772, 1052-1098, 1100-1112, 1260-1277, 535-547 | :722-724, :728-739, :797-802, :756-772, :1052-1094, :1100-1112, :1260-1277, :535-547 | present; three drifts |
| save.ts: 499, 5282, 8679-8695, 8697, 8704-8712, 8714-8717, 6396, 6400-6405 | :496-504, :5282, :8679-8692, :8697-8700, :8704-8710, :8714-8717, :6396, :6398-6405 | present; three drifts |
| index.ts 1397-1428, 103, 1362 | :1395-1427, :103, :1362-1363 | present |
| session.ts 132-136, 1897-1925 | :132-140, :1896-1926 | present |
| runtime-checkpoint: registry 59-171, 439, 452, 840-850, 976-1022 | :59-172, :439, :454-458, :840-851, :871-1023 (calls :984-987) | present; three drifts |
| campaign-library 5,48,127; adapter 111-112, 3790-3822 | exact; :111-112, :3790-3828 | present |
| bridge-schema: 222, 1756-1761, 2219-2226, 2229-2241, 2283-2291, 2251-2261 | :222, :1756-1761, :2219-2226, :2229-2241, :2283-2291, :2252-2261 | present; one drift |
| contract.ts 338-343, 358-361, 443-478, 589-597 | exact | present |
| bridge/promises.ts 111-137, 80-104 | :113-136, :83-106 | present; two drifts |
| people.ts 978-990, market.ts, trust.ts 30-36 | :977-990, :223/:230, :30-36 | present; one drift |
| hollywoodPolicy 32-63, hollywoodTick 155-162 | :31-66, :152-162 | present; two drifts |
| kernel/replay producers | `promiseCapacityKernel.ts` (no live importer; only `promiseCapacityOwnerReplay.ts`, `promiseCapacityOwners.ts`, `promiseCapacityEnumerator.ts` and tests import them — grep of src/bridge/ui) | present, UNWIRED, not edited |
| tick.ts 1099-1110, actions 599/2637 | :1102-1110, :599/:2637 | present; one drift |

Drift tally vs 537-A: 28 citation drifts (line-range imprecision), 0 source moves in the cited
files. Two 537-A CLAIM corrections carried from 537-C stand: the B-F2/B3 files are NOT unchanged
under a 3→4 move (Q2.3), and the alias switch is not a compile necessity (Q3).

New facts 537-A/26 did not record (verified here):
- `src/harness/p14/legacy-v28-fixtures.ts:25,40` types `emit(file, save: SaveFileV28 | SaveFileV29, …)` and is
  called with `makeSave(state)` (:79, :104, :208). Precedent 8bb57388 widened exactly this annotation
  (`SaveFileV28` → `SaveFileV28 | SaveFileV29`) at the 28→29 bump; the same two-line widening is
  required at 29→30 or the root `tsc --noEmit` fails (S3, Q5).
- Root `tsconfig.json` includes `tests/**/*.ts` (excluding `tests/bridge*`, `tests/r3n1-*`, the union
  fixtures): four core test files return `makeSave(...)` from `SaveFileV29`-typed helpers
  (`tests/contracts/cross-owner-refusal.contract.test.ts:70-74`, `tests/contracts/phase-table-agreement.contract.test.ts:102-106`,
  `tests/contracts/determinism-floor.contract.test.ts:84/125`, `tests/legacy-parcel-ground.test.ts:343-356`), and
  `tests/bridge-p06-checkpoint-recovery.test.ts:54/167/174` passes `loaded.hydrated.currentSave` to a
  `SaveFileV29` parameter under the bridge tsconfig. These become designated TS diagnostics between the
  writer's S3/S4 and the parent's values-only live-version sweep (§3, §4.3, Q6).
- The 28→29 precedent for that sweep is commit `6948e31` "live-version sweep 28 -> 29 (pins only)":
  ~60 test files, VALUES ONLY, plus `tests/_historicalCurrent.ts` (`migrateToCurrentControl` returns
  the live envelope). The same class exists at 29→30: 38 test files import `migrateToV29`, 6 call
  `validateSaveV29(makeSave(...))`, ~74 lines pin `saveVersion` 29 / `LIVE_SAVE_VERSION` 29 across ~40
  files (grep, HEAD). One-past sentinels are ALREADY at 31 / "1 through 30" (moved at the additive
  V30 step), so that class is empty this time.
- `tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-current-p1.json.gz` (gunzip + grep, read-only): the
  focus person `t-act-09` holds exactly ONE root (`promise-0`, player, `[52,92)`, count 1) and no rival
  promise; after `base()` withdraws the player's proposals no active reservation remains, so every
  bridge P2 quote in `bridge-p14b4-cast-class` evaluates with `reserved = 0`. `genuine-v29-rival-current-p1`
  holds two competing 208-week rival CURRENT P1s per person (r01 + r02), which is the natural
  "competing current issuers" shape the residual buffer sees (§4.4).

---

## 2. Exact per-file design

Conventions: "edit" = a hunk the ONE writer (600-W) lands; line numbers are HEAD 5e6ac5dc; fragments are
illustrative TypeScript, the writer owns spelling inside the stated law. Nothing here touches a cap,
tariff, refusal string in force, fixture, test or generated file (except through the generator run).

### S1 — core (`src/core/types.ts`, `src/core/promises.ts`)

**S1.1 `types.ts:2231-2234` — live aliases → V30.** Replace the two aliases; keep `ProfessionalPromiseV29`,
`GameStateV29` (:2204-2209, :2177-2201) and the V30 definitions (:2214-2229) verbatim; rewrite the
two-line comment (:2231-2232) so it no longer says the V30 API "is not the gameplay/wire cutover".

```ts
// P14B.4 (record 600): the live gameplay/wire boundary is V30. V29 remains the
// frozen prior save shape; a tagged predicate exists only on the V30 union.
export type ProfessionalPromise = ProfessionalPromiseV30
export type GameState = GameStateV30
```
Typing fact (537-C Q3, re-verified by reading): `CastRoleCountPredicate` is structurally assignable to
`{ count: number }` and `GameStateV29` to `GameStateV30` (union widening), so this switch does not
break any `GameState` consumer in src/bridge/ui; it is needed so `'kind' in promise.predicate` narrows
in `attachPromise`, `bridge/promises.ts` and `talentMarket.ts` on the LIVE type (S2/S5 depend on it).

**S1.2 `promises.ts:189-202` / `:435-440` — predicate union.**
```ts
export type PromisePredicate = { count: number } | CastRoleCountPredicate   // import CastRoleCountPredicate at :32-35
export type PromiseDraft = { …; predicate: PromisePredicate; … }            // :193
export type PromiseAttachment = { …; predicate: PromisePredicate; … }       // :437
```
`reclassifyPromise` (:419-431), `attachedFeasibility` (`talentMarket.ts:756-772`), `authorRivalPromise`
and the adapter (`promiseCapacityOwners.ts:15,94,103-104`) already pass whole predicates and keep
compiling (verified by reading each site: only `.count` and `promiseCastSlots(draft)` are used).

**S1.3 `promises.ts:463-524` — `attachPromise`: full detached copy, version 4, tagged-family refusal.**
Insert, after the at-most-one refusal (:474-478) and BEFORE the feasibility call (:479), the same throw
style as :471-473/:475-477:
```ts
if ('kind' in draft.predicate && draft.family !== 'LEAD_OR_SIGNIFICANT_ROLE_COUNT') {
  throw new Error(`promises: a selected seat class is legal only on a LEAD_OR_SIGNIFICANT_ROLE_COUNT promise, not "${draft.family}"`)
}
```
(the V30 validator refuses such a root at `promises.ts:918-920`; staging it would make the state
unsaveable, so attach must fail loud rather than stage). Then replace :495:
```ts
predicate: 'kind' in draft.predicate
  ? { kind: 'castRoleCount', count: draft.predicate.count, seatClass: draft.predicate.seatClass }
  : { count: draft.predicate.count },
```
(`version: PROMISE_RULES_VERSION` at :492 is unchanged in text and becomes 4 through S1.7). Nonofferable
drafts are STILL staged (no new blanket refusal, 26 §2 row 2): the huge cases
(`p14b4-cast-class-capacity.test.ts:346-365`) and the historical
`refused-p2-count-only-current-draft` fixture depend on that. At-most-one, ordinal id, redigest
(:507-516) and the no-RNG property are untouched. Recommend building the root in two explicit
branches (or a tiny `mintPredicate(draft.predicate)` helper) so the literal is typed against the
correlated `ProfessionalPromiseV30` members rather than relying on structural looseness.

**S1.4 `promises.ts:262-267` / `:335-348` / `:398-400` — mask-aware fixed-seat paths.**
```ts
function seatedPreFirstTake(state, studioId, personId, slots: readonly CastSlot[]): readonly Production[] {
  const recorded = new Set(state.firstTakes.map((t) => t.productionId))
  return studioProductions(state, studioId).filter(
    (p) => !recorded.has(p.id) && slots.some((slot) => p.cast[slot] === personId))
}
```
`expectedFirstTakeWeek(state, draft, from, k)` computes `const slots = promiseCastSlots(draft)` (the
exported helper at :548-553 accepts `Pick<ProfessionalPromiseV30,'predicate'>`; `draft.predicate` is
the same union) and passes it at :343; `promiseFeasibility` passes the same `slots` at :398. Law
(600 §2 / plan :23-25): legacy count-only of EVERY family → `['lead','antagonist','support']`; tagged
`lead` → `['lead']`; tagged `leadOrAntagonist` → `['lead','antagonist']`; a fixed seat outside the mask
is not an event (event 0 falls through to `from + 5`), and the recorded-take exclusion (:263) is
unchanged ("a first-take record means no NEW event from that picture").

**S1.5 `promises.ts:366-413` — refusals and the residual buffer.**
- :204-209 `NOT_OFFERED_IN_B1`: delete ONLY the P2 line (:205); the three P3–P5 lines (:206-208) and
  the application at :371-372 stay byte-identical (the object name may stay; a one-line doc note
  suffices).
- Immediately after :372 add the two shape refusals (both actual bounds/refusals, never a search miss):
```ts
if (draft.family === 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' && !('kind' in draft.predicate)) {
  return refuse('a seat-class promise needs an explicitly selected class; count-only P2 is not offered')
}
if ('kind' in draft.predicate && draft.family !== 'LEAD_OR_SIGNIFICANT_ROLE_COUNT') {
  return refuse('a selected seat class applies only to a seat-class promise')
}
```
  Placement before the numeric/window checks (:373-378) keeps every existing refusal string and its
  order for P1 and for P3–P5 exactly as today; the classless-P2 read produces the same classification
  (IMPOSSIBLE) `NOT_OFFERED` produced, so `breakPromisesOnCancel` on a reader-admitted bound legacy P2
  behaves exactly as at rules 3 (no regression, no new law; see Q10).
- :403 buffer test becomes the plan's evaluator-4 correction (plan :19-23, "active reservations are
  subtracted before classification"):
```ts
if (reserved + X > nMax - promiseBuffer(nMax)) {
  return receipt('FRAGILE', 'the schedule leaves no spare picture inside the window', inputs, week)
}
```
  :395-396 (IMPOSSIBLE bounds), :406-411 (existing-path and slack, already `reserved + X`) unchanged.
  `promiseBuffer` (:63-65), `PROMISE_SLACK_WEEKS`, `WEEKS_TO_FIRST_TAKE`, `SEAT_CYCLE_WEEKS`, the 1000
  loop bound (:393) unchanged.

**S1.6 `promises.ts:293-326` — inputs digest.** Append AT THE END of the returned array (after the
reservations row :323-325), only when tagged:
```ts
...('kind' in draft.predicate ? [[draft.predicate.kind, draft.predicate.seatClass]] : []),
```
so every count-only draft's inputs tuple is byte-identical to rules 3 (old P1 digests preserved), and
lead vs leadOrAntagonist digests differ (`p14b4-cast-class-capacity.test.ts:327`). The reservation row
already carries every active reservation's count/progress (:323-325), so the residual buffer reads no
input the digest does not cover.

**S1.7 `promises.ts:39-42` — the evaluator revision with the law named.**
```ts
/** The evaluator revision stamped on newly evaluated receipts and newly minted
 * roots. 4 = P14B.4 (record 600, D1 (a)): class-restricted fixed-seat paths for
 * tagged P2 plus shared residual capacity (`reserved + X` against the spare-event
 * buffer) on the count-family scalar, applied to fresh P1 and tagged P2 alike.
 * The bounded joint certificate and UNCERTIFIED→FRAGILE are a later evaluator
 * revision (5). Stored root versions and old receipts are never rewritten. */
export const PROMISE_RULES_VERSION = 4
```
Record 23 satisfied: the literal moves only inside the same patch as S1.3–S1.6.

**S1.8 `promises.ts:571-593` — `settle` narrowing (26 row 5).**
```ts
type PromiseSettlement = Partial<Pick<ProfessionalPromiseV29, 'progress' | 'evidenceRefs' | 'outcome' | 'outcomeCause' | 'outcomeEventId'>>
function settle(state, promise, next: PromiseSettlement, week, reason)
```
(those five fields are identical on both union members). Callers (:614-628, :631-636, :659-663,
:686-690) already pass exactly those fields; no semantic change.

**S1.9 `breakPromisesOnCancel` (:676-694).** No installed RED reaches it (537-A/537-C Q6 re-verified:
the only cancel case, `p14b4-cast-class-outcomes` "first take THEN real player cancellation" :467,
takes the :679 early return because the take exists). Record-only: the causal coupling at :685 is the
separate correction of 26 §2 :69-79 / 600 §3 step 8 with its own RED. Not edited.

Unchanged in S1 (GREEN-covered, frozen): `promiseDigest` :147-154, `attachedPromiseDigest` :160-169,
`proposalDigest` :173-185, `promiseCastSlots`/`qualifyingTakes` :548-569, `advancePromisesWeek`
:605-645, `breakPromisesOnTermination` :652-670, both validator branches :809-1023, trust :696-800.

### S2 — market/policy (`src/core/talentMarket.ts`)

**Verified carries (no edit).** `attachedFeasibility` :756-772 passes `predicate: promise.predicate`
(:765) — the whole V30 predicate; `survivesFreeze` :1083-1085 re-derives the digest through
`attachedPromiseDigest` (class is material via `promiseDigest`) and :1090-1092 drops on a non-achievable
freeze receipt; `commitWinningPromise` :1110-1111 replaces only `contractId`/`feasibilityReceipt`
(root version kept, plan :120-122). `settleCase` :1121-1124 freezes BEFORE the employment commit. The
D3 matcher :728-739 already accepts tagged P2 only.

**S2.1 `authorRivalPromise` :1252-1277 (537-B G9; plan :185-193 "Delegated public preference").**
```ts
function authorRivalPromise(state, talentId, issuerStudioId): GameState {
  const proposal = state.talentMarket.proposals.find(…)                     // :1261 unchanged
  if (proposal === undefined || proposal.promises.length > 0) return state // :1262 unchanged
  const window = { windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + proposal.termWeeks }
  const p1: PromiseAttachment = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, ...window }
  const flexible: PromiseAttachment = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
    predicate: { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' }, ...window }
  // Delegated hypothesis (plan): unproven tries the flexible class over the full term, then P1; proven keeps P1.
  for (const attachment of isProven(state, talentId) ? [p1] : [flexible, p1]) {
    const verdict = promiseFeasibility(state, { ...attachment, issuerStudioId, beneficiaryPersonId: talentId,
      startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }, state.market.tick)
    if (verdict.classification === 'REASONABLY_ACHIEVABLE') return attachPromise(state, talentId, issuerStudioId, attachment)
  }
  return state
}
```
Facts the installed RED pins (`p14b4-cast-class-policy.test.ts:410-420,421,476-479,489-493`): both reads
are on the SAME unchanged state (no staged failed root); each read draft has exactly the keys
`{family, predicate, issuerStudioId, beneficiaryPersonId, startWeek, termWeeks, windowStartWeek,
dueWeekExclusive}` (no `promiseId`); the attach draft has exactly `{family, predicate, windowStartWeek,
dueWeekExclusive}`; `root.feasibilityReceipt` equals the chosen read's receipt (deterministic
re-evaluation inside `attachPromise`). `isProven` (:680-683) is the existing archetype — no new
threshold, no RNG, no count escalation, no lead-only selection. Doc block :1252-1259 rewritten
accordingly (it currently states "exactly ONE APPEARANCE_COUNT promise").

**S2.2 disclosure (`DisclosedPromise` :458-464, `disclosedPromise` :535-547).** Add
`seatClass: 'lead' | 'leadOrAntagonist' | null` and set it from the shape, never from the version:
```ts
seatClass: 'kind' in promise.predicate ? promise.predicate.seatClass : null,
```
This is wire-visible through `bridge/people.ts:975` (`promise: unboxPromise(row.promise)` flows straight
into the own snapshot), so the key must exist on the schema at the same time → RECOMMENDATION: land
these two disclosure hunks inside the S5 patch, not S2 (see §3). Rival rows keep the WHOLE `UNKNOWN`
(:526, :2260); `caseDisclosure` copy unchanged.

**Record-only (no installed RED reaches them; 537-A/537-B/537-C agree):** `hollywoodPolicy.ts:31-66`
final six-permutation seating preference and `hollywoodTick.ts:162` initial three-actor selection
(600 §3 step 8 "final seating preference" with its own RED). Not edited.

### S3 — save (`src/core/save.ts`, `src/core/index.ts`, `src/harness/p14/legacy-v28-fixtures.ts`)

**S3.1 `save.ts:6392-6405`.**
```ts
export const LIVE_SAVE_VERSION = 30 as const;
// makeSave — the live V30 boundary (P14B.4). Frozen prior values migrate explicitly.
export function makeSave(state: GameState): SaveFileV30 {
  const save = validateSaveV30({ saveVersion: 30, seed: state.seed, state, broadcastCache: state.broadcastItems });
  // Validation precedes detachment (unchanged law).
  return JSON.parse(JSON.stringify(save)) as SaveFileV30;
}
```
`exportCurrentState` :6423-6425 and `exportSave`/`importSave`/`loadSave` dispatch (:5282, :6409-6436)
need no edit. Doc-only refreshes: the `SaveFileV30` comment :496-497 ("Live gameplay remains V29
until…") and the `migrateToV30` comment :8712-8713 ("deliberately NOT yet the live load-to-play
route"). `validateSaveV29` :8604-8618, `convertV28ToV29`, `convertV29ToV28`, `migrateToV29` :8669-8673
(V30 arm at :8670 via lossless `convertV30ToV29`), `validateSaveV30` :8679-8692, `convertV29ToV30`
:8697-8700, `convertV30ToV29` :8704-8710, `migrateToV30` :8714-8717 and the 19 downgrade refusals
(grep `cannot downgrade SaveFileV30`) are already present and stay byte-identical.

**S3.2 `index.ts`.** No new export is required: `bridge/people.ts:41-43`, `bridge/promises.ts:22-24`,
`bridge/contract.ts:52` import `talentMarket.ts`/`promises.ts` directly; `bridge/session.ts:41`,
`bridge/runtime-checkpoint.ts:3-8`, `bridge/runtime/campaign-library.ts:5` import `migrateToV30`/`SaveFileV30`
which index already exports (:1294, :1335). Comment :1292 ("live writer stays V29 until cutover") is
refreshed. OPTIONAL one-liner for parity with :1362-1363: re-export `publicPreferredOpportunity`
(and `promiseMatchesPreferredOpportunity`); default recommendation: omit (YAGNI; 26 §2 "actually
needed").

**S3.3 `src/harness/p14/legacy-v28-fixtures.ts:25,40` — type-only widening (precedent 8bb57388).**
`SaveFileV28 | SaveFileV29` → `SaveFileV28 | SaveFileV29 | SaveFileV30` (import + parameter). Without it
the root `tsc --noEmit` fails on :79/:104/:208 (`makeSave` now returns `SaveFileV30`). The file's
FROZEN header (:13-17) and its `saveVersion !== 28` refusal (:47) stay; this is the same two-line
plumbing the 28→29 bump landed, not a rewrite of the minter (26 §3 :102). Flagged as Q5 for the auditor.

### S4 — load/runtime (`bridge/session.ts`, `bridge/runtime/campaign-library.ts`, `ui/src/engine/adapter.ts`, `bridge/runtime-checkpoint.ts`)

- `bridge/session.ts:41` import `migrateToV30`; :136 `migrateToV30(save).state`. `converted` (:135) keeps
  comparing against `LIVE_SAVE_VERSION` (now 30) — no consumer literal. Save route (:1977-1988,
  `snapshotBuildContextFor(...).saveJson()` → `exportSaveJson` → `exportCurrentState` → `makeSave`)
  needs no edit and now emits V30.
- `bridge/runtime/campaign-library.ts:5,48,127` → `migrateToV30` (three tokens).
- `ui/src/engine/adapter.ts:112` import `migrateToV30`; :3796 normal arm; :3808 explicit V2 arm; :3822
  explicit V1 arm (serialization plumbing only, plan :137-138; not rendered-UI work). `exportSaveJson`
  :3779-3781 unchanged.
- D17 drivers `src/harness/d16/run-d17b-continuation.ts:37,183`, `run-d17b-week86.ts:35,124`: the root
  typecheck PASSES untouched (`migrateToV29(...).state` is `GameStateV29`, assignable to the live
  `GameState`; the drivers read fields and pass the state on). Behaviourally they would refuse a V30
  file carrying a tagged root (`convertV30ToV29` :8707 throws, fail-loud). 26 §3 lists them under "when
  that narrow consumer sweep is authorized"; the 28→29 precedent (8bb57388) swept both. Recommendation:
  sweep the four tokens in S4 for uniformity IF the parent authorizes; otherwise leave (Q4).
- `bridge/runtime-checkpoint.ts`:
  - :6-7 import `migrateToV30`, `type SaveFileV30`.
  - :439 `type CurrentEnvelopeSave = SaveFileV30` (the hydrated type :256-257 follows).
  - :454-458 strict current-envelope law: `imported.saveVersion !== 30` → `must be a current V30 save,
    received V…`; :458 `must preserve the canonical V30 save bytes exactly`. Current47 requires exact
    canonical V30 bytes (26 §3 :107).
  - :843-846 `importPriorSaveViaCanonicalChain`: `SaveFileV30['state']`, `let migrated: SaveFileV30`,
    `migrateToV30(importSave(json))`; the re-serialisation via `exportSaveJson` (:850) now yields V30
    bytes, which is exactly what `bridge-p14b4-runtime47-compatibility.test.ts:191-205` compares against
    (`exportSave(migrateToV30(importSave(prior[slot])))`).
  - :992 R05 annotation `SaveFileV30['state']` (type only; the origin guard :989-1006 is not widened).
  - :59-172 registry: add ONE entry, comment in the registry's own style, adjacent to the v45 entry:
    ```ts
    // P14B.4: exact OUTGOING projection-46 identity (Save V29 / rules 3), minted at
    // c06db6ea and frozen in tests/fixtures/p14/genuine-projection46-runtime; every
    // durable checkpoint written under it takes the governed prior path.
    ['sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c', 'projection-v46'],
    ```
    The registry is a `ReadonlyMap<string,string>` of 34 entries; after the edit 35, which is exactly
    `EXPECTED_PRIOR_IDS` (runtime47 test :39-75, 35 literals incl. 584bdd…). The current-ID exclusion
    (:167 in the test, `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID) === false`) holds only
    because S5 moves `SCHEMA_ID` off 584bdd… in the same boundary (26 §3 :123-125; 537-B G7).
    Unknown-id rejection (:1054, test :172-183) unchanged. Missing 32–44 are NOT fabricated.
  - `migratePriorProtocol4Checkpoint` :871-1023 is reused as-is (two separate canonical-chain calls
    :984-987, runtime reset :1008-1022); no re-migration of a current47 checkpoint on reopen (:1242+).

### S5 — wire (`bridge/schema/bridge-schema.ts`, `bridge/promises.ts`, `bridge/contract.ts`, `bridge/people.ts`, generator)

**S5.1 `bridge-schema.ts:1756-1761` — family-discriminated closed draft.** Precedents in the SAME file
for a closed string-discriminated object union through the DSL: `StudioMarketProposalSnapshot`
:2262-2265 (`disclosure: literal('own') | literal('undisclosed')`, response side) and the request-side
`StudioBridgeQuoteRequest` :1784-1791 (`type: literal(...)` per member). Generator support verified
in `scripts/bridge-contract-csharp.ts:659-720,839-924`: a discriminator is any shared REQUIRED
non-null string `const`/`enum` property with pairwise-disjoint values; `x-csharp-discriminator` is only
needed when several candidates exist. Runtime `anyOf` is first-match (`bridge/schema/runtime.ts:98-110`),
so disjoint `family` domains make the match order-independent.
```ts
const PROMISE_SEAT_CLASSES = ['lead', 'leadOrAntagonist'] as const
const COUNT_ONLY_PROMISE_FAMILIES = ['APPEARANCE_COUNT', 'DIRECTING_COUNT', 'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT'] as const
const promiseDraftTerms = { count: integer({ minimum: 1 }), windowStartWeek: nonNegativeInteger(), dueWeekExclusive: nonNegativeInteger() }
/** P2 REQUIRES its explicitly selected class; no default, no optional. */
const StudioMarketProposalCastClassPromiseDraftPayload = object('StudioMarketProposalCastClassPromiseDraftPayload', {
  family: literal('LEAD_OR_SIGNIFICANT_ROLE_COUNT'), ...promiseDraftTerms, seatClass: enumeration(PROMISE_SEAT_CLASSES) })
/** Every other catalogue family stays count-only; P3–P5 remain enumerated and engine-refused. */
const StudioMarketProposalCountPromiseDraftPayload = object('StudioMarketProposalCountPromiseDraftPayload', {
  family: enumeration(COUNT_ONLY_PROMISE_FAMILIES), ...promiseDraftTerms })
const StudioMarketProposalPromiseDraftPayload = union('StudioMarketProposalPromiseDraftPayload', [
  reference('StudioMarketProposalCastClassPromiseDraftPayload', StudioMarketProposalCastClassPromiseDraftPayload),
  reference('StudioMarketProposalCountPromiseDraftPayload', StudioMarketProposalCountPromiseDraftPayload),
] as const)
```
Keeping the union's name means :1771 (`promise: optional(reference('StudioMarketProposalPromiseDraftPayload', …))`)
and the exported TS type at :3474 keep their names; add the two member objects to `definitions` beside
:3262. `PROMISE_FAMILIES` (:1729-1732) stays for the snapshot/history rows. Paper behaviour at the
validator: P2 without `seatClass` → member A "required property is missing", member B "expected one
of …" → `matched no allowed type` → `validateQuote` INVALID_COMMAND (G2); a class on a non-P2 family →
A fails the literal, B refuses the additional property (G1's eleven "bad class"/inapplicable cases stay
refused for a REAL reason now); `null`/`'support'`/`1`/array classes fail the enum; extra `kind` or
nested `predicate` keys fail `additionalProperties`. The C# side: the generator promotes `count`,
`windowStartWeek`, `dueWeekExclusive` to an abstract `StudioMarketProposalPromiseDraftPayload` base,
emits two sealed members and a `family`-switching converter (same shape as
`StudioMarketProposalSnapshotJsonConverter`, `generated/unity/StudioBridgeDtos.Generated.cs:9767-9810`).
That turns today's sealed DTO into an abstract base — a real consumer-side change for the Unity
backlog (Q1).

**S5.2 read shapes.** `StudioMarketPromiseSnapshot` :2219-2226 and `StudioMarketPromiseHistoryRow`
:2229-2241 each gain `seatClass: nullable(enumeration(PROMISE_SEAT_CLASSES))` (real class for tagged
P2; `null` = not applicable for P1 / genuinely unknown for legacy P2; never a fabricated lead).
`StudioMarketPreferencesSnapshot` :2283-2291 gains
`preferredOpportunity: enumeration(['significantCastRole', 'anyCastAppearance'])` — the literals are
`publicPreferredOpportunity`'s return type at `talentMarket.ts:722`. `line` (:2290, `people.ts:990`)
unchanged (no copy leak). The undisclosed row (:2252-2261) is untouched. Header paragraph for
projection 47 added before :222; `PROJECTION_VERSION = 47 as const` at :222.

**S5.3 ONE wire→core tagged conversion (`bridge/promises.ts`), shared by quote and attach.**
```ts
import type { BridgeMarketProposalPromiseDraftPayload } from './schema/bridge-schema.ts'
import type { PromiseAttachment } from '../src/core/promises.ts'
export type WirePromiseDraft = BridgeMarketProposalPromiseDraftPayload
/** The single wire→core material conversion: kind AND class travel together, only for P2. */
export function corePredicateOf(draft: WirePromiseDraft): PromiseAttachment['predicate'] {
  return 'seatClass' in draft
    ? { kind: 'castRoleCount', count: draft.count, seatClass: draft.seatClass }
    : { count: draft.count }
}
export type PromiseQuoteDraft = WirePromiseDraft & { startWeek: number; termWeeks: number }   // :42-49
```
`promiseQuoteSnapshot` :113-136 uses `predicate: corePredicateOf(draft)` at :124 (verdict shape
unchanged: `ok/classification/message`, no class echoed). `promiseHistoryFor` :93-103 adds
`seatClass: 'kind' in promise.predicate ? promise.predicate.seatClass : null` (the row type
`MarketPromiseHistoryRow = BridgeMarketPromiseHistoryRow` :38 follows the schema, so this hunk and
S5.2 are one patch). `bridge/trust.ts:30-36`, `bridge/market.ts:230`, `bridge/people.ts:523,1000`
keep delegating — no divergent class copy (26 §4 :149-150).

**S5.4 `bridge/contract.ts`.** `MarketPromiseDraft` :338-343 becomes an alias of the wire union
(`export type MarketPromiseDraft = WirePromiseDraft`); `copyMarketProposalDraft` :358-361 already
spreads the nested draft (copies `seatClass`); `prepareMarketProposal` :461-466 keeps calling
`promiseQuoteSnapshot(proposed, …, { ...draft.promise, startWeek, termWeeks })` and :469-474 attaches
with `predicate: corePredicateOf(draft.promise)` (import from `./promises.ts`, :52 neighbourhood);
`playerProposalDraft` :589-597 already copies `{ ...payload.promise }`. Replacement-before-feasibility,
module-level `apply` (:481-…), whole-quote refusal, no partial effects, and the session's intent
identity over the cloned payload (`session.ts:1902,1909`: `seatClass` is hashed, so lead vs flexible
mint different intent ids, test :185) all stay as they are. Commit-time revalidation (`session.ts:1646`)
runs the same conversion.

**S5.5 `bridge/people.ts:41-43,986-990`.** Import `publicPreferredOpportunity`; add
`preferredOpportunity: publicPreferredOpportunity(state, talentId)` to the preferences object. Profile
(`marketCase`) and workspace (`market.ts:223`) already reuse `block.preferences`, satisfying
`bridge-p14b4-cast-class.test.ts:409-415`.

**S5.6 `bridge/protocol.ts:34-35`.** No edit: `SNAPSHOT_VERSION`/`SCHEMA_ID` derive from the schema.
Protocol 4 unchanged.

**S5.7 generator run (parent-authorized, after the writer's S5 patch is frozen).** Exactly
`npm run generate:bridge-contract` (`vite-node scripts/generate-bridge-contract.ts`, no
`--unity-project`), which atomically rewrites its three owned artifacts
(`scripts/generate-bridge-contract.ts:190-203`): `bridge/schema/project-studio-bridge.schema.json`,
`generated/unity/StudioBridgeDtos.Generated.cs`, `generated/unity/project-studio-bridge.contract-manifest.json`
(new `schemaId`, `projectionVersion: 47`, `generatorSourceSha256` over the bundle that includes
`bridge-schema.ts`). Then `npm run check:bridge-contract` (must be clean) and
`npm run check:bridge-contract:fixtures` (the frozen F01–F04/F09/F12 aggregate at
`tests/fixtures/bridge-contract-union-fixtures.ts:260-267` must NOT move; it excludes F10/F11). The
F10/F11 declaration hashes (`tests/bridge-contract-generator.test.ts:656-657`) and the projection-46
identity pins (:554-560) legitimately move together with `BRIDGE_SCHEMA`; the test-author pins the
actual new bytes (26 §4 :170-173), never self-equality. No handwritten C#, no consumer-repo edit.

---

## 3. Per-step patch plan (ONE writer, cumulative patches, bisectable commits, ONE pushed boundary)

Atomicity facts that fix the order (each verified by reading):
- F-a. `loadBridgeRuntimeCheckpoint` (`runtime-checkpoint.ts:1268-1277`) consults the PRIOR registry BEFORE
  the current decode, so registering `584bdd…` while `SCHEMA_ID` still equals it would route every
  current checkpoint into migration. The registry line therefore lands in the SAME commit as the schema
  identity move (S5), not in S4.
- F-b. `authorRivalPromise` with the flexible-first order mints tagged roots in every natural chain; the
  V29 writer refuses them (`promises.ts:928`), so S2 must land AFTER the writer moves to 30 (S3).
  Confirmed: once S1–S5 land together no live producer can create a root the live writer refuses
  (bridge: the 47 grammar refuses classless P2 and misplaced classes; core: attach throws on a tagged
  non-P2; the V30 validator admits exactly the shapes attach mints).
- F-c. `CurrentEnvelopeSave = SaveFileV30` + strict "must be V30" (S4) requires the writer to already emit
  30 (S3); otherwise every session save/checkpoint round-trip fails.
- F-d. `bridge/promises.ts` history/disclosure hunks need the schema types of the same patch (the row
  type is `BridgeMarketPromiseHistoryRow`), and `DisclosedPromise.seatClass` is wire-visible at once;
  so disclosure + schema + conversion + preferences + generator run are ONE patch (S5).
- F-e. The 26 §3 rule "never live30 under unchanged 46" is a rule about the PUSHED boundary. Inside the
  boundary the S3/S4 commits are transiently live30-under-46; a durable checkpoint written there would
  still reload (its 584bdd… identity routes to the prior path, whose canonical chain accepts V30).
  Nothing runs natively between the commits; the parent pushes all of them together (600 §3 step 7).

| Step | Files | Type-consistent alone? | Writer self-checks (one process at a time) |
|---|---|---|---|
| **S1 core** | `src/core/types.ts`, `src/core/promises.ts` | YES. Root+UI `tsc`: pass (union widening only). Bridge `tsc`: pass — the sole OLD TS2353 (`tests/bridge-p14b4-cast-class.test.ts:364`) clears; no new diagnostic expected (`contract.ts:469-474` count-only literal is assignable to the union). Runtime inside the boundary: rules 4 stamped; V29 writer still live and ADMITS count-only version-4 roots (537-C Q3); tagged roots are mintable only by tests until S2/S5. | `npm run typecheck`; `npm run typecheck:bridge`; `node_modules/.bin/vitest run --project core tests/p14b4-material-evidence-core.test.ts tests/p14b4-d3-matching.test.ts` (17 + 8 PASS unchanged); `… tests/p14b4-cast-class-capacity.test.ts` (expect: "class digests" GREEN; revise/withdraw/nonoverlap/huge×3 advance to their trailing `live()` and stop at `validateSaveV29 … predicate.kind`; matrix 6 + joint + conflicting still at the V29 writer — 537-A's A1 list); `… tests/p14b1-promises.test.ts` (all PASS: no rules pin, V29 writer intact); `… tests/p14bf2-acting-discipline.test.ts` and `… tests/p14b3-rule-revision.test.ts` run ONCE at S1 as the strongest residual-buffer control: with the V29 writer still live their fixtures build, so the ONLY expected failures are the rules-3 pins (`p14bf2` :91,113,126,144,186-187,191,318,325; `rule-revision` :92,138-141,174 — the 600-T set); any other failing line (a classification, bottleneck or winner) is a movement to report, not to fix. |
| **S3 save** | `src/core/save.ts`, `src/core/index.ts` (comment), `src/harness/p14/legacy-v28-fixtures.ts` (type-only widening) | YES for src/ui/bridge sources. Root `tsc` reports EXACTLY four designated test-side diagnostics (tests are in the root include): `tests/contracts/cross-owner-refusal.contract.test.ts:70-74`, `tests/contracts/phase-table-agreement.contract.test.ts:102-106`, `tests/contracts/determinism-floor.contract.test.ts:84/125`, `tests/legacy-parcel-ground.test.ts:343-356` (`SaveFileV30` returned where `SaveFileV29` is declared). Any diagnostic outside that list, or in src/ui, is a defect. Bridge `tsc`: pass. | `npm run typecheck` (report the exact residual list); `npm run typecheck:bridge`; `… tests/p14b4-save-v30-compatibility.test.ts` (expect 36/36); `… tests/p14b4-cast-class-capacity.test.ts` (expect 14 PASS, the conflicting-claim case RED at :282 until 600-T relocates it); `… tests/p14b4-cast-class-outcomes.test.ts` (expect the 14 player cases GREEN, the 10 rival cases at `rivalWorlds` until S2 + natural occurrence). |
| **S4 load/runtime** | `bridge/session.ts`, `bridge/runtime/campaign-library.ts`, `ui/src/engine/adapter.ts`, `bridge/runtime-checkpoint.ts` (NOT the registry line), optionally the two D17 drivers (Q4) | YES for sources. Bridge `tsc` reports exactly one designated test-side diagnostic: `tests/bridge-p06-checkpoint-recovery.test.ts:167,174` (`hydrated.currentSave` is now `SaveFileV30`). Runtime inside the boundary: prior checkpoints migrate to V30 slots while `SCHEMA_ID` is still 584bdd…; the genuine46 fixture decodes as CURRENT and is refused ("must be a current V30 save") until S5 — expected, transient. | `npm run typecheck`; `npm run typecheck:bridge` (report residual); `… tests/bridge-p14b4-cast-class.test.ts` (expect: `base()` passes; G1/G2 still refused at the 46 grammar; G8 still absent) — mainly a typecheck step. |
| **S2 policy** | `src/core/talentMarket.ts` (`authorRivalPromise` + doc only) | YES. | `npm run typecheck`; `… tests/p14b4-cast-class-policy.test.ts` (expect 7/7; the G9 case is a 220-tick natural search, ~1 min); `… tests/p14b4-d3-matching.test.ts` (8). |
| **S5 wire** | `bridge/schema/bridge-schema.ts` (+ registry line in `bridge/runtime-checkpoint.ts:59-63`), `bridge/promises.ts`, `bridge/contract.ts`, `bridge/people.ts`, `src/core/talentMarket.ts` (the two disclosure hunks), then the generator's three artifacts | YES. Root/UI/bridge `tsc`: same designated residuals as S3/S4, nothing new. | `npm run typecheck:bridge`; `npm run typecheck`; `npm run generate:bridge-contract` (parent-authorized runtime; no `--unity-project`); `npm run check:bridge-contract`; `npm run check:bridge-contract:fixtures`; `… tests/bridge-p14b4-cast-class.test.ts` (expect 28/28 by paper); `… tests/bridge-p14b4-runtime47-compatibility.test.ts` (expect 6/6); `… tests/bridge-contract-generator.test.ts` (expect EXACTLY the F10/F11 hash pins :656-657 and the projection-46 identity pins :554-560 RED → test-author repins new bytes); `… tests/bridge-contract-consumer-lock.test.ts` (expect PASS after the generator run). |

Invariant: the five commits are landed by the parent through the index from the writer's cumulative
patches and PUSHED TOGETHER; the frozen candidate is hashed before verification (600 §3 steps 5–7).
The writer never commits, never edits tests/fixtures/generated (the generator writes generated).

After the writer: (i) parent values-only live-version sweep 29→30 over tests (precedent 6948e31; classes
in §4.3) as its own commit; (ii) test-author reconciliations (600-T set + the moved premises named in
§4.3–§4.4); (iii) the parent's serialized verification of 600 §3 step 6; (iv) 600-R review.

---

## 4. Paper effect on the installed RED and the controls

Numbers used: `WEEKS_TO_FIRST_TAKE 5`, `SEAT_CYCLE_WEEKS = TUNING.PRODUCTION_TICKS = 8`
(`tuning.ts:59`), `promiseBuffer(n) = max(1, ceil(n/4))`, `PROMISE_SLACK_WEEKS 8`. `nMax` for a window
of W weeks with no running seat = number of k ≥ 0 with 5 + 8k < W: W=28→3, W=40→5, W=52→6, W=208→26;
residual capacity = nMax − buffer: 2, 3, 4, 19.

### 4.1 The 83-case live-P2 set (537-B groups)

| Group | Cases | After S1–S5 (paper) | Reason / named stop |
|---|---|---|---|
| G1 grammar (11) | bridge cast-class | GREEN (11) | 47 grammar admits explicit `lead`/`leadOrAntagonist`; the nine session cases then need offerability: `current-p1` t-act-09, window [52,92) read at week 45 → from 52, nMax 5, reserved 0 (fixture holds no other reservation for t-act-09), X 1 ≤ 3; existingPath = stock door 1 (legacy development, the same facts that made the fixture's own P1 `promise-0` ACHIEVABLE at week 45); slack 92−57 = 35 → REASONABLY_ACHIEVABLE. cap16/17 windows [52,80+i): nMax 3, residual 2 ≥ 1, slack ≥ 23 → all offerable. Whole-quote refusal: due 105 > 104 → `the due week falls outside the proposed contract`, `refusal: null`. Quote→binding→termination ×2 carries the natural premise "the player wins t-act-09's case at week 52" (UNEXECUTED in the test's own words). |
| G2 inverse (1) | bridge | GREEN | classless P2 fails both union members → INVALID_COMMAND. |
| G3 rules-3 / count-only attach (5) | bridge :266; outcomes PLAYER ×2; policy D3 ×2 | GREEN (5) | :266 as G1's numbers. `realPlayerPromise`: attach tagged at start−7 over [start,start+40) → version 4, receipt rules 4, ACHIEVABLE (nMax 5, reserved 0, stock 1, slack 35; identical to the B-F2 P1 that passes today); binding at `start` = the same natural premise B-F2 relies on; `live()` = V30. Policy: LEAD/FLEX at week 208 over [208,415): reserved = the nonpair CURRENT drafts (≤ 3) + X 1 ≤ 19; existingPath ≥ the same count the passing P1 iteration already needs; D3 match → incumbent wins. |
| G4 strict V29 (8) | capacity matrix 6, joint, conflicting | GREEN 7, RED 1 | V30 writer admits the tagged variants. Matrix: eligible → seated running picture in a mask seat, take next week → nMax 1, X 1, reserved 0 → `reserved+X > 1−1` → FRAGILE "the schedule leaves no spare picture inside the window" (≠ UNKNOWN_CAP); ineligible → mask excludes the seat, event 0 = from+5 ≥ due → nMax 0 → IMPOSSIBLE "no filming week inside the window can reach that many pictures" (an actual bound). Joint: three FRAGILE; `withoutSelfExclusion` → reserved 1 + 1 > nMax 1 → IMPOSSIBLE "promises already made to this person exhaust the window"; tick → one take satisfies lead/flex/P1 by mask; `live(actual)` V30 validates the evidence masks. **Conflicting claim (:279-288) stays RED at :282** (scalar sees only the target's own reservations, `activePromiseReservations` :274-283 filters by beneficiary) — the evaluator-5 case 600-T relocates (600 §3 step 2(b)). |
| G5 rules literal (7) | capacity revise/withdraw/nonoverlap/digests/huge×3 | GREEN (7) | rules 4; `w.opened` reads: nMax 5, reserved 0, X 1 → ACHIEVABLE; self-excluded re-read equals baseline (inputs exclude `promiseId`, reservations row unchanged); un-excluded read differs by the reservations row; withdraw/revise restore the baseline; nonoverlap root starts at `dueWeekExclusive` (excluded by `windowStartWeek < draft.dueWeekExclusive`); lead vs flexible inputs differ by the appended class row; huge: `the due week falls outside the proposed contract`, staged root admitted by V30 (`Number.isSafeInteger` accepts MAX_SAFE_INTEGER), `advancePromisesWeek` skips the unbound root. |
| G6 LIVE_SAVE_VERSION (34) | save-v30 22; outcomes player 12 | GREEN (34, with fixture prerequisites) | save-v30: `makeSave(migrated.state)` equals `migrated` for a `makeSave`-minted V29 file (`broadcastCache === state.broadcastItems`, same seed); then `convertV30ToV29` lossless byte identity (already implemented). Outcomes: `oldBound()` → V30; `playerToFive` direct-stock greenlight is lawful (record 17); the 40-tick shooting prerequisite is UNEXECUTED; `variant()` tagged material is admitted by V30 (family + tag set together); `complete()` real 5→4 take; outcome matrix by mask; DISTINCT own receipts (one `promiseOutcome` per `settle`); first-take-then-cancel early return :679. |
| G7 projection/registry (4) | runtime47 | GREEN (4) | 47 / 30 / 35 ids incl. 584bdd… / `SCHEMA_ID` moved; both slots migrate from their OWN bytes via `migrateToV30` and re-serialise through `makeSave` (byte-equal to `exportSave(migrateToV30(importSave(slot)))` for `makeSave`-minted slots); reset = new session, revision 0, journal []; reopen does not re-migrate (`SCHEMA_ID` ∉ registry). |
| G8 read shapes (3) | own legacy `seatClass: null`; preferences ×2 | GREEN (3) | `disclosedPromise` shape-derived null; `promiseHistoryFor` null for P1 and legacy P2 (both fixture and reader-admitted variant); `preferredOpportunity` from `publicPreferredOpportunity` at both ages. |
| G9 rival order (1) | policy | GREEN by construction of the reads; the four witnesses within 220 ticks are a natural premise | Reads: unproven → FLEX then P1, proven → P1, on one unchanged state; attach = first ACHIEVABLE; `root.feasibilityReceipt` = the chosen read (deterministic). `P1fallback` needs an unproven person whose FLEX read fails where P1 succeeds — e.g. the person seated pre-first-take in SUPPORT on a rival picture with no unproduced rival script (P1 existingPath 1, FLEX 0 → "needs a picture not yet commissioned"); `neither` = no path at all; plausible, UNVERIFIED. |
| G10 rival worlds (9) | outcomes rival | UNVERIFIED (natural) | Needs a rival tagged bound root with the person in a mask seat at shooting-5 within 350 ticks. FLEX authoring makes tagged rival roots exist (G9); seating is decided by `chooseIndustryPackage`'s economics, so a support seat leaves `genuine` unsatisfied that film. Plausible within 350 ticks; may still throw "natural rival prerequisites absent by350" — then it is the partial-evidence boundary 26 §2 :86-87 names, not a defect. The `rivalWorlds()` coupling (537-C Q5) is the test-author's. |

Sum: 83 = GREEN 73 by paper + 1 RED by law (conflicting claim → evaluator-5 file) + 9 natural-premise
(G10). 

### 4.2 Named controls

| Suite | Expected after S1–S5 (before the sweep / 600-T) | Reason |
|---|---|---|
| `p14b4-material-evidence-core` (17) | unchanged GREEN | no `makeSave`/rules/attach barrier (header :6); :59 reads the V29 raw historically. |
| `p14b4-d3-matching` (8) | unchanged GREEN | pure matcher, untouched. |
| `p14b4-save-v30-compatibility` (36) | GREEN 36 | §4.1 G6; the 14 already-GREEN reader cases unchanged. |
| `bridge-p14b4-runtime47-compatibility` (6) | GREEN 6 | §4.1 G7 + the 2 already GREEN. |
| `bridge-p14b4-cast-class` (28) | GREEN 28 (natural premise: player wins at 52) | §4.1 G1/G2/G3/G8; the 12 already-GREEN refusals now refuse for the family/class law, not an unknown key. |
| `p14b4-cast-class-outcomes` (23) | player 14 GREEN; rival 9 natural | §4.1 G3/G6/G10. |
| `p14b4-cast-class-policy` (7) | GREEN 7 (G9 natural witnesses) | §4.1 G3/G9 + 4 already GREEN. |
| `p14b4-cast-class-capacity` (15) | 14 GREEN + conflicting-claim RED at :282 | until 600-T relocates it; the `rulesVersion 4` pin (:201) stays. |
| adapter (33) / enumerator (45) / kernel (41+5) / hold-order (5) / sort (7) / Ready replay (17 + stale :234 RED) / Started replay (28) / bill reductions | unchanged | none reads `rulesVersion` (`promiseCapacityOwners.ts:11,67`); their `live` = `makeSave(...).state` admits count-only states at V30; `PromiseDraft` widening compiles (`promiseCapacityOwners.ts:94,103-104` use `.count` and `promiseCastSlots(draft)`); modules not edited. The stale route stays RED at :234 exactly as 515 §6 (c) records. |
| `p14bf2-acting-discipline` | RED at fixture construction (:62 `validateSaveV29(makeSave(state))` throws "expected version 29") for EVERY case that calls `fixture()`, plus the rules pins :91,113,126,144,186-187,191,318,325 (600-T), plus V29 pins :102, :234, :296, :329 (sweep). :296 (`exportSave(makeSave(loaded.state))).toBe(raw)`) is a MOVED premise, not a value: a V30 writer cannot reproduce V29 bytes; the test-author re-expresses it (e.g. `exportSave(makeSave(state)) === exportSave(migrateToV30(importSave(raw)))`). The residual buffer does NOT move its classifications: :176's second read has reserved 1 + X 1 = 2 ≤ residual 3 (40-week window), so it stays FRAGILE "needs a picture not yet commissioned" through the existing-path test, exactly as at rules 3; :171 count 2 likewise. | |
| `p14b3-rule-revision` | RED: :92 (600-T), :103 byte pin (moved premise, same as above), :138-141/:174 (600-T), :145/:187 `validateSaveV29(importSave(exportSave(makeSave(…))))` throws (sweep). | |
| `p14b1-promises` | RED at :503 only (`validateSaveV29(makeSave(withActivePromise))`, sweep); Example B (:477-507) classification and bottleneck unchanged (reserved 1 + X 1 = 2 ≤ residual 4 for the 52-week window → existing-path FRAGILE "not yet commissioned"); :657-661 loads through `migrateToV29`, which losslessly accepts a count-only V30 export. | |
| `bridge-p14b1-promises` | RED :207 (`LIVE_SAVE_VERSION` 29), :493, :509 (sweep). Group 5 (rival leak via direct `attachPromise`) unchanged. | |
| `bridge-p14b3-promise-command` | RED for the whole file: helper-level `validateSaveV29(JSON.parse(JSON.stringify(makeSave(state))))` at :35/:83/:133 and :337/:482-485 (sweep). | |
| `p14b1-trust-chooser` | test 6 (:439) designated → 600-T migrates it to real tagged P2 (records 110/554). NEW moved premise not yet in 600 §3 step 2: the natural-authoring cases at :641-697 pin the FIRST natural rival proposal to `family: 'APPEARANCE_COUNT'`, `predicate {count:1}` (:666-677, :686-688); under S2 an UNPROVEN first actor receives FLEX P2 → RED by law → test-author reconciliation. Other chooser winners can move where a rival's FLEX P2 now earns D3 opportunity for an unproven person (§4.4). | |
| `bridge-p14b2-trust` (22) / `p14b2-fixture-preconditions` | RED :132 (LIVE pin), :275/:412 (`validateSaveV29(makeSave)`), :456-457 (sweep); `rivalFixture()` :225 (`tests/helpers/p14b2-fixtures.ts`) throws the same way → every rival-fixture case RED until the sweep. After the sweep: `rivalFixture` searches any rival SATISFIED promise by 240 (family-agnostic), but FLEX roots are satisfied only from lead/antagonist seats, so the week found can move; the poaching fixture ("wins a real rival-owned case", reconciled at 556/557 under D3) can move again because rival FLEX P2 earns D3 for unproven persons. Natural-chain reconciliation, never loosening. | |
| historical save corpus (the 25 set, 137 PASS at 551/573) | unchanged for version-specific readers; RED only on LIVE pins inside them (`p14b1-save-v29.test.ts:109` `LIVE_SAVE_VERSION` 29; `p13b-s*-save-v2x` "load to the live version" lines) — all sweep class. Sentinels are already at 31/"1 through 30". | |
| `bridge-p14b2-checkpoint` (2) | RED at :34-37: the genuine45 checkpoint's slots now migrate to V30 bytes, so `after.currentSaveJson === before.currentSaveJson` (a byte identity that held only while live = 29) is a MOVED premise → test-author (pattern: runtime47 :191-205 compares against `exportSave(migrateToV30(...))`). | |
| generator/consumer-lock | `bridge-contract-generator` RED exactly at :554-560 (projection-46 identity) and :656-657 (F10/F11 hashes) → test-author pins the new bytes; `check:bridge-contract:fixtures` and the frozen aggregate :260-267 unchanged; `bridge-contract-consumer-lock` PASS after the generator run. | |

### 4.3 The live-version sweep 29→30 (parent, values only; precedent 6948e31)

Grep classes at HEAD (counts are files/lines, `git grep` on `tests/`): `migrateToV29` as the live load —
38 files (keep it in the version-boundary files `p14b1-save-v29`, `p14b1-first-take`, `p14b1-t4-regressions`
where it reads V29 fixtures historically; move it where it means "load to the live version", e.g.
`tests/_historicalCurrent.ts:1,8-11`, `bridge-p07a-w6-result-continuity:219,276`, `c1-m6-*`, …);
`validateSaveV29(makeSave(…))` / `validateSaveV29(importSave(exportSave(makeSave(…))))` — 6 files;
`saveVersion).toBe(29)` / `LIVE_SAVE_VERSION).toBe(29)` / `!== 29` — ~74 lines in ~40 files (keep the
ones asserting a HISTORICAL fixture's own version, e.g. runtime47 :143-144, `bridge-p14b2-checkpoint:18-19`);
`SaveFileV29`-typed helpers returning `makeSave` — the 4 root-tsc files + `bridge-p06-checkpoint-recovery:54`;
one-past sentinels — none (already 31). "Byte identity with the fixture after makeSave" pins
(`p14bf2:296`, `p14b3-rule-revision:103`, `bridge-p14b2-checkpoint:34-37`) are MEANING changes → test-author,
not the sweep.

### 4.4 Fresh classifications in natural chains that CAN move under `reserved + X`

Rule: a count-1 fresh read moves (ACHIEVABLE/FRAGILE-by-path → FRAGILE "no spare picture") only when
`reserved ≥ nMax − buffer(nMax)`: ≥ 2 overlapping reservations for a 28-week window, ≥ 3 for 40, ≥ 4
for 52, ≥ 19 for 208. Reservations = OTHER active promises for the SAME person (bound OPEN or CURRENT
attached, any issuer, overlapping window).
- Rival authoring (208-week windows): never moves (needs 19 competitors).
- `genuine-v29-rival-current-p1`: two competing rival CURRENT P1s per person (r01, r02) → the second
  read has reserved 1 → no move.
- `current-p1` / bridge cast-class: reserved 0 → no move (verified from the fixture bytes).
- B-F2 :171/:176 (40-week, reserved ≤ 1), Example B (52-week, reserved 1), policy `controlledPair`
  (208-week, ≤ 3 nonpair CURRENT drafts + own) → no move.
- Where it CAN move: a player quote with a window ≤ 36 weeks for a person who already holds ≥ 2
  overlapping CURRENT rival drafts (e.g. cap16-shaped [52,80) windows on a person like
  `person-…-r01-0` of the rival fixture), or a 52-week player window with ≥ 4 competing reservations.
  No installed test constructs either; 600-T's step 2(d) inventory is the place to record the actual
  post-writer movements.
The LARGER natural-chain mover is NOT the buffer but S2 itself: every unproven person a rival proposes
to now receives a FLEX P2 (when achievable) instead of a P1; that changes rival material digests,
gives rivals D3 opportunity against the player's P1 for unproven persons, and can change settlement
winners in any natural chain past a rival case (B1/B2 chooser and poaching pins; `rivalFixture`
timing). This is the plan's own delegated hypothesis (plan :185-193, :198-200 "future choices/demand may
change"), so those are moved premises for the test-author, never assertion loosening.

---

## 5. NOT-writable / frozen list (600-W must not touch)

- `src/core/save.ts`: the `validateSaveV29` branch :8604-8618, `convertV28ToV29` :8629-8642,
  `convertV29ToV28` :8651-8662, `migrateToV29` :8669-8673, `validateSaveV30` :8679-8692,
  `convertV29ToV30` :8697-8700, `convertV30ToV29` :8704-8710, `migrateToV30` :8714-8717 (all present
  and cited), the dispatch :5248-5285, every `cannot downgrade SaveFileV30` refusal (19 sites), every
  frozen `makeSaveVn`/`validateSaveVn`.
- `src/core/promises.ts`: `promiseDigest` :147-154, `attachedPromiseDigest` :160-169, `proposalDigest`
  :173-185, `promiseCastSlots`/`qualifyingTakes` :548-569, `advancePromisesWeek` :605-645,
  `breakPromisesOnTermination` :652-670, `breakPromisesOnCancel` :676-694, both validator branches
  :809-1023 (the V29 `exact(predicate, ['count'])` :928 stays strict), `projectPromisesPreV29`
  :1033-1048, trust :696-800, every refusal string now in force (the classless-P2 sentence is NEW and
  REPLACES the deleted P2 `NOT_OFFERED` line; the P3–P5 sentences, the numeric/window/person/acting
  sentences, "no filming week…", "promises already made…", the three FRAGILE sentences are unchanged).
- `src/core/promiseCapacityKernel.ts`, `promiseCapacityOwnerReplay.ts` (515 §6 (c): untouchable),
  `promiseCapacityOwners.ts` (553), `promiseCapacityEnumerator.ts` (574): not wired, not edited; their
  header stale note (574-R item 1) stays deferred.
- Caps/tariffs/limits: the 200000 work cap, the 162 §2 metric, `PROMISE_SLACK_WEEKS`, `promiseBuffer`,
  `WEEKS_TO_FIRST_TAKE`, `TUNING.PRODUCTION_TICKS`, the 1000 loop bound, every test timeout.
- `tick.ts:1102-1110` order; `actions.ts:599,2637` hooks; `operations.ts` first-take owner.
- `hollywoodPolicy.ts`, `hollywoodTick.ts` (record-only, own RED later).
- Tests (`tests/**`), fixtures (`tests/fixtures/**`, incl. the genuine V29 corpus and the projection45/46
  runtime checkpoints), `generated/**` except through the generator run, `bridge/schema/project-studio-bridge.schema.json`
  except through the generator run, `tests/fixtures/bridge-contract-union-fixtures.ts` (F10/F11 reference
  the whole schema by identity; the frozen aggregate must not be reminted).
- `bridge/industry.ts` Pulse join and public receipt reasons; `caseDisclosure` copy; the undisclosed row.
- `src/harness/p14/legacy-v28-fixtures.ts` beyond the two-line type widening (Q5); all genuine minters.
- Records, plan text, headers (parent-owned).

---

## 6. Risks and open questions for the contract-auditor (600-B)

1. **`seatClass` DTO spelling and the C# shape change.** Proposed wire key `seatClass` with values
   `'lead' | 'leadOrAntagonist'` on the P2 draft member, the own snapshot and the history row
   (nullable on the two read shapes). The installed RED already uses exactly this spelling
   (`bridge-p14b4-cast-class.test.ts:31,100,128,326-331,387`; `p14b4-cast-class-*` use the core's
   `seatClass`), so any other spelling is a test change. Consumer impact: the generator turns the
   sealed `StudioMarketProposalPromiseDraftPayload` into an abstract base with two sealed members
   (`…CastClassPromiseDraftPayload`, `…CountPromiseDraftPayload`) and a `family`-switching converter;
   Unity's composer must instantiate a member. Backlog item for the Unity note; not native work now.
   Alternative considered and rejected: a single object with `seatClass: nullable(...)` — permissive
   optional-class validation, forbidden by 26 §4 :131-134.
2. **`preferredOpportunity` on the preferences snapshot at 47.** It belongs there: plan :232-233 ("Expose
   the actual derived preference on the existing profile/case preference surface"), 26 §4 :150-151, and
   the RED (`bridge-p14b4-cast-class.test.ts:409-415`) all name the preferences snapshot; profile and
   workspace already reuse `block.preferences` (`people.ts:986-990`, `market.ts:223`), so one emitter.
   The `line` text is unchanged (no copy leak). Confirm.
3. **UI adapter arms.** Three `migrateToV29` sites (`adapter.ts:3796, 3808, 3822`) move to `migrateToV30`;
   the import at :112. Plan :137-138 calls this serialization plumbing, not rendered-UI work; no other
   `ui/src` file references the save version (grep). Confirm the scope reading.
4. **D17 drivers.** `run-d17b-continuation.ts:37,183` and `run-d17b-week86.ts:35,124`: root `tsc` passes
   untouched (V29 state is assignable to the live V30 `GameState`); behaviour differs only for a V30 file
   with a tagged root (fail-loud refusal via `convertV30ToV29`). 26 §3 gates the sweep on
   authorization; the 28→29 engine commit (8bb57388) swept both. Recommendation: include the four
   tokens in S4 (uniformity, zero risk); the parent decides.
5. **`legacy-v28-fixtures.ts` type-only widening.** Required for the root `tsc` (`emit` :40 receives
   `makeSave` at :79/:104/:208). Precedent 8bb57388 did exactly this at 28→29 while leaving the minter
   FROZEN (:13-17) and its `!== 28` refusal (:47). Confirm that a two-line annotation widening is inside
   "do not rewrite … genuine minters" (26 §3 :102).
6. **Designated test-side typecheck residuals inside the boundary.** Root `tsconfig` includes core
   tests, so after S3 the root `tsc` cannot be green until the parent's sweep: exactly
   `tests/contracts/cross-owner-refusal.contract.test.ts:70-74`, `tests/contracts/phase-table-agreement.contract.test.ts:102-106`,
   `tests/contracts/determinism-floor.contract.test.ts:84/125`, `tests/legacy-parcel-ground.test.ts:343-356`; after S4
   the bridge `tsc` has `tests/bridge-p06-checkpoint-recovery.test.ts:167,174`. The 28→29 precedent had
   the same shape (6948e31: "`npm run typecheck` clean" only after the sweep). Confirm the designation
   and that the writer's acceptance is "src/ui/bridge sources clean; residuals exactly this list".
7. **`authorRivalPromise` flexible-first order vs the live writer before S3.** F-b in §3: S2 must follow
   S3 inside the boundary. Confirmed that with S1–S5 landed together no live producer mints a root the
   writer refuses: the 47 grammar refuses classless P2 and misplaced classes before mutation; core
   attach throws on a tagged non-P2; V30 admits exactly what attach mints. The only remaining
   producer of a V29-unsaveable state is a test calling `attachPromise` directly with a tagged draft on
   a state it then hands to `validateSaveV29` — a test-side matter.
8. **Residual-buffer movement of fresh P1 in the natural-chain controls.** Paper (§4.4): no installed
   control moves (thresholds ≥ 2/3/4/19 competing reservations by window length; the fixtures show
   ≤ 1–3 at 208-week windows). The observable movers are S2's FLEX authoring (rival material, D3 wins,
   `rivalFixture` timing) and the B1 natural-authoring pins `p14b1-trust-chooser.test.ts:641-697`
   (`family: 'APPEARANCE_COUNT'` on the first natural rival proposal) — these are NOT yet in 600 §3
   step 2's list; recommend adding them to 600-T's inventory (2(d)) explicitly before the writer runs,
   so movements are reconciled from evidence, never loosened.
9. **Plan vs record 26 after the amendment.** One disagreement remains: 26 §2 row 3 says "Install the
   reviewed owner-adapter/class-capacity result … Then stamp rules4"; the amendment (plan :33-35,
   600 §2) re-reads that row as the reviewed class-aware scalar service at evaluator 4 — this note
   follows the amendment. A second, smaller one: 26 §3 :100-101 keeps the D17 sweep conditional while
   the 28→29 precedent swept it (Q4). No other conflict found between the amended plan, 26, 23, 17 and
   this design. The plan's "Deduplicate inProduction script/production identity" (:148) and
   "same-studio shared … capacities BOTH constrain P2" (:144-145) are evaluator-5/kernel law under D1
   (a) and are deliberately NOT folded into the scalar (the `existingPath` formula :398-400 stays as
   at rules 3 apart from the mask); confirm that reading.
10. **Classless legacy P2 and `breakPromisesOnCancel`.** With `NOT_OFFERED` replaced by the classless
    refusal, a reader-admitted BOUND legacy P2 still reclassifies IMPOSSIBLE on a pre-take cancel of a
    picture its person is seated on, exactly as today (same classification, new sentence). No
    regression; the causal coupling itself is 600 §3 step 8. Confirm record-only.
11. **Honest missing-class reason (routine; proposal).** Bottleneck string for a classless P2 at a new
    quote/freeze: `a seat-class promise needs an explicitly selected class; count-only P2 is not offered`.
    Rationale: names the missing fact and the not-offered consequence (plan :27-28, :119-121); no
    class word that could leak through public copy (the string is a private receipt bottleneck, never a
    Pulse reason). Companion read-side refusal for a tagged non-P2 draft:
    `a selected seat class applies only to a seat-class promise`. Attach-time throw for a tagged non-P2:
    `promises: a selected seat class is legal only on a LEAD_OR_SIGNIFICANT_ROLE_COUNT promise, not "<family>"`.
    No test pins any of these; the writer may adjust wording inside the stated meaning.
12. **`makeSave` byte-identity assumptions.** save-v30 :156 and runtime47 :191-205 hold only for
    `makeSave`-minted fixtures (`broadcastCache === state.broadcastItems`, same `seed`); the genuine
    corpus and the projection46 checkpoint were minted by the V29 writer, so this holds by provenance,
    but it is a paper inference, not an executed check.
13. **Transient live30-under-46 inside the boundary (F-e).** S3/S4 commits precede S5 for
    bisectability. If the auditor prefers no such commit at all, S3+S4+S5 become one patch (still one
    writer, still one push); the trade is bisect granularity. Recommendation: keep five commits.
14. **Generator run timing.** The generator writes `generated/**` and the schema JSON; it runs only
    under the parent's runtime handoff after the S5 patch is frozen (26 §4 :161-162). The consumer-lock
    test then passes against the new manifest; F10/F11 pins move (test-author). Confirm the sequencing
    "writer patch → parent generator run → hash the whole candidate".
15. **Natural premises that may stay unexecuted after everything lands.** G10 (9) and the four G9
    witnesses within 220 ticks, the player winning t-act-09 at 52 (bridge quote→binding ×2 and
    `realPlayerPromise`), `playerToFive` within 40 ticks. Each is labelled UNEXECUTED in its test; a
    miss is a fixture finding for the test-author, not license to synthesize.

---

## 7. Evidence limits

- READ-ONLY, nothing executed: no `tsc`, no vitest, no generator, no node. Every "PASS/GREEN/RED"
  above is a paper prediction from committed test bodies (`git show HEAD:tests/…`) and source at
  5e6ac5dc. The typecheck claims (assignability of V29 to V30, the exact residual diagnostic lists)
  are by reading `tsconfig.json`/`tsconfig.bridge.json`/`ui/tsconfig.json` includes and the typed
  sites; TypeScript may report more or fewer lines. Not verified by execution.
- Fixture facts were read by `gunzip -c | grep` of the promise rows (current-p1, rival-current-p1,
  bound-open-p1, refused-p2-count-only-current-draft); proposals/employment/production rows of those
  fixtures were not decoded, so "reserved = 0 for t-act-09" rests on the absence of any other root for
  that person, and the stock-door availability at week 45 is inferred from the fixture's own ACHIEVABLE
  P1 receipt, not observed.
- Paper `nMax`/buffer arithmetic uses the constants named in §4; no scenario was run.
- The 28→29 sweep inventory (§4.3) is a grep count at HEAD, not a curated list; the parent's sweep must
  re-classify each hit as live pin vs historical read.
- The D3/winner movements under S2 (§4.4) are directional (which way D3 shifts), not enumerated per
  test; only the pins that literally assert `APPEARANCE_COUNT` on a natural rival root are named.
- Generator behaviour for the new union is inferred from `scripts/bridge-contract-csharp.ts` and the
  existing generated converter for `StudioMarketProposalSnapshot`; the actual C# output is produced only
  by the parent's generator run.
- No native/Unity, usability or Owner-acceptance claim; nothing here is a build receipt.
