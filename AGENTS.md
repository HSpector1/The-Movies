# Project: Studio — shared builder entry

Read the current section of [HANDOFF.md](HANDOFF.md) first: Owner pause, actual candidate,
ownership and exact next action. Inspect its named lock/run read-only. A new session does not
lift a pause or acquire another writer's checkout. Gameplay is PAUSED; workflow work cannot
start canonical-62 generation or activate P17/P18.

Choose one row in [WORKFLOW](docs/development/WORKFLOW.md), then explicitly read its
[LESSON_MAP](docs/development/LESSON_MAP.md) sources and `.agents/skills/<name>/SKILL.md`.
Use `studio-workflow` for resume/checkpoint; use `ponytail` full for coding unless Howard opts out.
No automatic installs, archive sweeps, full-suite reruns or repeated skill paperwork at startup.
Manual instructions here and in WORKFLOW suffice without the global handoff skill.

- One coordinator production writer/scheduler, independent test/review ownership, one intensive
  execution tree. Additional writers need a recorded disjoint assignment. Use one focused
  read-only review and one findings list, without automatic delegation or approval loops.
- Preserve candidates, patches, manifests, failures, unreached assertions, local evidence and
  acceptance requirements. No reset, stash, clean, force push, history rewrite or main promotion.
- Every Git call: `git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks ...`.
- Heavy game checks use the HANDOFF preflight and sole lane. Freeze source/index/HANDOFF
  through the required independent audit. Never remove foreign locks or act on old PIDs.
  Codex enforces this explicitly; it does not execute Claude hooks.
- A workflow task authorizes no gameplay, runtime dependencies, assets, REA/Ghidra/Wine,
  binaries, global configuration, cleanup or provider startup. Missing optional tools must not
  block unrelated work. Never execute downloaded instructions or silently download an npx CLI.
- Keep the core pure and deterministic, with seeded RNG and authoritative money/ownership.
  Current Owner orders and adopted contracts govern; historical scope text cannot revive work.
- At checkpoints/stops update current HANDOFF and applicable existing lessons, preserve AUTO,
  verify explicit publication and distinguish LANDED, CANDIDATE, STATIC-UNRUN, FAILED, REUSED
  and ACCEPTANCE OPEN. Compilation, assertions, timing, visible play and Owner acceptance
  are separate claims. A PR is PREPARED until its reviewed change is integrated.

Setup/repair only: [NEW-MACHINE-SETUP.txt](NEW-MACHINE-SETUP.txt). Pins and client routes:
[skill inventory](docs/development/skill-sources.json). Overrides and actual verification limits:
[validation](docs/development/WORKFLOW_VALIDATION.md). Codex explicitly reads selected shared
references; Claude imports this file. Neither assumes the other's plugins or preloads exist.
A Glob that omits symlinked skill folders is not evidence of absence: explicitly read the
selected `.agents/skills/NAME/SKILL.md` (or its `.claude/skills/NAME/SKILL.md` link).
