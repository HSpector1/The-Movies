# ADR 0001: Lightweight architecture decision records

- Status: Accepted
- Date: 2026-08-20

## Context

Project: Studio has long-lived engine, client, save, and campaign boundaries.
Important decisions can become ambiguous when their rationale exists only in a
chat transcript or an obsolete branch. The repository already has authoritative
Owner rulings, architecture decisions, contracts, campaign continuity files,
tests, and evidence; duplicating or reorganizing them would create more drift.

## Decision

Record only durable, cross-cutting technical choices as concise ADRs in this
directory. ADRs are append-only and may be superseded, not retroactively
rewritten. They link to existing authorities instead of moving or duplicating
large documentation trees.

Authority order is:

1. explicit Owner rulings and immutable campaign laws;
2. current approved architecture decisions;
3. accepted ADRs;
4. implementation documentation and local convention.

Campaign ledgers record chronology. Handoffs record current operational state.
Promotion registers identify the best compatible build. None is replaced by an
ADR.

## Consequences

- A new agent can recover the reason for a durable boundary without reopening
  settled research.
- Routine code choices do not require process ceremony.
- Historical records remain stable and repository churn stays bounded.

## Revisit when

The existing authority hierarchy changes or an ADR tool provides clear value
without relocating current documentation.
