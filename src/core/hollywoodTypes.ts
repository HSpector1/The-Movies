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
export type RivalMoneyKind = 'capacity' | 'signing' | 'payroll' | 'overhead' | 'facilityOpex'
  | 'development' | 'production' | 'marketing' | 'studioRevenue'
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
  reason: 'entry' | 'renewal' | 'replacement' | 'player-contract'
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
      contractId: string; reason: 'entry' | 'renewal' | 'replacement' | 'expiry' | 'player-contract' }
  | { kind: 'filmAnnounced'; productionId: string; conceptId: string }
  | { kind: 'filmReleased'; productionId: string; conceptId: string; before: Standing; after: Standing }
  | { kind: 'filmSettled'; productionId: string }
)
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
