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

---

## 9. Amendment log (record 759-C, with the parent's verification and decisions)

The audit returned PROCEED WITH AMENDMENTS with fourteen items. The original text above is preserved
unchanged. Every HIGH finding was verified by the parent against the source, and two were verified by
decompressing the held V32 fixture, which the read-only auditor could not open.

**A1 — §3(a)'s census is WRONG and is corrected.** It omits the dominant write site:
`src/core/worldgen.ts:488` draws `truncatedNormal(38, 10, 20, 70)` and `:525` writes it, and that is
the source of every starting population, every `enterRival` fill, every `staff()` supply and every
research candidate. The four cited lines are each correct; the enumeration is not. **Also corrected,
and it was mine: the worldgen range is `[20, 70]`, not `[18, 70]`.** `[18, 70]` is the AUTHORED clamp
only. MEASURED on the held fixture: ages run 20.68 to 68.28.

**A2 — there are FIVE append sites, not two, and one is a PLAYER action.** `worldgen.ts:544`;
`hollywood.ts:223` (`enterRival`); `hollywoodTick.ts:142` (`staff()` supply); `actions.ts:826`
(`withCreatedTalent`, covering all three authored creators with one write); and
**`actions.ts:2842` (`recruitScientist`)**, which appends a person `researchCandidates` derived and who
was never in `state.talent`. Trap 3 quoted the companion's sentence about *P12* mint sites correctly
and then treated it as the complete set of ways a person enters the array. Completion condition 7 and
Trap 3 are restated over all five. Recorded: the parent's own first grep also missed
`hollywoodTick.ts:142`, which appends to a local array rather than to `state.talent` directly.

**A3 — provenance is written at the APPEND, never at the mint call.** MEASURED:
`hollywoodTick.ts:136-142` mints at `:138`, checks affordability at `:141` and `continue`s, and appends
only at `:142`. A rival that cannot pay discards the person it just minted, so provenance written
inside a shared mint primitive records someone who never enters `state.talent` — one dead row per
unaffordable rival hire per week, forever, in a save validated on every load. §6.5's shared primitive
is therefore NOT adopted: taking it would import the scheduler's shape and this hazard together.

**A4 — §1's reader list is incomplete, and the omission reaches a market outcome.**
`src/core/talentMarket.ts:690-692`, `isProven`, tests `talent.age >= 30` and `priorityOrder` branches
on it to return two different descriptor orders. **A person crossing 30 changes which studio wins a
contested market case.** "Every accepted reader ages for free" is true of the three continuous readers
named and is not true in the same sense of a step function on a law path. Five suites additionally use
the predicate as a SELECTOR and would silently choose a different subject if stored ages move, and
`ui/src/engine/adapter.ts:4295` flips player-facing copy at 55.

**A5 — DECIDED: FLOOR, and Trap 1's example is struck.** Floor preserves both integer thresholds
(`floor(43.405) = 43`, and `43.405 >= 30` and `43 >= 30` agree; `round(29.6) = 30` would flip
`isProven`) and preserves every already-displayed age at the boundary, because the UI already floors.
Trap 1's `34.7 -> 35` is wrong under floor and taught the wrong thing. Honest limit: floor is not
value-neutral, since `ageFactor(34.7)` and `ageFactor(34)` differ in the fifth decimal.

**A6 — C.1 DOES change `bridge/`, and §3(c) failed to say so.** The projection hypothesis is RIGHT
(no wire shape moves, `apparentAge` withheld), and `bridge/runtime-checkpoint.ts:476-477` still
hard-codes `saveVersion !== 32` with a literal `must be a current V32 save` message, `:461` aliases
`SaveFileV32`, and `:479-481` pins canonical V32 bytes. The mirror of B.8's caveat, where the
projection moved and the C# DTOs regenerated even though native controls stayed deferred.

**A7 — DECIDED: `ageAtMigration` stores the FLOAT and the birth week-of-year derives from its
fractional part.** As literally specified, `legacy_age_anchor` carries no week-of-year, so every
pre-C.1 person's birthday derives to the SAME week and the whole population materializes on one tick
each year: condition 8 satisfied in shape while the annual work equals a full scan, and a once-a-year
world-wide price step rather than the gradual drift Trap 2 describes. MEASURED: **83 of 84 stored ages
in the held fixture are fractional**, because `truncatedNormal` (`src/core/rng.ts:187-199`) returns the
raw gaussian. So `frac(age) x 52` spreads legacy birthdays deterministically from information the
world already holds and that Trap 1 otherwise discards. One field's type, not a scheduler.

**A8 — DECIDED: the V33 → V32 downgrade is permitted exactly while no age has materialized** (every
anchor at the boundary and every stored age still equal to its `ageAtMigration`), and refused
otherwise. That keeps the series' one-lossless-downgrade-under-a-predicate shape while closing the
truth loss: stripping the root after materialization yields a V32 save whose ages advanced with no
provenance, which every frozen validator accepts because `v8Number` takes any finite number.

**A9 — the root and the device, named.** A new top-level root on the `stripV31Root` pattern
(`src/core/save.ts:8794-8797`), `validateSaveV31` (`:8805-8818`) as the template,
`tests/p14b5-save-v31.test.ts:153` as the live-root assertion to extend.

**A10 — DECIDED: Scientists age.** They are in `state.talent` and condition 1 covers every id there.
§6.1's profession list predates P13's scientists and the companion's POST-P13 REFRESH flag is for
exactly this. MEASURED: the held fixture contains ZERO scientists, so this needs a corpus world.

**A11 — Trap 5's corpus axes were WRONG and are replaced.** MEASURED on the held fixture: 24
rival-employed rows (my axis was redundant), age range 20.68-68.28 (my `[18, 70]` axis was
unreachable), and the migration branches on no age value (my varied-ages axis bought nothing). The
axes that matter: **(1) `hollywood === null`**, which distinguishes a boundary read from
`hollywood.originWeek` from one read from `market.tick`; **(2) `market.tick === 0`**, where a correct
`migrationWeek` and a defaulted-to-zero one are indistinguishable; (3) an AUTHORED person, the only
lawful route to an integer stored age; (4) a Scientist; (5) a person near the top of the draw, already
satisfied. **Axes 1 and 2 are the ones not to ship without.**

**DECIDED, which A7 and axis 1 both turn on: the recording boundary is `market.tick` at migration,
stored in the new root.** It cannot be `hollywood.originWeek`, because `GameState.hollywood` is
nullable (`src/core/types.ts:1906`).

**A12 — unbounded age, DISCLOSED.** C.1 ships aging without retirement, so the endurance horizon
produces working 150-year-olds. Nothing breaks numerically (both consumers floor: `ageFactor` at 0.85
from 56, `ageRunwayMult` at 0.35 from 60, per the auditor's paper arithmetic). §6.2 owns the fix; C.1
owns the disclosure.

**A13 — `tests/p14b4-cast-class-policy.test.ts:202` is invalidated BY CONSTRUCTION.** It hand-writes
`age` onto a real person to flip `isProven`, which condition 3's validator makes illegal. A test author
rewrites it. **The writer must not touch it.**

**A14 — six precision items, all adopted.** The zero-RNG-draw requirement is promoted into §4 below.
The birthday bucket must be an ARRAY or sorted numerically on read, because `src/core/save.ts:588`
sorts object keys lexicographically so `"100"` precedes `"11"`. `bridge/session.ts:609`'s comment
becomes false. `createTalent` (`actions.ts:744`) stores age unrounded and, unlike `:927` and `:1115`,
has no `Number.isFinite` guard, so "an integer for authored ones" is false on that path. Trap 2's blast
radius is narrower than stated, since both consumers are flat outside roughly (12, 56) and (26, 60),
which tells the writer in advance which fixture people will not move. The 6,240-week figure cites the
companion for the law, not a measured endurance run.

**PROMOTED INTO THE LAW (from 759-C §4): the RED must assert `rngState` byte-identical across a tick
that materializes a birthday and one that does not.** `src/core/tick.ts:227` deserializes one shared
stream and re-serializes it, so any draw the materialization made would move every downstream draw in
the world. Age derived from provenance and `market.tick` needs no draw. That assertion is what makes
"derived, never incremented" mechanically enforced rather than merely intended.

**Also adopted from 759-C §5:** `migrateTalent` (`src/core/save.ts:6563`) stays pinned and C.1 must
not touch it; the frozen save builders and the frozen V14 key lists need no change; and
`StudioPersonProfileSnapshot.age` stays declared `number` even though it becomes integer-valued,
because tightening it would mint a new schema identity and force a bump this slice does not need.

---

## 10. Amendment log (Owner directive, 2026-09-24)

Three implementation pins, applied to the existing test scope. A7's original text is preserved
above; the correction below supersedes its formula.

**A7-CORRECTION — the fraction runs BACKWARD from the next birthday, and `frac(age) x 52` was the
wrong direction.** A7 proposed deriving a birth week-of-year as `frac(age) x 52`. The Owner's
example is the disproof: a person aged **29.75 at migration turns 30 about 13 weeks later, not 39.**
The fraction measures progress SINCE the previous birthday, so the time remaining is
`(1 - frac(a0)) x 52`. A7's spreading claim survives — the fractional parts still distribute
birthdays across the year, and 83 of 84 held-fixture ages are fractional — but its arithmetic would
have put every birthday three quarters of a year out of phase.

**The derivation, pinned as one formula rather than two.** With `a0` the anchor age (float) and `w0`
the anchor week:

> `age(w) = floor(a0 + (w - w0) / 52)`

No separate birth-week field exists to disagree with it. The Owner's case: `29.75 + 13/52 = 30.0`,
floor 30, at exactly `w0 + 13`. An integer anchor (`a0 = 28.0`, the `hollywood.ts:221` floor) is due
at `w0 + 52`, and those people legitimately share a bucket — **no randomness is introduced to spread
them**, per the directive.

**The bucket derives from that formula, and is corrected against it rather than computed beside it.**
A due week is the smallest `w` with `age(w) > n`. The seed is `d = ceil((n + 1 - a0) x 52)`, then
`d` steps by at most one in each direction until `age(w0 + d - 1) == n` and `age(w0 + d) == n + 1`.
That correction is not decoration: `(30 - 29.75) x 52` is representable, but a neighbouring anchor
evaluating to `13.000000000000002` would ceil to 14 and leave a stored age stale for a week, with
every reader — including `isProven` — reading the stale value. The bucket is a visit list; the floor
formula is the law, and the two agree by construction.

**Successive birthdays are recomputed from the anchor, never by adding 52.** Same reason.

**A4 is promoted from a finding to a REQUIRED TEST.** The 30 boundary is a market decision, so the
RED carries a person immediately before and immediately after that birthday, through save and
reload, and attributes any market difference to the crossing itself. Existing expectations are not
adjusted to recover old outcomes; a moved outcome is reported and attributed.

**The zero-draw law is sharpened.** 759-C §4's promoted assertion is kept but re-scoped: the binding
assertion is that **the materialization entry point consumes no RNG** — `rngState` byte-identical
across a direct call that materializes a birthday. An ordinary weekly advance may legitimately draw
for other simulation activity, so a whole-tick comparison is a reported diagnostic, not the pin.

**A8's downgrade predicate is restated as a losslessness test, not a shape test.** Matching the V32
file shape is insufficient. The permitted downgrade must round-trip the anchor's ORIGINAL FRACTIONAL
age, and the test asserts the recovered float, not the file's key set.

**Endpoint, quoted.** C.1 finishes when persistent professionals including Scientists age correctly
through calendar advances and save/reload, with existing readers receiving correct ages and
qualified verification published. Retirement, extensions and profession transitions are §6.2/§6.3.
