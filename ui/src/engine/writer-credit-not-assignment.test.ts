// ── P04A.2 — a Writer CREDIT is not an assignment (React/web adapter) ─────────
//
// Owner ruling (2026-08-28) splits three concepts that used to be one set:
//
//   A. SCREENPLAY / FILM CREDIT — permanent, by exact stable id, survives every
//      phase. NEVER an availability blocker and NEVER a world-presence claim.
//   B. ACTIVE WRITING ASSIGNMENT — a writer is operationally busy ONLY while
//      actually drafting or rewriting.
//   C. PRODUCTION ASSIGNMENT — director, the three cast slots and craft. The
//      Writer is not a seat in the company.
//
// So "credited writer of picture A, while drafting screenplay B" is INTENDED.
// That state was unreachable before P04A.2, so the adapter had never had to
// handle it; it mishandled it four ways at once. These specs pin the whole state
// end to end through the adapter — the exact four claims the lane was opened for.

import { describe, expect, it } from 'vitest'
import {
  activeWritingAssignmentIds,
  activeProductionCompanyTalentIds,
  applyActions,
  busyTalentIds,
  creditedWriterIds,
  tick,
} from '../../../src/core/index.ts'
import {
  commissionScriptAction,
  managedProductionCompanyProjection,
  studioLotSnapshot,
  studioPool,
  talentAssignmentContext,
  talentByRole,
  talentEligibility,
} from './adapter.ts'
import type { CreativeRole, GameState } from './adapter.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import { lotPersonWorkContext } from '../lot/snapshot/personWork.ts'

const SHAPE = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
const RANGES = {
  intimacy: [-0.4, 0.4],
  tonalWeight: [-0.4, 0.4],
  kineticEnergy: [-0.4, 0.4],
} as const

function managedScriptStudio(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
}

function commission(state: GameState, conceptId: string, writerId: string): GameState {
  const concept = state.concepts.find((candidate) => candidate.id === conceptId)!
  const result = commissionScriptAction(state, {
    conceptId,
    writerId,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [...RANGES.intimacy] as [number, number],
        tonalWeight: [...RANGES.tonalWeight] as [number, number],
        kineticEnergy: [...RANGES.kineticEnergy] as [number, number],
      },
    },
  })
  if (!result.ok) throw new Error(`setup: commission failed — ${result.error}`)
  return result.next
}

/**
 * The exact state the Owner ruling legalises: writer W is the permanent credited
 * Writer of an active production, AND is right now drafting a different
 * screenplay. Built only through public adapter/engine actions — nothing here
 * fabricates state.
 */
function creditedWriterDraftingAnother(seed: string) {
  const founded = managedScriptStudio(seed)
  const writerId = foundedRosterIds(founded, 'writer')[0]!
  const ids = (role: CreativeRole) => foundedRosterIds(founded, role)
  const pictureConcept = founded.concepts[0]!

  // Screenplay one: commissioned from W, drafted, accepted, then greenlit — so W
  // is the picture's permanent credited Writer.
  let state = commission(founded, pictureConcept.id, writerId)
  const screenplayOne = state.scriptDevelopment.projects.at(-1)!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: screenplayOne }])
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: {
        projectId: screenplayOne,
        directorId: ids('director')[0]!,
        craftIds: [ids('craft')[0]!],
        cast: { lead: ids('actor')[0]!, antagonist: ids('actor')[1]!, support: ids('actor')[2]! },
        budget: { negative: pictureConcept.baseNegativeCost, marketing: 400_000 },
      },
    },
  ])
  const production = state.studio.activeProductions[0]!
  const pictureTitle = state.concepts.find(
    (concept) => concept.id === production.conceptId,
  )!.title

  // Screenplay two: the SAME writer is commissioned onto the next screenplay while
  // the picture is in production. Before P04A.2 the adapter refused this with
  // "Already working on <picture>".
  const nextConcept = state.concepts.find(
    (concept) => concept.id !== production.conceptId,
  )!
  state = commission(state, nextConcept.id, writerId)

  const draftingProject = state.scriptDevelopment.projects.find(
    (project) => project.writerId === writerId && project.status === 'drafting',
  )!
  return {
    state,
    writerId,
    production,
    pictureTitle,
    draftingLabel: `Drafting ${nextConcept.title}`,
    screenplayId: draftingProject.id,
  }
}

describe('P04A.2 — the credited writer of an active picture, drafting the next screenplay', () => {
  it('reaches the state at all — the credit and the writing assignment are separate facts', () => {
    const { state, writerId, production } = creditedWriterDraftingAnother('p04a2-adapter-reachable')

    expect(production.writerId).toBe(writerId)
    expect(creditedWriterIds(state).has(writerId)).toBe(true)
    expect(activeWritingAssignmentIds(state).has(writerId)).toBe(true)
    // C: the Writer is not a seat in the production company.
    expect(activeProductionCompanyTalentIds(state).has(writerId)).toBe(false)
  })

  it('(a) resolves to ONE assignment — never "ambiguous"', () => {
    const { state, writerId, draftingLabel, screenplayId } =
      creditedWriterDraftingAnother('p04a2-adapter-not-ambiguous')

    expect(talentAssignmentContext(state, writerId)).toEqual({
      kind: 'assigned',
      assignment: { kind: 'script', assignmentId: screenplayId, label: draftingLabel },
    })
  })

  it('(b) is not counted as engaged, and is not refused as unavailable', () => {
    const { state, writerId, production, pictureTitle } =
      creditedWriterDraftingAnother('p04a2-adapter-engaged')

    // The writer IS busy — but because of the drafting, and the label says so.
    const visible = talentByRole(state, 'writer').find((talent) => talent.id === writerId)!
    expect(visible.available).toBe(false)
    expect(visible.assignmentKind).toBe('script')
    expect(visible.engagedIn).not.toBe(pictureTitle)

    // The adapter's engaged set is exactly the core's busy set — a writer credit
    // appears in neither.
    const busy = busyTalentIds(state)
    const engagedIds = new Set(
      state.talent.filter((talent) => !studioVisible(state, talent.id)?.available).map((t) => t.id),
    )
    expect([...engagedIds].sort()).toEqual([...busy].sort())
    expect(busy.has(production.directorId)).toBe(true)

    // …and once the drafting ends, the surviving credit makes them available again.
    const released: GameState = {
      ...state,
      scriptDevelopment: {
        ...state.scriptDevelopment,
        projects: state.scriptDevelopment.projects.map((project) =>
          project.status === 'drafting'
            ? { ...project, status: 'review' as const, dueWeek: null }
            : project,
        ),
      },
    }
    expect(released.studio.activeProductions[0]!.writerId).toBe(writerId)
    const freed = talentByRole(released, 'writer').find((talent) => talent.id === writerId)!
    expect(freed.available).toBe(true)
    expect(freed.engagedIn).toBeNull()
    expect(talentEligibility(freed, 'writer', []).eligible).toBe(true)
    // The surviving CREDIT still names the picture for identity-sensitive
    // presentation — it is a credit, not an availability claim, and `available`
    // above is the availability authority. WORK OUTRANKS CREDIT: with no current
    // work left, the credit is what is left to say.
    expect(talentAssignmentContext(released, writerId)).toEqual({
      kind: 'assigned',
      assignment: {
        kind: 'production',
        assignmentId: production.id,
        label: pictureTitle,
      },
    })
  })

  it('(c) does not collapse the Lot production-company projection', () => {
    const { state, writerId, production } =
      creditedWriterDraftingAnother('p04a2-adapter-lot-company')
    const snapshot = studioLotSnapshot(state)

    const projection = managedProductionCompanyProjection(
      state,
      snapshot.productionOperations ?? [],
    )
    expect(projection).not.toBeNull()
    const members = projection!.membersByProductionId.get(production.id)!
    // Arity and role order are on the wire and are unchanged.
    expect(members.map((member) => member.productionRole)).toEqual([
      'writer',
      'director',
      'lead',
      'antagonist',
      'support',
      'craft',
    ])
    // The writer row is proved by exact stable id, not by a name or a label.
    expect(members[0]!.talentId).toBe(writerId)
    expect(members[0]!.talentId).toBe(production.writerId)
    // And the published snapshot still carries the complete six-person company.
    expect(snapshot.productionOperations?.[0]?.companyMembers).toHaveLength(6)
    for (const member of members) {
      expect(lotPersonWorkContext(snapshot, member.talentId).kind).toBe('managed-production')
    }
  })

  it('(d) is located by the screenplay they are drafting, not by the picture they are credited on', () => {
    const { state, writerId, pictureTitle, draftingLabel, screenplayId } =
      creditedWriterDraftingAnother('p04a2-adapter-current-work')

    const assignment = talentAssignmentContext(state, writerId)
    expect(assignment.kind).toBe('assigned')
    if (assignment.kind !== 'assigned') return
    expect(assignment.assignment.kind).toBe('script')
    expect(assignment.assignment.assignmentId).toBe(screenplayId)
    expect(assignment.assignment.label).toBe(draftingLabel)
    expect(assignment.assignment.label).not.toBe(pictureTitle)

    const visible = talentByRole(state, 'writer').find((talent) => talent.id === writerId)!
    expect(visible.engagedIn).toBe(draftingLabel)

    // The seat holders are still located by the picture — this narrowing is the
    // WRITER path only.
    const production = state.studio.activeProductions[0]!
    for (const seatId of [
      production.directorId,
      production.cast.lead,
      production.cast.antagonist,
      production.cast.support,
      ...production.craftIds,
    ]) {
      expect(talentAssignmentContext(state, seatId)).toEqual({
        kind: 'assigned',
        assignment: { kind: 'production', assignmentId: production.id, label: pictureTitle },
      })
    }
  })

  it('does not mutate the state any of these surfaces read', () => {
    const { state } = creditedWriterDraftingAnother('p04a2-adapter-pure')
    const before = JSON.stringify(state)
    const snapshot = studioLotSnapshot(state)
    managedProductionCompanyProjection(state, snapshot.productionOperations ?? [])
    talentByRole(state, 'writer')
    studioPool(state, 'writer')
    expect(JSON.stringify(state)).toBe(before)
  })
})

function studioVisible(state: GameState, talentId: string) {
  for (const role of ['writer', 'director', 'actor', 'craft'] as const) {
    const found = talentByRole(state, role).find((talent) => talent.id === talentId)
    if (found !== undefined) return found
  }
  return undefined
}
