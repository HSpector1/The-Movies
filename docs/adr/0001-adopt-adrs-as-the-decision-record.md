# ADR-0001: Adopt ADRs as the durable decision record

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1); drafted externally for review

## Context

The project already makes and enforces real architecture decisions, but they live in
session-shaped artifacts: `DECISIONS.md` (a routing index, self-described as "not a
replacement for the contracts"), ~40 `*-CONTRACT.md` / `*-CLOSURE.md` / `*-EVIDENCE.md`
triplets under `docs/`, eight root-level `*-LOG.md` / `*-HANDOFF.md` files, and a
3,733-line `LESSONS-LEARNED.md`. Each records what one working session decided, in that
session's vocabulary ("sealed", "Owner ruling", "world-first").

Consequences today:

- Finding *the current answer* to a question ("what is the save format policy?")
  requires reading history, not a record. `DECISIONS.md` itself shipped a stale
  save-version claim for two versions before being corrected on 2026-08-18.
- Decisions are keyed to commits and branch names ("frozen at `d94dd47`"), which decay
  as branches are cleaned up.
- New contributors (or new agent sessions) cannot distinguish standing policy from
  historical narrative.

## Decision

Adopt lightweight ADRs (MADR-style) in `docs/adr/`, numbered sequentially. One decision
per file: context, decision, options considered, consequences, revisit condition.

- ADRs record **standing policy**. Session logs, contracts, and evidence remain valid
  as **history** and are linked from ADRs, never duplicated into them.
- `DECISIONS.md` becomes a one-line-per-ADR index (or is replaced by
  `docs/adr/README.md`).
- A decision is superseded by writing a new ADR and marking the old one
  `Superseded by ADR-NNNN` — never by editing history.
- ADRs 0002–0004 backfill the three load-bearing decisions already in force, so the
  record starts true rather than empty.

## Options considered

1. **Status quo** — keep contracts/closures as the record. Rejected: they are
   append-only narrative; the current state is only recoverable by archaeology.
2. **One big ARCHITECTURE.md** — simpler, but merges every decision's lifecycle into
   one file and loses per-decision supersession.
3. **ADRs (chosen)** — smallest unit that keeps decisions individually referenceable
   and supersedable.

## Consequences

- One-time cost: backfilling the standing decisions (started in this batch).
- Session workflows change slightly: a session that changes standing policy must land
  or update an ADR, not only a closure doc.
- `LESSONS-LEARNED.md` and the contract docs stop being load-bearing for "what is
  policy now" and can be archived freely.

## Revisit when

Two consecutive milestones close without any ADR being written or updated — that means
either no decisions are being made (unlikely) or the format isn't being used.
