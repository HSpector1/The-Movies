# Studio Calendar & Capacity Board V1 Contract

Status: autonomous-marathon implementation contract

Date: 2026-08-13

Authority base: accepted D-17B; closed Production Operations V1, Script Projects V1, and Casting
Sessions V1; D-16 Owner rulings; and canonical Lessons Learned

## Purpose

Add the smallest authoritative studio-wide planning surface that lets the player answer three
professional operating questions without hunting through separate rooms:

1. What requires my attention now?
2. What is occupying each real facility slot now?
3. What work, receipts, and staffing boundaries are already scheduled?

The Studio Calendar & Capacity Board composes existing engine facts. It does not create a second
clock, scheduling queue, reservation system, production command, release-date choice, or economy
rule. Its opening, rendering, filtering, and navigation are read-only.

This slice is also the first player-visible instrument for the Owner-authorized research charter:
observe the richer operating studio before proposing facility, construction, or size-scaling
economy changes. Observation is not tuning and is not macroeconomic certification.

## Compatibility and persistence boundary

SaveFileV1 through SaveFileV10 remain frozen. SaveFileV10 remains the current save schema. The
calendar adds no state root, migration, default, identifier, ledger entry, or serialized UI memory.

Managed studios receive the full operational projection. Legacy operations receive an explicit,
truthful fallback with no invented facilities, reservations, screenplay work, casting sessions, or
managed history. Existing production countdowns, released films, theatrical runs, contracts, and
current week may still be reported where their source facts exist.

Merely constructing or rendering the projection must leave the input object and its nested arrays
unchanged, consume no RNG, and leave an exported SaveFileV10 byte-identical. Navigation may change
only React presentation state; it may not apply an engine Action or autosave a different GameState.

## One time vocabulary

The board uses the current visible `state.market.tick` as `Week N`. Every future label must name
which boundary it means:

| Fact | Player-facing week law | Certainty |
| --- | --- | --- |
| Screenplay Draft/Rewrite | persisted `dueWeek`; completes on the advance that arrives at that visible week | Committed |
| Casting session | persisted `dueWeek`; completes on the advance that arrives at that visible week | Committed |
| Theatrical receipt | locked `weeklyGross[index] × studioShare`; the next unpaid index arrives on the next weekly advance | Committed |
| Contract end | persisted `endWeekExclusive`; final active payroll is processed before the advance arrives there, then the contract expires | Committed |
| Production release | derived from current `remainingTicks` and skip-first-tick law, assuming every command is resolved before advance and every allocation succeeds | Conditional |

For theatrical runs, `weekIndex` means payments already credited. A remaining receipt at offset
`k = 0, 1, ...` is shown on the visible arrival week `currentWeek + k + 1`; its ledger entry is
still governed by tick and retains the engine's current-week accounting label. UI copy must not
rename gross as studio revenue: the projected amount is exactly gross multiplied by the locked
studio share.

For a production, the conditional visible release week is:

```text
currentWeek + remainingTicks + (startTick >= currentWeek ? 1 : 0)
```

The extra week is the existing greenlight-tick skip. The value is an on-schedule lower boundary,
not a reservation or promise. Every display of it must say that unresolved commands or current and
future facility holds move release later. `remainingTicks` remains the exact progress countdown.

Past facts retain their historical tense. In particular, a persisted capacity blocker says that a
slot was unavailable when transition was attempted and that the engine will retry on a weekly
advance; the calendar must not convert it into the possibly false present-tense claim that no slot
is available now.

## Authoritative read model

Core owns one pure `studioCalendar(state)` projection. It returns fresh narrow values and never
exposes `GameState`, mutable domain objects, hidden talent attributes, actual screenplay strength,
audition execution truth, seed, or RNG state.

The projection contains:

```text
StudioCalendar
  mode: legacy | managed
  currentWeek
  nextDecision: null | exact projection of nextStudioDecision(state)
  facilities: current slot-by-slot occupancy
  commitments: persisted/scheduled future events
  productionOutlook: conditional production progress and release boundaries
  staffingHorizon: active-contract renewal and expiry facts
  summary: exact counts used by the board and observatory
```

Core computes dates, amounts, occupancy, blocker wording inputs, certainty, owner identity, and
canonical order. The UI adapter may add formatting and route labels only. React must not recompute
dates, remaining receipts, contract windows, occupancy, blockers, legality, or decision priority.

Every collection uses plain string comparison on durable IDs. Events use ascending week, then a
frozen kind order, then owner ID, then occurrence index. Input array order and fresh object identity
must not change the result.

## Exact current facility board

The capacity board enumerates every configured managed facility by ascending facility ID and every
slot from zero through `capacity - 1`. Each slot has either no occupant or exactly one occupant with:

- exact `facilityId`, slot, capability, and facility name;
- owner kind `production`, `script`, or `casting`;
- durable owner ID and player-safe title; and
- exact current activity or production phase.

Production workflow reservations, active screenplay reservations, and active casting reservations
form one union keyed by exact `(facilityId, slot)`. Duplicate use throws rather than choosing a
winner. Owner/reservation correlations are checked while projecting. A Soundstage 12 reservation
remains Soundstage 12; presentation may not substitute Soundstage 7 or any equivalent capability.

Only current reservations appear as occupied. Future production phases, screenplay opportunities,
audition plans, and retry targets are not reservations. The board may report aggregate occupied and
available counts by facility and capability only by summing the exact slot projection.

## Calendar commitments

The committed event stream contains only facts already locked by authoritative state:

- every active Draft or Rewrite with its persisted due week and exact screenplay project ID;
- every Auditioning casting session with its persisted due week and exact session/project IDs;
- every unpaid week of every active theatrical run, with exact locked studio revenue, payment
  ordinal, total payment count, and production ID; and
- every current contract's renewal-window opening week and exclusive end week, including talent ID,
  talent name, weekly salary, and whether renewal is already open.

No event is synthesized for an uncommissioned script, optional audition, unassembled package,
prospective hire, publicity cooldown, possible greenlight, facility retry, or future production
phase. Current actionable Review states belong to `nextDecision` and workflow attention, not a
fictional future date.

Multiple events may share a week. The UI must retain every event rather than coalescing identities
into an unlabeled count. An aggregate may accompany, but never replace, the detailed rows.

## Conditional production outlook

Every active production appears with its exact current phase (or labelled legacy countdown),
`remainingTicks`, present facilities, current blocker/status, and conditional visible release week.
For managed production, the outlook reuses the same workflow correlations and player-facing blocker
semantics as Production Operations. It does not expose or duplicate a command.

The only actionable production command remains the one selected by `nextStudioDecision` and owned
by Production Board. Calendar navigation opens and focuses that existing workflow. A capacity hold
has no player command and must not become a Sim stop or calendar button.

Future phase bands may be described as the normal sequence, but they may not be painted as booked
facility time. The conditional release boundary must be textually distinguishable from committed
due dates and receipts without relying on color alone.

## One decision selector and workflow ownership

`nextStudioDecision(state)` remains the sole cross-system priority law:

1. screenplay Reviews, ascending project ID;
2. casting Reviews, ascending session ID; and
3. actionable Production Operations commands, ascending production ID.

The calendar calls that selector and projects exactly its chosen identity. It must not scan cards
to invent another first decision. A calendar action only navigates to and focuses the existing
owner surface:

- screenplay Review → Writers Room and named project;
- casting Review → Casting Room and named session/project;
- production command → Dashboard Production Board and named production;
- screenplay/casting due work → its room and named work item;
- theatrical receipt → Dashboard theatrical section and named run;
- contract renewal/expiry → Studio Roster and named person.

Commands, acknowledgements, offers, and selections stay on their owning screens. If legality
changes while navigating, the destination's live read model governs; the calendar never caches
permission.

## Staffing horizon and roster-wall observation

For every active contract, core exposes exact remaining weeks, renewal-window state, renewal-window
opening week, exclusive end week, and weekly salary. The staffing horizon groups end weeks without
changing their meaning and names the busiest exact expiry week, its contract count, share of the
current roster, and associated weekly payroll.

This is instrumentation of the known synchronized-roster risk. A cluster label reports facts such
as `12 of 16 active contracts end at Week 208`; it does not claim those people will leave, predict
renewal choices, change offer law, stagger contracts, or repair the wall.

## Bounded managed-operations observatory

A deterministic, read-only observatory may consume calendar snapshots from governed simulation
runs and write generated artifacts only under ignored `out/`. It may measure:

- slot-weeks occupied by capability and owner kind;
- facility saturation weeks and longest saturation streak;
- production hold-weeks by command or capacity reason;
- greenlight-to-release elapsed weeks and conditional-boundary slippage;
- screenplay and casting lead time;
- contract renewal/expiry clustering, including Week 208; and
- cash alongside operating scale.

Experiment identity must include seed set, policy, horizon, engine commit, save version, operations
mode, and every behaviorally material configuration. Source rows remain available beside summaries.
The observatory must use only player-visible/read-model facts plus persisted public accounting; it
may not give strategy agents hidden actual skills, screenplay truth, reception draws, or future RNG.

V1 evidence is descriptive. It may identify where capacity binds or cash scales, but cannot tune a
price, authorize construction costs, claim causation from a single corpus, or certify G1–G12.

## Player surface

Dashboard gains a prominent `Studio Calendar` route and a compact preview containing the current
week, exact next decision (or `No decision waiting`), next committed boundary, facility utilization,
and busiest staffing expiry. The full screen contains:

- `Needs attention` — the one authoritative next decision and links to its owner;
- `This week on the lot` — exact slot cards grouped by named facility;
- `Committed schedule` — due work, locked theatrical receipts, and contract boundaries;
- `Production outlook` — conditional progress/release cards with hold consequences; and
- `Staffing horizon` — renewal and expiry detail plus exact cluster observation.

Filters and disclosure controls are presentation-only and must not hide the existence of an active
decision. Empty states name why a section is empty. Legacy mode is labelled; it never paints the
initial managed facility set as if it existed.

At 1280×720, 1366×768, 1440×900, and 1920×1080, including 125% zoom, the primary current-week,
decision, and occupancy information must be reachable without horizontal page scrolling. Dense
tables may stack into cards. Text and controls must not clip or overlap.

All navigation uses native controls. The screen has one `h1`, logical headings, named regions, a
text alternative for occupancy/utilization, visible keyboard focus, and no color-only status.
After opening the calendar, focus moves to its heading. After following an item, focus moves to the
named owner card or section; if that item disappeared, focus moves to the destination heading and
its live current state remains truthful.

## Required verification

- deterministic, input-immutable, RNG-byte-neutral core projection and canonical sorting;
- exact three-owner Development & Casting collision union plus every other production facility;
- no future reservation invention and exact facility identity through the UI;
- Draft/Rewrite and casting due-week alignment with the real tick completion boundary;
- every remaining locked theatrical receipt, exact amount/order, and no gross/revenue conflation;
- active-contract half-open semantics, renewal boundary, final payroll/expiry transition, and an
  adversarial synchronized Week-208 fixture;
- conditional production release formula at greenlight week, ordinary progress, command hold,
  historical capacity hold, and release-ready state, compared with actual engine transitions;
- byte-equal `nextDecision` identity with `nextStudioDecision` under out-of-order arrays;
- destination routing and focus for every owner kind, plus live legality after navigation;
- legacy/import fallback and SaveFileV10 export before/after calendar use byte-identical;
- responsive, keyboard, semantic, no-color-only, clipping, and empty-state coverage;
- observatory provenance and raw-row reconciliation if the bounded study ships in this slice;
- full core/UI suite, root and UI typecheck, production build, governed D-16 harness, and
  `git diff --check`.

## Explicitly open after V1

- player scheduling queues, priorities, calendars that reserve future slots, and simultaneous
  command batching;
- construction, expansion, facility purchase, operating cost, staffing, quality, maintenance,
  upgrades, depreciation, and land constraints;
- rehearsal choices, editing choices, reshoots, location work, release-date strategy, distribution,
  and exhibition negotiation;
- casting directors, department heads, assistants, production offices, and richer crews;
- contract negotiation, attachments, holds, options, agents, and automatic renewal strategy;
- full production budget/cost attribution to delays and facility use; and
- any economy tuning inferred from observational V1 data.

The accepted D-17B residuals remain explicitly OPEN and may not be concealed or reclassified:

- cash runaway;
- top-studio economic immortality;
- week-208 synchronized roster wall;
- P5 dominance;
- world-led variance;
- cheap-film purpose;
- premium-film purpose;
- remaining menu breadth; and
- formal G12 timing.

No financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder, or arbitrary cash
sink is authorized. Instrument first. Research. Re-measure after authoritative facility, capacity,
and construction systems make the richer operating studio real.
