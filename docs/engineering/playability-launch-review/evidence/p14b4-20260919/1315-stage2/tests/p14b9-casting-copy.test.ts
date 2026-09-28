// Task 1315-C2, mode STAGE RED (test source only). Repo HEAD d8e90042, branch
// wip/headless-program-20260916-ts.
//
// STAGED FILE. Import paths are written for this file's INTENDED destination,
// `tests/p14b9-casting-copy.test.ts` (see `tests/p14r3-save-v41.test.ts`'s header for the same
// staging convention). Physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage2/tests/.
//
// REVISION 1315-C2 (over the frozen `1315-stage` draft, per `1315-X-red-dry-run.md` defect 2):
// the frozen draft used an unmeasured seed (`r1315-copy-01`) whose week-0 market holds no
// director; the market premise threw before any law assertion ran. Fix: reuse the measured seed
// `r1314-casting-01` (1314-P: writer t-wri-05, director t-dir-04, craft t-cra-09, actors
// t-act-24/t-act-08/t-act-20/t-act-12), signed via the measured route (one `signContract` per
// `applyActions` call — already this file's own pattern, unchanged). The house disclosed-cash
// bootstrap (`tests/helpers/p14b2-fixtures.ts:15-19`, `fund()`) is applied once after founding —
// this file runs only two greenlights, matching the coordinator's "if their chain needs more
// than one greenlight" allowance at its smallest case; one application is enough headroom by the
// same arithmetic `p14b9-casting-competition.test.ts`'s header states (per-production cost
// measured at 2.3M-5.4M, two productions well inside a single 30,000,000 bootstrap). No law
// assertion changed by this fix.
//
// LAW UNDER TEST: 1313-A §1 "Copy" bullet + 1313-F note 6
// (`DRIVER_COPY` gains "competed for the same role" / "competed again"; `pairChemistry`'s
// dormancy reason, for an edge with `sharedProductions === 0`, reads "they have never worked
// together" in place of "they have not worked together lately"). This file covers 1315-C
// required leaf 4.
//
// RED MECHANISM: `pairChemistry` and `DRIVER_COPY` already exist (`src/core/relationships.ts`);
// this leaf is a behavior change, not a missing-export RED. The route below mints two REAL
// `castingCompetitionLost` drivers (and, on the second production, one real
// `repeatedCompetition`) on the SAME pair via `RELATIONSHIP_COMPETITION_DELTA` arithmetic — see
// `tests/p14b9-casting-competition.test.ts`'s header for why that constant's absence is a RED in
// ITS OWN right; the two `it()`s below that call `pairChemistry` are downstream of that same
// absence (the route throws before reaching the copy assertion) until the driver kinds exist,
// and the copy strings themselves are additionally absent from `DRIVER_COPY` (a private map;
// observed only through `pairChemistry(...).reasons`, never imported directly).
//
// `pairChemistry(state, x, y, week)` takes `week` as an explicit argument — it is a pure read,
// so a dormancy check that requires `week - edge.lastEventWeek > RELATIONSHIP_DRIFT_GRACE_WEEKS`
// (52 weeks) is queried at a FUTURE week directly, with no need to tick the world 53+ weeks
// forward.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import type { CastingSlate, GameState } from '../src/core/types.js'
// RED (see header): RELATIONSHIP_COMPETITION_DELTA / RELATIONSHIP_COMPETITION_REPEAT_CAP are
// absent from src/core/relationships.ts at HEAD d8e90042; used in arithmetic below (never
// merely imported).
import { RELATIONSHIP_DRIFT_GRACE_WEEKS, pairChemistry } from '../src/core/relationships.js'

const SEED = 'r1314-casting-01'
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }

type Market = { writer: string; director: string; craft: string; actors: readonly string[] }

function deriveMarket(s: GameState): Market {
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter((id) => s.talent.find((t) => t.id === id)?.role === role)
  const writer = byRole('writer')[0]
  const director = byRole('director')[0]
  const craft = byRole('craft')[0]
  const actors = byRole('actor')
  if (writer === undefined || director === undefined || craft === undefined || actors.length < 4) {
    throw new Error(`route premise failed: seed "${SEED}" week-0 hiring market does not hold a writer, director, craft and 4 actors — got ${JSON.stringify({ writer, director, craft, actors })}`)
  }
  return { writer, director, craft, actors }
}

function greenlightCycle(s: GameState, market: Market, conceptIndex: number, slate: CastingSlate, cast: Record<'lead' | 'antagonist' | 'support', string>): { after: GameState; productionId: string } {
  const concept = s.concepts[conceptIndex]!
  s = applyActions(s, [{
    kind: 'commissionScript',
    project: { conceptId: concept.id, writerId: market.writer, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES } },
  }])
  const projectId = s.scriptDevelopment.projects.at(-1)!.id
  for (let n = 0; s.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; n++) {
    if (n >= 30) throw new Error(`route premise failed: project "${projectId}" did not reach review within 30 ticks`)
    s = tick(s)
  }
  s = applyActions(s, [{ kind: 'acceptScript', projectId }])
  s = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate } }])
  const sessionId = s.castingSessions.sessions.find((x) => x.projectId === projectId)!.id
  for (let n = 0; s.castingSessions.sessions.find((x) => x.id === sessionId)!.status !== 'review'; n++) {
    if (n >= 30) throw new Error(`route premise failed: session "${sessionId}" did not reach review within 30 ticks`)
    s = tick(s)
  }
  s = applyActions(s, [{ kind: 'acknowledgeCastingSession', sessionId }])
  s = applyActions(s, [{
    kind: 'greenlightScriptProject',
    production: { projectId, directorId: market.director, craftIds: [market.craft], cast, budget: { negative: concept.baseNegativeCost, marketing: 0 } },
  }])
  const productionId = s.studio.activeProductions.at(-1)!.id
  return { after: s, productionId }
}

function cancelProduction(s: GameState, productionId: string): GameState {
  return applyActions(s, [{ kind: 'cancel', productionId }])
}

type World = { state: GameState; market: Market; a: string; d: string; lastEventWeek: number }
let cachedWorld: World | null = null

/** Two productions, the SAME slate re-audited each time: pair (a,d) loses twice (a wins,
 * d — never seated — loses both times), giving one edge that carries both
 * castingCompetitionLost and repeatedCompetition, with sharedProductions staying 0. */
function world(): World {
  if (cachedWorld !== null) return structuredClone(cachedWorld)
  let s = fund(p13aGeneratedStudio(SEED)) // house disclosed-cash bootstrap, once after founding (1315-C2 defect 1/2)
  const market = deriveMarket(s)
  for (const id of [market.writer, market.director, market.craft, ...market.actors]) {
    s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  }
  const mounted = s.sets.find((x) => x.mountedOn === STAGE && x.status !== 'retired')
  if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
  s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  s = advanceTo(s, TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
  const [a, b, c, d] = market.actors as [string, string, string, string]
  const slate: CastingSlate = { lead: [a, d], antagonist: [b, c], support: [c, a] }
  const cast = { lead: a, antagonist: b, support: c }
  const p1 = greenlightCycle(s, market, 0, slate, cast)
  s = cancelProduction(p1.after, p1.productionId)
  const p2 = greenlightCycle(s, market, 1, slate, cast)
  const lastEventWeek = p2.after.market.tick
  s = cancelProduction(p2.after, p2.productionId)
  const result: World = { state: s, market, a, d, lastEventWeek }
  cachedWorld = result
  return structuredClone(result)
}

describe('1313-F note 6 — pairChemistry dormancy copy for a competition-only edge', () => {
  it('an edge with sharedProductions 0, queried well past the drift grace window, reads "they have never worked together" (not "...lately")', () => {
    const w = world()
    const farWeek = w.lastEventWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS + 1
    const chem = pairChemistry(w.state, w.a, w.d, farWeek)
    expect(chem.reasons).toContain('they have never worked together')
    expect(chem.reasons).not.toContain('they have not worked together lately')
  })
})

describe('1313-A §1 "Copy" — DRIVER_COPY for castingCompetitionLost and repeatedCompetition', () => {
  it('pairChemistry surfaces "competed for the same role" and "competed again" for a pair that lost twice', () => {
    const w = world()
    const chem = pairChemistry(w.state, w.a, w.d, w.lastEventWeek)
    expect(chem.reasons).toContain('competed for the same role')
    expect(chem.reasons).toContain('competed again')
  })
})
