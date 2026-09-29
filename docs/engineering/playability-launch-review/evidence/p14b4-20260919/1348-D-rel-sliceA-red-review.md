<!-- 1348-D: independent review (contract-auditor, read-only) of the 1348 RED, saved verbatim by the parent at HEAD aa02d351 from the agent's final text -->

# Independent review 1348-D

**Verdict: REFINE**

Candidate: `$E/1348-stage/1348-rel-sliceA-red.patch` (3 files: `tests/p14b10-conflict-evidence.test.ts` new, `tests/p14b10-mentor-label.test.ts` new, `tests/p14b5-relationships.test.ts` 2-line edit), `$E/1348-stage/1348-rel-sliceA-red-classification.json` (31 rows), handback `$E/1348-C-rel-sliceA-red-handback.md`, parent dry run `$E/1348-X-rel-sliceA-red-dry-run.md`+`1348-X-red-run.txt`+`1348-X-tsc.txt`. Cross-checked every requirement citation against `$E/1340-O-owner-rulings-20260929.md`, `$E/1342-O-owner-rulings-p14-p18-approved.txt` item 8, `$E/1347-A…charter.md`, `$E/1347-B…review.md`, `$E/1347-F…adoption.md`, and current source (`src/core/relationships.ts`, `src/core/talentMarket.ts`, `src/core/professionTransitions.ts`).

## 1. Slice A scope coverage

All five brief items are covered, and every cited requirement checks out against the authority docs I read directly:
- **Tier law v2** (item 1): threshold boundary, evidence-never-moves-closeness, recovery through positive drivers, drift-to-baseline-with-evidence-kept, and tiers-read-current-closeness-not-peakTier are all present as distinct leaves and match ruling D-1312-1 and 1342-O item 8 verbatim ("Current hostility governs current consequences... a historical conflict alone does not override current positive closeness forever").
- **D5** (item 2): both player-issuer and rival-issuer, both-present (2) and enemy-only (0) cases present, matching 1347-F Amendment 2's literal replacement text exactly. See §2 below for a real, disclosed gap in *how* it's tested.
- **Mentor** (item 3): positive, 2-of-3, duplicate-first-take, fewer-than-3, genesis-excluded, authored-start-excluded, byte-equal-read, no-effect-on-chemistry/tier/trust — all nine leaves map 1:1 onto the brief's list and HIS-014/Amendment 1. See §3 below for a real RED-attribution gap.
- **D-1312-1 negatives** (item 4): 1/2/3 competitions, flops/cancellations-only, and the "nothing applied twice" real-route check are all present, and the real-route check independently verifies `castingCompetitionLost(-3)×3` + `repeatedCompetition(-1,-2)` with no extra kind/row — a genuine exercise of `recordCastingCompetition`, not staged.
- **The two pins** (item 5): I read `tests/p14b5-relationships.test.ts:507` and `:753` pre-patch myself — both are exactly `expect(RELATIONSHIP_RULES_VERSION).toBe(1)` as the patch claims, and the `:753` leaf's own `stagedEdge` helper (line 225 of that file) hardcodes `sharedCompetitions: 0`, confirming the patch's "still holds unchanged under v2" reasoning is correct, not asserted blind.

Nothing from slice B (romance, Professional Rivals, `competitions` log, Save44, projection) appears in the patch. Nothing missing from the brief's scope.

## 2. D5 method — copied combinator (brief question)

`tests/p14b10-conflict-evidence.test.ts:327-331` (post-patch) defines a local `d5Band()` that is a **hand-copied literal** of `talentMarket.ts:916-918`'s ternary, not a call into the real (private, unexported) `bandsFor`. I verified the copy is byte-accurate against current source. The test genuinely proves the new evidence-gated `tiersOnRoster` output reaches `'Enemies'` — that part is real. But the "D5's shipped order is unchanged" claim (the actual subject of 1347-B's blocking defect 2 and 1347-F Amendment 2, i.e., a previously-contested Owner-adjacent decision) is verified against a **frozen snapshot of the ternary text**, not the live combinator. If a future change silently flips `talentMarket.ts:911-918`'s precedence (the exact "enemies wins" alternative Amendment 2 explicitly rejected), this describe block would keep passing forever.

**Verdict: acceptable to land as-is for this RED-staging record** (the gap is honestly disclosed in the handback's finding 1, not hidden; D5's own code is not touched by slice A so there is no new D5 logic this record must regression-test yet), **but required, not merely recommended, before slice A is considered closed**: a settlement-level D5 test that calls through the real `bandsFor` (reusing the existing `f6Base()`/`settlementAt208()` apparatus in `tests/p14b5-relationships.test.ts` family 6). Given this exact precedence question was a blocking defect one record ago, it should not be left as an optional "if the parent wants" line in the handback — it needs to be a tracked, scheduled item, not a stylistic footnote.

**Non-blocking documentation defect:** the comment at `tests/p14b10-conflict-evidence.test.ts:318` and the file header (patch line ~58 pre-line-numbering) cite `talentMarket.ts:894-900` for the D1 roster predicate. I read `talentMarket.ts:894-900` directly — that range is the D2/D6/D7 descriptor computations, unrelated. The real `rosterAt` the test re-derives is at `talentMarket.ts:867-874`, and the re-derived logic is byte-identical to it — so the test's *logic* is correct, only the *citation* is off by ~27 lines. Fix the comment.

## 3. Mentor file's static import (brief question)

`tests/p14b10-mentor-label.test.ts:82` — required change: `import * as relationshipLabels from '../src/core/relationshipLabels.js'` is a static top-level import against a module that does not exist at BASE, so the whole file fails at Vite collection (`0 test`), confirmed independently by the parent's dry run (`1348-X-red-run.txt:4`, `1348-X-rel-sliceA-red-dry-run.md:19-24`). This is **not vacuous** (nothing passes falsely) but it collapses all 9 distinct requirement claims into one undifferentiated signal. `1346-C-p15a1-wave1-red-handback.md:64-78` establishes the in-repo precedent for this exact scenario (new missing module) and explicitly chose per-test dynamic `await import(...)` specifically so each leaf gets "its own attributed failure... instead of one collection-level cascade that would make the classification JSON's rows redundant." 1348-C did not apply that established technique here, and the dry run (`1348-X`) explicitly asks this review to make the call.

**Required**: convert the Mentor file to per-leaf dynamic import matching 1346-C's technique, so the classification JSON's 9 distinct `redReason` rows are each independently observed rather than 8 of them being inferred from one suite-level error plus an admittedly non-evidentiary scratch-path confidence check. The scaffolding verification against a disposable reference implementation is a reasonable confidence step but is explicitly disclosed as *not* part of the evidence path — it does not substitute for the per-leaf RED trail this codebase's own precedent already established as achievable here.

## 4. The 8 control-passes leaves

Checked all 8 individually against source (`relationships.ts:143-155` `tierOf`/`bandOf`, `currentTier`'s `Pick` type, `recordCastingCompetition:363-406`, `talentMarket.ts:916-918`). All are legitimate: each is a case where V1's unconditional Enemies/Nemeses→Strained redirect, or an untouched function's signature/behavior, already produces the exact outcome v2 also requires. None absorbs coverage that should be RED — the corresponding new-behavior assertion (e.g., `hasConflictEvidence` itself, or the D5 enemy-only case) always exists as a separate `fails` leaf alongside the control. No masking found.

## 5. Mentor fixture realism / "authoritative history"

The positive case reuses `cohortThreeFilms()` unmodified — a genuine `CohortReceipt` plus three genuine `FirstTakeReceipt` rows through real commission→greenlight→release cycles, already an accepted fixture (`tests/p14c3-cohort-transition.test.ts`). The negative/boundary variants vary exactly one field in memory over that same real base, following the codebase's own established "I3" convention, which I verified is real (not invented): `tests/p14b5-relationships.test.ts:44-48` defines I3 exactly as described, and the Mentor file's citation of it is accurate. The genesis/authored-start exclusion tests correctly target the *actual* 1347-F Amendment 1 mechanism (CohortReceipt membership, not `genreExperience` inference — the very ambiguity 1347-B's blocking defect 1 flagged and Amendment 1 resolved) by staging qualifying-picture-shaped `firstTakes` for a person structurally absent from every `CohortReceipt`, which is a real, non-trivial exercise of the exclusion rule rather than an incidental pass. The disclosed decision to skip `makeSave` re-validation for the in-memory variants is reasoned and consistent with precedent (`validateCohortReceipts` at `save.ts:9941` re-derives from `talent.slice`, untouched by these firstTakes-only edits); acceptable.

## 6. Vacuity check

Walked each `fails` leaf's assertions against the stated example failure modes:
- `hasConflictEvidence` boundary leaf asserts `false` at 0 and threshold−1, `true` at threshold and threshold+5 — an implementation ignoring the threshold (always true, or off-by-one) is caught at the first or third assertion.
- "flops/cancellations reports no conflict evidence" directly targets the named example (`hasConflictEvidence` that ignores the driver-kind distinction) and would fail against an always-true implementation.
- D5 "enemies here (0)" leaves would fail against a `tiersOnRoster`/`currentTier` that still redirects unconditionally, confirmed by measured dry-run output (`expected [ 'Strained' ] to deeply equal [ 'Enemies' ]`).
- Mentor: no single leaf alone proves the cohort-receipt gate, but the suite as a whole does — an implementation that ignored `CohortReceipt` membership entirely (evidence from any 3 same-director qualifying pictures for anyone) would pass the positive case but incorrectly return non-null for the genesis/authored-start staged cases, which expect `null`. That cross-leaf protection is real, independent of the per-leaf-attribution issue in §3 (which affects RED-time evidentiary quality, not eventual GREEN vacuity-resistance, since once the module exists at all, static import stops masking anything).

No vacuous leaf found.

## Blocking defects

1. `tests/p14b10-mentor-label.test.ts:82` — static namespace import collapses all 9 leaves into one suite-level RED signal. Required: per-leaf dynamic import matching the established `1346-C` technique, so each leaf's classification-JSON `redReason` is independently observed, not inferred.
2. `tests/p14b10-conflict-evidence.test.ts:327-331` — D5's "shipped order unchanged" claim (Amendment 2, previously a blocking review defect) is tested only against a copied literal, never the real `bandsFor`. Required before slice A production is treated as closed: a settlement-level D5 regression test through the real combinator (reuse `f6Base()`/`settlementAt208()` in `tests/p14b5-relationships.test.ts`). Not required to redo this particular RED patch, but must be tracked, not left as an optional footnote.

## Non-blocking notes

- `tests/p14b10-conflict-evidence.test.ts:318` (and file header) cites `talentMarket.ts:894-900` for the D1 roster predicate; the actual definition is `talentMarket.ts:867-874`. Fix the citation.
- Both `RELATIONSHIP_RULES_VERSION` pin edits and their "why the rest of the leaf still holds" reasoning are independently verified accurate against pre-patch source.
- The parent's dry run (`1348-X`) independently reproduced 1348-C's classification exactly (14 failed/52 passed across the two collectable files, identical tsc errors) — strong double verification, no discrepancy found.

## Scope/authority note

Nothing here overrides or is overridden by later corrections in this thread; 1347-F is the governing charter text throughout, consistent with the task's stated authority order. This review does not constitute Owner acceptance or authorization to begin production — it is a read-only assessment of the RED patch's readiness for that step.
