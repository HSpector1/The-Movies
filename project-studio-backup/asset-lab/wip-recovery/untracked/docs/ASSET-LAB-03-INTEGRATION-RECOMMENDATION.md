# Asset Lab 03 — Integration Recommendation

**This document recommends; it integrates nothing.** No Scene-E code, material, geometry, or asset
has been merged, copied, or referenced into the main game, either spike, or any contract. Acting on
anything below is a separate, owner-authorized decision. Gate D and OC-01 remain closed.

The headline finding: **greybox → hero, for a single facility, is three stacked levers —
silhouette articulation (bespoke geometry), procedural PBR surface, and ACES tone mapping — on top
of the already-correct Lab 02 warm rig.** None of them is an asset library, and none breaks the
offline/deterministic rules. That is good news: the fidelity is reproducible technique, not
purchased content.

## 1. Reusable render-look upgrades (durable, low-risk, zero new *asset* deps)

- **ACES filmic tone mapping** applied per-look (mount/unmount so baselines stay comparable) — the
  single biggest "modern" lift and a one-line renderer change. General to any scene.
- **Procedural normal + roughness maps generated from an HTML canvas** (`heroMaterials.ts`):
  corrugated-metal ribs and weathered concrete with a seeded PRNG. Offline, deterministic, zero
  external assets, zero extra geometry. A genuinely reusable material technique.
- **Baked contact-shadow grounding** (`ContactShadows`, one-frame bake) and **envMapIntensity
  tuning** on the existing procedural IBL — cheap, software-safe grounding and metal response.
- **The Lab 02 warm golden-hour rig was reused unchanged** — confirming it is a stable look baseline.

## 2. Reusable geometry vocabulary (bespoke, throwaway meshes — NOT production art)

- The hero `HeroSoundstage` massing — recessed elephant doors + man-door, parapet + cornice, ridge
  monitor, rooftop HVAC, loading dock, conduit/downspouts, red-eye — is the **silhouette language**
  that reads as a hero stage. Its **value is the vocabulary and proportions, not the meshes.** Real
  production would rebuild this as authored architecture; the lesson is *which features to include*.
- The `ProductionApron` grip/electric kit (film lights, C-stands, distro + cable runs, carts, apple
  boxes, video village, dolly track, safety items) is the **set-dressing checklist** that makes a
  building read as a working set. Again: the *list and placement logic* are the reusable part.

## 3. One dependency was added (reversible)

`@react-three/postprocessing` + `postprocessing`, pinned to the versions compatible with the frozen
r3f8 / three r0.161 stack, drive an **optional, default-off** Post FX pass (N8AO + bloom + vignette
+ SMAA). It is a **real-GPU enhancement** and is not required for the core hero look, which is fully
zero-dependency and software-safe. If the main game does not want the dependency, the entire hero
result minus bloom/AO stands on the zero-dep path. Adoption of the dep is a separate call.

## 4. What still requires bespoke production art (not attempted here)

Final authored architecture and materials, a real material/texture library, hero characters and
facial animation, interiors and a set system, opened-door reveals, and a shippable skybox. All are
Project-Studio section-11 non-goals and remain future bespoke-art work.

## 5. Must NOT enter the main game yet

Everything in this lab. Specifically: no Scene-E geometry, no hero materials/shaders, no
`HeroFx`/postprocessing wiring, no `window.__lab`/viewer code, and no CC0 asset path may cross into
`The Movies` or either spike. Any presentation adoption remains gated on Gate D's entry conditions
(owner-named clean Phase-5.2 base, sim track paused, lot promoted with its own contract) and an
explicit owner decision. This milestone produces a **hero visual target and a set of reusable
techniques**, nothing more.

## Recommended next step

If the owner passes the look, the highest-value next probe is **one of**:
1. A **second facility** (office or backlot) taken to the same fidelity, to prove the vocabulary
   generalizes and to build the reusable procedural-material set — still isolated, still pre-Gate-D.
2. The **interior question**: whether a soundstage *interior* (the actual set-build space) is worth a
   fidelity probe. **This is a Project-Studio non-goal today** — it should be raised as a **finding
   for an owner decision**, not built speculatively.

If the owner does not pass: capture the specific "still generic/dated/wrong" notes against
`proof/lab03/` and iterate the hero soundstage only.
