# 758 — P14C.1 MATERIALIZED AGING: task expansion (draft; audit before it begins)

Parent-authored at `7e3e2569`. Follows the 720/723-C and 744/745-C precedent: expansion written,
independently audited, then the slice begins. Authority: the P14 companion §6.1, with §6.5 and §6.6
for the two facts §6.1 depends on. The companion classes every age, horizon and count in §6 as a
NUMERICAL/CONTENT HYPOTHESIS; the LAW below is not a hypothesis and is not to be redesigned.

Claims marked VERIFIED were read out of the source at this commit. Claims marked HYPOTHESIS are for
the audit to rule on.

---

## 1. The player behaviour this slice adds

People in this world do not get older. A studio can sign a 28-year-old lead in 1951 and the same
person is 28 in 1975. Nothing downstream of age can be true: the ask curve never shifts, no career
has an arc, and retirement cannot exist because nobody ever approaches it.

C.1 makes every persistent professional age with the calendar. That is the whole slice. It changes
no other law, adds no retirement, and builds no cohort scheduling.

The behaviour is visible immediately and without any new surface: **VERIFIED**, `Talent.age` already
has accepted readers — `ageFactor` in the contract ask, `ageRunwayMult` in development, and the
profile formatter. §6.1's phrase for this is exact: every accepted reader "ages for free, with no P10
reader change".

## 2. Completion condition

1. Every person in `state.talent` carries exactly one birth-provenance record.
2. At each person's birthday due week, their integer age is computed from provenance and
   `market.tick` and written into `Talent.age`.
3. The validator cross-checks `Talent.age` against provenance and refuses a state where they
   disagree.
4. A pre-C.1 save migrates with a `legacy_age_anchor` for every existing person, anchored at the
   recording boundary, and the validator refuses any anchor whose `migrationWeek` differs from it.
5. No person's skill, genre experience, ceiling, development rate or Star Power moves because of
   this slice.
6. Rival-employed people age under the identical law.
7. A person minted after C.1 (the two P12 sites) gets provenance at mint, so invariant 1 cannot be
   broken by ordinary play.
8. The birthday due week is an in-state bucket, not a per-week scan over `state.talent`.

## 3. What exists today, verified rather than assumed

**(a) `Talent.age` exists and is STATIC.** VERIFIED: declared at `src/core/types.ts:123`. Written at
three sites only — `src/core/actions.ts:744`, `:893`, `:1083` (the last two clamping to `[18, 70]`)
— and at `src/core/hollywood.ts:221`. No site increments it and no tick advances it. There is no
`birthWeek`, no `apparentAge`, and no aging code of any kind.

**(b) The P14C eligibility seam is already cut and already documented as unreachable.** VERIFIED:
`src/core/talentMarket.ts:74-77` declares `retirement_announced`, `finishing_commitments` and
`retired_or_ineligible` in the type and states that no accepted engine path reaches them before
P14C, and that the classifier invents neither. C.1 does not reach them either; that is §6.2's work.

**(c) Save V32 is the live writer** and B.8 did not move it. So C.1 is a SAVE step, V32 → V33, and
the mirror of B.8: B.8 moved the wire without the save, C.1 moves the save without the wire.
HYPOTHESIS for the audit: that the projection does NOT need to move for C.1, because `Talent.age`
is an existing projected leaf whose VALUE changes and whose shape does not, and `apparentAge` can be
withheld from the wire until a consumer needs it.

## 4. The law, taken from §6.1 and not reinterpreted

- **Age is DERIVED FROM PROVENANCE AND MATERIALIZED, never incremented independently.** No `age++`
  anywhere. The stored `age` is a cache of a computation over provenance and `market.tick`, and the
  validator is what keeps the cache honest.
- **Two provenance kinds.** `authored_exact_week` for people authored after the boundary;
  `legacy_age_anchor { ageAtMigration, migrationWeek }` for everyone already in a pre-C.1 save.
- **The write is a VALUE write inside the frozen exact-key shape.** §6.1 names the mechanism:
  `v8Number` accepts it. C.1 adds no key to `Talent`.
- **The birthday due week is an in-state bucket, not a scan.** This is a law about shape, not a
  performance note. The programme carries a 6,240-week endurance obligation; a per-week scan over
  every person is the wrong shape at that horizon and the companion rules it out in advance.
- **`apparentAge` is a seam, not a system.** C.1 defines the field and its provenance and builds no
  adjustment mechanism. Cosmetic surgery is explicitly not P14 scope.
- **Age never decrements anything**: not a skill, a genre experience, a ceiling, a development rate
  or Star Power. The accepted development law only raises actuals toward ceilings and C.1 adds no
  decay path.
- **Rivals age identically** (§6.6), and no index is keyed by `PersonId`, seed or `worldId`.

## 5. Five traps, named before the writer meets them

**Trap 1: the stored age is a FLOAT for worldgen people and an INTEGER for authored ones.** §6.1
says so explicitly and adds that the UI floors it today. C.1 writes an INTEGER. So the first
materialization of a worldgen person's age is a value-SHAPE change on an existing leaf, from e.g.
`34.7` to `35`. Every test pinning a fractional age moves. The writer must enumerate those before
touching anything, and must not round them away silently.

**Trap 2: materializing age changes accepted downstream outputs, by design, over time.**
`ageFactor` (a bell centred at 34 with a 0.85 floor) and `ageRunwayMult` both read `talent.age`. A
world ticked far enough will price contracts differently than it does today. That is the intended
consequence and §6.1 says so. It is also exactly what will move long-running fixtures and endurance
expectations. The writer reports what moved; it does not adjust a constant to keep an old number.

**Trap 3: the validator invariant breaks the moment a rival mints a person.** Completion condition 1
says exactly one provenance record per `state.talent` id. VERIFIED from §6.5: the two accepted P12
mint sites are `enterRival` and `staff()`'s deficit supply. If they mint without provenance the
invariant fails in ordinary play, not in a corner case. So provenance-at-mint is IN SCOPE for C.1.
**The cohort scheduling of §6.5 is NOT**: no era-aware requests, no receipts, no 32-per-request
maximum, no replenishment. C.1 takes only the provenance-writing obligation from that section.

**Trap 4: grandfathering is a rule, not an inference.** §6.6 is explicit that no person starts
retired because an inferred boundary already passed, that no past lifecycle event may be invented,
and that the validator rejects any lifecycle row dated before the recording boundary. C.1 owns the
BOUNDARY and the anchor; it owns no retirement, so it has no row to date. The writer must still set
the boundary correctly, because §6.2 will refuse everything dated before it.

**Trap 5: the save bump needs its outgoing fixtures minted FIRST.** The plan's own slice rule and
this programme's repeated experience: genuine fixtures of the outgoing save version, minted at its
FINAL writer, before any source change. We hold exactly one V32 fixture today,
`genuine-v32-owes-two-p1`, minted for B.8 at `c7b5fd79`. HYPOTHESIS for the audit: that one fixture
is not enough outgoing coverage for a save step, and T0 should mint a small V32 corpus whose worlds
differ in the dimension C.1 actually changes — people of varied ages, including at the `[18, 70]`
clamp boundaries, and at least one rival-employed person.

## 6. Excluded, each with its owner

| excluded | owner | why |
| --- | --- | --- |
| retirement, announcement, the extension, `finishing_commitments` | §6.2, a later C slice | depends on age boundaries that do not exist until C.1 lands |
| profession vs industry retirement, Actor → Director / Writer | §6.3 | same |
| alumni | §6.4 | a presentation and eligibility state over a retirement C.1 does not create |
| cohort scheduling and replenishment | §6.5 | C.1 takes only the provenance-writing obligation, not the scheduler |
| the apparent-age fit descriptor per genre | §6.1's "what age may affect" | a SHARED GENERALIZATION with its own bounded design; C.1 defines the field, not the consumer |
| any age-driven decay | nobody, forbidden | §6.1 says age never decrements a skill, ceiling, rate or Star Power |
| Unity / native | deferred | unchanged standing qualification |

## 7. Order of work

1. T0: mint the outgoing V32 corpus, per Trap 5, before any source change.
2. The audit of this expansion.
3. RED, independently authored against this expansion as amended.
4. Implementation.
5. Verification and publication.

## 8. Standing qualifications

LOGIC VERIFIED, UNITY NOT VERIFIED. No native claim, no Owner acceptance claim. FU-1 is unreturned so
no UI-affecting claim rests on the `ui` suite. FU-2's disposition stays open with the threshold
unmoved. The authority note at record 756 applies: `CLAUDE.md` lists aging as not-current-scope and
that section provides for supersession by the current campaign, which names P14C in the companion,
the slice order and the Owner's continuation packet.
