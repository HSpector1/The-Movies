# Production Operations V1 Closure

Status: **IMPLEMENTED, VALIDATED, AND CLOSED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-13

Branch: `operation-hollywood-autonomous-marathon`

Implementation candidate: `0ba177583a914589f62f71c5569adb22e1c61475`

## Result

Production Operations V1 replaces the ordinary player's fire-and-forget production countdown
with a deterministic, engine-owned operating loop. A managed picture now advances through named
phases, reserves real facility slots, assigns its locked director, stops for an actionable scenery
and shooting chain, persists the result in SaveFileV8, and releases through the unchanged theatrical
pipeline. The Dashboard and Studio Lot expose the same authoritative workflow.

This is a successful operating-studio foundation. It is not a construction system, a facility
economy, or a certification that the D-17B macroeconomic residuals are solved.

## Authority and committed lineage

| Purpose | Commit |
| --- | --- |
| Accepted D-17B + Operation Hollywood history integration | `4432a9befef578ac3549896c2796bf0a22950ec0` |
| Frozen Production Operations V1 contract | `1c7a33a0e6ecb680e8c822a44f5baea7d450b716` |
| Authoritative workflow, facilities, actions, SaveFileV8, and core tests | `41333f6dd8afc785ce278cf343996aeb6046875f` |
| Early-version forecast migration preservation | `9c9acc35dba8b5513c8c33e83b7b94e091bbc280` |
| Strict canonical V8 forecast-segment validation | `e3944efe2e91dc8417d4272708c4676ec01d0cc5` |
| Player UI, lot projection, Hollywood interaction, and UI regressions | `0ba177583a914589f62f71c5569adb22e1c61475` |

The implementation follows `docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md`; that contract remains
unchanged at closure.

## Engine law delivered

- Managed operation mode is explicit and opt-in. Newly founded player studios activate it only at
  the governed founding boundary; migrated and headless legacy games keep their old countdown.
- `remainingTicks` stays the eight-week release clock. Development, Pre-production, Rehearsal,
  Shooting, Post-production, and Release Ready are deterministic projections of that clock.
- Development & Casting, Soundstage 7, Soundstage 12, Scenery Shop, and Post Building are
  authoritative facilities with deterministic slot allocation and no overbooking.
- Rehearsal retains its exact soundstage reservation through Shooting. Facility identity does not
  jump between weeks or get recomputed by presentation code.
- A managed production can hold without freezing the world. Payroll, overhead, contract expiry,
  awareness drift, the market week, and theatrical runs continue while its own countdown waits.
- Shooting requires the real locked director and exact reserved soundstage. The legal chain is:
  call director, clear scenery load-in, schedule the take, then complete the take on the next tick.
- Stale or illegal commands reject without mutating cash, standing, ledger, week, RNG, or workflow.
- Cancellation and release remove every workflow reservation and task owned by the production.

## Save and compatibility result

SaveFileV1 through SaveFileV7 remain frozen. SaveFileV8 adds the production-operations state and
requires canonical forecast segments on the film records that carry them. Historical migrations
remain permissive only where old schemas require repair; an imported V8 must already satisfy the V8
contract. Empty, missing, duplicate, unordered, or otherwise noncanonical current-version forecast
segments reject rather than being silently normalized.

V7-to-V8 migration creates `legacy` operation mode with no invented facilities, workflows,
reservations, tasks, or production history. All supported import paths preserve deterministic replay.
The UI reports a version-neutral migration success notice only after a successful older-save import;
V8 loads do not claim migration, rejected loads do not replace state, and restart clears the notice.

## Player delivery

- The Production Board shows the exact film, phase, weeks remaining, facility, director, blocker,
  consequence, and currently legal command.
- Sim-to-event stops only for a command the player can legally take. A capacity hold remains visible
  but does not masquerade as an actionable decision.
- Command replacement preserves keyboard continuity: focus moves to the successor command and then
  to the persistent scheduled-status result, with a polite live-region announcement.
- The Studio Lot and Hollywood inspector render the same workflow. Occupied, decision-required, and
  recording are distinct states; a reserved stage stays dressed but never shows REC or recording
  glow until the engine says it is recording.
- Soundstage 7 drives the authored district route. Soundstage 12 remains exact in the inspector and
  uses an honest fallback because the current plate does not contain it.
- Person, production, and place inspection are mutually exclusive. Selecting one cannot leave an
  unrelated command or task visible under another context.
- Hollywood no longer invents Mara Voss, *The Violet Hour*, camera counts, or take completion.
  Animation acknowledges an authoritative transition but cannot advance it.
- Operational telemetry remains behind the existing developer-only identity proof.

## Red-team repairs incorporated

Independent review found and the implementation corrected these boundary defects before closure:

1. current-version V8 accepted malformed forecast-segment collections;
2. the legacy lot equated occupied stages with active recording;
3. migration success was hard-coded to V1 and was not consistently observable;
4. same-role Hollywood people could overlap at one home position;
5. person/place/production inspector contexts could disagree;
6. ordinary players could see developer telemetry;
7. a capacity-blocker sentence implied a currently full slot after the failed attempt had passed;
8. command buttons replaced themselves without transferring keyboard focus to the next result.

The final independent code/state/accessibility re-review reported no remaining P1–P3 findings.

## Verification at the implementation candidate

| Gate | Result |
| --- | --- |
| `npm test` | **PASS — 120/120 files, 1,557/1,557 tests** |
| Core portion of the full suite | **PASS — 59 files, 999 tests** |
| `npm run test:ui` | **PASS — 61/61 files, 558/558 tests** |
| `npx vitest run --config src/harness/d16/vitest.d16.config.ts` | **PASS — 10/10 files, 176/176 tests** |
| `npm run typecheck` | **PASS — root and UI TypeScript clean** |
| `npm run build` | **PASS — 118 modules transformed** |
| `git diff --check` | **PASS** |

The production build retains the pre-existing large-chunk advisory; it is not a build failure and
was not introduced as an operations correctness issue.

## Live acceptance

A visible 1920×1080 Chromium session founded a managed studio, greenlit *A Season of Archipelago*,
and stopped at Week 4 for its real director command. The player called the director, cleared the
scenery load-in, and scheduled the take. A 222,528-character SaveFileV8 was copied through the
visible Saves UI, pasted back, and reloaded into the exact scheduled state. The next week completed
the take; the film then released at Week 8 with critic 56.6, opening gross $7.86M, projected total
$20.12M, 52% studio revenue share, and projected profit $6.035M. The studio returned to an idle
Week-9 operations state.

The final live frame measured 106 FPS, 26 display objects, 13 dynamic actors, and 8.7 MB decoded
authored texture memory. Browser console errors were empty.

## Explicitly open

- manual scheduling and production priority;
- construction, expansion, facility purchase, operating cost, quality, maintenance, staffing,
  upgrades, and believable size-scaling capital costs;
- differentiated script development, casting sessions, rehearsals, edit choices, reshoots, and
  release-date strategy;
- migrated-save conversion from legacy countdowns into managed workflows;
- D-17B residuals: cash runaway, top-studio economic immortality, the week-208 synchronized roster
  wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu
  breadth, and formal G12 timing.

No financing, loans, bailouts, restructuring, acquisition, hard bankruptcy, arbitrary cash sink,
or failure ladder was introduced.

## Git and publication boundary

The implementation and this closure live only on `operation-hollywood-autonomous-marathon`. Main,
the accepted D-17B worktree/branch, and the Operation Hollywood integration worktree/branch remain
untouched. Nothing was pushed. No milestone tag is created: repository tags mark Owner-accepted or
merged milestones, and this autonomous branch has not crossed that gate.

The closure commit is documentation-only. Its exact documents are:

- `docs/PRODUCTION-OPERATIONS-V1-CLOSURE.md`;
- `docs/LESSONS-LEARNED.md`;
- `docs/art/OPERATION-HOLLYWOOD-ENGINE-BRIDGE.md`.

## Next authorized marathon move

Proceed to a separately contracted Script Projects V1 slice: a deterministic, save-authoritative
Commission → Draft → Review → bounded Rewrite/Accept → Ready loop that shares real development
capacity and feeds package assembly without changing the accepted D-17B economy or inventing a
facility cash sink.
