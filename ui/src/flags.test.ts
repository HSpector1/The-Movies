// ── Gate D1: feature-flag behaviour ──────────────────────────────────────────
// The studioLotOverview flag is DEFAULT OFF and only turns on via the env var or the
// localStorage QA override. localStorage is cleared before each ui test (setup.ts),
// so "off by default" is the fresh-session state.
import { describe, expect, it } from 'vitest'
import {
  setStudioLotOverviewOverride,
  studioLotOverviewEnabled,
  STUDIO_LOT_OVERVIEW_LS_KEY,
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
