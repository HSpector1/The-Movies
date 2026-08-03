# Asset Lab 05H — Real-GPU Performance (Final Owner Review, §9)

**Scope.** Renderer *cost* of live skinned-3D characters, measured on the owner's actual acceptance
hardware. This answers the **cost side of Question B** (does live 3D justify its runtime cost at the
management camera). It says nothing about whether the 05H character *looks* acceptable — that is Question A,
covered in `ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`.

**Prior state corrected.** Every earlier 05H figure was SwiftShader software raster, explicitly diagnostic
only; no real-GPU FPS or memory number existed. This is the first real-GPU measurement.

## Environment (real hardware, real GPU — verified, not forced)

| | |
|---|---|
| Machine | MacBook Pro (Mac15,9) — **Apple M3 Max**, 16 cores (12P/4E), 128 GB |
| OS / GPU API | macOS 26.5.1 / Metal 4 |
| Browser | Chrome 150.0.7871.187 |
| Launch mode | headless-new (GPU-accelerated; **no** SwiftShader flags) |
| **WebGL renderer (readback)** | **`ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Max)`** |
| `isSoftwareRenderer` | **false** — confirmed real Metal, not software |

This is the same machine the 05H docs name as "the owner's Apple M3" acceptance hardware. Numbers are
**Builder-measured via browser automation** (not a hand-run owner session), captured console-error-free.

Raw data: `proof/lab05h/final-owner-review/performance/realgpu-performance.json`.

## Frame cost by scenario (real M3 Max)

| Scenario | FPS (min/median/steady) | draw calls | triangles/frame | geometries | textures |
|---|---|---|---|---|---|
| 1 worker (LOD0, idle) | 120 / 120 / 120 | 32 | 49,162 | 172 | 79 |
| 2 workers (LOD0) | 120 / 120 / 120 | 51 | 98,178 | 170 | 89 |
| 4 workers (LOD0) | 120 / 120 / 120 | 100 | 196,312 | 176 | 109 |
| LOD trio (L0+L1+L2) | 120 / 120 / 120 | 65 | 80,886 | 185 | 143 |
| 2 heroes animated (Walk/Talk/Kneel/Pickup/Sit) | 120 / 120 / 120 | 41 | 70,880 | 194 | 164 |

**Reading.** FPS is pinned at the 120 Hz ProMotion display cap in every scenario — the renderer is nowhere
near the bottleneck. Four fully-skinned LOD0 workers (~196k tris, 100 draw calls) still render at the display
cap. On the M3 Max, **the raw GPU cost of live skinned 3D at these counts is negligible.** Draw calls scale
roughly linearly with character count (each worker ≈ 17 extra calls); triangles scale with LOD0's 24,509 each.

*Caveat:* the display cap means these numbers prove "comfortably above 120 FPS," not a headroom ceiling.
A far denser lot (dozens of workers) was not measured; extrapolation from the draw-call slope, not tested here.

## Memory and disposal

- **JS heap** stayed flat (~76.3 → 77.6 MB) across all render scenarios. *Heap is JavaScript heap, not GPU
  VRAM.*
- **Mount/unmount disposal — a real leak.** Cycling six times between a review view and the production
  overview, three.js **texture count climbs monotonically and never returns to baseline**:

  | cycle | 1 | 2 | 3 | 4 | 5 | 6 |
  |---|---|---|---|---|---|---|
  | textures after unmount | 311 | 395 | 479 | 563 | 647 | 731 |

  ≈ **+84 textures per round-trip**, with geometries creeping +1/cycle and heap flat. The signature (textures
  leak, heap does not) points at **per-mount `CanvasTexture` labels and cloned materials that are never
  disposed on unmount** in the review presentation — not the shipped GLB textures (those are URL-cached and
  shared). It is a **harness/presentation defect**, but it is the concrete proof behind the §10 requirement:
  *any real integration must dispose GPU resources on unmount.* Left unfixed in a long session it would grow
  GPU texture memory without bound.

## Owner-required / unavailable measurements (honestly labeled)

- **GPU VRAM in bytes** is not observable from JavaScript. **Owner step:** Chrome ⋮ → More Tools → Task
  Manager → right-click the header → enable **GPU Memory**; compare a management view against Full Scene
  Overview. (Automation cannot read this column.)
- **Per-frame GPU time / shader-compile stalls** need chrome://tracing or the DevTools Performance panel
  (owner-run). Not captured here.

## Bottom line for Question B (cost side)

On the target M3 Max the **rendering cost of live skinned 3D is not a limiting factor** at realistic
management-scene worker counts. The cost that *is* real and must be designed for is **lifecycle**: the
measured texture-disposal leak shows that mounting/unmounting characters without a strict disposal contract
grows GPU memory. Cost therefore does not by itself argue against live 3D; it argues that live 3D is only
safe with disposal discipline (see `ASSET-LAB-05H-FALLBACK-ASSESSMENT.md`). The value question — whether that
(cheap-to-render) live 3D is *visibly worth it* over a pre-rendered sprite at the management camera — is
answered in `ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md`.
