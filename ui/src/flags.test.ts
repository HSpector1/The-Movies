// ── Gate D1: feature-flag behaviour ──────────────────────────────────────────
// The studioLotOverview flag is DEFAULT OFF and only turns on via the env var or the
// localStorage QA override. localStorage is cleared before each ui test (setup.ts),
// so "off by default" is the fresh-session state.
import { describe, expect, it } from 'vitest'
import {
  setStudioLotOverviewOverride,
  studioLotOverviewEnabled,
  STUDIO_LOT_OVERVIEW_LS_KEY,
  studioLotIdentityEnabled,
  setStudioLotIdentityRollback,
  STUDIO_LOT_IDENTITY_PLAYER_LS_KEY,
  STUDIO_LOT_IDENTITY_LS_KEY,
  studioLotSoundstagesEnabled,
  setStudioLotSoundstagesOverride,
  STUDIO_LOT_SOUNDSTAGES_LS_KEY,
  studioLotSoundstageProofEnabled,
  setStudioLotSoundstageProofOverride,
  STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY,
} from './flags.ts'

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

// ── D1-B: the two soundstage-proof gates ─────────────────────────────────────
// Both are DEFAULT OFF from the first implementation commit: with the content gate off the
// lot is the pre-spike lot, and the review gate never becomes a player default.
describe('D1-B soundstage gates', () => {
  it('the CONTENT gate is OFF by default and toggles cleanly', () => {
    expect(studioLotSoundstagesEnabled()).toBe(false)
    setStudioLotSoundstagesOverride(true)
    expect(localStorage.getItem(STUDIO_LOT_SOUNDSTAGES_LS_KEY)).toBe('1')
    expect(studioLotSoundstagesEnabled()).toBe(true)
    setStudioLotSoundstagesOverride(false)
    expect(localStorage.getItem(STUDIO_LOT_SOUNDSTAGES_LS_KEY)).toBeNull()
    expect(studioLotSoundstagesEnabled()).toBe(false)
  })

  it('the REVIEW/PROOF gate is OFF by default and toggles cleanly', () => {
    expect(studioLotSoundstageProofEnabled()).toBe(false)
    setStudioLotSoundstageProofOverride(true)
    expect(localStorage.getItem(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY)).toBe('1')
    expect(studioLotSoundstageProofEnabled()).toBe(true)
    setStudioLotSoundstageProofOverride(false)
    expect(studioLotSoundstageProofEnabled()).toBe(false)
  })

  it('content and review are INDEPENDENT gates on different keys', () => {
    expect(STUDIO_LOT_SOUNDSTAGES_LS_KEY).not.toBe(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY)
    setStudioLotSoundstagesOverride(true)
    expect(studioLotSoundstagesEnabled()).toBe(true)
    expect(studioLotSoundstageProofEnabled()).toBe(false) // review stays off
    setStudioLotSoundstagesOverride(false)
  })

  it('follows the established key namespace', () => {
    expect(STUDIO_LOT_SOUNDSTAGES_LS_KEY).toBe('project-studio.flags.studio-lot-soundstages')
    expect(STUDIO_LOT_SOUNDSTAGE_PROOF_LS_KEY).toBe(
      'project-studio.flags.studio-lot-soundstage-proof',
    )
  })
})
