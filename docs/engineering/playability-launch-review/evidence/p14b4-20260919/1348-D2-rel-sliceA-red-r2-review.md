<!-- 1348-D2: focused re-review (contract-auditor, read-only) of 1348-C2, saved verbatim by the parent at HEAD 3381f6e3 from the agent's final text -->

# Independent review 1348-D2

**Verdict: ACCEPT**

Scope: focused re-review of revision `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1348-C2-rel-sliceA-red-revision.md` against 1348-D's two blocking defects. Checked the full diff `1348-stage/1348-rel-sliceA-red-r2.patch` against `1348-stage/1348-rel-sliceA-red.patch` (r1) line-by-line, cross-checked citations against current `src/core/talentMarket.ts`, and cross-checked the classification JSON and dry-run output (`1348-X2-red-run.txt`) for internal consistency.

## 1. Blocking 1 (Mentor per-leaf import) — CLOSED, MET WITH EVIDENCE

`tests/p14b10-mentor-label.test.ts` now uses `loadLabels()` (`await import('../src/core/relationshipLabels.js')` inside each `it()`) plus `requireFn`/`requireConst` guards, matching the `1346-C` precedent. Dry run (`1348-X2-red-run.txt:4-22`) shows `(9 tests | 9 failed)` with each of the 9 `it()` blocks independently attributed — not the single suite-level "0 test" collection failure r1 produced.

I diffed every `it()` body between r1 and r2 for this file: the only changes are (a) the import mechanism, (b) each test becoming `async`, and (c) two RED-reason bracket labels updated from `[RED: mentorEvidence does not exist at BASE]`/`[RED: module resolution]` to `[RED: relationshipLabels.ts does not exist at BASE]`/`[RED per leaf: dynamic import]` — an accurate description of the new failure mode, not a substance change. Every `expect(...)` call and its target value is byte-identical between r1 and r2. Confirmed.

## 2. Blocking 2 (D5 through the real combinator) — CLOSED, MET WITH EVIDENCE

New describe block `family 6b` in `tests/p14b5-relationships.test.ts` (r2 patch lines 707-772) reuses the file's genuine, pre-existing `f6Base()` (`tests/p14b5-relationships.test.ts:405`), `settlementAt208()` (`:476`), `stage()` (`:228`), `stagedEdge()` (`:221`), `findEdge()` (`:184`) and `F6Base` type fields (`:403`) — I verified these all exist in the currently-committed file at exactly those lines, not fabricated helpers, and that the new leaves' call signatures match them.

**Polarity check (the task's core question).** I read the live, private combinator directly (`src/core/talentMarket.ts:876-921` for `bandsFor`'s D5 relationships band: `2`=close ties, `0`=enemies here, `1`=none; `:923-929` for `pairwiseWins`/`dominates`; `:938-990` for `chooseProposal`/reason derivation; `:739-749` for `DESCRIPTOR_REASON`, where `relationships` has one frozen sentence used for either direction of a decisive relationships-band difference). Given `family 6`'s own established premise that the base (no-edge) fixture ties on every other descriptor, staging a single Enemies-band edge with `sharedCompetitions:3` on the player's roster changes only the `relationships` descriptor. At BASE (v1), the redirect-to-Strained masks this, so the player's band reads `1` ("none"), ties r01's own empty-roster `1`, and the case declines — measured exactly as claimed (`1348-X2-red-run.txt:311-315`, `expected 'declined' to be 'settled'`, receipt byte-identical in shape to the pre-existing base-tie leaf). At v2 (GREEN), the evidence gate makes the edge read `Enemies` → band `0`, strictly below r01's `1`; `dominates()` (`talentMarket.ts:927-929`) then makes r01 the sole winner via the single differing descriptor, producing `{kind:'settled', studioId:r01, reasons:["their roster holds this person's close ties"]}` — exactly what the leaf asserts. **The RED reason ('declined' vs 'settled') is the right signal, and the asserted GREEN outcome is the correct, source-verified consequence of D5's unchanged shipped order plus 1347-F Amendment 2's literal text ("with only an enemy, enemies here (0)").** Not an invented expectation.

**Player-issuer-only coverage.** Acceptable given the fixture. `f6Base()`'s own r01 employment rows genuinely produce an empty roster for `F6.subject` at week 208 on this seed (as disclosed and measured in the record); reaching a rival-issuer settlement-decisive signal would need new fixture engineering, judged disproportionate and correctly deferred rather than silently dropped. The existing `tiersOnRoster`/`d5Band` leaves in `tests/p14b10-conflict-evidence.test.ts:395-409` already exercise a real rival roster (via the genuine `rosterAt` predicate) for both the "both present" and "enemy only" cases at the unit level, and 1348-D's defect 2 asked for a settlement-level test of the *precedence question* (not specifically a rival-issuer settlement test) — which the player-issuer leaves fully satisfy. This is a disclosed residual gap (no rival-issuer *settlement-level* coverage exists), not a new blocking defect.

## 3. Citation fix — CONFIRMED

`talentMarket.ts:867-874` is `rosterAt`'s exact span (I read it directly: `function rosterAt(...)` at line 867 through its closing brace at 874). Grepped the r2 patch: both live citation sites (`1348-rel-sliceA-red-r2.patch:70`, `:332`) now read `:867-874`; the only remaining `:894-900` occurrence (`:13`) is the historical revision note explaining the correction, not a residual live citation. Closed.

## 4. Nothing else changed; no new vacuity — CONFIRMED

`diff-tree` in 1348-C2 shows exactly the same 3 files as r1 (2 new, 1 modified), no scope creep. `tests/p14b10-conflict-evidence.test.ts` changed only in header/comment text between r1 and r2 (revision note, D5 scope-note rewrite, two citation comments) — zero assertion changes, independently confirmed by full-file comparison. `tests/p14b5-relationships.test.ts` keeps its original two `RELATIONSHIP_RULES_VERSION` pin edits unchanged and adds only the new `family 6b` block. The new "both present" leaf is a genuine control (independently measured passing at BASE for a real, previously-untested reason — end-to-end confirmation that the close-ties precedence survives the settlement path); the new "only enemy" leaf is genuinely RED with a source-verified correct GREEN expectation (§2 above). No masking, no slice-B leakage.

Classification JSON row counts (20 + 9 + 4 = 33; 24 `fails` + 9 `control-passes`) match the measured dry-run totals exactly (12+9+3=24 failed; 8+0+45(unrelated)=53 passed, with 8+1=9 tracked control-passes).

## Blocking defects

None remaining.

## Notes (non-blocking)

- Rival-issuer D5 coverage remains unit-level (`tiersOnRoster`/copied-`d5Band`) only, not settlement-level, per the disclosed fixture constraint in §2. Not required to close this record given 1348-D's actual ask, but worth naming if a later record wants full settlement-level symmetry for both issuer types.
- All measured-at-BASE claims in `1348-C2` and `1348-X2-red-run.txt` were spot-checked against source and are accurate; I did not re-execute the suite myself (read-only role, no shell) — this review relies on the parent's dry-run output plus my own static verification of the combinator logic and helper reuse, not a fresh native test run.

## Scope/authority note

1347-F remains the governing charter text throughout; nothing here overrides or is overridden by later corrections in this thread. This is a read-only technical assessment of RED-patch readiness, not Owner acceptance or authorization to begin GREEN production work.
