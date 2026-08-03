# D1-A — Owner Review Guide

Two ways to review: **look at the captured evidence** (fastest), or **run the live proof** and
drive the review selector yourself.

## Option 1 — the captured evidence (16 shots)

After running the evidence spec (below), the shots are written to
`out/d1a-identity-evidence/`. The 16 required views:

| # | File | What to check |
|---|---|---|
| 1 | `overview-1920x1080.png` | Concept A identity reads cohesively at full size |
| 2 | `overview-1366x768.png` | still legible at a common laptop size |
| 3 | `overview-1280x720.png` | legible at the short viewport |
| 4 | `overview-zoom125.png` | holds up at 125% browser zoom |
| 5 | `gate-selected.png` | gate wordmark + PS emblem + selection ring |
| 6 | `stage-a-active.png` | Stage A plaque + ACTIVE badge (one production) |
| 7 | `stage-b-active.png` | Stage B active treatment (within the two-stage state) |
| 8 | `both-stages-active.png` | both stages lit, independently |
| 9 | `theater-release.png` | burgundy marquee shows the release title + RELEASE badge |
| 10 | `warning-state.png` | Administration ATTENTION badge (financial pressure) |
| 11 | `reduced-motion.png` | Concept A, motion frozen, fully readable |
| 12 | `identity-fallback.png` | identity hidden, base lot + nav fully intact |
| 13 | `keyboard-focus.png` | focus-visible ring on a companion-nav item |
| 14 | `companion-nav.png` | accessible destination list alongside the identity |
| 15 | `performance-panel.png` | fps · objects · identity-object count |
| 16 | `comparison-baseline.png` + `comparison-concept-a.png` | same state, D1 vs Concept A |

The single most useful pair is **#16**: `comparison-baseline.png` (the shipped D1 lot) next to
`comparison-concept-a.png` (the same state with the identity on).

## Option 2 — run it live

```bash
# from the repo root
npx playwright test --config ui/playwright.config.ts lot-identity   # regenerates the 16 shots
```

Or drive it by hand:

```bash
npx vite --config ui/vite.config.ts        # start the app
```

Then in the browser console, enable both flags and reload:

```js
localStorage.setItem('project-studio.flags.studio-lot-overview', '1')
localStorage.setItem('project-studio.flags.studio-lot-identity-proof', '1')
location.reload()
```

Open the Studio Lot. A dev-only **Identity review** bar appears over the lot with exactly four
options — **Current D1 baseline · Concept A — Golden Age Deco · Fallback mode · Reduced-motion
mode** — plus a small performance readout (fps · objects · identity). Switch between them to
compare. (For hard-to-reach states like two concurrent productions or a financial-pressure
warning, the captured evidence uses seeded fixtures; live, you will see whatever your current
studio is doing.)

## What to look for

- Does Concept A make the lot read as a **studio** — named stages, a marquee, an emblem — at
  the management camera?
- Is the identity **cohesive** (one palette, one type voice) and **original** (no resemblance
  to a real studio's marks)?
- Does it stay out of the way of production information (cards, dressing)?
- Baseline vs Concept A: is the base lot genuinely **unchanged** when identity is off?
- Fallback: when identity is off/failed, is **everything still reachable**?

## The decision

Reply with one of:

- **EXPAND TO CONCEPTS B/C** — author the two alternates for a head-to-head.
- **REVISE CONCEPT A CORE** — name the element to fix first.
- **STOP — CONTRACT DECISION REQUIRED** — identity is a bigger question than this slice.

Nothing expands automatically. This branch is unmerged and the flag is default OFF, so nothing
ships until you say so.
