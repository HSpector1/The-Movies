// ── The live motion signal (PF1-M3) ──────────────────────────────────────────
//
// Two inputs, one answer, delivered to every surface that animates: the OS query and the
// player's stored preference. Both can change while the studio is open — the OS through a
// media-query change event, the preference through the settings overlay — so both are
// subscribed, never sampled once at mount.
//
// The mounted Lot reads the SAME hook rather than taking a prop, because the Lot is also
// rendered directly by its own suites; a prop would make the setting depend on who mounted
// the screen. The resolver in `motion.ts` is the only place the precedence rule exists.

import { useEffect, useState } from 'react'
import type { MotionPref } from '../prefs.ts'
import {
  REDUCED_MOTION_QUERY,
  osPrefersReducedMotion,
  readMotionPref,
  resolveMotion,
  subscribeMotionPref,
} from './motion.ts'
import type { ResolvedMotion } from './motion.ts'

export type MotionSignal = {
  /** What the player asked for. */
  pref: MotionPref
  /** What the operating system is asking for. */
  osReduced: boolean
  /** What the product must actually do. */
  resolved: ResolvedMotion
}

export function useResolvedMotion(): MotionSignal {
  const [pref, setPref] = useState<MotionPref>(readMotionPref)
  const [osReduced, setOsReduced] = useState<boolean>(osPrefersReducedMotion)

  useEffect(() => subscribeMotionPref(setPref), [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = (() => {
      try {
        return window.matchMedia(REDUCED_MOTION_QUERY)
      } catch {
        return null
      }
    })()
    if (mq === null) return
    const onChange = () => setOsReduced(mq.matches === true)
    onChange()
    // Older engines expose only addListener; both are optional so a partial stub cannot throw.
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return { pref, osReduced, resolved: resolveMotion(pref, osReduced) }
}

/**
 * Publish the resolved value where the stylesheets can see it.
 *
 * The attribute lives on the document element and nowhere else: the promoted rules are
 * written as `:root[data-motion="reduced"]`, and a second writer would let two surfaces
 * disagree about the same one fact.
 */
export function useMotionDocumentAttribute(resolved: ResolvedMotion): void {
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-motion', resolved)
  }, [resolved])
}
