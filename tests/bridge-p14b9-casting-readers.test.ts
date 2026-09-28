// Task 1315-C3, mode STAGE RED (test source only). Repo HEAD e65012e5, branch
// wip/headless-program-20260916-ts.
//
// STAGED FILE. Import paths are written for this file's INTENDED destination,
// `tests/p14b9-casting-readers.test.ts` (see `tests/p14r3-save-v41.test.ts`'s header for the
// same staging convention). Physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage3/tests/.
//
// REVISION 1315-C3: UNCHANGED from `1315-stage2` (`1315-X2-red-r2-dry-run.md` confirms every
// leaf in this file already passes on the parent's Save42 draft). Copied here only so the full
// five-file set is present together in one staged revision.
//
// REVISION 1315-C2 (over the frozen `1315-stage` draft, per `1315-X-red-dry-run.md` defect 2):
// the frozen draft used an unmeasured seed (`r1315-readers-01`) whose week-0 market holds only
// two actors; the market premise threw before any law assertion ran. Fix: reuse the measured
// seed `r1314-casting-01` (1314-P: writer t-wri-05, director t-dir-04, craft t-cra-09, actors
// t-act-24/t-act-08/t-act-20/t-act-12), signed via the measured route (one `signContract` per
// `applyActions` call — already this file's own pattern, unchanged). The house disclosed-cash
// bootstrap (`fund()`, `tests/helpers/p14b2-fixtures.ts:15-19`) is applied once after founding —
// this file runs only two greenlights, the same "more than one greenlight" case the copy file's
// header reasons through; one application is enough headroom. No law assertion changed.
//
// LAW UNDER TEST: 1313-F note 9 — "The RED names every reader of `RELATIONSHIP_DRIVER_KINDS`
// and `RelationshipDriverKind` under `src/`, `bridge/` and `ui/src/` (a filename grep, no
// fixture reads) and pins each one's behaviour on the two new kinds where it is observable."
// Covers 1315-C required leaf 6.
//
// GREP RESULT (performed by this author against the checked-in tree at HEAD 75233cc2, unchanged
// through d8e90042 — confirmed by `git diff --stat` against src/core/relationships.ts, src/core/
// types.ts and src/core/index.ts between those two commits: no output;
// `grep -rn "RELATIONSHIP_DRIVER_KINDS\|RelationshipDriverKind" src bridge ui/src`):
//   src/core/relationships.ts:27  (import, type position)
//   src/core/relationships.ts:56  (export const RELATIONSHIP_DRIVER_KINDS = [...])
//   src/core/relationships.ts:163 (counted(): switch (kind: RelationshipDriverKind))
//   src/core/relationships.ts:206 (hasDriver(): kind: RelationshipDriverKind)
//   src/core/relationships.ts:241 (driveTake(): kind: RelationshipDriverKind)
//   src/core/relationships.ts:302 (release seam: kind: RelationshipDriverKind | null)
//   src/core/relationships.ts:350 (DRIVER_COPY: Record<RelationshipDriverKind, string>)
//   src/core/relationships.ts:372 (pairChemistry: RELATIONSHIP_DRIVER_KINDS.filter(...))
//   src/core/relationships.ts:472 (validateRelationshipsRoot: RELATIONSHIP_DRIVER_KINDS.includes(...))
//   src/core/types.ts:2246        (export type RelationshipDriverKind = ...)
//   src/core/types.ts:2251        (RelationshipDriver.kind: RelationshipDriverKind)
//   src/core/index.ts:109         (barrel re-export: type RelationshipDriverKind)
//   src/core/index.ts:1528        (barrel re-export: RELATIONSHIP_DRIVER_KINDS)
// NO OTHER FILE under src/, bridge/ or ui/src/ references either symbol — in particular,
// NOTHING under bridge/ or ui/src/ imports the raw kind catalogue or the kind type directly.
// This is a real, verified absence (both symbols are searched together; `RelationshipDriver`
// WITHOUT the `Kind` suffix is a separate type this grep deliberately does not match).
//
// CONSEQUENCE FOR "each reader's behaviour, where observable": the two new kinds are NEVER
// observed as raw strings outside `src/core/relationships.ts`. They ARE observable indirectly,
// through `pairChemistry(...).reasons` (kind -> copy string, `relationships.ts:372`), which
// `bridge/relationships.ts` consumes in two places without importing the kind constant at all:
// `relationshipBlockFor`'s `rows[].drivers` (`bridge/relationships.ts:221`) and
// `castingChemistryRows`'s `rows[].drivers` / `castingChemistryWarning` (`:256`, `:266-274`).
// Both are pinned below on a real competition-only edge. `sharedPictureCount`
// (`bridge/relationships.ts:121-138`) is UNAFFECTED by construction: it is derived from
// `firstTakes`/`releasedFilms`, never from `state.relationships`, so a competition-only pair
// (sharedProductions 0) reads 0 shared pictures — pinned below as the companion fact.
//
// RED MECHANISM: `relationshipBlockFor`/`castingChemistryRows`/`castingChemistryWarning` already
// exist and already compile; the RED here is entirely in `pairChemistry`'s absent copy strings
// (see `tests/p14b9-casting-copy.test.ts`'s header) propagating through, and in the driver route
// itself depending on the absent `RELATIONSHIP_COMPETITION_DELTA` (see
// `tests/p14b9-casting-competition.test.ts`'s header) — the SAME underlying absence observed
// through a different, bridge-level surface.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import type { CastingSlate, GameState } from '../src/core/types.js'
import { relationshipBlockFor, castingChemistryRows, castingChemistryWarning, sharedPictureCount, CASTING_CHEMISTRY_WARNING } from '../bridge/relationships.ts'

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

type World = { state: GameState; market: Market; a: string; d: string; week: number }
let cachedWorld: World | null = null

/** Two productions, the same slate re-audited (the `p14b9-casting-copy.test.ts` pattern): pair
 * (a,d) loses twice (d — never seated — loses both times), so the edge carries
 * castingCompetitionLost + repeatedCompetition with sharedProductions staying 0. */
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
  const week = p2.after.market.tick
  s = cancelProduction(p2.after, p2.productionId)
  const result: World = { state: s, market, a, d, week }
  cachedWorld = result
  return structuredClone(result)
}

describe('1313-F note 9 — the grep result (filenames and lines, no fixture reads)', () => {
  it('src/core/relationships.ts still holds every occurrence of RELATIONSHIP_DRIVER_KINDS / RelationshipDriverKind this file names above', () => {
    const here = fileURLToPath(new URL('../src/core/relationships.ts', import.meta.url))
    const text = readFileSync(here, 'utf8')
    const hits = (text.match(/RELATIONSHIP_DRIVER_KINDS|RelationshipDriverKind/g) ?? []).length
    // grep -o "RELATIONSHIP_DRIVER_KINDS\|RelationshipDriverKind" src/core/relationships.ts | wc -l = 11 at HEAD 75233cc2.
    expect(hits).toBeGreaterThanOrEqual(11)
  })

  it('bridge/relationships.ts (the reader with an OBSERVABLE, indirect dependency, via pairChemistry) does not import the raw kind catalogue or type directly', () => {
    const here = fileURLToPath(new URL('../bridge/relationships.ts', import.meta.url))
    const text = readFileSync(here, 'utf8')
    expect(text.includes('RELATIONSHIP_DRIVER_KINDS')).toBe(false)
    expect(text.includes('RelationshipDriverKind')).toBe(false)
  })
})

describe('1313-F note 9 — bridge/relationships.ts relationshipBlockFor observes the new kinds through pairChemistry, never through the raw catalogue', () => {
  it('the row for a competition-only counterpart carries the DRIVER_COPY sentences and reads 0 shared pictures (sharedPictureCount is derived from firstTakes/releasedFilms, never from state.relationships)', () => {
    const w = world()
    const viewerStudioId = w.state.hollywood!.playerStudioId
    const block = relationshipBlockFor(w.state, w.a, viewerStudioId, w.week)
    const row = block.rows.find((r) => r.counterpartId === w.d)
    expect(row, `route/RED premise: "${w.a}" should disclose a tie with "${w.d}" on the viewer's own roster`).toBeDefined()
    expect(row!.drivers).toContain('competed for the same role')
    expect(row!.drivers).toContain('competed again')
    expect(row!.sharedPictures).toBe(0)
    expect(sharedPictureCount(w.state, w.a, w.d)).toBe(0)
  })
})

describe('1313-F note 9 — bridge/relationships.ts castingChemistryRows / castingChemistryWarning observe the new kinds the same way', () => {
  it('a proposed seating pairing (a,d) as lead/antagonist shows the competition copy and (if the tier reads -1) the one-sentence warning', () => {
    const w = world()
    const rows = castingChemistryRows(w.state, { directorId: w.market.director, lead: w.a, antagonist: w.d, support: w.market.actors[1]! }, w.week)
    const leadAntagonistRow = rows.find((r) => r.seatA === 'lead' && r.seatB === 'antagonist')!
    expect(leadAntagonistRow.tierLabel).not.toBeNull()
    expect(leadAntagonistRow.drivers).toContain('competed for the same role')
    expect(leadAntagonistRow.drivers).toContain('competed again')
    if (leadAntagonistRow.sign === -1) {
      const warning = castingChemistryWarning(w.state, { directorId: w.market.director, lead: w.a, antagonist: w.d, support: w.market.actors[1]! }, w.week)
      expect(warning).toBe(CASTING_CHEMISTRY_WARNING)
    }
  })
})
