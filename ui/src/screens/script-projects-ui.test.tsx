import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  advanceWeek,
  advanceToNextEvent,
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  scriptProjectsBoard,
  signContractAction,
} from '../engine/adapter.ts'
import type { CommissionScriptPayload, CreativeRole, GameState } from '../engine/adapter.ts'
import { WritersRoom } from './WritersRoom.tsx'

afterEach(cleanup)

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const ids = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
      .map((card) => card.profile.id)
    for (const id of ids) {
      const signed = signContractAction(state, id, 104)
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
  const writer = board.commission.writers.find((candidate) => candidate.available)!
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'slowSetup',
      midpoint: 'reversal',
      ending: 'bittersweet',
    },
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

function commissionedStudio(seed: string): GameState {
  const state = managedStudio(seed)
  const result = commissionScriptAction(state, commissionPayload(state))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function reviewStudio(seed: string): GameState {
  return advanceWeek(commissionedStudio(seed)).next
}

function twoReviewStudio(seed: string): GameState {
  let state = reviewStudio(seed)
  const second = commissionScriptAction(state, commissionPayload(state))
  if (!second.ok) throw new Error(second.error)
  return advanceWeek(second.next).next
}

function Harness({
  initial,
  onOpenPackage = () => {},
}: {
  initial: GameState
  onOpenPackage?: (projectId: string) => void
}) {
  const [state, setState] = useState(initial)
  return (
    <WritersRoom
      state={state}
      onChange={setState}
      onOpenPackage={onOpenPackage}
      onBack={() => {}}
    />
  )
}

describe('Writers Room — managed screenplay workspace', () => {
  it('stops unattended simulation exactly at screenplay review, including preflight', () => {
    const drafting = commissionedStudio('writers-room-sim-stop')
    const stopped = advanceToNextEvent(drafting)
    expect(stopped.stopReason).toBe('scriptReview')
    expect(stopped.weeks).toBe(1)
    expect(stopped.scriptDecision?.projectId).toBe('script-0000')
    expect(stopped.next.scriptDevelopment.projects[0]?.status).toBe('review')

    const preflight = advanceToNextEvent(stopped.next)
    expect(preflight.stopReason).toBe('scriptReview')
    expect(preflight.weeks).toBe(0)
    expect(preflight.next).toBe(stopped.next)
    expect(preflight.stopMessage).toContain('Writers’ Room')
  })

  it('commissions through explicit concept, writer, shape, and audience controls with exact capacity truth', async () => {
    render(<Harness initial={managedStudio('writers-room-commission')} />)

    expect(screen.getByTestId('script-capacity-summary')).toHaveTextContent(
      '0 of 2 slots occupied · 2 available',
    )
    fireEvent.click(screen.getByTestId('commission-open'))
    expect(screen.getByTestId('script-concept')).toBeInTheDocument()
    expect(screen.getByTestId('script-writer')).toBeInTheDocument()
    expect(screen.getByTestId('script-shape-opening')).toBeInTheDocument()
    expect(screen.getByTestId('script-shape-midpoint')).toBeInTheDocument()
    expect(screen.getByTestId('script-shape-ending')).toBeInTheDocument()
    expect(screen.getByTestId('script-segment-adult')).toBeChecked()
    expect(screen.getByTestId('commission-consequence')).toHaveTextContent(
      'One week passes while the writer and one Development & Casting slot are occupied',
    )
    expect(screen.getByTestId('commission-consequence')).toHaveTextContent(
      'No separate screenplay acquisition fee is charged',
    )

    fireEvent.change(screen.getByTestId('script-shape-opening'), {
      target: { value: 'mysteryHook' },
    })
    fireEvent.click(screen.getByTestId('script-segment-family'))
    fireEvent.click(screen.getByTestId('commission-submit'))

    await waitFor(() =>
      expect(screen.getByTestId('script-capacity-summary')).toHaveTextContent(
        '1 of 2 slots occupied · 1 available',
      ),
    )
    expect(screen.getByTestId('script-section-inDevelopment-cards')).toBeInTheDocument()
    expect(screen.getByText('Drafting')).toBeInTheDocument()
    expect(screen.getByText('1 week until review')).toBeInTheDocument()
  })

  it('shows a one-week review using only the Est assessment and requests the bounded rewrite', async () => {
    const initial = reviewStudio('writers-room-review')
    const projectId = initial.scriptDevelopment.projects[0]!.id
    const { container } = render(<Harness initial={initial} />)

    expect(screen.getByTestId(`script-status-${projectId}`)).toHaveTextContent('Needs review')
    const assessment = screen.getByTestId(`script-assessment-${projectId}`)
    expect(assessment).toHaveTextContent('Est.')
    expect(assessment).toHaveTextContent(/Fragile|Workable|Promising|Strong/)
    expect(container.textContent).not.toContain('actualStrength')
    expect(container.textContent).not.toContain('baselineStrength')
    expect(container.textContent).not.toContain('ceiling')
    expect(container.textContent).not.toContain('rngState')
    expect(screen.getByTestId(`script-action-acceptScript-${projectId}`)).toBeInTheDocument()

    const rewrite = screen.getByTestId(`script-action-requestScriptRewrite-${projectId}`)
    rewrite.focus()
    fireEvent.click(rewrite)
    const status = await screen.findByTestId(`script-status-${projectId}`)
    await waitFor(() => expect(status).toHaveTextContent('Rewriting'))
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveFocus()
    expect(screen.getByTestId('script-capacity-summary')).toHaveTextContent(
      '1 of 2 slots occupied · 1 available',
    )
  })

  it('moves Accept focus to the same project’s Ready successor and opens its locked package', async () => {
    const initial = reviewStudio('writers-room-ready')
    const projectId = initial.scriptDevelopment.projects[0]!.id
    const onOpenPackage = vi.fn()
    render(<Harness initial={initial} onOpenPackage={onOpenPackage} />)

    const accept = screen.getByTestId(`script-action-acceptScript-${projectId}`)
    accept.focus()
    fireEvent.click(accept)

    const openPackage = await screen.findByTestId(`script-action-openPackage-${projectId}`)
    await waitFor(() => expect(openPackage).toHaveFocus())
    expect(screen.getByTestId(`script-status-${projectId}`)).toHaveTextContent('Ready to package')
    fireEvent.click(openPackage)
    expect(onOpenPackage).toHaveBeenCalledTimes(1)
    expect(onOpenPackage).toHaveBeenCalledWith(projectId)
  })

  it('keeps focus on the acted-on project when another review card precedes it', async () => {
    const initial = twoReviewStudio('writers-room-multi-focus')
    const projectIds = initial.scriptDevelopment.projects.map((project) => project.id)
    expect(projectIds).toEqual(['script-0000', 'script-0001'])
    render(<Harness initial={initial} />)

    const firstAccept = screen.getByTestId('script-action-acceptScript-script-0000')
    const secondAccept = screen.getByTestId('script-action-acceptScript-script-0001')
    secondAccept.focus()
    fireEvent.click(secondAccept)

    const secondSuccessor = await screen.findByTestId('script-action-openPackage-script-0001')
    await waitFor(() => expect(secondSuccessor).toHaveFocus())
    expect(firstAccept).toBeInTheDocument()
    expect(screen.getByTestId('script-status-script-0000')).toHaveTextContent('Needs review')
    expect(screen.getByTestId('script-status-script-0001')).toHaveTextContent('Ready to package')
  })
})
