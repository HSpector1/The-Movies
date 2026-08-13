# Studio Calendar & Capacity Board V1 Closure

Status: **IMPLEMENTED, VALIDATED, AND CLOSED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-13

Branch: `operation-hollywood-autonomous-marathon`

Implementation candidate: `b51df457c5f456baa79894c197dfd7c60a5b481f`

## Result

Studio Calendar & Capacity Board V1 adds one read-only operating surface that answers the studio
manager's immediate planning questions without inventing a second scheduler:

1. what requires attention now;
2. what occupies each real facility slot now; and
3. what work, receipts, release boundaries, and staffing dates are already visible.

The core owns one pure `studioCalendar(state)` projection. The Dashboard preview and full Calendar
render that projection and route the player to the existing owner of every action. Opening,
rendering, and navigating the Calendar apply no engine action and change no save bytes.

This is a successful studio-wide planning and instrumentation foundation. It is not manual
scheduling, future facility reservation, construction, facility economics, or certification that
the accepted D-17B macroeconomic residuals are solved.

## Authority and committed lineage

| Purpose | Commit |
| --- | --- |
| Accepted D-17B + Operation Hollywood history integration | `4432a9befef578ac3549896c2796bf0a22950ec0` |
| Production Operations V1 closure | `28cb711b620ee59cfec7e84b506489de0e9979ac` |
| Script Projects V1 closure | `622749d4116ef15dbf858f9d0f527d92563ee271` |
| Casting Sessions V1 closure | `6a1b57c91bbc4323971ab141823df246de58f6ac` |
| Frozen Studio Calendar V1 contract | `9bd297517d53b8303a1d795fe885bc8e85d94c5a` |
| Core projection, player UI, hardening, and regressions | `b51df457c5f456baa79894c197dfd7c60a5b481f` |

The implementation follows `docs/STUDIO-CALENDAR-V1-CONTRACT.md`; that contract remains unchanged
at closure.

## Engine and time law delivered

- `studioCalendar(state)` returns fresh, narrow values and mutates no input, consumes no RNG, and
  exposes no hidden talent, screenplay, reception, seed, or random-stream truth.
- `state.market.tick` remains the only clock. Draft and Rewrite dates use persisted `dueWeek`;
  Auditioning uses persisted `dueWeek`; contracts retain their half-open end; and active theatrical
  runs expose every unpaid locked receipt at the exact visible arrival boundary.
- Studio Revenue is exactly `weeklyGross[index] × studioShare`. Calendar copy never renames gross
  as revenue and never moves a payment to a fictional current-week label.
- Every active production exposes its exact countdown and present phase. Its release week is
  explicitly conditional on commands and facility allocation, using the governed skip-first-tick
  law. A hold moves only that conditional boundary later.
- Committed events and conditional production boundaries are distinct in both the typed projection
  and the player copy. Same-week events retain their individual identities.
- `nextStudioDecision(state)` remains the sole cross-system decision selector. Screenplay Review,
  Casting Review, and Production Operations preserve the governed priority and ascending durable
  identity. The Calendar projects that choice; it never invents or duplicates a command.
- Casting Review selection was hardened at its owning boundary to sort by session ID rather than
  stored array order. This repaired a latent canonicality defect shared by the Calendar and Casting
  Room without creating a Calendar-specific priority law.

## Capacity and staffing result

- Every configured managed facility and every physical slot appears in canonical facility-ID and
  slot order. Facility identity, name, capability, owner kind, owner ID, title, and current activity
  remain exact through core, adapter, and React.
- Production, active screenplay, and Auditioning reservations form one collision set keyed by exact
  `(facilityId, slot)`. A duplicate throws. Active script or casting work without its required
  Development & Casting reservation also throws rather than disappearing from the board.
- The Calendar reuses the complete Production Operations invariant for phase reservations,
  shooting-task ownership, locked director, soundstage destination, and blocker identity. A
  malformed workflow cannot advertise a command the authoritative selector rejects.
- Only current reservations appear occupied. Future phase needs, retries, possible scripts, and
  possible auditions are not painted as bookings.
- Every active contract exposes current weekly salary, remaining weeks, renewal-window opening,
  and exclusive end. The busiest exact expiry cluster reports count, current-roster share, associated
  weekly payroll, and talent IDs without predicting departures.

## Player delivery

- Dashboard gains a prominent Studio Calendar preview with current week, next decision, next
  committed boundary, facility utilization, and busiest staffing expiry.
- The full screen has one focused `h1` and five named regions: Needs attention, This week on the
  lot, Committed schedule, Production outlook, and Staffing horizon.
- Exact occupancy is readable as text and cards. Soundstage 7 and Soundstage 12 remain distinct;
  empty slots are explicit.
- Repeated buttons have target-specific accessible names while retaining concise visible labels.
- Calendar routes use durable IDs and land on the existing Writers Room, Casting Room, Production
  Board, theatrical run, or roster card. The destination's current read model owns legality.
- Focus moves to the exact live action or status. If the named identity disappears, focus moves to
  the destination heading, whose empty/current state remains truthful.
- Legacy studios receive an explicit legacy label, no invented managed facilities, and truthful
  existing production, theatrical, and staffing clocks where those facts exist.
- Responsive cards produce no horizontal page overflow or clipped controls at the governed desktop,
  125%-equivalent, and narrow mobile viewports.

## Red-team repairs incorporated

Independent core, UI, and integration reviews found no P1. Before closure the implementation fixed
and proved these P2 boundaries:

1. Casting Review priority depended on stored session array order instead of ascending session ID.
2. A malformed shooting task could appear decision-required in the Calendar even when the one
   authoritative selector rejected its ownership correlations.
3. Active screenplay or casting work with a missing/wrong-capability reservation could be omitted
   instead of rejected at the read boundary.
4. A renewal opening at the current week could be described as the next future boundary.
5. Staffing cards used ambiguous inclusive-looking end copy instead of naming the exclusive end.
6. Exact facility/occupant rendering, disappeared-target focus fallback, live legality, and full
   App navigation byte-neutrality lacked direct closure evidence.
7. Receipt and Week-208 event fixtures described the right values but did not yet reconcile them
   one transition at a time against the real ledger, payroll, and contract-expiration tick.

The final independent review reported **PASS — no remaining P1–P3 findings**.

## Verification at the implementation candidate

| Gate | Result |
| --- | --- |
| `npm test -- --reporter=dot` | **PASS — 135/135 files, 1,671/1,671 tests** |
| Calendar core tests | **PASS — 10/10 tests** |
| Calendar UI tests | **PASS — 13/13 tests** |
| `npx vitest run --config src/harness/d16/vitest.d16.config.ts --reporter=dot` | **PASS — 10/10 files, 176/176 tests** |
| `npm run typecheck` | **PASS — root and UI TypeScript clean** |
| `npm run build` | **PASS — 126 modules transformed** |
| `git diff --check` | **PASS** |

The production build retains the pre-existing large-chunk advisory; it is not a build failure and
was not introduced as a Calendar correctness issue.

## Live acceptance

A real in-app Chromium session recovered managed `studio-001` at Week 0. The Dashboard preview
reported one of eight slots occupied and the next exact Week-1 commitment. Opening the Calendar
focused `Studio Calendar & Capacity Board`, exposed exactly one `h1` and five named regions, and
showed the real screenplay in Development & Casting alongside seven available slots. Soundstage 7
and Soundstage 12 remained separate named facilities.

The screen labelled committed work and conditional outlook independently, rendered all six
contracts with `Renewal opens Week 40 · exclusive end Week 52`, and described the 6-of-6 Week-52
cluster as an observation rather than a departure forecast. Following the exact Week-1 screenplay
row opened Writers Room and focused that screenplay's live Drafting status.

At 1280×720, 1366×768, 1440×900, and 1920×1080, their CSS-equivalent 125% viewports, and 375×667,
the document width equalled the viewport width, no Calendar region overflowed, and no button was
clipped. Runtime console warnings and errors were empty.

## Observatory boundary

The optional generated managed-operations observatory did not ship in this slice. An early draft
was rejected before integration because it introduced an oversized parallel schema without tests
or adapter reconciliation. No evidence from that draft is cited.

V1's authoritative Calendar itself is the first instrument-first surface. A future study may
consume this projection under a separately frozen contract and write generated rows only under
ignored `out/`, with provenance and raw-row reconciliation. No cost, price, construction rule, or
causal economic claim is inferred here.

## Explicitly open

- manual scheduling, priorities, future reservations, simultaneous commands, and production queues;
- construction, expansion, facility purchase, operating cost, staffing, quality, maintenance,
  upgrades, depreciation, and land constraints;
- rehearsal choices, editing choices, reshoots, locations, release-date strategy, distribution,
  and exhibition negotiation;
- richer crews, departments, offices, assistants, agents, attachments, holds, options, and contract
  negotiation; and
- D-17B residuals: cash runaway, top-studio economic immortality, the Week-208 synchronized roster
  wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu
  breadth, and formal G12 timing.

No financing, loans, bailouts, restructuring, arbitrary cash sink, hard bankruptcy, or failure
ladder was introduced.

## Git and publication boundary

The implementation and this closure live only on `operation-hollywood-autonomous-marathon`. Main,
the accepted D-17B branch, and the Operation Hollywood integration branch remain at their protected
baselines. Nothing was pushed. No milestone tag is created: current repository tags mark
Owner-accepted or merged milestones, and this autonomous branch has not crossed that gate.

The closure commit is documentation-only. Its exact documents are:

- `docs/STUDIO-CALENDAR-V1-CLOSURE.md`;
- `docs/LESSONS-LEARNED.md`; and
- `docs/art/OPERATION-HOLLYWOOD-ENGINE-BRIDGE.md`.

## Next authorized marathon move

Freeze a separate facility/capacity/construction research contract before changing behavior. It
must begin from the Calendar's measured current-resource truth, establish the player fantasy and
authoritative facility lifecycle, and identify which capital and operating costs arise naturally
from that system. It may not reverse-engineer an arbitrary cash sink, tune the accepted economy,
or introduce financing and the failure ladder.
