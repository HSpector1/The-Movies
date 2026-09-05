# Shared authority guide for repository agents

This is the common authority resolver for repository agents and subagents. Role files describe capability; they do not grant product scope.

## Required task envelope

Before mutation, identify all of the following from the parent task or an exact issued order:

- the Owner or Current Ops authorization and, when repository-issued, its immutable source;
- repository identity and authorized base commit;
- owned branch/worktree and allowed paths;
- permitted product or documentation scope;
- protected branches, profiles, processes, artifacts, and files;
- required validation and evidence classes; and
- the terminal handoff or stop condition.

If an item is absent, continue read-only where useful. Do not turn a role description, roadmap, research package, pre-readiness gate, draft prompt, technical KEEP, or WIP branch into an independent implementation charter.

## Authority resolution

Use this precedence:

1. explicit current Owner instruction and durable Owner rulings;
2. the applicable Current Ops execution or repair order;
3. exact Owner-accepted producer facts, contracts, and candidate evidence;
4. the implementation charter and requirement register named by that order;
5. repository-wide instructions in `CLAUDE.md` and this guide;
6. role-specific instructions; and
7. historical plans, contracts, reports, and research as evidence.

Newer authority supersedes only the conflicting part. Preserve compatible accepted mechanics and the historical record. Escalate an unresolved material conflict; never silently choose a convenient interpretation.

## Shared technical laws

- TypeScript is the sole gameplay authority. Clients render TypeScript facts and submit intents.
- Simulation is deterministic and seeded. Do not introduce unseeded gameplay randomness.
- Keep exact IDs stable across state, saves, projections, navigation, receipts, and history.
- Preserve save meaning and use explicit, tested migrations. Missing historical facts remain missing.
- Reuse current source, selectors, actions, projections, fixtures, and accepted UI patterns before creating a parallel mechanism.
- Original-derived behavior requires authorized source evidence, including the Mechanics Bible where applicable.
- Do not broaden permissions, product scope, or cross-repository access because a delegated role could technically perform an action.

## Repository and process safety

`main`, `campaign/*`, accepted candidates, active shared WIP, and the Owner's durable profile are protected by default. Work in the exact owned branch/worktree. Do not switch or clean an existing checkout, rewrite history, move protected refs, or run Unity/native/HID processes without task authority.

The private Unity repository is a separate access boundary. Inability to inspect it is an explicit limitation, never a successful verification.

## Evidence contract

Report only observed evidence and name its class: static inspection, focused test, package test, full suite, generated-contract check, Unity EditMode, browser runtime, native runtime, image review, HID, technical review, or Owner playtest. One class does not silently substitute for another.

For every result, record the relevant commit, command or inspection route, actual output, failures/skips, source limitations, and working-tree state. Technical KEEP is not Owner acceptance. A foundation slice is not the whole package.

## Delegated-role handoff

A subagent receives a bounded slice from its parent. It must:

1. restate the applicable authority and permitted paths;
2. remain within the role's tool and mutation boundary;
3. preserve unrelated work and report conflicts;
4. validate only what it actually changed or audited; and
5. return findings and evidence to the parent without claiming integration or acceptance.

The parent task remains the authority and integration owner unless the issued order explicitly says otherwise.
