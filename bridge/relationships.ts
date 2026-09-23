// P14B.6 — the RELATIONSHIP READ MODELS. A pure projector on the `bridge/trust.ts`
// pattern: it adds NO engine law (no driver kind, constant, policy, refusal, save state
// or RNG) and computes NO quality modifier. Every value here is DERIVED at projection
// time from facts the engine already owns — `pairChemistry`, `state.relationships`,
// `state.hollywood.employment`, `state.firstTakes` and `state.studio.releasedFilms`.
//
// Authority: Owner ruling 4 of record 683 (the slice), rulings 3 (ii) and 3 (iii) (the
// counts and the warning), scope record 687, parent brief 699-W decisions D1-D4.
//
// THE THREE LAWS THAT DECIDE WHETHER THIS IS CORRECT
//
//  1. DISCLOSURE. A tie is published only when its COUNTERPART is independently visible
//     to the player — on the player's roster at W under the landed employer-interval
//     predicate. Records 679/682 measured that nearly every edge on a standard seed is
//     RIVAL-INTERNAL, so a block that simply listed a person's edges would publish the
//     whole rival industry graph. The undisclosed remainder is not silently dropped: the
//     block's `line` says so, carrying NO count and NO identity (the `presence.withheld`
//     precedent, `people.ts` :351-356).
//  2. NO DELTA MAGNITUDE, EVER (694-C Q2). A resumed campaign can hold both a `-4` and a
//     `-5` `sharedFailure` row on ONE edge, so rendering a magnitude would show two
//     numbers for one event class. Driver copy comes from `pairChemistry(...).reasons`,
//     which carries no digit, and nothing here restates a stored delta.
//  3. COUNTS ARE FACTS, NOT FRIENDSHIP (ruling 3 (ii)). `sharedPictures` is derived from
//     `firstTakes` and released credits, is published for a pair with NO edge exactly as
//     readily as for a pair with one, and never implies a tier. A campaign that predates
//     the V31 root therefore shows counts and no tiers — nothing is backfilled.
import { pairChemistry, type PairChemistry } from '../src/core/relationships.ts'
import type { GameState } from '../src/core/types.ts'
import type {
  BridgeCastingChemistryRow, BridgeRelationshipBlock, BridgeRelationshipRow,
} from './schema/bridge-schema.ts'

/** The four seats a casting draft proposes (the `seatPairs` seats of a first take). */
export type ChemistrySeats = { directorId: string; lead: string; antagonist: string; support: string }
type Seat = BridgeCastingChemistryRow['seatA']

/** The six pairs in `seatPairs`' OWN SEAT ORDER (`src/core/relationships.ts` :209-222),
 *  restated for a PROPOSED seating: that module's own helper is private and refuses a
 *  person seated twice, which a read model must never do. */
const SEAT_PAIRS: readonly (readonly [Seat, Seat])[] = [
  ['director', 'lead'], ['director', 'antagonist'], ['director', 'support'],
  ['lead', 'antagonist'], ['lead', 'support'], ['antagonist', 'support'],
]
const seatTalent = (seats: ChemistrySeats, seat: Seat): string =>
  seat === 'director' ? seats.directorId : seats[seat]

/** The published copy. No digit, no identity, no tier name in any of it. */
const ROSTER_LINE = 'Working ties with people on your roster.'
const WITHHELD_LINE = 'Other working ties here are with people you do not employ.'
/** E714: scoped to the viewer's OWN pictures. The former 'No shared work recorded yet.'
 *  denied shared work ANYWHERE, which this projector cannot know and which is false when
 *  the only shared work is rival-internal (record 710). This sentence claims only what the
 *  block may speak to. */
const QUIET_LINE = 'No shared work on your pictures yet.'
/** E714: zero edges, no disclosable counterpart, and work the viewer COMMISSIONED. The
 *  branch's own guarantee makes the second sentence strictly true: an edge with an
 *  on-roster counterpart would have produced a row, and one with an off-roster counterpart
 *  would have set `withheld`. The work is stated, then the record denied, in that order —
 *  no sentence here may imply friendship. */
const SHARED_NO_TIE_LINE = 'Shared credits on your pictures. No working relationship on record.'
/** D2: the honest answer when the roster cannot be read AT ALL. `state.hollywood` is
 *  genuinely nullable (`src/core/types.ts` :1906), and on a world without that root
 *  `WITHHELD_LINE` would assert a POSITIVE employment fact this projector cannot
 *  compute — the player may employ that very counterpart through `state.contracts`.
 *  Absence of the ROOT, never an empty roster: when the root is present and the
 *  viewer's employment list is simply empty, `WITHHELD_LINE` is true and stays. */
const NO_ROSTER_ROOT_LINE = 'No studio roster on record, so working ties are not shown.'
const NO_SHARED_WORK_LINE = 'No shared work yet.'
/** E714, the sibling site: the pair shares a picture and holds no edge, so the no-edge
 *  sentence above would overclaim. A seating the player PROPOSES is self-disclosing, which
 *  is why this one needs no roster filter (record 710).
 *  IT MUST NOT OPEN WITH `CHEMISTRY_LINE[0]`'s SENTENCE. Both rows can sit in ONE six-row
 *  readout, and a line prefixed by the NEUTRAL-TIER sentence differs from it only in a
 *  trailing clause: truncate that clause and "no record at all" renders as "a recorded,
 *  neutral tie" — a false-neutral planted in place of the false-empty this slice removes.
 *  Keep the opening clause distinct from every `CHEMISTRY_LINE` value. */
const SHARED_NO_RECORD_LINE = 'They share a credit. Nothing is recorded about how it went.'
const CHEMISTRY_LINE: Readonly<Record<-1 | 0 | 1, string>> = {
  [-1]: 'They have not worked well together.',
  [0]: 'They have worked together before.',
  [1]: 'They have worked well together.',
}
/** Ruling 3 (iii): ONE sentence. It never refuses, never blocks, and never changes a
 *  quote, a cost or a forecast. */
export const CASTING_CHEMISTRY_WARNING = 'One pair in this seating has a history of not working well together.'

/** `pairChemistry`'s own no-edge answer, restated for the ONE state it must not be
 *  called on: a state with no V31 root (D4). `pairChemistry` calls
 *  `requireRelationshipsRoot`, which THROWS by design, and weakening that guard or
 *  catching its throw would put a silent fallback under every existing consumer of
 *  these projections. Instead this projector never reaches it without a root, and emits
 *  ruling 3 (ii)'s specified pre-feature display: counts, and no tiers. */
const NO_ROOT: PairChemistry = { tier: null, sign: 0, reasons: [] }
const chemistryOf = (state: GameState, x: string, y: string, week: number): PairChemistry =>
  state.relationships === undefined ? NO_ROOT : pairChemistry(state, x, y, week)

/**
 * The ISSUER'S ROSTER AT W, STRICT at W on both ends — the SAME predicate
 * `talentMarket.ts` :794-801 applies for D5, restated (not re-decided) here because that
 * module's `rosterAt` is private and `src/core/` is outside this slice's write scope.
 * Any change to the predicate there must be mirrored here.
 */
function rosterAt(state: GameState, studioId: string, subjectId: string, week: number): ReadonlySet<string> {
  const roster = new Set<string>()
  for (const row of state.hollywood?.employment ?? []) {
    if (row.studioId !== studioId || row.terms.talentId === subjectId) continue
    if (row.terms.startWeek < week && (row.endedWeek === null || week < row.endedWeek)) roster.add(row.terms.talentId)
  }
  return roster
}

/**
 * "Worked together on N pictures" — the engine's own credits, counted by PICTURE so a
 * take and its later release are one shared picture, not two. Recorded first takes carry
 * the four seated roles; released films carry the captured participants (writer, director,
 * the three cast roles and craft). A pair with no edge has this count exactly as readily
 * as a pair with one; it never implies a tier.
 */
export function sharedPictureCount(state: GameState, a: string, b: string): number {
  const pictures = new Set<string>()
  for (const take of state.firstTakes) {
    const seats = [take.directorId, take.cast.lead, take.cast.antagonist, take.cast.support]
    if (seats.includes(a) && seats.includes(b)) pictures.add(take.productionId)
  }
  for (const film of state.studio.releasedFilms) {
    const participants = film.participants
    if (participants === undefined) continue
    const seats = [
      participants.writer.talentId, participants.director.talentId,
      participants.cast.lead.talentId, participants.cast.antagonist.talentId, participants.cast.support.talentId,
      ...participants.craft.map((craft) => craft.talentId),
    ]
    if (seats.includes(a) && seats.includes(b)) pictures.add(film.productionId)
  }
  return pictures.size
}

/**
 * "Does this person appear with any OTHER person on a picture THIS VIEWER COMMISSIONED" —
 * the only shared-work basis `relationshipBlockFor` may speak to (record 710). It is NOT
 * `sharedPictureCount` with a filter bolted on: that count is a pair fact published under
 * ruling 3 (ii) and is left exactly as it is. `state.firstTakes` holds RIVAL receipts by
 * design (`FirstTakeReceipt.studioId`, `src/core/types.ts` :2131-2142), and reporting their
 * EXISTENCE from a browsed profile is the leak the disclosure law forbids, so takes are
 * filtered to the viewer's own studio; `state.studio.releasedFilms` is the player's own
 * studio's history (`types.ts` :524) and needs no filter. A DISTINCT other id is required:
 * a subject credited twice on one picture has worked with nobody.
 * WITH NO `state.hollywood` THE TWO LEGS ANSWER DIFFERENTLY, and only the first fails closed.
 * `viewerStudioId` then arrives as `''` (`bridge/people.ts` :489), which no receipt's
 * `studioId` equals, so the TAKES leg matches nothing. The RELEASES leg still answers, by
 * design: `state.studio.releasedFilms` is the player's own studio's history whether or not a
 * Hollywood root exists, so a rootless world holding released films returns true here. The
 * consequence is that such a block emits `SHARED_NO_TIE_LINE` rather than D2's
 * `NO_ROSTER_ROOT_LINE`, which is lawful precisely because that sentence asserts NO
 * employment fact — it speaks only to credits on pictures the player commissioned.
 */
function sharesViewerPicture(state: GameState, talentId: string, viewerStudioId: string): boolean {
  const withAnother = (seats: readonly string[]): boolean =>
    seats.includes(talentId) && seats.some((id) => id !== talentId)
  for (const take of state.firstTakes) {
    if (take.studioId !== viewerStudioId) continue
    if (withAnother([take.directorId, take.cast.lead, take.cast.antagonist, take.cast.support])) return true
  }
  for (const film of state.studio.releasedFilms) {
    const participants = film.participants
    if (participants === undefined) continue
    if (withAnother([
      participants.writer.talentId, participants.director.talentId,
      participants.cast.lead.talentId, participants.cast.antagonist.talentId, participants.cast.support.talentId,
      ...participants.craft.map((craft) => craft.talentId),
    ])) return true
  }
  return false
}

/**
 * One person's published ties, for the viewer's own studio. Rows are the DISCLOSED
 * counterparts — on the viewer's roster at `week`, the subject excluded — that this
 * person either holds an edge with or shares a credit with; sorted by counterpart id so
 * the block never depends on root or Map order. Present on every profile, empty rows and
 * all.
 */
export function relationshipBlockFor(
  state: GameState,
  talentId: string,
  viewerStudioId: string,
  week: number = state.market.tick,
): BridgeRelationshipBlock {
  const edges = state.relationships ?? []
  const disclosed = rosterAt(state, viewerStudioId, talentId, week)
  const tied = new Set<string>()
  let withheld = false
  for (const edge of edges) {
    const counterpart = edge.a === talentId ? edge.b : edge.b === talentId ? edge.a : null
    if (counterpart === null) continue
    if (disclosed.has(counterpart)) tied.add(counterpart)
    else withheld = true
  }
  const names = new Map(state.talent.map((person) => [person.id, person.name] as const))
  const rows: BridgeRelationshipRow[] = []
  for (const counterpartId of [...disclosed].sort()) {
    const sharedPictures = sharedPictureCount(state, talentId, counterpartId)
    if (!tied.has(counterpartId) && sharedPictures === 0) continue
    const chemistry = chemistryOf(state, talentId, counterpartId, week)
    rows.push({
      counterpartId,
      counterpartName: names.get(counterpartId) ?? counterpartId,
      tierLabel: chemistry.tier,
      sign: chemistry.sign,
      drivers: [...chemistry.reasons],
      sharedPictures,
    })
  }
  // The withheld sentence speaks to EMPLOYMENT, so it may only be emitted when the
  // employment root is readable; without it `rosterAt` returns empty for a reason it
  // cannot report, and `rows` is necessarily empty too.
  const withheldLine = (state.hollywood ?? null) === null ? NO_ROSTER_ROOT_LINE : WITHHELD_LINE
  const line = rows.length > 0
    ? (withheld ? `${ROSTER_LINE} ${WITHHELD_LINE}` : ROSTER_LINE)
    : withheld ? withheldLine
      : sharesViewerPicture(state, talentId, viewerStudioId) ? SHARED_NO_TIE_LINE
        : QUIET_LINE
  return { line, rows }
}

/**
 * The pairwise readout among the four seats of a PROPOSED seating, in seat order. A pair
 * with no edge reads as no-shared-work, never as a neutral score. No number, no modifier
 * and no forecast delta: ruling 4 keeps the production-quality modifier with the
 * production-result owner, and a readout is not evidence any result law consumes it.
 */
export function castingChemistryRows(
  state: GameState,
  seats: ChemistrySeats,
  week: number = state.market.tick,
): readonly BridgeCastingChemistryRow[] {
  return SEAT_PAIRS.map(([seatA, seatB]) => {
    const talentIdA = seatTalent(seats, seatA)
    const talentIdB = seatTalent(seats, seatB)
    const chemistry = chemistryOf(state, talentIdA, talentIdB, week)
    return {
      seatA, seatB, talentIdA, talentIdB,
      tierLabel: chemistry.tier,
      sign: chemistry.sign,
      drivers: [...chemistry.reasons],
      line: chemistry.tier !== null
        ? CHEMISTRY_LINE[chemistry.sign]
        : sharedPictureCount(state, talentIdA, talentIdB) > 0 ? SHARED_NO_RECORD_LINE : NO_SHARED_WORK_LINE,
    }
  })
}

/** Ruling 3 (iii): one sentence when a proposed seating holds a pair reading −1, and
 *  nothing at all otherwise. A WARNING, never a refusal. */
export function castingChemistryWarning(
  state: GameState,
  seats: ChemistrySeats,
  week: number = state.market.tick,
): string | null {
  return castingChemistryRows(state, seats, week).some((row) => row.sign === -1)
    ? CASTING_CHEMISTRY_WARNING
    : null
}
