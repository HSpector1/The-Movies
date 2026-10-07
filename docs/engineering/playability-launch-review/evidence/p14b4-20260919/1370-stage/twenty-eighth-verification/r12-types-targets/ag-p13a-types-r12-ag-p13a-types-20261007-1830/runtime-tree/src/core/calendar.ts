/** R05 calendar law. Absolute weeks remain the simulation clock. */
export const CAMPAIGN_CALENDAR_POLICY = 'campaign-calendar-1920-52/v1' as const
export const RIVAL_ARRIVAL_WEEKS = [0, 0, 0, 0, 520, 988, 1560, 1872, 2548] as const

export type CampaignDate = {
  policy: typeof CAMPAIGN_CALENDAR_POLICY
  absoluteWeek: number
  year: number
  weekOfYear: number
  label: string
}

export function campaignDate(absoluteWeek: number): CampaignDate {
  if (!Number.isSafeInteger(absoluteWeek) || absoluteWeek < 0) {
    throw new Error('Calendar requires a nonnegative safe integer campaign week')
  }
  const year = 1920 + Math.floor(absoluteWeek / 52)
  const weekOfYear = 1 + absoluteWeek % 52
  return { policy: CAMPAIGN_CALENDAR_POLICY, absoluteWeek, year, weekOfYear,
    label: `${year} · Week ${weekOfYear}` }
}

/** An authored past is additive: never a negative legacy game tick. */
export type HistoricalDate = { kind: 'beforeCampaign'; year: number }

export function historicalDate(year: number): HistoricalDate {
  if (!Number.isSafeInteger(year) || year < 1800 || year >= 1920) {
    throw new Error('Authored historical year must precede the 1920 campaign')
  }
  return { kind: 'beforeCampaign', year }
}
