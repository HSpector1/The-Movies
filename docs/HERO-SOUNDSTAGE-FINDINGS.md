# Hero Soundstage Findings (Asset Lab 03)

**Product question:** can the existing offline/deterministic techniques — bespoke greybox geometry,
procedural canvas materials, the warm golden-hour rig, CC0 crew — plus a small set of modern
render levers take **one** soundstage from "successful greybox" to a **convincing production-fidelity
hero** *without* leaving the isolation rules (no new asset libraries, no `Math.random`, no game
integration, one building only)?

**Finding: yes.** Scene E reads as a hero soundstage, is clearly a different fidelity class from the
Scene D greybox of the *same* Stage 1, and stays fully within the lab's constraints. And it confirms
a specific, reusable result: **greybox → hero is three levers stacked, in this order of impact.**

## What moved the needle (greybox → hero), ranked

1. **Silhouette articulation built into the geometry, not the texture.** The single biggest read
   change is form: a **parapet + cornice** that squares off the roofline with the **barrel roof
   rising behind it**, a **recessed biparting elephant door** (a dark hole in a thick wall) with a
   **man-door**, a **ridge ventilator monitor** breaking the barrel arc, and a **loading dock**.
   Proven by `12-wireframe.png`: with every material stripped, the pure wireframe already reads as
   a hero stage, not a box with a curved lid. A re-skinned box would not.
2. **Procedural PBR surface — normal + roughness maps.** Deterministic canvas-generated
   **corrugated-metal ribs** (walls, doors, roof) plus **weathered concrete** turn flat-shaded
   panels into clad metal and board-formed slab. This is the close-range fidelity (`05-surface-pbr.png`)
   and it costs zero new triangles and zero external assets.
3. **ACES filmic tone mapping.** The one renderer setting Lab 02 left on the table. It compresses the
   warm golden-hour highlights so the corrugated wall and cornice roll off filmically instead of
   clipping, and it is the cheapest, most reliable "looks 2026" shift. Scene-E-scoped (mount/unmount)
   so Scene D's baseline is untouched.

Then, supporting those three:

4. **Baked contact-shadow grounding** (`ContactShadows`, one-frame bake) so props and the building
   base sit in a soft occlusion pool instead of floating — the reliable, software-safe grounding win.
5. **An inhabited, active apron.** Grip/electric dressing (lights into the doors, C-stands, a
   generator → distro → cable run, carts, apple boxes, video village, a dolly track) plus a ground
   story (fire-lane, hazard hatch, tape marks, chalk, stains) and six CC0 crew answer "is this a
   working stage?" — the second half of the assignment, and what turns a building into a set.
6. **envMapIntensity tuning** on the existing procedural RoomEnvironment IBL so the metal reads as
   metal without going chrome.

## Evidence it is fidelity, not just more stuff

- **The greybox budget is tiny — the fidelity is technique, not vertex count.** Measured after the
  refinement loop (`performance-lab03.json`, software-diagnostic samples): the **bespoke hero
  building alone is ~2,960 triangles**; **building + the full apron + lot-edge context is ~9,200**;
  adding the **6 CC0 crew brings the scene to ~92,000** — the crew remain the only heavy element
  (same finding as Lab 02). A ~3k-triangle primitive building reading as a hero soundstage is the
  whole point: the read comes from procedural PBR + tone mapping + grounding + silhouette
  articulation, not from geometry. (Draw calls are higher — a fence line and a caged ladder add many
  small repeated meshes — but remain a diagnostic-only, software-render figure.) A four-iteration
  refinement then improved architecture, signage, ground, crew, and composition; see
  `ASSET-LAB-03-REFINEMENT-LOOP.md`.
- **The `Production apron` and `Crew` toggles** peel the set back to the bare hero building
  (`10-building-only.png`), and the **Shadows** / **wireframe** toggles isolate lighting and
  silhouette — the same "presentation vs polygons" instrumentation Lab 02 used, now aimed at one
  building.
- **Direct greybox ⇄ hero comparison**: `14-greybox-D.png` (Scene D, untouched Lab 02 Stage 1)
  against `13-hero-E.png` / `01-hero.png` (Scene E) — same identity, same warm rig, different
  fidelity class.

## Confirmed reusable levers for the real product

- **Procedural normal/roughness maps from a canvas** are a cheap, offline, deterministic way to get
  clad-metal and weathered-concrete fidelity with no asset library and no extra geometry. Reusable.
- **ACES tone mapping + baked contact shadows + envMap tuning** are a zero-dependency "look
  baseline" upgrade that would lift *any* scene, not just this one.
- **The Lab 02 warm golden-hour rig carried over unchanged** — the fidelity rides on top of it; the
  warmth was already right.
- **Silhouette-first articulation** (parapet/monitor/dock/recessed-door) is the geometry vocabulary
  that separates hero architecture from greybox massing, and it is the part that must be *bespoke*.

## Honest weaknesses (still a target, not shippable art)

- It is still **stylized realism**, not photoreal: the crew are the CC0 mannequin (tinted), the
  procedural textures are readable rather than photographic, and the doors stay **closed** (a set
  interior is a Project-Studio non-goal and out of scope here).
- The **procedural weathering is authored, not art-directed by a texture artist** — good enough to
  prove the target, not a final material library.
- The **Post FX pass (N8AO + bloom + vignette)** is a **real-GPU enhancement**. The deterministic
  headless proof is captured with it **off**, because multi-pass post is slow/fragile under the
  SwiftShader software renderer used for capture. See `10-performance-panel` and the note below.
- This is a **single hero building**, deliberately. It is a **visual target and a set of reusable
  techniques**, not a decision to adopt a look. Adoption is a separate art-direction call
  (see `ASSET-LAB-03-INTEGRATION-RECOMMENDATION.md`).

## Note on rendering honesty

All `proof/lab03/` images are headless **SwiftShader software** renders (see
`performance-lab03.json`), which look darker and slower than a real GPU. The deterministic shots use
only the zero-dependency, software-safe core look (ACES + procedural PBR + baked contact shadows).
The optional PCSS soft-shadow and Post FX layers are captured separately as evidence and are
intended for the owner's **real-GPU** review, where bloom on the emissive practicals and N8AO
contact occlusion add the final polish. No performance number here is a target-hardware claim. One
known capture-only artifact: the corrugated cladding shows faint moiré at grazing angles under the
software renderer (no MSAA in headless capture despite anisotropic filtering on the maps); it is a
capture-time artifact, not a material bug, and resolves on real-GPU hardware.
