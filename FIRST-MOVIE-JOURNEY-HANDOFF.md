# First Movie Journey — Handoff (DRAFT — finalize at seal)

Sealed: 2026-08-17. Shift: Fable-led first-movie-journey campaign (successor to the
tycoon world conversion).

## Recovery coordinates
- Branch: `first-movie-journey-v1` (remote `hspector-github`), from Tycoon World V1
  `b58e6f8a92c0022c613b5c1591f734ae6db3453f`; canonical `main` still `2be6656`.
- HEAD: (fill at seal); local == remote required. Two-key rule: no self-merge to main.
- Launch: `cd ui && npm run dev -- --host 127.0.0.1 --port 5174` → http://127.0.0.1:5174/

## The Owner rulings that bound this shift
- Opening: Tycoon World architecture PASS / first-movie discoverability FAIL.
- Stop condition: seal after Wave 4; NO successor campaign. Next: Owner delivers The
  Movies Mechanics Bible + screenshot corpus for a fresh PM planning pass.

## What materially changed (player-visible)
1. YOUR FIRST/NEXT PICTURE guidance card (top-left desk): persistent, collapsible,
   engine-derived (`src/core/firstFilmJourney.ts`, pure/save-neutral); one imperative
   next step per state; button pans+selects (never routes); tracks the picture from
   before commission through release and into the next loop.
2. Buildings answer "what can I do here right now": inspector primary verbs
   (Commission a screenplay / Plan auditions for <title> / Open the picture's package),
   hierarchy reordered (what is this → what's happening → occupants → actions →
   capacity → deep details), plain-language deep labels.
3. Retained audition planner UNBLOCKED for real sessions: a strict-context guard had
   rejected any studio with a duplicate talent name (generated pools collide by
   design) — the feature had never worked in live play. Fixed at the predicate
   (faithfulness proofs kept); founded-through-the-UI e2e added.
4. World attention marker: one soft warm pool of light on the guidance-target
   building (marquee/brass, slow breath, static under reduced-motion); stands down
   for waiting states and wherever the red decision badge already owns attention.
5. Copy: trap writer-default dead (best available writer, primary-role preferred);
   "auditions optional" → "ready for auditions"; internal ids out of review surfaces;
   single-line waiting copy; audition review leads with the reads; person-panel
   jargon removed; Casting Room de-strands after starting auditions; toast off the
   roster chips; package candidate buttons accessibly named.
6. Golden-path e2e spec (fill name at seal) drives the whole chain guidance-first.

## Gates at seal (fill)
- Root+ui tsc: … · vitest: … files / … tests · Playwright FULL: …
- Red-team verdict: …

## Known defects and honest limits (fill from red-team)
- (carry) No world-mounted package re-entry: "Open the picture's package" uses the
  deep Casting path; retained Package workspace opens only from the casting-review
  handoff.
- (carry) Audition slate cards lack aria-pressed selected state.
- (carry) Casting Room auto-return loses its live-region announcement (legacy path).
- (carry) Person-vs-building click precision near busy buildings.
- (carry) Amber `warning` attention does not suppress the guidance marker (ruled
  correct; Owner may overrule — one-line change).
- (pre-existing) FilmResult.releaseTick reads one week behind in-hand week in
  "released N weeks ago" copy; Escape-after-background-click; 480×270 fold;
  institution LOD band unreachable below ~1920×1080.

## Next hills (recorded, NOT authorized — await Owner's Mechanics Bible planning pass)
1. Film dossier: clickable film card → pan to phase building; tabbed picture window
   (RCT ride-window pattern; research file has the design).
2. First-session golden path upgrades from the research: pre-delivered first
   screenplay (film #1 starts at review), physical audition queues, premiere at the
   Gate, floorplan verb-rooms, trade-paper ticker.
3. The five tycoon-world targets from TYCOON-WORLD-CONVERSION-HANDOFF.md (placed
   facility identity, first visible queue Owner ruling, shooting-week theater,
   second blueprint + economy remeasure, visual warmth pass).
4. Wave-2 finding: commissioning can strip a role the package needs on thin rosters
   (no warning); Owner design call recorded in the log.

## Reading order for the next agent
1. FIRST-MOVIE-JOURNEY-LOG.md (this shift: diagnosis, research verdict, wave
   records, playtest, red-team) 2. docs/research/tycoon-lot-dynamics-synthesis.json
   (the donor design map — largely unbuilt; the next campaign's raw material)
3. TYCOON-WORLD-CONVERSION-HANDOFF.md 4. CODE-MINING-LEDGER.md +
   docs/SHIFT-OPERATIONAL-LAWS.md 5. git log on this branch.
