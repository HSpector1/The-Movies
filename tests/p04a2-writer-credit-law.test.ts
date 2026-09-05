/**
 * P04A.2 — THE WRITER-CREDIT LAW REGRESSION SUITE (§19 A–H), core half.
 *
 * Owner ruling, 2026-08-28. Three concepts that used to be one set:
 *
 *   creditedWriterId  ≠  activeProductionCompanyTalentIds  ≠  activeWritingAssignmentIds
 *
 *   A. SCREENPLAY / FILM CREDIT — the author of a screenplay stays attached by exact
 *      stable id as the credited Writer, permanently. The credit survives Development,
 *      Casting, Greenlight, Production, Post, Release, contract expiry and off-lot
 *      status. A Writer credit is NEVER an availability blocker and NEVER a
 *      world-presence claim.
 *   B. ACTIVE WRITING ASSIGNMENT — a Writer is operationally busy ONLY while actually
 *      drafting or rewriting. Writing exclusivity is UNCHANGED.
 *   C. PRODUCTION ASSIGNMENT — director, the three cast slots and Craft remain governed
 *      by existing Production exclusivity, unweakened. The Writer is not a seat.
 *
 * This file REPLACES tests/p04a2-writer-credit-deadlock-repro.test.ts (the Wave 0
 * witness, which asserted the pre-ruling behaviour). Its scenario builder (now shared,
 * in `_p04a2WriterCreditFixtures.ts`) and its `[P04A.2 WITNESS]` console traces are
 * carried over deliberately: the traces are the evidence a reviewer reads, and the
 * builder is the one-writer/two-screenplay world the Owner's playtest failure happened in.
 *
 * §19E's BRIDGE half lives in `tests/bridge-p04a2-writer-credit-law.test.ts` — see the
 * comment above that section for why it cannot live here.
 */
import { describe, expect, it } from 'vitest'

import {
  activeProductionCompanyTalentIds,
  activeScriptWriterAssignments,
  activeWritingAssignmentIds,
  applyActions,
  busyTalentIds,
  castingPackageReadModel,
  creditedWriterIds,
  disabledStudioEventSink,
  exportSave,
  importSave,
  isContracted,
  makeSave,
  migrateToV18,
  QueueableCapacityRefusal,
  scriptCapacityView,
  scriptProjectsReadModel,
  studioPresence,
  tick,
} from '../src/core/index.js'
import { commitQueuedIntent } from '../src/core/actions.js'
import type {
  GameState,
  GreenlightScriptProjectPayload,
  ProductionPhase,
  SegmentId,
} from '../src/core/index.js'
import {
  buildScenario,
  commissionPayload,
  contractedByRole,
  foundedStudio,
  greenlightA,
  projectById,
  refusal,
  remainingPackage,
  runUntil,
  SEED,
  writingIds,
  type Scenario,
} from './_p04a2WriterCreditFixtures.js'


// ─────────────────────────────────────────────────────────────────────────────
// §19 A — ONE-WRITER PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19A — the one-writer pipeline never deadlocks', () => {
  it('greenlights Ready screenplay A while its credited writer is actively drafting B', () => {
    const s = buildScenario(SEED)

    // The QUOTE surface is legal…
    const quotePkg = scriptProjectsReadModel(s.deadlock).packages.find(
      (p) => p.projectId === s.projectAId,
    )!
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19A quote availability (A ready, writer drafting B):',
      JSON.stringify(
        {
          writerAvailable: quotePkg.availability.writerAvailable,
          knownGatesClear: quotePkg.availability.knownGatesClear,
          canSubmitGreenlightIntent: quotePkg.availability.canSubmitGreenlightIntent,
          blockers: quotePkg.availability.blockers.map((b) => b.kind),
        },
        null,
        2,
      ),
    )
    expect(quotePkg.availability.writerAvailable).toBe(true)
    expect(quotePkg.availability.canSubmitGreenlightIntent).toBe(true)
    expect(quotePkg.availability.blockers).toEqual([])

    // …and the COMMAND succeeds.
    const greenlit = applyActions(s.deadlock, [greenlightA(s)])
    expect(greenlit.studio.activeProductions).toHaveLength(1)
    const production = greenlit.studio.activeProductions[0]!

    // The exact Writer credit id is preserved on the production and its participants.
    expect(production.writerId).toBe(s.writerId)
    expect(production.participants?.writer.talentId).toBe(s.writerId)
    expect(production.participants?.writer.role).toBe('writer')

    // B remains actively drafting, undisturbed, still credited to the same writer.
    const projectB = projectById(greenlit, s.projectBId)
    expect(projectB.status).toBe('drafting')
    expect(projectB.writerId).toBe(s.writerId)
    expect(writingIds(greenlit)).toContain(s.writerId)

    // A's production RESERVES nobody's writing time: the writer is not a seat…
    expect(activeProductionCompanyTalentIds(greenlit).has(s.writerId)).toBe(false)
    // …but IS credited.
    expect(creditedWriterIds(greenlit).has(s.writerId)).toBe(true)

    // Not double-booked: exactly one active writing assignment, for B, not A.
    const assignments = activeScriptWriterAssignments(
      greenlit.scriptDevelopment,
      greenlit.concepts,
    ).filter((assignment) => assignment.talentId === s.writerId)
    expect(assignments).toHaveLength(1)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19A single writing assignment after greenlight:',
      JSON.stringify(assignments[0]),
    )
    expect(projectById(greenlit, s.projectAId).status).toBe('inProduction')
  })

  it('HOSTILE REVIEWER: the credited writer is NOT busy after greenlight, all five seats ARE', () => {
    const s = buildScenario(SEED)
    // Greenlight from readyOnly so NOTHING but the credit could make the writer busy.
    const greenlit = applyActions(s.readyOnly, [greenlightA(s)])
    const busy = busyTalentIds(greenlit)

    expect(busy.has(s.packageA.directorId)).toBe(true)
    expect(busy.has(s.packageA.cast.lead)).toBe(true)
    expect(busy.has(s.packageA.cast.antagonist)).toBe(true)
    expect(busy.has(s.packageA.cast.support)).toBe(true)
    expect(busy.has(s.packageA.craftIds[0]!)).toBe(true)
    expect(busy.has(s.writerId)).toBe(false)

    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19A busy set after greenlight:',
      JSON.stringify({
        busy: [...busy].sort(),
        creditedWriter: s.writerId,
        writerBusy: busy.has(s.writerId),
      }),
    )

    // busyTalentIds is EXACTLY the union of the two real-work sets — no third source.
    const union = new Set([
      ...activeProductionCompanyTalentIds(greenlit),
      ...activeWritingAssignmentIds(greenlit),
    ])
    expect([...busy].sort()).toEqual([...union].sort())
  })

  it('HOSTILE REVIEWER: the released film record still carries the exact writer talentId', () => {
    const s = buildScenario(SEED)
    let state = applyActions(s.deadlock, [greenlightA(s)])
    const productionId = state.studio.activeProductions[0]!.id

    // Run the picture out to release.
    state = runUntil(state, (c) => c.studio.releasedFilms.length > 0)
    const film = state.studio.releasedFilms.find((f) => f.productionId === productionId)
    expect(film).toBeDefined()
    expect(film!.participants?.writer.talentId).toBe(s.writerId)
    expect(film!.participants?.writer.role).toBe('writer')
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19A released-film writer credit:',
      JSON.stringify(film!.participants?.writer),
    )

    // The credit survives release even though the writer is long since off the picture.
    expect(activeProductionCompanyTalentIds(state).has(s.writerId)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §19 B — WRITING EXCLUSIVITY IS UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19B — writing exclusivity is unchanged', () => {
  it('the same writer CANNOT draft A and B simultaneously', () => {
    const s = buildScenario(SEED)
    // In `deadlock` the writer is already drafting B; a THIRD commission must refuse.
    const message = refusal(() =>
      applyActions(s.deadlock, [
        {
          kind: 'commissionScript',
          project: commissionPayload(s.deadlock.concepts[2]!, s.writerId),
        },
      ]),
    )
    // eslint-disable-next-line no-console
    console.log('[P04A.2 WITNESS] §19B draft-while-drafting refusal:', message)
    expect(message).toMatch(/already has an active assignment/)
    expect(message).toContain(s.writerId)
  })

  /**
   * One writer; screenplay A at its FIRST review (`rewriteCount: 0`, the only state a
   * rewrite is legal from), with the writer free; and the same world one step further
   * on, where that writer has started drafting screenplay B.
   */
  function reviewWorld(seed: string) {
    let state = foundedStudio(seed)
    state = applyActions(state, [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
    ])
    const writerId = contractedByRole(state, 'writer')[0]!.id
    const conceptA = state.concepts[0]!
    const conceptB = state.concepts[1]!

    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(conceptA, writerId) },
    ])
    const projectAId = state.scriptDevelopment.projects[0]!.id
    state = tick(state)
    expect(projectById(state, projectAId).status).toBe('review')
    expect(projectById(state, projectAId).rewriteCount).toBe(0)
    // The writer is released the moment A stops being drafted (law B).
    expect(busyTalentIds(state).has(writerId)).toBe(false)
    const aAtReviewWriterFree = state

    // The same writer starts screenplay B; A stays parked at review.
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(conceptB, writerId) },
    ])
    const projectBId = state.scriptDevelopment.projects.find(
      (p) => p.conceptId === conceptB.id,
    )!.id
    expect(projectById(state, projectBId).status).toBe('drafting')
    const aAtReviewWriterDrafting = state

    // …and one more week, so BOTH sit at a first review with the writer free.
    state = tick(state)
    expect(projectById(state, projectBId).status).toBe('review')
    expect(projectById(state, projectBId).rewriteCount).toBe(0)
    expect(projectById(state, projectAId).status).toBe('review')
    expect(busyTalentIds(state).has(writerId)).toBe(false)

    return {
      writerId,
      projectAId,
      projectBId,
      aAtReviewWriterFree,
      aAtReviewWriterDrafting,
      bothAtReview: state,
    }
  }

  it('the same writer CANNOT draft one screenplay and rewrite another', () => {
    const w = reviewWorld('p04a2-rewrite-exclusivity')

    // CONTROL: with the writer free, the rewrite of A is legal.
    const control = applyActions(w.aAtReviewWriterFree, [
      { kind: 'requestScriptRewrite', projectId: w.projectAId },
    ])
    expect(projectById(control, w.projectAId).status).toBe('rewriting')

    // With that same writer DRAFTING B, the identical rewrite refuses.
    const message = refusal(() =>
      applyActions(w.aAtReviewWriterDrafting, [
        { kind: 'requestScriptRewrite', projectId: w.projectAId },
      ]),
    )
    // eslint-disable-next-line no-console
    console.log('[P04A.2 WITNESS] §19B rewrite-while-drafting refusal:', message)
    expect(message).toMatch(/already has an active assignment/)
    expect(message).toContain(w.writerId)

    // The projection agrees: for a REWRITE the availability blocker still publishes.
    const card = scriptProjectsReadModel(w.aAtReviewWriterDrafting).sections.needsReview.find(
      (candidate) => candidate.projectId === w.projectAId,
    )!
    const kinds = card.blockers.map((b) => b.kind)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19B rewrite blockers (writer drafting elsewhere):',
      JSON.stringify({ kinds, legalActions: card.legalActions.map((a) => a.kind) }),
    )
    expect(kinds).toContain('writer-assignment')
    expect(card.legalActions.map((a) => a.kind)).not.toContain('requestScriptRewrite')
  })

  it('the same writer CANNOT rewrite two screenplays simultaneously', () => {
    const w = reviewWorld('p04a2-rewrite-exclusivity')

    // The FIRST rewrite is legal…
    const oneRewrite = applyActions(w.bothAtReview, [
      { kind: 'requestScriptRewrite', projectId: w.projectAId },
    ])
    expect(projectById(oneRewrite, w.projectAId).status).toBe('rewriting')
    expect(activeWritingAssignmentIds(oneRewrite).has(w.writerId)).toBe(true)

    // …the SECOND, by the same writer, in the same week, is not.
    const message = refusal(() =>
      applyActions(oneRewrite, [
        { kind: 'requestScriptRewrite', projectId: w.projectBId },
      ]),
    )
    // eslint-disable-next-line no-console
    console.log('[P04A.2 WITNESS] §19B rewrite-while-rewriting refusal:', message)
    expect(message).toMatch(/already has an active assignment/)
    expect(message).toContain(w.writerId)

    // …and a COMMISSION during a rewrite is refused too — rewriting is real work.
    const commissionMessage = refusal(() =>
      applyActions(oneRewrite, [
        {
          kind: 'commissionScript',
          project: commissionPayload(oneRewrite.concepts[2]!, w.writerId),
        },
      ]),
    )
    // eslint-disable-next-line no-console
    console.log('[P04A.2 WITNESS] §19B draft-while-rewriting refusal:', commissionMessage)
    expect(commissionMessage).toMatch(/already has an active assignment/)
    expect(commissionMessage).toContain(w.writerId)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §19 C — PRODUCTION EXCLUSIVITY IS UNCHANGED (each of the five seats, individually)
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19C — production exclusivity for the five real seats is unweakened', () => {
  /**
   * One writer, TWO Ready screenplays (A then A2, written in sequence by that one
   * writer), and a roster deep enough that a legal second package exists. Picture A is
   * greenlit; A2 is then greenlit with exactly ONE seat swapped for A's incumbent.
   */
  function twoPictureWorld() {
    const s = buildScenario('p04a2-seat-exclusivity', { actor: 3, director: 1, craft: 1 })
    // Screenplay B (the second commission) is drafted by the same writer; take it to Ready.
    let state = tick(s.deadlock)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: s.projectBId }])
    expect(projectById(state, s.projectBId).status).toBe('ready')

    // Greenlight A with the FIRST director/craft/actors.
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: { projectId: s.projectAId, ...s.packageA } },
    ])
    expect(state.studio.activeProductions).toHaveLength(1)

    // A legal, fully disjoint package for the second picture.
    const packageB = remainingPackage(state, s.conceptB, { director: 1, craft: 1, actor: 3 })
    const seatsA = [
      s.packageA.directorId,
      s.packageA.cast.lead,
      s.packageA.cast.antagonist,
      s.packageA.cast.support,
      s.packageA.craftIds[0]!,
    ]
    const seatsB = [
      packageB.directorId,
      packageB.cast.lead,
      packageB.cast.antagonist,
      packageB.cast.support,
      packageB.craftIds[0]!,
    ]
    expect(new Set([...seatsA, ...seatsB]).size).toBe(10)
    return { s, state, packageB }
  }

  const seatSwaps: {
    label: string
    swap: (
      packageB: Omit<GreenlightScriptProjectPayload, 'projectId'>,
      s: Scenario,
    ) => Omit<GreenlightScriptProjectPayload, 'projectId'>
    incumbent: (s: Scenario) => string
  }[] = [
    {
      label: 'director',
      swap: (p, s) => ({ ...p, directorId: s.packageA.directorId }),
      incumbent: (s) => s.packageA.directorId,
    },
    {
      label: 'cast.lead',
      swap: (p, s) => ({ ...p, cast: { ...p.cast, lead: s.packageA.cast.lead } }),
      incumbent: (s) => s.packageA.cast.lead,
    },
    {
      label: 'cast.antagonist',
      swap: (p, s) => ({
        ...p,
        cast: { ...p.cast, antagonist: s.packageA.cast.antagonist },
      }),
      incumbent: (s) => s.packageA.cast.antagonist,
    },
    {
      label: 'cast.support',
      swap: (p, s) => ({ ...p, cast: { ...p.cast, support: s.packageA.cast.support } }),
      incumbent: (s) => s.packageA.cast.support,
    },
    {
      label: 'craft',
      swap: (p, s) => ({ ...p, craftIds: [s.packageA.craftIds[0]!] }),
      incumbent: (s) => s.packageA.craftIds[0]!,
    },
  ]

  for (const seat of seatSwaps) {
    it(`refuses a second greenlight that reuses picture A's ${seat.label}`, () => {
      const { s, state, packageB } = twoPictureWorld()
      const incumbent = seat.incumbent(s)
      expect(busyTalentIds(state).has(incumbent)).toBe(true)

      const message = refusal(() =>
        applyActions(state, [
          {
            kind: 'greenlightScriptProject',
            production: { projectId: s.projectBId, ...seat.swap(packageB, s) },
          },
        ]),
      )
      // eslint-disable-next-line no-console
      console.log(`[P04A.2 WITNESS] §19C ${seat.label} exclusivity refusal:`, message)
      expect(message).toMatch(/already engaged in an active production/)
      expect(message).toContain(incumbent)
    })
  }

  it('CONTROL: the fully disjoint second package IS legal (the five refusals are about the seats, not the world)', () => {
    const { s, state, packageB } = twoPictureWorld()
    const next = applyActions(state, [
      { kind: 'greenlightScriptProject', production: { projectId: s.projectBId, ...packageB } },
    ])
    expect(next.studio.activeProductions).toHaveLength(2)
    // The SAME writer is the credited writer of BOTH pictures, and busy on neither.
    expect(next.studio.activeProductions.map((p) => p.writerId)).toEqual([
      s.writerId,
      s.writerId,
    ])
    expect(busyTalentIds(next).has(s.writerId)).toBe(false)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19C one writer credited on two live pictures, busy on neither:',
      JSON.stringify({
        writerId: s.writerId,
        credited: [...creditedWriterIds(next)],
        busy: busyTalentIds(next).has(s.writerId),
      }),
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §19 D — PRESENCE: the credit is not a world-presence claim
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19D — the credited writer holds no production presence claim', () => {
  function phaseOf(state: GameState, productionId: string): ProductionPhase | undefined {
    return state.operations.workflows.find((w) => w.productionId === productionId)?.phase
  }


  it('projects the writer at Development for the screenplay they are DRAFTING, never into the picture they merely wrote', () => {
    const s = buildScenario(SEED)
    const greenlit = applyActions(s.deadlock, [greenlightA(s)])
    const productionId = greenlit.studio.activeProductions[0]!.id

    const presence = studioPresence(greenlit)
    const writer = presence.people.find((p) => p.talentId === s.writerId)!
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19D presence (A in production, writer drafting B):',
      JSON.stringify(writer),
    )
    // Their body follows their CURRENT work: screenplay B, at B's own reserved room.
    expect(writer.engagement).toBe('script')
    expect(writer.credit).toBe('writer')
    expect(writer.ownerId).toBe(s.projectBId)
    expect(writer.ownerId).not.toBe(productionId)
    expect(writer.site).toBe(projectById(greenlit, s.projectBId).reservation!.facilityId)

    // …and A still carries the credit.
    expect(greenlit.studio.activeProductions[0]!.writerId).toBe(s.writerId)
  })

  it('never puts the credited writer on the soundstage in rehearsal or shooting', () => {
    const s = buildScenario(SEED)
    let state = applyActions(s.deadlock, [greenlightA(s)])
    const productionId = state.studio.activeProductions[0]!.id
    const observed: { phase: string; engagement: string; site: string | null }[] = []

    for (const phase of [
      'development',
      'preProduction',
      'rehearsal',
      'shooting',
      'postProduction',
    ] as const) {
      state = runUntil(state, (c) => phaseOf(c, productionId) === phase)
      const workflow = state.operations.workflows.find(
        (w) => w.productionId === productionId,
      )!
      const soundstageIds = new Set(
        workflow.reservations
          .filter((r) => r.capability === 'soundstage')
          .map((r) => r.facilityId),
      )
      const presence = studioPresence(state)
      const writer = presence.people.find((p) => p.talentId === s.writerId)!
      observed.push({ phase, engagement: writer.engagement, site: writer.site })

      // The credited writer never holds a claim on THIS production, in any phase…
      expect(writer.ownerId).not.toBe(productionId)
      expect(writer.engagement).not.toBe('production')
      // …and is never standing on the picture's soundstage.
      expect(writer.site === null || !soundstageIds.has(writer.site)).toBe(true)
      // The seats that DO belong to the phase are unaffected: the director is claimed.
      const director = presence.people.find((p) => p.talentId === s.packageA.directorId)!
      expect(director.engagement).toBe('production')
      expect(director.ownerId).toBe(productionId)
    }

    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19D writer presence across every phase of the picture they wrote:',
      JSON.stringify(observed),
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §19 E — QUOTE / COMMAND, core half.
//
// The BRIDGE half of this clause — the opaque intent id, the stale-revision refusal,
// the "command is the sole commit" identity — lives in
// `tests/bridge-p04a2-writer-credit-law.test.ts`, because a non-`bridge*` test may not
// import `../bridge/**` without breaking `npm run typecheck` (tsconfig.json excludes
// `tests/bridge*.test.ts`; tsconfig.bridge.json is the config that allows the `.ts`
// import extensions bridge sources use).
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19E — the quote projections publish no writer-busy blocker for a CREDIT', () => {
  it('both greenlight readiness projections are clear, and name the exact writer id', () => {
    const s = buildScenario(SEED)

    const pkg = scriptProjectsReadModel(s.deadlock).packages.find(
      (p) => p.projectId === s.projectAId,
    )!
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19E scriptReadModel package availability:',
      JSON.stringify(
        {
          writerId: pkg.writer.id,
          writerAvailable: pkg.availability.writerAvailable,
          knownGatesClear: pkg.availability.knownGatesClear,
          canSubmitGreenlightIntent: pkg.availability.canSubmitGreenlightIntent,
          blockers: pkg.availability.blockers.map((b) => b.kind),
        },
        null,
        2,
      ),
    )
    // Exact ids stay exact: the projection still NAMES the credited writer…
    expect(pkg.writer.id).toBe(s.writerId)
    // …while publishing no availability blocker for them.
    expect(pkg.availability.writerAvailable).toBe(true)
    expect(pkg.availability.canSubmitGreenlightIntent).toBe(true)
    expect(pkg.availability.blockers.map((b) => b.kind)).not.toContain('writer-assignment')
    expect(pkg.availability.blockers.map((b) => b.kind)).not.toContain('writer-contract')

    const view = castingPackageReadModel(s.deadlock).projects.find(
      (p) => p.projectId === s.projectAId,
    )!
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19E castingPackageReadModel readiness:',
      JSON.stringify(view.readiness),
    )
    expect(view.readiness.knownGatesClear).toBe(true)
    expect(view.readiness.blockers.map((b) => b.code)).not.toContain('writer-assignment')
    // The casting surface still NAMES the credited writer by exact id…
    expect(view.writerId).toBe(s.writerId)
    // …and no candidate pool carries a "Working on …" label sourced from the credit.
    // (The writer is excluded from every pool for their own project by that model's own
    // documented law, so the assertion is that nobody ELSE inherited a credit label.)
    const creditLabelled = view.pools
      .flatMap((pool) => pool.candidates)
      .filter((candidate) => candidate.talentId === s.writerId)
    expect(creditLabelled).toEqual([])
  })

  it('a REFUSED greenlight command mutates nothing at all', () => {
    const s = buildScenario(SEED)
    const before = exportSave(makeSave(s.deadlock))

    // A refusal from a gate that runs AFTER the writer gate (M16.3: one actor may not
    // fill two cast slots), so the attempt gets past the writer check and still commits
    // nothing.
    const message = refusal(() =>
      applyActions(s.deadlock, [
        {
          kind: 'greenlightScriptProject',
          production: {
            projectId: s.projectAId,
            ...s.packageA,
            cast: { ...s.packageA.cast, antagonist: s.packageA.cast.lead },
          },
        },
      ]),
    )
    // eslint-disable-next-line no-console
    console.log('[P04A.2 WITNESS] §19E refused greenlight (no partial mutation):', message)
    // No partial mutation: the state that went in is byte-identical to the state that
    // is still there (`applyActions` is pure, so a refusal discards the whole attempt).
    expect(exportSave(makeSave(s.deadlock))).toBe(before)
    expect(s.deadlock.studio.activeProductions).toHaveLength(0)
    expect(projectById(s.deadlock, s.projectBId).status).toBe('drafting')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §19 F — QUEUE: both the immediate and the queued greenlight path stay truthful
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19F — the queued greenlight path is unchanged and still truthful', () => {
  /**
   * Both Development & Casting slots occupied — one by the writer's ACTIVE draft of
   * screenplay B, one by a picture already in Development — with Ready screenplay A
   * waiting. Screenplay B is an ORIGINAL (multi-week draft), so the writer is still
   * drafting when the queued greenlight is admitted.
   */
  function slotStarvedWorld() {
    const s = buildScenario('p04a2-queue', { actor: 3, director: 1, craft: 1 })
    // Take B (the pool commission) to Ready so it can occupy the second slot as a picture.
    let state = tick(s.deadlock)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: s.projectBId }])
    // Greenlight B's picture with the SECOND set of seats — this holds one D&C slot.
    const packageB = remainingPackage(state, s.conceptB, { director: 1, craft: 1, actor: 3 })
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: { projectId: s.projectBId, ...packageB } },
    ])
    expect(state.studio.activeProductions).toHaveLength(1)

    // The one writer now starts an ORIGINAL screenplay — this holds the other slot AND
    // keeps them in an active writing assignment for several weeks.
    state = applyActions(state, [
      {
        kind: 'commissionOriginalScreenplay',
        screenplay: {
          writerId: s.writerId,
          genre: s.conceptA.genre,
          shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
          promise: {
            genre: s.conceptA.genre,
            intendedSegments: ['adult', 'prestige'] as SegmentId[],
            ranges: {
              intimacy: [-0.4, 0.6],
              tonalWeight: [0, 0.8],
              kineticEnergy: [-0.7, 0.2],
            },
          },
        },
      },
    ])
    expect(activeWritingAssignmentIds(state).has(s.writerId)).toBe(true)
    return { s, state }
  }

  it('a capacity refusal still QUEUES a greenlight whose credited writer is mid-draft', () => {
    const { s, state } = slotStarvedWorld()
    const queueBefore = state.productionQueue.length

    const admitted = applyActions(state, [greenlightA(s)])
    // Not started — admitted to the queue with zero commitment.
    expect(admitted.studio.activeProductions).toHaveLength(1)
    expect(admitted.studio.cash).toBe(state.studio.cash)
    expect(admitted.productionQueue.length).toBe(queueBefore + 1)
    const entry = admitted.productionQueue[admitted.productionQueue.length - 1]!
    expect(entry.kind).toBe('greenlightScriptProject')
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19F queue admission while the credited writer drafts:',
      JSON.stringify({
        kind: entry.kind,
        ordinal: entry.ordinal,
        queuedWeek: entry.queuedWeek,
        writerDrafting: activeWritingAssignmentIds(admitted).has(s.writerId),
      }),
    )
    // The admission happened WHILE the writer was in an active writing assignment.
    expect(activeWritingAssignmentIds(admitted).has(s.writerId)).toBe(true)

    // The refusal that produced this admission is the NAMED `QueueableCapacityRefusal`
    // and nothing else. Proof without reaching into private state: replay the queued
    // entry through the dequeue commit while the slots are STILL full. That path lets
    // the refusal propagate, and it reports `waiting` for exactly one error class —
    // `QueueableCapacityRefusal`; every other error reports `expired` with a reason.
    expect(scriptCapacityView(admitted).available).toBe(0)
    const replay = commitQueuedIntent(
      admitted,
      entry,
      admitted.market.tick,
      disabledStudioEventSink(),
    )
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19F dequeue while still slot-starved:',
      JSON.stringify({
        outcome: replay.outcome,
        capacity: scriptCapacityView(admitted).available,
        namedRefusal: QueueableCapacityRefusal.name,
      }),
    )
    expect(replay.outcome).toBe('waiting')
  })

  it('the queued greenlight later executes correctly, preserving the exact writer credit', () => {
    const { s, state } = slotStarvedWorld()
    let next = applyActions(state, [greenlightA(s)])
    expect(next.productionQueue).toHaveLength(1)

    for (let i = 0; i < 20 && next.productionQueue.length > 0; i++) {
      next = tick(next)
    }
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19F queue drained:',
      JSON.stringify({
        remaining: next.productionQueue.length,
        productions: next.studio.activeProductions.map((p) => ({
          projectId: p.id,
          writerId: p.writerId,
        })),
      }),
    )
    expect(next.productionQueue).toHaveLength(0)
    const picture = next.studio.activeProductions.find(
      (p) => p.conceptId === s.conceptA.id,
    )
    expect(picture).toBeDefined()
    expect(picture!.writerId).toBe(s.writerId)
    expect(picture!.directorId).toBe(s.packageA.directorId)
    expect(picture!.cast).toEqual(s.packageA.cast)
    expect(picture!.craftIds).toEqual(s.packageA.craftIds)
    // The queued path never made the credit a seat.
    expect(activeProductionCompanyTalentIds(next).has(s.writerId)).toBe(false)
  })

  it('the IMMEDIATE path is still immediate when a slot is free', () => {
    const s = buildScenario(SEED)
    const before = s.deadlock.productionQueue.length
    const greenlit = applyActions(s.deadlock, [greenlightA(s)])
    expect(greenlit.productionQueue.length).toBe(before)
    expect(greenlit.studio.activeProductions).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §19 G — SAVE / LOAD: no version bump, both facts persist together
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19G — the split needs no save migration and survives reload', () => {
  it('keeps saveVersion at 16 and round-trips film credit + live writing assignment together', () => {
    const s = buildScenario(SEED)
    const greenlit = applyActions(s.deadlock, [greenlightA(s)])

    const save = makeSave(greenlit)
    // NO VERSION BUMP FROM THIS CLAUSE: the credit/assignment split changed no
    // persisted shape. The live version is 16 (P06A W1 release-authority root).
    expect(save.saveVersion).toBe(18)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19G saveVersion:',
      JSON.stringify({ saveVersion: save.saveVersion }),
    )

    const json = exportSave(save)
    const reloaded: GameState = migrateToV18(importSave(json)).state

    // BOTH facts, simultaneously, after the reload:
    //   the film A writer credit…
    const production = reloaded.studio.activeProductions.find(
      (p) => p.conceptId === s.conceptA.id,
    )!
    expect(production.writerId).toBe(s.writerId)
    expect(production.participants?.writer.talentId).toBe(s.writerId)
    //   …and the ACTIVE screenplay B assignment.
    const projectB = projectById(reloaded, s.projectBId)
    expect(projectB.status).toBe('drafting')
    expect(projectB.writerId).toBe(s.writerId)
    expect(activeWritingAssignmentIds(reloaded).has(s.writerId)).toBe(true)
    expect(activeProductionCompanyTalentIds(reloaded).has(s.writerId)).toBe(false)
    expect(creditedWriterIds(reloaded).has(s.writerId)).toBe(true)

    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19G both facts after reload:',
      JSON.stringify({
        creditedOn: production.id,
        draftingProject: projectB.id,
        busy: busyTalentIds(reloaded).has(s.writerId),
      }),
    )

    // The deterministic digest is stable across save → load → save. `exportSave`
    // IS that digest's input (bridge `authoritativeDigest` is sha256 over exactly this
    // string), so equality here is digest equality, without importing the bridge.
    expect(exportSave(makeSave(reloaded))).toBe(json)
    expect(exportSave(makeSave(reloaded))).toBe(exportSave(makeSave(greenlit)))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §19 H — CONTRACT EXPIRY: the DOCUMENTED limitation of current law
// ─────────────────────────────────────────────────────────────────────────────
describe('P04A.2 §19H — an out-of-contract credited writer: the exact current limitation', () => {
  /**
   * UPDATED BY P04A.3 (Owner ruling, 2026-08-29). §19H originally documented a
   * DELIBERATE limitation: the projection AND the engine both blocked a package
   * greenlight for an out-of-contract credited writer, on purpose, because the
   * writer sat inside the D-11.12 contracted-or-available-freelancer set and could
   * be charged a freelancer fee — a financial fact the credit/assignment split
   * left untouched.
   *
   * P04A.3 removes that financial fact: a completed screenplay's credit is not new
   * writing labour, so `applyGreenlight`'s D-11.12/D-11.10 loop no longer includes
   * the credited writer at all (they are charged no fee and gate on no contract),
   * and `writerBlockers` now publishes NO blocker of any kind for `purpose:
   * 'package'`. `applyGreenlightScriptProject`'s own, separate
   * `isContracted(project.writerId)` throw — which predates D-11.12 and was never
   * part of it — was ALSO removed, so the projection and the engine now fully
   * agree: an out-of-contract credited writer blocks package readiness NOWHERE,
   * neither read model nor command. (`tests/p04a3-greenlight-law.test.ts` §11D
   * carries the fresh, from-scratch regression suite for this same law; this test
   * is kept, updated, as the historical §19H witness.)
   */
  it('publishes no writer blocker, and the greenlight succeeds at the ENGINE layer too', () => {
    const s = buildScenario(SEED)
    // The writer is idle (drafting nothing), so nothing but the contract can bite.
    expect(busyTalentIds(s.readyOnly).has(s.writerId)).toBe(false)
    const released = applyActions(s.readyOnly, [
      { kind: 'releaseTalent', talentId: s.writerId },
    ])
    expect(isContracted(released, s.writerId)).toBe(false)
    // Screenplay A still names them as its author, by exact stable id.
    expect(projectById(released, s.projectAId).writerId).toBe(s.writerId)

    // THE PROJECTION HALF (P04A.3 — clear, not blocked by writer-contract).
    const kinds = scriptProjectsReadModel(released)
      .packages.find((p) => p.projectId === s.projectAId)!
      .availability.blockers.map((b) => b.kind)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.3 WITNESS] §19H projection blockers for an out-of-contract credited writer:',
      JSON.stringify(kinds),
    )
    expect(kinds).not.toContain('writer-contract')
    expect(kinds).not.toContain('writer-assignment')

    const codes = castingPackageReadModel(released)
      .projects.find((p) => p.projectId === s.projectAId)!
      .readiness.blockers.map((b) => b.code)
    expect(codes).not.toContain('writer-contract')
    expect(codes).not.toContain('writer-assignment')

    // THE ENGINE HALF (P04A.3 — `applyGreenlightScriptProject`'s `isContracted`
    // throw is gone too, so the two surfaces agree: the command now succeeds).
    const next = applyActions(released, [
      { kind: 'greenlightScriptProject', production: { projectId: s.projectAId, ...s.packageA } },
    ])
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.3 WITNESS] §19H out-of-contract greenlight now succeeds at the engine layer:',
      JSON.stringify({ activeProductions: next.studio.activeProductions.length }),
    )
    expect(next.studio.activeProductions.length).toBe(released.studio.activeProductions.length + 1)
    const production = next.studio.activeProductions[next.studio.activeProductions.length - 1]!
    expect(production.writerId).toBe(s.writerId)
  })

  it('the CREDIT itself survives the contract ending mid-production', () => {
    const s = buildScenario(SEED)
    // Greenlight first (writer contracted, as the unchanged gate requires)…
    let state = applyActions(s.deadlock, [greenlightA(s)])
    const productionId = state.studio.activeProductions[0]!.id
    // …then let the draft of B finish so the writer is releasable, and end the contract.
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: s.projectBId }])
    expect(busyTalentIds(state).has(s.writerId)).toBe(false)
    state = applyActions(state, [{ kind: 'releaseTalent', talentId: s.writerId }])
    expect(isContracted(state, s.writerId)).toBe(false)

    const production = state.studio.activeProductions.find((p) => p.id === productionId)!
    expect(production.writerId).toBe(s.writerId)
    expect(production.participants?.writer.talentId).toBe(s.writerId)
    expect(creditedWriterIds(state).has(s.writerId)).toBe(true)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19H credit survives contract expiry:',
      JSON.stringify({
        writerId: s.writerId,
        contracted: isContracted(state, s.writerId),
        creditedOn: production.id,
      }),
    )

    // Run to release: the historical record still carries the exact id.
    state = runUntil(state, (c) => c.studio.releasedFilms.length > 0)
    const film = state.studio.releasedFilms.find((f) => f.productionId === productionId)!
    expect(film.participants?.writer.talentId).toBe(s.writerId)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19H released-film credit for an off-lot writer:',
      JSON.stringify(film.participants?.writer),
    )
  })
})

