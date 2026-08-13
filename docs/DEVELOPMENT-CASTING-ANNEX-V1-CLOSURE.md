# Development & Casting Annex V1 Closure

Status: **IMPLEMENTED, VALIDATED, AND CLOSED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-13

Branch: `operation-hollywood-autonomous-marathon`

Implementation candidate: `babfb874076055f5e8bb545eb1a96296e8accb76`

## Result

Development & Casting Annex V1 delivers the one physical investment supported by the reviewed
Facilities & Construction observatory:

`Vacant expansion parcel → $780,000 atomic commitment → 13 weekly advances → one additional shared Development & Casting slot`

The Annex is optional, fixed to one parcel, non-repeatable, and permanent after completion. It
reduces supported screenplay/casting capacity friction; it does not raise the two-film production
ceiling, shorten any task, guarantee another release, promise a return, or certify the wider
economy. Direct-package play may rationally decline to build it.

No financing, loan, bailout, restructuring, failure ladder, arbitrary recurring charge, or
manufactured cash sink was introduced. The measured marginal Annex operating cost remains exactly
$0/week because V1 owns no attributable facility worker, utility, maintenance, floor-area, or
service resource.

## Authority and committed lineage

| Purpose | Commit |
| --- | --- |
| Accepted D-17B + Operation Hollywood history integration | `4432a9befef578ac3549896c2796bf0a22950ec0` |
| Studio Calendar & Capacity Board V1 closure | `b7361b6f07c3cf1957ce633dd8a38fbb0b03b1ed` |
| Frozen Facilities & Construction research contract | `4b9bd90b80c1dd1d386ab590fb3eeb759bb7d439` |
| Reviewed primary observatory | `76ac00abae30e6b95349c8a5e1c437aa74f0c8bb` |
| Reviewed timing and fourth-slot sensitivities | `ccb243f218dfce1c83e8d069f05d9e0d6e4d44af` |
| Annex V1 research closure and initial contract | `8712b7967d862f641ba79b0af5ac719a376516f2` |
| Contract verification-boundary clarification | `035e3c414aa29de0486d1c0720ca29d1e37408b1` |
| Engine, SaveFileV11, player UI, lot bridge, and regressions | `babfb874076055f5e8bb545eb1a96296e8accb76` |

The implementation follows `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md`. The clarification
records the already-reviewed compatibility boundary for historical operations types and replaces
an unreachable held-production acceptance example with the exact Production Operations V1 law.
It changes no price, duration, capacity, ordering, accounting, or player behavior authorized by the
initial contract.

## Engine and construction law delivered

- Managed Production Operations owns one canonical `expansion` parcel. Legacy operations own no
  parcel, project, Annex facility, or Annex capex.
- The sole action carries no caller-controlled identity, price, date, or capacity. It requires a
  founded, engaged, managed studio; an exact vacant parcel; collision-free canonical identities;
  and the existing non-negative-cash affordability gate.
- Start atomically debits exactly $780,000, appends one exact `constructionCapex` row, claims the
  parcel, and writes one Building project. It advances no time and consumes no RNG.
- Exactly 13 real weekly advances are required. On the `S + 12 → S + 13` advance, screenplay,
  casting, and production allocation run first against the facilities that existed at the start of
  the advance. Construction then completes once, appends the Annex, and does not rerun allocation.
- Existing reservations never migrate. The Annex is immediately available to a player action in
  visible Week `S + 13`; future automatic transitions may use it only on a later advance.
- Completion appends exactly one canonical capacity-one facility. There is no repeat action,
  upgrade, second parcel, cancellation, demolition, refund, recurring charge, or hidden +2 path.
- The shared construction invariant is called at action, tick, read-model, Calendar, and current-save
  boundaries. It validates lifecycle, facility truth, accounting identity, shared capacity, and
  temporal use of the completed Annex without mutating input.

## Identity and temporal hardening

The final red-team pass proved two adversarial boundaries that structural shape checks alone could
not protect:

1. A historical production identity could be forged to one of the three canonical Annex IDs, then
   construction could reserve the same string in a different domain. The repaired gate collides
   against the complete durable production-identity authority: active and released films,
   theatrical runs, sunk ledger rows from canceled films, career events, broadcast/coverage facts,
   workflows, reservations, shooting tasks, and screenplay production links. Vacant V10→V11
   migration still preserves historical input, but start refuses the collision and Building or
   Completed V11 saves cannot persist it.
2. A pre-completion production reservation could be moved to the Annex and its mutable `startTick`
   moved forward. Annex-reserving workflows now reconcile the production countdown and start clock
   to exactly one authoritative production debit at the same greenlight week. This rejects both a
   progressed-production forgery and the skip-first Week-12-greenlight/Week-13-completion forgery,
   while leaving non-Annex historical compatibility under its existing law.

The independent final core red-team reported **PASS — no remaining P1–P3 findings** after 67/67
focused tests, both TypeScript projects, and diff hygiene passed. A separate whole-diff audit is
recorded below only if it completed before this documentation closure; the closure does not weaken
or supersede the core result.

## SaveFileV11 and compatibility

- SaveFileV11 is the only format that writes `state.construction`, `constructionCapex`, or
  `constructionProjectId`.
- V1–V10 envelopes, validators, ledger vocabularies, and positive-projection builders remain
  frozen. Historical builders omit current unknown roots rather than spreading live state and
  deleting only known fields.
- V10→V11 migration deterministically derives only legacy-empty or managed-vacant construction
  from validated operations mode. It invents no debit, date, project, facility, or benefit.
- Current validation is exact-keyed and rejects malformed modes, parcels, projects, correlations,
  clocks, facility sets, reservations, collisions, cash identity, and unknown future authority. It
  repairs nothing at import.
- Building and Completed state cannot be downgraded to a historical save. Legacy or managed-vacant
  current state may be positively projected only when no V11 authority would be lost.
- Save/export/import is byte-identical at `S`, `S + 12`, and `S + 13`; one further tick after each
  imported boundary is byte-identical to uninterrupted continuation.

The shared historical `StudioOperations` TypeScript shape remains broad because the committed
research observatory already used configured facilities. Frozen state types nevertheless exclude
the V11 construction root and ledger authority, while exact historical runtime validators/builders
exclude the Annex. This preserves real prior compatibility rather than rewriting an older type to
make the new boundary look simpler.

## Accounting and Calendar delivery

- Cash remains exactly `INITIAL_CASH + Σ ledger.amount` in ordered ledger history.
- Construction capex is studio capital investment. Finance and recap surfaces display a positive
  $780,000 spend magnitude; period/cash movement retains the signed −$780,000 debit.
- Capex is never film commitment, production economics, marketing, publicity, payroll, overhead,
  current weekly burn, fixed-cost allocation, `otherCash`, or a completion-week charge.
- Existing payroll and base/per-employee overhead continue unchanged through construction and
  operation. Completion writes no ledger row.
- Calendar adds one committed construction-completion event at the exact due week and routes it to
  Studio Development. Same-week ordering is exactly screenplay due, casting due, construction
  completion, theatrical receipt, contract renewal, contract expiry.
- `Sim to next event` treats construction as a fallback stop boundary without displacing the
  existing release, screenplay, casting, production, run, cash, or contract priorities.
- Construction completion is an orthogonal typed result. The first post-tick surface announces it
  once even when a higher-priority release/newspaper surface owns the stop; continuing cannot show
  the same completion a second time.

## Player and lot delivery

- Dashboard adds one Studio Development preview with lifecycle, exact price/duration, capacity, and
  a route to the owning screen.
- Studio Development owns the sole construction command and renders Vacant, Building, and
  Operational states from the pure core view. The focused heading and named regions provide a
  complete non-canvas path.
- The screen states the bounded consequence plainly: +1 shared Development & Casting slot, with no
  production-ceiling, speed, release, or profit promise.
- Calendar, Finance, weekly/release/newspaper surfaces, Studio Run Recap, procedural lot, and
  Operation Hollywood all project the same canonical lifecycle.
- The procedural lot paints vacant/building/operational parcel states. The Hollywood bridge uses a
  disjoint central-asphalt parcel hotspot and routes a click on the physical parcel to Studio
  Development; its semantic destination reports the exact current shared capacity.
- Completion status uses text, shape, and color, an atomic polite live region, and reduced-motion
  safe presentation. The action and permanent status remain reachable without the lot feature.

## Verification at the implementation candidate

| Gate | Result |
| --- | --- |
| `npm test -- --reporter=dot` | **PASS — 141/141 files, 1,735/1,735 tests** |
| Annex core/save/accounting focused tests | **PASS — 27/27 tests** |
| Latest affected core/save/operations focused tests | **PASS — 48/48 tests** |
| Final core red-team corpus | **PASS — 67/67 tests; no P1–P3** |
| Independent focused UI audit | **PASS — 87/87 tests; no UI blocker** |
| `npx vitest run --config src/harness/d16/vitest.d16.config.ts --reporter=dot` | **PASS — 10/10 files, 176/176 tests** |
| `npm run typecheck` | **PASS — root and UI TypeScript clean** |
| `npm run build` | **PASS — 130 modules transformed** |
| `git diff --check` | **PASS** |

The production build retains the pre-existing large-chunk advisory. It is not a build failure and
is not classified as an Annex correctness defect.

## Live acceptance

A real in-app Chromium session founded and activated `marathon-annex-play`, opened Studio
Development, committed the exact $780,000 at Week 0, and advanced the real weekly engine. The Annex
remained Building through Week 12 and became Operational on the thirteenth advance at Week 13.
Shared Development & Casting capacity changed from two slots to three, while cash reconciled to
$18,128,832 after the one capital debit and 13 weeks of the existing $84,000 payroll-plus-overhead
burn.

Reload recovered the exact Week-13 SaveFileV11 state. Dashboard Finance showed `Studio construction
$780K` as spend, Studio Development showed the permanent Week-13 completion and three slots, and
the Hollywood lot announced `Annex operational · 3 shared slots`. Clicking the physical Hollywood
parcel opened Studio Development and focused its `h1`.

At 1280×720, 1366×768, 1440×900, 1920×1080, and the 1024×576 CSS equivalent of 1280×720 at 125%,
document width equalled viewport width and the required lifecycle, price, progress/status,
consequence, and navigation remained available without horizontal clipping. Runtime console
warnings and errors were empty.

## Explicitly open

- additional parcels, placement, rotation, relocation, demolition, construction queues, upgrades,
  repairs, condition, utilities, facility workers, maintenance, floor area, research trees, and
  era-dependent building systems;
- a fourth Development & Casting slot, which belongs to future scaled-studio research;
- additional soundstage, scenery, and post capacity, which current demand did not justify;
- manual scheduling, future reservations, production queues, richer crews/departments, offices,
  locations, editing, reshoots, and release-date/distribution strategy; and
- D-17B residuals: cash runaway, top-studio economic immortality, the Week-208 synchronized roster
  wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu
  breadth, and formal G12 timing.

D-17B remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

The Annex is not economy-balance certification. No financing, loan, bailout, restructuring,
arbitrary cash sink, hard bankruptcy, or failure ladder was introduced.

## Git and publication boundary

The implementation and this closure live only on `operation-hollywood-autonomous-marathon`. Main,
the accepted D-17B branch, the Operation Hollywood integration branch, and their worktrees remain
untouched. Nothing was pushed. No milestone tag is created: current repository tags mark
Owner-accepted or merged milestones, and this autonomous branch has not crossed that gate.

The closure commit is documentation-only. Its exact documents are:

- `docs/DEVELOPMENT-CASTING-ANNEX-V1-CLOSURE.md`;
- `docs/LESSONS-LEARNED.md`; and
- `docs/art/OPERATION-HOLLYWOOD-ENGINE-BRIDGE.md`.

## Next authorized marathon move

Instrument the Week-208 synchronized roster wall under a separate behavior-neutral research
contract. Measure contract cohorts, renewal eligibility/attempts/rejections, cash and availability
at each decision, payroll discontinuities, production/script/casting ownership, and policy feedback
before proposing any behavior change. Do not classify the Annex as that repair and do not invent
financing, a failure ladder, or an arbitrary size-scaling charge.
