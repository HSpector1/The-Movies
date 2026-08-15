# World-First Lot-Native Screenplay Review Intervention V1 Contract

Status: **FROZEN — BINDING IMPLEMENTATION AUTHORITY**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Implementation parent and accepted Active Production Company closure:
`9294fb65a59a1c438f7a7e9eb4dd820fe8c56231`

Contract authority: the documentation checkpoint containing this record; its commit SHA is
intentionally not guessed before that checkpoint exists.

Scope state: **BOUNDED IMPLEMENTATION FREEZE**

## 1. Governing authority

This contract follows:

- the Owner's binding ruling that **THE STUDIO LOT IS THE PRIMARY GAME SURFACE** and management UI
  supports rather than replaces the world;
- the ordinary flow
  `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME FRESH LIVE WORLD`;
- accepted Active Production Company contract `08e86abf0d166d2f79555f79a8afc10c80bc18f8`,
  implementation `2ef7f0aa7cb13c52fde9b3d64a8d384a6f79b56a`, and closure
  `9294fb65a59a1c438f7a7e9eb4dd820fe8c56231`;
- accepted Lot-Native Next-Event contract `15e65c494b28518e3ba8df2e74823adff3178897`,
  implementation/hardening `eb6cef1bb2cadc09438daacefb5868e7e6269b44` /
  `aabb68477fe73ea21af3195985ee7ffaf6a182f7`, and closure
  `2e32b0520ca2dc1c5a3a091000c6cbb998637f28`;
- Core `nextStudioDecision`, `scriptProjectsReadModel`, and Script Projects action law;
- App ownership of the one current `GameState`, autosave, whole-state replacement, and deep
  navigation; and
- accepted Hollywood semantic fallback law: Development/Writers remains a truthful semantic
  destination, not invented physical geometry.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`; and
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

No merge, push, tag, or protected-ref movement is authorized by this contract.

## 2. Measured world-first break

The accepted Lot already stops unattended simulation at the first exact screenplay review and
orients the semantic Development destination. It currently offers only **Open Writers’ Room**.
An already-pending review likewise disables **Sim to next event** and instructs the player to leave
the Lot.

That is unnecessary for the bounded decision Core already owns. The exact player-safe review card
contains the named writer, perceived `Est.` assessment, consequence, blockers, and current legal
actions. Accepting is immediate. A final rewrite, when emitted, is one exact Engine action that
assigns the named writer and one Development & Casting resource slot for one week.

V1 closes only this forced-menu break. It does not turn the Lot into a replacement Writers’ Room
and does not add screenplay simulation.

## 3. Binding player loops

New next-event review:

```text
LIVE STUDIO LOT
→ SIM TO NEXT EVENT
→ EXACT SCREENPLAY REVIEW STOP
→ READ WRITER + EST. ASSESSMENT + CONSEQUENCE IN THE LIVE LOT
→ ACCEPT, OR REQUEST THE ONE LEGAL FINAL REWRITE
→ SAME MOUNTED LOT REPAINTS THE ENGINE SUCCESSOR
→ OPEN WRITERS’ ROOM ONLY WHEN DEEP EVIDENCE IS NEEDED
```

Already-pending review, including load/return:

```text
LIVE STUDIO LOT / DEVELOPMENT NEEDS ATTENTION
→ SELECT DEVELOPMENT
→ SAME EXACT REVIEW AND LEGAL ACTIONS
→ ACT WITHOUT LEAVING, OR OPEN THE EXACT WRITERS’ ROOM CARD
→ RETURN TO FRESH CURRENT LOT TRUTH
```

The Lot must not require a cadence receipt merely to act on a current legal review. A receipt owns
the newly surfaced event ceremony; Core's current decision owns the already-pending path.

## 4. Existing Engine authority

Implementation must reuse, not copy:

- `studioDecision(state)` / Core `nextStudioDecision(state)` for cross-system priority;
- `scriptProjectsBoard(state)` / Core `scriptProjectsReadModel(state)` for the player-safe card;
- `runScriptProjectAction(state, command)` for action dispatch; and
- the existing `acceptScript` and `requestScriptRewrite` Core actions.

The only V1 world commands are exact current actions whose kinds are:

```text
acceptScript
requestScriptRewrite
```

`Accept first draft` or `Accept final draft` comes from Core copy. `Request final rewrite` appears
only when Core emits it. React must not infer rewrite availability from rewrite count, capacity,
writer employment, assignment, or blockers.

`openPackage`, `planAuditions`, commission, casting, greenlight, cancel, employment, publicity,
construction, and production commands are outside this action surface.

## 5. Strict current-review context

One pure Lot selector must rebuild a review context from the latest state. It must require:

1. managed Script Projects mode;
2. exactly one current `studioDecision` of kind `scriptReview`;
3. one non-empty project ID and title;
4. exactly one matching card in `needsReview`, and no duplicate project identity in another
   section;
5. exact project ID/title agreement between decision and card;
6. `status === review`, `section === needsReview`, one named writer, and one non-null player-safe
   assessment labelled exactly `Est.`;
7. finite assessment score, governed band, canonical strength/concern arrays, consequence, and
   blocker records;
8. exactly one current `acceptScript` action plus at most one current
   `requestScriptRewrite` action, both for that project, in Core order; and
9. no extra authority-bearing own keys, duplicate action kind, duplicate array index, sparse array,
   symbol key, first/last match, or Map winner.

For a next-event action, the selector must additionally require one complete valid receipt whose
target is the same script project/title and the exact still-owned App event session. A malformed or
stale receipt never downgrades into the pending-review path during the same gesture.

Failure is neutral: expose no action, do not choose another review, do not navigate, do not mutate
or resave state, and demote only an invalid event presentation under accepted cadence law.

## 6. Player-safe Lot presentation

The bounded review surface must expose:

- exact screenplay title and project ID;
- named writer and public creative role;
- first/final review state;
- `Est.` perceived score and governed assessment band;
- every player-safe strength and concern currently emitted by Core;
- the exact consequence string;
- current blocker headline/detail/remedy where present;
- the one or two exact legal Lot actions; and
- **Open Writers’ Room details** after the world actions.

Do not surface actual screenplay strength, hidden skill, ceiling, RNG input, internal contribution,
or a certainty claim. `Est.` must remain visible anywhere the score appears.

The same bounded content must work in Hollywood, renderer failure, delayed readiness, and the
semantic/Classic fallback. Hollywood does not invent a Writers building, polygon, route, worker,
room, or occupancy because the accepted district has none.

## 7. Pending-review selection law

When the latest exact review exists, selecting the semantic **Development** destination keeps the
Lot mounted and opens this bounded review instead of immediately navigating away. If no exact
review exists, Development retains its established deep route.

Selecting another person/place/building yields the review context normally. Returning from the
Writers’ Room revalidates current truth: the same review may be restored; an accepted/replaced/
removed review returns to a neutral fresh Lot and is never substituted by the next project.

## 8. Exact action dispatch

App remains the sole action owner. One activation must:

1. capture the exact rendered state, review context, action, and optional receipt;
2. synchronously compare the rendered state with `latestStateRef.current`;
3. rebuild the latest strict context;
4. require exact closed-field equality with the rendered project/action;
5. for an event, require exact current event-session and receipt ownership;
6. consume event ownership before dispatch;
7. call `runScriptProjectAction` exactly once;
8. on success, synchronously advance the latest-state ref, App state, autosave, and Lot snapshot to
   the exact returned successor; and
9. on Engine rejection, preserve the unchanged state and restore an event only if the same complete
   receipt/context/action remain current.

No optimistic status, delayed UI completion, retry, adapter rerun, or renderer acknowledgement may
make a command legal. Double click, held Enter/Space, cross-key tails, pointer→mouse,
touch→click, virtual-AT activation, blur, cancel, hidden tab, modal, renderer replacement, and stale
closure paths must produce at most one Engine call.

## 9. Exact successor feedback

After accepted `acceptScript`, bounded feedback may say only what the successor proves:

- the same project is `ready` / Ready to package;
- the same writer and player-safe assessment remain attached; and
- no week, cash, capacity, or RNG was consumed by the action.

After accepted `requestScriptRewrite`, bounded feedback may say only what the successor proves:

- the same project is `rewriting`;
- the same named writer is assigned;
- the exact due week;
- the exact Development & Casting facility name and slot; and
- the existing one-week consequence.

The Annex may repaint/select **Working** only if the actual successor reservation uses
`facility-development-casting-annex` and the existing strict Annex projection independently agrees.
A base Development & Casting reservation remains semantic; the UI must not borrow the Annex.

If successor presentation validation fails after a valid Engine action, keep the valid successor
and autosave but show only neutral success. Presentation may never roll back an accepted action.

## 10. Deep-owner boundary

Writers’ Room remains the owner of deeper screenplay/project history, comparison, package planning,
and broad project management. The Lot deep action must revalidate the latest exact project before
navigating and focus that project. A stale action remains in the Lot.

Opening/closing the deep owner changes no Engine truth. Return uses the current App-owned state and
never restores cached review facts or a consumed event receipt.

## 11. Save, simulation, and content boundary

V1 is an intended UI interaction/navigation change. It adds no Core action and changes no:

- GameState or SaveFileV1–V11 field, schema, migration, import, or export;
- script assessment, rewrite, accept, due-week, assignment, facility, capacity, or consequence law;
- studio-decision priority, tick, release, construction, publicity, economy, awareness/reach, RNG,
  ledger, cash, payroll, overhead, or outcome;
- production, shooting, rehearsal, Post, casting, employment, or greenlight law; or
- manifest, authored/generated art, exporter, texture, Place, building, route, actor, animation,
  draw owner, or renderer clock.

It authorizes no personal location, travel, arrival, room occupancy, workload, queue, stress,
fatigue, relationship, autonomy, pathfinding, Sims control, or second simulation. Resource-slot
occupancy is not human occupancy.

## 12. Responsive, accessibility, and visual gate

The review must remain readable and actionable at governed desktop widths, 960×540, effective 200%,
and 480×270/DSF2 without page-level horizontal overflow or covering the people/production rails.
Long titles, writer names, blockers, strengths, and concerns wrap within a bounded internally
scrollable owner.

World actions precede the deep action in DOM, visual, pointer, and keyboard order. Native buttons
retain visible focus, disabled truth, minimum touch targets, forced-colors readability, grayscale
meaning, reduced-motion neutrality, and virtual-assistive-technology activation. The review heading
or event heading owns focus once; successor feedback owns one polite exact announcement.

No action may depend on canvas readiness. Renderer failure keeps the complete semantic decision.

## 13. Required proof

Implementation is not Keep-eligible without:

1. strict selector unit tests for first/final review, one/two actions, assessment/blocker copy, array
   reversal, duplicate identity/action, extra/symbol keys, sparse arrays, malformed optional fields,
   hostile card/decision disagreement, and neutral failure;
2. App/component proof for pending review selected from Development and newly reached next-event
   review;
3. byte-identical parity with the same direct `runScriptProjectAction` action;
4. Accept-first, Accept-final, Rewrite-base-facility, and Rewrite-Annex successors;
5. exact event consumption, rejection restoration, stale state/receipt/action, same-title projects,
   replacement, import/load, deep return, and no substitution;
6. pointer, mouse, touch, Enter, Space, repeat, cross-key, virtual-AT, blur, hidden, modal, renderer
   delay/failure/recreation, reduced-motion, forced-colors, grayscale, zoom, and compact proofs;
7. SaveFileV11 byte equality for selection, deep open/close, and rejected/stale paths;
8. no Core/art/manifest/exporter/asset/draw change and unchanged protected hashes/refs;
9. focused, complete UI, complete repository, governed D-16/D-17, TypeScript, production-build, and
   `git diff --check` gates; and
10. ordinary Chromium play proving world action first, deep detail optional, same mounted Lot on
    action, truthful successor, and no browser warnings/errors.

## 14. Keep / Kill gate

**KEEP** only if an ordinary player can resolve both a newly surfaced and already-pending screenplay
review from the living Lot, sees every current legal choice and no illegal choice, receives the
exact successor, and still reaches the focused Writers’ Room when deeper evidence is wanted.

**KILL or narrow** if the surface hides a legal action, invents rewrite availability, exposes hidden
truth, accepts stale/replaced identity, duplicates Engine dispatch, makes renderer readiness an
authority gate, misleadingly claims a physical Writers workplace, or makes the live Lot less
readable than the existing deep-only path.

## 15. Economic and publication boundary

The governing result remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal
G12 timing remain open. This milestone certifies no complete macroeconomic balance and authorizes no
financing, loans, bailouts, restructuring, failure ladder, hard bankruptcy, or arbitrary cash sink.

No merge to `main`, push, or tag is authorized. Implementation and evidence must remain on
`operation-hollywood-autonomous-marathon` until separately governed.
