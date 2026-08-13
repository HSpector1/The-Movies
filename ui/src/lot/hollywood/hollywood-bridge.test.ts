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
  canvas: { width: number; height: number }
  layers: Array<{ id: string; kind: string; depth: number; width: number; height: number }>
  places: Array<{
    id: string
    buildingId: string
    affordances: string[]
    selectionPolygon: [number, number][]
    anchors: Record<string, [number, number]>
  }>
  routes: Record<string, Array<{ actorDepth: number; cue: string }>>
  activities: Array<{ id: string; place: string; requiredAffordances: string[]; visualStates: string[] }>
  textureMemoryBytes: number
}

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), 'ui/public/lot/hollywood/district-manifest.json'), 'utf8'),
) as RuntimeManifest

type Point = [number, number]

function orientation(a: Point, b: Point, c: Point): number {
  return Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
}

function pointOnSegment(a: Point, b: Point, point: Point): boolean {
  return (
    orientation(a, b, point) === 0 &&
    point[0] >= Math.min(a[0], b[0]) &&
    point[0] <= Math.max(a[0], b[0]) &&
    point[1] >= Math.min(a[1], b[1]) &&
    point[1] <= Math.max(a[1], b[1])
  )
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const abC = orientation(a, b, c)
  const abD = orientation(a, b, d)
  const cdA = orientation(c, d, a)
  const cdB = orientation(c, d, b)
  return (
    (abC !== abD && cdA !== cdB) ||
    (abC === 0 && pointOnSegment(a, b, c)) ||
    (abD === 0 && pointOnSegment(a, b, d)) ||
    (cdA === 0 && pointOnSegment(c, d, a)) ||
    (cdB === 0 && pointOnSegment(c, d, b))
  )
}

function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!
    const b = polygon[j]!
    if (pointOnSegment(a, b, point)) return true
    if (
      (a[1] > point[1]) !== (b[1] > point[1]) &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    ) {
      inside = !inside
    }
  }
  return inside
}

function polygonsOverlap(a: Point[], b: Point[]): boolean {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (segmentsIntersect(a[i]!, a[(i + 1) % a.length]!, b[j]!, b[(j + 1) % b.length]!)) {
        return true
      }
    }
  }
  return pointInPolygon(a[0]!, b) || pointInPolygon(b[0]!, a)
}

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

  it('owns a fixed semantic Annex parcel for authoritative lifecycle paint and navigation', () => {
    const parcel = manifest.places.find((place) => place.id === 'annex-parcel')
    expect(parcel).toEqual(expect.objectContaining({
      buildingId: 'expansion',
      affordances: ['develop-studio', 'construct-annex'],
    }))
  })

  it('carves pairwise-disjoint semantic hotspots and keeps every anchor inside its owner', () => {
    for (let i = 0; i < manifest.places.length; i++) {
      const place = manifest.places[i]!
      for (const [anchor, point] of Object.entries(place.anchors)) {
        expect(
          pointInPolygon(point, place.selectionPolygon),
          `${place.id}.${anchor} must remain inside its semantic hotspot`,
        ).toBe(true)
      }
      for (let j = i + 1; j < manifest.places.length; j++) {
        const other = manifest.places[j]!
        expect(
          polygonsOverlap(place.selectionPolygon, other.selectionPolygon),
          `${place.id} must not overlap ${other.id}`,
        ).toBe(false)
      }
    }
  })

  it('keeps the Annex on the carved central asphalt pad, clear of service and gate hotspots', () => {
    const parcel = manifest.places.find((place) => place.id === 'annex-parcel')!
    const xs = parcel.selectionPolygon.map(([x]) => x)
    const ys = parcel.selectionPolygon.map(([, y]) => y)
    expect({
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    }).toEqual({ left: 460, right: 820, top: 640, bottom: 915 })
    expect(parcel.anchors.site).toEqual([640, 790])
    expect(parcel.selectionPolygon.every(([x, y]) => (
      x >= 0 && x <= manifest.canvas.width && y >= 0 && y <= manifest.canvas.height
    ))).toBe(true)
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
