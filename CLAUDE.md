# Project Studio — Agent Instructions

> **CURRENT AUTHORITY OVERRIDE — AUTONOMOUS MARATHON BRANCH**
>
> This file records the original M0A agent boundary and is retained as history. It is superseded on
> `operation-hollywood-autonomous-marathon` by newer committed milestone contracts, accepted D-17B,
> the marathon launch order, and `CURRENT-BEST.md`. UI, the Studio Lot, accessibility, economy,
> operations, careers, and visual output now exist by explicit later authority. Do not stop, delete,
> or roll them back because of the original M0A-only instructions below.
>
> Current product law: **THE STUDIO LOT IS THE PRIMARY GAME SURFACE.** The autonomous marathon is
> sealed at the closure checkpoint containing `AUTONOMOUS-MARATHON-HANDOFF.md`; no successor is
> automatic. Read that handoff, `CURRENT-BEST.md`, `DECISIONS.md`, `PROGRESS.md`,
> `NEXT-HIGHEST-LEVERAGE.md`, `MARATHON-LOG.md`, current contracts/closures, and Git before changing
> behavior. Any successor requires fresh Owner authorization and separately frozen authority.

## The one rule

**`docs/build-contract.md` is the source of truth.** Implement it as written.

If anything in it is undefined, contradictory, or unimplementable: **stop and report it.**
Do not resolve it yourself. Do not fill the gap with a reasonable guess. A silently
filled gap is a gap nobody can find later.

## Scope: phases 1-4, then stop — **HISTORICAL (M0A only; long since superseded)**

> This section is the **original M0A scope gate and is no longer current authority.** Phase 5,
> Phase 5.1, the tycoon world conversion, the First Movie Journey and all of Campaign 1 have
> shipped under later explicit Owner authorization. Do **not** read the "stop before phase 5"
> instruction below as blocking authorized work; current scope comes from the active campaign
> charter and `THE-MOVIES-PARITY-MASTER-PLAN.md`. Retained verbatim for provenance.

Implement phases 1-4 (contract section 12) and produce the M0A instrumentation report.

**Work autonomously through the whole M0A loop.** Implement, run the harness, read the
flags, tune the constants in TUNING, re-run, repeat. Keep going until the acceptance
tests pass or you can explain precisely why one cannot. You do not need permission
between iterations - that grind is the job.

**Then stop, before phase 5 (UI) and phase 6.** Not because they are difficult. Phase 5
is where the owner's judgment enters: the next gate is "is this fun", which is answered
by a person playing it, not by a model reasoning about it. Building a UI over numbers
nobody has looked at means rebuilding it when the numbers change.

Do not begin phase 5 until the owner says "approved for phase 5". If you believe M0A is
complete, present the report and end your turn.

## Not current scope

**Not current scope unless explicitly authorized by the Owner or the current campaign.**
Newer Owner authority supersedes historical milestone exclusions. Do not build, scaffold,
abstract for, or leave TODOs for anything below **without that authorization** — and do not
cite this list to refuse work the current charter authorizes.

*(Reframed 2026-08-18 by Owner ruling — see `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §4. This
was previously framed as a set of permanent product exclusions. Nothing is erased: whether any
individual item is a permanent cut or merely not-yet-scheduled remains an Owner call, and is
**not** decided by that reframing.)*

**Already superseded — shipped by later explicit authority.** Do not stop, delete or roll back:
the lot · visual output · the studio economy · accessibility

**Legitimate long-term product directions, not currently authorized** (Owner ruling §3/§4):
rival studios as agents · awards season · library economics · competition modelling ·
receivership *(rival studios only — the no-hard-bankruptcy ruling still binds the player's
studio)*

**Not current scope; permanence undecided:**
chemistry · readable memories · production incidents · contract negotiation ·
scene composition · screenplay generation · SimulationFlags · cultural drift *(the related
audience-taste-movement question is an open Owner decision — master plan §10 item 4, due
before C4)* · aging and career progression · late promise repositioning ·
LLM integration of any kind · onboarding · tutorial · mobile layout

Design documents exist for several of these. They are deliberately not in this repo.
Wanting one is the signal to stop and report a finding, not to reconstruct it.

## Conventions

- TypeScript, strict mode.
- The sim core is pure: `(state, actions) => state`. No React, no DOM, no async, no I/O
  below the harness boundary.
- Every bounded term in the contract gets a unit test asserting its stated range.
- Seeded RNG only. No `Math.random()` anywhere.
- Constants live in `TUNING` (section 16). Never inline a magic number that has a name
  in the contract.

## Working style

- State your plan before writing code for a phase.
- Run the tests. Report actual output. Never assert tests pass without running them.
- Small commits, one concern each.
- When the contract and your instinct disagree, the contract wins - and say so out loud.
