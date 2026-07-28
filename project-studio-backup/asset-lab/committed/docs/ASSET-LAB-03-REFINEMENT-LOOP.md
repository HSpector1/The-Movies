# Asset Lab 03 — Controlled Visual Refinement Loop

A bounded, four-iteration refinement of the Scene E hero soundstage. Each iteration had one theme,
corrected no more than three related defects, and stored its own evidence under
`proof/lab03/iteration-0N/` (the five named views: overview, front, loading-bay, courtyard,
human-scale). Scope, isolation, and non-goals from the Asset Lab 03 contract were unchanged; Scene D
and the shared Lab 02 material family stayed byte-untouched throughout.

## Iteration 1 — Architecture and signage
**Defects fixed:** the clipped **"AG" plaque** (STAGE 1 text overflowed its canvas — now sized to
fit and legible); two other clipped signs (`KEEP OUT — WHEN RED`, Genny `MERIDIAN POWER`); flat
side walls; missing roof-access/utility story; missing operational sign.
**Changes:** fit + relocate all signage into a clear hierarchy (MERIDIAN PICTURES → SOUND STAGE /
STAGE 1 → LOADING); **pilaster buttresses** for wall rhythm; **caged maintenance ladder** + roof
**eave drip-trim**; two exterior **gooseneck work lights**; an operational **LOADING** sign.
**Result:** the "large plain box" read is broken; all text is legible; the AG defect is gone.

## Iteration 2 — Ground and production function
**Defects fixed:** no curbs/pedestrian routes; weak loading markings; flat, uniform ground; scattered
equipment.
**Changes:** a raised **sidewalk + curb** separating foot traffic from the loading apron; a **trench
drain** across the apron; **truck stop line + TRUCKS stencil** at the dock approach; **GRIP** staging
zone; **asphalt patches + tire-scrub marks** to break the flat asphalt.
**Result:** the ground organizes activity (pedestrian vs vehicle, departmental zones) without noise.
Draw calls rose only 130 → (net) small, confirming restraint.

## Iteration 3 — Crew, background, and composition
**Defects fixed:** undifferentiated clone crew; no world edge (building floated in empty asphalt); no
nearby office context; close/empty overview framing.
**Changes:** **role-differentiated crew** (deterministic role tints, per-worker height variation, and
a **head-bone-tracked hard hat** — reusing the existing CC0 rig + clips, no new characters, in a
self-contained `HeroWorkers` so the shared `Workers.tsx` stayed byte-unchanged); a **world edge** —
a low-detail **ADMINISTRATION office**, an **adjacent barrel-roof stage**, a **perimeter fence**,
**trees/hedges**, and a **backlot false-front flat**; a **wider overview** framing that shows the
studio-lot context.
**Result:** the overview reads as a **working movie-studio lot**, hero soundstage focal, with the
crew and context that Priorities 6–7 call for.

## Iteration 4 — Restraint and final cohesion
**Defects fixed:** front signage right-heavy (all facility/operational signs clustered right); office
slightly too prominent; minor apron clutter.
**Changes (subtractive/rebalancing only):** moved the **STAGE 1 plaque to the left** of the door to
balance the right-side SOUND STAGE / MERIDIAN block; **pushed the office back** so it reads as context
not a rival; removed a floating fire extinguisher and two redundant cones.
**Result:** balanced facade composition, the soundstage clearly the hero, a cleaner apron.

## Verification (every iteration)
Each iteration: `npm run build` (tsc + vite) green; Scene E loads and captures **console-error-free**
under headless SwiftShader; all five named views captured; the red vertex-color defect did not return
(Scene A/D unaffected — `greybox.tsx` and `materials.ts` byte-unchanged); no unexpected dependency
change; no protected repository touched. Diagnostic performance stayed crew-dominated (the bespoke
building geometry remained light; draw calls stayed modest and were deliberately trimmed in
Iteration 4).

## Post-verification corrections
An independent adversarial visual pass on the finished loop returned CONCERNS and caught defects the
loop itself introduced or left; these were then corrected (fixing defects, not adding new content):
- **Crew hard hats (high).** Parenting the hat to the rig's `Head` bone inherited that bone's tilted
  local frame, so hats floated/tilted and were inconsistent. Fixed: the hat is no longer a bone
  child — each frame it tracks the head's **world position** and stays upright, and **every** role now
  has headwear (hard hat for site crew, soft cap for DP/director). Hats now seat correctly on all
  crew (`07-crew.png`, `08-human-scale.png`).
- **Signage hierarchy (medium).** SOUND STAGE was rendering larger/higher than MERIDIAN PICTURES,
  inverting the contract's stated order (studio identity first). Fixed: **MERIDIAN PICTURES is now the
  dominant top plaque**, SOUND STAGE the smaller facility plaque below (`01-hero.png`, `02-doors.png`).
- **Sign margins + apron clutter (low).** MERIDIAN PICTURES got a wider canvas for clear margins; one
  redundant C-stand was removed to reduce apron pole clutter.
The independent doc-honesty pass returned PASS (triangle figures match `performance-lab03.json`;
isolation and "diagnostic only" framing verified).

## Evidence
`proof/lab03/iteration-01..04/` — the five named views per iteration, plus a `stats.json`, showing the
loop progression. The refreshed top-level `proof/lab03/*.png` reflect the final corrected state;
`14-greybox-D.png` remains the untouched Lab 02 greybox for the greybox ⇄ hero comparison.
