---
name: studio-workflow
description: Recover Studio ownership and the next authorized task, select lessons and checks, and record a checkpoint without reviving paused gameplay.
---

# Studio continuation

Read root AGENTS.md and current HANDOFF first. Reconcile the explicit working ref, dirty/
staged/untracked metadata and named run/lock. Preserve newer work. The existing coordinator
retains integration and scheduling; a fresh client does not transfer ownership.

Select one route in `docs/development/WORKFLOW.md`, then its LESSON_MAP sources and skill by
explicit path. Global `handoff` may support resume/write when available; it is optional.
Without it, use this procedure. Do not install it globally or repeat setup on every resume.

At checkpoints preserve the actual candidate, failures, reached/unreached assertions,
independent review and evidence. During an execution freeze write no source/index/HANDOFF
until the required audit finishes; keep continuation notes outside the frozen scope.
At an idle boundary update current HANDOFF, exact next action and existing requirements table.
Never change hook-owned AUTO bytes. Archive exact historical bytes before replacing prose;
verify identity and link meaning. History is not startup authority.

Use WORKFLOW's small acceptance record for future slices. Keep engineering qualification,
visible journeys, platform evidence and Owner acceptance distinct. Verify the explicit remote
after publication. A prepared PR alone is not adoption. End setup without resuming gameplay.
