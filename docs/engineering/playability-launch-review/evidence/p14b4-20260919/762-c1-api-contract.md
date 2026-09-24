# 762 — the P14C.1 API contract, pinned before the RED and the writer start

Both specialists work from this file. It exists so the RED and the implementation cannot disagree
about a name, a field or an ordering, and so the RED fails because the behaviour is missing rather
than because an import resolved to `undefined`.

Source of law: expansion `758` as amended by its §9 (audit 759-C) and §10 (the Owner directive of
2026-09-24). Where this file and the expansion differ, this file is the later decision and says so.

## 1. The derivation, one formula

```
age(w) = floor(anchorAge + (w - anchorWeek) / 52)
```

There is no stored birth week to disagree with it. Every other quantity derives from it.

The Owner's case: `29.75 + 13/52 = 30.0`, floor 30, at exactly `anchorWeek + 13`. The corpus fixture
`genuine-v32-authored` carries that person and its provenance carries the predicted week, committed
at `ace2773a` before this contract existed.

## 2. State

A new top-level `GameState` root, `talentProvenance`, on the `stripV31Root` pattern
(`src/core/save.ts:8794`).

```ts
export type TalentProvenanceRow =
  | { personId: string; kind: 'authored_exact_week'; ageAtEntry: number; entryWeek: number }
  | { personId: string; kind: 'legacy_age_anchor'; ageAtMigration: number; migrationWeek: number }

export type TalentProvenanceRoot = {
  boundaryWeek: number                                  // market.tick when the root was created
  rows: TalentProvenanceRow[]                           // exactly one per state.talent id
  due: { week: number; personIds: string[] }[]          // ASCENDING by week, the visit list
}
```

**A naming hazard, recorded rather than renamed.** `authored_exact_week` is the companion's own kind
name and is kept, so this slice deviates from the specification in no name. It covers every person
who ENTERED `state.talent` at a known week with a known exact age, which includes worldgen's genesis
population and rival hires. It is **not** `Talent.authored`, which in this codebase means
player-created. A reader who conflates the two will misread the root.

**`due` is an ARRAY, never an object keyed by week.** `src/core/save.ts:588` sorts object keys
lexicographically, so `"100"` would precede `"11"` (759-C amendment 14).

**`due` is a cache and the validator keeps it honest.** It is fully recomputable from `rows` and
`market.tick`, and the validator recomputes it and refuses a mismatch. A cache in a save file that
nothing reconciles is the truth-loss class A8 closed; this one is reconciled.

## 3. `src/core/aging.ts`, the new module

```ts
export function anchorOf(row: TalentProvenanceRow): { age: number; week: number }
export function ageAt(row: TalentProvenanceRow, week: number): number
export function nextBirthdayWeek(row: TalentProvenanceRow, storedAge: number): number
export function provenanceRowFor(personId: string, age: number, week: number): TalentProvenanceRow
export function buildTalentProvenance(
  people: { id: string; age: number }[], week: number, kind: TalentProvenanceRow['kind'],
): TalentProvenanceRoot
export function materializeAges(state: GameState): GameState
export function withTalentProvenance(state: GameState, person: { id: string; age: number }): GameState
```

**`ageAt`** is the formula in §1 and nothing else.

**`nextBirthdayWeek`** returns the smallest `w` with `ageAt(row, w) > storedAge`. It SEEDS with
`anchorWeek + ceil((storedAge + 1 - anchorAge) * 52)` and then steps by at most one in each direction
until `ageAt(row, w - 1) === storedAge` and `ageAt(row, w) === storedAge + 1`. The correction is not
decoration: a neighbouring anchor whose product evaluates to `13.000000000000002` would ceil to 14
and leave a stored age stale for a week, with every reader including `isProven` reading the stale
value. **Successive birthdays are recomputed from the anchor, never by adding 52.**

**`materializeAges(state)`** visits only the people in `due` whose week is `state.market.tick` or
earlier, writes `ageAt(row, tick)` onto each, and rebuilds their `due` entries. **It consumes no RNG
and takes no RNG argument.** It is idempotent: calling it twice on the same state returns an equal
state.

**`withTalentProvenance`** is what the five append sites call. It appends one row and inserts the
person into `due`.

## 4. The five append sites, each writing provenance AT THE APPEND

`worldgen.ts:544` · `hollywood.ts:223` (`enterRival`) · `hollywoodTick.ts:142` (`staff()` supply) ·
`actions.ts:826` (`withCreatedTalent`) · `actions.ts:2842` (`recruitScientist`).

Never at the mint call. `hollywoodTick.ts:136-142` mints at `:138`, checks affordability at `:141`
and `continue`s, so provenance written inside a shared mint primitive records one dead row per
unaffordable rival hire per week, forever, in a save validated on every load (759-C amendment 3).

## 5. Ordering inside the tick

`materializeAges` runs after `market.tick` advances and **before any consumer of `talent.age` runs in
that week**. The binding consequence: a person whose birthday falls in week `w` is already the new
age when week `w`'s talent market reads `isProven`.

## 6. Save V33

`LIVE_SAVE_VERSION = 33`. `SaveFileV33`, `GameStateV33`, `validateSaveV33`, `convertV32ToV33`,
`convertV33ToV32`, `migrateToV33`, `stripV33Root`, and the `save.saveVersion === 33` arm on every
`migrateToVn`. `makeSave` stamps 33.

**`validateTalentProvenanceRoot` checks five things:**

1. exactly one row per `state.talent` id, and no row naming a person who is not there
2. `talent[i].age === ageAt(row_i, market.tick)` for every person, which is what keeps the
   materialized age honest against its provenance
3. `due` equals the recomputation from `rows` and the stored ages, exactly, including order
4. `boundaryWeek <= market.tick`, and every anchor week `<= market.tick`
5. no anchor week earlier than `boundaryWeek` for a `legacy_age_anchor` row

**`convertV32ToV33`** sets `boundaryWeek = state.market.tick`, writes one `legacy_age_anchor` per
person with `ageAtMigration` holding **the original float, unrounded**, then FLOORS each
`talent[i].age`. That first flooring is Trap 1's value-shape change and it is the migration's
visible cost.

**`convertV33ToV32` is permitted exactly when `market.tick === boundaryWeek` and every row is
`legacy_age_anchor`**, and refused otherwise. Under that predicate it restores each
`ageAtMigration` into `talent[i].age` and strips the root, which recovers the exact V32 bytes.

Directive 3 makes the test explicit: **matching the older file shape is insufficient.** The RED
asserts the round trip `V32 bytes -> V33 -> V32 bytes` is **byte-identical** on every corpus fixture,
and that a world ticked one week past the boundary is REFUSED rather than silently approximated.

## 7. Bridge

No projection bump. No wire shape moves and `apparentAge` is withheld, per 759-C amendment 6's
confirmation of the expansion's hypothesis. `bridge/runtime-checkpoint.ts:461,476-477,479-481` still
hard-codes V32 and moves to 33. `StudioPersonProfileSnapshot.age` stays declared `number` even though
it becomes integer-valued, because tightening it would mint a new schema identity and force a bump
this slice does not need (759-C §5).

## 8. What C.1 does not build

`apparentAge` is a declared seam with no adjustment mechanism. No retirement, no announcement, no
extension, no profession transition, no alumni, no cohort scheduler, no age-driven decay.

**Disclosed:** C.1 ships aging without retirement, so the endurance horizon produces working
150-year-olds. Both consumers floor (`ageFactor` at 0.85 from 56, `ageRunwayMult` at 0.35 from 60),
so nothing breaks numerically. §6.2 owns the fix; C.1 owns the disclosure.

---

## 9. Two contract assumptions verified against source, and one narrowed

**`due` must be an array: CONFIRMED.** `src/core/save.ts:589` is `Object.keys(obj).sort()`, a
lexicographic sort in the serializer itself, so an object keyed by week really would order `"100"`
before `"11"`.

**The `enterRival` append site is narrower than record 760 described, and the writer needs the
narrower reading.** `src/core/hollywood.ts:223` (`talent.push(person)`) sits inside `if (!person)`,
reached only when no reusable free agent exists, and the `Math.max(28, …)` raise at `:221` sits
inside a further `if (authored)`, where that flag means "built from a scripted rival template" and is
NOT `Talent.authored`. Consequences for §4:

- A rival hire that REUSES an existing person appends nothing and must write NO provenance row.
  Writing one per hire would violate condition 1 on the second hire of the same person.
- Provenance must capture the age as it is AT THE APPEND, after any raise, not as drawn.
- `enterRival` pushes into a LOCAL `talent` array copy and commits it later. The provenance write
  must follow the same commit, not a separate path that can diverge from it.

---

## 10. CORRECTION to §5 — the ordering as written is unimplementable, and the right rule is stronger

§5 said `materializeAges` "runs after `market.tick` advances and before any consumer of `talent.age`
runs in that week". **No such point exists inside `tick()`.** `src/core/tick.ts:408-410` states the
rule in its own comment — "the clock is the TICK's to advance, as its last step (M1)" — and `:1048`
is where it happens. For the whole body of the tick, `state.market.tick` is still `currentTick`.

**The corrected rule, which is simpler and checks harder.** The materialization happens at the TAIL,
beside the clock advance at `tick.ts:1047-1049`, against `currentTick + 1`. `talent` is already a
local rebound at `:1049`, so it slots in there and nowhere else.

The invariant that falls out is the one the validator already wants:

> **On every state the engine ever emits, `talent[i].age === ageAt(row_i, state.market.tick)`.**

That is stronger than the original wording, because it is true at every boundary rather than at one
privileged moment, and it is exactly validator condition 2. A person whose birthday falls in week
`w` is the new age for the whole of week `w`, because the tick that PRODUCED week `w` set it at its
tail.

**What is deliberately NOT asserted here.** Whether a given step INSIDE a tick sees the old age or
the new one depends on where that step sits relative to the tail, and this contract does not guess.
The RED MEASURES it on the 30 crossing and reports what it finds. A measured in-tick ordering is a
finding; an assumed one is how a wrong law gets written into a test.

**`materializeAges` therefore takes the week it is materializing against**, rather than reading
`state.market.tick`, since at the call site the clock has not moved yet:

```ts
export function materializeAges(state: GameState, week: number): GameState
```

§3's single-argument signature is superseded by this one.

---

## 11. Why the save bump is NECESSARY and not chosen

Verified rather than assumed, because "does this slice really need a save step" is the question that
decides the whole shape of the work. `src/core/save.ts:4827` and `:4952` both call
`v12ExactKeys(state, V14_STATE_KEYS, "state", V11_OPTIONAL_STATE_KEYS)`. The state object is
EXACT-KEYED at the V14 level, and every version above it strips its own root before handing the
frozen chain what that chain knows (`stripV31Root` at `:8794`, `stripV32Field` at `:8873`).

So a new top-level root cannot be added without a new version and a matching strip: a V32 validator
meeting `talentProvenance` refuses it as an unknown key. C.1 is a save step because the root makes it
one, and 759-C amendment 14's finding that the frozen V14 key lists need no change is the same fact
read from the other side — they need no change precisely BECAUSE the strip keeps the new root away
from them.

---

## 12. Four items resolved after the RED (at `b4ea6cd7`, RED verified by the parent)

The RED author raised three gaps in this contract and could not resolve them, correctly. A fourth is
the parent's, found while checking a blast radius neither the contract nor the RED covered.

**F1 — `provenanceRowFor` arity. The SCAFFOLD is authoritative; §3 was wrong.** The real signature is
four arguments, `(personId, age, week, kind)`. The caller must supply the kind because it knows it and
the function cannot infer it: `convertV32ToV33` writes `legacy_age_anchor`, every append site writes
`authored_exact_week`. §3's three-argument declaration is struck.

**F2 — the dispatcher takes the BROAD reading, and the RED's "bonus" test is REQUIRED.** §6 listed the
V33 functions without saying whether the generic entry points move. Record 763 R2 and R3 already
decided it and this makes it explicit: `validateSave`'s dispatch gains a `=== 33` arm, its message
reads "versions 1 through 33", the `SaveFile` union gains `SaveFileV33`, and `loadSave` / `exportSave`
/ `importSave` therefore accept a V33 envelope. A narrow reading would leave the live writer stamping
a version the generic loader refuses, which is not a defensible shape.

**F3 — root initialization for a NEW campaign: `generateWorld` owns it.** §4 named five APPEND sites,
each of which presumes a root to append into, and named no creator. `generateWorld` builds
`talentProvenance` with `boundaryWeek: 0` and one `authored_exact_week` row per generated person, at
`worldgen.ts:544` where the population is committed. A fresh campaign has no migration, and every
person's exact entry week genuinely is 0.

**Its consequence, stated rather than discovered later: a new V33 campaign stores INTEGER ages.**
Validator condition 2 forces `talent[i].age === ageAt(row, market.tick)`, so `43.40522…` is stored as
`43` from genesis. New-campaign economics shift very slightly, because `ageFactor(43)` and
`ageFactor(43.405)` differ. That is Trap 1 and Trap 2 arriving together at world generation, and it is
intended. **A fresh V33 campaign is therefore NOT downgradable**, since its rows are
`authored_exact_week` and the predicate in §6 admits only `legacy_age_anchor`. Correct: a V33-native
campaign has no V32 ancestor bytes to recover, so there is nothing to be lossless about.

**F4 — the historical control and the roster-wall observatory, the parent's finding.**
`src/harness/roster-wall/historical-control.ts` is the accepted M0A-era acceptance path.
`historicalHashState` strips each newer root and REFUSES to strip one carrying authority, and
`frozen.talent` is mapped with only the `research` keys removed, so **`age` is inside the hash**.

Two things follow, and the writer owns both.

1. `liftV18Control` must build a `talentProvenance` root, because `GameState` now requires one. It
   builds anchors from the control's EXISTING ages at `boundaryWeek = state.market.tick` and **does
   NOT floor them.** A historical control is a frozen artifact whose ages are pre-C.1 facts, it is
   never ticked and never saved at V33 (it uses `makeSaveV18`), so nothing materializes over it and
   C.1 has no authority to move an accepted historical artifact.
2. `historicalHashState` strips `talentProvenance` after verifying it equals the canonical rebuild
   from the control's own people, on the `technology` / `physicalPlans` / `talentMarket` precedent
   rather than the empty-root precedent — this root is legitimately non-empty.

**The falsifier, and the instruction that goes with it.** MEASURED: no test file imports
`historicalHashState` or `liftV18Control`; the observatory is a CLI (`run-roster-wall-observatory.ts`),
so the full-core run does not exercise it and this is a compile-and-honesty obligation rather than a
suite failure. **If any historical hash does move, the writer REPORTS it and stops. It is never
re-pinned to recover the old number.**

---

## 13. §12 F4 IS STRUCK. Both of its clauses were false, and this replaces it.

F4 told the writer that `liftV18Control` must NOT floor its ages, on my claim — which I marked
MEASURED — that no test imports it and the observatory is a CLI, so the control is never ticked and
never validated. **Both clauses are false.** `tests/bridge-p05a1-owner-greenlight.test.ts:27` and
`tests/bridge-p05a3-roster-liveness.test.ts:34` import it; the bridge reaches `validateSaveV33`
through `stateDigest`; and `src/harness/roster-wall/player-policy.ts:1122` assigns a lifted control
and immediately ticks it. An unfloored root violates condition 2 the moment either happens, which is
what those 10 failures were.

**THE RULE THAT REPLACES IT — the artifact/adapter split, and it is the Owner's.**

> The historical ARTIFACT and its live ADAPTER are different responsibilities. The original V18 files
> and the pinned reproducer are unchanged. The adapter handed to the current engine must produce a
> VALID current state. Current-engine results and historical reference results stay distinguishable,
> and **a historical reference value is never overwritten because the adapter changed.**

`liftV18Control` therefore stores `Math.floor(age)` in `talent` and anchors `talentProvenance` on the
**original unrounded ages** — the same split `convertV32ToV33` uses, so the pre-C.1 fact survives
verbatim in the anchor and only the cache over it becomes an integer. Nothing historical is discarded.

**The split holds by CONSTRUCTION, not by care, and that was verified rather than assumed.**
`player-policy.ts:1122-1123` captures `freshEntryState = freshEntry.state` BEFORE the lift and hashes
THAT. The accepted `stateHash` pin is taken on the frozen artifact and is structurally out of the
adapter's reach.

**Measured, and the answer to the question nobody had taken:** lifting the same control both ways —
identical except the floor — and ticking both 26 weeks leaves cash, `rngState`, contract count, ledger
rows and ledger total all unchanged. No accepted roster-wall number moved. That is stronger than a
green suite, which would only say that nothing PINNED moved.

**The repricing this repair does earn, reported and NOT re-pinned by the writer.** All 60 ages move on
both fixtures and `ageFactor` is not one-signed: **42 rise, 15 fall, 3 unchanged** (the three sit
outside the `(12, 56)` band where the bell is flat). Seven of eight published weeklies move on p05a1,
six of eight on p05a3. **Exactly one PINNED constant moves**, at
`tests/bridge-p05a3-roster-liveness.test.ts:56`:

| field | pinned | now | delta |
| --- | --- | --- | --- |
| `weekly` | 6040 | 6025 | −15 (−0.248%) |
| `guaranteed` | 314080 | 313300 | −780 |
| `bonus` | 56536 | 56398 | −138 |

Traced end to end: `t-act-17` 25.440489233845923 → 25 → `ageFactor` 0.977294 → 0.974897 (−0.2453%) →
`offerForTalent` (`employment.ts:283`, where `ageFactor` is the only factor the floor touches) → the
published offer. The −0.248% on the money matches the −0.2453% on `ageFactor` to rounding.
