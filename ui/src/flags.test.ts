// ── Gate D1: feature-flag behaviour ──────────────────────────────────────────
// Studio Lot overview and Operation Hollywood are adopted default-ON player gates.
// Explicit `0` / `false` remains rollback, while proof/review gates stay default OFF.
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  operationHollywoodEnabled,
  OPERATION_HOLLYWOOD_LS_KEY,
  resolveAdoptedPlayerGate,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
  studioLotOverviewEnabled,
  STUDIO_LOT_OVERVIEW_LS_KEY,
  studioLotIdentityEnabled,
  setStudioLotIdentityRollback,
  STUDIO_LOT_IDENTITY_PLAYER_LS_KEY,
  STUDIO_LOT_IDENTITY_LS_KEY,
  studioLotSoundstagesEnabled,
  setStudioLotSoundstagesRollback,
  STUDIO_LOT_SOUNDSTAGES_LS_KEY,
  studioLotSoundstageProofEnabled,
  setStudioLotSoundstageProofOverride,
  STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY,
} from './flags.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Operation Hollywood feature flag', () => {
  it('is ON by default and writes explicit enable/rollback values', () => {
    expect(operationHollywoodEnabled()).toBe(true)
    setOperationHollywoodOverride(true)
    expect(localStorage.getItem(OPERATION_HOLLYWOOD_LS_KEY)).toBe('1')
    expect(operationHollywoodEnabled()).toBe(true)
    setOperationHollywoodOverride(false)
    expect(localStorage.getItem(OPERATION_HOLLYWOOD_LS_KEY)).toBe('0')
    expect(operationHollywoodEnabled()).toBe(false)
    clearOperationHollywoodOverride()
    expect(localStorage.getItem(OPERATION_HOLLYWOOD_LS_KEY)).toBeNull()
    expect(operationHollywoodEnabled()).toBe(true)
  })

  it('is independent of the Studio Lot overview gate', () => {
    expect(OPERATION_HOLLYWOOD_LS_KEY).not.toBe(STUDIO_LOT_OVERVIEW_LS_KEY)

    setStudioLotOverviewOverride(false)
    expect(studioLotOverviewEnabled()).toBe(false)
    expect(operationHollywoodEnabled()).toBe(true)

    setOperationHollywoodOverride(false)
    clearStudioLotOverviewOverride()
    expect(studioLotOverviewEnabled()).toBe(true)
    expect(operationHollywoodEnabled()).toBe(false)
  })

  it('lets any explicit rollback source win over a positive source', () => {
    expect(resolveAdoptedPlayerGate('false', '1')).toBe(false)
    expect(resolveAdoptedPlayerGate('true', '0')).toBe(false)
    expect(resolveAdoptedPlayerGate('0', 'true')).toBe(false)
    expect(resolveAdoptedPlayerGate('1', 'false')).toBe(false)
  })
})

describe('studioLotOverview feature flag', () => {
  it('is ON by default (fresh session, no override)', () => {
    expect(studioLotOverviewEnabled()).toBe(true)
  })

  it('writes explicit enable/rollback values and clears back to adopted default', () => {
    setStudioLotOverviewOverride(true)
    expect(localStorage.getItem(STUDIO_LOT_OVERVIEW_LS_KEY)).toBe('1')
    expect(studioLotOverviewEnabled()).toBe(true)
    setStudioLotOverviewOverride(false)
    expect(localStorage.getItem(STUDIO_LOT_OVERVIEW_LS_KEY)).toBe('0')
    expect(studioLotOverviewEnabled()).toBe(false)
    clearStudioLotOverviewOverride()
    expect(localStorage.getItem(STUDIO_LOT_OVERVIEW_LS_KEY)).toBeNull()
    expect(studioLotOverviewEnabled()).toBe(true)
  })

  it('accepts true/false literals and keeps absence on the adopted default', () => {
    localStorage.setItem(STUDIO_LOT_OVERVIEW_LS_KEY, 'true')
    expect(studioLotOverviewEnabled()).toBe(true)

    localStorage.setItem(STUDIO_LOT_OVERVIEW_LS_KEY, 'false')
    expect(studioLotOverviewEnabled()).toBe(false)

    expect(resolveAdoptedPlayerGate(undefined, undefined)).toBe(true)
    expect(resolveAdoptedPlayerGate('1', null)).toBe(true)
    expect(resolveAdoptedPlayerGate('true', undefined)).toBe(true)
  })

  it('keeps both adopted gates ON when storage is unavailable unless env rolls back', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('storage unavailable') },
      setItem: () => { throw new Error('storage unavailable') },
      removeItem: () => { throw new Error('storage unavailable') },
    })

    expect(studioLotOverviewEnabled()).toBe(true)
    expect(operationHollywoodEnabled()).toBe(true)

    expect(resolveAdoptedPlayerGate('false', undefined)).toBe(false)
  })
})

describe('studioLotIdentity — ordinary-player identity (content gate)', () => {
  it('is ON by default (fresh session, no rollback) — Concept A for players', () => {
    expect(studioLotIdentityEnabled()).toBe(true)
  })

  it('the explicit rollback forces baseline (key = 0) and clears back to ON', () => {
    setStudioLotIdentityRollback(true)
    expect(localStorage.getItem(STUDIO_LOT_IDENTITY_PLAYER_LS_KEY)).toBe('0')
    expect(studioLotIdentityEnabled()).toBe(false)
    setStudioLotIdentityRollback(false)
    expect(localStorage.getItem(STUDIO_LOT_IDENTITY_PLAYER_LS_KEY)).toBeNull()
    expect(studioLotIdentityEnabled()).toBe(true)
  })

  it('is a DIFFERENT flag from the development identity-proof review flag', () => {
    // The player content gate and the dev review-tooling gate must not share a key.
    expect(STUDIO_LOT_IDENTITY_PLAYER_LS_KEY).not.toBe(STUDIO_LOT_IDENTITY_LS_KEY)
    expect(STUDIO_LOT_IDENTITY_LS_KEY).toBe('project-studio.flags.studio-lot-identity-proof')
  })
})

// ── D1-B: the adopted soundstage content gate + the dev proof gate ───────────
// After the D1-B adoption ruling these have DIFFERENT polarities, and that difference is
// the governed behaviour: accepted stage art is ordinary player content, review tooling
// never is. (The stable stage assignment is a third state and is gated by NEITHER — that
// is asserted in d1b-soundstage-wiring.test.tsx, not here.)
describe('D1-B soundstage gates', () => {
  it('the CONTENT gate is ON by default — an ordinary player gets the accepted stages', () => {
    expect(studioLotSoundstagesEnabled()).toBe(true)
  })

  it('the explicit rollback forces the pre-D1-B shared stage (key = 0) and clears back to ON', () => {
    setStudioLotSoundstagesRollback(true)
    expect(localStorage.getItem(STUDIO_LOT_SOUNDSTAGES_LS_KEY)).toBe('0')
    expect(studioLotSoundstagesEnabled()).toBe(false)
    setStudioLotSoundstagesRollback(false)
    expect(localStorage.getItem(STUDIO_LOT_SOUNDSTAGES_LS_KEY)).toBeNull()
    expect(studioLotSoundstagesEnabled()).toBe(true)
  })

  it('the REVIEW/PROOF gate is OFF by default and toggles cleanly', () => {
    expect(studioLotSoundstageProofEnabled()).toBe(false)
    setStudioLotSoundstageProofOverride(true)
    expect(localStorage.getItem(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY)).toBe('1')
    expect(studioLotSoundstageProofEnabled()).toBe(true)
    setStudioLotSoundstageProofOverride(false)
    expect(studioLotSoundstageProofEnabled()).toBe(false)
  })

  it('content and review are INDEPENDENT gates, on different keys and opposite defaults', () => {
    expect(STUDIO_LOT_SOUNDSTAGES_LS_KEY).not.toBe(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY)
    // the shipped default pair: content ON, review chrome OFF
    expect(studioLotSoundstagesEnabled()).toBe(true)
    expect(studioLotSoundstageProofEnabled()).toBe(false)
    // rolling content back must not switch review tooling on
    setStudioLotSoundstagesRollback(true)
    expect(studioLotSoundstageProofEnabled()).toBe(false)
    setStudioLotSoundstagesRollback(false)
  })

  it('follows the established key namespace', () => {
    expect(STUDIO_LOT_SOUNDSTAGES_LS_KEY).toBe('project-studio.flags.studio-lot-soundstages')
    expect(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY).toBe(
      'project-studio.flags.studio-lot-soundstage-proof',
    )
  })
})
