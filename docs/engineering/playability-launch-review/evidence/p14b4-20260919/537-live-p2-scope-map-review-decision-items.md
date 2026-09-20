# 537 — B4 live-P2 scope: implementation map, RED reachability, A1 proposal review and decision items

2026-09-20. Claude Code parent. Three READ-ONLY specialist reports on HEAD
`7680d6076ab9f19bdfc92451cf3f0cb1b408bc7f` (source identical to `69d16f8`; tree clean; no
edits, no runtime, no Git by any specialist): 537-A sim-core implementation map and next-slice
proposal, 537-B test-author RED-reachability classification of the 83 failing 536 cases, 537-C
contract-auditor review of 537-A/537-B against the accepted plan
(`plans/P14B4-HEADLESS-PLAN.md`, SHA256 `382252e2…`) and records 17/23/26/29. All three are
reproduced verbatim in §5. Nothing in source, tests, fixtures, caps, validators, plan text or
header authority changed. No writer was released.

## 1. Findings the parent adopts

- The two pure staging steps of 26 §1 (tagged material tuple, class-qualified first-take helper)
  are already on HEAD (`fbe2d28`) and GREEN-covered by `p14b4-material-evidence-core` (17 PASS in
  536). 537-A found it; 537-C Q4 verified source `promises.ts:147-169, 548-569` and the test
  cases. The 26 §1 boundary is consumed; the next production step is 26 §2.
- No installed RED stops at a pure boundary. 537-B classified all 83 failures by true stop point
  (10 groups): 11 bridge grammar (`seatClass` unknown key on the closed draft), 1 inverse grammar,
  5 rules-3 `NOT_OFFERED`/count-only attach, 8 strict V29 `predicate.kind`, 7 `rulesVersion` 3
  vs 4 at the pure-read helper, 34 `LIVE_SAVE_VERSION` 29, 4 projection 46 / prior registry,
  3 reached assertions against projection-46 read shapes, 1 reached rival-authoring order,
  9 fixture guard (`rivalWorlds()` needs a tagged rival root). No missing export or module.
  537-A's grouping (42 Save29, 12 core service, 10 rival authoring, 12 grammar, 3 DTO,
  4 projection) is the same set with the second gates behind the 3-vs-4 and D3 cases named.
  537-C Q6 confirmed NONE smaller than A1 turns an installed case GREEN.
- No failing expectation contradicts the plan, record 17 or 26 (537-B §3; 537-C agrees).
  Eleven of the twelve passing bridge cast-class cases are vacuous with respect to the B4
  grammar (refused today only because the key is unknown); the 14 passing save-v30 cases and
  4 passing policy cases are genuine current-law coverage (537-B §4).
- Two citation drifts to carry: the count-only copy is `promises.ts:495` (not 490);
  `NOT_OFFERED_IN_B1` is `:204-209`, applied `:371-372` (537-C).

## 2. The A1 proposal is NOT lawful as proposed; no writer

537-A proposed A1: draft/attachment predicate union, full-predicate copy at attach, a class-mask
plus shared-residual scalar `promiseFeasibility`, `settle` narrowing, live type aliases to V30,
and `PROMISE_RULES_VERSION = 4`, pre-cutover, Save29 writer untouched. 537-C reviewed it:

- The plan defines evaluator 4 as the whole: shared residual capacity for fresh P1 AND tagged P2
  (:118-122) AND the bounded-computation extension with the exact UNCERTIFIED string (:124-129),
  with "No placeholder matcher is authorized" (:131-132) and "not a guessed scalar maximum"
  (:230-231); 26 §2 stamps rules 4 only after "the reviewed owner-adapter/class-capacity result".
  A scalar stamped 4 would name a law neither text defines. The parent verified the quoted plan
  lines and 26 §2 row 3 itself.
- Any 3→4 move is never writer-only: the B-F2 and B3 regression controls pin rules 3 on fresh
  evaluations and attachments (`tests/p14bf2-acting-discipline.test.ts:91,113,126,144,186-187,
  191,325`; `tests/p14b3-rule-revision.test.ts:92,138-141,174`; parent grep-verified). The
  B3→B-F2 move was reconciled by the test-author (rule-revision header :87-89); a 3→4 move needs
  the same explicit reconciliation (plan T2). 537-A listed the B-F2 file as unchanged; wrong.
- Under 537-A's option (a) the capacity file's shared `rulesVersion 4` pin (`:201`, all 15 cases)
  would move again when the kernel lands as 5, and the conflicting-claim case (`:279-288`) stays
  RED because the scalar cannot see another beneficiary's claim; three `bottleneck !==
  UNKNOWN_CAP` assertions would pass vacuously.
- The safety claim (ordinary live sessions stay saveable: the frozen V29 branch admits any
  positive root/receipt version, `promises.ts:910, 925-928, 949-951`; only tests can mint tagged
  roots after A1) is TRUE (537-C Q3; parent verified the validator lines). It does not cure the
  law question. A1 pre-cutover would also create an undefined era (V29 writer emitting
  evaluator-4 receipts) and the residual-buffer change moves fresh P1 classification in natural
  chains (reconciliation surface, not writer-only).

Parent disposition: A1 is withheld. No production change is lawful for the live-P2 scope until
D1 below is decided. This is the same kind of boundary as 515 §6 and is recorded, not resolved,
by the parent (project rule: an undefined or contradictory contract is reported, not filled).

## 3. OWNER / Current Ops decision items (non-blocking; alongside 515 §6)

**D1 — evaluator-4 definition and sequencing.** The installed RED asserts `rulesVersion 4` on
scalar reads; the plan defines evaluator 4 as residual capacity plus the bounded joint
certificate; the measured budget (D2) makes the certificate unreachable for ordinary long-window
offers under the 200000 hypothesis. Options:
- (a) Amend the plan: evaluator 4 = class-restricted fixed-seat paths + shared residual capacity
  on the existing count-family scalar; the kernel joint certificate and the UNCERTIFIED→FRAGILE
  mapping become evaluator 5. Consequences: P2 launches on the same minimum-countdown heuristic
  P1 has under rules 3 (parity, not certification); test-author reconciles the B-F2/B3 pins and
  disposes the kernel-vocabulary capacity cases (separate evaluator-5 file or explicit unreached
  marking); the capacity pin moves at 5. Parent recommendation: (a), implemented INSIDE the
  coordinated core/save/runtime/wire cutover (26 §2–§4) rather than as a pre-cutover era, with
  natural-chain reconciliation authority for residual-buffer movements.
- (b) Hold 4 for the kernel-backed service. Consequence: capacity 14 + outcomes 2 + policy 2 +
  every downstream cutover case stay unreachable until an owner adapter with a complete
  enumerator exists and D2 is answered; live P2 waits on that.
- (c) Revisit the computational hypotheses (cap/tariffs; Owner authority per 515 §6) so the
  certificate route can fit ordinary offers, then keep 4 as defined.
Whoever rules should see that (a) changes what an offer's ACHIEVABLE means at launch; that is why
the parent treats it as a genuine product decision (plan :361-363) and not a settled
engineering task.

**D2 — kernel budget finding (performance/design, reported, not resolved).** One hand-written
Ready plan costs 182925 of the 200000 shared units on the first-take fixture (534/535). The
plan's achievable probe for X=1 needs B=2 target events, i.e. at least two picture traces over
the 40-week baseline window; by paper (537-A §3, 537-C D2) that cannot fit, so the kernel
route as specified cannot certify ordinary fresh offers under the current hypothesis. Plan
:128-129 and :319-321 say this is a finding to report, "not license to weaken tests", and not a
gameplay/save limit. Record 538 measures the real capacity fixtures (2-week fixed-cast windows,
the 40-week probe, a control) so the Owner sees numbers, not paper.

## 4. Adopted direction now (no writer)

1. 538 (in progress): evidence-only kernel budget measurement on the capacity RED's own
   `world()` states, one new test file authored by the test-author, run by the parent under
   record-check, archived; no assertion of any future law, no fixture edits.
2. Then a bounded review of a detached owner-adapter FIRST slice, lawful under every D1 option
   and plan-required before T1 authoring (:131-132; p14bf2 13/14 KEEP as architecture
   preparation): claim collection from `state.promises` (B3 membership law, mask by shape,
   remaining = count − class-qualified takes), trace assembly into the kernel input over the
   EXISTING explicit-plan producers, result→receipt mapping with the exact UNCERTIFIED string,
   inputs digest; NO enumerator (coverage stays incomplete → UNCERTIFIED), NO live wiring, NO
   version stamp, no rival context. Enumerator is a separate reviewed slice.
3. Replay reductions C1/C5–C7 (515 §3) remain the parallel track; not started.
4. Record-only follow-ups carried: 537-B's `rivalWorlds()` coupling (advisory: split
   `rivalSlots()`/`rivalGenuine()` at reconciliation time, not now), 537-A/537-B citation drifts,
   518 defects 2–3, 527 defect 4, 515-A's C8 position probe.

No Unity, native, save, projection or Owner-acceptance claim. Save29/rules3/projection46 stay live.

## 5. Verbatim specialist reports

Handbacks as returned, unedited. Their proposals and verdicts are advisory; §1–§4 above is the
parent's adjudication.

### 5.1 — 537-A (sim-core, READ-ONLY implementation map and proposal)

```text
# 537-A — READ-ONLY implementation map and next-slice proposal (sim-core)

**Status: DONE (read-only).** No file edits, no vitest/tsc/npm, no Git/network. Every GREEN/RED statement below about a *future* change is paper analysis, not an executed result.

**Model observed:** the harness identifies this session as "Fable 5.1" (`claude-fable-5-1`). I cannot verify beyond the system prompt.

**HEAD observation:** started at `69d16f88…2349b` clean (three 536 evidence files untracked). During my read the parent committed `7680d6076ab9…` "Record 536" (4 files under `evidence/p14b4-20260919/`, `.patch` 0 bytes, no source). All source line numbers below are identical on both commits. I did not touch Git.

## Sources read (worktree `/Users/zacheryspector/The-Movies-headless-program`)

Evidence: `evidence/p14b4-20260919/536-b4-owner-integration-state.{txt(result/frame lines only),json,md}`, `23-…`, `26-…`, `29-…`, `17-…`, `00-start.md:1-120`, `515-…:12-27,47-69,133-143`; `evidence/p14bf2-20260919/12,13,14`; `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md:1-364` (whole).
Source: `src/core/promises.ts:1-700, 797-1048`; `src/core/types.ts:2128-2250`; `src/core/save.ts:5248-5282(grep), 6385-6475, 8595-8625, 8669-8717(grep)`; `src/core/talentMarket.ts:470-498, 535-566, 680-812, 1039-1113, 1222-1282` + function index; `src/core/promiseCapacityKernel.ts:1-110, 1030-1047`; `src/core/promiseCapacityOwnerReplay.ts:1-125, 2700-2797`; `src/core/hollywoodPolicy.ts:1-66`; `src/core/hollywoodTick.ts:60-100, 140-190`; `src/core/tick.ts:1090-1115`; `src/core/actions.ts:588-602, 2628-2640`; `src/core/index.ts:1397-1428`; `src/core/tuning.ts` (3 constants); `bridge/schema/bridge-schema.ts:211-230, 1724-1780, 2219-2262, 2280-2295`; `bridge/contract.ts:335-362, 434-480, 585-598`; `bridge/promises.ts:1-142`; `bridge/runtime-checkpoint.ts:1-20, 59-171(grep), 250-262, 435-465, 835-855, 970-1025`; `bridge/session.ts:41,129-136,1895-1930`; `bridge/people.ts:970-995`; `bridge/trust.ts:6,30-36`; `bridge/runtime/campaign-library.ts:5,48,127`; `ui/src/engine/adapter.ts:111-112,3790-3822` (grep).
Tests: `p14b4-cast-class-capacity:1-366`; `p14b4-cast-class-outcomes:1-250, 310-486`; `p14b4-cast-class-policy:1-80,160-343,344-531`; `p14b4-save-v30-compatibility:1-200,223-290`; `bridge-p14b4-cast-class:1-165,166-350,350-468`; `bridge-p14b4-runtime47-compatibility:1-60,140-235`; `p14b4-material-evidence-core:1-40(imports),170-396`; `p14b4-ready-replay-first-take:1-80,180-330`; `p14b4-ready-replay-stale-target:1-60` + assertion index. `git log` for promises/talentMarket/types; `git show --stat` of `fbe2d28`, `65c7502`, `956a17f`, `7680d60`; `package.json` scripts.

## 1. Implementation map (what exists on HEAD / what is missing / which 536 failures it gates)

Two facts first. (a) The 26 §1 "two pure steps" are **already implemented** on HEAD by `fbe2d28 feat(p14b4): honor explicit cast classes in material and outcomes`: `promiseDigest(promise: ProfessionalPromiseV30)` at `promises.ts:147-156` appends `[kind, seatClass]` only for the tagged shape (old four-tuple exact), `attachedPromiseDigest` takes the V30 pick (160-171), and `promiseCastSlots`/`qualifyingTakes` (548-569) apply the mask (legacy any family → all three; lead → lead; flexible → lead+antagonist) with issuer/half-open window/distinct-production rules. The GREEN `p14b4-material-evidence-core` (17) exercises exactly this on real 5→4 takes with synthetic tagged material. So §1's staging boundary is consumed; the next step is 26 §2. (b) **No live owner imports the kernel or replay producers**: grep of `src`, `bridge`, `ui/src` finds no importer of `promiseCapacityKernel`/`promiseCapacityOwnerReplay` outside themselves and tests.

| Owner (26 map) | Present on HEAD | Missing | 536 failures gated |
|---|---|---|---|
| `types.ts` | `CastRoleCountPredicate`, `ProfessionalPromiseV30`, `GameStateV30` (2212-2229) | live aliases still V29 (2233-2234) | none directly; blocks typing a tagged mint in `attachPromise` |
| `promises.ts` evaluations | scalar §4.3 service 366-417; `reclassifyPromise` 419-433 passes whole predicate; `feasibilityInputs` 293-333 | `PROMISE_RULES_VERSION = 3` (42); `NOT_OFFERED_IN_B1` refuses all P2 (204-209, applied 371); `seatedPreFirstTake` 262-272 and `expectedFirstTakeWeek` 335-352 class-agnostic (fixed cast in a non-mask seat still counts as event 0); buffer test uses gross `X` not `reserved + X` (404); inputs digest has no class | capacity 7 (`pureRead` rulesVersion 3≠4, test:201); outcomes 2 (line 324 expects version/rules 4 + ACHIEVABLE); bridge 1 (line 266 IMPOSSIBLE) |
| `promises.ts` attachment | `attachPromise` 463-528: at-most-one, redigest, no RNG | `PromiseDraft.predicate`/`PromiseAttachment.predicate` are `{count}` (189-209, 435-440); mint copies **only count** (490) and stamps version 3 (487) | policy D3 2 (line 284 `root.predicate` equals LEAD); part of outcomes 2 |
| `promises.ts` outcomes | class-aware `qualifyingTakes`, `advancePromisesWeek` 605-650, one own receipt, terminal idempotence (GREEN 17) | `settle` update type is broad `Partial<ProfessionalPromise>` (571-576; 26 row 5); `breakPromisesOnCancel` 676-694 still treats scalar IMPOSSIBLE as causal (26 §2 "separate correction"; **no installed RED reaches it**) | none |
| `promises.ts` validation | `validatePromiseRootsForVersion(…, 29\|30)` 818-1031: V30 admits tagged only for P2 and validates class-qualified evidence; V29 branch strict (exact `['count']`) | nothing (frozen by design) | the 8 capacity "strict V29 refuses predicate.kind" are *correct* refusals of the frozen validator reached via `makeSave` |
| `talentMarket.ts` | `publicPreferredOpportunity` 722, `promiseMatchesPreferredOpportunity` 728-740, D3 in `bandsFor` 795-798, `attachedFeasibility` 756-772 (whole predicate), `survivesFreeze` digest+feasibility 1052-1098, `commitWinningPromise` 1100-1112 (`65c7502`, `956a17f`) | `authorRivalPromise` 1260-1277 authors P1/count1 only (plan: unproven tries flexible P2 then P1; proven P1); `disclosedPromise` 535-547 count-only (own `seatClass` DTO); no final-seating preference | outcomes 9 (`rivalWorlds` 233 throws at 350 ticks: `genuine` tagged rival root can never exist); policy 1 (line 421 expects FLEX first); bridge own-snapshot 1 (with schema) |
| `save.ts` | `SaveFileV30` 499, dispatch `validateSave`→30 (5282), `validateSaveV30` 8679-8695, `convertV29ToV30` 8697, lossless-only `convertV30ToV29` 8704-8712 (refuses tagged), `migrateToV30` 8714-8717, older downgrade refusals | `LIVE_SAVE_VERSION = 29` (6396); `makeSave` → `validateSaveV29`/`SaveFileV29` (6400-6405) | save-v30 22; outcomes 12; capacity 8 (= 42) |
| `index.ts` | exports `validatePromiseRootsV30`, `promiseDigest`, `attachedPromiseDigest`, `PromiseDraft`/`PromiseAttachment` types (1397-1428), `ProfessionalPromiseV30` (103), `publicPriorityOrder` (1362) | nothing required pre-cutover (`publicPreferredOpportunity` not re-exported; bridge imports `talentMarket.ts` directly) | none |
| `bridge/session.ts` | `importSaveJsonCurrent` compares `LIVE_SAVE_VERSION` but converts via `migrateToV29` (132-136); intent id hashes the cloned payload (1897-1925) | `migrateToV30` switch (coordinated) | shares the 42 |
| `bridge/runtime-checkpoint.ts` | prior registry 59-171 (34 pins), `CurrentEnvelopeSave = SaveFileV29` 439, strict "must be V29" 452, prior chain via `migrateToV29` 840-850, two-slot migration 976-1022 (resets session/revision/journal only) | V30 current type/validation, `584bdd…` → `projection-v46` entry, `migrateToV30` | runtime47 4 (literals 46/29; two slot cases `migratedFromProtocolVersion` null and the spy 0 calls because the fixture's schemaId IS the running SCHEMA_ID, so it loads as *current*, no migration) |
| `campaign-library.ts:5,48,127`, `ui/src/engine/adapter.ts:111-112,3790-3822` | `migrateToV29` consumers | V30 sweep (coordinated) | none in 536 |
| `bridge-schema.ts` | `PROJECTION_VERSION = 46` (222); draft payload closed count-only (1756-1761); own snapshot 2219-2226; history row 2229-2241; preferences 2283-2291; UNKNOWN rows 2251-2261 | family-discriminated P2 draft with required `seatClass`; nullable `seatClass` on own snapshot + history row; `preferredOpportunity` on preferences; 47; generator run | bridge grammar 12; bridge DTO 3; runtime 4 |
| `bridge/contract.ts` | `MarketPromiseDraft` 338-343, nested copy 358-361, quote→attach 443-478, `playerProposalDraft` spreads `payload.promise` 589-597 | tagged wire→core conversion shared with `bridge/promises.ts` | bridge 1 (+9 session cases after grammar) |
| `bridge/promises.ts` | `promiseQuoteSnapshot` builds `predicate: { count }` (111-137); `promiseHistoryFor` count-only (80-104) | class carried into `promiseFeasibility`/`attachPromise`; `seatClass` in history row | bridge 1 direct; DTO |
| `bridge/people.ts:978-990`, `market.ts`, `trust.ts:30-36` | preferences = priorityOrder/term/line; history delegates to `promiseHistoryFor` | `preferredOpportunity`; `seatClass` | bridge 2 (preferences at 29/30), 1 (own legacy `seatClass: null`) |
| `hollywoodPolicy.ts:32-63`, `hollywoodTick.ts:155-162` | six BILLINGS permutations scored by operating margin minus posture cost; initial cast = first three non-busy `role==='actor'` employees | promise-aware seating preference (distinct-beneficiary mask benefit → economic score → BILLINGS fallback); promised-person inclusion in the initial three | none directly; the 9 rival outcome cases need authoring **and** a real eligible seat |
| kernel / replay producers | `searchPromiseCapacity(Traces)` GREEN 41+5; producers execute explicit plans and emit `JointOwnerTrace` + `fixedHolds` + `preparationWork` (2788-2797); first-take route GREEN (534: producer 182,925, kernel ≤200,000) | owner adapter: claim/debit collection, plan enumerator, result→receipt mapping, rival context (see §3) | capacity conflicting-claim case (needs joint reasoning) |
| `tick.ts:1099-1110`, `actions.ts:599,2637` | order appendFirstTakes → advancePromisesWeek → market; cancel/termination hooks | unchanged | none |

## 2. 536 failure grouping by TRUE stop point (83 total, counts verified against the raw result lines)

| Stop reason | Count | Cases |
|---|---:|---|
| **LIVE_SAVE_VERSION 29 / `makeSave`→`validateSaveV29`** | 42 | save-v30: 1 literal (test:185) + 21 at `preservesExactly` test:156 `makeSave(migrated.state)` (9 genuine corpus + 5 count-only CURRENT families + 5 backed OPEN/SAT/BROKEN families + classless terminal shared-take + classless support seat) — lines 128-155 (migration, history, material, import round-trip) PASS first, downgrade 157-160 unreached. outcomes: 12 at `live()` test:79 via `oldBound` 139 (player matrix 6, player support, shooting-entry, player half-open, count2, two beneficiaries, first-take-then-cancel) — no class assertion reached. capacity: 8 at `shortVariants`→`live()` test:211/41 (matrix 6, joint lead+flex+P1, conflicting lead claim) — refusal text `state.promises[n].predicate.kind is not a field of this record`. |
| **Core P2 offer/attach service absent (rules 3, `NOT_OFFERED_IN_B1`, count-only copy at promises.ts:490)** | 12 | capacity 7 at `pureRead` test:201 (revise, withdraw, nonoverlap, class-digests, huge ×3; state/draft immutability passed first); outcomes 2 at test:324 (PLAYER genuine lead/flexible: got version 3, `{count}`, IMPOSSIBLE); policy 2 at `attachCandidate` test:284 (D3 age 29/30; the P1 iteration incl. real two-survivor settlement and binding PASSED, stop on LEAD); bridge 1 at test:266 (`promiseQuoteSnapshot` sends `{count}` → engine refuses P2). |
| **Rival P2 authoring absent (`authorRivalPromise` P1-only) on top of the service** | 10 | outcomes 9 (`rivalWorlds` throws "UNEXECUTED natural rival prerequisites absent by350": rival genuine, rival matrix 6, rival support, rival half-open); policy 1 at test:421 (first read expected FLEX for unproven, got APPEARANCE_COUNT). |
| **Bridge wire grammar (schema 1756 has no `seatClass`)** | 12 | 2 `validateQuote` false (test:147); 1 "P2 missing class" wrongly accepted (test:158); 9 thrown inside helper `quote` test:111 "Command envelope is invalid … matched no allowed type" (class identity, whole-quote refusal, class revision, session/replay, cap16 ×2, both viewers, quote→binding lead/flexible). |
| **Bridge DTO fields** | 3 | own legacy `seatClass: null` (test:387); `preferences.preferredOpportunity` at 29/30 (test:409). |
| **Projection 47 / prior registry / current identity** | 4 | literals (46≠47, 29≠30, registry lacks `584bdd…`); two slot migrations and the reset case load the 46 fixture as *current* (no migration, spy 0). |

The parent's 536 grouping by printed reason is consistent with this; the refinements are: the 7 capacity "3 vs 4" cases and the 2 policy D3 cases have a **second** gate behind them (trailing `live()`/`makeSave(after)` on tagged state), and the 9 rival outcome cases are authoring + seating, not the save writer.

## 3. The capacity-service gap

What a class-aware feasibility/offer service needs from the producers and kernel that is not wired anywhere on HEAD:

1. **Claim collection** from `state.promises` → `PriorClaim[]` (membership = B3 law already in `activePromiseReservations` 274-283: outcome null AND (bound OR attached), half-open overlap; mask from predicate shape; `remaining = count − actual class-qualified distinct takes`, i.e. `qualifyingTakes` (not exported) clipped at 0), `ForeignDebit[]` for other-issuer claims on the person, `target.actualQualifiedCount`. Nothing on HEAD builds these.
2. **Plan enumeration.** `replayReadyProductionPlans`/`replayStartedProductionPlans` execute *explicit* plans (`plans[].commands`: `assignLockedDirector | clearGrandfatheredScenery | scheduleTake | commitRelease`, Ready plans also `readyChoice` director/cast/craft). Header comment: "Never calls tick/actions and never supplies complete choice-domain coverage." The GREEN first-take test hand-writes one plan (test:202-204). An enumerator over existing paths (started pictures = fixed cast; Ready scripts = lawful staffing alternatives; stock door; commission = planner-local) is the "owner adapter work is real scope" of 13/14; absent.
3. **Trace assembly** into `JointTraceCapacityInput` (`traces = attempts[].trace`, `fixedHolds`, `preparationWork`, `coverage`, `horizonEndWeek`, `limits {32,64,1024,200000,220}`) exactly as test:316-321 does; and **result mapping** → `PromiseFeasibilityReceipt`: CERTIFIED→REASONABLY_ACHIEVABLE (null bottleneck); PROVEN_FRAGILE→FRAGILE (reason); PROVEN_IMPOSSIBLE(jointOfferOnly)→IMPOSSIBLE for the *offer only* (never causal BROKEN); UNCERTIFIED→FRAGILE with the exact string `bounded capacity analysis could not certify this schedule`; inputs digest = owner fact refs + claims + target + limits. Absent.
4. **Rival issuer:** producers cut with `rivalPolicyUnsupported`/`unsupportedContext` for rival context → any kernel-backed rival quote is UNCERTIFIED → nonofferable → `authorRivalPromise` (requires ACHIEVABLE) never attaches → P1 market regression. Must stay unwired for rivals.

**Is the GREEN first-take route sufficient for the fresh-offer classification the capacity tests assert?** No. It proves producer+kernel fit one short Ready plan in budget and asserts `UNCERTIFIED/domainIncomplete` by construction (test:323-325). The capacity tests assert (i) baseline `REASONABLY_ACHIEVABLE` for X=1 over a 40-week window on `w.opened` (0 productions, 2 Ready scripts, stock door) and (ii) `FRAGILE` with `bottleneck !== UNKNOWN_CAP` on fixed-cast 2-week windows, `IMPOSSIBLE` for ineligible seats. (i) needs the achievable probe B = X + ceil(X/3) = 2 target events → at least two picture traces over 40 weeks; measured 182,925 units for ONE plan (534) makes two plans exceed 200,000 → UNCERTIFIED workLimit → FRAGILE UNKNOWN_CAP → assertion fails. A 40-week trace also crosses wrap/release of the first picture, which is precisely the post-release branch the **stale route** (RED, Owner-gated 515 §6) has not fit into budget. (ii) is cheaper (one started picture at remainingTicks 5, 2-week horizon) but unmeasured, and PROVEN_* requires `coverage` complete, which only an enumerator can certify. So: the stale route does **not** block a pre-cutover core slice or the 2-week cases; it **does** block certifying any long-window fresh offer through the kernel, together with the per-plan budget.

**Which classifier answers the capacity tests?** The scalar `promiseFeasibility`, made class-aware, satisfies (by paper) 14 of 15: matrix eligible → nMax=1, X=1 > 1−buffer(1)=0 → FRAGILE "no spare picture"; ineligible → mask-restricted event 0 absent → from+5 ≥ due → nMax=0 → IMPOSSIBLE "no filming week…" (a hard bound, not a search miss); joint lead+flex+P1 → three FRAGILE; support without self-exclusion → reserved 1 + X 1 > 1 → IMPOSSIBLE; `w.opened` baseline → nMax 5, existingPath ≥ 2, slack 35 → ACHIEVABLE. It cannot produce the 15th: "a conflicting fixed lead claim makes the joint offer impossible" expects the **support** target IMPOSSIBLE because the *antagonist person's* bound lead-class claim is unsatisfiable inside the same window — same-studio cross-beneficiary class capacity, which `activePromiseReservations` filters out by `beneficiaryPersonId`. That case is the kernel's joint certificate. This is the genuine design gap (see §5).

## 4. Proposed next bounded slice (A1) and runner-up

**A1 — core tagged-P2 offer/attach service in `promises.ts` (evaluator4 scalar: class mask + shared residual capacity), pre-cutover.** The 26 §1 pure steps are done; A1 is 26 §2 rows "types.ts", "promises.ts 184/430/459/490", "promises.ts 288/361/414", "promises.ts 552", and nothing else.

Writable paths: `src/core/promises.ts`; `src/core/types.ts` lines 2231-2234 only (`ProfessionalPromise = ProfessionalPromiseV30`, `GameState = GameStateV30`; type-only, needed so `attachPromise` can mint a tagged root into `state.promises`; V29 aliases/roots retained). Not writable: `save.ts`, `talentMarket.ts`, `bridge/**`, `hollywood*`, `tests/**`, fixtures, `generated/**`, `index.ts` (no new export needed; `CastRoleCountPredicate` and both draft types are already exported).

Controlling requirements: plan "Settled shape" (tagged legal only with P2; kind+class material; classless P2 nonofferable at a new freeze with an honest reason; old digest formula exact), "Feasibility contract" (fixed cast cannot recast; a recorded first take is no NEW event; evaluator4 residual applied to fresh P1 AND tagged P2; IMPOSSIBLE only from an actual bound/refusal; no placeholder matcher; all old roots/receipts untouched), 26 §2 rows above, 23's rule, plan T2 order (core capacity/outcomes before policy/bridge/generator).

Changes (paper):
- `PromiseDraft.predicate` and `PromiseAttachment.predicate`: `{ count: number } | CastRoleCountPredicate`.
- `attachPromise`: copy the **complete** predicate as a detached object (`{kind,count,seatClass}` or `{count}`); a tagged predicate on a non-P2 family throws like the existing attach refusals; nonofferable drafts are still staged (the huge cases expect that); `version: PROMISE_RULES_VERSION`.
- `promiseFeasibility`: mask = P1 → all three, lead → `['lead']`, flexible → `['lead','antagonist']`; classless P2 refused with e.g. `a seat-class promise needs an explicitly selected class; count-only P2 is not offered` (P3–P5 lines unchanged); `seatedPreFirstTake(…, mask)` so a fixed non-mask seat is not event 0; `expectedFirstTakeWeek` takes the mask; buffer test becomes `reserved + X > nMax − promiseBuffer(nMax)` (the plan's named evaluator4 correction, observable for fresh P1); `feasibilityInputs` appends `[kind, seatClass]` **only when tagged** (old P1 inputs tuple byte-preserved; lead vs flexible digests differ as the test asserts).
- `PROMISE_RULES_VERSION = 4` **with** a doc line naming the law ("class-restricted fixed-seat paths + shared residual capacity before the spare-event test; the kernel joint certificate is a later evaluator revision"). Not a literal-only bump: the evaluator changes above are real.
- `settle` update type narrowed to progress/evidenceRefs/outcome/outcomeCause/outcomeEventId (26 row 5).
- Unchanged: `promiseDigest`, `qualifyingTakes`, `advancePromisesWeek`, `breakPromisesOnCancel` (flagged), validation branches, tick order, at-most-one attachment, redigest, no RNG.

Preserved/frozen: `validateSaveV29` branch, `LIVE_SAVE_VERSION 29`/`makeSave`, projection 46/schema hash, all rules-3 receipts and root versions, rival authoring P1-only, bridge conversion count-only. **Safety invariant to state in the handback:** after A1 the only producers of tagged roots are tests; bridge quotes still arrive classless (nonofferable) and rivals still author P1, so no live session can reach a state the V29 writer refuses. `makeSave` on a tagged state fails loudly (never silently).

Acceptance checks (authorized runner as in 536: `node_modules/.bin/vitest run --project core <files>`; `npm run typecheck`; `npm run typecheck:bridge`; `npm run check:bridge-contract` to prove the schema hash did not move):
- RED→GREEN: `p14b4-cast-class-capacity` "class changes material and feasibility digests; unrelated cash and valid RNG words change neither read nor history" (1 case; its `live()` calls are on untagged `w.opened`).
- Reached-then-stopped at the **new** named gate only (any other stop = defect): capacity revise/withdraw/nonoverlap/huge×3 → trailing `live()` `validateSaveV29 … predicate.kind`; outcomes PLAYER lead/flexible → `live()` test:329 `expected 29 to be 30` after line 324 passes; policy D3 29/30 → `settlePair` `makeSave(after)` test:274 on the LEAD iteration after the full P1 iteration passes.
- Unchanged: capacity 8 (same message), kernel 41, hold-order 5, sort 7, material 17, D3 8, policy 4 PASS, bridge 12 PASS / 16 FAIL same messages, save-v30 14/22, runtime47 2/4; regression controls `p14b1-promises`, `bridge-p14b1-promises`, `bridge-p14b3-promise-command`, the B-F2 acting file, the twelve historical save files (25's set) — exact list is the parent's. The residual-buffer change may alter fresh P1 evaluations in natural chains (plan: "some new P1 offers may become nonofferable"); any such movement needs independent reconciliation, never assertion loosening.

Honest yield: 1 case fully GREEN, ~11 advanced to the Save30 gate, plus D3/attach behaviour verified through the real chooser. Larger yields are all behind the coordinated boundary.

**Runner-up B — the coordinated live30/47 boundary** (26 §2 `save.ts`/`index.ts` rows, §3 load/runtime, §4 wire/generator): `LIVE_SAVE_VERSION 30`, `makeSave`→`validateSaveV30`, consumer sweep to `migrateToV30`, `CurrentEnvelopeSave = SaveFileV30`, `584bdd…`→`projection-v46` registry entry, family-discriminated P2 draft + nullable `seatClass` + `preferredOpportunity` on the wire, `PROJECTION_VERSION 47`, shared tagged conversion in `contract.ts`/`promises.ts`, generator run (three generated artifacts). Contingent on A1 (otherwise the wire advertises a class the engine refuses, which 26 §3 forbids) and on independent review; by paper it would turn GREEN save-v30 22, runtime47 4, bridge 12+3 (+9 session cases if the `current-p1` fixture classifies ACHIEVABLE at week 45 — unverified), outcomes player 12+2, capacity 6+7 (matrix and joint), leaving only the conflicting-claim capacity case, the 10 rival cases and final seating. It is the cutover, not a pre-cutover slice. The replay reductions C1/C5–C7 (515 §3) remain the parallel track and are not RED-backed for capacity/outcomes.

## 5. Non-proposals and Owner-gated items

- No `LIVE_SAVE_VERSION`/`makeSave` 30 alone (26 §3: not under unchanged 46; the schema hash is the checkpoint routing discriminator). No `PROJECTION_VERSION 47` or any schema field alone (moves `SCHEMA_ID` without the class contract; F10/F11 pins). No `584bdd…` registry entry while 46 is live (would put the running identity in the prior map). No rules-4 literal without the evaluator change (23). 
- No rival P2 authoring (`authorRivalPromise`) before Save30 is live: it would create tagged roots in natural chains that the live writer refuses (unsaveable sessions).
- No bridge tagged conversion before the schema carries `seatClass`.
- No kernel wiring as the live classifier now: incomplete domain → UNCERTIFIED for ordinary offers → every offer nonofferable and rival P1 authoring collapses (plan: "not a way to close ordinary launch behavior with every offer disabled"); budget as measured cannot afford the achievable probe.
- No synthetic receipts/bindings; no loosening of `rulesVersion 4`/`version 4`/`live()` assertions; no test edits by the writer.
- `breakPromisesOnCancel` coupling and hollywoodPolicy/hollywoodTick seating need their own independent RED before any writer (26 §2; no installed test reaches either).
- Stale replay route stays the recorded RED under 515 §6 (Owner/Current Ops options a/b/c); it does not block A1.

**Design gap for Fable (narrow):** the plan defines evaluator4 as residual capacity + joint kernel certificate + UNCERTIFIED semantics; the installed RED asserts `rulesVersion 4` on scalar reads. Alternatives: (a) A1 stamps 4 for the scalar class+residual law now and records that the kernel joint certificate will be a later evaluator revision (5); (b) hold 4 for the kernel-backed service, accepting that no capacity/outcome assertion is reachable before the cutover and that the conflicting-claim case waits for an enumerator plus budget work whose feasibility is itself unproven. Recommendation: (a). Second finding for the record: the measured per-plan replay cost (182,925/200,000 for one Ready plan) means the kernel route cannot certify ordinary fresh offers under the current cap; that is the plan's own "performance/design finding", not a reason to weaken caps or tests.

## 6. Evidence limits

Read-only; nothing executed by me. All GREEN/RED effects of A1/B are paper predictions from the test bodies and source, not results. The 536 raw file (8.3 MB) was read via its result/reason/frame lines; policy-test frames were not printed in the raw for the D3 cases, so their stop lines (284, 421) are attributed from the printed reason plus the test body. The D3 fixture's ACHIEVABLE classification for LEAD/FLEX under A1 and the bridge `current-p1` fixture's P2 offerability are unverified (they depend on pipeline state at weeks 208/45; the same fixtures classify P1 ACHIEVABLE today and class does not change unseated paths, so likely but not shown). Kernel budget statements for 2-week windows are unmeasured. No native/Unity, usability or Owner-acceptance claim.
```

### 5.2 — 537-B (test-author, READ-ONLY RED-reachability classification)

```text
# 537-B — READ-ONLY RED-reachability classification of run 536 (83 failing cases)

**Status: DONE.** No worktree file was created or edited; no vitest/tsc/npm, no Git write, no network. Model observed: Fable 5.1 (`claude-fable-5-1`) per the harness banner.

**Run identity (from `536-b4-owner-integration-state.json` / `.txt`):** sourceSha `69d16f88c360cbb96c3e9bb9b33d1ee21ff2349b` at start and end, testedDiffSha256 `e3b0c442…` (empty patch, 0 bytes), untrackedSource `[]`, fixedSource `true`, node v20.20.2, vitest 2.1.9, 2026-09-20T16:43:47.206Z → 16:46:10.009Z, exit 1. Totals line 266420-266421: `Test Files 6 failed | 5 passed (11)`, `Tests 83 failed | 110 passed (193)`. Per-file: bridge-cast-class 16/28, capacity 15/15, policy 3/7, runtime47 4/6, outcomes 23/23, save-v30 22/36 — sums to 83. Stack attribution follows vitest's stacked-header convention: each `[n/83]` block's FAIL headers share the single Error/stack that follows.

## 1. Classification table (grouped by identical stop point; 10 groups, 83 rows)

Legend: RA = REACHED ASSERTION, PR = PREREQUISITE REFUSAL, BG = BRIDGE GRAMMAR, FG = FIXTURE/HELPER GUARD. No MISSING EXPORT/MODULE failures occurred in this run (all imports resolved; `migrateToV30`, `validateSaveV30`, `convertV30ToV29`, `publicPreferredOpportunity` exist at HEAD).

### G1 — BG: closed draft grammar refuses `seatClass` as an unknown key (11 cases, `tests/bridge-p14b4-cast-class.test.ts`)
Refusing source: `bridge/schema/bridge-schema.ts:1755-1760` `StudioMarketProposalPromiseDraftPayload` = closed object `{family,count,windowStartWeek,dueWeekExclusive}` (`additionalProperties:false`, enforced `bridge/schema/runtime.ts:159`). Raw line 269 message segment confirmed: `$.draft.promise.seatClass: additional properties are not allowed`.

| Case (short) | `→` reason | Stop |
|---|---|---|
| accepts explicit **lead** P2 through validateQuote | expected false to be true | `:147:23` `expect(parsed.ok).toBe(true)` |
| accepts explicit **leadOrAntagonist** P2 | same | `:147:23` |
| class changes opaque intent identity | `Command envelope is invalid: $: matched no allowed type (…)` thrown by test helper | helper `quote` `:111:25` ← `:182:18` |
| whole-quote refusal registers no intent | same | `:111` ← `:219:22` |
| class revision replaces attachment | same | `:111` ← `:234:19` |
| session/revision/replay protections | same | `:111` ← `:283:15` |
| exact cap16 after 16 | same (first iteration) | `:111` ← `:306:24` |
| exact cap16 after 17 | same | `:111` ← `:306:24` |
| both viewing directions retain UNKNOWN | same | `:111` ← `:357:15` |
| actual **lead** quote→binding→termination | same | `:111` ← `:421:15` |
| actual **leadOrAntagonist** quote→binding→termination | same | `:111` ← `:421:15` |

Nothing after the helper throw executed: no `session.quote`, intent id, commit, settlement, history, pulse, save/load assertions were reached. For all 11, `base()` (fixture pins, `validateSaveV29`, `migrateToV30` equality, real withdrawals, `validateSaveV30` at `:95`) passed.

### G2 — BG (inverse): current grammar admits a classless P2 wire (1 case, same file)
| refuses 'P2 missing class' | `expected { ok: true, quote: {…} } to match object { ok: false, reasonCode: 'INVALID_COMMAND', … }` | `:158:33` |
The validator ran and accepted `{family:LEAD_OR_SIGNIFICANT_ROLE_COUNT,count,window…}` with no class. That is today's grammar; the future closed union must refuse it (plan `P14B4-HEADLESS-PLAN.md:208-211`).

### G3 — PR: rules-3 evaluator refuses every P2 draft; attach/conversion drop the class (5 cases)
Refusing source: `src/core/promises.ts:206-211` `NOT_OFFERED_IN_B1.LEAD_OR_SIGNIFICANT_ROLE_COUNT = 'a seat-class promise is not offered in this slice'`, applied at `:372-373` → IMPOSSIBLE; `bridge/promises.ts:118` and `bridge/contract.ts:466-471` convert wire→core with `predicate: { count }` only; `src/core/promises.ts:490` `predicate: { count: draft.predicate.count }`, `:492` `version: PROMISE_RULES_VERSION` (= 3, `:42`); receipt `rulesVersion` stamped 3 at `:217`.

| File / case | `→` reason | Stop |
|---|---|---|
| bridge / direct apply revalidates real CURRENT employment | expected 'IMPOSSIBLE' to be 'REASONABLY_ACHIEVABLE' | `:266:48` (precondition on `conversion.promise.classification`; the release-then-apply behaviour under test at `:270-276` unreached) |
| outcomes / PLAYER: actual offered **lead** P2 settles… | toMatchObject diff: received `version: 3`, `predicate: {count:1}` (no kind/seatClass), receipt `rulesVersion: 3`, `classification: 'IMPOSSIBLE'` | `realPlayerPromise` `:324:34` ← `:336:19` |
| outcomes / PLAYER: … **leadOrAntagonist** | same | `:324:34` ← `:336:19` |
| policy / age 29: mismatch changes only D3 | `expected { count: 1 } to deeply equal { kind:'castRoleCount', count:1, seatClass:'lead' }` | `attachCandidate` `:284:26` ← `:310:24` |
| policy / age 30: same | same | `:284:26` ← `:310:24` |

Note for the two policy cases: the loop at `:309` is `[P1, LEAD, FLEX]`; the **P1 iteration completed and passed** (baseline two-survivor settlement `:306-308`, incumbent P1 attach, second settlement, D3 assertions `:312-323` including `assertWonBinding` at age 30 and player-wins-without-opportunity at age 29). The stop is the first tagged candidate. That P1 D3 evidence is real reached coverage inside a failing case; do not count it green, but it is not vacuous.

### G4 — PR: strict live V29 writer refuses `predicate.kind` (8 cases, `tests/p14b4-cast-class-capacity.test.ts`)
Refusing source: `src/core/save.ts:6401` `makeSave` → `validateSaveV29` `:8611` `validatePromiseRoots` → `src/core/promises.ts:809` → `validatePromiseRootsForVersion(…,29)` `:928` `exact(predicate,['count'])` → `fail` `:820` (`:834` is the `exact` closure).

| Case | `→` reason | Stop |
|---|---|---|
| lead target fixed in **lead** (eligible=true) | `validateSaveV29: state.promises[0].predicate.kind is not a field of this record` | `live` `:41:10` ← `shortVariants` `:211:17` ← `:241:19` |
| lead / **antagonist** (false) | `…promises[1]…` | same ← `:241:19` |
| lead / **support** (false) | `…promises[2]…` | same |
| leadOrAntagonist / **lead** (true) | `…promises[0]…` | same |
| leadOrAntagonist / **antagonist** (true) | `…promises[1]…` | same |
| leadOrAntagonist / **support** (false) | `…promises[2]…` | same |
| one real picture jointly serves lead+flexible+P1 | `…promises[0]…` | `:41` ← `:211` ← `:256:19` |
| conflicting fixed lead claim makes joint offer impossible | `…promises[0]…` | `:41` ← `:211` ← `:281:19` |

The shared `world()` constructor (six real hires, managed development, two Ready scripts, set build, three P1 settlements, greenlight, recipe, shooting-5, scenery, scheduled take) completed and was admitted by the strict V29 writer twice (`:144`, `:185`). No class-aware classification, `advancePromisesWeek` or tick assertion reached. Matches record 23.

### G5 — PR: `rulesVersion` 3 vs 4 at the pure-read helper (7 cases, same file)
Refusing source: `PROMISE_RULES_VERSION = 3` `src/core/promises.ts:42`, stamped `:217`. Stop `pureRead` `:201:31` `expect(result.rulesVersion).toBe(4)` after the state/draft immutability checks `:199-200` **passed**.

| Case | `→` | Stop |
|---|---|---|
| **revise** removes a real CURRENT reservation | expected 3 to be 4 | `:201` ← `:293:22` |
| **withdraw** removes … | same | `:201` ← `:293:22` |
| lawful CURRENT nonoverlapping attachment | same | `:201` ← `:313:22` |
| class changes material and feasibility digests | same | `:201` ← `:327:12` |
| huge count=**1** preserves history | same | `:201` ← `:356:18` |
| huge count=**65** | same | `:356:18` |
| huge count=**9007199254740991** | same | `:356:18` |

Unreached: classification/bottleneck, reservation neutrality, `promiseDigest`/`attachedPromiseDigest`/proposal digest inequality (`:333-336`), cash/RNG neutrality, `advancePromisesWeek` idempotence. For the three "huge" cases `attachPromise` + `live()` at `:351` **passed** (root is count-only because attach drops the class), so the reached stop is the rules literal, not the writer.

### G6 — PR: `LIVE_SAVE_VERSION` 29 / `makeSave` stamps 29 (34 cases)
Refusing source: `src/core/save.ts:6396` `LIVE_SAVE_VERSION = 29`, `:6400-6404` `makeSave` → `validateSaveV29({saveVersion:29,…})`.

`tests/p14b4-cast-class-outcomes.test.ts` (12) — stop `live` `:79:33` `expect(validated.saveVersion).toBe(30)` inside `oldBound` `:139:30` ← `playerAtFive` `:196:17`; `→ expected 29 to be 30`. Before `:139` the genuine bound-open pins, provenance, `validateSaveV29`, export round-trip, focus receipt and `binding()` `:138` passed.

| Case | trailing frame |
|---|---|
| player lead/**lead** qualification=true | `atFive :236:32` ← `:364:30` |
| player lead/**antagonist** false | same |
| player lead/**support** false | same |
| player leadOrAntagonist/**lead** true | same |
| player leadOrAntagonist/**antagonist** true | same |
| player leadOrAntagonist/**support** false | same |
| player support qualifies for P1 and legacy P2 | `:236:32` ← `:374:32` |
| shooting entry/technology lock, unscheduled tick | `:196` ← `:384:30` |
| player half-open window | `:236:32` ← `:395:18` |
| count2 requires TWO real distinct productions | `:196` ← `:417:29` |
| two bound beneficiaries share one take, DISTINCT receipts | `:196` ← `:434:28` |
| first take THEN real player cancellation | `:196` ← `:467:30` |

`tests/p14b4-save-v30-compatibility.test.ts` (22):
| Case | `→` | Stop |
|---|---|---|
| pins LIVE_SAVE_VERSION to literal30 | expected 29 to be 30 | `:185:31` |
| migrates genuine **empty / current-p1 / replaced-p1 / withdrawn-p1 / bound-open-p1 / kept-and-broken-p1 / rival-current-p1 / rival-shared-take-terminal-p1 / refused-p2-count-only-current-draft** (9) | `expected { saveVersion: 29, …(3) } to deeply equal { broadcastCache: [], … saveVersion: 30 …}` | `preservesExactly` `:156:36` `expect(makeSave(migrated.state)).toEqual(migrated)` ← `:192:5` |
| keeps count-only CURRENT **APPEARANCE_COUNT / LEAD_OR_SIGNIFICANT_ROLE_COUNT / DIRECTING_COUNT / PREFERRED_GENRE_OPPORTUNITY / SPECIFIC_PROJECT** with version pairs (5) | same | `:156` ← `:216:24` — first pair `[1,1]` only; pairs `[2,3],[3,2],[4,4],[7,11],[MAX,MAX]` and `:217-219` unreached |
| keeps genuinely backed OPEN/SATISFIED/BROKEN count-only **×5 families** (5) | same | `:156` ← `:239:7` — first item `bound-open-p1` only; `kept-and-broken` SATISFIED/BROKEN and `:240-241` unreached |
| classless P2 terminal variants, shared take, DISTINCT receipts | same | `:156` ← `:261:5`; `:262` unreached |
| classless P2 SATISFIED by ACTUAL support seat | same | `:156` ← `:278:22`; `:279-283` unreached |

For all 21 `preservesExactly` cases, lines `:128-155` **passed**: `migrateToV30` exact `{…admitted, saveVersion:30}`, `validateSaveV30` identity, byte-equal promises/firstTakes/talentMarket, independent legacy material formula `fnv1a64([family,count,start,due])` equal to `promiseDigest`, `attachedPromiseDigest`/`proposalDigest` formulas, `loadSave`/`importSave(exportSave)` round-trips. Unreached: `:157-160` (`convertV30ToV29` lossless byte identity) and `:195` (`convertV29ToV28` refusal). Consistent with record 29's "assertion156" note.

### G7 — PR: projection 46 / running SCHEMA_ID is the outgoing46 hash (4 cases, `tests/bridge-p14b4-runtime47-compatibility.test.ts`)
Source: `bridge/schema/bridge-schema.ts:222` `PROJECTION_VERSION = 46`; `bridge/protocol.ts:35` `SCHEMA_ID = schemaIdentity(BRIDGE_SCHEMA)`; `generated/unity/project-studio-bridge.contract-manifest.json:8` `schemaId: sha256:584bdd85…` = the test's `OUTGOING_46`; registry `bridge/runtime-checkpoint.ts:59-172` has 34 entries and does **not** contain `584bdd…`, so `loadBridgeRuntimeCheckpoint` `:1268-1277` routes the genuine46 checkpoint to the current decode path (`migratedFromProtocolVersion: null`, no `createSessionId` call).

| Case | `→` | Stop |
|---|---|---|
| requires literal projection47/Save30 and exact 35 prior IDs | expected 46 to be 47 | `:164:32`; `:165-169` unreached |
| migrates **currentSaveJson** from its OWN genuine V29 state | expected null to be 4 | `:191:48`; `:186-189` passed (`validateSaveV29`, `migrateToV30` → 30) |
| migrates **savedSaveJson** | same | `:191:48` |
| resets ONLY prior runtime authority, reopens current47 | `expected "spy" to be called 1 times, but got 0 times` | `:210:27` |

Source assertion: set-diff of the registry (31 literals + `PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID` `0285e9…`, `ACCEPTED_P12_SCHEMA_ID` `8b2569…`, `R05_NATIVE_FOUNDING_SCHEMA_ID` `c6ab1b…` at `:37-43`) against the test's `EXPECTED_PRIOR_IDS` (`:39-75`) = exactly one missing entry, `sha256:584bdd85…`. The other 34 match.

### G8 — RA: projection46 read shapes lack the class/preference fields (3 cases, `tests/bridge-p14b4-cast-class.test.ts`)
Source: `bridge-schema.ts:2219-2225` `StudioMarketPromiseSnapshot` has no `seatClass`; `:2229-2240` `StudioMarketPromiseHistoryRow` has none (`bridge/promises.ts:88-104` emits none); `:2283-2291` `StudioMarketPreferencesSnapshot` has `priorityOrder/preferredTermWeeks/line` only, and `bridge/people.ts:977-990` builds exactly those although the core reader `publicPreferredOpportunity` exists at `src/core/talentMarket.ts:722-724`.

| Case | `→` | Stop |
|---|---|---|
| own legacy classless P2 shows null/unknown, never a fabricated lead | toMatchObject diff: expected key `seatClass: null` absent from received own promise (family etc. present) | `:387:17`; fixture pins/V29/V30 `:46-66` passed; `history(bound…)` `:389` and the reader-admitted variant `:392-396` unreached |
| shared preferences expose the age-edge **at29** | diff: `preferredOpportunity` absent; `priorityOrder` present and equal to the unproven order | `:409:31`; `validateSaveV30` `:404` passed; `:412-415` unreached |
| … **at30** | same shape (stacked under one error) | `:409:31` |

These are reached assertions against a feature the projection does not emit yet, not a refusal.

### G9 — RA: natural rival authoring order (1 case, `tests/p14b4-cast-class-policy.test.ts`)
Source: `src/core/talentMarket.ts:1258-1276` `authorRivalPromise` evaluates exactly one `APPEARANCE_COUNT`/count 1 candidate.

| observes flexible-first, actual P1 fallback, proven P1, zero-attachment refusal | `expected { family: 'APPEARANCE_COUNT', …} to deeply equal { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: {kind:'castRoleCount', count:1, seatClass:'leadOrAntagonist'}, … }` for unproven `person-studio-aca408ec-r01-5`, issuer `studio-aca408ec-r01`, week 208 | `:421:32` (first submission's first read draft). Spies captured the real service call; `:410-420` passed. Attachment/case/binding checks and the four-witness completion unreached. 55 s. |

### G10 — FG: `rivalWorlds()` guard throws after 350 natural ticks (9 cases, outcomes)
Helper `:204-234` requires BOTH a bound OPEN rival root in each of three cast slots at shooting-5 AND a `genuine` rival root with `predicate.kind === 'castRoleCount'`. Today no rival root can be tagged (G3 attach copies count only; G9 authors P1 only), so `genuine` is unsatisfiable and the guard always throws. `→ UNEXECUTED natural rival prerequisites absent by350: actual bound OPEN roots in each cast slot AND genuine tagged eligible take required; no synthetic substitute`, thrown `:233:9`.

| Case | trailing frame |
|---|---|
| RIVAL: genuinely naturally authored tagged commitment binds and qualifies | `:346:22` |
| rival lead/lead, lead/antagonist, lead/support, leadOrAntagonist/lead, leadOrAntagonist/antagonist, leadOrAntagonist/support (6) | `atFive :236:53` ← `:364:30` |
| rival support qualifies for P1 and legacy P2 | `:236:53` ← `:374:32` |
| rival half-open window | `:236:53` ← `:395:18` |

Each costs ~9-11 s (350 ticks). Test-side observation: the 8 rival-variant cases only need `slots[slot]`, which natural P1 rival roots may already satisfy; the helper couples them to `genuine`. That is a test-design coupling for the parent to weigh, not a production defect, and not something I changed.

Sum check: 11+1+5+8+7+34+4+3+1+9 = 83.

## 2. Minimal production change per group (name only; nothing loosened)

| Group | Minimal change | Pure or cutover |
|---|---|---|
| G1, G2 | `bridge-schema.ts:1755-1760` → family-discriminated closed union (P2 requires `seatClass` enum lead/leadOrAntagonist; other families accept no class; P3-P5 members stay engine-refused); `bridge/contract.ts:338-343,589-598` and `bridge/promises.ts:43-50,111-118` carry the tagged predicate | **Cutover** (26 §4): changes `BRIDGE_SCHEMA` → moves `SCHEMA_ID` → projection 47 + generator. Grammar alone moves G1's nine session cases only as far as `quote.ok`/`response.accepted`; they also need G3 to be offerable. |
| G3 | `promises.ts:184-197` `PromiseDraft.predicate` union, `:459-463` `PromiseAttachment` union, `:490` copy the complete predicate, `:492` and `:217` stamp 4 only from the class-aware evaluator, `:206-211` drop the P2 `NOT_OFFERED` refusal only together with the reviewed class-capacity owner (plan 100-130) | **Cutover** (26 §2 rows `promises.ts:184,430,459` / `:288,361,414`). Not a literal bump. |
| G4, G6 | `save.ts:6396-6404` `LIVE_SAVE_VERSION`/`makeSave` → 30/`SaveFileV30`/`validateSaveV30`, with `types.ts:2233-2234` aliases → V30 | **Cutover** (26 §2 `save.ts`, `types.ts` rows). After it, the 21 `preservesExactly` cases proceed to `:157-160` (already-implemented `convertV30ToV29`), the 12 player outcome cases proceed to `variant()`→`complete()` where `promiseCastSlots` `:543-548` is already shape-aware; the 8 G4 capacity cases then stop at G5. |
| G5 | `PROMISE_RULES_VERSION` 4 stamped by the class-aware evaluator | **Cutover**; record 23 and 26 §1 forbid a literal-only bump. |
| G7 | register `sha256:584bdd85…` → `'projection-v46'` at `runtime-checkpoint.ts:59`; `PROJECTION_VERSION` 47 at `bridge-schema.ts:222`; `runtime-checkpoint.ts:439-461,839-850` and `bridge/session.ts:132-136` → `migrateToV30` | **Cutover** (26 §3). A registry-only edit today would register the *running* identity and violate the `:167` current-ID exclusion; it must land with the schema bump. |
| G8 | nullable `seatClass` on `StudioMarketPromiseSnapshot` `:2219` and `StudioMarketPromiseHistoryRow` `:2229`; `preferredOpportunity` on `StudioMarketPreferencesSnapshot` `:2283` fed from `talentMarket.ts:722` via `people.ts:977-990`, `bridge/promises.ts:88-104`, `talentMarket.ts:458,535` | **Cutover** (schema shape → `SCHEMA_ID`). The core reader is already pure and present. |
| G9 | `talentMarket.ts:1258-1276` unproven → FLEX P2/count1 then P1; proven → P1 (plan 148-151) | **Mostly pure** in the policy function, but the FLEX draft must be representable (G3 union) and reads IMPOSSIBLE under `NOT_OFFERED` until G3, so only the call-order assertion can go green alone; the `flexibleP2` witness needs the cutover. |
| G10 | none by itself; needs G3+G9 and a natural rival film reaching shooting-5 with a tagged bound root in window within 350 ticks | Depends on cutover + natural occurrence (26 §2 "partial evidence, not B4 closeout"). |

Net: no failing case stops at a pure boundary listed in 26 §1 (material digest / qualifying-take helper); 26 §1 already states those logs are not directly reached RED for the isolated helpers, and this run agrees.

## 3. Expectations checked against current accepted requirements

Traced against plan `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` (sha256 `382252e2…` matches the plan pin in every test header), record 17, record 26. **No failing case's expectation contradicts them.** Specifically:
- Record 17 mode correction: outcomes `playerPayload`/`playerToFive` direct-stock greenlight on the bound-open fixture (legacy development, managed operations) is lawful; not a fixture defect. Nothing to change.
- D3 (policy `:319`, outcomes matrix `:360-362`) matches plan 141-143, live matcher `talentMarket.ts:722-739`, and the passing d3 table (`tests/p14b4-d3-matching.test.ts:55-62`).
- Rival order (policy `:414`) matches plan 148-151.
- `seatClass: null` on own snapshot/history (bridge `:326-331,:387`) matches plan 213-214; 26 §4 calls nullable `seatClass` the minimal representation and its spelling a routine contract detail. Supported, spelling not Owner-fixed.
- `preferredOpportunity` literals `significantCastRole`/`anyCastAppearance` match `talentMarket.ts:722` and plan 138-140.
- Capacity FRAGILE-with-certified-bottleneck / `UNKNOWN_CAP` string / joint lead+flexible+P1 / cast masks match plan 104,110,124-126,256,289.
- rules 4, root version 4, Save30, projection 47, 35 prior IDs match plan 53-59 and 26 §2-3.

**Premise-only (labeled UNEXECUTED fixture premises in the tests; not wrong, not yet demonstrable without the solver):** outcomes `:324-325` REASONABLY_ACHIEVABLE for a tagged P2 in `realPlayerPromise`; capacity `:294` baseline REASONABLY_ACHIEVABLE in `opened`; capacity `:246-247` FRAGILE with a certified bottleneck for fixed-cast X=1; bridge cap16 `:307` all 16/17 windows offerable.

**Test-design notes (not requirement mismatches, not fixed):** G10's `rivalWorlds()` couples slot-only cases to `genuine`. Save-v30 `:346` and `:357` use broad regexes (`/predicate|family|castRoleCount|seat.class/i`, `/predicate|kind|class|field/i`); today's throws are the intended ones (`promises.ts:916-922,928`) but an unrelated predicate fault would also satisfy them.

## 4. Passing cases: genuine current-law vs vacuous

**save-v30 (14 pass) — all genuine, all additive-reader coverage, none live-writer coverage:**
- 4 `refuses %s in old29` (class-only, tag-and-class, zero-root-version, zero-receipt-version): genuine frozen-V29 strictness (`promises.ts:928,:911,:950`); `migrateToV30` validates V29 first (`save.ts:8698,8716`).
- 2 `accepts explicit %s P2 shape at30, never at29, refuses downgrade`: genuine additive reader/converter law (`promises.ts:914-924`; `save.ts:8704-8710` refusal; export/import dispatch 30).
- 4 `rejects tagged castRoleCount under inapplicable family`: genuine (`:918-919`), loose regex.
- 4 `rejects malformed tagged P2` (missing-kind, missing-class, support-class, extra-key): genuine (`:928`, `:916`, `:921-922`, `:916`), loose regex.

**bridge cast-class (12 pass):**
- 11 `refuses 'bad class null' / '"support"' / '"leadOrSupport"' / 1 / ["lead"] / 'extra wire kind' / 'extra nested predicate' / 'class inapplicable to APPEARANCE_COUNT | DIRECTING_COUNT | PREFERRED_GENRE_OPPORTUNITY | SPECIFIC_PROJECT'`: **vacuous with respect to the B4 grammar.** Every one is refused today for one reason: `seatClass`/`kind`/`predicate` is an unknown key on the closed four-key draft (`bridge-schema.ts:1755-1760`). None exercises a class enum, a family-discriminated union or a nested-predicate rule. Under the 47 grammar they must stay refused, so they are a useful regression net, but today they prove only the pre-existing closed-object law. Their side assertions (`INVALID_COMMAND`, wire unchanged, session truth unchanged) are genuine current law.
- 1 `keeps no-promise and count-only non-P2 wire shapes legal; P3-P5 remain engine-refused separately`: genuine current law and a required invariant of the 47 grammar (26 §4).

**policy (4 pass) — all genuine:**
- 2 `uses the existing age edge at 29/30 without inventing a career credit`: `publicPreferredOpportunity`/`publicPriorityOrder`/`publicPreferredTerm` (`talentMarket.ts:712-724`) over the shared `isProven` archetype (`:680-683`).
- 1 `a real under-30 release credit supplies the proven branch`: real founding, greenlight, release, `careerIdentity` credit.
- 1 `irrelevant cash does not change the public preference`: pure read.
These cover the public reader (plan 133-140), not D3 in settlement; the settlement D3 evidence for the P1 candidate sits inside the two failing age cases (see G3 note).

(For contrast, runtime47's 2 passes are genuine: fixture integrity + both slots through `validateSaveV29`; unknown outer identity refused at `runtime-checkpoint.ts:1054`.)

## Sources read (READ-ONLY, HEAD 69d16f8)
Run: `evidence/p14b4-20260919/536-b4-owner-integration-state.{txt,json,patch}` — lines 1-260 (per-case markers/reasons), the Failed Tests section via a grep map of FAIL/Error/stack/`[n/83]` lines (raw 210-266426), diff blocks at raw 269, 307-321, 363-416, 432-481, 669-703, 927-1000, 1002-1040, totals 266420-266421. Tests: all six failing files in full; `tests/p14b4-d3-matching.test.ts:53-68`. Source: `src/core/save.ts:490-500,5281,6390-6415,8595-8625,8675-8740`; `src/core/promises.ts:42,140-220,280-300,355-560,800-950`; `src/core/talentMarket.ts:403-447,675-775,1230-1300`; `src/core/types.ts:2179-2234`; `bridge/schema/bridge-schema.ts:219-222,1740-1800,2210-2300,3046-3411`; `bridge/schema/runtime.ts:159`; `bridge/protocol.ts:1-40,80-140`; `bridge/runtime-checkpoint.ts:36-43,55-172,1240-1290`; `bridge/contract.ts:330-365,430-485,580-600`; `bridge/promises.ts:35-140`; `bridge/people.ts:970-1010`; `bridge/session.ts:125-140`; `generated/unity/project-studio-bridge.contract-manifest.json:8`. Records: 17, 23, 26, 29, 30, 31 in full; plan `P14B4-HEADLESS-PLAN.md:45-60,100-160,190-215,250-260,285-305`.

## Evidence limits
- Nothing executed; classifications come from the recorded 536 output plus source at HEAD. Pass counts per file are by elimination from the file headers (vitest prints ✓ lines selectively).
- Long `Command envelope is invalid` messages were read only for the first occurrence (raw 269); the other ten share the same helper site and the run's `→` prefix, so the same refusal is inferred, not individually re-read.
- I did not re-derive fixture hashes, decompress any fixture, or verify whether the slot-only rival prerequisite in G10 is satisfiable within 350 ticks (needs execution).
- "Unreached" claims are by control flow from the recorded stop line; nothing after a stop was inferred to pass.

## Next concrete action (for the parent's choice)
No RED here stops at a pure 26 §1 boundary. The single change that moves the most cases to their real assertions is the coordinated core cutover (G3+G4+G5+G6: `types.ts` aliases, full-predicate attach with class-aware evaluator stamping rules 4, `makeSave`/`LIVE_SAVE_VERSION` 30) — 54 cases — with the bridge 47 boundary (G1, G2, G7, G8: 19 cases) following in the same or next slice, G9 (1) either before or with it, and G10 (9) remaining a natural-occurrence premise. If a smaller RED-backed step is wanted first, G9's rival candidate order is the only production change whose first assertion can turn without a version/schema literal, and it should be recorded as partial (call order only) until G3 lands.
```

### 5.3 — 537-C (contract-auditor, READ-ONLY review of 537-A/537-B)

```text
# 537-C — independent READ-ONLY review of 537-A (A1 proposal) and 537-B (RED classification)

**Status: DONE (read-only).** No file created or edited in the worktree; no vitest/tsc/npm, no Git, no network, no delegation. Every GREEN/RED statement about a future change below is paper analysis from test bodies and source, not an executed result.

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); I cannot verify beyond the system prompt. The lean-ctx MCP tools named in the user CLAUDE.md were not available; Read/Glob/Grep only.

**Worktree/HEAD:** `/Users/zacheryspector/The-Movies-headless-program`, git status snapshot clean at `7680d60` (record 536 only). All line numbers below are from the files as read now.

## Sources read (line ranges)

Plan `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` 1-365 (whole). Records in `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`: `23-…` (whole), `26-…` (whole), `17-…` (whole), `29-…` (whole), `515-…` 1-143 (§1-§6) plus the verbatim handbacks, `535-…` (whole), `536-…md` (whole). Scratchpad `537-A-report.md`, `537-B-report.md` (whole).
Source: `src/core/promises.ts` 1-1049 (whole); `src/core/types.ts` 2128-2252; `src/core/save.ts` 490-504, 6385-6413, 8595-8717 plus grep of `makeSave`/`validateSave*`/`migrateToV29|30`/`convertV29ToV30|V30ToV29`; `src/core/talentMarket.ts` 440-559, 700-819, 1030-1119, 1220-1289; `src/core/promiseCapacityKernel.ts` 1-115 plus grep of result classes; `src/core/index.ts` 1395-1428; `src/core/tuning.ts:59`; `bridge/promises.ts` 1-143 (whole); `bridge/contract.ts` 330-599; `bridge/runtime-checkpoint.ts` 432-466; `bridge/schema/bridge-schema.ts` 1750-1763. Greps across `src`, `bridge`, `ui/src`: callers of `attachPromise(`/`promiseFeasibility(`/`reclassifyPromise(`/`PROMISE_RULES_VERSION`; `GameStateV29|SaveFileV29|ProfessionalPromiseV29`; importers of `promiseCapacityKernel|promiseCapacityOwnerReplay`.
Tests: `tests/p14b4-cast-class-capacity.test.ts` 1-367 (whole); `tests/p14b4-cast-class-outcomes.test.ts` 1-487 (whole); `tests/p14b4-cast-class-policy.test.ts` 255-532; `tests/p14b4-material-evidence-core.test.ts` 1-397 (whole); `tests/p14bf2-acting-discipline.test.ts` 84-147, 176-195, 308-329; `tests/p14b3-rule-revision.test.ts` 86-177; `tests/bridge-p14b4-runtime47-compatibility.test.ts` 140-161; grep of all `tests/**` for `rulesVersion|PROMISE_RULES_VERSION|version: N|.version).toBe(`.

## Answers

### Q1 — Does the plan permit stamping `PROMISE_RULES_VERSION = 4` on a scalar class-mask + residual evaluator (no joint witness, no UNCERTIFIED mapping)?

**Verdict: NO as written. A1's rules-4 stamp DEVIATES from the plan and from 26 §2; evaluator 4 is defined as the whole, and 26 sequences the stamp after the reviewed adapter.**

Controlling text:
- Plan :76-77: "New evaluations/roots use evaluator4 (rules3 is already B-F2); preserve old versions."
- Plan :118-122 (feasibility contract, not the appendix): "Evaluator4 explicitly applies shared residual capacity to BOTH new P1 evaluations and tagged P2 … Active reservations are subtracted before classification … some new P1 offers may become nonofferable."
- Plan :124-129 (same section): "Adopt the bounded-computation extension: UNCERTIFIED maps to nonofferable FRAGILE with the exact explanation `bounded capacity analysis could not certify this schedule`. … Ordinary launch fixtures hitting the analysis cap are a performance/design finding, not license to weaken tests."
- Plan :110-116: "A constructive schedule is not by itself a maximum/hard-bound proof. Minimum countdowns are not certified availability. Prove IMPOSSIBLE from an actual bound/refusal, never from a heuristic search miss."
- Plan :131-132: "The refined solver appendix below and actual owner adapter still require bounded review BEFORE T1 authoring is finalized. No placeholder matcher is authorized."
- Plan :230-231 (appendix, audit pending): "Use ephemeral complete picture-path alternatives and proof-bearing results, not a guessed scalar maximum."
- 26 §2 :57: "Install the reviewed owner-adapter/class-capacity result and relevant input digest, for fresh P1 AND tagged P2. **Then** stamp rules4 on new evaluations/roots only. … No placeholder capacity or version-only change."
- 26 §1 :47: "Do not bump rules4 just to unblock them." 23 :36: "Do not loosen the live writer or bump only the rules literal to erase this RED."

Reading: the UNCERTIFIED→FRAGILE mapping (:124-129) sits in the feasibility contract proper, not only in the pending appendix, and it presupposes a bounded search that can be uncertified. 26 §2's "Then" places the rules-4 stamp after installing "the reviewed owner-adapter/class-capacity result". A1's evaluator is the existing rules-3 `nMax` loop (`promises.ts:390-394`, minimum-countdown `from + k*8 + 5` at :347 with `PRODUCTION_TICKS: 8` at `tuning.ts:59`) plus a mask on `seatedPreFirstTake` and the residual buffer. Its ACHIEVABLE verdicts are certified from minimum countdowns, which :112 says are "not certified availability", and it is the "guessed scalar maximum" of :230-231. A1 is more than a literal bump (so 23's rule is not the operative objection), but "4" would then name a law neither the plan nor 26 defines. 537-A concedes this in its §5 ("the plan defines evaluator4 as residual capacity + joint kernel certificate + UNCERTIFIED semantics") while its §4 cites 26 §2 rows as A1's authority; that is internally inconsistent. Stamping 4 on the scalar requires an explicit recorded amendment of the plan's evaluator-4 definition (see Q7).

### Q2 — Does the installed RED tolerate option (a) (4 = scalar now, kernel as 5)?

**Verdict: NO as a writer-only slice. Three separate reasons, one of which applies to option (b) as well.**

1. **Kernel-only result under a rules-4 pin.** `tests/p14b4-cast-class-capacity.test.ts:279-288` ("a conflicting fixed lead claim makes the joint offer impossible") asserts, through the shared helper `pureRead` (`:196-204`, `expect(result.rulesVersion).toBe(4)` at `:201`), `classification === 'IMPOSSIBLE'` at `:282` for the SUPPORT target when the antagonist person holds a lead-class claim. The scalar cannot produce this: `activePromiseReservations` (`promises.ts:274-283`) filters `beneficiaryPersonId === draft.beneficiaryPersonId`, so another person's conflicting claim is invisible; by paper the scalar returns FRAGILE "no spare picture" (nMax 1, X 1, buffer 1). 537-A agrees (§3). Under (a) this case stays RED until the kernel lands; if the kernel lands as evaluator 5, the pin at `:201` is shared by all 15 cases, so the entire file's pin must move. That is a test change and therefore not a writer's call (plan T2 :345-349: "Any legitimate moved current-law premise gets independent explicit reconciliation").
2. **Assertions that become vacuous under the scalar.** `:247`, `:260`, `:359` assert `bottleneck !== UNKNOWN_CAP` (`:36`, the plan's exact UNCERTIFIED string). The scalar never emits that string, so these pass without exercising their stated purpose ("Feasible X=1 is FRAGILE (no B=2 spare/slack), not spuriously achievable" `:243-245`; "never splices a later Ready script into its spare witness" `:254`). Not a failure, but under (a) the parent should not count them as certified-bottleneck coverage.
3. **Regression controls pin rules 3 on fresh evaluations (applies to any rules-4 stamp, (a) or (b)).** `tests/p14bf2-acting-discipline.test.ts:91` `expect(PROMISE_RULES_VERSION).toBe(3)`; `:113`, `:126`, `:144` fresh `promiseFeasibility` reads `rulesVersion: 3`; `:186-187` fresh attach `version: 3` / `rulesVersion: 3`; `:191` freeze receipt `rulesVersion: 3`; `:318`, `:325` fresh read/attach at 3. `tests/p14b3-rule-revision.test.ts:92` constant pinned to 3; `:138-141` "new actual attachment uses root.version3 and receipt.rulesVersion3"; `:174` freeze receipt `rulesVersion: 3`. Its header `:87-89` records the precedent: "live evaluation moves2→3 for the acting-discipline fix … Only fresh roots/receipts use3." So the B3→B-F2 move was reconciled by the test-author; a 3→4 move needs the same. 537-A's acceptance list (§4, line 87: "Unchanged: … the B-F2 acting file") is wrong on this point. The `bridge-p14b4-runtime47-compatibility.test.ts:150-155` pin (`version: 3`, `rulesVersion: 3`) is a historical fixture read at week 45 and is unaffected.

Other rules-4 assertions for the record: `outcomes.test.ts:324-325`, `:328` (player tagged P2, `REASONABLY_ACHIEVABLE`, 40-week window; scalar by paper: nMax 5, buffer 2, existingPath 1 via the stock door under legacy development per record 17, slack 35 → ACHIEVABLE, then stops at `live()` `:79` Save29); `:349-350` (rival root, needs G9+G10); `policy.test.ts:286`, `:300`, `:316-317` (ACHIEVABLE at week 208 over a 207-week window; scalar fine by paper, kernel budget unmeasured). Under (b) all of these wait on kernel + enumerator + budget, whose feasibility 537-A's §3 shows is unproven.

### Q3 — Is 537-A's safety invariant correct?

**Verdict: TRUE for saveability, with two omissions and one inaccuracy.**

Validator (frozen V29 branch), `src/core/promises.ts`:
- `:910` `if (nonnegative(row.version, …) < 1) return fail(… must be positive)` — any positive root version admitted.
- `:925-928` `} else { // All legacy catalogue families retain generic-cast evidence. Neither root.version nor receipt.rulesVersion selects a new predicate shape. exact(predicate, ['count'], …) }`.
- `:949-951` `if (nonnegative(feasibility.rulesVersion, …) < 1) return fail(… must be positive)`.
Plan :65: "Arbitrary positive root/receipt versions stay legal; numeric2/3/4 never identifies a new shape." So a count-only root with `version: 4` and receipt `rulesVersion: 4` is admitted by `validateSaveV29` (`save.ts:8604-8618`, reached from `makeSave` `:6400-6405`). Ordinary live sessions remain saveable under A1.

Caller audit (grep of `src`, `bridge`, `ui/src`): `attachPromise` is called only at `bridge/contract.ts:469-474` (`predicate: { count: draft.promise.count }`) and `src/core/talentMarket.ts:1276` via `authorRivalPromise` `:1263-1268` (`family: 'APPEARANCE_COUNT'`, `predicate: { count: 1 }`). `promiseFeasibility` is called at `bridge/promises.ts:120-129` (`predicate: { count: draft.count }`), `talentMarket.ts:761-771` (`attachedFeasibility`, whole predicate of an existing root), `talentMarket.ts:1269-1275`, and inside `promises.ts` (`reclassifyPromise` `:419-431`, `attachPromise` `:479`, `breakPromisesOnCancel` `:685`). No `ui/src` caller; `src/core/index.ts:1415` is a re-export. So after A1 the only producers of tagged roots are tests. A classless P2 arriving on the wire is refused before attach (`contract.ts:466-468`) under A1's "needs an explicitly selected class" reason (plan :68-69 requires exactly that honest reason). `commitWinningPromise` `:1110-1111` replaces the receipt and keeps the root version (plan :70-71). `convertV30ToV29` `:8704-8710` refuses tagged downgrades loudly, so a V30 file with tagged roots cannot enter live play through `migrateToV29` consumers.

Omissions in 537-A's statement:
- (i) A1 pre-cutover creates a live era the plan never defined: the V29 writer emitting evaluator-4 receipts and version-4 roots. Lawful by the validator, but the T0 "genuine FINAL outgoing SaveV29 nine-case corpus" (plan :16-19) then no longer represents the last V29 writer's output, and 26 §2 places the rules-4 stamp inside the coordinated activation that includes `save.ts:6396-6404` → 30. Not a violation by any quoted line; a sequencing smell the parent should decide on explicitly.
- (ii) The residual-buffer change (`reserved + X > nMax − buffer`) is plan-authorized (:121-122) but alters fresh P1 classification in natural chains, so `survivesFreeze` `talentMarket.ts:1090-1092` (`promiseNotFeasible`) can drop proposals that survive today, moving winners and therefore any natural-chain pin in the B1/B3/B-F2/bridge controls. 537-A mentions this generically; it is part of the reconciliation surface, not a writer-only concern.

Inaccuracy: 537-A says the `types.ts:2233-2234` alias switch is "needed so `attachPromise` can mint a tagged root". Structurally `CastRoleCountPredicate` (`types.ts:2214-2218`) is assignable to `{ count: number }` and the V30 union member is assignable to `ProfessionalPromiseV29`, so the switch is not a compile necessity in either direction (this is also why `advancePromisesWeek` `:611` already passes a V29 promise into `qualifyingTakes(…, ProfessionalPromiseV30)` `:555-558`). Low typecheck risk, but I could not run `tsc`; NOT VERIFIED by execution. `makeSave(state: GameState)` passes `state` into `validateSaveV29(save: unknown)`, so the alias switch does not break `save.ts` typing.

### Q4 — Are the 26 §1 pure steps implemented and GREEN-covered?

**Verdict: MET WITH EVIDENCE (536 records 17 PASS for the file).**

Source: `promises.ts:147-154` `promiseDigest(promise: ProfessionalPromiseV30)` builds the exact four-tuple `[family, predicate.count, windowStartWeek, dueWeekExclusive]` and appends `[kind, seatClass]` only when `'kind' in promise.predicate`; `:160-169` `attachedPromiseDigest(state: Pick<GameStateV30,'promises'>, …)` with `''` for no promise; `:548-553` `promiseCastSlots` (legacy any family → all three; `lead` → `['lead']`; else `['lead','antagonist']`); `:555-569` `qualifyingTakes` (issuer, half-open window `take.week < windowStartWeek || take.week >= dueWeekExclusive`, distinct `productionId`, mask). `advancePromisesWeek` `:611` consumes it.

Tests (`tests/p14b4-material-evidence-core.test.ts`): `:112-117` independent `legacyDigest`/`taggedDigest` formulas; `:120-131` five families exact old formula and attached formula; `:133-149` kind/class material, three distinct digests, classless P2 never aliases a class; `:151-172` family/count/both window endpoints material, receipt/version untouched; `:335-352` six class×slot outcome matrix on a real recorded 5→4 take (`:256-276` spy captures the pre-outcome owner input); `:354-361` support qualifies for P1 and legacy P2; `:363-380` shared take, two distinct own receipts; `:382-395` window start counts, due-exclusive does not, with idempotence via `strictAndRepeat` `:321-332`. 537-A's claim stands. Note `promiseCastSlots`/`qualifyingTakes` are module-private (26 §1 asked for a reusable helper; reuse inside `promises.ts` is available to A1 without a new export).

### Q5 — `rivalWorlds()` coupling (`tests/p14b4-cast-class-outcomes.test.ts:204-234`)

**Verdict: deliberate premise, not a defect under record 17 or the plan; immaterial until Save30 and rival P2 authoring both exist. Advisory only.**

The helper requires `slots.lead/antagonist/support` AND `genuine` (`:227`), throwing at `:233` with "no synthetic substitute". Eight rival cases (`:363-370` rival rows, `:372-381`, `:394-414`) only read `slots[slot]` via `atFive` `:235-237`. Nothing in the plan (:186-193, :350-353) or 26 §2 :86-87 ("The runtime and synthetic player outcome subset can be verified before those natural rival cases pass; that is partial evidence") requires the coupling; equally nothing forbids it. It is immaterial today because every rival variant then calls `variant()` `:248` → `live()` `:78-79` (`expect(validated.saveVersion).toBe(30)`) and would stop at Save29 anyway. After the Save30 cutover and before rival P2 authoring, the coupling withholds eight slot-only partial-evidence cases. Recommendation for the test-author at reconciliation time, not now: split into `rivalSlots()` and `rivalGenuine()` with separate caches; cost per case stays ~10 s for 350 ticks either way.

### Q6 — Any smaller lawful production slice than A1 reaching an installed RED?

**Verdict: NONE that turns an installed case GREEN at a pure boundary. Confirmed with 537-A/537-B.**

Checked candidates: (1) union types + full-predicate copy only (no version, no evaluator change): policy `:284` passes, stops at `:286` (`ACHIEVABLE` vs `NOT_OFFERED` IMPOSSIBLE, `promises.ts:371-372`); capacity "class digests" still stops at `:201`. 26 §1 :38 forbids it as a pure stage: "Do not widen/activate attachment … as part of this pure stage." (2) G9 rival order (537-B's suggestion): `policy.test.ts:415-416` tolerates the extra IMPOSSIBLE read and `:421` would pass, but `:529` requires the `flexibleP2` witness, so the case stays RED; it also runs policy before core capacity, against T2's order (plan :345-346 "core capacity/outcomes, then policy/bridge/generator"). Partial advance only; not recommended standalone. (3) `settle` narrowing (26 row 5) and `breakPromisesOnCancel` decoupling (26 :69-79): no installed RED reaches either. (4) Everything else (G1/G2/G4/G6/G7/G8) is a writer/schema/projection literal, i.e. the coordinated cutover, and 26 §3 :123-125 forbids exposing live30 under unchanged 46.

### Q7 — Overall verdict on A1

**NOT LAWFUL AS PROPOSED. LAWFUL WITH CHANGES only after a recorded Current Ops decision on the evaluator-4 definition and sequencing; the associated replay-cost finding should be recorded as an Owner-visible decision item alongside 515 §6.**

Why not as proposed (each cited above): (1) the rules-4 stamp on a scalar evaluator contradicts 26 §2 :57's sequencing and the plan's evaluator-4 definition (:118-132); (2) it is never writer-only: any 3→4 move breaks the B-F2 and B3 fresh-evaluation pins (`p14bf2-acting-discipline.test.ts:91,113,126,144,186-187,191,318,325`; `p14b3-rule-revision.test.ts:92,138-141,174`), which 537-A lists as unchanged; (3) under (a) the capacity file's shared pin `:201` must later move for the kernel (Q2.1).

Decision D1 (parent / Current Ops, within the Owner's autonomous directive; the plan is Fable's own engineering law and :361-363 reserves only "genuine new product decisions"): choose one and record it as an amendment to the plan §"Feasibility contract" and 26 §2 row 3:
- (a) evaluator 4 = class-restricted fixed-seat paths + shared residual capacity on the existing count-family scalar; the kernel joint certificate and the UNCERTIFIED→FRAGILE mapping become evaluator 5. Consequences to record: P2 offers launch on the same minimum-countdown heuristic P1 has under rules 3; capacity `:279-288` stays RED until 5; `:247/:260/:359` are vacuous until 5; the whole capacity pin moves at 5.
- (b) hold 4 for the kernel-backed service; A1's structural parts wait; capacity 14 + outcomes 2 + policy 2 cases stay unreachable until an enumerator exists and the budget question (D2) is answered.
If (a): the changes that make A1 lawful are: (i) the amendment text above; (ii) test-author reconciliation, in the same slice, of the B-F2/B3 pins following the `p14b3-rule-revision.test.ts:87-89` precedent, and a disposition for the kernel-vocabulary capacity cases (separate evaluator-5 file or explicit unreached marking); (iii) an explicit sequencing choice: A1 pre-cutover (accepting the V29-writer + evaluator-4 era, Q3(i)) or A1 inside the coordinated core/save/runtime/wire cutover (26 §2-§4; 537-A's runner-up B) verified in sub-steps on fixed source. I recommend inside the cutover unless the parent explicitly accepts the intermediate era; (iv) natural-chain reconciliation authority for residual-buffer movements (Q3(ii)); (v) 537-A corrections listed below.

Decision D2 (record as Owner / Current Ops item, non-blocking, like 515 §6): the measured producer work of 182,925 of 200,000 for ONE hand-written Ready plan (535 table, "kernel headroom 17,075") means, by 537-A's paper inference (not measured by me), that an achievable probe needing two picture traces cannot fit the cap, so the kernel route cannot certify ordinary fresh offers. **Under the plan's own words this is a performance/design finding to report, not to resolve by cap or test changes:** plan :128-129 "Ordinary launch fixtures hitting the analysis cap are a performance/design finding, not license to weaken tests"; :306-308 the 200,000 is a "computational hypothes[is] for audit/measurement"; :319-321 "actual natural-chain measurement is required. These are NOT gameplay/save-admission limits or permission to raise test timeouts." 515 §6 already treats tariff clarifications as needing Owner authority. If Current Ops chooses (a) because of D2, that consequence (P2 launching on heuristic certification, the kernel deferred) should be visible to the Owner in the record.

## Defects and inaccuracies found

537-A (`scratchpad/537-A-report.md`):
- Line 87 "Unchanged: … the B-F2 acting file": wrong; see Q2.3 for the exact pins. Same for `p14b3-rule-revision` (not listed at all).
- Line 70/76-82: alias switch described as needed for minting; not a compile necessity (Q3). Harmless.
- Line 23/45 and §1 table: count-only copy cited at `promises.ts:490`; it is `:495` (`predicate: { count: draft.predicate.count }`); `:492` is `version: PROMISE_RULES_VERSION`. Inherited from 26's older numbering.
- Minor range drift: `seatedPreFirstTake` is `:262-267` (not 262-272); `expectedFirstTakeWeek` `:335-348`; `promiseFeasibility` `:366-413`; `attachPromise` `:463-524`; `validatePromiseRootsForVersion` `:818-1023`; `NOT_OFFERED_IN_B1` `:204-209`. All other cited ranges verified within a few lines.
- §4 cites 26 §2 rows as A1's controlling authority while §5 concedes the version meaning is a gap: internally inconsistent (Q1).
- "No live owner imports the kernel or replay producers": verified (only `src/core/promiseCapacityOwnerReplay.ts` imports the kernel).

537-B (`scratchpad/537-B-report.md`):
- G3 cites `promises.ts:490` for the count-only copy (actual `:495`) and `:206-211`/`:372-373` (actual `:204-209`/`:371-372`). `:217`, `:42`, `save.ts:6401/8611`, `promises.ts:809/928/820/834`, `talentMarket.ts:1258-1276`, `bridge-schema.ts:1756-1761` verified.
- Out of its assigned scope but material to the parent's choice: it does not mention the B-F2/B3 rules-3 pins that any rules-4 stamp breaks.
- Its G10 test-design note and "no failing case stops at a pure boundary" conclusion: agreed (Q5, Q6).

## Evidence limits

Nothing executed; no `tsc`, no vitest. Paper classifications (nMax/existingPath/slack) use `PRODUCTION_TICKS: 8` (`tuning.ts:59`), `WEEKS_TO_FIRST_TAKE 5`, and the fixture facts stated in the test bodies and record 17; the `p13aGeneratedStudio` stock-door availability at the outcomes fixture's `start` week is inferred from `stockGreenlightAvailable` `:249-258`, not observed. The 536 raw output was not re-read; counts are taken from 536/537-B. Kernel budget for a second trace is 537-A's inference. I did not read `bridge/session.ts`, `ui/src/engine/adapter.ts`, `campaign-library.ts` bodies or the first-take replay test; their `migrateToV29` routing and the `limits` pin are taken from 537-A/26 and marked NOT VERIFIED. No native, usability or Owner-acceptance claim.

## Next concrete action for the parent

Record D1 and D2 in 537 before any writer. If D1 = (a): dispatch the test-author first (B-F2/B3 pin reconciliation plus capacity-file disposition, one bounded diff, independent review), then release the sim-core writer for A1 with the corrected acceptance list, preferably inside the coordinated cutover boundary. If D1 = (b): no production slice is lawful now; the next work is the owner-adapter enumerator/budget measurement under D2, or the replay runner-ups C1/C5-C7.
```
