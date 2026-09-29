<!-- 1353-A: drafted read-only by a general-purpose specialist at HEAD 5374e105 from the parent's brief; the parent read it in full and files it unchanged below this line as its proposal for review 1353-B and adoption 1353-F. -->

# 1353-A: P15C 2040 finale, Legacy dossier and post-2040 sandbox: charter, with the Wave 1 (pure law) detail

Parent proposal at HEAD 5374e105, source-only; no tests were run. Authority: Owner rulings 5 and 6 of
[1342-O](1342-O-owner-rulings-p14-p18.md) (approved text [.txt](1342-O-owner-rulings-p14-p18-approved.txt) :63-75),
with rulings 2, 3 and 4 (:29-61); 1122-A D2, D3, D4a; `CODEX-P13-P15-OWNER-RULINGS.md` §4.1 (:295-301); the P15
package ("P15"), builder annex ("annex") and roadmap, all at 2a7ff0d9. Source facts: [1353-W0](1353-W0-p15c-wave0-facts.md),
cited as W0 §n. Every file:line below was re-read at 5374e105.

## 1. What the Owner decided and what this charter authors

Decided:
- Ruling 5: a 2040 ceremony and an interactive Legacy dossier built from recorded history and its completeness
  limits; the official Legacy boundary frozen at 2040; no invented achievements.
- Ruling 6: continued play after the finale under the ordinary simulation, failure risk included. The 2040 snapshot
  stays unchanged and later history stays distinct. Reaching 2040 grants no immortality.
- Ruling 2 and 1122-A D4a: Honors read NOT RECORDED until Awards exists; no private rival balances. Ruling 3: the
  player can fail and gets a recoverable end-of-run record. Ruling 4: no replacement studios.
- Rulings §4.1: "exactly the final documented nonexclusive legacy-archetype model" and no single overall score. The
  documented model is roadmap §18's eight archetypes (roadmap:605-625).

Delegated: the boundary week, archetype predicates and thresholds, manifest shape, ceremony form and the answer for a
failed player. 1342-O's execution order puts delegated rule authoring in writing and under review before
implementation. This charter is that document for Wave 1.

Superseded by rulings 5 and 6, kept as history: "Post-2040 continuation is an Owner decision" (P15:182); the Endless
rows (P15:807, :858); roadmap §21's three options (roadmap:729-737), of which ruling 6 selected the third; the
DECISION-tier "2040 post-finale choice" (P15:756); annex C.5's "Owner-selected mode" row (annex:154);
`postFinaleMode: absent until Owner decision` (annex:330); `postFinaleModeOptions` (annex:452); the refusal
`finaleModeUndecided` (annex:1032); rulings §4.3's open finale presentation and post-2040 mode
(`...OWNER-RULINGS.md:312-317`).

Package text not adopted (authoring, as P15A.2 and P15B did):
- The phase-order law (`phaseId`, `phaseOrdinal`, `phaseOrderVersion`, `p15DomainSequence`, lineage digests;
  P15:667-672, :711-716; annex D.6, E.7). No scheduler catalogue exists (W0 fact 8); a domain's high-watermark is its
  native append position.
- The persisted "presented timestamp" (P15:785-786), which is UI-seen state that annex E.7 forbids (annex:483); and
  page size 25/100 (P15:711), since the dossier keeps the `/industry` 1-50 cap (`bridge/industry.ts:239-240`).

## 2. Facts that shape the law

- Week 6240 is 2040 · Week 1 and 6239 is 2039 · Week 52 (`calendar.ts:13-21`). Weeks 0-6239 span twelve decades.
- `tick()` increments `market.tick` last (`tick.ts:49-52, :1077`). Releases in the tick that produces week W carry
  W−1 (player `releaseTick: currentTick`, `tick.ts:629`; rivals decide pre-increment, `tick.ts:1125`); end-of-week
  steps stamp W (`hollywoodTick.ts:408-415`; `tick.ts:1139-1160`). The tick producing 6240 completes 2039, and the
  6240 ranking window [6188, 6240) is exactly 2039 (W0 §1).
- Film results are frozen at release (`types.ts:253-276`; `hollywoodTypes.ts:37-45`). A rival's gross is public only
  once its run settles (`bridge/industry.ts:66-68`). The Industry page recomputes audience scores from live segment
  shares (`receptionVerdict.ts:103-107`).
- Career events freeze the at-release audience score, genre, critic score and gross for each participant of each
  engaged film, with one producer for every owner (`releaseCareers.ts:11, :57, :74`; `types.ts:2547-2575`). Each live
  rival film has exactly six (`hollywoodValidation.ts:430-435`). The ID is `${filmId}:${talentId}` (`types.ts:2548`).
- Two technologies, commercial at weeks 416 and 936 (`technologyCatalogue.ts:45-66`). Adoptions keep
  `operationalWeek` and `cancelledWeek` per studio (`technologyTypes.ts:93-116`); operational ones are public
  (`bridge/industry.ts:32-38`).
- Standing moves at release (rival `filmReleased {before, after}`, `hollywoodTick.ts:355`; player `standingChanged`,
  `types.ts:1816-1824`) and by rival drift with no receipt (`hollywoodTick.ts:379-380`). No Awards exist
  (`bridge/history.ts:497-498`). P15B's stages are stable, warning, distress, recovery and closed; recovery falls back
  only through warning (1352-A §4.2, 1352-F amendment 2).

## 3. Recording first

Law 7 (P15:395) forbids backfill: a save cites a domain only from its `recordedFromWeek`. Each gap is decided now.

| Gap | Decision | Reason and size |
|---|---|---|
| Rival weekly gross, dropped at settlement (`hollywoodTick.ts:373-378`) | Drop | Final gross and `settledWeek` survive. The curve depends on TUNING (`economy.ts:28-47`), so a derivation is unsafe. No v1 rule reads it |
| Rival Standing drift, no receipt | Drop the trajectory; snapshot Standing at B | Per-release before/after exists for both studios; drift is routine decay, aggregated by law 11 (P15:399) |
| Charts bounded to two snapshots (`hollywoodTypes.ts:146-147`) | Drop | The P15A.2 archive is the quarterly record (1350-A §4); chart rows copy Standing. See §11 Q4 |
| At-release audience score | Derive | Frozen on career events |
| Quarterly rank and band | Record: P15A.2 Wave 2, planned | About 480 snapshots of ≤ 10 rows per century (1350-A:125-128) |
| Distress, recovery, closure | Record: P15B Wave 2, planned | One row per stage transition (1352-A §3) |
| Market pressure | Record: P15A.1 Wave 2, planned | Its own charter sizes it |
| Awards | NOT RECORDED | No source until P08B |
| Player films without participants (`types.ts:269-275`) | Limited | Unrecoverable |

P15C adds no recording root before the freeze. The v1 archetypes read only roots complete from world start (films,
career events, adoptions), so a late migration limits lenses, never an archetype. The live risk is loss: the save is
49.6 MB at week 8791 and misses its size targets (W0 §4), which invites compacting films or career events. Wave R
pins their retention.

## 4. Waves

| Wave | Content | Save / projection | Gate |
|---|---|---|---|
| R | One retention test per root (`studio.releasedFilms`, `hollywood.films`, both career-event roots, `theatricalRuns`, `technology.adoptions`): fails if a row disappears or a field a v1 rule reads changes. P15A.1, P15A.2 and P15B recording roots land as early as their gates allow | none | charter adopted |
| 1 | Pure law `src/core/campaignLegacy.ts`: fact types, cut, archetypes, lenses, builder, freeze step, TUNING | none | charter reviewed and adopted |
| 2 | Root `campaignLegacy`, state-to-facts adapter, freeze as the tick's last step, validation, downgrade refusal when non-empty | one save step at execution | Wave 1 closed; §9 |
| 3 | `/industry` views `legacy` and `legacyCatalog` | one projection step at execution | Wave 2 closed |
| 4 | Web UI ceremony stop and dossier workspace | none | Wave 3 closed; Unity deferred (1342-O:170) |
| 5 | End-of-run manifest for a closed player (§7) | in P15B Wave 4's save step | P15B Wave 4 charter |

The root is `campaignLegacy` because "legacy" already means legacy saves in 784 places (W0 §3).

## 5. Wave 1 law: `campaign-legacy/v1`

### 5.1 Boundary, freeze and films at the boundary

- B = (2040 − 1920) × 52 = 6240, derived from the calendar policy (`calendar.ts:2`). The freeze runs once, as the
  last step of the tick whose produced week is 6240, after the P15A.2 ranking and P15B condition steps. It requires
  `hollywood !== null` and `official === null`.
- A fact is inside when its effective week is below B. A periodic snapshot is inside when its window ends at or before
  B: the 6240 ranking is inside, 6253 is not.
- A save migrated at week ≥ 6240 never produces 6240 and gets no official manifest; its dossier reads
  `legacyEvidenceIncomplete` (annex:1031). A migration-time build would add a second trigger and an unobserved Standing.
- Settled before B: counts everywhere. Released before B and in run at B (week 6235 or later): counts in the catalog
  and the critic, audience, genre and foundry rules, but not in commercial engine, and no gross of it enters the
  manifest, since only gross-to-date is public. The dossier marks it "in release at the 2040 boundary". In production
  at B: outside the Legacy and unlisted; rival projects stay private (P15:541-549).

| Fact | Treatment |
|---|---|
| Films, credits, career events, adoptions, ranking snapshots, condition events | Referenced by stable ID |
| Run status at B | Derived: final payment week < B (rival `settledWeek`; player `releaseTick + totalWeeks − 1`; `legacyCompleted` settled) |
| Each domain's append position | Snapshotted as its high-watermark |
| Standing of each studio | Snapshotted: the one live value that keeps moving after 2040 |
| Archetype results, lens summaries | Persisted (annex G.1). No later version recomputes them; the validator never re-runs them |
| Prose, display order, roll call | Derived at view time |
| Rival cash, costs, studio revenue | Never read |

### 5.2 Manifest

```text
CampaignLegacy  = { version: 1, recordedFromWeek, official: LegacyManifest | null, endOfRun: LegacyManifest | null }
LegacyManifest  = { kind: 'official2040' | 'endOfRun', definition: 'campaign-legacy/v1', boundaryWeek,
                    postFinaleMode: 'ordinary-simulation/v1' | null,  // official only
                    sources: LegacySource[] /* ≤ 16 */, studios: LegacyStudio[] /* entered before B, row order */ }
LegacySource    = { domainId, highWatermark, recordedFromWeek | null, status: 'complete' | 'limited' | 'notRecorded' }
LegacyStudio    = { studioId, standingAtBoundary, archetypes: ArchetypeResult[8], lenses: LensSummary[] /* ≤ 12 */ }
ArchetypeResult = { archetypeId, outcome: 'held' | 'notHeld' | 'notRecorded', limitedBy: domainId[],
                    qualifyingCount, contraryCount, qualifying: LegacyRef[] /* ≤ 12 */, contrary: LegacyRef[] /* ≤ 12 */ }
LensSummary     = { lensId, status, counts: { [key]: integer } /* ≤ 4 */, refs: LegacyRef[] /* ≤ 12 */ }
LegacyRef       = { domainId, id }
```

- v1 domains (11 of 16): `playerFilms`, `industryFilms`, `playerRuns`, `playerCareerEvents`, `industryCareerEvents`,
  `technologyAdoptions`, `technologyCatalogue`, `powerRanking`, `corporateCondition`, `marketAssessments`, `awards`.
  An absent root reads `notRecorded` (`awards` always). A root recorded from after a studio's entry reads `limited`.
- Counts are exact; `count > refs.length` signals truncation. Only cited IDs are stored (annex E.7).
- At the caps: 10 studios × (8 × 24 + 12 × 12) ≈ 3,400 refs, about 140 KB, written once. After the freeze the tick
  pays one week comparison, and the root travels by reference.

### 5.3 Archetypes

Common rules:
- A campaign release of studio S: owned by S, provenance `simulation/v1` or a player record, released before B.
  Authored pre-1920 films are excluded, as in P15A.2's Releases lane (1350-F). `n` counts them.
- Genre comes from the film's career events, else its concept (`bridge/industry.ts:70-74`). The audience score is
  the `audienceScore` on its career events; disagreeing events refuse; a film without events has no score and marks
  `limited`.
- A predicate reads one studio's facts plus shared public facts (catalogue, people's credits), never another studio's
  result, a rank or a role flag. Any number of studios, all or none, can hold any archetype (law 4, P15:392).
- Ties in a list go by release week, then ID (`<`). Order selects which 12 refs show and never decides an outcome.
  Money uses one exact product (`100 × gross ≥ P × baseMarketValue`), as P15A.2's `filmScoreTenths` does
  (1351-stage r2); `baseMarketValue` never changes after world generation (1350-F).

| ID | Held when | Qualifying refs | Contrary refs |
|---|---|---|---|
| `artistic-voice` | `a ≥ LEGACY_MIN_FILMS` and `100a ≥ LEGACY_MIN_SHARE_PERCENT × n`; `a` counts releases with critic ≥ `LEGACY_CRITIC_ACCLAIM_MIN` | acclaimed, highest critic first | critic < `LEGACY_CRITIC_PAN_BELOW`, lowest first |
| `audience-institution` | ≥ `LEGACY_AUDIENCE_MIN_DECADES` audience decades: a decade with ≥ `LEGACY_DECADE_MIN_RELEASES` scored releases, at least half ≥ `LEGACY_AUDIENCE_LIKED_MIN` | each audience decade's best film | each other eligible decade's worst film |
| `commercial-engine` | `h ≥ LEGACY_MIN_FILMS` and `100h ≥ LEGACY_MIN_SHARE_PERCENT × s`; `s` settled releases, `h` those with `100 × gross ≥ LEGACY_HIT_REACH_PERCENT × baseMarketValue` | hits, highest gross first | settled, `100 × gross < LEGACY_FLOP_REACH_PERCENT × baseMarketValue`, lowest first |
| `technology-pioneer` | an adoption, not cancelled, operational before B and by `commercialWeek + LEGACY_PIONEER_WEEKS` | those adoptions, earliest first | per technology commercial while S was entered: first operational later than `commercialWeek + LEGACY_TECH_LATE_WEEKS` (adoption ID) or never before B (technology ID) |
| `talent-foundry` | ≥ `LEGACY_FOUNDRY_MIN_PEOPLE` discoveries each credited on ≥ `LEGACY_FOUNDRY_MIN_CREDITS` films before B. A discovery's earliest credited film is a campaign release of S; authored films come first; a shared first week counts for each studio | first career events, most credits first | discoveries with one credit, first credited before `B − LEGACY_FOUNDRY_SETTLE_WEEKS`, earliest first |
| `genre-specialist` | `n ≥ LEGACY_GENRE_MIN_FILMS` and one genre holds more than half the releases | that genre, highest critic first | other genres, highest critic first |
| `resilient-survivor` | P15B events before B: a distress entry later followed by `recovery → stable`, and no closure before B. `notRecorded` without the domain | each distress entry and its stable return | `recovery → warning` relapses and a closure |
| `awards-dynasty` | never in v1: `notRecorded`, no count, ref or number (rulings 2, 5) | none | none |

The set is roadmap §18's eight, so the documented model stays whole; two cards read NOT RECORDED until their sources
exist, as the Honors lane does (1122-A D4a). The slot "genre specialist or reinvention studio" is authored as genre
specialist; reinvention would take a new definition version.

### 5.4 Lenses v1 (8 of 12)

- `catalog`: releases, settled, in release at B, authored pre-1920; no refs, since `legacyCatalog` pages the list.
- `people`: people credited, discoveries; refs to the 12 most-credited discoveries.
- `technology`: operational adoptions before B, with refs.
- `ranking` (P15A.2 archive): ranked quarters, quarters at #1, best rank; the latest 12 snapshots at that rank.
- `financialBand` (P15A.2 archive): quarters per band. Bands are public (1122-A D2, D3); no lens carries a finance
  number for a rival.
- `market` (P15A.1 root): releases assessed and under pressure; fields follow P15A.1 Wave 2, which lands first.
- `resilience` (P15B events): warnings, distress entries, returns to stable, closure; transitions as refs.
- `awards`: always `notRecorded`.

### 5.5 TUNING (provisional; §9 measures, the Owner playtest judges)

| Key | Value | Reason |
|---|---|---|
| `LEGACY_CRITIC_ACCLAIM_MIN` / `_PAN_BELOW` | 70 / 35 | Critic tiers "strong" and "pan" (`receptionVerdict.ts:48`), copied so a presentation retune cannot move a Legacy |
| `LEGACY_AUDIENCE_LIKED_MIN` | 57 | The "liked" floor (`receptionVerdict.ts:68`) |
| `LEGACY_MIN_FILMS` / `_MIN_SHARE_PERCENT` | 5 / 25 | A pattern, and one film in four, so volume alone cannot qualify (critic median 46.5, `tuning.ts:166`) |
| `LEGACY_HIT_REACH_PERCENT` / `_FLOP_REACH_PERCENT` | 90 / 30 | Pooled p90 reach (`tuning.ts:91`), copied as P15A.2 did; a flop is a third of a hit |
| `LEGACY_AUDIENCE_MIN_DECADES` / `_DECADE_MIN_RELEASES` | 4 / 2 | Forty years; one film does not make a decade |
| `LEGACY_PIONEER_WEEKS` / `_TECH_LATE_WEEKS` | 52 / 260 | Within a year of commercial availability; five years late |
| `LEGACY_FOUNDRY_MIN_PEOPLE` / `_MIN_CREDITS` / `_SETTLE_WEEKS` | 3 / 10 / 260 | Three real careers; five years to earn a second credit |
| `LEGACY_GENRE_MIN_FILMS` | 8 | A majority of eight is five films |

The bounds 16, 8, 12 + 12 and 12 are law constants. B is derived, never tuned.

## 6. The ceremony and the sandbox

- **Trigger and once:** the advance whose result first carries `official`, the tick producing 2040 · Week 1. The web
  UI adds a `SimStopReason` member (`adapter.ts:2567`; the `never` guard at `:3125` forces its copy) and a living-turn
  pause entry (`livingTurn.ts:97-104`). The freeze writes once. A later save does not re-fire the stop; replay from an
  earlier save fires it again in that timeline.
- **Content** (annex M.6 order): "1920 to 2039, recorded 2040 · Week 1"; the roll call of every cohort studio in
  registry row order (`hollywoodTypes.ts:9`) with the archetypes each holds and any closure date; the player's
  dossier (identity, span, completeness, eight cards with both evidence sides, lenses); the sandbox line. No score,
  grade, winner or archetype-count order.
- **The simulation continues.** Ruling 6 left no choice, so the ceremony is a pause and the next advance is ordinary.
  The bridge gains no pending decision or intent (`bridge/session.ts:1007-1070` unchanged). Opening the dossier is
  save-neutral (P15:693) and available from the Lot any time after the freeze.
- **Mode fact:** `postFinaleMode: 'ordinary-simulation/v1'`, written with the manifest, read by no simulation step
  (RED 16). Roots stay append-only; views label rows at or after `boundaryWeek` "After the 2040 Legacy", so no second
  record set is needed. Endless checklist (roadmap:737): screenplays renew (`screenplay.ts:7-12`); cohorts continue;
  no rival enters after 2548 (`calendar.ts:3`, ruling 4); no market normalization, balance support, new achievements
  or Awards; saves stay ordinary. Post-2040 generated content stays in P16+ (`...OWNER-RULINGS.md:337`).

## 7. A player who fails before 2040

Proposal: yes, a dossier. When P15B Wave 4 closes the player at week C, it calls the same builder with
`boundaryWeek = C + 1` and `kind: 'endOfRun'`, stored in `campaignLegacy.endOfRun`. It opens with "Run ended <date>.
This is not the 2040 Legacy." A closure after 2040 writes the same record beside the unchanged official one.

Reason: ruling 3 asks for a recoverable end-of-run record and ruling 5 for a dossier from recorded history. One law
serves both with no second interpreter to drift, and `kind` keeps the official boundary at 2040. Closed rivals need
no manifest of their own; the 2040 roll call carries them. P15B Wave 4 fixes the closure-week semantics (1352-A §7).

## 8. Wave 1 tests (RED list for the test author)

1. `legacy-boundary-week`: B = 6240; `campaignDate` gives 2040 · Week 1 at 6240 and 2039 · Week 52 at 6239; the
   freeze fires only at produced week 6240.
2. `legacy-boundary-cut`: per domain, B−1 inside and B outside; the 6240 ranking inside, 6253 outside.
3. `legacy-in-run-at-boundary`: a film released at 6235 counts in the catalog and the critic, audience, genre and
   foundry rules, never in commercial engine; none of its gross appears.
4. `legacy-archetype-edges`: N−1 against N; shares exactly at threshold; exactly half a decade; a genre at exactly
   half; pioneer +52/+53 and late +260/+261; a cancelled adoption; a foundry authored credit and a shared first week.
5. `legacy-not-recorded`: no condition domain gives resilient survivor `notRecorded`, never `notHeld`; awards dynasty
   is always `notRecorded` with no number; a closure before B gives `notHeld` with the closure as contrary.
6. `legacy-coexist-no-winner`: one fixture where every studio holds every evaluated archetype, one where none does; a
   schema walk finds no score, total, rank, grade or winner key; studios keep row order.
7. `legacy-owner-swap`: the same facts give the same result for player or rival; no role input exists.
8. `legacy-determinism`: permuted inputs give byte-identical manifests; two runs match; no RNG or clock import.
9. `legacy-bounds`: 16, 8, 12 + 12 and 12 hold on a 20,000-film fixture; counts stay exact past 12; a ninth
   definition or seventeenth domain refuses.
10. `legacy-refs-resolve`: each ref resolves below its domain's high-watermark with a week below B; only cited IDs.
11. `legacy-no-leak-later-state`: facts extended through week 6500 (new films, the in-run film's settlement, credits,
    adoptions, condition events) give a byte-identical manifest.
12. `legacy-frozen-once`: once the official manifest exists, any later week or changed facts return the root
    unchanged, and a second official write refuses.
13. `legacy-completeness-no-backfill`: a domain recorded from W after entry reads `limited` with W; an absent root
    reads `notRecorded`; a root recorded from ≥ B never freezes; a row dated before its domain's `recordedFromWeek`
    refuses.
14. `legacy-public-facts-only`: fact types carry no rival cash, cost or revenue; probe values appear nowhere.
15. `legacy-audience-and-end-of-run`: the audience score comes from career events, disagreement refuses, no events
    marks `limited`; boundary C+1 gives `endOfRun` with a null mode, and `official2040` requires B = 6240.
16. `legacy-mode-inert`: no `src/core` module reads `postFinaleMode` except this module and the validator.
17. `tuning-legacy-bounded-terms`: the §5.5 values, positive integers.

Carried to Wave 2 RED: `legacy-ticks-after-freeze` (520 ticks after 6240 leave the root byte-identical),
`legacy-migration-empty-root` (an empty root at the migration week; no ranking, condition or Legacy row created) and
the Wave R retention guards.

## 9. Measurement gate before Wave 2

A read-only probe runs the Wave 1 law over the recorded seeds' natural routes at week 6240, which the endurance
contract already pins (`bridge/testing/c3-active-endurance-contract.ts:12`). Per seed it reports each archetype's
holders, the freeze time and the manifest bytes. An evaluated archetype held by every studio in every seed, or by none
in any seed, sends §5.5 back for retuning and review before integration (resilient survivor exempt while P15B is
absent). No time budget is set here (annex L.5); Wave 2's charter carries the measured numbers.

## 10. Dependencies and order

- **P15A.2 Wave 2** feeds the ranking and band lenses. No archetype needs it, so P15C Wave 2 does not wait; an absent
  archive reads `notRecorded`. It should land early, since its `recordedFromWeek` limits every save's 2040 view.
- **P15A.1 Wave 2** feeds the market lens and lands first (W0 §5). **P15B Wave 2** feeds resilient survivor and the
  resilience lens through the fact type `{eventId, studioId, week, from, to}`, which P15C Wave 2 adapts to P15B's
  persisted shape. **P15B Wave 4** makes the end-of-run call (§7).
- **Allocation:** saves 43-46 are claimed (W0 §5); P15C's steps come from live values at execution.
- **Paging:** a paged `/industry` query (`bridge/industry.ts:238`), never a snapshot section (P15:719; W0 §6). Refs
  resolve through the per-state index (`bridge/industry.ts:46-47`) at O(page + lookup).
- **Order:** review 1353-B, then adoption 1353-F. Wave R and Wave 1 RED go to a test author while the single writer
  works its queue; Wave 1 production queues behind it.

## 11. Questions

Owner questions: none. Rulings 5 and 6 fix the ceremony, dossier, 2040 freeze and sandbox; rulings 2 and 5 exclude
invented Honors and achievements; ruling 3 fixes the end-of-run record; rulings §4.1 fixes the model and forbids a
single score. The boundary week, predicates, thresholds, ceremony form and page size are delegated authoring under
1342-O's execution order, and the playtest judges the TUNING.

For review (1353-B):
- Q1: freeze at 6240 or at the end of 2040. 6240 follows P15 §19's 6,240 weeks and the harness pin; the end of 2040
  would put a year of sandbox-era facts inside the official Legacy.
- Q2: the at-release audience score differs from the Industry page's live score (1350-A fact 6). The dossier labels
  it "Audience score at release".
- Q3: no official Legacy for a save migrated past 2040 (§5.1). Q4: no Standing trend lens; quarterly Standing (about
  480 × 10 rows per century) would have to start in Wave R.
