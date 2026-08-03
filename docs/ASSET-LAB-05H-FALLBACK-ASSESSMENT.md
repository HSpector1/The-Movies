# Asset Lab 05H — Fallback & Accessibility Assessment (Final Owner Review, §10)

**This is an assessment, not an implementation.** No production fallback behavior was built. It documents the
recommended *contract* if live skinned-3D workers were ever integrated, informed by variants actually built and
captured in this review (05h / 05g / pre-rendered sprite / no-worker, plus a reduced-motion freeze) and by the
measured texture-disposal leak (`ASSET-LAB-05H-REAL-GPU-PERFORMANCE.md`).

**Load-bearing principle:** *important production state must never depend on a character being visible.*
Occupancy, production status, attention state, and navigation must be readable with **zero** characters drawn.

## Failure / degradation modes to contract for

| Mode | Trigger | Required behavior |
|---|---|---|
| GLB load failure | character/LOD GLB 404 or parse error | render the fallback worker (below); never block the scene or throw |
| Animation load failure | clip library missing | show the static neutral pose; scene stays usable |
| Poor WebGL performance | low FPS / integrated GPU / battery saver | drop to sprite or no-worker automatically; keep UI responsive |
| Reduced motion | `prefers-reduced-motion` | freeze worker animation to a static pose (built + captured: `management-camera/reduced-motion/`) |
| Disposal / reopening | mount → unmount → remount | dispose GPU resources on unmount (the leak proves this is not free) |
| Character unavailable | asset pipeline gap | no-worker vignette; activity implied by props (built + captured) |
| Assistive technology | screen reader / keyboard | semantic status independent of the canvas |

## Fallback options evaluated (built and captured in this review)

The management-camera value evidence already contains all four rungs at the fixed iso camera
(`proof/lab05h/final-owner-review/management-camera/value/`):

- **A. Static authored sprite** (`--sprite`) — a pre-rendered iso card. At the default management framing it
  is **nearly indistinguishable from live 3D** (see the management-camera assessment). Cheapest believable
  worker; no skeleton, no animation update, no disposal risk. Strong default fallback and, per Question B, a
  strong *primary* candidate at this camera.
- **B. Simplified procedural worker** — not built here; would be a low-poly capsule/billboard. Viable but the
  sprite already covers the need at lower effort.
- **C. No worker, activity via props** (`--none`) — the stage door glow, cart, light, and crates still read as
  "an active service area." Occupancy/activity survive with zero characters. This is the true floor and it
  works.
- **D. Semantic React status only** — DOM/ARIA occupancy and status, no 3D at all. Required for accessibility
  regardless of which visual rung is active.

## Recommended fallback ordering

`live-3D (LOD-appropriate) → static sprite → no-worker + props → semantic status`

with **semantic status (D) always present underneath**, never conditional on the visual layer. Each rung must
independently preserve: navigation, occupancy status, production status, attention state, and reduced-motion
usability.

## Accessibility

- Reduced-motion path is real and evidenced (freeze, not just slow). It must be honored, not optional.
- The canvas is decorative with respect to state: every fact a worker conveys (which stage is occupied, who
  needs attention) must also exist as text/ARIA the moment the canvas is absent, in fallback rung D.
- Color must not be the only signal (relevant independently of the current asset's *blue-skin* defect, which
  is a separate art bug, not an accessibility mechanism).

## Disposal is the real obligation

The performance pass measured ~84 undisposed textures per view round-trip in the review harness. Whatever
visual rung ships, integration **must** implement explicit GPU-resource disposal on unmount (geometries,
materials, textures, skeletons) and be re-tested for a flat resource count across mount/unmount cycles.
Fallbacks that avoid a skeleton entirely (sprite, no-worker) sidestep most of this risk, which is a further
point in their favor at the management camera.
