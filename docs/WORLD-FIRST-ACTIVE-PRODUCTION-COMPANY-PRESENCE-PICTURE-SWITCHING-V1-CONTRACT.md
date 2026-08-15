# World-First Active Production Company Presence & Picture Switching V1 Contract

Status: **FROZEN — IMPLEMENT ONLY THIS BOUNDED MANAGED-WORLD SLICE**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Accepted cadence closure authority: `2e32b0520ca2dc1c5a3a091000c6cbb998637f28`

## 1. Authority base

This contract follows:

- the Owner's binding world-first doctrine in `CURRENT-BEST.md`;
- accepted D-17B bounded economy truth;
- Managed Production Operations and SaveFileV11;
- the accepted Dynamic People Role Atlas V1;
- World-First Named Person Work & Career Inspector V1;
- World-First Greenlight Production Formation & Fresh Lot Return V1; and
- World-First Lot-Native Next-Event Cadence & Reaction V1.

The binding product law remains:

> **THE STUDIO LOT IS THE PRIMARY GAME SURFACE. MANAGEMENT UI SUPPORTS THE WORLD.**

Engine/GameState remains sole authority for active-production identity, participant assignment,
role exclusivity, employment, screenplay work, production phase, workflow, reservation, facility,
task, command, time, release, cancellation, save, RNG, money, ledger, and outcome truth. This
milestone adds one strict read-model projection and bounded world selection/presentation. It adds
no simulation or action.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`;
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`; and
- accepted Lot-native cadence closure: `2e32b0520ca2dc1c5a3a091000c6cbb998637f28`.

No merge, push, tag, or protected-ref movement is authorized.

## 2. Measured gap

The accepted several-minutes-on-Lot loop now lets the player form a picture, select its Director
or Lead, inspect Stage 7, resolve existing shooting work, advance to the next interruption, and
return through supporting deep surfaces. The living company is nevertheless incomplete.

Core already owns every active picture's exact:

- Writer;
- Director;
- Lead;
- Antagonist;
- Support;
- Production/Craft Lead; and
- current production assignment for each person.

Legal engaged greenlight requires exactly those six distinct people. It rejects one person filling
two roles in a picture, rejects reuse across active pictures and active screenplay work, requires
exactly one craft lead, and caps ordinary play at two concurrent pictures.

The Lot currently projects only Director and Lead. Writer, Antagonist, Support, and Craft Lead
remain rows on supporting screens even while they are authoritatively engaged on the visible
picture. With two pictures, the semantic production rail can switch exact inspector context, but
the world does not show either complete company or make company membership legible.

The current experience is therefore:

```text
FORM OR SELECT A PICTURE IN THE LIVING LOT
→ SEE ONLY DIRECTOR + LEAD AS NAMED INHABITANTS
→ LEAVE THE WORLD OR REMEMBER THE PACKAGE TO KNOW THE REST OF THE COMPANY
```

V1 closes only that presentation and exact-selection break.

## 3. Product outcome

For every ordinary legal managed active production:

```text
SEE THE COMPLETE SIX-PERSON COMPANY IN THE LIVE LOT
→ SELECT THE PICTURE OR ANY EXACT COMPANY MEMBER
→ SEE THAT PICTURE'S COMPANY BECOME LEGIBLE
→ INSPECT THE PERSON'S EXACT ROLE ON THE PICTURE
→ READ CURRENT PICTURE PHASE / FACILITY / STATUS / COUNTDOWN
→ OPEN THE CANONICAL TALENT PROFILE IF NEEDED
→ CLOSE TO THE SAME MOUNTED LOT AND EXACT PERSON
→ SWITCH TO THE OTHER ACTIVE PICTURE WITHOUT IDENTITY DRIFT
```

All active companies remain present when one picture is selected. Switching changes only exact
focus, emphasis, and inspector ownership. It does not despawn, teleport, reassign, pause, or hide
another picture's authoritative people.

Stage 7 remains the only accepted physical production/action place. Company emphasis is a
selection cue, not a new building, workplace, set, stage, room, queue, route, or occupancy claim.

## 4. Existing Core authority remains frozen

No production or staffing behavior changes.

Core already owns:

1. raw `Production.writerId`, `directorId`, three exact cast slots, and `craftIds`;
2. unique current Talent identities referenced by legal public-action productions;
3. within-picture one-person/one-role legality;
4. cross-active-picture and active-screenplay exclusivity;
5. exactly one Production/Craft Lead in engaged ordinary play;
6. a maximum of two concurrent productions in ordinary Engine-reachable play;
7. assignment lifetime until release or cancellation; and
8. removal of the production and its managed workflow/reservations at release or cancellation.

Assigned role comes from the production slot. `Talent.role` is a career-home profession and cannot
be used to relabel a cross-discipline Writer as the picture's Writer, Director, actor, or craft
lead.

`Production.participants` is optional immutable greenlight/autopsy history. It may preserve a
historical name and owns forecast/contribution evidence, not current assignment. V1 derives
current company identity only from raw active `Production` slots plus one unique current Talent;
it exposes no participant OVR, Fit, Expected Performance, freelancer, or hidden-skill fact.

## 5. Accepted-save honesty boundary

SaveFileV11 validates production references and participant shapes, but it does not re-prove all
public-action invariants. A structurally accepted or hostile in-memory state may contain:

- more than two active productions;
- zero or multiple craft IDs;
- one Talent ID in multiple roles or pictures;
- a production plus screenplay collision; or
- optional participant history that does not correlate with the raw current slots.

The new company projection must therefore prove its own narrow presentation authority. It must
not assume that save acceptance certifies ordinary greenlight legality, and it must never truncate
an overflow to the first two or first six people.

When the strict full-company proof fails, omit the expanded company feature atomically and retain
only the independently safe pre-existing Lot fallback. Do not crash, normalize, repair, reject,
mutate, or resave the state. A partial list must never be labelled a complete production company.

## 6. Exact additive projection

Add an optional additive member projection to each Lot `ProductionOperationsState` equivalent to:

```ts
export type LotProductionCompanyRole =
  | 'writer'
  | 'director'
  | 'lead'
  | 'antagonist'
  | 'support'
  | 'craft'

export type LotProductionCompanyMember = {
  productionRole: LotProductionCompanyRole
  slotIndex: number
  talentId: string
  name: string
  presentationRole: 'director' | 'talent'
}

export type ProductionOperationsState = {
  // existing exact operation fields remain unchanged
  companyMembers?: readonly LotProductionCompanyMember[]
}
```

Adapter-created legal managed rows populate `companyMembers`. Optionality preserves older tests,
legacy presentation snapshots, and the explicit hostile-state fallback. Existing Director/Lead
fields and the accepted Formation receipt remain unchanged.

The projection is all-or-nothing across the current managed production set. Before populating any
row, require:

1. managed Operations plus Engine stage-assignment authority;
2. zero through two active productions;
3. unique non-empty production IDs;
4. exactly one operation for every active production and no unowned operation;
5. exact operation production ID and current title agreement;
6. exactly one raw craft ID for each picture;
7. exactly six canonical slots per picture in Writer, Director, Lead, Antagonist, Support, Craft
   order, with `slotIndex: 0` for this governed cardinality;
8. six distinct Talent IDs inside each picture and no reused Talent ID across pictures;
9. exactly one current Talent row for every member ID;
10. the uniqueness-aware whole-studio assignment gate returning exactly that production ID and
    title for every member, with no screenplay or second-role collision;
11. exact current Director and Lead identity/name agreement with their existing operation fields;
    and
12. no extra or omitted member introduced by array position, title, profile profession, frozen
    participant history, or last-write-wins maps.

Canonical output order is plain production ID, then Writer, Director, Lead, Antagonist, Support,
Craft. Array order is never identity. Same-title and same-week pictures remain distinct by ID.

The `presentationRole` mapping is exact and narrow:

- assigned Director → existing `director` presentation role;
- every other company member → existing generic `talent` presentation role.

The Role Atlas already defines `director` and `talent` as presentation roles, not professions or
disciplines, and explicitly permits appearance reuse. Writer and Craft must not be rendered as
ambient Grip, Stagehand, Electrician, Camera, Publicity, Security, or Extra. Those remain cosmetic
district actors and never become named staff.

## 7. Shared strict Lot selector

Add one pure snapshot selector shared by React and the Hollywood scene. It accepts complete company
truth only when:

- every populated company row has the exact six-role/cardinality/order contract;
- production and member IDs are unique globally;
- each company belongs to one exact operation;
- the operation's Director and Lead fields agree with the company;
- every company member joins exactly one active-production `LotPersonState` by ID, name,
  presentation role, production ID, and production title;
- no active-production person exists outside the complete projected companies; and
- managed/Engine provenance is exact.

Missing optional company fields use the frozen Director/Lead compatibility selector. Present but
malformed fields fail the expanded context closed; they do not silently fall back within the same
claim.

Extend `lotPersonWorkContext` so a member of a valid company resolves one exact:

- role on picture;
- production ID/title;
- phase and phase label;
- production-level facility label and mapped building;
- production status;
- production countdown; and
- Director shooting-task status only for the assigned Director.

Duplicate people, operations, companies, members, roles, IDs, names, titles, presentation roles,
or cross-picture membership return unavailable. Never choose first, last, Map winner, current tab,
selected stage, or matching title as authority.

## 8. Living-world presentation

Every member of a valid company becomes one reconciled named Role Atlas inhabitant using the
existing stable Talent ID. Existing scene law remains:

- one sprite plus one normally hidden label per named person;
- stable ID owns reconciliation and selection;
- snapshot order cannot reshuffle existing homes;
- direct-load truth creates the same people without replaying an arrival;
- only the exact Stage 7 Director may use the accepted cosmetic call route; and
- release/cancellation destroys the removed company's people on the next snapshot.

V1 may add deterministic selection emphasis using existing sprite tint/alpha/scale only. It may
not add a company building, Place, anchor, route, animation clock, texture, badge asset, worker,
or renderer-owned result. Selection emphasis must distinguish the selected person from the rest of
their company and the selected company from another picture without representing availability,
quality, fame, mood, productivity, employment, or task state.

The selected person's bounded nameplate may add exact role-on-picture and picture identity if live
inspection proves it readable. It must not become a permanent wall of twelve labels.

Selecting a physical person must select that exact member and exact picture context. Selecting a
semantic member must select the same scene identity when the renderer is available. Selecting a
picture may emphasize its complete company even when Development, Pre-production, Post, Release
Ready, or Stage 12 has no accepted physical production outline.

No cue may imply that the deterministic presentation home is a personal workplace or destination.

## 9. Supporting company controls and inspector language

The existing production and named-person companion controls remain supporting accessibility and
precision surfaces. They may be grouped by exact picture so two-company membership is legible at
ordinary and compact layouts. They must remain complete when the renderer fails.

Each member control exposes exact current name, role on picture, and picture title. The selected
person inspector uses these role labels:

- `Writer`;
- `Director`;
- `Lead actor`;
- `Antagonist`;
- `Supporting actor`; and
- `Production/Craft Lead`.

The inspector may show `Production facilities`, because that is existing picture-level authority.
It must not say that Writer, cast, or Craft is personally at, travelling to, reserved into,
occupying, or working inside that facility. The countdown remains `production weeks remaining`,
not an individual deadline.

Only the selected assigned Director may see the existing Director task or
`assignShootingDirector` command. Every selected non-Director must suppress it. Picture-level
Scenery Clear and Schedule commands retain their existing authority where the current inspector
context permits them.

Assignment/career copy and canonical Talent Profile handoff continue to require:

- one exact Lot identity;
- one exact current Talent identity and name;
- the strict whole-studio assignment gate;
- exact company production ID/title agreement; and
- no ambiguity or stale projection.

The existing canonical Talent Profile opens above the same mounted Lot. Close restores the exact
opener and selected person. No Lot-specific profile, duplicate career copy, route, or new screen is
introduced.

## 10. Picture, phase, release, and replacement continuity

For two ordinary legal pictures A and B:

- A and B both keep all six inhabitants visible;
- selecting any A member selects A context only;
- selecting any B member selects B context only;
- production and people array reversal changes no identity or stable presentation home;
- same-title A and B remain distinct;
- phase repaint preserves the exact selected ID and picture through Development,
  Pre-production, Rehearsal, Shooting, Post, and Release Ready while the person remains assigned;
- unrelated A release/removal preserves exact selected B;
- selected B release/removal clears person and picture context to neutral; and
- removal never auto-selects A, a replacement person, or the first remaining operation.

Accepted whole-studio replacement clears all transient company/person emphasis through existing
App replacement law. Rejected save import and declined New Studio preserve the unchanged session.
No company selection is serialized or reconstructed from save.

## 11. Input and mounted-world law

Physical pointer selection and native semantic button selection must produce one exact owner. The
existing world-input suspension, modal boundary, visibility pause, renderer recreation, delayed
readiness, and compatibility-tail protections remain in force.

Opening or closing a company member's profile must not change:

- App screen kind or URL;
- canvas DOM identity, Phaser game, camera, or selected person;
- GameState, SaveFileV11 bytes, week, cash, ledger, RNG, productions, workflows, reservations,
  tasks, contracts, or people; or
- another picture's identity or presentation.

Renderer failure retains complete exact semantic picture/member switching and inspection. Reduced
motion changes no company identity or selector result.

## 12. Structural and visual Keep gate

Ordinary Engine play yields six company members per picture and at most twelve across two pictures.
Each additional named person currently costs one existing-atlas sprite, one normally hidden text
label, zero texture bytes, and no new simulated actor.

Expected structural references before measurement are:

- one ordinary picture: `42` display objects / `19` dynamic actors;
- two ordinary pictures: `54` display objects / `25` dynamic actors;
- decoded texture bytes: unchanged `11,096,896`; and
- no new authored texture, route, Place, Graphics layer, or renderer draw owner.

These are code-derived expectations, not accepted evidence. The implementation must measure exact
one- and two-picture fixtures, neutral fallback, selected company, selected member, route-active,
profile-open, and renderer-rejected paths.

KEEP requires:

- complete six/twelve-member physical and semantic cardinality;
- selection of every member;
- legible selected-person/company distinction without a permanent label wall;
- no misleading Writer/Craft ambient-role art;
- no person/production overlap that prevents physical selection at ordinary fit and maximum zoom;
- complete controls at 1920×1080, 1366×768, 1280×720, 1024×768, 960×540, and 480×270 at DSF2;
- effective 200%, forced-colors, grayscale, and reduced-motion checks;
- no horizontal page overflow, clipped exact action, or unreachable semantic member;
- unchanged existing performance thresholds of at least 50 average FPS and 30 FPS 1%-low in the
  governed sustained window; and
- unchanged full SaveFileV11 bytes for every presentation-only journey.

If twelve repeated generic presentation figures make the lot materially less professional,
unreadable, unselectable, or fail the retained performance gate, KILL or narrow the physical
expansion before closure. Do not relabel a failed presentation as complete company presence.

## 13. Explicit exclusions

V1 does not add or claim:

- a new production, greenlight, cast, assignment, reassignment, cancellation, or employment action;
- current employee status merely because a person remains assigned to an active picture;
- personal room, coordinates, destination, route, travel, ETA, speed, occupancy, reservation, or
  workplace;
- workload, hours, queue position, schedule, task count, productivity, completion date, blocker
  ownership, stress, fatigue, needs, relationships, autonomy, or character control;
- a company office, callboard building, stage, set, holding area, rehearsal room, Post room, or new
  physical production place;
- writer/craft depiction through cosmetic Grip, Stagehand, Electrician, Camera, Publicity,
  Security, or Extra roles;
- new art, Role Atlas rows, appearance variants, animation frames, walk cycles, badges, routes,
  pathfinding, ambient named staff, or simulated people;
- a second profile, roster, production board, clock, scheduler, facility ledger, or UI-owned result;
- hidden actual talent data, frozen greenlight OVR/Fit/EP, historical participant names, or
  fabricated career credits;
- any Core, GameState, SaveFileV1–V11, schema, migration, RNG, production, workflow, reservation,
  task, facility, construction, employment, economy, ledger, publicity, or release behavior; or
- macroeconomic certification, financing, loans, bailouts, restructuring, failure ladder, hard
  bankruptcy, or an arbitrary cash sink.

## 14. Automated acceptance

### Projection and pure selectors

Tests must prove:

1. exact six-role/cardinality/order projection for one legal managed picture;
2. exact twelve unique people across two legal concurrent pictures;
3. current Talent names and raw production slots own identity while `Talent.role` may differ;
4. no hidden/frozen participant assessment field enters the Lot projection;
5. same-title and same-week pictures remain distinct by ID;
6. production, operation, people, and company-member array reversal changes no result;
7. duplicate production ID, duplicate operation, >2 pictures, missing/extra craft, duplicate role,
   duplicate current Talent, within/cross-picture reused Talent, production+screenplay collision,
   stale Director/Lead operation identity/name, missing person, extra active person, stale title,
   and malformed presentation role fail the expanded projection closed;
8. absent optional company fields retain frozen Director/Lead and legacy compatibility;
9. managed empty remains honestly empty; and
10. projection and selectors never mutate GameState or snapshot input.

### Scene and React host

Tests must prove:

1. every exact company member receives one stable selectable sprite and semantic control;
2. generic `talent` art remains presentation-only while exact role language comes from company
   projection;
3. selecting each person renders exact role, picture, phase, facility, status, and countdown;
4. only the Director exposes Director task/call authority;
5. selecting A/B person or production switches exact inspector/company emphasis without removing
   the other company;
6. same-title, reversed arrays, and two Stage allocations never drift identity;
7. company and selected-person homes remain stable through phase repaint;
8. exact selected-person release clears neutral while unrelated release preserves the survivor;
9. profile opens exact ID over the same canvas and closes to the same opener for all six roles;
10. disappearance while profile-open closes once, cannot reopen on reappearance, and never
    transfers profile ownership;
11. person/place/production/Stage 7/Scenery/Gate/Publicity/Annex/event context ownership still
    clears only the intended prior context;
12. delayed/rejected renderer, recreation, hidden tab, modal input suspension, reduced motion,
    pointer/touch/keyboard/virtual-AT, and replacement tails fail exact or neutral; and
13. selection, switching, profile, pan, zoom, and repaint preserve exact SaveFileV11 bytes and all
    authoritative state.

## 15. Proportional final verification

Before closure run:

1. focused company projection/selector tests;
2. existing Named Person, Formation, Studio Lot, StudioLotView, Hollywood scene, Stage 7, Scenery,
   Annex, Gate, Publicity, next-event, and App/Lot regressions;
3. both TypeScript projects;
4. complete repository tests;
5. governed D-16/D-17 suites;
6. production build;
7. dedicated real-Chromium one/two-picture interaction, phase, release, profile, renderer-failure,
   input-tail, responsive, zoom, reduced-motion, and structural/performance proof;
8. screenshot review at ordinary fit, maximum world zoom, compact, and effective 200%;
9. deterministic SaveFileV11 before/after equality; and
10. protected-ref, diff, generated-art, manifest/exporter, Core/save, and cleanliness gates.

No threshold may be relaxed to manufacture a pass. Contended headless wall time must not be
relabelled GPU certification. Record exact measured structure and any explicit evidence skip.

## 16. Closure boundary

V1 can close only as a bounded active-company presence and exact picture-switching result. It is
not people simulation, a production scheduling system, a facility expansion, Stage 12 art, or a
complete macroeconomy repair.

The governing economic classification remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open.
