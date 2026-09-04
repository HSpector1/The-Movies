# Project: Studio — P07A Implementation Reconnaissance

Read-only reconnaissance of the current code for **P07 (reception / release outcomes / box-office result
truth)**. No implementation. Base: campaign tips `living-lot-ts`=`72217af` (product `050b98e`; ledger `bc535cf`),
`living-lot-client`=`b0c780b`. Versions confirmed in code: **save V16 · protocol 4 · projection 14**.

## 1. The P06→P07 seam — verified core truth

The entire commit→dispatch→release→result pipeline exists in four TS files; the boundary is one clean seam.

- **P06 (owned, done):** `productionPhases.ts` — a film at `remainingTicks 1` enters `releaseReady` and **holds
  indefinitely** (no successor phase, zero facility capability). `actions.ts:2828 applyCommitPictureToRelease`
  records the explicit commitment (one canonical `ReleaseCommitment` row via `releaseAuthority.ts withReleaseCommitment`
  + one permanent `releaseCommitted` studio event; no time/RNG/cash). Legality `commitPictureToReleaseRefusal`
  (active production, no existing row, `remainingTicks===1`, managed `releaseReady`). Committed-only dispatch:
  `tick.ts:173` derives `committedReleaseIds` from pre-advance `releaseAuthority` → `operations.ts:1320
  advanceManagedProductions` (the only place a 1→0 move happens) returns an ephemeral `admittedReleaseIds` witness.
- **The seam (`tick.ts:447-457`):** step-2 collection of `remainingTicks===0` pictures **must byte-equal** the
  admission witness or the tick throws (fails closed — catches any uncommitted/lost release).
- **P07 (the result, produced by the *subsequent* tick — `tick.ts` step 3, l.459-688):** `resolveReception`
  (single §5.3 critic gaussian, l.559) → `buildFilmResult` → `FilmResult` (l.561) → credits cash/economy →
  `pruneReleasedCommitments` (l.994) removes the commitment atomically with release. **Two-tick separation:**
  commit in week *t* writes only a row+event; the result lands week *t+1*.

Durable history lives in `studio.releasedFilms` (append-only) + `studioEvents` (`releaseCommitted`/`premiere`) +
`theatricalRuns`; `releaseAuthority` holds only *current* truth (rows pruned at release).

## 2. Result truth — AUTHORITATIVE-EXISTING (do not reinvent)

| Fact | Location | Status |
|---|---|---|
| `FilmResult` (critic `criticScore/Mean/Sigma/reviewVariance`; audience `segmentScores`; business `boxOffice.opening/total`; craft/cohesion/delivered/conceptId/directorId; optional participants/forecast) | `src/core/types.ts:241` | AUTHORITATIVE-EXISTING (persisted, append-only, permanent) |
| `TheatricalRun` (weekly `weeklyGross[]` Σ=opening×legs, `studioShare`, `cumulativeGross/StudioRevenuePaid`, status) | `types.ts:304` | AUTHORITATIVE-EXISTING |
| critic gaussian; segment appeal; craft/cohesion; `weightedAudienceScore` (transient) | `src/core/reception.ts` | AUTHORITATIVE-EXISTING; pure (references GameState 0×) |
| `theatricalSchedule(opening,legs)` weekly redistribution (Σ===total, never re-rolled), economy-gated crediting | `src/core/economy.ts` | AUTHORITATIVE-EXISTING |
| standing deltas (D-6: awareness=reach, prestige=critic-only/no commercial effect, confidence=ROI) | `src/core/standing.ts` | AUTHORITATIVE-EXISTING |
| exact-ID isolation: `productionId` collision-safe mint + `persistedProductionIds()` reservation | `actions.ts:228` | AUTHORITATIVE-EXISTING (same-title/same-concept safe; heavily tested) |
| three-channel determinism (single sim-stream critic draw + isolated discovery draw) | `reception.ts`/`rng.ts` | AUTHORITATIVE-EXISTING |

**No result is computed in Unity** (only `StudioBridgeDtos.Generated.cs`, DTO-only; grep for `criticMean`/`opening*legs`/`Math.*` = 0 hits). Constraint satisfied.

## 3. PRIMITIVE-EXISTING (browser-only; keep, don't extend)

- `src/core/newspaper.ts` — pure read-models: `criticStars` (0-5 half-star from 0-100), `audienceTier` (5-band 30/45/57/72), aggregate audience (share-weighted), `buildFilmChronicle`, `makeHeadline`/`makeCallouts`, truthfulness split.
- `src/core/studioRunRecap.ts` — run-level realized totals/critic/audience/contribution/ROI/classification.
- `ui/src/screens/ReleaseResult.tsx` / `NewspaperReveal.tsx` / `Autopsy.tsx` + Film Chronicle / Silver Screen Gazette — deterministic reveal chain, reconstructable after reload. **Governed by FILM-CHRONICLE-V1-CONTRACT (keep, don't extend).**

## 4. PORT-MISSING (the buildable P07 work, once unblocked)

- **Bridge:** no post-release results projection. `bridge/release.ts` is pre-release/decision only. `StudioReleaseResultsProjection` = `{releasedFilms:[{id,title,reception:4-band(criticScore-only),weeksAgo}]}`.
- **Numeric results DTO:** no numeric critic/audience/box-office/business on the wire.
- **Unity surface:** no result-reveal workspace (`StudioWorkspaceHost` = casting + production only); no post-COMMITTED rail lifecycle; `PostWorldCue` stops at `COMMITTED · NEXT STUDIO WEEK`.
- **Stored gaps:** `weightedAudienceScore` computed-then-discarded; business/profit/ROI not stored (budget on `Production`, pruned at release).
- **Consolidation:** reception verdict forked 3 ways (lot `<40/<60/<80`; newspaper critic 35/55/70/85 + audience 30/45/57/72; broadcast) + duplicated `filmCommittedCost`/`filmAudienceScore` (core↔adapter) — unify into ONE authoritative core reception-verdict helper before layering.

## 5. Save / schema / projection expectations

- Current: **save V16** (`save.ts:331`; `releaseAuthority` root minted in P06A), **protocol 4** (`bridge-schema.ts:18`), **projection 14** (`bridge-schema.ts:27`; `SNAPSHOT_VERSION=PROJECTION_VERSION`). `schemaId`/`snapshotVersion` are *derived* — bumping `PROJECTION_VERSION` + adding DTOs auto-changes `schemaId`; the contract-consumer lock (`scripts/verify-bridge-contract-consumer.ts`) forces the Unity repo to carry a byte-identical regenerated DTO mirror.
- **Projection bump 14→15 is required** for any richer results DTO (additive; regenerate `generated/unity/*` + manifest; Unity mirror must match).
- **Save V16→V17 is required ONLY IF** the Owner rules audience score and/or business become *stored* authoritative facts on `FilmResult` (Decisions D1/D2). Precedent: add as **optional** fields (like `forecast?`/`participants?`) → old V16 files remain readable, legacy/M0A films lack them, no data-touching migration beyond the V17 envelope + `convertV16ToV17`. If the Owner instead rules *derive-at-projection*, **no save bump** — reconstruct from `segmentScores`/ledger/`theatricalRuns`.
- A **new campaign-level ledger** (box-office/premiere/awards history) would be a **new save root ⇒ V17** (Decision D10). Reconstruct-from-existing avoids it.

## 6. Unity consumer map

- Release **decision** fully wired + player-facing: `StudioReleaseContracts.Decide` (exact-ID intent join to `commitPictureToRelease`), `StudioReleaseProjection`→`StudioReleaseBoard`. This is P06 and stays.
- `StudioSnapshotStateCache` already ingests `releaseResults.releasedFilms` into a keyed dict; validated/diffed.
- **Boundary exception B1:** `StudioBridgeClient.OnGUI:1506-1514` renders `CRITICAL RECEPTION · FLOP/MIXED/HIT/SMASH` in the First-Film-Journey "Released" beat (from the authoritative wire band; nothing computed locally). Adjudicate (D9).
- Additive attach points (once unblocked): a sibling pure primitive `StudioReleaseResultContracts` (mirrors `StudioReleaseContracts`), a `PostWorldCue` (Released/NowShowing) on `StudioPostWorldContracts.Derive` + a root on `StudioPostBuildingPresentation`, and/or a `StudioReleaseResultWorkspace` on `StudioWorkspaceHost`. `StudioPostPresentationRegistry.Apply` already receives the release projection. **Result presentation must remain read-only + compute-free (Unity forbidden from deriving bands/figures).**

## 7. Original *The Movies* delta (§12) — KEEP / MODERNIZE / REJECT

Cross-cutting: reproduce reference **shapes** only (never trade dress); masthead is the fictional *Silver Screen Gazette*; presentation reacts to truth, never creates it.
- **Review presentation** — KEEP a dedicated editorial write-up (not just a number); MODERNIZE into the deterministic Gazette clipping (already a browser primitive).
- **Star ratings** — KEEP 0-5 stars as instantly-legible verdict; MODERNIZE as a pure projection of `criticScore` (`criticStars`).
- **Critic/audience reaction** — KEEP a two-sided verdict; MODERNIZE (more rigorous than the original's critic-centric model): critic scalar + audience per-segment tier (no invented single audience score).
- **Box office** — KEEP a living, decaying per-film income stream (not a lump); it exists as `TheatricalRun.weeklyGross`.
- **Film charts** — KEEP-PRINCIPLE (a released film has visible standing) but **DEFER**: no chart/leaderboard exists; borders Owner-reserved competition/awards → route by Owner (D10).
- **Released-film tracking / movie history** — KEEP; MODERNIZE as `releasedFilms` (append-only, permanent) + Film Chronicle/Clipping re-entry.
- **Movie-info cards** — KEEP (already the Living-Studio movie rail).
- **REJECT:** blindly reproducing historical scoring/UI; a studio-wide 5-star reputation number (unless Owner revives it); named-critic personalities (adjacent to undecided directions).

## 8. Modern-comparator delta (§13) — ≤6 comparators

Comparators: Game Dev Tycoon, Football Manager, Two Point (Hospital/Campus), Planet Zoo, Cities: Skylines, Frostpunk/Civ VI (replay/history). Transferable, deterministic-friendly practices:
- **Staged reveal** — short ordered sequence (headline → critic → audience → opening box → profit/loss → forecast delta), skippable; never a dumped report card.
- **Two-tier explanation** — WHAT on the result, WHY one click away (autopsy already exists browser-side).
- **Delayed financials** — the headline is the review; money is a trailing curve (`weeklyGross` supports an animated multi-week reveal, or keep opening+projected).
- **History** — one persistent, re-derivable "story of the run" (Chronicle/recap already exist browser-side; port).
- **Overload avoidance** — one headline verdict + a few numbers, rest behind a click.
- **World-first** — reveal over/beside the living lot, not a full-screen modal (a modal is a measured world-first break — Owner decision D6).
- **Celebration restraint** — scale flourish to outcome AND frequency; short, skippable, no input-block.
- **Accessibility** — pace control is accessibility (44×44 / 16-14px / non-colour-only / keyboard-focus carry from P05A).
- **Deterministic presentation** — the reveal is pure playback of the frozen `FilmResult`, never a re-roll.

## 9. Collision ownership (for the charter's lanes)

| Concern | Owner | Locked paths (indicative) |
|---|---|---|
| Core reception unification + (if D1/D2 persist) optional FilmResult fields + V17 | Core Result owner | `src/core/reception.ts`, `types.ts` (FilmResult optional fields), `save.ts` (V17 envelope + convertV16ToV17), `index.ts`, one canonical reception-verdict helper; focused tests |
| Post-release projection + DTO + projection 14→15 | Contract owner | new `bridge/releaseResults.ts` (or extend `release.ts`), `bridge-schema.ts`, `snapshot-build-context.ts`, `session.ts` projection arm, `generated/unity/*` + manifest, contract tests |
| Unity result consumer (world cue / workspace) | Unity Result owner | new `StudioReleaseResultContracts.cs`, `StudioPostWorldContracts`/`StudioPostBuildingPresentation` cue, optional `StudioReleaseResultWorkspace` + UXML/USS, focused EditMode tests |
| Rail post-COMMITTED lifecycle (if D6 adds tokens) | Unity Rail owner | `StudioMovieRailContracts.cs` (`ProductionLifecycle`), `StudioMovieSlateContracts.cs` (`ProductionGroup`) — single seam per the future-seam doc |
| Continuity/proof (oracle scenario, real-profile, HID) | Proof owner | fixtures generator, post-release oracle scenario, runners/sidecars |
| Shared integration | Lead only | `StudioWorkspaceHost` route, bootstrap/scene, B1 memo disposition |

Single-file lock points: `tick.ts` step-3 reception block; the `FilmResult` type; the `Action`/projection unions; the one reception-verdict helper (exactly one owner).

## 10. P06 boundaries P07 must NOT cross
Rail stops at COMMITTED until D6 authorizes post-COMMITTED tokens. No money on the rail (§26) unless D5 rules it.
No result computed in Unity. Browser reveal chain not extended. No runtime LLM / editorial feedback. No Hollywood
Wire runtime dependency (emit typed receipts only where clean). Result permanence preserved (never re-roll).
