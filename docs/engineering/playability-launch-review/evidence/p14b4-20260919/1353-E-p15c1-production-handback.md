<!-- 1353-E: single production writer (sim-core) handback for P15C Wave 1, written by the writer in the real repo; the production and per-step patches sit beside it in 1353-stage/. -->

# 1353-E: P15C Wave 1 production handback, `campaign-legacy/v1`

**Status: BLOCKED on the final RED.** `src/core/campaignLegacy.ts` implements 1353-A §5 as amended by 1353-F,
1353-F2 and 1353-F3. Against the unchanged final RED (r3) it passes 12 of 66 leaves. The other 54 fail because the
adopted `LegacyFacts` carries no `baseMarketValue`, which the commercial-engine predicate needs (D1). With that one
fact added to the RED's `baseFacts`, 59 pass. The remaining 7 leaves contradict the charter (D2 to D4). Against a
charter-derived correction of those leaves, all 66 pass. An independent reference transcription agrees with every
manifest the leaves produce. The parent must rule on D1 and have the RED amended before this patch can land.

`$E` = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`; `$S` = this session's scratchpad
(`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad`).

## 1. Base and method

- BASE `c614b7e9ed62dcb889118ba1eadb8a2bafa7934a`, confirmed with `git rev-parse HEAD` at start. HEAD at the end is
  the same commit. `git diff --stat c614b7e9 HEAD -- src/core/tuning.ts src/core/campaignLegacy.ts
  tests/p15c1-campaign-legacy.test.ts tests/p15c-wave-r-retention.test.ts` is empty, so no file I touch moved.
- 1327-C scratch method at `$S/1353-prod/tree`: `git archive` of BASE (src bridge ui generated scripts package.json
  package-lock.json tsconfig*.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md) plus tests without
  fixtures; docs, node_modules, art, tools and tests/fixtures linked. Scratch commits: `96a7046 base`,
  `0691458 red-r3` (r3 patch sha256 `fd6c8472…bc41bc7`; the Wave R file's sha256 `ef56cad2…b036f517` matches
  1353-C3), `904f9ab step1`, `4f6e43d step2`.
- In the real repo I wrote only this record and the three patches of §2.

## 2. Files

| File | Content | sha256 |
|---|---|---|
| `$E/1353-stage/1353-p15c1-production.patch` | `red-r3..step2`: new `src/core/campaignLegacy.ts` (799 lines), `src/core/tuning.ts` +22 | `3bd173d4…a134ee1` |
| `$E/1353-stage/1353-p15c1-production-step1.patch` | cumulative to step 1: the law and the §5.5 TUNING block | `e59bf629…da755b5` |
| `$E/1353-stage/1353-p15c1-production-step2.patch` | cumulative to step 2, identical to the production patch: `freezeLegacy` refuses a malformed root at the freeze week; pioneer and the technology lens share one operational-adoption list | `3bd173d4…a134ee1` |

Resulting blobs: `campaignLegacy.ts` `76e3777c`, `tuning.ts` `3d7e1018`.

Scope held: no GameState, save root, adapter, tick step, projection, Bridge, UI, RNG, clock or `index.ts` export. The
module imports `campaignDate` (calendar.ts), the `FinancialStrengthBand` type (powerRanking.ts), `GENRE_ORDER` and
`TUNING` (tuning.ts), and the `Genre` and `Standing` types. No fact type has a cash, cost or revenue field, and no
error message prints a value: each names a field path or id and the rule.

## 3. The law by charter section (`campaignLegacy.ts` lines)

| Charter | Where | What |
|---|---|---|
| Header | :1-62 | The whole law in prose: cut, completeness, the eight archetypes, lenses |
| §5.1 boundary | :71 | `LEGACY_BOUNDARY_WEEK = (2040 − 1920) × 52`, derived |
| §5.1 cut | :400-428, :502-504, :675-678, :708 | Campaign releases below B; settled before B means `settledWeek < B` (:411), otherwise in release at the boundary; manifest studios entered before B in (row, studioId) order; condition events `week < B`; ranking snapshots `week ≤ B` |
| §5.1 in run at B | :342-345, :610-620 | An in-run film carrying a settled week or gross refuses; commercial engine reads only films settled before B |
| §5.1 freeze | :789-799 | `freezeLegacy` returns `root` itself unless the produced week is 6240 and `official === null`; a malformed root refuses at 6240; otherwise a fresh root with the official manifest |
| §5.2 manifest | :172-199, :565-577, :535-546, :752-787 | Types; refs capped at 12 per side with exact counts; source rows (a 17th domain refuses at :273 and :538); `postFinaleMode` only on `official2040` (:783); `official2040` requires B = 6240 (:755) |
| F2 §1 domain tags | :338, :384, :563, :650 | Film and career-event refs carry the fact's own tag; an event's tag must pair with its film's |
| F2 §4 completeness | :284-288, :523-556 | Status per domain and per studio; a row dated before its own domain's `recordedFromWeek`, or in a domain with no recording, refuses |
| §5.3 artistic-voice | :580-588 | |
| §5.3 audience-institution | :590-608 | Amendments 1 and 3, F3 §1 best/worst per decade, F2 §5 limitedBy for eventless releases; agreement refuses at :391-397 |
| §5.3 commercial-engine | :610-620 | `100 × gross ≥ P × baseMarketValue` |
| §5.3 technology-pioneer | :622-648 | Amendment 4: S's own earliest operational adoption; technology id when none before B |
| §5.3 talent-foundry | :413-433, :650-660 | Discoveries: authored credit first disqualifies; a shared first week counts for each owner |
| §5.3 genre-specialist | :662-672 | Amendment 2: `2 × count > n` |
| §5.3 resilient-survivor | :674-697 | notRecorded without the condition domain |
| §5.3 awards-dynasty | :774 | notRecorded, no count, ref or number |
| §5.4 lenses | :699-749 | F2 §2 count keys; a notRecorded lens has no count and no ref |
| §5.5 TUNING | `tuning.ts` :1018-1038 | 15 keys at the charter values; each comment states "positive integer", the range `tuning-legacy-bounded-terms` asserts, and the header says a change bumps `CAMPAIGN_LEGACY_DEFINITION` |

## 4. Test runs

Scratch tree, `node_modules/.bin/vitest run --project core <file>`. Wave R was not run (brief).

| Run | Result | Duration |
|---|---|---|
| Final RED r3, unchanged, at step 2 | **54 failed, 12 passed (66).** 51 leaves: `Error: campaign legacy: baseMarketValue must be a finite positive amount`. 3 leaves: `expected [Function] to not throw an error but 'Error: campaign legacy: baseMarketVal…' was thrown` | 3.0-4.5 s |
| Probe A: r3 plus `baseMarketValue: BMV` in `baseFacts` and its local type (D1 only) | 59 passed, 7 failed: the D2, D3 and D4 leaves of §7 | 3.5 s |
| Probe B: probe A plus the D2-D4 corrections of §8 | **66 passed** | 3.9 s |

Leaves passing on the unchanged RED: `campaign-legacy-definition-version-export`, `legacy-bounds-constants`,
`legacy-owner-swap-no-role-field-structural`, `legacy-determinism-no-rng-or-clock-import`,
`legacy-bounds-ninth-archetype-thirteenth-lens-structurally-impossible`,
`legacy-refs-resolve-playerRuns-domain-never-cited-by-a-ref`,
`legacy-frozen-once-non-freeze-week-returns-root-unchanged`, `legacy-completeness-row-before-recorded-from-week-refuses`,
`legacy-public-facts-only-structural-no-cash-cost-revenue-key`, `legacy-audience-score-disagreeing-events-refuses`,
`legacy-mode-inert-no-other-src-core-module-reads-it`, `tuning-legacy-bounded-terms`. Two of them pass vacuously on
the unchanged RED: the row-before and disagreeing-events leaves throw on the missing `baseMarketValue`. Under probe B
each throws for its own reason (§6).

The probes are scratch copies (`$S/1353-prod/probes/probeA-bmv.test.ts`, sha256 `c1d375f2…`;
`probeB-charter.test.ts`, `f210d12c…`), copied into the tree as untracked files for each run and deleted after. They
are evidence for the parent. The RED was not edited. Raw outputs: `$S/1353-prod/final-red-unchanged{,-verbose}.txt`,
`final-probeA.txt`, `final-probeB.txt`.

## 5. Type gates

Run on the final scratch commit `4f6e43d` and, as the baseline, on `0691458 red-r3` (no production change):

| Gate | Command | red-r3 | step 2 | Difference |
|---|---|---|---|---|
| root | `node_modules/.bin/tsc --noEmit` | 20 errors, exit 2 | 19 errors, exit 2 | Only the RED's expected `tests/p15c1-campaign-legacy.test.ts(57,24): error TS2307: Cannot find module '../src/core/campaignLegacy.js'` disappears |
| UI | `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` | 2 errors, exit 2 | 2 errors, exit 2 | byte-identical output |
| bridge | `node_modules/.bin/tsc -p tsconfig.bridge.json` | 2 errors, exit 2 | 2 errors, exit 2 | byte-identical output |

Every remaining diagnostic predates this record. Each reports a `SaveFileV43` passed where an older test or helper
expects `SaveFileV42` (for example `tests/helpers/p14c2b-fixtures.ts(69,106)`, `tests/save.test.ts`): Save43 sweep
fallout, which 1344-L is measuring. None names `campaignLegacy.ts`, `tuning.ts` or a p15c test. Times on the final
commit: root 140 s, UI 175 s, bridge 119 s. `tsc -p tsconfig.src.json` exits 0. Outputs:
`$S/1353-prod/tsc-{root,ui,bridge}.txt` and `tsc-{root,ui,bridge}-base.txt`.

## 6. Independent reference check (kept out of the patch)

Files in `$S/1353-prod/refcheck/`: `capture-module.ts` (`043d40d1…`), `capture.workspace.mjs`, `reference.ts`
(`fad15da3…`), `purity-check.ts` (`d41a9f64…`), captures `captured-{A,B}.jsonl`, outputs `refcheck-{A,B}.txt`.

1. **Capture.** A scratch Vitest workspace aliases the RED's `../src/core/campaignLegacy.js` import to a recorder that
   re-exports the module and appends every `buildLegacyManifest` call (leaf name, facts, kind, then the manifest or
   the error) to a JSONL file. Probe A and probe B each produce 63 calls from 54 leaves. The other 12 leaves never
   call the builder: surface constants, structural checks and `freezeLegacy`-only leaves.
2. **Reference.** `reference.ts` imports nothing from `src/`. It re-types the §5.5 constants from the charter table,
   computes the decade with amendment 3's formula `floor((1920 + floor(week / 52)) / 10)` rather than
   `campaignDate`, and evaluates every predicate by brute force: per-person credit scans for discoveries, per-film
   event filters for scores, and an explicit `cancelledWeek === null` test where the module relies on validation. It
   rebuilds each full manifest (kind, definition, boundary, mode, sources, studios, archetypes, lenses) and compares
   canonical JSON with the module's. For the open points of §9 it transcribes the same stated resolutions, so it
   checks the implementation, not the resolutions.
3. **Result.** Probe A: 59 manifests, **59 matched, 0 mismatched**, 4 refusals. Probe B: 58 manifests, **58 matched,
   0 mismatched**, 5 refusals. Every refusal fires for its intended reason:

   | Leaf | Message |
   |---|---|
   | `legacy-in-run-at-boundary-counts-critic-not-commercial` | `films[0] (F-LEAK) must carry no settledWeek or grossSettled while in run: only a settled gross is public` |
   | `legacy-bounds-seventeenth-domain-refuses-sixteen-succeeds` | `domains must name at most 16 domains` |
   | `legacy-completeness-row-before-recorded-from-week-refuses` (probe B only) | `films[0] (F-TOO-EARLY) is dated before domain playerFilms's recordedFromWeek (law 7: no backfill)` |
   | `legacy-audience-score-disagreeing-events-refuses` | `careerEvents of film F1 must agree on the at-release audience score` |
   | `legacy-official-2040-requires-boundary-week-6240` | `boundaryWeek must be 2040 · Week 1 for the official Legacy` |

   Probe A's reference also agrees with the module on the seven leaves the RED fails. The two derivations, written
   separately, give the same charter answer (for example S-P53's `lighting-control-01` contrary and 6,230 releases
   inside B in the 20,000-film fixture).
4. **The check can fail.** I injected two law defects into the scratch module, one at a time, and recaptured under
   probe B. `2 × liked > scored` (a strict majority for an audience decade) gave `MISMATCH amendment-1-audience-
   institution-exactly-half-liked-qualifies` and one RED failure. `≥` on the late-adopter threshold gave `MISMATCH
   legacy-archetype-edges-technology-pioneer-late-plus260-no-plus261-yes` and one RED failure. The module was
   restored from a copy; its sha256 before and after was `1531b2f6…71c81f9` (the pre-refactor step 2). The final
   step 2 was then re-verified: 58/58 and 59/59 matched.
5. **Purity.** `purity-check.ts` rebuilds every captured manifest from deep-frozen facts (a write would throw in
   strict-mode ESM), compares it with the captured manifest, reverses every input array and demands byte-identical
   `JSON.stringify` output, and checks that no output object is shared with the input. Probe A: 59 manifests, 0
   failures. Probe B: 58 manifests, 0 failures.

## 7. Findings against the authority (blocking)

**D1. `LegacyFacts` has no `baseMarketValue`.** Charter §5.3 defines commercial engine by
`100 × gross ≥ LEGACY_HIT_REACH_PERCENT × baseMarketValue`. The RED brief listed `baseMarketValue` among the facts,
but the shape proposed in 1353-C and accepted as authored in 1353-F2 omits it. The RED declares
`const BMV = 1_000_000 // baseMarketValue, an arbitrary but fixed fixture constant` and never passes it to the law.
Its fixtures hold only for a value in (166,667, 1,055,555]. Worldgen draws the real value uniformly from
[20,000,000, 80,000,000] (`WORLD_CONFIG.marketValueRange`, tuning.ts:2054). No correct law can pass the unchanged RED:
a hard-coded 1,000,000 would count almost every real film as a hit, and a default would invent a value.
- Implemented (a proposal awaiting the parent's ruling): a required top-level `baseMarketValue: number`, refused
  unless finite and positive. It follows the P15A.2 precedent `RankingInput.baseMarketValue` (powerRanking.ts:53) and
  the RED brief's own list.
- Alternative: a `baseMarketValue` on each film fact. That repeats one world constant on every row, and an adapter
  bug could make rows disagree.
- Recommendation: adopt the top-level field and add `baseMarketValue: BMV` to the RED's `baseFacts` and local type
  (two lines, §8).

**D2. `baseFacts` ships a second technology that five leaves forgot.** `baseFacts` supplies
`technologies: [SYNC_SOUND (416), LIGHTING (936)]`, and every studio defaults to `enteredWeek: 0`. Amendment 4:
"For each technology commercial while S was entered, … It is the technology's ID when S has no operational adoption
before B." Lighting control is commercial from week 936 while every such studio is entered, so a studio with no
lighting adoption gets the contrary ref `lighting-control-01`. The hand derivations in 1353-C and the reviews 1353-D
and 1353-D2 counted synchronized sound only. Effect under probe A:
- `…-plus52-qualifies-plus53-does-not`: S-P53 `contraryCount` is 1, the RED expects 0;
- `…-late-plus260-no-plus261-yes`: S-L260 is 1 (expects 0), S-L261 is 2 (expects 1, `['A-L261']`);
- `…-cancelled-adoption-excluded`: 2 (expects 1, `['synchronized-sound']`);
- `amendment-4-…`: Y's contrary is `['Y-LATE', 'lighting-control-01']` (expects `['Y-LATE']`);
- `legacy-refs-resolve-…-with-exact-domainId`: the technology-id contrary refs are lawful (1353-F2 §1 maps them to
  `'technologyCatalogue'`), but the leaf's `knownIds` omits technology ids, so `expect(knownIds.has(ref.id)).toBe(true)`
  fails.

The RED's expectations match no reading of the charter text, since lighting control is commercial while each of
these studios is entered under any reading of "while S was entered". Correct the RED (§8), or give the technology in
question its own `technologies` list in those leaves. A charter change that limits technology-id refs to studios with
some adoption record of that technology would drop the never-adopted laggard the amendment names, and it needs a
dated adoption row the facts do not carry. I recommend correcting the RED.

**D3. The row-before-`recordedFromWeek` leaf tests the wrong domain.** `legacy-completeness-row-before-recorded-from-
week-refuses` sets `playerFilms.recordedFromWeek = 500` and adds `F-TOO-EARLY` at week 100, but `filmFact` tags every
film `'industryFilms'` by default (test :197), and `industryFilms` records from week 0. 1353-F2 §4 refuses "a row
dated before its domain's recordedFromWeek". F-TOO-EARLY is not before its own domain's start, so a correct law does
not refuse it. The leaf predates the 1353-C2 tags, and 1353-C2 turned it silent. It passes on the unchanged RED only
because the missing `baseMarketValue` throws first. Fix: `domainId: 'playerFilms'` on that film.

**D4. The 20,000-film fixture mostly lies past B.** `legacy-bounds-refs-capped-at-12-counts-exact-past-12-on-20000-
films` releases film i at week `10 + i`, so weeks 6240-20009 hold 13,770 films outside the cut (§5.1, RED 2). The
law counts the 6,230 inside and the leaf expects 20,000. Fix: keep every release below B, for example
`10 + (i % 6230)`.

## 8. Proposed RED delta (probe B minus the final RED; for the test author, not applied)

Each changed line carries a `PROBE-B Dn` comment. The D2 lines compare sorted ids because the charter states no
order for pioneer contrary refs (§9, OPEN-12).

```diff
@@ type LegacyFacts
   boundaryWeek: number
+  baseMarketValue: number
@@ function baseFacts
     boundaryWeek: 6240,
+    baseMarketValue: BMV,
@@ legacy-archetype-edges-technology-pioneer-plus52-qualifies-plus53-does-not
-    expect(p53.contraryCount).toBe(0) // neither pioneer nor late: a middle adopter
+    expect(p53.contraryCount).toBe(1) // PROBE-B D2: sync-sound middle adopter; lighting never adopted -> tech id
+    expect(p53.contrary.map((r: any) => r.id)).toEqual(['lighting-control-01'])
@@ legacy-archetype-edges-technology-pioneer-late-plus260-no-plus261-yes
-    expect(l260.contraryCount).toBe(0)
+    expect(l260.contraryCount).toBe(1) // PROBE-B D2: lighting only
+    expect(l260.contrary.map((r: any) => r.id)).toEqual(['lighting-control-01'])
-    expect(l261.contraryCount).toBe(1)
-    expect(l261.contrary.map((r: any) => r.id)).toEqual(['A-L261'])
+    expect(l261.contraryCount).toBe(2) // PROBE-B D2
+    expect(l261.contrary.map((r: any) => r.id).sort()).toEqual(['A-L261', 'lighting-control-01'])
@@ legacy-archetype-edges-technology-pioneer-cancelled-adoption-excluded
-    expect(result.contraryCount).toBe(1)
-    expect(result.contrary.map((r: any) => r.id)).toEqual(['synchronized-sound'])
+    expect(result.contraryCount).toBe(2) // PROBE-B D2
+    expect(result.contrary.map((r: any) => r.id).sort()).toEqual(['lighting-control-01', 'synchronized-sound'])
@@ legacy-bounds-refs-capped-at-12-counts-exact-past-12-on-20000-films
-      filmFact({ filmId: `BIG-${i}`, studioId: 'BIG', releaseWeek: 10 + i, criticScore: 90 }))
+      filmFact({ filmId: `BIG-${i}`, studioId: 'BIG', releaseWeek: 10 + (i % 6230), criticScore: 90 })) // PROBE-B D4: every week < 6240
@@ legacy-refs-resolve-every-ref-is-a-real-id-below-boundary-with-exact-domainId
+    const technologyWeeks = new Map(facts.technologies.map((t) => [t.technologyId, t.commercialWeek])) // PROBE-B D2
-      ...filmWeeks.keys(), ...eventWeeks.keys(), ...adoptionWeeks.keys(), ...conditionWeeks.keys(),
+      ...filmWeeks.keys(), ...eventWeeks.keys(), ...adoptionWeeks.keys(), ...conditionWeeks.keys(), ...technologyWeeks.keys(),
-          const week = filmWeeks.get(ref.id) ?? eventWeeks.get(ref.id) ?? adoptionWeeks.get(ref.id) ?? conditionWeeks.get(ref.id)
+          const week = filmWeeks.get(ref.id) ?? eventWeeks.get(ref.id) ?? adoptionWeeks.get(ref.id) ?? conditionWeeks.get(ref.id) ?? technologyWeeks.get(ref.id)
@@ legacy-completeness-row-before-recorded-from-week-refuses
-      films: [filmFact({ filmId: 'F-TOO-EARLY', studioId: 'S', releaseWeek: 100, criticScore: 90 })],
+      films: [filmFact({ filmId: 'F-TOO-EARLY', studioId: 'S', domainId: 'playerFilms', releaseWeek: 100, criticScore: 90 })], // PROBE-B D3
@@ amendment-4-pioneer-contrary-uses-own-earliest-adoption-not-industrys-first
-    expect(yResult.contrary.map((r: any) => r.id)).toEqual(['Y-LATE'])
+    expect(yResult.contrary.map((r: any) => r.id).sort()).toEqual(['Y-LATE', 'lighting-control-01']) // PROBE-B D2
```

The full unified diff with context is `$S/1353-prod/proposed-red-delta.diff` (101 lines). The D2 expectations come
from amendment 4 applied to each fixture by hand: S-P53 (sync 469, neither pioneer nor late; no lighting) →
`[lighting]`; S-L260 (sync 676, not late) → `[lighting]`; S-L261 (sync 677 > 676) → `[A-L261, lighting]`; S-CANCEL
(sync cancelled, never operational) → `[synchronized-sound, lighting]`; Y (716 > 676) → `[Y-LATE, lighting]`.

## 9. Points the authority leaves open (resolved in code, awaiting ratification)

The brief says to report undefined points instead of choosing. A module cannot run without an answer to each, so
each is implemented in the plainest reading, named here with an alternative, and changes in one or two lines. None
of them decides any RED leaf's outcome except OPEN-3 and OPEN-12, which the RED pins.

| # | Point | Module | Alternative |
|---|---|---|---|
| 1 | Where `baseMarketValue` lives | Required top-level fact (D1) | Per-film field |
| 2 | Which domains an archetype's `limitedBy` reads | A fixed set per archetype: films read both film domains; audience, foundry and genre also read both event domains; commercial adds `playerRuns`; pioneer reads adoptions and catalogue; survivor reads `corporateCondition`; awards reads `awards`. The law has no role flag, so a studio reads both player and industry domains | Only the domains its own rows carry, which hides a gap when a studio has no rows in a limited domain |
| 3 | Source rows | The ten recordable v1 domains always (absent: `highWatermark` 0, `recordedFromWeek` null, notRecorded), then any other supplied domain by id; more than 16 refuses. No `awards` row, as `legacy-completeness-absent-domain-not-recorded` pins, although §5.2 lists `awards` among the eleven domains and says it "reads notRecorded" | An `awards` row, which the RED forbids |
| 4 | An optional root's array absent while its domain fact is present (most RED fixtures: `corporateCondition`, `powerRanking`, `marketAssessments` at `recordedFromWeek: 0`, arrays absent) | notRecorded, the union of F2 §4 row 1 and F2's "absent means notRecorded"; the source row still copies the domain fact's numbers | Refuse the contradiction, which the RED fixtures do not allow |
| 5 | Condition-event stage names | Validated against P15B's five stages (1352-A §4.2), `from ≠ to` | Accept any string until P15B Wave 2 fixes the fact |
| 6 | "A distress entry later followed by recovery → stable" | Return in a strictly later week; each entry cites its first later return, and shared returns are cited once | Order by (week, eventId), which lets a same-week pair count |
| 7 | "No closure before B" | A closure event before B, or `closedWeek < B` | Closure events only |
| 8 | Genre-specialist refs with no strict majority | No refs, counts 0 | The plurality genre, which needs a genre tie-break |
| 9 | Ranking lens | `bestRank` omitted when no quarter is ranked; ref id `${week}:${studioId}` (a snapshot row has no id); refs latest first | `bestRank: 0`, which reads as a rank |
| 10 | Resilience lens refs | Chronological, first 12 | Latest 12 |
| 11 | People lens `credited` | Distinct people on S's campaign releases before B; authored credits count in no lane (1351-F, adopted in 1353-F) | Include authored credits |
| 12 | Pioneer: "commercial while S was entered"; contrary order | A technology whose `commercialWeek` precedes the end of S's span (closure or B). A 1960 entrant is judged on 1928 sound, and any adoption it makes is late. Contrary ordered by (week, id) | Only technologies that became commercial after S entered, which is fairer to late entrants and needs an Owner-visible rule |
| 13 | A notRecorded lens | `counts: {}`, `refs: []`, as `awards` | Zero counts |
| 14 | Awards-dynasty `limitedBy` | `['awards']` | `[]` |
| 15 | Refusals beyond the RED | Genre disagreement among a film's events; an event whose week or domain does not match its film; a campaign film with an `audienceScore` or credits; an authored film with a week; an adoption both cancelled and operational (installationCancellation.ts:401 forbids it in state); unknown studio or technology ids; duplicate ids; rows in a domain with no recording; an `awards` domain fact | Fewer refusals |
| 16 | Duplicate registry rows | Ordered by (row, studioId), no refusal: RED fixtures give many studios `row: 0` | Refuse, which breaks the RED |
| 17 | Market assessments carry no week | Counted as supplied; the law cannot cut them at B, so the adapter must, or P15A.1 Wave 2 adds a week | Needs P15A.1 Wave 2's fields (1353-A §5.4) |
| 18 | Closure week in the roll call (1353-F note) | Not a `LegacyStudio` field (§5.2 has none); the closure condition event is the contrary ref the view reads | Add `closedWeek` to `LegacyStudio` |
| 19 | `settledWeek` before `releaseWeek` | Accepted: `filmFact` defaults `settledWeek: 10` for films released later | Refuse, which breaks the RED |
| 20 | A root recorded from B or later | Not guarded in `freezeLegacy`; 1353-F2 §4 gives it to Wave 2's RED | Guard now |
| 21 | Eventless films and talent-foundry | Only audience-institution lists the event domain (F2 §5); foundry and the people lens do not, though their credits are equally unknown | Mark those too |

## 10. Return

- **BLOCKED.** Final RED at step 2: 54 failed, 12 passed. Covered: 1353-A §5.1-§5.5 as amended, F2 §1-§5, F3 §1, in
  `src/core/campaignLegacy.ts` and `src/core/tuning.ts` (patches in §2). Against the charter-corrected RED delta of
  §8: 66/66. The reference check matches every captured manifest, and the purity check finds no mutation, drift,
  shared object or input-order dependence.
- Temporary-index apply check on HEAD `c614b7e9` (scratch `GIT_INDEX_FILE`, real index and worktree untouched):
  `git read-tree c614b7e9`; `git apply --cached --check 1353-p15c-red-r3.patch` → OK; applied; `git apply --cached
  --check 1353-p15c1-production.patch` → OK; applied. Resulting blobs equal the scratch tree's for all four files
  (`campaignLegacy.ts` `76e3777c`, `tuning.ts` `3d7e1018`, the two test files `8743773c` and `1f3e963a`).
- Not run: Wave R (brief), broad suites, UI tests.
- Evidence limits: the RED passes only under scratch probes, not the final RED. No native, save or tick integration
  exists in Wave 1.
- Next: the parent rules on D1, adopts or amends the §8 delta through the test author (RED r4), and ratifies or
  amends §9. Only then can the 1353 dry run apply r4 plus this patch. If a ruling changes a §9 point, I expect a
  one- or two-line production change and a reference-check rerun.

## Step 3: the 1353-F4 rulings against RED r4

**Status: DONE.** r4 passes 72 of 72 over step 3. Authority: [1353-F4](1353-F4-parent-rulings-on-1353-E.md). D1 was
adopted as implemented. §9 points 1-8, 10, 11, 13-16, 18, 20 and 21 were ratified as implemented. Five rules changed
or were confirmed: A1, A2, A3, OPEN-12 and OPEN-19. RED r4 comes from
[1353-C4](1353-C4-p15c-red-r4-revision.md), `$E/1353-stage/1353-p15c-red-r4.patch`, sha256 `5b628ccf…8da1aae`.

### S3.1 Base and method

- HEAD at the start of step 3 was `c614b7e9`. It then moved four times. The only commit that changed an archived
  path is `3b2dc509`, P15B Wave 1 production: it adds `corporateCondition.ts`, `studioLoan.ts`, two p15b1 tests, and
  10 TUNING keys at the end of the `TUNING` object in `src/core/tuning.ts`, the insertion point my LEGACY block
  also uses. HEAD at the end is `8b4db4e7`, a docs-only commit. `git diff --name-only 3b2dc509 8b4db4e7` over the
  archived paths is empty.
- Scratch tree `$S/1353-prod/tree` (base c614b7e9). The r3 test files were removed and r4 applied with
  `git apply --index`, committed as `0fa9713 red-r4` on top of step 2. The resulting blobs match 1353-C4:
  `tests/p15c1-campaign-legacy.test.ts` `975a94fd`, and the Wave R file `1f3e963a`, unchanged. Step 3 is commit
  `f1aaa54`. §S3.2 to §S3.4 were measured here.
- **Rebase.** A patch cut in `tree` failed the apply check on `3b2dc509`: `error: patch failed:
  src/core/tuning.ts:1014`. I rebuilt a second scratch tree, `$S/1353-prod/tree3`, from `3b2dc509` by the same
  1327-C method: `2500fbd base 3b2dc509`, then `e7e8d73 red-r4`, then `7e04977 step3` rebased. `campaignLegacy.ts` is
  copied byte-identical (`cmp`). The LEGACY TUNING block is unchanged and now sits after P15B's `LOAN_AMOUNT_STEP`,
  at the new end of `TUNING`. §S3.5 re-verifies everything on tree3.
- Starting point: r4 over the step 2 module gave 68 passed and 4 failed, the same 4 leaves 1353-C4 lists: `a1-…`
  (`expected '100:S' to be 'PR-777'`), `a2-…` (`expected 2 to be 1`), `open-12-entrant-after-…`
  (`expected 2 to be +0`), and `open-19-…` (`expected [Function] to throw an error`).

### S3.2 Changes (`campaignLegacy.ts`, 805 lines, blob `4bd9e8ed`)

| Rule | Where | Change |
|---|---|---|
| A1, OPEN-9 | :154-155, :481-483, :736 | `LegacyRankingSnapshotFact` gains `recordId`, required, non-empty and unique. A ranking lens ref's `id` is that `recordId`. The week-derived `snapshotId` helper is deleted. One studio per quarter is still enforced. `bestRank` is still omitted when nothing is ranked |
| A2, OPEN-17 | :156, :505, :507, :717 | `LegacyMarketAssessmentFact` gains `week`, a whole week checked against the domain's `recordedFromWeek` like every other dated row. The market lens counts only rows with `week < B` |
| A3, OPEN-7 | none | **No code change was needed.** Step 2 already reads `closedWeek ≥ B` as open. `conditionEventsBefore` at :682 keeps only condition events with `week < B`: `(f.conditionOf?.get(s.studioId) ?? []).filter((c) => c.week < f.B)`. `resilientSurvivor` at :699 counts `closedWeek` only below B: `const closed = closures.length > 0 \|\| (s.closedWeek !== null && s.closedWeek < f.B)`. The pioneer span at :638, `Math.min(s.closedWeek ?? f.B, f.B)`, also treats `closedWeek ≥ B` as open. Leaf `a3-closure-at-or-after-boundary-reads-open` passed on step 2 and passes on step 3 |
| OPEN-12, changed | :642 | A technology counts for S's pioneer contrary only when `enteredWeek ≤ commercialWeek` and `commercialWeek` precedes the end of S's span (closure, else B). The qualifying side and held-or-not are unchanged |
| OPEN-19, changed | :358 | A settled campaign film with `settledWeek < releaseWeek` refuses. The message: `films[i] (<filmId>).settledWeek must not precede its release week: a run settles only after it opens`. It names the field and the rule and prints no value |

The header comment (:16-21, :47-50, :65) states the new rules. Step 3 does not touch `tuning.ts` (blob `3d7e1018` in
`tree`; `521d06c6` in tree3 once rebased over P15B's keys).

### S3.3 Checks

| Check | Result |
|---|---|
| r4 over step 3, `vitest run --project core --reporter=verbose tests/p15c1-campaign-legacy.test.ts` | **72 passed (72)**, 3.3 s. Output `$S/1353-prod/r4-over-step3.txt` |
| Wave R file | Not run (brief). Its blob is unchanged from r3 |
| root `tsc --noEmit` | 19 errors, exit 2, 94 s. Byte-identical to step 2. Against the red-r3 baseline, only the RED's expected TS2307 is gone |
| UI `tsc -p ui/tsconfig.json --noEmit` | 2 errors, exit 2, 58 s. Byte-identical to the red-r3 baseline |
| bridge `tsc -p tsconfig.bridge.json` | 2 errors, exit 2, 51 s. Byte-identical to the red-r3 baseline |
| `tsc -p tsconfig.src.json` | exit 0 |

The remaining diagnostics are the `SaveFileV43`/`SaveFileV42` test fallout of §5. None names `campaignLegacy.ts`,
`tuning.ts` or a p15c test. Outputs: `$S/1353-prod/tsc-{root,ui,bridge}-s3.txt`.

### S3.4 Reference check, updated to the five rules

`$S/1353-prod/refcheck/reference.ts` (sha256 `eecdc116…fe401a0`; the step 2 version is kept as `reference-step2.ts`)
still imports nothing from `src/`. Changes:
- A1: a ranking ref's id is `r.recordId`.
- A2: market rows count only when `m.week < B`.
- OPEN-12: the contrary loop requires `s.enteredWeek <= t.commercialWeek && t.commercialWeek < spanEnd`.
- A3: already `closedWeek < B` and condition events below B.
- OPEN-19: a new predictor flags any campaign film settled before its release week. That leaf's captured call must
  then carry the `settledWeek must not precede its release week` refusal.

The r4 run was captured through the same recorder: 69 calls from 60 leaves. Result: **63 manifests, 63 matched,
0 mismatched**, 6 refusals, 0 OPEN-19 misses. Each refusal fires for its own rule: the five of §6 plus
`open-19-settled-week-before-release-week-refuses` → `films[0] (F-BAD).settledWeek must not precede its release week:
a run settles only after it opens`. The purity check found 0 failures over the 63 manifests (deep-frozen inputs,
reversed input order, no shared objects).

I injected three reversals into the step 3 module, one at a time. After each, the module was restored from a copy.
Its sha256 was `1e09b2c5…d1d64bda` before and after:

| Injection | r4 | Reference |
|---|---|---|
| Drop the OPEN-12 entry gate | 1 failed | 2 mismatches: `open-12-entrant-after-…` and `legacy-completeness-complete-when-…`. The second is not an r4 assertion: that leaf's `LATE` studio (entered week 600) would again cite `synchronized-sound` (416), which r4 does not check there |
| Drop the A2 cut at B | 1 failed | 1 mismatch: `a2-market-assessment-cut-by-week-outside-b-excluded` |
| Drop the OPEN-19 refusal | 1 failed | 1 OPEN-19 miss: `open-19-…` got a manifest |

### S3.5 Rebased onto 3b2dc509: patches, re-verification and apply check

| File | Content | sha256 |
|---|---|---|
| `$E/1353-stage/1353-p15c1-production-step3.patch` | The full production diff in tree3, `git diff e7e8d73 7e04977`: new `campaignLegacy.ts` (805 lines, blob `4bd9e8ed`), `tuning.ts` +22 after P15B's keys. It applies over HEAD plus r4 | `65b05bbe…54c08bd0` |
| `$E/1353-stage/1353-p15c1-production.patch` | Refreshed. Identical to step 3 (`cmp` equal) | `65b05bbe…54c08bd0` |

Its content lines equal the c614b7e9-based cut. The only difference is the three context lines above the TUNING
insertion (P15B's `LOAN_*` keys in place of `SHARED_MARKET_*`). The parent has committed steps 1 and 2; they keep their
§2 content, cumulative against red-r3 on c614b7e9.

Re-verified on tree3 at `7e04977`:
- r4 passes **72 of 72** (2.4 s; `$S/1353-prod/r4-over-step3-tree3.txt`). This includes
  `legacy-mode-inert-no-other-src-core-module-reads-it`, which now also scans P15B's two new modules.
- The recorder run captured 69 calls. The capture is byte-identical to tree's (`cmp`). The reference check gives 63
  of 63 matched, 6 refusals and 0 OPEN-19 misses. The purity check finds 0 failures.
- Type gates, with tree3's own red-r4 commit `e7e8d73` as the new baseline (it includes P15B):

  | Gate | red-r4 (tree3) | step 3 (tree3) | Difference |
  |---|---|---|---|
  | root `tsc --noEmit` | 20, exit 2 | 19, exit 2 | only the RED's expected `tests/p15c1-campaign-legacy.test.ts(81,24): error TS2307` is gone; the step 3 output is byte-identical to tree's |
  | UI `tsc -p ui/tsconfig.json --noEmit` | 2, exit 2 | 2, exit 2 | byte-identical |
  | bridge `tsc -p tsconfig.bridge.json` | 2, exit 2 | 2, exit 2 | byte-identical |

  No diagnostic names `campaignLegacy.ts`, `tuning.ts`, `corporateCondition.ts`, `studioLoan.ts` or a p15b/p15c test.
  Outputs: `$S/1353-prod/tsc3-{root,ui,bridge}{,-base}.txt`. The p15b1 tests were not run. The P15C block only adds
  keys after theirs.

Temporary-index apply check on HEAD `8b4db4e7`, using a scratch `GIT_INDEX_FILE` with the real index and worktree
untouched: `git read-tree 8b4db4e7`; `git apply --cached --check 1353-p15c-red-r4.patch` → OK; applied;
`git apply --cached --check 1353-p15c1-production.patch` → OK; applied. The resulting blobs equal tree3's for all four
files: `campaignLegacy.ts` `4bd9e8ed`, `tuning.ts` `521d06c6`, `tests/p15c1-campaign-legacy.test.ts` `975a94fd`, and
`tests/p15c-wave-r-retention.test.ts` `1f3e963a`.

### S3.6 Observation, no change made

1353-F4 explains OPEN-12 with "A studio that entered after a technology became commercial cannot pioneer it", and
then rules "Held-or-not is unchanged". I followed the ruling: the qualifying side still reads every operational
adoption by `commercialWeek + LEGACY_PIONEER_WEEKS`. A studio that enters inside that 52-week window can therefore
still pioneer a technology it gets no contrary ref for. For example, a studio entering at week 450 with sound
operational at 460 holds technology-pioneer. The ruling's text allows this, so no leaf fails on it. If "cannot
pioneer it" was meant literally, the qualifying filter needs `enteredWeek ≤ commercialWeek` too, a one-line change
with its own leaf.

### S3.7 Return

- **DONE** for step 3. r4 passes 72/72 on c614b7e9 and on the rebase onto 3b2dc509. The reference check matches
  every captured manifest, and all three type gates match their baselines. The patch applies on HEAD `8b4db4e7` over
  r4. Wave R, broad suites, UI tests and the p15b1 tests were not run.
- Next: parent dry run 1353-X3 (r4 over this patch, plus Part A once the machine is free), then review 1353-J.
