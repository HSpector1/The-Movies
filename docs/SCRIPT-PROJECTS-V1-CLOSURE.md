# Script Projects V1 Closure

Status: **IMPLEMENTED, VALIDATED, AND CLOSED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-13

Branch: `operation-hollywood-autonomous-marathon`

Implementation candidate: `5e3aadf323c8a3d0caf43676f9bccfcc6f111db5`

## Result

Script Projects V1 replaces the managed player's direct concept-to-greenlight shortcut with an
authoritative, playable screenplay loop:

`Commission → Draft → Review → Rewrite or Accept → Ready → In Production → Produced`

A screenplay is now a persistent studio asset with a named writer, exact due week, shared facility
reservation, actual/perceived assessment split, locked creative facts, and durable production
identity. The Writers Room, Assembly, production workflow, theatrical release, history, and
SaveFileV9 all consume the same state.

This is a successful screenplay-development foundation. It is not a prose-generation system,
casting-session system, construction economy, or certification that the D-17B macroeconomic
residuals are solved.

## Authority and committed lineage

| Purpose | Commit |
| --- | --- |
| Accepted D-17B + Operation Hollywood history integration | `4432a9befef578ac3549896c2796bf0a22950ec0` |
| Production Operations V1 closure | `28cb711b620ee59cfec7e84b506489de0e9979ac` |
| Frozen Script Projects V1 contract | `e1a97a5bf6a8ed3d05715f2f4bf424f13a7fc168` |
| Authoritative due-week contract correction | `2a90c20eb756e2fa3dfbcbb6a28a7be434d5a6a9` |
| Engine, SaveFileV9, player UI, and regression implementation | `5e3aadf323c8a3d0caf43676f9bccfcc6f111db5` |

The implementation follows `docs/SCRIPT-PROJECTS-V1-CONTRACT.md`; that contract remains unchanged
at closure.

## Engine law delivered

- New player studios activate managed Script Development with managed Production Operations at the
  governed post-founding boundary. Migrated and headless studios remain explicitly legacy.
- Script projects are append-only, canonically ordered studio assets. One managed concept owns at
  most one project; status, rewrite count, due week, assessment, reservation, and production link
  obey one validated lifecycle.
- Commissioning locks concept, shape, audience promise, and writer. Drafting and the one permitted
  final rewrite each consume exactly one calendar week and one real Development & Casting slot.
- Script completion is deterministic and consumes no simulation or derived RNG stream. The actual
  and perceived screenplay assessments are persisted separately; player read models expose only the
  estimated perceived score.
- The rewrite is headroom-limited, skill-dependent, and capable of worsening weak work. Accept is
  immediate and consumes no time, cash, capacity, or RNG.
- Writer assignment truth is shared by actions, employment, roster, talent surfaces, package
  pickers, and the Writers Room. Drafting or rewriting blocks conflicting work and early contract
  release with a named reason; Review and Ready release the writer.
- Script reservations and production reservations share one deterministic Development & Casting
  allocator. A completed script releases its slot before production allocation on the same tick.
- Managed raw greenlight is impossible. The project greenlight copies locked screenplay facts into
  the production, retains ordinary staffing/solvency/concurrency law, and links the exact new
  production ID atomically.
- Cancellation returns the linked project to Ready; release advances it to Produced. Historical
  production IDs remain reserved across active state, releases, ledger, career events, broadcasts,
  operations, and screenplay history so unrelated films cannot merge accounting identities.

## Assessment and economy integration

For linked managed projects, every screenplay-sensitive decision surface reads the persisted
assessment instead of silently reconstructing a different writer/concept blend:

- forecast and execution use perceived strength;
- realized reception uses actual strength;
- package profit range and post-release autopsy retain the same split;
- marketing capacity/menu, efficiency, and discoverability use perceived strength;
- concept potential and every other accepted D-17B formula remain unchanged.

This adds no screenplay fee, acquisition charge, financing mechanic, or arbitrary cash sink. The
bounded economic consequence is the real week of payroll and overhead while the writer and facility
slot are occupied.

## Save and compatibility result

SaveFileV1 through SaveFileV8 remain frozen. SaveFileV9 adds exactly the Script Development root and
strictly validates exact keys, canonical order/IDs, lifecycle correlations, references,
reservations, assessment bounds, package agreement, and active/produced production linkage.

V8-to-V9 migration creates a fresh legacy-empty script state and invents no history. Every older
version migrates forward without mutating its input. V9 passes by identity. Historical V8 projection
uses an explicit positive root allowlist so current or future fields cannot leak backward. Current
V8 and V9 forecast-segment collections must already be in exact canonical order; compatibility
repair remains confined to historical versions.

## Player delivery

- The Writers Room shows exact shared capacity, Needs Review, In Development, Ready to Package, and
  Production History, with named writers, due timing, estimated assessments, consequences,
  blockers, remedies, and only legal actions.
- Commission lets the player choose a concept, shape, audience promise, and contracted
  writing-capable person. Cross-discipline writing careers remain legal.
- Sim-to-event stops first for an actionable screenplay review, then for Production Operations
  decisions. Capacity trouble alone never masquerades as player agency.
- Dashboard and the Development & Casting lot route managed studios to the Writers Room. The lot
  attention projection uses the same review/capacity/activity/ready priority as core.
- Ready package Assembly locks concept, shape, promise, and screenplay writer. That writer cannot be
  reused in another credit on the same film.
- Before package navigation, the Writers Room proves that the remaining director, three actors, and
  craft lead can be staffed from the exact roster/freelancer/busy pools Assembly uses. A shortage is
  named with a remedy instead of opening a dead-end wizard.
- Action replacement preserves keyboard focus on the successor action or durable status for the
  same project, with a polite atomic announcement.

## Red-team repairs incorporated

Independent review found and the implementation corrected these boundary defects before closure:

1. rewrite completion time could not be reconstructed honestly from status and commission week, so
   `dueWeek` became persisted lifecycle state;
2. current V8/V9 saves could accept reordered forecast segments rather than exact canonical order;
3. a locked cross-discipline screenplay writer could be selected again as director, actor, or craft
   on the same film;
4. an In Production project could lack the participant snapshot needed to remain valid at release;
5. frozen save builders could spread unknown future roots into historical schemas;
6. package preview, realized reception, profit, and autopsy initially bypassed the persisted
   actual/perceived screenplay assessment;
7. cancel-then-greenlight in the same week could reuse a production ID and merge ledger history;
8. marketing menu, efficiency, and discoverability initially bypassed the persisted perceived
   screenplay assessment;
9. Ready-package availability could offer navigation even when the locked writer consumed the only
   remaining primary-role pool required by Assembly.

The final independent action/save/UI re-review reported no remaining P1–P3 findings.

## Verification at the implementation candidate

| Gate | Result |
| --- | --- |
| `NODE_OPTIONS=--no-experimental-webstorage npm test -- --reporter=dot` | **PASS — 129/129 files, 1,614/1,614 tests** |
| `npx vitest run --config src/harness/d16/vitest.d16.config.ts --reporter=dot` | **PASS — 10/10 files, 176/176 tests** |
| `npm run typecheck` | **PASS — root and UI TypeScript clean** |
| `npm run build` | **PASS — 121 modules transformed** |
| `git diff --check` | **PASS** |

The production build retains the pre-existing large-chunk advisory; it is not a build failure and
was not introduced as a screenplay correctness issue.

## Live acceptance

A fresh in-app browser session using seed `studio-001` founded a managed studio and
commissioned *A Season of Archipelago* with Lauren Ravel. Drafting occupied one of two Development &
Casting slots and stopped Sim at Week 1 with a 66.5 Promising estimate. A final rewrite occupied the
slot for one more week, stopped at Week 2, and produced a 74.5 Promising estimate. Accepting released
capacity immediately.

The Ready action opened Assembly with Lauren and every screenplay fact locked. A complete legal team
produced a package-specific $550K marketing capacity, $4,428,146 immediate commitment, and $20.93M
central theatrical-gross forecast. Greenlight moved the same project into Production History as In
Production and the managed Production Board into Development.

The Saves UI exported a 222,598-character SaveFileV9. The real Copy → paste → Load save path restored
the exact Week-2 in-production studio. Browser console errors were empty. A preliminary automation
fill clipped returned text at its own 200,000-character transport boundary; repeating the player
clipboard path proved that was test tooling, not product truncation.

## Explicitly open

- screenplay prose, pitches, script editors, coverage, acquisitions/options, sales, turnaround,
  co-writers, credit arbitration, remakes, abandonment, and branching rewrites;
- casting sessions, chemistry reads, negotiations, rehearsals, edit choices, reshoots, and
  release-date strategy;
- manual facility scheduling, construction, expansion, upgrades, staffing, maintenance, operating
  costs, and the believable size-scaling capital sink;
- conversion of migrated production history into invented managed scripts;
- D-17B residuals: cash runaway, top-studio economic immortality, the Week-208 synchronized roster
  wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu
  breadth, and formal G12 timing.

No financing, loans, bailouts, restructuring, acquisition mechanic, hard bankruptcy, arbitrary cash
sink, or failure ladder was introduced.

## Git and publication boundary

The implementation and this closure live only on `operation-hollywood-autonomous-marathon`. Main,
the accepted D-17B worktree/branch, and the Operation Hollywood integration worktree/branch remain
untouched. Nothing was pushed. No milestone tag is created: repository tags mark Owner-accepted or
merged milestones, and this autonomous branch has not crossed that gate.

The closure commit is documentation-only. Its exact documents are:

- `docs/SCRIPT-PROJECTS-V1-CLOSURE.md`;
- `docs/LESSONS-LEARNED.md`;
- `docs/art/OPERATION-HOLLYWOOD-ENGINE-BRIDGE.md`.

## Next authorized marathon move

Proceed to a separately contracted Casting Sessions V1 slice. It should turn the actor portion of a
Ready screenplay package into an inspectable audition/shortlist/choice loop, preserve the locked
screenplay and engine-owned assignment law, and avoid inventing a new charge before its purpose is
measured.
