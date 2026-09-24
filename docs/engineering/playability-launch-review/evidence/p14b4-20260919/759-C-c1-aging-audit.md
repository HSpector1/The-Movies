# 759-C — independent audit of the P14C.1 aging expansion, and the parent's verification

Auditor: `contract-auditor` specialist, Read/Glob/Grep only, no shell, no git, no test execution, no
writes. Its report was handed back as text and the parent filed it here, then verified every HIGH
finding against the source and, where the auditor could not, by decompressing the fixture it could
not open. A specialist's report is evidence, not a verdict.

**Verdict: PROCEED WITH AMENDMENTS.** Fourteen amendments: seven HIGH, five MODERATE, two LOW. The
completion condition survives. One supporting claim in §3(a) is false about the code, the reader list
in §1 is incomplete in a way that reaches a market-case outcome, and two of Trap 5's three corpus
axes are wrong.

---

## 1. HIGH findings, each verified by the parent

### A1 — the write-site census omits the dominant site, and the range is wrong

**PARENT VERIFIED.** `src/core/worldgen.ts:488` draws `ageS.truncatedNormal(38, 10, 20, 70)` and
`:525` writes it. That is the source of every starting population, every `enterRival` fill, every
`staff()` deficit supply and every research candidate. §3(a) called it "written at three sites only"
plus `hollywood.ts:221`; those four are correct as cited, and the enumeration is still wrong because
it omits the one that matters most.

Also wrong, and mine: Trap 5 said the clamp boundaries are `[18, 70]`. Worldgen draws on **`[20, 70]`**,
pinned at `tests/worldgen.test.ts:122`. `[18, 70]` is the AUTHORED clamp only (`actions.ts:893`,
`:1083`). MEASURED on the held fixture: age range **20.68 to 68.28**. A V32 world cannot hold an
18-year-old unless a minter authors one.

### A2 — there are five append sites, not two, and one is a player action

**PARENT VERIFIED**, and the parent's own first grep was itself incomplete, which is worth recording:
a pattern matching `talent: [...state.talent` misses `hollywoodTick.ts:142`, which appends to a local
`next` array. The complete set:

| site | what it is |
| --- | --- |
| `src/core/worldgen.ts:544` | the initial population |
| `src/core/hollywood.ts:223` | `enterRival`, P12 mint site 1 |
| `src/core/hollywoodTick.ts:142` | `staff()` deficit supply, P12 mint site 2 |
| `src/core/actions.ts:826` | `withCreatedTalent`, through which all three authored creators route |
| `src/core/actions.ts:2842` | `recruitScientist`, a PLAYER action |

`src/core/studioRunRecap.ts:728` builds a local `RecapTalent[]` and is correctly excluded.

Trap 3 quoted the companion's §6.5 sentence about *P12* mint sites accurately and then treated it as
the complete set of ways a person enters `state.talent`. It is not. `recruitScientist` appends a
person derived by `researchCandidates` (`src/core/technology.ts:190-195`) who was never in
`state.talent`, and the player triggers it directly. One piece of good news: `withCreatedTalent` is a
single append covering all three authored creators.

### A3 — provenance written at the mint call ORPHANS, measured

**PARENT VERIFIED.** `src/core/hollywoodTick.ts:136-142`: the mint at `:138` precedes the
affordability check at `:141`, which `continue`s, and the append is at `:142`. A rival that cannot pay
the signing bonus discards the person it just minted. Provenance written inside a shared mint
primitive therefore records someone who never enters `state.talent`, one dead row per unaffordable
rival hire per week, forever, in a save validated on every load.

`enterRival` has no such path: `hollywood.ts:218` is followed unconditionally by the append at `:223`.

### A4 — `isProven` is a LAW reader of age with a step at 30

**PARENT VERIFIED.** `src/core/talentMarket.ts:690-692`:
`talent !== undefined && (careerIdentity(talent).identityDisciplines.length > 0 || talent.age >= 30)`.
`priorityOrder` branches on it and returns two different descriptor orders, which is §2.1.7's
person-choice rule. **A person crossing 30 changes which studio wins a contested market case.**

§1 of the expansion named three readers whose outputs are continuous and said every accepted reader
"ages for free". That is true of those three and not true in the same sense of a step function on a
law path. The auditor further names five suites that use the predicate as a SELECTOR and would
silently choose a different subject if stored ages move, plus `ui/src/engine/adapter.ts:4295`
(`p.age >= 55`), which is presentation but player-facing and flips on the same kind of threshold.

### A5 — FLOOR, decided

**DECIDED: floor.** Verified arithmetic on the measured fixture: `floor(43.405) = 43` and both
`43.405 >= 30` and `43 >= 30` hold, so the `isProven` threshold is preserved. Round can flip it:
`round(29.6) = 30` turns `isProven` from false to true on a person the law currently treats as
unproven. Floor is also the only rule under which no already-displayed age changes at the migration
boundary, because the UI already floors.

Trap 1's `34.7 → 35` example is struck: under floor the first materialization of a 34.7-year-old
writes 34, not 35, and the example taught the wrong thing.

Honest limit, from the auditor and accepted: floor neutralises the integer thresholds and the
displayed values, but it is not value-neutral. `ageFactor(34.7)` and `ageFactor(34)` differ in the
fifth decimal and `iround` at `src/core/employment.ts:282` absorbs most but not provably all of it.
Claim only that.

### A6 — C.1 DOES change `bridge/`

**PARENT VERIFIED.** `bridge/runtime-checkpoint.ts:476-477` hard-codes `imported.saveVersion !== 32`
and the literal message `must be a current V32 save`; `:461` is `type CurrentEnvelopeSave = SaveFileV32`;
`:479-481` requires `must preserve the canonical V32 save bytes exactly`. All of it moves under C.1.
`bridge/session.ts:139` compares against `LIVE_SAVE_VERSION` and follows the constant for free.

So §3(c)'s hypothesis is RIGHT that the projection does not move, and it left a mandatory bridge edit
unnamed. This is the mirror of the caveat 745-C recorded for B.8, where the projection moved and
`generated/unity/` changed even though native controls stayed deferred.

### A7 — every legacy person would get the same birthday

**The finding is a derivation and the parent accepts it.** `legacy_age_anchor { ageAtMigration,
migrationWeek }` as literally specified in §6.1 carries no birth week-of-year. The only week it holds
is `migrationWeek`, so every pre-C.1 person's derived birthday is the same week-of-year. In a world
migrated at week 104, the bucket for weeks 156, 208, 260 and so on holds the ENTIRE population:
condition 8 is satisfied in shape while the annual work equals a full scan, and every age-sensitive
ask in the world steps on one tick. Trap 2 framed the consequence as gradual drift; it would in fact
be a once-a-year world-wide price step.

**DECIDED, adopting the auditor's alternative.** `ageAtMigration` stores the **float**, and the birth
week-of-year derives from its fractional part. MEASURED on the held fixture: **83 of 84 stored ages
are fractional** (43.40522…, 33.00749…, 39.21265…), because `truncatedNormal`
(`src/core/rng.ts:187-199`) returns the raw gaussian with no rounding. So `frac(age) x 52` spreads
legacy birthdays deterministically across the year using information the world already holds and that
Trap 1 otherwise discards. This is one field's type, not a scheduler.

## 2. The MODERATE and LOW amendments, adopted with the decisions they asked for

**A8 — the V33 → V32 downgrade.** DECIDED: permitted **exactly while no age has materialized**, that
is while every anchor sits at the boundary and every stored age still equals its anchor's
`ageAtMigration`; refused otherwise. That keeps the series' shape (each version allows one
lossless-under-a-predicate downgrade, `convertV31ToV30` at `src/core/save.ts:8843`, `convertV32ToV31`
at `:8929`) while closing the truth loss the auditor identified: stripping the root after
materialization yields a V32 save whose ages have silently advanced with no provenance, which every
frozen validator accepts because `v8Number` takes any finite number.

**A9 — name the root and the device.** A new top-level root using the `stripV31Root` pattern
(`src/core/save.ts:8794-8797`), with `validateSaveV31` (`:8805-8818`) as the template and
`tests/p14b5-save-v31.test.ts:153` as the live-root assertion to extend.

**A10 — Scientists.** DECIDED: they age. `state.talent` holds `role: 'scientist'` people and
completion condition 1 covers every id in that array. §6.1's profession list predates P13's
scientists, and the companion's own POST-P13 REFRESH flag is exactly for this. MEASURED: the held
fixture contains **zero** scientists, so this needs a corpus world.

**A11 — Trap 5's corpus axes were wrong.** Adopted wholesale; see §3.

**A12 — unbounded age, disclosed.** C.1 ships aging without retirement, so the endurance horizon
produces working 150-year-olds. The auditor's paper arithmetic, which the parent did not re-measure:
`ageFactor` floors at 0.85 from age 56 and `ageRunwayMult` floors at 0.35 from 60, so nothing breaks
numerically. Disclosed with §6.2 named as owner.

**A13 — a test C.1 invalidates by construction.** `tests/p14b4-cast-class-policy.test.ts:202`
hand-writes `age` onto a real person to flip `isProven`. Condition 3's validator makes that illegal.
It needs rewriting by a test author, not re-pinning, and the writer must not touch it.

**A14 — six precision items**, all adopted: state the zero-RNG-draw requirement in the expansion and
not only in the RED; the bucket must be an array or sorted numerically on read, because
`src/core/save.ts:588` sorts object keys lexicographically so `"100"` precedes `"11"`;
`bridge/session.ts:609`'s comment becomes false; `createTalent` (`actions.ts:744`) stores age
unrounded and, unlike its siblings at `:927` and `:1115`, has no `Number.isFinite` guard, so "an
integer for authored ones" is false on that path; Trap 2's blast radius is narrower than stated
because both consumers have flat bands outside roughly (12, 56) and (26, 60); and the 6,240-week
figure should cite the companion for the law rather than imply a measured endurance run, since the
only artifact at that horizon is a synthetic ledger fixture at `tests/bridge-p11-ready.test.ts:307-324`.

## 3. The T0 corpus, corrected and measured

Trap 5's conclusion holds: one V32 fixture is thin outgoing coverage for a save step. Its axes were
wrong, and the parent MEASURED the held fixture by decompressing it, which the auditor's tool set
could not do:

| claim | measured |
| --- | --- |
| rival-employed person present | **24 rival-employed employment rows.** Condition 6 already has a world. My axis was redundant. |
| `[18, 70]` clamp boundaries | **age range 20.68 to 68.28.** The draw is `[20, 70]`; `[18, 70]` is authored-only. My axis was unreachable. |
| varied mid-band ages | the migration copies age verbatim and branches on no value, so a world of 40-year-olds and one of 60-year-olds exercise identical code. My axis bought nothing. |
| scientists | **zero.** A real gap. |
| authored persons | **zero.** A real gap, and the only lawful route to an integer stored age. |
| `market.tick` | **104**, `originWeek` 0. The week-0 side is a real gap. |
| `hollywood` | present. The null-hollywood side is a real gap. |

**The axes that matter, adopted from the audit:** (1) a world with `hollywood === null`, which
distinguishes a boundary taken from `hollywood.originWeek` from one taken from `market.tick` and is
the axis most likely to find a real defect; (2) a world at `market.tick === 0`, where a correct
`migrationWeek` and a defaulted-to-zero one are indistinguishable; (3) a world with an AUTHORED
person; (4) a world with a Scientist; (5) a person near the top of the draw, already satisfied at
68.28.

Axes 1 and 2 are the ones not to ship without.

**DECIDED on the boundary, which A7 and axis 1 both turn on:** the recording boundary is
`market.tick` at migration, stored in the new root. It cannot be `hollywood.originWeek`, because
`GameState.hollywood` is nullable (`src/core/types.ts:1906`).

## 4. Determinism, and the one assertion that makes the law mechanical

The auditor checked and found clean, and the parent endorses: `src/core/tick.ts` never iterates the
population (`state.talent` appears at `:257`, `:276` by reference and at `:546-555` for one
production's participants), so condition 8's law protects a property the build already has.

The requirement worth promoting out of the RED and into the expansion: **the RED must assert
`rngState` byte-identical across a tick that materializes a birthday and one that does not.**
`src/core/tick.ts:227` deserializes one shared stream and re-serializes it, so any draw the
materialization made would move every downstream draw in the world. Age derived from provenance and
`market.tick` needs no draw. That single assertion is what makes "derived, never incremented"
mechanically enforced rather than merely intended.

## 5. Checked and clean

- **`Talent` is an exact-key frozen shape and C.1 adds no key.** `src/core/save.ts:1650-1669` lists
  all sixteen members; `:1673-1674` accepts `age` through `v8Number` with the comment "Generated ages
  are continuous; only finiteness is a runtime requirement." §4's mechanism claim is exactly right.
- **§3(b) reproduces as cited**, and is true of the code and not only of the comment:
  `marketEligibility` returns only the three pre-P14C statuses.
- **The frozen save builders need no change.** `tests/frozen-save-builder-projection.test.ts:53-77`
  injects a future root and asserts it cannot leak; a C.1 root passes unchanged.
- **The frozen V14 key lists do not move**, because every later root reaches them already stripped.
- **`migrateTalent` (`src/core/save.ts:6563`) stays safely pinned**, because migrations run in
  sequence and V32 → V33 runs last, so it always sees the pre-C.1 float. Provided C.1 does not touch
  it, which it must not.
- **`apparentAge` can be withheld from the wire at no cost.** Endorsed.
- **One decision recorded as deliberate:** `StudioPersonProfileSnapshot.age` stays declared `number`
  (`bridge/schema/bridge-schema.ts:2725`) even though it becomes integer-valued at runtime.
  Tightening it to `integer` would mint a new schema identity and force a projection bump this slice
  does not need. Recorded so a later reader does not read the mismatch as an oversight.

## 6. Evidence limits

The auditor ran nothing: no tests, no shell, no git, no build. Its arithmetic on `ageFactor` and
`ageRunwayMult` is a paper calculation it labelled as one. It could not decompress the V32 fixture,
so every claim it made about that fixture's contents was INFERRED from the producing route and flagged
as such; the parent decompressed it and the results are in §3, where they confirmed the auditor's
inference about rival employment and corrected two of the parent's own axes. Nobody can say which
`saveVersion === 32` pins fail under the bump until the bump runs.

LOGIC VERIFIED, UNITY NOT VERIFIED. This audit is acceptance of nothing.
