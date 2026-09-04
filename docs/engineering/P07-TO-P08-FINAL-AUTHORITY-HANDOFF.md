# P07 → P08 final authority handoff

P06 and P07 are **OWNER ACCEPTED — KEEP — CLOSED**. The Owner accepted the actual
combined representative journey on 2026-09-04. This ruling was recorded at
2026-09-04T19:51:49Z; the exact playtest time was not supplied. Technical promotion
preceded this acceptance and did not substitute for it.

This is a factual producer/consumer handoff. It authorizes neither P08 production
implementation nor a new interpretation of the accepted P07 results. The next
package is P08A planning/reconciliation. Any Future Ops proposal remains advisory
until Current Ops PM reconciliation and a subsequent implementation order.

## Accepted source and build authority

| Identity | Exact value |
| --- | --- |
| TS last runtime/product-affecting commit | `da848225516fe3ced9a421548d0f5e7cbc8b5b88` |
| Reported TS “product” checkpoint, reconciled as tests/docs only | `85bfa26d834f31091020e55fda962f7835051a6e` |
| TS player-build manifest commit | `d0953e52d6b446137d3141a0310fd98b170e8cc1` |
| TS candidate assembly/package checkpoint | `a6f4f82d35916f9f0cad205a5f478219bad6480e` |
| TS technical-seal/documentation-inclusive campaign tip before Owner closeout | `4bbf26353c9b168f551e4a18ca190eceea201cb9` |
| TS post-Owner-closeout campaign tip | The commit introducing this handoff on `docs/p06-p07-owner-acceptance-closeout-01`, fast-forwarded to `campaign/living-lot-ts`; resolve as described below. |
| Unity last product-affecting commit and final campaign tip | `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` |
| Player executable SHA-256 | `c3372eb566304a14e599811d3e9872759c134aa703a150e17a25cc02e92ef813` |
| Engine bundle SHA-256 | `b92dc8e6edde05e4da86a3c75d3a1657170646045366c234f942b8b5934a2a0a` |
| Assembly-CSharp SHA-256 | `52229807aa64c9a7d1a135360c6db656a75b8e33b2c5dcdda3cfc87aac7064ac` |
| Generated DTO Git blob | `84d9c9a814ad4cc92d8a882205baa2f484ff8527` |
| Generated DTO SHA-256 | `045fccce1ae318cbd338779fd52bd805302c1b8ad5ed033cb24d08eab590047f` |
| Schema ID | `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99` |
| Schema URI | `urn:project-studio:bridge:protocol-4:projection-15` |
| Protocol / projection / save | `4` / `15` / `V16` |

The reported `85bfa26d834f31091020e55fda962f7835051a6e` changes only the W6 continuity
test and execution ledger; it is not the last runtime source change. The player
manifest binds the build to `d0953e52d6b446137d3141a0310fd98b170e8cc1`; the later
candidate checkpoint is not a replacement for that build binding. A Git blob hash
and a file SHA-256 identify the same generated DTO under different algorithms.

A commit cannot contain its own final SHA. After closeout, obtain the exact
post-closeout SHA with `git rev-parse docs/p06-p07-owner-acceptance-closeout-01`
and verify its equality to the local/upstream/advertised campaign refs. The final
delivery records that exact full value separately; it is never the product SHA.

Accepted candidate:
`/Users/bruce/Desktop/P07A-Owner-Candidate-a6f4f82-c4c65db/`.
See [Owner acceptance receipt](../campaigns/P07-OWNER-ACCEPTANCE-RECEIPT.md) for
manifest identity, preservation checks, evidence reconciliation, and the complete
accepted journey. The candidate was not rebuilt or modified to record acceptance.

## Film identity and authoritative result channels

Persistence is `state.studio.releasedFilms[]` (`FilmResult`,
`src/core/types.ts`). Its immutable identity is `productionId`. There is no
additional persisted `FilmResult.id`: the wire's
`StudioFilmResultSnapshot.id` **equals `productionId`**. Use this exact ID for
joins and navigation, never title or list position.

The persisted result also supplies `conceptId`, `directorId`, `releaseTick`,
resolved reception primitives, `segmentScores`, and opening/full-run gross.
`participants` and the frozen greenlight `forecast` exist only where captured.
The wire mapper `filmResultSnapshot` in `ui/src/engine/adapter.ts` resolves the
exact display `title` from `conceptId`, falling back to the concept ID. A title
is not a separately frozen field on FilmResult.

Release context is `releaseWeek = releaseTick` and derived `weeksAgo`. These
fields provide the current same-title visual disambiguation. Two films retain
different IDs even when their visible titles coincide. Do not claim an additional
same-week human-readable disambiguator or a frozen historical title field exists.

| Channel | Published facts | Consumer obligation |
| --- | --- | --- |
| Critics | `criticScore`, `criticStars`, `criticBand`, `criticTier` | Preserve the TS-decided verdict; this is one channel. |
| Audience | `audienceAggregate`, `audienceTier`, `audiencePerSegment[]` with `segment`/`score` | Preserve independent audience response, including disagreement with critics. |
| Business | Opening/total/paid gross, total/paid Studio Revenue, committed cost, contribution, ROI, projected flag, result label | Preserve financial basis and projected/settled tense. |

`src/core/receptionVerdict.ts` is the canonical verdict authority.
`filmResultView` and `filmResultSnapshot` compose the result projection in
`ui/src/engine/adapter.ts`. The wire is
`StudioReleaseResultsProjection.results[]` in the `releaseResults` section of
the projection bundle. Unity formats and presents these semantics through
`StudioReleaseResultContracts`; it neither recomputes reception nor creates a
universal Movie Quality score. Result presentation consumes no gameplay RNG.

The audience aggregate is derived from persisted segment scores and the existing
market-share basis; it is not a separately persisted historical aggregate. Do not
replace existing semantics with new thresholds, weighting, or a composite score.

## Commitment and theatrical lifecycle

`src/core/releaseAuthority.ts` owns commitment; `src/core/actions.ts` applies
`commitPictureToRelease` to the exact production. A Release Ready film holds until
committed. Commitment records `productionId`, deterministic
`commitmentId = release-commitment-<productionId>`, and `committedAtWeek` in
`state.releaseAuthority.commitments[]`. It advances no time, consumes no RNG,
moves no cash, and creates no FilmResult.

The next authoritative weekly batch in `src/core/tick.ts` releases the committed
picture, creates the durable result, opens a theatrical run when the economy is
engaged, and removes the current commitment row atomically. Release Ready,
Committed, Released, In Theaters, and Run Complete remain different facts.

`state.theatricalRuns[]` retains production/concept/release identity, locked
`weeklyGross`, locked `studioShare`, `totalWeeks`, `weekIndex`, cumulative paid
values, `economyModelVersion`, and status. The wire publishes:

| Wire state | Operational consequence |
| --- | --- |
| `runStatus: active` | IN THEATERS; `weeksCredited` and `totalWeeks` describe run progress; totals remain projected. |
| `runStatus: completed` | Run complete; leaves the active rail; settled result remains in FILM HISTORY. |
| `runStatus: legacyCompleted` | Existing migrated settled legacy run; do not repay or invent a modern run. |
| `runStatus: none` | No run record; existing legacy settled result, with run-week fields `0/0`. |

Unity `StudioMovieRailContracts.ReleasedRowWanted` admits only `active` results
to the operational rail. Completion does not delete the film, result, or run.
P07 has not introduced a separate durable run-completion event/receipt contract.

## Financial terminology and visibility

| Meaning | Exact field/basis |
| --- | --- |
| Opening theatrical gross | `boxOfficeOpening` |
| Current gross actually credited | `grossPaidToDate` |
| Full-run gross | `boxOfficeGrossTotal`; projected while the run is active, final after settlement |
| Studio Revenue actually credited | `studioRevenuePaidToDate` |
| Full-run Studio Revenue | `studioRevenueTotal`, using the run's locked share and existing legacy basis |
| Direct film commitment | `committedCost`, from the retained film-attributed ledger |
| Film contribution and ROI | `contribution = studioRevenueTotal - committedCost`, `roi`; preserve the authoritative scope |
| Projected/final language | `projected` and TS-authored `resultLabel` |

Active results say “Tracking toward (gross)” and “Projected studio revenue”; paid
figures say “banked to date”. Settled results say “Final box office (gross)” and
“Studio revenue”. Profit/Loss/Break-even wording comes from `resultLabel`, with
“Projected” while appropriate. Film contribution is not a newly allocated measure
of total studio profit. Gross is never synonymous with Studio Revenue or Profit.

The engine already locks a full-run amount internally. A consumer may not reveal
that amount as settled final truth while the public result is projected. Do not
invent a revenue share, cost allocation, hidden future cash, or new finance facts.

## Durable history and exact-ID navigation

Save V16 retains FilmResults and theatrical runs. Existing W6 proof covers the
exact mid-run save/load result projection and identical future run completion,
along with distinct same-title records and pure repeated projection. P07 needed
no save-version increase because its result surface derives from existing state.

The current Unity history seam is the **FILM HISTORY group inside
`StudioReleaseResultWorkspace`**, alongside IN THEATERS in wire order.
`StudioWorkspaceHost.OpenReleaseResult(exactId)` opens the read-only workspace;
`SelectResult(exactId)` selects within it. Active-rail DETAILS and keyboard
activation call that route. Selection of an existing ID survives rebinding and
the same film's transition from active run to history.

The accepted code does not provide a separate always-visible Film History launch
control after every active rail result has left. Do not describe a future Studio
History entrance or physical history owner as already shipped. The durable
records and workspace seam are available for future consumers. This limitation
does not reopen the Owner's successful representative history inspection.

`SelectResult` ignores an unknown ID. `Bind` falls back to the first available
active/history row when its preferred ID is absent; a future exact-ID caller
must not claim that fallback proves its requested film exists. No new behavior
is implemented by this handoff.

Existing `state.studioEvents` receipts have `seq`, `week`, `kind`, and their
typed subject fields. In managed games, permanent Tier D includes
`releaseCommitted.productionId` and `premiere.filmId` (the production ID).
Sequences never renumber. These facts can identify a recorded source within its
studio/save context; P07 does **not** freeze a universal external release-dispatch
event-ID contract. The log is not outcome or significance authority, and consumers
do not own it. Its existing simulation-input exception is permanent identity
reservation: `persistedProductionIds` in `src/core/productionIdentity.ts` reads
Tier D production IDs to prevent their reuse when `src/core/actions.ts` allocates
a new production. Preserve that exception; it grants no result-rewriting authority.

Facts absent from old saves remain absent. Pre-V16 migration adds an empty
commitment authority, without fabricating commitments, receipts, weeks, or RNG
movement. Existing no-run legacy films retain the established settled/full-gross
legacy revenue treatment. “Not Recorded” is the future consumer's honest absence
law, not a claim that a P07 Not Recorded UI or schema enum already exists.

P07 does not promise historical Standing before/after deltas; named reviews,
bylines or publications; per-theater/territory/format outcomes; a public weekly
box-office series; rival results; nominations/awards; missing participants or
forecasts; or missing historical source receipts. A locked internal weekly gross
schedule is not a new public historical time-series contract. Windowed studio
events are not guaranteed permanent history. Preserve only facts actually held
by their existing authorities.

## World ownership and future consumer law

A released film may truthfully have no current physical lot owner. Released
rows and the result workspace have no Locate target. Details/history remains the
inspection seam; do not invent a location or move the camera to manufacture one.
The result workspace opens without a time charge, forced modal, or gameplay
action. Physical Production/Post ownership before release remains independently
usable, as accepted by the Owner.

P08 may record and present historical facts from these authorities. It may not
rewrite P07 results, invent missing history, collapse Critics/Audience/Business,
use a title as identity, mint awards merely from result magnitude, or promote
history significance into result authority.

P07 creates the release/result facts. P08 may create Standing/history/award facts
within its own subsequently authorized scope. Hollywood Wire later interprets
factual receipts; Studio Radio remains downstream. This handoff adds no Wire or
Radio dependency, no awards gameplay, no P08 production branch, and no P08 code.
