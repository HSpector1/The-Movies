export const ROLE_ATLAS_ROLES = [
  'director',
  'talent',
  'grip',
  'stagehand',
  'electrician',
  'camera',
  'security',
  'publicity',
  'extra',
] as const

export const ROLE_ATLAS_DIRECTIONS = ['south', 'east', 'north', 'west'] as const

export type RoleAtlasRole = (typeof ROLE_ATLAS_ROLES)[number]
export type RoleAtlasDirection = (typeof ROLE_ATLAS_DIRECTIONS)[number]

export const ROLE_ATLAS_FRAME_WIDTH = 96
export const ROLE_ATLAS_FRAME_HEIGHT = 128
export const ROLE_ATLAS_WIDTH = 384
export const ROLE_ATLAS_HEIGHT = 1152
export const ROLE_ATLAS_FRAME_COUNT = 36
export const ROLE_ATLAS_DECODED_BYTES = ROLE_ATLAS_WIDTH * ROLE_ATLAS_HEIGHT * 4
export const ROLE_ATLAS_RENDER_SCALE = 74 / ROLE_ATLAS_FRAME_HEIGHT
export const FALLBACK_PEOPLE_DECODED_BYTES = ROLE_ATLAS_ROLES.length * 54 * 74 * 4
export const GENERATED_VEHICLE_DECODED_BYTES = 98 * 49 * 4

type RuntimeFrame = {
  index: number
  x: number
  y: number
  width: number
  height: number
}

export type RoleAtlasRuntimeManifest = {
  schemaVersion: number
  atlasId: string
  image: string
  width: number
  height: number
  frameWidth: number
  frameHeight: number
  frameCount: number
  roles: string[]
  directions: string[]
  frames: Record<string, Record<string, RuntimeFrame>>
  atlasSha256: string
  atlasEncodedBytes: number
  atlasDecodedRgbaBytes: number
}

export function roleAtlasFrame(role: RoleAtlasRole, direction: RoleAtlasDirection): number {
  return ROLE_ATLAS_ROLES.indexOf(role) * ROLE_ATLAS_DIRECTIONS.length
    + ROLE_ATLAS_DIRECTIONS.indexOf(direction)
}

/**
 * Facing is presentation-only. Vertical ties resolve vertically; a zero vector preserves
 * the supplied prior direction so a stopped actor cannot flicker between frames.
 */
export function directionFromDelta(
  dx: number,
  dy: number,
  fallback: RoleAtlasDirection = 'south',
): RoleAtlasDirection {
  if (dx === 0 && dy === 0) return fallback
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'north' : 'south'
  return dx < 0 ? 'west' : 'east'
}

function exactStrings(value: unknown, expected: readonly string[]): boolean {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((entry, index) => entry === expected[index])
}

/** All-or-nothing manifest validation. A failed candidate leaves the generated fallback intact. */
export function isRoleAtlasRuntimeManifest(value: unknown): value is RoleAtlasRuntimeManifest {
  if (value === null || typeof value !== 'object') return false
  const manifest = value as Partial<RoleAtlasRuntimeManifest>
  if (
    manifest.schemaVersion !== 1
    || manifest.atlasId !== 'hollywood-role-atlas-v1'
    || manifest.image !== 'role-atlas-v1.png'
    || manifest.width !== ROLE_ATLAS_WIDTH
    || manifest.height !== ROLE_ATLAS_HEIGHT
    || manifest.frameWidth !== ROLE_ATLAS_FRAME_WIDTH
    || manifest.frameHeight !== ROLE_ATLAS_FRAME_HEIGHT
    || manifest.frameCount !== ROLE_ATLAS_FRAME_COUNT
    || manifest.atlasDecodedRgbaBytes !== ROLE_ATLAS_DECODED_BYTES
    || !exactStrings(manifest.roles, ROLE_ATLAS_ROLES)
    || !exactStrings(manifest.directions, ROLE_ATLAS_DIRECTIONS)
    || typeof manifest.atlasSha256 !== 'string'
    || !/^[0-9a-f]{64}$/.test(manifest.atlasSha256)
    || typeof manifest.atlasEncodedBytes !== 'number'
    || manifest.atlasEncodedBytes <= 0
    || manifest.frames === null
    || typeof manifest.frames !== 'object'
  ) return false

  const frames = manifest.frames as Record<string, Record<string, RuntimeFrame>>
  for (const [row, role] of ROLE_ATLAS_ROLES.entries()) {
    const roleFrames = frames[role]
    if (roleFrames === null || typeof roleFrames !== 'object') return false
    for (const [column, direction] of ROLE_ATLAS_DIRECTIONS.entries()) {
      const frame = roleFrames[direction]
      const index = row * ROLE_ATLAS_DIRECTIONS.length + column
      if (
        frame === null
        || typeof frame !== 'object'
        || frame.index !== index
        || frame.x !== column * ROLE_ATLAS_FRAME_WIDTH
        || frame.y !== row * ROLE_ATLAS_FRAME_HEIGHT
        || frame.width !== ROLE_ATLAS_FRAME_WIDTH
        || frame.height !== ROLE_ATLAS_FRAME_HEIGHT
      ) return false
    }
  }
  return true
}
