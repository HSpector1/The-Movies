/** P13A/P13B: campaign-owned facts. P09 owns every player physical work record. */
export type TechnologyId = 'synchronized-sound'
export type ResearchStatus = 'active' | 'paused' | 'cancelled' | 'completed'

/** One named occupancy of a Laboratory seat. History is retained; a release closes the row, never deletes it. */
export type ResearchSeat = {
  talentId: string
  laboratoryFacilityId: string
  assignedWeek: number
  releasedWeek: number | null
}
/** One worked research week [week, week+1): the seats that earned it, the dollars charged, the work earned in 1/20,000 units. */
export type ResearchWeekReceipt = {
  week: number
  seatTalentIds: string[]
  spend: number
  units: number
}
/** Immutable P13A single-Scientist prefix, proved by the frozen V20 validator before governed migration. */
export type ResearchLegacyPrefix = {
  scientistId: string
  throughWeek: number
  verifiedWork: number
  expenditure: number
}
export type ResearchProject = {
  id: string
  studioId: string
  technologyId: TechnologyId
  laboratoryFacilityId: string
  status: ResearchStatus
  budgetPerWeek: number
  verifiedWork: number
  expenditure: number
  startedWeek: number | null
  completedWeek: number | null
  seats: ResearchSeat[]
  weeks: ResearchWeekReceipt[]
  legacy: ResearchLegacyPrefix | null
}
export type TechnologyAccess = {
  studioId: string
  technologyId: TechnologyId
  route: 'research' | 'wait' | 'purchase'
  chosenWeek: number
  acquiredWeek: number | null
  accessCost: number
  researchProjectId: string | null
}
export type TechnologyAdoption = {
  id: string
  studioId: string
  technologyId: TechnologyId
  stageFacilityId: string
  postFacilityId: string
  route: 'research' | 'purchase'
  committedWeek: number
  operationalWeek: number | null
  equipmentCost: number
  installationCost: number
  physicalProjectIds: string[]
  prototypeProjectId: string | null
}
export type ProductionTechnology = {
  studioId: string
  productionId: string
  method: 'silent' | 'synchronized-dialogue'
  adoptionId: string | null
  lockedWeek: number | null
}
/** Technology root v2 (Save V21): named seats and per-week receipts. */
export type StudioTechnology = {
  version: 2
  recordingStartedWeek: number
  projects: ResearchProject[]
  access: TechnologyAccess[]
  adoptions: TechnologyAdoption[]
  productions: ProductionTechnology[]
}

/** Frozen P13A shape (technology root v1, Save V20). Validated exactly as delivered; never written by the live engine. */
export type ResearchProjectV1 = Omit<ResearchProject, 'seats' | 'weeks' | 'legacy'> & { scientistId: string }
export type StudioTechnologyV1 = Omit<StudioTechnology, 'version' | 'projects'> & { version: 1; projects: ResearchProjectV1[] }

export type TechnologyAction =
  | { kind: 'installAcousticInstruments'; laboratoryFacilityId: string }
  | { kind: 'recruitScientist'; laboratoryFacilityId: string; scientistId?: string }
  | { kind: 'assignResearchScientist'; laboratoryFacilityId: string; scientistId: string }
  | { kind: 'releaseResearchSeat'; projectId: string; scientistId: string }
  | { kind: 'beginResearch'; projectId: string; budgetPerWeek: number }
  | { kind: 'setResearchBudget'; projectId: string; budgetPerWeek: number }
  | { kind: 'pauseResearch'; projectId: string }
  | { kind: 'cancelResearch'; projectId: string }
  | { kind: 'resumeResearch'; projectId: string }
  | { kind: 'waitForTechnology'; technologyId: TechnologyId }
  | { kind: 'purchaseTechnology'; technologyId: TechnologyId }
  | { kind: 'adoptSynchronizedSound'; stageFacilityId: string; postFacilityId: string }
  | { kind: 'setProductionTechnology'; productionId: string; method: ProductionTechnology['method']; adoptionId: string | null }
