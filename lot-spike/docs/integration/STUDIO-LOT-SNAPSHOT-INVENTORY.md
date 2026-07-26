# StudioLotSnapshot — Field Inventory

The exact presentation contract the lot consumes, as it exists at commit
`8c5a18b`. Source of truth: `lot-spike/src/snapshot/StudioLotSnapshot.ts`. This
documents the **frozen** implementation; it does not propose new fields.

The snapshot is a plain, framework-neutral fact-bag. It contains **no** game
truth by itself — the host translates validated `GameState` into it at the
application boundary (`fromGameState.ts` shows a types-only worked example). The
lot never sees `GameState` and re-derives no rule.

## Top-level `StudioLotSnapshot`

| Field | Type | Req/opt | Current visual use | Expected host authority | Fallback if absent/empty | Integration concern |
|-------|------|---------|--------------------|-------------------------|--------------------------|---------------------|
| `studioName` | `string` | required | Top bar; gate lettering ("MERIDIAN PICTURES") | Game truth (studio identity) | n/a (string always present) | Long names may overflow the gate texture overlay; host should cap ~24 chars |
| `week` | `number` | required | Top bar "Week N" | Game truth (calendar/tick→week) | Shows `0`/blank | Contract assumes an integer week; a date model would need host→week/label mapping |
| `standing` | `StandingBand` = `'struggling' \| 'finding-footing' \| 'established' \| 'prestige'` | required | Drives "busy" lot (ambient count, vehicles, established dressing, arrival vignette eligibility) + top-bar label/tone | **Host presentation translation** of a standing number into a band | Treated as `'struggling'` visually if unknown | The 4 bands are a display classification, not sim thresholds; host owns the mapping and may retune |
| `cashBand` | `CashBand` = `'in-the-red' \| 'tight' \| 'stable' \| 'flush'` | required | Top-bar label + tone only | **Host presentation translation** of cash into a band | Neutral label | Display-only; never an accounting value |
| `activeProductions` | `ProductionCard[]` | required (may be `[]`) | Which stages are lit, tags, progress, arrival/prep/filming vignette eligibility | Game truth (in-flight productions) + host stage assignment | Empty ⇒ both stages idle, no production vignettes | See ProductionCard; **stage assignment is host presentation policy** |
| `releasedFilms` | `ReleasedCard[]` | required (may be `[]`) | Theater marquee panel; studio-reaction vignette eligibility + tone | Game truth (released films) | Empty ⇒ theater panel shows nothing; no reaction vignette | See ReleasedCard |
| `buildings` | `BuildingState[]` | required | Per-building dimming/availability + look | **Host presentation policy** layered on studio facts | Missing entry ⇒ building treated as `available: true` | There is no game concept of "building availability"; host decides (see PRESENTATION-ASSUMPTIONS) |
| `selectedBuildingId` | `BuildingId \| null` | required (nullable) | Host-provided **initial** selection | Host UI state | `null` ⇒ nothing selected | The view also tracks live click selection; this is only the seed selection |
| `sceneSeed` | `string` | required | Seeds ALL cosmetic variation (ambient start offsets, prop jitter, vignette order) | **Lot-owned cosmetic** (host supplies any stable string; save seed is a good source) | If unstable, cosmetics reshuffle but nothing breaks | Must be stable across re-renders of the same state for determinism |

## `ProductionCard` (per active production)

| Field | Type | Req/opt | Visual use | Host authority | Fallback | Concern |
|-------|------|---------|-----------|----------------|----------|---------|
| `id` | `string` | required | Stable key; seeds per-film deterministic stage dressing | Game truth (production id) | — | Must be stable per production for deterministic gear placement |
| `title` | `string` | required | Production tag, title-board easel, vignette toast, character card | Game truth (from concept) | "Untitled" | Long titles are truncated in tags/boards |
| `genre` | `string` (display label) | required | Production tag "Genre · N wks left" | Host presentation (sim `Genre` union → capitalized label) | "Feature" | Free string, not the sim enum — decoupled on purpose |
| `stageId` | `'stage-a' \| 'stage-b'` | required | Which soundstage lights up + hosts the film | **Host presentation policy** (GameState has no stages) | — | Only two stages exist visually; see below and PRESENTATION-ASSUMPTIONS |
| `progress01` | `number` 0..1 | required | Progress bar fill | Host arithmetic on stored fields (elapsed/total) | clamps to 0..1 | Presentation arithmetic, not a timing rule |
| `weeksRemaining` | `number` | required | "N wks left" label | Game truth (remaining ticks→weeks) | 0 | Assumes 1 tick == 1 week (host maps) |
| `active` | `boolean` | required | Lit/working vs paused stage; gates prep/filming/arrival vignettes | Game truth (is it shooting) | idle | Distinct from stage availability |

## `ReleasedCard` (per recent release)

| Field | Type | Req/opt | Visual use | Host authority | Fallback | Concern |
|-------|------|---------|-----------|----------------|----------|---------|
| `id` | `string` | required | Stable key | Game truth (production id) | — | — |
| `title` | `string` | required | Marquee list; reaction toast | Game truth | "Untitled" | — |
| `reception` | `ReceptionBand` = `'flop' \| 'mixed' \| 'hit' \| 'smash'` | required | Marquee badge; reaction tone (celebration/publicity/disappointment) | **Host presentation translation** of a critic score into a band | badge omitted | Display band, not a score |
| `weeksAgo` | `number` | required | Recency ordering; reaction eligibility (≤ ~6 weeks) | Game truth (now − releaseTick) | large ⇒ no reaction | Recency window is a lot-owned cosmetic threshold |

## `BuildingState` (per building)

| Field | Type | Req/opt | Visual use | Host authority | Fallback | Concern |
|-------|------|---------|-----------|----------------|----------|---------|
| `id` | `BuildingId` | required | Which building the entry targets | Stable id (shared vocab) | — | 9 fixed ids (see below) |
| `available` | `boolean` | required | `false` ⇒ building dimmed/greyed; stage `false` ⇒ dark closed stage | **Host presentation policy** | `true` | No game "availability"; host must decide semantics honestly (see assumptions) |
| `underDressed` | `boolean` | optional | Struggling look hint (plainer); currently expansion pad reads dirt when set | Host presentation policy | `false` (fully dressed) | Cosmetic hint only |

## `BuildingId` (stable vocabulary, 9 values)

`admin`, `writers`, `casting`, `stage-a`, `stage-b`, `post`, `theater`, `gate`,
`expansion`. Exported with `ALL_BUILDING_IDS` (stable order) and `BUILDING_ACTION`
(id → `LotActionKind`). These ids are the shared key space between host and lot and
should be treated as a stable enum.

## Classification summary

- **Required for minimum lot operation:** `studioName`, `week`, `standing`,
  `cashBand`, `buildings`, `sceneSeed` (+ `activeProductions`/`releasedFilms` may
  be `[]`). See DATA-REQUIREMENTS Level A.
- **Required for full visual behavior:** non-empty `activeProductions` (stages,
  tags, prep/filming/arrival), `releasedFilms` (marquee + reaction),
  `BuildingState.available` per building.
- **Optional enhancement:** `BuildingState.underDressed`, `selectedBuildingId`.
- **Fixture-only today:** the *values* in `fixtures.ts` (STRUGGLING/SUCCESSFUL/
  CELEBRATION/DISAPPOINTMENT) — the shape is production-real, the data is demo.
- **Debug-only:** none of the snapshot; debug lives on `window.__lot`, not the contract.
- **Likely to change during integration:** `standing`/`cashBand` band cut-points
  (host-owned), `stageId` assignment policy, `buildings[].available` semantics,
  the `week`-is-an-integer assumption.
- **Inappropriate for the final production contract:** nothing is inappropriate —
  but `stageId` and `available` must be documented as **host presentation policy**,
  not game truth, so no one mistakes them for simulation state.

## Truth boundaries

- **Game truth (host reads from GameState):** studioName, week, per-production
  id/title/genre-source/active/remaining, released id/title/critic-source/recency,
  standing number, cash number.
- **Host presentation translation:** standing→band, cash→band, critic→reception,
  elapsed→progress01, production→stageId assignment, studio facts→building
  availability.
- **Lot-owned cosmetic:** sceneSeed-driven variation, vignette scheduling, ambient
  routes, dressing — none of it feeds back into game state.
