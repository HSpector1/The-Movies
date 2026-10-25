// ── P16 r2 RED: renaming a screenplay between greenlight and release never makes the campaign unsaveable ──
//
// Review r1 blocker F3 / major F26. P16A r3: "A new P16 property uses its exact greenlight title; later renames,
// where lawful, are separate dated display facts and never rewrite that snapshot." The authoritative rule adopted
// in r2: the R1 property keeps its GREENLIGHT title (the snapshot); the R2 film title is the RELEASE-frozen title;
// the validator compares a greenlight snapshot with the concept's title only where no lawful rename at or after the
// greenlight week could have changed it (`originalScreenplays.blueprints[].renamedWeek`).
//
// Route: a founded managed studio commissions an ORIGINAL screenplay, greenlights it, renames it with the public
// `renameScreenplay` verb while it shoots, releases it, saves, reloads, ticks and saves again.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import * as rights from '../src/core/rights.js'
import { importSave, makeSave, migrateToLive, stableStringify, validateSaveV49 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { freePackage } from './_m4Fixtures.js'
import { contractedByRole } from './contracts/_contractFixtures.js'
import { detached, industryManagedStudio } from './helpers/p16-fixtures.js'

const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const

function greenlitOriginal(seed: string) {
  let s = industryManagedStudio(seed)
  const writer = contractedByRole(s, 'writer')[0]!
  const genre = s.concepts[0]!.genre
  const range: [number, number] = [-0.5, 0.5]
  s = applyActions(s, [{ kind: 'commissionOriginalScreenplay', screenplay: { writerId: writer.id, genre, shape: SHAPE,
    promise: { genre, intendedSegments: ['adult'], ranges: { intimacy: range, tonalWeight: range, kineticEnergy: range } } } }])
  let project = s.scriptDevelopment.projects.find((p) => p.status === 'review')
  for (let i = 0; i < 40 && project === undefined; i++) { s = tick(s); project = s.scriptDevelopment.projects.find((p) => p.status === 'review') }
  if (project === undefined) throw new Error('route premise: the original screenplay never reached review')
  s = applyActions(s, [{ kind: 'acceptScript', projectId: project.id }])
  s = applyActions(s, [{ kind: 'greenlightScriptProject', production: freePackage(s, project.id) }])
  const production = s.studio.activeProductions.at(-1)!
  return { state: s, conceptId: project.conceptId, productionId: production.id, directorId: production.directorId, greenlightTitle: s.concepts.find((c) => c.id === project!.conceptId)!.title }
}

function releaseIt(state: GameState, productionId: string, directorId: string): GameState {
  let s = state
  for (let i = 0; i < 80; i++) {
    const wf = s.operations.workflows.find((w) => w.productionId === productionId)
    if (wf?.phase === 'shooting' && wf.shootingTask?.status === 'unassigned') s = applyActions(s, [{ kind: 'assignShootingDirector', productionId, directorId }])
    if (s.operations.workflows.find((w) => w.productionId === productionId)?.shootingTask?.status === 'ready') s = applyActions(s, [{ kind: 'scheduleShootingTake', productionId }])
    if (s.studio.activeProductions.find((p) => p.id === productionId)?.remainingTicks === 1) s = applyActions(s, [{ kind: 'commitPictureToRelease', productionId }])
    s = tick(s)
    if (s.studio.releasedFilms.some((f) => f.productionId === productionId)) return s
  }
  throw new Error(`route premise: ${productionId} never released`)
}

describe('r2 F3/F26: rename between greenlight and release', () => {
  it('the property keeps its greenlight title, the film carries the release title, and the campaign saves, reloads byte-for-byte, ticks and saves again', () => {
    const g = greenlitOriginal('p16-r2-rename-01')
    const propertyId = rights.storyPropertyId(g.conceptId)
    expect(g.state.rights.properties.find((p) => p.propertyId === propertyId)!.title).toBe(g.greenlightTitle)
    let s = tick(tick(g.state))
    s = applyActions(s, [{ kind: 'renameScreenplay', conceptId: g.conceptId, title: 'The Retitled Picture' }])
    expect(() => makeSave(s)).not.toThrow()
    const released = releaseIt(s, g.productionId, g.directorId)
    const row = released.studioHistory.rows.find((r) => r.kind === 'filmReleased' && r.productionId === g.productionId)
    expect(row && row.kind === 'filmReleased' ? row.title : null).toBe('The Retitled Picture')
    expect(released.rights.properties.find((p) => p.propertyId === propertyId)!.title).toBe(g.greenlightTitle)
    expect(released.rights.filmTitles.find((t) => t.filmId === g.productionId)!.title).toBe('The Retitled Picture')
    expect(rights.resolveTitles(released).unavailable).toEqual([])
    const player = released.hollywood!.playerStudioId
    expect(rights.currentHolder(released, { right: 'R1', propertyId }, released.market.tick)).toEqual({ kind: 'holder', holderId: player, tradeable: true, archived: false })
    expect(libraryValuationV1(released, player, released.market.tick).kind).toBe('available')
    const saved = makeSave(released)
    const reloaded = migrateToLive(importSave(stableStringify(saved)))
    expect(stableStringify(reloaded)).toBe(stableStringify(saved))
    const next = tick(reloaded.state as GameState)
    expect(() => makeSave(next)).not.toThrow()
  }, 240_000)

  it('without a lawful rename the greenlight snapshot must equal the concept\'s title: a forged property title refuses as ambiguous provenance', () => {
    const g = greenlitOriginal('p16-r2-rename-02')
    const propertyId = rights.storyPropertyId(g.conceptId)
    const saved = detached(makeSave(g.state))
    saved.state.rights.properties.find((p) => p.propertyId === propertyId)!.title = 'A Title Nobody Greenlit'
    expect(() => validateSaveV49(saved)).toThrow(/greenlight title .* ambiguous provenance/)
  }, 240_000)
})
