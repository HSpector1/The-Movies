# OWNER RULING — C2 FUTURE-PROOFING ARCHITECTURE GUARDRAILS (2026-08-18, accepted)

Received during C2 advance planning, after the charter r2 rewrite. Source: a
read-only architecture audit of the Hollywood ecosystem, accepted by the Owner.
**Architecture guardrails only — C2 scope does not expand.** The audit's headline:
the rival-studio/Hollywood ecosystem is safely deferable; **do NOT add rival-studio
functionality to C2.**

The guardrails, verbatim intent:

1. **`INITIAL_PROPERTY` is immutable historical migration data.** The Founding Flip
   gets a NEW bare-start constant; the V12→V13 anchor is never edited.
2. **Existing production IDs are permanent** — never re-minted or reformatted. Any
   future second identity scheme namespaces itself; existing IDs remain unchanged.
3. **Any new persisted root containing production IDs must participate in the
   existing taken-ID/persistence invariant** (`persistedProductionIds`, law 20).
4. **Never widen frozen save leaf shapes** — `EraConfig`, `Standing`,
   `CulturalForce`, `SegmentId`, and their kin. New C3/C4 facts arrive as new roots
   or derived read models.
5. **`state.ledger` is permanent history.** Never prune or window historical ledger
   state as a performance shortcut.
6. **`market.tick` remains the authoritative integer week.** If a Living Turn
   variant ever requires persisted intra-week position, it lands as new V-next
   state — week semantics are never redefined.
7. **`state.talent` is an append-only industry census.** Retirement, defection, and
   their kin become states, never deletions.
8. **Never write studio-relative facts onto shared-world entities** (Talent,
   FilmConcept, MarketState).
9. **C2 Sets/Stages/queues/reservations continue using the existing authoritative
   occupancy/reservation representation** — no second ownership layer is invented.
10. **The long-term campaign begins in 1920, has no hard calendar end, and must
    intentionally support at least 2040** (restates the timeline law of `00A`).

## Charter compliance (checked against r2 at acceptance)

r2 already complies by construction — the adversarial review had independently
forced the same shapes — and the charter now states each binding explicitly
(charter §8.2): the queue orders by persisted ordinal, never a reformatted id (G2);
`studioEvents`/`productionQueue` join `persistedProductionIds` both directions
(§8.3); Tier-W windowing applies to `studioEvents` ONLY — the cash ledger is never
windowed (§5); Living Turn V1 persists no intra-week position (§4.1); V14 adds new
roots and widens no frozen leaf; set demand is a derived read model, never written
onto `FilmConcept`; set occupancy extends the ONE union (§3.2); the Flip's bare lot
is a new constant beside an untouched `INITIAL_PROPERTY` (§7); rival studios join
the named non-goals (§19).
