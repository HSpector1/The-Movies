# 1359-C2 note for P15B's Wave 2 RED: B7 `legacy-endless-no-revival`

1359-F2 moves B7 out of the P15C Wave 2 RED. It needs P15B's `corporateCondition` root and a natural route that closes one studio before week 6240 and another after it. Only P15B's RED can supply that route.

**Clause.** 1359-A §8 B7 (:236) and §4.4 (:140-142): a studio closed before B stays closed and is never evaluated again for 520 ticks; a later closure leaves `campaignLegacy.official` byte-identical.

**What the leaf asserts**, on P15B's closure route ticked 520 weeks past the freeze:
1. Premise: at least one `→ closed` event dated before 6240 and one dated at or after it. Without both, fail by name.
2. For each studio closed before 6240: no condition event for that studio after its closure week.
3. The root `campaignLegacy` is byte-identical (`stableStringify`) at every week from 6240 to the end, so the later closure changes nothing in the official manifest.
4. `makeSave` validates the final state, so the replay cuts the post-2040 closure.

**r1 code** (1359-p15c-wave2-red.patch, leaf `legacy-endless-no-revival`), to adapt to P15B's route and landed shapes:

```ts
const condition = rawOf(s6760).corporateCondition as { events: { studioId: string; week: number; to: string }[] }
const closures = condition.events.filter((event) => event.to === 'closed')
const before = closures.filter((event) => event.week < B)
const after = closures.filter((event) => event.week >= B)
if (before.length === 0 || after.length === 0) throw new Error('premise: a closure before B and one after B')
for (const closure of before) {
  expect(condition.events.filter((event) => event.studioId === closure.studioId && event.week > closure.week)).toEqual([])
}
expect(firstRootChange).toBeNull() // the week campaignLegacy first changed after the freeze
```

The P15C helpers it can reuse: `tests/helpers/p15c2-legacy.ts` (`legacyOf`, `rawOf`, `budgeted`, `B`) and `tests/helpers/p15-roots.ts`.
