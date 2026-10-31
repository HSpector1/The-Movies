# Your browser playtest — Project: Studio (2026-10-30, 20:55 CDT)

Howard: this is the current game, ready to open on this laptop. Your verdict is yours; nothing here is accepted on
your behalf, and nothing below says the game is good, only that it opens and the route works in your installed Chrome.

## What you are playing

Branch p18-season-20261028 at commit 18c3e8cf (the Sprint 27 checkpoint). Its browser game is byte for byte the Sprint 26
playtest candidate (tag p18-sprint26-candidate-20261030, commit 6ddeeb00): Sprint 27 changed only the Unity-facing
Bridge, not one file under ui/ or src/. The build served to you was made from 18c3e8cf at 20:51 CDT (receipt:
LAUNCH-RECEIPT.md).

## Open it

If the coordinator's session is still running, the game is already served at **http://127.0.0.1:4180/** (this laptop
only; nothing is published). If that address does not answer, open Terminal and paste these two lines:

```
cd /Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt
npm run preview -- --host 127.0.0.1 --port 4180 --strictPort
```

Then open **http://127.0.0.1:4180/** in Google Chrome. (Port 4173 is taken by another program on this laptop, which is
why 4180.) The game autosaves into this browser's storage; a banner tells you if it cannot. A private window starts fresh.
To stop the server, press Ctrl+C in that Terminal.

## The first route (about fifteen minutes, five tasks)

1. **Start a studio and find your next action.** On the Start screen type any word as THE WORLD (or keep studio-001)
   and press "Open the studio". Sign three actors, one director, one writer and one production/craft lead on the
   founding roster (the tabs count what you still need), then press "Found studio". You land on the Dashboard at week 0
   with $20M. Read the Finances card: runway in weeks, weekly burn, what the studio can make right now. The Dashboard
   names the next thing to do; tell us whether you could find it without this note.
2. **Take a film from script to release.** Open the Writers' Room and commission a screenplay. Press "Sim to next event"
   until the review stops you; accept the script; open its package; pick talent (the pickers only offer legal, distinct
   people); set the budget and read the Release Strategy panel (break-even gross, cash after greenlight, the Pass or
   Blocked solvency gate). Greenlight. Back on the Dashboard resolve any Production Board command, then "Sim to next
   event" until the picture is Release Ready; press "Commit to release" and confirm it (it asks twice on purpose), then
   Sim again. The newspaper opens.
3. **Read the money and the verdict.** In the newspaper: the review score, the opening gross, Studio Revenue paid this
   week, projected against banked figures. Read the full autopsy, return, and watch the theatrical run pay Studio Revenue
   each week while the Finances card counts one film in theatres. Tell us whether you understood what you earned and why.
4. **Save and reopen the same studio.** Open Saves (Dashboard button), press "Export a print" (a file downloads; "Copy"
   also works). Return to the Start screen (reload the page and choose a fresh world, or use a private window), paste the
   file's contents into the "Continue from a save" box and press "Load save". The restored studio must match what you
   left; advance one week to be sure it runs.
5. **Open the Rights desk and read one action or refusal.** From the Dashboard press "Rights desk". Right after a release
   your film's title is listed with "Not available" while it is in theatres, and the line under it says why in plain
   words (the studio's own note is one click away). On a brand-new studio the rival disclosures are also refused with a
   reason. Tell us whether the reason made sense and what you expected to be able to do.

## One optional advanced route: a television season (P18)

A fresh campaign cannot reach a season quickly, so use the prepared world the automated journeys use. It is a
demonstration save built by the test code from a fixed seed (p18-sprint12-season-01), week 428, no private data; loading
it does not show that ordinary play reaches this point, it only lets you try the season workflow. File (2.0 MB):

`/Users/zacheryspector/The-Movies-headless-program/docs/engineering/audits/2026-10-22-codebase-review/sprint16-playtest/owner-saves/p18-season-world.json`

On the Start screen paste its full contents into "Continue from a save" and press "Load save". Preconfigured: a studio
with one story property ("The Fading Impresario") and a roster that can staff a season. Route: from Assembly choose
"Commission a season", read the cash required against cash held and the advance rule, commission it, then Sim to the
first credited unit and read the season row on the Dashboard with its cancel and settle previews. Then open the Rights
desk, choose the property and "Offer for sale": before anything binds, the desk shows what the sale would do to your live
season (the week it closes, the cancellation, the refund and the charge). You can back out.

The P17 continuation world (owner-saves/p17-cameo-world.json, seed p17-cameo-booking-01, week 1872) still loads if you
prefer that route: release the original, greenlight its sequel with one featured guest, read the lineage.

## Known limits on this route (not accepted, not hidden)

- Commissioning a season is only on the Assembly screen; some refusal and settle wording is provisional.
- A cancelled season leaves the commissioner's licence in place until its term ends.
- Selling a title mid-season cancels the season at the next boundary and charges the agreed amount; the Rights desk
  discloses this before you confirm.
- Rival studios never make you an offer in play; the desk's accept and reject buttons appear only if one exists.
- Left idle, a studio runs out of money around week 1366 and closes; that is the design, not a bug.
- Only installed Chrome was exercised; Firefox and Safari were not.
- The native Unity client has never been compiled or run (no capable machine yet); this is the browser game only.

## What we need from you

- Where you did not know what to do next.
- Which actions or consequences were unclear (money, blocked work, the Rights desk reasons).
- Anything that failed, stalled or displayed wrongly (overlaps, boxes for glyphs, a button you expected and did not find).
- Whether the production loop was enjoyable.

After playing you may say KEEP, REVISE or REJECT. Until you do, acceptance stays pending; a passing automated run is not
your verdict.
