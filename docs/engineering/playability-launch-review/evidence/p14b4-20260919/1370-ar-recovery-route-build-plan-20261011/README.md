# 1370-AR: fullfunction recovery-route build plan, and why Gate 0 blocks it

Parent: Claude (Fable 5.1), 2026-10-11. This package closes the item Codex's review called out as missing ("`AR-BUILD-PLAN.md` is absent and must be completed"). The plan exists, is exact, and did not run.

## Contents

| File | What it is |
| --- | --- |
| `AR-BUILD-PLAN.md` | The synthesis of eight independent package maps (r3 source, parent, root wrappers, generated-authority repair, prelaunch, fullguard/postflight, sanitizer, failed run and lane): every edit by file, line, old text and new text; the acyclic finalization order; the eighteen-step execution order; pre-run checks; exact fullguard, prelaunch, fullfunction, readback and postflight commands with the original 300/320/330 s bounds; success proofs; twelve open questions. Written by the mapping workflow's planning agent from the bytes on this machine. |
| `GATE0-OBSERVATION.json` | The plan's section 7.1 Gate 0 script output, taken at the clean tree `355a2126…`: verdict **BLOCKED**, failed predicates **2 and 4**, plus the integrator's recorded decision. |
| `gate0-as-run.sh` | The script that produced the observation (section 7.1 plus the section 5.2.1 writer). |

## Why the route cannot run on the current branch

Every layer of the M0 fullfunction lineage pins the production src tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`: the historical types adoption (`be632d53…`), the proof library's hardcoded `TREE` constant (`runner.py` L12), `CORE-TEST-TEMPLATE.ts` L12, the A208 copy and materializer binding at `4812bb12`, and every operational transition. The fullguard also requires that every path changed since `4812bb12` be `HANDOFF.md` or under `docs/`. The R8 landing (`db3fc572`) moved `HEAD:src` to `cf7d20cd585f72fd178e06c3cd2a8821bbc0c26f` and added 188 non-docs paths. Refs do not move backward and a revert would itself be a non-docs commit that discards Save46; therefore no reachable HEAD satisfies Gate 0 (plan section 0 and open question Q1).

## Integrator decision (recorded in the observation and in HANDOFF.md)

Hold the AR run. Continue the gameplay landings in dependency order (founding Save47 → P15B → P16 → P17 → P18), each with its own full-suite predecessor baseline and identity attribution. When the gameplay slices have settled on one tree, qualify a **new route generation** against that tree: a new types adoption replacing `be632d53…`, a proof-library derivative with `TREE`/`CURRENT_HEAD` at the new tree and head, a new A208 copy and materializer binding, a new core test template, and new transitions with the new `sourceTree`. Sections 1 through 9 of the plan apply unchanged to that generation once its Gate 0 passes. Historical failures 42397, 54871 and 96592 and the unexplained 12:10:59–12:11:44Z interval stay failed and unexplained; the old baseline `bc21a3df…` is never repinned.

This decision was the integrator's under the Owner's 2026-10-10 orders ("see how far you can get in game development", "Owner approval not needed for anything"). It is not ledger admission, and it does not change the conditional `main` promotion rule.

## Also recorded by Gate 0

Free disk at observation: 2,068,770,816 bytes against the recorded heavy-lane floor of 3,758,096,384 bytes (plan Q2); heavy-lane lock absent; AC power; boot session UUID captured so a later fill can detect reboot drift (plan Q8).
