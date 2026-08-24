# CODEX DESIGN PACKAGE 07 — RECEPTION, REVIEWS, BOX OFFICE & FILM RESULTS

- **Status:** Decision-ready research; documentation only
- **Branch:** `codex/reception-boxoffice-research-07`
- **Canonical baseline:** `c902a704eb948cc576083d0973c8c23e59937dc1` (`hspector-github/main`)
- **Research cut-off:** 2026-08-24
- **Upstream design boundary supplied by this mission:** Package 06 at `8ccd8acc253901aadaa2175656c1e0f7d1a2df23`
- **Implementation authority:** TypeScript remains sole simulation authority

This package begins after Package 06's mission-supplied `Commit <title> to Release` boundary has
been implemented and ends when the authoritative theatrical run has completed and the picture has
a durable result/history projection; the richer Film Chronicle exists where frozen-participant and
correlation eligibility requirements are satisfied.
Awards, ceremonies, long-term prestige design, franchises and distribution-era systems are outside
scope.

## Evidence notation

- **[PRIMARY]** directly verified in an official manual.
- **[GUIDE]** developer-reviewed Prima guide evidence; strong, but not an executable formula dump.
- **[SECONDARY]** contemporary review/guide evidence.
- **[CODE]** verified in the baseline repository.
- **[INFERENCE]** a design interpretation of evidence, not a historical fact.
- **[RULING]** the Project: Studio implementation contract after Owner acceptance.

Current code and the mission-authoritative future boundary are deliberately separated. In the baseline, a
`releaseReady` production still auto-releases on the next tick. Package 06 has already ruled that
this must become a persisted, no-time-advance commitment gate, but no such production code exists
at this baseline. Package 07 is sequenced after that handoff and documents the seam precisely.

---

# 1. Executive decision

Project: Studio should treat release as a **three-act payoff**, not one modal and not one number:

> **Public opening → understood result → living theatrical run and durable history.**

The next authoritative week after Release commitment should create the film's immutable result,
pay the first run week, record critic/audience/career/studio consequences, and emit one exact-film
attention event. The lot acknowledges that the picture has reached the public. The player chooses
when to open the result; the camera never moves by itself. A retained Film Result surface then
answers, above the fold:

1. what opened;
2. what critics thought;
3. how audiences responded;
4. what the opening earned at the box office;
5. how much Studio Revenue was actually paid;
6. whether the full run is projected to repay direct film costs; and
7. which trustworthy factors helped or hurt.

The theatrical run thereafter pays autonomously. Local world and portfolio surfaces show payments
received, the next scheduled Studio Revenue, cumulative totals and run status. Run completion gets
a concise result cue, not a second premiere. The durable result/history projection automatically
preserves the film. Where Chronicle eligibility and frozen witnesses exist, the Film Chronicle also
preserves its company, creative record and reception; P07A extends the durable record with run and
direct-result facts rather than pretending the current Chronicle already contains them.

The central design correction is this:

> **There is no truthful universal “movie quality” score in the current simulation.**

`FilmResult` publishes craft, delivered talent alignment, a sampled critic result, segment-level
audience response and commercial performance as different facts. The player should see four
coequal result lanes—**Creative execution, Critics, Audiences, Business**—with forecast and causal
provenance. Unity must not blend them into a magic rating.

## Ten governing rules

1. **One film, one stable dossier.** Result reveal, active run, clipping, autopsy and Chronicle are
   lenses over the same `productionId`; no duplicate “movie card” authority.
2. **Critics, audiences and commerce remain separate.** Divergence is a story, not an error to
   average away.
3. **Opening gross is not Studio Revenue; projected full-run contribution is not banked profit.**
4. **Every analytical sentence must cite a published driver.** Flavor may set tone but must not
   claim causation.
5. **The release moment is visible but never camera-hijacking.** `Open Result` and `Locate public
   release` are explicit commands.
6. **The Theater is optional presentation, never economic or release authority.** The Gate/city
   premiere fallback works even when no Theater exists.
7. **Routine earnings are autonomous.** The player manages slate decisions, not weekly collection.
8. **Full mathematical autopsy is session-bound today.** After reload, use the persisted-result
   summary and eligible Chronicle sections; never reconstruct missing release inputs or relabel
   another screen “Autopsy.”
9. **Significance changes presentation only.** No Unity-side hit/flop classifier may change play.
10. **Awards begin in Package 08.** Package 07 preserves eligible facts and stops.

## Recommended checkpoint

**REQUIRED NEXT — P07A: First Release Payoff V1**

Prove one complete, hostile-reviewable journey:

> committed Release → next authoritative week resolves → venue-independent public-release cue →
> retained Film Result/Gazette → critics, audience, opening and direct-cost truth → return to exact
> lot context → weekly Studio Revenue progresses autonomously → run completes → durable result/
> history remains available, with Film Chronicle where eligible.

P07A extends presentation/read-model projections only as needed. It does not retune reception or
economy, add reviews by invented people, require a Theater, build a premiere animation campaign, or
implement Awards.

---

# 2. Original *The Movies* reconstruction

## 2.1 Ordinary campaign flow

| Interaction | What the player physically did and saw | Evidence / confidence | Design purpose | Project: Studio ruling |
|---|---|---|---|---|
| Finished picture | The completed movie existed as a film-can/movie card. The card changed through documented states: script before filming, camera while filming, film-can when ready for release, and `$` while earning. | Official manual, printed pp. 6–7 and 12–13. **[PRIMARY, very high]** | Kept the film as a physical artifact and made lifecycle legible. | **ADOPT the named, traceable artifact; ADAPT the card into world + dossier state.** |
| Preview before commitment | The player could place the finished film in the Production Office Movie Player before Release. Preview did not itself release the film. | Official manual printed p. 12; Production Office description printed p. 16. **[PRIMARY, very high]** | Preserved the fantasy that the output was a movie, not only a stat object. | **ADAPT/LATER.** Optional non-authoring preview; never a result reveal. |
| Test screening | The player could put an unreleased finished film into the Reviews room to sample expected audience reaction before choosing marketing. | Official manual printed pp. 38–39. **[PRIMARY, high]** | Created a pre-release audience forecast/read for the marketing decision. | **ADAPT later** as a forecast/test-screening system only if authority supports uncertainty; not P07A. |
| Release | The player dragged the film into the Production Office's Release room. With the Publicity Office, this became Release Budget and offered five spend levels. | Manual printed pp. 12–13; Prima PDF pp. 44–46 / printed pp. 43–45. **[PRIMARY/GUIDE, very high]** | Made public commitment tactile and separate from inspection. | **ADOPT explicit commitment; Package 06 owns it. REJECT drag-only control.** |
| Immediate verdict | Release calculated the picture's final result, showed release/review screens, affected the movie chart, studio, participating Stars and experience, and began earnings. | Prima PDF p. 45 / printed p. 44. **[GUIDE, high]** | Paid off the filmmaking chain with a consequential reveal. | **ADOPT event separation; ADAPT into multi-axis result with durable facts.** |
| Written critics | A review screen followed release. Critics commented on aspects from script through set maintenance; hovering exposed category-level explanatory blurbs. | Manual printed pp. 12–13 and 38–39. **[PRIMARY, high]** | Gave personality to evaluation and hinted at cause. | **ADAPT.** Short driver-backed editorial copy; never invented causal prose. |
| Public opinion | Reviews also exposed public opinion for a Star or the studio when the player brought the relevant object/icon to the Reviews room. | Manual printed p. 12, with pp. 38–39 for review/test-screen context. **[PRIMARY, high]** | Distinguished public standing from the critic screen. | **ADAPT into explicit audience/studio lanes; no object dragging required.** |
| Active earnings | The released card pulsed `$` while the film earned through a fixed but undocumented active period, then stopped. | Manual printed pp. 6–7; Prima printed pp. 43–45. **[PRIMARY/GUIDE, high]** | Made commercial life persistent after the verdict. | **ADOPT active-run visibility. Do not claim an original weekly curve or duration.** |
| Marketing/publicity | Publicity built awareness; release marketing had to be matched to a film. Too little or too much could reduce Success/earnings. | Prima PDF pp. 44–46 / printed pp. 43–45. **[GUIDE, high]** | Prevented maximum spend from being a universal answer. | **Historical lesson only.** Project: Studio marketing is already committed at Greenlight; no P07 slider. |
| Genre demand | Current genre interest and future trend news affected release-time Success; saturation from studios depressed interest. | Prima PDF pp. 59–60 / printed pp. 58–59. **[GUIDE, high]** | Made timing and slate diversity commercially relevant. | **ADAPT only when current authority publishes the context; do not fabricate competition.** |
| Novelty | Reused Stars/sets lost novelty; novelty affected Success/earnings rather than base creative quality. | Prima PDF pp. 59–60 / printed pp. 58–59. **[GUIDE, high]** | Discouraged repetitive optimized production. | **ADAPT as an explained commercial context where current `setNovelty` contributed.** |
| Finance/history | Finance showed studio trends and recent earnings. The Production Office retained Reviews, Movie Player and Archive routes. | Prima PDF p. 47 / printed p. 46. **[GUIDE, high]** | Linked one release to the studio's longer business history. | **ADOPT portfolio/history; REJECT manual Archive.** |
| Archive | Once a film stopped earning, the player manually dragged it to Archive; the action was irreversible. | Manual printed pp. 6–7; Prima printed pp. 43–45. **[PRIMARY/GUIDE, very high]** | Cleared screen/Production Office clutter after earning ended. | **REJECT the chore.** `FilmResult` becomes history automatically. |

No reliable evidence establishes a mechanically different tutorial result system. Tutorial guidance
directed the same physical chain. Therefore this contract does not treat tutorial choreography as
normal-campaign law. The sources establish an immediate review verdict and the start of earning at
Release, but not a reliable frame-order claim about whether the first earnings mutation preceded the
review surface.

## 2.2 What the original ratings meant

The original did **not** have one clean result number, although its presentation often made the
relationships opaque.

| Signal | Historical meaning | What it was not |
|---|---|---|
| Star Rating | A person-level 0–5 status influenced by image, talent, pay/trailer/entourage and film career. | A film-level Movie Quality/Final Movie Rating or a direct box-office total. |
| Movie Quality | Prima's production-side result: Script Quality plus Production Quality. | Entire commercial success. |
| Success | Release-side effect of Star Power, novelty, genre interest, technology and PR/marketing; governed earnings. | Pure creative quality. |
| Final Movie Rating | Combined Movie Quality and Success, with Movie Quality weighted more heavily. | Pure critics or pure revenue. |
| Critic screen | Immediate post-release judgment and aspect commentary. | A fully transparent formula audit. |
| Studio Rating | Capital, films, Stars, lot prestige and later Awards; affected studio opportunity. | One film's rating. |

Prima's “Movie Quality and Success” sequence is the best available developer-reviewed account:
PDF pp. 53, 58–61 / printed pp. 52, 57–60. It should be treated as strong interpretation, not a
license to reproduce hidden 2005 formulas.

## 2.3 What remains excellent

- Release is a physical, explicit act.
- The film remains a named object while earning.
- The result is immediate enough to feel consequential, then continues commercially.
- Critics have voice, not only a number.
- Creative quality, public success and studio reputation are distinct ideas.
- Films can be watched, making the statistical outcome emotionally grounded.

## 2.4 What aged poorly — successor assessment

- Critical and commercial drivers were not explained clearly enough.
- **[INFERENCE]** Tiny cards, object dragging and hover-only text no longer meet the successor's
  readability/accessibility bar.
- Manual archiving added repetition without strategy.
- Marketing and publicity causality was guide-dependent and easy to misread.
- **[INFERENCE]** A modern result needs forecast, variance and accounting provenance that the
  original did not expose together.
- **[INFERENCE]** A long campaign needs presentation scale to vary by significance rather than
  treating every result with identical emphasis.

## 2.5 Creator/exported movies are separate

Advanced Movie Maker and later post tools let players author/reorder footage, sound, titles,
effects and exportable films. That creative mode is historically memorable but it does not define
the ordinary tycoon result pipeline. Package 07 may display a preview asset later; it must not make
manual editing or community reception a prerequisite for simulation reception.

---

# 3. Stunts & Effects / Superstar findings

## 3.1 Stunts & Effects

The official expansion manual confirms new stunt performers, Stunt Skill, Condition, training
facilities, Hospital recovery, doubles, stunt difficulty/likeness, and camera/effects additions. It
also directly states that a failed stunt can hurt reviews and box office and that the finished
movie's stunt/overall rating considers difficulty, success/failure, Condition, Stunt Skill and, to
a lesser degree, likeness. Official *Stunts & Effects* manual PDF pp. 5–6 / printed pp. 8–10.
**[PRIMARY, high]** The manual does not establish a complete numerical reception formula.

| Later-layer lesson | Evidence status | Ruling |
|---|---|---|
| Stunt execution can become a named result contributor. | Official expansion manual PDF pp. 5–6 / printed pp. 8–10. **[PRIMARY, high]** | **LATER.** Only after authoritative stunt/safety outcomes exist. |
| Risk versus spectacle can create a legible result tradeoff. | **[INFERENCE]** from the official failure/review/box-office relationship, supported by [Altered Gamer](https://www.alteredgamer.com/other-games/13334-review-the-movies-stunts-and-effects-expansion-pack/) and [WorthPlaying](https://worthplaying.com/article/2006/7/17/reviews/34654-pc-review-the-movies-stunts-effects/) criticism of upkeep/failure. | **ADAPT later** as one legible package/production risk; reject an injury-maintenance treadmill in P07. |
| FreeCam, camera motion and effects broaden creator spectacle. | Official expansion manual printed pp. 10–11. **[PRIMARY, high]** | **LATER creator/cinematic system.** It does not change result authority. |

Awards that refer to released work are still Package 08. **Super Star** is a base-game, 1965 Best
Acting Performance ceremony bonus, distinct from the Mac **Superstar Edition** bundle and from the
**Stunts & Effects** expansion. Prima says it raises Final Movie Rating for films featuring the
winning actor; award bonuses last until the next five-year ceremony (manual printed pp. 22–23;
Prima PDF p. 79 / printed p. 78).

## 3.2 Superstar Edition: one later Mac bundle review

The required Mac Superstar Edition review is a secondary review of the later Mac bundle of the base
game plus *Stunts & Special Effects*, not a distinct mechanical edition layer:
[macinplay.de — “The Movies: Superstar Edition”](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), especially **“Alles dreht sich um den Film”** and **“Mikromanagement, das auch mal nervt.”**

The review says the ordinary canned-film chain still moved from Script Office to Casting, rehearsal,
set travel and Release. It separately describes a large cost/duration evaluation at Release and
box-office takings arriving during the run. It praised watching the group make the film and the
physical studio interaction, but explicitly criticized manual archiving, constant Star caretaking,
staff scarcity and hard-to-understand rating/award categories.
It also reported disappointment when elaborate user-created films did not receive intuitively better
ratings. **[SECONDARY, high confidence as reviewer experience; not primary mechanical authority]**

The following are **[INFERENCE from one secondary reviewer]**:

1. **preserved** the physical film journey and watchability;
2. **preserved** a strong release/evaluation payoff;
3. **exposed** opaque cause and effect as the design aged;
4. **exposed** repetitive clerical actions such as Archive as unnecessary; and
5. **warned** that creative effort without explainable evaluation feels unfair.

Project: Studio should keep the visible payoff and eliminate the unexplained/repetitive layer.

---

# 4. Modern comparator findings

The full look-here atlas is in the Builder Annex. These are the best comparator conclusions per
subproblem—not a genre survey.

| Problem | Strongest comparator | Exact useful behavior | Project: Studio translation |
|---|---|---|---|
| Separate commitment and result | *The Movies* | Preview/test/Release/review are distinct beats. | Package 06 commits; Package 07 alone reveals actual response. |
| Persistent film dossier | *RollerCoaster Tycoon* ride window | View/Locate, measurements, graphs, income/cost and customer thoughts remain attached to one ride. | Result, run, people, money, clipping and Chronicle use one film ID. |
| Portfolio → exact object | *RollerCoaster Tycoon* Rides Info | Sorted overview rows open the corresponding ride dossier. | Film slate/history rows open the same exact film record; eligible Chronicle is one lens, not a parallel identity. |
| Critic/audience separation | Rotten Tomatoes / IMDb definitions | Professional and audience signals retain provenance instead of becoming one score. | Display Critic and Audience lanes; do not invent counts or copy branded thresholds. |
| Opening versus run | Box Office Mojo title dossier | Opening, daily/weekly/cumulative and territory lenses tell different commercial stories. | Show opening, weekly schedule, cumulative gross and Studio Revenue; reject unmodeled theaters/territories. |
| Aggregate → drivers | Google Play review analytics | Overview, time series, distribution and topic drilldown give a diagnostic path. | Headline verdict first; named driver evidence and segment detail below. |
| Revenue context | Google Play / App Store analytics | Time window and breakdown travel with the money number. | Every figure names gross/revenue/contribution, paid/projected and time basis. |
| Post-release learning | *Game Dev Tycoon* official feature description | Review and post-release report/expertise are separate feedback systems. | Film Autopsy is read-only learning after result, never retroactive outcome editing. |
| Analytical hierarchy | *Football Manager* Data Hub / Match Analytics | Overview → pros/cons → selected metrics; reports emphasize notable evidence. | Default Autopsy shows What Worked/Hurt and Surprise; advanced math is collapsed. |
| Automatic state history | App Store status history | Status, timestamp and originator remain inspectable without a manual archive action. | Preserve release/run history automatically by stable film ID; append-only authority is a Project: Studio contract, not an Apple claim. |

The comparator result is not “copy a dashboard.” It is a common law:

> **Lead with the emotional verdict, preserve metric provenance, and make the route to evidence one
> step deeper without detaching it from the named object.**

---

# 5. Adopt / Adapt / Reject matrix

| Pattern | Ruling | Contract |
|---|---|---|
| Physical release artifact | **ADOPT** | The same film identity moves from package → production → Post → public result → Chronicle. |
| Drag film to Release | **ADAPT** | Explicit title-bearing command from Package 06; pointer, keyboard and controller accessible. |
| Immediate post-release verdict | **ADOPT** | One result attention event after the authoritative tick; no camera motion or hidden mutation. |
| One final star rating | **REJECT** | Keep Creative, Critics, Audience and Business distinct. |
| Written critic voice | **ADAPT** | At most three structured, driver-backed callouts; flavor cannot claim cause. |
| Separate public response | **ADOPT** | Weighted segment response becomes a clearly labelled Audience lane. |
| Pre-release test score as truth | **REJECT** | Package 06 exposes only forecast; actual result begins here. |
| Multi-week active run | **ADOPT** | Autonomous weekly payments with explicit paid/projected/final labels. |
| Manual revenue collection | **REJECT** | Cash arrives only through authoritative tick/ledger. |
| Manual Archive | **REJECT** | Append-only result/history is automatic; the richer Chronicle remains eligibility-gated. |
| Release-time marketing slider | **REJECT for current product** | Marketing already commits at Greenlight; Package 07 only explains its published commercial effect. |
| Theater as distribution authority | **REJECT** | Optional public presentation/Locate anchor only. |
| Newspaper for every weekly payment | **REJECT** | Gazette belongs to opening/notable moments and archive; routine payments use run tracking. |
| Full-screen fireworks for every film | **REJECT** | Significance scales punctuation; all films remain fully inspectable. |
| Session-only technical Autopsy | **ADAPT** | Preserve it when the exact pre-release snapshot exists; otherwise route to durable result/Chronicle. |
| Client-generated causal prose | **REJECT** | TypeScript publishes structured facts and governed explanation labels. |
| Client-derived gameplay hit/flop class | **REJECT** | Presentation-only tier may use a TypeScript read-model classifier; never affects simulation. |
| Automatic awards reveal | **REJECT here** | Package 08 owns eligibility presentation, ceremonies and awards. |

---

# 6. Release-result timeline

## 6.1 Current TypeScript truth

In baseline `src/core/tick.ts`, one authoritative advance performs this ordered result pipeline:

1. advance script/casting/production/operations;
2. collect productions whose `remainingTicks === 0`;
3. sort releases by plain-string `productionId` ascending;
4. resolve reception with the single simulation RNG draw per release;
5. append `FilmResult` and the permanent `premiere` event;
6. open an authoritative `TheatricalRun` for an engaged economy (or pay legacy full gross);
7. pay week one of every active run, including newly opened runs;
8. update studio standing in the same release order;
9. derive broadcast candidates and talent development/career events; and
10. increment `market.tick` at the end.

The baseline still reaches this path automatically from `releaseReady`. The Package 06 boundary
supplied by this mission inserts a persisted commitment gate before step 1 without changing steps
2–10; P07A must not begin until P06A has implemented it.

## 6.2 Player-facing timeline after Package 06

| Stage | Truth available | Attention/time | Local/world presentation | Retained surface |
|---|---|---|---|---|
| Committed, before next week | Exact title and commitment only; no actual response. | No extra pause; commitment advanced no time. | Production/Post says `Committed · releases next studio week`. | Package 06 Release Review receipt. |
| Release resolves | `FilmResult`, opening/locked full-run gross, critic result, segment response and consequences exist. Engaged play opens a run and pays its first Studio Revenue entry; non-engaged legacy law pays full gross once. | **Decision stop / attention-worthy.** The advance ends normally; result opening is player-chosen. | Exact-film public-release cue; venue-neutral fallback; no camera movement. | Gazette/Film Result. |
| Opening result read | All persisted result facts plus exact session autopsy when pre-tick state is retained. | Reading does not advance time or cause another pause. | Marquee/receipt remains stable. | Result summary → Autopsy/Chronicle. |
| Run active | Locked schedule, payments received, cumulative gross/Studio Revenue and remaining scheduled revenue. | Routine week payments never pause. | Optional Theater/public-release status; management-zoom run marker only when useful. | Active theatrical-run card in the film dossier/portfolio. |
| Run ends | `status === completed`; all scheduled Studio Revenue is banked. | Current `nextEvent.ts` can detect the transition only in an ephemeral advance result. P07A adds a live transition receipt; no saved unread state. | Public-release cue settles; recent film remains inspectable. | Final direct contribution and Chronicle/result record. |
| Historical | Frozen `FilmResult`, run, eligible Chronicle sections and career events. | No attention. | No permanent world clutter; optional recent marquee. | Film Chronicle/history. |

## 6.3 Time and week labels

`FilmResult.releaseTick` and release ledger rows are stamped with the **pre-increment** simulation
week. The player reads the result after `market.tick` has incremented. A bare Gazette `Week N`
beside a top bar `Week N+1` is therefore ambiguous.

**RULING:** P07A does not rewrite the save field. It declares two meanings in the read model:

- `Released during Week N` = authoritative `releaseTick`;
- `Report available now · Week N+1` = current `market.tick` after the advance.

The Gazette masthead should say `Opening Report · Released during Week N`, never imply it is the
current top-bar week. Chronicle chronology continues to store the engine's release week. Any later
engine-wide week convention migration is outside P07A.

## 6.4 Multi-release ordering

Same-week releases resolve in ascending ID order from one start-of-tick basis. Click/commit order
must never alter results. Each film gets its own result, run, career events and dossier. Studio
standing movement is shared across the release week and must be labelled as such; no result screen
may attribute the entire delta to one film.

---

# 7. Release-world acknowledgment

## 7.1 Minimum P07A contract

Every authoritative release receives one restrained, exact-identity acknowledgment:

- a public-release attention token carrying the exact film ID and title;
- the title on a presentation surface when available (marquee, Gate placard or public-release
  receipt);
- one state-dependent exterior cue such as a lit marquee/lamp and a modest arrivals/crowd beat;
- an explicit `Open Result` command;
- an explicit `Locate public release` command when a current world anchor exists; and
- a static equivalent under reduced motion.

The authoritative `premiere` studio event in `src/core/tick.ts` is the event witness. Presentation
may animate that truth once; it must not infer a release from a new poster, actor position or the
length of `releasedFilms` alone.

## 7.2 Venue law

Owner ruling `docs/c2-planning/00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md` is binding:

> The Theater is not core release authority. Premiere Night must work without Theater ownership;
> an external/city venue or Gate anchor is acceptable.

Therefore:

| World condition | Public-release owner |
|---|---|
| Optional Theater exists and has a valid world anchor | Theater may carry title/marquee, crowd and `Open Result`; it remains presentation-only. |
| No Theater | Gate/city-premiere edge or a dedicated public-release attention pin carries the same exact film and commands. |
| World anchor unloaded/lost | HUD attention remains; `Locate` is disabled with `Public venue not currently represented`; result remains fully accessible. |
| Several films open | One grouped `N pictures opened` token; each exact film is selectable. Presentation never substitutes the newest title for another film's record. |

No release result moves the camera automatically. `Open Result` opens the retained surface over the
current lot. `Locate` alone selects and Focuses the exact public anchor under Package 02. Back restores
the prior camera, selection, route, scroll and keyboard/controller focus.

## 7.3 Spectacle ladder

- **REQUIRED V1:** exact title, state light/marquee or Gate receipt, modest people/activity cue,
  short audio punctuation, result attention.
- **FOLLOW-UP:** credited-company arrivals, photographers, tasteful searchlights where era-appropriate.
- **LATER:** full premiere, red carpet, custom venue, press line, trailer/footage.
- **DO NOT DO:** forced cinematic, fake attendance, fireworks for routine releases, direct premiere
  cash, or a venue-capacity simulation without TypeScript authority.

---

# 8. Reviews

## 8.1 What exists today

`FilmResult` stores one `criticScore`, its deterministic `criticMean`/`criticSigma`, and the sampled
`reviewVariance`. It does **not** store individual reviewers, publications, review count, article
text, sentiment topics or quotations. `src/core/newspaper.ts` deterministically derives critic
stars and up to three callouts; `ui/src/screens/NewspaperReveal.tsx` presents them.

The current Gazette is a strong foundation, with one required correction: its high/low `cohesion`
callouts can call that value “creative cohesion” or “muddled creative brief.” In authority,
`cohesion` is **delivered talent alignment**, not authored brief coherence. P07A must use the
terminology already corrected in `accessibleAutopsy` and must not ship the misleading line.

## 8.2 Review presentation contract

Above the fold:

1. **Critics** — score and half-star editorial rendering, always with `/100` text;
2. **one verdict line** — deterministic tone aligned to the score;
3. **two or three review-desk callouts** — ranked, concise and traceable;
4. **Audience response** — a separate adjacent lane, never quoted as a critic; and
5. **Open Autopsy / Why?** — direct route to evidence.

Callouts can truthfully name only published facts:

- critic performance versus the locked Greenlight forecast;
- delivered talent alignment;
- strongest/weakest frozen role fit when the Chronicle validates credits;
- aggregate audience response or forecast miss/outperformance;
- direct contribution projection, labelled as a projection while active; and
- other exact drivers from an available session Autopsy.

## 8.3 Analysis, flavor and forbidden claims

| Class | Allowed example | Rule |
|---|---|---|
| **AUTHORITATIVE ANALYSIS** | `Critics scored it 12 points below the Greenlight outlook.` | Exact stored result + frozen forecast. |
| **AUTHORITATIVE ANALYSIS** | `The company pulled in different creative directions during execution.` | Only from delivered-alignment projection; use no “brief” language. |
| **FLAVOR** | `A bruising opening-night notice.` | May set tone; cannot name a cause, person or market fact. |
| **FUTURE SYSTEM** | Named critic, outlet, quote, review count, audience sample. | Requires authoritative provenance/evidence model. |
| **REJECT** | `Audiences hated the ending` when only aggregate segment scores exist. | Invents scene-level causation. |
| **REJECT** | `Marketing saved the film` from a high opening. | Deterministic causal overclaim; other drivers and variance exist. |

No pseudo-LLM review generator is required. A small deterministic template set with structured
driver tokens is enough. The displayed score and every analytic callout must survive save/reload or
fail the specific section closed.

---

# 9. Critics versus audience ruling

The distinction already exists and is valuable:

- **Critics:** `criticScore`, a sampled outcome around a deterministic mean and sigma.
- **Audience:** share-weighted aggregate of frozen per-segment `segmentScores`.
- **Commercial:** opening/total gross and theatrical-run payments.

These can diverge. The result surface should explicitly support stories such as `Critics favorable ·
Audiences divided · strong opening` without manufacturing a unified verdict.

`aggregateAudienceScore` currently uses the current market segment shares supplied by the adapter;
the aggregate itself and label are not frozen on `FilmResult`. Segment scores are frozen. This is
safe while shares remain stable, but it is a future-era/history seam: changing market shares could
retroactively change an old film's aggregate label.

**RULING FOR P07A:** TypeScript publishes the audience aggregate through one canonical read model;
Unity never recomputes it. `FilmResult` keeps the frozen per-segment response, and an eligible
Chronicle can display it. A future system that changes shares must first freeze release-time shares
or the aggregate in history. Do not solve that future migration inside Unity.

Do not add a Rotten-Tomatoes-style second audience percentage, critic count, confidence badge or
professional/audience media brand. Those require new authority.

---

# 10. Box-office model and presentation

## 10.1 Current commercial authority

For engaged play, `src/core/economy.ts` opens a `TheatricalRun` from the already-resolved opening and
legs. The run freezes:

- `weeklyGross[]` whose sum equals `FilmResult.boxOffice.total`;
- `studioShare`;
- `totalWeeks` and payments received (`weekIndex`);
- cumulative gross paid; and
- cumulative Studio Revenue paid.

Week one pays in the release tick. Later active runs pay during every authoritative tick. There are
no modeled theater counts, admissions, territory split, distributor negotiation, competition chart,
screens, ticket price or manual collection.

## 10.2 Required labels

| Number | Required player label | Never call it |
|---|---|---|
| `boxOffice.opening` / first schedule entry | **Opening-week theatrical gross** | Cash, profit, Studio Revenue, attendance |
| `boxOffice.total` | **Locked scheduled full-run theatrical gross** | Studio cash, paid-to-date gross or a probabilistic forecast |
| current run payment × share | **Studio Revenue paid this week** | Gross |
| cumulative `cumulativeStudioRevenuePaid` | **Studio Revenue received to date** | Total box office |
| remaining schedule × share | **Studio Revenue still scheduled** | Guaranteed profit without cost basis |
| full schedule × locked share | **Projected total Studio Revenue** while active; **Total Studio Revenue** when complete | Box-office gross |

The full-run gross schedule is deterministic once released, but its unpaid Studio Revenue is not
banked. Reserve **projected** for full-run Studio Revenue/contribution whose future payments have not
arrived; call gross **locked scheduled full-run gross**. The disclosure must say so once on the
default surface.

## 10.3 Run card

An active run answers:

- `Payments received: k of N` (because `weekIndex` counts credited weeks);
- latest payment and next scheduled Studio Revenue;
- received to date and still scheduled;
- opening and locked scheduled full-run gross;
- direct commitment;
- projected full-run Film Contribution; and
- `Open Film Result` / `Open Chronicle`.

Trend is presentation over authoritative schedule: `Opening`, then `up/down/flat versus the prior
paid week` with exact values available. A chart may show paid weeks as solid and future locked
schedule as a dashed **scheduled** portion; reserve `projected` for unbanked Studio Revenue/
contribution. Text equivalents are mandatory. No client recalculation of the
schedule, studio share, cost or contribution.

Run completion changes `Projected` to `Final`/unqualified actual and removes future schedule. It does
not require another player action.

---

# 11. Profit and loss

## 11.1 Honest film-specific accounting

The current ledger can associate these direct commitments with a film:

- production debit, including negative and Greenlight marketing;
- freelancer fees linked to the production; and
- Studio Revenue entries linked to the theatrical run.

The canonical direct-film result is:

> **Film Contribution = total Studio Revenue − direct committed film cost.**

While the run is active, the full-run figure is **Projected Film Contribution** because future
payments are not banked. On completion it becomes **Final Film Contribution (before studio fixed
costs)**.

## 11.2 What must remain separate

- Theatrical gross is audience-market performance, not studio cash.
- Studio Revenue is the locked share actually credited week by week.
- Payroll, facilities, maintenance and general overhead are studio-period costs, not canonical
  film costs in `FilmResult`.
- `commercialConfidence` uses a gross-based reputation ROI in current authority; it is not the
  film's cash return and has no current mechanical effect.
- A same-week standing change is studio-wide, not one film's profit consequence.

The repository has retrospective fixed-cost allocation work, but it must be a separately labelled
management analysis (`Allocated studio overhead`) if exposed later. Never silently fold it into
Film Contribution or present false accounting precision.

## 11.3 Default money block

1. Direct commitment.
2. Opening gross.
3. Studio Revenue paid this week / to date.
4. Full-run Studio Revenue (projected until complete).
5. Film Contribution (projected/final, direct costs only).
6. Plain disclosure: `Payroll and studio overhead are reported at studio level and are not assigned
   to this film.`

## 11.4 Prior economy-research boundary

The three prior audits are inputs, not invitations to retune:

- `codex/economy-truth-audit-01` at `e6c10c3880c8e843004bd2c57833b09b92efa899` found no P0
  authority defect requiring result-formula replacement.
- `codex/economy-diagnosis-02` at `159fb7a31f0f125843b11607597dcbd6741e7505` requires preserving
  deterministic cash/RNG/save reconciliation and the existing Film Contribution basis.
- `codex/economy-intervention-frontier-03` at `07e8ec8a2d929b40217eece16cfb8c66548081cb` keeps committed
  capital, downside and contribution as meaningful choice frontiers without authorizing a new
  tuning pass here.

Package 07 therefore explains current outcomes. It does not change marketing, publicity,
discoverability, Fame saturation, Office uplift, theatrical share/schedule, fixed costs or
affordability law.

---

# 12. Why the movie succeeded or failed

## 12.1 Current driver map

The engine has a rich causal chain in `src/core/reception.ts`, but not every intermediate survives
release. The UI must respect the difference.

| Driver family | Current authority | Default interpretation | Durability |
|---|---|---|---|
| Screenplay | managed screenplay assessment feeds script strength | Creative contributor | Exact full breakdown requires pre-release snapshot; Chronicle retains authored project where valid. |
| Direction | effective directing skill and fit | Creative contributor | Session Autopsy; frozen director/fit survives. |
| Cast | effective acting and role fit, weighted by role | Creative contributor | Session Autopsy; frozen participants/Fits survive. |
| Craft/technical | craft hires and technical execution | Creative contributor | `FilmResult.craft` survives; component breakdown session-bound. |
| Budget adequacy | negative relative to required negative | Creative condition | Session-bound; direct spend survives in ledger. |
| Set uplift/novelty | bound set facts at release | Creative/commercial context | Not fully named on `FilmResult`; do not reconstruct after reload. |
| Delivered talent alignment | `FilmResult.cohesion` | Positive/negative execution contributor | Persisted; must not be called brief coherence. |
| Originality/timeliness | critic/audience contributions | Context | Full causal terms are session-bound. |
| Promise/segment fit | mismatch and segment appeal | Audience contributor | Segment results persist; detailed mismatch session-bound. |
| Star draw | reach support and audience appeal | Commercial contributor | Session-bound; participant/career record persists. |
| Marketing/awareness | opening reach, not creative quality | Commercial contributor | Spend persists via ledger/production provenance; exact release intermediate session-bound. |
| Discoverability draw | isolated sampled opening variance | Random/uncertain | Not persisted as a player-facing reason; acknowledge unexplained variance rather than invent a cause. |
| Critic draw | sampled `reviewVariance` around mean/sigma | Random/uncertain | Score, mean, sigma and variance persist. |

## 12.2 Driver presentation law

The default Autopsy shows at most three **What Worked** and three **What Hurt** items. Rank by:

1. magnitude against the relevant neutral/reference point;
2. whether the fact changed a player-facing outcome;
3. whether the player could have acted on it at Development, Casting, Greenlight or Production; and
4. confidence/durability of the evidence.

Each item has four parts:

> **Driver label** · direction/magnitude · affected lane · one actionable learning

Example, only when published:

> **Stretch role fit** · weakest package fit · hurt cast execution · compare this role against a
> stronger genre fit next time.

Randomness is not a driver to “fix.” When sampled critical variance or discoverability materially
separates forecast from result, say `The outcome landed outside the studio's central estimate; no
single controllable cause explains the full gap.` Never back-fill the gap with a convenient person
or marketing claim.

## 12.3 Existing prose audit

- Reuse `accessibleAutopsy`'s plain-English **What Worked / What Hurt / Biggest Surprise / What the
  studio learned** hierarchy.
- Reuse `deliveredAlignmentReport` terminology.
- Reuse frozen `TalentCareerEvent.reasonCodes` for person consequences.
- Do not reuse a Gazette callout whose words do not match the authoritative field.
- Do not parse prose back into UI rules or intents.

---

# 13. Film Autopsy

## 13.1 Purpose

The Autopsy is not another score screen. It turns a completed decision chain into knowledge:

- **Outcome:** what happened across the four result lanes;
- **Drivers:** strongest supported contributors and detractors;
- **Money:** opening, Studio Revenue, direct commitment and contribution basis;
- **People:** frozen company and exact career changes;
- **Context/variance:** forecast, market/segment response and uncertainty; and
- **Lesson:** a small number of specific future actions.

## 13.2 Opening behavior

The first release gets a prominent `Read Film Result` action, but the Autopsy does not auto-open over
the lot. Result attention may be opened from the public-release cue, Gazette, Dashboard/portfolio,
Film Chronicle or an exact-film notification. All routes carry the same ID and a shallow navigation
origin. Back returns to the invoking surface; `Back to Lot` returns to the stored world context.

Later routine releases may show a compact result receipt first. A large surprise or notable release
may emphasize the Gazette headline, but the same Autopsy remains one click away.

## 13.3 Session versus durable evidence

`ui/src/engine/adapter.ts::explainRelease` recreates the exact mechanistic breakdown from the
pre-release `GameState` and overwrites sampled critic fields with the stored result. That pre-tick
snapshot is held only in the UI session. After save/import/reconnect it cannot be reconstructed
honestly.

Therefore:

- **Immediate/session Autopsy:** full craft components, contributor vectors, promise mismatch,
  awareness, legs, critic construction and standing explanation.
- **Durable Film Result summary:** only persisted `FilmResult`, `TheatricalRun`, ledger, frozen
  participants/forecast, produced ScriptProject, career events and current Chronicle projections.
- **Film Chronicle:** eligibility-gated durable identity/history with section-level `not recorded`
  states where frozen witnesses exist.
- **Forbidden:** reopening a historical film and silently generating a faux full Autopsy from
  current talent/market or a same-title production.

A future authoritative `FilmResultAnalysis` snapshot could make the full technical Autopsy durable,
but that is a deliberate save/schema extension, not a P07A presentation shortcut.

---

# 14. Emotional and significance ladder

Significance affects presentation only. P07A should reuse current deterministic presentation facts
(`AutopsyGrade`, Gazette headline rules, forecast deltas, broadcast eligibility and direct
contribution) through a TypeScript read-model tier; Unity must not invent thresholds.

| Presentation tier | Trigger source | Treatment | Not allowed |
|---|---|---|---|
| **Routine** | Ordinary release/result; no published notable event | Small world cue, result token, normal dossier | No fireworks, forced modal or camera move |
| **Release** | Every new film, especially first film | Title/marquee or Gate receipt, one audio cue, Gazette/Result available | No gameplay bonus |
| **Notable** | Existing TypeScript rule identifies strong forecast divergence, sharp critic/audience split, strong/weak direct result or broadcast-worthy release | Larger headline, fuller crowd/light cue, stronger session result-available emphasis | No client-side `blockbuster` claim or persisted unread state |
| **Historic** | Future authoritative record, milestone or Package 08 fact | Reserved for later milestone/awards presentation | P07A must not derive or ship it |

Words such as `blockbuster`, `record-breaking`, `sleeper` and `critical breakout` require an
authoritative classifier comparing the appropriate portfolio/market facts. P07A may use current
plain result labels (`Projected profit/loss`, audience tier, critic score, forecast outperformed/
missed), but not those new cultural categories.

---

# 15. Theater role

The Theater is a **world presentation owner**, not economic authority.

When present and anchored, its selected inspector may answer:

- what is opening or currently playing;
- exact film title and run position;
- critic and audience headline response;
- latest Studio Revenue payment and received-to-date;
- whether the run is active or complete; and
- `Open Film Result`, `Open Chronicle`, and `Locate public release`.

It must not claim:

- exclusive distribution;
- theater capacity, attendance or ticket sales;
- that the studio owns public exhibition;
- that an unreleased picture is already there;
- that a marquee changes economy; or
- that no Theater means no premiere.

With multiple films, the inspector shows up to three active exact-film rows ordered by release week
then canonical ID, followed by `Open theatrical slate`. Selection of a row opens the same film
dossier. An optional Theater may show one featured marquee by a deterministic presentation rule,
but that marquee must never become the list or result authority.

---

# 16. Newspaper / trade-paper role

The Silver Screen Gazette is the emotional editorial layer, not a mandatory weekly ledger.

**Use it for:**

- the first release;
- every opening result when the player chooses `Read Gazette`;
- notable release divergence/headline;
- an optional archived clipping; and
- future historical moments.

**Do not use it for:**

- every weekly run payment;
- ordinary payroll/economy reporting;
- information unavailable on legacy films;
- invented quotations; or
- a modal that prevents the player seeing the lot.

Current `buildNewspaper` is pure and deterministic and correctly separates opening-week paid Studio
Revenue from unbanked full-run money. Keep the fictional masthead and current visual identity.
P07A must audit the full copy set, not only the known cohesion defect: phrases such as “packed
theaters” also imply attendance that authority does not model. Use neutral audience-response/
commercial language, preserve the accounting disclosure and ensure every same-week release remains
equally inspectable even if one is the lead story.

---

# 17. Theatrical-run tracking

Routine earnings arrive automatically. The player never clicks `Collect`.

| Surface | Information budget |
|---|---|
| Management zoom/world label | Title (or count), `IN THEATERS`, payments received `k/N`, attention only for opening/end/anomaly. |
| Theater/public-release inspector | Active film rows, latest Studio Revenue, received-to-date, status, Open Result. |
| Film dossier | Full run card with opening, paid schedule, future scheduled revenue, gross/Studio Revenue separation and contribution. |
| Studio portfolio | All active runs plus completed/history filters; rows open exact dossier. |
| HUD | One unobtrusive weekly receipt only when a payment materially helps orientation; grouped when several runs pay. |

P07A's **live transition receipt** says what became final:

> `<title> completed its theatrical run · Total Studio Revenue <amount> · Final Film Contribution
> <profit/loss> before studio fixed costs.`

The current `ui/src/lot/snapshot/nextEvent.ts::run-completed` receipt is a detection/reference, not a
persisted event. P07A emits an exact receipt only in the accepted live advance that observed
`active → completed`, keyed by film ID plus authoritative completion week and bridge revision. It is
not stored as read/unread. On cold load/reconnect the durable run state is `completed`, but no “just
completed” animation replays. The receipt does not replay reviews or move the camera.

---

# 18. Multiple-release scaling

P07A proves one film visually but must test multiple identities.

- A same-week opening creates one grouped queue in canonical ID order.
- Gazette may select one lead layout but lists every secondary film with equivalent Critic, Audience,
  money and open-dossier actions.
- Each run has its own schedule, share, received amount and status.
- Weekly earnings group by film and never merge their cost/profit basis.
- Run completion can group several films while preserving exact rows.
- Standing delta is labelled `Studio-wide change across this release week` and lists co-releases.
- `Back` restores the exact film and scroll position, not merely the newest release.

No global “Theater is full” or release competition law is implied by several active runs. Those
mechanics do not exist today.

---

# 19. Film Chronicle and history

Released films enter history automatically. Current `src/core/newspaper.ts::buildFilmChronicle` and
`ui/src/screens/FilmRecord.tsx` already provide the correct behavioral foundation.

## 19.1 Existing durable foundation

`buildFilmChronicle` currently owns a deliberately narrow record: identity/title/genre, Critic and
derived Audience reception, validated creative record, frozen credits, production chronology and
strongest/weakest package fit. `FilmRecord.tsx` wraps that Chronicle with gross, committed cost,
projected/final direct contribution and Career Impact. Neither is a native weekly-run ledger or a
complete durable technical Autopsy.

The derived Audience aggregate remains historically stable only while segment shares are invariant;
the frozen facts are the segment scores. P07A must prove that invariant across its target baseline
and save/reload. Before any share-mutating market system ships, TypeScript must freeze release-time
shares or the aggregate. Unity cannot solve the seam.

## 19.2 Target summary card extension

- title/poster identity;
- genre and release week;
- Critic and Audience;
- theatrical gross and Studio Revenue;
- projected/final direct contribution;
- director and lead when frozen credits validate; and
- run state or historical status.

## 19.3 Target full Film Result / Chronicle record

- stable film ID and title provenance;
- Shape/Promise/commission/rewrite where recorded;
- frozen writer, director, cast and craft;
- Greenlight OVR/Fit/expected ranges;
- Greenlight/release chronology where valid;
- strongest/weakest frozen package fit;
- critic/audience/segment results;
- opening and full theatrical history (**P07A extension over the narrow Chronicle**);
- direct commitment, Studio Revenue and contribution basis;
- frozen talent career impacts; and
- future Awards/IP/franchise sections as unavailable/empty extensions, not Package 07 inventions.

Every optional section fails closed with `Not recorded for this older film` or `Unavailable`; it
never reads current talent to repair frozen history. Chronicle, Clipping and session Autopsy remain
distinct actions with honest availability labels.

---

# 20. Star and studio consequences

## 20.1 People

`TalentCareerEvent` is the append-only person-result authority. It freezes role, billing weight,
discipline, OVR/skills/genre experience/work history before/after, Star Power before/after, response
facts, forecast comparator and reason codes.

The result may show:

- exact before/after values;
- `Star Power +/−X`;
- professional development;
- reason labels such as strong/weak audience response, limited reach, forecast exceeded/missed,
  supporting visibility or established-star saturation; and
- `Open Profile` for the exact talent ID.

It must not invent `breakout`, `career-ending`, critic-specific blame or contract effects unless an
authoritative classifier/event exists. Later employment changes do not rewrite the frozen credit or
career event.

## 20.2 Studio

In engaged play, release can change:

- cash through weekly Studio Revenue (legacy/non-engaged release instead follows its one-payment
  full-gross law);
- audience awareness from reach/star attention;
- industry prestige from critical achievement;
- commercial confidence from gross-based ROI/budget discipline; and
- broadcast items for sufficiently notable forecast divergence.

The result screen may explain the channel law, but same-week standing change is shared and
commercial confidence must be described as a reputation signal computed on gross, not financing or
banked cash. No current unlock, loan, award or audience-awareness bonus may be invented.

---

# 21. Awards boundary

Package 07 records the durable facts Package 08 may later consume:

- exact film ID/title and release week;
- critic/audience/commercial history;
- frozen credited participants;
- craft/alignment/result facts;
- career events; and
- studio history.

Package 07 does not show nominations, award eligibility badges, campaigns, ceremony dates, category
rankings, trophies or award-driven bonuses. A generic `Awards later` placeholder is also unnecessary.

---

# 22. Era safety — 1920 to 2040

The interaction grammar is era-stable:

> public opening → critical/audience/business result → run → durable film history.

Era presentation can change:

- newspaper, trade paper, radio, television, online outlet or future media skin;
- local premiere, movie palace, multiplex, global launch, streaming/digital premiere;
- poster/aspect treatment, crowd clothing and venue technology; and
- commercial vocabulary when future distribution authority changes.

P07A uses neutral model terms—`Public release`, `Critics`, `Audience response`, `Theatrical gross`,
`Studio Revenue`, `Film Contribution`, `Film Chronicle`—and a 1920-compatible visual profile. It
must not encode newspaper-only reception, one permanent theater technology, a 1948 press voice,
territory structure or streaming law into the data contract.

---

# 23. REQUIRED NEXT / FOLLOW-UP / LATER / DO NOT DO

## REQUIRED NEXT — P07A: First Release Payoff V1

1. Depend on P06A's persisted Release commitment gate; do not recreate it in Unity.
2. Publish exact release-result, run, Gazette/Chronicle availability and attention facts through
   TypeScript read models and the bridge.
3. Add venue-independent release acknowledgment using the existing exact `premiere` event; enrich an
   optional Theater only as presentation.
4. Build a retained Film Result summary from existing browser information hierarchy: title/poster,
   Critics, Audience, opening, paid Studio Revenue, projected direct contribution, forecast delta,
   up to three trustworthy callouts.
5. Route full Autopsy only when its exact session snapshot exists; otherwise route to durable Film
   Result/Chronicle with honest unavailable sections.
6. Track the active run without manual collection and add the exact non-persisted live run-completion
   receipt defined above; cold load shows completed state without replay.
7. Preserve exact Lot/workspace/film origin across Open, Locate and Back; never move the camera on
   result alone.
8. Prove legacy/missing optional data, two same-week releases, simultaneous runs and save/reconnect.

## FOLLOW-UP

- Persist or explicitly publish a durable full `FilmResultAnalysis` snapshot if Owner wants exact
  technical Autopsy after reload.
- Structured driver-token cleanup for Gazette, including delivered-alignment terminology.
- Richer active-run chart and studio theatrical portfolio.
- Credited-company arrival staging and era-aware public-release presentation.
- Freeze release-time segment shares/aggregate before any future market system can mutate shares;
  P07A must first prove current-share invariance and save/reload equality.

## LATER

- Named critics/outlets, review samples and audience evidence volume.
- Release calendar, competition, territories, distribution, screens and release strategy.
- Optional Screening Theater/Premiere House and test-screening system.
- Full premieres, trailers/footage and creator-mode integration.
- IP/library economics, sequels, home media/streaming and era distribution.
- Package 08 Awards, ceremonies, rank/prestige and historical milestones.

## DO NOT DO

- Do not add one universal Movie Quality score.
- Do not calculate ratings, audience aggregate, box office, contribution, Star effects or significance
  gameplay in Unity.
- Do not equate total gross with studio cash.
- Do not label projected full-run money as banked.
- Do not allocate payroll/overhead to a film without an explicit separate accounting basis.
- Do not generate causal review prose from title, genre, visuals or an LLM.
- Do not force a modal or camera move on release, review, weekly payment or run completion.
- Do not require or economically empower a Theater.
- Do not ask the player to collect earnings or archive films.
- Do not implement Awards.
- Do not retune reception/economy under a presentation checkpoint.

## Owner decisions required

**None before P07A.** This mission supplies the Package 06 commitment boundary as a design premise,
Package 02 supplies navigation law, existing authority supplies result/run/career/history truth, and
the consolidated Owner ruling resolves Theater dependence. P07A is nevertheless sequenced after
P06A implementation; the boundary is not present in the baseline.

Later campaigns require explicit Owner decisions before implementation: whether to persist the full
technical Autopsy snapshot; whether critic/audience evidence gains named outlets/counts; and whether
an optional Theater becomes buildable prestige infrastructure. None blocks the bounded checkpoint.

---

# Source register

## Comparator atlas

- Exact modern comparator URLs, source sections, copy/do-not-copy guidance and Project: Studio
  translations are consolidated in
  [`CODEX-RECEPTION-BOXOFFICE-PACKAGE-07-BUILDER-ANNEX.md` §A1–A15](./CODEX-RECEPTION-BOXOFFICE-PACKAGE-07-BUILDER-ANNEX.md#a-comparator-reference-atlas).

## Historical

- [*The Movies* official English manual (Steam PDF)](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf), especially printed pp. 6–7, 12–13, 22–23, 38–39.
- [*The Movies* Prima Official eGuide (Internet Archive record)](https://archive.org/details/The_Movies_Prima_Official_eGuide), especially PDF pp. 44–47, 53, 58–61, 79.
- [*The Movies: Stunts & Effects* official manual](https://cdn.akamai.steamstatic.com/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), especially PDF pp. 5–6 / printed pp. 8–10.
- [macinplay.de — *The Movies: Superstar Edition*](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), sections “Alles dreht sich um den Film” and “Mikromanagement, das auch mal nervt.”
- [Altered Gamer — *Stunts & Effects* review](https://www.alteredgamer.com/other-games/13334-review-the-movies-stunts-and-effects-expansion-pack/) **[SECONDARY]**.
- [WorthPlaying — *Stunts & Effects* review](https://worthplaying.com/article/2006/7/17/reviews/34654-pc-review-the-movies-stunts-effects/) **[SECONDARY]**.

## Current Project: Studio authority

- `src/core/types.ts` — `FilmResult`, `TheatricalRun`, `TalentCareerEvent`.
- `src/core/tick.ts` — ordered release/reception/payment/standing/career pipeline.
- `src/core/reception.ts` — reception and box-office drivers.
- `src/core/economy.ts`, `src/core/economyView.ts` — locked run and payment views.
- `src/core/standing.ts`, `src/core/starPower.ts`, `src/core/broadcast.ts` — consequences.
- `src/core/newspaper.ts` — Gazette and Film Chronicle projection.
- `ui/src/engine/adapter.ts` — Autopsy, scorecard, run and Chronicle read models.
- `ui/src/screens/NewspaperReveal.tsx`, `ReleaseResult.tsx`, `Autopsy.tsx`, `FilmRecord.tsx`,
  `Dashboard.tsx` — current browser behavioral references.
- `bridge/schema/bridge-schema.ts` — current thin release-result bridge boundary.
- `docs/FILM-CHRONICLE-V1-CONTRACT.md` and closure.
- `docs/c2-planning/00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md` — Theater/Premiere law.

## Local historical reconstruction corpus consulted

- `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`.
- `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-SOURCE-REGISTER.md`.
- `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-ORIGINAL-DATA/movie_rating_pipeline.json`.
- `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-ORIGINAL-DATA/original_formulas.json`.
- `/Users/bruce/Desktop/big swing art/The_Movies_Prima_Official_eGuide.pdf` and
  `/Users/bruce/Desktop/big swing art/movies manual_english.pdf`.
- `/Users/bruce/Downloads/The Movies_ Stunts & Effects - Strategy Guide - PC - By JPaterson000 - GameFAQs.pdf`
  as secondary gap evidence only.
