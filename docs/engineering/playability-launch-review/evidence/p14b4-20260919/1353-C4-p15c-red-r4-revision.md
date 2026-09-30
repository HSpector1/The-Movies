<!-- 1353-C4: test author, RED r4 of the P15C Wave 1 pure Legacy law (`campaign-legacy/v1`). Written in the real repo; the revision method ran in scratch. -->

# 1353-C4: P15C Wave 1 RED r4 — D1-D4 delta, A1-A3, OPEN-12, OPEN-19

**Status: DONE.** r4 is a cumulative diff vs HEAD `c614b7e9` touching only
`tests/p15c1-campaign-legacy.test.ts` (r3's 66 leaves + 6 new leaves = 72) and
`tests/p15c-wave-r-retention.test.ts` (unchanged, byte-identical to r3).

Authority: `$E/1353-F4-parent-rulings-on-1353-E.md` (governs this revision);
production handback `$E/1353-E-p15c1-production-handback.md` §7-§9; charter
chain 1353-A/1353-F/1353-F2/1353-F3; `$E/1359-A-p15c-wave2-charter.md` §3.3;
`$E/1355-F2-parent-p15-domain-sequence-ruling.md` item 5.

`$E` = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.
Method scratch: `$S/1353-work4/tree` (`1327-C` archive method: `git archive`
of real HEAD `src bridge ui generated scripts package*.json tsconfig*.json
vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md` plus `tests`
without fixtures; `docs node_modules art tools` and `tests/fixtures` linked
with `ln -sfn`). Scratch commits: `2b1d830 base`, `0274ed2 red-r3` (r3 patch
sha256 confirmed `fd6c8472…bc41bc7`, matching the base RED and 1353-E's
recorded value; Wave R blob sha256 `ef56cad2…b036f517`, matching 1353-C3's
recorded value), `26af680 red-r4` (this revision's tests-only content), plus
one throwaway commit `1a28243` that overlaid the writer's step-2 module for
the reference run only and was discarded (`git reset --hard 26af680`) before
any handback file was written. The writer's own scratch tree
`$S/1353-prod/tree` was read from and copied out of, never modified.

## 1. What changed, per ruling

**D1 (`baseMarketValue`).** `LegacyFacts` gains a required top-level
`baseMarketValue: number`; `baseFacts()` supplies `BMV` (already the file's
existing fixture constant, `1_000_000`). No leaf-specific edit needed beyond
this: every archetype-edge fixture already used `BMV` for its gross math, so
this is the "two lines" the production handback itself recommended (§8).

**D2 (the second technology, sorted ids).** `baseFacts()`'s default
`technologies: [SYNC_SOUND, LIGHTING]` and every default `enteredWeek: 0`
mean a studio that never adopts lighting-control-01 (commercial week 936)
now correctly carries that technology id as an additional contrary ref
(amendment 4: "for each technology commercial while S was entered"). Edited,
each hand-derived against 1353-A §5.3 amendment 4 and cross-checked against
the production handback's own §8 table:
- `…-plus52-qualifies-plus53-does-not`: S-P53 (sync 469, middle) → contrary
  `['lighting-control-01']` (was `contraryCount: 0`).
- `…-late-plus260-no-plus261-yes`: S-L260 (sync 676, on time) → contrary
  `['lighting-control-01']`; S-L261 (sync 677, late) → sorted
  `['A-L261', 'lighting-control-01']`.
- `…-cancelled-adoption-excluded`: S-CANCEL (sync cancelled) → sorted
  `['lighting-control-01', 'synchronized-sound']`.
- `amendment-4-…`: Y (sync 716, late) → sorted
  `['Y-LATE', 'lighting-control-01']`.
- `legacy-refs-resolve-…-with-exact-domainId`: added a `technologyWeeks` map
  (`technologyId → commercialWeek`) to the leaf's own `knownIds` set and week
  lookup, since a lawful pioneer contrary ref may now cite a technology id
  (1353-F2 §1 maps it to `'technologyCatalogue'`), not only a film/event/
  adoption/condition id.

**D3 (row-before-recordedFromWeek, wrong domain).** `F-TOO-EARLY` now carries
`domainId: 'playerFilms'`. `filmFact`'s default domain is `'industryFilms'`
(recordedFromWeek 0 in `allV1DomainsComplete()`), so the original fixture was
never before its own domain's start; only `'playerFilms'`, overridden to
`recordedFromWeek: 500` in this leaf, makes `F-TOO-EARLY` (week 100) violate
law 7.

**D4 (20,000-film fixture, release weeks past B).** `releaseWeek: 10 + i` put
weeks 6240-20009 (13,770 of 20,000 films) at or past B=6240. Changed to
`10 + (i % 6230)`, whose maximum is `10 + 6229 = 6239 < 6240`, keeping every
release inside the cut. Verified `6240 - 6230 = 10`, i.e. the wrap period
exactly spans `[10, 6239]`.

**Prerequisite the delta itself did not name, but OPEN-19 requires
(see §2 below): `filmFact`'s default `settledWeek`.** Before r4 it was a
fixed literal `10`. Nearly every N-1/N and archetype-edge leaf in this file
overrides `releaseWeek` upward (`10 + i*20`, `500+i*20`, `2000+i*20`, …)
without overriding `settledWeek`. A fixed default would leave those defaults
`< releaseWeek` the instant OPEN-19's refusal exists in production — not
today's reference module (it has no such check yet), but the very next step
the writer takes. Fixed now: `defaultSettledWeek(releaseWeek)` returns
`releaseWeek + 10` (or `10` when `releaseWeek` is `null`, the authored case,
unchanged from before), computed from the caller's own override before the
object spread. See §3 for the full leaf-by-leaf re-check this required.

## 2. A1-A3 (1359-A §3.3) and OPEN-12, OPEN-19 (1353-F4), new leaves

**A1** (`LegacyRankingSnapshotFact` gains `recordId`). Type updated; the 4
existing `rankingSnapshots` fixture blocks (8 objects: the periodic-snapshot
leaf, the `ranking` and `financialBand` lens-count leaves) all gain a
`recordId` string. The periodic-snapshot leaf's recordIds are `'PR-6240'`
and `'PR-6253'` specifically so its unchanged `.id.includes('6240')` /
`.id.includes('6253')` assertions (patch :715 in r3, per 1353-F4) keep their
meaning once production's ref id becomes the recordId rather than
`${week}:${studioId}`. New leaf `a1-ranking-ref-cites-record-id-never-week-
derived`: one snapshot with `recordId: 'PR-777'` at week 100 (deliberately
not week-derived, so no format could coincidentally match), asserts
`ranking.refs[0].id === 'PR-777'` and `!== '100:S'`.

**A2** (`LegacyMarketAssessmentFact` gains `week`). Type updated; the
existing `lens-counts-market-…` fixture's two assessments gain `week: 10`
and `week: 20` (both well below B, so its existing count assertions are
unchanged). New leaf `a2-market-assessment-cut-by-week-outside-b-excluded`:
one assessment at `week: B` (6240, outside), one at `week: B-1` (6239,
inside); asserts `counts.assessed === 1` and `counts.underPressure === 1`
(only the inside row).

**A3** (`closedWeek >= B` reads open). New leaf
`a3-closure-at-or-after-boundary-reads-open`: a studio with a genuine
distress→recovery→stable sequence (which alone holds resilient-survivor)
and `closedWeek: 6240` (= B, no matching closure event). Asserts
`outcome === 'held'` and `contrary === []`. **Finding, not a defect:** this
leaf already **passes** against the writer's unchanged step-2 module (§4
below) — `resilientSurvivor`'s own `closed = closures.length > 0 ||
(s.closedWeek !== null && s.closedWeek < f.B)` already excludes
`closedWeek === B`, and `conditionEventsBefore` already filters `week < f.B`.
1353-E §9 OPEN-7 was one of the points "ratified as implemented" (1353-F2),
and this leaf confirms that ratification held at the pure-law level; 1359-A's
A3 request is about the Wave 2 *adapter* deriving `closedWeek` from
`corporateCondition.events`, which is out of Wave 1's scope. No production
change is required for this leaf specifically.

**OPEN-12, changed** ("commercial while S was entered" =
`enteredWeek ≤ commercialWeek < end of S's span`). Two new leaves:
- `open-12-entrant-after-commercial-week-carries-no-contrary-for-it`:
  `LATE-ENTRANT` enters at week 1000 (after both baseFacts technologies'
  commercial weeks: sync 416, lighting 936); never adopts sync-sound, and
  adopts lighting *late* (operational week 5000, past `936+260=1196`).
  Asserts `contraryCount === 0` — covering both "never" (sync) and "adopted
  late" (lighting) in one leaf, since under the ruled reading neither
  technology was ever "commercial while S was entered". **Fails** against
  the reference module (§4): today's `technologyPioneer` loop only checks
  `t.commercialWeek >= spanEnd → continue` (spanEnd from closure/B), never
  `enteredWeek`, so it produces `contraryCount: 2`.
- `open-12-entrant-one-week-before-commercial-week-keeps-the-ref`:
  `JUST-BEFORE` enters at `SYNC_SOUND.commercialWeek - 1` (415), isolated to
  `technologies: [SYNC_SOUND]` only (so the default lighting contrary cannot
  obscure the boundary case); never adopts. Asserts `contrary ===
  ['synchronized-sound']`. **Passes** against the reference module already
  (the old code never gated on `enteredWeek` at all, so an entrant *before*
  commercialWeek was always correctly judged; only entrants *after* were
  wrongly judged too). This leaf is the boundary control proving the new
  gate must not over-exclude.
- **Re-derivation of every existing pioneer expectation**, as required: every
  studio in every *existing* (D2-corrected) pioneer leaf uses the default
  `enteredWeek: 0`, which is `≤ 416` and `≤ 936` — the gate is satisfied
  trivially and changes nothing already asserted. The only two studios in
  the whole file with a non-default `enteredWeek` whose facts are visible to
  `technology-pioneer` and were *not* already handled: `LATE` (`enteredWeek:
  600`, `legacy-completeness-complete-when-…` leaf) and `MIDENTRANT`
  (`enteredWeek: 300`, `amendment-3-…` leaf) — neither leaf asserts anything
  about either studio's `technology-pioneer` result (confirmed by re-reading
  both leaves in full), so no re-derivation edit was needed for them.

**OPEN-19, changed** (`settledWeek < releaseWeek` refuses). New leaf
`open-19-settled-week-before-release-week-refuses`: `releaseWeek: 100,
settledWeek: 99` (explicit, not relying on the factory default), asserts
`buildLegacyManifest(...)` throws. **Fails** against the reference module
(no such check exists yet). See §1's prerequisite note and §3 for the
factory-default fix this leaf's *rule* required across the rest of the file.

## 3. Re-check of every leaf that relied on the old `settledWeek` default

Read every `filmFact(...)` call site in the file (there is no other way to
be sure). Three categories:

1. **Explicit `settledWeek`/`status` already given** — the vast majority of
   fixtures that care about settlement at all (`hits`, `buildAllStarFacts`,
   `buildNoneFacts`, `F-OTHER`, `F-RUN`, `F-SETTLED`, `F-INRUN`, the two
   `open-19`/A2 leaves). Untouched, unaffected by the default change.
2. **No explicit `settledWeek`, `releaseWeek` left at the factory's own
   default (10)** — old and new default agree (`10` either way, since
   `10 + 10 = 20` is still `≥ 10`, so no refusal either way regardless).
3. **No explicit `settledWeek`, `releaseWeek` overridden upward** — every
   N-1/N helper (`acclaimed`, `allComedy`, `hits` is explicit so excluded,
   `buildDecades`, artistic-voice's `build`), `creditedCampaign`,
   `foundryCampaign`, `P4FILM-ONLY`, `F-AFTER`, `F-IN`/`F-OUT`, `F1`/`F2` in
   the audience-score leaves, `DA-LIKED`/`DA-UNLIKED`/`DB-1`/`DB-2`,
   `amendment-2`'s `build`, `amendment-3`'s `midFilms`/`incumbentFilms`, the
   20,000-film `BIG-*` fixture, `legacy-closed-before-boundary`'s
   `acclaimedFilms`. For every one of these, none of the leaves that use
   them assert anything about `commercial-engine`, `catalog.counts.settled`
   or `inReleaseAtBoundary` (the only places `settled` status is read) — they
   test `artistic-voice`, `audience-institution`, `genre-specialist`,
   `talent-foundry` or structural/ref-resolution properties, none of which
   read the settled flag. So the *only* risk from the new dynamic default
   was a spurious **refusal** once OPEN-19's check exists in production
   (checked: `releaseWeek + 10` is always `≥ releaseWeek`, so no fixture in
   this category can trip the new rule), never a changed assertion value.
   `LATER-FILM` (`legacy-no-leak-later-state`, releaseWeek 6300, explicit
   `grossSettled` only) is excluded from `releasesOf` entirely regardless
   (its `releaseWeek ≥ B`), so its settledWeek value never reaches any
   archetype either way.

Confirmed by the RED-at-HEAD run (§5) and the reference run (§6): every leaf
in category 3 is in the 68 that **pass** against the reference module, none
of them among the 4 planned failures — meaning the default fix did not
silently change any *other* leaf's expected outcome, only prevented a future
spurious refusal.

## 4. Grep for old-behavior literals (brief step 8)

```
grep -n "settledWeek: 10"        → 3 hits, all EXPLICIT and self-consistent
                                    (releaseWeek matches exactly: F-OTHER
                                    100/100, `hits` helper 10+i*20/10+i*20,
                                    F-SETTLED 10/10). None is a stale factory
                                    default; none violates settledWeek >=
                                    releaseWeek.
grep -n "synchronized-sound']"   → 2 hits: line 734 (D2-corrected, sorted,
                                    WITH lighting-control-01, correct) and
                                    line 2207 (OPEN-12 leaf 2, deliberately
                                    isolated to `technologies: [SYNC_SOUND]`
                                    only — correct, not a missed D2 case).
grep -n "contraryCount).toBe(0)" → 3 hits: legacy-not-recorded-resilient-
                                    survivor (notRecorded, no domain — N/A to
                                    pioneer), legacy-not-recorded-awards-
                                    dynasty (N/A), open-12 leaf 1 (intentional
                                    new expectation). No leftover pre-D2
                                    "0" on a pioneer contrary that should now
                                    be nonzero.
grep -n "week}:\${\|snapshotId"  → 0 hits in the test file (the week-derived
                                    ref-id format only ever existed in
                                    production, never asserted as a literal
                                    pattern in tests).
```
No stale literal found.

## 5. RED run output at HEAD (module still missing)

Scratch tree at commit `26af680` (r4 test content, `src/core/
campaignLegacy.ts` absent — confirmed by `ls` before the run).
`node_modules/.bin/vitest run --project core tests/p15c1-campaign-legacy.test.ts`:

```
Test Files  1 failed (1)
     Tests  72 failed (72)
```

Every leaf fails; the only leaf whose failure is **not** a module-load
error is `tuning-legacy-bounded-terms` (it imports the real, already-existing
`src/core/tuning.js` directly and fails on a genuine value mismatch:
`expected undefined to be 70`, since the `LEGACY_*` keys are absent from
today's `TUNING` object) — exactly the file header's documented exception,
confirmed by running it rather than asserted. 72 = the 66 leaves of r3 plus
the 6 new leaves of this revision (a1, a2, a3, both OPEN-12 leaves, OPEN-19).

Type gate at the same commit: `node_modules/.bin/tsc --noEmit` → 19 errors,
exit 2. Diffed against the same gate run on the unmodified `0274ed2 red-r3`
commit: byte-identical except the module-missing line's column shifted from
`57,24` to `81,24` (the new file-header comment block I added moved that
`import` line down by 24 lines) — same file, same message, same 18 unrelated
Save43-sweep-fallout diagnostics (`SaveFileV43` not assignable to
`SaveFileV42`, pre-existing, none naming `campaignLegacy.ts` or `tuning.ts`,
matching the production handback's own §5 report of "step 2": 19 errors).
`tsc -p ui/tsconfig.json --noEmit` → 2 errors, exit 2 (both Save43 fallout,
`p14c2b-fixtures.ts`, `p14c4-fixtures.ts`). `tsc -p tsconfig.bridge.json` →
2 errors, exit 2, same two files. Both match the production handback's own
§5 UI/bridge report exactly (2 errors each, unrelated to this module).

## 6. Reference run (mandatory, brief step 7)

Copied `src/core/campaignLegacy.ts` and `src/core/tuning.ts` from the
writer's scratch tree `$S/1353-prod/tree` (step 2: `4f6e43d`) into my own
tree at commit `26af680`, as a **throwaway** commit (`1a28243`, message
marked `THROWAWAY … never for handback`), never touching the writer's tree.
Blob hashes confirmed equal to the writer's own reported values before
running anything:

```
campaignLegacy.ts  76e3777c839f69ebc038f86e771fdf6da3b3dbba  (writer: 76e3777c)
tuning.ts           3d7e101895340815f467d1484123f6f727bfc3fd  (writer: 3d7e1018)
```

`node_modules/.bin/vitest run --project core tests/p15c1-campaign-legacy.test.ts`:

```
Test Files  1 failed (1)
     Tests  4 failed | 68 passed (72)
```

| Leaf | Result | Reason | Classification |
|---|---|---|---|
| `a1-ranking-ref-cites-record-id-never-week-derived` | fail | `expected '100:S' to be 'PR-777'` | A1, planned |
| `a2-market-assessment-cut-by-week-outside-b-excluded` | fail | `expected 2 to be 1` (no week-based cut yet) | A2, planned |
| `open-12-entrant-after-commercial-week-carries-no-contrary-for-it` | fail | `expected 2 to be +0` (no enteredWeek gate yet) | OPEN-12, planned |
| `open-19-settled-week-before-release-week-refuses` | fail | `expected [Function] to throw an error` (no check yet) | OPEN-19, planned |
| every other leaf (68) | pass | — | matches D1-D4/A3/OPEN-12-leaf-2, or unaffected by this revision |

**Every failure is one of the five planned changes** (A1, A2, A3 — which
passed, see §2 — OPEN-12, OPEN-19); no unplanned failure, so no RED defect
to fix before handback. This matches, leaf-for-leaf, what §2 predicted by
hand before the run (the hand derivation was written first; the run
confirmed it, never the reverse). Full raw output retained in this session's
scratchpad (`$S/1353-work4/reference-run.txt`, `red-r4-at-head.txt`,
`tsc-root-at-r4.txt`, `tsc-root-at-r3.txt`, `tsc-ui-at-r4.txt`,
`tsc-bridge-at-r4.txt`) for reproduction; not copied into the real repo per
the "write only your handback files" boundary. After the run, the throwaway
commit was discarded: `git reset --hard 26af680` (confirmed: `ls
src/core/campaignLegacy.ts` → no such file; `git status --short` → clean).

## 7. Temporary-index apply check vs HEAD

Real repo, `c614b7e9`, scratch index (`GIT_INDEX_FILE`, real index and
worktree untouched throughout):

```
git read-tree c614b7e9
git apply --cached --check 1353-p15c-red-r4.patch   → OK
git apply --cached 1353-p15c-red-r4.patch
```

Resulting blobs: `tests/p15c-wave-r-retention.test.ts` →
`1f3e963a1ff62cd5f449cebae0b17598278c9547` (identical to r3's own patch
blob — Wave R is byte-for-byte unchanged); `tests/p15c1-campaign-legacy.test.ts`
→ `975a94fd00fad69c612d87c1b6fc7f4a1a0b2619`, whose content sha256
(`008327b0…3be13`) is byte-identical to the working file in my scratch tree
at `26af680`. The patch is a full diff vs HEAD (both files as new-file
creations, matching r3's own patch structure), so it was checked by itself
against a fresh index at `c614b7e9`, not stacked on r3.

## 8. Handback files

- `$E/1353-stage/1353-p15c-red-r4.patch` — tests only, full diff vs HEAD
  (sha256 `5b628ccf…8da1aae`), 2567 lines.
- `$E/1353-stage/1353-p15c-red-r4-classification.json` — 78 rows (72
  `p15c1-campaign-legacy.test.ts` + 6 `p15c-wave-r-retention.test.ts`), one
  per leaf, `{file, leaf, requirement, redStatus, redReason, referenceRun}`.
  The 6 Wave R rows carry `referenceRun: "pass"` with an explicit
  `referenceRunNote` field stating they were **not executed** (MACHINE LOAD:
  never run the Wave R file; a recorded measurement may still be running)
  and that "pass" here records that the file never imports
  `campaignLegacy.ts` at all, so the reference module is structurally
  irrelevant to it — not an observed run result. This is an evidence limit,
  not a claim of having run that file.
- This record.

## 9. Return

**DONE.** Covered: 1353-A §5/§8 as amended (r3, unchanged), the §8 delta of
1353-E (D1-D4), the three Wave-2-charter amendments folded into Wave 1
(1359-A §3.3 A1-A3), and the two open points 1353-F4 changed (OPEN-12,
OPEN-19) — all in `tests/p15c1-campaign-legacy.test.ts`. `tests/p15c-wave-r-
retention.test.ts` is unchanged (byte-identical to r3).

What changed: see §1-§3. Every changed/added expectation is hand-derived
against the cited authority before being checked against the reference
module (§6), not copied from it.

Checks run: RED-at-HEAD (72/72 fail, TUNING leaf's exception confirmed, §5);
root/UI/bridge type gates (19/2/2 errors, all pre-existing Save43 fallout
plus the one expected module-missing line, §5); reference run against the
writer's step-2 module at its reported blob hashes (68 pass / 4 fail, all
four failures are planned, §6); temporary-index apply check vs real HEAD
(§7). Not run: Wave R file (MACHINE LOAD authorization), any broader suite,
Wave 2/3/4 material.

Remaining defects / open items for the writer's step 3: implement A1
(`recordId` field + ref uses it), A2 (`week` field + cut at B), OPEN-12 (the
`enteredWeek ≤ commercialWeek` gate in `technologyPioneer`'s contrary loop),
OPEN-19 (`settledWeek < releaseWeek` refuses in `readFacts`). A3 needs **no**
production change — it already holds (§2); the writer's step 3 handback
should say so explicitly with a reference-check rerun, per 1353-F4's "Next"
item 2, rather than silently no-op it.

Evidence limits: this revision's own correctness rests on my hand
derivations plus one reference implementation (the writer's own step-2
module, not an independent second derivation — 1353-E's own independent
`reference.ts` was for the writer's D1-D4/probe findings, not for A1-A3/
OPEN-12/OPEN-19, which did not exist yet when that reference.ts was written).
No native, save or tick integration exists in Wave 1; nothing beyond the
pure law was exercised.
