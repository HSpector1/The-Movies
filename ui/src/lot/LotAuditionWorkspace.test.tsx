import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type {
  ActionOutcome,
  CastingCandidateView,
  CastingProjectView,
  GameState,
} from '../engine/adapter.ts'
import { LotAuditionWorkspace } from './LotAuditionWorkspace.tsx'

function candidate(id: string, name: string, score: number): CastingCandidateView {
  return {
    id,
    name,
    primaryRole: 'actor',
    fit: { label: 'Fit', score },
    available: true,
    availabilityLabel: 'Studio-contracted and currently available',
  }
}

function planningProject(): CastingProjectView {
  const actors = [
    candidate('actor-a', 'Ari Vale', 76),
    candidate('actor-b', 'Billie North', 69),
    candidate('actor-c', 'Cleo March', 63),
    candidate('actor-d', 'Dev Lane', 57),
  ]
  return {
    projectId: 'script-0000',
    sessionId: null,
    title: 'A Season of Archipelago',
    genre: 'drama',
    writer: { id: 'writer-a', name: 'Wren Sol', primaryRole: 'writer' },
    status: 'notStarted',
    dueWeek: null,
    weeksUntilDecision: null,
    consequence:
      'One week and one shared Development & Casting slot; no casting fee and no talent hold. Payroll and studio overhead continue.',
    candidates: {
      lead: actors.map((actor) => ({ ...actor })),
      antagonist: actors.map((actor) => ({ ...actor })),
      support: actors.map((actor) => ({ ...actor })),
    },
    results: null,
    packageAvailability: null,
    legalActions: [
      { kind: 'planAuditions', projectId: 'script-0000', label: 'Plan auditions' },
    ],
    blockers: [],
  }
}

function rejection(error: string): ActionOutcome {
  return { ok: false, error }
}

describe('Lot-retained audition planning workspace', () => {
  it('reuses the canonical explicit slate, exposes consequence truth, and preserves rejection edits', () => {
    const project = planningProject()
    const exactError = 'No shared Development & Casting slot is currently available.'
    const onSubmit = vi.fn(() => rejection(exactError))
    const onSlateChange = vi.fn()

    render(
      <LotAuditionWorkspace
        phase="editing"
        project={project}
        onCancel={() => {}}
        onOpenDetails={() => {}}
        onSlateChange={onSlateChange}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByTestId('casting-plan-screenplay-context')).toHaveTextContent(
      'Drama screenplay by Wren Sol',
    )
    expect(screen.getByTestId('casting-consequence')).toHaveTextContent(
      project.consequence,
    )
    expect(screen.getByTestId('casting-consequence')).toHaveTextContent('no audition fee')
    expect(screen.getByTestId('casting-consequence')).toHaveTextContent('do not hold an Actor')
    expect(screen.getByTestId('casting-start')).toBeDisabled()

    for (const slot of ['lead', 'antagonist', 'support'] as const) {
      fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-actor-a`))
      fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-actor-b`))
    }
    expect(onSlateChange).toHaveBeenCalledTimes(6)
    expect(screen.getByTestId('casting-unique-count')).toHaveTextContent('2 different actors')
    expect(screen.getByTestId('casting-start')).toBeDisabled()

    // A full pair makes the neighboring option inert. This is not a slate
    // revision and cannot clear an App-owned rejected-attempt guard.
    fireEvent.click(screen.getByTestId('casting-candidate-lead-actor-c'))
    expect(onSlateChange).toHaveBeenCalledTimes(6)

    fireEvent.click(screen.getByTestId('casting-candidate-support-actor-b'))
    fireEvent.click(screen.getByTestId('casting-candidate-support-actor-c'))
    expect(onSlateChange).toHaveBeenCalledTimes(8)
    expect(screen.getByTestId('casting-start')).toBeEnabled()

    fireEvent.click(screen.getByTestId('casting-start'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenLastCalledWith({
      lead: ['actor-a', 'actor-b'],
      antagonist: ['actor-a', 'actor-b'],
      support: ['actor-a', 'actor-c'],
    })
    expect(screen.getByTestId('casting-planner-error')).toHaveTextContent(exactError)
    expect(screen.getByTestId('casting-candidate-support-actor-c')).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByTestId('casting-candidate-support-actor-c'))
    expect(onSlateChange).toHaveBeenCalledTimes(9)
    expect(screen.queryByTestId('casting-planner-error')).not.toBeInTheDocument()
  })

  it('contains focus, Escape, scroll, scrim, details, and cancel inside the one retained owner', async () => {
    const onCancel = vi.fn()
    const onOpenDetails = vi.fn()
    render(
      <LotAuditionWorkspace
        phase="editing"
        project={planningProject()}
        onCancel={onCancel}
        onOpenDetails={onOpenDetails}
        onSubmit={() => rejection('not used')}
      />,
    )

    const layer = screen.getByTestId('lot-audition-workspace-layer')
    const dialog = screen.getByRole('dialog', { name: /plan camera tests/i })
    const close = screen.getByTestId('lot-audition-workspace-close')
    const details = screen.getByTestId('lot-audition-workspace-details')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(document.body.style.overflow).toBe('hidden')
    await waitFor(() => expect(close).toHaveFocus())

    fireEvent.click(layer)
    expect(onCancel).not.toHaveBeenCalled()
    fireEvent.click(details)
    expect(onOpenDetails).toHaveBeenCalledTimes(1)
    fireEvent.click(close)
    expect(onCancel).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(2)

    details.focus()
    fireEvent.keyDown(details, { key: 'Tab', shiftKey: true })
    expect(screen.getByTestId('casting-candidate-support-actor-d')).toHaveFocus()
  })

  it('disables a prepared slate when current candidate or planning authority becomes stale', () => {
    const project = planningProject()
    const onSubmit = vi.fn((): ActionOutcome => ({
      ok: true,
      next: {} as GameState,
    }))
    const view = render(
      <LotAuditionWorkspace
        phase="editing"
        project={project}
        onCancel={() => {}}
        onOpenDetails={() => {}}
        onSubmit={onSubmit}
      />,
    )

    for (const [slot, pair] of [
      ['lead', ['actor-a', 'actor-b']],
      ['antagonist', ['actor-a', 'actor-b']],
      ['support', ['actor-a', 'actor-c']],
    ] as const) {
      for (const id of pair) {
        fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-${id}`))
      }
    }
    expect(screen.getByTestId('casting-start')).toBeEnabled()

    const stale = planningProject()
    stale.candidates.lead[0] = {
      ...stale.candidates.lead[0]!,
      available: false,
      availabilityLabel: 'Currently assigned to another production or screenplay',
    }
    view.rerender(
      <LotAuditionWorkspace
        phase="editing"
        project={stale}
        onCancel={() => {}}
        onOpenDetails={() => {}}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByTestId('casting-candidate-lead-actor-a')).toBeDisabled()
    expect(screen.getByTestId('casting-start')).toBeDisabled()
    fireEvent.click(screen.getByTestId('casting-start'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows a bounded noninteractive recording phase without a duplicate live announcement', async () => {
    const onCancel = vi.fn()
    const { rerender } = render(
      <LotAuditionWorkspace
        phase="editing"
        project={planningProject()}
        onCancel={onCancel}
        onOpenDetails={() => {}}
        onSubmit={() => rejection('not used')}
      />,
    )

    rerender(
      <LotAuditionWorkspace
        phase="committed"
        project={planningProject()}
        onCancel={onCancel}
        onOpenDetails={() => {}}
        onSubmit={() => rejection('not used')}
      />,
    )

    const recording = screen.getByTestId('lot-audition-workspace-recording')
    expect(recording).toHaveTextContent('Recording camera tests for A Season of Archipelago')
    expect(recording).not.toHaveAttribute('role')
    expect(recording).not.toHaveAttribute('aria-live')
    expect(screen.queryByTestId('casting-planner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-audition-workspace-close')).not.toBeInTheDocument()
    const dialog = screen.getByRole('dialog')
    await waitFor(() => expect(dialog).toHaveFocus())
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })
})
