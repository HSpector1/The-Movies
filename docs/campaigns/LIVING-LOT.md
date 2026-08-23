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
