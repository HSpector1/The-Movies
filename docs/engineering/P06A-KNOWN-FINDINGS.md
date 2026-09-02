# P06A — known findings (surfaced during the six-scene Visual Oracle capture)

Honest register of issues found while inspecting the actual oracle image bytes. Each records
severity, whether it is a P06 regression or pre-existing, the owning seam, and the disposition.
Per the project law: a gap is reported, not silently filled.

## F1 — waiting-badge glyph rendered as tofu — **FIXED**

- **What:** the movie-rail POST-waiting badge used `⧗`, which the packaged player font lacks, so
  it rendered as a `□` box ("POST □ WAITING") in the wrapped-waiting and multi-picture-contention
  frames.
- **Regression?** New this wave (my LSCL rail badge). In scope.
- **Seam:** `StudioProductionRailHud.DrawProductionRow`.
- **Fix:** font-safe badges only — action shows `▸` (its word lives in the "your decision" time
  line); a block shows "· WAITING" (word + amber chip, never colour alone). Both glyphs are
  already used elsewhere in the shell. Rebuilt and re-captured to confirm.

## F2 — first-film-journey guidance card describes a wrapped picture as "shooting" — **DOCUMENTED (pre-existing, out of P06 scope)**

- **What:** in the `wrapped-waiting-for-post` scene, the top-left picture-guidance card reads
  "SHOOTING · Principal photography started · the director, cast, and crew are working on set ·
  N weeks remaining · Shooting continues · advance the week" for a picture that has wrapped and is
  waiting for a Post slot. The P06 surfaces are correct: the movie rail shows "POST · WAITING ·
  Waiting for Post" and the Production/Post building derives the WaitingForPost cue.
- **Root cause:** the copy originates in `src/core/firstFilmJourney.ts`. The engine keeps
  `phase === 'shooting'` for a wrapped picture whose transition to postProduction is
  capacity-blocked (the `wrapped-waiting-for-post` operationalState captures the block); the
  first-film-journey guidance keys on **phase**, not operationalState, so it shows shooting copy.
  The recommended *action* it gives ("advance the week") is correct — only the state
  *characterisation* is stale.
- **Regression?** No — pre-existing. Both the first-film journey and the `wrapped-waiting-for-post`
  operationalState predate this wave; P06 (W3/W4/W5 + the LSCL rail) added the
  operationalState-aware surfaces that now make the journey card's phase-based copy look
  inconsistent beside them.
- **Scope:** `firstFilmJourney.ts` is the C1 onboarding journey. Onboarding is on the CLAUDE.md
  "not current scope" list. Modifying a core, test-heavy C1 module to special-case
  wrapped-waiting is **not** P06 Post/Release work, and doing it silently mid-P06 would be exactly
  the kind of unbidden change the project law forbids.
- **Hostile criteria:** trips none of the 25 (it is neither an auto-release, a batch/economy
  fault, a Post-subphase invention, a disappearing/leaking movie, nor a code/report contradiction —
  it is a phase-vs-operationalState copy nuance on an onboarding card).
- **Disposition:** left for Owner/hostile-review judgment. If deemed in-scope, the fix is to make
  the first-film-journey guidance (and any phase-based picture card) read `operationalState` for
  the wrapped-waiting and release-ready families so the card, rail, and building speak with one
  voice. Tracked here so it is findable, not lost.
