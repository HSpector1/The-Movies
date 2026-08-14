# World-First Operational Annex Work Presence V1 Evidence

Status: **IMPLEMENTED, VALIDATED, AND RETAINED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract authority: `e2fd6dfdedc0ac398cae24c2ccea9bcc524d38d1`

Implementation authority: `e14633b578834f5a2f625049762c45506e6b1ee2`

## Keep ruling

World-First Operational Annex Work Presence V1 passes its bounded Keep gate.

The accepted Development & Casting Annex is no longer only a construction trophy after it becomes
Operational. The ordinary player can see native Available or Working truth, select the physical
building in the living Lot, inspect exact 0/1 or 1/1 Calendar truth, identify the current owner,
title, and activity, optionally visit the exact existing deep owner, and return to fresh Annex
truth. The configured read model separately renders Production Held for robustness evidence.

The retained loop is:

```text
PHYSICAL DEVELOPMENT & CASTING ANNEX
→ SEE AVAILABLE / WORKING
→ SELECT THE BUILDING IN THE LIVING LOT
→ INSPECT EXACT SLOT / OWNER / TITLE / ACTIVITY
→ OPEN THE EXISTING DEEP OWNER IF NEEDED
→ RETURN TO FRESH ANNEX CONTEXT ON THE LOT
```

The Studio Lot remains the discovery and inspection surface. Writers Room, Casting Room, and the
Dashboard Production Board remain supporting management surfaces.

## Singular authority chain

The retained read/navigation chain is:

```text
studioCalendar(GameState)
→ field-exact StudioLotSnapshot Annex leaf
→ pure operationalAnnexWorkContext validation
→ physical or semantic Annex selection
→ latest App revalidation of exact owner identity
→ existing focused deep owner
→ typed direct return
→ fresh Calendar / snapshot / selector truth
```

`studioCalendar` remains the one facility and occupant authority. The adapter calls it once for the
snapshot, selects the exact canonical facility ID, and joins a production occupant only to its exact
unique outlook. React and Phaser do not derive allocation, capacity, owner identity, phase,
blockers, availability, or action legality.

The exact accepted facility remains:

```text
facility-development-casting-annex
Development & Casting Annex
development-casting
capacity 1
slot 0
```

The projection is null for Legacy, Vacant, Building, non-managed, non-Engine, malformed, absent,
duplicate, wrong-name, wrong-capability, wrong-capacity, wrong-slot, contradictory-count, or
out-of-lifecycle truth. Operational selection additionally requires the exact completed-week line
to be internally consistent with an integer current week. No first match or lookalike facility is
accepted.

## Available, Working, and Held truth

Available requires exact `capacity=1`, `occupied=0`, `available=1`, slot 0, and null occupant. The
world and inspector say **AVAILABLE**, **0 / 1**, and that no current screenplay, casting session,
or production occupies the Annex.

Working requires exact `capacity=1`, `occupied=1`, `available=0`, slot 0, plus one supported owner:

- screenplay: Drafting or Rewriting;
- casting session: Auditioning; or
- production: Development or Pre-production with exact `On schedule` outlook truth.

The world and inspector say **WORKING**, **1 / 1**, and expose owner kind, exact Calendar title,
and exact activity. Operational construction copy now says `Current Annex slot use: N of 1`; it
cannot simultaneously claim that a 1/1 slot is available.

Configured-capacity Held evidence remains deliberately separate. An Annex-reserved Pre-production
that cannot obtain a soundstage retains the Annex reservation and unchanged production countdown,
while the exact Calendar outlook becomes `Held for facility capacity` with `Rehearsal held for
Soundstage`. The world says **PRODUCTION HELD**. The production is held; the Annex itself is not
called blocked. This state is in-memory read-model robustness evidence, never a native SaveFileV11
or ordinary-player reachability claim.

Native public-action states prove script Drafting and production Development. Casting Auditioning is
proved in-memory through public actions. Production Pre-production Working and the subsequent Held
transition deliberately use the documented configured reservation/capacity seam after public-action
setup; neither is relabelled as a native fixture. Wrong owner/activity combinations, empty
identities, invalid status/blocker pairs, missing or duplicate production outlooks, and
contradictory Working or Held records fail closed.

## Physical world and location truth

The accepted `annex-parcel` / `expansion` identity remains the only physical building. Operational
paint reuses the existing `expansionGraphics` and `expansionLabel` objects to show:

```text
DEVELOPMENT & CASTING ANNEX · AVAILABLE
DEVELOPMENT & CASTING ANNEX · WORKING
DEVELOPMENT & CASTING ANNEX · PRODUCTION HELD
```

Malformed or absent work context falls back to neutral **OPERATIONAL** rather than inventing
availability. Physical polygon, physical label, and semantic companion enter the same exact React
context. Renderer rejection removes physical paint/selection but preserves the complete native
semantic inspection and handoff.

The adapter also corrects one presentation disagreement: a Development or Pre-production operation
whose exact current reservation names the Annex now has `locationBuildingId === 'expansion'`.
Every base Development/Casting and non-Annex phase mapping remains unchanged. This moves no work;
it makes the Lot point at the facility already named by Engine truth.

## Exact deep owners and fresh return

The Lot emits only owner kind and exact owner ID. Immediately before navigation, App rebuilds the
latest snapshot/context and requires the selected identity still to be exact:

- production → focused Dashboard Production Board card by exact production ID;
- screenplay → focused Writers Room project by exact project ID; and
- casting → the exact active session ID, then its exact project identity in Casting Room.

Title matching and occupant substitution are forbidden. A stale, completed, released, missing,
duplicate, or replaced occupant calls no navigation owner and retains the player in the Annex.

Direct Back carries one transient `annex-work` return intent. The remounted Lot rebuilds current
truth, restores the Annex context, and focuses the stable **Current work** heading after it exists.
It may therefore return to Available, the same owner, a replacement owner, or configured Held; it
never replays the old record. Related Writers/Casting child work may retain the intent only for the
same exact project. Unrelated Dashboard or project navigation demotes it to ordinary selected-
building return. A new or loaded studio cannot inherit it.

Pointer/key-down identity latching prevents the remainder of one gesture from activating a newly
repainted occupant. Double-click, repeated Enter/Space, held keys, stale replacement, rejected host
callbacks, modal suspension, delayed renderer readiness, hidden-tab resume, context loss, and scene
recreation are exact-once or fail closed.

## Deterministic native evidence

The dedicated generator uses public Engine/UI actions only, exports native SaveFileV11, imports it
with `converted === false`, requires byte-identical re-export, and is timestamp-free. A clean rerun
reported every output unchanged:

| Fixture | Exact claim | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `week-13-operational-annex-available.save.json` | Week 13, Operational, 0/1 Available | 220,259 | `4026c51603afe35605a9d5a71391764cd6dfea3972ef3a8d20ef3b3987dc4652` |
| `week-13-operational-annex-script-working.save.json` | `script-0002`, *The Silent Widow*, Drafting, 1/1 Working | 221,866 | `cb49f61ac81d239b14db744fdc7b37b91ccd507e8f0e4a8fda56e802bd96bdc4` |
| `week-14-operational-annex-production-development-working.save.json` | `prod-0014-1`, *Empire of Stranger*, Development, On schedule, 1/1 Working | 230,918 | `d7213ae7c064ad59ac685a777042b0b237d9ce1c367a9af3b9d754cb25b8044e` |
| `manifest.json` | derivation, native import, exact claims and pins | 12,995 | `43c40208b58f365c726eb1ddba88359e8ba9be3890b400ab92db9b2c47dba8cf` |

The generator did not change the governed scenery/live-week fixtures. Configured Held is omitted
from the output by design and is labelled in-memory evidence in its tests.

## Accessibility, layout, and visual result

Available/Working/Production held and 0/1 or 1/1 are visible text, not color-only state. Occupied
facts use a semantic definition list. The exact deep-owner action is a native button with a 44 CSS
pixel minimum target and an accessible name containing destination and title. Focus enters the
Annex context on selection and returns to Current work after direct deep Back.

Reduced motion, keyboard operation, renderer failure, 960×540, maximum in-world camera zoom, and
200% page zoom retain the action. Forced-color behavior is covered by bounded CSS/static review,
not relabelled as a dedicated Chromium emulation journey. A real 200% pointer trial found and
corrected a stacking defect where production/person rails could intercept the Annex action; the
exact context panels now remain above those rails while the higher-priority event notice remains
above both.

Nine ignored browser screenshots were reviewed under
`out/world-first-operational-annex-work-presence-v1/`. Independent visual/accessibility review
reported no unresolved P1–P3 findings.

## Performance and asset evidence

The Annex paint adds **zero** textures, atlas frames, display objects, actors, routes, simulations,
or renderer draws. It reuses the existing Graphics and label. The always-on 240-sample structural
checks prove:

- native script Working scene: 30 display objects, 13 actors, 11,096,896 decoded texture bytes,
  one draw; and
- native production Working scene: 38 display objects and 17 actors because ordinary Annex
  allocation requires two active productions; and
- governed one-production reference: exact frozen 34 display objects, 15 actors, 11,096,896
  decoded texture bytes, one draw.

The contract's `34 / 15` wording is the repository's frozen one-production reference tuple, not an
honest universal population maximum: the native production fixture needs two active productions to
reach ordinary Annex allocation and therefore naturally has a larger pre-existing actor/object
population. No Annex paint delta is hidden by that distinction and no structural threshold was
relaxed.

Default headless Chromium remained compositor-contended. The final script screenshot measured
44 average FPS, 30 FPS 1%-low, 33.6 ms p99, and 41.7 ms worst; the governed reference screenshot
measured 45 / 24 / 40.9 / 42.3. These default-host readings do **not** clear all frozen absolute
wall-clock gates and are not relabelled as a pass. No new opt-in accelerated absolute result is
claimed. The previously accepted accelerated reference remains historical evidence; this milestone
proves unchanged structural cost and leaves the existing absolute gate unchanged.

No core, district manifest, exporter, or art path changed. Frozen identities remain:

| Artifact | SHA-256 |
| --- | --- |
| authored source manifest | `5af27d7a97739724990ec08ef1fe5888eeb069bccc8e81b351271c2268914889` |
| accepted runtime manifest | `23bf9451b3a62099ed724b0f3a4082839b8246862ac5e61f3b72233dc5430d92` |
| concept plate | `a6279762ab7db8b5a16ea71627e63ae918b74c2db8e0874731c34c09947e7c34` |
| exporter | `405cb831d7d0cf4daaefe2259b0b27160157cbd65cb86c056814059c37b488fe` |
| district base | `a920e651d9b48b81dbcd6b2923f3c558326692705ea7b6a8fcb854055d009978` |
| truck occluder | `c559cce2a06bb35da5aeda6fd237ed2a2abfdcc1f85954b898fe84cd6da6c4a1` |
| camera dolly | `c190166b8e8b7efa5c4c37e30f59b0c6684aff15deaabb774b9e55e3f22c2dc5` |
| gate foreground | `c91b9b831efd9a58ad6047013f300228663dc5ddd410d94188436327c054179a` |

## Proportional focus repair

Final browser verification exposed one real adjacent defect: opening the canonical Talent Profile
made the live Lot inert before the drawer's passive effect captured its opener, so Escape restored
focus to `BODY`. App now captures the originating control synchronously before inertness and
restores it only after the world is interactive, with epoch, current-ID, connectivity, and inert-
ancestry guards. Accepted studio replacement deliberately suppresses stale restoration.

This is a bounded accessibility/continuity repair. It changes no profile data or Engine behavior.
The isolated named-person Chromium contract now passes 3/3, including Escape and Close-button
return to the exact world controls. Independent race review found no unresolved P1–P3 issue.

## Final verification

- both TypeScript projects: **passed**;
- focused Annex authority/Scene/React set: **203/203 tests passed**;
- complete repository suite: **170/170 files, 2,242/2,242 tests passed**;
- governed D-16/D-17 harness: **10/10 files, 176/176 tests passed**;
- final combined Chromium: **30/30 passed** — complete Lot 20/20, named person 3/3, Annex 7/7;
- deterministic native SaveFileV11 generator/replay: **byte-identical**;
- production build: **passed, 137 modules transformed**;
- `git diff --check`: **passed**;
- exact fixture, manifest, exporter, and art hashes: **passed**;
- protected refs: **unchanged**; and
- independent strict authority, focus-race, and visual/accessibility review: **no unresolved P1–P3 findings**.

The existing large-chunk build advisory remains visible. No new full economy or facilities corpus
is proportional to this read/presentation/navigation slice.

## Governing boundary

This milestone does not create a queue, worker, assignment, reroute, relocation, prioritization,
future reservation, ETA, workload, stress, needs, relationship, maintenance cost, second Annex,
construction catalogue, Soundstage 12, new task/clock, or new allocation rule. It changes no Core,
GameState, SaveFileV11, schema, migration, action, economy tuning, facility tuning, construction
tuning, RNG, ledger, manifest, exporter, or art authority.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open. No financing, loan, bailout, restructuring, failure ladder,
arbitrary cash sink, or macroeconomic certification follows.
