# Script Projects V1 Contract

Status: autonomous-marathon implementation contract

Date: 2026-08-13

Authority base: accepted D-17B, closed Production Operations V1, and canonical Lessons Learned

## Purpose

Replace the managed player's free, infinitely reusable concept-to-greenlight shortcut with the
smallest authoritative screenplay-development loop that creates planning, staff, capacity, and
review decisions:

`Commission → Draft (1 week) → Review → Accept or one Rewrite (1 week) → Ready → Production → Produced`

This slice makes a screenplay a saved studio asset and makes a writer's time visible. It does not
add screenplay prose generation, acquisitions, script sales, co-writers, coverage staff, facility
construction economics, or another speculative cash charge.

## Compatibility and activation boundary

SaveFileV1 through SaveFileV8 remain frozen. The current V8 state is first re-anchored as
`GameStateV8`; no script field may leak into V8's recursive state shape. SaveFileV9 adds one root
`scriptDevelopment` field.

V8-to-V9 migration adds exactly `{ mode: 'legacy', projects: [] }`. It never infers scripts from
active productions, operations workflows, concepts, participants, or released films. The migration
preserves RNG state, input immutability, and the exact continuation of existing productions.

Legacy script mode retains the current direct `greenlight` action and concept-to-package UI. The
headless agents and D-16/D-17 harness remain legacy and behaviorally unchanged.

New player studios activate managed Production Operations and managed Script Development together
at the existing post-founding activation boundary. A migrated studio may explicitly activate Script
Development only when its active production slate and project list are empty. Activation never
converts history.

## Authoritative state

```text
ScriptDevelopment
  mode: legacy | managed
  projects: ScriptProject[]

ScriptProject
  id: script-0000, script-0001, ...
  conceptId
  writerId
  shape
  promise
  status: drafting | review | rewriting | ready | inProduction | produced
  rewriteCount: 0 | 1
  commissionedWeek
  dueWeek: null | authoritative completion week
  assessment: null | { actualStrength, perceivedStrength }
  reservation: null | Development & Casting reservation
  productionId: null | authoritative production id
```

Projects are append-only and stored in canonical ascending ID order. One source concept may seed at
most one managed script project; V1 does not support remakes, abandonment, deletion, or replacement.
Legacy concepts retain their existing reusable behavior.

Lifecycle correlations are exact:

| Status | Rewrite count | Due week | Assessment | Reservation | Production link |
| --- | ---: | --- | --- | --- | --- |
| Drafting | 0 | commission week + 1 | none | one Development & Casting slot | none |
| Review (first draft) | 0 | none | present | none | none |
| Rewriting | 1 | request week + 1 | prior assessment present | one Development & Casting slot | none |
| Review (final draft) | 1 | none | updated assessment present | none | none |
| Ready | 0 or 1 | none | present | none | none |
| In Production | 0 or 1 | none | present | none | exact active production |
| Produced | 0 or 1 | none | present | none | exact released film |

`dueWeek` is persisted because one calendar week is authoritative state, not an inference from status
or `commissionedWeek`; rewrite timing begins later and cannot be reconstructed from either. It is
present only for Drafting/Rewriting and clears atomically when work enters Review.

## Commission and writer law

Commissioning locks one source concept, one creative shape, one audience promise, and one writer.
These are screenplay facts. Package assembly may not replace them later.

The writer must be currently contracted, must carry the writing skill profile, and must not already
be assigned to an active production or active script task. Cross-discipline careers remain legal:
the person's primary role label does not override their actual writing discipline. Freelance script
commissions are outside V1.

Drafting and rewriting make the writer busy. Review and Ready release the writer. Talent assignment
truth is generalized across scripts and productions so the Roster, Talent Hub, profile, pickers, and
actions all give one named reason such as “Drafting *Title*,” “Rewriting *Title*,” or “Working on
*Title*.” No surface may say “busy until release” for screenplay work.

Early contract release rejects while a writer is drafting or rewriting. Natural expiry is safe
because a one-week script task resolves before the end-of-tick expiry boundary. A Ready project's
writer must be contracted and otherwise available again at greenlight; otherwise the project stays
Ready and the package gate names the remedy.

## Shared Development & Casting capacity

Drafting or rewriting holds exactly one `development-casting` slot. Review, Ready, In Production,
and Produced hold none. Script reservations and production-workflow reservations share the same
facility inventory and may never collide on `(facilityId, slot)`.

Allocation is deterministic: ascending facility ID, then ascending slot. Commission and rewrite
reject atomically when no slot is free; V1 adds no hidden queue and no non-actionable script
blocker. On a weekly tick, completing script work releases its slot before managed productions
attempt their next phase allocation, so a just-finished draft can honestly free capacity that week.

This remains infrastructure, not a cash sink. A commission or rewrite adds no acquisition fee, no
new ledger kind, and no cash debit. Contract payroll and studio overhead continue while the week
passes; that time cost is the bounded V1 economic consequence.

## Assessment and rewrite law

The first draft resolves deterministically on the next weekly tick and consumes no RNG stream.
Actual and perceived strength are computed separately with the existing project-specific writing
skill path:

```text
firstDraftStrength =
  0.60 × concept baseline strength
  + 0.40 × writer effective writing skill for the locked concept/shape/promise
```

The actual score reads actual writing skills; the studio estimate reads perceived writing skills.
Both are clamped to `[0, 100]` and persisted. The UI receives only the perceived score and labels it
`Est.`; actual strength, actual skills, ceilings, RNG, and hidden concept quality never cross the
read boundary.

At the first review the player may Accept or request one final rewrite. Requesting a rewrite
immediately increments `rewriteCount` to 1, reserves capacity, and makes the writer busy. The next
tick updates each strength independently from that score and the matching actual/perceived
`rewriting` skill:

```text
rewriteDelta = clamp(
  (rewritingSkill − 40) × (100 − currentStrength) / 240,
  −3,
  +8
)

rewrittenStrength = clamp(currentStrength + rewriteDelta, 0, 100)
```

The law is headroom-limited and can worsen a script in weak hands. A 100-seed measurement across
36,000 generated primary-writer/concept pairs produced median change `+3.15`, p90 `+6.38`, maximum
`+8`, and 11.25% negative changes. This is bounded evidence, not an economy certification.

After the final rewrite, Accept is the only lifecycle action. Accepting either review changes the
project to Ready without consuming time, cash, capacity, or RNG.

## Package and production integration

Managed Script Development rejects the raw direct-greenlight action. A separate ready-project
greenlight command accepts the project ID plus director, cast, craft, and budget choices. Core copies
the locked concept, shape, promise, and writer into the production; React cannot substitute them.

All existing production legality remains in force: participant uniqueness, current writer
availability and contract, staffing sources, one craft lead, production concurrency, freelancer
fees for other eligible assignments, solvency, forecast locking, exact facility allocation, and
Production Operations workflow creation.

Greenlight changes the project to In Production and records the exact production ID atomically.
Cancellation returns that project to Ready and clears its production link. Release changes it to
Produced and retains the link as history. Every active production in managed script mode has exactly
one In Production project; older released films need not gain invented projects.

For a linked managed production, forecast uses the persisted perceived script strength and release
uses the persisted actual script strength in place of recomputing the writer/concept blend. All
other forecast and reception formulas remain unchanged, including the concept-based potential
appeal rule. Production and FilmResult schemas remain frozen; the link lives only in ScriptProject.

## Decision ordering and player read boundary

Core exposes read models and commands, never mutable `GameState`. A single deterministic studio
decision selector orders actionable reviews first, then Production Operations commands, each by
ascending project or production ID. Sim-to-event stops at that first actionable decision. Capacity
unavailability alone is not an event stop.

The Writers Room exposes:

- exact Development & Casting occupancy and capacity;
- Needs Review, In Development, Ready to Package, and Production History sections;
- title, genre, writer, lifecycle, one-week consequence, and only legal actions per project;
- a clearly tagged estimated assessment with strengths/concerns derived by core;
- a Commission flow for concept, story shape/audience promise, writer, and confirmation;
- a Ready action that opens package assembly with concept/shape/promise/writer locked.

Dashboard and the Development & Casting lot building route to Writers Room, not directly to managed
Assembly. Lot attention priority is engine-derived: review required, capacity constraint, active
draft/rewrite, ready scripts, then idle. No new Hollywood character animation is required in V1.

When an action replaces itself, focus moves to the successor command or persistent status for that
exact project, and the result is announced through a polite atomic live region. Multi-project tests
must prove focus never jumps to a different card.

## SaveFileV9 validation boundary

V9 validation is strict and exact-keyed. It rejects missing/extra fields, malformed numbers,
unknown statuses, noncanonical IDs/order, duplicate concepts/projects/production links, dangling
concept/writer/facility/production references, lifecycle-correlation violations, invalid shape or
promise, non-finite/out-of-range assessments, future commission weeks, reservation collisions,
active script writers without contracts, and package fields that disagree with their linked project.

`makeSaveV8` explicitly strips the V9 field from a live V9 state. `convertV8ToV9` deep-clones the
validated input, adds a fresh legacy-empty script state, preserves RNG bytes, and does not mutate its
argument. `migrateToV9` passes V9 by identity and migrates V1–V8 forward. Historical `migrateToV8`
remains a pre-V9 boundary and must never silently downgrade a V9 save.

## Required verification

- lifecycle, legality, purity, no-RNG, assessment split, rewrite bounds, and append-only history;
- shared capacity in both directions and deterministic simultaneous tick order;
- generalized writer assignment, early release, natural expiry, cancellation, and release cleanup;
- strict V9 validation and byte-identical export/import/replay at every lifecycle status;
- deterministic, nonmutating V1–V8→V9 migrations and explicit V8 frozen projection;
- legacy raw greenlight unchanged; managed raw greenlight impossible; project package copying exact;
- Writers Room, managed Assembly gate, Dashboard, lot routing/attention, save notices, focus, and
  information-integrity regressions;
- full core/UI suite, root+UI typecheck, production build, governed D-16 harness, and `git diff --check`.

## Explicitly open after V1

- screenplay prose, pitches, genres beyond the existing concept set, co-writers, script editors,
  coverage departments, acquisitions/options, script sales, turnaround, remakes, and abandonment;
- multiple or branching rewrites, notes categories, rewrite fees, writer development from script
  work, and negotiations/credit arbitration;
- manual facility scheduling, production priority, construction, upgrades, operating costs, and the
  believable size-scaling capital sink;
- migrated-history conversion into managed scripts;
- every D-17B macroeconomic residual retained in the Production Operations closure.

No financing, loans, bailouts, restructuring, acquisition mechanic, arbitrary cash sink, hard
bankruptcy, or failure ladder is authorized by this contract.
