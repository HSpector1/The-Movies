import { describe, expect, it } from 'vitest'
import type {
  LotPersonState,
  LotProductionCompanyMember,
  LotProductionCompanyRole,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  activeProductionCompanyContexts,
  hasProductionCompanyProjectionClaim,
  LOT_PRODUCTION_COMPANY_ROLE_ORDER,
  lotPeopleForCompanyPresentation,
  productionCompanyRoleLabel,
} from './productionCompany.ts'

const ROLE_NAMES: Record<LotProductionCompanyRole, string> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  craft: 'Craft Lead',
}

function companyMembers(suffix = 'a'): LotProductionCompanyMember[] {
  return LOT_PRODUCTION_COMPANY_ROLE_ORDER.map((productionRole) => ({
    productionRole,
    slotIndex: 0,
    talentId: `${productionRole}-${suffix}`,
    name: `${ROLE_NAMES[productionRole]} ${suffix.toUpperCase()}`,
    presentationRole: productionRole === 'director' ? 'director' : 'talent',
  }))
}

function operation(
  suffix = 'a',
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  const members = companyMembers(suffix)
  return {
    productionId: `production-${suffix}`,
    title: `Picture ${suffix.toUpperCase()}`,
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 5,
    progress01: 0.375,
    locationBuildingId: suffix === 'b' ? 'stage-b' : 'stage-a',
    facilityLabel:
      suffix === 'b' ? 'Soundstage 12 + Scenery Shop' : 'Soundstage 7 + Scenery Shop',
    directorId: `director-${suffix}`,
    directorName: `Director ${suffix.toUpperCase()}`,
    leadId: `lead-${suffix}`,
    leadName: `Lead ${suffix.toUpperCase()}`,
    companyMembers: members,
    taskStatus: 'ready',
    statusLabel: 'Decision required',
    blocker: null,
    attention: 'decision-required',
    currentCommand: null,
    ...overrides,
  }
}

function peopleFor(operationRow: ProductionOperationsState): LotPersonState[] {
  return (operationRow.companyMembers ?? []).map((member) => ({
    id: member.talentId,
    name: member.name,
    role: member.presentationRole,
    authority: 'active-production',
    productionId: operationRow.productionId,
    productionTitle: operationRow.title,
  }))
}

function snapshot(
  operations: ProductionOperationsState[],
  people: LotPersonState[] = operations.flatMap(peopleFor),
): StudioLotSnapshot {
  return {
    studioName: 'Project: Studio',
    week: 30,
    cash: 1_000_000,
    cashBand: 'stable',
    standing: 'established',
    standingValues: { awareness: 50, prestige: 50, confidence: 50 },
    publicityOffers: [],
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people,
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'company-selector-test',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations: operations,
  }
}

describe('activeProductionCompanyContexts', () => {
  it('joins and canonically orders two complete same-title companies without mutating input', () => {
    const operationA = operation('a', { title: 'Same Picture' })
    const operationB = operation('b', { title: 'Same Picture' })
    const state = snapshot(
      [operationB, operationA],
      [...peopleFor(operationB), ...peopleFor(operationA)].reverse(),
    )
    const before = structuredClone(state)

    const contexts = activeProductionCompanyContexts(state)

    expect(contexts?.map((context) => context.operation.productionId)).toEqual([
      'production-a',
      'production-b',
    ])
    expect(contexts?.map((context) =>
      context.members.map(({ member, person }) => ({
        role: member.productionRole,
        memberId: member.talentId,
        personId: person.id,
        productionId: person.productionId,
      })),
    )).toEqual([
      LOT_PRODUCTION_COMPANY_ROLE_ORDER.map((role) => ({
        role,
        memberId: `${role}-a`,
        personId: `${role}-a`,
        productionId: 'production-a',
      })),
      LOT_PRODUCTION_COMPANY_ROLE_ORDER.map((role) => ({
        role,
        memberId: `${role}-b`,
        personId: `${role}-b`,
        productionId: 'production-b',
      })),
    ])
    expect(state).toEqual(before)
  })

  it('returns an honest empty company set for an empty managed studio', () => {
    expect(activeProductionCompanyContexts(snapshot([]))).toEqual([])
  })

  it('provides the six frozen role labels', () => {
    expect(LOT_PRODUCTION_COMPANY_ROLE_ORDER.map(productionCompanyRoleLabel)).toEqual([
      'Writer',
      'Director',
      'Lead actor',
      'Antagonist',
      'Supporting actor',
      'Production/Craft Lead',
    ])
  })

  it('returns null when the optional expanded projection is wholly absent', () => {
    const withoutCompany = operation()
    delete withoutCompany.companyMembers
    const state = snapshot([withoutCompany])
    expect(hasProductionCompanyProjectionClaim(state)).toBe(false)
    expect(activeProductionCompanyContexts(state)).toBeNull()
    expect(lotPeopleForCompanyPresentation(state)).toEqual(state.people)
  })

  it('treats an own undefined company field as malformed and omits partial active people', () => {
    const row = operation()
    Object.defineProperty(row, 'companyMembers', {
      value: undefined,
      enumerable: true,
      configurable: true,
      writable: true,
    })
    const roster: LotPersonState = {
      id: 'roster-person',
      name: 'Roster Person',
      role: 'talent',
      authority: 'studio-roster',
      productionId: null,
      productionTitle: null,
    }
    const state = snapshot([row], [...companyMembers().map((member) => ({
      id: member.talentId,
      name: member.name,
      role: member.presentationRole,
      authority: 'active-production' as const,
      productionId: row.productionId,
      productionTitle: row.title,
    })), roster])

    expect(Object.hasOwn(row, 'companyMembers')).toBe(true)
    expect(hasProductionCompanyProjectionClaim(state)).toBe(true)
    expect(activeProductionCompanyContexts(state)).toBeNull()
    expect(lotPeopleForCompanyPresentation(state)).toEqual([roster])
  })

  it('fails a mixed present/missing two-picture projection atomically', () => {
    const operationA = operation('a')
    const operationB = operation('b')
    const people = [...peopleFor(operationA), ...peopleFor(operationB)]
    delete operationB.companyMembers
    expect(activeProductionCompanyContexts(snapshot([operationA, operationB], people))).toBeNull()
  })

  it('rejects unsupported provenance and more than two operation rows', () => {
    const state = snapshot([operation()]) as StudioLotSnapshot & {
      operationsMode: 'managed' | 'legacy'
    }
    state.operationsMode = 'legacy'
    expect(activeProductionCompanyContexts(state)).toBeNull()

    const rows = [operation('a'), operation('b'), operation('c')]
    expect(activeProductionCompanyContexts(snapshot(rows))).toBeNull()
  })

  it.each([
    ['duplicate operation identity', () => {
      const first = operation('a')
      const duplicate = operation('b', { productionId: first.productionId })
      return snapshot([first, duplicate])
    }],
    ['wrong member cardinality', () => {
      const row = operation()
      row.companyMembers = row.companyMembers!.slice(0, 5)
      return snapshot([row])
    }],
    ['non-canonical role order', () => {
      const row = operation()
      const members = [...row.companyMembers!]
      ;[members[0], members[1]] = [members[1]!, members[0]!]
      row.companyMembers = members
      return snapshot([row])
    }],
    ['non-zero slot index', () => {
      const row = operation()
      row.companyMembers = row.companyMembers!.map((member, index) =>
        index === 5 ? { ...member, slotIndex: 1 } : member,
      )
      return snapshot([row])
    }],
    ['malformed presentation role', () => {
      const row = operation()
      row.companyMembers = row.companyMembers!.map((member) =>
        member.productionRole === 'writer'
          ? { ...member, presentationRole: 'director' }
          : member,
      )
      return snapshot([row])
    }],
    ['extra member field', () => {
      const row = operation()
      const writer = row.companyMembers![0]! as LotProductionCompanyMember & {
        hiddenAssessment?: number
      }
      writer.hiddenAssessment = 99
      return snapshot([row])
    }],
    ['within-picture reused talent', () => {
      const row = operation()
      row.companyMembers = row.companyMembers!.map((member) =>
        member.productionRole === 'support'
          ? { ...member, talentId: 'lead-a', name: 'Lead A' }
          : member,
      )
      return snapshot([row])
    }],
    ['cross-picture reused talent', () => {
      const first = operation('a')
      const second = operation('b')
      second.companyMembers = second.companyMembers!.map((member) =>
        member.productionRole === 'craft'
          ? { ...member, talentId: 'craft-a', name: 'Craft Lead A' }
          : member,
      )
      return snapshot([first, second])
    }],
    ['stale person name', () => {
      const row = operation()
      const people = peopleFor(row)
      people[0] = { ...people[0]!, name: 'Different Writer' }
      return snapshot([row], people)
    }],
    ['stale person picture title', () => {
      const row = operation()
      const people = peopleFor(row)
      people[4] = { ...people[4]!, productionTitle: 'Different Picture' }
      return snapshot([row], people)
    }],
    ['missing company person', () => {
      const row = operation()
      return snapshot([row], peopleFor(row).slice(1))
    }],
    ['extra active-production person', () => {
      const row = operation()
      return snapshot([row], [
        ...peopleFor(row),
        {
          id: 'extra-active',
          name: 'Extra Active',
          role: 'talent',
          authority: 'active-production',
          productionId: row.productionId,
          productionTitle: row.title,
        },
      ])
    }],
    ['duplicate person identity', () => {
      const row = operation()
      const people = peopleFor(row)
      return snapshot([row], [...people, { ...people[0]! }])
    }],
    ['stale Director operation identity', () => {
      const row = operation('a', { directorId: 'different-director' })
      return snapshot([row])
    }],
    ['stale Lead operation name', () => {
      const row = operation('a', { leadName: 'Different Lead' })
      return snapshot([row])
    }],
    ['legacy phase under managed authority', () => {
      const row = operation('a', { phase: 'legacy' })
      return snapshot([row])
    }],
  ])('fails %s closed', (_label, makeState) => {
    expect(activeProductionCompanyContexts(makeState())).toBeNull()
  })
})

// ── P04A.2 — a Writer CREDIT is not a seat, at the CONSUMER layer ────────────
//
// The blocker this mirrors: two live pictures credited to ONE writer collapsed
// the whole projection to null, which emptied `companyMembers` on BOTH pictures
// and dropped every named member off the Lot. The writer row is a permanent
// screenplay credit — it carries no cross-picture exclusivity and claims no
// place on a soundstage. The five SEATS are unchanged: still globally exclusive,
// still required to be standing on their own picture.

/** A company whose writer row is an explicit credit id, distinct from the seats. */
function companyWithWriter(
  suffix: string,
  writerId: string,
  writerName: string,
): LotProductionCompanyMember[] {
  return companyMembers(suffix).map((member) =>
    member.productionRole === 'writer'
      ? { ...member, talentId: writerId, name: writerName }
      : member,
  )
}

/** Only the five SEATS occupy the picture; the credited writer is elsewhere. */
function seatPeopleFor(operationRow: ProductionOperationsState): LotPersonState[] {
  return (operationRow.companyMembers ?? [])
    .filter((member) => member.productionRole !== 'writer')
    .map((member) => ({
      id: member.talentId,
      name: member.name,
      role: member.presentationRole,
      authority: 'active-production' as const,
      productionId: operationRow.productionId,
      productionTitle: operationRow.title,
    }))
}

/**
 * The credited writer, emitted ONCE by the producer on the canonically-first
 * picture they are credited on — never once per credit. A credit is not
 * exclusive, so the same person may be `companyMembers[0]` on several pictures
 * while standing in only one place.
 */
function creditedWriterPerson(
  id: string,
  name: string,
  canonicalPicture: ProductionOperationsState,
): LotPersonState {
  return {
    id,
    name,
    role: 'talent',
    authority: 'active-production',
    productionId: canonicalPicture.productionId,
    productionTitle: canonicalPicture.title,
  }
}

describe('activeProductionCompanyContexts — the writer credit is not a seat (P04A.2)', () => {
  function sharedWriterState(): StudioLotSnapshot {
    const operationA = operation('a', {
      companyMembers: companyWithWriter('a', 'writer-shared', 'Shared Writer'),
    })
    const operationB = operation('b', {
      companyMembers: companyWithWriter('b', 'writer-shared', 'Shared Writer'),
    })
    return snapshot(
      [operationA, operationB],
      [
        ...seatPeopleFor(operationA),
        ...seatPeopleFor(operationB),
        creditedWriterPerson('writer-shared', 'Shared Writer', operationA),
      ],
    )
  }

  it('(a) joins TWO pictures that share one credited writer, six members each', () => {
    const state = sharedWriterState()
    const before = structuredClone(state)

    const contexts = activeProductionCompanyContexts(state)

    expect(contexts).not.toBeNull()
    expect(contexts?.map((context) => context.operation.productionId)).toEqual([
      'production-a',
      'production-b',
    ])
    expect(contexts?.map((context) => context.members.length)).toEqual([6, 6])
    for (const context of contexts ?? []) {
      const writer = context.members[0]!
      expect(writer.member.productionRole).toBe('writer')
      expect(writer.member.talentId).toBe('writer-shared')
      // Both pictures join the SAME single person by exact id — the credit is
      // not an occupancy claim, so picture B accepts a writer who is standing on
      // picture A. Before the fix, picture B's writer slot was tested for
      // cross-picture seat exclusivity and returned null for BOTH pictures.
      expect(writer.person.id).toBe('writer-shared')
      expect(writer.person.productionId).toBe('production-a')
    }
    expect(state).toEqual(before)
  })

  it('(a) CONTROL — two different credited writers project identically', () => {
    const operationA = operation('a', {
      companyMembers: companyWithWriter('a', 'writer-one', 'Writer One'),
    })
    const operationB = operation('b', {
      companyMembers: companyWithWriter('b', 'writer-two', 'Writer Two'),
    })
    const contexts = activeProductionCompanyContexts(
      snapshot(
        [operationA, operationB],
        [
          ...seatPeopleFor(operationA),
          ...seatPeopleFor(operationB),
          creditedWriterPerson('writer-one', 'Writer One', operationA),
          creditedWriterPerson('writer-two', 'Writer Two', operationB),
        ],
      ),
    )
    expect(contexts?.map((context) => context.members.length)).toEqual([6, 6])
    expect(contexts?.map((context) => context.members[0]!.member.talentId)).toEqual([
      'writer-one',
      'writer-two',
    ])
  })

  it.each([
    ['a shared DIRECTOR seat', () => {
      const operationA = operation('a', {
        companyMembers: companyWithWriter('a', 'writer-one', 'Writer One'),
      })
      const operationB = operation('b', {
        directorId: 'director-a',
        directorName: 'Director A',
        companyMembers: companyWithWriter('b', 'writer-two', 'Writer Two').map((member) =>
          member.productionRole === 'director'
            ? { ...member, talentId: 'director-a', name: 'Director A' }
            : member,
        ),
      })
      return snapshot(
        [operationA, operationB],
        [
          ...seatPeopleFor(operationA),
          ...seatPeopleFor(operationB),
          creditedWriterPerson('writer-one', 'Writer One', operationA),
          creditedWriterPerson('writer-two', 'Writer Two', operationB),
        ],
      )
    }],
    ['a shared LEAD seat', () => {
      const operationA = operation('a', {
        companyMembers: companyWithWriter('a', 'writer-one', 'Writer One'),
      })
      const operationB = operation('b', {
        leadId: 'lead-a',
        leadName: 'Lead A',
        companyMembers: companyWithWriter('b', 'writer-two', 'Writer Two').map((member) =>
          member.productionRole === 'lead'
            ? { ...member, talentId: 'lead-a', name: 'Lead A' }
            : member,
        ),
      })
      return snapshot(
        [operationA, operationB],
        [
          ...seatPeopleFor(operationA),
          ...seatPeopleFor(operationB),
          creditedWriterPerson('writer-one', 'Writer One', operationA),
          creditedWriterPerson('writer-two', 'Writer Two', operationB),
        ],
      )
    }],
    ['a shared CRAFT seat', () => {
      const operationA = operation('a', {
        companyMembers: companyWithWriter('a', 'writer-one', 'Writer One'),
      })
      const operationB = operation('b', {
        companyMembers: companyWithWriter('b', 'writer-two', 'Writer Two').map((member) =>
          member.productionRole === 'craft'
            ? { ...member, talentId: 'craft-a', name: 'Craft Lead A' }
            : member,
        ),
      })
      return snapshot(
        [operationA, operationB],
        [
          ...seatPeopleFor(operationA),
          ...seatPeopleFor(operationB),
          creditedWriterPerson('writer-one', 'Writer One', operationA),
          creditedWriterPerson('writer-two', 'Writer Two', operationB),
        ],
      )
    }],
  ])('(c) still fails %s closed — a seat is globally exclusive', (_label, makeState) => {
    expect(activeProductionCompanyContexts(makeState())).toBeNull()
  })

  it.each([
    ['the writer id equals the LEAD id', 'lead', 'lead-a', 'Lead A'],
    ['the writer id equals the SUPPORT id', 'support', 'support-a', 'Support A'],
    ['the writer id equals the DIRECTOR id', 'director', 'director-a', 'Director A'],
  ] as const)(
    '(d) M16.7 within one picture — fails closed when %s',
    (_label, _seatRole, seatId, seatName) => {
      const row = operation('a', {
        companyMembers: companyWithWriter('a', seatId, seatName),
      })
      expect(activeProductionCompanyContexts(snapshot([row], seatPeopleFor(row)))).toBeNull()
    },
  )
})
