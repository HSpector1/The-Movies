# Low-Poly Asset Compatibility Survey (M2)

Milestone M2 of the isolated Meridian 3D vertical slice. This is a **bounded
compatibility survey**, not the coherent art pass (M3). It answers one question:

> Can a single, permissively-licensed low-poly asset family make the scene read as a
> recognizable movie studio, accept the Meridian art direction, carry readable
> characters and production activity, and stay performant and legal — well enough to
> justify an M3 coherent art pass?

Evidence in `shots-m2/`. Harness: `m2.html` → `src/m2/` (separate page from the M1
slice; owns no simulation truth; imports nothing from the M1 app). Capture +
assertions: `tools/capture-m2.mjs`. Every imported asset is recorded in
`PROVENANCE.md`. Independent Gate-B verdict in `GATE-B-REPORT.md`.

---

## 1. Selected family

**Kenney low-poly kits (all Creative Commons CC0).** One coherent family: every kit
shares the same faceted low-poly language, comparable texture density, and (per kit) a
single small palette texture (`colormap.png`) that all meshes sample. That shared
palette is the lever that makes a whole-kit Meridian recolour a single-texture
operation (see §5).

Chosen over the alternatives because it is the only option that satisfies **all four**
hard constraints at once: permissive licence (CC0), coherent single family (no
collage — §12 of the brief), immediately usable GLB (no conversion), and no spend.

### Candidate comparison matrix

| Candidate | Licence | Coherent family? | Rigged/animated chars? | Format | Cost | Verdict |
|---|---|---|---|---|---|---|
| **Kenney kits** | **CC0** | **Yes — one visual language across all kits** | **Yes (Blocky Characters, 27 clips)** | **GLB, ready** | **Free** | **SELECTED** |
| Quaternius (Ultimate/Modular + anim packs) | CC0 | Yes (own family) | Yes | GLB/FBX | Free | **Deferred** — viable free alternative/secondary; not needed once Kenney covered every required type. Re-evaluate in M3 if a specific gap appears. |
| Synty POLYGON (Town/City/Movie Set) | Paid (Unity/Unreal store) | Yes (strong) | Yes (with anim packs) | FBX/Unity | **Paid** | **Rejected for M2** (no-spend rule §11). Documented as a paid recommendation (§10) — the strongest *studio-specific* option if a budget is later approved. |
| Mixamo (characters + animation) | Free, account-gated | Characters only | Yes (huge library) | FBX/GLB | Free | **Not needed** — the Kenney rig already ships the required clips. Retained as a fallback for richer/period-specific motion in M3. |
| Individual Sketchfab / Poly Haven CC0 models | CC0 (per-asset) | **No — mixing sources = collage** | Varies | Varies | Free | **Rejected** — fails the single-family requirement (§12); coherence risk outweighs any single better model. |

---

## 2. Assets imported (controlled sample — one per required type)

Seven assets from five Kenney packs — the smallest set that covers the brief's
required types (§13). Served from `public/m2-assets/`. Native dimensions are the
measured world-axis bounding box (x×y×z, metres) read live by the harness.

| Key | Type | Pack (version) | File | Native x×y×z (m) | Scale note |
|---|---|---|---|---|---|
| building | office/bungalow | City Kit (Commercial) 2.1 | `city/building-a.glb` | 0.88 × 1.29 × 0.94 | **Modular fragment — undersized.** Scale ≈ ×3 for a bungalow; assemble modules for larger. |
| hangar | industrial structure | Factory Kit 3.0 | `factory/structure-tall.glb` | 0.30 × 2.00 × 1.10 | Thin vertical element; a component, not a whole hangar. Scale/assemble. |
| vehicle | production truck | Car Kit 3.1 | `car-kit/delivery.glb` | 1.50 × 1.65 × 3.25 | **Usable at native scale** — reads as a panel/delivery truck. |
| car | car / cart | Car Kit 3.1 | `car-kit/sedan.glb` | 1.50 × 1.30 × 2.55 | **Usable at native scale.** |
| vegetation | planting | Nature Kit 2.1 | `nature/tree_default.glb` | 0.76 × 1.71 × 0.65 | Small sapling; scale ≈ ×1.5 for a mature tree. Cluster for a hedge/grove. |
| prop | equipment case / crate | Factory Kit 3.0 | `factory/box-large.glb` | 1.10 × 0.55 × 1.00 | **Usable at native scale** as an equipment case; also used scaled as a placeholder mass. |
| humanoid | rigged crew | Blocky Characters 2.0 | `character/character-a.glb` | 1.60 × **2.72** × 0.94 | Rigged, 27 clips. **The 2.72 m height is a `Box3` skinned-mesh artifact** (rest-pose bounds), not the rendered height — visually ~1.7 m against the 1.8 m reference. Usable at native scale. |

Total on-disk asset payload: **756 KB** (`du` allocated blocks; ~716 KB summed content
bytes across 7 GLB, 7.5–240 KB each, + 4 shared PNG colormaps 11–20 KB each). Either
way, tiny.

---

## 3. Licences & provenance

**Every pack is Creative Commons CC0** — confirmed twice: the bundled `License.txt`
in each `public/m2-assets/<pack>/` folder, and the live kenney.nl pack page
(fetched **2026-07-26**). CC0 permits personal, educational, and **commercial** use
with no attribution requirement (attribution to Kenney is given anyway, in
`PROVENANCE.md`, as good practice).

| Pack | Source URL (accessed 2026-07-26) | Licence | Bundled `License.txt` version |
|---|---|---|---|
| Car Kit | https://kenney.nl/assets/car-kit | CC0 | 3.1 |
| Blocky Characters | https://kenney.nl/assets/blocky-characters | CC0 | 2.0 |
| City Kit (Commercial) | https://kenney.nl/assets/city-kit-commercial | CC0 | 2.1 |
| Factory Kit | https://kenney.nl/assets/factory-kit | CC0 | 3.0 |
| Nature Kit | https://kenney.nl/assets/nature-kit | CC0 | 2.1 |

No GPL/AGPL, no ripped/decompiled content, no assets from *The Movies* / Zoo Tycoon /
RollerCoaster Tycoon, no AI-generated 3D. See `ASSET-POLICY.md`. Full per-asset rows
(files, attribution, restyle, commercial-use flag) in `PROVENANCE.md`.

---

## 4. Format, conversion & technical compatibility

- **Format / conversion:** Kenney ships **glTF binary (`.glb`)** directly. **No
  conversion step was required.** Loaded with `@react-three/drei` `useGLTF`
  (three.js `GLTFLoader`). Verified real glTF (`magic=glTF`) on every file.
- **Geometry / draw calls:** low triangle counts, one (or few) mesh(es) per asset;
  each kit's meshes share one small `colormap.png`, so a whole kit is a handful of
  materials/draw calls. No high-poly imports.
- **Pivots / origins:** assets are authored with base-at-origin — they sit on the
  ground correctly with no manual pivot correction. (The character root is at feet.)
- **Materials:** `MeshStandardMaterial` + a colormap texture. Cloned per instance and
  either retextured (mapped assets) or tinted (map-less) by the restyle;
  `roughness`/`metalness` normalised for the golden-hour lighting.
- **Skeletal animation:** the character GLB carries a rig + **27 clips**
  (`idle, walk, sprint, sit, drive, die, pick-up, emote-yes, emote-no, holding-right,
  holding-left, holding-both, …`). Played with drei `useAnimations`; multiple crew
  instances via `SkeletonUtils.clone`. **No Mixamo retargeting was needed** — the
  clips are native to the pack.
- **Scale consistency:** vehicles, character, props, and vegetation import at a
  usable human scale (relative to the 1.8 m reference). The **City/Factory
  architecture pieces are modular and sub-building-sized** — they need scaling
  (~×3) and/or assembly to become bungalows/hangars. This is the one consistent
  scale caveat.
- **Teardown / lifecycle:** the survey page mounts/unmounts cleanly under React
  StrictMode's double-invoke; the capture asserts **no console/page errors**.
- **Bundle payload (production build):** M2 page JS = `m2` chunk **218 KB (74 KB
  gzip)** + the shared three.js/R3F chunk **953 KB (265 KB gzip)**. The three.js
  runtime dominates; the **asset payload itself is tiny (756 KB)**. In any real
  integration the renderer would be lazy-loaded.

---

## 5. Customization test — restyle toward Meridian

The core "can this family adopt our art direction?" test. `src/m2/restyle.ts`
implements `meridianizeImage()`: an HSL remap of a kit's shared `colormap.png` toward
the Meridian anchors — **cream stucco, terracotta, buff industrial, taupe/brass Deco,
signature deep red, sage landscaping** — while **preserving each source texel's
lightness** so the low-poly shading survives. Because every mesh in a kit samples that
one texture, remapping it **recolours the whole kit in one pass.** Map-less /
vertex-coloured assets are tinted per type toward the same anchors (`MERIDIAN_TINT`).
A slight warm lightness bias nudges everything toward golden hour.

**Result: the family accepts a coherent *warm palette shift* toward Meridian.** The
remap is a genuine per-hue operation (not a uniform tint — different source hues go to
different anchors), but it currently lands in a warm sepia / golden-hour band: the
concept's specific **cream-stucco** and **taupe/brass Deco** anchors are only
*partially* surfaced. Proving those exact anchors (not just golden-hour warmth) is an
**M3** task, not an M2 claim. What M2 establishes is that the single shared colormap
makes a whole-kit recolour a one-pass operation and that the family takes direction
without fighting it. Side-by-side evidence:

- `m2-01-lineup-original.png` ↔ `m2-02-lineup-meridian.png` — the whole lineup shifts
  from the stock Kenney palette (blues, greens, stock reds) to cream / terracotta /
  buff / sage under the same camera and light.
- `m2-07-studio-overview-original.png` ↔ `m2-08-studio-overview-meridian.png` — the
  composed corner warms cohesively.
- Close-ups: `m2-03-close-building-meridian.png` (cream/buff building),
  `m2-04-close-vehicle-meridian.png` (deep-red truck), `m2-05-close-crew-meridian.png`
  (restyled crew).

The selected family does **not** remain visibly unmodified — the restyle is obvious
and coherent across environment, vehicles, props, vegetation, and wardrobe.

---

## 6. Studio-recognition probe (the owner's binding Gate-A concern)

Gate A recorded a **binding** requirement: the world must eventually read as a *movie
studio* from the visuals alone, not from UI/labels/music — the gray-box could read as
a fire station / military base. To probe this within M2 (without touching the proven
M1 slice or camera), `src/m2/M2Scene.tsx` has a **studio mode**: the *same* sampled
family, scaled and arranged into a rough production-street corner, seen from overview
distance. **This is a survey probe, not final art and not the M3 pass.** The
soundstage / gate / water-tower identity is deliberately **absent** — those are the
required custom landmarks (§8), and their absence is part of the finding.

Evidence: `m2-07-studio-overview-original.png`, `m2-08-studio-overview-meridian.png`
(overview A/B), `m2-09-studio-ground-meridian.png` (ground level).

**Honest read:**

- **Improvement over the gray-box: clear.** Recognizable vehicles, people, trees, and
  varied buildings make it read as a *warm, lived-in, populated place* — no longer a
  bare institutional block. At ground level (`m2-09`) it reads as a plausible period
  lot corner.
- **"Movie studio" specifically: not yet, from generic assets alone.** With no gate,
  no numbered soundstages, no signage, no water-tower-with-logo, no marquee, the
  overview reads more like an active town/industrial yard than a studio. The placeholder
  stage mass (a scaled crate) underlines that a real soundstage must be authored.
- **Blunt comparison (the independent Gate-B reviewer's point, and it's right):** on
  pure *"is this a movie studio?"* silhouette recognition, the M2 probe is **not
  stronger than the M1 gray-box.** M1's barrel-vault soundstage and water-tower-on-
  stilts are more distinctive *studio shapes* than the probe's placeholder block. The
  M2 gain is warmth / population / life, **not** studio identity. This is not a
  contradiction — it **reinforces** the conclusion below: studio identity is carried by
  the bespoke landmark silhouettes, and authoring those is the primary M3 cost driver,
  not a detail to gloss.

**Conclusion:** the generic family is a strong *supporting* foundation and can
*coexist* with the studio landmarks, but **studio identity depends on the custom
landmarks** — it cannot be bought/downloaded generically. This is consistent with the
binding Gate-A requirement and with `ASSET-POLICY.md` (§"must remain original").

---

## 7. Character & production readability

- **Characters read as people, not markers.** `m2-05` / `m2-09`: the Blocky Character
  is unmistakably a person (face, torso, limbs, wardrobe) — a large jump from the M1
  capsule-with-hardhat. Crew clusters read as a crew.
- **Animation works.** `m2-anim-walk-01..05` (walk cycle) + `m2-06-crew-gesture.png`
  (gesture). The rig drives all mapped motions (idle/walk/gesture/carry/react).
- **Period fit (1940s–50s):** partial. The restyled palette and the panel-truck lean
  period-appropriate; the Blocky Character and modern-ish car are stylised-generic.
  Period wardrobe and period vehicles would need custom modelling or a period-specific
  pack — a documented M3 cost, not an M2 blocker.

---

## 8. What still must be original / custom (unchanged by M2)

M2 confirms the generic family **cannot** supply these; they remain custom or
substantially-custom per `ASSET-POLICY.md`:

Meridian gate · administration landmark · Meridian crest · water tower (with signage) ·
flagship soundstage façade + numbered stages · screening theatre · hero backlot street ·
production title boards / signage · recurring Deco trim · signature red + brass language ·
key actor/director identities.

**Custom-art estimate (rough, for M3 planning):** the *identity landmarks above* are
the bulk of the custom work — call it the majority of an M3 art pass. The generic
family covers the *supporting* layer at low cost: offices/bungalows (scaled +
restyled), vehicles, crew, vegetation, equipment cases, and background dressing.
Signage/logos are 2D + simple geometry (cheap once designed). The soundstage and gate
are the two highest-value custom builds.

---

## 9. Paid-asset recommendation (no purchase now — §11)

If a budget is later approved, **Synty POLYGON** is the strongest paid option for a
studio look: `POLYGON - Movie Set`, `POLYGON Town`, and `POLYGON City` together carry
studio-adjacent props (cameras, lights, trailers, set dressing), period-leaning
vehicles, and a very coherent family with matching character/animation packs. It would
materially improve coherence and reduce the custom prop workload — but **it would not
remove the need for the bespoke Meridian landmarks** (§8), and it is a paid
Unity/Unreal-store family (licence + engine-fit to assess before any spend). **No
spend is authorised now**; this is a recommendation only. Free alternative to
re-evaluate first: **Quaternius** (CC0) modular + character/animation packs.

---

## 10. Limitations of this survey (honest scope)

1. **Software-only performance.** All capture is headless Chrome on swiftshader
   (software WebGL): **7–13 fps — a floor, not a hardware verdict.** The M1 gray-box
   measured **~120 fps on the owner's real GPU**; that baseline stands. An **M2
   hardware fps figure requires the owner to run `m2.html` in real Chrome** — not yet
   done. The tiny asset payload makes a comfortable >60 fps very likely, but it is
   **not** measured. (See `PERFORMANCE-BASELINE.md`; the panel prints a `* fps`
   caveat.)
2. **The probe is not the M1 slice.** Assets were tested in a dedicated survey scene
   and a rough composed corner — **not** dropped into the M1 slice's deterministic
   vignette. So M2 did not re-verify asset behaviour under seek/pause/replay or with
   the proven camera. That integration is M3 work, deliberately not started.
3. **One sample per type.** A single representative asset per category — enough to
   judge family compatibility, not a full dressing kit.
4. **`Box3` on the skinned character is unreliable** (reports 2.72 m; renders ~1.7 m).
   A precise character height needs a skinned-vertex measure; visually it is fine.
5. **No period-specific assets** were sourced; period fidelity is assessed by
   reasoning + restyle, not by a period pack.

---

## 11. Evaluation questions (§19)

1. **Match the approved concept language?** **Partially.** Low-poly form yes, and a
   coherent *warm palette shift* via the restyle — but the concept's specific
   cream-stucco / taupe-brass-Deco anchors are only partly surfaced and must be proven
   in M3. Concept-grade landmark *forms* still need custom modelling.
2. **Characters read as people, not markers?** **Yes** (`m2-05`, `m2-09`).
3. **Stops resembling a military base / fire station?** **Improved, not fully.** It
   reads as a populated place, not a bare institution; but distinct *studio* identity
   needs the custom landmarks.
4. **Production recognizable from overview?** **Not from generic assets alone** —
   trucks + crew help, but the studio read needs soundstage/gate/signage. Production
   reads well at close range (as in M1).
5. **Recolour / re-material cleanly?** **Yes** — one shared colormap per kit ⇒
   whole-kit restyle in one pass (`m2-01`↔`02`, `07`↔`08`). Caveat: what's proven is a
   coherent *warm palette shift*; hitting the exact Meridian anchors is an M3 target.
6. **Scale & pivots consistent?** Pivots yes (base-at-origin). Scale: vehicles /
   crew / props / trees usable at native; **architecture pieces are modular/undersized
   and need ~×3 scaling / assembly.**
7. **Animations function?** **Yes** — 27 clips; all mapped motions play.
8. **Do vehicles, characters, props, buildings belong together?** **Yes** — one
   coherent family; the lineup and corner read as a single world.
9. **Browser loading acceptable?** **Yes** — 756 KB of assets; the three.js runtime
   (not the assets) dominates JS and would be lazy-loaded in integration.
10. **Likely >60 fps?** **Very likely on real GPU** (tiny payload, low draw calls) but
    **not measured** — owner must confirm on hardware.
11. **Licence appropriate?** **Yes** — CC0, commercial-safe, no attribution required.
12. **Supports a 1940s–50s studio?** Partially — palette/architecture yes via restyle;
    period vehicles/wardrobe need custom or period-specific assets.
13. **How much original art still needed?** The identity landmarks (§8) — the majority
    of an M3 pass. Supporting layer is cheap.
14. **Would a paid family materially improve the outcome?** Yes for coherence + studio
    props (Synty POLYGON, §9) — but it would not remove the bespoke-landmark need. Not
    now (no spend).
15. **Is a coherent M3 art pass justified?** **Yes, conditionally** — see below.

---

## 12. Recommendation

**The Kenney CC0 family PASSES as the supporting low-poly foundation** for the
Meridian slice: coherent, permissive (commercial-safe), zero-conversion, tiny payload,
restyleable to Meridian in a single-texture pass, with readable rigged/animated
characters and usable vehicles/props/vegetation.

**An M3 coherent art pass is justified** — *conditionally* — with M3's scope centred
on **authoring the custom identity landmarks** (soundstage, gate, water tower,
signage, crest, admin, theatre, hero street) and **restyling + composing the Kenney
supporting family around them**, then validating the result **inside the M1 slice**
(deterministic vignette + the proven camera) and **on real-GPU hardware**.

**M3 is NOT authorised by this document.** Gate B (evidence + independent review) is
the decision point; see `GATE-B-REPORT.md`. This survey stops here.
