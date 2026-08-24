# CODEX Hiring Candidate Review UX 01

**Status:** decision-ready research and builder reference; no production-code authority

**Date:** 2026-08-24

**Parent design:** [CODEX World-First Interaction Blueprint 01](./CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md)

**Research branch:** `codex/world-first-interaction-research-01`

**Decision:** use a **retained-lot Talent Dossier**, not the current memo and not an immediate
disconnected full-screen menu.

## 1. Direct answer

When the player clicks an applicant standing at the Gate or outside a hiring facility:

1. The **current lot remains visible** and the camera frames that person.
2. A small identity card appears first. Selection is harmless and does not hire.
3. `Open dossier` expands a substantial candidate workspace beside the live lot. It shows the
   person's face, Overall rating, role-specific skill bars, strengths, uncertainty, and contract
   demand in one place.
4. `Compare candidates` deliberately opens a larger Hiring workspace for two or three people.
5. `Review contract` changes the dossier's right column into a final offer review. Signing requires
   a second, explicit confirmation.

So the answer to “should a new screen open?” is:

| Player intent | Correct surface |
|---|---|
| Meet or inspect one visible person | **No new screen.** Keep the lot and open the compact card. |
| Seriously evaluate that person | **Expanded retained-lot dossier.** Large enough for a face, six bars, and contract summary. |
| Compare the market | **Yes, an optional dedicated workspace.** The player asked for a high-information task. |
| Commit to a contract | **Dedicated review state inside the dossier/workspace.** Never a card-level Hire button. |

This keeps hiring world-first without pretending that six skills, potential, traits, and a
multi-year financial commitment fit in a speech bubble.

This is the **target information design**, not a claim that every field is in today's Unity
contract. A matching portrait and six individual perceived-skill bars require reviewed
presentation/read-model work; the current safe fallback is a role silhouette plus the already
public discipline OVR and genre-experience summaries.

## 2. Why the sports-game reference is useful

The Owner's Madden / NCAA reference corresponds to the current **Madden NFL 27** and **EA Sports
College Football 27** interfaces.

### Verified observations

- *College Football 27* uses a dense candidate list with a persistent selected-person preview.
  Its coordinator market exposes current role, interest, and expected cost before escalating to an
  offer screen; the offer view keeps identity and abilities visible while the amount changes.
  `[CFB27]` `[CFB27-OFFER]`
- Its prospect board combines a roster-need strip, filters, sortable candidate rows, portrait,
  rating/rank, archetype, expected NIL, interest, and competing-school context. It is good evidence
  for **pool + persistent preview**, not evidence that Project: Studio should become a spreadsheet.
  EA's recruiting guidance confirms that the selected prospect's expected NIL and feedback remain
  beside the offer decision. `[CFB27-PROSPECT]` `[CFB27-HELP]`
- *Madden NFL 27* explicitly refreshed roster cards to expose more at a glance. Its contract
  negotiation keeps ratings, Persona DNA, and statistics in the negotiation itself so the player
  does not have to back out to remember who they are negotiating with. `[M27]`
- Madden's post-beta revision added visible roster depth, a full offer breakdown, clearer option
  values, interested teams, pending-offer state, and withdrawal before resolution. `[M27-LAUNCH]`
- EA itself says OVR sets the stage but does not tell the whole story. The large rating is an entry
  point; role skills, context, traits, and cost create the decision. `[M27-RATINGS]`
- *Football Manager 26* consolidates recruitment into one hub, surfaces immediate needs, and lets
  the player scout, approach an agent, offer, or wait. Its scouting model reports knowledge as
  None/Minimal/Reasonable/Extensive instead of presenting all estimates as equally certain.
  `[FM26]` `[FM-RECRUIT]`
- *Two Point Campus* uses a candidate list with a selected profile showing hiring fee, skills, and
  behavioral references. It supports list + detail, but its simpler staff model is not deep enough
  to define Project: Studio's contract view. `[TPC]`

### What Project: Studio should borrow

- a human face and name before statistics;
- one large, legible Overall rating;
- job-specific skill bars with exact values;
- the person's archetype/working identity in plain language;
- demand and studio cost in the same view as ability;
- stable selection while browsing candidates;
- deeper comparison and negotiation only after deliberate escalation.

### What it should not borrow

- a menu hub as the place candidates first exist;
- a single OVR number that makes every other fact decorative;
- Madden's multi-session patience/interest minigame when Project: Studio has no such simulation;
- a fake acceptance percentage, interest meter, agent, competing bid, or negotiable clause;
- a radar/spider chart chosen because it looks sporty;
- dozens of undifferentiated attributes on the first view.

Horizontal bars are the better chart. Controlled research found bar and line charts faster and
easier to read than radial/radar charts, with radar performing worst for comparison. `[BAR-STUDY]`
Every bar should still print its numeric value and label; color is redundant emphasis, never the
only carrier of meaning. `[WCAG-COLOR]` `[WCAG-CONTRAST]`

## 3. Recommended screen hierarchy

### Layer 1 — world identity card

Clicking a person selects them and frames them in the world. The card contains only what is needed
to decide whether to investigate:

```text
[FACE]  RAMON ASHLEY
        Actor · Free agent
        OVR 52 · Raw prospect
        Professional work ethic · Unproven
        2 yr · $6,912/wk · $96k signing

        [Open dossier]  [Compare]
```

Rules:

- The face, exact name, and profession dominate the card.
- OVR always includes its TypeScript-authored tier label.
- Show one strongest relevant signal and one cost line, not six bars here.
- `Compare` pins the person; it does not open automatically.
- There is no `Hire`, `Sign`, or default contract term on this card.
- Previous/next candidate input changes the selected world person without consuming RNG or
  changing market state.

### Layer 2 — retained-lot Talent Dossier

The camera keeps the selected applicant in the left portion of the screen. A high-opacity dossier
uses roughly the right two-thirds. It is a real management surface, not a tiny tooltip and not a
white memo over the whole game.

```text
┌────────────── LIVE LOT ──────────────┬────────────── TALENT DOSSIER ──────────────────────────┐
│                                      │  [PORTRAIT]  RAMON ASHLEY                   ☆ Compare │
│       selected person at Gate        │              Actor · Free agent                       │
│       lot remains visibly live       │              52 OVR · Raw prospect                   │
│       world input is suspended       │              Est. potential 58–70                    │
│                                      ├──────────────────────────┬─────────────────────────────┤
│                                      │ ACTING SKILLS            │ CONTRACT DEMAND             │
│                                      │ Technique       █████ 54 │ 2 years                     │
│                                      │ Emotional Range ██████ 61│ $6,912 / week               │
│                                      │ Dialogue        ████ 47  │ $96,000 signing — today     │
│                                      │ Comic Timing    ███████ 68│ $814,848 total commitment   │
│                                      │ Physical        █████ 51 │ Payroll +$6,912 / week      │
│                                      │ Screen Presence ██████ 59│ Projected runway 68 weeks   │
│                                      ├──────────────────────────┤                             │
│                                      │ STRENGTHS / RISK         │ [Review contract]           │
│                                      │ Work ethic: Professional │                             │
│                                      │ Concern: Unproven        │                             │
│                                      └──────────────────────────┴─────────────────────────────┤
│                                      │ [Previous] [Next] [More details]       [Back to Gate]  │
└──────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

The numbers above demonstrate hierarchy only; the builder must render the current TypeScript
projection, never copy these example values.

**Visual treatment:** use a dark or mid-neutral, high-opacity management surface with restrained
studio-era accents—not another sheet of white memo paper. The portrait and OVR form the visual
anchor; skill bars form the scanning rhythm; the contract column uses typographic hierarchy rather
than paragraphs. Keep roughly one-third of the frame for the selected applicant and their real lot
location. Text sits on a solid-enough surface for readability; “retained lot” does not mean noisy
transparency behind numbers.

The dossier is **modal for decision safety**: the lot remains mounted and visibly live, but normal
world pointer/controller input is suspended until the dossier closes. A later explicit portrait
orbit or camera-control affordance may be designed inside the dossier; background clicks must not
retarget the candidate or trigger a lot action.

### Layer 3 — optional full Hiring / Compare workspace

`Compare` or `View all candidates` opens a dedicated workspace because simultaneous comparison is
objectively worse in a world popup. It should contain:

- a compact candidate rail/table with face, name, role, OVR, best signal, demand, and status;
- a persistent selected-candidate dossier, not a new page on every row change;
- two or three pinned comparison columns on one common 0–99 scale;
- role/coverage need at the top (`Actors 1/3`, for example);
- filters and sorting only after the opening tutorial;
- `Locate at Gate` and an explicit `Return to Gate` that restore world context.

The founding experience should initially expose only three staged candidates. `View all` is an
escape hatch for an expert, not the opening camera target.

## 4. Exact dossier content

### Identity block — always visible

1. Head-and-shoulders portrait or live portrait render.
2. Full name.
3. Profession in text and icon: Actor, Director, Writer, or Production/Craft Lead.
4. Availability: Free agent, Contracted/Signed, or Unavailable only when authoritative.
5. Age and Star Power as secondary facts.
6. One large **profession OVR**, plus the named tier.

The portrait is Unity presentation, not simulation authority. The current TypeScript `Talent`
model has no portrait or image identity. Unity may bind a deterministic presentation portrait to
the stable candidate reference, but the world person and portrait must visibly represent the same
person. Until that binding exists, use an honest role silhouette; do not attach arbitrary stock
faces to candidates.

There is no current authoritative `Offer pending` employment state. Do not display one unless a
later TypeScript contract adds pending offers and their resolution law.

### Skill block — six horizontal bars

Use only the candidate's **perceived** professional-skill values—the player-visible information
layer—through a reviewed public read model. Hidden actual values and hidden ceilings never cross
into the UI.

| Profession | Six labelled bars |
|---|---|
| Actor | Acting Technique; Emotional Range; Dialogue Delivery; Comic Timing; Physical Performance; Screen Presence |
| Writer | Story Structure; Character Development; Dialogue; Originality; Narrative Pacing; Rewriting |
| Director | Visual Storytelling; Performance Direction; Tone Control; Directing Pacing; Production Management; Adaptability |
| Production/Craft | Cinematography; Editing; Production Design; Sound & Music; Effects Execution; Technical Coordination |

Bar rules:

- fixed 0–99 scale beginning at zero;
- same physical length and scale for every candidate;
- label on the left and exact integer on the right;
- TypeScript tier colors may reinforce the value, but number, length, and text remain sufficient;
- comparison overlays the other candidate as a thin marker or shows aligned adjacent bars;
- never sort the six skills per person—the stable role order supports memory and comparison;
- do not show all 24 professional skills in the default dossier.

The existing public `TalentProfile` exposes discipline OVR and perceived genre experience, but not
these six individual skill values. Individual bars therefore require a reviewed TypeScript
read-model projection of **perceived-only** values; Unity must not reach into raw Talent or infer
them from OVR.

### Meaning block — prevent rating confusion

These values answer different questions and must not visually blur together:

| Value | Question answered | Display rule |
|---|---|---|
| Profession OVR | How good are they at this profession now? | Large integer + tier; primary rating. |
| Skill bars | Why is that their OVR/profile? | Six perceived values; default dossier. |
| Estimated potential | How high might they develop? | `Est.` range; add confidence only if TypeScript models it; never exact hidden ceiling. |
| Work ethic | How consistently do they convert experience into growth? | Number + authored label; never part of current OVR. |
| Star Power | How much demonstrated audience draw do they have? | Separate metric; never called acting ability. |
| Genre experience | Where have they demonstrated relevant experience? | Top one or two signals first; complete six-genre row under More Details. |
| Project Fit | How well do they fit this exact picture/slot? | Show only when opened from a real project/role context. Never invent a general Fit score. |

The default strengths area may show up to two positive signals and one nullable concern in plain
language. If no signal exists, say so honestly; do not manufacture a strength or weakness to fill
the layout.
`More details` owns secondary-discipline OVRs, all genre experience, temperament, career history,
credits, standing, and the explanation behind estimates.

### Contract block — demand and consequence together

Sports games are right to keep a player's demands beside their ability. Project: Studio should
show the selected legal term and its exact consequences:

- term length;
- annual and weekly salary;
- signing bonus due now;
- guaranteed salary and total obligation;
- payroll before → after or explicit weekly delta;
- recruitment fund/cash before → after;
- runway before → after when authoritative and meaningful;
- the exact source of the signing bonus during founding (recruitment fund, not operating cash).

Founding is a special case: its current truthful surface owns **aggregate projected runway**, not a
per-offer before → after pair, because payroll does not tick while the founding draft is open. The
Unity projection must not copy post-founding runway semantics into founding merely to fill this
column.

If several legal terms exist, use a small term selector and update the same consequence pane. Do
not render several giant Sign buttons. If CP9 exposes only the current fixed two-year bridge offer,
show only that offer; do not fabricate negotiability.

The compact world card also names its cost basis. With one legal term it can say
`2 yr · $6,912/wk · $96k signing`. With multiple terms it says `Review contract terms` unless
TypeScript supplies an exact, truthfully labelled summary; the UI never silently chooses a default
term merely to print an attractive price.

Project: Studio currently has no authoritative candidate interest, acceptance probability,
patience, counteroffer, agent demand, or competing-team bid. None should appear until TypeScript
models and projects it.

## 5. Contract review and accidental-hire prevention

The interaction is:

```text
SELECT PERSON (no mutation)
→ OPEN DOSSIER (no mutation)
→ SELECT LEGAL TERM (no mutation)
→ REVIEW CONTRACT (no mutation)
→ SIGN RAMON ASHLEY — 2 YEARS (one authoritative intent)
→ FRESH SNAPSHOT
→ VISIBLE SIGNED RECEIPT / FRESH WORLD RESPONSE
```

Final review repeats, in one view:

- face, exact name, profession, and OVR;
- chosen term;
- bonus paid today;
- weekly payroll change;
- guaranteed and total commitment;
- recruitment fund/cash and runway consequence;
- one `Cancel` and one unambiguous `Sign <name> — <term>` action.

The action uses the refreshed opaque intent for this exact candidate and offer. A stale offer fails
closed and returns to the same selected person with a reason. It never signs another candidate.
Error prevention and a reviewable final state are especially important for financial commitments.
`[NN-ERROR]` `[WCAG-FINANCIAL]`

An entrance flourish may be presentation-only and separately authorized, but this flow does not
claim an authoritative route, arrival clock, employee location, queue, or pathfinding event.

## 6. Founding versus later hiring

Use one visual language, with different world origins:

| Moment | Where the player begins | What changes in the dossier |
|---|---|---|
| Founding | Visible applicants at the Gate | Shows founding role coverage and recruitment fund; no fake market competition. |
| Actor/director hiring | Stage School queue/arrivals once that system exists | Same actor/director skill chassis; market/availability context may appear when authoritative. |
| Writer hiring | Script/Development Office arrivals | Writing skill bars and office need/capacity. |
| Craft/crew hiring | Crew Facility arrivals | Craft bars and department need/capacity. |
| Targeted/scouted candidate | Appointment at Gate | Adds scouting provenance/confidence only if TypeScript supplies it. |
| Emergency replacement *(future only)* | A future TypeScript-authored production/facility need | Opens one-person compact dossier with `View market`; no automatic hire and no UI-invented need. |

“Staff” currently means the authoritative Writer, Director, and Production/Craft professions in
addition to Actors. Builders, janitors, assistants, agents, scouts, and department employees do
not yet have the same TypeScript hiring/skill/contract model. Reuse this chassis for them only after
their real role facts and consequences exist.

## 7. Comparison rules

- Pin at most three candidates.
- Default to comparing candidates for the same required profession.
- Keep portrait, name, OVR, and selected contract term sticky above each column.
- Align all six role bars row-by-row on one common scale.
- Show differences in weekly cost, signing cost, total obligation, and runway beside ability.
- Keep `Est.` on uncertain fields in every column; show confidence only when authoritative.
- Do not automatically label one person `Best`; explain a recommendation only if TypeScript owns
  the scoring and can state its drivers.
- Demote custom heuristics such as `OVR/$M` to details. They can aid sorting, but must not masquerade
  as the game's answer.
- Filters never silently change the selected person or sign/dismiss anyone.

## 8. Controller, accessibility, and responsive behavior

- Candidate selection, dossier sections, term choice, and confirmation are fully reachable by
  controller and keyboard.
- Left/right candidate switching is available only while focus is in the candidate rail; it cannot
  change the candidate while the final Sign action is focused.
- Identity, OVR, skill labels, numeric values, and contract figures remain visible at 200% UI scale.
- On narrower layouts, stack `Overview`, `Skills`, and `Contract` as tabs while keeping the portrait,
  name, role, and OVR persistent.
- Bars use length + number + label; strengths/concerns use text/icon as well as color.
- Selected, focused, signed, and unavailable states have non-color cues and sufficient
  contrast.
- Closing restores focus and camera context to the exact selected world applicant.

## 9. Required TypeScript-to-Unity read model

The current bridge gives Unity an opaque intent plus a prose `detail` paragraph. That is not enough
for a sports-quality dossier. A structured, read-only projection keyed to the same opaque intent
must provide:

```text
candidate reference (Unity resolves its matching presentation/portrait identity)
name + profession + availability
profession OVR + tier
six perceived skill labels/values
Star Power + age
estimated potential range/tier (confidence only when authoritative)
work ethic value/label
perceived genre experience
strengths + concern
legal offer term(s)
exact bonus/salary/obligation/payroll/fund/runway consequence
matching opaque intent ID + state revision
```

`Open dossier` is therefore a **new presentation interaction dependent on this projection**, not an
action the current bridge can already support safely. The bridge's fixed 104-week founding option
is also only its current journey choice; Core's broader 52/104/156/208-week term set remains the
general law and must be projected explicitly before Unity offers it.

TypeScript remains authoritative for every displayed number, uncertainty label, offer, consequence,
and legality result. Unity owns portrait rendering, layout, selection, camera, and feedback. Unity
does not parse prose, calculate OVR, derive contract cost, reveal actual skills/ceilings, predict
acceptance, or choose the best candidate.

## 10. Builder acceptance checklist

### REQUIRED for the first hiring implementation

- visible person in the lot is the entry point;
- harmless compact world card;
- retained-lot dossier with a matching portrait—or honest role silhouette fallback—plus role,
  OVR/tier, and contract ask;
- structured perceived-only and contract-consequence projection from TypeScript; the current
  prose-only bridge is not sufficient;
- six perceived-only horizontal skill bars **after** that reviewed projection exists; until then,
  show existing discipline OVR and genre meters rather than fabricated bars;
- one strengths/risk summary plus honest potential uncertainty;
- `Review contract` followed by explicit named confirmation;
- fresh authoritative signed/refused receipt and world repaint, without claiming employee travel;
- current memo collapsed and unnecessary for the complete path.

### NEXT

- two/three-person compare workspace;
- full candidate market with filters, role coverage, Locate, and Return to Gate;
- richer scouting confidence/provenance;
- project-specific Fit when opened from an actual screenplay/casting slot;
- stable distinct portrait library and closer world/dossier visual continuity.

### DO NOT DO

- do not make a full-screen candidate spreadsheet the first thing the player sees;
- do not reproduce the universal white memo merely by leaving the lot visible behind it; the
  dossier must remain person-specific and return to that exact lot context;
- do not add face art unlinked to the selected world identity;
- do not expose hidden actual skill or ceiling data;
- do not use radar charts, color-only bars, or one opaque OVR score;
- do not invent interest, negotiation, scouting, or staff simulations;
- do not allow one-click hiring from the world card, list row, or skill chart.

## Sources

- `[CFB27]` EA, *College Football 27 — Dynasty & Team Builder Deep Dive*, especially Coaching
  Staff, coordinator hiring, abilities, expected value, and offer flow:
  <https://www.ea.com/games/ea-sports-college-football/college-football-27/news/college-football-27-dynasty>
- `[CFB27-PROSPECT]` official EA prospect-board reference image (external visual reference only):
  <https://drop-assets.ea.com/images/6FSRCYW3hr5cpZP629x9lR/0748a7f916f1354ea218af7ce0358156/Dynasty_Image_39.png>
- `[CFB27-OFFER]` official EA coordinator-offer reference image (external visual reference only):
  <https://drop-assets.ea.com/images/5zXDDyueuHNbwUgsQvrg1S/a844c36659979d28429ef615003e4d1f/Dynasty_Image_2_WM.png>
- `[CFB27-HELP]` EA Help, expected NIL, feedback, current offers, roster expectations, and risk:
  <https://help.ea.com/en/articles/ea-sports-college-football/recruit-in-dynasty-mode/>
- `[M27]` EA, *Madden NFL 27 — Franchise Deep Dive*, especially roster/player-card refresh and
  contextual contract negotiation:
  <https://www.ea.com/games/madden-nfl/madden-nfl-27/news/madden-27-franchise-mode>
- `[M27-LAUNCH]` EA, *Madden NFL 27 Launch Guide*, contract breakdown, roster depth, interested
  teams, and pending/withdrawable offers:
  <https://www.ea.com/games/madden-nfl/madden-nfl-27/news/madden-nfl-27-launch-guide>
- `[M27-RATINGS]` EA, *Madden NFL 27 Ratings Reveal Recap*:
  <https://www.ea.com/games/madden-nfl/madden-nfl-27/news/madden-27-ratings-overview>
- `[FM26]` Sports Interactive, *FM26 Recruitment Revamp*:
  <https://www.footballmanager.com/fm26/features/powered-transferroom-fm26s-recruitment-revamp>
- `[FM-RECRUIT]` Sports Interactive, recruitment/scouting/agent-demand design:
  <https://www.footballmanager.com/features/recruitment-revamp>
- `[TPC]` GamePressure, *Two Point Campus — Staff and employment* (secondary interface
  observation): <https://www.gamepressure.com/two-point-campus/staff-and-employment/z61013a>
- `[BAR-STUDY]` Abeynayake et al., *Efficacy of information extraction from bar, line, circular, bubble
  and radar graphs*, *Applied Ergonomics* 109 (2023):
  <https://doi.org/10.1016/j.apergo.2023.103996>
- `[NN-ERROR]` Nielsen Norman Group, Error Prevention heuristic:
  <https://media.nngroup.com/media/articles/attachments/Heuristic_5_compressed.pdf>
- `[WCAG-FINANCIAL]` W3C, WCAG 2.2 Error Prevention for legal/financial/data submissions:
  <https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data>
- `[WCAG-COLOR]` W3C, Use of Color technique G14:
  <https://www.w3.org/WAI/WCAG22/Techniques/general/G14.html>
- `[WCAG-CONTRAST]` W3C, Non-text Contrast:
  <https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast>

### Repository evidence used

- `ui/src/engine/adapter.ts:3903-3989` — current founding applicant row;
- `ui/src/engine/adapter.ts:4184-4287` — perceived-only Talent Profile contract;
- `ui/src/screens/FoundingScreen.tsx:438-535` — current founding card and offer display;
- `ui/src/screens/HiringMarket.tsx:280-380` — post-founding offer and runway truth;
- `src/core/types.ts:38-129` and `src/core/tuning.ts:1747-1809` — professions, skills, genres,
  perceived/actual boundary, and stable skill order;
- `bridge/session.ts:348-435` — current prose-only founding options and server-held action identity;
- `docs/WORLD-FIRST-STUDIO-GATE-TALENT-ARRIVAL-HIRING-RETURN-V1-EVIDENCE.md` — accepted Gate →
  person → profile/terms → fresh world loop; and
- `docs/design/CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md` — governing world-first doctrine.

Sports-game observations, repository facts, and Project: Studio recommendations are deliberately
separated. External reference images are linked for layout study only; their visual assets and
branding are not to be copied.
