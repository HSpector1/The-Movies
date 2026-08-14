// ── Feature flags ──────────────────────────────────────────────────────────────
//
// The Studio Lot overview and Operation Hollywood are adopted ordinary-player content:
// both default ON, while an explicit `0` / `false` remains a rollback path. These are
// NOT a user-facing settings system. The overview rollback keeps the screen-first
// compatibility path (no Lot entry or lazy renderer fetch); the Hollywood rollback
// keeps the Lot but selects its legacy/procedural presentation.
//
// Override it either way:
//   • Build/dev time:  VITE_STUDIO_LOT_OVERVIEW=0 npm run dev   (or in .env)
//   • Runtime (QA/tests, no rebuild):  in the browser console —
//       localStorage.setItem('project-studio.flags.studio-lot-overview', '0'); location.reload()
//     or call setStudioLotOverviewOverride(false) and reload.

/** localStorage key for the runtime QA override. Exposed for tests/Playwright. */
export const STUDIO_LOT_OVERVIEW_LS_KEY = 'project-studio.flags.studio-lot-overview'

/** localStorage key for the D1-A studio-identity visual proof (development review, default OFF). */
export const STUDIO_LOT_IDENTITY_LS_KEY = 'project-studio.flags.studio-lot-identity-proof'

/** localStorage key for the ordinary-player identity ROLLBACK. Player identity is default ON;
 *  set this key to '0' to force the untouched D1 baseline for a player. */
export const STUDIO_LOT_IDENTITY_PLAYER_LS_KEY = 'project-studio.flags.studio-lot-identity'

/** localStorage key for the D1-B distinct-soundstage CONTENT gate. Content is default ON; set
 *  this key to '0' to force the pre-D1-B shared stage texture. */
export const STUDIO_LOT_SOUNDSTAGES_LS_KEY = 'project-studio.flags.studio-lot-soundstages'

/** localStorage key for the D1-B soundstage REVIEW/PROOF tooling (default OFF). */
export const STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY = 'project-studio.flags.studio-lot-soundstage-proof'

/** localStorage key for the AUTHORED Stage B ROLLBACK. Authored art is default ON;
 *  set this key to '0' to force the procedural Stage B. */
export const STUDIO_LOT_AUTHORED_STAGE_LS_KEY = 'project-studio.flags.studio-lot-authored-stage'

/** localStorage key for the AUTHORED Stage A ROLLBACK. Authored art is default ON;
 *  set this key to '0' to force the procedural Stage A. Mirrors the Stage B key above. */
export const STUDIO_LOT_AUTHORED_STAGE_A_LS_KEY = 'project-studio.flags.studio-lot-authored-stage-a'

/** Adopted Phase II hybrid-district presentation gate. Default ON; explicit `0` rolls back. */
export const OPERATION_HOLLYWOOD_LS_KEY = 'project-studio.flags.operation-hollywood'

type ViteEnv = {
  VITE_STUDIO_LOT_OVERVIEW?: string
  VITE_STUDIO_LOT_IDENTITY_PROOF?: string
  VITE_STUDIO_LOT_IDENTITY?: string
  VITE_STUDIO_LOT_SOUNDSTAGES?: string
  VITE_STUDIO_LOT_SOUNDSTAGE_PROOF?: string
  VITE_STUDIO_LOT_AUTHORED_STAGE?: string
  VITE_STUDIO_LOT_AUTHORED_STAGE_A?: string
  VITE_OPERATION_HOLLYWOOD?: string
}

function envValue(pick: (e: ViteEnv) => string | undefined): boolean {
  const env = (import.meta as unknown as { env?: ViteEnv }).env
  const v = env ? pick(env) : undefined
  return v === '1' || v === 'true'
}

function lsFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false // storage unavailable (private mode / sandbox) — treat as off
  }
}

function setLsFlag(key: string, on: boolean): void {
  try {
    if (on) localStorage.setItem(key, '1')
    else localStorage.removeItem(key)
  } catch {
    /* storage unavailable — no-op */
  }
}

type AdoptedGateValue = 'rollback' | 'enabled' | 'default'

function adoptedGateValue(value: string | null | undefined): AdoptedGateValue {
  const normalized = value?.trim().toLowerCase()
  if (normalized === '0' || normalized === 'false') return 'rollback'
  if (normalized === '1' || normalized === 'true') return 'enabled'
  return 'default'
}

/** Pure precedence law shared by the Vite-env and localStorage integration below. */
export function resolveAdoptedPlayerGate(
  envValue: string | null | undefined,
  storageValue: string | null | undefined,
): boolean {
  const envSetting = adoptedGateValue(envValue)
  const storageSetting = adoptedGateValue(storageValue)
  if (envSetting === 'rollback' || storageSetting === 'rollback') return false
  return true
}

/**
 * Resolve an adopted default-ON player gate from its two independent override sources.
 * Any explicit rollback wins, including when the other source explicitly enables the gate.
 * Missing, unreadable, or unrecognised storage stays on the adopted default.
 */
function adoptedPlayerGate(
  pick: (e: ViteEnv) => string | undefined,
  localStorageKey: string,
): boolean {
  const env = (import.meta as unknown as { env?: ViteEnv }).env
  const selectedEnvValue = env ? pick(env) : undefined
  let storageValue: string | null | undefined
  try {
    storageValue = localStorage.getItem(localStorageKey)
  } catch {
    // Storage unavailable (private mode / sandbox): retain the adopted default unless env rolls back.
  }

  return resolveAdoptedPlayerGate(selectedEnvValue, storageValue)
}

function setAdoptedGateOverride(key: string, on: boolean): void {
  try {
    localStorage.setItem(key, on ? '1' : '0')
  } catch {
    /* storage unavailable — no-op */
  }
}

function clearLsFlag(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* storage unavailable — no-op */
  }
}

/** Is the adopted Studio Lot overview enabled this session? Default ON. */
export function studioLotOverviewEnabled(): boolean {
  return adoptedPlayerGate((e) => e.VITE_STUDIO_LOT_OVERVIEW, STUDIO_LOT_OVERVIEW_LS_KEY)
}

/** Is adopted Operation Hollywood enabled? Default ON and independent of the overview gate. */
export function operationHollywoodEnabled(): boolean {
  return adoptedPlayerGate((e) => e.VITE_OPERATION_HOLLYWOOD, OPERATION_HOLLYWOOD_LS_KEY)
}

export function setOperationHollywoodOverride(on: boolean): void {
  setAdoptedGateOverride(OPERATION_HOLLYWOOD_LS_KEY, on)
}

/** Remove the QA override and return Operation Hollywood to its adopted default. */
export function clearOperationHollywoodOverride(): void {
  clearLsFlag(OPERATION_HOLLYWOOD_LS_KEY)
}

/** Dev/test helper: write an explicit runtime enable (`1`) or rollback (`0`). Reload to apply. */
export function setStudioLotOverviewOverride(on: boolean): void {
  setAdoptedGateOverride(STUDIO_LOT_OVERVIEW_LS_KEY, on)
}

/** Remove the QA override and return the Studio Lot overview to its adopted default. */
export function clearStudioLotOverviewOverride(): void {
  clearLsFlag(STUDIO_LOT_OVERVIEW_LS_KEY)
}

/**
 * D1-A: is the studio-identity visual proof enabled? Default OFF — independent of the
 * overview flag (a reviewer can run the plain D1 lot without identity). When off, the
 * scene renders the untouched baseline; the identity modules are still imported (they are
 * inert data + draw helpers) but no identity object is ever shown.
 */
export function studioLotIdentityProofEnabled(): boolean {
  return envValue((e) => e.VITE_STUDIO_LOT_IDENTITY_PROOF) || lsFlag(STUDIO_LOT_IDENTITY_LS_KEY)
}

/** Dev/test helper: flip the D1-A identity-proof (development review) override. Reload to apply. */
export function setStudioLotIdentityOverride(on: boolean): void {
  setLsFlag(STUDIO_LOT_IDENTITY_LS_KEY, on)
}

/**
 * Ordinary-player identity — is the approved Concept A studio identity shown to normal players?
 * DEFAULT ON, and INDEPENDENT of the development-review flag above: this is the production
 * *content* gate and it never renders any review chrome (mode selector / performance panel /
 * Hide / restore pill). An explicit rollback forces the untouched D1 baseline for a player —
 * env `VITE_STUDIO_LOT_IDENTITY=0` (build/dev or `.env`) or the localStorage key
 * `project-studio.flags.studio-lot-identity` set to '0'. The development-review flag is NOT the
 * source of ordinary-player enablement.
 */
export function studioLotIdentityEnabled(): boolean {
  // Explicit rollback wins (env first, then the localStorage override); otherwise identity is ON.
  const env = (import.meta as unknown as { env?: ViteEnv }).env
  const rollbackEnv = env ? env.VITE_STUDIO_LOT_IDENTITY : undefined
  if (rollbackEnv === '0' || rollbackEnv === 'false') return false
  try {
    if (localStorage.getItem(STUDIO_LOT_IDENTITY_PLAYER_LS_KEY) === '0') return false
  } catch {
    /* storage unavailable (private mode / sandbox) — stay on the default (identity ON) */
  }
  return true
}

/**
 * D1-B CONTENT gate: are the soundstages composed as two distinct buildings? DEFAULT ON.
 *
 * The accepted soundstage presentation defaults on: the distinct Stage A / Stage B buildings
 * are ordinary player content and need no env var or localStorage key. It follows the same
 * shape as the D1-A player identity gate: an explicit ROLLBACK forces the pre-D1-B shared
 * stage texture — env `VITE_STUDIO_LOT_SOUNDSTAGES=0`, or the localStorage key set to '0'.
 * That rollback is deliberately retained as an A/B regression-comparison path.
 *
 * NOTE: this gate controls VISUAL CONTENT ONLY. The stable Stage A/B assignment is a
 * correctness fix and is NOT gated by it — presentation correctness must not depend on
 * whether the newer stage art is enabled. See StudioLotScreen.
 */
export function studioLotSoundstagesEnabled(): boolean {
  // Explicit rollback wins (env first, then the localStorage override); otherwise ON.
  const env = (import.meta as unknown as { env?: ViteEnv }).env
  const rollbackEnv = env ? env.VITE_STUDIO_LOT_SOUNDSTAGES : undefined
  if (rollbackEnv === '0' || rollbackEnv === 'false') return false
  try {
    if (localStorage.getItem(STUDIO_LOT_SOUNDSTAGES_LS_KEY) === '0') return false
  } catch {
    /* storage unavailable (private mode / sandbox) — stay on the default (soundstages ON) */
  }
  return true
}

/** Dev/test helper: force the pre-D1-B shared-stage rollback ON or OFF. Reload to apply. */
export function setStudioLotSoundstagesRollback(rollback: boolean): void {
  try {
    if (rollback) localStorage.setItem(STUDIO_LOT_SOUNDSTAGES_LS_KEY, '0')
    else localStorage.removeItem(STUDIO_LOT_SOUNDSTAGES_LS_KEY)
  } catch {
    /* storage unavailable — no-op */
  }
}

/**
 * D1-B REVIEW/PROOF gate: is the soundstage review tooling available? DEFAULT OFF.
 * Review tooling is never player-default; it only ever adds capture affordances (closer
 * camera framing, signage masking) for the evidence harness. It renders no game content.
 */
export function studioLotSoundstageProofEnabled(): boolean {
  return envValue((e) => e.VITE_STUDIO_LOT_SOUNDSTAGE_PROOF) || lsFlag(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY)
}

/** Dev/test helper: flip the D1-B soundstage review/proof override. Reload to apply. */
export function setStudioLotSoundstageProofOverride(on: boolean): void {
  setLsFlag(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY, on)
}

/**
 * AUTHORED STAGE B content gate: does Stage B render from the offline-authored PNG pair
 * instead of the procedural bake? DEFAULT ON.
 *
 * Adopted into production after the Authored Soundstage Pipeline Proof. It follows the same
 * shape as the D1-B soundstage gate above: the authored art is ordinary player content and
 * needs no env var or localStorage key, while an explicit ROLLBACK forces the procedural
 * Stage B — env `VITE_STUDIO_LOT_AUTHORED_STAGE=0`, or the localStorage key set to '0'.
 * That rollback is deliberately retained as an A/B regression-comparison path.
 *
 * The procedural bake is NOT removed and is not merely a rollback: it is also the failure
 * fallback. The scene uses the authored textures only if both actually arrive, so a missing
 * or unreachable asset leaves the procedural Stage B in place and the lot can never end up
 * without a Stage B.
 */
export function studioLotAuthoredStageEnabled(): boolean {
  // Explicit rollback wins (env first, then the localStorage override); otherwise ON.
  const env = (import.meta as unknown as { env?: ViteEnv }).env
  const rollbackEnv = env ? env.VITE_STUDIO_LOT_AUTHORED_STAGE : undefined
  if (rollbackEnv === '0' || rollbackEnv === 'false') return false
  try {
    if (localStorage.getItem(STUDIO_LOT_AUTHORED_STAGE_LS_KEY) === '0') return false
  } catch {
    /* storage unavailable (private mode / sandbox) — stay on the default (authored ON) */
  }
  return true
}

/**
 * AUTHORED STAGE A content gate: does Stage A render from the authored "Stage Front"
 * RGBA pair instead of the procedural bake? **DEFAULT ON — this is adopted player art.**
 *
 * Identical polarity and shape to `studioLotAuthoredStageEnabled()` above, deliberately:
 * both authored buildings are now production content, so absence means ON and an explicit
 * '0' rolls back to the procedural build. (During the H2 proof this was the opposite —
 * a default-OFF `studio-lot-stage-a-h2` proof switch. The proof is accepted, so the flag
 * was replaced rather than re-polarised: a flag whose name says "proof enabled" while its
 * absence also loads the art is exactly the ambiguity this project does not keep.)
 */
export function studioLotAuthoredStageAEnabled(): boolean {
  // Explicit rollback wins (env first, then the localStorage override); otherwise ON.
  const env = (import.meta as unknown as { env?: ViteEnv }).env
  const rollbackEnv = env ? env.VITE_STUDIO_LOT_AUTHORED_STAGE_A : undefined
  if (rollbackEnv === '0' || rollbackEnv === 'false') return false
  try {
    if (localStorage.getItem(STUDIO_LOT_AUTHORED_STAGE_A_LS_KEY) === '0') return false
  } catch {
    /* storage unavailable (private mode / sandbox) — stay on the default (authored ON) */
  }
  return true
}

/** Dev/test helper: force the procedural Stage A rollback ON or OFF. Reload to apply. */
export function setStudioLotAuthoredStageARollback(rollback: boolean): void {
  try {
    if (rollback) localStorage.setItem(STUDIO_LOT_AUTHORED_STAGE_A_LS_KEY, '0')
    else localStorage.removeItem(STUDIO_LOT_AUTHORED_STAGE_A_LS_KEY)
  } catch {
    /* storage unavailable — no-op */
  }
}

/** Dev/test helper: force the procedural Stage B rollback ON or OFF. Reload to apply. */
export function setStudioLotAuthoredStageRollback(rollback: boolean): void {
  try {
    if (rollback) localStorage.setItem(STUDIO_LOT_AUTHORED_STAGE_LS_KEY, '0')
    else localStorage.removeItem(STUDIO_LOT_AUTHORED_STAGE_LS_KEY)
  } catch {
    /* storage unavailable — no-op */
  }
}

/** Dev/test helper: force the ordinary-player identity rollback ON (baseline) or OFF (Concept A).
 *  Reload to apply. */
export function setStudioLotIdentityRollback(rollback: boolean): void {
  try {
    if (rollback) localStorage.setItem(STUDIO_LOT_IDENTITY_PLAYER_LS_KEY, '0')
    else localStorage.removeItem(STUDIO_LOT_IDENTITY_PLAYER_LS_KEY)
  } catch {
    /* storage unavailable — no-op */
  }
}
