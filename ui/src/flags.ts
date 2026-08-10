// ── Feature flags ──────────────────────────────────────────────────────────────
//
// One central, DEFAULT-OFF flag for the Gate D1 Studio Lot overview. This is NOT a
// user-facing settings system (addendum / directive Phase 5) — it is a development
// switch. When off, the application behaves exactly as before: no lot entry point,
// no Phaser fetched, no renderer mounted, no current navigation removed.
//
// Enable it either way:
//   • Build/dev time:  VITE_STUDIO_LOT_OVERVIEW=1 npm run dev   (or in .env)
//   • Runtime (QA/tests, no rebuild):  in the browser console —
//       localStorage.setItem('project-studio.flags.studio-lot-overview', '1'); location.reload()
//     or call setStudioLotOverviewOverride(true) and reload.

/** localStorage key for the runtime QA override. Exposed for tests/Playwright. */
export const STUDIO_LOT_OVERVIEW_LS_KEY = 'project-studio.flags.studio-lot-overview'

/** localStorage key for the D1-A studio-identity visual proof (development review, default OFF). */
export const STUDIO_LOT_IDENTITY_LS_KEY = 'project-studio.flags.studio-lot-identity-proof'

/** localStorage key for the ordinary-player identity ROLLBACK. Player identity is default ON;
 *  set this key to '0' to force the untouched D1 baseline for a player. */
export const STUDIO_LOT_IDENTITY_PLAYER_LS_KEY = 'project-studio.flags.studio-lot-identity'

/** localStorage key for the D1-B distinct-soundstage CONTENT gate (default OFF). */
export const STUDIO_LOT_SOUNDSTAGES_LS_KEY = 'project-studio.flags.studio-lot-soundstages'

/** localStorage key for the D1-B soundstage REVIEW/PROOF tooling (default OFF). */
export const STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY = 'project-studio.flags.studio-lot-soundstage-proof'

/** localStorage key for the AUTHORED-STAGE (offline render) experiment (default OFF). */
export const STUDIO_LOT_AUTHORED_STAGE_LS_KEY = 'project-studio.flags.studio-lot-authored-stage-proof'

type ViteEnv = {
  VITE_STUDIO_LOT_OVERVIEW?: string
  VITE_STUDIO_LOT_IDENTITY_PROOF?: string
  VITE_STUDIO_LOT_IDENTITY?: string
  VITE_STUDIO_LOT_SOUNDSTAGES?: string
  VITE_STUDIO_LOT_SOUNDSTAGE_PROOF?: string
  VITE_STUDIO_LOT_AUTHORED_STAGE_PROOF?: string
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

/** Is the Studio Lot overview enabled this session? Default OFF. */
export function studioLotOverviewEnabled(): boolean {
  return envValue((e) => e.VITE_STUDIO_LOT_OVERVIEW) || lsFlag(STUDIO_LOT_OVERVIEW_LS_KEY)
}

/** Dev/test helper: flip the runtime override. Reload to apply. */
export function setStudioLotOverviewOverride(on: boolean): void {
  setLsFlag(STUDIO_LOT_OVERVIEW_LS_KEY, on)
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
 * The Soundstage Composer Proof was adopted, so the distinct Stage A / Stage B presentation
 * is ordinary player content and needs no env var or localStorage key. It follows the same
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
 * AUTHORED-STAGE EXPERIMENT gate: is ONE soundstage drawn from a pre-rendered PNG instead
 * of its runtime-composed texture? DEFAULT OFF, developer only, explicit '1' opt-in.
 *
 * It mirrors the D1-B REVIEW/PROOF gate's mechanics exactly (env var checked first, then
 * the localStorage key, both '1'-means-on) rather than the adopted-content gate's '0'
 * rollback shape — this is an unadopted experiment, so OFF has to be the thing you get
 * without asking, and OFF is the shipped presentation byte for byte: with it off the lot
 * loads no asset at all and every texture is generated at runtime as before.
 *
 *   • Build/dev:  VITE_STUDIO_LOT_AUTHORED_STAGE_PROOF=1 npm run dev
 *   • Runtime:    localStorage.setItem('project-studio.flags.studio-lot-authored-stage-proof', '1')
 *
 * It is INDEPENDENT of the soundstage content gate: this swaps the art on one designated
 * stage whatever composed the texture underneath, and it changes no other stage.
 * See ui/src/lot/scene/authoredStage.ts.
 */
export function studioLotAuthoredStageProofEnabled(): boolean {
  return (
    envValue((e) => e.VITE_STUDIO_LOT_AUTHORED_STAGE_PROOF) ||
    lsFlag(STUDIO_LOT_AUTHORED_STAGE_LS_KEY)
  )
}

/** Dev/test helper: flip the authored-stage experiment override. Reload to apply. */
export function setStudioLotAuthoredStageProofOverride(on: boolean): void {
  setLsFlag(STUDIO_LOT_AUTHORED_STAGE_LS_KEY, on)
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
