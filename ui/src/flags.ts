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

type ViteEnv = { VITE_STUDIO_LOT_OVERVIEW?: string }

function envFlag(): boolean {
  const env = (import.meta as unknown as { env?: ViteEnv }).env
  const v = env?.VITE_STUDIO_LOT_OVERVIEW
  return v === '1' || v === 'true'
}

function overrideFlag(): boolean {
  try {
    return localStorage.getItem(STUDIO_LOT_OVERVIEW_LS_KEY) === '1'
  } catch {
    return false // storage unavailable (private mode / sandbox) — treat as off
  }
}

/** Is the Studio Lot overview enabled this session? Default OFF. */
export function studioLotOverviewEnabled(): boolean {
  return envFlag() || overrideFlag()
}

/** Dev/test helper: flip the runtime override. Reload to apply. */
export function setStudioLotOverviewOverride(on: boolean): void {
  try {
    if (on) localStorage.setItem(STUDIO_LOT_OVERVIEW_LS_KEY, '1')
    else localStorage.removeItem(STUDIO_LOT_OVERVIEW_LS_KEY)
  } catch {
    /* storage unavailable — no-op */
  }
}
