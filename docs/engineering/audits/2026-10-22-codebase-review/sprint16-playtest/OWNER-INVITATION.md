# Owner playtest invitation — browser candidate r3, 6da4206a (2026-10-28; updated 2026-10-29, 02:11 CDT)

Howard: this is one short route through the current browser build. Your verdict is yours; nothing below is accepted on your behalf. The coordinator's evidence (four scripted journeys in your installed Chrome, screenshots in sprint16-playtest/screenshots/) says the route works; it does not say the game is good.

## 1. Launch

From a checkout of HSpector1/The-Movies at tag p18-sprint16-playtest-candidate-r3-20261028 (branch p18-season-20261028, commit 6da4206a; the r2 tag at b3c179b0 lacks the season cancellation below and the earlier tag at 468d99b8 also lacks the headline fix), with node v20.20.2 on the PATH and dependencies installed:

```
npm run build
npm run preview
```

Open the printed localhost address in Google Chrome. (`npm run dev` also works, on port 5173.) The studio autosaves to this browser's storage; a banner tells you if it cannot. Private windows and cleared site data start fresh.

## 2. The route (about fifteen minutes)

1. **Start a studio.** On the Start screen enter any seed word, choose New game, sign three actors, a director, a writer and a craft lead on the founding roster, then Found studio. You land on the Dashboard at week 0 with $20M. Read the Finances card: runway in weeks, weekly burn, and what the studio can make right now. Tell us whether those numbers answer "can I afford a film and how long can I last" without a manual.
2. **Make a film.** Open the Writers' Room, commission a screenplay, Sim to next event until the review stops you, accept the script, open its package, choose talent (the pickers only let you pick legal, distinct people), set the budget and read the Release Strategy panel: break-even gross, cash after greenlight, the solvency gate (Pass or Blocked) and capital exposure. Greenlight.
3. **Release it.** Back on the Dashboard, resolve any Production Board command that appears, then Sim to next event. When the picture is Release Ready the Dashboard stops you and says so; press Commit to release, then Sim again. The newspaper opens: a review score, opening gross, Studio Revenue paid this week, and projected versus banked figures. Read the full autopsy, then return. Watch the theatrical run pay Studio Revenue weekly and the Finances card count one film in theaters.
4. **Blocked work.** Try Sim to next event while a decision is pending (a screenplay waiting, a Release Ready picture, a Production Board command). It stays disabled and the hint explains why; "Advance one week" always stays legal. Tell us whether the explanation is enough.
5. **Save and reload.** Open Saves, export the save, start a new game, import the file on the Start screen, and continue one week. The restored studio must match what you left.
6. **P16/P17/P18 routes.** These need worlds a fresh browser campaign cannot reach quickly, so use the two prepared saves the journeys use, exported for you into this folder: owner-saves/p17-cameo-world.json (the cameo world, seed p17-cameo-booking-01, week 1872, 443 KB) and owner-saves/p18-season-world.json (the season world, seed p18-sprint12-season-01, week 428, 2.0 MB). Both are Save51 files built by the same code the journeys use (tests/helpers/p17-cameo-route.ts, tests/helpers/p18-season-world.ts) and each was imported through the Start screen in installed Chrome before being recorded (lane/browser-r5). To load one: on the Start screen, under "Continue from a save", paste the file's full contents into the Save JSON box and press Import; or, inside a running studio, open Saves and use "Open a save file" (or drop the file on that panel). Regenerate them at any time with `OWNER_SAVES_DIR=<folder> npx playwright test --config ui/playwright.config.ts owner-route-saves.spec.ts`. P17: release the original, greenlight its sequel with one featured guest, read the lineage and meters. P18: from Assembly, "Commission a season", read the cash required against cash held and the advance rule, commission, then sim to the first credited unit and read the Dashboard season row and its cancel and settle previews.

## 3. Known issues you will meet (not accepted, not hidden)

- The front door for commissioning a television season is the standalone Assembly screen only; the refusal copy and the settle amount wording are provisional.
- A cancelled season leaves the commissioner's licence in place until its term ends. A season whose rights authority or a required person is lost now cancels at the next weekly boundary (candidate r3); selling the title mid-season cancels at once and charges the producer the agreed K, and the sale offer does not yet say so.
- Guests for a sequel are chosen by the studio only; rival guest selection is not modelled.
- A save written by the Node runtime may be refused by the browser import; browser-written saves round-trip.
- Very long campaigns (past week 6240 under the deferred-closure engine option) produce 45 to 60 MB saves and slow saving; a normal campaign is nowhere near that.
- Left idle, a studio runs out of money around week 1366 and closes; that is measured behaviour, not a bug report.
- No rival that entered cost-cutting has ever recovered in the measured routes.
- The native Unity client is paired at source level only and has no build on this machine.

Fixed since the first invitation: the newspaper headline no longer strands its closing quotation mark on a new line (r2); a season cancels automatically when its rights authority or a required person is lost, and the campaign-library save and load are faster (r3).

## 4. What we need from you

A KEEP, REVISE or REJECT on the route as a playable loop, the moments where money or blocked work confused you, and anything that rendered wrongly (overlaps, boxes for glyphs, a button you expected and did not find). Missing feedback does not block further independent repairs; it does block acceptance.
