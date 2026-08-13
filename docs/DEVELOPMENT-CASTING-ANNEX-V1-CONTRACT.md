# Development & Casting Annex V1 Contract

Status: autonomous-marathon implementation contract

Date: 2026-08-13

Authority base: accepted D-17B Owner rulings; closed Production Operations V1, Script Projects V1,
Casting Sessions V1, and Studio Calendar & Capacity Board V1; Facilities & Construction Research
Contract and its reviewed Week-260 observatory; D-16 Owner rulings; and canonical Lessons Learned

Research evidence: [Facilities & Construction Research Evidence](./FACILITIES-CONSTRUCTION-RESEARCH-EVIDENCE.md)

## Purpose and bounded ruling

Add one optional capital project to the studio the player can operate now:

`Vacant expansion parcel → 13 weekly advances of construction → Development & Casting Annex`

The completed Annex contributes exactly one `development-casting` slot. It is the smallest physical
investment supported by current demand: productions, screenplay work, and camera tests share the
two opening Development & Casting slots, while soundstage, scenery, and post capacity already match
the two-production ceiling.

V1 is one fixed parcel, one fixed project, and one non-repeatable facility. It is not free placement,
a construction catalogue, a research tree, a building upgrade, or a generalized city-builder layer.
It does not raise the production ceiling, shorten work, guarantee another release, or promise a
profit. It may be useless to a direct-package studio that does not develop multiple screenplays or
run camera tests; that is a legitimate player strategy, not a condition this mechanic may erase.

The calibration frozen by this contract is:

| Fact | V1 law |
| --- | --- |
| Parcel ID | `expansion` |
| Project ID | `construction-development-casting-annex` |
| Facility ID | `facility-development-casting-annex` |
| Capex | **$780,000**, committed in full when construction starts |
| Duration | **13 weekly advances** |
| Result | one named Development & Casting Annex, capacity 1 |
| Marginal operating cost | **$0 per week** |

These are initial product-calibration values, not economy-balancing targets. Changing any one of
them after this contract is frozen requires new evidence and a contract amendment; UI copy, save
data, and tests may not carry independent lookalikes.

## Research basis and limits

The reviewed observatory ran 25 paired seeds for each of three credible policies through visible
Week 260. Its primary corpus found no capacity rejection for the one-team direct-package policy,
but found 145 Development & Casting rejections for the one-team development/casting policy and 230
for the scaled two-team policy. A one-boundary replay with one additional slot admitted all 145 and
all 230 exact rejected intents. No current policy produced a capacity rejection for soundstage,
scenery, or post. This supports H1 through H3 without turning utilization alone into value.

The timing sensitivity made one additional slot available at Week 1, 8, 13, or 26. For the selected
Week-13 boundary, current-versus-Annex rejection exposure from Week 13 onward was:

| Policy | Current | With one Annex slot | Exact reduction across 25 runs |
| --- | ---: | ---: | ---: |
| direct-package | 0 | 0 | 0 |
| development-casting | 19 | 5 | 14 |
| scaled-two-team | 56 | 4 | 52 |

The Week-13 arm deliberately leaves opening congestion in place: 126 and 174 rejections,
respectively, occurred before the Annex became available. It proves that a completed third slot can
admit later ordinary work; it does not pretend a project begun at studio opening already existed.
The research harness installed capacity at the **start** of Week 13 before that week's policy
actions. Production V1 instead completes the Annex on the arrival at Week `S + 13`, after the
completing advance's automatic allocations. The corpus therefore directly supports player actions
from visible Week `S + 13` and later allocations; it does not test or authorize retroactive use by
an allocation that already ran during the completing advance. No timing corpus recorded a
production hold, so this ordering distinction does not conceal a measured hold repair.
Long-run results remain descriptive after policy feedback. At Week 13, 22 of 25 scaled-policy pairs
had zero release delta and 22 had zero final-cash delta; the nonzero tails ran in both directions.
Every development/casting-policy pair had zero release delta, and 23 of 25 had zero cash delta.
Therefore the contract makes no causal throughput, release-count, or return-on-investment claim.

The direct fourth-slot sensitivity does not authorize another Annex. In the one-team development
policy, moving from +1 to +2 capacity removed only four more rejections across 25 runs and changed
neither releases nor cash. The scaled policy removed more raw rejections, but its release and cash
deltas had substantial positive and negative tails after feedback. V1 stops at one additional slot;
there is no repeat action, stack, upgrade, second parcel, or hidden +2 path.

The exact capex is anchored to named current scales rather than a desired late-game cash percentile.
$780,000 is 3.9% of the $20,000,000 starting cash, 65% of the $1,200,000 Whisper publicity campaign,
and 25.89% of the $3,013,337.98875 median across 1,009 accepted current-arm film commitments
(observed range $2,007,259.91875–$4,695,563.58). Against measured Week-0 median
payroll-plus-overhead, it is approximately 14.1 weeks for direct-package play, 12.0 weeks for
development/casting play, and 7.2 weeks for scaled two-team play. The amount is a meaningful but
bounded capital choice and is not derived from a cash-runaway threshold or the noisy paired
final-cash delta.

The research evidence owns an exhaustive 36-tuple Cartesian candidate grid:

```text
capex {$390,000, $780,000, $1,560,000, $3,120,000}
× completion {Week 8, Week 13, Week 26}
× marginal opex {$0, $1,500/week, $15,000/week}
```

This contract selects exactly `$780,000 / Week 13 / $0`. All positive-opex tuples are rejected
because the current model owns no attributable worker, utility, maintenance, floor-area, or site-
cost entity; choosing either charge would manufacture a recurring cash sink. Every Week-26 tuple is
rejected as boundary-sensitive and too late to offer enough ordinary-player value in the observed
window, independently of the opex rejection. Among zero-opex Week-8 and Week-13 candidates,
$390,000 is rejected as too light an initial capital signal, while $1,560,000 and $3,120,000 are
unsupported price premiums for exactly the same facility behavior. The $780,000 / Week-8 candidate
is superseded by the longer but still-useful Week-13 construction clock. These are product-
calibration rejection classes, not ROI thresholds, and the complete grid remains in the research
evidence rather than being silently narrowed here.

Thirteen advances are one visible quarter-year on the authoritative 52-week clock. Week 13 is the
tested availability boundary; the post-allocation completion placement is the implementation law
specified above and must be verified independently. The duration gives the parcel a legible building
period while still leaving measured later demand for the completed slot. It is not presented as a
simulation of real construction labor. Zero marginal opex is equally deliberate: V1 owns no
facilities workforce,
utilities, floor area, maintenance, repair, or other attributable resource from which a recurring
charge could truthfully arise. Existing payroll and base overhead continue during construction and
after completion exactly as before. An invented weekly Annex fee would violate the governing
instruction to understand authoritative facility/capacity/construction systems before creating a
size-scaling cash sink.

## Compatibility and activation boundary

SaveFileV1 through SaveFileV10 remain frozen. SaveFileV11 appends one authoritative construction
root and is the only format that writes Annex lifecycle state. No earlier validator, save builder,
envelope, or frozen state type accepts or emits that root, the new ledger kind, or a constructed
facility.

New game state begins with legacy operations and exact legacy-empty construction state. The
existing governed post-founding activation must atomically activate managed Production Operations,
Script Development, Casting Sessions, and construction. Managed construction begins with the fixed
`expansion` parcel vacant and no project history; it creates no facility and charges no cash.

V10-to-V11 migration is deterministic and depends only on validated V10 operations mode:

- legacy operations receive `{ mode: 'legacy', parcels: [], projects: [] }` and remain legacy;
- managed operations receive managed construction with one vacant `expansion` parcel and no
  projects; and
- neither path invents a past project, debit, completion date, Annex, reservation, or benefit.

A migrated legacy studio that later uses the existing explicit managed-operations activation
receives the same vacant parcel at that forward-only boundary. Legacy studios never display the
parcel as owned, never gain capacity, and never pay Annex capex. Migration and activation consume
no RNG, preserve all prior state facts, and do not mutate their input.

## Authoritative lifecycle state

The live V11 state adds the following narrow root. Names below are normative even if the final
TypeScript representation uses discriminated unions to make invalid combinations unrepresentable.

```text
StudioConstruction
  mode: legacy | managed
  parcels: ConstructionParcel[]
  projects: ConstructionProject[]

ConstructionParcel
  id: "expansion"
  projectId: null | "construction-development-casting-annex"

ConstructionProject
  id: "construction-development-casting-annex"
  kind: "development-casting-annex"
  parcelId: "expansion"
  facilityId: "facility-development-casting-annex"
  status: "building" | "completed"
  capex: 780000
  startedWeek: integer
  dueWeek: startedWeek + 13
  completedWeek: null | dueWeek
```

The live V11 ledger shape also adds one optional correlation field,
`constructionProjectId`. It is required and equal to
`construction-development-casting-annex` when `kind === 'constructionCapex'`, and forbidden for
every other ledger kind. Frozen V1–V10 ledger projections do not contain or accept this field.

There is no planned or canceled project row. The start action creates the one project record, claims
the one parcel with that same project ID, and reserves the final facility ID immediately. Completion
changes only the monotonic lifecycle fields and appends the exact facility to managed operations.
The project and parcel correlation are retained permanently after completion. V1 never deletes a
project, vacates the parcel, reuses an ID, regenerates an ID from array length, or reconstructs a
start/completion week from the current week.

The operational facility is exactly:

```text
{
  id: "facility-development-casting-annex",
  name: "Development & Casting Annex",
  capability: "development-casting",
  capacity: 1
}
```

The five initial managed facilities retain their exact identities, capacities, and array order.
Completion appends the Annex once. Allocation continues to use the existing authoritative ascending
facility-ID then ascending-slot law; existing reservations never move merely because another
facility became available.

## Start action and affordability law

V1 adds exactly one command with no caller-controlled price, date, parcel, project, or facility ID:

```text
{ kind: "startDevelopmentCastingAnnex" }
```

The action is legal only when all of the following are true in the same input state:

- operations and construction are both managed;
- the studio is founded and its persisted economy regime is engaged;
- the exact `expansion` parcel exists and is vacant;
- no Annex project record or Annex facility exists;
- no existing facility, reservation, or project has any of the three canonical IDs; and
- `canAfford(state, 780000)` returns `ok: true`.

The existing full-immediate-commitment law is authoritative. Exactly $780,000 cash is affordable;
$779,999 is not. There is no deposit, installment, escrow, refund, debt, loan, bailout, forced sale,
negative-cash exception, or projected-revenue test. A rejection throws the exact owning reason and
leaves cash, ledger, construction, operations, clock, RNG, and every nested input byte-identical.

An accepted action is one atomic state transition at visible Week `S`:

1. debit cash by exactly $780,000;
2. append exactly one `constructionCapex` ledger row for `-$780,000`, Week `S`, and the canonical
   project ID through `constructionProjectId`, with no `talentId` or `productionId`;
3. append the canonical Building project with `startedWeek = S`, `dueWeek = S + 13`, and
   `completedWeek = null`; and
4. claim parcel `expansion` with the canonical project ID.

It consumes no simulation or derived RNG and advances no time. No facility is added at start. The
ledger note and any optional correlation field are canonical presentation data, never a second
source for price or completion time.

## Exact construction clock and allocation order

If construction begins in visible Week `S`, exactly 13 calls to the real weekly tick are required.
The Annex completes on the advance from Week `S + 12` to visible Week `S + 13`.

On that completion advance, order is binding:

1. due screenplay work completes under the existing step 0.5 law;
2. due casting sessions complete under the existing step 0.6 law;
3. managed productions advance or retry allocation under the existing step 1 law, using only the
   facilities operational at the start of that advance;
4. construction due on arrival Week `S + 13` completes, appends the Annex once, and stamps
   `completedWeek = S + 13`; and
5. the remainder of the existing tick proceeds without re-running any allocation.

Thus the Annex is absent for all script, casting, and production allocation during its thirteenth
advance. It is operational in the returned visible Week `S + 13`: player actions in that week may
reserve it immediately, and automatic production transition retries may use it on following
advances. Completion is not a second tick and may not trigger a hidden retry, commission, camera
test, production advance, receipt, payroll, or overhead charge.

Building progress is exact integer clock state:

```text
completedAdvances = currentWeek - startedWeek
remainingAdvances = dueWeek - currentWeek
```

while Building, with values clamped only for defensive presentation after core validation. No wall
clock, animation frame, local-storage timestamp, offline progress, fractional week, pause button,
speed multiplier, or user-completable action affects it.

## Accounting ownership

`constructionCapex` is a new engaged-only `LedgerKind`. Every compile-guarded ledger classifier must
give it an explicit home, including save validation, engagement evidence, finance totals, period
summary, weekly summary, cash timeline, and Studio Run Recap. Cash continues to reconcile in ledger
array order:

```text
studio.cash = TUNING.INITIAL_CASH + sum(ledger.amount)
```

Construction capex is a studio-level capital investment. It must appear as its own positive spend
total in Finance and in `Where the money went`, and as the exact negative movement in period/cash
views. It is never:

- production commitment, negative cost, marketing, freelancer fee, publicity, payroll, overhead,
  termination, or `otherCash`;
- assigned to a film contribution, ROI, studio-economic result, or fixed-cost allocation;
- counted as current weekly burn, runway's recurring burn, or a Week-13 completion debit; or
- netted against the paired observatory's descriptive benefit.

There is exactly one matching capex row for a started project and none for a vacant parcel. The row
must identify `construction-development-casting-annex` through its exact
`constructionProjectId`; a note substring is not sufficient for reconciliation. Completion and
continued operation add no ledger row. Existing base overhead,
per-employee overhead, payroll, and all accepted D-17B accounting remain byte-for-byte governed by
their current formulas.

## Invariants and strict SaveFileV11 validation

Core owns one invariant checker shared by actions, tick, Calendar/read models, and V11 validation.
At minimum it enforces:

- construction mode equals operations mode;
- legacy mode has no parcels, projects, Annex facility, or construction-capex ledger row;
- managed mode has exactly one parcel with ID `expansion`;
- managed project history contains zero or one record, with the exact canonical IDs, kind, capex,
  and `dueWeek = startedWeek + 13`;
- a vacant parcel has `projectId = null`, no project, no Annex facility, and no capex row;
- a Building project owns the parcel, has `completedWeek = null`, has exactly one matching capex row,
  has `startedWeek <= currentWeek < dueWeek`, and has no Annex facility;
- a Completed project owns the parcel, has `completedWeek = dueWeek <= currentWeek`, has exactly one
  matching capex row, and has exactly one exact Annex facility;
- the Annex never has capacity other than one and every Annex reservation is an ordinary legal
  `development-casting` reservation created only after completion;
- facility IDs, project IDs, parcel IDs, capex correlations, and ledger identities are globally
  unique where their owning domains require uniqueness; and
- all existing production/script/casting three-owner collision and workflow invariants still hold
  over the expanded configured facility set.

The matching capex ledger row has `week = startedWeek`, `amount = -780000`, the canonical
`constructionProjectId`, and neither talent nor production correlation. V11 validation also enforces
the full cash identity against the ledger in array order; a structurally valid project cannot excuse
a missing debit or mismatched cash.

The research-only broad `configured` facility policy is not valid SaveFileV11 acceptance. Core adds
an exact V11 facility policy that accepts only the five canonical initial facilities, plus the one
canonical Annex if and only if the construction project is Completed. V11 import must reject every
other configured facility, reordered/replaced initial facility, Annex duplicate, or capacity
mutation.

V11 validation is exact-keyed and rejects unknown modes/statuses/kinds, extra parcels, noncanonical
IDs/order, non-integer or future clocks, wrong cost/duration, duplicate or missing capex, impossible
lifecycle/market-week combinations, a facility before completion, a completed project without its
facility, reservation/capability mismatch, and any facility-slot collision. It never repairs or
defaults malformed current-version state.

`makeSaveV1` through `makeSaveV10` remain positive projections of their frozen versions and cannot
leak V11 construction state or `constructionCapex`. `makeSaveV11` writes the current root.
`convertV10ToV11` deep-clones validated input, adds only the truthful mode-specific default,
preserves RNG bytes, and leaves its argument untouched. `migrateToV11` passes V11 by identity and
migrates V1 through V10 forward. Every historical migration entry point rejects newer versions
rather than discarding construction state.

## Authoritative read model and player surfaces

Core owns one pure `studioConstructionView(state)` used by every surface. It exposes only current
legality and persisted facts: mode; parcel/project/facility IDs; lifecycle state; exact capex;
current cash and cash-after; the exact `canAfford` result; started/due/completed weeks; integer
progress; operational capacity; and concise consequence copy. It exposes no hidden profitability
estimate, predicted releases, counterfactual cash, research-agent policy, seed, or RNG state.
Projection mutates no input and consumes no RNG.

### Studio development, Calendar, and non-lot access

A dedicated `Studio Development` screen is the one player owner of the construction action and is
available through ordinary React navigation without loading the Studio Lot. It shows the parcel in
one of three text-labelled states:

- **Vacant** — exact $780,000 price, 13-advance duration, cash-after preview, shared-capacity result,
  authoritative affordability reason, and the one start button;
- **Building** — project name, started week, committed completion at visible Week `S + 13`, exact
  `N of 13 weekly advances complete`, and no duplicate action; or
- **Operational** — completion week, permanent Annex identity, and exactly one additional
  Development & Casting slot.

Studio Calendar remains read-only. Its `Studio development` section projects the same three states
and navigates to the dedicated owner screen; it never applies the start action. While Building, the
Calendar adds one committed `constructionCompletion` event keyed by project ID and due week. Its
exact same-week kind order is script due, casting due, construction completion, theatrical receipt,
contract renewal, then contract expiry; the existing owner-ID and occurrence-index tie breaks remain
unchanged. It may become the next committed boundary. It disappears as a future commitment after
completion; the retained project remains visible in Studio development. The ordinary facility
board shows no Annex before completion and the exact Annex/slot afterward.

`Sim to next event` treats the committed construction completion as a stop boundary. On arrival it
shows one weekly-summary item stating that the Annex is Operational and that one shared Development
& Casting slot is now available. Completion creates no decision or acknowledgement gate; the player
may continue immediately. Ordinary one-week advance reports the same completion fact exactly once.

Dashboard exposes a compact Studio-development preview and opens the dedicated owner screen. The
Calendar section also routes there. Together they provide complete status and action access when the
optional Studio Lot is disabled, unavailable, or unsuitable for the player. No construction command
may exist only inside Phaser.

### Finance and recap

Dashboard Finance and period/weekly summaries label the debit `Studio construction`, show the exact
amount in the applicable window, and keep recurring burn unchanged. Studio Run Recap adds a separate
`Studio capital investment` line with total Annex construction capex. Its explanatory copy states
that the amount is studio capital, not film commitment or recurring overhead. The cash chart reads
the authoritative ledger and therefore shows the Week-`S` debit exactly once.

### Studio Lot

The existing authored `expansion` pad becomes the depiction of the same authoritative parcel. Its
three appearances are Vacant, Building, and Operational; it may not move, rotate, duplicate, or
choose another footprint. Clicking or keyboard-activating it navigates to the same dedicated Studio
Development screen used outside the lot. The lot remains a navigation layer and never debits cash or
applies the construction action itself. It may animate workers or a build reveal as decoration,
but animation never changes status, timing, price, capacity, or completion and freezes under reduced
motion. Reload derives the depiction from V11 state rather than replaying an unpersisted ceremony.
The former `expansion-info` placeholder route is replaced, not retained in parallel:
`view-expansion` resolves to the `studioDevelopment` route with the canonical navigation label
`Open Studio Development`.

## Accessibility and interaction law

The start command is a native button with the full price and Annex name in its accessible context.
Affordability, Building, and Operational states are communicated in text and not color alone.
Construction progress has a textual `N of 13 weekly advances complete` alternative; any visual
progress element carries the same value and an accessible name. Visible keyboard focus, logical
heading order, one page `h1`, and named regions are required.

After a successful start, focus moves to the same project's Building status and a polite atomic
live region announces the exact cash debit and due week. After the completion advance, focus follows
the ordinary weekly-summary flow; returning to the Calendar or lot announces Operational and the
new capacity. If a stale start command rejects, focus remains on the owning section and the exact
live core reason is announced. Reduced motion removes decorative construction/reveal motion without
hiding progress or changing timing.

At 1280×720, 1366×768, 1440×900, and 1920×1080, including 125% zoom, the price, state, progress,
completion week, and action/reason must not clip, overlap, or require horizontal page scrolling.
The lot's canvas state also has an ordinary DOM text equivalent and every construction operation
remains reachable through Studio Calendar.

## Required verification gates

- exact start legality at $780,000 and rejection at $779,999; one atomic debit/ledger/project/parcel
  transition; input immutability; no RNG change; and loud repeat/stale/legacy rejection;
- start at Week 0 and a nonzero Week `S`; no facility through 12 advances; exact completion on the
  thirteenth; completion after that advance's script/casting/production allocation; immediate
  visible-week action access; and held-production access only on a following advance;
- strict zero marginal opex before, during, and after completion, with unchanged payroll/base
  overhead and no completion debit;
- exact configured allocation order, three-owner collision safety, no reservation migration, and
  cancellation/release behavior unchanged after the Annex is in use;
- complete cash/ledger/Finance/period/weekly/recap reconciliation, explicit exhaustive-switch
  ownership, and exclusion from film commitment, fixed-cost allocation, publicity, recurring burn,
  and `otherCash`;
- strict SaveFileV11 validation at Vacant, Building, and Operational states; export/import/replay at
  Week `S`, `S + 12`, and `S + 13`; frozen V1–V10 builders; deterministic V1–V10 migration; legacy
  truth; idempotence; input immutability; and downgrade rejection;
- pure construction read model, exact Calendar completion commitment/order, exact facility-board
  transition, sim-to-event/weekly-summary stop and one-time completion notice, Finance/Recap labels,
  Dashboard non-lot route, and one owning action;
- Studio Lot identity/state parity, reload truth, keyboard access, focus/live-region behavior,
  reduced motion, no-color-only status, responsive layouts, zoom, and clipping checks;
- current managed workflows and legacy/headless/D-16/D-17 behavior outside the explicitly started
  Annex path remain unchanged; and
- full core and UI suites, root/UI typecheck, production build, governed D-16 harness, deterministic
  replay, `git diff --check`, clean worktree, and unchanged protected branches.

No implementation or closure commit is permitted with an unresolved P1–P3 core, statistical,
accounting, save/migration, or player-experience finding.

## Explicitly open after V1

- cash runaway;
- top-studio economic immortality;
- week-208 synchronized roster wall;
- P5 dominance;
- world-led variance;
- cheap-film purpose;
- premium-film purpose;
- remaining menu breadth;
- formal G12 timing;
- whether any fourth Development & Casting slot ever becomes valuable;
- construction catalogues, additional parcels, placement, rotation, relocation, demolition, queues,
  concurrent projects, land purchase, roads, paths, distance, attractiveness, and prestige;
- facility quality, upgrades, decay, repairs, maintenance, utilities, staffing, builders, janitors,
  morale, research, and operating-cost attribution;
- expansion of soundstage, scenery, or post before new authoritative demand exists;
- raising the two-production ceiling, future scheduling, priority controls, or reservation queues;
- broad return-on-investment, throughput, or macroeconomic certification; and
- a believable size-scaling cash sink after richer facility/capacity/construction systems exist and
  are remeasured.

D-17B remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

No financing, loans, bailouts, restructuring, arbitrary cash sink, forced bankruptcy, hard
game-over, or failure ladder is authorized by this contract.
