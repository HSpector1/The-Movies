# P07 — Authoritative Result Facts: Consumer Handoff (V1)

> Current closeout, 2026-09-04: **P06 and P07 OWNER ACCEPTED — KEEP — CLOSED**.
> The original V1 record below is preserved. The appended reconciliation and
> [final P07 → P08 handoff](P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md) govern current
> identity precision, historical limits, and P08 entry authority.

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

## Final Owner closeout and consumer reconciliation — 2026-09-04

The Owner accepted the actual combined P06/P07 journey: safe Release Ready hold,
exact-title commitment with no time advance, release on the next authoritative
week, truthful In Theaters state, correct Details result, independent Critics /
Audience / Business, projected/final and gross/revenue distinctions, Save/Load,
and completed-run inspection. **P06 and P07 are ACCEPTED — KEEP — CLOSED.**
Acceptance was recorded at `2026-09-04T19:51:49Z`; exact playtest time was not
supplied. Prior technical promotion was not prior Owner acceptance.

The [final authority handoff](P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md) records the
accepted runtime, build-manifest, candidate, technical-seal, and documentation
identities independently. In particular, TS runtime authority is
`da848225516fe3ced9a421548d0f5e7cbc8b5b88`; the earlier reported
`85bfa26d834f31091020e55fda962f7835051a6e` is tests/docs only. Accepted Unity
authority is `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`; protocol/projection/save
remain `4 / 15 / V16`. The preserved candidate and exact hashes are recorded in
the [Owner receipt](../campaigns/P07-OWNER-ACCEPTANCE-RECEIPT.md).

Precision for downstream consumers:

- Persisted `FilmResult.productionId` is the result identity; wire `id` equals
  it. Title is derived by concept lookup, not frozen on FilmResult. Release week
  and recency provide the current visible same-title context.
- `filmResultSnapshot` in `ui/src/engine/adapter.ts` maps the derived result to
  the wire. Audience aggregate is derived over existing market shares from the
  persisted segment scores, not stored as a separate historical primitive.
- FILM HISTORY is a group inside `StudioReleaseResultWorkspace`, reached by
  `StudioWorkspaceHost.OpenReleaseResult(exactId)` and exact-ID selection. There
  is no separate always-visible history launch control in accepted P07. An
  unknown preferred ID during Bind can fall back to the first available row;
  consumers must not misidentify that fallback as their requested film.
- Existing managed `studioEvents` may supply permanent `releaseCommitted` and
  `premiere` receipts with seq/week/kind/subject, but no universal external
  dispatch event-ID contract is frozen. Absent old-save receipts, participants,
  forecasts, historical Standing changes, and other unrecorded facts must not
  be reconstructed as if recorded. Future “Not Recorded” is an absence law,
  not a P07 schema/UI feature claim.
- The old no-run settled/full-gross legacy treatment remains authoritative;
  no synthetic run progress, historical review, or revenue split is added.
- Gross, Studio Revenue, and direct-film contribution retain separate bases.
  Locked full-run figures remain projected until settlement. No consumer may
  expose hidden future amounts as settled truth or introduce a universal score.

Known polish, legacy-memo retirement, history-entry limits, failed HID runs, and
the externally preserved sixth canonical Oracle directory remain explicitly
classified in the [execution closeout](CODEX-P07A-EXECUTION-HANDOFF.md#owner-acceptance-closeout--2026-09-04).
Nothing was silently removed or implemented as part of this record.

P07 creates release/result facts. P08 may create Standing/history/award facts
within its own future authorization, without rewriting P07. Hollywood Wire later
interprets factual receipts; Studio Radio remains downstream. Next is P08A
planning/reconciliation; any Future Ops draft remains advisory. P08 production
implementation is **NOT STARTED / NOT YET AUTHORIZED**. This documentation
closeout owns no gameplay/proof process; final process checks are recorded in
the Owner receipt. No candidate mutation, gameplay rebuild, main movement, or
Golden tag is part of this closeout.
