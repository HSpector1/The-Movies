import { describe, expect, it } from 'vitest'
import runtimeManifest from '../../../public/lot/hollywood/role-atlas-v1.json'
import {
  ROLE_ATLAS_DECODED_BYTES,
  ROLE_ATLAS_DIRECTIONS,
  ROLE_ATLAS_FRAME_COUNT,
  ROLE_ATLAS_ROLES,
  directionFromDelta,
  isRoleAtlasRuntimeManifest,
  roleAtlasFrame,
} from './roleAtlas.ts'

describe('Hollywood Role Atlas V1', () => {
  it('owns the exact nine-role, four-direction, 36-address map', () => {
    const addresses = new Set<number>()
    for (const role of ROLE_ATLAS_ROLES) {
      for (const direction of ROLE_ATLAS_DIRECTIONS) {
        addresses.add(roleAtlasFrame(role, direction))
      }
    }
    expect([...addresses].sort((a, b) => a - b)).toEqual(
      Array.from({ length: ROLE_ATLAS_FRAME_COUNT }, (_entry, index) => index),
    )
    expect(roleAtlasFrame('director', 'south')).toBe(0)
    expect(roleAtlasFrame('camera', 'west')).toBe(23)
    expect(roleAtlasFrame('extra', 'west')).toBe(35)
  })

  it('resolves cardinal, diagonal, vertical-tie, and zero-vector boundaries deterministically', () => {
    expect(directionFromDelta(8, 0)).toBe('east')
    expect(directionFromDelta(-8, 0)).toBe('west')
    expect(directionFromDelta(0, -8)).toBe('north')
    expect(directionFromDelta(0, 8)).toBe('south')
    expect(directionFromDelta(8, -8)).toBe('north')
    expect(directionFromDelta(-8, 8)).toBe('south')
    expect(directionFromDelta(9, -8)).toBe('east')
    expect(directionFromDelta(-9, 8)).toBe('west')
    expect(directionFromDelta(0, 0, 'west')).toBe('west')
  })

  it('accepts only the complete governed runtime manifest', () => {
    expect(isRoleAtlasRuntimeManifest(runtimeManifest)).toBe(true)
    expect(runtimeManifest.atlasDecodedRgbaBytes).toBe(ROLE_ATLAS_DECODED_BYTES)
    expect(isRoleAtlasRuntimeManifest({ ...runtimeManifest, frameCount: 35 })).toBe(false)
    expect(isRoleAtlasRuntimeManifest({ ...runtimeManifest, width: 385 })).toBe(false)
    expect(isRoleAtlasRuntimeManifest({ ...runtimeManifest, roles: [...runtimeManifest.roles].reverse() })).toBe(false)
    expect(isRoleAtlasRuntimeManifest({
      ...runtimeManifest,
      frames: {
        ...runtimeManifest.frames,
        director: {
          ...runtimeManifest.frames.director,
          west: { ...runtimeManifest.frames.director.west, index: 2 },
        },
      },
    })).toBe(false)
  })
})
