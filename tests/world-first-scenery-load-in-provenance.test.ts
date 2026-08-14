import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

type RuntimePlace = {
  id: string
  buildingId: string
  label: string
  anchors: Record<string, [number, number]>
  affordances: string[]
}

type RuntimeManifest = {
  places: RuntimePlace[]
}

const ARTIFACTS = [
  {
    path: 'art/hollywood/district-manifest.source.json',
    bytes: 4_052,
    sha256: '5af27d7a97739724990ec08ef1fe5888eeb069bccc8e81b351271c2268914889',
  },
  {
    path: 'ui/public/lot/hollywood/district-manifest.json',
    bytes: 6_761,
    sha256: '23bf9451b3a62099ed724b0f3a4082839b8246862ac5e61f3b72233dc5430d92',
  },
  {
    path: 'art/hollywood/source/moonshot-studio-chronicle-concept.png',
    bytes: 2_804_229,
    sha256: 'a6279762ab7db8b5a16ea71627e63ae918b74c2db8e0874731c34c09947e7c34',
  },
  {
    path: 'tools/hollywood/export_district.py',
    bytes: 3_218,
    sha256: '405cb831d7d0cf4daaefe2259b0b27160157cbd65cb86c056814059c37b488fe',
  },
  {
    path: 'ui/public/lot/hollywood/district-base.png',
    bytes: 2_750_802,
    sha256: 'a920e651d9b48b81dbcd6b2923f3c558326692705ea7b6a8fcb854055d009978',
  },
  {
    path: 'ui/public/lot/hollywood/truck-occluder.png',
    bytes: 245_021,
    sha256: 'c559cce2a06bb35da5aeda6fd237ed2a2abfdcc1f85954b898fe84cd6da6c4a1',
  },
  {
    path: 'ui/public/lot/hollywood/camera-dolly-occluder.png',
    bytes: 106_780,
    sha256: 'c190166b8e8b7efa5c4c37e30f59b0c6684aff15deaabb774b9e55e3f22c2dc5',
  },
  {
    path: 'ui/public/lot/hollywood/gate-foreground-occluder.png',
    bytes: 852_735,
    sha256: 'c91b9b831efd9a58ad6047013f300228663dc5ddd410d94188436327c054179a',
  },
] as const

function hash(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function uniquePlace(manifest: RuntimeManifest, id: string): RuntimePlace {
  const matches = manifest.places.filter((place) => place.id === id)
  expect(matches).toHaveLength(1)
  return matches[0]!
}

describe('World-First Scenery Load-In V1 — frozen district provenance', () => {
  it('pins authored source, accepted runtime, exporter, plate, and every district PNG byte', () => {
    for (const artifact of ARTIFACTS) {
      const bytes = readFileSync(artifact.path)
      expect(bytes.byteLength, artifact.path).toBe(artifact.bytes)
      expect(hash(bytes), artifact.path).toBe(artifact.sha256)
    }
  })

  it('replays the clean exporter and pins its deliberately non-runtime manifest', () => {
    const output = mkdtempSync(join(tmpdir(), 'studio-scenery-export-'))
    try {
      execFileSync('python3', [
        resolve('tools/hollywood/export_district.py'),
        '--source', resolve('art/hollywood/source/moonshot-studio-chronicle-concept.png'),
        '--manifest', resolve('art/hollywood/district-manifest.source.json'),
        '--output', output,
      ], { stdio: 'pipe' })
      const cleanManifest = readFileSync(join(output, 'district-manifest.json'))
      expect(cleanManifest.byteLength).toBe(5_787)
      expect(hash(cleanManifest)).toBe(
        '56057b6bdfd7d2e7f31b6ae839121d3996f83fc75e1eb2e5955939d862846ab7',
      )
    } finally {
      rmSync(output, { recursive: true, force: true })
    }
  })

  it('pins the exact accepted service source, Stage 7 destination, and Annex identity', () => {
    const manifest = JSON.parse(
      readFileSync('ui/public/lot/hollywood/district-manifest.json', 'utf8'),
    ) as RuntimeManifest

    expect(uniquePlace(manifest, 'service-yard')).toMatchObject({
      id: 'service-yard',
      buildingId: 'post',
      label: 'Scenery & Service',
      anchors: {
        truck: [271, 626],
        sceneryRack: [112, 404],
        loadIn: [390, 584],
      },
      affordances: ['delivery', 'supply-scenery', 'load-in'],
    })
    expect(uniquePlace(manifest, 'stage-7')).toMatchObject({
      id: 'stage-7',
      buildingId: 'stage-a',
      label: 'Stage 7',
      anchors: {
        entry: [586, 383],
        crewCall: [662, 472],
        camera: [558, 527],
        service: [500, 500],
      },
      affordances: ['enter-stage', 'shoot', 'load-in'],
    })
    expect(uniquePlace(manifest, 'annex-parcel')).toMatchObject({
      id: 'annex-parcel',
      buildingId: 'expansion',
      label: 'Development & Casting Annex',
      anchors: { site: [640, 790] },
      affordances: ['develop-studio', 'construct-annex'],
    })
  })
})
