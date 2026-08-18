// ── Cue vocabulary (PF1-M1) ──────────────────────────────────────────────────
//
// FAMILIES, not one-off files. A later campaign picks the family that matches what
// the studio just did; it does not reach for a filename. That is why the token type
// and the asset table are separate: the disk can be re-cut (temporary development
// audio is replaceable by policy) without a single call site changing.
//
// M1 ships the tokens and the assets. M2's cue grammar decides which authoritative
// receipt earns which family — this module deliberately states no such mapping.

/** The eight interaction/outcome families the product speaks in. */
export type SoundFamily =
  | 'select'
  | 'commit'
  | 'cancel'
  | 'refusal'
  | 'construction-started'
  | 'completion'
  | 'positive'
  | 'warning'

/** The three reserved stings: the moments that deserve more than a cue. */
export type StingToken = 'sting-release' | 'sting-greenlight' | 'sting-completion'

/** Everything `AudioService.playCue` accepts. */
export type CueSoundToken = SoundFamily | StingToken

/**
 * Token → committed file under `ui/public/audio/`.
 *
 * Every value here has a row in AUDIO-PROVENANCE.md, and the provenance gate fails
 * if a file and its row ever disagree.
 */
export const SOUND_ASSETS: Record<CueSoundToken, string> = {
  select: 'cue-select.m4a',
  commit: 'cue-commit.m4a',
  cancel: 'cue-cancel.m4a',
  refusal: 'cue-refusal.m4a',
  'construction-started': 'cue-construction-started.m4a',
  completion: 'cue-completion.m4a',
  positive: 'cue-positive.m4a',
  warning: 'cue-warning.m4a',
  'sting-release': 'cue-sting-release.m4a',
  'sting-greenlight': 'cue-sting-greenlight.m4a',
  'sting-completion': 'cue-sting-completion.m4a',
}
