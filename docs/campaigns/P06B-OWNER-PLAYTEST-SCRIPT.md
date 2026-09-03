# P06B — Owner Playtest Script (§31)

A concise normal-person test of the Living Studio UI/UX pass. You should be able to do all of this
without any technical explanation. If any step needs a manual or feels like "operating forms over a
studio," that is a finding — note it.

## Launch

The sealed P06B candidate is at `~/Desktop/P06B-Owner-Candidate-<ts>-<unity>/` (see its README for the
exact one-command launcher, which starts the bridge on a profile and opens the windowed player). The
player is the macOS app in `player/`. Launch it, let the lot appear.

## The walk

1. **Look at the lot.** Several movies are progressing. The 3D studio lot is the biggest thing on
   screen — buildings, crew, vehicles. It should feel like a place, not a menu.
2. **Read the top strip (executive HUD).** Week (`1920 · WK N`), Pause / 1× / 2× / 4× (the ACTIVE
   speed is a filled brass chip — unmistakable), cash and weekly direction. It stays present even
   when the window is small (try resizing narrow — the heartbeat must not vanish).
3. **Read the right-side movie rail.** Every active movie is a row: its exact title (no clipping), a
   lifecycle chip (DEVELOPMENT / CASTING / PRODUCTION / POST / RELEASE READY / COMMITTED), a
   six-segment track showing where it is, a time-or-waiting line, and LOCATE. The movie that needs
   you (RELEASE READY ▸) stands out; a queued one reads "· WAITING" in amber; a committed one is
   green "Releases next week".
4. **Use a physical building without touching the rail first.** Click the Casting/Talent, Production,
   Development, or Production/Post building on the lot. It responds with its own card — you did not
   have to prime the rail.
5. **Open a movie from the rail as a shortcut.** Click a rail row / LOCATE — it selects and moves the
   camera to that exact movie's building. It never commits anything.
6. **Find Talent.** The Casting / Talent building is on the lot; when Casting is short the route
   guides you to find an actor. (A dedicated persistent People rail is future scope.)
7. **Open the Production/Post building.** See its state.
8. **Hold a Release-Ready film.** Nothing releases until you commit — "advance the week" holds it.
9. **Commit the exact title to Release.** The memo's "Commit `<title>` to release" is irreversible and
   advances no time; the rail flips that movie to COMMITTED · Releases next week.
10. **Save, then Load** (Studio Menu — MENU top-right, or Esc). Confirm the exact movie/person/building
    state returns.
11. **Use Locate and Back**; **Esc/Menu/Quit** to leave.
12. **Confirm NO release results appear** — no critic score, box office, rank, or awards. Committed
    shows only "releases on the next studio week."

You should finish this without technical help. Then either ACCEPT the P06B candidate or report the
exact step where it failed.
