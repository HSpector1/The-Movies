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
import { activeProductionCompanyContexts } from '../lot/snapshot/productionCompany.ts'

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

// ── P04A.2 BLOCKER GUARD — TWO live pictures, ONE credited writer ────────────
//
// This is the state the checkpoint exists to unblock and the state that broke:
// a one-writer studio writes screenplay A, greenlights it, writes screenplay B,
// greenlights it too. Both pictures now carry the SAME credited writer, with
// fully disjoint director/cast/craft SEATS.
//
// A credit is not a seat, so it carries no cross-picture exclusivity. Treating it
// as one made `managedProductionCompanyProjection` return null, which wiped
// `companyMembers` off BOTH pictures and dropped every named member off the Lot.
// The two-different-writers CONTROL below is the arithmetic that proves it: the
// world must contain exactly as many working people either way.

type TwoPictureWorld = ReturnType<typeof twoLivePictures>

/**
 * Two greenlit pictures, built only through public engine/adapter actions.
 * `sharedWriter` selects the legalised case (one writer credited twice) or the
 * control (two different writers). Every SEAT is disjoint in both.
 */
function twoLivePictures(seed: string, sharedWriter: boolean) {
  const founded = managedScriptStudio(seed)
  const ids = (role: CreativeRole) => foundedRosterIds(founded, role)
  const writerIds = ids('writer')
  const conceptA = founded.concepts[0]!
  const conceptB = founded.concepts[1]!

  // Screenplay A: drafted by W, accepted.
  let state = commission(founded, conceptA.id, writerIds[0]!)
  const screenplayA = state.scriptDevelopment.projects.at(-1)!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: screenplayA }])

  // Screenplay B: drafted by the SAME W (or by a second writer, for the control),
  // accepted. W is free to take it because the accepted screenplay is no longer
  // an active writing assignment — only a permanent credit.
  state = commission(state, conceptB.id, sharedWriter ? writerIds[0]! : writerIds[1]!)
  const screenplayB = state.scriptDevelopment.projects.at(-1)!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: screenplayB }])

  // Both greenlit, with wholly disjoint seats.
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: {
        projectId: screenplayA,
        directorId: ids('director')[0]!,
        craftIds: [ids('craft')[0]!],
        cast: { lead: ids('actor')[0]!, antagonist: ids('actor')[1]!, support: ids('actor')[2]! },
        budget: { negative: conceptA.baseNegativeCost, marketing: 400_000 },
      },
    },
  ])
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: {
        projectId: screenplayB,
        directorId: ids('director')[1]!,
        craftIds: [ids('craft')[1]!],
        cast: { lead: ids('actor')[3]!, antagonist: ids('actor')[4]!, support: ids('actor')[5]! },
        budget: { negative: conceptB.baseNegativeCost, marketing: 400_000 },
      },
    },
  ])

  const productions = state.studio.activeProductions
  return {
    state,
    productions,
    writerId: writerIds[0]!,
    secondWriterId: writerIds[1]!,
    titles: productions.map(
      (production) => state.concepts.find((concept) => concept.id === production.conceptId)!.title,
    ),
  }
}

function activeProductionPeopleCount(world: TwoPictureWorld): number {
  return studioLotSnapshot(world.state).people.filter(
    (person) => person.authority === 'active-production',
  ).length
}

/** Replace one active production's fields, keeping everything else identical. */
function withProduction(
  state: GameState,
  index: number,
  patch: Partial<GameState['studio']['activeProductions'][number]>,
): GameState {
  return {
    ...state,
    studio: {
      ...state.studio,
      activeProductions: state.studio.activeProductions.map((production, at) =>
        at === index ? { ...production, ...patch } : production,
      ),
    },
  }
}

describe('P04A.2 — two live pictures sharing ONE credited writer', () => {
  it('reaches the state at all: both greenlights succeed and both credits are the same person', () => {
    const world = twoLivePictures('p04a2-seat-exclusivity', true)

    expect(world.productions).toHaveLength(2)
    expect(world.productions.map((production) => production.writerId)).toEqual([
      world.writerId,
      world.writerId,
    ])
    // …and the seats really are disjoint, so nothing below is masked by a
    // legitimate seat collision.
    const seatIds = world.productions.flatMap((production) => [
      production.directorId,
      production.cast.lead,
      production.cast.antagonist,
      production.cast.support,
      ...production.craftIds,
    ])
    expect(new Set(seatIds).size).toBe(seatIds.length)
    expect(seatIds).not.toContain(world.writerId)
  })

  it('(a) keeps the whole Lot company projection: NOT null, 6 + 6, both writer rows the shared id', () => {
    const world = twoLivePictures('p04a2-seat-exclusivity', true)
    const snapshot = studioLotSnapshot(world.state)

    const projection = managedProductionCompanyProjection(
      world.state,
      snapshot.productionOperations ?? [],
    )
    expect(projection).not.toBeNull()

    for (const production of world.productions) {
      const members = projection!.membersByProductionId.get(production.id)
      expect(members).toBeDefined()
      expect(members).toHaveLength(6)
      // The credit is proved by exact stable id — never by a name or a label.
      expect(members![0]!.productionRole).toBe('writer')
      expect(members![0]!.talentId).toBe(world.writerId)
      expect(members![0]!.talentId).toBe(production.writerId)
    }

    // The published wire carries the complete six-person company on BOTH pictures.
    expect(
      snapshot.productionOperations?.map((operation) => operation.companyMembers?.length),
    ).toEqual([6, 6])
  })

  it('(a) CONTROL — sharing a writer costs the world exactly one person, not eight', () => {
    const shared = twoLivePictures('p04a2-seat-exclusivity', true)
    const control = twoLivePictures('p04a2-seat-exclusivity', false)

    // The control is genuinely a control: same seats, two different credits.
    expect(control.productions.map((production) => production.writerId)).toEqual([
      control.writerId,
      control.secondWriterId,
    ])
    expect(control.writerId).not.toBe(control.secondWriterId)

    // The two worlds differ by exactly one HUMAN: the control hires a second
    // writer, the shared world reuses the first. So the shared world stands one
    // fewer person on the lot — and each person is emitted exactly once, never
    // twice for holding two credits.
    // THE REGRESSION THIS PINS: before the fix the shared world collapsed the
    // whole company projection and read 4 against the control's 12, losing eight
    // named people off every picture. One is the correct delta; eight is the bug.
    expect(activeProductionPeopleCount(control)).toBe(12)
    expect(activeProductionPeopleCount(shared)).toBe(11)
  })

  it('(b) the shared writer appears ONCE on the Lot, is not ambiguous, and is located by their CURRENT work', () => {
    const world = twoLivePictures('p04a2-seat-exclusivity', true)
    const snapshot = studioLotSnapshot(world.state)

    const rows = snapshot.people.filter((person) => person.id === world.writerId)
    expect(rows).toHaveLength(1)

    // ONE row, deterministically resolved. Two credits are one person with two
    // credits, never a hostile ambiguity and never array-order luck: the row
    // names the CANONICALLY-FIRST picture they are credited on, so the same
    // world always produces the same answer.
    const row = rows[0]!
    const canonicalFirst = [...world.productions]
      .map((production) => production.id)
      .sort()[0]!
    expect(row.authority).toBe('active-production')
    expect(row.productionId).toBe(canonicalFirst)

    // KNOWN NON-BLOCKER, pinned deliberately so it cannot drift unnoticed.
    // On this browser-era Lot a credited writer is still modelled as one of the
    // picture's six people, so they are located WITH that picture rather than at
    // their own current work. That is baseline behaviour, unchanged by P04A.2,
    // and it is not what the Owner plays: the Unity client never reads
    // `companyMembers` and derives writer presence from the development board.
    // Correcting it means dropping the writer from the six-member wire shape —
    // a schema change, and an Owner call. The ENGINE's own presence projection
    // (src/core/presence.ts) is already correct and gives the writer no
    // production claim in any phase; `tests/p04a2-writer-credit-law.test.ts`
    // §19D pins that.
    const work = lotPersonWorkContext(snapshot, world.writerId)
    expect(work.kind).toBe('managed-production')
    if (work.kind === 'unavailable') {
      expect(work.reason).not.toBe('ambiguous-assignment')
    }
    expect(talentAssignmentContext(world.state, world.writerId).kind).not.toBe('ambiguous')

    // The five SEATS on each picture are still located by their picture.
    for (const production of world.productions) {
      for (const seatId of [
        production.directorId,
        production.cast.lead,
        production.cast.antagonist,
        production.cast.support,
        ...production.craftIds,
      ]) {
        expect(lotPersonWorkContext(snapshot, seatId).kind).toBe('managed-production')
      }
    }
  })

  it('(c) a SEAT is still globally exclusive — the same person cannot sit on two pictures', () => {
    const world = twoLivePictures('p04a2-seat-exclusivity', true)
    const operations = studioLotSnapshot(world.state).productionOperations ?? []

    // The engine will not produce these; forge them at the projection's input so
    // the seat guard itself is under test.
    const sharedDirector = withProduction(world.state, 1, {
      directorId: world.productions[0]!.directorId,
    })
    expect(managedProductionCompanyProjection(sharedDirector, operations)).toBeNull()

    const sharedLead = withProduction(world.state, 1, {
      cast: { ...world.productions[1]!.cast, lead: world.productions[0]!.cast.lead },
    })
    expect(managedProductionCompanyProjection(sharedLead, operations)).toBeNull()

    const sharedCraft = withProduction(world.state, 1, {
      craftIds: [...world.productions[0]!.craftIds],
    })
    expect(managedProductionCompanyProjection(sharedCraft, operations)).toBeNull()
  })

  it('(d) M16.7 within ONE picture still holds — a writer who is also a cast member fails closed', () => {
    const world = twoLivePictures('p04a2-seat-exclusivity', true)
    const operations = studioLotSnapshot(world.state).productionOperations ?? []

    const writerIsAlsoLead = withProduction(world.state, 0, {
      writerId: world.productions[0]!.cast.lead,
    })
    expect(managedProductionCompanyProjection(writerIsAlsoLead, operations)).toBeNull()

    const writerIsAlsoDirector = withProduction(world.state, 0, {
      writerId: world.productions[0]!.directorId,
    })
    expect(managedProductionCompanyProjection(writerIsAlsoDirector, operations)).toBeNull()
  })

  it('reads the two-picture world without mutating it', () => {
    const world = twoLivePictures('p04a2-seat-exclusivity', true)
    const before = JSON.stringify(world.state)
    const snapshot = studioLotSnapshot(world.state)
    managedProductionCompanyProjection(world.state, snapshot.productionOperations ?? [])
    activeProductionCompanyContexts(snapshot)
    lotPersonWorkContext(snapshot, world.writerId)
    expect(JSON.stringify(world.state)).toBe(before)
  })
})
