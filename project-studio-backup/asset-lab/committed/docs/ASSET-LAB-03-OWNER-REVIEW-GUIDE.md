# Owner Review Guide — Asset Lab 03 (Hero Soundstage)

A five-minute path to judge whether the hero soundstage is a convincing production-fidelity target
and whether the approach is worth taking further.

## Launch (real GPU — do this for an honest look)

```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install          # if not already (adds the postprocessing dependency)
npm run dev          # opens http://localhost:4320 — boots on Scene E (Hero Stage 1)
```

Run it in your normal browser (not headless) so you see it on your **real GPU**. The `proof/lab03/`
images were rendered with software SwiftShader and look darker/slower than reality — and the Post FX
polish is a real-GPU feature that the proof images mostly do without.

## What to do

1. It opens on **Scene E — Hero Stage 1**, camera on **Overview** (the management view).
2. Use the **Camera** buttons top-left: **Hero → Doors → Apron → Roofline → Human Scale**. Orbit and
   zoom freely; **Reset** returns to overview.
3. **This is the headline comparison:** click Scene **D · Studio greybox**, find Stage 1, then click
   back to **E · Hero stage**. *Same building, same warm light — greybox vs hero fidelity.*
4. On Scene E, toggle the **fidelity layers**: **Production apron** (peel the set back to the bare
   hero building), **Crew**, **Shadows**, **Wireframe** (watch the stage silhouette survive with all
   materials stripped), and **Atmosphere**.
5. Turn on **Post FX (bloom/AO)** and **Soft shadows** — these are the real-GPU polish. Note how the
   red-eye warning light and film-light lenses bloom, and how contact occlusion deepens the crevices.

## The questions to answer (your call)

- Does it read as a **hero soundstage**, not a textured box?
- Is it **materially better** than the Scene D greybox of the *same* Stage 1?
- Do the **materials** sell it — clad corrugated metal, weathered concrete, the recessed doors?
- Is the **apron** a believable *active* set (grip/electric, cable runs, crew), or a prop pile?
- Does it stay **warm and inviting** and read cleanly from the **management camera**?
- Is the **silhouette** right (parapet + barrel + monitor + dock)?
- Is this **promising enough** to take a second facility — or the interior question — to this fidelity?
- Which elements still look **generic, dated, or wrong**?

## Verdict options

**FAIL · CONDITIONAL PASS · PASS WITH NOTES · PASS**

Whatever the verdict, note **which elements still look off** — that list is the next milestone's
input. Reminder: a pass here authorizes **more visual-target work only**. It does **not** authorize
Gate D, OC-01, a set interior, a full-lot art pass, or any production/main-game integration; those
remain owner-gated decisions.

## Evidence (if you would rather skim than run it)

`proof/lab03/` — 01 hero, 02 doors, 03 apron, 04 roofline, 05 surface-PBR close-up, 06 warning-light
detail, 07 crew, 08 human-scale, 09 overview, 10 building-only (apron peeled off), 11 no-shadows,
12 wireframe (silhouette survives), 13 hero-E / 14 greybox-D (the before/after), 15 stats panel,
16 soft-shadows (real-GPU), 17 post-fx (real-GPU). The Scene D "before" is the preserved, untouched
Lab 02 Stage 1. `performance-lab03.json` records the (software, diagnostic-only) render stats.
