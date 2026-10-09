import { createHash } from 'node:crypto'

export const SOURCE = '3aaf55e0c06c4b745b0b722cc56913050b1ee229'
export const SEED = 'p13a-core-causal-01'
export const WEEKS = 416
export const SUBJECT = 'person-studio-aca408ec-r01-0'
export const EXPECTED = Object.freeze({
  employment: '4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58',
  settlement: '706e54c6ec9728df1664025982ebbafeb0fc36afb245b6bd0b983305f6a10a77',
  receipts: 'af8c4d1325ecb350dbc07fbf2f762dd8257db04075b8030bf7bd975b4cb2a766',
  takes: '8af116b1687ed210c02953b5b506456e638a64482e8042b0e549b0d57e428694',
  rng: '2598418427,508725886,1318803286,3129010527',
})
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const requireValue = (ok, why) => { if (!ok) throw new Error(`STOP_${why}`) }
const serialize = value => Buffer.from(JSON.stringify(value), 'utf8')
const settlementRows = state => state.talentMarket.receipts
  .filter(r => r.kind === 'settled' || r.kind === 'declined' || r.kind === 'expired')

/** Observes existing state and takes exactly 416 normal ticks. No quote or predicate calls. */
export function observeLedger(factory, tick, expected = EXPECTED, clock = Date.now) {
  const started = clock()
  let state = factory(SEED)
  requireValue(state?.market?.tick === 0, 'WEEK0')
  const firstRows = state.hollywood?.employment?.filter(row => row.terms.talentId === SUBJECT)
  requireValue(firstRows?.length === 1, 'FIRST_ROW_IDENTITY')
  const firstIndex = state.hollywood.employment.indexOf(firstRows[0])
  requireValue(firstIndex === 0, 'FIRST_ROW_ORDER')
  const first = firstRows[0]
  const person = state.talent.filter(row => row.id === SUBJECT)
  const provenance = state.talentProvenance?.rows?.filter(row => row.personId === SUBJECT)
  requireValue(person.length === 1 && provenance?.length === 1, 'FIRST_PERSON_IDENTITY')
  requireValue(provenance[0].kind === 'authored_exact_week' && provenance[0].entryWeek === 0 &&
    provenance[0].ageAtEntry === 44.36540781416331, 'FIRST_ANCHOR')
  requireValue(person[0].age === 44 && first.terms.annualSalary === 395548 &&
    first.terms.signingBonus === 71199 && first.terms.startWeek === 0, 'FIRST_QUOTE')
  const firstQuote = JSON.parse(JSON.stringify({ index: firstIndex, row: first,
    committedAge: person[0].age, provenance: provenance[0], rngState: state.rngState }))
  for (let step = 1; step <= WEEKS; step++) {
    requireValue(clock() - started < 720_000, 'INNER_DEADLINE')
    state = tick(state)
    requireValue(clock() - started < 720_000, 'INNER_DEADLINE')
    requireValue(state?.market?.tick === step, 'TICK_HORIZON')
  }
  requireValue(state.hollywood?.employment?.length === 44, 'ROW_COUNT')
  const employmentBytes = serialize(state.hollywood.employment)
  requireValue(employmentBytes.length > 0 && employmentBytes.length <= 256 * 1024, 'OUTPUT_BOUNDS')
  const digests = {
    employment: digest(employmentBytes),
    settlement: digest(serialize(settlementRows(state).map(r =>
      [r.eventId, r.kind, r.week, r.talentId, r.studioId, r.reasons, r.dropped]))),
    receipts: digest(serialize(state.talentMarket.receipts)),
    takes: digest(serialize(state.firstTakes)),
    rng: state.rngState,
  }
  for (const key of Object.keys(EXPECTED)) requireValue(digests[key] === expected[key], `CONTROL_${key.toUpperCase()}`)
  requireValue(JSON.stringify(JSON.parse(employmentBytes.toString('utf8'))) === employmentBytes.toString('utf8'), 'ROUNDTRIP')
  return { employmentBytes, firstQuote, digests, rows: 44, week: WEEKS }
}
