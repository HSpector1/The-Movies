# P07 — Authoritative Result Facts: Consumer Handoff (V1)

**Status:** documentation only. Hollywood Wire is NOT integrated; no runtime
dependency exists or is added here. This page records exactly which release
/reception/result facts P07 makes authoritative, so a FUTURE consumer
(Hollywood Wire first; Studio Radio remains downstream of Hollywood Wire) can
read them without guessing — and without modifying them. **Consumers may
consume these facts. Consumers may never modify them.**

## Where the facts live

- **Persistence (save V16; P07 added NO save version):**
  `state.studio.releasedFilms[]` (`FilmResult` — one durable record per released
  film, frozen at release) and `state.theatricalRuns[]` (one run record per
  engaged-economy release; pre-D-12 legacy films have none).
- **Canonical verdict semantics:** `src/core/receptionVerdict.ts` — the ONE
  source of `criticStars` / `criticBand` / `criticTier` / `audienceTier` /
  aggregate audience / committed cost. Consumers must never re-derive a verdict
  from raw scores with their own thresholds.
- **Derived read-model:** `filmResultView(state, film)`
  (`ui/src/engine/adapter.ts`) — the three-channel view every P07 surface
  renders.
- **Wire:** `StudioReleaseResultsProjection.results[]`
  (`StudioFilmResultSnapshot`, projection 15, protocol 4) — the exact DTO the
  Unity rail + Film Result workspace consume.

## The facts (V1)

| Fact | Field(s) | Authority notes |
| --- | --- | --- |
| Exact result/film identity | `id` (= `productionId`) | Immutable; ALL joins/navigation use it. Never the visible title. |
| Visible title | `title` | Presentation data resolved from the concept; may collide across films. |
| Release week | `releaseWeek` (`releaseTick`) + `weeksAgo` | The authoritative batch week. |
| Theatrical state | `runStatus` ∈ `active · completed · legacyCompleted · none` | `active` = IN THEATERS; anything else has left the operational rail. |
| Run week / completion | `weeksCredited` / `totalWeeks` | 0/0 when no run record exists (legacy). |
| Critics | `criticScore` (0–100), `criticStars` (0–5 halves), `criticBand` (flop/mixed/hit/smash), `criticTier` (pan…rave) | One channel of three. No universal quality score exists anywhere. |
| Audience | `audienceAggregate` (0–100), `audienceTier` (hated…loved), `audiencePerSegment[]` | Independent of critics. |
| Opening gross | `boxOfficeOpening` | Settled at release. |
| Full-run gross | `boxOfficeGrossTotal` | Locked full-run figure; a PROJECTION while `projected` is true. |
| Gross banked so far | `grossPaidToDate` | Weekly-credited; equals the total (±float drift) once complete. |
| Studio revenue (full run) | `studioRevenueTotal` | The run's locked share × gross; legacy films = full gross. **Gross is never studio revenue.** |
| Studio revenue banked | `studioRevenuePaidToDate` | Weekly-credited. |
| Committed cost | `committedCost` | Production + marketing + freelance fees. |
| Bottom line | `contribution`, `roi`, `resultLabel` (`Profit`/`Loss`/`Break-even` or the `Projected …` forms), `projected` | `resultLabel` is decided by the authority; a projection is never labeled final. |

## Forecast / expectation references

`FilmResult.forecast` (`expectedCriticScore` / `expectedTotal` /
`expectedOpening`) is frozen at an ENGAGED greenlight and absent on M0A/legacy
films. Consumers may cite it as "what the studio expected"; it is never
recomputed after greenlight.

## NOT AUTHORITATIVE IN P07 V1 (do not fabricate)

- Per-theater / per-territory / per-format breakdowns.
- A per-week box-office time series beyond the banked-to-date cumulative
  (weekly legs exist inside the run record's schedule, but P07 publishes no
  per-week series on the wire — a consumer needing one must wait for the
  package that makes it authoritative).
- Named review quotes, critic bylines, publication identities (the newspaper /
  Film Chronicle V1 presentation remains governed by
  `FILM-CHRONICLE-V1-CONTRACT.md` — keep, don't extend).
- Awards, nominations, season standing (P08 scope; nothing exists).
- Rival-studio results of any kind.
- Exact source event/receipt identities for release dispatch: the event log
  records `releaseCommitted` / release events, but P07 V1 does not freeze an
  event-id contract for consumers. NOT AUTHORITATIVE IN P07 V1.

## Consumer rules

1. Join by `id` only; treat `title` as display data.
2. Never combine the three channels into a single score.
3. Respect `projected`: a live run's totals are projections; only a
   `completed`/settled record's figures are final.
4. Never label `boxOfficeGrossTotal` as revenue or profit.
5. Hollywood Wire may consume these facts later; it may not modify them.
   Studio Radio remains downstream from Hollywood Wire. No runtime dependency
   is added by this document.
