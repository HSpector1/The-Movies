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
  // P13B-S3: the five physical-plan verbs (queue/reorder/cancel/review/set admission).
  // A plan is not research: a separate kind keeps the wire honest about what it moves.
  'physicalPlanAction',
  // P13B-S4: an IMMEDIATE P09 installation commit on an existing building (the Office
  // standard conversions). The Laboratory's `instruments-<lab>` row keeps `researchAction`
  // because its engine verb genuinely is a TechnologyAction; this one is not research.
  'installationAction',
  // P13B-S5: committing ONE technology adoption on one exact stage (and, where the
  // technology has a Post component, one exact Post). Every `adopt-<technologyId>-...`
  // row carries this kind, including the retained synchronized-sound pairing: an
  // adoption buys equipment and physical plant, which is neither research nor a plan.
  'adoptTechnology',
  // P13B-S5-R07: reviewing ONE setup recipe for ONE exact production before it
  // enters Shooting. Not research, not a plan and not an installation: it moves
  // that picture's own preparation schedule and nothing else.
  'productionSetupAction',
  // P13B-S6: cancelling ONE committed installation — an adoption's remaining physical
  // work, a running Office conversion, or a started plan's own placement. Its own kind:
  // a cancellation returns capital and can owe a restoration job, which is neither
  // research, nor a plan, nor an installation commit.
  'cancellationAction',
  // P14A.1: ONE proposal on an open market case (propose/revise/withdraw), minted only
  // by an accepted, legal market-proposal quote; commit revalidates. Not a contract action:
  // nothing is signed or charged this week — the case settles at its decision week.
  'marketProposalAction',
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

