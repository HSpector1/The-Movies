# 553 — Qualified checkpoint: detached owner-adapter first slice (539 → 553)

2026-09-20. Claude Code parent. The landed candidate of record 541 was independently reviewed
READ-ONLY by the contract-auditor (553-R, verbatim in §3): **KEEP, no blocking defect, six
record-only observations.** The two source files are committed with this record; nothing else in
source changed. Save29 / rules3 / projection46 stay live; no receipt, no `rulesVersion`, no
kernel/producer/save/projection/index change; D1, D2 and 515 §6 untouched.

## Chain of authority for this slice

537 (no live change lawful before D1; adapter first slice adopted as the next engineering step) →
538/538-C (measured budget and contract facts folded in) → 539-A design (sim-core READ-ONLY) →
539-B review KEEP WITH REFINEMENTS (contract-auditor) → 539 adopted brief → 540-T RED (test-author;
missing-module RED, installed) → 541-W ONE sim-core writer (new module + two `export` heads) →
542–552 serial fixed-source checks (parent) → 553-R review KEEP → this commit.

## Committed identity

- `src/core/promiseCapacityOwners.ts` (new, 198 lines) SHA256
  `2f6af5c706d8680f0ab184e1069e0fde854c8ff8df2111861720f41454aca390`.
- `src/core/promises.ts` SHA256 `0ce9ab0334ae0114cf576021dd34b27f34ce451021cddc2ec322b07de1c2360a`
  (lines 548 and 555: `export` + `Pick<ProfessionalPromiseV30,'predicate'>`; zero body change).
- Protected patch over base `e790b5c7` = `8910c27482ce3d090a0187fb06529c4bf7b6b2fe5350ed965cbbc33b19ff3daf`,
  identical in all of 542–551 and re-verified immediately before this commit.
- RED `tests/p14b4-owner-adapter-first-slice.test.ts` unchanged (`07d1ad47…754b`, installed at 540).

## Verification (record 541 table; all fixedSource:true)

542 RED 33 PASS · 543 Ready 17 PASS + sole original stale FAIL (:234) · 544 Started 28 PASS ·
545 root+UI typecheck PASS · 546 adjacent 203 PASS · 547 bridge tsc sole OLD TS2353 · 548 facts 7
PASS · 549 live-P2/kernel 110 PASS / 83 FAIL, failing set and every reason line byte-identical to
536 · 550 B1/B2/B3 + bridge consumers 132 PASS / 2 FAIL / 2 todo · 551 historical saves 137 PASS ·
552 the two 550 failures reproduced on CLEAN HEAD (pre-existing). 636 focused passes plus the
identical 110/83 set; not a whole-suite pass; no Owner-acceptance claim.

## Record-only items carried (553-R; none requires a hunk for KEEP)

1. Digest `limits` key order is caller-owned (module :167 spread): either re-literal `limits`
   in a fixed order (one hunk) or make single-site construction a live-wiring rule.
2. A rival-issuer draft naming an already-met bound root maps ALREADY_MET → REASONABLY_ACHIEVABLE
   (kernel checks `remaining === 0` before coverage); the live slice must gate rivals BEFORE the
   adapter (537-A §3 item 4; 539 §1).
3. The adapter tolerates a named root whose issuer/beneficiary differ from the draft (RED 13
   relies on it); live constructors copy from the root; no check in this slice.
4. Negative window edges pass the adapter and are refused by the kernel (fail-loud either way).
5. Rival-branch tariff omits P + A versus the literal formula; unpinned, negligible.
6. Dangling `promiseId` throws; unreachable from lawful state; document at live wiring.
Plus, from 541: the pre-existing B1/B2 control drift (`p14b1-trust-chooser` test 6,
`p14b2-fixture-preconditions` poaching fixture) fails on clean HEAD; attribution owed separately.

## Next (bounded)

- Attribution of the pre-existing B1/B2 control drift (two natural-chain pins) by a bounded
  bisect over the two files, without touching this worktree's HEAD; then either a test-author
  reconciliation (if a later law lawfully moved the outcome) or a defect record.
- Enumerator slice (13 architecture, second clause): design note → review → RED → writer; its
  certificates on history-bearing fixtures are gated by D2 (Ready admission bill), so the design
  must say which fixtures can reach PROVEN_* under the current hypothesis.
- Replay reductions C1/C5–C7 remain the parallel track; D1 (537 §3), D2 (538-C §2) and 515 §6 stand.

## 3. Verbatim contract-auditor hand-back (553-R)

As returned, unedited.

```text
# 553-R — independent READ-ONLY review of the landed owner-adapter first slice

**Status: DONE (read-only).** Verdict **KEEP**. No file created or edited, no command run, no Git, no network, no delegation. Every "PASS/FAIL" number below is read from the parent's record-check captures, not re-executed by me.

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. lean-ctx MCP tools named in the user CLAUDE.md were not available; Read/Glob/Grep only.

**Candidate identity as read:** `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwners.ts` (198 lines, read whole); `/Users/zacheryspector/The-Movies-headless-program/src/core/promises.ts` :170-289 and :535-580. I cannot compute SHA256 or run `git diff`; the two SHA256s and the protected patch `8910c274…` are the parent's/writer's, and every 54x JSON I grepped carries `testedDiffSha256 8910c274…`, `sourceSha e790b5c7…`, `untrackedSource ["src/core/promiseCapacityOwners.ts"]`, `fixedSource: true`.

## Sources read (line ranges)

- Module under review: whole. Writer hand-back `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/541-W-report.md` whole.
- RED `tests/p14b4-owner-adapter-first-slice.test.ts` 1-782 (whole).
- Records: `evidence/p14b4-20260919/539-owner-adapter-first-slice-design-review.md` 1-402 (whole: §1-§3, 539-A, 539-B Q1-Q10, defects); `540-owner-adapter-red-installed.md` whole; `26-live-cutover-implementation-map.md` 1-80 (§1-§2); `23-capacity-first-red-disposition.md` whole; `evidence/p14bf2-20260919/13` and `14` whole; plan `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` :60-139, :205-329.
- Source: `src/core/promiseCapacityKernel.ts` :1-190 (types, MAX_LIMITS :117, overlapWindow :162-165, Budget :168-186), :260-300 (normalizeBase target/prior/debit invariants), :495-520 (validateTraces tail, :511), :925-1047 (classifyDomain, runCapacity, exports); `src/core/promises.ts` :170-289 (PromiseDraft :189-202, receipt :211-218, activePromiseReservations :274-283, :287), :535-580 (the two exported helpers :548-569), :366-431 (grep: promiseFeasibility/reclassifyPromise draft construction); `src/core/types.ts` :2120-2254, :2067-2070; `src/core/hollywoodTypes.ts` :120-139; `src/core/math.ts` :85-98; `src/core/promiseCapacityOwnerReplay.ts` :66-120, :2674-2681 (grep: result types, cap invariant); `src/core/talentMarket.ts` :754-772 (grep); `tests/p14b4-ready-replay-first-take.test.ts` :305-330.
- Evidence: 542-552 `.txt` summary/file-header/failure lines (grep), all 83 `×`/`→` lines of 549 (read), 536 file headers and totals (grep), 547 diagnostic line, 545 error grep (none), 552 whole failure block; 54x/552 `.json` identity fields (grep). Repo-wide grep for importers of the module and for `promiseCastSlots|qualifyingTakes`, `Object.keys(promiseModule)`, `import * as … from '../src/core/promises.js'`; `src/core/index.ts` grep for the three capacity modules; test roster glob for `p14b1/p14b2/p14b3/p14bf2/bridge-p14b1/bridge-p14b3`.

## Answers

### 1. Law fidelity — MET WITH EVIDENCE (KEEP)

Each 539 §1 clause against `promiseCapacityOwners.ts`:

- B3 membership + kernel-identical overlap: :113 `attached = new Set(state.talentMarket.proposals.flatMap(p => p.promises))`; :115 `from = Math.max(now.week, window.startWeek)`; :118-121 `outcome === null && (contractId !== null || attached.has(promiseId)) && promiseId !== draft.promiseId && dueWeekExclusive > from && windowStartWeek < window.dueWeekExclusive`. This is `activePromiseReservations` promises.ts:277-282 minus the :280 beneficiary filter, and is byte-equal in effect to kernel `overlapWindow` :163-164 with `now = claims.now`, `target = draft window`, the same values `normalizeBase` :280 checks, so every emitted prior survives the kernel's `prior must overlap the relevant target interval` invariant; :278 (`issuerId === input.issuerId && promiseId !== target.promiseId`) holds by the :128 branch and :120 self-exclusion.
- Same-issuer ANY beneficiary → PriorClaim: :128-131 (no beneficiary test). Other-issuer target-person-only → ForeignDebit: :132-133; other persons fall through with no push (dropped). Plan :94-95, :258-263.
- Mask by shape: :131 `mask: promiseCastSlots(promise)`, :103 `mask: promiseCastSlots(draft)`.
- `remaining`: :130 `membership === 'bound' ? Math.max(0, count - qualified(promise)) : count`; foreign :133 `remaining: promise.predicate.count`. 539-B refinement 3 exactly. Zero is emitted (no filter on remaining; RED 5 second half pinned, 542 PASS).
- Zero-demand exclusion: :124 `if (windowStartWeek >= dueWeekExclusive || count < 1) continue`, no omission (RED 6).
- Target: :101 `boundRoot = named !== null && named.contractId !== null ? named : null`; :104-105 `state: boundRoot === null ? 'unbound' : 'bound'`, `actualQualifiedCount: boundRoot === null ? 0 : qualified(boundRoot)` (qualifyingTakes on the ROOT, per 539-A).
- Malformed target before the rival guard: :92-94 (window nonempty safe-integer, count safe-integer >= 1) precede :108. Both messages contain `target` (RED (v)).
- Rival guard never throws: :108-112 returns `{ priorClaims: [], foreignDebits: [], coverage: { claimsAndHolds: 'incomplete', omissions: [RIVAL_OMISSION] } }` for `hollywood === null || issuerId !== hollywood.playerStudioId` (`playerStudioId` hollywoodTypes.ts:131).
- `now`: :98 `{ week: state.market.tick, step: 0 }`.
- `horizonEndWeek`: :139 reduce over `priorClaims` only, seeded with target due; foreign windows excluded (539-B Q4 clarification 2; RED 3 :449).
- Sorted by `<`: :82 `compareText` identical to kernel :138; :136-138 priors, debits, claimPersonIds.
- Tariff: :142 `1 + state.promises.length + attachedCount + scans * takes`, `scans` incremented per `qualifyingTakes` call at :100 (bound target + bound local priors), `attachedCount` :114 = Σ `proposals[].promises.length`, `takes` :107 = `firstTakes.length`. This is 540 choice 1 exactly; RED 1/3/5/14 pin it (542 PASS).

### 2. Assembly and coverage — MET WITH EVIDENCE (KEEP)

:153-157 splits attempts into `traces` and `cuts` as `${attempt.reason}: ${attempt.detail}`. :161 `complete = claims complete && cuts.length === 0 && producer.omissions.length === 0`. :162 omissions = `[...new Set([...claims.coverage.omissions, ...producer.omissions, ...cuts, NO_ENUMERATOR_OMISSION])].sort(compareText)` (sorted unique; RED 8 :573-574). :166 `existingCalendars: 'incomplete', allOwnerTraces: 'incomplete'` unconditionally. :165 `traces`, `fixedHolds: producer.fixedHolds` by reference, no clipping (RED 7 :551). :160 horizon guard `invariant(traces.length === 0 || horizonEndWeek >= claims.horizonEndWeek, HORIZON_GUARD)`: throws only with a complete trace AND a short horizon, exactly as adopted (539 §1 "with any complete trace"); RED 15 both halves. :167 `preparationWork: producer.preparationWork + claims.work`. The target window :91 is the draft window untouched and is never rewritten anywhere (no `windowClipped`). RED 7's `toEqual(hand)` against the first-take hand assembly (:314-321) with derived coverage: 542 PASS.

### 3. Digest — MET WITH EVIDENCE; writer decision 8 acceptable (record-only note)

:174-175 `const { preparationWork: _bill, ...identity } = input; return fnv1a64(JSON.stringify(identity))`. `preparationWork` is the ONLY excluded key; the rest of the assembled literal (:164-167) is `mode, now, horizonEndWeek, issuerId, target, priorClaims, foreignDebits, traces, fixedHolds, coverage, limits`, all included; RED 12 pins `preparationWork ± 1` same digest, `limits`/`coverage` change different digest (542 PASS). Top-level key order is fixed by :164-167; `target`/claims/coverage/`now` are module-built with fixed literal order; traces/holds are producer-built (deterministic). The same primitive as `receipt()` promises.ts:217 and `proposalDigest` :184, both of which are also construction-order sensitive. Plan :73-76 governs WHAT the digest covers/excludes, not canonical form, so no defect. Residual weakness, record-only: `limits` is spread by reference (:167), so its key order is the caller's; two live call sites constructing `limits` in different literal orders would digest the same question differently. Optional one-hunk refinement (safe under RED 7's `toEqual` and RED 12/14): at :167 re-literal `limits: { claims: limits.claims, units: limits.units, alternatives: limits.alternatives, work: limits.work, span: limits.span }`. Not required for this slice (the digest has no persisted consumer yet); alternatively make it a construction rule for the live slice.

### 4. Mapping — MET WITH EVIDENCE (KEEP)

:182-184 CERTIFIED_ACHIEVABLE and ALREADY_MET → `REASONABLY_ACHIEVABLE`, `bottleneck: null`. :185-186 PROVEN_FRAGILE → FRAGILE with `FRAGILE_BOTTLENECK[result.reason]` (:29-32, two distinct strings, verbatim 539-A table). :187-188 PROVEN_IMPOSSIBLE → IMPOSSIBLE with `IMPOSSIBLE_BOTTLENECK[result.reason]` (:33-36) and `kernel: { ...kernel, scope: result.scope }`. :189-190 UNCERTIFIED (all three reasons; the switch is on status only) → FRAGILE with `UNCERTIFIED_BOTTLENECK` :24 = `'bounded capacity analysis could not certify this schedule'`, byte-equal to plan :125-126, nothing appended (RED 10 :702 also pins no omission text inside it). `bottleneck null iff REASONABLY_ACHIEVABLE` holds by construction (both lookups are total over the kernel's typed reason unions, kernel :68-71). Result type :68-77 has no `rulesVersion`/`week` (RED 10 :690-691). `kernel` :179-180 = `{ status, reason: 'reason' in result ? result.reason : null, workUsed, omissions: copy or [] }`. The four PROVEN_* strings name no class, seat, window or count (plan :214-215). The switch is exhaustive over the five statuses (no default; root typecheck 545 clean).

### 5. The nine writer decisions — all lawful; none a defect

1. Dangling `promiseId` throw (:95-96): stricter than B3's silent exclusion, but `PromiseDraft.promiseId` doc (promises.ts:199-201) reserves it for an already-minted root, both live constructors copy it from a root (`reclassifyPromise` :429, `attachedFeasibility` talentMarket.ts:770), and roots are never deleted (RED 2 :383 shows a withdrawn root persists), so it is unreachable from lawful state; fail-loud precondition, lawful. Record at live wiring.
2. Safe-integer window edges refused early (:92-93): consistent with 539-B Q4 clarification 1 and the kernel's `integer()` :146. Record-only: negative edges pass the adapter and are refused by the kernel (`Promise capacity input: … nonnegative`), still fail-loud.
3. Rival branch contents (:109-111): target still built (539 §1 pins only the lists/coverage/omission; RED 13 pins `issuerId`); `work: 1 + scans * takes` charges only what was scanned. Lawful; a literal reading of `1 + P + A + M×T` would add P + A, unpinned and negligible. Record-only.
4. `scope` only on PROVEN_IMPOSSIBLE (:75, :188): exactly 539 §1 / 539-B Q5 optional item; RED 11 pins presence there.
5. PROVEN_* wordings verbatim from 539-A's table (:30-35): routine under 539-B Q5; plan :300-302 requires only the PRESENCE of a distinct prior-path-protection bottleneck (RED 10 :698). `certifiedUpperBound` mapped though not emitted today: harmless totality.
6. Tariff accounting: see Q1; matches 540 choice 1.
7. Module-private `RIVAL_OMISSION`/`HORIZON_GUARD` (:27-28) with the RED carrying its own copy (:50): forced by RED 11's exact 7-export pin; drift cannot be silent because RED 13 :738/:740 pins the exact string and RED 15 :754-755 the guard regex. Acceptable.
8. Key-order-sensitive digest: see Q3; acceptable, optional refinement.
9. Zero-demand exclusion after the overlap test (:124): order-independent, exact, no omission. Lawful.

One further behaviour the writer did not list, record-only, not a defect: because kernel :1028 (`remaining === 0 → ALREADY_MET`) precedes :1029 (coverage check), a rival-issuer draft naming a bound root whose takes already meet its count classifies REASONABLY_ACHIEVABLE/ALREADY_MET, not FRAGILE. Truthful under plan :276-277, and 539 §1's rival clause is satisfied at the claims level, but 539-A 1.7's "rival → FRAGILE" is the typical path, not the always path. The live slice must gate rivals BEFORE the adapter (537-A §3 item 4), which 539 §1 already requires. Related: the adapter does not check that the named root's issuer/beneficiary match the draft's; RED 13 relies on that tolerance (`rootDraft` with `issuerStudioId: rivalId`), so no check should be added in this slice.

### 6. Purity and isolation — MET WITH EVIDENCE

No input mutation: `priorClaims`/`foreignDebits` :116 are module-local before `.sort` :136-137; :138 sorts a fresh spread; :162 sorts a fresh spread; :153 `traces`/`cuts` local; :180 copies `result.omissions`; :188 spreads; :174 rest-destructures without touching `input`; `producer.fixedHolds`/traces copied by reference only (no writes). No `Date`, `Math.random`, I/O. Imports :14-21: `./math.js` (fnv1a64), `./promises.js` (two runtime helpers + `type PromiseDraft`), `./promiseCapacityKernel.js` (`searchPromiseCapacityTraces` + types), `import type … from './types.js'`. Nothing from actions/tick/queueAdmission/hollywoodTick/talentMarket/replay (13 :18-19). Repo-wide grep for `promiseCapacityOwners` in `**/*.{ts,tsx,js,mjs,cjs,json}`: only the RED (:28, :33) and the 54x evidence JSONs; no importer in `src`, `bridge`, `ui/src`; `src/core/index.ts` has no reference to any of the three capacity modules. Runtime exports are exactly the seven adopted names (`export const` :24, :26; `export function` :90, :151, :173, :178, :194); all other bindings are `const`/`function` without `export` or `export type`; RED 11 :711-712 pins `Object.keys(ownersModule)` at runtime (542 PASS). RED 14's structuredClone pins (542 PASS) are the observed no-mutation evidence.

### 7. The `promises.ts` change — MET WITH EVIDENCE (within my means)

:548 `export function promiseCastSlots(promise: Pick<ProfessionalPromiseV30, 'predicate'>): readonly CastSlot[] {`, body :549-553 (`'kind' in` narrowing, `CAST_SLOTS` else `['lead']`/`['lead','antagonist']`); :555 `export function qualifyingTakes(` with :556-558 params and :559-568 body (issuer match, half-open window, mask, distinct productionIds) as 26 §1 :27-34 specifies. The two heads sit at the same line numbers the brief names (:548/:555) and the :611 caller and :274-283 B3 helper are at their recorded lines, so no line above or between them moved. `ProfessionalPromiseV30`/`GameStateV30` were already imported (:33). `Pick` is erased at runtime and the body's `'kind' in` narrows the same union; `export` adds two namespace keys and cannot reroute any internal call (the material test's `vi.spyOn(promisesModule, 'advancePromisesWeek')` :268 is unaffected; 549 shows material 17 PASS). No test pins `Object.keys(promiseModule)` (grep: none). Limit: I cannot diff against HEAD; the writer's `git diff --stat` (2+/2-) and the parent's protected patch hash are the byte-level evidence.

### 8. Evidence sufficiency — complete against 539 §3; attribution correct; no masking possible

539 §3 check list vs captures: RED GREEN (542: 33/33) · kernel 41, hold-order 5, stable-sort 7, d3-matching 8, material 17 (549) · sort-owners 7 (546) · Ready 17 PASS + sole stale FAIL `expected 'workLimit' to be 'commandRefused'` (543) · Started 28 (544) · `p14b1-*` all six files, `p14b2-*` both, `p14b3-*` both, `bridge-p14b1-promises` 11, `bridge-p14b3-promise-command` 19 (550; roster glob confirms nothing omitted) · `p14bf2-*` sole file acting-discipline 13 (546) · twelve historical save files 137 (551) · six B4 live-P2 groups (549) · root+UI typecheck exit 0 with no `error TS` line (545) · bridge tsc exit 2 with the sole `bridge-p14b4-cast-class.test.ts(364,20): error TS2353` (547). Extras beyond the list: 546's other adjacent files, 548 facts/lookup 7. No missing group.

549 vs 536: per-file pass/fail counts identical (capacity-kernel 41 ✓; bridge-cast-class 16/28; cast-class-capacity 15/15; cast-class-policy 3/7; runtime47 4/6; cast-class-outcomes 23/23; save-v30 22/36; totals 83 failed / 110 passed / 193). I read all 83 `→` reasons in 549: V29 validator `predicate.kind is not a field` (8), `expected 3 to be 4` rulesVersion (7), `expected 29 to be 30` LIVE_SAVE_VERSION (12 + 22 save-v30 `saveVersion: 29`), `expected 46 to be 47`/`null to be 4`/spy (4), wire-grammar/envelope (11), D3 `{count:1}` vs tagged (3), `UNEXECUTED natural rival prerequisites` (8). Every stop point is a version/validator/wire gate upstream of any `promiseCastSlots`/`qualifyingTakes` call, and masking is impossible by construction: the only `src` change outside the unimported new module is two `export` keywords plus a type annotation. I did not byte-compare 536's reason lines myself; that identity is the parent's claim.

552: `testedDiffSha256 e3b0c442…` is the empty-string SHA256 (no patch, clean HEAD), `fixedSource: true`; the same two cases fail with the same reasons (`p14b1-trust-chooser` test 6 `expected 'studio-…-player' to be 'studio-…-r04'`; `p14b2-fixture-preconditions` `expected null not to be null`). Correctly attributed as pre-existing natural-chain pins in B1/B2, untouched by this slice.

### 9. Overall — KEEP

No blocking defect. No Owner-gated surface touched: no `PromiseFeasibilityReceipt`, no `rulesVersion`/`week` (:67 comment, :68-77 type), no Save/projection/index change, no kernel or producer edit, no test/fixture edit, `promises.ts` body byte-unchanged at the two heads. Lawful under 13 (:12-19 pure adapter, no higher-level owner imports), 14 (no second allocator, no completeness claim: :166 always-incomplete calendars/traces), 26 §1 (shared helper exported, not duplicated), 23 (no rules-literal bump, no test loosening), D1/D2 untouched.

## Defects and observations

Blocking: none.

Record-only (no hunk required for KEEP; each with the governing line):
1. Digest `limits` key order is caller-owned (:167 spread) — optional one-hunk re-literal, or a live-slice construction rule (plan :73-76 satisfied either way; types.ts:2163-2164 identity is only at risk across differently-ordered call sites).
2. Rival-issuer draft on an already-met named root → ALREADY_MET/REASONABLY_ACHIEVABLE (kernel :1028 before :1029); rival gate must precede the adapter in the live slice (537-A §3 item 4). Unpinned by RED.
3. Adapter tolerates a draft whose `promiseId` names a root with a different issuer/beneficiary (RED 13 depends on it); live constructors copy from the root. Do not add a check in this slice.
4. Negative window edges pass :92-93 and are refused by the kernel :146; fail-loud either way.
5. Rival-branch tariff omits P + A (:111) versus the literal formula; unpinned, negligible.
6. Dangling `promiseId` throws (:96); unreachable from lawful state; document at live wiring.

## Evidence limits

Nothing executed or hashed by me; counts and exit codes are read from the parent's captures. Byte-identity of 549 to 536 verified at file-count level and by reading 549's reasons, not by diffing 536's lines. Ready-producer trace CONTENT independence from cash/ledger rows is not demonstrated in this slice (RED 12 routes cash/RNG through the Started producer only; on `opened` the Ready producer saturates) — 539-B Q6 already carries the Ready bill question to D2, and the digest excludes the bill. TypeScript narrowing statements are by reading plus the 545 exit code. No native, usability, Save30, projection47 or Owner-acceptance claim.

## Next concrete action

Parent records 553-R as KEEP, stages exactly the two candidate files for record 541's commit, and carries the six record-only items into the enumerator-slice brief (items 1-2 as explicit live-wiring requirements: single `limits` construction site or canonical re-literal; rival gate before the adapter). No further change to the candidate is required before commit.
```
