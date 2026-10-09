import type { CreativeRole, Genre, Standing } from './types.js'

/** Fictional scenario authoring, not recovered original-game economics.
 * All balances are BEFORE once-only capacity acquisition and signing costs.
 * Historical box office, career counts and Standing are settled starting facts.
 * Live popularity is unavailable: policy uses genre affinity only. Action's
 * Adventure adaptation is explicit; Sci-Fi has no successor genre mapping. */
export const HOLLYWOOD_STARTING_MANIFEST = {
  version: 'living-hollywood-start/v1',
  studios: [
    { name: 'Bellwether Pictures', mark: 'BW', color: '#C99542', founded: 1901, capital: 32_000_000,
      standing: [58,46,61], anchors: ['comedy'], negativeScale: 1.0, marketingRatio: .18, reserveWeeks: 13,
      names: ['Iris Bell','Arthur Vale','Mabel Finch','Walter Reed','Clara Moss','Edwin Pike'],
      films: [['The Misdelivered Parcel',1914,'comedy',64,72,2_100_000,7_600_000],['Sunday at the Pier',1918,'comedy',70,76,2_850_000,10_100_000]] },
    { name: 'Rose Lantern Films', mark: 'RL', color: '#C46B75', founded: 1902, capital: 29_000_000,
      standing: [53,59,55], anchors: ['romance'], negativeScale: 1.12, marketingRatio: .16, reserveWeeks: 18,
      names: ['Ada Rowe','Cecil Arden','Evelyn Shore','Paul Mercer','Florence Clay','Hugh Marlow'],
      films: [['A Letter by Lamplight',1915,'romance',75,69,1_600_000,6_400_000],['The Summer Train',1919,'drama',72,73,2_350_000,8_700_000]] },
    { name: 'Night Orchard Productions', mark: 'NO', color: '#8C8EB7', founded: 1906, capital: 23_000_000,
      standing: [45,55,49], anchors: ['horror'], negativeScale: .94, marketingRatio: .14, reserveWeeks: 20,
      names: ['Vera North','Leon Ash','Nora Blythe','Felix Ward','Pearl Benton','Jasper Cole'],
      films: [['The House Beneath the Fog',1916,'horror',67,65,1_300_000,4_800_000],['The Last Candle',1919,'horror',73,70,1_850_000,6_900_000]] },
    { name: 'Silver Current Pictures', mark: 'SC', color: '#6FA5AA', founded: 1917, capital: 20_000_000,
      standing: [43,44,48], anchors: ['romance'], negativeScale: 1.04, marketingRatio: .20, reserveWeeks: 15,
      names: ['Olive Hart','Victor Dune','Sylvia Lane','Daniel Frost','Agnes Wren','Oscar Field'],
      films: [['The Harbour Promise',1917,'romance',61,67,1_100_000,4_200_000],['Between Two Stations',1919,'romance',68,74,1_750_000,6_600_000]] },
    { name: 'Marigold Motion Pictures', mark: 'MM', color: '#D6A747', capital: 24_000_000,
      anchors: ['romance'], negativeScale: 1.05, marketingRatio: .20, reserveWeeks: 15 },
    { name: 'Blackthorn Screenworks', mark: 'BS', color: '#937C9E', capital: 26_000_000,
      anchors: ['horror'], negativeScale: 1.10, marketingRatio: .18, reserveWeeks: 18 },
    { name: 'Trailhead Pictures', mark: 'TP', color: '#B88254', capital: 34_000_000,
      anchors: ['adventure'], negativeScale: 1.18, marketingRatio: .22, reserveWeeks: 13 },
    { name: 'Copper Kite Films', mark: 'CK', color: '#78A888', capital: 28_000_000,
      anchors: ['comedy','horror'], negativeScale: 1.02, marketingRatio: .19, reserveWeeks: 16 },
    { name: 'Bright Meridian Studios', mark: 'BM', color: '#6E9FC0', capital: 38_000_000,
      anchors: ['adventure','comedy'], negativeScale: 1.20, marketingRatio: .24, reserveWeeks: 12 },
  ] as readonly StartingStudio[],
} as const

export type StartingStudio = {
  name: string; mark: string; color: string; founded?: number; capital: number;
  standing?: [number,number,number]; anchors: Genre[]; negativeScale: number;
  marketingRatio: number; reserveWeeks: number; names?: string[];
  films?: [string,number,Genre,number,number,number,number][];
}
export const RIVAL_TEAM_ROLES: readonly CreativeRole[] = ['writer','director','actor','actor','actor','craft']
export const RIVAL_CREDIT_ROLES = ['writer','director','lead','antagonist','support','craft'] as const
export function startingStanding(row: StartingStudio, authored: boolean): Standing {
  const [audienceAwareness,industryPrestige,commercialConfidence] = authored && row.standing
    ? row.standing : [40,40,50]
  return { audienceAwareness,industryPrestige,commercialConfidence }
}
