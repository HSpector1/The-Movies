// Integrated Week-208 roster-wall corpus generator.
//
// ANALYSIS ONLY. The generator streams one immutable entry and its evidence at
// a time into the governed artifact writer. It never retains the complete corpus
// in memory and never changes production behavior.

import {
  ROSTER_WALL_ESTATE_POLICY_IDS,
  ROSTER_WALL_OPERATING_POLICY_IDS,
  runRosterWallNeutralEntryCampaign,
} from './campaign.js'
import type {
  RosterWallEntryObserverNeutrality,
  RosterWallEstatePolicyId,
  RosterWallOperatingPolicyId,
} from './campaign.js'
import {
  RosterWallArtifactWriter,
  rosterWallAcceptedArtifactMatrix,
} from './artifacts.js'
import type {
  RosterWallAcceptedArtifactManifest,
  RosterWallAcceptedArtifactVerification,
  RosterWallAcceptedEntryIndexRow,
  RosterWallArtifactProfile,
} from './artifacts.js'
import {
  rosterWallContinuationRows,
  runRosterWallContinuationCorpus,
} from './continuation.js'
import type {
  RosterWallContinuationCorpus,
} from './continuation.js'
import { runRosterWallMechanicsFixtures } from './fixtures.js'
import {
  orderedRosterWallPlayerPolicyEvidenceRows,
  runRosterWallPlayerPolicy,
  serializeRosterWallPlayerPolicyEvidence,
} from './player-policy.js'
import type {
  RosterWallPlayerPolicySerializedEvidence,
} from './player-policy.js'
import {
  acceptedRosterWallSourceProvenance,
  discoverRosterWallRepoRoot,
} from './provenance.js'
import type { RosterWallSourceProvenance } from './provenance.js'
import type {
  RosterWallArtifactRecord,
  RosterWallContinuationEvidenceRecord,
  RosterWallPlayerPolicyEvidenceRecord,
} from './records.js'
import {
  ROSTER_WALL_CANONICAL_SEEDS,
  ROSTER_WALL_EXPERIMENT_ID,
  ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
  ROSTER_WALL_SEED_SET_ID,
  makeRosterWallEntryRecord,
  makeRosterWallShadowRecords,
} from './schema.js'
import {
  RosterWallSummaryAccumulator,
  renderRosterWallSummaryMarkdown,
} from './summary.js'
import type { RosterWallSummaryGovernance } from './summary.js'

export const ROSTER_WALL_ARTIFACT_PROFILES = ['smoke', 'complete'] as const

export type GenerateRosterWallCorpusInput = {
  repoRoot?: string
  runName: string
  profile: RosterWallArtifactProfile
}

export type RosterWallGenerationAcceptanceChecks = {
  entryObserverNeutrality: {
    checkedEntries: number
    byteIdenticalEntries: number
    stateHashIdenticalEntries: number
    rngStateIdenticalEntries: number
    failures: 0
  }
  continuationObserverNeutrality: {
    checkedArms: number
    byteIdenticalArms: number
    stateHashIdenticalArms: number
    rngStateIdenticalArms: number
    failures: 0
  }
  playerPolicyObserverNeutrality: {
    checkedRuns: number
    byteIdenticalRuns: number
    stateHashIdenticalRuns: number
    rngStateIdenticalRuns: number
    failures: 0
  }
}

export function rosterWallSeedsForProfile(
  profile: RosterWallArtifactProfile,
): readonly string[] {
  return profile === 'complete'
    ? [...ROSTER_WALL_CANONICAL_SEEDS]
    : [ROSTER_WALL_CANONICAL_SEEDS[0]!]
}

/** Canonical arm and exact-vacant-pair order supplied by the reviewed runner. */
export function orderedRosterWallContinuationRecords(
  corpus: RosterWallContinuationCorpus,
): RosterWallContinuationEvidenceRecord[] {
  return rosterWallContinuationRows(corpus) as RosterWallContinuationEvidenceRecord[]
}

/** Entry is written separately; remaining player rows are chronological. */
export function orderedRosterWallPlayerRecords(
  evidence: RosterWallPlayerPolicySerializedEvidence,
): RosterWallPlayerPolicyEvidenceRecord[] {
  return orderedRosterWallPlayerPolicyEvidenceRows(evidence)
}

function governance(
  profile: RosterWallArtifactProfile,
  source: RosterWallSourceProvenance,
): RosterWallSummaryGovernance {
  return {
    schemaVersion: ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
    experimentId: ROSTER_WALL_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_SEED_SET_ID,
    profile,
    completeEvidence: profile === 'complete',
    source,
    matrix: rosterWallAcceptedArtifactMatrix(profile),
  }
}

function entryIndexRow(
  row: {
    entryId: string | null
    mode: 'current' | 'player-policy'
    seed: string | null
    operatingPolicyId: string | null
    estatePolicyId: string | null
    foundingTermPolicyId: string | null
    initialSaveHash: string | null
    entrySaveHash: string | null
    entryStateHash: string | null
  },
): RosterWallAcceptedEntryIndexRow {
  for (const [label, value] of Object.entries({
    entryId: row.entryId,
    seed: row.seed,
    operatingPolicyId: row.operatingPolicyId,
    estatePolicyId: row.estatePolicyId,
    foundingTermPolicyId: row.foundingTermPolicyId,
    initialSaveHash: row.initialSaveHash,
    entrySaveHash: row.entrySaveHash,
    entryStateHash: row.entryStateHash,
  })) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`roster-wall corpus: entry index lacks ${label}`)
    }
  }
  return {
    entryId: row.entryId!,
    mode: row.mode,
    seed: row.seed!,
    operatingPolicyId: row.operatingPolicyId!,
    estatePolicyId: row.estatePolicyId!,
    foundingTermPolicyId: row.foundingTermPolicyId!,
    initialSaveHash: row.initialSaveHash!,
    entrySaveHash: row.entrySaveHash!,
    entryStateHash: row.entryStateHash!,
  }
}

function initialChecks(): RosterWallGenerationAcceptanceChecks {
  return {
    entryObserverNeutrality: {
      checkedEntries: 0,
      byteIdenticalEntries: 0,
      stateHashIdenticalEntries: 0,
      rngStateIdenticalEntries: 0,
      failures: 0,
    },
    continuationObserverNeutrality: {
      checkedArms: 0,
      byteIdenticalArms: 0,
      stateHashIdenticalArms: 0,
      rngStateIdenticalArms: 0,
      failures: 0,
    },
    playerPolicyObserverNeutrality: {
      checkedRuns: 0,
      byteIdenticalRuns: 0,
      stateHashIdenticalRuns: 0,
      rngStateIdenticalRuns: 0,
      failures: 0,
    },
  }
}

function addEntryNeutrality(
  checks: RosterWallGenerationAcceptanceChecks,
  neutrality: RosterWallEntryObserverNeutrality,
): void {
  checks.entryObserverNeutrality.checkedEntries++
  checks.entryObserverNeutrality.byteIdenticalEntries += Number(neutrality.byteIdentical)
  checks.entryObserverNeutrality.stateHashIdenticalEntries += Number(
    neutrality.stateHashIdentical,
  )
  checks.entryObserverNeutrality.rngStateIdenticalEntries += Number(
    neutrality.rngStateIdentical,
  )
}

function emitRow(
  writer: RosterWallArtifactWriter,
  accumulator: RosterWallSummaryAccumulator,
  row: RosterWallArtifactRecord,
): void {
  writer.writeRow(row)
  accumulator.observe(row)
}

/**
 * Generate one governed smoke or complete corpus. Provenance is captured before
 * simulation and `finalizeAccepted` proves the exact same authority afterward.
 */
export function generateRosterWallCorpus(
  input: GenerateRosterWallCorpusInput,
): RosterWallAcceptedArtifactVerification {
  const repoRoot = input.repoRoot ?? discoverRosterWallRepoRoot()
  const source = acceptedRosterWallSourceProvenance(repoRoot)
  const summaryGovernance = governance(input.profile, source)
  const accumulator = new RosterWallSummaryAccumulator(summaryGovernance)
  const writer = new RosterWallArtifactWriter(repoRoot, input.runName)
  const entryIndex: RosterWallAcceptedEntryIndexRow[] = []
  const checks = initialChecks()
  const seeds = rosterWallSeedsForProfile(input.profile)

  for (const seed of seeds) {
    for (const operatingPolicyId of ROSTER_WALL_OPERATING_POLICY_IDS) {
      for (const estatePolicyId of ROSTER_WALL_ESTATE_POLICY_IDS) {
        const neutral = runRosterWallNeutralEntryCampaign({
          seed,
          operatingPolicyId,
          estatePolicyId,
        })
        addEntryNeutrality(checks, neutral.observerNeutrality)
        const harvest = neutral.harvest
        const entry = makeRosterWallEntryRecord(harvest, source, 'all-208', 'current')
        writer.writeEntry({
          entryId: entry.entryId!,
          row: entry,
          saveJson: harvest.entrySaveBytes,
        })
        accumulator.observe(entry)
        entryIndex.push(entryIndexRow(entry))
        for (const shadow of makeRosterWallShadowRecords(harvest, source, 'all-208')) {
          emitRow(writer, accumulator, shadow)
        }
        const continuation = runRosterWallContinuationCorpus({
          harvest,
          source,
          includeLongHorizon: true,
        })
        checks.continuationObserverNeutrality.checkedArms +=
          continuation.observerNeutrality.checkedArms
        checks.continuationObserverNeutrality.byteIdenticalArms +=
          continuation.observerNeutrality.byteIdenticalArms
        checks.continuationObserverNeutrality.stateHashIdenticalArms +=
          continuation.observerNeutrality.stateHashIdenticalArms
        checks.continuationObserverNeutrality.rngStateIdenticalArms +=
          continuation.observerNeutrality.rngStateIdenticalArms
        for (const row of orderedRosterWallContinuationRecords(continuation)) {
          emitRow(writer, accumulator, row)
        }
      }
    }
  }

  for (const seed of seeds) {
    for (const operatingPolicyId of ROSTER_WALL_OPERATING_POLICY_IDS) {
      const result = runRosterWallPlayerPolicy({ seed, operatingPolicyId })
      checks.playerPolicyObserverNeutrality.checkedRuns++
      checks.playerPolicyObserverNeutrality.byteIdenticalRuns += Number(
        result.observerNeutrality.entryByteIdentical &&
          result.observerNeutrality.finalByteIdentical,
      )
      checks.playerPolicyObserverNeutrality.stateHashIdenticalRuns += Number(
        result.observerNeutrality.entryStateHashIdentical &&
          result.observerNeutrality.finalStateHashIdentical,
      )
      checks.playerPolicyObserverNeutrality.rngStateIdenticalRuns += Number(
        result.observerNeutrality.finalRngStateIdentical,
      )
      const evidence = serializeRosterWallPlayerPolicyEvidence(result, source)
      writer.writeEntry({
        entryId: evidence.entry.entryId!,
        row: evidence.entry,
        saveJson: result.entry.saveBytes,
      })
      accumulator.observe(evidence.entry)
      entryIndex.push(entryIndexRow(evidence.entry))
      for (const row of orderedRosterWallPlayerRecords(evidence)) {
        emitRow(writer, accumulator, row)
      }
    }
  }

  for (const fixture of runRosterWallMechanicsFixtures(source)) {
    emitRow(writer, accumulator, fixture)
  }

  const summary = accumulator.finish()
  const manifest: RosterWallAcceptedArtifactManifest = {
    schemaVersion: ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
    experimentId: ROSTER_WALL_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_SEED_SET_ID,
    profile: input.profile,
    completeEvidence: input.profile === 'complete',
    source,
    matrix: summaryGovernance.matrix,
    counts: structuredClone(summary.counts),
    entryIndex,
    acceptanceChecks: checks,
    invariantFailures: 0,
  }
  return writer.finalizeAccepted({
    manifest,
    summary,
    summaryMarkdown: renderRosterWallSummaryMarkdown(summary),
    source,
  })
}

export type RosterWallCorpusDimensions = {
  profile: RosterWallArtifactProfile
  seeds: readonly string[]
  operatingPolicyIds: readonly RosterWallOperatingPolicyId[]
  estatePolicyIds: readonly RosterWallEstatePolicyId[]
  maximumTermEntries: number
  playerPolicyEntries: number
  continuationArms: number
}

/** Lightweight exact-matrix projection used by CLI/tests before simulation. */
export function rosterWallCorpusDimensions(
  profile: RosterWallArtifactProfile,
): RosterWallCorpusDimensions {
  const seeds = rosterWallSeedsForProfile(profile)
  return {
    profile,
    seeds,
    operatingPolicyIds: ROSTER_WALL_OPERATING_POLICY_IDS,
    estatePolicyIds: ROSTER_WALL_ESTATE_POLICY_IDS,
    maximumTermEntries:
      seeds.length * ROSTER_WALL_OPERATING_POLICY_IDS.length * ROSTER_WALL_ESTATE_POLICY_IDS.length,
    playerPolicyEntries: seeds.length * ROSTER_WALL_OPERATING_POLICY_IDS.length,
    continuationArms:
      seeds.length *
      ROSTER_WALL_OPERATING_POLICY_IDS.length *
      ROSTER_WALL_ESTATE_POLICY_IDS.length *
      10,
  }
}
