// P16 rebase, audit finding C-01 (P16-01; the absorbed twin of the landed L-05).
//
// An absorption that writes a production off releases its people at the absorption week: the busy
// set skips the terminal target (`terminalWeekOf`) and seats only the buyer-continued work, and the
// exited people join the hiring market. The candidate's validator still claimed every production
// of the absorbed target except buyer cancellations, so a released participant seated anywhere
// else made every later save fail with "simultaneous active assignments" (PREDICTED by reading: no
// red run at the candidate's rule exists yet; the lane's red run turns this into an observation).
// The rebased validator claims only the buyer-continued, uncancelled productions of an absorbed
// business; its written-off work and every draft claim nobody, and the profession-history straddle
// check, the promise and opportunity occupancy readers follow the same rule. The validator rule
// landed with the apply (b2d3d97e); the reader rule landed in 0863f80b. The two differential cases below
// are its witnesses: the directing draft is red at b2d3d97e (lane wave3d, c01-red.json), the genre-opportunity
// draft is PREDICTED red there (round 5 split it out of the shared loop, which stopped at the first draft).
//
// Route: the candidate's own write-off transaction (tests/p16-absorption-paid-production.test.ts):
// the genuine Original48 r04-pre162 capture, migrated to Save49, a paid full disclosure, the public
// ask, explicit retention of nobody, so film 13 is written off and its six people exit at 162. Then
// the L-05 route: the player signs the written-off picture's lead from the hiring market, staffs one
// picture around them, greenlights it, and plays a 52-week natural soak with a save every week.
// The capture lives outside the repository (audit C-06): P16_ORIGINAL48_CAPTURE_ROOT, fail loud.
// STATIC-UNRUN when written (the rebase lane runs it). No natural witness covers the profession-history
// straddle rule yet (it needs an exited actor's recorded profession change after the write-off).
import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import { applyActions } from '../src/core/actions.js'
import { assignmentRefusal } from '../src/core/careerLifecycle.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { busyTalentIds, hiringMarketIds, terminationCost } from '../src/core/employment.js'
import { MARKETING_BUDGET_LEVELS } from '../src/core/grid.js'
import { studioEmployerId } from '../src/core/hollywood.js'
import { terminalWeekOf } from '../src/core/operatingState.js'
import { productionCompanyTalentIds } from '../src/core/productionPeople.js'
import { promiseFeasibility, type PromiseDraft } from '../src/core/promises.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { resolveShape } from '../src/core/shape.js'
import { tick } from '../src/core/tick.js'
import { GENRE_ORDER } from '../src/core/tuning.js'
import type { Action, FilmShape, GameState, Production } from '../src/core/types.js'
import { signRole } from './helpers/stabilization-staffing.js'
import { validateTechnology } from '../src/core/technology.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { AbsorptionRecord } from '../src/core/rights.js'

const TARGET = 'studio-aca408ec-r01', FILM = TARGET + ':film:13', WEEK = 162, SOAK_WEEKS = 52
const PIN = 'cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'
const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }

/** The candidate's write-off transaction at 162, exactly as tests/p16-absorption-paid-production.test.ts closes it. */
function absorbedWorld(): GameState {
  const root = process.env.P16_ORIGINAL48_CAPTURE_ROOT
  if (!root) throw new Error('P16_ORIGINAL48_CAPTURE_ROOT is not set: the r04-pre162 capture lives outside the repository (audit C-06)')
  const bytes = readFileSync(root + '/r04-pre162.save48.json')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
  const initial = saves.convertV48ToV49(saves.validateSaveP15B(JSON.parse(bytes.toString()))).state
  expect(initial.market.tick).toBe(WEEK)
  const player = initial.hollywood!.playerStudioId
  const source = initial.hollywood!.businesses.find((b) => b.studioId === TARGET)!
  expect(source.productions.map((p) => p.id)).toEqual([FILM])
  const original = initial.hollywood!.activeEmploymentOrdinals.map((i) => initial.hollywood!.employment[i]!)
    .filter((e) => e.studioId === TARGET && e.endedWeek === null && e.terms.startWeek <= WEEK && WEEK < e.terms.endWeekExclusive)
  const retention = { kind: 'explicit' as const, contractIds: [] as string[] }
  const diligence = requestDiligence(initial, { recipientId: player, target: { kind: 'studio', studioId: TARGET }, scope: ['rights', 'employment', 'liabilities'] }, WEEK)
  const postExitCash = source.account.cash - original.reduce((sum, e) => sum + terminationCost(e.terms, WEEK), 0)
  const library = libraryValuationV1(diligence.state, TARGET, WEEK)
  if (library.kind !== 'available') throw new Error('premise: the r01 library valuation is available at 162')
  const consideration = Math.ceil(acquisition.absorptionAsk(library.total, postExitCash))
  const preview = { buyerId: player, targetId: TARGET, consideration, retention, disclosureId: diligence.record.id }
  const quote = acquisition.quoteAbsorption(diligence.state, preview, WEEK)
  if (quote.kind !== 'quote') throw new Error(`premise: the write-off quote is offered (${quote.refusal})`)
  expect(quote.productions).toMatchObject([{ productionId: FILM, disposition: 'cancelRequired' }])
  return acquisition.closeAbsorption(diligence.state, { ...preview, quotedAtWeek: quote.quotedAtWeek, quoteAgePolicyVersion: quote.quoteAgePolicyVersion }, WEEK)
}

describe('C-01: an absorbed business\'s written-off work claims nobody at validation', () => {
  // The route runs once; each test below is assertions only.
  let absorbed: GameState, frozen: Production, released: string, seated: GameState
  const soak: { week: number; refusal: string | null }[] = []
  beforeAll(() => {
    absorbed = absorbedWorld()
    const record = absorbed.rights.absorptions.find((a) => a.targetId === TARGET)!
    expect(record.stoppedProductions.map((row) => row.productionId)).toEqual([FILM])
    expect(record.continuedProductions).toEqual([])
    frozen = absorbed.hollywood!.businesses.find((b) => b.studioId === TARGET)!.productions[0]!
    expect(frozen.id).toBe(FILM)
    const found = [frozen.cast.lead, frozen.cast.antagonist, frozen.cast.support].find((id) =>
      hiringMarketIds(absorbed).includes(id) && assignmentRefusal(absorbed, id, absorbed.market.tick, 'actor') === null)
    if (found === undefined) throw new Error('premise: a released actor of the written-off picture is in the hiring market')
    released = found
    expect(absorbed.scriptDevelopment.mode, 'route premise: the capture greenlights through the open pool').toBe('legacy')
    const used = new Set<string>([released])
    let staffed = applyActions(absorbed, [{ kind: 'signContract', talentId: released, termWeeks: 52 }])
    const writer = signRole(staffed, 'writer', 1, used); staffed = writer.state
    const director = signRole(staffed, 'director', 1, used); staffed = director.state
    const cast = signRole(staffed, 'actor', 2, used); staffed = cast.state
    const craft = signRole(staffed, 'craft', 1, used); staffed = craft.state // D-11.13: exactly one Craft Lead
    const concept = staffed.concepts[0]!
    const greenlight: Action = { kind: 'greenlight', production: {
      conceptId: concept.id, shape: SHAPE,
      promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
      writerId: writer.ids[0]!, directorId: director.ids[0]!, craftIds: [craft.ids[0]!],
      cast: { lead: released, antagonist: cast.ids[0]!, support: cast.ids[1]! },
      budget: { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * staffed.era.costScale, marketing: MARKETING_BUDGET_LEVELS[0]! },
    } }
    seated = applyActions(staffed, [greenlight])
    // The 52-week soak the audit asks for, a save attempted every week; refusals are recorded, not thrown.
    let state = seated
    for (let week = 0; week < SOAK_WEEKS; week++) {
      state = tick(state)
      let refusal: string | null = null
      try { saves.makeSave(state) } catch (error) { refusal = error instanceof Error ? error.message : String(error) }
      soak.push({ week: state.market.tick, refusal })
    }
  }, 300_000)

  it('premise: r01 is absorbed at 162, its released actor is out of the busy set and in the hiring market, and the world saves', () => {
    expect(terminalWeekOf(absorbed).get(TARGET)).toBe(WEEK)
    expect(busyTalentIds(absorbed).has(released)).toBe(false)
    expect(() => saves.makeSave(absorbed)).not.toThrow()
  })

  it('the player seats the released participant; the written-off picture still names them; the save admits', () => {
    const production = seated.studio.activeProductions.at(-1)!
    expect(production.cast.lead).toBe(released)
    expect(studioEmployerId(seated, released)).toBe(seated.hollywood!.playerStudioId)
    expect(busyTalentIds(seated).has(released)).toBe(true)
    // History is untouched: the frozen picture keeps its company.
    expect(productionCompanyTalentIds([seated.hollywood!.businesses.find((b) => b.studioId === TARGET)!.productions[0]!]).has(released)).toBe(true)
    // PREDICTED, not yet observed: under the candidate's claim rule this throws `person … has
    // simultaneous active assignments` (the red run is the lane's).
    expect(() => saves.makeSave(seated)).not.toThrow()
  })

  // Differential witnesses for the 0863f80b readers, one draft per case so each can be red on its own. Removing r01's
  // frozen picture is not a lawful state; it only shows that no reader's answer depends on it.
  const TERM = { windowStartWeek: WEEK, dueWeekExclusive: WEEK + 52, startWeek: WEEK, termWeeks: 52 }
  const differential = (draft: (h: NonNullable<GameState['hollywood']>) => PromiseDraft) => {
    const h = absorbed.hollywood!
    const withoutFrozen: GameState = { ...absorbed, hollywood: { ...h,
      businesses: h.businesses.map((b) => (b.studioId === TARGET ? { ...b, productions: [] } : b)) } }
    const chosen = draft(h)
    expect(promiseFeasibility(absorbed, chosen, WEEK), chosen.family).toEqual(promiseFeasibility(withoutFrozen, chosen, WEEK))
  }

  it('the promise occupancy reader ignores the written-off picture: a directing draft answers as the world without it', () => {
    // WITNESSED red at b2d3d97e (lane wave3d, c01-red.json: DIRECTING_COUNT), where `closedWeekOf` kept r01 in
    // `promiseProductionOccupancy` (promises.ts:346-347).
    differential((h) => ({ family: 'DIRECTING_COUNT', issuerStudioId: h.playerStudioId,
      beneficiaryPersonId: frozen.directorId, predicate: { kind: 'directorCount', count: 1 }, ...TERM }))
  })

  it('the opportunity owners reader ignores the written-off picture: a genre-opportunity draft answers as the world without it', () => {
    // PREDICTED red at b2d3d97e, where `closedWeekOf` kept r01 in the opportunity owners (opportunityPromises.ts:66-67);
    // the looped case before round 5 never ran this draft there. Isolation limit: this draft also reads
    // `promiseProductionOccupancy` (promises.ts:554-559, the opportunity scope sets the directing scope), so a red here
    // does not isolate owners().
    differential((h) => ({ family: 'PREFERRED_GENRE_OPPORTUNITY', issuerStudioId: h.playerStudioId,
      beneficiaryPersonId: frozen.cast.antagonist,
      predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: GENRE_ORDER[0]! }, ...TERM }))
  })

  it('every weekly save of the 52-week natural soak admits', () => {
    expect(soak).toHaveLength(SOAK_WEEKS)
    expect(soak.filter((row) => row.refusal !== null)).toEqual([])
    expect(soak.at(-1)!.week).toBe(WEEK + SOAK_WEEKS)
  })
})

// P16 rebase round 4 (review O6): the technology reader of buyer-continued work reads `continuedProductions` only as an
// array, like the hollywood and profession-history readers 2a78b372 guarded; it runs before either, so a malformed
// absorption record is refused there by name. No capture needed.
describe('C-01 follow-up: a malformed absorption record is refused by name, never as a TypeError', () => {
  it('validateTechnology names a continuedProductions that is not an array', () => {
    const world = generateWorld('p16-rebase-o6')
    expect(() => validateTechnology(world, true, new Map()), 'premise: the fresh world admits').not.toThrow()
    const malformed = new Map([['studio-x', { targetId: 'studio-x', continuedProductions: 'not-an-array' } as unknown as AbsorptionRecord]])
    expect(() => validateTechnology(world, true, malformed)).toThrow(/^Technology save: absorption work dispositions must be arrays$/)
  })
})
