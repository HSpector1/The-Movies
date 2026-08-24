# Project: Studio — Package 08 Builder Annex

**Companion authority:** `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md`

**Baseline inspected:** `c902a704eb948cc576083d0973c8c23e59937dc1`

**Unity read-only working reference:** `/Users/bruce/Project Studio - Unity Production Convergence 80H`, `campaign/living-lot-client` at `417ab703078eac872f8d936de9103b43dbbf3189` (not substituted for the Owner's sealed comparison pair).

**Purpose:** make Package 08 buildable without another genre study or repository-archaeology pass.

**Scope:** presentation and future authority contract only; no production code is implemented on this branch.

## Builder read order

1. Read the design report's Executive Decision and sections 6, 8, 10, 18, 22, and 25.
2. Inspect the exact current paths in section B below.
3. Use the reference atlas only for the interaction named; none is a whole-screen visual style mandate.
4. Build **P08A — Standing & Studio History Spine V1** first. Awards presentation must wait for award authority and the two Owner decisions at the end.

### Non-negotiable authority boundary

TypeScript alone owns Standing, future award periods/eligibility/outcomes/effects, progression, durable records, RNG, time, and saves. Unity/browser presentation may own layout, focus, animation, attention seen-state, camera, filtering, and responsive rendering. It may never infer an award from a score, calculate a rank, synthesize a rival, or backfill history.

---

## A. Comparator Reference Atlas

These are look-here-before-building references. “Copy” always means copy the principle, not artwork, branding, terminology, or simulation law.

### A1. Original ceremony, recap, tally, and progression

- **Game:** *The Movies* (2005)
- **Exact URL:** [official manual PDF](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040)
- **Look here:** printed pp. 22–23 (PDF page 12), `Awards` and `Movie Mogul Ranks`.
- **Interaction referenced:** timeline ceremony timing; persistent Awards icon after the ceremony; temporary award bonuses; rank-requirement access.
- **Fable should inspect:** how a single timeline trophy carries anticipation, how the recap remains recoverable, and how award/rank information is kept one route away from lot play.
- **COPY PRINCIPLE:** periodic anticipation, explicit entry, recoverable result, durable progression access.
- **DO NOT COPY:** five-year buffs, nine-rank ambiguity, hover-only explanation, five-star universal rating.
- **Project: Studio translation:** one grouped attention item opens a retained ceremony/history workspace; the fact persists whether watched or skipped.

### A2. Original ceremony screen and achievement ladder

- **Game:** *The Movies* (2005)
- **Exact URL:** [Prima Official eGuide archive](https://archive.org/details/The_Movies_Prima_Official_eGuide)
- **Look here:** PDF pp. 78–82 / printed pp. 77–81, especially the recent ceremony screen, `View Tally`, the nine Achievement Award cards, and Gold/Platinum requirements.
- **Interaction referenced:** recent winner → category information; lifetime tally; current goal enlarged; completed requirements filled; ordered advancement.
- **Fable should inspect:** the information order and recoverability, not the small 2005-era density.
- **COPY PRINCIPLE:** result, evidence, history, and next long-term objective are distinct views with direct routes.
- **DO NOT COPY:** tiny requirement text, colored difficulty as sole meaning, hidden formula dependence, requirements that mix unlike systems without explanation.
- **Project: Studio translation:** ceremony Summary → category archive; separate Studio Progression later; no certificate UI inside P08A.

### A3. Long-save timeline and significance

- **Game:** Football Manager
- **Exact URL:** [Dynamic Manager Timeline](https://www.footballmanager.com/features/dynamic-manager-timeline)
- **Look here:** section `Dynamic Manager Timeline`, particularly the two timeline images and paragraphs describing chronological events, importance weighting, successes/failures, and returning to an old save.
- **Interaction referenced:** a long career compressed into legible major moments.
- **Fable should inspect:** chronological spine, uneven visual weight, and how failures are retained alongside trophies.
- **COPY PRINCIPLE:** history should restore the player's mental model and elevate truly important events.
- **DO NOT COPY:** opaque client-only importance scores or football-specific event taxonomy.
- **Project: Studio translation:** deterministic Package 08 significance class; sparse 1920–2040 timeline; links to exact film/person/facility facts.

### A4. Reputation dimensions with driver feedback

- **Game:** Football Manager
- **Exact URL:** [Supporter Confidence](https://www.footballmanager.com/features/supporter-confidence)
- **Look here:** `Supporter Profile` and `Supporter Confidence`; inspect the screenshots showing category-level feedback alongside other institutional judgments.
- **Interaction referenced:** different constituencies judge different things; feedback is broken into drivers.
- **Fable should inspect:** equal-status category cards and the distinction between supporter judgment and financial/strategic board judgment.
- **COPY PRINCIPLE:** keep unlike reputation dimensions separate and explain what each observes.
- **DO NOT COPY:** sports constituencies, dismissal pressure, or a new composite confidence score.
- **Project: Studio translation:** Audience Awareness, Industry Prestige, and Commercial Confidence remain separate; Finance and Honors sit beside, not inside, Standing.

### A5. Award category archive

- **Game:** Out of the Park Baseball 23
- **Exact URL:** [League Awards manual page](https://manuals.ootpdevelopments.com/index.php?man=ootp23&page=league_awards)
- **Look here:** `League Awards`; the page describes an award-category list whose selected category opens all historical winners.
- **Interaction referenced:** category-first historical browsing.
- **Fable should inspect:** category → winner history navigation and its predictable archive structure.
- **COPY PRINCIPLE:** one category index, then chronological results, each linking to the subject.
- **DO NOT COPY:** league vocabulary, dense spreadsheet chrome, or assumed competitor population.
- **Project: Studio translation:** Honors tab → category → period → film/person/studio outcome, limited to player-studio history until rivals exist.

### A6. Unified history portal

- **Game:** Out of the Park Baseball 23
- **Exact URL:** [History Index manual page](https://manuals.ootpdevelopments.com/index.php?man=ootp23&page=league_history)
- **Look here:** `History Index`, including the season list and links to players, teams, leaderboards, awards, and accomplishments.
- **Interaction referenced:** one portal to multiple historical lenses.
- **Fable should inspect:** stable top-level destinations and season-first orientation.
- **COPY PRINCIPLE:** one Studio History workspace owns Timeline, Films, People, Honors, Records, and Progression routes.
- **DO NOT COPY:** one-screen data dump, every statistic, league comparison, or mouse-only table navigation.
- **Project: Studio translation:** retain filters/route/scroll on deep link and Back; no parallel disconnected Archives screens.

### A7. Person history / record-book depth

- **Game:** Out of the Park / Franchise Hockey Manager
- **Exact URLs:** [OOTP Hall of Fame sortable history](https://manuals.ootpdevelopments.com/index.php?man=ootp17&page=help_league_history_page.hof_sortable) and [FHM Team History](https://manuals.ootpdevelopments.com/index.php?man=fhm11&page=teamhistory)
- **Look here:** sortable historic people view; FHM season history, alumni, career/single-season leaders, and records.
- **Interaction referenced:** retired people remain first-class historical identities.
- **Fable should inspect:** how a departed person remains linkable through honors, filmography, and records.
- **COPY PRINCIPLE:** immutable identity survives retirement; profile has history mode.
- **DO NOT COPY:** dozens of sports stat columns or automated Hall of Fame criteria presented as universal truth.
- **Project: Studio translation:** person Honors and Career History use stable `talentId`; no `Locate in World` for retired/unavailable people.

### A8. Achievement/progression state vocabulary

- **Platform reference:** Apple Game Center
- **Exact URLs:** [Game Center HIG](https://developer.apple.com/design/human-interface-guidelines/game-center) and [Rewarding players with achievements](https://developer.apple.com/documentation/gamekit/rewarding-players-with-achievements)
- **Look here:** `Achievements`, including locked/in-progress/hidden/completed states, progress, and optional banners.
- **Interaction referenced:** concise progression cards with explicit state.
- **Fable should inspect:** state clarity and short descriptions.
- **COPY PRINCIPLE:** future rank requirements have explicit state and measurable progress where authority supports it.
- **DO NOT COPY:** platform points, global social comparison, generic achievement banner spam, or conflating meta-achievements with studio history.
- **Project: Studio translation:** separate Studio Progression tab; platform achievements remain outside authoritative save history.

### A9. Non-blocking award attention

- **Platform reference:** Apple HIG
- **Exact URLs:** [Notifications](https://developer.apple.com/design/human-interface-guidelines/notifications/) and [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- **Look here:** notification prominence and the guidance against interruptive alerts for nonactionable information.
- **Interaction referenced:** discoverable result without forced interruption.
- **Fable should inspect:** concise subject-first copy and one primary route.
- **COPY PRINCIPLE:** a ceremony result is durable attention, not an emergency.
- **DO NOT COPY:** OS notification styling or duplicated banner/modal/newspaper messages.
- **Project: Studio translation:** one `Awards results recorded` pulse; player may dismiss or open; no penalty, pause, or camera move.

### A10. Inbox triage for accumulated history attention

- **Platform reference:** GitHub Notifications
- **Exact URLs:** [Managing notifications from your inbox](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox) and [Keyboard shortcuts](https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts)
- **Look here:** preview, filters, Done/Save/read state, keyboard navigation, and Escape focus restoration.
- **Interaction referenced:** several nonurgent facts can be grouped and triaged without deleting their source records.
- **Fable should inspect:** distinction between dismissing attention and deleting history.
- **COPY PRINCIPLE:** presentation cursor/seen state stays separate from durable facts; keyboard Back restores focus.
- **DO NOT COPY:** email/inbox aesthetic or per-category award tasks.
- **Project: Studio translation:** one period batch; ceremony Summary persists after attention is dismissed.

### A11. Readable retained workspace

- **Platform reference:** Xbox Accessibility Guidelines
- **Exact URLs:** [XAG 101 — Text display](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101) and [XAG 112 — UI navigation](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112)
- **Look here:** configurable readable text, logical focus order, consistent prompt placement, and multiple ways to locate complex content.
- **Interaction referenced:** timeline/category/data workspace that remains usable at distance and with controller.
- **Fable should inspect:** navigation order and persistent prompt placement, not platform styling.
- **COPY PRINCIPLE:** scalable text, no bidirectional scrolling for core tables, filters plus search, focus follows visual meaning.
- **DO NOT COPY:** fixed console dimensions or interaction prompts foreign to the current input system.
- **Project: Studio translation:** 18px target body at 1080p, 16px minimum metadata, 200% text scale/reflow target, category rail collapses into a chooser on narrow layouts.

### A12. Reduced-motion ceremony

- **Platform reference:** Xbox Accessibility Guideline 117
- **Exact URL:** [XAG 117 — Motion](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117)
- **Look here:** controls for moving/auto-updating presentation, disabling background motion, and reducing camera effects.
- **Interaction referenced:** celebratory reveal that remains readable and optional.
- **Fable should inspect:** motion can be removed without removing information.
- **COPY PRINCIPLE:** `Skip to Summary`, pause/disable motion, and no compulsory camera movement.
- **DO NOT COPY:** separate motion effects for every category or animated number rolls as the only result communication.
- **Project: Studio translation:** reduced motion uses instant state/crossfade; outcome, evidence, and consequence stay textually identical.

### A13. Superstar-era failure warning

- **Game:** *The Movies: Superstar Edition*
- **Exact URL:** [Macinplay review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/)
- **Look here:** `Am Anfang war das Studio` and `Mikromanagement, das auch mal nervt`.
- **Interaction referenced:** praise for the living/rated lot alongside criticism of repetitive manual archiving and constant caretaking.
- **Fable should inspect:** the tension, not the review's prose as mechanical authority.
- **COPY PRINCIPLE:** honors should reinforce the lot's history.
- **DO NOT COPY:** manual archiving, ceremony maintenance, or another queue of people to service.
- **Project: Studio translation:** outcomes archive automatically; the player watches/inspects only when interested.

### A14. Stunts & Effects boundary

- **Game:** *The Movies: Stunts & Effects*
- **Exact URL:** [official *Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041); [secondary expansion review](https://www.alteredgamer.com/other-games/13334-review-the-movies-stunts-and-effects-expansion-pack/).
- **Look here:** printed p.10, `New Awards`; printed p.4, Quick Start's Gold/Platinum Lifetime Achievement exclusion; printed pp.8–10 for the stunt evidence feeding the feature.
- **Interaction referenced:** unlocking the Stunt School makes new stunt-specific Awards and Achievements with bonuses available; the manual does not publish their names, criteria, cadence, recipient model, or exact effects.
- **Fable should inspect:** how an added simulated discipline gained a recognition layer, and how little of that layer the source actually explains.
- **COPY PRINCIPLE:** honors may expand when the simulation publishes a durable discipline/performance fact and explicit award law.
- **DO NOT COPY:** invent a stunt category, nominee, winner, or effect to fill gaps left by the manual.
- **Project: Studio translation:** stunt/effects honors remain **LATER**; P08A/P08B has no category or UI placeholder until TypeScript owns the underlying facts and award contract.

---

## B. Existing-System Reuse Map

`Reuse` means consume unchanged authority. `Extend` means add a projection/surface or a future additive root at the documented seam. `Replace` means retire only the named presentation path once parity exists. `Leave Alone` means the existing behavior is explicitly outside this package.

| Need | Exact current Project: Studio path / component / data | Ruling | Why |
|---|---|---|---|
| Current Standing type | `src/core/types.ts::Standing`, `Studio.standing` | **REUSE / LEAVE SHAPE ALONE** | Frozen three-channel 0–100 authority. Do not add rank/legacy/award leaves. |
| Release-result Standing law | `src/core/standing.ts::updateStanding`; release loop in `src/core/tick.ts` | **REUSE / LEAVE ALONE** | Sole release-result formula; same-week releases apply sequentially. It is not the only Standing mutation. |
| Paid Awareness change | `src/core/actions.ts::applyPublicity`; `src/core/publicity.ts`; persisted `publicity` state/ledger entry | **REUSE / LEAVE ALONE** | Accepted publicity immediately raises Audience Awareness. A live receipt can show exact before/after; it is not a durable change-history record. |
| Weekly Awareness settling | `src/core/tick.ts` step 5.5; Awareness drift constants in `src/core/tuning.ts` | **REUSE / LEAVE ALONE** | Deterministic post-release/post-broadcast drift above the anchor. It is part of final whole-week Standing but has no persisted per-week witness. |
| Standing tuning/initial values | `src/core/tuning.ts::INITIAL_STANDING` and Standing constants | **LEAVE ALONE** | Package 08 is not a tuning campaign. |
| Standing read labels | `ui/src/engine/adapter.ts::selectStanding`, `standingChannels` | **REUSE / EXTEND PRESENTATION** | Already publishes exact meanings and current mechanical disclosure. |
| Standing visual primitive | `ui/src/components/common.tsx::StandingBar`, `Delta` | **REUSE** | Accessible number + meter + text and signed non-color-only delta. |
| Current Standing dashboard | `ui/src/screens/Dashboard.tsx` | **EXTEND / DO NOT REBUILD** | Browser behavioral baseline only. Unity has no studio-Standing DTO or screen; P08A must add projection/presentation rather than assume parity. |
| Live release-week Standing evidence | `ui/src/screens/ReleaseResult.tsx`; `ui/src/screens/Autopsy.tsx`; `ui/src/engine/adapter.ts::explainRelease` | **REUSE WITH CORRECTION / LIVE ONLY** | Compares retained `preTick` to final post-tick Standing. It is a whole-week delta across all releases **plus Awareness drift**, not persisted and not numerically per-film. Route to it only while the live receipt exists; list all film drivers and disclose drift. |
| Administration world owner | `ui/src/lot/StudioLotScreen.tsx` (`PUBLICITY_BUILDING_ID = 'admin'`, Administration & Publicity inspector); `ui/src/lot/navigation.ts` | **EXTEND** | Existing physical selection/context owner for finances/standing/week; add Standing/History routes without changing CP10A interaction law. |
| Lot attention rail | `ui/src/lot/LotNextEventRail.tsx` and event grammar in `ui/src/presentation/eventGrammar.ts` | **EXTEND** | Reuse grouping, explicit route, and non-camera-hijacking attention pattern. Awards attention does not exist yet. |
| Browser return context | `ui/src/App.tsx` route union/`StudioReturnContext`; lot retained-context behavior | **REUSE / EXTEND** | Existing Film Record/Autopsy/Recap deep routes demonstrate exact Back restoration. Add History route state, do not create global ad-hoc back stack. |
| Film result | `src/core/types.ts::FilmResult` | **REUSE / LEAVE ALONE** | Durable creative/commercial result identity. Do not append copied honors arrays to each film. |
| Theatrical history | `src/core/types.ts::TheatricalRun` | **REUSE** | Durable run facts support film records and records where complete. |
| Film Chronicle projection | `src/core/newspaper.ts::FilmChronicleView` and related builders | **REUSE / EXTEND VIEW** | Existing immutable/availability-aware film record; future Honors is derived from award outcomes. |
| Film Record browser | `ui/src/engine/adapter.ts::filmRecordView`; `ui/src/screens/FilmRecord.tsx` | **EXTEND** | Add Honors section/History route later; do not build a second film archive. |
| Gazette/release presentation | `src/core/newspaper.ts`; `ui/src/engine/adapter.ts::releaseNewspaper`; `ui/src/screens/NewspaperReveal.tsx` | **REUSE STYLE/ROUTING; EXTEND DATA LATER** | Strong event punctuation and film identity. Only authoritative major honor/milestone batches may use it. |
| Talent career authority | `src/core/types.ts::TalentCareerEvent`; career event creation paths | **REUSE / LEAVE ALONE** | Immutable per-film person outcome with stable `${filmId}:${talentId}` identity. Awards reference, never overwrite, it. |
| Career read models | `ui/src/engine/careerImpact.ts` | **REUSE / EXTEND** | Existing available/not-recorded law and stable film/person deep linking are the model for Honors. |
| Person profile | `ui/src/components/TalentProfileDrawer.tsx`; `ui/src/components/CareerImpact.tsx` | **EXTEND** | Add an Honors section sourced from future outcome records; keep Career History distinct. |
| Studio recap | `src/core/studioRunRecap.ts::studioRunRecap`; `ui/src/screens/StudioRunRecap.tsx` | **REUSE** | Existing management-grade summary, key moments, records/inflections, and honest missing data. P08A History may link to it, not duplicate finance analysis. |
| Permanent/witness event log | `src/core/types.ts::StudioEventLog`; `src/core/studioEvents.ts` | **REUSE PRINCIPLE / EXTEND CAREFULLY** | Tier D permanent versus Tier W 26-week compaction and monotonic `seq` are the retention model. Do not dump every award UI event into it. |
| Save/migration discipline | `src/core/save.ts` V14 validation and forward migrations | **REUSE / FUTURE EXTEND** | A future legacy/award root is additive and versioned; migration starts empty, with no synthetic past. |
| Future blueprint gates | `src/core/types.ts::BlueprintRequirement`; `src/core/blueprintRequirements.ts` | **LEAVE ALONE UNTIL AUTHORITY** | `rank`, `certificate`, and `award` correctly fail closed and say the systems do not exist. |
| Era config | `src/core/types.ts::EraConfig` | **LEAVE ALONE** | Static/inert for this purpose; no award calendar/category rule should be inferred from it in UI. |
| Broadcast candidates | current `BroadcastItem[]` state/read paths | **DO NOT REPURPOSE** | Internal release-news candidate concept is not an award/history ledger. |
| Bridge schema | `bridge/schema/bridge-schema.ts`, generated `bridge/schema/project-studio-bridge.schema.json` | **EXTEND ATOMICALLY LATER** | Current released-film DTO is only id/title/reception/weeksAgo; no Standing, Chronicle, career, or awards projection exists. |
| Unity generated DTO | `/Users/bruce/Project Studio - Unity Production Convergence 80H/Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | **DO NOT HAND-EDIT; REGENERATE LATER** | Must move atomically with TypeScript schema and validator when P08A/P08B Unity data is authorized. |
| Unity snapshot/validation | `.../Runtime/Data/StudioLotSnapshot.cs`, `StudioSnapshotValidation.cs`, `StudioBridgeWireValidator.cs` | **EXTEND LATER** | Preserve fail-closed wire authority; no parsing of award prose. |
| Unity HUD/presentation | `.../Runtime/Presentation/StudioHud.cs`, `StudioLivingTimeHud.cs`, `StudioBridgePresentation.cs` | **EXTEND PRESENTATION** | Natural home for attention and retained route; no calculations. |
| Unity selection/camera | `.../Runtime/Presentation/StudioSelectionManager.cs`, `SelectableEntity.cs`, `StudioCameraDirector.cs`, `TycoonCameraController.cs` | **REUSE / LEAVE LAW ALONE** | Package 02 selection, explicit Focus, and no automatic camera hijack remain binding. |
| Unity Administration context | semantic building ID `admin` through snapshot/location binding and browser reference | **EXTEND ONLY AFTER CP10A** | Reuse the proven Administration selection/inspector rather than inventing an awards building. |

### Browser behavior already worth emulating in Unity

- **Exact Standing meaning:** browser adapter copy explicitly states what each channel does and does not do.
- **Shared-week honesty:** Release Result/Autopsy says when a Standing delta belongs to several same-week releases. Package 08 must add that final Awareness also includes weekly settling.
- **Unavailable history:** Talent Profile says detailed history begins at a save version instead of fabricating old deltas.
- **Stable deep routes:** Film Record, Autopsy, Talent Profile, and Studio Run Recap preserve named entities and return context.
- **Non-color-only deltas:** `Delta` combines sign and text with color.

### What does not exist and must not be “reused” by assumption

- award categories, calendar, eligibility, nominations, winners, ties, or no-winner law;
- ceremony data or UI;
- award effects;
- Studio Rank/progression;
- historic Standing checkpoints;
- rival field or industry ranking;
- Unity honors/Standing projection.

---

## C. Studio Standing Inspector Anatomy

This is a shared behavioral contract. Component names below are descriptive, not instructions to introduce a particular framework abstraction.

### C1. Desktop/local inspector

**Placement:** existing fixed lot inspector region used by Package 02/CP10A. It does not float over the Administration building and does not cover the selected world anchor.

**Target footprint:** approximately 360–440 CSS px wide at 1080p. Body copy targets 18 px; secondary metadata 16 px; no essential copy below 14 px. Text must scale/reflow to 200% without two-direction scrolling.

**Information order:**

1. **Eyebrow:** `ADMINISTRATION & PUBLICITY` or `STUDIO STANDING` depending on entry route.
2. **Header:** `Studio Standing`; optional exact current week/period.
3. **State sentence:** `Your released pictures have established a public and industry record.` / early-studio copy.
4. **Three equal channel blocks:**
   - channel label;
   - large integer value (`47`), never a star conversion;
   - 0–100 bar with text alternative;
   - one-sentence current meaning;
   - signed recent delta and arrow only when recorded.
5. **Selected channel explanation:** source-labeled live witness and before → after only when the current accepted action/tick receipt exists; otherwise `Recent change history is not recorded`.
6. **Source/evidence:** publicity action, or whole-week update with all release titles/drivers and the Awareness-settling disclosure. Never numerically allocate the week delta to one film or to drift without a future authoritative witness.
7. **Actions:** `Open Studio History` primary; `Open current Film Result` only while that live route exists; otherwise `Open Film Record`; `Locate Administration` only when entry did not already select it.

### C2. Requested “not-yet-meaningful” state → actual early-studio state

There is no honest post-founding state in which Standing is wholly meaningless: Audience Awareness already affects release reach, paid publicity can change it, and weekly settling can move it. The requested state is therefore implemented as **early studio**, not as disabled Standing.

Visible:

- Header and the current three values, labeled `Early studio profile` while no film has released.
- Copy: `Publicity and weekly settling can already move Audience Awareness. Released pictures establish the studio's wider critical and commercial record.`
- If publicity has run, show current Awareness without calling it a starting value.
- No unrecorded trend, rank, award count, or progress-to-next-tier.
- `Open Studio History` remains available for safe recorded film/lot facts; P08A has no founding event.

Forbidden:

- calling starting values “earned”;
- gray disabled bars that imply a missing system;
- showing the inert rank/certificate blueprint requirements as attainable.

### C3. Active state

Visible:

- all three channels at equal hierarchy;
- one current-effect sentence per channel;
- a live exact delta only while a current action/tick receipt exists;
- source label and whole-week/shared-release/settling disclosure where applicable;
- explicit missing-history state after load/reconnect.

Allowed commands:

- select a channel;
- open the current live Film Result/Autopsy when retained; otherwise open a durable Film Record without claiming a Standing delta;
- open Studio History;
- Back/Escape.

Forbidden commands:

- “Increase Standing” generic action;
- spend cash directly on Prestige/Confidence unless a future authoritative intent exists;
- rank unlock action;
- award claim.

### C4. Live-change state

Treatment:

- compact arrow plus signed words (`+3 increase`, `−2 decrease`), never color alone;
- exact live interval (`44 → 47`);
- source label: `Publicity action` or `Whole-week update`;
- for publicity, accepted tier/action and immediate Awareness lift;
- for release week, all releasing titles and each film's player-safe driver context;
- if several releases shared the week, state that the studio-wide movement is not attributable to one film;
- state that final Awareness also includes weekly settling. Do not numerically split sources.

The live module disappears after save/reload/reconnect when its `preTick`/action receipt is unavailable and is replaced with `Recent change history is not recorded.` Never compare current Standing to an assumed baseline and call it “this period.”

### C5. Deep route

`Open Studio History` opens the retained workspace at `Timeline` with the originating Standing channel/filter context retained. Back returns:

- exact camera pose;
- selected Administration (or prior selection if opened from HUD);
- inspector scroll;
- selected Standing channel;
- keyboard/controller focus on the button that opened History;
- time speed/pause state unchanged.

### C6. Narrow/bottom-sheet version

- Width: full viewport minus 12–16 px safe margins.
- Initial height: about 55–65% of viewport; expands to at most 92%.
- Header and Back remain sticky.
- Channel blocks stack vertically; do not shrink into three illegible columns.
- Primary action remains visible after the channel list.
- Drag-to-dismiss, platform Back, and explicit close are equivalent nonmutating exits.

---

## D. Award Attention Anatomy

This anatomy is the contract for P08B/future awards; P08A only needs the Standing/milestone variants.

### D1. Eligibility / pre-period attention

Show only if TypeScript publishes a real eligibility state or cutoff:

- **Subject:** `Awards period closes in 4 weeks`.
- **Summary:** `Night Harbor currently qualifies for 2 categories.`
- **Action:** `Review eligibility`.
- **No urgency color** unless a legal player decision with a deadline exists.
- **No camera action.** `Locate` is secondary and explicit when a relevant building exists.

### D2. Nomination attention

Only if nominations exist as durable state:

- one grouped badge per period;
- count of nominated films/people/categories;
- most significant nomination named first;
- `Open nominations`;
- dismissal alters presentation seen-state only.

### D3. Results attention

- **Headline:** `Awards results recorded`.
- **Subhead:** exact period and count (`2 wins · 3 other nominations`) only when authoritative.
- **Primary:** `Open ceremony`.
- **Secondary:** `View summary`.
- **Dismiss:** moves attention to History; never removes outcome.
- **Ignored:** lot/time continues; result does not expire or re-resolve.

### D4. No nominations / no wins

Do not create a failure modal. If nominations are modeled, a concise History/Gazette row may say `No studio nominees this period`. If only winners are modeled and the studio won nothing, there need not be a HUD interruption at all; the period remains inspectable in Honors.

### D5. Accessibility

- Badge icon plus text, never trophy color alone.
- Screen-reader label includes period, state, and count.
- No flashing, looping pulse, or autoplay sound.
- Controller focus arrives at headline, then primary/secondary/dismiss in logical order.

---

## E. Ceremony Workspace Anatomy

### E1. Desktop wireframe

```text
┌ retained lot 18–24% ┐┌──────────────── CEREMONY 76–82% ────────────────┐
│ exact prior camera  ││ [Back]  Academy Honors · 1934       [Summary]   │
│ selection retained  │├──────────────┬──────────────────────┬───────────┤
│ no camera travel    ││ Categories   │ Category / recipient │ Evidence  │
│                     ││ • Direction  │                      │ & effect  │
│                     ││ • Acting     │ portrait / film      │           │
│                     ││ • Picture    │ result + one reason  │           │
│                     │├──────────────┴──────────────────────┴───────────┤
│                     ││ [Open film/person] [Open History] [Next]        │
└─────────────────────┘└──────────────────────────────────────────────────┘
```

At 1080p, target a 32–40 px ceremony title, 24–30 px result/category title, 18 px body, and 16 px metadata. The current Project: Studio dossier identity governs surfaces and portrait framing. No fixed gold/sepia/red-carpet theme is mandated; era skin is data/presentation content.

### E2. Header

- fictional institution name from authority/content data;
- exact period/cutoff label;
- state (`Results recorded`, `Summary`);
- `Back` and `Skip to Summary` always in predictable positions;
- no timer and no “claim reward.”

### E3. Category rail

Each row contains:

- category name;
- subject thumbnail/token;
- state in words: `Winner`, `Nominated`, `Eligible`, `No studio nominee`, `Not recorded`;
- unread marker as presentation state only.

Default filter is **Your studio**. `All categories` exists only if authority can show truthful category results without fake competitors. The rail is keyboard/controller navigable; selecting a row changes detail without mutating state.

### E4. Result stage

Above the fold:

1. category name;
2. result word (`WINNER`, `NOMINATED`, etc.);
3. film/person/studio identity;
4. associated film and role where relevant;
5. one authoritative explanation sentence.

Reveal animation is presentation-only. Result data is present before animation and accessible to assistive technology without waiting. Reduced motion uses an instant state or crossfade.

### E5. Evidence panel

Show:

- evaluated period;
- eligibility state;
- 2–4 strongest published qualifying drivers;
- uncertainty/tie/no-winner rule when relevant;
- unavailable fact disclosure;
- rule version only under `More details`, not as primary player copy.

Do not show a 20-row formula dump or a magic “Award Fit 87.” The panel explains what was judged; it does not reveal hidden quality outside existing player-safe outputs.

### E6. Consequence panel

Show three explicit rows:

- **Honor:** `Recorded permanently`.
- **Mechanical effect:** exact before → after and affected entity, or `Recognition only`.
- **Unlock/progression:** exact item/rank requirement contribution, or absent.

Effects cannot be accepted/declined after the fact unless TypeScript defines an actual choice. There is no generic `Collect` button.

### E7. Summary

Summary groups:

- wins;
- other nominations, if modeled;
- eligible/no-result facts only under expansion;
- person/film effects;
- Standing/progression changes;
- `Open Studio History`.

`Skip to Summary` changes no data. On reconnect after a partial reveal, default to Summary to avoid replaying false “new” resolution.

### E8. Narrow layout

- Full-width retained workspace; lot is visually suspended but its camera/selection state remains retained.
- Category rail becomes a top dropdown/chooser.
- Result identity, evidence, and consequence become a vertical sequence.
- Sticky `Back` and `Summary` actions.
- No horizontal comparison table required.

---

## F. Person Honors Anatomy

Add beneath identity/current-role information and alongside—not inside—Career History.

### F1. Summary card

- `HONORS` label;
- win count and nomination count if modeled;
- most significant/recent honor;
- last-awarded period;
- `View all honors`.

If no award authority exists, omit the card; do not show permanent “0 awards” before awards are part of the game.

### F2. Honor row

Order:

1. category and result word;
2. film title and performed role/discipline;
3. period;
4. exact persistent/mechanical effect;
5. `Open film` / `Open ceremony`.

### F3. Historical modes

- **Active/on lot:** Profile, Honors, Filmography; `Locate` available.
- **Departed/retired:** frozen identity and history; no world Locate; status explains why.
- **Missing legacy detail:** frozen award identity; `Detailed career record not available for this older save`.
- **Multiple same-period honors:** group by period but retain separate outcome IDs.

### F4. Forbidden

- recomputing honor from present OVR/Star Power;
- calling a person “legend” from win count without an authority;
- duplicating/copying mutable award data into the profile;
- using portrait frame color as the only win/nomininee signal.

---

## G. Film Honors Anatomy

Place inside the existing Film Record/Chronicle after the film outcome header and before deep financial/autopsy material.

### G1. Summary

- total wins / nominations;
- most significant category;
- period;
- `Open ceremony summary`.

### G2. Rows

For film-level recognition:

> Best Picture · Winner
>
> 1934 Academy Honors · Recognition only

For person-level recognition associated with the film:

> Best Direction · Talia Voss · Winner
>
> *Night Harbor* · Industry Prestige +2 (only if authoritative)

### G3. Missing data

- `Awards were not recorded when this film was released.` for migrated/pre-system films.
- `Category unavailable in this period.` for era/rule absence.
- Do not show “lost” unless the film/person was an authoritative nominee/eligible subject and the result is recorded.

### G4. Deep links

Film → honor → person/ceremony and Back must return exact Film Record scroll and expanded section. Historical film identity must not depend solely on a currently mutable concept title.

---

## H. Studio History Anatomy

### H1. Workspace frame

- Retained workspace uses the same 76–82% desktop allocation as other complexity-earned surfaces.
- Header: studio name, campaign span to date, current week/year representation from authority, `Back`.
- Primary tabs/lenses: `Timeline`, `Films`, `People`, `Honors`, `Records`, `Progression` (last two hidden or honest-empty until supported).
- Persistent search/filter row; period/decade, event type, film/person filters.
- No default all-data spreadsheet.

### H2. Timeline card

Each card contains, in order:

1. period/week;
2. significance word/icon (`Notable`, `Major`, `Historic`) where above Info;
3. concise event title;
4. one evidence sentence;
5. linked subjects;
6. exact record/effect if applicable;
7. `Open` route.

Cards visually scale by significance, but all remain readable without color/motion.

### H3. Timeline grouping

- Default: newest meaningful event first with a chronological decade navigator.
- Multiple same-week release events may share a group header but keep identity.
- Routine set/construction rows live behind filters unless marked significant.
- Major failures may appear; History is not a victory-only trophy cabinet.

### H4. Films lens

Reuse the durable Film Record/Chronicle; show poster/identity, release date, genre, critic/audience/commercial facts where available, honors, and deep route. Do not reconstruct a second FilmResult interpretation.

### H5. People lens

Show current/historical people with discipline, tenure/film count where exact, Star Power/career facts, honors, and profile route. Retired identities remain visible.

### H6. Honors lens

Category-first archive with period filter. Before authority exists, the whole tab is absent, not an empty promise. Old eras with unavailable data say `Not recorded`, never zero.

### H7. Records lens

- studio-relative only;
- metric, subject, value, period, availability;
- tie-safe;
- no world ranking;
- filters for Film, Person, Studio.

### H8. Exact P08A projection

Fable does not choose milestone/significance rules during implementation:

| Input | Default Timeline | Filter/detail | Rule |
|---|---|---|---|
| `FilmResult` | one card per release | Films | sort `releaseTick`, then `productionId`; ordinary release = Info |
| matching `premiere` Tier-D event | deduplicated into FilmResult card | evidence only | same film ID may never produce two cards |
| release-count boundary | badge/title on the relevant release card | Records | only 1st, 10th, 25th, 50th, 100th; Notable |
| `TheatricalRun` | none | Film detail / Records | locked nonlegacy facts only; missing/legacy labeled |
| `wrapped` Tier-D event | hidden | Production filter | Info; week + `seq` |
| `constructionCompleted` | hidden | Lot filter if human identity resolves | Info; never expose a raw placement ID as the label |
| `setBuilt` / `setRetired` | hidden | Lot filter | Info; week + `seq` |
| `TalentCareerEvent` | no participant-card spam | People and linked Film detail | stable event ID |
| current Standing | workspace header/Standing route only | Standing inspector | no historical high/low claim |
| Tier-W event / founding / award / rank / era | absent | absent | current authority cannot support it in P08A |

P08A Records are exactly: highest opening gross, highest total gross, highest critic score, longest trustworthy nonlegacy theatrical run, and most frozen released-film credits per person. Show all ties and missing-participant availability. Do not add profit, Standing high, audience aggregate, “most successful,” industry rank, or a Major/Historic film class.

### H9. Return-context contract

History stores presentation-only route state:

- active lens;
- filters/search;
- selected timeline/category/record;
- scroll anchor;
- expanded card;
- originating world selection/camera/focus.

It does not store this state in authoritative saves. Back unwinds detail → History → exact lot origin.

---

## I. Significance Matrix

| Fact | Default significance | Visible treatment | Attention | World response | Durable record |
|---|---|---|---|---|---|
| Routine eligibility fact | Info | eligibility/history row | none | none | only if eligibility history is part of authority |
| No nomination / no win | Info | period summary | none by default | none | exact period result if authority retains it |
| Nomination | Notable | profile/film badge + ceremony row | one grouped period badge | none | yes if nominations modeled |
| Routine award win | Notable | result reveal + Honors row | grouped result badge | optional restrained Admin marker | yes |
| Major category win | Major | prominent reveal + Gazette lead | grouped result badge | optional temporary era-aware acknowledgment | yes |
| First studio award | Historic | featured History card | grouped result badge | one bounded acknowledgment | yes |
| Rank advancement | Major | progression result + exact unlocks | one badge | affected unlocked facility/catalog state only from authority | yes |
| First release / sparse film-count boundary | Notable | History card | optional grouped milestone note | none | derive/persist per contract |
| New studio record | Notable; Major only by authored rule | record card/history entry | only for major record | none | underlying fact derive; event snapshot if identity may change |
| Publicity or release-week Standing change | Info | Standing inspector | compact pulse only for the current accepted publicity/release receipt; no routine-drift pulse | lot dressing only if existing law | current state + live witness only |
| Exceptional Standing threshold | Notable only if future rule publishes it | Standing/History | one badge | no automatic camera | sparse checkpoint if Legacy needs it |

### Significance law

- Presentation class changes no simulation.
- The TypeScript projection should publish a stable class or enough exact facts for a reviewed pure presentation classifier; Unity does not invent gameplay-significant “historic” status.
- No autoplay ceremony or modal at any level.
- One event gets one primary attention route, not toast + newspaper + modal + camera.

---

## J. Data-Retention / Legacy Matrix

The implementation principle is **store the smallest immutable fact that cannot be safely reconstructed; derive everything else**.

| Fact | Persist / Derive / Summarize / Discard | Current/future authority | Legacy value / builder note |
|---|---|---|---|
| Stable film ID / production ID | **Persist — existing** | `FilmResult.productionId`, runs/events | Primary join key; never replace with title. |
| Film display title snapshot | **Persist minimally where source could disappear** | absent from `FilmResult`; present in `TalentCareerEvent` | Needed for retired/missing concept history; stable ID stays authority. |
| Stable talent ID | **Persist — existing** | `Talent.id`, participant/career events | Survives departure/retirement. |
| Talent display identity at award time | **Persist minimal snapshot if roster may disappear** | future award outcome | Historical fallback, not a second person record. |
| Founding date/name | **Persist if variable; otherwise derive from campaign law** | future confirmation | Legacy header and years operated. |
| FilmResult | **Persist — existing** | `src/core/types.ts::FilmResult` | Core film history; optional legacy facts remain explicitly unavailable. |
| Theatrical run | **Persist — existing** | `TheatricalRun` | Revenue/run records; no manual archive. |
| Talent career event | **Persist — existing** | `TalentCareerEvent` | Person history and frozen result response. |
| Standing current triple | **Persist — existing** | `Studio.standing` | Current reputation, not history. |
| Every Standing weekly value | **Discard** | none | Too noisy for 120 years. |
| Current UI publicity/release receipt | **Presentation-only / discard after context loss** | accepted action or retained `preTick` + post-tick state | Can show an exact live before/after; cannot become historical evidence after reload. |
| Standing before/after release batch | **Persist or publish sparse witness when Legacy scope approved** | currently available in session/read flow, not a full durable arc | Needed only for exact history/highs; do not reconstruct. |
| Studio permanent identity events | **Persist — existing** | `studioEvents` Tier D | Wrap, premiere, construction, set lifecycle. |
| Routine operational events | **Summarize/window — existing** | `studioEvents` Tier W | Current 26-week compaction is correct. |
| Milestone derivable from immutable results | **Derive** | history read model | First release, Nth release, record gross, etc. |
| Milestone whose subject may be deleted/mutable | **Persist minimal event** | future legacy root | Preserve exact subject/period/rule. |
| Award category definition | **Versioned authored data; persist rule-version reference** | future registry | Old results must remain interpretable after category changes. |
| Award period identity/cutoff | **Persist** | future award season | Prevents current calendar from reinterpreting history. |
| Player-subject eligibility state | **Persist when period closes** | future award authority | Enables honest `eligible/ineligible/notRecorded/unavailable`. |
| Nomination | **Persist if feature exists** | future award authority | Durable anticipation/history, not a toast. |
| Winner/outcome | **Persist immutable** | future award authority | Core honor fact. |
| Tie/no-winner reason | **Persist compact reason code/evidence** | future award authority | Explain result after tuning/rules change. |
| Award effect application | **Persist idempotence witness + exact delta** | future authority | Prevent double application after reconnect. |
| Unseen rival ballot | **Discard unless gameplay requires it** | future rival system | Do not retain decorative competitors. |
| Ceremony reveal step | **Discard** | UI | Reopen at summary after reconnect. |
| Attention read/dismissed state | **Presentation-only cursor** | browser/Unity local UI | Never writes divergent world state. |
| Rank definition | **Versioned authored data** | future progression | Stable requirements/unlocks. |
| Rank achieved event | **Persist** | future progression | Durable unlock/history fact. |
| Requirement progress samples | **Derive current; discard samples** | future progression | Only completion event is historical. |
| Award/film/person honor copies | **Derive from outcome IDs** | read models | Avoid three drifting arrays. |
| Era transition | **Persist when era authority exists** | future | Major Legacy input. |
| UI prose/screenshot/animation | **Discard** | presentation | Re-render from data/content version. |

### Proposed future additive-root shape (conceptual, not implementation prescription)

The repository evidence supports a new versioned root rather than widening `Standing`. It needs these semantic families, whatever final names the engine chooses:

- award periods and immutable outcomes;
- applied-effect witnesses;
- rank/progression completion events;
- sparse nonderivable legacy events;
- explicit history-availability version.

It must not own current film results, career events, construction events, or UI seen-state already authoritative elsewhere.

### Long-save acceptance constraints

- 120 annual award periods or 24 five-year periods remain bounded by storing player-relevant outcomes, not every animated/category intermediate.
- Load produces the same outcomes and stable ordering with no RNG consumption.
- Migration creates an empty root and `notRecorded` history.
- Retired films/people keep immutable IDs.
- No old event is reissued as new attention solely because a client reconnects.

---

## K. State / Edge-Case Matrix

This matrix covers the eventual whole Package 08 grammar. Rows marked **future awards** are not P08A implementation permission.

| State / edge | Visible treatment | Allowed commands | Forbidden commands | Camera | Selection/history | Back / Escape |
|---|---|---|---|---|---|---|
| Founded, no released film | Standing `Early studio profile`; Awareness may already reflect publicity/drift; no founding timeline event | inspect channels; run existing legal publicity; open History | claim unrecorded trend/rank/award | unchanged | preserve current selection | closes inspector / returns exact origin |
| Accepted publicity | live `Publicity action` Awareness before→after; cash/cooldown remain existing truth | inspect Standing/receipt | attribute Prestige/Confidence change; persist fake history | never auto-moves | current receipt only | exact lot context |
| Routine Awareness drift | current Awareness updates; no attention by default | inspect current value | show a historical delta without witness | unchanged | no new history event | normal |
| First release changes Standing | compact grouped live attention; exact **whole-week** pre→final-post-drift delta | open Standing; open current Film Result; dismiss | generic “increase Standing”; call it per-film | never auto-moves | current receipt only | exact lot context |
| Standing active | three equal channels + meaning/effect | select channel; open evidence/history | composite prestige score | unchanged | current channel retained | inspector → lot |
| Live Standing rises/falls | signed arrow/text + before/after + source; release-week evidence remains whole-week | inspect current receipt/evidence | derive missing trend or per-film delta | unchanged | same-week releases grouped | restores selected channel/scroll |
| Same-week multiple releases | whole-week disclosure names all films and says Awareness includes settling | open each film | attribute full delta to one film; numerically split drift without authority | unchanged | stable film IDs; live receipt only | return to same disclosure |
| Live Standing receipt lost after save/reconnect | current three values + `Recent change history is not recorded` | inspect current channels/Film Records | reconstruct before/after from ledger/current films | unchanged | no fake event | normal |
| Film becomes award-eligible *(future awards)* | eligibility row and optional period attention | review rule/subject | treat eligible as nominated/winner | unchanged | exact film/person link | eligibility → origin |
| No nominations | quiet period summary | inspect category archive | failure modal/fanfare | unchanged | period stored if authority says so | normal |
| Nomination | grouped period attention; profile/film Honors row | open nominations/film/person | claim win/effect | unchanged | immutable nomination ID | restores category/filter |
| Award win | category/result/evidence/effect | open ceremony, film, person, history | reroll, claim twice | unchanged unless explicit later Watch action | immutable outcome | summary → exact origin |
| Award loss | respectful result row; evidence where published | open nominated subject/history | punitive invented effect | unchanged | nomination persists | normal |
| `Award presented elsewhere` *(threshold model only)* | named category and player-subject result; no rival identity/score | inspect threshold/evidence | fabricate off-screen winner, film, studio, or rank | unchanged | distinct immutable result state | normal |
| Multiple categories | one period batch; category rail | next/previous, summary, filter | one modal per category | unchanged | independent stable outcome IDs | retains selected category |
| Multiple films | group by period/category; identities visible | filter film; deep link | merge title/name collisions | unchanged | isolate by stable film ID | exact list/scroll |
| Person retires before ceremony | historical portrait/identity + retired state; no Locate | open profile/history | Locate nonexistent world target | unchanged | outcome still references person ID | ceremony route restored |
| Film/talent source missing | frozen minimal identity + detailed profile unavailable | open available record | show raw ID as primary name | unchanged | fail closed | normal |
| Save before period closes | current eligibility/progress only if persisted/pure | save/load; continue | finalize in client | unchanged | deterministic state | normal |
| Save after outcome | summary reopens; no repeat effect | inspect/skip/dismiss | reroll/reapply bonus | unchanged | exact outcome/effect witness | normal |
| Reconnect mid-reveal | open durable Summary, not “new winner” reveal | inspect categories | replay resolution/audio as new | unchanged | outcome stable | exact prior route when available |
| Ceremony ignored | badge may remain or be dismissed; history complete | keep playing; open later | penalty/expiry | unchanged | attention cursor separate | not applicable |
| Ceremony skipped | summary immediately visible | open detail/history | delete facts/change RNG | unchanged | reveal cursor discarded | origin restored |
| Ceremony workspace open while time advances externally | authoritative update reflected safely; no duplicate batch | refresh/inspect | client-side time/winner | unchanged | selected outcome retained if still exists | origin/time state unchanged |
| Result archived | Honors/History category and subject links | filter/open | manual archive chore | unchanged | immutable | restores filter |
| Standing changes from award *(only if future rule says so)* | exact award-effect delta, separate from release delta | open outcome/Standing | implicit delta from all wins | unchanged | effect witness links both | normal |
| No Administration building | HUD/global History route; no broken world Locate | open Standing/History | spawn fake prestige building | unchanged | prior selection retained | exact origin |
| Administration destroyed/unavailable | anchor lost message + global route | open global workspace | auto-select Gate as if same entity | unchanged | selection clears/fails closed per P02 | returns prior valid context |
| No Theater/prestige venue | ceremony remains retained UI/history | enter from attention | require/fake venue | unchanged | global context | exact origin |
| Long-campaign timeline | virtualized/paginated chronological view; filters | filter/search/deep link | load/render every event per frame | unchanged | stable anchors | exact scroll/filter |
| Old save predating awards | `Awards not recorded for this era/save` | inspect later outcomes | retroactive ceremony/backfill | unchanged | unavailable state persists | normal |
| Rule version changes | old outcome shows historical category/rule identity | inspect old evidence | recompute winner under new rule | unchanged | old version pinned | normal |
| Tie | all tied winners or exact authoritative tiebreak reason | inspect evidence | client picks array-first winner | unchanged | stable outcome(s) | normal |
| No-winner result | `No award presented` with rule explanation | inspect period/category | invent off-screen winner | unchanged | period persists | normal |
| Reduced motion | instant result/crossfade; identical text | summary/detail/navigation | compulsory zoom/light sweep/count-up | unchanged | identical outcome | identical |
| Controller navigation | visible focus; category rail → result → evidence → actions | cycle/focus/select/back | pointer-only hover disclosure | unchanged | focus target retained | previous focus restored |
| Narrow viewport | full-width sheet; stacked result/evidence/effect; chooser | scroll vertically; select; Back | horizontal two-axis core table | unchanged/retained offscreen | route retained | closes top layer |
| Modal above ceremony | modal traps focus only while open | confirm/cancel modal | category shortcuts behind modal | unchanged | underlying selection frozen | first closes modal |

### Deterministic ordering

Where several items share a period/week, order by:

1. authoritative period/cutoff;
2. authored category order;
3. authoritative result class (wins before other player-relevant outcomes only for presentation);
4. subject type order published by the projection;
5. stable subject/outcome ID.

Do not rely on object insertion order, localized display name, or current title.

---

## L. Golden UX Journeys

Each journey is suitable for an automated integration test where authority exists, plus manual visual verification at 1080p, narrow layout, keyboard, controller, and reduced motion as applicable.

### 1. Early studio Standing and publicity

**Given** a founded studio with no release, **when** Administration opens and a legal publicity action is accepted, **then** the early-studio profile shows all current channels and a source-labeled live Awareness before→after.

**PASS:** all three current values equal TypeScript; only Awareness changes; cash/cooldown match existing authority; no release/award/rank claim appears; save/reload replaces the ephemeral delta with `Recent change history is not recorded`; camera/selection do not change.

### 2. Select Administration and understand Standing

**Given** Administration exists, **when** the player single-selects it, **then** its local inspector offers `Studio Standing` and the three channels.

**PASS:** every channel has label, value, meter/text alternative, honest current consequence, and latest driver where recorded; selecting does not commit an action or move camera.

### 3. Release-week attribution

**Given** two films release in one authoritative week, **when** Standing is inspected, **then** the change is labeled studio-wide and both titles are named.

**PASS:** the number is explicitly the start-of-week to final post-drift whole-week delta; Awareness says it includes weekly settling; no surface numerically assigns it to one film or drift; each stable film link opens the correct record; Back returns to the same channel/scroll.

### 4. Standing → History → Back

**Given** the Standing inspector is open from the lot, **when** `Open Studio History` is selected and a film detail is opened, **then** two Back operations unwind film → History → lot.

**PASS:** exact History lens/filter/scroll, Administration selection, camera pose, input focus, and time state are restored.

### 5. Sparse history from existing facts

**Given** many FilmResults plus Tier-D and career events, **when** Timeline opens, **then** each film appears once, sorted by release tick/ID, with only 1/10/25/50/100 count markers.

**PASS:** matching premiere rows are deduplicated; wraps/construction/sets appear only behind their exact filters; career events stay in People/Film detail; founding/Tier-W/award/rank/film-significance cards are absent; IDs route correctly; repeated rendering/save-load does not duplicate entries.

### 6. Old save has honest history gaps

**Given** a migrated save whose `studioEvents`/career history begins at a later version, **when** the player opens an older film/person, **then** unavailable sections say `Not recorded`.

**PASS:** missing facts are not zero, no inferred delta/honor appears, and current authoritative facts remain usable.

### 7. Released film becomes eligible *(future award authority)*

**Given** an award period with published rules and a qualifying film, **when** eligibility closes, **then** one immutable eligible state is recorded.

**PASS:** period, category, subject ID, rule version, and reason are exact; Unity cannot alter them; eligible is not shown as nominated/winner.

### 8. Award attention can be ignored

**Given** results are recorded, **when** the player continues lot play without opening them, **then** time and management continue.

**PASS:** no auto-pause/camera move/modal; result never expires or rerolls; later opening shows the same summary; dismissing changes presentation state only.

### 9. Enter ceremony explicitly

**Given** a result badge, **when** the player chooses `Open ceremony`, **then** a retained workspace opens on the first player-relevant category.

**PASS:** camera/selection/time state are retained; result/evidence/effect are readable above the fold; no result computation happens in the client.

### 10. Win

**Given** TypeScript records a win, **when** its category is revealed, **then** film/person/category/result and main evidence appear, followed by exact consequence or `Recognition only`.

**PASS:** outcome ID is identical in ceremony, Film Honors, Person Honors, and History; any effect applies exactly once and survives reconnect.

### 11. Lose / no win

**Given** an authoritative nomination that does not win, **when** summary opens, **then** it says `Nominated`/result without invented punishment or rival facts.

**PASS:** nomination persists, profile/film link is correct, no Star Power/Standing change appears unless explicitly authoritative.

### 12. Skip to summary

**Given** multiple player-relevant categories, **when** `Skip to Summary` is selected at any reveal step, **then** all recorded results display immediately.

**PASS:** no RNG/state changes; no effect is skipped/doubled; Back returns exact origin; reduced-motion path is functionally identical.

### 13. Retired person wins/is honored

**Given** a stable award outcome for a person who retired before presentation, **when** the result opens, **then** the historical identity/profile is available and world Locate is absent.

**PASS:** no raw ID or replacement person appears; frozen name/film/role remain; Back restores the ceremony category.

### 14. Film and person history reflect one honor

**Given** a person-level award tied to a film, **when** opened from Film Chronicle and from Person Profile, **then** both route to the same outcome.

**PASS:** category/period/result/effect match byte-for-byte semantically; changing one presentation filter cannot mutate either record.

### 15. Standing reflects an authoritative award effect

**Given** a future category explicitly publishes a Standing delta, **when** the outcome resolves, **then** Standing shows the exact award-linked before/after separately from release-week movement.

**PASS:** the rule/effect witness is idempotent; categories with `Recognition only` do not alter Standing; Unity contains no delta formula.

### 16. Studio History records a historic first

**Given** the studio records its first major award or a published historic milestone, **when** History opens, **then** a Historic card links exact subjects/evidence.

**PASS:** the event appears once, survives save/reconnect, and does not require the player to archive it.

### 17. Multiple-film isolation

**Given** several eligible/nominated/winning films with identical or similar titles, **when** categories and profiles are traversed, **then** stable IDs isolate all records.

**PASS:** no result, portrait, effect, or Back route crosses films; ordering is deterministic.

### 18. Save/reconnect mid-ceremony

**Given** the player closes or reconnects during a reveal, **when** the workspace reopens, **then** it starts at durable Summary.

**PASS:** no new-winner animation implies re-resolution; result/effects are unchanged; seen-state may differ without changing save bytes.

### 19. No venue / no unwanted camera movement

**Given** no dedicated awards/prestige building, **when** attention opens a ceremony or History, **then** the global route works.

**PASS:** no fake venue spawns, no Gate/Theater is reclassified as authority, and camera pose remains exact throughout.

### 20. 120-year history remains usable

**Given** a synthetic long campaign with many films/events/award periods, **when** Timeline, Honors, Records, and search/filter are used, **then** presentation remains bounded and deterministic.

**PASS:** primary timeline excludes routine weekly chatter; long lists paginate/virtualize; text scales; controller can reach all filters; no two-direction core scrolling; load/save outcome is stable.

---

## M. Fable Implementation Map

### REUSE

- `src/core/types.ts::Standing`, release-result `updateStanding`, paid-publicity Awareness, and weekly Awareness-settling laws exactly as current authority.
- `ui/src/engine/adapter.ts::standingChannels` and current player-honest channel copy.
- `ui/src/components/common.tsx::StandingBar` and `Delta`.
- Release Result/Autopsy before→after and driver explanations.
- `FilmResult`, `TheatricalRun`, Film Chronicle/Film Record, Gazette/Newspaper, and Studio Run Recap.
- `TalentCareerEvent`, career read models, `TalentProfileDrawer`, and `CareerImpact`.
- `studioEvents` Tier-D/Tier-W retention principle and stable sequence.
- Package 02 selection, explicit Focus/Locate, retained workspace, and exact Back behavior.
- Administration (`admin`) as the local studio-management owner; global HUD route as fallback.

### BUILD NEXT — P08A: Standing & Studio History Spine V1

1. A selected-Administration/local Standing summary that reuses the three exact channels.
2. Compact live publicity/release-week Standing attention with no routine-drift pulse and no camera motion.
3. Retained Standing inspector with current values; source-labeled exact before/after only for a retained publicity/release receipt; whole-week release/drift disclosure; safe missing-history state after context loss.
4. Retained Studio History workspace with Timeline, Films, People, and Records lenses only where existing truth supports them.
5. Pure history projection using the exact H8 whitelist: one card per FilmResult, premiere deduplication, 1/10/25/50/100 release markers, filter-only Tier-D lot/production events, People/Film career detail, and the bounded five-record set.
6. Browser proof first or alongside current product direction; Unity projection/presentation only when its shared interaction spine is ready.
7. Save/reconnect/legacy availability, including loss of live Standing deltas without reconstruction; multi-film isolation, responsive layout, keyboard/controller focus, and reduced-motion acceptance.

**P08A stop line:** no award eligibility/outcomes, no ceremony, no Honors tabs, no rank/unlocks, no new prestige building, no trophy campaign, no 2040 finale.

### EXTEND

- `ui/src/lot/StudioLotScreen.tsx` Administration inspector routes after CP10A ownership settles.
- `ui/src/App.tsx` retained-route/return-context union for History.
- `src/core/newspaper.ts` / Film Record views only through new read projections, not copied history.
- Future save version with an additive award/legacy root; explicit `notRecorded` migration.
- Bridge schema, generated JSON/C# DTO, validators, snapshot, and Unity presentation atomically when Unity scope is authorized.
- Film and person profiles with Honors only after immutable award outcomes exist.
- Blueprint requirement evaluator only after award/rank authority is live end to end.

### DO NOT REBUILD

- Standing calculations, labels, bars, film result/autopsy, career event history, Film Chronicle, Gazette, Run Recap, lot selection/camera, or save migration conventions. Wrap the live release delta with the required whole-week/drift disclosure; do not create a second formula.
- A second Film archive, Person history store, event bus, or client-side milestone database.
- A white memo for awards/Standing.
- A Unity-only History model or prose parser.

### DEFER

- award categories, period/calendar, eligibility, nominations, winners, ties, no-winner rules, and effects until Owner decisions and TypeScript campaign;
- ceremony workspace/animation and Honors tabs until those outcomes exist;
- Studio Progression/rank ladder and unlock activation;
- era-aware category rollout, award publicity/campaigning, stunt/technical categories;
- physical trophy room, stage plaques, player-curated display;
- rivals/industry ranking;
- 2040 Legacy finale and final legacy evaluation.

### OWNER DECISIONS REQUIRED

No Owner decision is required before **P08A — Standing & Studio History Spine V1**.

Before building awards themselves:

1. **Award field law:** recommended pre-rival deterministic Academy thresholds with a distinct `Award presented elsewhere` result when a player nominee does not clear the win threshold, versus deferring ceremonies until real rivals exist. That state/copy needs explicit review because it acknowledges a wider institution while publishing no fictional rival identity or score.
2. **Cadence:** recommended annual eligibility/result batches with grouped skippable presentation, plus a five-year historical summary; alternative is original-style five-year-only ceremonies.

Later, before Studio Progression, the Owner must approve rank names, exact gates, and unlocks. That is not a P08A blocker.
