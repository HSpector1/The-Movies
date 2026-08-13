import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateWorld } from '../../../../src/core/worldgen.ts'
import { beginFounding, FOUNDING_MINIMUMS } from '../../../../src/core/employment.ts'
import { applyActions } from '../../../../src/core/actions.ts'
import type { CreativeRole } from '../../../../src/core/types.ts'
import { studioLotSnapshot } from '../../engine/adapter.ts'

type RuntimeManifest = {
  schemaVersion: number
  layers: Array<{ id: string; kind: string; depth: number; width: number; height: number }>
  places: Array<{ id: string; affordances: string[] }>
  routes: Record<string, Array<{ actorDepth: number; cue: string }>>
  activities: Array<{ id: string; place: string; requiredAffordances: string[]; visualStates: string[] }>
  textureMemoryBytes: number
}

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), 'ui/public/lot/hollywood/district-manifest.json'), 'utf8'),
) as RuntimeManifest

describe('Operation Hollywood engine bridge', () => {
  it('exports one Tier-0 plate plus three tight semantic occluders', () => {
    expect(manifest.schemaVersion).toBe(1)
    expect(manifest.layers.map((layer) => [layer.id, layer.kind])).toEqual([
      ['district-base', 'baked'],
      ['truck-occluder', 'occluder'],
      ['camera-dolly-occluder', 'occluder'],
      ['gate-foreground-occluder', 'occluder'],
    ])
    expect(manifest.layers.slice(1).every((layer) => layer.width < 1586 && layer.height < 992)).toBe(true)
    expect(manifest.textureMemoryBytes).toBeLessThan(10 * 1024 * 1024)
  })

  it('proves the hard depth case with ordered per-segment depth bands', () => {
    const route = manifest.routes['street-to-stage-7']!
    expect(route.map((point) => point.cue)).toContain('behind-truck')
    expect(route.map((point) => point.cue)).toContain('behind-camera')
    expect(route.map((point) => point.cue)).toContain('enter-stage')
    expect(route.map((point) => point.actorDepth)).toEqual([30, 30, 50, 56, 78, 82])
  })

  it('stages Shooting and Publicity from the same place/affordance/activity vocabulary', () => {
    const placeById = new Map(manifest.places.map((place) => [place.id, place]))
    expect(manifest.activities.map((activity) => activity.id)).toEqual(['shooting', 'publicity'])
    for (const activity of manifest.activities) {
      const place = placeById.get(activity.place)
      expect(place).toBeDefined()
      expect(activity.requiredAffordances.every((required) => place!.affordances.includes(required))).toBe(true)
      expect(activity.visualStates.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('projects only real contracted or active identities without leaking Talent objects', () => {
    let state = beginFounding(generateWorld('operation-hollywood-test'))
    const pool = state.founding!.applicantIds.map((id) => state.talent.find((talent) => talent.id === id)!)
    const byRole = (role: CreativeRole, count: number) => pool.filter((talent) => talent.role === role).slice(0, count)
    const foundingRoster = [
      ...byRole('actor', FOUNDING_MINIMUMS.actor),
      ...byRole('director', FOUNDING_MINIMUMS.director),
      ...byRole('writer', FOUNDING_MINIMUMS.writer),
      ...byRole('craft', FOUNDING_MINIMUMS.craft),
    ]
    for (const talent of foundingRoster) {
      state = applyActions(state, [{ kind: 'signContract', talentId: talent.id, termWeeks: 156 }])
    }
    state = applyActions(state, [{ kind: 'foundStudio' }])
    const snapshot = studioLotSnapshot(state)
    const contractedIds = new Set(state.contracts.map((contract) => contract.talentId))

    expect(snapshot.people.some((person) => person.name === 'Mara Voss')).toBe(false)
    expect(snapshot.people.every((person) => contractedIds.has(person.id))).toBe(true)
    expect(snapshot.people.some((person) => person.role === 'director' && person.authority === 'studio-roster')).toBe(true)
    expect(snapshot.people.some((person) => person.role === 'talent' && person.authority === 'studio-roster')).toBe(true)
    expect(Object.keys(snapshot.people[0] ?? {}).sort()).toEqual([
      'authority', 'id', 'name', 'productionId', 'productionTitle', 'role',
    ])
  })
})
