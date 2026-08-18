// ── Player presentation preferences (PF1-M1) ─────────────────────────────────
//
// A SIBLING of flags.ts, never an extension of it. `project-studio.flags.*` is a QA
// surface and says so; this is the player's own settings store and it holds volumes,
// mute and the motion preference under ONE versioned key.
//
// These are presentation facts. They are never part of GameState, never enter a save
// file, and no engine behaviour may read them (charter §2). The storage discipline is
// the session.ts idiom: try/catch on every access, so private mode, a disabled quota,
// a corrupt payload or a payload written by a FUTURE build all resolve to defaults
// rather than to a broken studio.
//
// The one pre-existing preference key (`project-studio.ui.picture-guidance-collapsed`)
// is grandfathered as-is; the one-key law governs everything added from PF1 onward.

import type { AudioChannel } from './audio/sink.ts'

/** The single versioned key. Bumping the version retires every older payload. */
export const PREFS_KEY = 'project-studio.prefs.v1'

/** How motion is decided: follow the OS, or the player's explicit override. */
export type MotionPref = 'system' | 'reduced' | 'full'

export type Prefs = {
  version: 1
  volumes: Record<AudioChannel, number>
  muted: boolean
  motion: MotionPref
}

const MOTION_PREFS: readonly MotionPref[] = ['system', 'reduced', 'full']

/**
 * The shipped defaults. Music sits under ambience on purpose: the lot is a place
 * first and a soundtrack second (the calm-morning law).
 */
export function defaultPrefs(): Prefs {
  return {
    version: 1,
    volumes: { master: 0.8, music: 0.5, ambience: 0.6, effects: 0.7 },
    muted: false,
    motion: 'system',
  }
}

/** Volumes are a closed range; anything outside it is a defect in the caller, not a level. */
export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null // storage disabled (private mode / sandbox) — preferences are simply not kept
  }
}

function readVolume(raw: unknown, fallback: number): number {
  return typeof raw === 'number' && Number.isFinite(raw) ? clampVolume(raw) : fallback
}

function readMotion(raw: unknown): MotionPref | null {
  return typeof raw === 'string' && (MOTION_PREFS as readonly string[]).includes(raw)
    ? (raw as MotionPref)
    : null
}

/**
 * The stored preferences, or the defaults.
 *
 * Field-level tolerance is deliberate: an unknown key is ignored, a missing or
 * unreadable field falls back to its default, and only a wrong/absent VERSION
 * discards the payload wholesale. A player who loses one setting to a bad write
 * should not lose the rest with it.
 */
export function loadPrefs(): Prefs {
  const defaults = defaultPrefs()
  const store = storage()
  if (store === null) return defaults

  let raw: string | null
  try {
    raw = store.getItem(PREFS_KEY)
  } catch {
    return defaults
  }
  if (raw === null || raw === '') return defaults

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return defaults // corrupt payload — the player's studio still opens
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return defaults

  const payload = parsed as Record<string, unknown>
  if (payload.version !== 1) return defaults // wrong or future version — defaults, never a guess

  const volumesRaw = payload.volumes
  const volumes =
    typeof volumesRaw === 'object' && volumesRaw !== null && !Array.isArray(volumesRaw)
      ? (volumesRaw as Record<string, unknown>)
      : {}

  return {
    version: 1,
    volumes: {
      master: readVolume(volumes.master, defaults.volumes.master),
      music: readVolume(volumes.music, defaults.volumes.music),
      ambience: readVolume(volumes.ambience, defaults.volumes.ambience),
      effects: readVolume(volumes.effects, defaults.volumes.effects),
    },
    muted: typeof payload.muted === 'boolean' ? payload.muted : defaults.muted,
    motion: readMotion(payload.motion) ?? defaults.motion,
  }
}

/**
 * Persist preferences. A failed write (quota, private mode) leaves the session intact.
 *
 * PF1-M4: returns TRUE when the record actually reached storage. A lost preference is
 * not destructive — the studio and the save are untouched, and the setting still holds
 * for the rest of the session — so no surface interrupts the player with it (PM ruling).
 * But "did that land?" is now a question a caller can ask rather than assume.
 */
export function savePrefs(p: Prefs): boolean {
  const store = storage()
  if (store === null) return false
  try {
    store.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: {
          master: clampVolume(p.volumes.master),
          music: clampVolume(p.volumes.music),
          ambience: clampVolume(p.volumes.ambience),
          effects: clampVolume(p.volumes.effects),
        },
        muted: p.muted === true,
        motion: readMotion(p.motion) ?? 'system',
      }),
    )
    return true
  } catch {
    return false // quota / storage unavailable — preferences are not kept this session
  }
}
