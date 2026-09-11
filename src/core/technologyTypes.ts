/** P13A: campaign-owned facts. P09 owns every player physical work record. */
export type TechnologyId = 'synchronized-sound'
export type ResearchStatus = 'active' | 'paused' | 'cancelled' | 'completed'
export type ResearchProject = {
  id: string
  studioId: string
  technologyId: TechnologyId
  laboratoryFacilityId: string
  scientistId: string
  status: ResearchStatus
  budgetPerWeek: number
  verifiedWork: number
  expenditure: number
  startedWeek: number | null
  completedWeek: number | null
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
export type StudioTechnology = {
  version: 1
  recordingStartedWeek: number
  projects: ResearchProject[]
  access: TechnologyAccess[]
  adoptions: TechnologyAdoption[]
  productions: ProductionTechnology[]
}
export type TechnologyAction =
  | { kind: 'installAcousticInstruments'; laboratoryFacilityId: string }
  | { kind: 'recruitScientist'; laboratoryFacilityId: string }
  | { kind: 'assignResearchScientist'; laboratoryFacilityId: string; scientistId: string }
  | { kind: 'beginResearch'; projectId: string; budgetPerWeek: number }
  | { kind: 'setResearchBudget'; projectId: string; budgetPerWeek: number }
  | { kind: 'pauseResearch'; projectId: string }
  | { kind: 'cancelResearch'; projectId: string }
  | { kind: 'resumeResearch'; projectId: string }
  | { kind: 'waitForTechnology'; technologyId: TechnologyId }
  | { kind: 'purchaseTechnology'; technologyId: TechnologyId }
  | { kind: 'adoptSynchronizedSound'; stageFacilityId: string; postFacilityId: string }
  | { kind: 'setProductionTechnology'; productionId: string; method: ProductionTechnology['method']; adoptionId: string | null }
