// P14C.1 — MATERIALIZED AGING. Age is DERIVED FROM PROVENANCE AND MATERIALIZED,
// never incremented independently. There is no `age++` in this module or anywhere
// else: the stored `Talent.age` is a cache of a computation over provenance and
// `market.tick`, and the save validator is what keeps that cache honest.
//
// The whole law is one formula (record 762 §1):
//
//     age(w) = floor(anchorAge + (w - anchorWeek) / 52)
//
// No stored birth week exists to disagree with it. A person aged 29.75 at their
// anchor week turns 30 thirteen weeks later, because the fraction measures progress
// SINCE the previous birthday and the time remaining is (1 - frac) * 52.
//
// NOTHING HERE DRAWS FROM THE RNG. `src/core/tick.ts:227` deserializes one shared
// stream and re-serializes it, so a single draw taken here would move every
// downstream draw in the world. Every quantity below is a pure function of the
// provenance row and a week.
import type { GameState, TalentProvenanceRoot, TalentProvenanceRow } from './types.js'

export type { TalentProvenanceRoot, TalentProvenanceRow } from './types.js'

/** The anchor pair, read through ONE accessor so the two kinds derive identically.
 * Every other quantity in this module goes through it; nothing reads
 * `ageAtMigration` or `ageAtEntry` directly. */
export function anchorOf(row: TalentProvenanceRow): { age: number; week: number } {
  return row.kind === 'legacy_age_anchor'
    ? { age: row.ageAtMigration, week: row.migrationWeek }
    : { age: row.ageAtEntry, week: row.entryWeek }
}

/** `floor(anchorAge + (week - anchorWeek) / 52)`, and nothing else (record 762 §1). */
export function ageAt(row: TalentProvenanceRow, week: number): number {
  const anchor = anchorOf(row)
  return Math.floor(anchor.age + (week - anchor.week) / 52)
}

/**
 * The smallest `w` with `ageAt(row, w) > storedAge`.
 *
 * SEEDED by `anchorWeek + ceil((storedAge + 1 - anchorAge) * 52)` and then CORRECTED
 * against `ageAt` itself, stepping by at most one in each direction until
 * `ageAt(row, w - 1) === storedAge` and `ageAt(row, w) === storedAge + 1`. The
 * correction is not decoration: `(30 - 29.75) * 52` is representable, but a
 * neighbouring anchor whose product evaluates to `13.000000000000002` ceils to 14 and
 * leaves a stored age stale for a whole week, with every reader — including
 * `isProven` (`talentMarket.ts:690`) — reading the stale value.
 *
 * `ageAt` is monotone nondecreasing in `w`, so the corrected `w` is unique and is the
 * true crossing however the seed got there. SUCCESSIVE birthdays are recomputed from
 * the anchor by calling this again with the new stored age, NEVER by adding 52.
 */
export function nextBirthdayWeek(row: TalentProvenanceRow, storedAge: number): number {
  const anchor = anchorOf(row)
  let week = anchor.week + Math.ceil((storedAge + 1 - anchor.age) * 52)
  while (ageAt(row, week) <= storedAge) week++
  while (ageAt(row, week - 1) > storedAge) week--
  return week
}

/** Record 762 §12 F1: FOUR arguments. The caller supplies the kind because it knows
 * it and this function cannot infer it — `convertV32ToV33` writes `legacy_age_anchor`,
 * every append site writes `authored_exact_week`. §3's three-argument declaration is
 * struck. */
export function provenanceRowFor(
  personId: string, age: number, week: number, kind: TalentProvenanceRow['kind'],
): TalentProvenanceRow {
  return kind === 'legacy_age_anchor'
    ? { personId, kind, ageAtMigration: age, migrationWeek: week }
    : { personId, kind, ageAtEntry: age, entryWeek: week }
}

/**
 * The ONE canonical insertion into `due`, shared by every writer that adds a single
 * person to an existing list. Buckets stay ASCENDING by week, and inside a bucket
 * people stay in `rows` order — which is exactly what `recomputeDue` below produces
 * and exactly what validator condition 3 compares against. Two writers, one ordering.
 *
 * `comesAfter(existingId)` answers whether the person being inserted sits LATER in
 * `rows` than that existing member. The inserted person lands before the first member
 * for which the answer is no, so a bucket that was in `rows` order stays in `rows`
 * order — and the result does not depend on the order several insertions are made in.
 */
function insertDue(
  due: readonly { week: number; personIds: readonly string[] }[],
  week: number,
  personId: string,
  comesAfter: (existingId: string) => boolean,
): { week: number; personIds: readonly string[] }[] {
  const next: { week: number; personIds: readonly string[] }[] = []
  let placed = false
  for (const bucket of due) {
    if (!placed && bucket.week === week) {
      const at = bucket.personIds.findIndex((id) => !comesAfter(id))
      next.push({
        week,
        personIds: at === -1
          ? [...bucket.personIds, personId]
          : [...bucket.personIds.slice(0, at), personId, ...bucket.personIds.slice(at)],
      })
      placed = true
      continue
    }
    if (!placed && bucket.week > week) {
      next.push({ week, personIds: [personId] })
      placed = true
    }
    next.push(bucket)
  }
  if (!placed) next.push({ week, personIds: [personId] })
  return next
}

/**
 * The ONE canonical derivation of the `due` visit list from `rows` and the STORED
 * ages. Every writer in the codebase builds `due` through this, and the V33 validator
 * recomputes it through the same function and refuses a mismatch — so the cache can
 * never disagree with the law it caches (record 762 §2).
 *
 * Buckets ascend by week; inside a bucket, people keep their `rows` order. A person
 * with no stored age is skipped rather than guessed at: that is a broken world and
 * validator condition 1 is what reports it.
 */
export function recomputeDue(
  rows: readonly TalentProvenanceRow[], storedAgeOf: (personId: string) => number | undefined,
): TalentProvenanceRoot['due'] {
  const byWeek = new Map<number, string[]>()
  for (const row of rows) {
    const storedAge = storedAgeOf(row.personId)
    if (storedAge === undefined) continue
    const week = nextBirthdayWeek(row, storedAge)
    const bucket = byWeek.get(week)
    if (bucket === undefined) byWeek.set(week, [row.personId])
    else bucket.push(row.personId)
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, personIds]) => ({ week, personIds }))
}

/** One row per person, anchored on the age each person carries NOW, plus the derived
 * visit list. The stored age a `due` bucket is computed against is `floor(anchorAge)`,
 * which is exactly what the migration then writes onto `talent[i].age`. */
export function buildTalentProvenance(
  people: readonly { id: string; age: number }[], week: number, kind: TalentProvenanceRow['kind'],
): TalentProvenanceRoot {
  const rows = people.map((person) => provenanceRowFor(person.id, person.age, week, kind))
  const floored = new Map(people.map((person) => [person.id, Math.floor(person.age)]))
  return { boundaryWeek: week, rows, due: recomputeDue(rows, (id) => floored.get(id)) }
}

/**
 * Visits only the people `due` at or before `week`, writes `ageAt(row, week)` onto
 * each, and rebuilds the visit list. CONSUMES NO RNG and takes no RNG argument.
 * Idempotent: `nextBirthdayWeek` of a freshly written age is strictly later than
 * `week`, so a second call finds nothing due and returns an equal state.
 *
 * It takes the week EXPLICITLY rather than reading `state.market.tick`, because the
 * one call site is the tick TAIL beside the clock advance (`src/core/tick.ts:1047-1049`)
 * and at that point the clock has not moved yet. `src/core/tick.ts:408-410` states the
 * rule in its own comment: the clock is the tick's to advance, as its last step.
 *
 * The invariant this produces, and the one validator condition 2 checks:
 * on every state the engine emits, `talent[i].age === ageAt(row_i, state.market.tick)`.
 *
 * It does NOT self-heal a stored age that is not due. A person whose cached age
 * disagrees with their provenance while carrying a future due week is a real defect,
 * and the validator reports it rather than this quietly papering over it.
 */
export function materializeAges(state: GameState, week: number): GameState {
  const root = state.talentProvenance
  // NOTHING DUE, NOTHING CHANGES. This is a correctness statement before it is
  // anything else: no age moves, and `due` is derived from `rows` and the stored ages,
  // neither of which moved either. Contract §4's visit list is an in-state bucket, not
  // a scan, and the endurance horizon is why — a weekly whole-population reschedule
  // would make `nextBirthdayWeek` run for every person on every tick forever.
  if (!root.due.some((bucket) => bucket.week <= week)) return state

  // The birthday path. `rank` is the one index this needs: `due` names people, the
  // materialization needs their rows, and the insertion below needs their `rows`
  // position to reproduce `recomputeDue`'s order.
  const rank = new Map(root.rows.map((row, index) => [row.personId, index]))
  const arrived = new Set<string>()
  const remaining: { week: number; personIds: readonly string[] }[] = []
  for (const bucket of root.due) {
    if (bucket.week > week) { remaining.push(bucket); continue }
    for (const personId of bucket.personIds) arrived.add(personId)
  }

  // One pass over `talent` — inherent, since a new array is returned either way —
  // writes the new ages and collects exactly who must be rescheduled. A person named
  // by `due` who has no row, or who is not in `talent` at all, is NOT re-inserted:
  // `recomputeDue` would not have listed them either, so the two agree on that too.
  const rescheduled: { personId: string; week: number }[] = []
  const talent = state.talent.map((person) => {
    if (!arrived.has(person.id)) return person
    const index = rank.get(person.id)
    const row = index === undefined ? undefined : root.rows[index]
    if (row === undefined) return person
    const age = ageAt(row, week)
    rescheduled.push({ personId: person.id, week: nextBirthdayWeek(row, age) })
    return age === person.age ? person : { ...person, age }
  })

  // Only the people who materialized move. Every other bucket entry is carried by
  // reference, untouched.
  let due: readonly { week: number; personIds: readonly string[] }[] = remaining
  for (const entry of rescheduled) {
    const mine = rank.get(entry.personId) ?? root.rows.length
    due = insertDue(due, entry.week, entry.personId, (id) => (rank.get(id) ?? root.rows.length) < mine)
  }
  return { ...state, talent, talentProvenance: { ...root, due } }
}

/**
 * What the five append sites (record 762 §4) call, AT THE APPEND and never at the mint
 * call: `hollywoodTick.ts:136-142` mints at `:138`, checks affordability at `:141` and
 * `continue`s, so provenance written inside a shared mint primitive would record one
 * dead row per unaffordable rival hire per week, forever, in a save validated on every
 * load (759-C amendment 3).
 *
 * `person.age` here is the EXACT entry age — after `enterRival`'s `Math.max(28, …)`
 * raise, never as drawn — and the row stores that fraction UNROUNDED. Preserving it is
 * the point of the anchor: it is what spreads birthdays across the year and what makes a
 * downgrade able to recover an original value. THIS FUNCTION DOES NOT FLOOR, and does
 * not touch `state.talent`.
 *
 * The COMMITTED person carries `floor(that age)`, and each append site applies that floor
 * where the person is CONSTRUCTED FOR COMMIT — before `offerForTalent` prices it — so the
 * contract, the provenance row and `state.talent` all agree about which value is stored.
 * The floor cannot be deferred to the tick tail: the scheduled-entry loop at
 * `tick.ts:1087-1091` runs AFTER the materialization at `tick.ts:1049`, so a person who
 * entered carrying a fractional stored age would break validator condition 2 on the state
 * that advance emits.
 */
export function withTalentProvenance(
  state: GameState, person: { id: string; age: number },
): GameState {
  const root = state.talentProvenance
  // NOT in record 763's inventory, and found by tracing the caller rather than by
  // grepping: `convertV18ToV19` (`save.ts:7783`) hands `initializeHollywood` a genuine
  // GameStateV18 — a state that legitimately has NO provenance root, because V19 never
  // had one — and that initializer calls `enterRival` for every due migration entry.
  // The rule is the one the physical-plan root already states at `hollywood.ts:175-177`:
  // a root TRAVELS WITH THE STATE and is never minted inside a frozen conversion, whose
  // output must carry no root its own version never had. Nobody is lost by skipping:
  // `convertV32ToV33` builds one row per person in `state.talent` when the chain finally
  // reaches the live boundary, and until then no V33 validator ever reads this state.
  if (root === undefined || root === null) return state
  // A caller that has no clock (only the root) anchors at the root's own boundary;
  // every real append site carries `market`.
  const week = state.market?.tick ?? root.boundaryWeek
  const row = provenanceRowFor(person.id, person.age, week, 'authored_exact_week')
  // The visit list is keyed on the STORED age, which is the anchor's floor.
  const dueWeek = nextBirthdayWeek(row, Math.floor(person.age))
  // Through the SAME insertion every other writer uses. The appended row is last in
  // `rows`, so this person comes after every existing member unconditionally — which
  // is why `comesAfter` is `true` here rather than a rank comparison.
  const due = insertDue(root.due, dueWeek, person.id, () => true)
  return { ...state, talentProvenance: { ...root, rows: [...root.rows, row], due } }
}

/**
 * P14C.2a (record 777 §2): every id in a `due` bucket whose week is `<= week`, in
 * bucket order and then in-bucket order — the people whose age materializes this
 * advance. Pure; it reads the root and never rebuilds it. The tick calls it BEFORE
 * `materializeAges`, which consumes those buckets. SCAFFOLD until the writer lands it.
 */
export function birthdaysDueAt(_root: TalentProvenanceRoot, _week: number): string[] {
  throw new Error('aging.birthdaysDueAt: not implemented (P14C.2a scaffold, record 777)')
}
