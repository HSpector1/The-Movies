<!-- 1353-C2: independent test-engineer revision handback, saved verbatim by the parent from the agent's final text -->

# 1353-C2: P15C Wave 1 RED revision (Part B only) per 1353-F2

Revision of [1353-C](1353-C-p15c-red-handback.md), same scratch tree, same BASE
(`37d701705346e0d94e5de27c063cd4f5d79201ae`). Authority: [1353-F2](1353-F2-parent-rulings-on-1353-C.md), the
parent's adoption of 1353-C's proposed `LegacyFacts` with five amendments, which governs this revision.
**Part A (Wave R) is unchanged** — confirmed by hash below, not re-run.

## What changed (Part B only)

1. **Every row fact now carries its source `domainId`.** `LegacyFilmFact` gained `domainId:
   'playerFilms'|'industryFilms'`; `LegacyCareerEventFact` gained `domainId:
   'playerCareerEvents'|'industryCareerEvents'` (both required fields; the `filmFact()`/`careerEventFact()`
   helpers default them so every pre-existing fixture in the file kept compiling with zero per-call-site edits).
   Adoption/technology/ranking-snapshot/condition-event/market-assessment refs use the FIXED domainId their kind
   maps to (`'technologyAdoptions'`, `'technologyCatalogue'`, `'powerRanking'`, `'corporateCondition'`,
   `'marketAssessments'`) — not a fact field, since the ruling marks these fixed. RED 10's leaf was rewritten
   (`legacy-refs-resolve-every-ref-is-a-real-id-below-boundary-with-exact-domainId`) to pin exact domainId per ref
   kind across two oppositely-tagged studios (proving the adapter threads either tag through, not one hard-coded
   choice), plus a new leaf confirming `'playerRuns'` is a named v1 domain that no ref ever cites. The owner-swap
   behavioral leaf gained one assertion that the `domainId` tag travels with a relabelled fact set.
2. **One leaf per v1 lens, asserting its exact `counts` key set plus one concrete value** (8 new leaves:
   `catalog`, `people`, `technology`, `ranking`, `financialBand`, `market`, `resilience`, `awards`), each hand-
   deriving its fixture's expected numbers from the 1353-F2 §2 key table. `awards` asserts an empty `counts`
   object and `status: 'notRecorded'` always.
3. **Bounds:** no code change — 1353-F2 §3 accepts the static invariant as authored. Updated the leaf's own
   comment from "flagged as an interpretation gap" to "confirmed as the correct Wave 1 treatment," noting the
   Wave 2 validator owns any future runtime refusal of a malformed persisted manifest.
4. **RED 13 rewritten to the exact four-case status table.** The old single "limited" leaf is now
   `legacy-completeness-limited-with-recorded-from-week-after-studio-entry` (case 3); three new leaves cover
   case 1 (`legacy-completeness-null-recorded-from-week-not-recorded`), case 2
   (`legacy-completeness-recorded-from-week-at-or-after-boundary-not-recorded`, tested at both `recordedFromWeek
   === B` and `> B`), and case 4 (`legacy-completeness-complete-when-recorded-from-week-at-or-before-every-entry`,
   two studios, one entering exactly at `recordedFromWeek` to pin the boundary-inclusive edge). The absent-domain
   and row-before-`recordedFromWeek`-refuses leaves are unchanged.
5. **RED 15's "no events" leaf now asserts both effects.** The eventless film (F1, tagged `'industryFilms'`) is
   still excluded from decade counting (effect 1, unchanged), AND the studio's `audience-institution` result's
   `limitedBy` now must contain `'industryCareerEvents'` — F1's own missing career-event domain (effect 2, new).

## Hand derivations (new leaves; representative)

- **`lens-counts-catalog-exact-keys-and-one-value`**: 1 settled campaign film, 1 inRun campaign film, 1 authored
  film for studio S. `releases` counts campaign releases only (2), separate from `authoredPre1920` (1); `settled`
  and `inReleaseAtBoundary` are 1 each, matching the two campaign films' opposite status.
- **`lens-counts-people-exact-keys-and-one-value`**: T1 credited on 2 campaign films (both first-ever credits,
  well under `LEGACY_FOUNDRY_MIN_CREDITS=10`). `discoveries=1` here is a DELIBERATE authoring decision (flagged
  in-line): the `people` lens's "discoveries" count is the BROAD set of anyone whose earliest-ever credit is a
  campaign release of S, not gated by the talent-foundry archetype's own >=10-credit qualifying threshold — the
  fixture is chosen specifically below that threshold so the two readings would visibly diverge if the law used
  the narrower one.
- **`lens-counts-financialBand-exact-keys-and-one-value`**: 4 ranking snapshots with bands
  `[stable, stable, thriving, inTheRed]` → `inTheRed=1, strained=0, stable=2, thriving=1`, reusing the
  `LegacyRankingSnapshotFact.band` field already in the proposed shape.
- **`legacy-completeness-complete-when-recorded-from-week-at-or-before-every-entry`**: two studios, `enteredWeek`
  600 and exactly 500, domain `recordedFromWeek=500`. Neither has a week where the domain's coverage starts AFTER
  their own entry (500 is not "after" 500 — the boundary is inclusive on the complete side per the table's
  "at or before" phrasing) → `complete`, not `limited`, pinning the case-3/case-4 boundary exactly.
- **`legacy-refs-resolve-every-ref-is-a-real-id-below-boundary-with-exact-domainId`**: two studios, `P`
  (`'playerFilms'`/`'playerCareerEvents'`-tagged) and `I` (`'industryFilms'`/`'industryCareerEvents'`-tagged),
  each with 5 acclaimed films (artistic-voice) and a 10-credit single-discovery foundry campaign; P additionally
  gets one on-time technology adoption and a full distress→recovery→stable condition sequence. Every
  artistic-voice/talent-foundry ref on P carries `'playerFilms'`/`'playerCareerEvents'`, every one on I carries
  `'industryFilms'`/`'industryCareerEvents'`, every technology-pioneer ref carries the FIXED
  `'technologyAdoptions'`, and every resilient-survivor ref carries the FIXED `'corporateCondition'` — proving the
  two tagging rules (data-carried vs fixed-by-kind) both hold simultaneously in one fixture.

## RED summary

**Part A:** unchanged, hash-confirmed identical to the byte content committed at 1353-C
(`shasum -a 256 tests/p15c-wave-r-retention.test.ts` = `58ed92b6c8eb1a606b23cc5cb611b0d214ed56eabfc5b9ed79640d3731dd151c`,
matching `git show 9a638cc:tests/p15c-wave-r-retention.test.ts` byte-for-byte). Not re-run (no reason to re-pay the
~90s campaign cost for a file with zero diff); its 6-leaf `control-passes` classification carries over unchanged.

**Part B:** now 62 leaves (50 original + 12 new: 8 lens-counts, 1 refs-resolve addition, 3 RED13 status-table
cases). Final run: `Test Files 1 failed (1)`, `Tests 62 failed (62)`, `Duration 3.65s`. All fail for the
module-missing reason except `tuning-legacy-bounded-terms` (genuine value mismatch, unchanged from 1353-C). Zero
vacuous passes (`grep -c "^ ✓"` over a standalone run returns `0`; every one of the 68 total leaf names in both
files cross-checked programmatically against the classification JSON — exact 68/68 match, no missing, no extra).

## Type gate

`tsc --noEmit` (root tsconfig): one diagnostic, the expected
`tests/p15c1-campaign-legacy.test.ts(57,24): error TS2307: Cannot find module '../src/core/campaignLegacy.js'`.
No other diagnostics — the new required `domainId` fields did not break any existing fixture, since
`filmFact()`/`careerEventFact()` supply defaults and every prior call site goes through those helpers rather than
raw object literals.

## Apply check

Real-repo HEAD moved twice more during this revision (unrelated docs landings, then a genuine P14D1 "rival
shelving" production landing touching `src/core/hollywoodTick.ts`, `hollywoodTypes.ts`, `hollywoodValidation.ts`,
`save.ts`, `tuning.ts`, `types.ts` and four new `tests/p14d1-*` files — none overlapping this record's two files).
Temporary-index check (`GIT_INDEX_FILE` scoped to a scratch file only) against the real repo's CURRENT HEAD:

```
$ git read-tree c614b7e9ed62dcb889118ba1eadb8a2bafa7934a
$ git apply --check --index docs/.../1353-stage/1353-p15c-red-r2.patch
APPLY-CHECK-OK vs c614b7e9
```

## Files

- `tests/p15c-wave-r-retention.test.ts` (unchanged; 6 leaves, `control-passes`)
- `tests/p15c1-campaign-legacy.test.ts` (revised; 62 leaves, `fails`)
- Patch: `$E/1353-stage/1353-p15c-red-r2.patch` (full diff vs BASE, both files)
- Classification: `$E/1353-stage/1353-p15c-red-r2-classification.json` (68 rows: 6 `control-passes` + 62 `fails`)
- This handback: `$E/1353-C2-p15c-red-revision.md`

`$E` = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

## Return to Fable

**DONE** for the assigned revision scope. Part A unchanged (hash-confirmed). Part B revised per all five 1353-F2
amendments: domainId tagging + exact RED 10 pinning, 8 lens-counts leaves, the accepted static bounds invariant
(comment-only update), RED 13's exact four-case status table, RED 15's both-effects assertion. Checks run:
`vitest run tests/p15c1-campaign-legacy.test.ts` (62/62 fail, 3.65s), `tsc --noEmit` (one expected diagnostic),
a temporary-index apply check against current HEAD (`APPLY-CHECK-OK`), and a byte-hash confirmation that Part A
is untouched. No production files changed. Next concrete action: parent dry run and independent RED review
(1353-D), per 1353-F2's stated "Next."
