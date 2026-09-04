# Project: Studio — P07A Execution Handoff (live)

**P07A = Reception / Release Outcomes / Box-Office Result Truth.** Implementation authorized under Owner
rulings D0–D10 (P07A-OWNER-RULINGS handoff). This file tracks execution wave-by-wave. Authority docs:
`CODEX-P07A-READINESS-GATE-00.md`, `…IMPLEMENTATION-RECONNAISSANCE.md`, `…IMPLEMENTATION-CHARTER.md`.

## Bases + branches
- TS WIP: `wip/p07a-reception-outcomes-01-ts` (hspector-github), based `campaign/living-lot-ts` = `005fbe24f9721811d79fd486b54fbc1a47a025c0` (product `050b98e`).
- Unity WIP: `wip/p07a-reception-outcomes-01-client` (origin), based `campaign/living-lot-client` = `b0c780bb7abd1c81e1c30b59391b7effb86f490f`.
- Worktrees: `~/The Movies - P07A TS`, `~/The Movies - P07A Unity`.
- Versions at base: **save V16 · protocol 4 · projection 14**.

## Owner-law digest (do not reopen from preference)
- **D1** persist immutable audience primitives on FilmResult ONLY if computed-and-discarded (additive optional → V17); don't duplicate sufficient per-segment truth; derive display/labels/bands.
- **D2** persist minimum immutable business primitives where authority exists; **NO economy redesign, NO distributor/exhibitor split, preserve cash timing**; distinguish BOX OFFICE GROSS vs STUDIO REVENUE/PROFIT truthfully; never fabricate cost allocation.
- **D3** NO universal quality score; three channels (critics/audience/business) may disagree; ONE canonical TS reception-verdict helper; converge forks; preserve accepted thresholds unless proved bug.
- **D4** result available at the exact authoritative tick truth first exists; restrained non-blocking; no auto-camera/modal/time-consume.
- **D5** no revenue-timing rewrite; rail stays operational/status (no gross/profit/ROI per row); financial detail in the result workspace; HUD is cash authority.
- **D6** lifecycle COMMITTED → IN THEATERS → RUN COMPLETE/HISTORICAL; rail groups + IN THEATERS; run-complete leaves active rail → Film Library; released film may have NO physical lot owner (Locate absent/unavailable; Details opens result); don't invent a building.
- **D7** restrained presentation; no mandatory cinematic/celebration/full-screen; optional Open Result; optional box-office curve animation (no RNG/state, skippable/reduced-motion, never delays truth); no fake intermediate data.
- **D8** do NOT merge/adopt FILM-CHRONICLE-V1/marathon branch; read-only inspect for ideas; P07 V1 owns minimum durable history.
- **D9** legacy IMGUI reception memo grandfathered, not extended; new consumer is normal route; remove memo once discoverability proven; no two competing authorities.
- **D10** P07 owns release occurrence + critic/audience/business result + theatrical lifecycle + durable FilmResult history + reveal; NOT awards/era/Wire/Chronicle/rival/economy-redesign; prefer additive save evolution (V17 only where truly required); all joins by exact IDs, never title; same-title films independently selectable.

## D0 — campaign upstream safety (DONE)
- `campaign/living-lot-ts` was tracking `hspector-github/main` (unsafe) → repointed to `hspector-github/campaign/living-lot-ts`.
- `campaign/living-lot-client` had no upstream → set to `origin/campaign/living-lot-client`.
- Verified local==remote-tracking==advertised==`005fbe2` (TS) / `b0c780b` (client). `main` untouched (`c902a704`). No force.
- ⚠️ Standing rule: always push campaign/WIP with an **explicit refspec**; never a bare `git push`.

## Wave log
- **W0 — canonical reception semantics — DONE (pending full-floor confirm + commit).**
  - New pure module `src/core/receptionVerdict.ts`: the single source of `criticStars`, `criticBand`
    (was ui adapter `lotReceptionBand`, 40/60/80 → the bridged lot reception), `criticTier` (was
    newspaper, 35/55/70/85), `audienceTier` (30/45/57/72), `aggregateAudienceScore`, `filmAudienceScore`
    + `filmCommittedCost` (consolidated the two identical dups in studioRunRecap.ts + adapter.ts).
    Thresholds/labels copied VERBATIM (D3: no retune). Named threshold consts for the single source.
  - Rewired: `newspaper.ts` (imports+re-exports; removed local defs), `ui/src/engine/adapter.ts`
    (`lotReceptionBand`→`criticBand`; dup finance helpers→import; `filmCommittedCost` re-exported for
    external test importers), `src/core/studioRunRecap.ts` (dup helpers→import), `src/core/index.ts`
    (exports `criticBand`/`filmCommittedCost`/`filmAudienceScore` + type `ReceptionBand`).
  - Bridge path converges automatically (its lot snapshot comes through the ui adapter's `studioLotSnapshot`).
  - Characterization test `tests/reception-verdict-canonical.test.ts` (boundary values) pins behavior.
  - Pre-existing latent fix (not W0-caused): `ui/.../p05a-w2-closed-production.contract.test.ts` `journey.next!.label`
    (the P06D floor gated via vitest, not `tsc -p ui`); both typechecks now clean.
- **W1 — FilmResult completeness — DONE. NO V17 (save V16 unchanged).**
  - Decision: everything the P07 result surface needs is DERIVABLE from already-persisted state
    (D1/D2: don't duplicate; V17 only where truly required). Audience aggregate ← persisted
    `segmentScores` × static market shares (no drift). Business: GROSS ← `FilmResult.boxOffice.opening/total`
    (persisted); STUDIO REVENUE ← `TheatricalRun.studioShare` (0.52 blended rental; already distinct from
    gross — no distributor/exhibitor split added, D2) + `cumulative*Paid` (persisted); committed cost ←
    `filmCommittedCost` over the append-only, never-pruned ledger. Nothing is computed-and-discarded that
    isn't reconstructable → no new FilmResult field, no save bump.
  - New pure read-model `filmResultView(state, film)` in `ui/src/engine/adapter.ts` (bridge-accessible),
    composing the authoritative `releaseScorecard`/`runProjection`/`studioRevenueForFilm` with the canonical
    verdicts (criticStars/criticBand/criticTier/audienceTier) + per-segment audience + banked-vs-projected
    split. Three INDEPENDENT channels; GROSS≠STUDIO REVENUE kept truthful; legacy/no-run films settle to
    gross (never a fabricated partial). Test `ui/src/screens/p07a-film-result-view.test.tsx` (5).
- **W2 — projection 15 + generated DTO/consumer — DONE.**
  - Schema: new `StudioFilmResultSnapshot` (+ `StudioFilmSegmentScore`) DTO carrying the three
    INDEPENDENT channels (critic score/stars/band/tier; audience aggregate/tier/per-segment; business
    gross/studioRevenue/paid-to-date/committedCost/contribution/roi/projected/resultLabel/runStatus) —
    GROSS distinct from STUDIO REVENUE, banked-vs-projected distinct (D2). Added to
    `StudioReleaseResultsProjection.results` (coarse `releasedFilms` band retained, D10 additive).
    **PROJECTION_VERSION 14→15** (protocol 4, save V16 unchanged — result is derived).
  - Mapper `filmResultSnapshot(state, film, week)` (adapter, pure) → wire shape; wired into the bridge
    bundle input in `session.ts` (`results: releasedFilms.map(...)`). D5: money is on the result
    projection, NOT the rail rows.
  - Regenerated `generated/unity/{StudioBridgeDtos.Generated.cs, project-studio-bridge.contract-manifest.json,
    tests/StudioBridgeUnionFixtures.Generated.cs}` + `bridge/schema/project-studio-bridge.schema.json`.
    check:bridge-contract + fixtures PASS.
  - Architecture: `results` is owned by the MASTER `studioLotSnapshotProperties` (like `releasedFilms`) and
    the projection references `studioLotSnapshotProperties.results` — so the projection-partition invariant
    (`bridge-schema.test.ts` "owns every legacy projection field exactly once") holds. The `studioLotSnapshot`
    builder produces `results` (TS type `FilmResultCard[]`, optional on the type only for test-fixture ergonomics;
    the wire schema requires it). Schema `$id` bumped to `…projection-15`.
  - **Unity mirror synced BYTE-IDENTICAL** into the Unity WIP worktree
    (`Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` +
    `Assets/Studio/Tests/EditMode/Generated/StudioBridgeUnionFixtures.Generated.cs`). Commit BOTH repos.
    (Full cross-repo consumer attestation `verify:bridge-contract-consumer` is a W8 seal gate.)
  - Version pins bumped 14→15 (bridge-schema.test.ts ×4 incl. `$id`, generated-C# ProjectionVersion; bridge.test.ts).
    Tests: `ui/src/screens/p07a-result-projection.test.tsx` (mapper↔schema alignment). core/bridge/ui tsc clean.
- W3 — pending (IN THEATERS lifecycle + rail/world truth).
- W4 — pending (result workspace/reveal consumer).
- W5 — pending (legacy/boundary hygiene).
- W6 — pending (continuity/save-load/exact-ID/migration proof).
- W7 — pending (visual oracle + HID + owner-profile journey).
- W8 — pending (hostile review + technical seal).

## Standing constraints
Result computation stays in TS (Unity never computes). No runtime LLM; no editorial feedback into sim. No
Hollywood Wire runtime dependency (emit typed receipts only). No P08. Campaign refs move only at technical seal.
Do not claim P06 Owner acceptance.
