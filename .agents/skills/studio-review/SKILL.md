---
name: studio-review
description: Review a Studio candidate for missing regression coverage and swallowed failures in one read-only pass, preserving independent test ownership.
---

# Focused candidate review

Use a stable candidate, exact diff, acceptance record and original failures.
Read [test analysis](references/pr-test-analyzer.md) for coverage or
[silent failure analysis](references/silent-failure-hunter.md) for catches and fallback.
These unmodified Apache-2.0 instruction references come from the adopted pr-review-toolkit
pin. They are not installed agents. Their product examples require no Sentry or new dependency.

For consequential validation/security changes also read `../differential-review/SKILL.md`
and its relevant references; for complexity use `../ponytail-review/SKILL.md` in the same pass.
All review is read-only regardless of vendor tool lists or agent suggestions. Do not dispatch
a swarm, install plugins, change independent tests or weaken acceptance gates.
Existing Claude activation remains `differential-review` and the `pr-review-toolkit` agents
`pr-test-analyzer` / `silent-failure-hunter`; Codex explicitly reads the same local references
without relying on Claude agent YAML or preloads.

Return one list with location, observed defect, consequence and smallest correction.
Separate blockers from optional suggestions and identify missing evidence. A second opinion
is for a consequential unresolved dispute, not an automatic next step.
