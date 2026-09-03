# P06D — Owner Comparison Playtest (P06C control vs P06D candidate)

**Both are isolated comparison candidates. Nothing is integrated.** Launch each on the same demo and judge
whether P06D should replace P06C as the living-studio UX candidate. If P06D wins, a later explicit Owner
ruling authorizes integration; if any step is worse, report the exact step.

## Launch (same bundled demo state)
```
# P06C control
zsh "~/Desktop/P06C-Comparison-Candidate-d66b7ab-438feb2/launcher/launch.sh"
# P06D candidate
zsh "~/Desktop/P06D-Comparison-Candidate-050b98e-23c000a/launcher/launch.sh"
```
Player window is 1440×900 (resize / go fullscreen to feel §22). Close the window or Ctrl-C the terminal to quit.

## What changed in P06D (all vs the P06C control)
1. **Movie-rail row anatomy** — rows now lead with the **title** (dominant), then a plain-language state, then
   a **location · time** line (e.g. "Soundstage 12 + Scenery Shop"), a discrete lifecycle track, and one
   restrained attention marker. Six distinct attention states (autonomous / waiting / blocked / action-required /
   release-ready / committed), colour always riding a word + a shape. Long titles ellipsise with a full-title
   tooltip; identity is keyed to the exact picture, never the visible text.
2. **One rail scroll owner** — with many movies the rail scrolls inside a bounded column (wheel / PageUp-Down /
   End) instead of hiding rows or overrunning the lot. No movie is ever hidden by a cap.
3. **Keyboard focus + selection** — Tab moves a blue focus ring through the rows; a click selects (brass ring);
   selected ≠ focused; Enter/Space Locates. UI-Toolkit workspaces show a focus outline too.
4. **Workspaces** — the Production primary action is pinned in a persistent strip (never scrolls off); its
   blocker reads as a danger callout; a disabled CTA no longer looks enabled; the **Casting Back no longer
   outranks the forward action**.
5. **People strip** — the footer is now an actionable "Open Talent" affordance; keyboard-focusable.

## Judge these (the addendum's questions)
- Can I read my slate faster? Does the title hierarchy feel better?
- Is action-required obvious (without flashing)? Is Release Ready clearly a decision, Committed clearly resolved?
- Does the rail handle many movies (scroll, no overrun, no shrink)?
- Do building cards / workspaces feel consistent; does forward action clearly outrank Back?
- Do I need the white guidance card less? Is Talent awareness useful?
- Does the lot remain the star at 1280×800 through fullscreen?
- Is anything more cluttered or less fun? (If so, name the exact step.)

## The truth guarantee (P06C Priority Zero, kept + extended)
A wrapped picture waiting for a Post slot reads the SAME state on the rail, the world Stage card, the
Production workspace, and the guidance card — never "SHOOTING" on one surface and "POST" on another.

## Then
ACCEPT P06D as the replacement candidate, or report the exact worse step. No integration until an explicit ruling.
