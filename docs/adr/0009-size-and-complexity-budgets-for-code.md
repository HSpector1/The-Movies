# ADR-0009: Size and complexity budgets for code

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1)

## Context

This codebase is built almost entirely by long agent sessions, which makes size limits
*more* valuable than in a human-only repo: agents edit by reading whole files into
context, so file size is directly the cost, latency, and risk of every future session.
The repo shows what unbounded accretion does — `save.ts` 190 KB, `placement.ts` 91 KB,
`actions.ts` 83 KB (ADR-0007) — and session diffs routinely land thousands of lines at
once, which no closure review can actually read.

LOC here means nonblank, noncomment, human/agent-authored source lines. Generated
files, lockfiles, and snapshots are exempt. When two rows apply, the lower wins.
"Hard stop" means split, or record an explicit exception (format below).

## Decision

Adopt these budgets, enforced in CI on new-or-touched files:

| Artifact | Target | Review at | Hard stop |
|---|---:|---:|---:|
| Production source file | ≤200 | 350 | 500 |
| Function/method | ≤20 | 40 | 60 |
| Class/exported type | ≤100 | 200 | 300 |
| Test case | ≤30 | — | 60 |
| Test file | ≤300 | — | 600 |
| Config/bootstrap file | ≤150 | — | 300 |
| Session diff intended to be reviewed | ≈100 | 400 | 800 |

Paired non-LOC gates (prevent passing by smearing the same complexity across files):
cognitive complexity ≤15 per function, nesting depth ≤3, ≤5 ordinary parameters, no
circular module imports.

Exemptions: frozen save-version modules (`save/v*.ts` after ADR-0007) are write-once
and exempt from the file cap; `TUNING` constant tables count as data, capped at 400.

**Mandatory exception format** — anything crossing a hard stop carries, in-file or in
the PR: why splitting would worsen the design, named owner, risks introduced, tests
protecting it, the intended decomposition boundary, and a review date or split trigger.

## Options considered

1. **No limits, rely on review** — this repo is the counterexample: "review" was a
   closure doc summarizing a multi-thousand-line session diff.
2. **Limits as convention only** — conventions don't survive autonomous sessions;
   agents obey gates, not vibes. CLAUDE.md guidance without CI drifted here already.
3. **CI-enforced budgets with an explicit exception valve (chosen).**

## Consequences

- Existing giants don't block CI (gates apply to new-or-touched files) but every touch
  of a violating file demands either a carve-out toward compliance or an exception —
  ratcheting the codebase down over time.
- Sessions produce smaller, landable diffs, which makes the ADR-0005 branch lifecycle
  (merge or delete per session) actually reviewable.
- Cost: a day of CI wiring (`eslint` complexity rules + a line-count script) and
  occasional friction writing exceptions — that friction is the mechanism.

## Revisit when

Exceptions exceed ~10% of files touched per quarter — then the limits are wrong for
this codebase and should be re-tuned rather than routinely bypassed.
