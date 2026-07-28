# Pass 3 — Vignette Design

How the studio lot occasionally shows a small, readable moment from the making of
a film, and how ambient characters became lightly inspectable. Everything here is
**cosmetic and presentation-driven**. The lot invents no gameplay truth.

---

## Goal

Pass 2 made the lot pleasant to look at. Pass 3 makes it **rewarding to observe**:
the player glances at an active soundstage, notices a director arrive or a take
being filmed, can click a person to learn what they are broadly doing, and feels
their movie is physically being made — without the presentation layer becoming a
second simulation.

## Vignette grammar

Every vignette has: a **readable beginning**, a **visible action**, a **clear
ending**, a **reason it belongs to the current studio state**, a **cooldown**
before it can repeat, and **no effect on simulation truth**. The broad event is
understandable without opening a panel (a world marker + a one-line activity toast
name it; the actors act it out).

Implemented types (`src/lot/vignettes.ts`):

| Kind | Eligibility (from snapshot) | What you see |
|------|------------------------------|--------------|
| **production-arrival** | busy studio + an active stage | a studio van enters, pauses at the apron; a **director** steps out and walks to the stage doors; crew greet; the van departs |
| **stage-preparation** | an active stage | a **grip** wheels a gear cart from storage to the apron; crew gather; the stage is emphasized (doors/light); crew disperse |
| **filming-beat** | an active stage | a **slate** is held at the doors; a "take" flash fires; nearby ambient life goes briefly quiet; the recording light pulses; normal life resumes |
| **studio-reaction** | a release within ~6 weeks | staff gather at the theater (celebration/disappointment) or gate (publicity, with a **photographer**); tone follows the release's reception |

We do **not** depict the filmed scene inside a stage.

## Visual staging

- Vignettes are staged at authored ground anchors (`STAGE_APRONS` for stages; the
  theater forecourt / gate for reactions), so actors enter and exit cleanly and
  never pop into existence mid-frame (actors are hidden between keyframes at the
  route ends).
- Actors move along timed keyframes with easing-free linear interpolation and
  face their travel direction. Anticipation and readable pauses come from dwell
  keyframes (e.g., the van sits at the apron before departing).
- One optional **world-space marker** (a small pin naming the location) and one
  optional **activity toast** punctuate the event. Neither seizes the camera.

## Event eligibility & determinism

Eligibility is read live from the `StudioLotSnapshot` — active productions drive
arrival/preparation/filming; `releasedFilms[].reception` + `weeksAgo` drive the
reaction and its tone. **No new snapshot fields were added**: the moments are
honestly derivable from facts the host already supplies (see §"Presentation
contract" below).

Determinism: the director seeds a per-event RNG from `sceneSeed` + an event
counter, so for a given snapshot+seed the **order** of vignettes and the cosmetic
choices are reproducible; there is **no `Math.random`**. Timing is driven by fixed
cooldown/quiet gaps, so pacing is stable. For tests and screenshots the director
exposes `force(kind, phase)` and `seek(t)` (debug-only) so any moment can be
reproduced exactly.

## Cooldown & restraint rules

- **One major vignette at a time.** A new one starts only when none is active.
- **Quiet gap** (`QUIET_GAP = 7s`) after every vignette; ordinary ambient life
  continues in between.
- **Per-kind cooldowns** (20–40s) prevent the same beat repeating back-to-back.
- Durations are **8–14s**. Nothing loops immediately; the scene keeps calm periods
  (see `quiet-period-overview.png`).

## Camera policy

The director never moves the camera. It may show a subtle marker and a toast; the
player chooses whether to zoom in. Named framings (`production`, `theater`,
`entrance`, …) exist only for presentation/screenshots and are player-invoked.

## Interaction hierarchy

1. **Buildings & productions** — primary. Pixel-perfect, large targets.
2. **Critical studio state** — the top bar / info panel.
3. **Ambient inspection** — secondary, lightweight.
4. **Decorative life** — non-interactive dressing.

Characters sit above buildings in depth, so a click on a visible character
inspects the character (Phaser `topOnly` input); a click anywhere else hits the
building. Selecting a character clears the building selection (closes its panel);
selecting a building **supersedes** and dismisses the character card. At far zoom
(< 0.55) characters are not inspectable — only buildings.

## Character inspection

Clicking an inspectable figure opens a **light card** (smaller than the building
panel, brass left-edge) showing only what the lot may know: role, current cosmetic
activity, associated production/building when relevant, and a short atmospheric
line. Roles: Production Crew, Office Staff, Talent, Grip, Director, Studio Driver,
Publicity Photographer. The card holds **no** needs, stats, careers,
relationships, schedules, or predictions. Vignette actors are inspectable while
the vignette runs and describe their current beat.

## Character differentiation

Distinguishable at observation distance by silhouette + prop, not color alone:
crew (hard hat), office (clipboard), talent (pale coat + scarf), grip (hand-cart),
director (long coat + fedora + rolled script), photographer (crouch + camera).

## Presentation contract changes

- **No `StudioLotSnapshot` fields were added.** All eligibility derives from
  existing facts. This was a deliberate choice (the pass-1 boundary said "prefer
  deriving") — the example `LotMoment` type in the brief proved unnecessary.
- New **view events** (presentation only, not snapshot state): `character`
  (a `CharacterInfo` or null) and `activity` (a toast string or null). Surfaced as
  `onCharacter` / `onActivity` callbacks on `StudioLotView`.
- New **debug-only** view methods (isolated from player UI): `forceVignette`,
  `pauseVignettes`, `seekVignette`, `firstInspectableScreen`, and an extended
  `getDebugState()`.

## Rejected concepts

- **Adding `LotMoment[]` to the snapshot** — unnecessary; eligibility is derivable,
  and adding it would push authored "when" decisions into the contract.
- **Depicting the filmed scene** — out of the fantasy and the boundary.
- **Auto-focus camera on events** — violates the "player stays in control" rule.
- **Per-agent AI / needs / schedules** — explicitly non-goals; motion is authored.
- **Dozens of shallow vignettes** — the brief asked for four polished types.
