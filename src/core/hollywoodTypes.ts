import type { CAMPAIGN_CALENDAR_POLICY, HistoricalDate } from './calendar.js'
import type { Contract, FilmConcept, FilmParticipantRole, FilmResult, Genre, Production,
  ScriptDevelopment, Standing, StudioOperations, StudioReleaseAuthority, TalentCareerEvent,
  TheatricalRun } from './types.js'

export type StudioIdentity = {
  studioId: string
  role: 'player' | 'rival'
  row: number
  name: string
  mark: string
  color: string
  founding: HistoricalDate | { kind: 'campaign'; week: number } | null
  eligibleWeek: number
  enteredWeek: number | null
  recordedFromWeek: number | null
}

export type HollywoodCredit = { talentId: string; role: FilmParticipantRole; name: string }
type FilmIdentity = {
  filmId: string
  studioId: string
  conceptId: string
  title: string
  genre: Genre
  credits: HollywoodCredit[]
}
export type AuthoredFilm = FilmIdentity & {
  provenance: 'authored-start/v1'
  released: HistoricalDate
  criticScore: number
  audienceScore: number
  openingGross: number
  totalGross: number
  settled: true
}
export type LiveIndustryFilm = FilmIdentity & {
  provenance: 'simulation/v1'
  scriptProjectId: string
  result: FilmResult
  directCommitment: number
  studioRevenueReceived: number
  settledWeek: number | null
  releaseCommitmentId: string
}
export type IndustryFilm = AuthoredFilm | LiveIndustryFilm
/**
 * P13B-S8 (Save V27): the four research kinds join the ten P13A/P13B kinds. Every
 * period carries all fourteen; a V26 period is lifted with the four at zero and a
 * V27 period whose four are all zero downgrades losslessly.
 */
export type RivalResearchMoneyKind = 'researchSpend' | 'researchCapacity' | 'technologyRestoration' | 'technologyRefund'
export type RivalMoneyKind = 'capacity' | 'signing' | 'payroll' | 'overhead' | 'facilityOpex'
  | 'development' | 'production' | 'marketing' | 'studioRevenue' | 'technologyAdoption'
  | RivalResearchMoneyKind
export type RivalFinancePeriod = {
  fromWeek: number
  throughWeek: number
  opening: number
  closing: number
  movements: Record<RivalMoneyKind, number>
}
export type RivalAccount = {
  openingBalance: number
  openingBasis: 'before-capacity-and-signing'
  cash: number
  periods: RivalFinancePeriod[]
}
export type IndustryEmployment = {
  contractId: string
  studioId: string
  terms: Contract
  endedWeek: number | null
  reason: 'entry' | 'renewal' | 'replacement' | 'player-contract' | 'existing-player-contract'
}
export type RivalProjectCosts = {
  scriptProjectId: string
  conceptId: string
  conceptOrdinal: number
  productionId: string | null
  development: number
  production: number
  marketing: number
  announcedWeek: number | null
}
export type RivalBusiness = {
  studioId: string
  entryKey: string
  account: RivalAccount
  standing: Standing
  operations: StudioOperations
  development: ScriptDevelopment
  productions: Production[]
  activeScriptOrdinals: number[]
  activeRunFilmOrdinals: number[]
  releaseAuthority: StudioReleaseAuthority
  runs: TheatricalRun[]
  projects: RivalProjectCosts[]
  nextDecisionWeek: number
  policy: { version: 1; affinities: Record<Genre, number>; negativeScale: number;
    marketingRatio: number; reserveWeeks: number }
}
export type IndustryReceipt = { eventId: string; week: number; studioId: string } & (
  | { kind: 'studioEntered'; entryKey: string; origin: 'fresh' | 'migration' | 'scheduled' }
  | { kind: 'employment'; talentId: string; fromStudioId: string | null; toStudioId: string | null;
      contractId: string; reason: 'entry' | 'renewal' | 'replacement' | 'expiry' | 'termination' | 'player-contract' | 'existing-player-contract' }
  | { kind: 'filmAnnounced'; productionId: string; conceptId: string }
  | { kind: 'filmReleased'; productionId: string; conceptId: string; before: Standing; after: Standing }
  | { kind: 'filmSettled'; productionId: string }
  | { kind: 'technologyAdopted'; adoptionId: string }
  // P13B-S8: rival-only emitters. A rival owns no placement, so its Laboratory,
  // its instruments, its seats and its finished research are matters of record
  // here — "no rival authority without a receipt" is validated against these.
  | { kind: 'laboratoryCommitted'; planId: string; facilityId: string }
  | { kind: 'laboratoryOperational'; facilityId: string }
  | { kind: 'instrumentOperational'; facilityId: string; technologyId: string }
  | { kind: 'researchSeatAssigned'; projectId: string; talentId: string }
  | { kind: 'researchCompleted'; projectId: string }
)
/** The five V27 receipt kinds, as one roster the save boundary and the projection share. */
export const RIVAL_RESEARCH_RECEIPT_KINDS = ['laboratoryCommitted', 'laboratoryOperational',
  'instrumentOperational', 'researchSeatAssigned', 'researchCompleted'] as const
export type HollywoodChartSnapshot = { week: number; rows: { studioId: string; standing: Standing; output: number }[] }
export type HollywoodState = {
  version: 1
  calendarPolicy: typeof CAMPAIGN_CALENDAR_POLICY
  startingManifest: 'living-hollywood-start/v1'
  origin: 'fresh' | 'migration'
  originWeek: number
  worldId: string
  playerStudioId: string
  identities: StudioIdentity[]
  businesses: RivalBusiness[]
  employment: IndustryEmployment[]
  activeEmploymentOrdinals: number[]
  concepts: FilmConcept[]
  films: IndustryFilm[]
  careerEvents: TalentCareerEvent[]
  receipts: IndustryReceipt[]
  nextReceipt: number
  chart: HollywoodChartSnapshot | null
  previousChart: HollywoodChartSnapshot | null
}
