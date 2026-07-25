# Project Studio — Agent Instructions

## The one rule

**`docs/build-contract.md` is the source of truth.** Implement it as written.

If anything in it is undefined, contradictory, or unimplementable: **stop and report it.**
Do not resolve it yourself. Do not fill the gap with a reasonable guess. A silently
filled gap is a gap nobody can find later.

## Scope: phases 1-4, then stop

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

## Do not build

Section 11 non-goals is a decision, not an oversight. Do not build, scaffold, abstract
for, or leave TODOs for:

chemistry - readable memories - production incidents - contract negotiation - the lot -
rival studios as agents - awards season - scene composition - screenplay generation -
visual output - library economics - receivership - SimulationFlags - the studio economy -
cultural drift - aging and career progression - late promise repositioning - competition
modelling - LLM integration of any kind - onboarding - tutorial - accessibility - mobile layout

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
