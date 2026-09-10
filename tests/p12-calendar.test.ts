import { describe, expect, it } from 'vitest'
import { campaignDate, historicalDate, RIVAL_ARRIVAL_WEEKS } from '../src/core/calendar.js'

describe('R05 single campaign calendar', () => {
  it('keeps absolute ticks and maps completed years at exact boundaries', () => {
    expect(campaignDate(0)).toMatchObject({ year: 1920, weekOfYear: 1, absoluteWeek: 0 })
    expect(campaignDate(51)).toMatchObject({ year: 1920, weekOfYear: 52 })
    expect(campaignDate(52)).toMatchObject({ year: 1921, weekOfYear: 1 })
    for (const [week, year] of [[520,1930],[988,1939],[1560,1950],[1872,1956],[2548,1969]]) {
      expect(campaignDate(week!)).toMatchObject({ year, weekOfYear: 1 })
      expect(campaignDate(week!-1)).toMatchObject({ year: year!-1, weekOfYear: 52 })
      expect(campaignDate(week!+1)).toMatchObject({ year, weekOfYear: 2 })
    }
    expect(RIVAL_ARRIVAL_WEEKS).toEqual([0,0,0,0,520,988,1560,1872,2548])
  })
  it('does not smuggle pre-start years into nonnegative week fields', () => {
    expect(historicalDate(1917)).toEqual({ kind: 'beforeCampaign', year: 1917 })
    for (const week of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => campaignDate(week)).toThrow()
    }
    expect(() => historicalDate(1920)).toThrow()
  })
})
