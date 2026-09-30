<!-- 1355-A: drafted read-only by a planning agent at HEAD c614b7e9 from the parent's brief. It is the parent's proposal pending review 1355-B and parent adoption 1355-F. No test or probe was run. -->

# 1355-A: P15A.1 Wave 2 charter: one weekly market batch in the live release pipeline

Source-only proposal at HEAD c614b7e9. `P15` and `annex` mean the package and builder annex at 2a7ff0d9
(`git show 2a7ff0d9:docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15{,-BUILDER-ANNEX}.md`). Evidence
records are in `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`.

## 1. Authority and scope

- **D-1323-1** (1340-O:47-57) approves the 1323-A formula as amended by 1323-F, keeps self-exclusion, same-week
  symmetry and every boundary, treats the constants as provisional tuning under a Wave 4 KEEP/REVISE/REJECT playtest,
  and "authorizes the planned P15A.1 implementation sequence."
- **Execution order.** Shelving and its verification come "before integrating additional shared-market pressure into
  the live economy" (1340-O:92-94; 1342-O:57). RED and staging up to integration are independent work (1340-O:142-143).
- **Package law.** Pressure acts "only through a versioned, previewable authoritative reception input applied before
  result commitment" (P15:602-604). Same-week law P15:427-438; symmetry :633-647; persistence, migration and RNG
  :661-695; performance :697-733. Annex Wave 2 (annex:686-694) owns root, save, migration, integration, the P07 seam.
- **Landed:** `src/core/sharedMarket.ts`, law `p15a1-market-v1` (1346-L:3-9); Wave 1 not closed (1346-L:14-17).
- **In scope:** the batch, the reception seam, the root, validation, the save step, migration, measured controls and
  the measurement gate. **Out:** projection, Bridge, UI and the preview (Wave 3, §6); endurance and the Owner
  playtest (Wave 4); reach scaling (`releaseContribution` stays 1, sharedMarket.ts:79-82); rival release policy.

## 2. Wave 0 refresh at c614b7e9

Facts 1-7 re-check 1323-A §2 (05dfe33d). Facts 8-15 are new and carry the design.

| # | Fact at HEAD | Source |
|---|---|---|
| 1 | Player release set unchanged: collect and sort by id, P06A witness before any reception, loop at :545, inputs read `state.market` and start-of-tick standing, verdict at :625 | `tick.ts:502-504`, `:506-520`, `:528`, `:575-612`, `:625` |
| 2 | Shelving moved the rival loop from :312-392 to :360-438. Per business: sound :361, staff :362-363, plans :367, research :368, `decide` :369, `operateStage` :370, commitments :371-373, technology and advance :374-377, collect :379, witness :380-381, verdicts :385-408 (reception :388, `h.films` :397, standing :400, `filmReleased` :403), prune :409, run payments :411-426 (`filmSettled` :423), payroll and costs :427-432, script work :433-437 | `hollywoodTick.ts:360-438` |
| 3 | `decide` is :201-337; its greenlight forecast reads `forecastHistoryForOwner` at :245 (was :237) | `hollywoodTick.ts:244-245` |
| 4 | P07 seam unchanged: `computeBoxOffice` :596, `setNoveltyFactor = 1` :628, `const competitionFactor = 1.0` :678, opening :697-703. Other callers: forecast, package range, agents | `reception.ts`; `forecast.ts:467`; `filmPackage.ts:526`, `:659`; `agents.ts:126` |
| 5 | `competingSlate` still holds untyped rows; the run schedule is still fixed at release | `types.ts:286`, `:293`; `economy.ts:53` |
| 6 | No phase catalogue (`phasePrecision`, `phaseOrdinal`: no match in `src/core`) | grep |
| 7 | Six genres | `types.ts:9` |
| 8 | **A rival's week-W release set is fixed when the week starts.** A rival commits every Release Ready picture each week; commitment needs `remainingTicks` 1 and phase `releaseReady`; `operateStage` touches only shooting tasks; a committed picture at 1 always reaches 0; a greenlight starts at 8 ticks | `hollywoodTick.ts:371-373`, `:78-91`, `:246`; `releaseAuthority.ts:84-99`; `operations.ts:1751-1763`; `tuning.ts:76` |
| 9 | The player's week-W set is the pre-advance commitment set, and the witness proves it | `operations.ts:1509-1516`; `tick.ts:506-520` |
| 10 | Rivals never see the player's same-week release: `advanceHollywoodWeek` gets `admitted`, and this week's player films stay in the local `releasedFilms` until finalize | `tick.ts:438`, `:935`, `:534`, `:1086` |
| 11 | Within a week, a later rival's `decide` reads other studios' films only as director and genre credits; it reads money only from its own films | `industryCareer.ts:13-16`, `:21` |
| 12 | The sim stream serves only player critic draws, ascending id. Rivals use keyed streams; discovery is isolated; the critic draw precedes `computeBoxOffice`; the law draws nothing | `tick.ts:37-39`, `:231`, `:622-625`, `:1076`; `hollywoodTick.ts:388`; `reception.ts:789`, `:799`; `sharedMarket.ts:6` |
| 13 | Standing reads gross: awareness from total, confidence from ROI on total, for player and rivals | `standing.ts:154`, `:193-196`; `tick.ts:825`; `hollywoodTick.ts:400` |
| 14 | Rival viability reads forecasts only; a cash-blocked outcome does not count toward shelving; a commission needs cash at or above reserve | `hollywoodPolicy.ts:73`; `hollywoodTick.ts:236`, `:267`, `:301` |
| 15 | The talent market runs only when `hollywood !== null`. World generation sets it null; founding creates it and stamps `originWeek` | `talentMarket.ts:24-29`; `worldgen.ts:728`; `employment.ts:568-570`; `hollywood.ts:174` |

Also: `LIVE_SAVE_VERSION = 43` (`save.ts:6560`); `PROJECTION_VERSION = 56` (`bridge/schema/bridge-schema.ts:283`);
rival films are announced with "No release date is promised" (`bridge/industry.ts:119`).

## 3. Integration design

### 3.1 One batch per week, frozen before any verdict

A new step **2.5 MARKET BATCH** runs in `tick()` after the P06A witness (`tick.ts:520`) and before step 3 (`:522`).
The player's verdict at `:625` is the week's first verdict (facts 1, 10), so the step precedes every verdict.

1. It runs only when `state.hollywood !== null` (fact 15). The M0A corpus and the observatory keep today's path.
2. **Pre-batch snapshot:** the assessments already in the root with `week > W − 26`
   (`SHARED_MARKET_RETIRE_AFTER_WEEKS`), read by a backward scan (§3.3). The root is written only at finalize, so
   nothing from week W is in the snapshot.
3. **Members:** the player's `releasing` (`:502`) as `{id, hollywood.playerStudioId, concept.genre}`, and each rival's
   productions at `remainingTicks === 1` in `admitted.hollywood` as `{id, studioId, genre}`, with the genre lookup
   `inputsFor` uses (`hollywoodTick.ts:68-70`). No member carries an owner flag.
4. `assessBatch(exposures, {week: currentTick, members})` runs once and yields `factorById`. Canonical order and
   self-exclusion come from the law (`sharedMarket.ts:207-229`, `:366-368`).
5. **Witness:** at `hollywoodTick.ts:380-381` a business's `releasing` ids must equal its frozen members, and the
   studio counts must sum to the batch. A mismatch throws before that studio's reception (the `tick.ts:506-520`
   pattern). By fact 8 it never fires legally; if it fires, a release path was missed and the week fails loudly.
6. `W = currentTick = state.market.tick`, the week both release paths stamp (`tick.ts:197`, `:629`;
   `hollywoodTick.ts:350`, `:389`).

`tick()` returns one state or throws, so a failure in any subject commits no result, assessment or cash. That meets
the all-or-none candidate of P15:427-438 and annex C.1 without a separate candidate object (the 1352-A §7 precedent).

### 3.2 The factor at the reception seam

- `ReceptionInputs` gains an optional `competitionFactor`, set only at the two release sites: the player inputs
  (`tick.ts:575-612`) and the rival release inputs (`hollywoodTick.ts:387`; `advanceHollywoodWeek` takes
  `factorById` as a new argument). Greenlight, chooser, forecast and package inputs never carry it
  (`hollywoodTick.ts:230`, `:243`; fact 4).
- `resolveReception` passes `inp.competitionFactor ?? 1` to a new trailing `computeBoxOffice` parameter
  `competitionFactor = 1` that replaces the constant at `reception.ts:678` (the `setNoveltyFactor` form, `:628`). A
  factor outside `[1 − SHARED_MARKET_FACTOR_MAX_PENALTY, 1]` throws.
- IEEE `x · 1 = x` and `f(0) = 1` exactly (`tests/p15a1-shared-market.test.ts:257`), so every release with P = 0 is
  bit-identical to today. The critic draw comes first (`reception.ts:789`), so no draw moves (fact 12). The opening
  is scaled before `openTheatricalRun` (`economy.ts:53`), so no run is rescaled; legs are untouched.
- `FilmResult` keeps its shape (`reception.ts:832-851`); the assessment is the record of the factor.

### 3.3 Persistence

```text
sharedMarket: {
  version: 1,
  recordedFromWeek: number,          // first week whose releases are assessed
  assessments: MarketAssessment[]    // sharedMarket.ts:62-74 verbatim, strict (week, releaseId) order
}
```

- **Active exposures are derived, not stored:** the suffix of `assessments` with `week > W − 26` (weeks append in
  order). It holds at most the trailing 26 weeks' releases (1323-F:38-40); scan plus batch cost
  O(active + 2 · members) (1323-F:41-44).
- **No batch manifest, receipt or new allocator.** A batch is the assessments sharing a week. `releaseId` is unique
  across studios (`hollywoodTick.ts:241`), so it is the assessment id and the Legacy ref (`marketAssessments`,
  1353-A:136-138, :181). A record has no co-batch list, at most five reasons of at most five ids
  (`sharedMarket.ts:34`, `:256`), so storage is O(members). This adapts annex D.2.1, D.3 and L.6 invariant 11 as
  1352-A §7 adapted the participant manifest; review rules on it.
- **History reference:** an assessment shares its id with the player's `filmReleased` row (`tick.ts:655`) and the
  rival `filmReleased` receipt (`hollywoodTick.ts:403`). No history row and no Standing copy (annex K.2).
- **Phase identity:** one event kind at one fixed step; domain-local order `(week, releaseId)` inside step 2.5; no
  per-row phase fields (1323-A:49-51).
- **Size:** about 21 releases a year (nine rivals at about two, plus the player, 1323-A:95-96) gives about 2,500
  records by 2040, about 1 MB at 400 bytes each; G2 measures it. `ponytail:` the finalize append copies the array
  weekly, as `h.films` does (`hollywoodTick.ts:397`); chunk only if Wave 4's measured slope needs it.

### 3.4 Validation invariants (the new save validator)

1. Exact keys; `version` 1; `recordedFromWeek` an integer in `[0, market.tick]`.
2. Strict `(week, releaseId)` ascent, with `recordedFromWeek ≤ week < market.tick`. With `hollywood` null, empty.
3. **Film bijection** from week `max(recordedFromWeek, hollywood.originWeek)`: every simulated release (player
   `releasedFilms` by `releaseTick`, genre via concept; rival `h.films` with `provenance === 'simulation/v1'`) has
   exactly one assessment with the same id, week, studio and genre, and no assessment lacks its film.
4. **Law reconciliation:** week by week, rebuild exposures and members from the stored rows, re-run the law named by
   `definitionVersion`, and require deep equality of `pressure`, `factor`, both terms, `inputDigest` and `reasons`.
   Equality is exact because the law is order-free (`sharedMarket.ts:16-19`). One pass, O(Σ active + members).
5. **Versioned by era:** the validator maps each `definitionVersion` to its law and refuses an unknown one. Today v1
   is the live `TUNING` (`tuning.ts:1010-1016`). An era-guard leaf fails if any of the seven values changes while
   `SHARED_MARKET_DEFINITION` is still v1, so a retune must bump the definition, freeze v1's numbers for old records
   and add an old-law fixture. Exposures crossing a version boundary need a policy (annex:593) that the retune owns.

### 3.5 Save step and migration

- **Version:** the next live version when production starts. Save44 goes to relationship slice B (1347-A:92), so
  Save45 is expected (1353-A:279); P15A.2 Wave 2 may share it (1350-A:159). No projection step.
- **Up:** add `{version: 1, recordedFromWeek: market.tick, assessments: []}`. No assessment is invented and no
  pre-migration release becomes an exposure (P15:677; annex:558), so a migrated world has a disclosed 26-week ramp.
  Idempotent; a second pass is a no-op.
- **Down:** lossless only while `assessments` is empty; otherwise refuse by name (`save.ts:10686-10703` pattern).
- **Fresh worlds:** world generation creates the root at the creation tick.

## 4. Chronology: the new order and its controls

1323-A §2 fact 2 assumed a pre-verdict batch would move every rival verdict after all rivals' decisions. Facts 8-11
remove that need: the whole due set is known before the first verdict, so no verdict moves.

| Tick step (week W) | Change |
|---|---|
| Admissions, advance, collect, witness (`tick.ts` through `:520`) | none |
| **2.5 market batch** (§3.1) | new: freeze, assess once, no writes |
| Step 3 player verdicts (`:545-700`) | the factor at the seam |
| Research to industry (`:935`); every business keeps its order (fact 2) | the factor at `:388`; witness at `:381` |
| Payroll to expiry, finalize (`:1066`), end-of-tick steps (`:1138-1160`) | the root append at finalize |

**Rejected: splitting the rival loop.** It moves rival verdicts, run payments and receipts after every business's
decisions. That changes receipt interleaving and the `industry-event-N` ids (`hollywoodTick.ts:44-46`) in any week
where an earlier business releases or settles and a later one appends any receipt. It also hides earlier same-week
director credits from later decisions (`industryCareer.ts:13-16`).

**What moves in week W:** only a pressured release's chain: its opening and total (`reception.ts:697-703`), run
schedule, revenue, cash and ledger, Standing (fact 13) and its `filmReleased.after` (`hollywoodTick.ts:403`), and the
career events built from its result (`tick.ts:938-941`). Later weeks inherit those changes.

**Measured controls**, declared before the writer starts; pins minted at the RED commit on unchanged production.

| Id | Control | Passes when |
|---|---|---|
| K1 | Same state, one pressured tick | `rngState`, receipt kinds, order and `eventId`s, `h.films` order, greenlights, first takes, shelving and employment are identical; differences stay inside the fields above |
| K2 | Same state, one tick, every P = 0 | Post-tick state minus `sharedMarket` is byte-equal to the pin |
| K3 | Migrated Save43 natural route (cold start) | Root-stripped digest equals the HEAD route's every week until the first factor below 1, and first differs there, in that film |
| K4 | Scratch probe, `SHARED_MARKET_FACTOR_MAX_PENALTY = 0` (`1 − 0·x = 1`), §5 routes to week 6240 | Root-stripped digest equals HEAD's every week: batch, witness and root move nothing alone. The era-guard leaf fails in that scratch tree, as it should (§3.4.5) |
| K5 | Two runs, pressure on | Byte-identical saves |

## 5. Measurement gate before pressure enters the live economy

**Routes:** seed `p13a-core-causal-01` (`p13aGeneratedStudio`) and seed-b (`rivalFixture`) (1329-A:10-14) on the
shelving source, to week 6240, with read-outs at 520 (1329's stalled horizon), 1560, 3120, 4680 and 6240 (annex L.5
quarters). The instrumentation agent runs one heavy process at a time (1342-O:69-72), after the running measurement
and after shelving's §7 verification (1344-A:172-185).

- **G1, open loop, no production change, before recorded RED.** Apply `assessBatch` week by week to each route's
  recorded releases. Report the release count; the share with f < 1, ≤ 0.95, ≤ 0.90, ≤ 0.85; deciles by genre and by
  studio; the window and stock shares of pressure; and the first-order gross change Σ gross · (1 − f) / Σ gross.
- **G2, closed loop:** the frozen step-(c) candidate (§8) against the control at the RED commit, same routes. Report
  per-studio gross ratio; rival weeks below reserve and below zero; player cash and Standing; rival stall weeks (a
  ready screenplay, no production, no greenlight), shelvings, retries, longest no-greenlight streak, last filming week,
  and `decide` outcomes by kind (`hollywoodTick.ts:225-236`); root and save bytes; median and p95 tick time (report
  only).

| Metric | Proceed | Proceed, flagged for the Wave 4 playtest brief | Retune before integration |
|---|---|---|---|
| Median factor | ≥ 0.95 | 0.90-0.95 | < 0.90 |
| p10 factor | ≥ 0.85 | 0.80-0.85 | < 0.80 |
| Lowest genre mean factor | ≥ 0.90 | 0.85-0.90 | < 0.85 |
| Releases with f ≤ 0.95 | ≥ 10% | < 10% (too weak to notice) | none |
| Industry gross, candidate / control | ≥ 0.95 | 0.90-0.95 | < 0.90 |
| Rival stall weeks vs control | no increase | up to +10%, no new streak ≥ 52 weeks | over +10%, a new streak ≥ 52 weeks, or a rival that films in control stops for good |
| Rival weeks below zero cash vs control | ≤ +10% | +10% to +25% | over +25% |
| Root bytes / save bytes | ≤ 2% | none | over 2%: a storage fix before Wave 3, not tuning |
| K1-K5 | exact | none | any failure is a defect, not tuning |

**Why these numbers.** D-1323-1 prices one same-window rival at about 10% and two at about 16% (1323-F:61-62); a
median below 0.90 treats the typical release as if one always stood beside it. f = 0.80 needs P = 2 ln 5 ≈ 3.2,
three or more same-window rivals. Romance runs about 2.4 times as busy as drama or crime (1323-F:28-31); that gap is
disclosed, not corrected, unless a whole genre falls below 0.85 (P ≈ 1.8). Negative cash is legal today and P15B
will read it as distress (1352-A §2), so solvency drift counts.

**Routing.** A retune is a tuning amendment under D-1323-1's delegation, with its own record and review, then G1 and
G2 again (1340-O:55-57; the shelving precedent, 1344-A:138-139). It goes to the Owner only if the stall trigger
persists at the Owner's weaker named alternative, maximum penalty 0.15 (1323-F:62-63), or if a fix needs a shape
change (window-only, reach scaling, a rival release policy). Either would reopen D-1323-1 (1340-O:99).

## 6. The player-facing preview: Wave 3, with one Wave 2 obligation

- **Shown:** the release screen already lists Release Ready pictures with commit legality (`bridge/release.ts:53-72`).
  Wave 3 adds per picture the known-pressure factor if committed now, its reasons, the weeks it decays, and the
  factor for holding one to four weeks (exact: public exposures decay deterministically).
- **Sources:** released films of every studio (public) and the player's own same-week commitments. Rival same-week
  releases stay private until they open (`bridge/industry.ts:119`, `:318`; annex:501; P15:925-926). The verdict can
  fall below the preview only by same-week rival releases in the genre, and the screen says so. After release, the
  film explanation (annex E.3) shows the stored assessment.
- **Wave 2 obligation:** the preview reuses the batch's exposure scan and `assessBatch`; one law serves both.
- **Why not Wave 2:** Wave 2 has no projection step; projection 57 belongs to slice B, and each step carries a pin
  sweep (1347-F:62-67). The annex puts DTOs in Wave 3 (annex:696-702). The Owner judges at Wave 4, after Wave 3, so
  no playtest sees pressure without its preview; no build between Waves 2 and 3 is presented as a market playtest.
- **Carried to Wave 3:** the player can hold a Release Ready picture to avoid pressure (`operations.ts:1753-1760`),
  while rivals commit automatically (`hollywoodTick.ts:371-373`). Wave 3's charter decides whether rival release
  policy reads the same public preview; P15:645 allows different operational fidelity, not different law.

## 7. RED list (test author; `tests/p15a1-market-integration.test.ts`)

1. `market-seam-default-exact`: no factor and a factor of exactly 1 give a `ReceptionResult` bit-equal to the pin.
2. `market-seam-scales-opening-only`: with f < 1, critic score, segment scores and legs equal the control; opening
   equals `computeBoxOffice` called with f; total follows; an out-of-bounds factor throws.
3. `market-forecast-paths-unchanged`: forecast, package range, agent and chooser outputs ignore the root.
4. `market-due-set-equals-releases`: frozen members equal the player's admitted ids plus every rival picture at 1,
   with the right studio and genre; a held, uncommitted or cancelled player picture is absent.
5. `market-due-set-mismatch-fails-closed`: a forged rival due set throws before reception; input state unchanged.
6. `market-live-one-player-one-rival`: same genre, same week; both factors are `pressureFactor(1)`, the reasons name
   each other, and neither is the other's exposure.
7. `market-live-window-stock-retire`: rival releases at W−2, W−10 and W−26 act on a player release at W through
   `WINDOW_RELEASES` (0.55), `GENRE_SATURATION` and nothing.
8. `market-live-self-exclusion-clamp`: one studio's two same-genre same-week releases see each other at 1.00,
   clamped to 1, never themselves.
9. `market-live-no-player-flag`: no ownership field in members or assessments; mirror fixtures that swap the player
   studio give equal assessments after id normalization.
10. `market-week-diff-confined` (K1) and 11. `market-no-pressure-week-identity` (K2).
12. `market-root-append-canonical`: one ordered append at finalize; derived exposures equal `reduceExposures`.
13. `market-inflight-save-replay`: save during an active exposure, reload, run 30 weeks; assessments and terminal
    digest equal an unsaved run.
14. `market-validator-reconciles`: refusal by name for a forged pressure, factor, term, reason or digest, and for
    order, duplicate, orphan, missing assessment, week before `recordedFromWeek` or at the tick, unknown version.
15. `market-definition-era-guard` (§3.4.5).
16. `market-old-save`: Save43 loads to the empty root at the tick; the first batch sees no pre-migration release; a
    second migration is a no-op; downgrade works while empty and refuses a non-empty root by name.
17. `market-disengaged-world`: `hollywood` null: no batch, empty root, M0A outputs unchanged.
18. `market-large-batch-persisted-linear`: 32- and 512-member batches give equal per-assessment bytes and linear root
    bytes (annex L.6 invariant 11). Stale save-version pins belong to the 1320 sweep, not RED.

## 8. Dependencies and order

1. **Shelving closes** (Owner priority): Save43 sweep, the §7 stalled-route verification and controls, C8
   re-attribution, recorded gates, closure (1344-L:21-29).
2. **Wave 1 closes:** the broad recorded core and UI gates over `sharedMarket.ts` and `powerRanking.ts`
   (1346-L:14-17; P15A.2 Wave 1 landed at cea3c853).
3. **Meanwhile:** review 1355-B, adoption 1355-F, RED staging, parent dry run, G1.
4. **Recorded RED** on unchanged production; it mints the K1-K3 pins before the writer moves.
5. **Production**, one writer, three commits: (a) the seam defaulting to 1; (b) root, validation, save step,
   migration, downgrade; (c) batch, witness and the factor at both call sites, which puts pressure in the economy.
6. **G2** on the frozen (c) candidate; (c) lands only on Proceed or Flag.
7. **Closure:** recorded GREEN, implementation review, version sweep, recorded broad gates, and the integrated
   6,240-week normal and hostile harness (annex:694; L.5 read-outs).
8. **Next:** the Wave 3 charter (preview, explanation, workspace), then Wave 4 endurance and the Owner playtest.

## 9. Questions

For review and the parent: R1, the due-set-first batch with no loop split (§4); R2, an assessments-only root with
no batch manifest (§3.3); R3, phase identity as a documented constant; R4, one save step shared with P15A.2 Wave 2;
R5, the §5 thresholds (class C).

**Owner questions: none.** D-1323-1 fixed the formula and delegated the constants to tuning with a Wave 4 playtest
(1340-O:47-57). The execution order fixes the sequence (1340-O:92-94; 1342-O:57). The annex settles what a preview
may disclose (annex:501; P15:925-926) and the cold start (annex:558). Save allocation is routine. An Owner question
arises only through §5's routing.
