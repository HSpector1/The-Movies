# Casting Sessions V1 Contract

Status: autonomous-marathon implementation contract

Date: 2026-08-13

Authority base: accepted D-17B, closed Production Operations V1, closed Script Projects V1, and
canonical Lessons Learned

## Purpose

Add the smallest authoritative casting-room loop that turns actor choice from a single ranking-list
click into an optional studio decision with time, shared facility capacity, imperfect evidence, and
an explicit review:

`Plan slate → Audition (1 week) → Review evidence → Complete → Assemble package`

The session is a camera test, not a contract negotiation or talent hold. It gives the player
additional complementary role-specific evidence before package assembly while leaving final
casting authority in Assembly.
This slice does not add casting directors, callbacks, chemistry reads, negotiations, availability
holds, actor fees, automatic winners, or another speculative cash charge.

## Compatibility and activation boundary

SaveFileV1 through SaveFileV9 remain frozen. `GameStateV9` is anchored before the new root is added,
and `SaveFileV9.state` points to that frozen type. SaveFileV10 adds exactly one root
`castingSessions` field.

V9-to-V10 migration adds fresh `{ mode: 'legacy', sessions: [] }`. It never infers auditions from
scripts, active productions, participants, talent, concepts, or released films. Migration preserves
RNG state, input immutability, and exact continuation behavior.

Legacy casting mode adds no gate to the existing script-to-Assembly path. Headless agents, the
D-16/D-17 harness, and all migrated V1-through-V9 saves therefore retain their prior behavior until
the feature is explicitly activated.

New player studios activate managed Production Operations, managed Script Development, and managed
Casting Sessions together at the existing post-founding boundary. A migrated studio may explicitly
activate Casting Sessions when Production Operations and Script Development are already managed.
Activation creates no history and need not require an empty production slate because auditions are
optional, forward-only evidence.

## Authoritative state

```text
CastingSessions
  mode: legacy | managed
  sessions: CastingSession[]

CastingSession
  id: casting-0000, casting-0001, ...
  projectId
  status: auditioning | review | complete
  slate:
    lead: exactly two talent IDs
    antagonist: exactly two talent IDs
    support: exactly two talent IDs
  startedWeek
  dueWeek: null | authoritative completion week
  reservation: null | Development & Casting reservation
  results: null | role-keyed persisted AuditionResult pairs

AuditionResult
  talentId
  estimate: integer 0..100
  low: integer 0..100
  high: integer 0..100
```

Sessions are append-only, stored in canonical ascending ID order, and retain exact slate order.
Each managed screenplay project may own at most one session. V1 has no cancellation, deletion,
rerun, callback, replacement, or reused session ID.

Lifecycle correlations are exact:

| Status | Due week | Reservation | Results | Screenplay status |
| --- | --- | --- | --- | --- |
| Auditioning | start week + 1 | one Development & Casting slot | none | Ready |
| Review | none | none | complete role-keyed pairs | Ready |
| Complete | none | none | unchanged complete pairs | Ready, In Production, or Produced |

Acknowledging Review changes only the session status to Complete. It consumes no time, cash,
capacity, or RNG. Package assembly is available when a Ready screenplay has no session or its
session is Complete; it is blocked while that project's session is Auditioning or awaiting Review.

## Slate and eligibility law

A slate contains exactly two distinct candidates for each of Lead, Antagonist, and Support. The
same person may appear in more than one role pair, but the complete slate must contain at least
three distinct people. Because every role pair has size two, that final condition is the exact Hall
matching guard: at least one assignment of three different actors across the three roles must exist.
This keeps small studios viable while preventing an audition slate that could never form a legal
cast on its own.

At session start, every candidate must:

- exist in authoritative talent state and have Actor as their primary role;
- be either currently contracted by the studio or present in the current freelancer market;
- be available under the ordinary production busy check; and
- not be the screenplay's locked writer.

Primary-Actor eligibility is a bounded V1 Casting Room source-pool rule, not a rewrite of engine
casting legality. The existing greenlight law may still accept a currently legal cross-discipline
performer with an acting profile even though V1's audition planner does not discover that person.

Eligibility and the three-person matching guard are checked atomically when the action starts. A
casting session does not reserve, contract, pay, or mark a candidate busy. One candidate may
therefore appear in another session or take other legal work after the audition begins. Later
unavailability never invalidates historical results and never creates a package deadlock: Assembly
rechecks ordinary current greenlight law and the player may select an auditioned or unauditioned
legal actor.

Session invariants retain durable identity facts—existing talent references, Actor primary role,
writer exclusion, exact pair sizes, and within-role distinctness—but do not pretend that a later
save can reconstruct the market and assignment facts that held when the session began.

## Shared Development & Casting capacity

Starting a session reserves exactly one `development-casting` slot for one calendar week.
Allocation is deterministic by ascending facility ID and then ascending slot. Casting reservations,
screenplay Draft/Rewrite reservations, and Production Operations reservations share one collision
set and may never occupy the same `(facilityId, slot)` pair.

The start action rejects atomically when no slot is free. V1 adds no hidden queue, priority policy,
or non-actionable capacity blocker. On a weekly tick, due screenplay work resolves first, then due
casting sessions resolve, then managed productions allocate or advance from the union of the
remaining screenplay and casting reservations. A just-completed one-week activity therefore
releases capacity before production allocation in that same visible week.

This remains infrastructure, not a cash sink. A casting session adds no fee, ledger kind, signing
charge, or cash debit. Existing contract payroll and studio overhead continue while the world moves
one week; that time and shared capacity are the bounded economic consequences.

## Audition observation law

Completion computes a separate role-specific camera-test observation for every stored slate entry.
Core first extracts one shared pure cast-slot execution rule and uses it in forecast, reception, and
casting so the existing film formulas do not fork:

```text
slotExecution(use) =
  0.60 × effectiveSkill(actor, acting, locked project, slot, use)
  + 0.40 × 100 × roleFit(actor actual persona, concept role requirement)
```

Forecast continues to use perceived acting skills, reception continues to use actual acting skills,
and the refactor must be behavior-identical. As in the existing simulation law, role fit reads the
actor's actual persona in both paths. No claim may describe the existing Project Fit metric or the
complete forecast input as perceived-only while that persona rule remains authoritative.

An audition is a noisy observation of the actual role execution, not a second forecast:

```text
z = stream(seed, "casting-v1", sessionId + ":" + talentId + ":" + slot)
      .gaussian(0, 3)

estimate = round(clamp(slotExecution("actual") + z, 0, 100))
low      = max(0, estimate - 6)
high     = min(100, estimate + 6)
```

Each result uses its own versioned derived stream key, so slate traversal order cannot change any
observation. Completion never advances `state.rngState`. The estimate and band are persisted once;
future talent development, tuning, or display changes cannot rewrite historical evidence.

Only `talentId`, `estimate`, `low`, and `high` are persisted in an AuditionResult. Hidden slot
execution, actual skills, ceilings, persona values, seed, and RNG state do not cross the player read
boundary. Read models label the score `Est.` and explain that the band is camera-test evidence, not a
guarantee. A result has `low <= estimate <= high`, with endpoints exactly clamped at estimate ± 6.

Calibration used 50 deterministic worlds, the first ten distinct generated
concept/shape/promise contexts in each world, all 28 generated primary Actors, and all three slots:
42,000 candidate-role observations and 567,000 unordered pair comparisons. The perceived
slot-execution counterpart had mean absolute error 1.221 and p90 2.525 against actual execution;
the rounded sigma-3 audition had mean absolute error 2.390 and p90 4.920. Its ±6 band contained
truth in 95.562% of observations.

For the realistic decision point consisting of the top two candidates under current Project Fit,
Fit alone selected the actual-best of the pair 82.267% of the time, the audition estimate alone
selected it 84.767%, and the arithmetic mean of the two same-scale scores selected it 86.467%,
scoring score ties as half-correct. Mean actual-execution regret within those pairs was 0.461 for
Fit, 0.321 for audition alone, and 0.242 for the arithmetic mean. That mean is calibration evidence,
not a new displayed score or automatic recommendation: the UI keeps Fit and audition evidence
adjacent and lets the player interpret both.

The evidence proves a bounded, complementary, non-dominant information gain. It does not certify
that the modest execution improvement economically repays one calendar week, payroll, overhead,
and one of two shared slots in every studio situation. V1 therefore remains optional and leaves its
long-run strategic value for remeasurement in the richer operating studio.

## Package and production integration

Auditions are advisory. They do not alter a screenplay assessment, production forecast, reception,
actor development, fame, contracts, standing, marketing, or box office. They do not preselect,
reserve, rank, sign, or auto-cast a winner.

Before a session starts, a Ready screenplay retains the direct `Open package` action as well as
`Plan auditions`. Core rejects managed project greenlight while that project's session is
Auditioning or Review. Acknowledgement is always legal so a changed staffing condition can never
trap the decision stop. If the existing project-aware package gate is then clear, the UI routes to
Assembly; otherwise it remains in Casting Room and names the ordinary blocker and remedy. Once the
gate clears, `Open package` enters Assembly with Lead, Antagonist, and Support blank.

Assembly shows the complete persisted evidence beside its ordinary candidate tools, including
evidence for candidates who are no longer available. Current legality—not the historical slate—
controls selection and greenlight.

Greenlight links the screenplay to production exactly as Script Projects V1 already requires. The
casting session remains attached only to the screenplay project; it gains no production ID and
survives cancellation, re-greenlight, and release as immutable studio history.

## Decision ordering and player read boundary

The single deterministic studio-decision selector orders actionable screenplay reviews first,
casting reviews second, and Production Operations commands third, with IDs ascending within each
class. Sim-to-event stops once when a session enters Review. Capacity unavailability and an already
Complete session are not event stops.

The Casting Room exposes:

- Ready screenplay projects that can plan auditions, active sessions, and review/history sections;
- exact shared Development & Casting occupancy and capacity across all three authoritative owners;
- a role-by-role slate planner with exactly two candidates per role and explicit availability;
- the exact one-week, one-slot, no-fee, no-hold consequence before confirmation;
- due week and persistent status while work is underway;
- only estimated evidence, with a labelled band and plain-language strengths or concerns; and
- an always-legal Review acknowledgement labelled `Take results to Package` when the package gate
  is clear, otherwise `Finish casting review`; the former completes review and routes to blank
  Assembly without selecting a winner, while the latter completes review and shows the named
  package blocker and remedy.

Writers Room keeps both the direct package route and the optional Casting Room route. Dashboard and
the Studio Lot's Casting / Talent building gain a real Casting Room route; managed casting attention
must not point to the Roster while claiming an audition needs action. Roster and profiles remain
available as separate talent-management surfaces.

Native grouped controls expose pressed state and announce the exact selected count. When starting
or acknowledging a session removes an action, focus moves to the successor status or command for
that same project and a polite atomic live region announces the result. Evidence and availability
must be communicated in text, not color alone. No hidden actual value may reach DOM text,
attributes, accessible names, test IDs, or serialized UI props.

## SaveFileV10 validation boundary

V10 validation is strict and exact-keyed. It first validates the exact frozen V9 projection, then
rejects missing/extra casting fields, unknown modes or statuses, malformed integers, noncanonical
IDs/order, duplicate project sessions, dangling project/talent/facility references, non-Actor or
writer candidates, malformed/distinctness-or-matching-violating slates, lifecycle-correlation
violations, result/slate order disagreement, invalid estimate bands, future start weeks, and any
three-way facility-slot collision.

Frozen save builders use positive projections. `makeSaveV8` writes exactly V8 roots;
`makeSaveV9` writes exactly V9 roots; neither may leak a newer field from live state. `makeSaveV10`
writes the current root. `convertV9ToV10` deep-clones validated input, adds a fresh legacy-empty
casting state, preserves RNG bytes, and does not mutate its argument. `migrateToV10` passes V10 by
identity and migrates V1-through-V9 forward. Historical `migrateToV8` rejects V9/V10 and historical
`migrateToV9` rejects V10 rather than silently downgrading either.

## Required verification

- lifecycle, exact slate law, start-time eligibility, purity, deterministic observation, stable
  result persistence, review acknowledgement, and append-only history;
- shared capacity in all three directions, collision validation, and deterministic tick release
  before production allocation;
- no candidate busy/reservation/payroll/ledger effects, no auto-cast, ordinary current package
  legality, stale evidence visibility, cancellation/release history, and no deadlock;
- behavior-identical forecast/reception cast-execution refactor and unchanged legacy path;
- strict SaveFileV10 validation, frozen V8/V9 positive projections, migration immutability,
  RNG-byte preservation, and export/import/replay at every session status;
- Casting Room, Writers Room dual route, blank managed Assembly, Dashboard, lot route/attention,
  weekly-summary decision, responsive layout, focus, accessibility, and information integrity;
- full core/UI suite, root and UI typecheck, production build, governed D-16 harness, and
  `git diff --check`.

## Explicitly open after V1

- casting directors, assistants, offices, departments, casting budgets, and studio relationships;
- callbacks, chemistry reads, screen tests with scenes, ensembles, supporting-role breadth,
  attachments, holds, exclusivity, negotiations, offers, agents, and contract terms;
- audition discovery for cross-discipline performers outside the primary-Actor planner pool;
- reruns, canceled sessions, replacements, automatic recommendations, and audition development;
- actor schedule planning, production calendars, manual facility scheduling, and prioritization;
- facility construction, upgrades, quality, maintenance, operating costs, and the believable
  size-scaling capital sink;
- formal casting-session cost-benefit and long-run strategic-value certification;
- every D-17B macroeconomic residual retained in the Production Operations and Script Projects
  closures.

No financing, loans, bailouts, restructuring, arbitrary cash sink, hard bankruptcy, or failure
ladder is authorized by this contract.
