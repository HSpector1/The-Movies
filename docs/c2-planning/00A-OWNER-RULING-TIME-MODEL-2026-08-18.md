# OWNER RULING — TIME MODEL CLARIFICATION (2026-08-18, mid-planning)

Received during C2 advance planning, after the twelve recon lanes ran. This ruling
AMENDS the shared brief (`00-C2-PLANNING-BRIEF.md` law 9) and PARTIALLY SUPERSEDES
the framing under which `08-time-model-docket.md` was written. Where that report
weighs "whether living time is desirable," this ruling overrides it; where it
analyzes "how," it stands as evidence.

## The ruling (verbatim intent, restated)

1. **The final Project: Studio experience must not depend on the player pressing
   "Advance Week" or "Advance to Next Event" for the world to live.**
2. The desired player experience is the living-time grammar of The Movies,
   Zoo Tycoon, RollerCoaster Tycoon, and The Sims: **simulation time flows while
   unpaused; the player may pause and change speed.**
3. "Advance to next event" may survive as an **optional convenience/fast-forward**,
   but must not remain the fundamental heartbeat of the game.
4. **Deterministic Engine authority is preserved.** Renderer frame rate, animations,
   and wall-clock timing are never authoritative.
5. The C2 Time Model docket now answers **HOW** to deliver living time, not whether
   a manually advanced weekly game is an equally desirable final experience.
6. **Investigate Living Turn first** and define the **smallest C2 implementation**
   that can prove: *"I can stop touching the controls and my movie studio keeps
   operating visibly and meaningfully."*
7. **Do not expand C2 casually beyond its existing scope.** Fold this into the
   Sets/Stages/queues/simulation-theater architecture.

## Long-term timeline law (recorded now; mostly lands in C4)

- The campaign **begins in 1920**.
- There is **no hard calendar game-over**.
- Authored progression must support **at least through 2040**.
- Historical progression may transition into **plausible alternate-future
  progression** after the contemporary period.

C2 consequences of the timeline law (binding on C2 design, implementation in C4):
no C2 system may hard-code the 1948 founding era into new schema or content
(sets, stages, premiere, queue copy must key off `EraConfig`/era registry where
era-sensitive); the Founding Flip's fresh-start definition must not assume a
fixed calendar year; nothing C2 ships may create a calendar ceiling.
