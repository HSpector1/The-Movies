// Artifact-facing Week-208 roster-wall record union.
//
// This module deliberately owns only type composition. Keeping the union here
// lets schema, continuation, player-policy, fixture, artifact, and summary code
// share one complete record surface without introducing a runtime import cycle.

import type {
  RosterWallBoundaryRecord,
  RosterWallPairRecord,
  RosterWallRenewalIntentRecord,
  RosterWallWeeklyRecord,
} from './continuation.js'
import type { RosterWallMechanicsFixtureRow } from './fixtures.js'
import type {
  RosterWallPlayerPolicyBoundaryRecord,
  RosterWallPlayerPolicyEntryRecord,
  RosterWallPlayerPolicyRenewalIntentRecord,
  RosterWallPlayerPolicyWeeklyRecord,
} from './player-policy.js'
import type {
  RosterWallEntryRecord,
  RosterWallWindowShadowRecord,
} from './schema.js'

export type RosterWallMaximumTermEvidenceRecord =
  | RosterWallEntryRecord
  | RosterWallWindowShadowRecord
  | RosterWallWeeklyRecord
  | RosterWallRenewalIntentRecord
  | RosterWallBoundaryRecord
  | RosterWallPairRecord

export type RosterWallPlayerPolicyEvidenceRecord =
  | RosterWallPlayerPolicyEntryRecord
  | RosterWallPlayerPolicyWeeklyRecord
  | RosterWallPlayerPolicyRenewalIntentRecord
  | RosterWallPlayerPolicyBoundaryRecord

export type RosterWallArtifactRecord =
  | RosterWallMaximumTermEvidenceRecord
  | RosterWallPlayerPolicyEvidenceRecord
  | RosterWallMechanicsFixtureRow

export type RosterWallContinuationEvidenceRecord =
  | RosterWallWeeklyRecord
  | RosterWallRenewalIntentRecord
  | RosterWallBoundaryRecord
  | RosterWallPairRecord
