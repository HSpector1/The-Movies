# Project: Studio — Playtest Guide (Phase 5 / M1A)

This is a thin, playable film-studio laboratory over the proven simulation engine.
It is not a finished product — it is a real game loop you can open and play.

---

## Launch it (one time setup, then run)

From the repository root (`/Users/bruce/The Movies`):

```
npm install          # installs the UI toolchain (one time)
npm run dev          # starts the app
```

Then open in a desktop browser:

**http://localhost:5173/**

To stop the app: press `Ctrl+C` in the terminal running `npm run dev`.

*(Everything runs locally in your browser. There is no server, account, database, or
internet dependency once installed.)*

---

## Recommended first seed

On the start screen, use the seed:

**`studio-001`**

The seed determines the entire world (the talent, the concepts, the market). **The same
seed always produces the same world**, so you and I can compare notes on the exact same
studio. Try a different seed any time for a fresh world.

---

## Your first session (10–15 minutes)

1. **Start.** On the start screen, enter the seed `studio-001` and click **New game**.
2. **Read the dashboard.** Note the current **week** (0), your **cash**, and the three
   reputation dials — **Audience Awareness**, **Industry Prestige**, **Commercial
   Confidence** — each with a one-line meaning. Nothing is in production yet.
3. **Assemble a film.** Click **Assemble a film** and go through the stages:
   - **Concept** — browse the film concepts; pick one (note its genre and what it needs).
   - **Shape** — choose the story's opening, midpoint, and ending. Each option explains
     its creative effect. There is no "best" choice.
   - **Promise** — set what you're telling audiences to expect (the center and breadth of
     each axis) and which audiences you intend to reach.
   - **Talent** — hire a **writer**, a **director**, and a **lead / antagonist / support**
     cast. Unavailable people are disabled with a reason (e.g. already in production).
   - **Budget** — set the production and marketing budgets. Watch the **required cost**,
     **total committed cost**, and your **cash**.
   - **Review & forecast** — read the studio's **forecast** (expected opening, total,
     critic score, per-segment bands, confidence). **This is an estimate, not a promise**
     — it is clearly tagged. When you're happy, **Greenlight**.
4. **Advance time.** Back on the dashboard, click **Advance one week** repeatedly. Watch
   the production's **weeks left** count down. A film greenlit now releases 8 weeks later.
5. **See the release.** When your film releases, you'll get a **result panel** — critic
   score, audience response, box office, profit or loss, and how your reputation moved.
6. **Open the autopsy.** From the release (or the dashboard's recent releases), open the
   **autopsy**. This is the heart of the game: it explains *why* the film turned out the
   way it did — craft, cohesion, each collaborator's contribution, the promise you kept or
   broke, the critics, the box office, and exactly why each reputation dial changed.
7. **Create your own talent (optional).** Click **Create talent**, author a person's
   personality, and see them appear in the hiring pool. (They start unknown — low skill
   and fame — and earn their reputation by performing.)
8. **Save and reload.** Open **Saves**, **Export** your game (copy/download the JSON), then
   **Import** it into a fresh game and confirm it continues exactly where you left off.
9. **Make another film** and compare — try aiming for a *critical* success vs a *commercial*
   one and watch different reputation dials respond.

---

## Saving

- **Export:** open **Saves → Export**. Your entire game is a `SaveFileV1` JSON you can copy
  or download.
- **Import:** open **Saves → Import**, paste the JSON, and continue. A malformed or
  wrong-version save is rejected with a clear message (it will not silently corrupt play).

---

## Reporting a bug

Tell me, in plain English:
- the **seed** you used,
- what you **did** (the sequence of clicks),
- what you **expected** vs what **happened**,
- and, if you can, **export the save** at the moment it went wrong and send me the JSON
  (that reproduces your exact game deterministically).

---

## What feedback is most useful

Please notice, as you play:

1. Did each **choice feel understandable**?
2. Could you **form an intended kind of film** (e.g. a small prestige drama, or a big
   crowd-pleaser)?
3. Did the **forecast influence** your decision?
4. Did the **release surprise you fairly** — or feel arbitrary?
5. Could you **explain why** the movie succeeded or failed, using the autopsy?
6. Did the **three reputation dials feel different** from one another?
7. Did you **care about the film as a work**, or only about its final score?
8. Did you **immediately want to make another** film?
9. Did any screen feel **confusing or tedious**?
10. Did you encounter the currently **rare prestige identities** (a studio that's
    critically respected but not widely known)?
11. Did the **absence of news/headlines** (Broadcast, deliberately deferred) matter to
    you in this first session?

I am not collecting analytics — you answer these by playing and telling me.

---

## Known limits of this prototype (so nothing surprises you)

- **No headlines yet.** The "Broadcast" news layer is deliberately deferred (Phase 6); the
  engine produces no headlines under the current model, so the UI shows results directly.
- **Craft hires are simplified.** Behind-the-scenes craft quality is fixed for now (M1A).
- **Desktop-first.** Best on a laptop/monitor; there is no mobile layout or accessibility
  program in this prototype.
- **The rarer "prestige-high / low-awareness" and "confidence-low / high-awareness"
  studio identities are uncommon** by design (see `M0A-REPORT.md`).
