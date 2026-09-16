/** P13A/P13B: campaign-owned facts. P09 owns every player physical work record. */
export type TechnologyId = 'synchronized-sound' | 'lighting-control-01'
export type ResearchStatus = 'active' | 'paused' | 'cancelled' | 'completed'

/** One named occupancy of a Laboratory seat. History is retained; a release closes the row, never deletes it. */
export type ResearchSeat = {
  talentId: string
  laboratoryFacilityId: string
  assignedWeek: number
  releasedWeek: number | null
}
/** P13B-S2: one Laboratory's part of a worked project week — its own seats, its share of the funding, its raw output in 1/20,000 units. */
export type ResearchLabContribution = {
  laboratoryFacilityId: string
  seatTalentIds: string[]
  spend: number
  rawUnits: number
}
/**
 * One worked research week [week, week+1): the seats that earned it, the dollars
 * charged, and the project credit in 1/160,000 units (P13B-S2's rebased base, so
 * the cooperation rule `a + 0.625·b` is exact in integers). `labs` carries the
 * per-Laboratory breakdown; it is `null` only on a receipt written before
 * cooperation began whose seats spanned two Laboratories, where no split is known.
 */
export type ResearchWeekReceipt = {
  week: number
  seatTalentIds: string[]
  spend: number
  units: number
  labs: ResearchLabContribution[] | null
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
/**
 * Technology root v3 (Save V22): seats across two Laboratories, per-Laboratory
 * receipt rows and the 1/160,000 project-credit base. `cooperationFromWeek` is the
 * first week whose receipts are written under the cooperation law — receipts before
 * it are the single-pool rows of an older writer and are read under the older law.
 */
export type StudioTechnology = {
  version: 3
  recordingStartedWeek: number
  cooperationFromWeek: number
  projects: ResearchProject[]
  access: TechnologyAccess[]
  adoptions: TechnologyAdoption[]
  productions: ProductionTechnology[]
}

/** Frozen P13B-S1 shape (technology root v2, Save V21): single-pool receipts over 1/20,000, no per-Laboratory rows. */
export type ResearchWeekReceiptV2 = Omit<ResearchWeekReceipt, 'labs'>
export type ResearchProjectV2 = Omit<ResearchProject, 'weeks'> & { weeks: ResearchWeekReceiptV2[] }
export type StudioTechnologyV2 = Omit<StudioTechnology, 'version' | 'cooperationFromWeek' | 'projects'> & { version: 2; projects: ResearchProjectV2[] }

/** Frozen P13A shape (technology root v1, Save V20). Validated exactly as delivered; never written by the live engine. */
export type ResearchProjectV1 = Omit<ResearchProject, 'seats' | 'weeks' | 'legacy'> & { scientistId: string }
export type StudioTechnologyV1 = Omit<StudioTechnologyV2, 'version' | 'projects'> & { version: 1; projects: ResearchProjectV1[] }

export type TechnologyAction =
  | { kind: 'installAcousticInstruments'; laboratoryFacilityId: string }
  | { kind: 'recruitScientist'; laboratoryFacilityId: string; scientistId?: string }
  /** `technologyId` omitted = 'synchronized-sound': the P13A single-brief intent stays lawful and means sound. */
  | { kind: 'assignResearchScientist'; laboratoryFacilityId: string; scientistId: string; technologyId?: TechnologyId }
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
