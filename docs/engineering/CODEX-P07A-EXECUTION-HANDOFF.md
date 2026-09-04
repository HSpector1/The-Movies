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
  - **W2 cross-repo proof:** Unity EditMode **762/762** (0 failed) on the P07A Unity worktree with the new
    generated DTO — the projection-15 contract compiles + passes on BOTH sides.

### SESSION CHECKPOINT (2026-09-04)
- **SEALED + pushed (both repos): D0 · WIP branches · W0 · W1 · W2** — the complete TS-side authoritative
  core + contract for P07A. TS floor **4920 passed / 5 skipped**; core/bridge/ui **tsc clean**; Unity EditMode
  **762/762**; Unity DTO mirror **byte-identical**. TS WIP tip `da84822`; Unity WIP tip `8e97fbc` (local==remote).
  The P07 result truth (three independent channels; GROSS≠STUDIO REVENUE; banked-vs-projected) is now DERIVED
  from persisted state and carried on the wire (projection 15). No V17 (derive-only). No P06 boundary crossed;
  campaign refs UNMOVED (P07A lives on WIP only; move only at W8 technical seal).
- **REMAINING: W3–W8** — the Unity CONSUMER + proofs + seal. Next actionable: **W3** — extend the single
  Unity seam (`StudioMovieSlateContracts.RailGroup` + `StudioProductionRailHud`) to compose an **IN THEATERS**
  group from `releaseResults.results` (runStatus 'active'); run-complete films (runStatus 'completed') LEAVE
  the active rail → Film Library; released films may have NO physical world owner (Locate absent/unavailable;
  Details opens the result) — do NOT invent a building (D6). Then W4 result workspace/reveal (D4/D7), W5 legacy
  memo hygiene (D9)/chronicle read-only (D8), W6 continuity/save-load/exact-ID (no V17 so migration is trivial),
  W7 visual oracle + real HID + owner-profile journey, W8 hostile review + technical seal + campaign FF.

- **W3 — IN THEATERS lifecycle + rail/world truth (D6) — DONE (Unity `534c743`).**
  - Single seam extended past COMMITTED: `Lifecycle.InTheaters` + `RailGroup.InTheaters` +
    `SlateKind.ReleasedResult` (StudioMovieRailContracts + StudioMovieSlateContracts). Released films
    with an ACTIVE run become IN THEATERS rows from `releaseResults.results`, in their own group after
    POST & RELEASE; run-complete films are withheld (→ Film Library). World law: a released row has NO
    Locate (no physical owner) — DETAILS opens the result (wired W4); NO money on the row (D5).
  - Helpers `ReleasedRowWanted`/`ReleasedLifecycle`/`ReleasedStateLine` ("Now showing · week N of M",
    never money). `StudioProductionRailHud` populates `ResultRows` from the snapshot, calls the 5-arg
    Assemble, and draws `DrawReleasedRow` (title-first, calm neutral accent, DETAILS affordance).
    Fixed a latent hit-test mis-index (the non-Production `else` assumed Screenplay). EditMode **769/769**
    (+7 new W3 contract tests). **Visual/HID proof deferred to W7** per charter.
- W3 — done (see above).
- **W4a — pure result-presentation contract — DONE (Unity `63d897b`).**
  `StudioReleaseResultContracts.Build(StudioFilmResultSnapshot) → ResultView`: CRITICS / AUDIENCE /
  BUSINESS as three INDEPENDENT display channels (no universal score, D3); Unity classifies nothing
  (maps the TS-decided bands/tiers/labels). GROSS distinct from STUDIO REVENUE; live runs marked
  "projected" (not banked), D2. Compact deterministic money formatter. EditMode **773/773** (+4).
- **W4b — DONE (Unity `96b97f7`): the result WORKSPACE + exact rail DETAILS route.**
  - `StudioReleaseResultWorkspace` (Presentation/UI, read-only): one wire-ordered list split
    **IN THEATERS** above **FILM HISTORY** (the §6 durable run-complete inspection route — never
    re-sorted in Unity) beside one exact detail pane rendering `StudioReleaseResultContracts`
    verbatim — RELEASE context, then CRITICS / AUDIENCE (per-segment) / BUSINESS as three visually
    EQUAL `ps-production-section`s (no universal score, D4). Selection/routing by exact immutable id
    (D1); same-title twins disambiguate via the release-week context line, never a decorated title.
    Shares the frozen production USS classes (no new sheet); unique `release-result-*` names feed the
    element map/oracle automatically.
  - Contract growth (§3E): `OpeningLine` + banked-to-date lines + state-aware totals — active runs say
    "Tracking toward (gross)" / "Projected studio revenue" (+ a restrained projected note); complete
    runs say "Final box office (gross)" / "Studio revenue". A projection is never labeled final.
    Plus `ContextLine`/`HistoryStateLine` (recency, never money), channel score lines, segment labels.
  - Host: `OpenReleaseResult(resultId)` beside Casting/Production (mutually exclusive display; no
    draft so BACK/Esc close immediately; snapshot rebind keeps the selected id — including a run
    completing and migrating groups); `TryConsumeCancel` guard extended. Rail: keyboard activation
    AND the DETAILS-zone click open the exact result by id; a row-BODY click only selects/focuses —
    result availability stays non-blocking (§3F), and nothing ever moves the camera.
  - EditMode **783/783** (+10: 3 contract, 7 workspace — anatomy, wire-order split, never-money list,
    same-title exact-id routing, projected-vs-final language, per-segment labels, selection
    stationarity/honest empty, BACK seam).
- **W5 — DONE (adjudications + drift guard).**
  - **B1 legacy IMGUI reception memo (D9): GRANDFATHERED, not extended.** The memo
    (`StudioBridgeClient.OnGUI` first-film-journey Released beat) already speaks ONLY the wire's own
    critic band for the exact journey productionId (ambiguity ⇒ silent), carries no audience/business/
    money truth, never force-opens or moves the camera, and is load-bearing in sealed onboarding
    proofs (`StudioBridgePlayerWorkflowTests` pins it) — so removal now would regress a sealed
    journey for zero player gain. The Film Result workspace is the one NORMAL product route for full
    results (rail DETAILS/Enter). New drift-guard test
    `ReleaseReceptionMemo_StaysCriticOnly_NeverAudienceBusinessOrMoney` fails the moment anyone
    teaches this legacy surface audience/business/money truth. Removal/suppression is deliberately
    deferred to a future package once the Owner has played the new route (the D9 "remove once the
    new route is proven" bar is OWNER-proof, not self-certification).
  - **FILM-CHRONICLE-V1 (D8): baseline CONFIRMED, untouched, unmerged.** P07A's only contact is
    `src/core/newspaper.ts` threshold plumbing (W0 re-exports; behavior pinned verbatim by the
    canonical reception test). `buildFilmChronicle` + the browser reveal chain
    (ReleaseResult/NewspaperReveal, per `docs/FILM-CHRONICLE-V1-CONTRACT.md`) are unmodified; no
    marathon branch merged; no Hollywood Wire.

### SESSION CHECKPOINT 2 (2026-09-04)
- **SEALED + pushed (both repos): D0 · branches · W0 · W1 · W2 · W3 · W4a.** TS floor 4920/5-skip;
  core/bridge/ui tsc clean; **Unity EditMode 773/773**; Unity DTO mirror byte-identical. TS WIP tip `5f74b6a`;
  Unity WIP tip `63d897b` (local==remote). The full TS authoritative core+contract, the Unity IN THEATERS
  rail lifecycle, and the pure result-presentation model are done + EditMode/floor-proven. No V17; no P06
  boundary crossed; campaign refs UNMOVED (P07A on WIP only; FF only at W8 seal).
- **REMAINING: W4b (result workspace UI + rail DETAILS wiring) · W5 (legacy memo hygiene D9 / chronicle
  read-only D8) · W6 (save-load / exact-ID / migration — trivial, no V17) · W7 (new released-mid-run TS
  fixture + visual oracle + real HID + owner-profile journey) · W8 (fresh hostile review + technical seal +
  campaign FF).** These are proof-heavy (Unity build + oracle + real HID + hostile review + integration) and
  are the session-spanning tail — to be completed without reducing proof quality.
- W4 — done (W4a contract + W4b workspace/route; see above).
- W5 — done (B1 grandfathered + drift guard; chronicle baseline confirmed; see above).
- W6 — pending (continuity/save-load/exact-ID/migration proof).
- W7 — pending (visual oracle + HID + owner-profile journey).
- W8 — pending (hostile review + technical seal).

## Standing constraints
Result computation stays in TS (Unity never computes). No runtime LLM; no editorial feedback into sim. No
Hollywood Wire runtime dependency (emit typed receipts only). No P08. Campaign refs move only at technical seal.
Do not claim P06 Owner acceptance.

### SESSION CHECKPOINT 3 (2026-09-04) — W7 nearly complete; HID journey G one fix away
- **W6 — DONE** (`85bfa26` bridge-p07a-w6-result-continuity: 6 families; floor 4926/5-skip).
- **W7 — fixtures/oracle/profile DONE; HID G pending.**
  - Fixtures `ui/e2e/p07-visual-oracle-v1` (`d76b433`): six §7 scenarios, all level-1 asserts green.
  - Oracle: SIX scenarios ran GREEN TWICE (44 machine asserts, 0 fails, 0 mutations) — run 2 on the
    corrected binary (exe `c3ff2b77…`, Unity `61c4eee`) after the one visual defect (DETAILS wrapping
    "DETAIL/S") was root-caused (GUI.skin.label wordWrap) and fixed via DetailsZoneWidth 78 + no-wrap
    style (draw + hit-test share the constant). Evidence `Evidence/P07-Oracle/*-2026…152358Z+`.
  - Real-profile journey (`386c196` scripts/p07-real-profile-journey.mts): **30/30**, baseline sha
    unchanged + read-only.
  - Consumer handoff doc committed (`117578b` P07-AUTHORITATIVE-RESULT-CONSUMER-HANDOFF.md; no Wire).
  - **HID:** run-1 FAIL = harness race (map window 20s < ~28s first-connect through the proxy); fixed
    (90s, env PROOF_MAP_WAIT_MS, `ade3325`). Run-2: map + calibration + E 5/5 (menu→quit-confirm→real
    exit) + F PASS; **journey G BLOCKED** — `rail-details-prod-0700` absent at journey time (293
    elements). Controlled repro PROVES the publisher works (both `rail-details-*` rects present ~6s
    after connect, correct 78×96 zones). **Hypothesis:** the calibration click on `rail-locate-casting`
    Locates/focuses the Casting building → camera IsInspecting → the rail stands down (deep-surface
    yield) before G runs. **NEXT:** start journey G by restoring the lot view (end inspection — e.g.
    the world's own Esc/deselect route), re-assert `rail-details-*`, then the full G route; evidence
    `Evidence/S/OwnerInputProof-1440x900-p07-result-route-2-20260904T153629Z`.
- **OWNER DIRECTION RECEIVED (mid-P07A, 2026-09-04):** the Owner pointed at
  `~/Desktop/big swing art/` (The Movies 2005 screenshots + mechanics bible + comparative design
  register): *"The UI/UX is what we are aiming towards. Push hard to match as much of that as we can."*
  Reference anatomy (e.g. the Apr-1956 lot shot): persistent LEFT edge strip of talent portrait chips
  with status bars; persistent RIGHT edge strip of script/movie/PR cards; date+speed+cash top band —
  everything in flight glanceable over the live lot. P07A's rail + People strip already follow this
  shape; the full match is a VISUAL/UX PACKAGE of its own (see docs/design Visual Direction Package
  01) and must NOT be improvised into the P07A seal. Carry into the next package charter.
- **REMAINING: HID journey G re-run → W8** (full final floor incl. verify:bridge-contract-consumer,
  fresh hostile review, remediation, technical seal, campaign FF, ~/Desktop/P07A-Owner-Candidate).
  §8 supplemental viewports (1280×800 / 1720×1045 / fullscreen knob added `ade3325`) still to run.

### SESSION CHECKPOINT 4 (2026-09-04) — W7 COMPLETE; W8 underway
- **HID journey G — OVERALL PASS (run 6)**: `Evidence/S/OwnerInputProof-1440x900-p07-result-route-6-20260904T164941Z`
  (ts `d0953e5` / unity `c4c65db`): G **15/15** — calibration-menu neutralize → rail-details published →
  REAL click opens the exact film's workspace → identity "IN THEATERS" → three channel sections →
  "Tracking toward" projected language → exact-id reselect to prod-0701 (identity switches to The
  Distant Insurgent) → BACK → workspace gone → menu Save + Resume; E 5/5 (menu→quit-confirm→real
  process exit); F pass. Three real root causes fixed en route (`c4c65db`): unseeded engine in the
  runner (PROOF_RUNTIME_SEED honored), calibration leaving the Studio Menu owning the frame
  (journey-G neutralizer via the menu's own Resume), and the FULL-zone rect published for a
  viewport-straddling row (publisher now emits the VISIBLE INTERSECTION, <24px withdraws; G
  wheel-scrolls the sliver in like a player). Failed runs 1–5 preserved in Evidence/S (honest trail).
- **Oracle: 6/6 green THIRD run on the final binary** (exe `c3372eb5…`, 44 asserts, 0 mutations) +
  **§8 supplemental viewports all green**: divided-response + run-complete at **1280×800** and
  **1720×1046**, and divided-response at **TRUE NATIVE FULLSCREEN 3456×2234** (fullscreen knob).
  Known non-blocker: at 1280×800 the legacy top time-band overdraws the workspace heading's top-left
  by a few px (legacy-IMGUI-above-UITK layering, pre-existing family); all content legible.
- **W8 progress:** typecheck + typecheck:bridge + check:bridge-contract(+fixtures) PASS;
  **CF-09 verify-only PASS at the exact WIP pair** — TS `d0953e5` × Unity `c4c65db`, generated
  contract git blob byte-identical (`84d9c9a8…`), projection 15 / protocol 4 / schema `ddce1c39…`.
  Full TS floor re-running for the final binding. REMAINING: fresh hostile review → remediation →
  candidate `~/Desktop/P07A-Owner-Candidate-*` → campaign FF (both repos) → final report.
