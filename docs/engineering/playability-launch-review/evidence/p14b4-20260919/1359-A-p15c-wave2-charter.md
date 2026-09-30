<!-- 1359-A: drafted read-only by a charter specialist at HEAD c614b7e9 from the parent's brief; the parent adopts it before review 1359-B. No test, probe or campaign ran. -->

# 1359-A: P15C Wave 2 charter: the Legacy root, the fact adapter and the 2040 freeze in the live game

Source-only proposal at HEAD c614b7e9. Every `file:line` is at HEAD. "Annex" and "P15" are the builder annex and
package at 2a7ff0d9 (the parent's `git show` exports); "R02" is RECONCILIATION-02 at c5b52b4d (research, not authority:
`1342-O-owner-rulings-p14-p18-approved.txt:184-185`). "RED" is the Wave 1 RED r3
([1353-stage/1353-p15c-red-r3.patch](1353-stage/1353-p15c-red-r3.patch)), cited by patch line. `B` = 6240.

## 1. Authority and scope

- **Rulings.** 5 (`.txt:63-67`): ceremony and dossier from recorded history, official boundary frozen at 2040, nothing
  invented. 6 (`:69-75`): ordinary play after 2040 with failure risk; the 2040 snapshot unchanged; later history
  distinct; no immortality. 3 (`:42-55`): the player can fail and gets a recoverable end-of-run record.
- **Adopted law.** The Wave 2 row of [1353-A](1353-A-p15c-finale-legacy-charter.md) §4 as amended by 1353-F; the
  `LegacyFacts` shape and status table of 1353-F2 §1-§4; the sequence law of [1355-F2](1355-F2-parent-p15-domain-sequence-ruling.md).
- **In:** the adapter, the tick step, the root, the stamp, validation, migration, downgrade, three fact amendments to
  Wave 1 (§3.3), RED, controls. **Out:** Bridge views and projection (Wave 3), the ceremony and dossier UI (Wave 4), the
  end-of-run manifest (Wave 5, §6), Unity (`.txt:170`).

## 2. Facts at HEAD

| # | Fact | Source |
|---|---|---|
| 1 | `tick()` reads `currentTick = state.market.tick`; the result carries `currentTick + 1` | `tick.ts:194`, `:197`, `:1077` |
| 2 | The tail after finalize: scheduled entry, then takes, bonds, lifecycle intent, promises, talent market, settlement as the last expression | `tick.ts:1118-1121`, `:1138-1160` |
| 3 | Releases in the tick producing W carry W−1; rival settlement stamps the pre-increment week | `tick.ts:629`; `hollywoodTick.ts:350`, `:389`, `:421-422` |
| 4 | An unengaged player release is paid once with no run; a D-12 run is kept with its status | `tick.ts:667-672`; `types.ts:312-327` |
| 5 | Rival films keep `result`, `directCommitment`, `studioRevenueReceived`, `settledWeek`; authored films keep public scores and grosses | `hollywoodTypes.ts:28-46` |
| 6 | Career events freeze `audienceScore` and `genre`, and also carry `realizedOpening`, `realizedTotal` | `types.ts:2554-2582` |
| 7 | Standing: player `studio.standing`, rival `business.standing` | `types.ts:305`; `hollywoodTypes.ts:107` |
| 8 | Hollywood is null at world generation and created by founding, which stamps `originWeek` | `worldgen.ts:728`; `employment.ts:568-570`; `hollywood.ts:174` |
| 9 | Live save 43; the last new-root step is V40; a V43 step and frozen-builder guard pattern exist | `save.ts:6560`, `:10544-10572`, `:10668-10709`, `:6174-6191` |
| 10 | No `campaignLegacy`, `p15Sequence` or `campaignLegacy.ts` in `src` or `bridge` (grep); Wave 1 production 1353-E is in flight | 1353-X2 |
| 11 | The `/industry` query pages 1-50 rows through a per-state index; views are one enum | `bridge/industry.ts:46-47`, `:238-240`; `bridge/schema/industry-schema.ts:156` |

## 3. The fact adapter: `legacyFactsFromState(state, boundaryWeek)`

Pure, in `src/core/campaignLegacy.ts`, no RNG. One pass per root with id maps, never a `find` per film. It passes
facts through; the law does every cut (1353-C rationale for `boundaryWeek` on facts).

### 3.1 Row facts

| Fact field | Player | Rival |
|---|---|---|
| studio `studioId`, `row`, `enteredWeek` | identity (`hollywoodTypes.ts:6-17`); every identity with `enteredWeek !== null`, row order | same |
| `closedWeek` | week of the studio's `→ closed` event in `corporateCondition.events` (1357-A §4), else null; null without the root | same |
| `standing` | `studio.standing` at the freeze | `business.standing` at the freeze |
| film `filmId`, `domainId` | `productionId`, `'playerFilms'` | `filmId`, `'industryFilms'` |
| `provenance`, `releaseWeek` | `'campaign'`, `releaseTick` | live: `'campaign'`, `result.releaseTick`; authored: `'authored'`, null |
| `genre` | the concept's genre from `state.concepts` (`types.ts:526`); a missing concept refuses by name (no `src/core` writer filters it, grep) | `genre` |
| `criticScore`, `audienceScore` | `criticScore`, null | live: `result.criticScore`, null; authored: both public scores |
| `status`, `settledWeek` | settled when there is no run, the run is `legacyCompleted`, or `releaseTick + totalWeeks ≤ B`; then `settledWeek` is `releaseTick` (first two) or `releaseTick + totalWeeks − 1` | live: settled when `settledWeek !== null && settledWeek < B`; authored: settled, null |
| `grossSettled` | `boxOffice.total` when settled, else null | live: `result.boxOffice.total` when settled, else null; authored: `totalGross` (settled before 1920 and public, `bridge/industry.ts:66`) |
| `credits` | `[]` | live `[]`; authored `credits` as `{talentId, role}` |
| career event | `state.careerEvents`, tag `'playerCareerEvents'` | `hollywood.careerEvents`, tag `'industryCareerEvents'`; both copy only `eventId, filmId, talentId, role, releaseWeek, genre, audienceScore` |
| adoption, technology | `technology.adoptions` (`id` as `adoptionId`, `studioId`, `technologyId`, `operationalWeek`, `cancelledWeek`); `TECHNOLOGY_CATALOGUE` `id`, `commercialWeek` (`technologyCatalogue.ts:45`) | same |
| ranking row | each archive record's rows as `{recordId, week, studioId, rank, band}` (1356-A §5; `recordId` per §3.3 A1) | same |
| condition event | `{eventId, studioId, week, from, to}`; causes, loans and the cash counters stay unread | same |
| market assessment | `{assessmentId: releaseId, studioId, week, assessed: true, underPressure: factor < 1}` (1355-A §3.3; `week` per A2) | same |

**Never read:** rival `account`, `runs` (weekly gross and gross-to-date), `directCommitment`, `studioRevenueReceived`;
loan principal, total and installments; career-event money and skill fields; player cash, ledger and in-run
`cumulativeGrossPaid`. The in-run rule is symmetric: no studio's unsettled gross enters (1353-A §5.1). So every row
carries its 1353-F2 §1 tag, only public facts enter, and no field holds rival cash, cost or revenue (RED 14, patch
:2014-2046). The tag is provenance, not a role flag.

### 3.2 Domain facts (1353-F2 §4; 1355-F2 item 7)

| `domainId` | Root | `recordedFromWeek` | `highWatermark` |
|---|---|---|---|
| `playerFilms` | `studio.releasedFilms` | 0: the root is complete from world start | array length |
| `industryFilms` | `hollywood.films` | `hollywood.originWeek` | array length |
| `playerRuns` | `theatricalRuns` | 0 (a run-less release is settled at release) | array length |
| `playerCareerEvents` | `careerEvents` | 0; films without events carry the gap per film (1353-F2 §5) | array length |
| `industryCareerEvents` | `hollywood.careerEvents` | `hollywood.originWeek` | array length |
| `technologyAdoptions` | `technology.adoptions` | `technology.recordingStartedWeek` (`technologyTypes.ts:132`) | array length |
| `technologyCatalogue` | `TECHNOLOGY_CATALOGUE` | 0 | catalogue length |
| `powerRanking` | `powerRanking.snapshots` | the root's | largest `p15DomainSequence` in the root, 0 if none |
| `corporateCondition` | `corporateCondition` events and loans | the root's | same rule |
| `marketAssessments` | `sharedMarket.assessments` | the root's | same rule |

`awards` is never supplied (always `notRecorded`). A sibling root absent from the state gives `recordedFromWeek: null`,
`highWatermark: 0` and an undefined fact array. An array watermark is the native append position (1353-A §1).

### 3.3 Three amendment requests to the Wave 1 facts (the parent decides; they land before Wave 1 closes)

- **A1, blocking.** `LegacyRankingSnapshotFact` (patch :484) has no id, so a ranking ref must mint one from the week
  (patch :715 asserts `r.id.includes('6240')`). Annex D.7 (:340-347) forbids week-only identity, 1356-F Amendment 1
  withdrew it, and such an id cannot resolve against `power-ranking-<p15DomainSequence>` (1355-F2 item 5). The fact
  gains `recordId`; the ref cites it. Fixtures with ids like `PR-6240` keep :715 true; one leaf pins `ref.id === recordId`.
- **A2.** `LegacyMarketAssessmentFact` (patch :485) gains `week`, so the law cuts market rows like every other domain.
  Otherwise the adapter would be the one place a domain is cut.
- **A3.** `closedWeek ≥ B` reads open: no closure before B, no closure contrary, no closure date in the roll call. The
  freeze tick's condition step can stamp a closure at 6240 (§4.1).

## 4. The boundary

### 4.1 The tick producing week 6240

It is the `tick(state)` call with `state.market.tick === 6239`, whose result has `market.tick === 6240`. In it, releases
and the market batch carry 6239 (fact 3; 1355-A §3.1 item 6), a final rival payment stamps `settledWeek` 6239, and the
post-finalize tail runs on produced week 6240 (fact 2; no rival enters after 2548, `calendar.ts:3`). Then the ranking
record at 6240 covers [6188, 6240) (1356-A §4), the condition step evaluates boundary 6240 and may stamp events at 6240
(1357-A §5), and the freeze runs last. Inside the Legacy: every row with effective week ≤ 6239 and the 6240 ranking
record. Outside: condition events stamped 6240 and everything later. Standing at B is the value in this tick's result.

### 4.2 The step

```text
return freezeCampaignLegacyWeek(advanceCorporateConditionWeek(recordPowerRankingQuarter(
  advanceLifecycleSettlement(advanceTalentMarketWeek(advancePromisesWeek(advanceLifecycleIntent(withBonds, birthdays)))))))
```

`freezeCampaignLegacyWeek(s)` returns `s` unchanged unless `s.hollywood !== null`, `s.market.tick === B` and
`s.campaignLegacy.official === null`. Then it builds `legacyFactsFromState(s, B)`, calls `freezeLegacy(root, B, facts)`,
stamps the official manifest (§5), and increments `p15Sequence.next`. It writes nothing else and runs after
`rng.serialize()` (`tick.ts:1076`). The adapter runs in exactly one tick per campaign; every other tick pays three
comparisons. The order ranking, condition, finale is 1355-F2 item 2, 1356-A §4 (:88-89) and 1357-A §5 (:167-169).

### 4.3 The marker rule (R02 §7.4 against ruling 6)

R02:376 keeps "an in-checkpoint marker the load/tick path refuses to advance". Ruling 6 requires continued play and
governs. The marker is `campaignLegacy.official`, and no path advances or rewrites the boundary it records:

1. **Tick.** Never stops, waits or asks at B (1353-A §6). The freeze writes `official` once; every later call returns
   the root unchanged (RED 12, patch :1859-1896). No `src/core` step reads `official`; only this module and the
   validator read `postFinaleMode` (RED 16, patch :2142-2160).
2. **Load.** `official !== null` exactly when the freeze was due:
   `hollywood !== null ∧ hollywood.originWeek < B ∧ campaignLegacy.recordedFromWeek < B ∧ market.tick ≥ B`.
   A missing marker when due and a marker when not due each refuse by name. The ceremony pause is Wave 4 presentation.

### 4.4 After the freeze

- **Endless sandbox.** Every later tick is ordinary. Films, cohorts, market pressure, ranking, condition, loans and
  failure continue under the same law (ruling 6; R02 §7.4 clarification i).
- **The post-2040 record set** is the complement of the cut in the same append-only roots: rows with effective week
  ≥ B, and ranking records after B. The manifest persists `boundaryWeek` and every domain's watermark, so the partition
  is fixed forever without a copy (1353-A §6). Wave 3 labels those rows "After the 2040 Legacy".
- **No revival.** The freeze writes nothing to `corporateCondition`; a closed record is never evaluated again (1357-A
  :48; R02:262). A post-2040 closure is an ordinary event in the post-2040 set and the official manifest stays
  byte-identical. No Awards, achievements, normalization or support arrive (1353-A §6).

## 5. The root `campaignLegacy`

```text
CampaignLegacy = { version: 1, recordedFromWeek, official: OfficialLegacy | null, endOfRun: null }
OfficialLegacy = LegacyManifest /* 1353-A §5.2, kind 'official2040', postFinaleMode 'ordinary-simulation/v1' */ & {
  legacySnapshotId: `campaign-legacy-${p15DomainSequence}`, p15DomainSequence,
  phaseId: 'p15c.finale', phaseOrdinal, phaseOrderVersion }        // the p15Phases.ts table-v1 entry
```

- **Placement.** A top-level `GameState` key (the 1356-A §5 reason: one strip point). The type and the validator live
  in `campaignLegacy.ts`; `types.ts` imports the type, so no other `src/core` file spells `postFinaleMode` (RED 16).
- **Identity (annex D.7).** The id comes from the persisted P15 allocator, its prefix shares no keyspace with
  `power-ranking-`, `corporate-` or `industry-event-`, and a duplicate sequence across P15 roots refuses (1355-F2 item 4).
  The law never sees the stamp; the step adds it to the manifest the law returns.
- **Bounds.** One official manifest, about 140 KB at the caps (1353-A §5.2); the root never grows after the freeze.

### 5.1 Validation (`validateCampaignLegacy`, run by the new `validateSaveVN` after the frozen chain)

1. Exact keys; `version` 1; `recordedFromWeek` an integer in `[0, market.tick]`; `endOfRun` null in this era.
2. The marker rule of §4.3.
3. `kind` `official2040`; `definition` a key of the frozen definition table; `boundaryWeek` and `postFinaleMode` equal
   that entry's.
4. Stamp: the id matches its sequence; the sequence lies in `[1, p15Sequence.next − 1]` and is distinct across P15
   roots (1355-F2 item 4); the phase triple equals its version's table entry.
5. Bounds per the entry: ≤ 16 unique v1 sources; the eight archetype ids in order; ≤ 12 known lenses with their exact
   count keys (1353-F2 §2); ≤ 12 refs a side; each count ≥ its refs; studios unique, entered before B, in row order.
   This is the runtime refusal 1353-F2 §3 left to Wave 2.
6. Sources: `recordedFromWeek` equals §3.2's value, read as null for a sibling root recorded from B or later (it arrived
   after the freeze); `notRecorded` exactly when it is null; a P15 watermark equals the largest sequence in its root
   below the official's (the allocator is append order, so this is exact); an array watermark is at most the length.
7. Refs: the domain may be cited (not `playerRuns`, not `awards`); the id exists in its root; its position (index + 1,
   or sequence) is at most the watermark; its effective week is below B (a ranking record at most B). One pass.

**Era versioning.** A formula a validator reconciles stored values against must be versioned by era, or a retune
re-judges old saves (1357-A §4.1 item 7). The validator reads `LEGACY_DEFINITIONS['campaign-legacy/v1']` (boundary,
mode, archetype ids, lens ids, count keys, bounds), never live exports or TUNING, and refuses an unknown definition. It
never re-runs archetypes (1353-A §5.1): Standing at B is gone after the freeze tick, so no replay could be exact. A v2
adds an entry and leaves v1 untouched.

### 5.2 Migration and downgrade

- **Up.** `convertV(N−1)ToVN` adds `{version: 1, recordedFromWeek: market.tick, official: null, endOfRun: null}` and
  creates `p15Sequence` unless a sibling in the step does (1355-F2 item 6). No freeze at migration: that would add a
  second trigger and an unobserved Standing (1353-A §5.1). A second migration is a no-op; `worldgen` seeds the root at
  the creation tick.
- **A save below B** (`market.tick ≤ 6239`) freezes when its tick producing 6240 runs; siblings recorded from the
  migration week read `limited` for studios entered earlier.
- **A save at or past B** never freezes; `official` stays null and Wave 3 shows `legacyEvidenceIncomplete`
  (annex:1031); release notes say so (1353-F Q3).
- **Down.** An empty root strips. A non-null `official` refuses by name ("cannot downgrade or discard the frozen 2040
  Legacy"), frozen builders refuse a non-empty root (`save.ts:6174-6191` pattern), and every older `migrateToVxx` gains
  its downgrade line (`save.ts:7414` pattern).

## 6. The end-of-run manifest: not in Wave 2

Wave 2 builds only the official manifest. The closure week C belongs to P15B Wave 4, which has not adopted it
(1353-F notes; 1357-A §1). P15B Wave 2's "closure due" settles nothing and the player keeps trading (1357-A §7,
:240-244), so a dossier there would record a run end that has not happened. The shape already reserves `endOfRun` and
the adapter takes `boundaryWeek`, so Wave 5 adds one call site with C + 1 and decides that manifest's phase, with no
second interpreter. Until that era, `endOfRun` must be null.

## 7. Dossier and ceremony: later waves, no Bridge read in Wave 2

- A view joins the `/industry` enum (`industry-schema.ts:156`): a projection step with its pin sweep, and the next one
  is slice B's (1355-A §6). The snapshot bundle cannot carry it (P15 §19; W0 fact 10). Before a campaign reaches B no
  consumer exists; tests and probes read the root.
- **Wave 3's minimal read:** view `legacy` (targetId a studio id or null; archetype cards with 12 + 12 refs, counts and
  sources) and view `legacyCatalog` (a studio's catalog, 1-50 per page), both through the per-state index
  (`bridge/industry.ts:46-47`). Wave 2 exports the ref resolver its validator uses, so display and validation share one.
- **Wave 4's trigger** is the advance whose result first carries `official`; Wave 2 guarantees exactly one such advance.
- **Build constraint.** No Owner-facing build carries Wave 2 without Waves 3 and 4. The ceremony must show the first time
  (1353-F notes), and seen-state cannot be saved (annex:483).

## 8. RED list (test author; `tests/p15c2-campaign-legacy-integration.test.ts`)

| # | Leaf | Pins |
|---|---|---|
| A1 | `legacy-adapter-film-facts` | player, live rival and authored films map per §3.1, with tags |
| A2 | `legacy-adapter-run-status` | no run, `legacyCompleted`, completed, a run ending at B−1 against B; rival `settledWeek` null and B−1 |
| A3 | `legacy-adapter-private-money-never-read` | sentinels in every never-read field of §3.1 appear in neither facts nor manifest |
| A4 | `legacy-adapter-career-events` | both roots, tags, the seven fields only |
| A5 | `legacy-adapter-studios` | entered identities in row order, both Standing sources, `closedWeek` with and without the root |
| A6 | `legacy-adapter-domain-facts` | the ten §3.2 entries exactly; no `awards` |
| A7 | `legacy-adapter-sibling-roots` | each sibling absent, present and empty from week T, and present with rows |
| A8 | `legacy-adapter-p15-watermarks` | each P15 watermark is the root's largest sequence; 0 when empty |
| A9 | `legacy-adapter-missing-concept-refuses` | refusal by name |
| B1 | `legacy-tick-freezes-once-at-6240` | ticks from 6238 and 6240 write nothing; from 6239 the official manifest, stamp and `next` |
| B2 | `legacy-freeze-is-last-allocation` | the official sequence exceeds the tick's ranking, condition and loan sequences; watermarks include them |
| B3 | `legacy-freeze-writes-only-its-root` | K1: step bypassed, all but `campaignLegacy` and `p15Sequence` byte-identical; same `rngState`; no RNG import |
| B4 | `legacy-condition-at-6240-outside` | a closure stamped 6240 is not a closure before B; the 6240 ranking record is inside |
| B5 | `legacy-adapter-only-at-boundary` | A9's state ticks 6238→6239 and 6300→6301 unaffected; 6239→6240 refuses |
| B6 | `legacy-ticks-after-freeze` | carried: 520 ticks leave the root byte-identical while releases and events still append |
| B7 | `legacy-endless-no-revival` | a studio closed before B stays closed and unevaluated for 520 ticks; a later closure leaves `official` unchanged |
| B8 | `legacy-hollywood-null-no-freeze` | the headless corpus through 6240: no freeze, root valid |
| B9 | `legacy-determinism` | K2: two runs, byte-identical official manifest |
| C1 | `legacy-root-fresh` | worldgen seeds the empty root |
| C2 | `legacy-migration-empty-root` | carried: a genuine Save(N−1) capture gets the empty root at its week, no ranking, condition or Legacy row; re-migration no-op |
| C3 | `legacy-migration-before-boundary` | migrated at 6239: the next tick freezes; siblings read `limited` |
| C4 | `legacy-migration-past-boundary` | at 6240 or later: never freezes; null `official` validates |
| C5 | `legacy-root-downgrade` | empty strips; non-empty refuses by name; frozen builders refuse |
| C6 | `legacy-validate-marker` | missing when due and present when not due refuse by name |
| C7 | `legacy-validate-manifest-identity` | wrong kind, boundary, mode or definition; non-null `endOfRun` |
| C8 | `legacy-validate-stamp` | duplicate or out-of-range sequence, id mismatch, phase mismatch |
| C9 | `legacy-validate-bounds` | a 17th source, nine or reordered archetypes, a 13th or unknown lens, wrong count keys, 13 refs, count below refs, studio order or entry |
| C10 | `legacy-validate-refs` | missing id, position above watermark, week ≥ B, cited `playerRuns` or `awards`, watermark above length, P15 watermark or `recordedFromWeek` not re-derived; a sibling root added after the freeze still validates |
| C11 | `legacy-definition-era-guard` | the frozen v1 table equals the live exports; unknown definition refuses; the validator imports no TUNING |
| C12 | `legacy-round-trip` | save and load after the freeze: byte-identical root, unchanged by the next tick |
| D1-D3 | `legacy-ranking-ref-cites-record-id`, `legacy-market-cut-by-week`, `legacy-closed-at-or-after-boundary-reads-open` | §3.3 A1-A3; they move into Wave 1 if the parent folds the amendments there |

Wave 1 RED 16 stays unchanged and green. The Wave R guards run at Wave 2's recorded GREEN (1353-A §8). Natural-campaign
leaves share the Wave R memoized campaign and its 180 s budget (1353-F3 item 3); forged states assert the full validator
first. C2-C4 read genuine Save(N−1) captures minted with sha256 provenance at the last writer (1355-F Amendment 3); C4's
capture sits at week ≥ 6240.

## 9. Measurement and controls

- **G-P, before Wave 2 production** (1353-A §9): the landed Wave 1 law plus §3's adapter in a scratch tree, over the
  recorded seeds' natural routes at 6240. Per seed: holders per archetype, the domain table, adapter refusals, freeze
  time and manifest bytes. An evaluated archetype held by every studio in every seed, or by none in any seed, returns
  §5.5 of 1353-A to retuning (resilient survivor exempt while P15B is absent). No numbers exist: Wave 1 has not landed
  and this draft ran nothing.
- **G-L, at closure:** the live root on the same routes. K3: the official manifest minus its stamp is byte-identical to
  G-P's, which proves the step reads the tick's final state. Manifest bytes stay within the cap bound (1353-A §5.2); the
  freeze tick's time is reported with no budget (annex L.5).

## 10. Dependencies and order

1. **Wave 1 closes:** 1353-E lands with A1-A3 folded in, then GREEN, review and broad gates.
2. **G-P**, one heavy process after the running measurement (`.txt:168-169`).
3. **Siblings.** `p15Sequence` and `p15Phases.ts` arrive with the first P15 root in production (1355-F2 items 1, 3).
   P15A.1 Wave 2, P15A.2 slice 2a and P15B Wave 2 land as early as their gates allow, since each `recordedFromWeek`
   limits every save's 2040 view. P15C Wave 2 lands with or after them and needs none for correctness (absent reads
   `notRecorded`); if it lands first, each sibling's production owes its §3 branch and A7 case.
4. **Save step:** the shared P15 step if P15C is ready with the siblings (1355-F Amendment 4), else the next live version
   after them. Save44 is slice B's. No projection step.
5. **RED** staging, parent dry run, independent RED review; the recorded RED on unchanged production.
6. **Production**, one writer, three commits: (a) root type, validator, save step, migration, downgrade, frozen
   builders; (b) the adapter; (c) the tick step.
7. **Closure:** recorded GREEN, implementation review, live-version sweep, broad gates, Wave R guards, G-L.
8. **Next:** Wave 3 (views, one projection step), then Wave 4 (web ceremony and dossier).

## 11. Questions

For review 1359-B: R1, the stamp on the manifest rather than a wrapper record (§5); R2, the marker-rule reading of
R02 §7.4 (§4.3); R3, structural validation by the frozen definition with no archetype replay (§5.1); R4, array
watermarks bounded by length while P15 watermarks re-derive exactly (§5.1 item 6); R5, a condition event stamped 6240
falls outside (§4.1, A3); R6, authored films pass their public settled `totalGross` and `playerCareerEvents` reads
recorded from 0 (§3); R7, A1-A3 as Wave 1 amendments (§3.3); R8, no Bridge read in Wave 2, with the build constraint (§7).

**Owner questions: none.** Ruling 5 fixes the ceremony, the dossier and the 2040 freeze; ruling 6 fixes ordinary play
after it and a distinct later history, which §4.4's partition meets; ruling 3 fixes the end-of-run record, placed in
Wave 5 behind P15B Wave 4. 1353-F settles the boundary week and the migrated-past-2040 case. The marker rule, the
adapter, the stamp, validation and save allocation are delegated authoring under 1342-O's execution order.
