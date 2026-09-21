# 600-T — test-author reconciliation (RED on unchanged source)

Status: DONE (tasks a, b, c edited and run; d inventoried, report only). Source identity
unchanged: HEAD 5e6ac5dc, `git status` shows only the four modified test files and one new
test file. No production, fixture, cap, timeout, config or package edit. No git state change.

Artifacts (scratchpad = /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad):
- 600-T.patch (git diff -- tests/, sha256 abf28d67…), 600-T-status.txt, 600-T-new-evaluator5.test.ts (copy of the untracked new file, sha256 07edb3ca…)
- 600-T-run1.log (B-F2 + B3), 600-T-run2.log (capacity live + evaluator5), 600-T-run3.log (trust-chooser), 600-T-run4-typecheck.log (npm run typecheck, exit 0, 66 s)
- File hashes after edit: p14bf2 ff0ab211…, p14b3 038851bf…, capacity 3910145d…, evaluator5 07edb3ca…, trust-chooser 42807a56…

## Per-file changes (post-edit line numbers)

### tests/p14bf2-acting-discipline.test.ts
- :5-11 header note added (record 600 / D1 (a); B-F2 evidence at 3 kept; only fresh reads use 4; classifications/bottlenecks/digests/fixtures untouched; residual-buffer movements go to 600 §3 2(d)).
- :97 title `uses evaluator3 for the eligibility correction` → `pins the live evaluator generation: 4 after record 600 (B-F2 landed the eligibility correction at3)`; :98 `toBe(3)` → `toBe(4)`.
- :120 (was :113) `rulesVersion: 3` → `4` (fresh promiseFeasibility).
- :133 (was :126) `rulesVersion: 3` → `4`.
- :151 (was :144) `rulesVersion: 3` → `4`.
- :193-194 (was :186-187) `version: 3` / `rulesVersion: 3` → `4` (fresh attach).
- :198 (was :191) `rulesVersion: 3` → `4` (freeze receipt at windowStartWeek, fresh on current law).
- :234 (was :227) `version: 4` — the kept root is the SAME root minted by `attach(opened, …)` at :191 in the same test (FRESH on current law, not loaded), so it moves.
- :291 describe title `fresh evaluations use3` → `use the live evaluator (4 after record 600)`; :311 it title `under3` → `under4`; :325 (was :318) `toBe(3)` → `toBe(4)`; :332 (was :325) `version: 3` → `4`.
- UNCHANGED historical pins: :271 `promiseRulesVersion: 1`, :284-285 `version: 1` / `rulesVersion: 1` (genuine evaluator-1 fixture).

### tests/p14b3-rule-revision.test.ts
- :90-95 header note added under the existing :87-89 B-F2 note (same pattern; B3 revision2 and B-F2 evaluator3 evidence kept).
- :96 describe title `under B-F2 evaluator3` → `under the live evaluator (4 after record 600)`; :98 (was :92) `toBe(3)` → `toBe(4)`.
- :129 (was :123) title `root.version3 and receipt.rulesVersion3` → `root.version4 and receipt.rulesVersion4`.
- :144-147 (was :138-141) `version: 3` → `4`, `rulesVersion: 3` → `4`; every other field kept.
- :155 (was :149) title `rulesVersion3 receipt` → `rulesVersion4 receipt`; :180 (was :174) `rulesVersion: 3` → `4` (freeze receipt).
- UNCHANGED historical pins: :61 `promiseRulesVersion: 1`, :77 `version === 1 && rulesVersion === 1`, :112-113, :195-196 (old root/receipt stay 1).

### tests/p14b4-cast-class-capacity.test.ts
- :201 shared pureRead `rulesVersion 4` pin: UNCHANGED.
- :247 comment inserted above the `if (eligible) expect(read.bottleneck).not.toBe(UNKNOWN_CAP)` (assertion unchanged, now :248).
- :261 comment inserted above `expect(result.bottleneck).not.toBe(UNKNOWN_CAP)` (assertion unchanged, now :262).
- :281-287 the it(...) `a conflicting fixed lead claim makes the joint offer impossible, not a target-specific BROKEN winner choice` (HEAD :279-288) REMOVED and replaced by a comment citing record 600 §3 step 2(b) and the new file.
- :358 comment inserted above `expect(read.bottleneck).not.toBe(UNKNOWN_CAP)` (assertion unchanged, now :359).
- Premise-only expectations left exactly as written (537-B §3): :294 baseline `REASONABLY_ACHIEVABLE` on `opened`; :246 `FRAGILE`/`IMPOSSIBLE` matrix with :248 certified bottleneck. 537-A §3 says the evaluator-4 scalar satisfies them by paper (matrix eligible → nMax 1, X 1 > 0 → FRAGILE 'no spare picture'; ineligible → no masked event → IMPOSSIBLE; opened → nMax 5, existingPath ≥ 2, slack 35 → ACHIEVABLE).

### NEW tests/p14b4-cast-class-capacity-evaluator5.test.ts (248 lines)
- Header names record 600 §3 2(b), D1 (a), the disposition, and why helpers are copied.
- Copied VERBATIM from HEAD's live file: SLOTS/CLASSES/p1/p2/Material/World (:22-35), live/root/currentRoot/sign (:38-62), readyScript (:63-86), cached+world() (:87-188), pureRead (:196-204, pin `rulesVersion 4` kept), shortVariants/shortDraft (:205-232). Not copied (unused here): UNKNOWN_CAP const, offerDraft, withdrawProposal/attachedPromiseDigest/promiseDigest imports.
- describe `P14B4 evaluator-5 kernel vocabulary (record 600 §3 2(b)): the joint certificate the scalar cannot issue`:
  - LIVE it(...) with the moved case body verbatim (HEAD :279-288).
  - it.todo: evaluator-5 certified-bottleneck intent (a FRAGILE fixed-cast read carries a CERTIFIED bottleneck from a complete-domain bounded search, never the UNCERTIFIED string as a guessed scalar maximum), naming the three `!== UNKNOWN_CAP` lines as by-construction at evaluator 4.

### tests/p14b1-trust-chooser.test.ts (test 6 only)
- :100 import adds `CastRoleCountPredicate` (type-only).
- :296-304 comment block added above the it(...) (record 600 §3 2(c), records 110/554, why P1 is no longer the opportunity, why RED today).
- :391-392 comment; :393 `const predicate: CastRoleCountPredicate = { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' }`; :394 `expect(marketModule.publicPreferredOpportunity(common, talentId)).toBe('significantCastRole')`.
- :395 attach draft `{ family: 'APPEARANCE_COUNT', predicate: { count: 1 }, …}` → `{ family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate, …}` (same window 208..415).
- :398 `expect(promised).toMatchObject({ family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate })`; :399 `expect(marketModule.promiseMatchesPreferredOpportunity(treated, talentId, promised)).toBe(true)`.
- Title, seeds, weeks, the 1-1 compensation-vs-incumbency shape, the three nonpair IMPOSSIBLE P1s, the settle observer and the winner assertions (:438-441 meaning: incumbent wins with the opportunity reason) are unchanged. Timeout 60_000 unchanged.
- Class choice: `leadOrAntagonist` — either tagged class satisfies D3 (`promiseMatchesPreferredOpportunity`, talentMarket.ts:728-737); the flexible class is what 537-B G9 has rivals author first for an unproven person.

## @ts-expect-error / type-RED lines
NONE. The typed local `predicate: CastRoleCountPredicate` is assignable to today's `PromiseAttachment.predicate: { count: number }` (excess-property checking applies only to fresh object literals) and to the post-cutover `{ count } | CastRoleCountPredicate` union; no cast, no directive, nothing to remove after the cutover. `npm run typecheck` (root + UI, includes tests/**) exit 0.

## Runs (all one at a time, no watch, fixed source 5e6ac5dc)

### Run 1 — vitest run --project core tests/p14bf2-acting-discipline.test.ts tests/p14b3-rule-revision.test.ts (600-T-run1.log, 6.34 s)
19 tests: 9 failed / 10 passed. Every failure diff is ONLY the version literal (Expected 4 / Received 3); nothing else moved.
- p14b3 > pins the new evaluator generation independently of unchanged Save29/projection46 — :98 `expected 3 to be 4`
- p14b3 > new actual attachment uses root.version4 and receipt.rulesVersion4 without rewriting old roots — :144 (version 3, rulesVersion 3)
- p14b3 > actual later winning freeze keeps old root.version1 but stores genuine new rulesVersion4 receipt and binding — :180 (rulesVersion 3, week 52)
- p14bf2 > pins the live evaluator generation: 4 after record 600 (…) — :98
- p14bf2 > a lawful non-primary actor receives an achievable P1 and the pure read changes no state or labels — :120 (rulesVersion 3, week 71, ACHIEVABLE)
- p14bf2 > unknown beneficiary refuses without treating a made-up identity as a cast participant — :133
- p14bf2 > missing acting profile refuses and changes eligibility digest at identical week (INVALID PURE PROBE ONLY) — :151
- p14bf2 > real winning writer P1 binds, then one completed scheduled cast take satisfies it with exact durable references — :193 (version 3 / rulesVersion 3; the later :198 and :234 pins are unreached today)
- p14bf2 > actual resubmit/attach evaluates afresh under4 but keeps the original version1 refusal untouched — :325
Passing (10): the three B3 genuine-bytes cases, B-F2 writer-cast-as-lead, the four `preserves unrelated %s refusal` controls, the reservation/withdrawal case, the B-F2 old-refusal valid-load case.

### Run 2 — vitest run --project core tests/p14b4-cast-class-capacity.test.ts tests/p14b4-cast-class-capacity-evaluator5.test.ts (600-T-run2.log, 7.21 s)
16 tests: 15 failed / 1 todo.
- Live file 14 failed = the 536/record-23 set minus the moved case, stop points unchanged: 7 at strict live V29 `validateSaveV29: state.promises[n].predicate.kind is not a field of this record` inside shortVariants (six matrix cells via :241; joint lead+flexible+P1 via :257) and 7 at pureRead `expected 3 to be 4` (revise/withdraw :292, nonoverlap :312, digests :326, three huge-count :355).
- Evaluator-5 file 1 failed: the moved case stops at the same V29 `predicate.kind` refusal (:238 shortVariants); 1 todo.

### Run 3 — vitest run --project core tests/p14b1-trust-chooser.test.ts (600-T-run3.log, 16.91 s)
13 tests: 1 failed / 10 passed / 2 todo. This equals the record-101 shape for this file (`13 tests | 1 failed | 2 skipped`). The task text's "22 pass / 1 fail / 2 todo" is not this file: 595's `22 passed` is tests/bridge-p14b2-trust.test.ts.
- FAIL test 6 `opportunity changes the winner of an otherwise compensation-versus-incumbency 1-1 tie, with two real surviving proposals` — stops at :398: the persisted root is `predicate: { count: 1 }` (Expected kind 'castRoleCount' + seatClass 'leadOrAntagonist'; the live attach copies only count, promises.ts:495). Family did copy. This is the migrated expectation's honest stop point; :405 ACHIEVABLE would fail next today (NOT_OFFERED_IN_B1 → IMPOSSIBLE).

### Run 4 — npm run typecheck (600-T-run4-typecheck.log): exit 0, 66 s.

## Evaluator-5 disposition (task b)
LIVE it(...) (not it.todo), designated failure until evaluator 5. Reasons: (1) the body is executable and verbatim, so a future writer never rewrites it; (2) the separate file cannot alter the live file's counts (vitest registers cases per file; the helpers are copied, not imported, to avoid registering the 14 live cases twice); (3) the copied pureRead keeps `rulesVersion 4` so that after the cutover the failure lands on the informative assertion (scalar FRAGILE 'no spare picture' vs expected IMPOSSIBLE) instead of on a version literal for an undesigned evaluator (D2 (i-c): revisit when evaluator 5 is designed; 537 §3 (a): "the capacity pin moves at 5"). Reconciling that pin to 5 is a future test-author step from evidence.

## (d) Inventory — fresh P1 classifications read through the residual buffer (report only, no edits)
Law of movement: the cutover changes the buffer test from `X > nMax − buffer` to `reserved + X > nMax − buffer`; the existing-path test already uses `reserved + X`. A verdict can move only when the beneficiary has ACTIVE reservations at read time (bound or current-attached, overlapping window, not self-excluded). Windows of 40 weeks: nMax 5, buffer 2, threshold 3; 52 weeks: nMax 6, buffer 2, threshold 4; 207 weeks: nMax 26, buffer 7, threshold 19. ACHIEVABLE→FRAGILE needs reserved+X > threshold AND existingPath ≥ reserved+X; a FRAGILE bottleneck string can change ('needs a picture not yet commissioned' → 'the schedule leaves no spare picture') when reserved+X > threshold.

| file:line | fixture / world | expected | active reservations at read | paper verdict |
|---|---|---|---|---|
| p14bf2:120-121, :142, :177 | B-F2 fixture (generated studio, lead=writer, proposal at start-7, 40-wk window) | ACHIEVABLE | none (:68 asserts no promises for lead) | unchanged |
| p14bf2:178 (count 2) | same | FRAGILE | none | unchanged |
| p14bf2:182 (after attach) | same | FRAGILE | 1 (own current) → 2 ≤ 3 | unchanged (existing-path) |
| p14bf2:183, :186 | self-excluded / withdrawn | == baseline | 0 | unchanged |
| p14bf2:193-194 | fresh attach | ACHIEVABLE | 0 | unchanged |
| p14bf2:198-199 | freeze at windowStartWeek (natural chain start-7 → start) | ACHIEVABLE | self-excluded; rival current attachments to the lead: unknown without execution | unchanged unless ≥3 competing current rival reservations |
| p14bf2:326 | old fixture resubmit, fresh read | not old bottleneck (no class) | 0 (resubmit clears attachment) | unchanged |
| p14b3-rule-revision:144-147 | genuine-v29-evaluator1-current-p1, resubmit + attach at week 45 | ACHIEVABLE | 0 (resubmit clears the old attachment; old root unbound) | unchanged |
| p14b3-rule-revision:180-181 | same fixture, freeze at week 52 | ACHIEVABLE | self-excluded; other issuers' current attachments in the fixture: unknown without execution | unchanged unless ≥3 |
| p14b3-reservations:62,:67,:80,:109,:142,:175,:199 | B3 fixture (actor signed 52, proposal at 45, window 52..92) | ACHIEVABLE | 0 (or self-excluded / released / non-overlapping) | unchanged |
| p14b3-reservations:70-71, :83, :131-132, :146 | after own/rival attach or bound | FRAGILE + /not.*commission/ | 1 → 2 ≤ 3 | unchanged, bottleneck string unchanged |
| p14b3-reservations:186 | rival count 999 window 93..104 | IMPOSSIBLE | n/a (X > nMax) | unchanged |
| p14b1-t4-regressions:93, :108 | legacy-v28-open-case-45 (promises []) | ACHIEVABLE | 0 | unchanged |
| p14b1-t4-regressions:109 | after attach | FRAGILE | 1 → 2 ≤ 3 | unchanged |
| p14b1-t4-regressions:136 | freeze at 52, natural chain 45→52 | ACHIEVABLE | self-excluded; rival authoring 45..52: unknown without execution | unchanged unless ≥3 |
| p14b1-promises:474 | p13aGeneratedStudio week 0, window 0..104 | ACHIEVABLE | 0 | unchanged |
| p14b1-promises:491, :505-506 | openPlayerCase (52-wk window) | ACHIEVABLE then FRAGILE /not.*commission/ | 0 then 1 → 2 ≤ 4 | unchanged |
| p14b1-promises:548, :562 | attach then two greenlights, self-excluded | ACHIEVABLE, FRAGILE | 0 | unchanged (FRAGILE comes from slack/path, not buffer) |
| p14b1-promises:677 | attach, window start..week+30 | ACHIEVABLE | 0 | unchanged |
| p14b1-promises:828 | hand-built record, window 2 weeks | IMPOSSIBLE | n/a | unchanged |
| p14b1-trust-chooser:378, :430 | nonpair count-999 P1s | IMPOSSIBLE | n/a | unchanged |
| p14b1-trust-chooser:405, :458 | incumbent rival tagged P2 (post-migration), window 208..415, week 207/208 | ACHIEVABLE | 0 for the incumbent's own draft (three nonpair drafts are non-overlapping 415..416) | by paper ACHIEVABLE at evaluator 4 IF the rival's existing path does not depend on a non-mask fixed seat (mask lead+antagonist); unknown without execution |
| p14b1-trust-chooser:364 (premise) | after advanceTo 207 | no promises for the subject | natural rival authoring on the five synthetic bids | MAY MOVE under 537-B G9 (unproven → flexible P2 first): if a rival now authors a P2 for this unproven subject, :364 fails and :379's attach would throw 'already carries a promise'. Not a buffer movement; a rival-order movement. Unknown without execution |
| p14b1-trust-chooser:688, :691-696 (test 7 natural scan) | default seed, first natural rival actor proposal | ACHIEVABLE and `family APPEARANCE_COUNT`, `predicate {count:1}` | witness selected by receipt | buffer: unchanged (threshold ≥ 4 for 52-wk+ windows). Rival order (G9): MOVES if the first actor witness is unproven (a flexible P2 would be authored instead of P1). Unknown without execution; reconciliation candidate |
| p14b4-cast-class-capacity:129 (world() premise), p14b4-replay-bill-reductions:139, p14b4-owner-adapter-first-slice:145, p14b4-owner-enumerator-slice:156 | capacity world(): three P1 attaches, 52-wk window, distinct beneficiaries | ACHIEVABLE | 0 per beneficiary | unchanged |
| p14b4-cast-class-capacity:294 (premise) | opened, tagged P2 lead, 40-wk | ACHIEVABLE | 0 | unchanged (537-A §3 paper) |
| p14b4-cast-class-outcomes:325, :328; p14b4-cast-class-policy:234 and ACHIEVABLE constants | B4 live-P2 RED (536 set) | as installed | — | outside this reconciliation; the installed 83-case RED stays the cutover's RED |
| tests/helpers/p14b2-fixtures.ts:36 (proposePromise) | player P1, 40-wk | no classification asserted in the helper; consumers assert binding | 0 typically | unchanged |
| bridge-p14b1-promises:284,:337,:354-355,:372,:385,:396; bridge-p14b3-promise-command:110,:113,:229-232,:265,:269,:305,:329,:458,:468; bridge-p14b4-cast-class:220,:266,:443; bridge-p14b2-trust:409 | bridge suites | as written | — | OUTSIDE my writable set; report only. bridge-p14b3 :229 'FRAGILE existing one-path capacity' count 2 and :269 FRAGILE after a base revision are the bridge analogues of the B3 rows above (paper: unchanged) |

Net: by paper NO assertion in tests/ moves from the residual buffer alone on these fixtures; the only "unknown without execution" rows are freeze receipts on natural chains where competing rival current reservations would have to reach 3 or more. The real natural-chain movers are the G9 rival-order change (trust-chooser test 7 :691-696 and possibly test 6 :364), not the buffer.

## Additional certain post-cutover movement NOT in my scope (no edits; parent decision)
`validateSaveV29(makeSave(...))` / `exportSave(makeSave(loaded.state)) toBe(raw)` in the regression controls will throw `validateSaveV29: expected version 29` once `makeSave` emits V30 (save.ts:8607): p14bf2 :69 (inside fixture(), so EVERY B-F2 case), :109, :241, :303, :336; p14b3-rule-revision :109, :151, :193; p14b3-reservations :94, :134, :177, :201; p14b1-promises :503; tests/helpers/p14b2-fixtures.ts :122, :210, :225 (shared by the p14b2/b3/b4 natural-chain suites); plus the older controls c2a-m2-sets-save :292, construction-core :505/:664, p09a :214, p13a-causal-core :49/:91, p13b-s2 :196 and bridge-p14b2-trust :275/:412, bridge-p14b3 :35/:133 (28 sites). Precedent: commit 6948e31 "live-version sweep 28 -> 29 (pins only)". The two raw-bytes premises (p14b3 :109, p14bf2 :303: `exportSave(makeSave(loaded.state))` byte-equal to the V29 raw) need an explicit re-derivation at the sweep, not a literal bump. These are save-cutover reconciliations, not rules-3 pins, so I left them untouched per the (a) scope; the parent should schedule the sweep alongside step 6 or authorize it now.

## Evidence limits
- Paper verdicts in (d) are computed from promises.ts:366-417 at HEAD (buffer/existing-path/slack order) and the fixtures' windows; no extra probes were run (only the four authorized commands).
- Post-cutover ACHIEVABLE for the rival tagged P2 in test 6 (:405, :458) depends on the writer's class-aware existing-path rule for rival businesses; if it moves it is a (d)-style reconciliation, not a writer loosening.
- The new file's header states "today it stops at strict live V29" — verified by run 2 (:238).
- Run 3's other 10 passes and 2 todos are unchanged from the record-101 shape; I did not touch them.

## Next concrete action for the parent
1. Land 600-T.patch plus the new file via the index as the 600-T commit (five test paths only); record the run logs.
2. Hand the design note (600-A) writer the reconciled RED: B-F2/B3 nine 3→4 pins; capacity 14 live + evaluator5 1 designated; trust-chooser test 6 RED at :398 needing the full-predicate copy at attach, the union, the class-aware quote for a rival issuer and the freeze read of `kind/seatClass`.
3. Decide the Save30 sweep (28 `validateSaveV29(makeSave)` sites above, two raw-bytes premises) — authorize a test-author sweep at the cutover boundary rather than letting the writer's step-6 verification discover it.
4. At step 6, expect G9 rival-order movement in trust-chooser test 7 (:691-696) if the first natural actor witness is unproven; route to test-author reconciliation from the run evidence.
