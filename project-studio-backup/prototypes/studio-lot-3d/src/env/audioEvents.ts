// ── Presentation audio-event hooks (NO audio system — hooks only) ─────────────
// M3 does not build audio (per scope). This declares the clean, renderer-emitted
// presentation events a future audio layer would subscribe to, and a no-op emitter
// so wiring points are explicit. The visual scene must pass recognition tests with
// NO audio. Doc: docs/M3-AUDIO-EVENT-HOOKS.md.

export type AudioEvent =
  | 'gate-ambience'
  | 'studio-ambience'
  | 'vehicle-arrival'
  | 'stage-door-move'
  | 'crew-gather'
  | 'slate'
  | 'recording-start'
  | 'performance'
  | 'wrap'
  | 'selection'
  | 'camera-transition-complete'

/** Fire-point for a presentation audio event. No-op today; a future audio layer can
 *  replace/subscribe. Deterministic callers only (no RNG). */
export function emitAudioEvent(_event: AudioEvent, _detail?: Record<string, number | string>): void {
  // intentionally empty — audio is out of M3 scope
}
