# World-First Lot-Native Screenplay Review Intervention V1 Evidence

Status: **IMPLEMENTED, VALIDATED, AND RETAINED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Frozen contract authority: `22ee17c01b688a114b9803f7754af1be6477c655`

Implementation authority: `67a0bf333fc4863548fb13fbc2696fd002bd627d`

Closure documentation authority: the documentation checkpoint containing this record; its commit
SHA is intentionally not guessed before that checkpoint exists.

## Keep ruling

World-First Lot-Native Screenplay Review Intervention V1 passes its bounded Keep gate.

The retained ordinary-player loop is:

```text
LIVE LOT → SIM TO OR SELECT DEVELOPMENT → EXACT SCREENPLAY REVIEW
→ ACCEPT OR REQUEST THE ONE LEGAL FINAL REWRITE
→ SAME MOUNTED LOT REPAINTS THE ENGINE SUCCESSOR
→ OPEN WRITERS’ ROOM ONLY WHEN DEEP EVIDENCE IS NEEDED
→ RETURN TO FRESH CURRENT LOT TRUTH
```

An ordinary player can now resolve both a newly surfaced screenplay review and an already-pending
review without leaving the living Studio Lot. The Lot exposes every current legal Core action and
no inferred action, then shows the exact successor. The existing Writers’ Room remains available
for history, comparison, package planning, and broader project management.

This is a bounded world-native intervention. It does not add screenplay simulation, a second
decision system, a physical Writers building, or macroeconomic certification.

## Exact authority and closed read model

Engine/GameState remains the sole owner of screenplay projects, assessment, rewrite count, action
legality, writer assignment, facility reservation, due week, consequence, time, save, RNG, money,
ledger, and outcomes. App remains the sole owner of current state, whole-state replacement,
autosave, action dispatch, and deep navigation.

One pure selector, `currentLotScriptReviewContext`, rebuilds the current bounded review from:

- Core `nextStudioDecision` through the established `studioDecision` adapter;
- Core `scriptProjectsReadModel` through `scriptProjectsBoard`; and
- the exact Core-emitted `acceptScript` and optional `requestScriptRewrite` actions.

The selector requires managed Script Projects mode, exactly one current `scriptReview` decision,
one exact matching `needsReview` card, exact ID/title/status/section agreement, a named writer, one
non-null player-safe `Est.` assessment, canonical strengths/concerns, exact consequence and
blockers, exactly one Accept action, and at most one Rewrite action in Core order.

Closed-object validation rejects extra string or symbol keys, duplicate identity or action kind,
sparse arrays, non-canonical indices, malformed optionals, hostile decision/card disagreement,
and first/last/Map-winner shortcuts. Failure is neutral: no project or action is substituted, no
state is mutated or resaved, and an independently valid Engine successor is never rolled back.

## Event and pending-decision provenance

The implementation keeps two authorities distinct:

| Player path | Exact owner |
| --- | --- |
| Newly surfaced review after **Sim to next event** | Complete valid cadence receipt plus the exact still-owned App event session and current Core decision |
| Review already pending on load, return, or current state | Current Core decision plus exact current review card and actions |

A newly surfaced malformed or stale receipt cannot downgrade into the pending path during the same
gesture. An already-pending review needs no synthetic receipt merely to become playable. Selecting
the semantic **Development** destination opens the bounded current review when and only when that
strict pending context exists; otherwise the established deep route remains intact.

The cadence action remains disabled while any unified decision is pending. The review intervention
resolves the real decision rather than bypassing stop priority or creating another clock.

## Player-safe presentation

The live Lot review exposes only existing player-safe truth:

- exact screenplay title and project ID;
- named writer and public creative role;
- first- or final-review state;
- visibly qualified `Est.` score and governed assessment band;
- every current player-safe strength and concern;
- exact consequence;
- blocker headline, detail, and remedy where emitted; and
- the exact one or two legal actions in Core order.

Actual screenplay strength, hidden skill, ceiling, RNG inputs, and internal contribution remain
hidden. Rewrite availability is never inferred from rewrite count, capacity, employment, or
blockers. `openPackage`, audition, casting, greenlight, cancellation, employment, publicity,
construction, and production commands do not enter this surface.

The complete semantic interaction survives Hollywood renderer rejection and delayed readiness.
Development/Writers remains an honest semantic destination because the accepted district has no
physical Writers building, polygon, room, route, worker, or occupancy authority.

## Exact action dispatch and successor proof

Each native action captures the complete rendered GameState identity, strict review context,
Core-emitted action, and optional event receipt. App synchronously compares that capture with its
latest state, rebuilds and field-compares the strict current context, verifies current event
ownership where applicable, consumes event ownership before dispatch, and calls
`runScriptProjectAction` exactly once.

Accepted results synchronously update the latest-state ref, App state, autosave, and Lot snapshot
to the exact Engine successor. Direct Core-action parity is byte-identical.

The exact accepted successors are:

- **Accept first/final draft:** the same project is Ready to package; the same writer and
  player-safe assessment remain; week, cash, capacity, and RNG are unchanged.
- **Request final rewrite:** the same project is Rewriting; the same named writer is assigned; the
  exact due week, Development & Casting facility, slot, and existing one-week consequence appear.

The physical Annex is selected and shown Working only when the real successor uses
`facility-development-casting-annex` and the independent strict Annex projection agrees. A base
Development & Casting reservation remains semantic and never borrows Annex geometry.

If successor presentation cannot be validated after an accepted Engine action, the accepted state
and autosave survive and the UI demotes only to neutral success. Presentation never becomes a
transaction rollback mechanism.

## Stale, malformed, replacement, and input containment

Every action is exact-once or fails closed across pointer, mouse, touch, Enter, Space, held/repeat
tails, cross-key tails, virtual-assistive-technology activation, blur, cancel, hidden-tab, modal,
renderer replacement, delayed readiness, unmount, and whole-studio replacement.

The input boundary is tied to the complete rendered state and review context, not merely a project
ID. Per-button gesture ownership allows a real pointer transition from focused Accept to Rewrite
without a blur handler cancelling the new button's valid click. A malformed current presentation
may consume only the canonical current App session identified by the exact rendered state; a stale
or malformed token cannot clear a newer session.

Malformed receipts fail closed before actions become visible. Stale state, receipt, action,
session, same-title project, deep-return, load/import, rejection-restoration, and replacement cases
cannot dispatch, restore cached facts, or substitute the next review.

## Deep owner and fresh return

**Open Writers’ Room details** follows the native actions in DOM, visual, pointer, and keyboard
order. App revalidates the latest exact project before navigating and focuses only that project.
Stale navigation remains in the Lot.

Opening and closing the Writers’ Room changes no Engine truth. Return rebuilds current state:

- the same still-current review may be restored;
- an accepted, rewritten, removed, or replaced review returns to a neutral fresh Lot; and
- no consumed event receipt or cached review card is replayed.

The deep screen may remount the established Lot host on return; the screenplay action itself keeps
the current Lot mounted. This does not overstate general same-Phaser continuity across deep routes.

## Responsive, accessibility, and visual proof

The action-forward review rail was played and reviewed at ordinary management scale, 960×540,
effective 200%, maximum world zoom, and 480×270 CSS pixels at DSF2. Long titles, writer names,
strengths, concerns, blockers, and remedy text wrap inside a bounded internally scrollable owner.
The rail does not create page-level horizontal overflow or cover the people/production rails.

Native controls retain visible focus, minimum touch targets, accessible names, disabled semantics,
forced-colors treatment, grayscale meaning, reduced-motion neutrality, keyboard order, and
virtual-AT activation. Programmatic focus uses the owning scroll container so the focused review or
success heading enters the visual viewport. One always-mounted polite live region announces exact
success once.

Retained Chromium evidence includes:

- `out/world-first-lot-native-next-event-v1/01-screenplay-exact-deep-return.png`;
- `out/world-first-lot-native-next-event-v1/01b-screenplay-accepted-in-live-lot.png`; and
- `out/world-first-lot-native-next-event-v1/01c-pending-screenplay-development-action.png`.

The real browser journey proved Dashboard/Saves fixture entry, live-Lot review, both side-by-side
world actions, exact Rewrite successor for `Fires of Gambit` / Marlon Ostrow / Week 2 /
Development & Casting / slot 1, current production visibility, and optional Studio Desk support.
The final grayscale test also moves a real focused pointer from Accept to Rewrite and proves the
neighboring action dispatches exactly once with exact successor bytes.

## Save, simulation, and content boundary

Implementation `67a0bf333fc4863548fb13fbc2696fd002bd627d` changes twelve UI and UI-test
files with 4,387 insertions and 50 deletions. Runtime change is bounded to App/Lot read-model,
interaction, presentation, styling, and navigation code.

No file under `src/core/` changed. No GameState, SaveFileV1–V11, schema, migration, import/export,
script assessment, rewrite, accept, assignment, due-week, capacity, facility, studio-decision,
tick, production, casting, release, construction, publicity, employment, economy, awareness/reach,
RNG, ledger, cash, payroll, overhead, or outcome behavior changed.

No authored/generated art, source/runtime manifest, exporter, atlas, texture, Place, building,
route, actor, animation, draw owner, or renderer clock changed. V1 adds no personal location,
travel, arrival, room occupancy, workload, queue, stress, fatigue, relationship, autonomy,
pathfinding, character control, or second simulation. A resource-slot reservation is not human
occupancy.

## Final automated verification

| Gate | Result |
| --- | --- |
| Focused screenplay-review suites | **PASS — 6/6 files, 104/104 tests** |
| Complete UI suite | **PASS — 103/103 files, 1,334/1,334 tests** |
| Complete repository suite | **PASS — 190/190 files, 2,564/2,564 tests** |
| Governed D-16/D-17 config | **PASS — 10/10 files, 176/176 tests** |
| Full next-event Chromium specification | **PASS — 14/14** |
| Root and UI TypeScript projects | **PASS** |
| Production build | **PASS — 145 modules transformed; existing large-chunk warning retained** |
| Direct action / SaveFileV11 parity | **PASS — exact bytes** |
| Compact, zoom, forced-colors, grayscale, reduced-motion, renderer failure | **PASS** |
| Diff, protected paths, refs, and independent P0/P1 re-audit | **PASS** |

No GPU certification is claimed; this bounded UI intervention adds no renderer structure and does
not change the accepted lot structure. No performance threshold was relaxed.

Protected refs remain exact:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`; and
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

Protected `src/core`, Engine adapter, authored/runtime art, Hollywood manifest, exporter, asset, and
renderer-draw paths are unchanged against the contract authority.

## Economic and publication boundary

The governing result remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal
G12 timing remain open. This milestone certifies no complete macroeconomic balance and authorizes
no financing, loans, bailouts, restructuring, failure ladder, hard bankruptcy, or arbitrary cash
sink.

Nothing was merged to `main`, pushed, tagged, or published.
