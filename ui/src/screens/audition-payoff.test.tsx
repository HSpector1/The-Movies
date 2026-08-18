// ── R3: the audition payoff at the casting → package seam ────────────────────
// The 00F Movie #2 gate asks every surface to answer WHAT HAPPENED, WHY IT MATTERS,
// WHAT DO I DO NEXT. Before this lane the middle answer evaporated at the exact moment
// it should pay off: the Camera-test evidence card said "these two read for Lead", and
// then the cast pickers listed the whole assignable roster with nothing marking the two
// people who actually read.
//
// These tests drive the REAL seam — found a managed studio, commission and accept a
// screenplay, run a casting session, acknowledge the review, open the package — and
// assert against the ENGINE's own persisted observations, never against fixtures. If
// the picker's numbers ever stop being the engine's numbers, this fails.
//
// The engine's law is pinned here too, because carrying evidence must not become
// obeying it: auditions select nobody, filter nobody, and disqualify nobody.

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import {
  acknowledgeCastingSessionAction,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
} from '../engine/adapter.ts'
import type {
  CastingProjectView,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  StartCastingSessionPayload,
} from '../engine/adapter.ts'
import { Assembly } from './Assembly.tsx'
import { auditionReadSentence, auditionReadsForPackage } from '../presentation/auditionEvidence.ts'

afterEach(cleanup)

const FOUNDING_COUNTS: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 1, craft: 1 }

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function commissionPayload(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer =
    board.commission.writers.find(
      (candidate) => candidate.available && candidate.primaryRole === 'writer',
    ) ?? board.commission.writers.find((candidate) => candidate.available)!
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15],
        tonalWeight: [-0.65, 0.15],
        kineticEnergy: [-0.65, 0.15],
      },
    },
  }
}

function readyStudio(seed: string): GameState {
  let state = managedStudio(seed)
  const commissioned = commissionScriptAction(state, commissionPayload(state))
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = advanceWeek(commissioned.next).next
  const accept = scriptProjectsBoard(state).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )!
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  return accepted.next
}

function legalSlate(state: GameState): StartCastingSessionPayload {
  const project = castingSessionsBoard(state).sections.readyToPlan[0]!
  const ids = project.candidates.lead.map((candidate) => candidate.id)
  if (ids.length < 3) throw new Error('setup: fewer than three casting candidates')
  return {
    projectId: project.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!],
      antagonist: [ids[0]!, ids[1]!],
      support: [ids[0]!, ids[2]!],
    },
  }
}

/** A studio whose casting session has run AND been acknowledged — the package moment. */
function packagedStudio(seed: string): { state: GameState; project: CastingProjectView } {
  const ready = readyStudio(seed)
  const started = startCastingSessionAction(ready, legalSlate(ready))
  if (!started.ok) throw new Error(started.error)
  const reviewed = advanceWeek(started.next).next
  const sessionId = castingSessionsBoard(reviewed).sections.needsReview[0]!.sessionId!
  const complete = acknowledgeCastingSessionAction(reviewed, sessionId)
  if (!complete.ok) throw new Error(complete.error)
  const project = Object.values(castingSessionsBoard(complete.next).sections)
    .flat()
    .find((candidate) => candidate.sessionId === sessionId)!
  return { state: complete.next, project }
}

function openPackage(seed: string): { state: GameState; project: CastingProjectView } {
  const packaged = packagedStudio(seed)
  render(
    <Assembly
      state={packaged.state}
      scriptProjectId={packaged.project.projectId}
      onGreenlit={() => {}}
      onCancel={() => {}}
    />,
  )
  return packaged
}

describe('R3 · the audition payoff carries to the moment of cast choice', () => {
  it('badges everyone who read for the role and shows the engine’s own observation', () => {
    const { project } = openPackage('audition-payoff-badge')
    const reads = project.results!.lead
    expect(reads.length).toBeGreaterThan(0)

    const picker = within(screen.getByTestId('picker-lead'))
    for (const read of reads) {
      // The badge: this person read for THIS role.
      expect(picker.getByTestId(`talent-${read.talentId}-auditioned`)).toHaveTextContent(
        'Auditioned',
      )
      // The evidence: the same numbers the Camera-test evidence card showed upstream.
      const line = picker.getByTestId(`talent-${read.talentId}-audition-read`)
      expect(line).toHaveTextContent(`Est. ${read.estimate}`)
      expect(line).toHaveTextContent(`${read.low}–${read.high}`)
      expect(line).toHaveTextContent(`camera-test Fit ${read.fit.score}`)
      // No engine identity in the sentence the player reads.
      expect(line.textContent ?? '').not.toContain(read.talentId)
    }
  })

  it('marks everyone else honestly instead of leaving them ambiguous', () => {
    const { state, project } = openPackage('audition-payoff-honest')
    const readIds = new Set(project.results!.lead.map((read) => read.talentId))
    const picker = within(screen.getByTestId('picker-lead'))
    const listed = state.talent
      .filter((talent) => talent.role === 'actor')
      .filter((talent) => picker.queryByTestId(`talent-${talent.id}`) !== null)
    const unread = listed.filter((talent) => !readIds.has(talent.id))
    expect(unread.length).toBeGreaterThan(0)

    for (const talent of unread) {
      const line = picker.getByTestId(`talent-${talent.id}-no-audition`)
      expect(line).toHaveTextContent('Did not read for Lead')
      expect(line).toHaveTextContent('No camera-test evidence for this role')
      // Not auditioning is not a defect: no card claims otherwise.
      expect(picker.queryByTestId(`talent-${talent.id}-auditioned`)).toBeNull()
    }
  })

  it('lists the people who read first, and says so in a sentence that counts them', () => {
    const { project } = openPackage('audition-payoff-order')
    const readIds = new Set(project.results!.lead.map((read) => read.talentId))
    const picker = within(screen.getByTestId('picker-lead'))

    const cards = picker
      .getAllByRole('button')
      .filter((button) => button.hasAttribute('aria-pressed'))
      .map((button) => button.getAttribute('data-testid')!.replace(/^talent-/, ''))
    const lastRead = cards.reduce((last, id, i) => (readIds.has(id) ? i : last), -1)
    const firstUnread = cards.findIndex((id) => !readIds.has(id))
    expect(lastRead).toBeGreaterThanOrEqual(0)
    expect(firstUnread).toBeGreaterThan(lastRead)

    expect(screen.getByTestId('picker-lead-auditioned-group')).toBeInTheDocument()
    expect(screen.getByTestId('picker-lead-not-auditioned-group')).toBeInTheDocument()
    const note = screen.getByTestId('picker-lead-audition-note')
    expect(note).toHaveTextContent(`${readIds.size} of the candidates below read for Lead`)
    expect(note).toHaveTextContent('A read is evidence, not a choice')
  })

  it('carries the reads per role — a Support read never badges the Lead picker', () => {
    const { project } = openPackage('audition-payoff-per-role')
    const supportOnly = project.results!.support
      .map((read) => read.talentId)
      .filter((id) => !project.results!.lead.some((read) => read.talentId === id))
    expect(supportOnly.length).toBeGreaterThan(0)

    for (const id of supportOnly) {
      expect(within(screen.getByTestId('picker-support')).getByTestId(`talent-${id}-auditioned`))
        .toBeInTheDocument()
      expect(within(screen.getByTestId('picker-lead')).queryByTestId(`talent-${id}-auditioned`))
        .toBeNull()
    }
  })

  it('carries into the Lot package workspace, which packages through this same wizard', () => {
    // The Lot's workspace is a presentation adapter over the canonical Assembly (App
    // renders <Assembly surface="lot-workspace"> inside LotPackageWorkspace), so the
    // payoff must survive the surface swap rather than being re-implemented there.
    const { state, project } = packagedStudio('audition-payoff-lot-surface')
    render(
      <Assembly
        surface="lot-workspace"
        state={state}
        scriptProjectId={project.projectId}
        onGreenlit={() => {}}
        onCancel={() => {}}
      />,
    )
    const read = project.results!.lead[0]!
    const picker = within(screen.getByTestId('picker-lead'))
    expect(picker.getByTestId(`talent-${read.talentId}-auditioned`)).toHaveTextContent('Auditioned')
    expect(picker.getByTestId(`talent-${read.talentId}-audition-read`)).toHaveTextContent(
      `Est. ${read.estimate}`,
    )
    expect(screen.getByTestId('picker-lead-auditioned-group')).toBeInTheDocument()
  })

  it('keeps the engine’s law: evidence, not commitment', () => {
    const { state, project } = openPackage('audition-payoff-law')
    const readIds = new Set(project.results!.lead.map((read) => read.talentId))

    // The honest line the seam already carried survives, word for word.
    expect(screen.getByTestId('assembly-casting-evidence')).toHaveTextContent(
      'Auditions did not preselect anyone',
    )

    const picker = within(screen.getByTestId('picker-lead'))
    const cards = picker.getAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'))
    // Nothing is pre-selected — a read did not choose anyone.
    expect(cards.every((card) => card.getAttribute('aria-pressed') === 'false')).toBe(true)
    // Nothing is filtered out — every actor in the package pool is still listed.
    const listedIds = cards.map((card) => card.getAttribute('data-testid')!.replace(/^talent-/, ''))
    expect(listedIds.length).toBeGreaterThan(readIds.size)

    // And a candidate who never read is still choosable: click one and it takes the role.
    const unreadId = listedIds.find((id) => !readIds.has(id))!
    const unreadCard = picker.getByTestId(`talent-${unreadId}`)
    expect(unreadCard).not.toBeDisabled()
    fireEvent.click(unreadCard)
    expect(picker.getByTestId(`talent-${unreadId}`)).toHaveAttribute('aria-pressed', 'true')
    expect(state.talent.some((talent) => talent.id === unreadId)).toBe(true)
  })
})

describe('R3 · the evidence module carries the session, and nothing else', () => {
  it('projects one read per candidate per role, straight from the persisted session', () => {
    const { project } = packagedStudio('audition-payoff-module')
    const reads = auditionReadsForPackage(project)!
    for (const slot of ['lead', 'antagonist', 'support'] as const) {
      expect(reads[slot].size).toBe(project.results![slot].length)
      for (const evidence of project.results![slot]) {
        expect(reads[slot].get(evidence.talentId)).toEqual({
          talentId: evidence.talentId,
          estimate: evidence.estimate,
          low: evidence.low,
          high: evidence.high,
          fit: evidence.fit.score,
        })
      }
    }
  })

  it('has no reads to carry for a picture that never auditioned', () => {
    // A screenplay that has not run a casting session yet: honest absence, not an
    // empty badge. The pickers fall back to their ordinary grouping-free list.
    const ready = readyStudio('audition-payoff-none')
    const project = castingSessionsBoard(ready).sections.readyToPlan[0]!
    expect(project.results).toBeNull()
    expect(auditionReadsForPackage(project)).toBeNull()
    expect(auditionReadsForPackage(undefined)).toBeNull()
  })

  it('never leaves the player holding two numbers called Fit with no account of them', () => {
    const read = { talentId: 'talent-4', estimate: 62, low: 55, high: 69, fit: 71 }
    // Same Fit: one number, said once.
    expect(auditionReadSentence('Lead', read, 71.2)).toBe(
      'Read for Lead — Est. 62, observed range 55–69, camera-test Fit 71.',
    )
    // Different Fit: the card's own badge is named, so neither number is a mystery.
    expect(auditionReadSentence('Lead', read, 64.4)).toBe(
      'Read for Lead — Est. 62, observed range 55–69, camera-test Fit 71.' +
        ' This package now reads Fit 64 for the role.',
    )
  })
})
