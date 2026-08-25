# Living Lot & Production Presentation — Campaign Ledger

Owner-directed Unity-first campaign (2026-08-23) following Golden M6 and
canonical `main`. Question under test: *does this finally feel like a living
movie studio rather than a technically impressive diorama?* Effort split:
65–75% Unity/player-facing quality, 15–20% resilience (Phase M), 5–10%
TypeScript/bridge only where authoritative presentation requires it, Three.js
regression/reference only.

Branches: `campaign/living-lot-ts` (TypeScript, from canonical `main`
`c902a704...`) and `campaign/living-lot-client` (Unity, from M6
`c7a19dcd...`). Golden M6 is the recovery authority; every checkpoint is
non-Golden by default. Human visual judgment is a hard gate; reject slices
that make the real game worse.

Baseline hostile review (Week-22 mid-game overview, M6 build): (1) the lot is
dead — zero visible people despite 7 employed staff and a hit in theaters;
(2) vast empty ground planes; (3) prop sparsity; (4) flat building faces;
(5) static forever-parked vehicles; (6) uniform flat daylight; (7) the
proof-style panel dominates a third of the screen.

## 2026-08-23 — LL-CP1 sealed: contracted staff attend the lot

**Player-visible change:** between engagements, the studio's contracted
company now reports to the lot instead of vanishing — actors, the director,
and the writer at Development & Casting, craft at the Scenery Shop — walking,
working, selectable, and honestly described ("On the lot at Development &
Casting this week — between engagements"). The Week-22 studio no longer looks
abandoned; staff visibly inhabit and cross the lot.

**Engine (attendance canon, presentation-canon layer):**
`studioPresence` roster tier now sends every contracted, unclaimed member to
a profession home facility (`ROSTER_HOME_FACILITY`: writer/director/actor →
`facility-development-casting`, craft → `facility-scenery-shop`) with the
standard staggered work-week beats; the site must exist in
`state.operations.facilities` or the person stays home (fail-neutral).
Deterministic, outcome-neutral, zero simulation RNG — the same canon class as
the departure stagger. Adapter joins the facility's own name for slot-less
roster sites (no occupant strings invented); the person panel states
attendance honestly and degrades without a proven name.

**Unity (stage-safe body seating):** three presentation rules keep the sealed
stage composition immune to attendance — (1) roster-held bodies are ephemeral
and released every apply, so the claimed company always takes preferred
bodies first; (2) a claimed person whose zone changed is re-seated onto an
exact-zone authored body when one is free (upgrade-only, no churn); (3)
roster attendees may never occupy a stage-authored body — when only stage
bodies remain free the attendee is not presented (fail-neutral). The
campaign's fail-closed stage gate caught both underlying defects (a claimed
company wandering role marks on a mismatched body; an attendee parked inside
a hot set) before any player saw them — two intermediate failed stage runs
are retained as local diagnostics (`LLCP1-Stage-20260823T135724Z`,
`...T140347Z`, `LLCP1-StageDbg*`).

**Validation:** TypeScript full suite 337 files / 4,545 passed / 5 skipped
(canon tests added; stale pins updated to the new canon in
`_presenceFixtures`, presence projection/scenario, presence lines, the
Three.js lot presence tests, and the M-B inspector order); both typechecks;
contract drift verified (no schema change); Unity EditMode 271/271; macOS
rebuild + codesign valid; `git diff --check` clean both repos.

**Native evidence (all on the final pair):**
- Stage visual proofs complete 5/5 both aspects:
  `Evidence/R/LLCP1-Stage-Final2-20260823T141715Z/Landscape/stage-visual-proof-landscape.json`
  (SHA-256 `e17f9990396b5d53f806...`) and
  `.../Portrait/stage-visual-proof-portrait.json` (`62c1d68e8d6ad7596efb...`).
- Bridge auto proof complete, exact Movie #2, revision 50, 119.6 FPS:
  `Evidence/R/LLCP1-Bridge-Final-20260823T141953Z/Main/bridge-client-proof.json`
  (`5ec77d591da1528010d4...`).
- Week-22 native overview: attending staff visible at and between facilities;
  shooting-frame composition indistinguishable from the accepted M6 record.

**Ruling: KEEP.** Foundation for lot life is real staff, truthfully placed.
Known boundary: at overview zoom, seven attendees still read sparse — density
(decorative presentation-only extras, street life, arrival/departure flows)
is the next bounded work, guided by the CP22 25/50/100 headroom evidence.

**Next:** LL-CP2 — visible lot density in normal gameplay: classified
presentation-only background extras (non-interactable, non-persistent,
gameplay-inert, never implying staff counts), busy-where-busy/calm-where-calm
placement, and vehicle motion; then character motion quality (locomotion,
idle variation, work loops); then environment passes per the baseline review.

## 2026-08-23 — LL-CP2 sealed: decorative lot life in normal gameplay

**Player-visible change:** the lot now carries classified background life on
top of the attending staff — arrivals clustered inside the studio gate,
crossers walking the public zones between gate, administration, and casting,
and theater-goers once a picture is playing. Week-22 population rises from 7
attending staff to ~15 visible people, busy where the studio is busy and
empty before the studio exists.

**Implementation:** `StudioLotLifePresentation` (Unity commit `7171151...`),
installed by the bootstrap beside the presentation. A pure census
(`StudioLotLifeContracts.Census`) derives extra counts deterministically from
coarse authoritative signals (stages exist / production operations active /
released film count): 2 gate + 3 street (+1 during production) + 3 theater,
hard-capped at 12, zero pre-founding. Extras are cloned from role-free
authored bodies with all selection/slot/marker/role components stripped:
non-interactable, non-persistent, gameplay-inert, invisible to every people
census and evidence gate, and never given a stage-zone wander point. Five
EditMode contract tests cover the census math, cap, decorative-only source
rules, and single bootstrap install.

**Validation:** Unity EditMode 276/276; macOS rebuild + codesign valid;
TypeScript untouched. Native gates all complete on the final build: stage
visual proofs 5/5 both aspects
(`Evidence/R/LLCP2-Stage-20260823T143044Z`, landscape `99d5b1c11835544e2a36...`,
portrait `1ff3196da329c9d3901a...`); bridge auto proof exact Movie #2 at
119.2 FPS (`Evidence/R/LLCP2-Bridge-20260823T143304Z`,
`774a29a858c08a743e0e...`); 25/50/100 scalability complete with baseline
UNCHANGED at 4 and p95 8.75/8.64/11.01 ms
(`Evidence/R/LLCP2-Scalability-20260823T143304Z`, `01a3ae62272157a6140a...`)
— proving the pre-founding-zero census leaves raw-founding proofs
byte-equivalent in behavior.

**Ruling: KEEP.** The gate cluster and street crossers read naturally at
management zoom; no proof weakened; no false staff implication (extras are
unclickable and unnamed).

**Next:** LL-CP3 candidates in priority order — character motion quality
(locomotion polish, idle variation, work loops, de-mannequin pass), then
vehicle motion, then the environment passes (ground planes, prop density,
building faces, lighting) from the baseline review. Phase M resilience should
begin interleaved (fast-recovery outage observability is already queued).

## 2026-08-23 — Phase M entry 1: ugly-condition matrix opened and passing

`npm run phasem:matrix` (`scripts/phase-m-matrix.mjs`) is the campaign's
fail-closed resilience matrix, run against the emitted production engine.
First three real-world cases, all passing on the LL-CP2 pair:

- **Repeated launch/quit cycles** — five full engine lifecycles against one
  durable profile: session identity and authoritative digest byte-stable,
  revision zero preserved, every exit clean.
- **Corrupted/oversized checkpoint rejection** — truncated, garbled, and
  39 MB oversized `bridge-runtime-v1.json` variants all refused fail-closed:
  the engine never serves from a damaged checkpoint and never exits zero.
- **Rapid valid/stale input burst** — valid and stale commands raced
  concurrently pair-by-pair: 19 accepted, 19 rejected with exactly
  `STALE_REVISION`, zero other outcomes, final revision exactly equals
  accepted commands.

Matrix law: extend with new cases, never weaken one. Queued next cases:
fast-recovery outage observability (the emitted engine restarts inside the
client's 1 s poll window, discovered at the M6 ruling; the accepted proof
uses a double SIGKILL), outage around save/load boundaries natively
(kill-after-commit already covered at the TypeScript layer by the post-commit
gate and in-flight evidence verifier), longer-session reconnect, large valid
saves, and boundary window/aspect sizes.

## 2026-08-23 — LL-CP3 sealed: character motion / de-mannequin pass

**Player-visible change:** people finally read as people. The modern
hoodie-and-shorts body is gone from the 1948 lot (era-safe Farmer/Formal
substitution); travellers no longer perform their trade in the middle of a
street (a real RestIdle state exists at last — the Working parameter had
never been wired to anything); the lead actor and camera assistant no longer
freeze into statues after one playthrough (every work/walk/rest clip must now
loop — ratchet); formal trades stroll with a formal walk; walk cadence
matches translation speed (no more foot-skating at 2.45 m/s against a 1.0x
clip); extras stroll at varied 1.6–2.1 m/s; and a seeded per-body phase/tempo
offset finally desynchronizes bodies that had ticked in perfect unison since
scene load (the authored animator-speed variety was never persisted into the
scene — a latent bug found by the Opus archaeology sweep).

**Unity commits:** `3509c81` (offscreen motion-evidence recorder — timed
frame bursts, whole-lot + close-follow cameras, subject-selectable, fully
passive; the campaign's standard motion A/B tool) and `099cb37` (the
de-mannequin pass; scene + all 24 controllers regenerated; validation and
role tests updated; loop requirement strengthened with the non-loop
exemptions deleted).

**Honest failure record:** the first candidate desynchronized bodies with
Animator.Play using a state hash that is uninitialized on freshly cloned
bodies — the followed extra glided down the street with frozen legs. The
independent fresh-context Opus reviewer REJECTED that candidate on
frame-strip evidence (its verdict crops are preserved in the session
scratchpad); the desync now advances the state machine via a seeded
Animator.Update offset. A first landscape stage run also failed when the
stage carry roles briefly swapped to a lantern-hold silhouette — the sealed
composition gates caught it; the two stage carry roles keep the rail-lean
clip and only off-stage carriers gained the variety.

**Validation:** scene validation 0 errors; Unity EditMode 276/276; macOS
build + codesign valid; stage visual proofs complete 5/5 BOTH aspects;
bridge auto proof complete, exact Movie #2, revision 50, 120.0 FPS; motion
seal burst complete and passive (revision 50 unchanged).

**Evidence (SHA-256 prefixes):** stage landscape `d8247fe55f165f4bde7b...`
and portrait `f5afe467d64cfec9016a...`
(`Evidence/R/LLCP3-Stage-Seal-20260823T161757Z`); bridge
`368f5fb3b3dcd0524c1e...` (`LLCP3-Bridge-Seal-20260823T161757Z`); motion
seal report `f92ffe0049f287325d1f...` (`LLCP3-MotionSeal-20260823T161757Z`);
motion baseline report `2bf9125d61ff33923c78...`
(`LLCP3-MotionBaseline-20260823T153130Z`).

**Independent visual ruling (fresh-context Opus, hostile):** ACCEPT — the
followed character's leg phase measurably cycles (spread 23→113→25 px) with
zero frames of translation-with-static-legs; era wardrobe passes; no
T-poses/gliders; stage reads as a real 1948 soundstage; no new regressions
vs the accepted baseline.

**Ruling: KEEP.**

**Logged non-blocking follow-ups:** (1) walkers hold a mid-stride pose during
the pre-path settle window instead of a standing idle (pre-existing; visible
for ~2s after spawn); (2) the camera operator model's hair mesh clips
through his cap brim (asset artifact); (3) teal/magenta hair on some
Quaternius models is an era-adjacent art-direction item for a future
environment/art checkpoint.

**Next candidates (hostile-review ranked):** normal-game lot life details
(vehicle motion, arrival/departure flows), then environment depth (ground
planes, contact shadows, prop density, building faces) per the baseline
review; Phase M continues interleaved.

## 2026-08-23 — LL-CP4 sealed: environment depth — street furniture, ground interest, aerial perspective

**Player-visible change:** the lot stops reading as a prototype floating in
green soup. Street lamp standards (a lamp-iron recipe, not black metal) give
every road vertical rhythm where the lot previously had zero outdoor light
standards; benches and terracotta planters spread beyond the two facades
that held the lot's only two benches; painted parallel-parking stalls sit on
Melrose asphalt at the curb; the construction district is bounded by a solid
cream site hoarding (replacing a rail-on-legs barricade line that dissolved
into disconnected sticks at management distance); palms use four Kenney
models instead of two and now flank the entry axis; and the horizon runs a
true three-band aerial perspective — near ridge olive-slate, far ridge blue,
palest valley haze closing the east — replacing a uniform green-grey murk
(hostile-measured: green horizon pixels 78.6% → ~10–26% depending on fog
band; baseline's gradient was actually *inverted*, far band greener than
near).

**Unity commits:** `20470cb` (evidence hardening: follow-camera physics/
furniture guards, 10-azimuth × 3-distance retry, per-frame colour-richness
floor recorded in the report — schemaVersion 2) and `d61bd0c` (the
environment pass; scene, navmesh and materials regenerated).

**Honest failure record — this checkpoint took five candidates:**
- v2 REJECTED (independent Opus, hostile): six blocking defects — an unlit
  near-black lamp mast covering 55% of the followed character, parking bays
  painted on grass/misaligned with cars and shedding broken dash decals, a
  partial mountain recolor with a hard green/grey seam and inverted
  gradient, lamp heads reading detached at pixel level, fencing reading as
  disconnected sticks, and an overall darkening contradicting the claimed
  exposure change.
- v3 fixed four of six; REJECTED because the "stick fence" survived (it was
  the *pre-existing* safety-barricade line, misattributed by the author to
  the new Kenney fence — the reviewer proved 100% of baseline rail pixels
  were retained) and a stage-interior ambient drift (~0.16 luma, ~225× the
  measured noise floor) violated the sealed stage.
- v4 fixed the fence (barricades deleted, hoarding widened to sole
  boundary) but the drift persisted at 97% magnitude; the reviewer
  *disproved the claimed mechanism* (skybox exposure — the rendered sky had
  changed ≤1/255) and localized the true cause by drift signature
  (depth-uniform ⇒ fog, not ambient).
- v5 restored fog byte-identically to the sealed baseline; the drift
  collapsed to the noise floor (signed per-channel means ±0.005, verified
  independently) proving fog was the cause by direct experiment, and the
  horizon stayed categorically better under the restored fog. REJECTED on
  one new defect: evidence frame follow-008 was captured from inside a
  building wall (73 unique colours).
- v7 hardened the evidence camera (guards + richness floor + closer
  distances for wall-hugging subjects); a fresh independent reviewer
  recomputed everything and ruled **ACCEPT**: follow-008 now 14,998 unique
  colours, no degenerate frames, all prior fixes hold, stage seal signed
  drift ≈ 1e-6 per channel (the rejected v4 drift was ~53,000× larger).

**Validation (final build):** scene validation 0 errors; Unity EditMode
276/276; macOS build + codesign valid; stage visual proofs complete BOTH
aspects; bridge auto proof complete, exact Movie #2, revision 50, ~120 FPS;
motion evidence complete and passive (revision 50 unchanged), followRichness
1494–2196 across all 24 frames.

**Evidence (SHA-256 prefixes, stamp 20260823T181812Z):** stage landscape
`4279d73334456027...`, stage portrait `f583c69a4e2b6655...`, bridge
`46c8a6bbfbb60ade...`, motion report `efe1407b3fbd138d...`. Intermediate
candidate evidence is retained on disk for audit (`LLCP4-*-20260823T175049Z`
= v5, `LLCP4-*-20260823T181456Z` = v6 fixed-distance intermediate).

**Process lessons recorded:** (1) superseded candidate evidence is never
deleted again — the v3 evidence roots were cleaned up mid-review and the
reviewer rightly flagged that a claimed delta must stay auditable by a third
party; (2) "this change is inert" is a measurement, not an assumption — the
fog-is-negligible-indoors claim was wrong at the 0.1-luma scale and cost a
candidate; (3) the reviewer's drift-signature analysis (brightness-weighted
= ambient, depth-uniform = fog) is the diagnostic to reuse for any future
sealed-scene regression.

**Ruling: KEEP.**

**Logged non-blocking follow-ups:** follow-cam subject stacking in frames
010–015 (characters occlude each other — pathing phase, not scenery); east
horizon at the frame edge reverts toward baseline green under restored fog
(improvement is concentrated on the west ridges and upper haze band); the
follow segment beyond frame 8 is not deterministic across builds, which
weakens frame-indexed A/B review — consider a seeded evidence route.

**Next candidates (hostile-review ranked):** lot life flows (vehicle
motion, arrival/departure), then filmmaking activity visibility, per the
campaign priority list; Phase M continues interleaved (Case D — SIGKILL
around save/load boundaries — landed this stretch, `94ef84e`).

## 2026-08-23 — LL-CP5 sealed: the moving vehicle tells the truth

**Player-visible change:** the service truck stops lying. It used to loop a
fixed route forever — before the studio existed, regardless of game state —
and its route drove through the Stage A east wall, pausing 3.5 s inside the
soundstage. Now its motion derives from the same sealed Stage 7 production
truth the stage itself presents: a scenery load-in with a travel beat sends
it driving the service loop, a working beat holds it at the Stage A service
mark, and everything else — withheld, pre-founding, no live authority —
parks it at the gate depot. Its selectable status carries the authoritative
"<production> · scenery load-in" label and degrades to a neutral line. The
new loop stays on authored roads (gate → boulevard → crossroad → service
hold → back), never enters the stage shell, and is invisible to every
sealed proof camera. The cab leads travel — the truck had driven its whole
route in reverse since the model was first imported, caught only when this
checkpoint's evidence followed it closely.

**Unity commits:** `a994d0a` (authority-driven vehicle: 3-mode
StudioVehicleRoute, StudioLotDeliveryContracts pure mapping off the stage
truth, ApplyDeliveryVehicle wiring, on-road route, validation ratchet —
route anchors on-road + outside-shell, single route, serialized Parked
default; 13-case reflection test suite), `6de1b66` (vehicle-follow motion
evidence: -studioMotionEvidenceVehicle, per-frame position + authoritative
mode in the report, vehicle-scaled camera ladder), `4246009` (cab-leads
facing fix + validator facing assertion).

**Design decision:** the vehicle is authoritative presentation, not
decoration, so it keeps its SelectableEntity (same class as the Stage A
bodies) — which also keeps its collider on the selection layer, invisible
to the person line-of-sight gate, the deoccluder, and the evidence camera
guard. LL-CP2's decorative rules (unnamed, non-selectable) do not apply.

**Evidence (SHA-256 prefixes, stamp 20260823T194141Z):** stage landscape
`d55088830d7d418d...`, portrait `33551266f16665b9...`, bridge
`bedb3588a07cd9df...`, motion-delivery `92afa32803b284d1...`,
motion-parked `3864c2e3c1c23f68...`. The delivery burst runs on a
purpose-built week-6 profile (first-movie journey driven via the journey's
own next-step guide to the scenery load-in week, then stopped — the
blocker deliberately left unresolved); the parked burst runs on the
canonical week-22 profile with no load-in.

**Validation (final build):** scene validation 0 errors (now including the
route/facing ratchet); EditMode 292/292; stage visual proofs complete both
aspects, stage seal drift at the noise floor (independent measurement:
signed means ≤ +0.0005/channel); bridge auto proof complete, exact Movie
#2, 120.0 FPS; delivery telemetry: mode Holding 170/170 frames, 120.8 m
path ending at the service hold (72,33), zero points or interpolated
segments inside the stage shell, zero off-road excursion, 23.9 s travel +
29.2 s hold, all frames ≥ 1053 richness, passive at revision 20; parked
telemetry: mode Parked 24/24, 0.0 m path, pinned at (2,−52), passive at
revision 50.

**Independent ruling (fresh-context Opus, hostile): ACCEPT** — all three
claims verified with margins ("not one corner cut"); clipping/floating
checks clean (1.49 m worst clearance to parked vehicles); "parked-at-depot
is the right honest default… the old behavior was decoration impersonating
information." The reviewer's one required fix (reverse driving) and its
ratchet assertion landed in `4246009` and the seal evidence was recaptured
after it.

**Ruling: KEEP.**

**Logged non-blocking follow-ups (reviewer):** (1) the route ratchet
checks anchors, not legs — today all 8 legs verify analytically with
1.41 m worst headroom, but leg coverage would make it structural; (2)
`ServiceRouteSurfaces` is a hand-mirrored copy of the road rects and can
drift; (3) "Parked" is a destination, not a state — flipping modes
mid-route finishes the ring first (honest, but transiently moving while
Parked); (4) at the hold the truck is fully occluded from the whole-lot
camera, so a working beat contributes no aliveness to the primary surface
— consider a hold mark visible from capture A in a future pass; (5) the
depot pose reads as "stopped in the gateway."

**Next candidates:** filmmaking activity visibility (per the priority
list), or the environment follow-ups (east horizon, settle-freeze pose);
Phase M continues interleaved (Case E — journal-bound rollover under
save-heavy load — landed this stretch, `c2f7249`).

## 2026-08-23 — LL-CP6 in progress: "Shooting Today" exterior production tell — NOT SEALED

**Status: implemented and pushed as WIP (`b5908c9` on
campaign/living-lot-client), compiling, scene validation 0 errors, EditMode
292/292 — but UNSEALED: no runtime evidence, no two-world measurement, no
independent review. Run stopped here for an Owner machine restart.**

**Why this checkpoint:** hostile review measured that a shooting week and an
idle week differ by 0.126% of whole-lot pixels — the game's premise is
invisible from the primary surface. Correction discovered during scoping:
`StageActivityEffects` already drives a truthful pulsing beacon, rotating
lens, SHOOTING sign and practicals off the sealed stage truth — but at the
management camera the whole tell is ~3 px. The reviewer's baseline compared
a LOAD-IN week to an idle week (beacon correctly dark in both), so the
"beacon is static" finding was wrong; the "tell is illegible" finding stands.

**Implemented (all presentation-only, driven by the sealed Stage 7 truth):**
beacon halo + two elephant-door hot lamps appended to shootingIndicators
(validation pin extended 2 → 5 exact); collider-free apron dressing (cable
runs, cases, crew cart — names avoid the equipment auto-marker tokens) in
the STATE_Shooting group; StudioStageDoorCrewPresentation — 3 decorative
door-crew bodies spawned only while Shooting, LL-CP2 identity-stripping
rules, marks south of the stage camera's back; StudioPublicStreetTraffic —
2 decorative sedans looping Melrose outside the wall (own group
17_Public_Street_Traffic, colliders stripped, honest ambience implying no
studio state).

**To seal (next session):** rebuild app; sweep = stage proofs both aspects +
bridge proof + shooting-week burst (profile builder:
scratchpad/llcp6-make-shooting-profile.mjs — drives the journey to
phase=="shooting", blocker-free; note snapshot fields nest under
`response.snapshot.*`) + idle-week burst (canon week-22 profile) + LL-CP5
regression (delivery/parked bursts must still behave); measure the
reviewer's acceptance criteria — two-world whole-lot pixel delta ≥ 3% with
≥ 60% outside the doorway rectangle, stranger test, no frozen adjacent
frames, stage seal luma separations unchanged, crew non-selectable, FPS ≥
60; then a fresh-context Opus ruling. Deferred from CP6 scope: unload pair
at the truck's hold, label depth-testing, teal-cube/truck remodels,
sky/lighting overhaul, settle-freeze pose.

**Recovery if anything is wrong:** the branch tip before CP6 work is
`18bb54f` (leg ratchet, sealed state); LL-CP5 seal evidence at stamps
20260823T194141Z. Golden M6 remains the recovery floor.

## 2026-08-23 — LL-CP6 sealed: "Shooting Today" — the whole lot answers the question

**Player-visible change:** a shooting week finally transforms the lot at
management zoom instead of hiding behind a ~3 px beacon. While the sealed
Stage 7 truth says Shooting: the stage front comes alive (beacon halo, door
hot lamps, apron dressing, 3 door crew — the WIP wave, `b5908c9`) and the
whole visible world responds: a support convoy parks on the authored roads
with generator, honeywagon and water wagon on the east service road; craft
services and reflector boards stage on the apron; every painted Melrose
stall fills; spectator and visitor vehicles line both public curbs at real
parallel-parking spacing; a held queue stacks inside Gate Boulevard; a taxi
waits opposite the gate; and 6 decorative crew plus 14 onlookers work the
apron and gather at the gate. Idle weeks return to the sleepy street. Two
blinded stranger tests (different reviewers, different frame pairs, answer
keys withheld) both identified the shooting world instantly.

**Why a fix wave was required:** the recorded acceptance floor is a ≥3%
shooting-vs-idle whole-lot pixel difference with ≥60% outside the doorway
rectangle. The WIP doorway tell measured 0.187% (same-world cross-launch
noise floor ≈0.095% at the same threshold) with 75% of the difference
inside the doorway rectangle — the premise was still invisible, the exact
defect this checkpoint existed to fix. Measurement also showed the
whole-lot camera cannot see the crossroad basecamp behind the mid-lot
buildings, so the management-zoom tell had to live in visible space: the
public street. The measured convergence across the iteration series —
0.19% → 0.59% → 1.57% → 2.67% → 2.91% → 2.97% → 3.03% → 3.08% — is
retained on disk (stamps 204519Z/211216Z/211851Z/213117Z/220108Z) with the
metric provably frozen across all runs (verified independently: identical
threshold, doorway box, projection and denominator throughout; only the
world changed).

**Honesty line:** every object is presentation-only and driven exclusively
by the sealed Stage 7 Shooting truth (STATE_Shooting group activation or
`CurrentState == Shooting`). The convoy/craft/reflectors present the real
company's transport and services during its real stage shoot; the street
response presents the public world's honest reaction to a real shoot.
Nothing implies a second unit, staff counts, or gate state the authority
does not hold; internal names asserting unmodeled facts (press/newsreel)
were renamed on review.

**Decorative law, ratcheted:** basecamp objects are stripped of colliders,
lights, markers, selectables and selection rings (`MakeDecorative`, now
including `StudioSceneMarker` so the census guarantee is intrinsic); people
clones follow the LL-CP2 identity-stripping rules. A new fail-closed
validation rule (`ValidateShootingDayBasecamp`) pins the basecamp inside
STATE_Shooting, forbids any collider/light/marker/selectable within it, and
pins the people-loop marks (8 crew / 14 onlooker). Census isolation was
independently verified as structural, not incidental: people 32, vehicles
10, equipment 16 — identical to LL-CP5 at both reviewed commits.

**Unity commits:** `b5908c9` (WIP doorway tell: shootingIndicators pin 2→5,
apron dressing, door crew, always-on public street traffic), `01ad293`
(shooting-day basecamp + street response + StudioShootingDayLotPresentation
+ ratchet + 4 EditMode contract tests + committed measurement tool
`Tools/llcp6-two-world-measurement.py`), `56b0b05` (reviewer's blocking
defect cleared + O-3/O-5 hardenings). **TS commit:** `264dc3b`
(`scripts/living-lot-profile.mjs` — the profile builder, recreated as
committed tooling after the machine restart wiped the session scratchpad
that held `llcp6-make-shooting-profile.mjs`).

**Honest failure record:** the first independent hostile review (fresh
context) REJECTED the first candidate on one blocking defect — the late-
added Gate Taxi at x −10 interpenetrated the north-curb car at x −12.5 by
2.60 m at the studio gate, in every shooting frame, violating the
placement invariant written three lines above it. The same review verified
everything else, several claims beyond the stated level (bit-for-bit
measurement reproduction; a same-week control isolating the tell at 2.99%
against a 0.137% week confound; milestone-PNG diffs proving the sealed
stage compositions differ only by animated bodies). The fix (`56b0b05`)
moved the taxi to the south curb opposite the gate and re-spaced the
north-curb car; a second fresh-context hostile verifier reproduced D-1 at
the old commit, proved zero interpenetrating pairs among all 80 vehicle
bodies at the new one, and structurally diffed all 2,585 scene objects to
confirm exactly the fix and nothing else changed.

**Validation (final build):** scene validation 0 errors; EditMode 296/296
(4 new contract tests; the WIP wave had shipped none); macOS rebuild +
ad-hoc codesign valid; stage visual proofs complete 5/5 BOTH aspects with
seal luma preserved (worst drift 4.83e-5, 10× inside the 5e-4 budget);
bridge auto proof complete, exact Movie #2, revision 50, week 22,
119.8 FPS.

**Two-world measurement (72 aligned frame pairs, threshold maxΔ>10/255,
960×600 whole-lot surface, committed tool):** delta 3.082% mean / 3.060%
minimum pair (floor 3%); 94.6% of differing pixels outside the doorway
rectangle (floor 60%; rectangle = projected stage-front tell volume
x[35,59] y[0,23] z[16,20] through the authored whole-lot camera); zero
frozen adjacent frames on all four surfaces; threshold sensitivity
recorded (4/10/20). Independent controls: same-week tell (shooting w6r22
vs delivery w6r20) 3.043% mean / 3.013% min — over the floor with the week
confound removed; week confound alone 0.151%; cross-launch noise floor
0.0136%.

**Profiles (rebuilt post-restart via the committed builder + bridge
proof):** shooting week-6 (revision 22, phase shooting, blocker-free);
delivery week-6 (revision 20, unresolved scenery-load-in blocker — the
LL-CP5 record exactly); canonical week-22 (revision 50).

**LL-CP5 regression (final build):** delivery burst Holding 170/170,
travel to the service hold ending (72.0, 32.7); parked burst Parked 24/24
pinned at (2, −52); both passive.

**Evidence (SHA-256 prefixes, stamp 20260823T220108Z):** stage landscape
`4a43380ac84d8d80...`, stage portrait `54aa1979ec3daecc...`, bridge
`181ea0402b7db596...`, motion shooting `b3c927eaf53961b8...`, motion idle
`808482b7f9a261a8...`, motion crew `4a9fb0e79ab86925...`, motion delivery
`f26593a16e1493d5...`, motion parked `5809f4efed67f886...`, two-world
measurement `dec57d9c33f6989f...`.

**Independent rulings (fresh-context, hostile, Opus):** candidate 1
REJECT (D-1 above); candidate 2 **ACCEPT** — "no new blocking defects."

**Ruling: KEEP.**

**Logged non-blocking follow-ups (both reviews):** (1) ~80% of the
headline tell is on the public-street side of the wall — the in-lot tell
alone is ≈0.6% of frame, real and legible but the neighbourhood carries
the pixel share; a future pass could move part of the convoy into a
visible service yard. (2) Two of the four new contract tests are
source-text assertions that a semantic regression could survive; no test
spawns the presentations and asserts clones lack SelectableEntity; door
crew and street traffic still have no dedicated tests. (3) The frozen-
frame epsilon is loose (57 px of 576,000); the idle-lot margin over it is
~3×. (4) Evidence artifacts carry no source-tree fingerprint; stamping the
tree hash into reports would close an ordering-based provenance gap.
(5) The re-spaced north-curb pair clears by 0.23 m and its collider
envelopes are exactly tangent — a future nudge re-creates the defect; no
automated vehicle-footprint overlap guard exists, and adding one to the
scene contract would make this class fail-closed. (6) The gate-approach
comment overstates its east boundary (a car's tail reaches x 12.95 inside
the declared x −10..14 band; the actual driving lane is clear). (7) The
tell's magnitude is fixed rather than scaled to any authoritative
magnitude — honest, but uniform.

**Next candidates:** deferred CP6 scope (unload pair at the truck's hold,
label depth-testing, teal-cube/truck remodels, sky/lighting overhaul,
settle-freeze pose), the environment follow-ups (east horizon,
settle-freeze pose), or the follow-up hardenings above; Phase M continues
interleaved.

## 2026-08-23 — LL-CP7 sealed: the player surface — the panel becomes a memo, not a wall

**Player-visible change:** the opening hostile review's item (7) — "the
proof-style panel dominates a third of the screen" — is retired. The
workflow panel was a 520 px, full-screen-height translucent grey slab
covering 34.7% of every frame, headed by a debug census line, repeating
its status sentence twice, and swallowing every world click under its
empty lower half. It is now a warm paper production memo with period ink
that sizes itself to its content inside a 400 px envelope: measured
13.4–24.9% of the screen across all eleven bridge milestones (mean 16.3%
— a 53% reduction), body ink at 9.8:1 contrast and every control at
7.9–10.0:1 (the review's instrument), the census demoted to one muted
footer line, the duplicated sentence suppressed exactly when the journey
block above already tells it, and the empty envelope returned to the
world (the hit test clamps to measured content height). The blocker card
now shows its ATTENTION line and an equally legible remedy button; the
lot — convoy, beacon, street — fills the rest of the screen.

**Review-born ratchets shipped with it (from the LL-CP6 rulings):**
- `StudioDecorativeIdentity.Strip` is the single decorative identity law
  (was three copied blocks across lot-life, door crew and shooting-day
  people — the door crew previously had no coverage of any kind), with
  destruction injected so a real EditMode test strips a live two-level
  hierarchy via DestroyImmediate and asserts the four identity component
  types are actually gone — behavioral, not grep theater.
- `ValidateVehicleFootprints`: fail-closed scene ratchet — no two
  authored vehicle footprints may interpenetrate (yaw-aware SAT over all
  82 sedans/trucks/trailers/wagons, 3,321 pairs; tangency legal,
  penetration beyond 0.01 m an error; extents copied from the vehicles'
  own colliders, conservative everywhere). Born from CP6's
  found-only-by-eye gate defect; on arrival it caught one real overlap
  (the basecamp water wagon into the production trailer by 0.20 m, moved
  to x 77.6) — the ratchet paid for itself before it was committed.

**Seam integrity preserved, verified hostile:** button evidence still
flows only through `GUILayoutUtility.GetRect` inside
`PlayerWorkflowButton` (pinned GetLastRect-free); the panel's single
sanctioned `GetLastRect` is pinned by the seam test to the
fit-to-content measurement line; PlayerWorkflowButton count, player-slice
button ban, and the editor-diagnostics strip all hold. The StudioHud
receipt law follows the 400 px width at the same 12 px-gap contract
(compact landscapes now fit the full 420 px receipt).

**Unity commits:** `6c8969e` (panel + ratchets; the footprint ratchet's
forced water-wagon fix rode along) and `6a39c1a` (review fix pass).

**Honest failure record:** the first independent hostile review REJECTED
the candidate on two defects: B-1 — all four button styles kept the
built-in skin's light text, measured 1.13–1.40:1 against the new cream
card (the reviewer's exhibit: a bold ATTENTION line whose remedy button
was a ghost; the campaign law "reject slices that make the real game
worse" applied squarely); B-2 — the commit message understated the
stage-luma drift five-fold by quoting only the landscape figure. The fix
inked all controls across normal/hover/active/focused, routed Save/Load
through the inked style, and applied the review's recommended founding
guard to the suppression predicate (N-2). A second fresh-context hostile
verifier reproduced the pre-fix defect band with its own instrument
(1.01–1.41:1), measured the fix at 7.94–9.98:1 on all 36 enabled buttons
across 12 milestones, confirmed disabled buttons still read ghosted
(1.82:1), proved the fix diff exactly B-1+N-2, tied the evidence to the
fixed binary via assembly chain-of-custody, and ruled ACCEPT.

**Validation (final build):** scene validation 0 errors with censuses
unchanged (32/10/16) and both new ratchets live; EditMode 299/299 (3 new
behavioral tests); macOS rebuild + ad-hoc codesign valid; stage visual
proofs complete 5/5 BOTH aspects — worst luma drift vs the sealed LL-CP5
record 7.5e-5 (portrait shootingMean; landscape worst 3.0e-5), at or
below the spread the same metric shows across the sealed CP3–CP6 runs
(4.1e-5–1.07e-4), with the stage captures panel-free by design; bridge
auto proof complete, exact Movie #2, revision 50, week 22, 119.8 FPS.

**Sealed-gains regression (final build):** CP6 two-world criteria still
pass — 3.065% mean / 3.046% min pair (floor 3%), 94.6% outside the
doorway rectangle (floor 60%), zero frozen frames, measurement tool
byte-unchanged; CP5 delivery burst Holding 170/170 passive at revision
20 and parked burst Parked 24/24 at (2, −52) passive at revision 50.

**Evidence (SHA-256 prefixes, stamp 20260823T231822Z):** stage landscape
`6e7372abf134b7b4...`, stage portrait `d4cb3e8fc65ead05...`, bridge
`ad888b3bc4dce605...`, motion shooting `ab038579a655ebb5...`, motion
idle `20b567991c471b66...`, motion delivery `540c5d013c762ff7...`,
motion parked `1bebad84cab16f74...`, two-world `2a1aaa79dd8985b3...`.
The rejected candidate's evidence is retained at stamp
20260823T224952Z for third-party audit.

**Independent rulings (fresh-context, hostile, Opus):** candidate 1
REJECT (B-1 button legibility, B-2 records accuracy); candidate 2
**ACCEPT** — "both blocking defects cleared with independently
reproduced measurements, the fix exactly scoped, nothing regressed."

**Ruling: KEEP.**

**Logged non-blocking follow-ups (both reviews):** (1) no EditMode
ratchet pins the button ink — a one-line assert would stop B-1 recurring
silently; (2) the hit rect clamps height but not origin, so a ~4 px band
at the card's edges is off by the box margin; (3) the 400 px width
constant is duplicated across StudioBridgeClient and StudioHud with no
equality pin; (4) `Strip` fails open on a null destroyer and the test
enshrines it — throwing would be the fail-closed choice; (5) the vehicle
ratchet itself has no unit test, no completeness check on its recipe
whitelist, and no pin tying its extents to the colliders they mirror;
(6) two authored vehicle pairs sit at exactly 0.000 m clearance and one
at 0.022 m — legal tangency, zero authoring headroom; (7) the two-world
delta is trending toward its 3% floor (3.082% → 3.065% across CP7's two
builds) — thin headroom for future slices; (8) milestone 05's cast-choice
beat overflows the envelope and clips the trailing button mid-glyph at
the scroll edge (pre-existing, unchanged geometry); (9) the founding
branch of the suppression guard is exercised by no capture or test.

**Next candidates:** the follow-up hardenings above (button-ink ratchet
and vehicle-ratchet test first), the deferred CP6 scope (unload pair,
label depth-testing, teal-cube/truck remodels, sky/lighting overhaul,
settle-freeze pose), or the environment follow-ups (east horizon);
Phase M continues interleaved.

## 2026-08-24 — Investigation: the CP3 settle-freeze note does not reproduce as recorded

The next-candidate list carried a CP3 follow-up: "walkers hold a mid-stride
pose during the pre-path settle window instead of a standing idle
(pre-existing; visible for ~2s after spawn)." Scoping it as a checkpoint,
the first step was evidence the campaign had never captured: the spawn
window itself. The motion evidence runner gained
`-studioMotionEvidenceSettleSeconds` (client `951b0a2`; default 6 preserves
every sealed burst) and a 20-frame burst was taken at settle 0.5 s on the
shooting profile (`Evidence/R/LLCP8-SettleBefore`, report digest
`shasum -a 256` on disk).

Findings, honestly:
- The sharp "frozen for ~2 s after spawn" defect does NOT reproduce on the
  CP7 build. Adjacent quarter-second frames of the freshly spawned followed
  subject differ by 5.8–7.4% in the body region — the animator is
  evaluating and the idle loop is playing. No frozen adjacent frames.
- What DOES exist is milder and legible only at close zoom: some resting
  bodies' idle stance carries scissored legs that read stride-like at a
  glance (clip-content/art choice, not a state bug), and two code smells
  remain in `PurposefulAgent` that match the note's spirit without a
  demonstrated player-visible cost today: `Start()` hardcodes
  `SetAnimation(false, true)` (ignoring `idleWhenResting`, so a traveller
  can flash its work loop at spawn), and the off-mesh early return in
  `Update()` skips `SetAnimation` entirely, leaving the settle window on
  whatever state preceded it.
- Ruling on scope: no checkpoint. The campaign seals player-visible
  changes proven by measurement; forcing a seal cycle onto a defect that
  does not reproduce as recorded would be theater. The two one-line
  candidates above are recorded for the next animation checkpoint, where
  the new settle-window burst is the before/after instrument.

The next-candidate list otherwise stands as written at the CP7 seal
(button-ink ratchet and vehicle-ratchet test first, then deferred CP6
scope / environment follow-ups; Phase M interleaved).

## 2026-08-24 — LL-CP8 sealed: Living Time — the studio runs

**Player-visible change:** Project: Studio stops being a turn-based proof
harness. A paper transport chip (Pause / 1× / 2× / 4×) sits above the
lot; press a speed and the studio RUNS — weeks advance on their own
cadence, the memo card turns over, and the loop stops itself the moment
the authority needs a decision, with the reason stated in the studio's
voice. The sealed proof-sentence artifact shows it end to end: the
studio rolled unattended from week 6 through shoot, wrap and release
(a FLOP — "Reviews landed poorly"), then latched at "Paused —
Commission a screenplay at Development" with exactly that button
waiting on the memo card. Manual Advance Week stays — demoted from
required heartbeat to option, exactly as the Owner ruled. Also this
stretch, pre-CP8: `2ea3aa5` closed the two highest-value CP7 review
ratchets (button-ink recurrence pin; behavioral SAT coverage, census
completeness floor and collider-pinned extents for the vehicle gate).

**Governance:** implements 00A-OWNER-RULING-TIME-MODEL-2026-08-18 in
the Unity client, mirroring the ratified Living Turn V1
(08A-TIME-MODEL-DOCKET-ADDENDUM; ui/src/lot/livingTurn.ts is the
precedent): ladder pinned to the ratified figures (10.35 s / 5.175 s /
2.5875 s), the week retained as a FRACTION so mid-week speed switches
are exact, no persisted intra-week position (00B.6), and the
hidden-tab law by construction — runInBackground stays 0 (now pinned
by test) and per-frame steps clamp at 0.25 s, so a refocused window
resumes where it paused. Honest framing the review demanded: Unity's
1× is a HOLD-AND-CUT week (a 10.35 s tableau, then the state cut), not
the browser's witnessed 9-beat playback — the played-beat system has
no Unity analog yet and is the recorded next frontier.

**Authority discipline:** the TypeScript sim is untouched (tip
e689f5e). The roll predicate consumes the authority's own guidance —
journey.next.kind, computed server-side: "advance-week" rolls (intent
guaranteed, waiting stated, no blocker); every other kind — decisions,
the casting blocker, the silent null gap, any future kind — latches
pause fail-closed (the LL EX rule: no client-side ladder). Scheduled
advances flow exclusively through the client's existing single-flight
seam (`RequestFirstIntent("advanceWeek")`), inheriting the
exact-envelope ambiguous-post recovery; one advance in flight; the
next witnessed week begins only after the authoritative projection
applies; the wire payload carries no timing field (verified at the
serializer). A racing manual press can never duplicate (two
independent locks + wire idempotency) nor — after the fix wave —
compress the following week (the fraction resets on any observed
authoritative week change). Scheduled time and button time are
separate ledgers: zero player-workflow facts minted, proven.

**Unity commits:** `d33716b` (controller + chip + proof runner + 7
EditMode contracts), `6518450` (synchronous experience captures),
`19acc29` (review fix wave).

**Honest failure record:** the first independent hostile review
REJECTED the candidate on one defect and one principle: below ~610 px
viewport width the chip's on-screen clamp overrode its clearance floor
and overlapped the memo card — 174 px at the sealed 390×844 portrait
viewport — while the geometry test sampled only two wide viewports
where the invariant could not fail (the exact grep-theater failure
mode a last gate exists to stop). The same review verified the
determinism core "stronger than claimed": every INTERMEDIATE week
digest identical across scheduled, manual, and crash-interrupted runs;
the roll predicate checked against the authority's own TypeScript; the
wire payload wall-clock-free at the serializer; two independent
single-flight locks. The fix made the chip law total — ChipFits: the
chip exists only where full width + inset + 12 px gap clear the memo
card (≥622 px); anywhere narrower it is suppressed entirely (manual
verbs remain) — and upgraded every instrument the review named: a
GENUINE measured mid-week switch, an observed revision chain that
fails on gaps and duplicates, holds longer than a week at the actual
speed, cadence fail-guards, and the two named state captures. The
re-review swept 6,225 widths at 0.5 px granularity against the new
law, found zero violations, verified the fix diff 10/10 and the fresh
digests 12/12, and ruled ACCEPT.

**The core proof (mission criterion), reproduced on the final build:**
from identical profile copies, five automatically rolled weeks —
including a 12.4 s paused hold, a measured mid-week 2×→4× switch
(4.023 s / 4.025 s across two runs against a 4.04 s retained-fraction
prediction, with both control signatures in the same runs), a player
pause/resume, a revision-passive save mid-roll, and a load that
latched pause, cost exactly one revision, restored the saved digest
and REPLAYED the rewound week to the identical digest — produced final
digest `41f46177491c7c6e...`; five manual seam advances produced the
SAME digest; and a third run whose engine was SIGKILLED mid-roll at
T+18 s and restarted 3.5 s later (3 transport outages, runtime
replaced, roll held and resumed) produced the SAME digest again, with
every intermediate week digest identical across all three. Speed
changed wall-clock cadence only. Scope note the review required: both
outage runs killed the engine BETWEEN posts (recoveredPostCount 0); a
kill while an advance POST is in flight is covered by the prior sealed
in-flight-recovery evidence over the same seam
(Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021520Z), not by
CP8.

**Experience (instrumented, judged hostile):** while a picture shoots,
1× reads as a paced, watchable rhythm (0.23–0.47%/s whole-frame
motion; the memo card turning over is a clear beat); 2× and 4× stay
readable (the body paragraph is marginal at 4×). Known property
recorded honestly: BETWEEN pictures the lot is a near-still postcard
(0.05–0.13%/s) — the CP6 "shooting today?" law truthfully answering
"nobody is" — bounded by the auto-pause latch (~1–2 weeks) and owned
as content work, not a time-model defect. Pause is obvious on film:
three visually distinct chip states with redundant signals, and the
latched frame is the checkpoint's strongest image.

**Validation (final build, single-build provenance verified):**
EditMode 310/310 (8 Living Time contracts including the 10 px-step
width sweep and the runInBackground pin); scene validation 0 errors
(the scene is untouched — Living Time installs at runtime); stage
proofs complete 5/5 both aspects, luma inside the historical band;
bridge exact Movie #2, revision 50, week 22, 119.8 FPS; CP6 two-world
3.072% mean / 3.057% min, 94.6% outside the doorway, no frozen frames;
CP5 delivery Holding 170/170 passive at revision 20 and parked Parked
24/24 at (2, −52) passive at revision 50.

**Evidence (SHA-256 prefixes, stamp 20260824T072951Z):** living-time
auto `e0548cace369bd84...`, manual `c82cb0d520935e12...`, outage
`690399845ea181bb...`, experience `c00df6ad4e4d72dc...` (30 frames:
ladder + paused + latched); stage landscape `b0fe142bb22f1d30...`,
portrait `ef25c6197c8bfec8...`, bridge `41a6b6bd695786fd...`, motion
shooting `8fa688e25b6d25ae...`, idle `e29af12fef20a134...`, delivery
`d84094caf4662889...`, parked `ca7ccea34ed732f0...`, two-world
`bccf0f72947bad56...`. The rejected candidate's evidence is retained
at stamp 20260824T034944Z for third-party audit. The outage harness:
SIGKILL at T+18 s, restart after 3.5 s, same durable profile, port and
capability.

**Independent rulings (fresh-context, hostile, Opus):** candidate 1
REJECT (chip overlap + a test structurally unable to catch it);
candidate 2 **ACCEPT** — "fixed at the root... verified adversarially
rather than accepting the fix on its face."

**Ruling: KEEP.**

**Logged non-blocking follow-ups (review):** (1) below 622 px there is
now no transport control at all — a compact narrow-width transport is
the open design task; (2) cadenceClean renders outage-exempt spans as
true rather than a distinct "exempt" value; (3) the Time.time source
pin misses the `Time.time)` / `Time.time,` spellings; (4) an
in-flight-kill living-time outage variant would bring C8's scope
inside CP8's own evidence; (5) no transport control or status is
visible during stage inspection while time keeps rolling; (6) the
chip's status line can clip on long blocker reasons at narrow widths;
(7) an abandoned-but-committed POST yields one unwitnessed (never
duplicated) week — bounded, unexercised.

**Next candidates:** witnessed-beat playback for Unity (the browser's
performed 9-beat week — arrivals, departures, wrap clears — so 1×
becomes played time rather than hold-and-cut), between-pictures lot
life so the quiet window reads as a living studio at rest, the
narrow-width transport, premiere/release ceremony surfacing; Phase M
continues interleaved.

## 2026-08-24 — LL-CP9 sealed: Gate-to-Founding World Interaction V1 — the lot becomes the interface

**Player-visible change:** founding stops being a white-panel exercise, and
the Owner drove the final shape live. A new studio opens on the gate: up to
three applicants stand OUTSIDE the arch as selectable people, each with a
billboarded nameplate (NAME / role · the authority's OVR) and a ground
marker that answers the pointer on the person — muted brass waiting,
sky-blue hovered, bright brass selected. Clicking a person opens THE PLAYER
PROFILE (the Owner's Madden/NCAA ruling): a 640px card with a LIVE 3D
portrait of the exact selected body against a sepia 1948 backdrop, name and
age masthead, a 46pt OVR figure with its authored tier, a five-bar SCOUTING
REPORT (Overall, Potential ceiling, Work ethic, Fame, Market standing — all
verified authoritative figures, the hiring-UX research's own sanctioned
fallback until a reviewed six-skill projection exists), CONTRACT DEMANDS
(weekly · signing bonus · term · guaranteed · total obligation), and the
signals. Review Offer opens the contract sheet, whose consequence block
names the bonus' source (the recruitment fund), shows the fund before →
after and payroll as an explicit +delta → after, and whose commit is NAMED
with the authority's own term — "Sign Ramon Ashby — 104-week contract" —
never a generic verb. A signed applicant
sheds the applicant marks and walks through the arch; the freed pad is
taken by the next named arrival only after the walker physically clears it.
Administration is the founding anchor: its card reviews coverage/payroll/
fund/runway/cash and holds the only FOUND THE STUDIO confirmation. A
persistent tycoon pulse (1948 · WK n · Pause/1×/2×/4× · cash · weekly
direction · one attention line) replaces the transport-only chip. The memo
is demoted to guidance, receipts, and the journey — the founding-offer wall
is gone and founding kinds never render as memo buttons again. One-shot
camera reveals frame the gate at opening and Administration at coverage.

**Founding law fixed (the Codex finding):** the bridge emitted foundStudio
only after a proof-only FOURTH Actor. Now foundStudio is emitted the moment
the ENGINE's Core coverage (3/1/1/1) is met; the reserve Actor is an
explicitly optional post-coverage wave. Automation still signs its reserve
deliberately — the committed profile builder founds byte-identically (7
signings then found; load-in profile at the recorded rev 20 / week 6), and
the client automation selector adopts the same law. Regression tests pin
both sides so proof convenience can never become player law again.

**Three commitment laws the hostile reviews forced into existence:**
— THE GEOMETRIC LAW: a commit control never overlaps the control that
revealed it (commits render under their facts, out of the bottom navigation
band; live reveal/commit screen rects are captured on Repaint and the
native proof asserts a 12px pointer margin). The instrument is real: its
first run caught the confirm sheet's commit clipping the reveal band
(failed run retained at FoundingJourney-…T123617Z) and forced the sheet
taller; commit sheets render at full height or not at all (fail-closed
under any forced viewport).
— THE COMMIT-ARM LAW: a freshly revealed commit is dead for 0.7s, enforced
in the commit METHODS, calibrated against the OS double-click defaults
(pinned OsDefaultDoubleClickSeconds = 0.5; user-configurable cadences
beyond the window are covered by the geometric law). The proof probes the
boundary: a commit 0.55s after the reveal — beyond both OS defaults, inside
the window — must refuse. Eight in-window commits refused on the final run.
— THE PAD LAW IS OCCUPANCY: a waiting applicant keeps their pad, a signed
walker frees it only after clearing 2.5m, a replacement takes the lowest
FREE pad, retrying per frame — never spawning inside a person. Distinctness
asserted after EVERY signing.

**Authority discipline:** projection v6. The founding-arrival view is a
READ-ONLY join computed in the SAME resolution pass as the intents (an
arrival's opaque intentId can never disagree with availableIntents);
identity, pricing, legality, potential bands, the five stat figures
(workEthic 1..99 int, fame 0..100 float rounded only for display,
standingPct 0..100 percentile with its seven-tier label), and every
consequence preview are TypeScript's own read models. The treasury pulse is
the engine's D-12/D-17A truth (founding-guarded burn: the HUD showed $0/wk
during the draft and the burn the moment founding closed). The era masthead
is presentation truth with one home (browser precedent: LOT_ERA_KEY). The
portrait is Unity presentation bound to the live selected body — the world
person and the portrait are visibly the same person by construction. The
card dispatches through the client's public SubmitIntent seam; sign commits
only from the ARMED contract sheet, founding only from the ARMED admin
confirm; every review traced every path to the single dispatch site.

**Commits:** TS `de32b41` (projection v5: arrival view + treasury +
Core-minimum law), `72c373c` (projection v6: profile stats), `48bce5b` +
`f190db3` (comparative notes 02 + manual-verified addendum), `dbd7f6e`
(person-profile layering notes 03). Client `9d444ad` (v5 DTOs +
ToSnapshotResponse carry), `0df57f4` (world-first founding), `159cc83`
(native proof + automation law), `f033daa` (review-1 fix wave), `3003081`
(review-2 fix wave + committed harnesses `Tools/cp9-run-*.sh` +
`Tools/cp9-play.sh`), `d679280` (player profile + live portraits, Owner
ruling), `07d7d6e` (Owner sizing pass), `949687d` (hiring-UX research
delta: named commit + consequence clarity), `2c30ba7` (review-4 wave:
refusal diagnostics, the live-seam proof clock, per-sheet geometry with
the clearance floor, authority-echoed term, portrait honesty and layer
hygiene), `911e87e` — THE SEAL BUILD (review-5 record correction: the
portrait-camera isolation comment, the card's class comment, and the
proof runner's step label; the only delta from `2c30ba7` is two XML doc
comments plus that one diagnostic step-label string — the label is
compiled IL, so the client was rebuilt and re-proved). Design inputs:
`CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01` (b23b676) and
`CODEX-HIRING-CANDIDATE-REVIEW-UX-01` (e3f5108) on
`codex/world-first-interaction-research-01`.

**Native proof (ten-run determinism campaign on the campaign build
`2c30ba7`, pinned 1440×900):** TEN consecutive committed-harness
runs — five quiet, five under deliberate 12-way CPU load — all complete
(FoundingJourney-20260824T140438Z…140925Z). Each run: fresh raw-founding
engine; 3 named, marked, portrait-layered applicant bodies, pairwise >4m,
human-renderer-verified (the applicant marks cannot vouch for a person);
5 selection probes at revision 0 with zero workflow attempts (selection is
not commitment); 8 in-window commit refusals incl. both 0.55s OS-cadence
boundary probes; the commit/reveal geometric margin asserted on EVERY
signing sheet with a recorded clearance floor of 80px (vs the 12px pointer
margin); transport distress 0.0–0.2s per run, recorded by the live-seam
proof clock; 6 deliberate NAMED signings ("Sign <name> — 104-week
contract") in role waves, each exactly +1 revision; the first hire's
entrance walk measured motion-honestly; pad distinctness after every
signing; readiness at EXACTLY 6 signings / Actors 3/3, reserve wave
optional; consumed-offer replay refused without revision/digest change;
Administration confirm; gate cleared; treasury pulse enforced present.
8 screenshots per run. SEAL-BUILD CONFIRMATION: the rebuilt `911e87e`
client ran three further confirmation runs —
FoundingJourney-20260824T142210Z / 142244Z / 142317Z, named here because
`Evidence/` is gitignored and the repo will not carry them — each 33/33
steps complete with identical substantive outcomes (6 named signings,
Actors 3/3, 8 in-window refusals, both geometry laws true, clearance
floor 80px, transport distress 0.099–0.266s).

**Regression gates:** EditMode 330/330 (incl. pad/arm/geometry/nameplate/
portrait-layer laws and the total 400px pulse-width sweep); TS bridge
suite green incl. schema-sync at v6; bridge two-picture proof complete at
revision 50 / week 22; Living Time auto == manual == the CP8-SEALED digest
41f46177491c7c6e… at week 11 (profile rebuilt under v6 after the engine
correctly fail-closed on the v5 checkpoint's schemaId); stage proofs
complete both aspects. Honest flake record: two stage-portrait attempts
timed out on probe DURATION with every check passing when launched
back-to-back with other proof apps (focus starvation under
runInBackground:0); green when run alone — back-to-back app launches are
an invalid harness condition, not a product defect.

**Evidence (SHA-256 prefixes; final campaign run 140925Z):** founding
report a2e13823c8f92ac3, gate close-up a2100b25d5440be3, profile card
abd54db0582046fb, contract sheet e959d0cfb50e2225, hire consequence
88ad2c1c1e92c450, post-founding 59249cfd7d282894; regression bundles
(validated across the presentation-only deltas by reviews #4-#5): bridge
auto 91f7e14dea2683bb (rev 50 / week 22), living auto 9dbc77d7d4e6e089,
manual 50042764eb59d8e3 (both the CP8 digest 41f46177…), stage landscape
542b47dd8029aa74, portrait 5afab66a0e9e8bd6. Prior-candidate and
failed-instrument evidence retained for audit (incl. the geometry
instrument's own recorded failures at …T123617Z and …-SHORT-…T125751Z).

**Honest failure record:** review #1 REJECTED on five blocking defects and
was right on every one (double-click commits through 100%-overlapping
bottom-anchored buttons — the Owner's original accident, rebuilt; pad
stacking at 0.00m in the proof's one blind spot; a dead selection
highlight the repo had carried since CP7; unmarked, unidentifiable
applicants). Review #2 REJECTED again: the 0.45s arm window lost to the
500ms OS-default double-click, the geometry was unchanged, the arm probe
fired where it could not fail, and the first fix commit's "impossible"
claim was false as written (corrected on the record). Review #3 ACCEPTED
after independently re-measuring 49px/44px clearances and making the
overlap instrument fail on demand; its punch list (fail-closed height
clamp, margin law, boundary symmetry, honest walk metric, committed
harnesses, resolution-pinned bridge harness, enforced hudChipFits, honest
OS-default prose) was folded in full. Review #5's finding was
self-inflicted twice over: a sed edit silently matched nothing, so a fix
commit's message asserted corrections that did not exist — the false
record, not the strings, was the defect; the remedy landed as its own
honestly-described commit and was verified independently. Pre-review
defects the gates caught: deferred Destroy vs DisallowMultipleComponent
left no bodies; the first pads stood INSIDE the arch, occluded by the
marquee and contradicting the not-a-member law; a nested-coroutine frame
hop let the poll seize the single-flight seam; the automation selector
still encoded the old 7-signings gate; the first marker disc was buried
under authored paving and the second rendered in missing-shader magenta;
the Owner was found play-testing an app instance from before any of CP9
existed.

**Independent rulings (fresh-context, hostile, Opus):** #1 REJECT (five
blocking defects), #2 REJECT (arm window vs OS default; geometry
unchanged), #3 ACCEPT (client 3003081, with a punch list folded in full),
#4 REJECT (every product law verified sound; rejected solely on the proof
instrument's nondeterminism — a latched, undiagnosed dead commit in 2 of
its 9 runs — plus hygiene items D2-D10, all folded), #5 REJECT (narrowly,
on record honesty alone: three stale strings — the portrait-camera
isolation comment, a "2-year" residue in the card's class comment, and
the proof runner's step label — survived that falsely-claiming fix
commit; every product law re-verified sound; ACCEPT pre-authorized on
the exact remedy). The remedy `911e87e` was then confirmed by a
fresh-context verify-only ruling: **ACCEPT** — diff scope exactly the
three strings and nothing else, repo-wide "2-year" grep clean, commit
message judged honest claim-by-claim, 3/3 confirmation runs green.

**Owner findings incorporated live (2026-08-24):** "still driven from the
box on the left" → the world-first surfaces above; "a small white box…
compared to what pro games have" → the player profile with portrait,
stats and demands; "make that window larger" → the 640px profile and the
1720×1045 play window. Playable via committed `Tools/cp9-play.sh`.

**Known limits recorded:** post-founding memo surfaces unchanged by
charter (the grammar propagates building-by-building in later checkpoints);
the 1948 masthead never advances with play (presentation truth until the
engine owns a calendar); below 842px viewport width the tycoon pulse is
suppressed entirely and commit sheets fail closed rather than squeeze
(narrow-width surfaces remain open work); hover tint shares the selected
code path but batch evidence exercises only selected; the repo-wide
SelectableEntity MPB highlight remains dead for non-applicant entities
(buildings select with no world response — recorded follow-up); the
six-perceived-skill projection, dossier modality, Prev/Next candidate
rail, and the full comparison/profile workspace are DEFERRED per Owner
direction (charters: CODEX-HIRING-CANDIDATE-REVIEW-UX-01 §9-10 NEXT;
PERSON-PROFILE-LAYERING-NOTES-03 layer 3). Proof-instrument caveats on
the record (review #5, non-blocking): the live-seam clock also pauses on
terminal non-Live states (latency-only — the run still fails and names
the state); WaitUntilTimed steps remain wall-clock; transportDistress-
Seconds is commit-window-scoped (0.03–0.32s observed across all
thirteen runs); minSignClearancePx is a directional proxy, not a full
hit-test; campaign bundles carry no load-flag field distinguishing
quiet from loaded runs.

**Ruling: KEEP.**

**Next (awaiting Owner CP9 playtest + Codex Package 02 — World Selection,
Navigation & Context UX):** Development operable from the lot
(WORLD-INTERACTION-COMPARATIVE-NOTES-02 §3: one TypeScript-authored
site/buildingId binding on intent options + the Development card;
commission/review leave the memo exactly as founding did), then Casting,
the stages, the attention rail; the Full Profile workspace with
side-by-side applicant comparison; a real selection-response system for
every world entity; witnessed-beat playback; between-pictures lot life;
narrow-width transport/HUD.

## 2026-08-25 — LL-CP10A sealed: the Gate + Administration interaction spine reaches professional floor

**Owner playtest verdicts answered (all seven):**
— **A. The middle applicant could not be clicked** — root-caused, not patched:
their capsule stands STRICTLY INSIDE the Crown Gate's own 34×12×8
selectable envelope AND the parked delivery truck's box, and CP9's single
nearest-hit ray always fed the click to the envelope; every CP9 proof
selected by talentId directly, so the raycast path was never exercised.
The pick is now SEMANTIC (Package 02 §4.5): RaycastAll over the selection
layer, every hit resolved to its entity, and a visible person on the ray
beats every place/vehicle envelope; within a class the nearest hit wins;
a person occluded by real geometry along the exact sight line never
x-rays (one honest person decision — an occluder ahead of the nearest
person blocks every person behind it). Semantic kind comes from honest
component evidence (person slot / vehicle route), never names; applicant
clones declare Person explicitly. The marker disc AND the floating
nameplate are honest targets too — selection-layer colliders resolving
to the applicant's own entity, the plate on a warm 3.6-wide backing
quad, so clicking a person's NAME selects the person. The native proof
runs screen-space picks through the REAL camera-ray path — left, middle,
right, both directions, at chest AND plate — and every pick must resolve
the exact person (12/12 at every layout).
— **B. "Screen for actor hard to read… larger with larger font":** the
dossier is the Codex Layer-2 two-column surface — live portrait, 30pt
masthead, 64pt OVR, scouting report with real tracks, genre signal, and
a CONTRACT DEMANDS column led by the 24pt weekly figure — up to 980px
wide at 1720×1045 with the lot retained as context. Type NEVER shrinks
across tiers; the card resizes instead (the typography constants are
law, pinned by test). Standard tier: portrait 200×250, no duplicate
Overall bar (the 64pt figure and tier already state it), strengths a
Large-tier signal, the concern on every tier.
— **C. Contract review too small:** same treatment — portrait/identity
echo (name, OVR, tier restated), consequence rows as quiet 17pt label +
prominent 24pt bold figure, every CP9 commitment protection unchanged
(named commit, 0.7s arm vs the 0.5s OS double-click window, commit-
under-facts geometry, fail-closed height, single dispatch seam).
— **D. Specialty invisible:** projection v7 carries the one authoritative
perceived signal — the top genre-experience cell of the primary
discipline (worldgen `genreExperience`, 0..100, deterministic), with a
tie flag and the second non-zero signal. The dossier states it in
belief vocabulary: "GENRE EXPERIENCE (AS BELIEVED · NOT CREDITS) /
Strongest signal: Comedy · 33 / 100 / Also: Horror · 25" — a tie always
names its partner — and honestly "No believed genre experience" when
every perceived cell is 0, coexisting with the "Unproven — no credits
yet" concern instead of contradicting it. No hidden truth, no invented
fit, no new simulation: a pure carry (adapter law: max cell, GENRE_ORDER
tie-break, null on all-zero; wire == row asserted field-by-field, plus
an INDEPENDENT recomputation oracle over every applicant — review #1).
— **E. Administration not obvious:** the CP9 coverage-triggered automatic
camera flight is GONE (Package 02: arrival, state change, readiness never
move the camera). Attention is now layered without a hijack: a
billboarded "★ FOUNDING READY — Found the studio at Administration"
pennant stands over the building exactly while readyToFound (shape +
text, no color-alone, no glow, no pulse) — and because that pennant
stands ~660px off-frame at the only authored pose, the screen-space
half of the law is StudioFoundingBeaconHud: "◀ FOUNDING READY /
Administration — click to review" at the building's projection when
framed, clamped to the nearest LEGAL edge when not (never the memo
column, never the chip band), clicking it SELECTS Administration (never
a camera move), and it stands down entirely the moment ANY selection
exists — it can never cover or out-click an open surface (review #2).
Beside these: the chip's attention line and the memo's supporting
sentence. The ONE remaining authored composition is the session-opening
Gate framing, and it fires only while the player has expressed zero
camera intent (TycoonCameraController.UserCameraInputObserved).
— **F. Administration context incomplete:** the founding review now
answers in reading order — identity, role ("Studio administration,
finances, and publicity"), status (Founding ready / Recruiting), the
four coverage lines, "Signed so far:" by name WITH each signing's
founding role ("Ramon Ashby (Director)", body-size type), then fund/
payroll/runway/cash as label+figure rows. The names are AUTHORITY, not
presence: projection v8 publishes the signed roster
(state.contracts joined to talent, signing order, founding-role
labels) after review #2 caught the client counting bodies on the lot
— 2 names shown while 6 contracts existed. Post-founding the new
AdminOperations card replaces the CP9 dead panel: cash, weekly payroll
(v7), weekly burn, net weekly, runway (⚠ at ≤8 weeks), roster count
and names — all the treasury pulse's own figures, no client
arithmetic, and honestly NO action button (the engine offers none at
Administration after founding).
— **G. Rejection:** audited, not faked. The engine has NO decline/
dismiss/skip-applicant law (all 30 action kinds; FoundingState never
removes an id; save shape pins it). "Not now" remains the honest
non-mutating step back; an explicit candidate decline/replacement law is
RECORDED as a deferred design dependency for a future authoritative
package — no client-only rejection was invented.
— **H. Memo:** untouched by charter (no redesign; CP10A neither causes
nor relies on its geometry); it keeps its demoted guidance role.

**Interaction behavior frozen (§7):** hover = marker tint + nameplate;
single click selects only; double-click = Focus only, and the activation
window widened 0.32s → the pinned OS default 0.5s so a normal-cadence
double-click actually Focuses; Esc clears; camera never moves for
arrival/signing/readiness/notification/panel.

**Layout law:** the card stack respects two floors — never into the
living-time chip's band, never leftward into the memo column (CardRect
topFloor/leftFloor, test-pinned) — and the beacon obeys the same floors.
Below 884px height the chip YIELDS entirely — a DERIVED threshold
(receipt band + gaps + chip band + the tallest fail-closed commit
sheet), not a guess, after review #3 proved the hand-picked 860
admitted a band where founding could not complete. The compact tier
renders full-height commit sheets; compact narrows consequence labels
and drops the second genre line (recorded limits).

**The instrument kept its record:** the geometric margin law caught FIVE
successive layout defects live before any reviewer could — the Standard
review's commit 5px from the reveal band; the compact tier unable to
host chip + full-height sheets; the Standard dossier clipping its own
bottom-anchored Review Offer (review #1 B1 — the proof now MEASURES
every reveal/commit against its own card rect instead of trusting
layout arithmetic, and immediately caught two more overruns while
tuning). Final clearances: 71px at 1440×900, 71px at 1720×1045, 56px at
1280×800; clip law true at all three, including the admin reveal.

**Eight hostile reviews, every blocker dead at the root:**
Review #1 (fresh Opus, REJECT — five blockers): B1 the clip law above;
B2 discoverability is screen-space (the beacon was born here — its
first frame rendered UNDER the memo column, existence≠visibility,
fixed with the legal-floor clamp); B3 the affordances are honest
targets (nameplate/disc colliders, 12-pick proof); B4 the signal
explains itself (belief vocabulary above); B5 the people have names.
Review #2 (fresh Opus, REJECT — two blockers): ND1 the beacon overlapped
the dossier's top band and stole its clicks → ANY selection stands it
down entirely; ND2 "Signed so far" derived from lot presence → the v8
authoritative signed roster. Non-blockers folded: nameplate backing/
collider 3.6 + characterSize 0.04; ResolvePick's dead fall-through
removed (an occluder before the nearest person necessarily blocks those
behind); the runner's admin-reveal clip check.
Review #3 (fresh Opus, verify-and-hunt on TS `6761178` / client
`046f112`, REJECT — three blockers, every one real): R3-B1 the
"1440×900" proof bundle was a lie — the window drifted to full-native
3456×2168 mid-run, nine of ten frames and every geometry figure
described the wrong surface, and the Standard tier had NO visual
evidence; the runner could not witness its own viewport. Remedy: the
report now records requested + per-screenshot observed resolution and
FAILS CLOSED on drift (one re-assertion attempted, ±2px tolerance for
the recorded 1045→1046 title-bar rounding). R3-B2 a 24px height band
(860–883) where the fail-closed AdminConfirm sheet rendered NOTHING —
the hand-picked 860px chip threshold admitted heights whose card
budget could not host the 620px sheet, and REVIEW FOUNDING opened an
empty screen. Remedy: ChipMinimumHeight is now DERIVED (receipt band +
card gap + chip band + tallest fail-closed Standard sheet = 884), and
a per-pixel sweep test (788→1440) proves no commit sheet ever
vanishes or clamps at any admitted height; the "window is not
resizable" comment the law leaned on was falsified by R3-B1's own
evidence and is corrected. R3-B3 double-clicking the beacon selected
the Crown Gate — the ND1 stand-down deleted the plate after click one,
so click two fell through to the world pick, where the Gate's broad
envelope waits directly behind the plate. Remedy: the ghost shield —
the consumed rect keeps claiming its pixels as UI for exactly the OS
double-click window (pure static law, unit-tested at the boundary),
and the native proof now drives a real double-click through
TryConsumeClick: Administration selected, plate down, second press
shielded. Non-blockers folded: ND1 gained its missing unit law
(BeaconWantedFor) AND the native probe for its exact filed case (an
applicant dossier open at readiness); the 1280×800 report no longer
records a chip line the player never saw; the v8 roleLabel is rendered
("Vera Barrow (Director)") so the wire field is live — and after the
clip instrument caught the roles treatment overflowing the compact
520px card (its SIXTH live catch), presentation became the measured
ladder of R4-B1: the role-labeled form renders exactly where it
measures inside the block budget, which in practice is the DECIDING
phase (a short roster steering the next signing —
admin-review-midway.png at three signings is its evidence frame); at
six-plus names it lawfully yields to names-only with the coverage
checkmarks carrying the role truth; "Signed so far" stands at body
size wherever the tier grants it; the post-founding
roster row is labeled "On the lot" — presence stated as presence, with
the employed-roster projection recorded as deferred authority work;
the beacon's leaked style texture is destroyed. Recorded, not built:
sub-788px heights (the fail-closed floor), Evidence/ remaining
gitignored (bundle digests recorded in this ledger bind it), the
1046px rounding, Large-tier dead band above bottom controls.
Review #4 (fresh Opus, verify-and-hunt on TS `6761178` / client
`417ab70`, REJECT — two blockers, both real): R4-B1 the role-labeled
signed line overflowed the founding card in reachable states the
evidence never rendered — SEVEN signings (the ladder's own automation
signs seven; normal play) wrap the line to four body lines and clip
REVIEW FOUNDING at the pinned 1440×900, and the tier split gated on
HEIGHT when card WIDTH drives the wrap (1280×900 rendered roles on the
exact 520×600 geometry the instrument had already rejected). Remedy at
the root: the signed block is now MEASURED, never estimated —
GUIStyle.CalcHeight with the exact style and wrap width the label
uses, against an explicit three-body-line budget
(SignedBlockMaxHeight 72), richer forms yielding to plainer (roles at
body → names at body → names at muted, the proven compact floor form
rendering unconditionally as the last rung); the Standard overview
stands exactly as tall as the confirm sheet (620 — the tallest height
the chip-shown budget always grants, so it NEVER clamps); and the
proof gained a reserve-signing VARIANT (-studioFoundingJourneySignReserve)
that signs the seventh after the Core-minimum laws are asserted at
exactly six, then renders and clip-checks the seven-name card in
pixels at 1440×900 and at the width-trigger geometry 1280×900
(foundedWithoutReserve honestly false in the variant bundles). The new
1280×900 variant immediately EARNED ITS KEEP: on its first run the
geometric instrument caught the contract sheet's commit landing inside
the profile reveal's pointer margin — the same width-driven-wrap
family, the height-keyed consequence-label width (230px) wrapping the
narrow 563px sheet's figures and sinking the commit ~70px. Fixed at
the root: the label column is keyed on the LIVE CARD width (≥570 →
230, else 150 — every charter layout pixel-identical), and the
Standard review sheet stands at the chip-shown budget's full grant
(620, the same law as the confirm sheet). R4-B2
the ghost shield expired at the nominal 0.5s OS default — the window
this codebase had ALREADY ruled insufficient for this exact gesture
(the 0.7s commit arm exists because a 0.45s window measurably lost to
a default-cadence double-click; OS intervals run to ~900ms). The two
laws guarding the same physical double-click now share CommitArmSeconds,
the unit boundary tests moved with it, and the native probe re-tests
the shield at the 0.55s cadence the commit sheets defend. Non-blockers
folded: the viewport witness now closes on the EVIDENCE itself — the
captured texture's pixels are asserted against the request, not only
Screen.* (the Screen/backbuffer disagreement was the original drift's
exact signature); the runner asserts the full-window safe-area
assumption the derived budget laws stand on; the stale "below 860px"
comment corrected to the derived law; admin-confirm-armed.png — the
first evidence frame ever to show a LIVE commit button; the chip's
leaked style texture destroyed (the beacon's identical leak was fixed
in wave 3). Recorded: the overview height changes (570→620 Standard,
600→640 Large across waves 3-4) are stated here explicitly.
Review #5 (fresh Opus, verify-and-hunt on TS `6761178` / client
`cc8a06c`, REJECT — two EVIDENCE-INTEGRITY blockers, no product
defect; both R4 remedies verified fixed at root by independent pixel
measurement): R5-B1 admin-confirm-armed.png showed a DISARMED button
in all five bundles — the Back/reopen probe restarts the 0.7s arm
clock and nothing waited for it (the reviewer proved it from the
pixels: zero commit-red in the button band, byte-identical tone to
the deliberately disarmed frame). Remedy: the armed frame is WAITED
for (card.CommitArmed), hard-asserted before AND after the capture so
a disarmed frame can never silently record, and moved BEFORE the
stale-offer probe so no rejection receipt pollutes it. R5-B2 the
sealed "founded ... with no reserve Actor" note lied in both
reserve-variant bundles (the machine field foundedWithoutReserve was
honest; the human note was a fixed string). Remedy: the note reads
from the run's own facts. Non-blockers folded: the roster ladder's
budget is now the measuring style's OWN metrics (lineHeight × 3,
computed at draw — the hand-picked 72px admitted only two wrapped
body lines in practice, silently demoting the seven-name roster to
the card's smallest type); the chosen roster form is TELEMETRY
(LastSignedRosterForm → signedRosterFormMidway/AtReview in the
report, schemaVersion 6) instead of a claim to eyeball from font
colour; the card HUD's own leaked style texture destroyed (the last
of the three); the ConsequenceRow comment's wrong width corrected;
one width source for the roster measurement (the same live area rect
ConsequenceRow keys on). Recorded, not changed: the 150px label
column wraps three long labels at 1280×900 (the shipped compact form,
scruffy not clipping); 20px commit clearance at 1280×900 is the
thinnest of the five geometries (the instrument stands guard); the
boundary-exact 0px slack at exactly 884px height (self-consistent by
derivation); two evidence frames honestly captured during transport
refresh; the ladder has no resize hysteresis (unreachable in normal
play). The reviewer also CORRECTED my stage-landscape record: the
probe stalls measured 14.6–15.1s (not the 13.35s I had quoted from
one earlier report), and the failures began ~20 minutes BEFORE the
wave-4 build on unchanged landscape code — strengthening the
environmental diagnosis (locked session), which the reviewer
endorsed while correctly demanding the green run stay a seal
precondition.
Review #6 (fresh Opus, verify-and-hunt on TS `6761178` / client
`3d770c7`, REJECT — two blockers, both instrument-integrity, verified
by classifying all 60 captures in the wave): R6-B1 the armed-frame
guard checked HALF the button's gate — GUI.enabled is ActionsEnabled
AND CommitArmed, and ActionsEnabled drops during every ~1Hz snapshot
poll (18% of the wave's pre-founding captures landed on such frames;
the clean armed sweep was luck, ~63% chance of at least one corrupted
frame per five-bundle wave). Remedy: CaptureWhenStable — the capture
waits on BOTH gates and only stands if they still hold across the
captured frame, else the frame is discarded from the record and
retaken (bounded, fail-closed); applied to every card evidence frame,
so the transport-refresh banner can no longer pollute the corpus
silently. R6-B2 the lineHeight×3 roster budget was a pixel-for-pixel
NO-OP sold as a fix — CalcHeight for three wrapped lines exceeds
lineHeight×3 (padding and wrap leading), so the seven-name roster
still demoted to muted while comment, commit message and a
source-string test all claimed otherwise; the same commit had deleted
the behavioral assertions that would have caught it. Remedy: the
budget is the style's OWN three-line CalcHeight — the same function
the candidate is measured with, asked for an explicit three-line text
at the same width — true by construction; the roster telemetry gains
fail-closed floors (empty telemetry fails the run) and the readiness
form joins the step record. Review #6 also verified R5-B1/R5-B2
genuinely fixed (pixel-measured: commit-red 618 in every armed
frame's button band, 0 in every disarmed one) and independently
endorsed the locked-session stage-landscape diagnosis. Inherited
findings recorded for the Owner, NOT CP10A scope: the transport's
~1Hz snapshot poll disables all commit CTAs and grows the left panel
~40px each cycle — visible flicker on the primary surface that
predates this checkpoint (StudioBridgeClient took only a
pluralization change in the whole campaign); and the camera-freeze
law is enforced by source pins, not yet by a runtime pose-invariance
probe.
Review #7 (fresh Opus, verify-and-hunt on TS `6761178` / client
`8e56c26`, REJECT — two blockers on the telemetry's own honesty,
while independently CONFIRMING both R6 remedies at root: a
banner-color detector over 911 frames measured pollution 10/60 on the
prior build and 0/60 on this one, and the cross-build roster-form
delta showed every ≥860 layout promoted exactly one rung — roles at
six, body at seven — at unchanged geometry): R7-B1 LastSignedRosterForm
was never reset, so the readiness telemetry floor could never fire
and a non-rendering ladder would silently report the MIDWAY frame's
form as the readiness form. Remedy: the property resets at every
DrawSignedRoster entry — an early return leaves the honest empty
value the floors fail on. R7-B2 nothing floored the FORM — a
regression back to the muted floor at a chip-tier layout would still
produce a complete green run, discoverable only by a human diffing
JSONs across waves (exactly how the reviewer caught R6-B2). Remedy:
fail-closed form floors in the runner — muted at a ≥860px layout
fails the run at both the midway and readiness reads, the same shape
as controlsWithinCards. Non-blockers folded: ALL twelve evidence
frames now carry the stable-capture gate (the five world/HUD frames
included — founding-ready.png had been polluted twice in a prior
wave); a discarded frame's file is deleted on exhaustion so no
orphaned pixels linger under a canonical name; the stale duplicate
doc block removed. Recorded, not changed: admin-confirm.png and the
armed frame are pixel-identical in the commit button (by capture
time the arm has lawfully elapsed; nothing claims the frame disarmed
— the disarmed truth lives in the nine behavioral refusals and their
revision checks); the compact tier's muted floor is a fixed form,
not a measurement (the recorded compact limit); CaptureWhenStable's
10-attempt bound is generous (a persistent gate failure fails
earlier, inside the wait).
Review #8 (fresh Opus, verify-and-hunt on TS `6761178` / client
`f9e4ec4`): **ACCEPT — zero blockers**, conditional on exactly one
explicit seal precondition: the green Stage-landscape run on an
unlocked session (satisfied below). The reviewer re-derived every
report claim with ZERO discrepancies, verified all twelve frames'
pixel dimensions from PNG headers, independently REPRODUCED review
#7's banner detector over three waves (10/60 polluted pre-remedy,
0/60 on both remedied builds — founding-ready.png's two historic
hits included), found the archived negative case proving the form
floor discriminates (a prior wave's green run carries the exact
muted-at-900 regression the floor now kills), corroborated 342/342
structurally (231 [Test] + 111 [TestCase]), and confirmed the
CP8-sealed digest against the TS ledger. Recorded observations
(non-blocking, follow-up work): the telemetry reset guards one of
four non-render paths (the others are independently killed by the
clip law — verified — but the root "the value is only truthful when
the whole chain rendered" wants a frame-stamp); the R7 remedies are
not yet source-pinned by test; the 860–883 chip-hidden band is safe
by derivation but unwitnessed in the proof matrix (a ~1440×870
layout would witness it); proof reports do not yet stamp the git SHA
they ran on; one CP9-inherited presentation-model/name mismatch
visible in evidence (no law covers portrait-model agreement).

**Commits:** TS `57fde6f` (projection v7: specialty signal + treasury
weeklyPayroll; decline-intent absence recorded), `1bb29c9` (review #1:
the genre oracle becomes independent), `6761178` (projection v8: the
signed roster becomes authoritative) — THE TS SEAL. Client `83d3833`
(v7 DTOs), `dacb101` (semantic pick law + adversarial overlap suite +
OS-default double-activation), `b17c402` (dossier/review/admin/pennant/
runner v2 + `Tools/cp10a-run-founding-proof.sh`), `ccc2c2e` (geometry
fix wave: per-tier heights, chip height law, compact tier), `9dc0c52`
(review #1 wave: clip law, beacon, honest targets, belief vocabulary,
names), `046f112` (review #2 wave: the beacon yields, the roster tells
the truth), `417ab70` (review #3 wave: the proof witnesses its
viewport, the chip law derives, the beacon shields the double-click),
`cc8a06c` (review #4 wave: the roster is measured never estimated,
the shield matches the arm law), `3d770c7` (review #5 wave: the armed
frame is armed, every note reads from facts), `8e56c26` (review #6
wave: the capture gates on the whole truth, the budget measures
itself), `f9e4ec4` (review #7 wave: the telemetry resets and the form
is floored) — THE SEAL BUILD. Design authority:
`CODEX-WORLD-INTERACTION-PACKAGE-02` (a4795ff) + Builder Annex
(f571a1d) + `CODEX-HIRING-CANDIDATE-REVIEW-UX-01` (e3f5108). The
Annex's one open decision — the implementation base — was answered by
the Owner's order: CP9's sealed `911e87e` / `44615e5`.

**Native proof (final build `f9e4ec4` + TS `6761178`):** the
founding-journey proof (report schemaVersion 6 — the VIEWPORT-WITNESSED
form, closing on the captured pixels themselves, with roster-form
telemetry and the stable-capture law on every card frame) runs
complete at true 1440×900 (proof floor), 1720×1046 (the Owner's
window; the recorded 1045→1046 title-bar rounding), and 1280×800
(narrow landscape), plus the two reserve-signing variants at 1440×900
and 1280×900 — bundles
FoundingJourney-1440x900-20260824T232107Z / 1720x1045-…T232148Z /
1280x800-…T232228Z / 1440x900-reserve-…T232308Z /
1280x900-reserve-…T232349Z, named here because Evidence/ is
gitignored; each report records requested + per-screenshot observed
resolution and the run fails closed on drift. Roster-form telemetry
across the corpus (machine-recorded, floored fail-closed): midway
(3 signings) roles-body at every ≥860px layout, names-muted at
compact; readiness ROLES-BODY at six signings on 1440/1720 (the
by-construction budget finally admits the full role-labeled roster —
every founding role visible at body size), names-body at seven
signings (both reserve variants), names-muted at compact. One
stable-capture retake fired live in the wave (a snapshot poll flipped
a gate mid-capture at 1440-reserve) — the law caught and cleaned the
exact 18% hazard review #6 measured. Each run: 12/12 screen-space pointer picks
exact (L/M/R both directions, chest AND nameplate, through the real
ray), 5 selection-is-not-commitment probes, 9 in-window commit
refusals incl. both 0.55s OS-cadence boundary probes, cancel/reopen
probe, admin Back probe, the geometric margin on EVERY sheet measured
against its own card rect (clearances 24/71/56px), 6 named signings
each +1 revision, Core minimum at exactly 6 signings / Actors 3/3,
pennant present at readiness, the beacon a real on-screen rect at
readiness, standing down for an OPEN APPLICANT DOSSIER (ND1's exact
case) and after its own click, the beacon's real double-click probe
(Administration selected, plate down, second press ghost-shielded),
consumed-offer replay refused without mutation, founding at
Administration, post-founding AdminOperations card live, 12
screenshots including founding-ready.png (the attention surface
exists in pixels), admin-review-midway.png (the deciding-phase review
— the role-labeled roster form in pixels), admin-review.png (six
signed names), and admin-confirm-armed.png (the LIVE commit button —
the first evidence frame to show a commit outside its disarmed
state). Two reserve-signing VARIANT bundles render the seven-name
card (foundedWithoutReserve honestly false): 1440×900 and the
width-trigger 1280×900, both complete with the measured names-only
form and full clearances.

**Regression floor:** EditMode 342/342 (the semantic-selection suite,
CP10A contract pins, camera-law pin, beacon bootstrap pin, the derived
chip law + per-pixel commit-sheet sweep, the beacon's stand-down and
ghost-shield laws, the measured-roster law); TS bridge suite 118/118
at v8 (arrival join extended to the five genre fields; treasury
weeklyPayroll law; the independent genre oracle; the signed-roster
law: 6 contracts → 6 names, 3 actor role labels); typecheck clean;
bridge two-picture proof complete at revision 50 / week 22
(BridgeAuto-20260824T232430Z); Living Time auto(6 observed weeks) ==
manual(5 advances, exactly TO the lawful week-11 commission latch) ==
the CP8-SEALED digest 41f46177491c7c6e…
(LivingTime-auto-20260824T233325Z — green solo after the RECURRING
locked-session wall-clock cadence flake, the digest at the sealed
value in every failing run too — and
LivingTime-manual-20260824T233059Z; profile
rebuilt under v8 after the engine correctly fail-closed on the v7
checkpoint); stage proofs complete both aspects on the seal build
(Stage-portrait-20260824T233109Z; Stage-landscape-20260825T043008Z — the GREEN
landscape run on the seal build, on the unlocked session with the
window visible, the review-#8 seal precondition satisfied — the landscape runs during the locked-session
window failed ONLY on the 20-second wall-clock readiness law with
every functional check true; see the honest failure record). Full TS
vitest suite (serial, quiet machine): 9 failures in 2 files, ALL
pre-existing — WorldFirstWorldInspectorDefault.test.tsx fails 8/28
IDENTICALLY on the sealed CP9 baseline `44615e5` (worktree-verified
5s-timeout cascade, not a CP10A regression) and the casting-review
file passes solo (machine-load flake).

**Evidence bundle digests (SHA-256 prefixes, file-list digest per
bundle):** FoundingJourney 1440×900 82367f09c59c10dc · 1720×1045
38e668c21ab687ed · 1280×800 046b82e7709bdc83 · 1440×900-reserve
25bf85313c5809c6 · 1280×900-reserve c7f38318664f4d00; BridgeAuto
3100eb16917f74af; LivingTime auto 26556d753e259666 / manual
94f78d20d806348c; Stage portrait 68c7b194e3648916 / landscape c0ea942d938af776;
EditMode results ace011576b7a95e0; engine.mjs 28e11e951e9ae74c.

**Honest failure record:** the five instrument catches above; the v8
schema draft omitted registering StudioFoundingSignedSnapshot in the
bridge definitions map — 21 hydration failures ("Unknown bridge schema
definition") before registration; the beacon's first frame buried under
the memo (review #1), its second over the dossier (review #2), its
third form's stand-down opened the double-click fall-through (review
#3) — the ghost shield is the fourth and proven form; "Signed so far"
lied from presence until v8; a live proof run's window drifted
1440×900 → 3456×2168 and the evidence lied about its own resolution
until the runner learned to witness and enforce its viewport (review
#3); the hand-picked chip threshold admitted a founding-cannot-complete
band until the law was derived (review #3); the full-vitest suite
produced 11 then 142 flaky failures while three heavy jobs shared the
machine — the quiet serial truth is recorded above; one stage-portrait
duration flake as recorded above; one verification-chain invocation
error of my own — `manual 6` asked the living-time harness to advance
THROUGH the engine's lawful week-11 auto-pause latch ("Commission a
screenplay at Development"), failing step 6 twice before the correct
`manual 5` (advance exactly TO the latch) completed with the sealed
digest — the equality law auto(6 observed weeks) == manual(5 advances)
== 41f46177… was never broken; and the stage-landscape "duration
flake" finally gave up its cause — five consecutive failures, every
functional probe check TRUE, each probe stalling 14.6–15.1s (review
#5 corrected my first 13.35s misquote), traced by desktop screenshot
to the macOS session being LOCKED (wallpaper screensaver): the window
server throttles the occluded 1440×900 landscape window's synchronous
readback past the 20-second three-probe readiness law while the small
portrait window still fits; review #5 independently confirmed the
failures began BEFORE the wave-4 build on unchanged landscape code
and endorsed the environmental diagnosis. Not a product defect; the
landscape proof requires an unlocked session, and the seal waited for
one.

**Package 02 systems reused (no parallel frameworks):**
StudioSelectionManager (extended: semantic candidates, proof seam),
SelectableEntity (extended: semantic kind), TycoonCameraController
(extended: input-observed guard), StudioCameraInput (beacon joins the
PointerOverUi chain)/StudioCameraDirector (unchanged laws), StudioHud
receipt (unchanged host), StudioFoundingCardHud (extended in place —
no second inspector), StudioFoundingGatePresentation/
StudioBridgePresentation (extended: pennant, marker/nameplate targets;
identity laws unchanged), portrait camera (reused for the review echo),
bridge opaque intents (unchanged single dispatch seam). NOT built
(deferred per charter §13 / Annex §7.5): target registry cycling/
controller navigation, Follow, generic alerts, zoom bands, bottom-sheet
reflow, Stage 7 migration, full comparison workspace, explicit decline/
replacement law (recorded design dependency).

**Known limits recorded:** below 884px height the tycoon pulse is
suppressed (the derived law; narrow-viewport surfaces remain open work)
and the compact dossier drops the second genre signal + header
strengths; below 788px height the fail-closed commit sheets lawfully
vanish rather than corrupt their commit geometry (no supported layout
stands there; a fallback message surface is open work); the
post-founding roster row reads lot PRESENCE, labeled as exactly that —
an employed-roster projection is deferred authority work; the gate/truck envelope quirk (a visible truck inside
the gate envelope resolves to the gate — pre-existing nearest-hit
behavior, unchanged); hover tint's MPB path remains shader-dead
repo-wide (marker disc is the working hover cue — CP9 recorded
follow-up); the memo's narrow-width jitter report stands unaddressed by
charter; the 1948 masthead law unchanged (no new era hardcodes; new
strings are era-neutral); WaitUntilTimed steps remain wall-clock and
transportDistressSeconds commit-window-scoped (CP9 instrument caveats).

**Ruling: KEEP** — review #8's independent ACCEPT (zero blockers)
with its one seal precondition satisfied by the green landscape run
recorded above.

**Next (STOPPED for Owner CP10A playtest + Codex Development/
Screenwriting package):** Development operable from the lot, Casting,
the Full Profile comparison workspace, target cycling/controller
navigation, Follow, cause-aware alerts, semantic zoom bands, Stage 7
inspector migration; review #8's recorded follow-ups (telemetry
frame-stamp, R7 source pins, a ~1440×870 witness layout, git-SHA
stamps in proof reports, portrait-model/name agreement); the Owner
should also know the transport's ~1Hz snapshot poll visibly disables
commit CTAs and grows the memo panel each cycle (predates CP10A —
review #6's inherited finding). Playable via committed `Tools/cp9-play.sh`
(unchanged, 1720×1045).
