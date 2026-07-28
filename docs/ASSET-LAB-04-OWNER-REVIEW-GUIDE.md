# Owner Review Guide — Asset Lab 04 (Refined Studio Lot)

A five-minute path to judge whether the refined lot is a convincing, less-boxy, believable studio
direction — and whether it is worth taking further.

## Launch (real GPU — do this for an honest look)
```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install
npm run dev            # http://localhost:4320
```
Run it in your normal browser so you see it on your **real GPU**. The `proof/lab04/` images are
headless SwiftShader (darker/slower than reality), and the Post FX polish is a real-GPU feature.

## What to do
1. Click Scene **F · Refined lot**. Camera on **Overview** — the management view of the whole lot.
2. Walk the **Camera** buttons: **Entrance → Stage Row → Avenue → Backlot → Commissary → Water
   Tower → Human Scale**. Orbit/zoom freely; **Reset** returns to overview.
3. **The headline comparison:** click Scene **D · Studio greybox**, then back to **F · Refined lot**.
   *Same concept — a row of boxes vs an architecturally varied campus.*
4. Toggle **Wireframe** (Display) on Scene F: confirm the variety is in **geometry** (roof forms,
   massing), not painted on boxes.
5. Toggle the **Refined lot layers**: Crew, Landscaping, Production dressing, Shadows. Turn on **Post
   FX** and **Soft shadows** for the real-GPU polish.

## The questions to answer (your call)
- Does it read as a **real working movie studio**, not a row of boxes?
- Is it **materially less boxy / more varied** than the Scene D greybox lot?
- Is the **roofscape and massing** varied (barrel, sawtooth, gable, hipped, Deco, marquee, curved)?
- Does it stay **warm, cohesive, and stylized** — one studio, not five different games, not photoreal?
- Do the **studio signatures** land (water tower, numbered stages, marquee gate, backlot false-fronts
  with exposed bracing, sawtooth mill)?
- Is the **direction promising enough to continue**?
- Which buildings or areas still look **generic, boxy, or wrong**?

## Verdict options
**FAIL · CONDITIONAL PASS · PASS WITH NOTES · PASS**

Note **which elements still look off** — that list is the next milestone's input. A pass authorizes
**more visual-target work only**. It does **not** authorize Gate D, OC-01, facility simulation,
construction gameplay, production integration, or a product redesign — those remain owner-gated.

## Evidence (if you would rather skim than run it)
`proof/lab04/` — 01 overview, 02 entrance, 03 stage row, 04 avenue, 05 backlot (exposed bracing),
06 commissary, 07 water tower, 08 mill (sawtooth), 09 human scale, 10 wireframe (silhouette proof),
11 architecture-only, 12 refined-F / 13 greybox-D (the before/after), 14 stats panel.
`performance-lab04.json` records the (software, diagnostic-only) render stats.
