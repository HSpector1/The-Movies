import {enumeration,nullable,object,text} from './dsl.ts'
const nonEmptyText = () => text({minLength:1})
export const AVAILABLE_INTENT_KINDS = [
  'signFoundingContract',
  'foundStudio',
  'commissionScreenplay',
  'advanceWeek',
  'acceptScreenplay',
  'requestRewrite',
  'startAuditions',
  'acknowledgeAuditions',
  'greenlightPicture',
  'resolveProductionBlocker',
  'startConstruction',
  'commissionOriginalScreenplay',
  'signContract',
  // P06A W2: the ONE explicit release commitment. Its option ALWAYS carries a
  // non-empty productionId (enforced at resolution and at the exact-ID client
  // matcher; the shared option shape stays nullable for every other kind).
  'commitPictureToRelease',
  // P09 §18: the ONE construction commit, minted only by an accepted, legal
  // placement quote (digest-bound); commit revalidates against the live state.
  'placeFacility',
  // P09A W5: the ONE Set commission, minted only by an accepted, legal Set quote.
  'commissionSet',
  // P10-R1: the two material contract actions, minted only by an accepted, legal
  // contract quote (renewal in its window / early release); commit revalidates.
  'renewContract',
  'releaseTalent',
  'researchAction',
] as const

export const StudioBridgeIntentOption = object('StudioBridgeIntentOption', {
  intentId: nonEmptyText(),
  kind: enumeration(AVAILABLE_INTENT_KINDS),
  label: nonEmptyText(),
  detail: text(),
  projectId: nullable(text()),
  castingSessionId: nullable(text()),
  productionId: nullable(text()),
})

