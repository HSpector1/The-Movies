import { describe, expect, it } from 'vitest'
import {
  rosterWallCorpusDimensions,
  rosterWallSeedsForProfile,
} from '../src/harness/roster-wall/corpus.js'

describe('roster-wall integrated corpus matrix', () => {
  it('uses exactly one canonical smoke seed and all 25 complete seeds', () => {
    expect(rosterWallSeedsForProfile('smoke')).toEqual(['facilities-0001'])
    expect(rosterWallSeedsForProfile('complete')).toHaveLength(25)
    expect(rosterWallSeedsForProfile('complete')[24]).toBe('facilities-0025')
  })

  it('projects the frozen entry and arm dimensions', () => {
    expect(rosterWallCorpusDimensions('smoke')).toMatchObject({
      maximumTermEntries: 6,
      playerPolicyEntries: 3,
      continuationArms: 60,
    })
    expect(rosterWallCorpusDimensions('complete')).toMatchObject({
      maximumTermEntries: 150,
      playerPolicyEntries: 75,
      continuationArms: 1500,
    })
  })
})
