# TIME MODEL DOCKET — ADDENDUM UNDER THE OWNER'S LIVING-TIME RULING

> Architect reconciliation, 2026-08-18. Reconciles `08-time-model-docket.md`
> (written before the ruling arrived) with `00A-OWNER-RULING-TIME-MODEL-2026-08-18.md`.
> Where the two disagree, the ruling governs. The docket's evidence stands; its
> question changed from WHETHER to HOW.

## What the ruling changes in the docket

1. **The docket's recommendation ordering is superseded.** Lane 8 recommended
   B1-extended (witnessed week playback, manually advanced) and keeping the
   standing prohibition on autoplay/pause/speed for C2. The Owner has now ruled
   the final experience must not depend on pressing "Advance Week"; simulation
   time flows while unpaused, with pause and speed control. Auto-advance is
   therefore IN C2, not deferred.
2. **The ten frozen-contract refusals of "autoplay / pause / speed controls /
   second clock" are SUPERSEDED by Owner order** (the C2 charter records the
   supersession explicitly, by document and line, in its governance section).
   They were correct law for their campaigns; they are not law for C2.
3. **Lane 8's Model C refutation stands and is strengthened.** The ruling asks
   for the living-time *grammar* of the referenced games, while explicitly
   preserving deterministic Engine authority and forbidding wall-clock/frame-rate
   authority. Continuous engine simulation (Model C) is not required to deliver
   that grammar and remains refuted for C2 on the recorded cost grounds
   (economy re-baseline, the 3,318-test calibration floor, V14 semantic
   reinterpretation of twelve save versions).
4. **Lane 8's B3 deferral stands.** Beats inside `tick()` are not needed to
   deliver the ruling's proof sentence and would casually expand C2 (which the
   ruling itself forbids). B3 remains a paper spike routed to C3+; the
   BEATS_PER_WEEK authority contradiction (CODE-MINING-LEDGER.md:80-83 vs
   src/core/presence.ts:18-24) is resolved FOR C2 in favor of the shipped
   presence.ts contract: beats are presentation canon, not outcome law.

## The HOW: Living Turn V1 (C2's time model)

**Substrate (unchanged, non-negotiable):** the engine's discrete week remains the
only authoritative clock. `tick()` stays pure `(state) => state`; the engine never
observes wall time (verified: zero Date.now/performance.now/setTimeout/Math.random
in src/core); renderer frame rate and animations remain evidence only.

**The loop (new, UI-owned):** while the studio is UNPAUSED, the app runs a
presentation scheduler:

1. Play week N as witnessed time using the shipped 10-beat playback
   (`ui/src/lot/tycoon/playback.ts`, PLAYBACK_BEAT_MS pacing), widened by C2's
   theater projection to the manufacturing loop (stages hot, scenery moving,
   queues standing, wrap clearing).
2. At the end of the played week, the scheduler commits exactly the same
   authoritative advance a player's "Advance Week" press commits today — the
   identical adapter action, producing the identical `SimResult`.
3. Consult the engine-derived stop ladder — **partitioned** (a charter ruling
   the Owner ratifies; C2 charter §4.1): **PAUSE-class** stops (the player's
   decision is genuinely required, or a ceremony plays): `release` (Premiere),
   `scriptReview`, `castingReview`, `productionDecision`, `cashNegative` — the
   loop AUTO-PAUSES with the stop surfaced exactly as today. **NOTIFY-class**
   stops (`wrap`, `runCompleted`, `constructionCompleted`, `contractExpired`,
   `renewalWindow`) surface through the existing attention/badge channel and
   the played week's beats; the loop CONTINUES. Without the partition, a busy
   studio pauses every week or two and the proof sentence is defeated by the
   spec itself. The batch fast-forward verb keeps the FULL unpartitioned
   ladder — its semantics are unchanged.
4. **Pause** freezes the scheduler (never the engine — there is nothing to
   freeze; no tick is in flight between commits). **Speed** multiplies playback
   pacing: a named ladder **1× / 2× / 4×** on PLAYBACK_BEAT_MS (4× is the
   ceiling; ~11.5s → ~2.9s per week). Above 2×, Class-B witnessed beats
   (arrivals, wrap clears, premiere walks) collapse to final positions via the
   existing reduced-motion path while Class-A state stays continuous — speed
   never produces half-played ceremonies. Reduced motion honors the existing
   law — instant final positions — while the cadence itself continues.
5. **"Advance to next event" survives as fast-forward**: the existing batched
   `advanceToNextEvent` remains available as an explicit convenience verb, and
   keeps operational law 3 (a skipped batch is one stop and one summary, never
   narrated week theater).

**The mandatory engineering rule (LL EX, lane 8):** the scheduler consumes the
adapter's exported per-tick stop predicate. The ten-reason priority ladder is
never re-implemented in React.

**Determinism proof obligation:** the same seeded action script produces
byte-identical exported saves whether weeks were advanced by hand, by the living
loop at any speed, paused/resumed arbitrarily, or batch-skipped. The living loop
emits *actions*; it never becomes an authority. (This extends PF1's
presentation-parity gate to time itself.)

**Hidden tab / renderer sleep:** the scheduler pauses whenever the renderer is
paused (`document.hidden` — the deliberate CPU-saver PF1 §0.7 records; quoted
verbatim in `13-PF1-CHARTER-EXCERPTS-APPENDIX.md`). Living
time never advances a studio nobody is watching; that is the grammar of the
referenced games (their worlds also stop when the machine is closed) and it keeps
QA/automation deterministic.

**The proof sentence, made mechanical (C2 acceptance):** launch a founded studio
with work in flight, unpause, and touch nothing: production phases advance,
stages occupy and release, scenery arrives, a queue drains when capacity frees,
and the loop auto-pauses on the first decision that needs the player — with a
scripted e2e asserting state actually advanced N weeks and a parity run proving
byte-identical saves against a hand-advanced twin.

## What C2 deliberately does NOT take

- Sub-week engine time, beats inside tick, or any second authoritative clock (C3+ docket).
- Speed-dependent outcomes of any kind.
- Living time on non-Lot screens (the Dashboard keeps explicit advance verbs).
- Removal of the manual "Advance Week" verb — it remains for players who want
  turn-like control; the ruling demotes it from *required heartbeat* to *option*.

## Timeline law consequences recorded here

The campaign-start-1920 / no-calendar-game-over / through-2040+ law is C4
implementation scope, but Living Turn V1 must not hard-code any calendar
assumption: the scheduler is week-indexed, era-agnostic, and nothing in C2's
time lane may treat any year as terminal.
