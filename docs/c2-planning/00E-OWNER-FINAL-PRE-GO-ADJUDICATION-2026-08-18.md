# OWNER RULING — C2 FINAL PRE-GO ADJUDICATION + SUCCESS BLUEPRINT ALIGNMENT (2026-08-18, fifth ruling set)

Received after the r3.1 freeze. **The charter remains FROZEN**; this ruling set
resolves every remaining GO-sheet decision and directs a bounded docs-only
amendment (r3.2). No broad replanning; no production code. C2 remains stopped
until **PF1 seals + explicit Owner GO**. A canonical Success Blueprint now exists
and largely confirms the architecture; its "living studio: OWNER RULING REQUIRED"
status is stale — the pillar is **C2-authorized / IN PROGRESS**.

## Adjudications (charter §18 items → RULED)

1. **Structure ACCEPTED** (§22/§1): C2a/C2b split; RSG V1 in C2a-M3 (never moved
   out for milestone size); Sets/Stages/throughput core; Living Turn V1;
   venue-independent Premiere; no Theater dependency. → items 2, 5, 6 RULED.
2. **Living Studio RESOLVED** (§2): simulation time flows while unpaused;
   Pause/1×/2×/4×; advance-to-event = convenience; engine authoritative; the
   enumerated refusal clauses superseded as required. → item 3 RULED.
3. **Concurrency** (§3): **3–4 is a mature balance/throughput TARGET, NOT a
   maximum.** Binding law: *CAPACITY AND RESERVATIONS LIMIT THROUGHPUT; A GLOBAL
   MOVIE COUNTER DOES NOT.* Legitimately built capacity may exceed four
   simultaneous productions. Dev/casting binding first at founding and the
   stage+set composite binding at maturity is desirable emergent behavior.
   Crew/Director/Star capacity stays deferred. → items 1a, 1b, 1d RULED.
4. **Queue law confirmed** (§4); Remedy-bearing surfaces preserved.
5. **RESOURCE RELEASE — the HOLD recommendation is REVERSED** (§5). Binding
   product law: *a scarce resource is held only while the current phase
   genuinely requires it; when a phase's work COMPLETES, that phase's resources
   RELEASE, even if the next resource is unavailable* — shooting completes →
   stage/set release → the production queues for Post holding nothing → the
   stage is free for another shoot. Completed work never hostages an old
   resource. r3.1's §3.2 chose HOLD, so this is a design amendment, not a
   restatement — encoded in r3.2 (§3.2, §4.3, §15, §18 item 7-i). Retention
   across rehearsal→shooting stands (shooting genuinely requires stage+set).
6. **RSG ownership resolved** (§6): C2 owns V1 substrate (throughput, unbounded
   supply, permanent identity, generated titles, rename, skeletons, beats,
   roles, Set demand, queue integration, historical-identity compatibility);
   C4 owns deepening (era premises, richer vocabulary, genre evolution,
   research, cultural conditions). The 30 concepts are not the lifetime supply.
7. **Mint-at-commission-commit ACCEPTED** (§7) with binding identity invariants
   (permanent once minted; never recycled; existing `FilmConcept.id` never
   re-minted; append-only; rename = display title only, never identity or
   deterministic keys). All already chartered (§3.5, `persistedConceptIds`).
8. **Title evidence handling CORRECT** (§8): distinction preserved; the M3
   corpus-question row files as planned; implementation does not block on it.
9. **WRITER EXPERIENCE — the charter recommendation is CHANGED** (§9). Binding
   successor behavior, implemented IN C2 (not deferred to C4): *WRITER
   EXPERIENCE AFFECTS WRITING SPEED, NOT SCRIPT QUALITY; SCRIPT OFFICE TIER
   OWNS THE ACHIEVABLE QUALITY CEILING; additional writers may accelerate
   completion via the bounded pooling system.* No compensating writer-quality
   bonus is invented. Acceptance/tests update accordingly (SOURCE-FIRST
   DESIGN). → item 9a REVERSED; consequences encoded in r3.2: the shipped
   writer-quality term (40% of draft strength) is re-based out; draft duration
   becomes a bounded deterministic function of blueprint richness, writer
   experience, and pool size (min 1 week, named TUNING); `ScriptProject`
   gains a bounded writers list (≤5, the corpus bound) under the §8.3
   version-aware boundary rule; the one-week draft invariant and the
   writer-quality assessments join §11.8's re-based category with named
   successors. r3.1's "multi-writer pooling OUT / variable draft length OUT"
   deferrals are superseded by this ruling (§9/§10 name writer pooling as
   V1 floor material). Item 9b (office tier as additive uplift rather than a
   literal hard cap) STANDS as chartered: with the writer-quality term removed,
   the office uplift is the ONLY quality lever, which is precisely "office tier
   owns the achievable ceiling" in our economy's vocabulary. Item 9c stands.
10. **Screenplay shape** (§10): the research floor governs; causal chain
    *Genre → Story Structure → FilmShape → Screenplay Blueprint → Roles/Sets →
    Physical Production → Movie Quality*; RSG is never random-title +
    random-number; screenplays produce meaningful production demand.
11. **Sets mandatory** (§11): confirmed as chartered.
12. **Two-set endowment = COMPATIBILITY DEVICE, not permanent founding law**
    (§12): acceptable for migrated saves, FMJ fixtures, pre-Flip C2a, bounded
    harnesses — but once the bare-start experience lands (C2b), fresh games
    start bare and **test fixtures adapt rather than weakening the product
    law**. `INITIAL_PROPERTY` stays immutable; the Flip uses the new bare-start
    definition as chartered.
13. **Lot layout** (§13): C2 satisfies Success-Blueprint option **A** — the
    load-in-distance mechanic is a bounded deterministic spatial consequence on
    TIME. The remaining general distance/travel consequence is recorded as a
    **named parity residual with a future owner (the C3+ travel docket)** —
    it may not disappear silently. No pathfinding rewrite in C2; mature
    algorithms may be reused later if a bounded implementation needs them.
14. **Casting merged V1 ACCEPTED** → item 1c RULED.
15. **Events** (§15): persisted `studioEvents` for **meaningful authoritative/
    domain history only** — never toasts, cues, sounds, hover chatter. Already
    the chartered design; recorded as a binding clarification (§5).
16. **Queue idle freight ACCEPTED with the release-law nuance** (§16): waiting
    carries the freight of resources/contracts GENUINELY still committed
    (payroll, locked talent); a production is never charged for a released
    physical resource merely because it is blocked elsewhere. Measured at
    balance/playtest; initial numbers not sacred. → item 7-ii RULED.
17. **Theater/Premiere ACCEPTED** (§17), incl. no direct Premiere cash reward
    in V1. → item 8's premiere portion RULED.
18. **Scope floors ACCEPTED** (§18) — Call Board treatment, marquee-only floor,
    evidence-gated spur, layout narrowing, premiere zero-cash, and the full
    non-goal fence (no rival studios / Awards / Era system / Film Library /
    acquisitions / deep Star life). The Success Blueprint may not expand C2.
    → item 8 RULED.
19. **Development law: SOURCE-FIRST DESIGN** — before modifying an
    original-game-derived mechanic, consult the reconstructed evidence
    (primary: `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`; supporting:
    `THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md`); newer explicit Owner
    rulings govern intentional successor changes.
20. **Development law: RESEARCH FIRST, REUSE FIRST, INVENT LAST** — inspect
    existing code → recovered schemas → mature license-compatible
    implementations → adapt when clean → bespoke when reuse harms determinism/
    architecture/licensing/fit. *Reuse before reinventing, not reuse at all
    costs.* Bounded investigations; implementation notes state what was
    inspected before from-scratch was chosen.
21. **North-star acceptance statement** (binding for every C2 milestone):
    *"I built this movie studio, it operates while I watch, my writers create
    pictures, and I can physically watch multiple films compete for real
    production resources."* Technical completion without the player-facing
    experience is insufficient.
22. **Owner acceptance position**: architectural direction of r3.1 ACCEPTED
    subject to the above. Bounded r3.2 amendment only. Status: **FROZEN —
    WAITING FOR PF1 SEAL + EXPLICIT OWNER GO.** At GO: M0 baseline reproduction
    first, environment verified, then the chartered lanes under
    one-writer-per-shared-surface. No production code from this ruling set.

## Contradiction check (the Owner asked)

No ruling is technically impossible as written. Two implementation notes,
recorded so they are visible rather than discovered:
- Ruling 5 requires splitting the engine's currently-atomic phase transition
  (release-on-completion, then acquire-next in the sweep) — a designed M4
  change, deterministic, and it *simplifies* the deadlock story (a post-waiter
  holds nothing, so hold-and-wait vanishes on that edge).
- Ruling 9 pulls bounded writer pooling and variable draft duration into C2a-M3
  (r3.1 had deferred both); the persisted-leaf widening follows the §8.3
  version-aware boundary pattern, and the affected sealed one-week-draft
  invariants join §11.8 with named successors. `AGENT_MAX_SLATE = 2` bounds the
  harness AGENTS' policy, never the player — consistent with ruling 3.
