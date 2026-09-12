# Independent bounded Sonnet review — PASS

Reviewer: Claude Sonnet (`claude-sonnet-5`), session `68641149-0eb7-4110-a0a6-3e2683923e14`. One independent reviewer, one full candidate pass and one bounded confirmation of three textual corrections in the same session. Tools disabled; no filesystem writes, research, runtime, builds or additional reviewers were requested. Existing authenticated subscription was used; no resource purchase or API-key service was added.

The reviewer received the complete main documents and all required Markdown references. It independently reproduced the economics by manual arithmetic. Cryptographic/archive checks were performed separately by the author and are not attributed to the reviewer. Source/evidence limitations remain explicit. Candidate hashes and review-response hashes are in REVIEW-CANDIDATE-IDENTITIES.json.

## Initial findings, preserved

# Independent Sonnet Review — P13B Launch-Review Candidate

Scope of this review: the complete candidate (00–04, all REF-* excerpts, all bundled sources/inputs). No tools used; findings below are from close reading and manual arithmetic reproduction only.

## Verification performed (passed, no issues)

- **All-eight Ready preservation**: 02 §5 and the routing table in 02 §3 carry all eight rows from the handoff/Future-Ops supplement, each with owner, prerequisite, and acceptance task; none dropped or silently merged.
- **Journey coherence**: The §2 state table and the week-780 walkthrough are internally consistent; every transition (unbuilt→instruments→assignment→ceiling→completion→installation→operation→"no eligible project") is accounted for, and the distinction between the review journey's sequential single-Lab staffing and document 03's parallel two-Lab fixtures is explicitly flagged rather than conflated.
- **Genuine post-first-invention choice**: at week 780 both R01 (open since 260) and R07 (opens exactly at 780) are independently eligible — this is a real choice, not a staged one — and the document separately, honestly handles the "invented-sound-early, real gap until 780" case without inventing busywork.
- **Source identities**: cross-checked every repeated identity (doc parent, TS/Unity commits, save/schema/DTO hashes, companion/catalogue/UX commits) across 00, 02, 04, and the REF-* headers — all consistent with each other. (Cryptographic correctness of the hashes themselves cannot be verified without tools; this is a scope limitation of the review, not a finding against the candidate.)
- **Independent arithmetic reproduction** — I recomputed from first principles and matched exactly:
  - 64-unit staffing table (1/4/8-person cases, all R&D/salary/overhead/signing figures).
  - All four rows of the 52-week [780,832) allocation fixture (knowledge/operational dates, R&D, idle person-weeks, operation delta, department+deployment cash, whole-fixture cash) — every one reconciled to the cent.
  - The [934,986) waiting-vs-research fixture, including the "waiting wins by 9 weeks/$131,000" conclusion.
  - The sound startup/477-week-gap trace, including the 213×$3,000 / 208×$2,000 / 153×$4,000 charge counts and the $8,443,720 whole-fixture total.
  - The office-conversion 52-week comparison (direct/staged/new-III).
  - Both cancellation traces (same-year net $210,000; cross-year net $235,000) and the rival-Lab $2,564,880 incremental-cash trace.
  - The unequal-Lab concentration formula `a+0.625b` correctly reduces to the established 0.8125/9.75 result at a=b, and degrades gracefully at b=0.
  - The 120h budget partitions (84h capability sub-items sum to 84; 36h reserve sub-items sum to 36).
  - No arithmetic error found anywhere in this pass.
- **Finance/schema/ordering**: the proposed rival finance additions (`researchSpend`, `researchCapacity`, `technologyRestoration`, `technologyRefund`) are consistent with REF-H/REF-V's actual reconciliation code and correctly identify the real defect (closed-form `facilityOpex` cannot support a recurring rate change) rather than glossing over it.
- **References/access**: all 17 REF-* files named in 04's table are present; all files named in the "controlling input sequence" are present. Complete.
- **Evidence honesty**: every qualification carried from the P13A-FINAL-DELIVERY-ADDENDUM (byte-delta, recovery-record count, unmeasured Save-time responsiveness, RSS, stress tests, etc.) is reproduced accurately, not softened.

## Findings

1. **(Low — completeness)** `02-P13B-DECISIONS-AND-ACCEPTANCE.md §7`, REF-T row. The source-refresh table doesn't name the two exact hard caps that presently block this proposal's core scope: `technology.ts`'s `if (root.projects.length > 1) fail(...)` and the rival `adoptions.filter(a=>a.studioId!==own).length>1` check. *Correction:* add one clause to the REF-T row naming these two guards as the literal removal targets for Ready rows 1 and 8.

2. **(Low — clarity)** `01-P13B-LAUNCH-DRAFT.md` ¶3 / `02 §2` opening. The week-780 review fixture's sequential sound→lighting walkthrough doesn't state it assumes a single Laboratory, which could be misread against document 03's two-Lab economics fixtures using the same week. *Correction:* add "(one Laboratory, four seats)" to the fixture description.

3. **(Low — naming hygiene)** `02 §7`, rival finance recommendation. The new `RivalMoneyKind` member `researchSpend` reuses the exact string already used by the existing player-side `LedgerKind` member of the same name (REF-T). Type-safe but confusable in logs/tests. *Correction:* rename to `rivalResearchSpend` or note the reuse is deliberate.

4. **(Low-medium — organizational, not a document defect)** `02 §3` correctly flags that ordering between P13B and the bundled `UIUX-PLAYABILITY-NEXT-PHASE-OWNER-DIRECTION.md`'s Playability & Interaction Pass is undecided. That pass's own scope (navigation/task-location, button conventions) directly overlaps the Laboratory-entry-clarity work P13B proposes first. The candidate defers this appropriately rather than resolving it unilaterally — flagging for Current Ops' explicit attention before authorizing execution, to avoid duplicated or conflicting UI conventions on the same lot/inspector surfaces. No change to the document is needed.

5. **(Low — schedule realism, self-mitigated)** `02 §9`. The 16h allocation for "Set size/setup/R07 consumers" bundles four separable pieces of new scope (Set classes, large-stage body, setup-workload task, R07 brief+staffing). Already covered by the built-in 24/48/72h checkpoints and explicit stop-for-disposition fallback, so not a blocker — just the likeliest line item to trigger that escalation.

## Verdict

**No material blockers found.** All eight Ready obligations are preserved, the proposed journey is coherent and offers a genuine post-first-invention choice, source identities are internally consistent throughout, and every reproducible calculation I independently checked (staffing, allocation, startup, waiting, cancellation, rival costs) matched exactly. Evidence labeling is honest and consistent with the P13A addendum's qualifications, and all tuning/design is explicitly marked as candidate/recommendation rather than approved law. The five findings above are optional polish plus one organizational note for Current Ops; none require the candidate to be revised before Current Ops disposition.

**READY FOR CURRENT OPS P13B LAUNCH REVIEW**, contingent only on Current Ops' own resolution of finding 4 (P13B vs. Playability Pass sequencing) as a scheduling decision, not a document defect.

## Author disposition

Findings 1–3 corrected: named the existing project/rival caps while retaining governed validation, labelled the first-playable walkthrough one Lab/four seats, and documented deliberate account-scoped researchSpend naming. Finding 4 remains Current Ops decision D7 before execution, not a request to reopen preparation or P13A. Finding 5 remains a disclosed sizing risk under D8 stage stops; no scope was deleted. No economics, source, acceptance, scope or reserve changes followed review.

## Same-reviewer final confirmation

Confirmed. All four corrections are textually present and satisfy the optional findings from the prior review:

1. Both the launch draft ("one Laboratory with four seats") and the companion excerpt ("one Laboratory, four seats") now state the fixture's Lab count explicitly — Finding 2 closed.
2. The REF-T row now names both guards exactly (`root.projects.length > 1`, rival-adoption-count `> 1`) and correctly commits to governed bounds rather than validation removal — Finding 1 closed, and phrased safely (doesn't invite deleting a safety check).
3. The rival finance paragraph now states the `researchSpend` name reuse is deliberate and requires campaign/studio/account-owner identification in logs and proofs — Finding 3 closed.
4. Findings 4 and 5 are correctly left as-is: 4 as an explicit Current Ops pre-execution scheduling disposition (not a document defect), 5 as a budget risk already covered by the 24/48/72h stage-stop mechanism. No textual change was needed or made to either, consistent with my prior assessment that neither was a blocker.

No new claims, numbers, scope, or sources were introduced by these edits, and none of the surrounding arithmetic or identities I previously reproduced were touched.

**Verdict unchanged: the final launch-review candidate remains free of material blockers.**

**READY FOR CURRENT OPS P13B LAUNCH REVIEW**, contingent only on Current Ops' own scheduling disposition of Finding 4 (P13B vs. Playability & Interaction Pass ordering).

The reviewer’s scheduling caveat is retained. Launch-review readiness permits Current Ops to review and dispose of that question; implementation must not start until the separate order resolves scheduling and other proposed decisions. The review does not approve candidate tuning or substitute for future product/native acceptance.
