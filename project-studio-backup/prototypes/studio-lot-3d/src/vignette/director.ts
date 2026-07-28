// ── Deterministic filming vignette ────────────────────────────────────────────
// One authored ~22 s sequence, sampled by absolute time t (seconds). Fully
// deterministic (pure function of t) — no Math.random. Beats: van/talent arrival →
// crew gather → director + actors take set → equipment → slate/cue (flash) → short
// performed beat → crew react → return to ambient. Readable without any UI card.

export type VActor = { x: number; z: number; visible: boolean; face: number }
export type VignetteFrame = {
  van: VActor
  director: VActor
  actorA: VActor
  actorB: VActor
  slate: VActor
  approacher: VActor
  recording: boolean // stage recording light lit
  doorOpen: boolean // stage doors visibly open (entry only allowed then)
  flash: number // 0..1 slate/take flash
  phase: 'idle' | 'arrival' | 'gather' | 'set' | 'take' | 'wrap'
}

type Key = { t: number; x: number; z: number; hidden?: boolean; face?: number }

function sample(keys: Key[], t: number): VActor {
  if (t <= keys[0].t) return { x: keys[0].x, z: keys[0].z, visible: !keys[0].hidden, face: keys[0].face ?? 0 }
  const last = keys[keys.length - 1]
  if (t >= last.t) return { x: last.x, z: last.z, visible: !last.hidden, face: last.face ?? 0 }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / (b.t - a.t || 1)
      const hidden = a.hidden || b.hidden
      const face = Math.atan2(b.z - a.z, b.x - a.x)
      return { x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u, visible: !hidden, face }
    }
  }
  return { x: last.x, z: last.z, visible: !last.hidden, face: 0 }
}

// Keyframes reference stage-A apron anchors. ALL positions stay at x<12 (in front
// of the doors); the ONLY x=12 points are the doorway entries during the take, and
// they occur only while doorOpen. No route crosses a building footprint.

// van drives a straight service corridor at x=8.5 (clear of the stage at x≥12)
const VAN: Key[] = [
  { t: 0, x: 8.5, z: 27, hidden: true },
  { t: 0.5, x: 8.5, z: 27 },
  { t: 4, x: 8.5, z: 9 },
  { t: 15, x: 8.5, z: 9 },
  { t: 19, x: 8.5, z: 27 },
  { t: 22, x: 8.5, z: 27, hidden: true },
]
// take staging is SPREAD (Gate-C defect C): director / actors / slate hold distinct,
// ~1.5–2 m-spaced marks so they read as roles on set, not a stack on one waypoint.
const DIRECTOR: Key[] = [
  { t: 0, x: 8.5, z: 9, hidden: true },
  { t: 4, x: 8.5, z: 9, hidden: true },
  { t: 4.4, x: 9, z: 7 },
  { t: 8, x: 11, z: 3.8 },
  { t: 16, x: 11, z: 3.8 },
  { t: 18, x: 9, z: 7 },
  { t: 20, x: 9, z: 7, hidden: true },
]
// actors perform on the apron/threshold, then ENTER through the open door (t≈16)
const ACTOR_A: Key[] = [
  { t: 0, x: 8, z: 5, hidden: true },
  { t: 6, x: 8, z: 5, hidden: true },
  { t: 6.3, x: 8.5, z: 5 },
  { t: 9, x: 10.3, z: 1.3 },
  { t: 15, x: 10.3, z: 1.3 },
  { t: 15.6, x: 11.6, z: 0.5 },
  { t: 16.2, x: 12, z: 0 }, // doorway (entry) — only while door open
  { t: 16.5, x: 12, z: 0, hidden: true },
]
const ACTOR_B: Key[] = [
  { t: 0, x: 9, z: 6.5, hidden: true },
  { t: 6.5, x: 9, z: 6.5, hidden: true },
  { t: 6.8, x: 9.2, z: 6.5 },
  { t: 9.4, x: 11.8, z: 2.4 },
  { t: 15, x: 11.8, z: 2.4 },
  { t: 15.6, x: 11.7, z: 0.9 },
  { t: 16.3, x: 12, z: 0.5 }, // doorway (entry)
  { t: 16.6, x: 12, z: 0.5, hidden: true },
]
const SLATE: Key[] = [
  { t: 0, x: 9.9, z: 1.2, hidden: true },
  { t: 10, x: 9.9, z: 1.2, hidden: true },
  { t: 10.3, x: 9.9, z: 2.4 },
  { t: 12, x: 9.9, z: 1.8 }, // clap
  { t: 13, x: 9.6, z: 3.0 },
  { t: 13.6, x: 9.6, z: 3.0, hidden: true },
]
// approacher: walks to the door threshold, WAITS while the door is closed (never
// passes through), then reroutes back onto the apron once the door opens.
const APPROACHER: Key[] = [
  { t: 0, x: 8, z: 13, hidden: true },
  { t: 0.3, x: 8, z: 13 },
  { t: 2.5, x: 11.2, z: 0.4 }, // arrives at the closed-door threshold
  { t: 8, x: 11.2, z: 0.4 }, // waits at the closed door (does NOT enter)
  { t: 9.5, x: 8.5, z: 4.2 }, // reroutes onto the apron
  { t: 14, x: 8.5, z: 4.2 },
  { t: 18, x: 8, z: 13 },
  { t: 22, x: 8, z: 13, hidden: true },
]

/** Stage doors are visibly open only during the take window. */
export function doorOpen(t: number): boolean {
  return t >= 8.5 && t < 17
}

export function sampleVignette(t: number): VignetteFrame {
  const flash = t >= 12 && t < 12.45 ? 1 - (t - 12) / 0.45 : 0
  const recording = t >= 11 && t < 16.5
  const phase: VignetteFrame['phase'] =
    t < 1 ? 'idle' : t < 6 ? 'arrival' : t < 9 ? 'gather' : t < 12 ? 'set' : t < 16 ? 'take' : 'wrap'
  return {
    van: sample(VAN, t),
    director: sample(DIRECTOR, t),
    actorA: sample(ACTOR_A, t),
    actorB: sample(ACTOR_B, t),
    slate: sample(SLATE, t),
    approacher: sample(APPROACHER, t),
    recording,
    doorOpen: doorOpen(t),
    flash,
    phase,
  }
}
