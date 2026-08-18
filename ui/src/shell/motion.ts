// ── Motion precedence (PF1-M3) ───────────────────────────────────────────────
//
// ONE LAW, STATED ONCE: THE PLAYER'S SETTING MAY ONLY EVER STRENGTHEN THE OS
// REDUCED-MOTION SIGNAL, NEVER WEAKEN IT.
//
// An operating system that asks for reduced motion is an accessibility request, not a
// default this product is entitled to override. So "Full" is not a live control when the
// OS is asking for reduced motion — the settings surface presents it as unavailable, with
// the fact, the reason, and the way forward (the blocked-state grammar), because a control
// that visibly does nothing is a lie told in an accessible place.
//
// The resolved value is published as `data-motion` on the document element. CSS media
// queries alone cannot honour an in-game setting, so every
// `@media (prefers-reduced-motion: reduce)` block in the product is paired with a
// `:root[data-motion="reduced"]` rule carrying the identical declarations — a missed pair
// silently ignores the player's choice on that one surface.
//
// The preference itself lives in the frozen `prefs.ts` store under the single versioned
// key. This module owns no storage of its own.

import { loadPrefs, savePrefs } from '../prefs.ts'
import type { MotionPref } from '../prefs.ts'

/** What the product actually does, after the OS and the player have both been consulted. */
export type ResolvedMotion = 'reduced' | 'full'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * The whole precedence rule. `osReduced` wins outright; the player may add reduction
 * to a system that is not asking for it, and can never subtract reduction from one that is.
 */
export function resolveMotion(pref: MotionPref, osReduced: boolean): 'reduced' | 'full' {
  if (osReduced) return 'reduced'
  return pref === 'reduced' ? 'reduced' : 'full'
}

/** Does the OS itself ask for reduced motion right now? Absent matchMedia reads as "no". */
export function osPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches === true
  } catch {
    return false
  }
}

export function readMotionPref(): MotionPref {
  return loadPrefs().motion
}

// Live subscribers. The setting must reach BOTH the document attribute (App) and the
// mounted Lot's own renderer flag in the same gesture, without either one polling storage.
const listeners = new Set<(pref: MotionPref) => void>()

export function subscribeMotionPref(listener: (pref: MotionPref) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Persist the player's motion choice and tell every live surface.
 *
 * The read-modify-write is deliberate. `prefs.v1` is one record shared with the audio
 * service, which holds its own in-memory copy taken at construction; writing the whole
 * record from a stale copy is how a preference gets un-written. Reading immediately
 * before writing is what keeps a volume change and a motion change from erasing each other.
 */
export function writeMotionPref(pref: MotionPref): void {
  savePrefs({ ...loadPrefs(), motion: pref })
  for (const listener of listeners) listener(pref)
}

/**
 * Put the live motion preference back into storage if an audio write displaced it.
 *
 * The audio service (frozen this milestone) persists the whole shared prefs record from a
 * snapshot it took when it was constructed, so a volume or mute write issued AFTER a motion
 * change carries the older motion value back to storage. The settings surface calls this
 * with its live value immediately after every audio write; both calls are synchronous, so
 * storage ends the gesture holding both facts. No live surface is notified — the player's
 * choice never changed, only the record of it was corrected.
 */
export function reassertMotionPref(pref: MotionPref): void {
  const stored = loadPrefs()
  if (stored.motion === pref) return
  savePrefs({ ...stored, motion: pref })
}
