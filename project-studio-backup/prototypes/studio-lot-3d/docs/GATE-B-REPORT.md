# Gate B — Low-Poly Asset Compatibility Review (M2)

Mandatory gate after M2 (the bounded low-poly asset **compatibility survey**, not the
M3 art pass). Full findings in `LOW-POLY-ASSET-SURVEY.md`; per-asset licences in
`PROVENANCE.md`; evidence in `shots-m2/`.

> **FINAL DISPOSITION: GATE B: PASS — AUTHORIZE M3 WITH CONDITIONS.** The hardware
> performance condition is met (owner-measured **~120 fps**, below). The Kenney CC0
> family is a viable, coherent, permissive, performant, restyleable **supporting**
> foundation. M2 is complete. **M3 (coherent art pass) is AUTHORIZED, with
> conditions** (below). No blocking issues.

## Hardware performance — CLOSED (owner-measured 2026-07-26)

The remaining Gate-B correction (a real-GPU fps figure) is now satisfied.

| Scenario | FPS (normal Chrome, owner's Mac) |
|---|---|
| Idle (lineup) | ~120 |
| Animated crew (walk) | ~120 |
| Orbit / zoom | ~120 |
| Studio overview probe (heaviest) | ~120 |
| Lowest sustained | ~120 |

Observed: **no** visible stutter, **no** camera hitching, **no** animation
instability, **no** delayed asset/texture pop-in, **no** browser instability;
character motion good. **Classification: PASS** (≥60 avg, no sustained <50).
Environment: normal Google Chrome, hardware WebGL, owner's Mac (viewport/DPR: the
survey page renders at the window size with `dpr=[1,2]`). Supersedes the headless
software floor (7–13 fps) for any verdict; see `PERFORMANCE-BASELINE.md`.

## Owner condition carried into M3 — character scale

The owner found (on real hardware) that the imported Kenney crew reads **dramatically
oversized** vs vehicles/buildings/doorways — the humanoid's debug height (~2.7 m) far
exceeds the Meridian **1.8 m** adult unit. (M2 under-called this as a pure `Box3`
skinned-mesh artifact; on real hardware the rendered figure is genuinely too tall.)
**M3's first implementation task is scale normalization + a documented scene-scale
standard**: normalize the adult root (~0.67 → ~1.8 m), validate against a scale-
reference lineup (adult / doorway / van / car / trailer / equipment case / soundstage
door), preserve animation + ground contact, and revalidate footsteps, route
waypoints, selection bounds, shadows, carried props, and doorway entry. **Do not**
enlarge buildings to compensate. Treat the Kenney characters as **supporting/background
crew** unless the M3 review proves them sufficient for human-scale hero views.

## Independent review (2026-07-26)

Reviewed by an independent, adversarial panel (three lenses + a synthesizer) that did
**not** build the slice and verified each load-bearing claim against the actual
evidence with their own tools — not the survey's word for it.

| Lens | Verdict | Method highlights |
|---|---|---|
| Art direction & recognition | PASS WITH CORRECTIONS | judged all 9 M2 shots + M1 overview by eye; read the restyle code |
| Licensing & provenance | PASS | read all 5 `License.txt`; `strings`-scanned all 7 GLBs for prohibited-source markers (zero hits); confirmed `dist/` is a byte-identical mirror |
| Technical / isolation / perf-honesty | PASS | re-ran `git status --porcelain` on both protected repos; parsed the character GLB (27 native clips, no Mixamo); confirmed no `Math.random`; typecheck clean |
| **Synthesis** | **PASS WITH CORRECTIONS** | **no blockers across any lens** |

### Criterion results
| Criterion | Result | Note |
|---|---|---|
| Coherent single family (not a collage) | **pass** | one faceted low-poly language; all 7 assets Kenney kits; shared colormap per kit |
| Meridian restyle works | **partial** | real per-hue remap, but a *warm palette shift* — concept's cream-stucco/brass-Deco anchors only partly surfaced (M3 to prove) |
| Characters read as people | **pass** | unmistakable person + wardrobe; large jump from the M1 capsule |
| Animation / rig | **pass** | 27 native clips (idle/walk/gesture/carry/react verified); no retarget needed |
| Studio recognition improved | **partial** | warmer/populated/lived-in, **but not a stronger *studio* silhouette than M1** — identity needs bespoke landmarks (the survey's own, correct, conclusion) |
| Licensing / CC0 | **pass** | all CC0, commercial-safe, attribution not required |
| Provenance complete | **pass** | all 16 files documented; no orphan/rejected downloads; no concept renders shipped as runtime assets |
| Protected-repo isolation | **pass** | both repos clean at pinned HEADs; zero edits to M1 core; no cross-imports |
| Camera / determinism preserved | **pass** | no `Math.random`; proven camera/M1 vignette untouched; typecheck clean |
| Performance honesty | **pass** | headless 7–13 fps labeled a *software floor*; ~120 fps hardware baseline preserved; M2 real-GPU figure explicitly **owed** |
| Browser payload | **pass** | 756 KB (`du`) / ~716 KB content — tiny either way |

## Corrections

**Applied in this commit (doc/wording — non-blocking):**
1. Restyle claim softened from "accepts the Meridian direction cleanly" to a *coherent
   warm palette shift*; noted the concept anchors are an M3 target (survey §5, Q1, Q5).
2. Gate-B record + survey §6 now state plainly that the M2 probe is **not** a stronger
   *studio* silhouette than M1, and that authoring the bespoke landmarks is the primary
   M3 cost driver.
3. This `GATE-B-REPORT.md` created from the independent verdict.
4. 756 KB payload footnoted as a `du` (allocated-blocks) figure vs ~716 KB content.

**Owed before / carried into M3 (conditions on the AUTHORIZE):**
- **M2 real-GPU fps — CLOSED.** Owner measured **~120 fps** on real Chrome (table
  above). PASS.
- **Character scale — M3 first task.** Normalize the oversized crew (~2.7 m → ~1.8 m,
  root ≈0.67) with a documented scene-scale standard + reference lineup; see the
  "Owner condition" section above.
- M3 must **prove the specific Meridian anchors** (cream stucco, terracotta, buff,
  taupe/brass Deco, signature red, sage), not merely golden-hour warmth.
- M3 must **author the bespoke identity landmarks** (soundstage, gate, water tower,
  signage, crest, admin, theatre, hero street) — the generic family cannot supply
  these; this is the main M3 workload (survey §8).
- Re-scope or replace the **`building` asset** (undersized modular fragment; the
  weakest sample for its intended role).
- Validate assets **inside the M1 slice** (deterministic vignette + proven camera) —
  M2 tested them only in a standalone survey scene.

## What M2 delivered
- One coherent CC0 family selected + a 7-asset controlled sample imported (survey §1–2).
- A deterministic restyle (single-texture Meridian recolour) + a studio-recognition
  probe, both added **without touching** the M1 slice, camera, vignette, or renderer.
- First-hand evidence (`shots-m2/`, 14 stills) + all harness assertions passing.
- Survey, provenance, and this Gate-B report.

## Evidence index (`shots-m2/`)
- `m2-01-lineup-original.png` / `m2-02-lineup-meridian.png` — restyle A/B (whole family)
- `m2-03-close-building-meridian.png` / `-04-close-vehicle-` / `-05-close-crew-` — close-ups
- `m2-anim-walk-01..05.png` + `m2-06-crew-gesture.png` — rig / animation
- `m2-07-studio-overview-original.png` / `-08-studio-overview-meridian.png` — recognition A/B (overview)
- `m2-09-studio-ground-meridian.png` — recognition (ground level)
- compare vs `../shots/m1-overview.png` (the gray-box baseline)

## Disposition
- **PASS WITH CORRECTIONS.** Corrections 1–4 applied here; the remaining items are M3
  conditions. No blocking issues; both protected repos verified untouched.
- **M3 is NOT authorized.** It is *recommended* (AUTHORIZE WITH CONDITIONS) but must
  not begin without the repo owner's explicit authorization. This survey stops here.
