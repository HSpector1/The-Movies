# Project: Studio — P08–P10 Stacked Integration and Rollback Law

> **REVISION 05 — CURRENT OPS TARGETED CORRECTION APPLIED.** This document preserves the useful detail of the earlier `foundation-marathon` draft but is now governed by the accepted closeout base and the full-scope traceability/ready-extension laws. P06 and P07 are **OWNER ACCEPTED — KEEP — CLOSED**. The only pending Owner acceptance is for new P08–P10 work. The former name is a draft alias; `docs/p08-p10-autonomous-stack-launch-01` is canonical.
>
> **Private Unity boundary:** the accepted Unity identity is known (`c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`), but the connected Future Ops environment could not inspect that private source tree. **SOURCE INSPECTION NOT AVAILABLE TO FUTURE OPS — REQUIRES CODING-AGENT READ-ONLY PREFLIGHT.**


**Status:** PROVISIONAL PROGRAM LAW — CURRENT OPS APPROVAL REQUIRED
**Purpose:** permit three technical packages before one human test without losing isolation, rollback, or truth.

## 1. Core rule

P08, P09, and P10 may be implemented in one linear program, but they never become one indistinguishable change set.

Each package must have:

- exact parent SHA;
- exact product-tip SHA in both repositories;
- exact documentation/seal SHA;
- exact changed paths;
- exact save/protocol/projection/schema identities;
- its own test/evidence manifest;
- its own candidate folder where a player-facing build exists;
- its own hostile-review disposition;
- explicit Owner-acceptance status: `PENDING`.

## 2. Recommended refs

```text
TypeScript:
  wip/p08-p10-autonomous-stack-01-ts

Unity:
  wip/p08-p10-autonomous-stack-01-client
```

Start from the exact final P07 technical campaign pair.

Record checkpoints:

```text
P08_TS_CHECKPOINT_SHA
P08_UNITY_CHECKPOINT_SHA
P09_TS_CHECKPOINT_SHA
P09_UNITY_CHECKPOINT_SHA
P10_TS_CHECKPOINT_SHA
P10_UNITY_CHECKPOINT_SHA
```

No checkpoint SHA may be rewritten, rebased away, squashed, or force-pushed.

## 3. Campaign branch default

Recommended:

- campaign branches remain at the P07 technical pair during the program;
- program WIP branches advance linearly;
- Current Best continues to distinguish accepted authority and new-stack Owner-pending candidates from forward candidates;
- final P08–P10 candidate is tested by the Owner from a sealed candidate folder;
- campaign branches fast-forward only after the Owner accepts, unless Current Ops separately orders technical promotion.

This recommendation is intentionally more conservative than prior technical-promotion practice because three untested player-facing packages are being stacked.

## 4. Package continuation gate

The next package may branch from/continue on the current program tip only after:

- all product code is committed;
- focused and cumulative tests are green;
- worktrees are clean;
- local/tracking/advertised refs match;
- generated contract is exact where changed;
- save migration is round-trip green;
- deterministic fixtures are sealed;
- visual/HID proof is complete for the package’s material interactions;
- hostile review has no blocking finding;
- a checkpoint report is committed.

## 5. Failure behavior

### P08 failure

- stop program;
- preserve P07 base;
- do not begin P09;
- no campaign movement.

### P09 failure

- stop program;
- preserve P08 checkpoint;
- do not begin P10;
- report whether P08 remains an independent candidate;
- never ship a bare-lot regime that cannot complete a movie.

### P10 failure

- stop program;
- preserve P08/P09 checkpoints;
- report whether the P09 candidate remains coherent without P10;
- do not weaken person-information boundaries to finish.

### Final integration failure

- retain all checkpoint commits;
- bisect by package boundaries first;
- do not reset/rewrite shared history;
- do not promote partial work without Current Ops ruling.

## 6. Save-version chain

Each package uses the next additive version only when needed.

Example shape, not numeric authority:

```text
P07: V16
P08: V_NEXT if persisted history is added
P09: V_NEXT_AFTER_P08 for founding regime/sparse start
P10: no bump unless a missing authoritative fact requires it
```

Rules:

- old validators remain frozen;
- migration validates the prior version, appends only governed state, and preserves bytes/meaning elsewhere;
- no feature infers old history that was never recorded;
- bare-lot/endowed regime is never inferred from current buildings;
- downgrade rules remain explicit;
- every intermediate version round-trips before proceeding.

## 7. Projection/consumer chain

For each additive projection change:

1. update TypeScript schema/generator source;
2. regenerate C#;
3. commit TypeScript generated output;
4. sync the exact generated consumer to Unity;
5. verify shared blob/hash;
6. compile Unity;
7. retain evidence;
8. attest the exact immutable pair at the checkpoint.

No hand-edited generated DTOs.

## 8. Candidate folders

Recommended:

```text
~/Desktop/P08-Technical-Candidate-<ts>-<unity>/
~/Desktop/P09-Technical-Candidate-<ts>-<unity>/
~/Desktop/P10-Technical-Candidate-<ts>-<unity>/
~/Desktop/P08-P10-Combined-Owner-Candidate-<ts>-<unity>/
```

Each folder includes:

- player;
- engine bundle;
- launch command;
- fixture profiles;
- test/evidence manifests;
- playtest notes;
- exact hashes;
- rollback refs;
- explicit `P08/P09/P10 OWNER ACCEPTANCE PENDING` banner; P06/P07 remain accepted.

## 9. New-stack Owner-acceptance status register

Maintain one append-only register with:

- package;
- exact candidate pair;
- new-package Owner question;
- known visual/UX caveat;
- evidence already present;
- final combined test step that resolves it;
- disposition after Owner test.

Never allow a deferred question to disappear merely because a later package changed the screen.

## 10. Integration prohibition

Do not:

- merge branches;
- cherry-pick package commits into another lineage;
- force push;
- squash checkpoints;
- move `main`;
- create a Golden tag;
- delete P06/P07 or intermediate candidates;
- claim a later package retrospectively accepted an earlier one.

## 11. Final status

This law becomes binding only when Current Ops includes it in the final execution order.

## Revision 02 full-scope control

This document is subordinate to and completed by:

- `docs/operations/P08-P10-FULL-SCOPE-TRACEABILITY-MATRIX.md` — 115 mapped requirements, zero unmapped;
- `docs/operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md` — every lawful deferral with owner/dependency/refresh trigger;
- `docs/operations/P08-P10-MAXIMAL-AUTONOMOUS-WAVE-PLAN.md` — core floors plus dependency-ready extension ladders;
- `docs/operations/P08-P10-SAVE-SCHEMA-PROJECTION-AND-MIGRATION-PLAN.md` — accepted V16/15 baseline and provisional package chain;
- `docs/operations/P08-P10-AUTONOMOUS-STACK-OWNER-DECISION-DOCKET.md` — decisions separated into Owner, Current Ops, engineering, private-source, and later categories.

A core checkpoint does not terminate the package automatically. The coding lead continues only through rows classified `IMPLEMENT AS READY EXTENSION` whose exact activation gate passes. Conditional, Owner-blocked, dependency-blocked, deferred, and rejected rows are not implementation authority.
