// ── Gate D1: feature-flag behaviour ──────────────────────────────────────────
// The studioLotOverview flag is DEFAULT OFF and only turns on via the env var or the
// localStorage QA override. localStorage is cleared before each ui test (setup.ts),
// so "off by default" is the fresh-session state.
import { describe, expect, it } from 'vitest'
import {
  operationHollywoodEnabled,
  OPERATION_HOLLYWOOD_LS_KEY,
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

describe('Operation Hollywood feature flag', () => {
  it('is OFF by default and toggles with its own runtime override', () => {
    expect(operationHollywoodEnabled()).toBe(false)
    setOperationHollywoodOverride(true)
    expect(localStorage.getItem(OPERATION_HOLLYWOOD_LS_KEY)).toBe('1')
    expect(operationHollywoodEnabled()).toBe(true)
    setOperationHollywoodOverride(false)
    expect(localStorage.getItem(OPERATION_HOLLYWOOD_LS_KEY)).toBeNull()
    expect(operationHollywoodEnabled()).toBe(false)
  })

  it('is independent of the Studio Lot overview gate', () => {
    expect(OPERATION_HOLLYWOOD_LS_KEY).not.toBe(STUDIO_LOT_OVERVIEW_LS_KEY)

    setStudioLotOverviewOverride(true)
    expect(studioLotOverviewEnabled()).toBe(true)
    expect(operationHollywoodEnabled()).toBe(false)

    setOperationHollywoodOverride(true)
    setStudioLotOverviewOverride(false)
    expect(studioLotOverviewEnabled()).toBe(false)
    expect(operationHollywoodEnabled()).toBe(true)
  })
})

describe('studioLotOverview feature flag', () => {
  it('is OFF by default (fresh session, no override)', () => {
    expect(studioLotOverviewEnabled()).toBe(false)
  })

  it('turns ON with the localStorage override and OFF again when cleared', () => {
    setStudioLotOverviewOverride(true)
    expect(localStorage.getItem(STUDIO_LOT_OVERVIEW_LS_KEY)).toBe('1')
    expect(studioLotOverviewEnabled()).toBe(true)
    setStudioLotOverviewOverride(false)
    expect(localStorage.getItem(STUDIO_LOT_OVERVIEW_LS_KEY)).toBeNull()
    expect(studioLotOverviewEnabled()).toBe(false)
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
