# PROJECT: STUDIO — PACKAGE 10 BUILDER ANNEX

# Stars, Careers, Staff & Human Management

Status: **builder-ready documentation; no production changes**<br>
Companion authority: `docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10.md`<br>
Research branch: `codex/stars-careers-staff-research-10`<br>
Canonical baseline: `c902a704eb948cc576083d0973c8c23e59937dc1` (`hspector-github/main`)<br>
Relevant sealed branch inspected read-only: `campaign/living-lot-ts` at `020b27a3484b3cb7d4214da5b3ace75adb7051f9`<br>
Authority date: 25 August 2026

This annex is the implementation map for the bounded **P10A — Employee / Star Profile & Roster Spine V1**. It neither authorizes nor specifies production implementation internals beyond repository-supported seams. TypeScript remains authority; Fable/Unity presents published truth and submits exact current intents.

## Builder decision in one page

Build a single human-information language over systems that already exist:

> world person → compact inspector → retained Profile → exact Back<br>
> Roster/attention → same Profile → Locate exact person → exact Back

P10A population is only the four authoritative `Talent` professions—Actor, Director, Writer, Craft—and their existing employment states. An Actor/Director is not automatically labeled `Star`; show **Star Power** as its distinct commercial axis. Decorative extras/stagehands/builders remain presentation bodies with no profile.

Every displayed value comes from one TypeScript projection. The client does not calculate OVR, Potential, genre strength, Star Power, market percentile, assignment, availability, contract horizon, legal action, career change, or rank.

P10A specifically does not add:

- training;
- morale/stress/boredom/welfare;
- relationships/chemistry;
- aging/retirement/death;
- awards/honors not already published;
- ordinary Crew/Extras/support staff;
- talent or studio leaderboards;
- new hiring supply/rival studios; or
- contract/economy tuning.

---

# A. Comparator Reference Atlas

These are **look-here-before-building** references, not generic game recommendations.

| # | Game / exact reference | Exact interaction to inspect | What Fable should study | **COPY PRINCIPLE** | **DO NOT COPY** | Project: Studio translation |
|---:|---|---|---|---|---|---|
| 1 | *The Movies* — [official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), printed pp. 6–9, 13–16 | Side Star card, hover-priority bubble, right-click bubble stack, card camera location. | How identity/current activity/status remained attached to a physical person, and how too many bubbles fragmented understanding. | Person first; local state in the world; identity travels with the body. | Bubble archaeology, drag-as-universal-command, color-only mood, manual needs. | One local inspector with identity/current work/availability/status; large retained Profile for depth. |
| 2 | *The Movies* — same manual printed pp. 11, 13–18; locally ingested Prima Star chapters | Stage School candidate queue; Star Rating/chart; genre practice; salary/trailer/entourage. | How career/status axes made Stars memorable and how the composite hid causes. | Persistent identity, multi-genre experience, visible business/status consequences. | Copying the nine-factor Star Rating, actor/director-only Star class, or practice dragging. | Separate OVR, Potential, genre experience, Star Power, contract, history, and future rank. |
| 3 | *The Movies: Stunts & Effects* — [official manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), printed pp. 6–10 | Stuntman card; Condition/Stunt Skill; training; double/likeness; injury/Hospital. | A specialist person can create readiness/risk/substitute decisions tied to production. | Skill/readiness/availability consequences should be legible on person and project. | Second meter grind, forcing injured people back to work, or importing this into base people V1. | Future authoritative safety/condition system only; no P10A fields. |
| 4 | *The Movies: Superstar Edition* — [Mac review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), “Am Anfang war…” and “Mikromanagement, das auch mal nervt” | Reviewer's description of “Star-gotchis,” bars/feeding, staff scarcity, and returning Actors to Set. | The precise point at which human texture becomes repetitive work. | People remain visible, vulnerable, and consequential. | Routine eating/drinking/social/rest orders or one alert per person. | Autonomy for routine welfare; grouped exceptions only after authoritative human condition exists. |
| 5 | *Football Manager 26* — [Top Tips for Youth Development](https://www.footballmanager.com/the-dugout/top-tips-youth-development-fm26), “Individual Training” | Player Profile → Training: durable role/additional focus, training unit, progress. | Development intention is chosen once; routine execution happens over time. | Focus + autonomous execution + meaningful cadence. | Sports-position taxonomy, daily per-person tuning, game-time XP. | Future only: TypeScript-authored development focus/capacity. No Training control in P10A. |
| 6 | *Football Manager* — [More Gameplay Deep Dives](https://www.footballmanager.com/features/more-gameplay-deep-dives), Squad Planner section | Selected player in a role; best-suited position/role; ability and contract context. | Contextual suitability must remain separate from generic current ability. | Role question and current obligation belong near identity. | Dense tactical spreadsheet or treating OVR as role-fit verdict. | Profile shows generic discipline OVR; Package 04 Casting shows project-specific fit/drivers. |
| 7 | *Football Manager 26* — [Powered by TransferRoom: Recruitment Revamp](https://www.footballmanager.com/fm26/features/powered-transferroom-fm26s-recruitment-revamp), “new Recruitment home” / Contracts tile | Contract-length distribution and direct surfacing of people with less than 12 months. | Contract risk should be grouped before individual action. | Aggregate horizon → filtered roster → exact person/action. | Agent-negotiation minigame or surprise individual popups. | Reuse existing Studio Calendar dates/expiry clusters; any 52/26-week planning horizon is a new TypeScript projection, while legal renewal remains final 12 weeks only. |
| 8 | *Football Manager 2024* — [Scouting manual](https://community.sports-interactive.com/sigames-manual/football-manager-2024-es/fichajes-contrataci%C3%B3n-y-ojeadores-r5144/), Scout Reports | Pros/cons and knowledge percentage improve with observation. | Evaluations disclose uncertainty/source rather than hidden truth. | Honest assessment boundaries. | Fake confidence meter where Project: Studio has no knowledge progression. | Show existing Estimated Potential range unchanged; never expose exact ceiling. |
| 9 | Madden NFL 27 — [Progression and regression](https://help.ea.com/en/articles/madden-nfl/progression-regression-franchise-mode/), “Track progress and regression” | Player Card → Progression History; My Team → Player Regression. | Current headline quality is distinct from a history of changes; aggregate view handles scale. | Person history plus roster-level exception review. | XP drip, goals, sports aging/regression, or attribute allocation. | Reuse frozen per-film career events; no development change is invented. |
| 10 | Madden NFL 27 — [Franchise Hub guide](https://help.ea.com/en/articles/madden-nfl/franchise-hub/), “Action Cards” | Important decisions appear in one weekly hub, disappear when resolved elsewhere, and eligible types can be delegated. | Attention should deep-link, remain state-derived, and not duplicate work. | Grouped decision cards; resolved state removes them everywhere. | Automatic material contract choice without an authored policy. | Contract cohort/shortage attention → Profile/Roster; no camera hijack. |
| 11 | College Football 26 — [Dynasty deep dive](https://www.ea.com/games/ea-sports-college-football/college-football-26/news/cfb26-campus-huddle-dynasty-deep-dive), Player Card → More → Stats → Awards | Individual stats, awards, transfer/history retained across seasons. | Career record outlives current selection/context. | Durable fact history linked from the person. | Sports-stat overload or trophy for every routine film. | Filmography, career events, and future honors remain reachable after employment. |
| 12 | College Football 27 — [Dynasty & Team Builder](https://www.ea.com/games/ea-sports-college-football/news/college-football-27-dynasty), CFB History | Season History and historical stats summarize years without keeping every action. | Long campaigns need compact snapshots and records. | Persist significant events; derive summaries. | Per-week human history logs. | Alumni profile derives only supported credits and summaries; material events, honors, and retirement date persist later. |
| 13 | Planet Zoo — [Staff & Guests player guide](https://www.planetzoogame.com/help-centre/player-guides/staff-and-guests), Zoo Management → Staff / Work Zones / Training | Manage assignment from roster or individual; training occurs on later staff-room visit. | Roster and person profile share authority; routine timing is autonomous. | Locate/inspect from either surface; training as intention/capacity. | Treating Actors/Writers as work-zone pawns or break-room clicking. | Adopt Profile↔Roster↔World. Training remains future authority. |
| 14 | Two Point Museum — [Staff quality-of-life update 2.0](https://www.twopointstudios.com/fr/node/2378), staff-list/MIA changes | Unavailable expedition staff grey out; exceptional missing staff enters inbox; traits explain effects. | Keep unavailable people visible and distinguish routine absence from exception. | Persistent row + explicit state + grouped exception. | Removing people from roster, color-only status, or one inbox item per employee. | Off-lot/unavailable Profile persists; Locate disabled with reason. |
| 15 | Two Point Hospital — [Staff screen anatomy, secondary](https://two-point-hospital.fandom.com/wiki/Staff), Staff List / Pay Review / Jobs | Role filters, controlled sortable columns, individual task/status. | A late-game staff surface needs role/contract/status filters. | Compact default columns and focused person detail. | Hunger/thirst/toilet/energy sliders, manual breaks, wage babysitting. | Seven-column Roster; human condition absent until authority. |
| 16 | *The Sims 4* — [EA update, 17 March 2026](https://www.ea.com/games/the-sims/the-sims-4/news/update-3-17-2026), autonomy behavior fixes | Autonomy needed cooldown/guardrails for unwanted social/object behavior. | Visible people can handle routine behavior, but autonomy needs presentation discipline. | Autonomous self-care/social flavor under clear authority. | Household free-will controls or direct needs as tycoon core. | Routine breaks/eating/socializing never become commands; severe future condition becomes a management decision. |
| 17 | NHL 27 — [Connected Franchise](https://www.ea.com/games/nhl/nhl-27/features/nhl-27-connected-franchise), [deep dive](https://www.ea.com/games/nhl/nhl-27/news/nhl-27-connected-franchise), [ratings](https://www.ea.com/games/nhl/ratings) | **Negative finding from pre-release official material, current 25 Aug 2026:** roster, cap, transactions, standings, stats, game boxes, and OVR ratings are documented; no in-franchise Power Rankings/prior-rank/reason UX is verified. | The clean separation among roster ability, standings/results, and an absent comparative momentum layer. | Keep ability, performance, reputation, and rank as different facts. | Claiming NHL 27 supplies a Power Rankings pattern or treating OVR as momentum. | Use NHL only as evidence not to conflate ratings with rankings. Recheck shipped UI if a future ranking campaign begins. |
| 18 | NBA 2K27 — [MyNBA](https://nba.2k.com/2k27/features/mynba/), “Free Agency Revamp & Improved Contracts” (latest announced title; pre-release official material on 25 Aug 2026) | Moratorium menu is a scrollable best-available depth chart. Daily recaps highlight major signings, league Power Rankings, and remaining talent; a separate final offseason summary names winners/losers. | The co-presentation of comparative rank, market events, remaining supply, and positional scarcity. | Put authored comparative rank beside relevant market context. | Claiming the page shows a formula, previous-rank arrow, per-row movement reason, categories, causal explanation, or in-season cadence; also reject its promises, relationship buffs, and XP Legacy loop. | **LATER ADAPT:** pair an authored rank snapshot with market context; Project: Studio separately requires TypeScript-authored movement reasons. P10A uses only shortage/roster principles. |
| 19 | NBA 2K26 — [King of the Court](https://nba.2k.com/en-GB/2k26/king-of-the-court/) (current playable title on the research date) | Event leaderboard ranks the explicit sum of four best Game Scores. | How an honest leaderboard names the sample and scoring law. | Disclose scoring law and cohort whenever rank is computed. | Calling an event-score leaderboard a franchise Power Ranking. | Positive transparent-score contrast; not a Hollywood momentum precedent. |
| 20 | College Football 26 — [Top 25 hub](https://www.ea.com/games/ea-sports-college-football/college-football-26/college-football-top-25-hub), [final regular-season poll](https://www.ea.com/games/ea-sports-college-football/college-football-26/news/college-football-26-top-25-ranking-final-regular-season), [Week 14](https://www.ea.com/games/ea-sports-college-football/college-football-26/news/college-football-26-top-25-ranking-week-14), and [end-of-year poll](https://www.ea.com/games/ea-sports-college-football/college-football-26/news/college-football-26-top-25-end-of-the-year) (strongest exact published movement precedent; CFB27 is latest) | The poll series shows rank plus OVR/key-win context, prior `Jump`, `UNR`, Dropped Out, `NC`, and Biggest Movers with concrete recent results. | How dated snapshots distinguish ability context, current rank, movement state, and explanatory recent results. | Rank is a dated comparative state with explicit prior position and reason facts. | `#6 → #3` without cohort/cadence/reasons, a UI-composed composite, or an inferred formula. | **LATER ADAPT:** TypeScript-authored Talent/Studio snapshots only after broader market/rivals. Current `standingPct` remains ability percentile, not rank. |

## Atlas ruling for Power Rankings

- NHL 27: **REJECT as a claimed Power Rankings precedent**; the official material does not establish it.
- NBA 2K27: **ADAPT later** for placing League Power Rankings inside a free-agency recap with relevant market context; do not infer unshown causality, formula, movement, or category behavior.
- NBA 2K26: **ADOPT only transparent leaderboard scoring as a general principle**; its verified event score has a different purpose.
- College Football 26: **ADAPT later** as the strongest exact published precedent for `current rank + previous rank + movement + reason facts + cadence + history`.
- Project: Studio now: **REJECT numeric talent/studio rankings**. No full market/rivals or rank read model exists.

## Deferred Power-Ranking data contract — not P10A

No schema is authorized by this annex, but a future ranking campaign must supply at least these TypeScript-owned facts before Fable displays `#N`:

| Required fact | Why |
|---|---|
| ranking kind and category | Distinguishes Actor, Director, Writer, Newcomer, genre, and future Studio ranking. |
| cohort definition / eligible count | A rank is meaningless without who was compared. |
| effective week/date and cadence | Separates periodic momentum from permanent reputation. |
| current rank and previous comparable rank | Supports honest movement; `new`, `unchanged`, and `dropped out` are explicit states. |
| movement | Derived/published by TypeScript from comparable snapshots, never by Unity. |
| 1–3 reason codes/facts | Explains movement using authoritative recent outcomes/context; presentation may localize, not invent causality. |
| source metric disclosure or authored-ranking identity | Prevents a mystery composite. If editorial/algorithmic, the owner and inputs are explicit. |
| stable subject ID | Joins person/studio Profile, history, and prior snapshots. |

Potential categories and gates:

| View | Earliest acceptable gate | Current ruling |
|---|---|---|
| Top Actors / Directors / Writers | Broader persistent talent market with comparable current people and authored ranking law | **DEFER** |
| Rising Stars / Newcomers | Authoritative cohort-entry date and minimum work/sample rule | **DEFER** |
| Genre ranking | Adequate comparable population plus discipline/genre performance history | **DEFER** |
| Studio Overall / Commercial / Critical / Audience / Awards | Rival studios and comparable authoritative result/standing facts | **DEFER** |

`Studio Standing = persistent reputation`; `Power Ranking = comparative current momentum`; `Studio History = durable legacy`. The future ranking read model references those facts but does not replace them.

---

# B. Existing-System Reuse Map

| Need | Exact current Project: Studio path/component/data | Reuse / Extend / Replace / Leave Alone | Why |
|---|---|---|---|
| Core identity | `src/core/types.ts:107–130` — `Talent` | **REUSE** | Stable ID, name, role, age, persona, Star Power field, salary basis, skills, ceilings, work ethic, genre experience, work history already persist. |
| Profession taxonomy | `src/core/types.ts:18` — `CreativeRole`; `:45–75` disciplines/skills | **EXTEND later** | Current authority is Actor/Director/Writer/Craft only. Do not overload it with decorative Crew/Extras/support. |
| Perceived/hidden split | `src/core/types.ts:77–104,119–123`; `ui/src/engine/adapter.ts:1296–1411,4170–4287` | **REUSE** | Adapter deliberately publishes perceived data and hides actual/ceilings. |
| OVR/tier | `src/core/talentSummary.ts:76–137` — `roleOVR`, `roleTier` | **REUSE** | Existing perceived discipline-specific craft summary; no client formula. |
| Estimated potential | `src/core/talentSummary.ts:441–500` | **REUSE** | Public noisy tier/range already respects hidden ceiling boundary. |
| Work ethic | `types.ts:122`; `talentSummary.ts:502–510`; `development.ts:41–44,73–128` | **REUSE** | Visible, decision-relevant development modifier with an existing label. |
| Genre specialty | `types.ts:100–104`; `talentSummary.ts:223–269`; `development.ts:142–160` | **REUSE** | Per-discipline/per-genre perceived truth and released-work growth already exist. |
| Career identity | `talentSummary.ts:513–560` — `careerIdentity`; adapter `:4225–4309` | **REUSE** | Existing `Proven` versus `Capable but unproven` law prevents fake credits. |
| Development | `src/core/development.ts`; invoked `src/core/tick.ts:751–834` | **REUSE / LEAVE ALONE** | Film-driven, discipline-specific, ceiling-respecting authority. No training loop. |
| Star Power | `Talent.fame`; `src/core/starPower.ts`; `tick.ts:789–827` | **REUSE, relabel UI** | Authority defines commercial recognition/drawing power. Player-facing term is Star Power. |
| Studio Standing | `types.ts:267–271`; `src/core/standing.ts` | **LEAVE ALONE** | Audience Awareness, Industry Prestige, Commercial Confidence; not person rank. |
| Contract | `types.ts:318–343`; `src/core/employment.ts:85–229` | **REUSE** | Salary/bonus/term/guarantee/status authority already exists. |
| Renewal | `employment.ts:157–161`; actions `src/core/actions.ts:2568–2608` | **REUSE / EXTEND presentation** | Legal final-12-week window and exact current quote/solvency are authored. |
| Early release | `src/core/actions.ts:2610–2641`; `terminationCost()` / current tuning | **REUSE** | Current authoritative termination quote/cost and screenplay-writer blocker exist. The baseline's 50% remaining-guarantee tuning is not permanent product law; do not hard-code it or invent social effects. |
| Contract expiry | `src/core/tick.ts:884–898` | **REUSE** | Final paid week then free-agent transition is authoritative. |
| Employment state | `src/core/employment.ts:311–333` — `employmentStatus()` | **REUSE** | Derived contracted/engaged freelancer/available freelancer/free agent/unavailable state. |
| Availability/assignment | `employment.ts:102–121` — `busyTalentIds`; adapter `:1323–1371` — `talentAssignmentContext` | **REUSE** | Exact screenplay/production binding; fails on ambiguity rather than guessing. |
| Career events | `types.ts:1501–1545`; `starPower.ts:173–208`; `tick.ts:768–836` | **REUSE** | Frozen per-film changes/reasons/history. |
| Frozen film participants | `types.ts:200–264` — optional `FilmParticipants` on `FilmResult` | **REUSE with provenance** | Captured on employment-engaged Greenlights and stable after later state changes; legacy/M0A results may have only limited attribution, so no universal complete filmography claim. |
| Career selectors/presentation | `ui/src/engine/careerImpact.ts:123–166`; `ui/src/components/CareerImpact.tsx` | **REUSE** | Existing read model never recomputes historical deltas. |
| Save/migration | `src/core/save.ts`, especially career validation `:2220–2246` and V4→V5 `:5878–5895` | **REUSE** | Versioned migration creates no fictional pre-V5 history. |
| Founding applicants | `beginFounding()` in `employment.ts`; adapter founding cards; `ui/src/screens/FoundingScreen.tsx` | **REUSE** | Package 01 applicant foundation is authoritative and already bounded. |
| Post-founding market | `employment.ts:250–309`; `ui/src/screens/HiringMarket.tsx` | **REUSE** | Existing contract/freelancer market; no facility-specific authority exists. |
| Talent supply | `src/core/worldgen.ts:437–530`; market sampling above | **LEAVE ALONE** | Finite generated population + rotating subsets; no arrival/rival/retirement law to present. |
| Browser capability profile model | `ui/src/engine/adapter.ts:4185–4287` — `TalentProfile` | **REUSE / EXTEND bridge** | Publishes all four discipline OVRs, estimated potential, genres, work ethic, assignment-availability boolean, and Star Power. It does not provide active-contract truth or a complete employment/off-lot state. |
| Employment detail | `ui/src/engine/adapter.ts:3682–3716` — `employmentInfo()` / `EmploymentInfo` | **REUSE / EXTEND bridge** | Supplies derived employment status and current contract/termination/renewal facts. P10A must join it to Profile by stable ID rather than reinterpret `TalentProfile.available`. |
| Browser profile UI | `ui/src/components/TalentProfileDrawer.tsx` | **REUSE behavior / ADAPT and extend content** | Reuse focus trap, Escape/opener restoration, visible-only history rendering, and modal boundaries. It does not currently render estimated potential, age, active contract/guarantee/renewal, career identity, or selectable non-primary genre disciplines; P10A combines multiple read models. |
| Talent Hub | `ui/src/screens/TalentHub.tsx` | **EXTEND later** | Full known-population research surface; not the employee roster. |
| Studio Roster | `ui/src/screens/StudioRoster.tsx`; adapter `rosterCards()` | **EXTEND** | Contracted-person filters/actions/profile exist; add scalable columns, availability/specialty, Locate, context retention. |
| Contract calendar | `src/core/studioCalendar.ts:95–107,147–186,523–548,723–761`; browser Calendar | **REUSE** | Grouped expiry clusters and roster link already prevent rediscovery. |
| Next-event contract attention | adapter `:2431–2653`; `ui/src/lot/snapshot/nextEvent.ts` | **EXTEND** | Existing renewal/expiry boundaries are authoritative; adapt into grouped human attention. |
| Browser world-person join | `ui/src/lot/snapshot/personWork.ts:69–250` | **REUSE** | Exact assignment projection fails closed on stale/malformed/duplicate/ambiguous data. |
| Browser regression proof | `ui/src/lot/NamedPersonWorkCareerInspectorV1.test.tsx` | **REUSE test intent** | Already proves world selection → work/career inspector behavior and failure states. |
| Older lot-person placement map | adapter `:6246–6446` | **REUSE carefully** | Production people join authoritative work; unclaimed contracted roster members explicitly have no task/facility and use a visual `personHome` fallback. It is not a professional-home or off-lot reason source. |
| Canonical semantic presence | `src/core/presence.ts`; projected by `ui/src/engine/adapter.ts:6014–6075` / `studioLotSnapshot()` | **REUSE** | Deterministic current-week site/beat presentation; state/RNG/save neutral; publishes claimed facility/site context without becoming outcome law. |
| Canonical presence bridge | `bridge/schema/bridge-schema.ts:245–274,446,474` — `StudioPresenceSnapshot` and `bridge/session.ts` join | **REUSE** | Presence already crosses the bridge. P10A extends profile/roster/Locate capability; it does not build a second presence channel. |
| Current shortage seams | adapter `:1516–1549`; `src/core/scriptReadModel.ts:413–430,664–672` | **EXTEND** | Exact role/writer scarcity exists; no general ordinary-staff model. |
| Sealed applicant bridge | `campaign/living-lot-ts:bridge/schema/bridge-schema.ts:434–500`; `bridge/session.ts:391–473` | **REUSE** | OVR, Star Power, potential, work ethic, specialty, ability percentile, contract and intent already cross the spine for founding. |
| Canonical bridge seam | `bridge/schema/bridge-schema.ts`; `bridge/session.ts`; `generated/unity/StudioBridgeDtos.Generated.cs` | **EXTEND** | P10A needs post-founding profile/roster/attention/Locate snapshots; TypeScript owns values. |
| Bridge stale-action guard | `bridge/session.ts:199–213,995–1016` — state-digest-bound intent IDs and `expectedStateRevision` | **REUSE / EXTEND available intents** | The bridge already rejects an intent not emitted for current state or a mismatched revision. P10A adds post-founding renew/release capability and quote intents; it does not invent a second stale-action protocol. |
| Current Unity source | No editable Unity/Fable client source is present on canonical main; Package 02 annex names external Unity presentation components | **LEAVE ALONE / use seam** | Do not prescribe nonexistent internals. Reuse the accepted Package 02 selection/camera/HUD grammar when Fable works in the Unity workspace. |
| Package 02 external Unity reference | Package 02 annex names `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs`, `SelectableEntity.cs`, `StudioHud.cs`, `StudioCameraDirector.cs`, and `TycoonCameraController.cs`; these paths are not present in canonical main or `campaign/living-lot-ts` | **REUSE accepted behavior, verify in Unity workspace** | Selection, Focus, Follow, camera, Back, and retained context have accepted grammar, but this repository cannot prove/edit those C# components. |
| Package 01 applicant dossier | `docs/design/CODEX-HIRING-CANDIDATE-REVIEW-UX-01.md` on `codex/world-first-interaction-research-01` | **REUSE visual language** | Portrait, OVR, Star Power, work ethic, genre, estimated potential, and contract hierarchy are already accepted. |
| Market ability percentile | adapter `:1966–1986` — `disciplineOVRPercentile`; founding rows `:3903–3989`; sealed bridge `standingPct` | **REUSE carefully / rename presentation** | Same-discipline perceived-OVR percentile only; not Fame/rank/Standing. |
| Talent/studio rankings | No rank read model, rival population, prior snapshots, movement, or reason projection | **DEFER** | Fable must not create leaderboards or a composite score. |
| Morale/relationships/training/retirement/awards/ordinary staff | No current authoritative models | **LEAVE ALONE / DEFER** | No placeholders or client-side simulations in P10A. |

## Browser behavior that already embodies Package 10

- `TalentProfileDrawer` already proves reusable Profile-shell behavior opened from multiple management contexts: visible-only data, career history, Escape closure, focus trap, and focus restoration. It is not yet the complete P10 Profile content contract.
- `StudioRoster` already owns exact contract consequences, renewal filters, and release confirmation.
- `talentAssignmentContext()` and `personWork.ts` already prove stale/duplicate/ambiguous joins must fail closed.
- `StudioCalendar` already groups exact contract dates/expiry clusters and deep-links to the roster. The proposed 52/26-week planning markers remain a new TypeScript projection, not existing Calendar law.
- `CareerImpact` already renders frozen per-film history without recomputation.

Fable should reproduce those behaviors in Unity presentation; it should not rebuild their formulas or legality.

---

# C. Person Inspector Anatomy

The selected-person inspector is the local answer, not a compressed full Profile. Use the accepted Project: Studio dark retained HUD/material system and Package 01 applicant-dossier portrait language. Do not introduce a white memo or a new sports-card art direction.

## C.1 Desktop geometry and hierarchy

- fixed context-card position governed by Package 02; do not chase the moving person with a large panel;
- target width **360–420 px** at 1280+ viewport; maximum height roughly **42%** of viewport with internal detail elided before scrolling;
- 20–24 px name; 14–16 px profession/status; body never below the current readable HUD floor (target 15–16 px at 100% UI scale);
- portrait **64–80 px** square/vertical crop;
- one status icon plus text; color is redundant;
- current-work block is the largest text after identity;
- maximum three compact fact rows before actions;
- actions minimum 44 px pointer/controller target, visible labels, consistent order.

Names, numbers, weeks, and project titles in these wireframes are illustrative field hierarchy only. TypeScript supplies every runtime value; none is content or balance authority.

```text
┌──────────────────────────────────────────┐
│ [PORTRAIT]  RAMON ASHLEY                 │
│             Actor · Contracted           │
│             Available / Working / Off lot│
├──────────────────────────────────────────┤
│ DOING NOW                                │
│ Rehearsing Night Harbor                  │
│ Bound for Stage 7 · Present              │
├──────────────────────────────────────────┤
│ Acting OVR 78   Comedy 82   ★ Power 41   │
│ Planning marker in 26 weeks*             │
├──────────────────────────────────────────┤
│ [Focus] [Follow]          [Open Profile] │
└──────────────────────────────────────────┘
```

Use `Star Power`, not a star icon alone; the icon can reinforce but never replace the label. Show no OVR row if the projection is stale/missing.

`*` The 52/26-week planning markers are proposed P10 TypeScript projections over exact contract end dates. Current law supplies the end date and final-12-week legal window; the current Calendar does not already own 52/26 warning states.

## C.2 State variants

| Person type/state | Identity line | Primary local content | Actions | Deliberately absent |
|---|---|---|---|---|
| Founding applicant | Name · Applicant for Actor/Director/Writer/Craft | top role OVR/tier, top specialty, availability/offer state, one concern | Focus, Profile/Dossier, Compare where Package 01 supports | active-contract action, career claim, `Star` label; no claim that Gate supply is the post-founding market |
| Newly hired employee | Name · profession · Contracted | `Available` or first authoritative assignment; contract start/decision horizon if important | Focus/Follow when present, Profile | invented onboarding/training/morale |
| Actor | Name · Actor · employment state | current film/role/production phase or Available; acting OVR, top specialty, Star Power | Focus, Follow, Profile | casting fit outside a project, hidden performance |
| Director | Name · Director · employment state | current production/script context; directing OVR/specialty/Star Power | Focus, Follow, Profile | actor-style fit or director effect not published |
| Writer | Name · Writer · employment state | screenplay title/phase and availability; writing OVR/specialty | Focus, Follow, Profile | physical proximity as assignment, fake ETA |
| Craft | Name · Craft · employment state | production/title/authoritative function label, craft OVR/specialty | Focus, Follow, Profile | invented job department (editor, cinematographer, etc.) |
| Person with high Star Power | Same profession; optional future `Star` badge only if TypeScript publishes it | Star Power remains separate from OVR/current work | Same actions | never infer `Star` from a client threshold |
| Unavailable/off-lot | Name · profession · exact employment state | authoritative reason/current engagement if known; `No current lot anchor` | Profile; Locate disabled with reason | Follow/Focus, guessed destination |
| Stale/ambiguous | Last safe identity if known | `Person status changed` / `Assignment data conflict`; Refresh/Reopen | Back, Refresh | all material contract/assignment actions |
| Retired historical person (future) | Name · profession · Retired/Alumni | retirement date, tenure, top factual history link | Profile/History | Focus, Follow, Locate, current availability |
| Decorative extra | No managed-person inspector | optional ambient cursor/short flavor only | none | name, OVR, contract, profile, employee semantic target |

## C.3 World selection treatment

Package 02 remains binding:

- hover: restrained rim/ground feedback and compact name/profession/activity label after accepted delay;
- single click: persistent color-independent selection treatment, card opens, camera does not move;
- double-click: Focus under Package 02 transition timing, never opens Profile or commits an action;
- Follow: explicit only, exits on Back/Escape or lost anchor;
- switching person: replaces selection/card in place without closing the world or moving camera;
- selection never assigns, hires, renews, releases, or starts training.

## C.4 Lost anchor

When a selected person leaves the presented lot:

- selection identity persists;
- world outline/marker disappears cleanly;
- inspector switches to `Off lot` / authoritative reason and keeps Profile;
- Follow stops without snapping elsewhere;
- Focus/Locate disable with `No current world location`;
- Back closes the inspector as normal.

---

# D. Full Person Profile Anatomy

## D.1 Responsive allocation

### Wide desktop (≥ 1280 px)

- retained lot: **32–40%** of width;
- Profile workspace: **60–68%**, maximum readable content width around 960 px;
- lot camera and person selection remain mounted and unchanged;
- workspace has its own scroll; wheel/touch over it cannot move the world;
- header/back action remains visible.

### Medium desktop/tablet (900–1279 px)

- Profile: **72–82%**; a narrow lot/context strip remains when readable;
- cards collapse to one or two columns;
- no text below the accessible floor.

### Narrow (< 900 px or text scale demands)

- full-width retained page/bottom-sheet state;
- fixed identity header + Back;
- single-column sections;
- returning restores exact lot camera/selection or exact Roster row/filter/scroll.

## D.2 Wireframe

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ ‹ Back to lot / Roster                                      [More actions]│
├────────────────────────────────────────────────────────────────────────────┤
│ [PORTRAIT 160]  RAMON ASHLEY                         ACTING OVR             │
│                 Actor · Contracted                       78 · Strong        │
│                 Actor / Director (credited identity)                       │
│                 Available · Star Power 41                                 │
├────────────────────────────────────────────────────────────────────────────┤
│ CURRENT WORK                         │ CREATIVE SNAPSHOT                    │
│ Night Harbor · Lead                  │ Comedy 82 · Romance 68               │
│ Rehearsing · Stage 7                 │ Est. potential 80–87                 │
│ Present / Bound for Stage 7          │ Work ethic: Consistent               │
│ [Locate] [Open production]           │ [All role proficiencies]             │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ CONTRACT                             │ AVAILABILITY / ATTENTION             │
│ Through Week 208                     │ Assigned until authoritative state   │
│ $X annual · $Y guaranteed remains    │ Planning marker in 26 weeks*         │
│ Renewal not yet open                 │ No blocker                           │
│ [Review contract]                    │                                      │
├────────────────────────────────────────────────────────────────────────────┤
│ ROLE PROFICIENCIES                                                        │
│ Acting 78 Proven · Directing 66 Capable but unproven · Writing …          │
├────────────────────────────────────────────────────────────────────────────┤
│ GENRE EXPERIENCE [Acting ▼]                                               │
│ Comedy 82 · Romance 68 · Action 54 · Horror 31 · Sci-Fi 29                │
├────────────────────────────────────────────────────────────────────────────┤
│ CAREER HISTORY                                                            │
│ 1923  Night Harbor · Acting · OVR +1 · Star Power +4   [Open Film Result] │
│ …                                                                          │
└────────────────────────────────────────────────────────────────────────────┘
```

## D.3 Information rules

### Header

- portrait uses current era-aware portrait provider/placeholder; no sports-card frame;
- name is the strongest text;
- home profession and credited career identity are distinct;
- primary discipline and OVR are large but include label/tier;
- Star Power sits beside—not inside—OVR;
- employment/availability is text plus icon.

### Current work

- exact assignment kind, project title, credited/assigned role where published;
- phase and authoritative building/stage/destination/presence;
- `Locate` only when a valid semantic world target exists;
- `Open Development/Casting/Production` only when a current deep route exists;
- ambiguous join suppresses all action except Refresh/Back.
- `TalentProfile.available` means no current screenplay/production assignment only; P10A separately joins `employmentInfo().status` and an explicit world-locate capability. Never treat the boolean as a complete employment or off-lot reason.

### Creative snapshot

- top two perceived genres from the primary discipline;
- estimated-potential range/tier with `Est.`;
- work ethic label and plain effect;
- do not show hidden skills/ceiling/person seed;
- persona/temperament is below fold unless directly relevant.

### Contract

- basis labels are explicit: annual salary versus freelancer/per-film fee;
- current active contract terms come from the contract read model, not `Talent.salary` alone;
- warning horizon and legal action state are distinct;
- actions open a consequence sheet; none mutate inline.

### Role proficiencies

- all four current disciplines may appear because current authority supports cross-role evaluation;
- each row shows OVR/tier plus `Primary`, `Proven`, or `Capable but unproven`;
- no radar chart;
- sorting/casting never changes the person's credited identity.

### Genre experience

- one chosen discipline at a time;
- fixed genre row order consistent with Package 04;
- bar/value uses perceived only;
- `Top specialty` is a presentation summary, not a stored archetype.

### Career history

- use frozen `CareerImpactCard` facts and FilmResult links;
- show old-save notice when detailed events begin only at SaveFileV5;
- empty state says `No recorded career events yet`;
- no generated prose or unsupported `breakout/decline` label.

## D.4 Profile variants

- **Applicant:** reuse accepted dossier hierarchy; proposed contract and comparison actions replace active-contract/history emphasis.
- **Employee:** all sections as available.
- **Freelancer/free agent:** employment relationship and current engagement replace active contract; offer action uses current market projection.
- **Unavailable:** profile remains readable; Locate/assignment actions fail closed.
- **Retired/alumni future:** current work and contract become retirement/tenure/available credited history/honors with provenance; no live actions.
- **Old save:** facts that exist appear; missing career deltas receive one provenance notice, never zero/fake values.

---

# E. Roster Anatomy

## E.1 Workspace header

```text
STUDIO ROSTER                         14 contracted · 2 engaged freelancers
[Search people…]  [Profession ▾] [Availability ▾] [Contract ▾] [Attention]
Sort: Contract decision ↑                                      [Hiring Market]
```

The counts above illustrate the **target combined management surface**. Current `rosterCards()` / `StudioRoster` contains contracted Talent only; engaged-freelancer rows and their counts are BUILD NEXT from existing employment authority, not current Roster reuse.

Header may show one grouped attention summary:

> `4 contract decisions approach · earliest legal action Week 197`

Clicking it applies the relevant filter; it does not open four dialogs.

## E.2 Default columns

| Column | Width priority | Required content | Sort |
|---|---:|---|---|
| Person | high | 48–56 px portrait, exact name, profession/career identity | name/profession |
| OVR | medium | selected/primary discipline label, value, tier | exact displayed discipline OVR |
| Specialty | medium | top perceived genre or neutral honest fallback | genre value where available |
| Current work | high | project/task or Available | status/project |
| Availability | medium | text/icon, not color only | defined status order |
| Contract | high | end/decision horizon; exact relationship type | end week/attention |
| Attention | medium | single highest reason | tier/date |

Star Power is available as an optional sort/compact secondary line, not a default standalone column if width would squeeze current work/contract. Potential is profile depth and an optional Recruitment/Talent view, not the default employee roster column.

## E.3 Row interaction

- row single activation opens Profile without losing roster state;
- dedicated **Locate** is available only with a valid world target;
- Locate closes/reduces workspace, selects exact stable ID, and Focuses only if the player explicitly chose Locate under Package 02;
- Back returns to exact filter/sort/search/scroll/row;
- overflow contains `Review renewal`, `Review release`, or offer routes only when authoritative/legal;
- no inline destructive icon without text/consequence.

## E.4 Filters

Required P10A filters:

- employment: contracted / engaged freelancer / all current studio people;
- profession;
- available / working / unavailable / conflicted;
- contract: planning horizon / renewal open / expiring;
- attention only;
- search name.

Follow-up filters only when existing data can support them without confusion: genre specialty, Star Power band, credited discipline. Future alumni is a separate historical roster filter, never mixed into active headcount by default.

## E.5 Empty/error states

- `No contracted people match these filters` + **Clear filters**;
- `No current world location` disables Locate but preserves Profile;
- stale row refreshes in place by ID; if ID no longer exists, remove it and show one non-blocking state-change notice;
- decorative people never appear;
- unknown profession enum fails closed to a readable `Unknown role` diagnostic in development builds, not a fabricated Actor label.

---

# F. Contract Attention Anatomy

## F.1 Grouped attention card

```text
CONTRACTS APPROACHING DECISION                         ATTENTION
4 founding contracts enter their legal window in 14 weeks
Actor 2 · Writer 1 · Craft 1
Current roster obligation: authoritative summary where published
[Open filtered Roster]                          [View Calendar]
```

This planning card is a proposed P10 projection over existing contract dates. Current law already knows when the final-12-week legal window opens; earlier grouped warnings are new presentation/read-model work.

The card must distinguish:

- **planning warning:** action not yet legal;
- **renewal open:** current quote can be reviewed/submitted;
- **expiry:** person transitioned under current law;
- **stale quote:** refresh required.

## F.2 Person renewal sheet

```text
REVIEW RENEWAL — RAMON ASHLEY
Current contract       Through Week 208 · $X annual
Proposed contract      N weeks · $Y annual · $Z signing bonus
Immediate cash         $A → $B
Guaranteed obligation  $C total
Availability           Current assignment unchanged
Decision window        Open now · expires Week 208

[Cancel]                               [Renew Ramon Ashley]
```

Show only terms the authoritative quote publishes. Do not invent market interest, loyalty, agent demands, morale effect, or counteroffer.

## F.3 Early-release sheet

```text
RELEASE RAMON ASHLEY FROM CONTRACT
Current work           Writing Night Harbor / Available
Immediate cost         $X (authoritative remaining-guarantee rule)
Contract ends          Now, if accepted
Resulting state        Free agent / exact published state
Operational impact     Exact published blocker or “No authored impact summary”

[Keep contract]                    [Release Ramon Ashley]
```

If TypeScript refuses, retain the sheet and show the exact blocker. Never transform a generic error string into rules.

---

# G. Human-State Attention Anatomy

P10A human-state attention is bounded to real authority.

| Authoritative family | Compact text | Detail | Remedy/deep route |
|---|---|---|---|
| Person assigned/working | `<name> — <task/project>` | assignment kind, title, availability | Profile / project workspace / Locate if world anchor |
| Person unavailable | `<name> unavailable` | exact employment/engagement reason if published | Profile; Hiring/alternative route where relevant |
| Assignment conflict | `<project> cannot use <name>` | existing assignment and blocked role | Open current assignment / candidate list |
| Contract planning | `<N> contracts approach decision` | cohort and earliest legal date | filtered Roster / Calendar |
| Renewal open | `<N> renewals open` | exact people and quotes on review | filtered Roster / Profile consequence |
| Contract expired | `<name>'s contract ended` | resulting free-agent state and current role coverage if published | Profile / Hiring / Roster |
| Staff shortage | `<workflow> needs <profession/capacity>` | exact cause and consequence | prefiltered Hiring/Roster/project |
| Stale person/action | `Person state changed` | refresh current source; no speculative cause | Refresh / Back |
| Morale/stress/relationship/training/retirement | **No P10A state** | no placeholder | none |

The highest active reason occupies the roster attention cell; all current reasons remain in Profile. Resolving state elsewhere clears the card automatically. Time never auto-pauses merely because a Profile or Roster is open; only existing authoritative event/clock law applies.

---

# H. Automation Matrix

This matrix defines the intended management burden and is architecture-relevant now. `Future` means no P10A control or placeholder.

| Human activity | Default owner | Player input | Attention condition | P10A implementation law |
|---|---|---|---|---|
| World selection/Profile/Locate | Player | explicit inspect/navigation | none | **Manual.** Safe, reversible, no mutation. |
| Hiring/applicant decision | Player | compare and explicit current offer | exact shortage or chosen recruitment | **Manual commitment.** Reuse current market/dossier; no auto-hire. |
| Contract renewal | Player | explicit quote review/confirm | grouped warning; legal window | **Manual material decision.** No silent renewal. |
| Early release/firing | Player | explicit consequence/confirm | player initiated only | **Manual destructive decision.** Exact current action. |
| Principal film/craft assignment | Player through Package 04/production law | explicit role/package selection | exact vacancy/conflict | **Manual where current workflow requires.** No world-position inference. |
| Routine ordinary Crew/Extra deployment | TypeScript future/default | optional future policy/override | shortage only | **Autonomous principle.** Not currently modeled; build nothing. |
| Screenplay/production attendance | TypeScript presence projection | none | exact authoritative absence/blocker only | **Autonomous presentation.** Unity never decides assignment. |
| Routine professional work | TypeScript time/project state | advance existing Living Time | milestone/blocker | **Autonomous.** Never per-week Continue buttons. |
| Eating/drinking/restroom | Character presentation only | none | never routine | **Reject commands.** No needs authority. |
| Rest/breaks | Future autonomy | future policy only | severe future condition | **No P10A state.** |
| Casual social behavior | Ambient presentation | none | never routine | **Flavor only.** No relationship truth. |
| Morale/welfare recovery | Future autonomy/policy | future organization decision | serious future condition | **No P10A state.** |
| Training execution | Future TypeScript | future durable focus once | capacity/milestone | **No P10A state.** Never fake progress. |
| Career development | TypeScript release pipeline | choose meaningful credited work | frozen result/development fact | **Autonomous authoritative outcome.** Display history only. |
| World movement | Presentation from authority | optional camera Follow only | lost anchor | **Autonomous body.** Player does not pathfind staff. |
| Staff shortage allocation | TypeScript current project law | choose hire/reassign/project remedy | exact workflow blocked | **Exception management.** No generic one-person alert. |
| Contract planning | Current TypeScript dates + proposed P10 warning projection | review filtered cohort | proposed 52/26 planning markers; exact final-12-week legal law | **Grouped policy view.** Warning is not legal action. |
| Person availability | TypeScript assignment/employment | choose another person or wait | blocks selected workflow | **Exception management.** Never derive from location. |
| Retirement | Future TypeScript | future succession/acknowledgment | material career event | **Future.** Historical identity persists. |
| Death | None | none | none | **Reject until Owner decision.** |
| Talent/studio ranking | Future TypeScript market/rivals | choose category/filter only | periodic published snapshot | **No P10A rank.** Client presents, never composes. |

---

# I. Person History / Legacy Matrix

| Fact | Persist / Derive / Summarize / Discard | Current authority | Legacy value / implementation note |
|---|---|---|---|
| Person ID | **Persist** | `Talent.id` | Immutable join key; never recycle. |
| Name/authored identity | **Persist** | `Talent` | Required for films, honors, alumni. |
| Home profession | **Persist** | `Talent.role` | Current identity; do not overwrite when cross-role credits occur. |
| Credited career identity | **Derive with provenance** | `careerIdentity()` reads current cumulative `Talent.workHistory` counters; frozen `FilmResult.participants`/career events exist only where recorded | Use current proved-discipline identity, but do not imply every counter has a complete per-film ledger. |
| Current perceived skills/OVR | **Persist state / derive display** | `Talent.skills`, `roleOVR()` | Current profile; no weekly snapshots. |
| Hidden skills/ceilings | **Persist authority, never publish** | core/save | Simulation only. |
| Estimated potential | **Derive** | `expectedPotentialRange()` | Current assessment; not historical guarantee. |
| Work ethic/persona | **Persist** | `Talent` | Stable/current authority; historical changes absent. |
| Genre experience | **Persist current** | `Talent.genreExperience` | Current specialty; material deltas may be frozen in career events. |
| Star Power current | **Persist** | `Talent.fame` | Current commercial recognition. |
| Star Power peak | **Derive when event history complete; summarize on future retirement** | career events V5+ | Label old-save incompleteness. |
| Employment status | **Derive current** | contracts/assignments/markets | Never persist duplicate status. |
| Active contract | **Persist** | contract save V3+ | Operational. |
| Full contract/salary history | **Summarize future material events** | not retained today | Do not store payroll weeks; first/major/final contract may matter. |
| Hire date / studio tenure | **Needs future durable event** | current earliest contract is an unsafe proxy | High Legacy value; do not fabricate for old saves. |
| Film participants/credits | **Persist where captured** | Optional `FilmResult.participants` on employment-engaged Greenlights | Essential forward career record; legacy/M0A attribution is partial. |
| Filmography | **Derive available credits with provenance** | Frozen participants/career events; limited legacy fields such as Director | Search/profile output; never fabricate missing cast/writer/craft credits. |
| Per-film career changes | **Persist** | `TalentCareerEvent` V5+ | Compact causal history. |
| Pre-V5 change details | **Discard as unknowable / show provenance** | absent by design | Never backfill invented deltas. |
| Awards/honors | **Persist future** | not current person authority | Package 08/Legacy essential. |
| Retirement date/status | **Persist future event** | absent | Essential active→alumni transition. |
| Death | **Discard / nonexistent** | absent | Owner decision before schema. |
| Weekly assignment/location | **Discard** | current projection | Only current state matters; no 120-year log. |
| Routine attendance animations | **Discard** | presentation | Save-neutral. |
| Routine welfare/social state | **Discard or summarize only material future event** | absent | Never log every need tick. |
| Significant relationship/collaboration | **Persist authored milestones later** | absent | Avoid pairwise per-week logs. |
| Portrait asset identity | **Persist or deterministically resolve** | presentation seam | Must survive alumni links and era changes without gameplay effect. |

## Old-save law

- Save migration preserves known Talent, contracts, credits, and career events.
- V4→V5 remains intentionally empty for missing detailed history.
- A future retirement/history migration may mark `historical detail unavailable`; it must not infer a date from absence.
- FilmResult links use immutable person ID where frozen participants/career events exist. A legacy result without that join exposes only its supported attribution and provenance; it does not promise an alumni Profile resolver.

---

# J. State / Edge-Case Matrix

| State / edge case | Visible treatment | Allowed commands | Forbidden / fail-closed behavior | Camera + selection | Back / Escape |
|---|---|---|---|---|---|
| Newly hired | selected inspector/Profile shows `Contracted`, current terms, Available or first assignment | Focus/Follow if present, Profile, Locate, contract review | no automatic training/assignment/Star badge | no automatic movement; exact ID selected | closes top surface; selection persists |
| Idle/available | local card says `Available`; Profile current-work empty state | Profile, Focus/Follow/Locate if present | do not call bored/unproductive or create work | stationary camera; identity persists | exits Follow/card/profile one layer at a time |
| Assigned | title, assignment kind, role, authoritative destination/presence | Profile, project deep route, Locate | no reassignment by selection; no fit inference | no auto-focus | returns exact origin |
| Working | activity/phase and availability `Working` | inspect, Profile, Follow, project route | no Continue/accelerate person button | Follow explicit only | Escape exits Follow first, then surface |
| Unavailable/off-lot | row/Profile remains; `No current lot anchor` and exact reason when published | Profile, relevant assignment/Hiring route | Focus/Follow/Locate disabled; no guessed location | selection identity may persist without marker | closes normally; origin restored |
| Contract near expiry (proposed warning) | grouped P10 52/26 planning marker + exact row horizon | filtered Roster, Calendar, Profile | renewal button disabled with `opens in N`; no fake quote | no movement | returns exact cohort/filter |
| Renewal open | grouped decision attention; exact current quote in consequence sheet | Review/confirm/cancel | no inline/silent renewal; stale quote fails | no movement; row/person remains selected | cancels sheet without mutation |
| Contract expired | person becomes free agent under current law; roster relationship updates; one consequence attention | Profile, Hiring/offer where current market allows | do not delete history or claim defection/morale | no camera movement; world body may lose roster presence | returns to prior surface; stale row refreshes |
| Freelancer available | employment badge and current market/fee truth | Profile, Review engagement/offer where legal | no employee benefits/contract fields fabricated | Locate only with valid presence | cancels offer/profile |
| Engaged freelancer | current project and busy state | Profile/project route | cannot assign concurrently; no contract label | exact assignment presence only | returns exact source |
| Free agent | historical/current Profile persists; current market state | Review offer if legal | no employee `Locate` unless world target exists | no camera unless explicit valid Locate | normal |
| Conflicting assignment | prominent blocker with both exact contexts if published | open current assignment, choose another candidate, Refresh | no material action using ambiguous person | no focus travel; selection stays on conflict | returns without mutation |
| Training | **No current state** | none | no animation/bar/action | none | n/a |
| Future retired/alumni | historical profile/available credited history/honors with provenance; no active status | open supported films/history | no contract/assignment/Locate/Follow; no fabricated legacy credits | no live anchor | returns to Film Chronicle/History/Roster |
| Person leaves active lot while selected | marker fades; card switches to off-lot state; Profile stays | Profile, assignment route | Follow/Focus disabled; no snap to another body | camera stops; stable ID remains selected | closes surface/clears selection by normal grammar |
| Save/load | current person ID, authoritative state, active selection when presentation state is restorable | normal current commands | no replayed hire/development/attention event | restore camera/selection where Package 02 allows; otherwise safe Home | normal |
| Reconnect | loading/sync state then exact current projection | Refresh/Back; commands only after current version | no stale contract/assignment submission | no camera motion on sync | closes to retained origin/lot |
| Old save missing career detail | Profile shows only supported frozen/legacy attribution and one V5 provenance notice | open known supported FilmResults | do not synthesize missing participants, zero deltas, or fake milestones | normal | normal |
| Decorative extra selected area | decorative content gets no managed-person outline/card; overlapping managed target wins | cycle valid semantic targets | no profile/contract/name claim | camera unchanged | clears hover/cycle |
| Person linked from FilmResult | frozen participant identity resolves current/historical Profile where present; limited legacy IDs expose only supported fallback | open supported record/Profile | no invented participant join, live status, or current OVR | no auto-Locate | returns to exact film record |
| Unknown/destroyed person ID | one safe `Person no longer available` state; remove invalid current row | Refresh/Back | no reuse of another identity, no action | clear marker; keep camera | returns/clears selection |
| Ambiguous duplicate ID | development diagnostic + player-safe `Person data conflict` | Refresh/Back | no Profile values/material actions | no movement; fail closed | returns safely |
| State changes while Profile open | current-state sections refresh by version; frozen history stays frozen; transient notice | current legal commands after refresh | no quietly applied old quote/action | camera/selection remain | returns exact current origin |
| State changes while Roster filtered | row updates/moves according to filter; one retained state-change notice | change filters, Profile current result | do not keep a ghost actionable row | camera unchanged | returns exact origin |
| Modal consequence sheet | background Profile/Roster inert; consequence and current target explicit | confirm/cancel, accessible focus cycle | selection/focus/row actions behind sheet | camera unchanged | closes sheet first, no mutation |
| Narrow viewport | full-width Profile/cards; identity and primary action fixed/readable | keyboard/controller focus, Back | no squeezed world, hidden contract consequence, horizontal stat maze | world retained offscreen | restores world/roster exact context |
| Reduced motion | instant/short dissolve selection and workspace transitions; no camera flourish | all commands | no forced follow/cinematic motion | Focus uses reduced transition or instant framed move per setting | same hierarchy |
| Controller/keyboard | semantic target cycle; roster row focus; explicit Profile/Locate/Back | cycle previous/next, confirm safe inspect, named shortcuts | no hover-only facts; no destructive default focus | Focus/Follow explicit | B/Escape unwinds one layer |

## Stale intent acceptance law

Current core contract actions carry person ID (and renewal term) and revalidate law at execution. The bridge already adds two stale guards: an opaque intent ID bound to the emitted state digest and `expectedStateRevision`. P10A must reuse those guards and extend current `availableIntents` so renew/release capabilities and displayed quote facts originate in the current snapshot. Add a quote-specific token only if future contract law needs protection finer than the whole-snapshot revision. On refusal:

1. no mutation and no success animation;
2. refresh the exact person/current quote;
3. retain Profile/Roster origin and selection when the ID still exists;
4. show the authoritative reason in the consequence surface; and
5. allow a fresh explicit decision—never auto-resubmit.

---

# K. Golden UX Journeys

These journeys are the acceptance contract. Automate projection/state/navigation assertions where feasible; prove camera/readability/presentation manually in the target Unity build.

| # | Journey and exact steps | PASS criterion |
|---:|---|---|
| 1 | **Click current employee.** At medium/close scale, single-click an authoritative hired Actor. | Exactly that stable person ID selects; color-independent world treatment and compact inspector appear; name, Actor, current work/availability, and one status are correct; camera does not move; no action mutates. |
| 2 | **Focus person.** From selected inspector, double-click the same person or choose **Focus** according to Package 02. | Camera frames the same stable ID through the accepted transition; Profile does not open; selection persists; reduced-motion path works; no Follow starts. |
| 3 | **Open full Profile.** Choose **Open Profile** from the inspector. | Retained Profile opens with same ID; lot remains mounted on wide desktop; perceived-only OVR/Potential/genres/work ethic/Star Power, exact current assignment, and contract are consistent with TypeScript; camera does not move. |
| 4 | **Return exactly to world.** Scroll Profile, then Back/Escape. | Profile closes one layer; original camera, selected person, inspector, and world state remain; focus returns to the opener; no click leaks into the lot. |
| 5 | **Locate from Roster.** Open Roster, apply profession and availability filters, scroll, choose **Locate** for a world-present Writer. | Workspace preserves filter/sort/search/scroll/row as Back origin; exact Writer ID selects and frames only because Locate was explicit; Back returns to identical list state. |
| 6 | **Inspect career history.** Open an employee with V5+ career events and select history rows/Film Result links. | Rows use frozen event/participant facts, show exact film/discipline/deltas/reasons, and link to the correct Film Result; reopening later does not recompute against current OVR. |
| 7 | **Inspect genre specialty.** Open an Actor with different experience across genres and a second discipline. | Above fold shows primary-discipline top specialties; detail selector changes discipline without mixing values; all numbers are perceived; no one-label typecast claim appears. |
| 8 | **Inspect contract.** Open a contracted person outside the legal renewal window. | End, annual salary basis, guarantee/obligation, and `Renewal opens in N` match authority; no actionable renewal is offered; market/per-film salary is not mislabeled as active annual salary. |
| 9 | **Contract attention.** Using the proposed P10 warning projection, advance to planning and then legal renewal-window states through authoritative time/test fixtures. | Warning is grouped and explicitly non-legal; legal state produces grouped decision attention and current quotes; opening one person retains cohort context; cancel mutates nothing; no camera movement. |
| 10 | **Current assignment conflict.** From Casting/another project, inspect a person already writing or on a production. | Candidate/Profile/Roster all show the same busy context; conflicting action is refused or absent; UI links to current assignment/alternative candidate; physical proximity cannot override it. |
| 11 | **Staff shortage → hiring route.** Trigger an existing authoritative role/writer shortage and select its attention. | Attention names blocked workflow, exact profession/cause/consequence, and opens the existing Hiring/Roster surface prefiltered where supported; no generic `Not enough staff`; no new candidate supply is generated. |
| 12 | **Person becomes unavailable.** Keep a Profile open while authoritative state changes from available to engaged/unavailable. | Current-work/availability sections refresh by version; material actions update/disable; frozen history remains unchanged; selected ID and camera persist; no fabricated reason appears. |
| 13 | **Retired person remains accessible (future seam fixture).** Resolve an authored retirement record in a future-compatible test/read model and open the person from a Film Result with frozen participant identity. | Same immutable ID resolves historical Profile; available credited history/honors/retirement fact remain; live Focus/Follow/Locate/contract actions are absent. A legacy result without participant join shows limited provenance instead. Until retirement authority exists, this remains a contract test, not P10A production behavior. |
| 14 | **Save/reconnect preserves identity.** Save with a world-present selected person/Profile context; reload or reconnect after current authoritative assignment remains/changes. | Same person ID and current truth restore safely; presentation state restores only where allowed; no hire/development/contract animation replays; stale state refreshes; no duplicate body/row. |
| 15 | **Decorative extra never masquerades as staff.** Click/cycle over an ambient extra overlapping a managed Actor. | Semantic priority selects/cycles the managed Actor; decorative extra has no employee outline, name, OVR, contract, Profile, Roster row, or stable staff claim. |
| 16 | **Multi-person Roster readability.** Populate a large contracted roster, apply 200% text scaling/narrow layout, sort by contract then profession, and navigate by keyboard/controller. | Default facts remain readable; no 30-column/horizontal maze; selected row and focus are visible without color; Profile/Locate/Back work; performance remains acceptable to project target; no hover-only data. |
| 17 | **Stale contract intent fails closed.** Open a current renewal/release sheet, mutate authoritative contract/assignment through another current client/test fixture, then submit old intent. | No mutation/success cue; current person/quote refreshes; authoritative refusal appears; Profile/Roster context persists; player must explicitly submit a fresh intent. |
| 18 | **No fabricated ranking.** Inspect applicant dossier, employee Profile, Roster, Standing, and any list sort. | `standingPct` is labeled as market-relative ability percentile/tier only; no `#N Actor`, `Power Rank`, composite Rank Score, rival comparison, or Star badge appears; Studio Standing remains its three separate channels. |

## P10A hostile-review acceptance summary

P10A passes only when all are true:

- one person ID joins world, inspector, Profile, Roster, contract, assignment, and supported career history, with provenance limits visible for legacy records;
- only perceived/public data crosses the bridge;
- every material action is explicit, current, authoritative, and stale-safe;
- Back restores exact lot or Roster context;
- decorative people cannot enter the managed-person graph;
- off-lot/stale/ambiguous states fail closed;
- contract attention groups rather than spams;
- no client-side people simulation or ranking exists; and
- UI remains readable at narrow width, keyboard/controller navigation, text scaling, and reduced motion.

---

# L. Fable Implementation Map

## REUSE

- `src/core/types.ts` — `Talent`, current professions, perceived/actual skill split, contract and career-event types.
- `src/core/talentSummary.ts` — `roleOVR`, tier, estimated-potential range, genre experience, work ethic labels, `careerIdentity`.
- `src/core/development.ts`, `src/core/starPower.ts`, and release pipeline in `src/core/tick.ts` — development/Star Power/career changes.
- `src/core/employment.ts` — current employment status, availability, contract, renewal, free-agent and rotating-market law.
- `src/core/actions.ts` — current offer/renew/release legality and consequences.
- `src/core/studioCalendar.ts` — exact contract dates and grouped expiry clusters; P10A warning horizons are a proposed projection.
- `src/core/save.ts` — versioned Talent/contract/career persistence and non-fictional migration.
- `ui/src/engine/adapter.ts` — `TalentProfile`, `EmploymentInfo`, assignment context, market ability percentile, roster and world-presence read models.
- `ui/src/engine/careerImpact.ts` and `ui/src/components/CareerImpact.tsx` — frozen career history.
- `ui/src/components/TalentProfileDrawer.tsx` — reusable Profile shell, visible-only history behavior, focus trap, and Escape/opener restoration; it is not the complete P10 profile.
- `ui/src/screens/StudioRoster.tsx`, `TalentHub.tsx`, `HiringMarket.tsx`, and Studio Calendar — existing management surfaces and exact actions.
- `ui/src/lot/snapshot/personWork.ts` and `NamedPersonWorkCareerInspectorV1.test.tsx` — exact person/world join and fail-closed regression intent.
- `src/core/presence.ts`, `ui/src/engine/adapter.ts:6014–6075`, `bridge/schema/bridge-schema.ts:245–274,446,474`, and `bridge/session.ts` — canonical presentation-only semantic-presence seam and bridge join.
- accepted Package 01 applicant dossier and Package 02 selection/Focus/Follow/Back grammar.

## BUILD NEXT — P10A

1. A TypeScript-owned post-founding **Person Profile projection** that joins current `TalentProfile`, `EmploymentInfo`, assignment context, semantic presence, and supported career-history references by stable ID; it contains only public/perceived fields plus explicit `canLocate`/absence reason and projection/version identity.
2. A concise TypeScript-owned **Roster Row projection** containing stable ID, portrait identity key, profession/career identity, displayed discipline/OVR, top specialty, current work, availability, contract horizon, one highest attention reason, and current action/Locate capability.
3. A grouped **Contract Attention projection** reusing Calendar/legal-window truth; warning and legal states must be distinct.
4. Bridge schema/session/generated DTO extension for those projections plus post-founding renew/release `availableIntents`; reuse the existing opaque current intent ID and `expectedStateRevision`. Add no second stale protocol, and no prose-to-rule parsing.
5. Fable compact selected-person inspector using Package 02 selection semantics.
6. Fable retained Profile using Package 01 dossier identity and the anatomy above.
7. Fable Roster with default columns, filters, Profile, exact Locate, keyboard/controller focus, narrow cards, and full context restoration.
8. Stale/missing/duplicate/ambiguous/lost-anchor presentations and regression coverage.

The exact schema field names are implementation-owned; the facts and authority boundary above are not. Prefer projecting ready-to-render reason codes/labels and explicit capabilities rather than sending raw state for Unity to reinterpret.

## EXTEND

- bridge beyond founding applicants to current contracted/freelancer person truth;
- Studio Roster density, filters, availability, specialty, Locate, and retained state;
- current selected-person inspector from work-only facts to the compact identity/current-work contract;
- Calendar/next-event contract facts into grouped human attention;
- Profile visual hierarchy and responsive layout while preserving the existing browser data/focus behavior;
- shortage routes only where current read models can name exact profession/cause/remedy.

## DO NOT REBUILD

- identity, profession, perceived skills, OVR, Potential, genre experience, work ethic, career identity;
- Star Power or any release/development calculation;
- employment status, assignment, availability, contract quote, renewal/release legality, guaranteed obligation;
- FilmResult participants where present, career events, save migration, exact contract dates, and Calendar expiry clusters;
- world presence/outcome truth;
- Package 01 dossier or Package 02 selection/camera/navigation grammar;
- current applicant ability percentile in Unity;
- any rank, `Star` threshold, or career classification.

## DEFER

- training/facilities/focus;
- morale, stress, boredom, welfare, addiction, injury, burnout;
- relationships/chemistry;
- aging, retirement/alumni mutation, death;
- individual ordinary Crew/Extras/Builders/Janitors/support workers;
- post-founding facility-routed candidate arrivals and renewable talent supply;
- agents, rival studios, poaching, market-wide comparison;
- person awards/honors until current Package 08 authority is bridged;
- trailers/entourage/status perks;
- talent leaderboards, Rising Stars, genre rankings, studio Power Rankings.

## OWNER DECISIONS REQUIRED

**None before P10A.** P10A deliberately exposes existing authority only.

Genuine later decisions, each requiring its own authoritative design gate:

1. What exact TypeScript state makes a person a **Star**, and what—if anything—does that status change beyond displaying Star Power?
2. Does the 1920–2040 campaign model mortality, or does retirement/alumni remain the terminal career transition?
3. Should strategic human condition/burnout exist, and which rare decisions justify it without reviving needs babysitting?
4. Should professional relationships/chemistry be simulated from shared work, and which downstream decisions use them?
5. Should training exist as a capacity/time/focus system?
6. When a broader market/rivals exist, which body authors talent/studio rankings, cohorts, cadence, and movement reasons?

None of those decisions may be pre-answered by placeholder fields or Unity logic during P10A.

---

# Bounded checkpoint recommendation

## P10A — Employee / Star Profile & Roster Spine V1

Implement only this proof:

> authoritative employee visible on lot<br>
> → safe single selection and compact current-work inspector<br>
> → retained public-truth Profile<br>
> → exact Back to lot<br>
> → scalable Roster<br>
> → Locate same stable person<br>
> → grouped contract attention<br>
> → old-history/stale/off-lot/decorative-person boundaries proven.

Exit criteria are the 18 Golden UX Journeys. Stop before implementing a new people simulation.
