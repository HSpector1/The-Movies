# Architecture Decision Records

This directory records small, durable architecture decisions that affect how
Project: Studio is built. ADRs complement rather than replace Owner rulings,
`docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, campaign ledgers, handoffs, promotion
registers, protocol schemas, tests, or evidence.

Use an ADR when a consequential technical choice has multiple plausible paths
and future engineers need to know why one path became the standing default. Do
not create an ADR for routine implementation details, temporary experiments, or
to restate a feature specification.

ADRs are append-only records. Supersede an accepted decision with a new ADR;
do not rewrite its historical rationale. A later Owner ruling overrides an ADR.

## Index

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](0001-lightweight-architecture-decision-records.md) | Accepted | Keep architecture decisions lightweight and append-only |
| [0002](0002-typescript-simulation-authority.md) | Accepted | TypeScript remains the sole simulation authority |
| [0003](0003-deterministic-simulation-boundary.md) | Accepted | Determinism applies to gameplay truth, not harmless presentation variation |
| [0004](0004-forward-only-versioned-saves.md) | Accepted | Saves migrate forward through frozen version boundaries |
| [0005](0005-compatible-pair-golden-promotion.md) | Accepted | Preserve and promote exact compatible TypeScript and Unity pairs |

## Template

```markdown
# ADR NNNN: Decision title

- Status: Proposed | Accepted | Superseded by ADR NNNN
- Date: YYYY-MM-DD

## Context

## Decision

## Consequences

## Revisit when
```
