# Owner Review Guide (contract §14)

A five-minute path for Howard to judge whether the Studio Greybox Target is promising enough to
continue.

## Launch (real GPU — do this for an honest look)

```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install          # if not already
npm run dev          # opens http://localhost:4320 — boots on Scene D
```

Run it in your normal browser (not headless) so you see it on your **real GPU** — the proof
images were rendered with software SwiftShader and look darker/slower than reality.

## What to do

1. It opens on **Scene D — Studio greybox**, camera on **Overview**. This is the management view.
2. Use the **Camera** buttons top-left: **Entrance → Soundstage → Courtyard → Human Scale**.
   Orbit/zoom freely; **Reset** returns to overview.
3. Toggle the **Studio dressing** checkboxes to see what each layer contributes:
   **Characters, Landscaping, Production dressing, Shadows, Atmosphere.**
4. **Compare Lab 01 vs Lab 02**: click Scene **A · Lab01 lot**, then back to **D · Studio
   greybox**. Same pipeline and assets; the difference is presentation and composition.

## The questions to answer (your call)

- Does it **read as a movie studio immediately**?
- Is it **substantially better than Asset Lab 01**?
- Does it feel **warm and inviting**?
- Does the **management view** work (readable, orbits/zooms comfortably)?
- Does the **soundstage look distinct** from the office?
- Do the **workers make the lot feel alive**?
- Is the **style promising enough to continue**?
- Which elements still look **generic or dated**?

## Verdict options

**FAIL · CONDITIONAL PASS · PASS WITH NOTES · PASS**

Whatever the verdict, note **which elements still look generic or dated** — that list is the
next milestone's input. Reminder: a pass here authorizes **more visual-target work only**. It
does **not** authorize Gate D, OC-01, or any production/main-game integration; those remain
owner-gated decisions.

## Evidence (if you would rather skim than run it)

`proof/lab02/` — 01 overview, 02 entrance, 03 office, 04 soundstage, 05 courtyard, 06 human
scale, 07 workers, 08 backlot, 09 material-after (red fixed), 10 performance panel, 11
wireframe, 12 Lab01 overview (for side-by-side). The "before" red pavement is the preserved
`proof/04-road-sidewalk.png` from Lab 01.
