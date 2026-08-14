# World-First Named Person Work & Career Inspector V1 Evidence

Status: **IMPLEMENTED, VALIDATED, AND RETAINED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Corrected contract authority: `c5c1679a1eee3ff82655ac59c80af54c8c6f52e0`

Implementation authority: `04f7d9da01a1f609b54430c4a0265d7cdd637b4a`

## Keep ruling

World-First Named Person Work & Career Inspector V1 passes its bounded Keep gate.

A player can select an exact named Director or Lead actor from the living Hollywood Studio Lot,
understand that person's exact role on an authoritative picture and the picture's current work,
inspect bounded public career truth in place, open the one canonical Talent Profile when the join
is exact, and close it back to the same selected person in the same continuously mounted world.

The retained ordinary loop is:

```text
SEE A NAMED PERSON IN THE LIVE STUDIO
→ SELECT THAT EXACT PERSON PHYSICALLY OR SEMANTICALLY
→ READ EXACT PICTURE WORK AND PUBLIC CAREER CONTEXT IN WORLD
→ OPEN THE CANONICAL TALENT PROFILE IF NEEDED
→ CLOSE IT
→ RETURN TO THE SAME MOUNTED LOT, PERSON, CAMERA, AND OPENER
```

Engine/GameState remains the sole owner of production participation, tasks, facilities,
assignments, career history, time, saves, and outcomes. The Lot consumes public read models and
emits bounded identity intent; it does not create a people simulation or a second source of truth.

## Exact retained behavior

| Boundary | Retained result |
| --- | --- |
| Person identity | Physical Role Atlas selection and semantic named-person buttons use the same stable person ID. Neither path joins by sprite order, array position, title, or coarse role alone. |
| Managed picture work | One pure snapshot selector exposes exact Director/Lead role, picture ID/title, phase, production facilities, status, production countdown, and the existing Director task when the complete join is unique. |
| Lead truth | A Lead actor receives the picture's production facts but no Director task and no invented personal call, room, destination, reservation, or occupancy claim. |
| Legacy truth | An exact legacy participant receives `Legacy production schedule` and `Workplace` — `Not recorded · legacy schedule`; a presentation-assigned stage is never upgraded into workplace authority. |
| Roster truth | An exact roster inhabitant receives only the honest no-visible-production statement plus assignment/career detail when the separate canonical gate is exact. Employment or current work is not inferred from Lot provenance. |
| Hostile joins | Duplicate person IDs, duplicate operation rows, cross-production reuse, dual Director/Lead membership, missing Lead fields, stale identity/title/name, contradictory authority, and unsupported provenance fail closed to unavailable. No first/last match wins. |
| Assignment gate | A separate adapter scans every active production role and active screenplay assignment. Zero matches means `Available for assignment`, one match exposes that exact production or screenplay, and multiple matches withhold assignment, career, and profile handoff. |
| Career summary | Exact unique ID/name plus an exact assignment/work gate permits the existing public career-identity label, or primary discipline plus `not yet proven`. A legal cross-discipline picture role remains valid. |
| Canonical profile | The Lot emits only the selected person ID. App resolves the existing `talentProfile` and mounts the one existing `TalentProfileDrawer`; no Lot-specific profile or duplicate career computation exists. |
| Modal continuity | Opening the profile leaves `screen.kind` as Lot and retains the same `StudioLotScreen`, `StudioLotView`, Phaser game, canvas DOM node, selected person, production context, camera, URL, and authoritative state. |
| Input boundary | While the drawer is open, pointer, mouse, touch, wheel, keyboard, held-camera-key, and drag latches cannot act on the world. Suspension survives delayed renderer readiness and visibility changes, and is reapplied if an independent view recreation occurs. Profile open/close itself does not recreate the renderer or stop ambience. |
| Close and invalidation | Close button, Escape, and scrim activation return focus to the exact opener. If identity or handoff authority disappears while open, the raw open ID is cleared once, selection cannot transfer or auto-reopen, and focus moves to the named-people group or Lot heading. |
| Failure parity | The full semantic person inspector and canonical profile remain available when the renderer is rejected. Reduced motion changes presentation only, and the governed 960×540 bound retains reachability without horizontal overflow. |

No person location model, renderer-authored assignment, duplicate Talent Profile, second App,
screen transition, autosave, or Engine action was introduced by inspection.

## Honest person-truth boundary

This milestone proves an exact person's participation as Director or Lead actor on one exact
picture. It also proves the picture's phase, facility list, status, countdown, and—only for its
Director—the already-authoritative shooting task. It does **not** turn picture-level facts into a
person simulation.

In particular:

- `Production facilities` describes the picture's current operating facilities, not the person's
  present room or destination;
- `N production weeks remaining` is a production countdown, not an individual completion date;
- a Lead has no personal call status, task, reservation, facility occupancy, or travel authority;
- a legacy presentation stage is not a workplace;
- renderer routes, coordinates, movement speed, direction, and animation remain presentation only;
  and
- career copy remains public/perceived Talent Profile truth and exposes no actual persona, hidden
  skill, ceiling, or development rate.

V1 therefore makes existing person truth playable and legible without claiming workload, hours,
queue position, blocker ownership, stress, fatigue, needs, mood, relationships, memories,
autonomy, or direct character control.

## Exact implementation surface

Implementation commit `04f7d9da01a1f609b54430c4a0265d7cdd637b4a` changes 21 files with
1,778 insertions and 39 deletions.

The ten runtime/read-model/presentation files are:

- `ui/src/App.tsx`;
- `ui/src/components/TalentProfileDrawer.tsx`;
- `ui/src/engine/adapter.ts`;
- `ui/src/lot/StudioLotScreen.tsx`;
- `ui/src/lot/StudioLotView.ts`;
- `ui/src/lot/hollywood/HollywoodScene.ts`;
- `ui/src/lot/lot.css`;
- `ui/src/lot/scene/LotScene.ts`;
- `ui/src/lot/snapshot/StudioLotSnapshot.ts`; and
- `ui/src/lot/snapshot/personWork.ts`.

The eleven proof and compatibility-test files are:

- `ui/e2e/named-person-inspector-v1.spec.ts`;
- `ui/src/engine/adapter.test.ts`;
- `ui/src/lot/NamedPersonWorkCareerInspectorV1.test.tsx`;
- `ui/src/lot/StudioLotScreen.test.tsx`;
- `ui/src/lot/StudioLotView.hollywood.test.ts`;
- `ui/src/lot/WorldFirstLiveWeekAdvance.test.tsx`;
- `ui/src/lot/hollywood/HollywoodScene.test.ts`;
- `ui/src/lot/scene/LotScene.production-occupancy.test.ts`;
- `ui/src/lot/snapshot/personWork.test.ts`;
- `ui/src/lot/studio-lot-snapshot.test.ts`; and
- `ui/src/screens/d14-talent-profile.test.tsx`.

The operations projection adds optional Lead ID/name fields for compatibility and the adapter
always populates them for native current snapshots. Omission fails Lead-sensitive work detail
closed. The new `lotPersonWorkContext` remains snapshot-only; the separate
`talentAssignmentContext` and existing `talentProfile` remain GameState adapter seams.

No file under `src/core/` changed. No GameState, SaveFile, schema, migration, production law,
facility/reservation/construction law, career-history owner, clock, economy, publicity,
awareness/reach, RNG, ledger, or accounting owner changed.

## Automated contract proof

The retained proof closes the contract's authority, ambiguity, profile, continuity, input, and
failure families:

- exact Director and Lead identities project from native operation membership, including distinct
  Director task and Lead-no-task behavior;
- concurrent and same-title pictures remain isolated by exact person and production identity;
- managed, legacy, roster, missing-projection, duplicate, contradictory, and hostile reuse states
  accept only uniquely proven truth and otherwise fail closed;
- the whole-studio assignment gate distinguishes zero, one, and multiple production/screenplay
  memberships without reusing a last-write-wins convenience map;
- exact ID/name profile matching permits legal cross-discipline careers while withholding profile
  access for missing, stale, duplicated, or ambiguous authority;
- physical and semantic selections feed the same inspector and exact person ID handoff;
- selection, view identity, canvas identity, and focus survive modal open/close while world input is
  declaratively suspended;
- held keys, pointer state, drag latches, direct canvas input, wheel input, delayed readiness, and
  visibility resume cannot escape the modal boundary;
- disappearance and handoff invalidation close once, clear the raw open ID, focus a stable world
  target, and do not transfer or auto-reopen the profile; and
- renderer rejection, reduced motion, responsive presentation, and existing live-week behavior
  remain compatible.

The focused nine-file matrix passed **164/164** tests. A separate
`WorldFirstLiveWeekAdvance.test.tsx` compatibility rerun passed **9/9** tests after the fake view
was updated to expose the new presentation-only input-suspension seam.

## Ordinary-player browser acceptance

The focused Chromium acceptance loaded the deterministic native Week-30
`Nights of Watchtower` SaveFileV11 fixture under absent localStorage gates, exercising the adopted
ordinary Hollywood Lot defaults.

The player selected Director Estelle Delgado from the Lot's named-person companion and read:

- `Director` as role on picture;
- `Nights of Watchtower` as the exact picture;
- `Shooting` as the production phase;
- `Soundstage 7 + Scenery Shop` as production facilities;
- `Production hold` as production status;
- `5 production weeks remaining` as the production countdown; and
- `blocked` as the existing Director task.

The same inspector opened Estelle Delgado's canonical Talent Profile with exact
`Engaged on Nights of Watchtower` status. A direct synthetic pointer-down/up and wheel attack on
the covered canvas caused no world selection or camera action. Escape returned focus to the exact
profile opener, retained the Director selection, retained the marked original canvas node, and
left exactly one canvas mounted.

The player then selected Lead actor Vivien Nakamura, received the same exact picture context with
no Director-task row, opened Vivien Nakamura's exact canonical profile, and closed back to that
same Lead opener. The browser URL and native localStorage save bytes were byte-identical before
and after the complete inspection, and the original canvas marker remained present.

At 960×540 the inspector and profile command remained visible with no document-level horizontal
overflow. The essential semantic Director/profile path also passed with the renderer module
rejected, and the Lead/profile path passed under reduced motion while preserving the identical
canvas node. The focused named-person suite passed **3/3** and the complete Chromium suite passed
**117/117**.

## Final verification

| Gate | Result |
| --- | --- |
| Root and UI TypeScript | **PASS** |
| Focused affected matrix | **PASS — 9/9 files, 164/164 tests** |
| Additional World-First Live Week compatibility suite | **PASS — 1/1 file, 9/9 tests** |
| Complete Vitest repository suite | **PASS — 167/167 files, 2,095/2,095 tests** |
| Governed D-16/D-17 harness | **PASS — 10/10 files, 176/176 tests** |
| Production build | **PASS** |
| Focused Named Person Chromium suite | **PASS — 3/3 tests** |
| Complete Chromium suite | **PASS — 117/117 tests** |
| `git diff --check` | **PASS** |
| Independent final strict audit | **PASS — no remaining findings** |

The production build retains only the existing large-chunk advisory. It is not reclassified as a
person-inspector, modal-continuity, or authority failure.

## Authority neutrality and open boundaries

This milestone intentionally changes Lot read-model and presentation behavior: exact person-work
inspection, unique assignment/profile gates, canonical profile handoff, modal input suspension,
stable close focus, and renderer-failure parity. It adds no authoritative mutation. Selecting,
opening, reading, and closing emit no Engine action and leave native SaveFileV11 bytes, week, cash,
RNG, ledger, productions, tasks, and people unchanged.

Personal travel/workload/needs/relationship simulation, new assignment or redirection commands,
named ambient workers, unrestricted autonomy, and persistent Lot mounting behind deep screens
remain outside this bounded close.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

The following remain explicitly open and are neither concealed nor reclassified:

- cash runaway;
- top-studio economic immortality;
- week-208 synchronized roster wall;
- P5 dominance;
- world-led variance;
- cheap-film purpose;
- premium-film purpose;
- remaining menu breadth; and
- formal G12 timing.

This milestone is not broad macroeconomic certification. It introduces no financing, loans,
bailouts, restructuring, failure ladder, or arbitrary cash sink.

## Git and publication boundary

This milestone exists only on `operation-hollywood-autonomous-marathon`. Local `main` remains at
`33eb33ae307904aa3f00db20bc695e40bf46d1e4`; accepted D-17B remains at
`35d42687a410a621becf1df35c75986657f8c44e`; and the Operation Hollywood bridge remains at
`623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

Nothing was merged or pushed. No tag was created.
