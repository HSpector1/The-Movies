# PACKAGE 07 BUILDER ANNEX — RECEPTION, BOX OFFICE & FILM RESULTS

- **Companion authority:** `docs/design/CODEX-RECEPTION-BOXOFFICE-PACKAGE-07.md`
- **Baseline:** `c902a704eb948cc576083d0973c8c23e59937dc1`
- **Branch:** `codex/reception-boxoffice-research-07`
- **Purpose:** let Fable inspect, reuse and build without another research campaign
- **Scope:** documentation only; no production implementation is authorized by this annex

## Read this first

1. Package 02 controls Select, Focus, Locate, retained-world navigation, camera and Back.
2. This mission supplies Package 06's `Commit <title> to Release` boundary as the upstream design
   premise: the commit advances no time and actual response remains unknown. The baseline does not
   implement that gate yet; P07A begins only after P06A does.
3. Package 07 begins on the next authoritative week when TypeScript creates `FilmResult`.
4. The browser already contains the strongest Project: Studio behavioral reference. Reuse its
   truth/read models; do not translate its small desktop page literally into Unity.
5. The current Unity bridge has only `{id, title, reception, weeksAgo}` for a released film. A
   builder cannot implement this contract honestly by styling that DTO. The bridge projection must
   be extended from TypeScript authority before rich Unity presentation.

---

# A. Comparator Reference Atlas

Each entry is a **look-here-before-building** reference. “Copy” means copy the interaction law, not
the art, economy or vocabulary.

## A1. Release is separate from preview and result — *The Movies*

- **Source:** [official English manual PDF](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf), printed p. 12, “Releasing Your Movie”; printed pp. 38–39, Reviews/test-screening help.
- **Exact interaction:** preview the finished film in Movie Player; optionally test-screen it; drag
  the film to Release; result/reviews follow.
- **Fable should inspect:** the four distinct states—inspect, forecast, commit, actual reception.
- **COPY PRINCIPLE:** Package 06 commitment is inert with respect to result; Package 07 reveal is a
  new public event.
- **DO NOT COPY:** drag-only material actions, tiny film cans, five release-spend buttons, or
  treating a pre-release test-screening read as a guaranteed outcome.
- **Project: Studio translation:** retained Release Review closes with an exact commitment receipt;
  the next week creates a separate exact-film Result attention.

## A2. Result remains attached to a physical film object — *The Movies*

- **Source:** same [official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf), printed pp. 6–7 and 12–13; [Prima archive record](https://archive.org/details/The_Movies_Prima_Official_eGuide), PDF pp. 44–46 / printed pp. 43–45.
- **Exact interaction:** the movie card changes through production states, pulses `$` while earning,
  then can be archived.
- **Fable should inspect:** one artifact carries lifecycle and commercial activity.
- **COPY PRINCIPLE:** one stable film ID across result, run and history.
- **DO NOT COPY:** manual archiving, pulsing forever, or one small icon as the business report.
- **Project: Studio translation:** the world cue and retained dossier show the same `productionId`;
  history is automatic.

## A3. A later Mac bundle review illustrates opacity and clerical fatigue — Superstar Edition

- **Source:** [macinplay.de — “The Movies: Superstar Edition”](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), sections **“Alles dreht sich um den Film”** and **“Mikromanagement, das auch mal nervt.”**
- **Reviewer observation:** the reviewer praises watching the company shoot, separately describes a
  large cost/duration evaluation at Release and box-office takings during the run, and criticizes
  manually archiving each movie and hard-to-understand rating/award results.
- **Fable should inspect:** physical payoff survived; opaque evaluation and repetitive handling did not.
- **COPY PRINCIPLE:** preserve watchability and a dramatic release verdict.
- **DO NOT COPY:** clerical Archive, repeated caretaker labor or unexplained rating categories.
- **Project: Studio translation:** autonomous run/history plus an evidence-backed Autopsy.

## A4. One object dossier joins operation, audience and money — *RollerCoaster Tycoon*

- **Source:** [official RCT manual PDF](https://cdn.akamai.steamstatic.com/steam/apps/285310/manuals/rollercoaster_tycoon.pdf), printed pp. 80–82, “Ride Windows.”
- **Exact interaction:** one named ride window exposes View/Locate, Measurements, Graphs, Income and
  Costs, Customers, Thoughts, Riders and Queueing.
- **Fable should inspect:** lenses remain attached to one persistent object and View returns to it.
- **COPY PRINCIPLE:** Result, Reviews, Box Office, People and Chronicle are lenses over one film.
- **DO NOT COPY:** floating-window piles, tiny icon tabs or ride metrics.
- **Project: Studio translation:** every film row and world cue opens the same exact dossier; Locate
  is a navigation command, not a different record.

## A5. Portfolio list is an index, not a second model — *RollerCoaster Tycoon*

- **Source:** same [official RCT manual](https://cdn.akamai.steamstatic.com/steam/apps/285310/manuals/rollercoaster_tycoon.pdf), printed pp. 74–75, “Rides Info.”
- **Exact interaction:** sortable status rows open the corresponding ride/shop window.
- **Fable should inspect:** overview-to-dossier identity and status scanning.
- **COPY PRINCIPLE:** the theatrical slate/Film Chronicle list opens exact film records.
- **DO NOT COPY:** a spreadsheet-only experience or different calculations in list and dossier.
- **Project: Studio translation:** the portfolio consumes the same TypeScript result/run read model.

## A6. Critics and audiences retain provenance — Rotten Tomatoes

- **Source:** [About Rotten Tomatoes](https://www.rottentomatoes.com/about), “What is the
  Tomatometer?”, “What is the Popcornmeter?”, “What is Certified Fresh?”
- **Exact interaction:** professional-critic and audience measures are shown as distinct channels;
  evidence thresholds affect whether badges are presented as settled.
- **Fable should inspect:** visual separation, labels and evidence provenance.
- **COPY PRINCIPLE:** a viewer should never wonder who a score represents.
- **DO NOT COPY:** Fresh/Rotten branding, review-volume thresholds, certification, colors or a second
  audience metric that Project: Studio does not model.
- **Project: Studio translation:** `Critics` and `Audience response` sit beside, not inside, each
  other; both have text/icon labels independent of color.

## A7. Audience aggregate is not professional consensus — IMDb

- **Source:** [IMDb Ratings FAQ](https://help.imdb.com/article/imdb/track-movies-tv/faq-for-imdb-votes/G67Y87TFYYP6TWAV), “What are IMDb ratings?” and “Are ratings the only tool IMDb offers?”
- **Exact interaction:** audience votes form the title rating; professional reviews are separate.
- **Fable should inspect:** provenance is stated where the number appears.
- **COPY PRINCIPLE:** name the population/channel, not a generic “Rating.”
- **DO NOT COPY:** IMDb's weighted-average method, vote counts or 1–10 scale.
- **Project: Studio translation:** use `Critics`, `Audience`, `Opening` and `Film Contribution`, never
  a generic `Score` tile.

## A8. Opening and run shape tell different stories — Box Office Mojo

- **Source:** [Box Office Mojo title dossier example](https://www.boxofficemojo.com/release/rl4253450241/), plus [Box Office Mojo](https://www.boxofficemojo.com/) navigation.
- **Exact interaction:** opening, daily/cumulative, domestic/international and release-calendar views
  make the commercial result a timeline rather than one total.
- **Fable should inspect:** hierarchy of opening → current period → cumulative → history.
- **COPY PRINCIPLE:** separate opening, weekly/cumulative gross and the studio's share.
- **DO NOT COPY:** territories, theater counts, distributors, rankings or current live data.
- **Project: Studio translation:** P07 uses only the locked `weeklyGross`, cumulative gross and
  Studio Revenue fields currently modeled.

## A9. Aggregate judgment drills into named evidence — Google Play ratings/reviews

- **Source:** [View and analyze ratings and reviews](https://support.google.com/googleplay/android-developer/answer/138230?hl=en), sections “Performance over time,” “Ratings breakdown,” “Reviews analysis,” “Benchmarks.”
- **Exact interaction:** headline/lifetime signal → time/distribution → clustered topics and
  comparison context.
- **Fable should inspect:** progressive disclosure and how a headline verdict leads to evidence.
- **COPY PRINCIPLE:** every aggregate result gets an accessible driver route.
- **DO NOT COPY:** machine-generated causal certainty, peer benchmarks or review moderation.
- **Project: Studio translation:** Result → What Worked/Hurt → Advanced Analysis; TypeScript publishes
  the drivers.

## A10. Money carries basis and time window — Google Play revenue

- **Source:** [Review revenue and buyer data](https://support.google.com/googleplay/android-developer/answer/6056620?hl=en), “Revenue,” “Revenue breakdown per product,” “Cohort data,” “Dimensions.”
- **Exact interaction:** range, prior-period comparison and breakdown travel with the amount.
- **Fable should inspect:** contextual labels prevent one number from pretending to be profit.
- **COPY PRINCIPLE:** show basis (`gross`, `Studio Revenue`, `direct contribution`) and state
  (`paid`, `projected`, `final`) together.
- **DO NOT COPY:** app-store revenue vocabulary, refunds/cohorts or equating revenue with profit.
- **Project: Studio translation:** every financial tile carries its accounting and time qualifier.

## A11. Outcome → evidence → action — Football Manager Data Hub

- **Source:** [Football Manager “Gameplay Upgrades”](https://www.footballmanager.com/features/gameplay-upgrades), “Data Hub” and “Match Analytics.”
- **Exact interaction:** overview metrics; pros/cons on visuals; notable stats in reports; selected
  preferred analysis; comparative context.
- **Fable should inspect:** a digestible default report and optional deep analysis.
- **COPY PRINCIPLE:** emphasize a few meaningful positives/negatives, with full data deeper.
- **DO NOT COPY:** metric volume, polygons/radar charts or football statistics.
- **Project: Studio translation:** four headline lanes, max three What Worked/Hurt, one Surprise,
  then collapsed Advanced Analysis.

## A12. Post-release report is a learning layer — *Game Dev Tycoon*

- **Source:** [Greenheart Games official Steam announcement](https://www.greenheartgames.com/2013/08/22/game-dev-tycoon-is-coming-to-steam-on-august-29th/), feature bullets “Rebalanced review system” and “Post-release game reports and company expertise”; [official changelog](https://www.greenheartgames.com/game-dev-tycoon-changelog/), v1.4.0 report/insight notes.
- **Official feature evidence:** the announcement names “Post-release game reports and company
  expertise.” Changelog v1.4.0 adds a game-reports mechanic for insights from released games and
  says report-earned development hints appear in the UI. These sources establish the feature
  distinction, not a fully verified screen interaction.
- **Fable should inspect:** result excitement and diagnostic learning are related but distinct.
- **COPY PRINCIPLE:** actual response arrives first; Autopsy teaches the next decision.
- **DO NOT COPY:** hidden topic/genre tables, review sequence theatrics or game-development rules.
- **Project: Studio translation:** the Autopsy is read-only and never changes the frozen film.

## A13. Automatic status history — App Store Connect

- **Source:** [View app status history](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/view-app-status-history/).
- **Exact source observation:** a status-history table retains status, date/time and originator.
- **Fable should inspect:** active state and durable history are related but separate views.
- **COPY PRINCIPLE:** keep active state and automatically recorded history separately inspectable.
- **DO NOT COPY:** account roles, policy-review jargon or a separate audit product.
- **Project: Studio translation:** Project: Studio's own append-only history contract records
  commission/Greenlight/release/run facts where witnesses exist and fails missing sections closed;
  that append-only law is our ruling, not an Apple claim.

## A14. Reach → engagement → money remain separate — App Store Connect Analytics

- **Source:** [App Store Connect Analytics Help](https://developer.apple.com/help/app-store-connect-analytics/) and [Overview of reporting tools](https://developer.apple.com/help/app-store-connect/measure-app-performance/overview-of-reporting-tools).
- **Exact interaction:** discovery, engagement, purchases/proceeds and refunds are separate layers
  with drill-down dimensions.
- **Fable should inspect:** distinct metrics can still form one coherent result story.
- **COPY PRINCIPLE:** preserve the chain without collapsing metric provenance.
- **DO NOT COPY:** app funnel, privacy thresholds, platform proceeds or unmodeled dimensions.
- **Project: Studio translation:** Creative → Critics/Audience → gross → Studio Revenue → direct
  contribution.

## A15. Current Project: Studio browser is the closest behavioral reference

- **Source:** local components `ui/src/screens/NewspaperReveal.tsx`, `ReleaseResult.tsx`,
  `Autopsy.tsx`, `FilmRecord.tsx`; `ui/src/screens/Dashboard.tsx` active-run panels.
- **Exact interaction:** deterministic Gazette first, separate critic/audience, opening Studio
  Revenue paid versus unbanked scheduled Studio Revenue/contribution, accessible Autopsy default,
  advanced evidence, Chronicle after reload where eligible.
- **Fable should inspect:** information ordering, exact disclosures and fail-closed routes.
- **COPY PRINCIPLE:** reuse selectors/read models and proven information hierarchy.
- **DO NOT COPY:** the browser's full-page white-card density, tiny helper text, dashboard-first
  navigation or session-only Autopsy mislabeled as durable.
- **Project: Studio translation:** retain the lot behind a large legible workspace and expose the same
  truthful facts through bridge DTOs.

---

# B. Existing-System Reuse Map

## B0. Current result boundary — facts Fable must not infer around

| Current persisted/published fact | Important absence or seam |
|---|---|
| `FilmResult` has stable `productionId`, release tick, delivered expression, alignment, craft, critic construction/result, segment scores, gross and optional participants/forecast. | It has no frozen title, film-specific cost/profit, audience aggregate, review text/count, marketing label, awards/IP value or universal Movie Quality. Titles are commonly resolved through `conceptId`; some career/clipping witnesses freeze title separately. |
| `TheatricalRun` has a locked weekly schedule, share, paid totals, index and status. | It has no attendance, theater count, territories, distributor, explicit end-date field or player action. |
| The ledger can reconstruct direct film commitment and paid Studio Revenue. | Studio payroll/overhead is not canonical film cost; gross is not studio cash. |
| `TalentCareerEvent` freezes exact participant consequences. | Studio standing delta in a multi-release week is shared; no per-film standing event exists. |
| Gazette/Chronicle are deterministic and durable where frozen witnesses exist. | The full mechanistic Autopsy requires the UI-held pre-release snapshot and cannot survive reload honestly. |
| Segment scores persist. | Audience aggregate/label is derived using segment shares supplied at read time; future changing shares require a deliberate freeze/migration decision. |
| The permanent `premiere` event identifies the film. | The current bridge does not publish a rich result event or run; Unity only sees four coarse release-card fields. |

If a requested UI line is not supported by the left column or a named TypeScript read model, omit it
or display a section-specific unavailable state. Do not manufacture a convenient approximation in
Unity.

## B1. TypeScript authority

| Need | Exact current Project: Studio path/component | Reuse / Extend / Replace / Leave Alone | Why |
|---|---|---|---|
| Released-film identity/result | `src/core/types.ts` — `FilmResult` | **REUSE / LEAVE ALONE** | Sole persisted creative/reception/gross record. Do not add a UI-owned movie model. |
| Active theatrical run | `src/core/types.ts` — `TheatricalRun`; `src/core/economy.ts` | **REUSE / LEAVE ALONE** | Locks weekly gross, share, payment index and completion. No client schedule math. |
| Release resolution/order | `src/core/tick.ts` release/reception/run/payment/standing/career blocks | **REUSE / LEAVE ALONE after P06 membership gate** | Preserve RNG, ID ordering, same-week basis, first payment and save determinism. |
| Reception drivers | `src/core/reception.ts` — `resolveReception`, `ReceptionResult`, `buildFilmResult` | **LEAVE ALONE** | No P07 economy/quality tuning. Publish safe read-model facts, not formulas in Unity. |
| Run views | `src/core/economyView.ts`; `ui/src/engine/adapter.ts` — run selectors/`runProjection` | **REUSE / EXTEND projection** | Already distinguishes paid, remaining and full-run Studio Revenue. |
| Direct cost basis | ledger on `GameState`; `ui/src/engine/adapter.ts` — `filmCommittedCost`, `productionCommittedCost`, `releaseScorecard` | **REUSE** | One ledger reader avoids inconsistent profit copies. |
| Gazette | `src/core/newspaper.ts` — `buildNewspaper`, critic/audience helpers | **REUSE; EXTEND terminology** | Pure deterministic reveal and correct paid/projected disclosure. Fix delivered-alignment wording; do not change math. |
| Film Chronicle | `src/core/newspaper.ts` — `buildFilmChronicle`; `docs/FILM-CHRONICLE-V1-CONTRACT.md` | **REUSE / LEAVE ALONE** | Durable, stable, section-level fail-closed history where eligibility/frozen witnesses exist. |
| Full release explanation | `ui/src/engine/adapter.ts` — `explainRelease`, `accessibleAutopsy`, `deliveredAlignmentReport`, `autopsyCompare` | **REUSE session behavior; EXTEND durable summary** | Strongest current result hierarchy; full reconstruction requires retained pre-release state. |
| Critic/audience split | `FilmResult.criticScore`, `.segmentScores`; `src/core/newspaper.ts::aggregateAudienceScore` | **REUSE through one TS projection** | Unity must not reweight segments or invent a unified score. |
| Studio consequences | `src/core/standing.ts`; `src/core/broadcast.ts` | **REUSE / LEAVE ALONE** | Exact channel and notable-broadcast law; same-week standing is shared. |
| Person consequences | `src/core/starPower.ts`; `src/core/types.ts::TalentCareerEvent`; `ui/src/engine/careerImpact.ts` | **REUSE / LEAVE ALONE** | Frozen, append-only, exact-film career facts and reason codes. |
| Premiere/release event identity | `src/core/tick.ts` — permanent `events.append({kind:'premiere', filmId})`; studio event ledger | **REUSE / EXTEND read projection** | Exact once-only world acknowledgment witness. |
| First Film guidance | `src/core/firstFilmJourney.ts` — `released` beat | **EXTEND wording/route, not result authority** | Can point to Result/next work; cannot replace multi-film state. |
| Run-end transition detection | `ui/src/lot/snapshot/nextEvent.ts` — `run-completed` target/receipt | **REUSE as detection reference; EXTEND accepted-command bridge receipt** | Current receipt exists only in the live transition result and uses a hard-coded Theater target; it is neither persisted nor published through the Unity bridge. |
| Save/legacy behavior | `src/core/save.ts` validations/migrations; V3→V4 legacy run conversion | **REUSE / LEAVE ALONE** | Preserve current releases; missing optional history fails closed. |
| Economy interpretation | `docs/D-12-economy-contract.md`, `docs/D-16-ENGINE-ECONOMY-SOURCE-MATRIX.md`, D-17A contracts | **REUSE / LEAVE ALONE** | Paid/projected/direct-cost terminology is already hardened. |
| Economy tuning | `src/core/tuning.ts`, reception/economy formula constants | **LEAVE ALONE** | Package 07 interprets outcomes; it does not reopen economy intervention. |

## B2. Browser behavioral references

| Need | Existing path/component | Reuse / Extend / Replace / Leave Alone | Why |
|---|---|---|---|
| Opening reveal | `ui/src/screens/NewspaperReveal.tsx` | **REUSE behavior; ADAPT layout** | Exact title, Critic/Audience, callouts and paid/projected money already coexist. |
| Fallback result | `ui/src/screens/ReleaseResult.tsx` | **REUSE truth; ADAPT hierarchy** | Legacy/no-Gazette release still gets a result; never swallow it. |
| Accessible Autopsy | `ui/src/screens/Autopsy.tsx` | **REUSE hierarchy** | Four outcome metrics → Worked/Hurt → alignment → surprise/lessons → people → Advanced. |
| Durable history | `ui/src/screens/FilmRecord.tsx` (`FILM CHRONICLE`) | **REUSE / EXTEND run history** | Correctly states full Autopsy is session-only and uses frozen credits. |
| Run tracking | `ui/src/screens/Dashboard.tsx` — `TheatricalRunPanel`, Recent Releases | **REUSE read models; REPLACE dashboard-first route** | Truthful paid/next/remaining/projection, but world should be the home. |
| Route/origin chain | `ui/src/App.tsx` release/Gazette/Autopsy/Chronicle routing | **REUSE result ordering; EXTEND Package 02 origin** | Preserve exact film and same-week releases; add retained-lot navigation rather than full ejection. |
| Current Theater summary | `ui/src/lot/snapshot/StudioLotSnapshot.ts` — `ReleasedCard`; `ui/src/lot/buildingInspector.ts::theaterFacts` | **REPLACE/EXTEND** | Only critic-derived band + recency; cannot support current run, audience or money. |
| Current `reception` band | `StudioLotSnapshot.ts` — `ReceptionBand` | **LEAVE as coarse legacy badge; do not use as result authority** | It is critic-derived despite names `flop/hit/smash`; those words can misstate business performance. |
| Poster/one-sheet | `ui/src/components/FilmPoster.tsx` | **REUSE visual identity/dynamic identity pattern** | Code-native film identity, no network art dependency. Do not hard-code 1948 styling. |
| Career impact | `ui/src/components/CareerImpact.tsx`; `ui/src/engine/careerImpact.ts` | **REUSE** | Renders frozen events only, never recomputes a career delta. |

## B3. Bridge and Unity

| Need | Exact path/component | Reuse / Extend / Replace / Leave Alone | Why |
|---|---|---|---|
| Canonical bridge schema | `bridge/schema/bridge-schema.ts` — `StudioReleasedFilmSnapshot`, `StudioReleaseResultsProjectionSchema` | **EXTEND** | Current four fields cannot drive reviews, audience, run or money. Schema remains source of generated DTOs. |
| Generated JSON schema | `bridge/schema/project-studio-bridge.schema.json` | **REGENERATE, never hand edit** | Derived artifact. |
| Generated C# DTOs | live Unity `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | **REGENERATE, never hand edit** | Must match canonical TS schema exactly. |
| Snapshot cache | live Unity `Assets/Studio/Runtime/Infrastructure/StudioSnapshotStateCache.cs` | **REUSE / EXTEND exact-film rows** | Already keys released films by exact stable film ID and rejects duplicates. |
| Bridge presentation integration | live Unity `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs` | **EXTEND presentation only** | Existing snapshot consumer; no result math belongs here. |
| Existing lot life cue | live Unity `Assets/Studio/Runtime/Presentation/StudioLotLifePresentation.cs` | **REUSE as floor; EXTEND exact event** | Currently adds three decorative Theater goers when any release exists; too coarse for exact-film opening. |
| Existing Theater body | live Unity `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs` — `BuildTheater`, selectable `theater` | **REUSE only when present** | The inspected live worktree has a founding Theater body; it is a presentation anchor, not release/economic requirement. The Gate/city fallback is the target contract, not a claim about current baseline behavior. |
| Existing bridge proofs | live Unity `Assets/Studio/Tests/EditMode/StudioBridgeProtocolTests.cs`, `StudioBridgeProofRunnerTests.cs`, `StudioSnapshotStateCacheTests` area | **EXTEND** | Add exact result/run projection, duplicates, ordering, reconnect and missing-option tests. |
| World production beat system | live Unity `Assets/Studio/Runtime/Presentation/StudioStageProductionPresentation.cs` and `StudioWeekTheaterSnapshot` | **DO NOT REPURPOSE as film-result authority** | “Theater” here is a performed-week presentation construct for operations, not the public Theater/economy. |

The live Unity worktree used for archaeology is `/Users/bruce/Project Studio - Unity Production
Convergence 80H`, currently later than the Owner-supplied sealed `911e87e...` and carrying unrelated
changes. It is a capability reference only. Fable must inspect the sealed/current implementation
lane before editing and preserve unrelated work.

## B4. Required P07 bridge semantics

Do not prescribe field names before schema work, but the TypeScript-owned projection must publish
these **structured fact groups** per exact film:

1. **Identity:** film ID, frozen/resolved title, genre, authoritative release week.
2. **Attention:** use the permanent premiere witness identity `premiere.seq + filmId`, accompanied
   by authoritative `stateRevision`. Closing it records only transient presentation dismissal.
   Persisted read/acknowledgment is deferred. A TypeScript-derived presentation tier may be added if
   shipped.
3. **Reception:** critic score/stars, canonical audience aggregate/label, segment rows where exposed,
   forecast comparison and review callouts with driver/provenance keys.
4. **Money:** opening gross, locked scheduled full-run theatrical gross, Studio Revenue paid this
   week/to date/still scheduled/total, direct commitment, contribution, and paid/projected/final
   state. Run/payment fields are conditional: a legacy/no-run record publishes `runNotRecorded` or
   its equivalent, never a fabricated zero schedule.
5. **Run:** when present, status, total weeks, payments received, latest/next payment and chart
   points with paid versus future classification. Preserve `legacyCompleted` distinctly.
6. **History:** Chronicle/Gazette availability and section availability; never absence-filled prose.
7. **People:** frozen career-impact rows or an exact deep route to them.
8. **Navigation:** exact world anchor availability, not an inferred Theater.

Projection rows carry numbers and governed labels/driver codes. Unity formats layout, charts,
animation and focus. It does not parse callout prose to decide severity or actions.

## B5. Receipt, replay and protocol law

- A release cue is backed by the permanent `premiere` `StudioEvent`. Consumers deduplicate by
  `premiere.seq + filmId` within the authoritative bridge `stateRevision`; a cold snapshot presents
  current released state but never animates it as newly released.
- Run completion has no permanent event today. P07A may emit a **non-persisted live transition
  receipt** only in the accepted authoritative advance response that observes `active → completed`,
  keyed by exact film ID, authoritative completion week and bridge revision. Save/load or reconnect
  must not replay “just completed.”
- Do not derive freshness from `releasedFilms.length`, newest array position, title or current run
  status. P07A adds no saved unread/read state and no gameplay acknowledgment command.
- Extend the canonical TypeScript schema, generated JSON schema, generated C# DTOs, strict parser,
  proof fixture and snapshot cache atomically. Never hand-edit generated artifacts. Protocol tests
  cover valid new payloads, old payload behavior, missing optional groups, malformed data, duplicate
  IDs, out-of-order/stale revision and reconnect deduplication.

---

# C. Release Result Anatomy

## C1. Surface and size

- **Desktop/wide:** retained-world workspace occupies approximately 68–76% of safe viewport width
  and 76–88% height; 24–32 px outer gutter. Leave a recognizable lot strip visible.
- **Minimum comfortable content width:** about 820 logical px. Below it, switch to the bottom-sheet/
  full-height stacked layout; do not shrink text to preserve columns.
- **Typography:** title 30–40 px equivalent; editorial headline 28–36; major figures 24–32; body
  16–18; supporting labels 13–15. Respect product tokens and 200% text scaling.
- **Chrome:** exact Back origin, close, `Locate public release` when valid, and `Film Chronicle`.
  These are navigation, not result actions.
- **No material action:** opening, reading, comparing, closing and locating mutate no simulation.

## C2. Above-the-fold order

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ OPENING REPORT · Released during Week N                [Locate] [Chronicle] ×│
│ [poster/identity]  TITLE · Genre · Written/Directed/Starring where frozen     │
│                    Editorial headline + one-sentence deck                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ CRITICS          AUDIENCE RESPONSE     OPENING GROSS      STUDIO REV PAID     │
│ 3.5/5 · 68/100   Liked · 64/100        $…                 $… this week        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Forecast comparison: critics ±… · gross ±…                                  │
│ Direct commitment $… · Projected Film Contribution $… before fixed costs     │
├──────────────────────────────────────────────────────────────────────────────┤
│ [What worked] [What hurt] [Biggest surprise]               [Open Autopsy →]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

The poster/identity block is never larger than the result story. If no poster projection exists,
use the current code-native FilmPoster/one-sheet treatment; no network or generated art dependency.

## C3. Immediate result states

| State | Header/status | Primary content | Primary command |
|---|---|---|---|
| Normal opening | `OPENING REPORT` | four lanes + forecast + money | `Understand result` / scroll to driver summary |
| Strong | Same structure; one restrained strong accent | exact positive headline, contributors and projection | `Open Autopsy` |
| Weak | Same structure; no punitive red wash | exact weak headline, loss exposure and actionable evidence | `Open Autopsy` |
| Mixed/divergent | `CRITICS AND AUDIENCES SPLIT` only if TS classifier publishes it | both lanes equally prominent | `Compare response` |
| Legacy/missing Gazette | `RELEASE RESULT` | available critic/audience/gross/cost facts; unavailable sections named | `Open Chronicle` when available |
| Same-week group | `N PICTURES OPENED` rail | lead story plus equal secondary cards | select exact film |

## C4. Responsive version

At narrow width the surface becomes a 90–100% height bottom sheet/full retained workspace:

1. sticky title + Back/Close;
2. poster reduced to a 64–88 px identity thumbnail or omitted after header;
3. two-by-two metric tiles, then single-column at 200% text;
4. money block;
5. Worked/Hurt accordion cards **expanded by default for first release**;
6. Autopsy/Chronicle actions at end plus sticky navigation footer when needed.

Charts get a text summary before the visual. No horizontal metric table is required to understand
the result.

---

# D. Review Presentation Anatomy

## D1. Default review block

```text
CRITICS
3.5/5  ·  68/100
“A favorable result, though short of the studio's outlook.”   [editorial verdict]

FROM THE REVIEW DESK
• Critics landed 7 points below the Greenlight forecast.       [forecast witness]
• Delivered talent alignment was strong.                       [cohesion witness]
• <name> was the package's standout fit.                        [validated frozen fit]

AUDIENCE RESPONSE
Audiences liked it · 64/100       [View segment response]
```

- Maximum three default callouts.
- Each analytic callout retains a nonvisual provenance code for test/accessible explanation.
- Score, star glyphs and verdict are text; hue is supplementary.
- No pull quote is placed in quotation marks unless it is explicitly flavor and carries no causal
  fact. Prefer unquoted editorial sentences.
- `Review variance` belongs under Advanced Analysis, not the headline.

## D2. Driver ordering

1. forecast divergence;
2. strongest material creative execution fact;
3. strongest package/person fact;
4. audience/commercial context;
5. contribution projection only if no stronger diagnostic remains.

This order prevents the review from becoming three financial lines or blaming a named person for a
sampled outcome.

## D3. Missing data

- Missing frozen participants: omit person callouts; state `Detailed frozen credits were not
  recorded for this older film` in Chronicle, not in the emotional headline.
- Missing forecast: omit comparison and say `No Greenlight forecast was recorded` in Details.
- Missing segment/share projection: show per-segment scores if valid but withhold aggregate/label;
  never default to zero.
- Invalid correlation: fail that section closed. Do not resolve by current name, role or array order.

---

# E. Box Office / Run Anatomy

## E1. Active-run card

```text
TITLE                                      IN THEATERS · 2 OF 6 PAYMENTS RECEIVED

Latest theatrical gross    Studio Revenue received    Next scheduled Studio Revenue
$…                          $… to date                 $…

Opening gross              Locked full-run gross      Studio Revenue still scheduled
$…                          $…                          $…

Direct commitment          Projected Film Contribution (before studio fixed costs)
$…                          PROFIT/LOSS $… · ROI …%

[solid paid points ───────][dashed future schedule]
Paid week 1 $… · week 2 $…  |  projected weeks 3–6 $…
                                              [Open Result] [Open Chronicle]
```

The status phrase is `Payments received: k of N`, not `Week k` without context. Immediately after
opening, `weekIndex === 1`; the first payment is already banked.

## E2. Run states

| Run state | Required copy | Money tense |
|---|---|---|
| Newly opened | `Opening week paid` | opening and first Studio Revenue payment are paid; locked full-run gross is known, while unbanked Studio Revenue/contribution remain projected |
| Active | `k of N payments received` | cumulative paid; remaining scheduled; contribution projected |
| Completing this tick | no pre-claim | still active until authority changes status |
| Completed | `Theatrical run complete` | total Studio Revenue and Film Contribution final |
| Legacy completed/no run | `Historical release · detailed theatrical run not recorded` | legacy law already paid its one full-gross amount; do not invent an opening/current payment or weekly curve |

## E3. Charts

- X-axis: payment ordinal, not a fabricated calendar date.
- Y-axis toggle: `Theatrical gross` / `Studio Revenue`; default gross for public performance.
- Paid portion solid; future Studio Revenue schedule dashed and explicitly `scheduled`/`projected`.
  The locked full-run theatrical gross is not itself a probabilistic forecast.
- Text summary: opening, latest change versus prior paid week, received to date, remaining.
- A flat/down curve is not called “audience decline” because attendance/word-of-mouth are not modeled
  as player-facing causes.

---

# F. Film Autopsy Anatomy

## F1. Default hierarchy

The Autopsy is a retained deep workspace, not a modal confirmation. It keeps film identity and the
originating lot/film route.

```text
AUTOPSY · TITLE                                              [Chronicle] [Back]

THE RESULT
Critics | Audience | Total theatrical gross | Film Contribution at release
Outcome label from TypeScript presentation read model

WHAT WORKED (≤3)                 WHAT HURT (≤3)
driver · effect · evidence       driver · effect · evidence

DELIVERED TALENT ALIGNMENT
score/band · plain-language company account · strongest/opposed pair if session-authoritative

BIGGEST SURPRISE                 WHAT THE STUDIO LEARNED
forecast/result gap              1–3 actionable lessons

WHO MADE IT                      CAREER IMPACT
frozen company                   exact TalentCareerEvent rows

[Show Advanced Analysis +]
```

## F2. Money block

- Direct commitment.
- Theatrical gross.
- Studio Revenue over full run.
- Film Contribution, explicitly `projected at release` on a session Autopsy because that snapshot
  represents the opening moment even if reopened later.
- A current live dossier may additionally show `received to date` and `final` status from the run.
- Fixed-cost disclosure always available.

## F3. Advanced analysis

Collapsed by default; preserves current browser content:

1. Greenlight forecast versus actual;
2. craft components;
3. delivered vectors/alignment;
4. critic mean, sigma, sampled score and variance;
5. promise mismatch and segment response;
6. reach, opening and legs construction;
7. same-week standing context; and
8. exact frozen company/career facts.

Charts/tables are secondary. Body text never drops below the accessible minimum to fit them.

## F4. Actionable lesson rules

An action is retrospective advice, never an immediate mutation. It may route to:

- a role/genre comparison principle for future Casting;
- Development review doctrine;
- future budget/marketing evidence at Greenlight;
- production/craft/stage planning; or
- `Review current slate` when the exact next project can be linked.

It must not offer `Fix film`, `Rewrite released film`, `Spend more marketing`, `Collect`, or a
guaranteed prescription. A lesson states what evidence to consider, not “do X to win.”

## F5. Durable fallback

If the exact pre-release snapshot is unavailable:

- hide `Open full Autopsy`;
- show `Full technical autopsy unavailable after reload`;
- open the durable Film Result/Chronicle built only from persisted witnesses;
- retain Critics, Audience, opening/full gross, run/payment, direct contribution, frozen package,
  career events and Chronicle sections that validate; and
- never silently route an `Autopsy` button to a different screen.

---

# G. Theater Inspector Anatomy

The Theater inspector uses Package 02 building anatomy: identity → operation → capacity/progress →
occupants/context → blocker → actions. For Package 07 it is a public presentation inspector, not a
facility-capacity simulation.

| State | World treatment | Inspector facts (in order) | Actions | Deliberately absent |
|---|---|---|---|---|
| No releases | ordinary building/landmark | `Studio Theater` · `No current studio release` | Close/Focus; future history route if any | release action, fake audience |
| Opening | exact title on available marquee; restrained release cue | `PUBLIC OPENING` · title · Critics · Audience · opening gross · Studio Revenue paid | `Open Result`, `Locate public release`, `Open Chronicle` when eligible | auto camera, attendance number |
| Run active | `NOW SHOWING` label; stable light | title · `k/N payments received` · latest Studio Revenue · received to date · projected contribution | `Open run`, `Open Result` | collection, theater capacity |
| Run ended/recent | settled recent-title treatment | title · `Run complete` · total Studio Revenue · final direct contribution | `Open durable result`; `Open Chronicle` when eligible | permanent urgent badge |
| Multiple active | one non-authoritative featured marquee; `N active releases` | up to three exact rows: title/status/latest payment; overflow count | choose row, `Open theatrical slate` | merging films or newest-title substitution |
| No Theater/world anchor | no Theater state | public-release attention remains in HUD/Gate | `Open Result`; Locate disabled with reason | blocking release/result |

Selection never pauses or moves the camera. Double-select/Focus frames the building only. Opening a
film row retains Theater selection and pushes one film-route origin; Back returns to the same row.

---

# H. Film Chronicle Record Anatomy

## H0. Existing record versus P07A extension

`src/core/newspaper.ts::buildFilmChronicle` currently publishes a narrow, eligibility-gated record:
identity/creative provenance, frozen credits, chronology, package and reception. The browser
`FilmRecord` wrapper can add gross, direct committed cost, contribution and Career Impact through
other read models. It does **not** mean the Chronicle itself already owns a theatrical-run ledger,
final contribution or universal history for participant-less legacy films.

The following is the **target P07A durable result/history projection**. It composes existing
Chronicle sections where eligible with exact run/ledger/career projections; unavailable groups stay
explicitly absent. `Film Chronicle` remains the richer eligible view, not the only way a released
film can have durable history.

## H1. Target durable record contract

```text
FILM CHRONICLE · TITLE                         RELEASED DURING WEEK N
[poster] Genre · creative credit/provenance

RECEPTION             THEATRICAL HISTORY         DIRECT RESULT
Critic / Audience     opening / payments / end   commitment / Studio Revenue / contribution

WHO MADE IT           CREATIVE RECORD             PACKAGE AT GREENLIGHT
frozen credits        Shape/Promise/rewrite       OVR/Fit/expected ranges

CHRONOLOGY            CAREER IMPACT               FUTURE HISTORY
commission→greenlight exact events                awards/IP fields absent until authoritative
→release→run end

[Clipping] [Open current profile] [Back]
```

## H2. Record law

- Create no manual Archive command.
- Preserve exact film ID even if title text duplicates another film.
- Freeze credits from `FilmResult.participants`; never current employment/roster.
- Resolve creative record only through exact produced `ScriptProject.productionId` correlation.
- Use exact ledger witness for Greenlight chronology and cost.
- Treat the audience aggregate as a TypeScript projection from frozen segment scores and the
  currently invariant segment shares. P07A proves share invariance and save/reload equality; before
  any mutable market shares ship, TypeScript must freeze release-time shares or the aggregate.
- Retain `Not recorded` separately from `Unavailable/corrupt correlation`.
- A title rename/provenance policy must use the existing Chronicle/screenplay rules; the result UI
  must not choose current concept title in some surfaces and frozen career title in others without a
  declared label.
- `Locate` for a historical film means locate a meaningful current presentation anchor only; it
  never locates a retired stage or a same-title active production.

## H3. Future-proof fields

The durable layout reserves optional sections for Awards, library/IP and distribution history, but
P07A sends no placeholder data and displays no empty tabs. Extension uses the same stable film ID.

---

# I. State / Edge-Case Matrix

| State | Visible treatment | Allowed commands | Forbidden commands/claims | Time, camera and selection | Back / Escape |
|---|---|---|---|---|---|
| Release committed, unresolved | Production/Post says exact title `Committed · releases next studio week` | inspect, return, advance authoritative week | reviews, audience, box office, public crowd | no camera move; film remains selected through P06 origin | pop one layer to Post/lot |
| Release resolves | exact-film attention + venue-neutral cue; session result-available token backed by `premiere.seq + filmId` | Open Result, Read Gazette, Locate public release, dismiss presentation token | forced modal, auto Focus, duplicate event, client math, saved read mutation | advance has completed; time at normal setting; stored selection/camera unchanged | dismiss token locally and return to prior focus |
| Weak result | same layout, restrained negative text/icon; loss exposure named | Autopsy, Chronicle, return | punitive full-screen red, blame without driver | no automatic pause beyond the result stop; no camera | restore exact origin |
| Strong result | same layout, restrained positive punctuation | Autopsy, Chronicle, return | fireworks/`record`/`blockbuster` without classifier | same as weak result | restore exact origin |
| High critic uncertainty/variance | score remains primary; Advanced exposes mean/sigma/variance; optional TS-published note | open Advanced | client threshold, confidence percentage, fake review count | none | prior scroll/focus restored |
| Theatrical run active | exact film run card; `k/N payments received`; paid/future split | inspect, open result/Chronicle, time controls | Collect, change schedule, call full run banked | weeks advance only through TypeScript; no camera | previous route/lot context |
| Run ends | concise exact-film live transition receipt; contribution becomes final | Open durable result/eligible Chronicle, dismiss locally | replay premiere, manual archive, persisted unread claim | receipt exists only in the accepted live advance that observed completion; ordinary clock remains authoritative | dismiss returns to prior surface; cold load shows completed state without receipt |
| Multiple films open same week | grouped token/Gazette; canonical exact rows | choose any film; Back to group | standing attribution to one film, click-order results | one time advance; no queued camera travel | exact group scroll/selected row |
| Multiple active runs | slate count + isolated run cards | select/filter/open each | merged revenue/cost, fake Theater capacity | autonomous payments per run | same filters/scroll/focus |
| Stale client result command | stale banner; refresh exact current projection | Refresh, close, open current result/eligible Chronicle if ID persists | act from stale revision, duplicate presentation receipt, substitute film | no tick/camera; retain selection if valid | prior surface |
| Save/load during active run | same `weekIndex`, paid amounts, status and exact film; no opening animation replay | inspect, advance, open durable result/eligible Chronicle | replay Gazette as new event, repay week, rebuild curve, assert saved unread state | imported authority wins; transient attention resets safely | restored route when product supports, otherwise Lot with current state available |
| Reconnect | latest revision replaces presentation; deduplicate `premiere.seq + filmId`; no live completion replay | inspect current result/run | replay false crowd/premiere, client progression, infer freshness from list order | no Unity time; no camera jump | origin restored when still valid |
| Result arrives while another workspace is open | nonmodal session token naming film; no workspace replacement | Open now, leave unopened, dismiss locally | steal focus, close current work, move camera, persist acknowledgment | authoritative week already advanced; selected workspace remains | current Back stack unchanged until player opens result |
| Historical film | durable result/history card; final status; richer Chronicle when eligible | open available record/Clipping/profile | full technical Autopsy if snapshot absent, Locate old stage, manual archive | no time/camera | return to exact history row |
| Missing optional review/credits data | available facts render; affected section says not recorded/unavailable | open remaining record | default zero, current-person substitution, invented callout | none | normal |
| Theater absent | Gate/city/public token; Result fully available | Open Result; Locate valid fallback | block release, invent Theater | no camera until explicit Locate | exact lot origin |
| Lost world anchor | HUD/result route remains; Locate disabled with reason | Open Result/eligible Chronicle | Focus first Theater/Gate/film title | no camera/selection substitution | management origin remains |
| Narrow viewport / 200% text | full-height stacked sheet; sticky navigation; text summaries | all semantic commands | horizontal finance table as only path, clipped CTA | no camera under sheet; safe viewport recalculates | closes one layer and returns focus |
| Reduced motion | static marquee/selection, no crowd path flourish; short/static audio alternative | all commands | required flashing, automatic travel | Focus snaps/≤100 ms only when explicit | normal priority stack |
| Keyboard/controller navigation | semantic focus order: header → metrics → evidence → actions; exact target cycling | open, inspect, Back/Escape, Locate, scroll one owner | focus trap, pointer-only chart, ambiguous icon-only score, Back closing two layers | no camera unless explicit Focus/Locate | returns focus to the invoking exact-film control |
| Forced colors/high contrast | text/icon/state labels and visible focus ring survive without hue | all commands | color-only positive/negative or paid/projected distinction | no camera effect | normal priority stack |

### I1. Stale and identity law

There are no material Package 07 commands in P07A beyond navigation and transient presentation
dismissal. P07A persists no read/acknowledgment state. If such a feature is authorized later, it must
be exact-event and revision-bound. Rendering or closing a surface must never advance the run, change
cash, create a career event or affect another film's attention state.

### I2. Missing-title and duplicate-title law

If title lookup fails, display an honest stable identity fallback (`Film <short ID>` only if product
convention permits) and log the projection defect; never discard the result. Duplicate titles are
ordinary: every route and test keys by film ID.

---

# J. Golden UX Journeys

Each journey is suitable for automation plus one manual visual pass. All numbers are asserted
against TypeScript projections, never copied expectations in Unity tests.

## J1. Committed Release resolves

**Steps:** in an engaged-economy fixture, commit exact picture under P06 → advance one authoritative
week.

**PASS:** exactly one `FilmResult`, one opening run, one first Studio Revenue ledger entry, one
premiere/result attention for that film; title/ID match; no result existed before the advance.
Release resolution creates result/run first; tick step 3.5 credits the first Studio Revenue payment
once. Unity neither credits nor visually double-counts it.

## J2. World acknowledges public release

**Steps:** remain on lot through resolution without opening result.

**PASS:** exact title appears at optional Theater or Gate/city fallback; cue is readable at medium
scale; camera pose/selection remain unchanged; reduced-motion version is static and complete.

## J3. Open result

**Steps:** invoke `Open Result` from attention.

**PASS:** retained workspace opens the exact film; above fold shows Critics, Audience, opening gross,
opening Studio Revenue and projected direct contribution with correct labels; no mutation/tick.

## J4. Read review

**Steps:** inspect review block.

**PASS:** score/star agree, audience is separately labelled, no more than three callouts, every
analytic sentence maps to a published driver; delivered alignment is never called brief coherence.

## J5. Understand box-office state

**Steps:** open active-run card immediately after release.

**PASS:** it says one payment received, opening gross equals run week one, paid Studio Revenue equals
ledger, future totals are projected/scheduled, gross is never labelled cash.

## J6. Inspect why result happened

**Steps:** open Autopsy in the same session.

**PASS:** four lanes, Worked/Hurt, alignment, Surprise and Lessons appear before Advanced; exact
mechanical breakdown matches `explainRelease`; sampled variance is acknowledged, not hidden.

## J7. Inspect film money

**Steps:** compare Result, run card, Dashboard/portfolio and Chronicle.

**PASS:** one direct commitment and locked Studio Revenue basis produce the same projected/final Film
Contribution everywhere; fixed costs remain separately disclosed.

## J8. Return to lot

**Steps:** open result from world → inspect Autopsy → Back twice.

**PASS:** first Back returns to Result at exact scroll/focus; second returns to exact camera,
selection and world target; no Home teleport.

## J9. Theater tracks active run

**Steps:** select optional Theater during active run.

**PASS:** exact title, `k/N payments received`, latest/received Studio Revenue and route to the same
film appear; Theater claims no capacity/distribution authority. With no Theater, all core paths pass
through fallback.

## J10. Weekly earnings update autonomously

**Steps:** advance one ordinary week with an active run.

**PASS:** cash/ledger/run index update once; no Collect button or result modal; run card shows new paid
point and remaining schedule; no client animation advances truth.

## J11. Run completes

**Steps:** advance through the final scheduled payment.

**PASS:** `status` becomes completed, paid totals equal locked totals, contribution label becomes
final, a concise exact-film receipt appears once in that accepted live advance, no premiere replay/
manual Archive; save/reconnect sees completed state without replaying the receipt.

## J12. Film Chronicle preserves final result

**Steps:** open the target durable result/history record after run end, save/export/import, reopen;
open the richer Chronicle where eligible.

**PASS:** ID and available frozen credits/chronology/reception/run/direct-result/career groups match
their owning projections; unavailable legacy sections remain unavailable; no current-roster bleed;
the UI does not misstate target extensions as fields already owned by `buildFilmChronicle`.

## J13. Multiple-film isolation

**Steps:** commit two ready films in reverse/canonical order; advance once; track both runs.

**PASS:** release resolution remains ID-ordered; each exact result/cost/run/career row is isolated;
group UI exposes both; shared standing is labelled; opening/closing/dismissing one presentation
token cannot affect the other; Back restores exact selected film.

## J14. Save/reconnect during theatrical run

**Steps:** save after payment 2, restart/reconnect, load.

**PASS:** no payment repeats, no opening cue replays as new, `weekIndex` and cash match, full technical
Autopsy is honestly unavailable if the pre-tick snapshot is gone; the durable result remains and
eligible Chronicle sections remain available.

## J15. Result does not move camera or steal work

**Steps:** open another retained workspace, advance to a release result, leave the session token
unopened.

**PASS:** workspace/focus/camera remain; result token names exact film; opening it is explicit; Back
returns to the original workspace state; reduced-motion setting is respected.

## J16. Missing optional data

**Steps:** load a legacy/participant-less released film.

**PASS:** Release Result fallback shows only available critic/gross facts and any real run group;
`not recorded` is distinct from `unavailable/corrupt`; no Gazette/credits/person or zero-valued run
claims are invented; invalid optional data does not crash or hide the film.

## J17. Legacy non-engaged release stays legacy

**Steps:** resolve/load a non-engaged or migrated `legacyCompleted` film.

**PASS:** legacy law pays or has paid its full-gross amount once, creates no fabricated multiweek
run/opening payment, and renders `Detailed theatrical run not recorded`; reconnect never converts it
to an active run or pays it again.

## J18. Keyboard, controller and 200% text

**Steps:** at narrow width and 200% text, use keyboard/controller only to open a result, traverse
metrics/evidence/chart summary, open and close Autopsy, then Back; repeat in forced-colors and reduced-
motion modes.

**PASS:** no focus trap; exact invoking control regains focus; screen-reader labels name title,
Critics, Audience, gross, paid/projected Studio Revenue and run status; chart text equivalent precedes
the visual; sticky footer follows logical focus order; one scroll owner; no clipped CTA or finance-
only horizontal scroll; state never relies on hue or motion.

## J19. Stale revision and bridge protocol fail closed

**Steps:** exercise generated DTO/schema proof with valid new payload, old payload, missing optional
groups, malformed values, duplicate film IDs, out-of-order/stale `stateRevision` and reconnect.

**PASS:** schema/JSON/C# DTO/parser/cache change atomically; generated files match canonical schema;
stale/malformed updates do not replace current truth; missing optional groups get exact unavailable
states; `premiere.seq + filmId` deduplicates after reconnect; no result is correlated by title/order.

## J20. Duplicate titles and lost public anchor

**Steps:** release two films with the same title; remove/omit Theater and invalidate a former world
anchor; open each result and use Locate/Back.

**PASS:** exact film IDs keep result/run/cost/career rows isolated; Gate/city fallback remains usable;
lost Locate is disabled with a reason rather than substituting another object; Back restores the
correct row, focus and camera.

---

# K. Fable Implementation Map

## REUSE

- `FilmResult`, `TheatricalRun`, release order/payment and all reception/economy math.
- Ledger-based `filmCommittedCost`, `releaseScorecard`, `runProjection` and current financial labels.
- Pure `buildNewspaper` and eligibility-gated `buildFilmChronicle` projections.
- Browser `NewspaperReveal`, `Autopsy`, `FilmRecord`, `CareerImpact` and active-run information
  hierarchy as behavioral references.
- Permanent `premiere` studio event; use `run-completed` Next Event only as a live transition-
  detection reference.
- Package 02 retained-world Select/Focus/Locate/Back and camera contract.
- Bridge revision/session/duplicate-ID validation and Unity snapshot cache.

## BUILD NEXT — P07A First Release Payoff V1

1. **Result projection:** extend `StudioReleaseResultsProjectionSchema` with the structured,
   player-safe exact-film result/run/history facts in B4; regenerate schema/C# DTOs.
2. **Result attention:** project the exact permanent `premiere` witness using
   `premiere.seq + filmId + stateRevision`; deliver run completion only as the non-persisted accepted-
   advance receipt defined in B5. Persist no read/ack state.
3. **World acknowledgment:** title-bearing Gate/city fallback plus optional Theater enhancement;
   static reduced-motion form; no automatic camera.
4. **Retained Result workspace:** implement C/D/E above using current Project: Studio identity and
   dossier typography, not the white memo.
5. **Deep routes:** session Autopsy when available; durable Chronicle/result otherwise; exact Back,
   Locate and focus origin.
6. **Run tracking:** paid/projected chart/text and final completion state; autonomous time only.
7. **Proof:** J1–J20, including engaged and legacy release law, two same-title releases, protocol/
   revision failure, accessibility, no-Theater/lost-anchor fallback and reconnect.

P07A starts only after the Package 06 commitment boundary exists. It stops at completed
`TheatricalRun` (or honest legacy/no-run state), durable result/history projection, eligible Film
Chronicle and the Package 08 handoff.

## EXTEND

- `src/core/newspaper.ts` wording/provenance tokens so callouts cannot misname cohesion.
- `ui/src/engine/adapter.ts`/core read models to publish one canonical durable result summary from
  persisted facts.
- `ui/src/lot/snapshot/StudioLotSnapshot.ts` and `buildingInspector.ts` only as browser references/
  routes; critic-derived `flop/hit` bands must not masquerade as business classification.
- `bridge/schema/bridge-schema.ts`, bridge proof data, Unity generated DTO pipeline and snapshot
  cache together.
- Unity Theater/Gate presentation and retained-workspace navigation; no result calculations.
- Durable result/history wrapper with run history/final direct contribution; keep the existing
  eligibility-gated Chronicle's ownership explicit rather than silently broadening it in UI.

## DO NOT REBUILD

- reception, critic sampling, audience segment scores, opening/legs or theatrical schedule;
- Studio Revenue share/payment, ledger, contribution/ROI basis or fixed-cost accounting;
- standing, broadcast, career development/Star Power or frozen career-event reasoning;
- Gazette/Chronicle eligibility and exact frozen-participant correlation;
- deterministic release ordering, RNG or save migration;
- Package 06 commitment or Package 02 navigation/camera rules;
- a second title/film identity system in Unity;
- browser and Unity copies of the same score threshold/formula.

## DEFER

- persisted full technical Autopsy snapshot;
- named reviewers/outlets, review counts, critic/audience evidence volume;
- release competition/calendar, territories, theaters/screens and distribution;
- richer premiere spectacle, film footage/trailers and creator mode;
- audience attendance/crowd simulation;
- optional buildable Screening Theater/Premiere House;
- fixed-overhead allocation inside film reports;
- IP/library economics, sequels and era-specific release channels;
- all Awards/ceremony/prestige work in Package 08.

## OWNER DECISIONS REQUIRED

**None before P07A.** The mission-supplied commitment boundary, world grammar, Theater ruling and
current authoritative read models determine the bounded implementation. P07A remains sequenced
after P06A because the commitment gate is not implemented in this baseline.

Later Owner decisions—not blockers—are:

1. whether the full technical Autopsy should become a persisted authoritative history object;
2. whether critics/audiences gain named outlets, counts or evidence confidence; and
3. whether an optional Theater becomes buildable prestige/test-screening infrastructure.

---

# Acceptance summary

P07A is accepted only if an ordinary player can answer, from the first result and one deeper route:

> **What did we make? What did critics think? What did audiences think? What opened? What cash did
> the studio actually receive? What is still scheduled? Why did the outcome differ from expectation?
> What should I consider next?**

Every answer must trace to TypeScript authority. The lot remains visible, the camera remains under
player control, weekly earnings require no clerical action, and the film remains an exact durable
identity after save/reconnect and run completion.
