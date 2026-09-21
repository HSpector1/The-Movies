# 600 — Owner ruling on record 578: D1 (a), D2 (i-c), 515 §6 (c), 576 noted; C1 closed; engineering reopened (coordinated P14B.4 cutover)

2026-09-21. Claude Code parent. The Owner ruled on the consolidated decision packet (record
578; plain-English packet delivered in session). §1 is the ruling verbatim (SHA256 of the
saved text `b4961c547718caf854c0a7ee1b321df36e7ce097c9ea07666f0e7e212afc0488`). §2 records what
it changes in the plan. §3 is the reopened program's sequence. Nothing in this record is Owner
acceptance of any build; no source changed with it (HEAD source identity `48a43511`, module
`promiseCapacityOwnerReplay.ts` SHA `9e97ffed…`).

## 1. The ruling (verbatim)

```
OWNER RULING — RECORD 578

I approve the recommended disposition.

D1:
I accept option (a). Amend the plan so evaluator 4 uses class-restricted
fixed-seat paths plus shared residual capacity on the existing scalar.
The kernel joint certificate and UNCERTIFIED→FRAGILE mapping move to
evaluator 5.

Implement this inside the coordinated core/save/runtime/wire cutover,
not as a partial live change. Test-author may reconcile the B-F2/B3
rules-3 pins and the kernel-vocabulary capacity cases, with
natural-chain reconciliation for residual-capacity behavior.

D2:
I choose option (i-c). Keep the 200,000 work cap and the current
162 §2 native Map/Set metric exactly as adopted.

Certified offers may continue to exist only where the current kernel
fits. Do not open multi-admission or deferred-admission grammar.
UNCERTIFIED→FRAGILE remains evaluator-5 behavior.

Revisit the metric/cap only when evaluator 5 is actually designed.

515 §6:
I choose option (c). Keep the 302 stale route RED as a recorded exact
boundary. Do not authorize C9 or C10. Do not rewrite or weaken the 302
control. Revisit it only if a future D2 ruling changes the metric or cap.

576:
Record the measured bound as a fact. No additional ruling is required.

C1 remains closed.

These rulings reopen engineering.

Now:
1. Record these Owner rulings in the authoritative plan/status files.
2. Have test-author reconcile the affected rules-3/kernel tests.
3. Execute the coordinated P14B.4 core/save/runtime/wire cutover.
4. Use sim-core as the sole production writer where appropriate and
   contract-auditor for independent review.
5. Run the required focused and regression verification.
6. Commit and push recoverable checkpoints.
7. Continue the authorized logic-first program without routine approval
   pauses.

Do not weaken tests, caps, refusals or historical fixtures to obtain a pass.
Unity/native work remains deferred.
```

## 2. What the ruling changes (law)

- **Plan amended (D1 (a)).** `plans/P14B4-HEADLESS-PLAN.md` gains the section "Owner ruling
  2026-09-21 (record 600) — amendments in force" immediately after the status paragraph; every
  original paragraph stays verbatim below it for provenance. Plan SHA256 before
  `382252e23b6353acf602d87f38032ff961e9f7f9740bbfdf2b2ae368c30df4e4` (the pin in the B4 test
  headers, comment-only), after `28b8fdd6dd65a07031cfc69bfe6ba51976844f355d5193c6c3d841f8ac6f2fd6`.
  Line citations into the plan in records ≤ 599 refer to the pre-amendment file; the inserted
  section is 51 lines, so a cited line n > 8 is now n + 51.
  Evaluator 4 = class-restricted fixed-seat paths + shared residual capacity on the existing
  count-family scalar, for fresh P1 AND tagged P2; cast masks legacy → three seats, lead →
  lead, leadOrAntagonist → lead + antagonist; a fixed seat outside the mask is not an event;
  IMPOSSIBLE only from an actual bound; classless legacy P2 nonofferable at a new quote/freeze.
  The joint certificate, the UNCERTIFIED → FRAGILE mapping and "not a guessed scalar maximum"
  are evaluator-5 law and do not gate rules 4 / Save30 / projection 47. Record 26 §2 row 3's
  "reviewed owner-adapter/class-capacity result" reads as the reviewed class-aware scalar
  service at evaluator 4; the detached adapter (553) and enumerator (574) stay unwired live.
  Rules 4 is stamped only by the evaluator change (record 23 stands). The move lands inside
  the coordinated core/save/runtime/wire cutover (26 §2–§4), not as a pre-cutover era.
- **D2 (i-c).** The 200000 cap and the 162 §2 metric stay exactly as adopted; certified offers
  only where the current kernel fits (538 / 576); no multi- or deferred-admission grammar;
  revisit at the evaluator-5 design.
- **515 §6 (c).** `tests/p14b4-ready-replay-stale-target.test.ts:234` stays RED as a recorded
  exact boundary; C9/C10 not authorized; the 302 control untouched; revisit only on a D2 change.
- **576.** Fact recorded; no ruling.
- **C1** stays closed (599). The record-only items of 599/598-R/574-R/553-R stay record-only.
- Unchanged by the ruling: every cap, tariff, deadline, timeout, refusal string and historical
  fixture; the designated failures (stale route :234; bridge OLD TS2353) stay designated.
  `tests/p14b1-trust-chooser.test.ts` test 6 (records 110/554: "migrates at the coordinated
  tagged-P2 activation") is now inside the reconciliation scope of §3 step 2.

## 3. The reopened program (sequence; no routine permission pause between steps)

1. **This record + the plan amendment + the header refresh** (parent; published as the
   record commit and the header commit, remote verified).
2. **Test-author reconciliation (600-T, RED on unchanged source).** Scope, all under the plan
   amendment and never loosened: (a) the B-F2/B3 rules-3 pins on FRESH evaluations and
   attachments (`tests/p14bf2-acting-discipline.test.ts:91,113,126,144,186-187,191,318,325`;
   `tests/p14b3-rule-revision.test.ts:92,138-141,174`) move to 4 for fresh reads after the
   cutover while every historical/frozen receipt and root version stays exactly pinned, with
   a header note in the pattern of the B3→B-F2 reconciliation (`rule-revision` header :87-89);
   (b) the kernel-vocabulary capacity cases in `tests/p14b4-cast-class-capacity.test.ts`
   (the conflicting-claim joint case :279-288; the `bottleneck !== UNKNOWN_CAP` certified-
   bottleneck assertions :247/:260/:359; any premise labelled as needing the solver) move to a
   separate evaluator-5 file or get an explicit unreached/`todo` marking that names record 600,
   never a weakened expectation; the shared `rulesVersion 4` pin (:201) stays; (c)
   `tests/p14b1-trust-chooser.test.ts` test 6 per records 110/554 (its migration is the tagged-P2
   activation this cutover performs); (d) an inventory, not edits, of every natural-chain
   assertion that reads a fresh P1 classification through the residual buffer (the plan's
   "some new P1 offers may become nonofferable"), so post-writer movements can be reconciled
   from evidence rather than guessed. No production file, fixture, cap or timeout is touched;
   the installed 83-case live-P2 set (536/549/570/593, byte-identical) stays the cutover's RED.
3. **Sim-core READ-ONLY design note (600-A)** for the coordinated cutover: 26 §2 (types
   aliases, `PromiseDraft`/`PromiseAttachment` union, full-predicate copy at attach, the
   evaluator-4 scalar with masks + `reserved + X` buffer + class in the inputs digest,
   `PROMISE_RULES_VERSION 4` with the law named in a doc line, `settle` narrowing,
   `talentMarket.ts` freeze/material/disclosure, `save.ts` `LIVE_SAVE_VERSION 30` +
   `makeSave`/`validateSaveV30`, `index.ts` exports), 26 §3 (load consumers → `migrateToV30`,
   `runtime-checkpoint.ts` V30 current envelope + outgoing46 `584bdd…` registered as
   `projection-v46`), 26 §4 (family-discriminated P2 draft with required `seatClass`, nullable
   `seatClass` on own snapshot/history, `preferredOpportunity` on preferences, shared
   wire→core tagged conversion in `bridge/contract.ts`/`bridge/promises.ts`,
   `PROJECTION_VERSION 47`, generator run over its three owned artifacts), plus 537-B G9 (rival
   candidate order: unproven → flexible P2 then P1; proven → P1) and the seating/`breakPromises
   OnCancel` items only if an installed RED reaches them (otherwise record-only). Per-step
   patches for bisectable commits; the whole set lands as one pushed boundary (26 §3: no live30
   under unchanged 46).
4. **Contract-auditor review (600-B)** of the design note against the amended plan, 26, 23, 17
   and the RED; rulings recorded by the parent.
5. **ONE sim-core writer (600-W)** on the reviewed design; cumulative patches per step; no
   test edits; frozen candidate hashed.
6. **Serialized verification (parent, record-check):** the six live-P2 files; the B-F2/B3/B1
   regression controls; `p14b4-material-evidence-core`; save-v30 and the historical save
   corpus; runtime47; bridge cast-class/session/promise-command; root/UI and bridge typechecks;
   `check:bridge-contract` + generator; then fixed-source full core and full bridge compared
   with 536/593 (exact failure IDs; inherited failures stay designated). Natural-chain
   movements → test-author reconciliation (step 2(d) inventory), never assertion loosening.
7. **Contract-auditor review of the candidate (600-R)**, commits landed via the index as
   per-step commits pushed together, the record, headers, Unity backlog note.
8. Then the remaining B4 families (rival P2 authoring outcomes, final seating preference,
   `breakPromisesOnCancel` correction with their own RED) and the program's next gates, under
   the existing directive.

## 4. Constraints carried into every step

One heavy test process; maximum two specialists concurrently and one production writer;
existing profiles only; the writer never commits; the parent lands patches through the index
and verifies each commit's diff against its patch; record-check for every run; publication =
commit exact paths + push + `git ls-remote`. No cap, tariff, refusal, deadline, timeout or
fixture moves to obtain a pass. Unity/native deferred; no Owner-acceptance claim.
