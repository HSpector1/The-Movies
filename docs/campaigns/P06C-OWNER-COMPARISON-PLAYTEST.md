# P06C — Owner Comparison Playtest (P06B control vs P06C candidate)

P06C is an **isolated comparison candidate**, not an integration. Compare it against the byte-preserved
P06B control and decide whether P06C should later replace P06B. Nothing is merged; campaign branches are
unchanged either way.

## Launch (bundled rich multi-picture demo — same state for both)
```
# P06B CONTROL (unchanged):
zsh "~/Desktop/P06B-Owner-Candidate-48c419d-18a2887/launcher/launch.sh"

# P06C CANDIDATE:
zsh "~/Desktop/P06C-Comparison-Candidate-<ts>-<unity>/launcher/launch.sh"
```
Each opens a 1440×900 window on the same demo studio. Close the window or Ctrl-C the terminal to quit.
(Exact candidate path is printed in this checkpoint's final report and the candidate README.)

## The three things to compare

### 1. Priority Zero — the state-truth contradiction (the fix that matters most)
Find the **wrapped picture waiting for a Post slot** ("Nights of Lighthouse" in the demo).
- **P06B (control):** the left guidance card says **"SHOOTING · Principal photography started…"** while
  the right rail says **"POST · WAITING"** — two surfaces contradicting each other for the same movie.
- **P06C (candidate):** the left card says **"WAITING FOR POST · Principal photography wrapped…"**,
  agreeing with the rail. → *Do both surfaces now tell the same truth?*

### 2. The movie pipeline rail — grouped slate
Look at the right-side rail.
- **P06B:** one flat stack of movie cards.
- **P06C:** grouped under restrained headers — **SCRIPTS · MAKING MOVIES · POST & RELEASE** — so you read
  the whole active slate at a glance. Lifecycle track, Locate, and committed-green "releases next week"
  are unchanged; long titles still don't clip. → *Can you understand the entire slate faster?*
  (Note: the bundled demo is post-heavy, so you'll mostly see the POST & RELEASE group; the three-group
  structure appears as pictures move earlier in the pipeline.)

### 3. People / Talent awareness — new strip
Below the movie rail (right column), P06C adds a **COMPANY** strip: who is working (and on which movie)
vs who is available, a live count, and "Hire more at the Casting building". → *Do people feel connected
to the world now? Is "who's available" answerable at a glance?*

## What should NOT have changed (regressions to watch for)
- The lot is still the dominant surface (rail + people are peripheral, right-column only).
- Clicking a building still opens it directly — no rail priming required.
- The release-commit flow is identical (commit a Release-Ready picture; it commits, advances no time,
  and releases the next studio week).
- No box-office/critic/rank/awards/earnings anywhere (that is P07, not in scope).
- The Casting "Find an Actor" shortage route is unchanged.

## Decision
Either **ACCEPT P06C** as the new candidate (a later explicit ruling authorizes integration), or report
the exact step/screen where P06C is worse than P06B. Nothing is integrated until you rule.
