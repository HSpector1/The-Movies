<!-- 1348-D3: focused re-review (contract-auditor, read-only) of slice A RED r4, saved verbatim by the parent from the agent's final text -->

# Independent review 1348-D3

**Verdict: ACCEPT**

Scope: re-review of the r3→r4 change (`1348-C4-rel-sliceA-red-lawful-roster.md`), following 1348-D2's ACCEPT (which exposed the false-reason defect), 1348-F2's ruling, and 1348-C3's reason-sentence revision. Checked the r4 patch (`1348-stage/1348-rel-sliceA-red-r4.patch`) against r3 (`1348-stage/1348-rel-sliceA-red-r3.patch`) line-by-line, cross-checked `1348-stage/1348-rel-sliceA-red-r4-classification.json` against `1348-X4-red-run.txt`, and independently read `src/core/hollywoodTick.ts` and `src/core/talentMarket.ts`'s combinator logic.

## 1. C4's finding at `hollywoodTick.ts:182-195` — substance CONFIRMED, citation imprecise (non-blocking)

I read `src/core/hollywoodTick.ts:115-214` directly. `surplus` (:182-183) is every `activeEmploymentOrdinals` member of a rival business not in the `filled` canonical-role set and not `'scientist'`; the loop at :184-196 terminates each one (`endedWeek:week`, a `termination` receipt) unless it escapes. This confirms C4's central claim: a lawful, non-canonical, unseated rival employee is terminated the same tick, so no lawful "2 over 0" settlement state survives that route — matching the measured `rosterAt(after, base.r01, ...) === []` result.

Two imprecisions in C4's prose (not in its measurement): the escape code C4 quotes and attributes to `:187` is actually at **line 186**; and C4's "the only escape" is incomplete — **`hollywoodTick.ts:187`** is a *second*, separate escape (`state.promises.some(p => p.issuerStudioId===b.studioId && p.beneficiaryPersonId===id && p.outcome===null)`, an open promise from the issuing studio), which C4 never mentions or rules out. This does not change the finding's conclusion for the actual fixture (no promise was ever attached to the injected person, so this escape doesn't apply either, and the empirical measurement — `endedWeek` set to the tick week — is direct, not paper-derived), but the "only escape" claim is stated too broadly and the citation line is off by one. Worth a correction, not a blocker.

## 2. Accessor leaf coverage of the three branches — MET WITH EVIDENCE, one disclosed asymmetry (non-blocking)

I read `talentMarket.ts:876-921` (bandsFor: relationships band 2/1/0) and `:923-929`/`:938-990` (`dominates`/`pairwiseWins`/`chooseProposal`) directly to check reachability. **Band 0 can never be a winner's own decisive band**: `dominates`/`pairwiseWins` require the winner's value to strictly exceed every survivor's on that descriptor, and 0 is the floor of `{0,1,2}` — there is no lower value to beat. This independently confirms C4's own reasoning ("a losing band can never itself be the WINNER's band when relationships is decisive"), so leaving `relationshipsReasonSentence(0)`'s return value unpinned is defensible, not an oversight.

Coverage is asymmetric across the three branches, though each asymmetry is independently justified:
- **Band 2** (close-ties): pinned directly via the new accessor (`relationshipsReasonSentence!(2)`, BRANCH 2-over-0) *and* indirectly via two real settlements (family 6b "both present", BRANCH 2-over-1).
- **Band 1** (at-odds, over a band-0 loser): pinned only via the real settlement path (family 6b "only enemy", BRANCH 1-over-0) — no leaf calls `relationshipsReasonSentence(1)` directly, since nothing in `chooseProposal` is wired to the new accessor yet (it's test-authoring only per 1348-C4). This is not weaker in practice: a settlement-level check also catches a future wiring failure (accessor correct but never called) that a bare unit test of `relationshipsReasonSentence(1)` would miss.
- **Band 0**: untested, correctly, per the reachability analysis above.

RED-reason correctness: dry run (`1348-X4-red-run.txt:73-74`) shows BRANCH 2-over-0 fails with `expected 'undefined' to be 'function'` — the right RED for an existing module (`relationships.ts`) with a missing named export (per the established "vite binds a missing named export to undefined" rule), correctly distinguished from the Mentor file's "Failed to load url" (wholly missing module). Confirmed correct technique for the correct scenario.

**Minor non-blocking note**: a future record could add a direct `relationshipsReasonSentence(1)` pin once the export exists, for symmetry with band 2's coverage; not required to close this record. Also minor: using a dynamic import for a single leaf touching an *existing* module (where a static import, as the file uses for every other `relationships.ts` binding, would have worked identically without a collection-cascade risk) is stylistically inconsistent with the rest of the file, though functionally correct — not a defect.

## 3. Settlement leaves 2-over-1 and 1-over-0 — CONFIRMED unchanged and correct

I diffed both leaves' full bodies between r3 (`1348-stage/1348-rel-sliceA-red-r3.patch:800-809`, `:840-855`) and r4 (`1348-stage/1348-rel-sliceA-red-r4.patch` lines 830-839, 849-864): byte-identical. Both assert the sentences 1348-F2 specifies (`"their roster holds this person's close ties"` for band-2-over-1; `'every other offer comes from a roster holding someone this person is at odds with'` for band-1-over-0, plus the sentence-class checks — no digit, no name). `family 6b`'s "only enemy" leaf's expected `reasons` was correctly updated from the false close-ties sentence to the new at-odds sentence (r4 patch lines 756-776).

## 4. Nothing else changed — CONFIRMED

`tests/p14b10-conflict-evidence.test.ts` and `tests/p14b10-mentor-label.test.ts` carry the identical git blob hashes in r4 as in r2/r3 (`57af299`, `b4fa5f7`) — byte-unchanged. `tests/p14b5-relationships.test.ts`'s diff contains exactly the two pre-existing `RELATIONSHIP_RULES_VERSION` pins plus the one new block (family 6b + D5 REASON SENTENCE); no other hunk. Classification-JSON arithmetic checks out: 36 rows (20+9+7), 26 fails/10 control-passes, matching `1348-X4-red-run.txt`'s 26 failed/54 passed exactly (12 conflict-evidence + 9 Mentor + 5 relationships).

## 5. Remaining hand-built state — CONFIRMED validator-lawful

Grepped the r4 patch for `IndustryEmployment`/`rawRow`/`withRivalRow`: the only surviving occurrence is in the historical revision-note comment explaining the r3→r4 change; no live raw/ordinal-untracked construction remains. All remaining staged state uses the file's own pre-existing, `live()`/`makeSave()`-backed `stagedEdge()`/`stage()` helpers (confirmed genuinely pre-existing at `tests/p14b5-relationships.test.ts:175/184/221/228`, verified in the prior 1348-D2 review), the same technique already accepted for `family 6b`.

## Blocking defects

None.

## Non-blocking notes

1. `hollywoodTick.ts:187` cite correction: the escape condition C4 quotes is at line 186, and there is a second escape (open promise, line 187) C4's finding does not mention. Recommend the record's prose be corrected; the measured conclusion for the actual fixture is unaffected.
2. The new `relationshipsReasonSentence` accessor's `band=1` value is verified only indirectly (settlement outcome), and `band=0` is untested by design (provably unreachable as a winner). Acceptable for this record; a direct `relationshipsReasonSentence(1)` unit pin would be a reasonable future addition once the export exists.
3. Dynamic-importing `relationships.js` (an existing module) for a single leaf is unnecessary relative to the file's own static-import convention for the same module — stylistic only, not a defect.

## Next action

None required to close this RED revision. If/when slice A moves to GREEN, the accessor's wiring into `chooseProposal` (per 1348-C4's own stated expectation) should be confirmed to actually route through `relationshipsReasonSentence`, since the current tests can pass either via correct wiring or via an equivalent inline reimplementation — a production-code review point, not a test-authoring gap.
