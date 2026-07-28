# Gate A — Technical & Product-Value Review (M1 gray-box)

Isolated 3D vertical slice, milestone M1 (gray-box). Evidence in `shots/`. This is
the mandatory gate after M1.

> **FINAL DISPOSITION: PASS — PROCEED TO M2.** All Gate-A corrections are closed.
> M2 (low-poly asset compatibility survey) is authorized to begin. M3 (coherent art
> pass) is NOT authorized.

## Owner verdict & Gate-A closure (2026-07-26)

> **OWNER VERDICT: GATE A = PASS WITH CORRECTIONS** (now closed → PASS).

- **Camera system = major success.** Called out explicitly as a proven product
  asset. **Preserved unchanged** through the routing corrections (no edits to
  `src/camera/`; `CAMERA_PRESETS` untouched — verified in the closure diff). It is
  NOT to be redesigned in M2.
- **Performance = ~120 fps** on the owner's real Chrome (hardware), recorded as the
  **gray-box baseline**. Final art must not consume that margin. (The headless
  harness reports ~10–11 fps on software WebGL / swiftshader — a worst-case floor,
  **not** a hardware verdict. See PERFORMANCE-BASELINE.md.)
- **3D product value = validated** — "vastly better than the original visual
  prototype."
- **Binding deficiency (carried into M2/M3):** the overview does **not yet clearly
  read as a movie studio** — it can still read as a fire station / military base.
  Overview recognition must eventually come from **world visuals**, not UI, labels,
  or music. See "Binding art-direction requirement" below.

## Independent verdict (M1 review, retained)

> **GATE-A VERDICT: PASS WITH CORRECTIONS**

Reviewer independent of the implementation (a fresh reviewer who did not build the
slice; full transcript folded in below). A failed gray-box would have been an
acceptable outcome — this is a genuine pass on the technical/product-value question,
gated on a small set of corrections.

## Gate-A questions → answers
1. **Camera transition provides value?** Yes — overview → production → human-scale
   gives real scale contrast the flat 2.5D lot can't (a person dwarfed between the
   soundstage and water tower, then eye-level with the crew). *(m1-overview / -production / -human-scale, seq-camera-*)*
2. **People read as inhabitants, not markers?** Yes, modestly — capsules with role
   props/hats + cast shadows read as people on a set. *(strengthened per correction 2)*
3. **Filming legible without text?** Yes — open doors + warm spill + lit red
   recording light + crew cluster + film camera. *(seq-vignette-05 = the take)*
4. **3D improves the fantasy pre-art?** Yes — the section reads as a studio and the
   take reads as a shoot even in gray-box.
5. **Architecture clean?** Yes — snapshot-in / intent-events-out; selection, camera
   presets, and the deterministic vignette all work. *(see ARCHITECTURE.md)*
6. **Performance acceptable?** Yes — **~120 fps** on the owner's real Chrome hardware
   (gray-box baseline; see correction 1 and PERFORMANCE-BASELINE.md).
7. **Teardown reliable / bounded?** Yes — destroy/recreate leaves exactly one
   canvas; one section + one vignette; no console errors.
8. **Justifies the art pass (M2/M3)?** Yes — once the corrections are closed.

## Verification (harness)
typecheck PASS · build PASS · all assertions PASS (ready intent; building
select + intent; character select + intent; return-to-overview intent; deterministic
vignette clock 12→12; destroy/recreate = 1 canvas; **no console/page errors**) plus
the routing checks: **vehicle route never enters a building**; **stage entry only
through the door while it is open**; **closed door blocks the approaching character**;
**ambient loops clear of all footprints**; **all authored routes footprint-clear**.
Determinism: `sampleVignette(t)` is pure; **no `Math.random`** in `src/`.

## Corrections
| # | Correction | Status |
|---|------------|--------|
| 1 | **Capture a real-GPU fps figure** — headless was software WebGL (swiftshader) ~11 fps, a worst-case floor, not a hardware verdict. | **CLOSED** — owner measured **~120 fps** on real Chrome hardware. Recorded as the gray-box baseline; final art must not consume the margin. |
| 2 | **More crew + a clear camera/boom silhouette at the take** (was reading via the red light more than people). | **DONE** — added a 3-capsule apron crew + a film-camera-on-tripod; re-captured (`m1-production.png`, `seq-vignette-05.png`). |
| 3 | **Stage interior should read as a room, not a void.** | **DONE** — lifted the door material + faint warm emissive so the doorway reads as a dim interior. |
| 4 | **Vehicle routing** — a production truck was observed driving through a building. | **DONE** — the van now runs a single authored service corridor at x=8.5, entirely in front of the stage footprint (x∈[12,28]). A deterministic footprint check (`validateRoutes` / `tools/capture.mjs`) asserts the vehicle route never enters any building. No general traffic sim. Evidence: `shots/route-01-van-enroute-clear.png`. |
| 5 | **Character routing** — characters were observed passing through closed doors / walls. | **DONE** — characters stay in front of the doors (x<12) and enter the stage **only** at the doorway (x=12) and **only** while the door is visibly open (`doorOpen(t)`, t∈[8.5,17)). A closed door is a solid leaf that blocks entry; an "approacher" actor demonstrates waiting at the shut door and rerouting rather than passing through. Ambient loops that previously clipped the stage footprint were rerouted (crew2 → far service edge x=30; grip → apron approach x=6) and are asserted footprint-clear. No pathfinding/AI — authored route graphs + doorway waypoints only. Evidence: `shots/route-02-entry-door-open.png` (enters through the OPEN door), `shots/route-03-blocked-door-closed.png` (stopped at the CLOSED door). |

Correction 4/5 closure also verified: **camera unchanged** (no `src/camera/` edits;
`CAMERA_PRESETS` unchanged in the diff) and **vignette still deterministic** (harness
`sampleVignette(12)⇒12` assertion still passes; sampler is pure, no `Math.random`).

## Binding art-direction requirement (carried into M2/M3)
The overview must eventually read as a **movie studio within seconds, from the world
itself** — not from UI, labels, or music. The recognition cues to build toward
(over M2/M3, not now): a studio gate, **numbered** soundstages, production trucks,
trailers, loading aprons, cameras/lighting rigs/boom, equipment cases, crew clusters,
backlot façades and scenery flats, a marquee/banners, the water tower with signage,
an active stage-door light, and distinct executive / creative / production districts.
This is a **binding** requirement, recorded here so M2 asset selection is judged in
part on whether the chosen family can deliver these cues. It does **not** authorize
M3; it constrains it.

## Disposition
- **All five corrections are closed.** Hardware fps (120) is recorded; the two
  routing corrections are implemented deterministically, asserted by the harness, and
  evidenced by capture.
- The camera system (an owner-designated success) was preserved unchanged.
- **FINAL: PASS — PROCEED TO M2 (low-poly asset compatibility survey).** M2 is a
  bounded survey/compatibility test; it must stop at Gate B (evidence + independent
  review). **M3 (the coherent art pass) is NOT authorized** and must not begin without
  explicit owner approval.

## Independent reviewer transcript (verbatim summary)
Verdict: PASS WITH CORRECTIONS. Strengths: three-tier camera scale contrast;
capsule-with-hardhat + shadow reads as a person on set; the "take" frame is legibly
different (open doorway, warm spill, red light, figure in threshold); clean
snapshot-in/intent-out architecture; one-canvas teardown; bounded scope. Weaknesses:
crew/gear density thin (filming sold by lighting more than staffing); performance
unmeasured on real hardware; stage interior near-black risks reading as unfinished;
only one character visible in several frames. Prioritized corrections: (1) capture a
real-GPU fps figure; (2) add 2–3 crew + a clearer camera/boom; (3) faint interior
fill. Net: 3D plausibly delivers camera reward, human scale, and legible filmmaking
beyond 2.5D — justifies M2/M3 once the fps number and crew-density gap are closed.
