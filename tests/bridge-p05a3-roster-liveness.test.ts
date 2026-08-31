// P05A.3 — the Owner's casting-roster deadlock, pinned on the real profile.
//
// The fixture is the canonical save from the Owner's durable checkpoint at the
// moment they hit the wall (week 8, revision 10): The Bitter Migration is
// Ready, three distinct actors are mandatory, and exactly TWO legal actors
// exist across all three acting pools. The core's scriptReadModel computes the
// exact shortage ("Actors (2 of 3 available)…" + the sign/wait/rotate remedy)
// — and the casting package read model DROPPED it, publishing
// knownGatesClear=true for a mathematically unstaffable package. These tests
// pin the un-dropped truth.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { castingProjection } from '../bridge/casting.ts'
import { authoritativeDigest } from '../bridge/session.ts'
import { importSave, type GameState } from '../src/core/index.ts'

const OWNER_SAVE_JSON = readFileSync(
  join(__dirname, 'fixtures', 'p05a3-owner-profile-rev10.save.json'),
  'utf8',
)
const OWNER_STATE_DIGEST = 'a3550efd3fe8f929'

function ownerState(): GameState {
  return importSave(OWNER_SAVE_JSON).state as GameState
}

describe('P05A.3 — the two-actor deadlock is a NAMED blocker, never a silent READY', () => {
  it('the fixture IS the deadlock state', () => {
    const state = ownerState()
    expect(authoritativeDigest(state).startsWith(OWNER_STATE_DIGEST)).toBe(true)
    const board = castingProjection(state).board
    const project = board?.projects.find((entry) => entry.projectId === 'script-0003')
    expect(project?.title).toBe('The Bitter Migration')
    // Exactly two distinct available actors across all three acting pools.
    const distinct = new Set(
      [
        ...(project?.leadCandidates ?? []),
        ...(project?.antagonistCandidates ?? []),
        ...(project?.supportCandidates ?? []),
      ]
        .filter((candidate) => candidate.available)
        .map((candidate) => candidate.talentId),
    )
    expect(distinct.size).toBe(2)
  })

  it('publishes the package-staffing blocker with the exact counts and the acquisition remedy', () => {
    const board = castingProjection(ownerState()).board
    const project = board?.projects.find((entry) => entry.projectId === 'script-0003')
    const readiness = project?.packageReadiness
    expect(readiness).toBeDefined()

    const staffing = readiness?.blockers.find((blocker) => blocker.code === 'package-staffing')
    expect(staffing, 'the shortage the core computes must reach the wire').toBeDefined()
    expect(staffing?.message).toContain('Actors (2 of 3 available')
    expect(staffing?.remedy).toContain('Sign suitable talent')

    // A package that cannot be staffed is NOT clear and does NOT queue.
    expect(readiness?.knownGatesClear).toBe(false)
    expect(readiness?.willQueue).toBe(false)
    expect(project?.attention).toBe('blocked')
  })
})
