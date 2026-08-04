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

/** localStorage key for the D1-A studio-identity visual proof (default OFF). */
export const STUDIO_LOT_IDENTITY_LS_KEY = 'project-studio.flags.studio-lot-identity-proof'

type ViteEnv = { VITE_STUDIO_LOT_OVERVIEW?: string; VITE_STUDIO_LOT_IDENTITY_PROOF?: string }

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

/** Dev/test helper: flip the D1-A identity override. Reload to apply. */
export function setStudioLotIdentityOverride(on: boolean): void {
  setLsFlag(STUDIO_LOT_IDENTITY_LS_KEY, on)
}
