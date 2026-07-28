# M3 Accessibility Foundation

Foundational support only (no certification — out of scope). What's present and what's
deferred.

## Present
- **Instant camera-state change (reduced motion):** the rig supports an instant snap
  (`camera(preset, /*instant*/ true)` → `state.cameraInstant`), used by the headless
  capture and available as the reduced-motion path (no lerp). Animated transitions are
  the default; instant is the accessible alternative.
- **Keyboard-accessible camera controls:** the dev overlay camera buttons
  (Overview / Production / Human-scale) are real `<button>`s — focusable and
  activatable by keyboard.
- **Clear focus/selection state:** a ground selection **ring** (shape + brightness,
  not colour-only) marks hover (brass) vs selected (red); a character card + building
  badge label the selection in text.
- **Non-colour cues:** building selection = ring shape; character roles read by
  silhouette + hat + carried prop + stance/clip + grouping, not colour alone.
- **Pause / replay:** the vignette has play + pause/toggle + deterministic seek
  (`playVignette` / `pauseVignette` / `seekVignette`), so motion can be stopped/replayed.
- **Readable labels:** in-world signage (MERIDIAN PICTURES, STAGE 2) + text card/badge.

## Deferred (documented, not built)
- A user-facing reduced-motion toggle in the (future) settings UI wired to the instant
  path; today it's an API/capture path, not an end-user control.
- The brief slate/take **flash** should be suppressed under reduced-motion / photo-
  sensitivity settings — currently always on (short, warm). Flagged for the settings
  pass.
- Full keyboard navigation of in-scene selection (buildings/characters are pointer-
  selected today), screen-reader semantics for the 3D scene, high-contrast mode, focus
  ring styling, and formal WCAG conformance.
