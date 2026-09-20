# 538-C — Contract review of the Ready-admission persisted-ID bill and the one-admission structure

2026-09-20. Claude Code parent. Companion to record 538. One contract-auditor READ-ONLY review
(verbatim in §3) of the two producer facts measurement 538 established on the real capacity
fixture: the Ready producer's `readyProductionId` bill saturates the 200000 hypothesis before
any picture is admitted on a history-bearing world, and a Ready trace admits at most one fresh
picture at source-now. No source, test, fixture, cap, timeout, validator or plan text changed.
No writer released. HEAD at review `79b7a738` (docs only since `69d16f8`).

## 1. Findings the parent adopts

- **The quadratic occurrence bill is contract law, not a writer's choice.** The 162 §2 metric
  for native Map/Set calls (every possible live-key equality operand, "not a bound on a host's
  hash implementation") is adopted by 176 §1 (:25-27), the 320 B-addendum formula
  `N·(9+W) + [N·(N−1)/2]·E(W)` with "Never substitute final distinct Set size for N" (:33-44),
  and the 285 checkpoint direction "Do not change the metric, assume native constant-time
  hashing/warm cache, refund work, raise allowance or weaken the ordinary case" (:119-120).
  `readyProductionId` (`src/core/promiseCapacityOwnerReplay.ts:2024-2110`) implements exactly
  that formula; 240/241 pin `persistedProductionIds` as the sole authority for the collision
  union. 176's sorted-index law (:159-166) governs the producer's OWN joins, not the native
  owner's adds. Therefore no lawful-as-written producer change removes the cut on `opened`;
  the only arguable refinement (bill add i against `min(i, D)` with paid dedup and actual
  spans) is barred by 320:43 and is ≈139k–270k on paper anyway. Parent verified the source
  lines and the 176/162 quotes it could reach; the 320/285/240 quotes are the auditor's.
- **Paper bills (PAPER, not measured).** On `opened` (width 37, ≥148 occurrences, ≈442 visits)
  the current bill is ≈840k and saturates once occurrences ≥74; the most favorable
  sorted-index/actual-span variant is ≈139k for identity alone, ≈198k with prepare and the
  pre-identity admission blocks, before any workflow, hold, frame, projection or kernel work.
  The 176:301 control facts (75/96 occurrences) are Started-slate populations that never call
  `readyProductionId`; the only Ready-route control is the history-free 534 fixture (~8
  occurrences). No record fixes the persisted-ID population a Ready control must tolerate
  (240:157-159 names the 200000 requirement without a fixture class): a contract gap, reported.
- **One admission per plan at source-now is the adopted 240/241 design**, not a 137/176
  contract clause; 240:14-16 and :94-98 explicitly refuse future admissions and future
  employment. A second or deferred admission changes what a complete Ready trace certifies and
  is a new direction record + independent review + decision item, not a grammar tweak.
- **B = 2 through this producer is already recorded as unreachable** (176:146-148, :376-378;
  137:17-18); the plan anticipated multi-picture traces only as the missing forward enumerator
  (plan :236-246, :253). The budget cut falls under plan :128-129 ("performance/design
  finding"); the structural limit under plan :124-127 and :245-246. Neither is a producer defect.
- 538-M's attribution stands against source: bracket `greenlightFreelancers` (:2568) →
  `checkForeignRelevance` (:2571, linear) → `readyProductionId` (:2572, pays at :2105-2107) →
  `persistedProductionIds` (:2108, not reached); occurrence lower bound holds on the two
  type-verified groups alone (120); saturation threshold ≥74 verified.
- Observation carried (NOT VERIFIED, record-only): `productionIdentity.ts:57-60` says an
  invariant test enforces that `persistedProductionIds` is the one `src/core` reader of the
  event log, while `readyProductionId:2060-2064` reads `source.studioEvents.rows` for counting;
  the auditor's and the parent's string searches of `tests/` found no such invariant test.
  Confirm what that test enforces before relying on the comment.

## 2. D2 (Owner / Current Ops item), now concrete; non-blocking, alongside 515 §6

The kernel route as specified cannot certify ordinary fresh offers because:
- (i) the adopted 162 §2 native Map/Set metric, applied to `persistedProductionIds`' adds, makes
  Ready admission saturate the 200000 hypothesis on any source with industry history
  (≥74 ID occurrences at width 37; fewer once prepare/admission spend is counted). Changing that
  metric, its N (occurrences vs distinct), or the cap is a tariff clarification of the 515 §6
  class. Options: (a) authorize a same-metric refinement direction record (`min(i, D)` with paid
  dedup and actual spans; still ≈139k+ on paper, so likely insufficient alone); (b) authorize a
  different native-collection metric (a clarification of 162 §2); (c) accept that certified
  offers are only available on history-free or short-window states and keep 200000 as the exact
  boundary; (d) revisit the hypothesis itself (plan :306-308 calls it a hypothesis for
  audit/measurement).
- (ii) the adopted one-admission/source-now design makes the achievable probe (B = X + ceil(X/3))
  structurally unwitnessable for a fresh world; a forward enumerator with future admissions is
  unspecified scope (plan :245-246). Options: direction record for a multi-admission or
  deferred-admission grammar (certificate meaning changes; review + decision item), or keep
  the plan's UNCERTIFIED → nonofferable FRAGILE extension as the launch behaviour for such
  offers, which then interacts with D1.
What fits today: the fixed-cast 2-week cells and the conflicting-claim case (538: ≤112,722 of
200000), pending the enumerator's coverage certificate. No cap, timeout, test or assertion
changes are proposed by the parent. 537 §3 D1 stands and is the prior question.

## 3. Verbatim contract-auditor hand-back (538-C)

As returned, unedited; advisory.

```text
# 538-C — READ-ONLY contract review: Ready-admission persisted-ID bill and one-admission-per-plan structure

**Status: DONE** (all five questions answered from the controlling texts; no edits, commands, Git, network or delegation). **Model observed:** claude-fable-5-1 (Fable 5.1), Claude Code agent harness; lean-ctx MCP tools named in the user CLAUDE.md were not exposed to this role, so native Read/Glob/Grep were used. Worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD `79b7a738` per the brief (not re-hashed: no shell). The untracked measurement test was not opened.

## Sources read (absolute paths, line ranges)

- `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/538-M-report.md` 1-101 (whole)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwnerReplay.ts` 60-120 (types), 120-350 (`CEILING`, `LITERAL`, `Work`), 534-723 (`prepare`), 795-838 (`checkForeignRelevance`), 2000-2137 (`readyProductionId`, `searchBill`), 2440-2679 (`admissionCall`, `admitReady`, `finishReady`, `replayPlans` head)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/productionIdentity.ts` 1-202 (whole)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityKernel.ts` 925-1047 (`classifyDomain`, `runCapacity`, exports)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts` grep hits (`filmId` 2253-2255, 1632, 1868; `productionId` typings), `src/core/hollywoodTypes.ts:21`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` 100-339
- Evidence folder `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/`: `176-started-replay-work-contract.md` (whole), `137-started-owner-replay-contract.md` (whole), `162-first-take-owner-work-bill.md` (whole), `175-first-take-work-bill-review.md` (whole), `365-paid-record-facts-direction.md` (whole), `515-stale-route-attribution-direction.md` (whole incl. verbatim 515-A/515-B), `240-ready-admission-next-slice.md` (whole), `241-ready-admission-seam-review.md` (whole), `249-ready-admission-implementation-handback.md` 80-124, `267-ready-admission-bound-correction.md` (whole), `285-ready-accounting-qualified-checkpoint.md` 100-129, `320-next-replay-cost-directions.md` (whole), `321-local-replay-calculator-implementation.md` 1-80, `326-local-replay-calculator-source-review.md` (whole), `339-static-dimensions-concept-implementation.md`, `340-calculator-publication.md`, `341-static-dimensions-source-review.md`, `352-qualified-static-facts-checkpoint.md` (whole each), `26-live-cutover-implementation-map.md` (whole); grep-only over 148/157/168/169 (no ID-union content beyond 148:94 prefix provenance).
- Tests: grep only (`persistedProductionIds` used in `tests/p12-starting-world.test.ts:23` and `tests/p14b4-ready-replay-identity.test.ts:123`; no "pin 2"/event-log invariant test found by string search).

Lineage correction to the brief: commit `3e6836a` is the publication of records 321-337 (340:4-8 "Commit: Reduce replay calculator work with exact owner reservations"), and the prefix-pairs bill was authored in 321 §3 under the 320 "B addendum" (auditor KEEP, parent adopted), reviewed KEEP in 326:18-20. Record 339 (the other file in that publication) implemented only the concept-map/static-facts change (339:7). The pre-321 bill was 249:95 `A*(8+K(A,W))` = the full-final-count form; 321 tightened it to the prefix form. Both are the 162 §2 metric.

## Q1 — Is the quadratic pairs term required, or the writer's own model?

**Answer: the pairs term is the writer's conservative instantiation of a metric that the contract REQUIRES for native Map/Set calls. No lawful-as-written producer change removes the quadratic on this fixture. Changing the metric is a tariff clarification (515 §6 class). The contract is not silent and not contradictory on this point.**

Deciding text, in authority order:

1. 176:25-27 (§1): "Work units are the accepted162/175 source model: named finite straight-line blocks; native/owner invocation; callback/loop visits; explicit reference writes; consumed string spans; and discovered/copied shallow properties."
2. 162:87-101 (§2, the accepted model for native collections): "For native Map/Set calls use a conservative logical key footprint, rather than assuming zero-cost string hashing: `key(U,k) = 1 + k.length + sum(text(u,k) for u in U)` ... This charges invocation, the argument span, and every possible live-key equality operand. It is an abstract finite-collection/string bill, not a bound on a host's hash implementation. ... Using all N keys for every operation safely covers every intermediate size and recharges repeated long IDs. Building/checking the universes costs work outside this call. Do not build an uncharged full-ID list inside each query." 175:5 KEEP; 175:36 "It does not claim a bound on native hashing".
3. 320:33-44 (B addendum, adopted): "The actual owner starts an empty Set and performs one add per non-null identity occurrence. Before zero-based occurrence i, at most i keys exist; duplicates only reduce the count. For N insertion OCCURRENCES and maximum ID width W, replace the repeated full-final-count reservation with this same-metric upper bound: `N * (9 + W) + [N * (N - 1) / 2] * E(W)`, where `E(W) = 1 + 2*W`. ... **Never substitute final distinct Set size for N.**"
4. 285:119-120 (parent checkpoint direction): "Do not change the metric, assume native constant-time hashing/warm cache, refund work, raise allowance or weaken the ordinary case."
5. 240:103-107 and 241:28-29 fix WHO computes the union: "Replay uses actual persistedProductionIds over genuine current roots, not only active/released arrays. This owner alone retains permission to inspect historical production identities" / "persistedProductionIds remains authority for full collision union including cancelled/history IDs." `productionIdentity.ts:57-60` states the same pin ("the ONE place in src/core allowed to read the event log").

Source conformance: `promiseCapacityOwnerReplay.ts:2031` counts `additions` per non-null occurrence; `:2098-2104` computes `pairs = additions(additions-1)/2` with the halve-before-multiply order 320:43 demands; `:2105-2107` pays `64 + 40·visits + additions·(9+width) + pairs·equality(width)`; `:2108` then invokes the real owner. `Work.equality(37)` = 75 (`:298-301`); `Work.times` saturates at `CEILING = 200001` (`:135`, `:293-297`). This is exactly 320's formula.

Why 176 §4's sorted-index law does not re-price this call: 176:159-166 governs indexes the PRODUCER builds for its OWN exact-ID joins ("Build local sorted indexes for exact ID joins, using the REAL shared sorter ... A lookup in n rows takes at most `ceil(log2(n+1))` comparison steps"). It says nothing about how an owner's native `Set.add` is billed; that is 162 §2. A producer that built its own sorted index over the occurrences would (a) still have to invoke `persistedProductionIds(source)` (240:103, 176:25 "native/owner invocation") and pay its n adds under 162 §2, or (b) replace the owner's union with its own, which contradicts 240:105-106/241:28 and the pin at `productionIdentity.ts:59`, and since `allocateProductionId(startTick, taken: ReadonlySet<string>)` (`productionIdentity.ts:5`) requires a native Set, the producer would still build one (D adds under 162 §2). Either way the model is the same metric; only the universe size changes.

The one refinement that is arguably lawful as written: bill add i against `min(i, D)` live keys with actual stored spans (267's `keySpanBill`, `:312-315`), where D (distinct count) is established by PAID dedup BEFORE the call (162:100 "Building/checking the universes costs work outside this call"; 176:193-195 "A branch-specific bill may be selected only by facts available BEFORE that owner invocation"). Two obstacles: 320:43 "Never substitute final distinct Set size for N" makes that a direction-record change, not a writer's discretion; and on paper it does not fit anyway (Q2).

Contract gap worth recording (a report, not a resolution): 240:157-159 requires "New helper must retain a useful real complete trace within the SAME200000 including required kernel work", but names no fixture class. The only Ready-route control that satisfied it is the 534 fresh-founding fixture (~8 additions per 515-A:180). 176 §7's control facts (:287-302) are Started-slate controls (179) that never call `readyProductionId`; 176 §8's six acceptance cases (:364-400) are all started-slate. No record fixes the persisted-ID population size a Ready control must tolerate. Under the adopted metric, any source with industry history (≥74 occurrences at width 37, or ≥ ~55 once prepare/admission spend is counted) cannot complete a Ready admission. That is the finding for the Owner/Current Ops item, alongside 515 §6 C9/C10.

## Q2 — Paper bills (PAPER, not measured)

Facts from 538-M's dims line on `world().opened` (run5 line 75): width 37, distinct D = 28, type-guaranteed additions ≥ 148, walked rows summed from the listed collections ≈ 442 visits (technologyProductions 20 + ledger 99 + studioEvents 2 + studioHistory 45 + hollywoodFilms 24 + hollywoodCareerEvents 96 + hollywoodReceipts 94 + foreignProductions 4 + foreignProjects 24 + foreignDevelopmentProjects 24 + foreignWorkflows 4 + scriptProjects 2 + businesses 4; nested subjects/reservations not counted).

**Current bill (source :2105-2107):** 64 + 40·442 (17,680) + 148·46 (6,808) + 10,878·75 (815,850) ≈ 840k; the `times(pairs, 75)` saturates at 2701 pairs (floor(200001/75) = 2666), i.e. additions ≥ 74, so `plus` returns 200001 and `pay` throws. Using only the two groups I verified by type (`hollywood.films` 24 `filmId: string`, hollywoodTypes.ts:21; `hollywood.careerEvents` 96 `filmId: string`, types.ts:2255): 120 additions → 7,140·75 = 535,500, still saturating. The conclusion does not depend on the unverified groups.

**Sorted-index model (176 §2 SORT + §4 adjacent walk + 162 §2 for the resulting native Set), n = 148:** L = 8, M = 1,184, R = 151 (74+37+19+10+5+3+2+1). Comparator body for a plain ID comparator, by analogy with 176:106 `cProduction = 28 + 2*(1+2*D)`: c = 8 + 2·(1+2·37) = 158 (the 8 is my assumed fixed block; 176 gives no plain-string comparator constant).
- SORT(148,158) = 8 + 2·149 + 148 + 8·8 + 19·151 + 5·1184 + 166·1184 = 8+298+148+64+2,869+5,920+196,544 = **205,851** (over the cap by itself).
- Adjacent-duplicate walk 147·75 = 11,025. Native Set of the 28 distinct keys, 162 §2 prefix form: 378·75 = 28,350 (538-M's `pairsBillLowerBound`). Walk terms retained: 24,488.
- Subtotal at width 37: ≈ **269.7k**.
- Optimistic variant with actual spans (unmeasured on `opened`; 176:301's other population averages ~10.5 chars): c ≈ 54 → SORT ≈ 82.7k; walk ≈ 3.4k; Set ≈ 28.4k (still width-priced under `keyBill`); walk terms 24.5k → ≈ **139k** for identity alone. Add prepare 18,754 (measured, 538-M line 75) and the pre-identity admission blocks (header/staffing/busy/contract scans over 84 talent; 515-A:179 measured ≈40k on the smaller stale fixture) → ≈ 198k before the workflow add, link, five holds, drain, any frame, projection and kernel.

**Versus the 176:301 controls (75 occurrences/790 chars; 96/1,004; width 28 per 176:300):** fed to the current formula, 2,775·57 = 158,175 and 4,560·57 = 259,920 (saturates). These are NOT controls for this bill: they are "Enumerated ID occurrences ... all consumed groups" on the 179 Started fixtures, which never call `readyProductionId`. They do show the metric is at cap scale for ordinary occurrence counts. The only Ready-route control is 515-A:180 on the stale fixture: `readyProductionId` 9,649 total (walk ≈4.6k, reserve 5,012 for ~57 visits/~8 additions, allocator 738).

**Verdict for Q2:** admission plus one trace on `opened` is NOT plausible under any lawful-as-written reading, including the most favorable sorted-index/actual-span variant. PAPER.

## Q3 — One `readyChoice` per plan, admission at source-now

**Answer: a 240/241 direction-record requirement (adopted design), implemented as producer structure. Not a 137/176 requirement (both exclude Ready admission or future admissions). A second or deferred admission is outside the adopted plan grammar and needs a new direction record, independent review and a recorded decision item.**

Quotes: 240:11-12 "Execute ONE explicitly supplied, genuinely assessed managed Ready-script staffing choice at source-now per plan"; 240:53-55 "Admission is the plan's first operation at(now,1), before its ordinary commands. ... at source-now ordinal0 is reserved for admission"; 240:122-123 "One choice per branch precludes two admissions in that branch; no cross-branch consumption."; 240:14-16 "Do not enumerate future admissions, hiring/renewals/commissions, budgets, screenplay acceptances, queue policy or automatic commands."; 240:94-98 "Use actual isContracted/freelancerMarketIds at SOURCE-NOW. ... Do not pass a future optional week while leaving the underlying current-employment source stale. ... Source-now avoids pretending future renewal/employment winners already exist." 241:31-32 KEEP: "successful(now,1) admission before commands matches public action-before-tick order." 137:16-17 "It does not enumerate commands, Ready packages, commissions, staffing choices, employment winners or future films." 176:431 "No claim is made for rival replay or unenumerated future admissions."

Source: type `ReadyProductionPlan` `:72-77` (one `readyChoice`); `prepare:583` "source-now ordinal zero is reserved for admission"; `prepare:568-569` admits only the four command kinds; `admitReady:2457-2461`.

Why a deferred admission is a design change, not a grammar tweak: it requires employment/freelancer eligibility at a future week, which 240:94-98 explicitly refuses to fabricate, and it changes what a complete Ready trace certifies (future hiring assumed). 240:6 claimed "No new product decision is needed" only for the source-now form. I cannot cite text that mandates Owner authority for the extension; the 515 §6 pattern (record as decision item, do not resolve) applies.

## Q4 — Consequence for the plan appendix

Kernel: `bufferDemand = remaining + Math.ceil(remaining / 3)` (`promiseCapacityKernel.ts:1018`); X = 1 → B = 2. `classifyDomain:960-969`: CERTIFIED_ACHIEVABLE only if the B-probe returns a witness; otherwise PROVEN_FRAGILE/achievableProbeFailed on a complete domain, else UNCERTIFIED. Plan:106 "One beneficiary cannot get two events from two seats in the same picture." (kernel's internal enforcement NOT VERIFIED by me; I read only 925-1047).

**Answer: with one admission per trace on a 0-production world, B = 2 can never be witnessed through this producer at any budget.** This is already recorded, not new: 176:146-148 "A finite plan list supplies no completeness proof. One eligible take, or two different companies' simultaneous takes, does not establish a same-person B=2 witness, eight-week slack or CERTIFIED_ACHIEVABLE."; 176:376-378 "Do not demand CERTIFIED_ACHIEVABLE: distinct companies do not provide B2 for one person, and this finite replay has no complete future-choice proof."; 137:17-18 "It cannot classify a promise or declare a complete choice domain."

Did the plan anticipate multi-picture traces? Yes, as a missing enumerator, not as this producer: plan:236-241 (path identities incl. "planner-local identity for a hypothetical commission"; "Each path alternative carries greenlight/take/person-release boundaries"), plan:245-246 "Owner adapter work is real scope, not supplied by the current source: it has no complete forward enumerator.", plan:253 "Current first-take timing is anchored at now, not retimed to a future window." Record 26 §2 (`26-live-cutover-implementation-map.md:49-88`) is the promises/save cutover map; it does not address multi-picture traces (only 26:57 "Install the reviewed owner-adapter/class-capacity result").

Does the "performance/design finding" clause cover it? Plan:128-129 "Ordinary launch fixtures hitting the analysis cap are a performance/design finding, not license to weaken tests." covers the BUDGET cut (fact 1). The structural limit (fact 2) is a domain-completeness gap covered by plan:124-127 (UNCERTIFIED → nonofferable FRAGILE extension) and plan:245-246 (no forward enumerator), plus 176 §3/§8. Also on `opened` the source-now take lands at week 50 before window start 52, so even the X = 1 count probe cannot be met through this producer there. Both facts are design-scope findings for the record, not defects in the producer.

## Q5 — Verdict for the parent

**Admission bill: (b) tariff clarification / Owner–Current Ops item**, same class as 515 §6 C9/C10. Exact scope: the 162 §2 `key(U,k)` all-live-key equality metric for native Map/Set calls as applied to `persistedProductionIds`' n adds (adopted via 176:25-27, 285:119-120, 320:33-44). No lawful-as-written producer change fits on `opened`; the only arguably lawful refinement (min(i, D) with paid dedup, actual spans) is barred by 320:43 as a writer's discretion and is ≈139-270k on paper anyway. Do not authorize a writer. If the parent wants measurement controls first (record-check, no value assertions), a test-author should pin on `opened` and `ready`: exact `additions`, distinct D, occurrence character sum, `visits`; the pre-identity admission subtotal (needs a source-level probe or spy at `checkForeignRelevance` exit, as 538-M said); and 534's values as the history-free control (additions ~8, reserve 5,012 per 515-A:180). No RED exists to author because no lawful GREEN exists.

**Admission structure: not a 137/176 contract requirement; a 240/241 adopted design.** Any second/deferred admission is a new direction record + independent review + decision item (certificate meaning changes). Not a producer bug.

**538-M attribution versus source:** no contradiction found.
- Bracket: `greenlightFreelancers` at `:2568` reached (spy), then `:2571 checkForeignRelevance`, `:2572 readyProductionId` whose final `pay` is `:2105-2107`, and `:2108 persistedProductionIds` not reached (spy). Consistent. 0 provenance rows is consistent (`readyAdmitted` pushed at `:2614`).
- Occurrence lower bound 148: two groups verified by type (films 24 + careerEvents 96 = 120, sufficient alone); technology rows/foreign productions/workflows NOT independently re-verified.
- `checkForeignRelevance` "linear": `:801-838` is a product of small factors (businesses × company members × `find(relevant)`, ordinals × writers × `find(relevant)`, projects × seats × `find(relevant)`), with `relevant` ≈ claim persons + current company/writers (0 productions on `opened`). "Cannot plausibly reach ~181k" holds.
- Saturation threshold additions ≥ 74 verified (2701 > floor(200001/75) = 2666); in practice the cut occurs at lower counts once prepare/admission spend is subtracted.
- One clarification the brief invites but 538-M did not claim: 176:301's 75/96 occurrence facts are a different population (Started controls), not a control for this bill.

**Observation (not a defect, NOT VERIFIED):** `readyProductionId:2060-2064` reads `source.studioEvents.rows` directly for counting; `productionIdentity.ts:57-60` says `persistedProductionIds` is "the ONE place in src/core allowed to read the event log ... and an invariant test enforces that." My string search of `tests/` found no such invariant test. 240:105-107 permits reads that are not "scheduling evidence", and 249/252/326 accepted the walk; the parent may want to confirm what that invariant test actually enforces.

## Evidence limits

Paper only; nothing executed; no hashes computed (no shell). Comparator-body constant for a plain string sort (c) is my analogy to 176:106, not contract text. Actual ID spans on `opened` are unmeasured; the width-37 numbers are the contract's own worst-operand form. Kernel one-event-per-picture enforcement cited from plan/176 text, not from kernel internals. The 538-M `world()` copy's fixture facts are taken from its run5 lines, not re-derived.

## Next concrete action

Parent: archive this as 538-C; add to the open Owner/Current Ops decision item the 162 §2 native Map/Set metric as it applies to `persistedProductionIds` (with the paper table above and the 240:157-159 fixture-class gap); record the one-admission/source-now structure and the missing forward enumerator (plan:245-246) as separate design-scope items; no writer, no test edits, no cap/timeout/assertion changes.
```
