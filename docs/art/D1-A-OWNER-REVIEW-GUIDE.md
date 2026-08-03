# D1-A — Owner Review Guide

Two ways to review: **look at the captured evidence** (fastest), or **run the live proof** and
drive the review selector yourself.

## Option 1 — the captured evidence

After running the evidence spec (below), the shots are written to
`out/d1a-identity-evidence/`. The required views:

| # | File | What to check |
|---|---|---|
| 1–4 | `overview-{1920,1366,1280,zoom125}-baseline.png` **vs** `-conceptA.png` | matched pairs, identical state/seed/framing — the revised identity vs the shipped D1 lot at each viewport + 125% zoom |
| 5 | `gate-overview.png` | PROJECT STUDIO banner + PS emblem read as the primary landmark |
| 6 | `gate-selected.png` | gate banner + emblem + selection ring |
| 7 | `stage-ab-comparison.png` | large facade STAGE A vs STAGE B identifiers |
| 8 | `both-stages-active.png` | both stages lit, independently |
| 9 | `theater-released.png` | marquee canopy shows the release title |
| 10 | `theater-no-release.png` | static `THEATER` marquee (no-release state) |
| 11 | `warning-state.png` | Administration ATTENTION badge (financial pressure) |
| 12 | `reduced-motion.png` | Concept A, motion frozen, fully readable |
| 13 | `fallback.png` | identity hidden, base lot + nav fully intact |
| 14 | `clean-overview-hidden.png` | **the production-camera judgment** — review overlay removed |
| 15 | `performance-panel.png` | fps · objects · identity-object count |

The two most useful views: the **matched overview pair** at #1 (`overview-1920-baseline.png` next
to `overview-1920-conceptA.png`) and the **clean production view** at #14
(`clean-overview-hidden.png`).

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
mode** — plus a small performance readout (fps · objects · identity) and a **Hide** button that
removes the overlay for a clean production-camera view (restore it with the small pill that
appears top-right). Switch between the modes to compare. (For hard-to-reach states like two
concurrent productions or a financial-pressure warning, the captured evidence uses seeded
fixtures; live, you will see whatever your current studio is doing.)

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
