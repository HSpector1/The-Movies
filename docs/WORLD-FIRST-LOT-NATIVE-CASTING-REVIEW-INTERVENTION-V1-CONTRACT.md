# World-First Lot-Native Casting Review Intervention V1 Contract

Status: **FROZEN — BINDING IMPLEMENTATION AUTHORITY**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Implementation parent and accepted Lot-Native Screenplay Review closure:
`e37035c1caff095d4456c85d74a97304fc654cba`

Contract authority: the documentation checkpoint containing this record; its commit SHA is
intentionally not guessed before that checkpoint exists.

Scope state: **BOUNDED IMPLEMENTATION FREEZE**

## 1. Governing authority

This contract follows:

- the Owner's binding ruling that **THE STUDIO LOT IS THE PRIMARY GAME SURFACE** and
  **MANAGEMENT UI SUPPORTS THE WORLD. IT DOES NOT REPLACE THE WORLD**;
- the ordinary flow
  `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME FRESH LIVE WORLD`;
- accepted Lot-Native Screenplay Review contract
  `22ee17c01b688a114b9803f7754af1be6477c655`, implementation
  `67a0bf333fc4863548fb13fbc2696fd002bd627d`, and closure
  `e37035c1caff095d4456c85d74a97304fc654cba`;
- accepted Lot-Native Next-Event contract `15e65c494b28518e3ba8df2e74823adff3178897`,
  implementation/hardening `eb6cef1bb2cadc09438daacefb5868e7e6269b44` /
  `aabb68477fe73ea21af3195985ee7ffaf6a182f7`, and closure
  `2e32b0520ca2dc1c5a3a091000c6cbb998637f28`;
- frozen Casting Sessions V1 contract `efac91f304b433b7d703eb82b28c7564b38522fc`,
  implementation `49d9ae1dbead2c4f7e8a3db86993d39ad53b44d7`, and closure
  `6a1b57c91bbc4323971ab141823df246de58f6ac`;
- Core `nextStudioDecision`, `castingSessionsReadModel`, and Casting Sessions lifecycle/action law;
- App ownership of the one current `GameState`, autosave, whole-state replacement, event-session
  ownership, and deep navigation; and
- accepted Hollywood semantic fallback law: Casting is a semantic destination in Operation
  Hollywood, not an invented physical building.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`; and
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

No merge, push, tag, or protected-ref movement is authorized by this contract.

## 2. Measured world-first break

The accepted Lot already stops unattended simulation at the first exact Casting review, keeps
exact session/project/title identity, and orients Casting. It currently renders only
`Casting review · <title>` and offers **Open Casting Room**. An already-pending review likewise
disables **Sim to next event** and tells the player to leave the Lot.

That forced handoff is unnecessary for the bounded review Core already owns. The player-safe card
contains six persisted camera-test observations—Lead, Antagonist, and Support, two people for each—
plus adjacent Fit, current availability, package consequences, detailed blockers, and exactly one
legal acknowledgement action.

V1 closes only this review break. It does not move slate planning, performed auditions, final cast
selection, or Package Assembly into the Lot.

## 3. Binding player loops

New next-event review:

```text
LIVE STUDIO LOT
→ SIM TO NEXT EVENT
→ EXACT CASTING REVIEW STOP
→ READ ALL SIX PERSISTED RESULTS + CURRENT PACKAGE CONSEQUENCES IN THE LIVE LOT
→ ACKNOWLEDGE THE ONE EXACT CURRENT REVIEW
→ BLOCKED PACKAGE: SAME MOUNTED LOT REPAINTS COMPLETE + CURRENT BLOCKERS
→ CLEAR PACKAGE: ACCEPT COMPLETE, THEN OPEN THE FOCUSED DEEP PACKAGE SURFACE
→ RETURN TO FRESH CURRENT LOT TRUTH
```

Already-pending review, including load/return:

```text
LIVE STUDIO LOT / CASTING NEEDS ATTENTION
→ SELECT CASTING
→ SAME EXACT REVIEW AND SOLE LEGAL ACTION
→ ACT FROM THE WORLD, OR OPEN THE EXACT CASTING ROOM CARD
→ RETURN TO FRESH CURRENT LOT TRUTH
```

The Lot must not require a cadence receipt merely to act on a current legal review. A receipt owns
the newly surfaced event ceremony; Core's current decision owns the already-pending path.

## 4. Existing Engine authority

Implementation must reuse, not copy:

- `studioDecision(state)` / Core `nextStudioDecision(state)` for cross-system priority;
- `castingSessionsBoard(state)` / Core `castingSessionsReadModel(state)` for the player-safe card;
- `acknowledgeCastingSessionAction(state, sessionId)` for action dispatch; and
- the existing Core `acknowledgeCastingSession` transition.

The only V1 world command is the exact current action whose kind is:

```text
acknowledgeCastingSession
```

It carries exact `sessionId`, `projectId`, `label`, and `opensPackage`. The two current Core labels
remain authoritative:

- `Finish casting review` when ordinary package gates remain blocked; and
- `Take results to Package` when those gates are clear.

The Lot must not silently reuse `Take results to Package` while merely staying on the Lot. When
`opensPackage === true`, App must first accept and autosave the exact `review → complete` Engine
successor, then open the existing focused Package Assembly as the explicitly requested supporting
deep surface. When `opensPackage === false`, App keeps the same Lot mounted and shows the exact
complete successor plus current blockers.

`planAuditions`, `startCastingSession`, `openPackage`, activation, screenplay, greenlight,
production, employment, publicity, and construction commands are outside the native review action
surface. A clear successor's existing package navigation is a deep route, not a second Casting
command.

## 5. Strict current-review context

One pure Lot selector, `currentLotCastingReviewContext`, must rebuild a review context from the
latest state. It must require:

1. managed Casting Sessions and managed Script Projects;
2. exactly one current `studioDecision` of kind `castingReview`;
3. exact closed equality with `castingSessionsBoard(state).nextDecision`;
4. one non-empty session ID, project ID, and title;
5. exactly one matching card in `needsReview`, no duplicate session or project identity in that
   section, and no same session/project identity in another section;
6. canonical first-review ownership by ascending session ID, never project ID, title, array
   accident, first/last match, or Map winner;
7. exact card/session/project/title agreement, `status === review`, `dueWeek === null`,
   `weeksUntilDecision === null`, one named writer, one governed genre, and the exact review
   consequence;
8. exact own keys and accepted prototypes for the context, writer, role records, evidence records,
   Fit records, action, package availability, blocker records, and every nested collection;
9. exactly the canonical role keys `lead`, `antagonist`, `support` and exactly two dense evidence
   rows for each, in persisted slate/result order; each role pair is distinct and the complete six
   rows contain at least three unique Talent IDs, while the same person may legally appear in more
   than one different role and must not be rejected or merged for doing so;
10. for every evidence row: one non-empty Talent ID and name, `label === Est.`, an integer estimate
    from 0 through 100, the persisted governed low/high band, one finite public `Fit` score, boolean
    current availability, non-empty availability copy, and dense canonical strength/concern arrays;
11. exact identity/order agreement between each evidence row and its corresponding current
    candidate row, including ID, name, Fit, availability, and availability label;
12. one non-null package-availability record, its exact booleans, every detailed current blocker,
    and exact agreement between detailed blocker headlines and the card's summary blocker list;
13. exactly one current `acknowledgeCastingSession` action for that same session/project, with one
    non-empty Core label and boolean `opensPackage`; and
14. `opensPackage`, action label, package readiness, blocker presence, and successor route agreeing
    exactly—clear means `Take results to Package`, no ordinary blockers, and known gates clear;
    blocked means `Finish casting review`, at least one ordinary blocker, and known gates not clear.

The selector must reject extra string or symbol keys, duplicate array indices, sparse arrays,
decorated tuples, duplicate Talent identity inside a role, candidate/result disagreement,
malformed optional fields, or thrown adapter output. Object property insertion order is not
authority; presentation uses the frozen Lead → Antagonist → Support order explicitly.

For a next-event action, the selector must additionally require one complete valid receipt whose
casting target has the same session/project/title and is owned by the exact current App event
session. A malformed or stale receipt never downgrades into the pending-review path during the same
gesture.

Failure is neutral: expose no action or evidence claim, do not choose another session, do not
navigate, do not mutate or resave state, and demote only invalid event presentation under accepted
cadence law.

## 6. Player-safe Lot presentation

The bounded review surface must expose:

- exact screenplay title, project ID, and casting session ID;
- exact genre;
- named writer and public creative role;
- the exact review consequence that results remain advisory and select no winner;
- canonical Lead, Antagonist, and Support sections in that order;
- both exact persisted evidence rows in each role;
- each person's exact name and Talent ID;
- visibly qualified `Est.` estimate and persisted camera-test low/high range;
- adjacent `Fit` labelled exactly `Fit`;
- current availability and exact availability label;
- every current player-safe strength and concern;
- current package state and every detailed blocker headline/detail/remedy;
- the one exact legal world action; and
- **Open Casting Room details** after the world action.

Do not surface actual execution, hidden skills/persona, ceiling, seed, RNG input, a combined score,
automatic recommendation, ranking, predicted winner, certainty, or a claim that Fit is perceived-
only. `Est.` must remain visible anywhere the persisted audition estimate appears; the range must
remain a range, not be collapsed into certainty.

The same bounded content must work in Hollywood, renderer failure, delayed readiness, and the
semantic/Classic fallback. Classic may retain its established physical Casting building. Operation
Hollywood owns no Casting building, polygon, room, route, or accepted Casting art; its Casting
companion remains semantic and cannot become a physical-place claim.

## 7. Pending-review selection law

When the latest exact review exists:

- selecting the Hollywood semantic **Casting** destination keeps the Lot mounted and opens the
  bounded review;
- selecting the established Classic physical Casting building may open the same bounded review;
- renderer semantic activation and an exact current Casting attention control resolve the same
  context; and
- selecting another person/place/building yields the review context normally.

If no exact review exists, Casting retains its established deep route. No first/default review is
selected merely because the board contains historical or later review cards.

Returning from Casting Room revalidates current truth: the same review may be restored; an
acknowledged, removed, malformed, or replaced review returns to a neutral fresh Lot and is never
substituted by the next session.

## 8. Exact action dispatch

App remains the sole action owner. One activation must:

1. capture the exact rendered state, complete review context, sole action, and optional receipt;
2. synchronously compare the rendered state with `latestStateRef.current`;
3. rebuild the latest strict context;
4. require exact closed-field equality with the rendered context/action;
5. for an event, require exact current event-session and receipt ownership;
6. consume event ownership before dispatch;
7. call `acknowledgeCastingSessionAction` exactly once with the exact session ID;
8. on success, synchronously advance the latest-state ref and schedule the exact returned App
   state through the established authoritative replacement boundary; the resulting committed state
   owns the normal autosave effect and either the blocked same-Lot repaint or the clear deep-route
   handoff; and
9. on Engine rejection, preserve unchanged state and restore an event only if the same complete
   receipt/context/action remain current.

If the successor is clear and `opensPackage === true`, deep Package navigation occurs only after
the exact successor render has committed and the earlier existing autosave effect has been invoked.
One later App effect may consume a captured pending route only while current state still is that
exact successor and still proves the same completed session/project, the same persisted results,
clear current package availability, and one exact `openPackage` action. A stale,
presentation-invalid, unmounted, or replaced successor clears the pending route, remains in fresh
Lot truth, and never opens Package. The contract does not require or claim an impossible
intermediate visible Lot paint before this clear deep handoff.

No optimistic completion, delayed UI result, retry, read-model rerun, renderer acknowledgement, or
deep route may make the command legal. Double click, held Enter/Space, cross-key tails,
pointer→mouse, touch→click, virtual-AT activation, neighboring-button blur, cancel, hidden tab,
modal, renderer replacement, stale closure, and whole-studio replacement must produce at most one
Engine call and at most one authorized navigation.

## 9. Exact successor feedback

The accepted action must prove a field-exact transition:

- the same exact session changes only from `review` to `complete`;
- the same project, title, writer, genre, slate, started week, and six persisted results remain;
- due week and reservation remain `null`;
- every `Est.` result/range remains identical;
- no winner, cast assignment, employment, hold, availability, Fit, or automatic recommendation is
  written;
- current week, cash, capacity, facility set, RNG state, ledger, payroll, overhead, productions,
  contracts, market, and every unrelated session remain byte-equal; and
- the acknowledged session no longer owns the current Casting decision.

For blocked package availability, bounded same-Lot feedback may say only:

- casting review is complete;
- persisted evidence remains available; and
- the exact current package blockers still apply.

For clear package availability, the successor must prove the same completed session plus one exact
current Package action before the focused Assembly route opens. If successor validation fails after
a valid Engine action, keep the valid successor/autosave, do not navigate, and show only neutral
success in the fresh Lot. Presentation may never roll back or repeat an accepted action.

A Review session has `reservation === null`. V1 must not select the Annex, claim Annex/base origin,
show active facility occupancy, or infer where the completed camera tests occurred.

## 10. Deep-owner boundary

Casting Room remains the owner of slate planning, active sessions, full review/history comparison,
and broad Casting management. The pre-action deep route must revalidate the latest exact
session/project before navigating and focus that exact review card. A stale action remains in the
Lot.

Package Assembly remains the owner of final cast choice, complete package formation, legality,
budget, staffing, greenlight, and all deep package work. The clear acknowledgement route may open
only the exact current package for the same project after the accepted successor proves it. It does
not preselect a cast member, rank audition evidence, or perform greenlight.

Opening/closing either deep owner changes no Engine truth by itself. Return uses current App-owned
state and never restores cached review facts or a consumed event receipt. An accepted Assembly
transition continues to use the separately governed greenlight-formation return path.

## 11. Save, simulation, and content boundary

V1 is an intended UI interaction/navigation change. It adds no Core action and changes no:

- GameState or SaveFileV1–V11 field, schema, migration, import, or export;
- audition observation, result range, Fit, availability, slate, completion, review, acknowledge,
  action label, package-availability, blocker, decision-priority, or session-order law;
- tick, release, construction, publicity, economy, awareness/reach, RNG, ledger, cash, payroll,
  overhead, or outcome;
- production, screenplay, employment, contract, casting choice, greenlight, or facility law; or
- manifest, authored/generated art, exporter, texture, Place, building, route, actor, animation,
  draw owner, renderer clock, or accepted district geometry.

It authorizes no performed-audition animation, personal location, travel, arrival, waiting,
workload, queue, stress, fatigue, relationship, talent hold, room occupancy, autonomy, pathfinding,
Sims control, or second simulation. It makes no intermediate skipped-week spectacle claim.

## 12. Responsive, accessibility, and visual gate

Six complete evidence rows are materially taller than the screenplay card. The review must remain
readable and actionable at governed desktop widths, 960×540, effective 200%, and 480×270/DSF2
without page-level horizontal overflow or covering the people/production rails. Long titles,
names, availability copy, strengths, concerns, consequence, and blocker details wrap within one
bounded internally scrollable owner. Compact presentation may stack roles, but may not omit,
collapse into first-only evidence, or reorder the six rows.

The world action precedes **Open Casting Room details** in DOM, visual, pointer, and keyboard order.
Native buttons retain visible focus, disabled truth, minimum touch targets, forced-colors
readability, grayscale meaning, reduced-motion neutrality, and virtual-assistive-technology
activation. The review/event heading owns focus once; same-Lot blocked success owns one polite exact
announcement. Clear-package navigation focuses the established deep owner and Back restores a
stable fresh Lot owner.

No evidence or action may depend on canvas readiness. Renderer failure keeps the complete semantic
decision.

## 13. Required proof

Implementation is not Keep-eligible without:

1. strict selector unit tests for clear/blocked package cases, multiple reviews in canonical
   session order, same-title projects, complete six-row evidence, exact labels/copy, array reversal,
   duplicate identity/action, extra/symbol keys, sparse/decorated arrays, candidate/result drift,
   malformed package/blocker/action fields, thrown adapter output, and neutral failure;
2. App/component proof for an already-pending review selected from Casting and a newly reached
   next-event review;
3. byte-identical parity with the same direct `acknowledgeCastingSessionAction` action;
4. proof that exactly one session field changes `review → complete`, results persist, and week,
   cash, capacity, RNG, ledger, facilities, and unrelated state do not move;
5. blocked same-mounted committed successor and clear committed successor → autosave invocation →
   exact focused Package route, with no claimed intermediate visible Lot paint for the clear path;
6. exact event consumption, rejection restoration, stale state/context/action/receipt,
   same-title/multiple-session ordering, replacement, import/load, deep return, and no substitution;
7. Casting Room exact focus before action; exact Package focus only after clear accepted success;
   fresh return after unchanged, blocked, clear, and state-changing deep paths;
8. Hollywood semantic-only selection, Classic compatibility, renderer delay/failure/recreation,
   and no physical Hollywood Casting/Annex claim;
9. pointer, mouse, touch, Enter, Space, repeat, cross-key, virtual-AT, neighboring-button blur,
   cancel, hidden, modal, unmount, reduced-motion, forced-colors, grayscale, zoom, and compact proofs;
10. SaveFileV11 byte equality for selection, deep open/close, stale, rejected, and presentation-only
    paths;
11. no Core/art/manifest/exporter/asset/draw change and unchanged protected paths/hashes/refs;
12. focused, complete UI, complete repository, governed D-16/D-17, TypeScript, production-build,
    and `git diff --check` gates; and
13. ordinary Chromium play proving all six exact rows, world action first, no winner claim,
    blocked same-Lot completion, clear exact Package handoff, fresh return, and no browser warnings
    or errors.

## 14. Keep / Kill gate

**KEEP** only if an ordinary player can resolve both a newly surfaced and already-pending Casting
review from the living Lot, read all six persisted advisory results and current package
consequences, invoke the sole exact action once, receive the exact successor, and still reach the
focused supporting Casting Room/Package owners when their deeper work is needed.

**KILL or narrow** if the surface hides/reorders evidence, drops one candidate, invents a winner or
combined score, presents Fit as hidden/perceived-only, accepts stale/replaced identity, duplicates
dispatch/navigation, silently keeps a `Take results to Package` action in the Lot, makes renderer
readiness an authority gate, claims physical Hollywood Casting or Annex review occupancy, or makes
the living Lot less readable than the existing deep-only path.

## 15. Economic and publication boundary

The governing result remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal
G12 timing remain open. This milestone certifies no complete macroeconomic balance and authorizes
no financing, loans, bailouts, restructuring, failure ladder, hard bankruptcy, or arbitrary cash
sink.

No merge to `main`, push, or tag is authorized. Implementation and evidence must remain on
`operation-hollywood-autonomous-marathon` until separately governed.
