# Pass 3 — Review

Vignettes + inspectable ambient life. Evidence in `lot-spike/shots/pass-3/`
(12 screenshots + two ordered PNG frame sequences: `seq-arrival-*`,
`seq-preparation-*`).

---

## Baseline (pass 2)

The lot was grounded, composed, and had authored ambient motion, but nothing ever
*happened*: people walked loops, stages showed static dressing. There was no way to
inspect a person, and no readable "a film is being made right now" beat.

## Implementation summary

- **Deterministic `VignetteDirector`** (`src/lot/vignettes.ts`): seeded scheduling,
  one-major-at-a-time, quiet gap + per-kind cooldowns, a reusable 10-sprite actor
  pool, clean cancel on snapshot/destroy/resize.
- **Four vignettes**: production-arrival, stage-preparation, filming-beat,
  studio-reaction (celebration / publicity / disappointment) — each with a
  begin/action/end and a world marker + activity toast.
- **Character inspection**: ambient + vignette actors are clickable; a light card
  shows role/activity/production/building/description. Building selection has
  priority and supersedes the card; far zoom disables inspection.
- **Roles**: added director + photographer; differentiated by silhouette/prop.
- **Fixtures**: added `celebration` and `disappointment` (debug-selectable) plus
  the existing `struggling` / `successful`.
- **No new snapshot fields; no `Math.random`; no core imports.**

## Evidence reviewed

`production-arrival-{start,action,complete}` — van enters → director walks in →
van departs, with toast + marker. `stage-preparation` — grip + cart at the apron.
`filming-beat` — "Filming — …" toast, marker, crew, take flash (transient).
`studio-celebration` / `studio-disappointment` — gatherings at the theater with
tone-appropriate toasts. `ambient-character-{hover,selected}` — hover scale +
light card. `building-selection-over-character` — the building panel replaces the
card. `vignette-small-viewport`, `quiet-period-overview`, and the two frame
sequences. All inspected.

## Review A — Readability

- Each vignette's broad meaning reads without opening a panel: the **toast names
  it**, the **marker locates it**, the **actors act it out**. *Pass.*
- Ambiguity found & fixed: the character card duplicated the stage name
  ("Working Soundstage A · Soundstage A") → activity shortened to "On set". The
  filming-beat had no static locator (the take flash is momentary) → added a
  marker so the still frame reads. *Corrected.*
- Remaining: at pure overview zoom the actors are small; the toast/marker carry the
  read (by design — detail rewards zooming in).

## Review B — Restraint

- One major vignette at a time; a 7s quiet gap and 20–40s per-kind cooldowns keep
  the lot calm between beats (`quiet-period-overview.png`). *Pass.*
- Attention cues are gentle: a small pin + a pill toast that auto-dismisses; no
  camera hijack, no flashing HUD. *Pass.*
- Movement is purposeful (dwell pauses, clean entrances/exits), not frantic.

## Review C — Emotional value

- The lot is now worth lingering on: the **production-arrival** is the most
  satisfying beat (a car pulls in, a director walks to the stage, crew greet).
- Characters feel more like inhabitants once you can click one and read "Grip —
  On set — Between stage and storage."
- Reactions feel earned: a fresh smash draws a gathering; a flop draws a subdued
  few. Tied to `releasedFilms`, so it reads as consequence, not decoration.
- Limit: with four types on cooldowns, a long watch will start to feel patterned;
  the beats are authored, not surprising.

## Review D — Technical boundary

- No gameplay outcomes invented; eligibility is 100% derived from snapshot facts.
  **Confirmed.**
- No core imports; snapshot never mutated; no save changes. **Confirmed** (`grep`).
- Deterministic: seeded selection, no `Math.random` (comments only). **Confirmed.**
- Clean teardown: snapshot switch cancels the active vignette and frees the pool
  (asserted `poolInUse === 0`); destroy/recreate leaves exactly one canvas; no
  console errors. **Confirmed** by the headless suite.

## Performance observations

- Fixed **10-actor pool** (no per-vignette allocation); vignette plans are built
  once per event; keyframe sampling is O(actors). Ambient agent count unchanged
  from pass 2. No object churn in the update loop beyond the transient take-flash
  circle (tweened then destroyed). No timer/listener leaks observed across repeated
  snapshot switches and destroy/recreate. Smooth at 1440×900, 1920×1080, and the
  1024×640 small viewport.

## Known limitations

- Beats are **authored and finite** — engaging but not surprising over long watches.
- Reaction/celebration fixtures are **debug-selectable**, not host-toggled UI modes.
- The take flash is **transient** (won't appear in an arbitrary still).
- Still **fixture-driven and not live-integrated**: the director reads a snapshot,
  it does not observe a running engine.

## Recommended next milestone

**Live Phase 5 integration planning** (a written integration plan + a thin
`GameState → StudioLotSnapshot` adapter spike wired to the real engine behind a
flag). Three passes have proven the presentation layer end-to-end — place, life,
and moments — entirely from fixtures. The single highest-value next step is to
prove those same facts flowing from the real simulation, not to add a fifth
vignette or migrate to 3D. That is where the remaining risk actually lives.
