# Project: Studio — Playtest Guide (Phase 5.1 — talent milestone)

This is a thin, playable film-studio laboratory over the proven simulation engine.
It is not a finished product — it is a real game loop you can open and play. The
Phase 5.1 milestone adds a full **multi-discipline talent** layer: a **Talent Hub**,
a redesigned **Talent Creator**, and **talent that develops as it works**.

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
7. **Create your own talent (optional).** Click **Create talent** for the redesigned,
   **staged** creator: you author a person's personality and allocate a **creation budget**
   across their disciplines and skills. The budget is deliberately finite — **you cannot
   mint a free superstar**; a stronger primary means weaker everything else. They appear in
   the hiring pool starting unknown (low fame) and earn their reputation by performing.
8. **Browse the Talent Hub.** Open the **Talent Hub** to inspect people in depth (see the
   Phase 5.1 section below): their four **role OVRs**, **Fit** for a film, **Potential**,
   **Work Ethic**, **Creative Temperament**, any **cross-role** ability, and whether a
   secondary discipline is a proven credit or merely **Capable but Unproven**.
9. **Save and reload.** Open **Saves**, **Export** your game (copy/download the JSON), then
   **Import** it into a fresh game and confirm it continues exactly where you left off. You
   can also **import a legacy save** from an earlier prototype build (see **Saving** below).
10. **Make another film** and compare — try aiming for a *critical* success vs a *commercial*
    one and watch different reputation dials respond. After each release, read the
    **development summary** to see who grew.

---

## New in Phase 5.1 — the talent layer

Talent is no longer a single number. Every person now has **four disciplines** — Acting,
Writing, Directing, and Craft — each built from real professional skills, and the game
shows you a lot more about who they are and how they will grow.

- **Talent Hub.** A dedicated screen to inspect anyone in the world. For each person you
  see:
  - **Four role OVRs** (Actor / Writer / Director / Craft, 1–99) — a broad read of ability
    *and versatility* in each discipline. A specialist can read lower here yet still be
    devastating on a film that plays to their strength.
  - **Fit** — how well they suit the *currently selected* film (this changes with the film;
    OVR does not).
  - **Potential** — a *rough* estimate of how much room they have to grow. It is honestly
    fuzzy: it may read high or low relative to the truth, and the true ceiling is never shown.
  - **Work Ethic** — affects **how reliably they improve over time**, not their quality on
    any given release. Two people with identical skills perform identically today; the
    higher-Work-Ethic one pulls ahead only through development.
  - **Creative Temperament** — a personality read (derived from persona), separate from raw skill.
  - **Cross-role** — many people have a usable secondary discipline. The Hub distinguishes a
    **credited** career identity (they've actually done the job) from **"Capable but
    Unproven"** (the ability is there, but no credits yet — the game never invents credits).
- **Redesigned Talent Creator.** A staged flow with a **creation budget**: you shape a
  person across disciplines and skills within a fixed allowance, so **there is no free
  superstar** — strength somewhere is paid for with weakness elsewhere.
- **Development in play.** When a film **completes and releases**, the people who worked on
  it **develop** — only in the discipline they actually performed, and only up to their own
  potential. After each release you get a **development summary**: which skills moved, each
  person's **OVR before → after**, an explicit line when there was **no measurable increase**,
  and honest notes on Work Ethic / Potential — all **without** revealing hidden ceilings or
  the dice. A canceled film develops no one; a flop still teaches.
- **Legacy-save import.** Saves from the earlier prototype (before the talent layer) can be
  imported and are **converted** into the new format deterministically — your studio
  continues exactly, with each old person given a full, comparable multi-discipline profile.

Screenshots of these screens are in `ui/screenshots/` (`1-start-new-game.png` …
`10-talent-hub-profile.png`) — see especially `8-development-summary.png`, `9-talent-hub.png`,
and `10-talent-hub-profile.png`.

---

## Assembly is now legible (latest change)

An earlier playtest found film assembly **opaque** — hard to tell what a package really was,
or why the forecast said what it said. Assembly has been rebuilt to show its reasoning. This
is display only: it reads the same engine, it does not change how any film turns out.

- **Film Package summary** — a persistent panel (in assembly and in the greenlight review)
  that reads your film across **four separate dimensions**, each honestly labeled:
  - **Creative Cohesion** — how coherent the *creative brief itself* is (shape / promise /
    intended audience), independent of who you hire.
  - **Talent Fit** — how well each person you've hired suits *this* film (writer, director,
    each cast slot, crew), plus an overall read, the weakest link, any severe mismatch, and
    any slot still unfilled.
  - **Execution Confidence** — how confident the studio is it can *deliver* this film: how
    wide the expected-performance ranges are, the forecast confidence tier, whether the
    budget is adequate, and any unproven cross-discipline hire.
  - **Commercial Outlook** — the studio's revenue and profit ranges, the break-even point,
    confidence, and the upside/downside.
- **Richer candidate cards + sort/filter** — each hiring candidate now shows their **Fit**
  and **Expected Performance** for the current role, **Star Power**, salary, genre
  experience, strengths, a weakness, and any cross-role ability (expand for detail). The list
  is **sorted by Fit** by default, and you can **filter** ten ways (by strength, Fit tier,
  OVR, salary, Star Power, genre experience, proven vs unproven, specialists,
  multi-hyphenates, and availability).
- **Change preview on swap** — swap a person and you see exactly what changes (the real
  before/after deltas), so you can compare choices instead of guessing.
- **Film Readiness panel** — a plain read of what's **strong** and what's **risky** about the
  package as assembled, drawn from the four dimensions above (there is no hidden overall
  score behind it).
- **Autopsy compare** — after release, the autopsy now shows the **greenlight assessment you
  locked in** next to what actually happened, and **which risks materialized** — so you can
  check the studio's pre-release read against reality.
- **Crew is now assignable** — you can now hire the **crew / craft** slot during assembly
  (previously it was stuck empty). This was the concrete blocker the last playtest hit.

Two things are stated plainly in the UI so nothing misleads you:

1. **Creative Cohesion here means the creative brief's own coherence** (shape / promise /
   audience), *not* how well a specific cast's personalities mesh. It is deliberately shown
   independent of who you hire.
2. **"Studio Revenue" is the full box office.** This model has no distributor or rental cut,
   so the studio is shown receiving the full gross — the number is the whole ticket total,
   not a studio-only share.

---

## Saving

- **Export:** open **Saves → Export**. Your entire game is a `SaveFileV2` JSON (the talent
  format) you can copy or download.
- **Import:** open **Saves → Import**, paste the JSON, and continue. A malformed or
  unknown-version save is rejected with a clear message (it will not silently corrupt play).
- **Legacy imports:** a save from the earlier prototype (a `SaveFileV1`, before the talent
  layer) is accepted and **converted** to the new format on import — deterministically, so
  the same legacy save always converts the same way and your run continues exactly.

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
