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
