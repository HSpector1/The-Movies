// ── Active-session autosave (D-12 session recovery) ───────────────────────────
// The authoritative GameState lives in App's React memory, so any reload / HMR / dev-server
// restart / remount used to discard the whole studio. This module persists the ACTIVE session to
// browser-local storage using the authoritative SaveFileV4 serialization (exportSaveJson) — never a
// UI reconstruction of engine state — and restores it through the existing validate/migrate path
// (importSaveJson). It is SEPARATE from the manual save slots (those are the player's own files).
//
// The key is namespaced to Project: Studio so it cannot collide with another localhost app's storage.

import { exportSaveJson, importSaveJson } from './adapter.ts'
import type { GameState } from './adapter.ts'

// Collision-resistant, version-tagged namespace. Bumping the trailing version retires old payloads.
export const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
// A quarantine slot for a payload that fails to load, kept for diagnosis (never auto-loaded).
export const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null // storage disabled (private mode / sandbox) — recovery is simply unavailable
  }
}

// Persist the active session. Called AFTER an authoritative state transition completes, so a
// half-applied transaction is never written (the engine returns whole states). Non-fatal on failure.
export function saveActiveSession(state: GameState): void {
  const s = storage()
  if (!s) return
  try {
    s.setItem(ACTIVE_SESSION_KEY, exportSaveJson(state))
  } catch {
    /* quota / serialization failure — the in-memory session is unaffected */
  }
}

export function hasActiveSession(): boolean {
  const s = storage()
  if (!s) return false
  try {
    return s.getItem(ACTIVE_SESSION_KEY) !== null
  } catch {
    return false
  }
}

export type LoadActiveResult =
  | { ok: true; state: GameState; converted: boolean }
  | { ok: false; reason: 'none' }
  | { ok: false; reason: 'corrupt'; raw: string }

// Restore the active session through the SAME validate/migrate path as a manual load. A corrupt
// payload is quarantined (not deleted) and reported so recovery fails safely rather than crashing.
export function loadActiveSession(): LoadActiveResult {
  const s = storage()
  if (!s) return { ok: false, reason: 'none' }
  let raw: string | null
  try {
    raw = s.getItem(ACTIVE_SESSION_KEY)
  } catch {
    return { ok: false, reason: 'none' }
  }
  if (raw === null || raw === '') return { ok: false, reason: 'none' }
  const out = importSaveJson(raw)
  if (out.ok) return { ok: true, state: out.state, converted: out.converted }
  // Preserve the invalid payload for diagnosis; leave the primary key so an explicit New Studio (not
  // a mere reload) is what clears it.
  try {
    s.setItem(ACTIVE_SESSION_CORRUPT_KEY, raw)
  } catch {
    /* ignore */
  }
  return { ok: false, reason: 'corrupt', raw }
}

// Explicitly discard the active session (a destructive New Studio action confirms before calling this).
export function clearActiveSession(): void {
  const s = storage()
  if (!s) return
  try {
    s.removeItem(ACTIVE_SESSION_KEY)
  } catch {
    /* ignore */
  }
}
