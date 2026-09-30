<!-- 1353-C3: independent test-engineer revision handback, saved verbatim by the parent from the agent's final text -->

# 1353-C3: P15C Wave 1 RED review fixes per 1353-D / 1353-F3

Revision of [1353-C2](1353-C2-p15c-red-revision.md), same scratch tree, same BASE
(`37d701705346e0d94e5de27c063cd4f5d79201ae`). Authority: [1353-D](1353-D-p15c-red-review.md) (independent RED
review, verdict REFINE) and [1353-F3](1353-F3-parent-response-to-1353-D.md) (the parent's response, taking all
three of 1353-D's points), which govern this revision.

## What changed

**(1) Blocking — audience-institution exact qualifying/contrary list (1353-D Defect 1 / 1353-F3 §1).**
Strengthened the existing `legacy-coexist-every-evaluated-archetype-held` leaf (no new leaf; same fixture, the
already-existing ALLSTAR one, per the review's own "no new fixture needed" observation) with an exact assertion on
`archetype(manifest, 'ALLSTAR1', 'audience-institution')`:

- `qualifying.length === LEGACY_AUDIENCE_MIN_DECADES` (4, never 10 — the count a wrong "push every liked film"
  implementation would produce).
- `qualifying` is exactly the set `{A1FILM-0, A1FILM-3, A1FILM-5, A1FILM-7}` (order-insensitive, via `Set`
  equality, since the charter states no ordering requirement stronger than "ties... never decide an outcome").
- `contrary` is exactly `[]` — every decade in this fixture is an audience decade, so there is no "other eligible
  decade" left to contribute a contrary ref; this is the correct value, not a missing case.

Hand derivation (`floor((1920+floor(week/52))/10)` recomputed independently via a throwaway node script, not taken
on faith from the existing in-file comments):

| Decade | Weeks | Film IDs | All audienceScore | Tie-break (earliest week) | Best film |
|---|---|---|---|---|---|
| 192 | 10, 20, 25 | A1FILM-0/1/2 | 80 (tied) | week 10 | **A1FILM-0** |
| 193 | 530, 540 | A1FILM-3/4 | 80 (tied) | week 530 | **A1FILM-3** |
| 194 | 1060, 1070 | A1FILM-5/6 | 80 (tied) | week 1060 | **A1FILM-5** |
| 195 | 1580, 1590, 1595 | A1FILM-7/8/9 | 80 (tied) | week 1580 | **A1FILM-7** |

The two three-film decades (192 and 195) are exactly the cases the review named as exposing the cardinality bug;
this fixture already had a genuine 3-way tie in both, not just the one the review's own suggested fix cited. Since
every film in every decade shares the identical `audienceScore: 80` from `buildAllStarFacts`, this leaf exercises
the "release week, then film id" tie-break exclusively (not the score-ordering half of "best" — that half is
already covered by the existing `amendment-1` leaf's two-score, two-film decades, which the review separately
confirmed correct).

**(2) Four new N−1-vs-N boundary leaves (1353-D note / 1353-F3 §2).** RED item 4 previously had a dedicated
N−1-vs-N leaf only for `artistic-voice`'s `LEGACY_MIN_FILMS`. Four new leaves close it for every other MIN-style
threshold, each isolating ONLY the named count (all other conditions held comfortably true or false so as not to
confound the boundary under test):

- `legacy-archetype-edges-audience-institution-min-decades-n-minus-1-vs-n`: 3 audience decades (each 2 releases,
  both liked at `audienceScore: 80`, clear of the "exactly half" edge already covered by `amendment-1`) → notHeld;
  4 decades → held.
- `legacy-archetype-edges-genre-specialist-min-films-n-minus-1-vs-n`: `n=7`, ALL one genre (majority never in
  doubt) → notHeld purely because `n < LEGACY_GENRE_MIN_FILMS`, regardless of a 100% majority; `n=8` → held.
- `legacy-archetype-edges-commercial-engine-min-films-n-minus-1-vs-n`: `h=4` settled hits at 95% BMV each (share
  is a comfortable 100%) → notHeld purely because `h < LEGACY_MIN_FILMS`; `h=5` → held.
- `legacy-archetype-edges-talent-foundry-min-people-n-minus-1-vs-n`: 2 discoveries, each independently satisfying
  `LEGACY_FOUNDRY_MIN_CREDITS=10` on its own 10 films → notHeld (`qualifyingCount` exactly 2, the archetype's own
  reported count regardless of the overall outcome, matching the established convention from the `artistic-voice`
  N−1/N leaf); 3 discoveries → held (`qualifyingCount` exactly 3).

**(3) Part A — `GUARD_TIMEOUT_MS` raised to 180,000 (1353-D non-blocking note / 1353-F3 §3).** `tests/p15c-wave-r-
retention.test.ts` changed ONLY: the file's top authority comment (notes the revision and the sole change), the
memoization-rationale header paragraph (now states both the 90.4s full-suite measurement and the up-to-189.9s
isolated-under-load measurement, and explicitly confirms — per the parent's direct ask — that every guard `await
campaignRun()`s as its first statement, so the vitest per-test timeout genuinely wraps the full campaign build on
whichever guard runs first; the memoized `Promise` makes the other five near-instant, it does not bypass the
timeout), and the `GUARD_TIMEOUT_MS` constant itself (`120_000` → `180_000`). Confirmed via `git diff` between the
1353-C2 and 1353-C3 commits in the scratch tree: these are the ONLY lines that differ (diff reproduced in full in
this handback's working notes; three comment blocks plus the one constant, nothing in the six guards' bodies, no
fixture, no assertion, no injection-proof content touched).

**Part A was NOT re-run this revision** (per explicit instruction: a broad recorded measurement was running on
this machine, avoid heavy load). Confirmed instead by direct `git diff`, which is a stronger and cheaper guarantee
than a hash comparison for showing exactly what changed and nothing else. Final file hash for the record:
`ef56cad296860f0d7ff79e934bf2a7f9a3c04ca0a1ff46abe9634fc5b036f517`
(`shasum -a 256 tests/p15c-wave-r-retention.test.ts`). Its six-leaf `control-passes` classification and all six
injection proofs from 1353-C carry over unchanged and unre-verified this pass — they were not touched.

## RED summary

**Part B:** now 66 leaves (62 from 1353-C2 + 4 new N−1-vs-N leaves; the audience-institution fix added assertions
to an existing leaf, not a new one). Final run: `Test Files 1 failed (1)`, `Tests 66 failed (66)`, `Duration
3.01s`. All fail for the module-missing reason except `tuning-legacy-bounded-terms` (unchanged genuine value
mismatch). Zero vacuous passes (`grep -c "^ ✓"` returns `0`). All 72 total leaf names (6 Part A + 66 Part B)
cross-checked programmatically against the classification JSON — exact 72/72 match.

## Type gate

`tsc --noEmit` (root tsconfig): one diagnostic, the expected
`tests/p15c1-campaign-legacy.test.ts(57,24): error TS2307: Cannot find module '../src/core/campaignLegacy.js'`.
No other diagnostics from either file.

## Apply check

Real-repo HEAD unchanged since 1353-C2 at `c614b7e9ed62dcb889118ba1eadb8a2bafa7934a` (confirmed via `git rev-parse
HEAD` at the start of this revision — matches the coordinator's stated HEAD exactly). Temporary-index check
(`GIT_INDEX_FILE` scoped to a scratch file only):

```
$ git read-tree c614b7e9ed62dcb889118ba1eadb8a2bafa7934a
$ git apply --check --index docs/.../1353-stage/1353-p15c-red-r3.patch
APPLY-CHECK-OK vs c614b7e9
```

## Files

- `tests/p15c-wave-r-retention.test.ts` (header/timeout-only change; 6 leaves, `control-passes`, not re-run this
  pass — see above)
- `tests/p15c1-campaign-legacy.test.ts` (revised; 66 leaves, `fails`)
- Patch: `$E/1353-stage/1353-p15c-red-r3.patch` (full diff vs BASE, both files)
- Classification: `$E/1353-stage/1353-p15c-red-r3-classification.json` (72 rows: 6 `control-passes` + 66 `fails`)
- This handback: `$E/1353-C3-p15c-red-review-fixes.md`

`$E` = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

## Return to Fable

**DONE** for the assigned review-fix scope. All three 1353-F3 items addressed: the blocking audience-institution
cardinality gap closed on the existing ALLSTAR fixture with a hand-derived exact qualifying/contrary list; four
N−1-vs-N boundary leaves added, closing RED item 4 for every MIN-style threshold; Part A's timeout budget raised
to 180,000 with both measurements stated and the await-ordering explicitly confirmed in the header. Checks run:
`vitest run tests/p15c1-campaign-legacy.test.ts` (66/66 fail, 3.01s), `tsc --noEmit` (one expected diagnostic,
safe static analysis only — no heavy execution), a temporary-index apply check against current HEAD
(`APPLY-CHECK-OK`), and a `git diff`-based confirmation (stronger than a bare hash) that Part A's only change is
the stated header/timeout edit. **Part A was not re-run this revision**, per the explicit instruction to avoid
heavy load while a broad recorded measurement is in progress on this machine; its 1353-C injection proofs and
control-passes classification stand as previously evidenced and unretouched. Next concrete action: per 1353-D's
"Once that one assertion lands, this RED suite is ready for Wave 1 production" — a confirmatory pass (if the
parent wants one) or direct release to Wave 1 production (`src/core/campaignLegacy.ts`) queued behind this record
per 1353-A §10.
