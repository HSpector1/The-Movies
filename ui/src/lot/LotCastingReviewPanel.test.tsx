import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LotCastingReviewPanel } from './LotCastingReviewPanel.tsx'
import type {
  LotCastingReviewContext,
  LotCastingReviewEvidence,
} from './snapshot/castingReview.ts'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function evidence(
  talentId: string,
  name: string,
  estimate: number,
  low: number,
  high: number,
  fit: number,
  available: boolean,
  availabilityLabel: string,
  strengths: string[],
  concerns: string[],
): LotCastingReviewEvidence {
  return {
    talentId,
    name,
    label: 'Est.',
    estimate,
    low,
    high,
    fit: { label: 'Fit', score: fit },
    available,
    availabilityLabel,
    strengths,
    concerns,
  }
}

const blockedContext: LotCastingReviewContext = {
  kind: 'casting-review',
  sessionId: 'casting-midnight',
  projectId: 'script-midnight',
  title: 'A Fraction of Midnight',
  genre: 'drama',
  writer: {
    id: 'talent-octavia-long-name',
    name: 'Octavia Montgomery-Smythe',
    primaryRole: 'writer',
  },
  consequence: 'Review is immediate and always legal; results remain advisory and select no winner.',
  roles: [
    {
      slot: 'lead',
      label: 'Lead',
      evidence: [
        evidence(
          'talent-lead-a',
          'Leonie Winter-Solano',
          65,
          59,
          71,
          71.25,
          true,
          'Studio-contracted and currently available',
          ['The camera test suggests a promising role read.'],
          ['This remains a noisy observation, not a performance guarantee.'],
        ),
        evidence(
          'talent-lead-b',
          'Marlon Ostrow',
          53,
          47,
          59,
          66,
          false,
          'Currently assigned to another production or screenplay',
          ['The camera test suggests a workable role read.'],
          ['The observed range includes a fragile role read.'],
        ),
      ],
    },
    {
      slot: 'antagonist',
      label: 'Antagonist',
      evidence: [
        evidence(
          'talent-antagonist-a',
          'Sofia Bell',
          76,
          70,
          82,
          74,
          true,
          'Available in the current freelancer market',
          ['The full observed camera-test range is strong for this role.'],
          ['This remains a noisy observation, not a performance guarantee.'],
        ),
        evidence(
          'talent-antagonist-b',
          'Elias North',
          43,
          37,
          49,
          58.5,
          false,
          'Not currently contracted or in the freelancer market',
          [],
          ['Even the top of this observed range is fragile for the role.'],
        ),
      ],
    },
    {
      slot: 'support',
      label: 'Support',
      evidence: [
        evidence(
          'talent-support-a',
          'Nia Okafor',
          61,
          55,
          67,
          63,
          true,
          'Studio-contracted and currently available',
          ['The camera test suggests a promising role read.'],
          [],
        ),
        evidence(
          'talent-support-b',
          'Theo Marchand',
          49,
          43,
          55,
          60,
          true,
          'Available in the current freelancer market',
          ['The camera test suggests a workable role read.'],
          ['The observed range includes a fragile role read.'],
        ),
      ],
    },
  ],
  packageAvailability: {
    knownGatesClear: false,
    writerAvailable: true,
    staffingAvailable: false,
    productionSlotAvailable: false,
    developmentCastingSlotAvailable: true,
    blockers: [
      {
        kind: 'package-staffing',
        headline: 'The package still needs complete staffing',
        detail: 'Choose one available Director, three available cast members, and one craft lead.',
        remedy: 'Review current availability before opening the package.',
      },
      {
        kind: 'production-capacity',
        headline: 'No production slot is available',
        detail: 'The active production board has no open slot for another picture.',
        remedy: 'Wait for a current picture to release its production slot.',
      },
    ],
  },
  blockers: [
    'The package still needs complete staffing',
    'No production slot is available',
  ],
  action: {
    kind: 'acknowledgeCastingSession',
    sessionId: 'casting-midnight',
    projectId: 'script-midnight',
    label: 'Finish casting review',
    opensPackage: false,
  },
}

const inputBoundary = Object.freeze({ state: 'rendered-casting-review' })

function clearContext(): LotCastingReviewContext {
  return {
    ...blockedContext,
    sessionId: 'casting-clear',
    projectId: 'script-clear',
    title: 'The Fading Constellation',
    packageAvailability: {
      knownGatesClear: true,
      writerAvailable: true,
      staffingAvailable: true,
      productionSlotAvailable: true,
      developmentCastingSlotAvailable: true,
      blockers: [],
    },
    blockers: [],
    action: {
      kind: 'acknowledgeCastingSession',
      sessionId: 'casting-clear',
      projectId: 'script-clear',
      label: 'Take results to Package',
      opensPackage: true,
    },
  }
}

describe('LotCastingReviewPanel', () => {
  it('renders all six advisory rows in frozen role order and keeps the exact action before deep detail', async () => {
    const onAction = vi.fn()
    const onOpenDetails = vi.fn()
    const headingRef = { current: null as HTMLHeadingElement | null }

    render(
      <LotCastingReviewPanel
        ref={headingRef}
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
        onOpenDetails={onOpenDetails}
      />,
    )

    const panel = screen.getByTestId('lot-casting-review-panel')
    expect(panel).toHaveAttribute('data-session-id', 'casting-midnight')
    expect(panel).toHaveAttribute('data-project-id', 'script-midnight')
    expect(panel).toHaveAttribute('data-opens-package', 'false')
    expect(screen.getByTestId('lot-casting-review-heading')).toBe(headingRef.current)
    // M-B: genre + writer, never `script-0000 · casting-0000`. The ids stay on the
    // panel's provenance attributes asserted three lines above.
    expect(screen.getByTestId('lot-casting-review-identity')).toHaveTextContent(
      'Drama · Writer Octavia Montgomery-Smythe',
    )
    const identityText = screen.getByTestId('lot-casting-review-identity').textContent ?? ''
    expect(identityText).not.toContain('script-midnight')
    expect(identityText).not.toContain('casting-midnight')
    expect(screen.getByTestId('lot-casting-review-genre')).toHaveTextContent('drama')
    expect(screen.getByTestId('lot-casting-review-writer')).toHaveTextContent(
      'Octavia Montgomery-Smythe',
    )
    expect(screen.getByTestId('lot-casting-review-writer-role')).toHaveTextContent('Writer')
    expect(screen.getByTestId('lot-casting-review-consequence')).toHaveTextContent(
      blockedContext.consequence,
    )

    const roleSections = within(screen.getByTestId('lot-casting-review-roles'))
      .getAllByRole('heading', { level: 4 })
    expect(roleSections.map((heading) => heading.textContent)).toEqual([
      'Lead',
      'Antagonist',
      'Support',
    ])

    const rows = screen.getAllByTestId(/^lot-casting-review-row-(lead|antagonist|support)-\d$/)
    expect(rows).toHaveLength(6)
    expect(rows.map((row) => row.getAttribute('data-talent-id'))).toEqual([
      'talent-lead-a',
      'talent-lead-b',
      'talent-antagonist-a',
      'talent-antagonist-b',
      'talent-support-a',
      'talent-support-b',
    ])

    for (const role of blockedContext.roles) {
      for (const [index, result] of role.evidence.entries()) {
        expect(screen.getByTestId(`lot-casting-review-name-${role.slot}-${index}`))
          .toHaveTextContent(result.name)
        expect(screen.getByTestId(`lot-casting-review-talent-id-${role.slot}-${index}`))
          .toHaveTextContent(`Talent ${result.talentId}`)
        const estimate = screen.getByTestId(`lot-casting-review-estimate-${role.slot}-${index}`)
        expect(estimate).toHaveTextContent(`${result.estimate} · ${result.low}–${result.high}`)
        expect(estimate.querySelector('data')).toHaveAttribute('value', String(result.estimate))
        const fit = screen.getByTestId(`lot-casting-review-fit-${role.slot}-${index}`)
        expect(fit).toHaveTextContent(String(result.fit.score))
        expect(fit.querySelector('data')).toHaveAttribute('value', String(result.fit.score))
        const availability = screen.getByTestId(
          `lot-casting-review-availability-${role.slot}-${index}`,
        )
        expect(availability).toHaveTextContent(result.available ? 'Available' : 'Unavailable')
        expect(availability).toHaveTextContent(result.availabilityLabel)

        const strengthOwner = screen.queryByTestId(
          `lot-casting-review-strengths-${role.slot}-${index}`,
        )
        if (result.strengths.length === 0) {
          expect(strengthOwner).not.toBeInTheDocument()
        } else {
          expect(within(strengthOwner!).getAllByRole('listitem').map((item) => item.textContent))
            .toEqual(result.strengths)
        }
        const concernOwner = screen.queryByTestId(
          `lot-casting-review-concerns-${role.slot}-${index}`,
        )
        if (result.concerns.length === 0) {
          expect(concernOwner).not.toBeInTheDocument()
        } else {
          expect(within(concernOwner!).getAllByRole('listitem').map((item) => item.textContent))
            .toEqual(result.concerns)
        }
      }
    }

    expect(screen.getByTestId('lot-casting-review-package-state'))
      .toHaveTextContent('Package gates blocked')
    const blockers = screen.getAllByTestId('lot-casting-review-blocker')
    expect(blockers).toHaveLength(2)
    for (const [index, blocker] of blockedContext.packageAvailability.blockers.entries()) {
      expect(blockers[index]).toHaveTextContent(blocker.headline)
      expect(blockers[index]).toHaveTextContent(blocker.detail)
      expect(blockers[index]).toHaveTextContent(`Remedy: ${blocker.remedy}`)
    }

    const actionGroup = screen.getByRole('group', { name: 'Casting review actions' })
    const buttons = within(actionGroup).getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Finish casting review',
      'Open Casting Room details',
    ])
    expect(buttons.every((button) => button.getAttribute('type') === 'button')).toBe(true)
    expect(panel).not.toHaveTextContent(/recommended|predicted winner|combined score/i)

    fireEvent.click(buttons[0]!)
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(blockedContext.action)
    await Promise.resolve()
    fireEvent.click(buttons[1]!)
    expect(onOpenDetails).toHaveBeenCalledOnce()
  })

  it('renders exact clear-package truth without blockers and supports event-owned identity', () => {
    const context = clearContext()
    const onAction = vi.fn()
    render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={context}
        onAction={onAction}
        identityOwnedExternally
      />,
    )

    const panel = screen.getByTestId('lot-casting-review-panel')
    expect(panel).toHaveAccessibleName('Casting review · The Fading Constellation')
    expect(panel).toHaveAttribute('data-opens-package', 'true')
    expect(screen.queryByTestId('lot-casting-review-heading')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-casting-review-identity')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-casting-review-package-state'))
      .toHaveTextContent('Known package gates clear')
    expect(screen.queryByTestId('lot-casting-review-blockers')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-casting-review-open-details')).not.toBeInTheDocument()

    const action = screen.getByRole('button', { name: 'Take results to Package' })
    fireEvent.click(action)
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(context.action)
  })

  it('uses native disabled controls and keeps success/error feedback ownership exact', () => {
    const onAction = vi.fn()
    const onOpenDetails = vi.fn()
    const view = render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
        onOpenDetails={onOpenDetails}
        disabled
        feedback={{ kind: 'success', message: 'Casting review complete. Package blockers remain.' }}
      />,
    )

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
      fireEvent.click(button)
    }
    expect(onAction).not.toHaveBeenCalled()
    expect(onOpenDetails).not.toHaveBeenCalled()

    const success = screen.getByTestId('lot-casting-review-feedback')
    expect(success).toHaveTextContent('Casting review complete. Package blockers remain.')
    expect(success).toHaveAttribute('data-feedback-kind', 'success')
    expect(success).not.toHaveAttribute('role')
    expect(success).not.toHaveAttribute('aria-live')
    expect(success).not.toHaveAttribute('aria-atomic')

    view.rerender(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
        feedback={{ kind: 'error', message: 'Casting review details changed. Review the current lot.' }}
      />,
    )
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('Casting review details changed. Review the current lot.')
    expect(error).toHaveAttribute('aria-atomic', 'true')
    expect(error).toHaveAttribute('data-feedback-kind', 'error')
  })

  it('claims one semantic turn, rejects cancelled compatibility tails, and requires a fresh pointer', async () => {
    const onAction = vi.fn()
    render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })

    ;(action as HTMLButtonElement).click()
    ;(action as HTMLButtonElement).click()
    expect(onAction).toHaveBeenCalledOnce()
    await Promise.resolve()

    fireEvent.pointerDown(action)
    fireEvent.pointerCancel(action)
    fireEvent.mouseDown(action)
    fireEvent.click(action, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()

    await new Promise((resolve) => setTimeout(resolve, 0))
    fireEvent.mouseDown(action)
    fireEvent.click(action, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()

    fireEvent.pointerDown(action)
    fireEvent.click(action, { detail: 1 })
    expect(onAction).toHaveBeenCalledTimes(2)
  })

  it('contains held, repeated, and cross-key activation while preserving one native keyboard action', () => {
    const onAction = vi.fn()
    const onOpenDetails = vi.fn()
    render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
        onOpenDetails={onOpenDetails}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })
    const details = screen.getByRole('button', { name: 'Open Casting Room details' })

    fireEvent.keyDown(action, { key: 'Enter', repeat: false })
    fireEvent.keyDown(action, { key: 'Enter', repeat: true })
    fireEvent.keyDown(details, { key: ' ', repeat: false })
    fireEvent.click(action, { detail: 0 })
    fireEvent.click(details, { detail: 0 })

    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(blockedContext.action)
    expect(onOpenDetails).not.toHaveBeenCalled()
  })

  it('admits one native Space action and contains its held/repeated click tail', () => {
    const onAction = vi.fn()
    render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })

    fireEvent.keyDown(action, { key: ' ', repeat: false })
    fireEvent.keyDown(action, { key: ' ', repeat: true })
    fireEvent.keyUp(action, { key: ' ' })
    fireEvent.click(action, { detail: 0 })
    fireEvent.click(action, { detail: 0 })

    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(blockedContext.action)
  })

  it('rejects a physical gesture that crosses rendered-state or complete-context authority', () => {
    const onAction = vi.fn()
    const stateA = { state: 'A' }
    const stateB = { state: 'B' }
    const changedContext: LotCastingReviewContext = {
      ...blockedContext,
      roles: [
        {
          ...blockedContext.roles[0],
          evidence: [
            {
              ...blockedContext.roles[0].evidence[0],
              availabilityLabel: 'Current availability changed',
            },
            blockedContext.roles[0].evidence[1],
          ],
        },
        blockedContext.roles[1],
        blockedContext.roles[2],
      ],
    }
    const view = render(
      <LotCastingReviewPanel
        inputBoundary={stateA}
        context={blockedContext}
        onAction={onAction}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Finish casting review' }))
    view.rerender(
      <LotCastingReviewPanel
        inputBoundary={stateB}
        context={blockedContext}
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Finish casting review' }), { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Finish casting review' }))
    view.rerender(
      <LotCastingReviewPanel
        inputBoundary={stateB}
        context={changedContext}
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Finish casting review' }), { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    const current = screen.getByRole('button', { name: 'Finish casting review' })
    fireEvent.pointerDown(current)
    fireEvent.click(current, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(changedContext.action)
  })

  it('dispatches one touch action across compatibility mouse and click tails', () => {
    const onAction = vi.fn()
    render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })

    fireEvent.touchStart(action)
    fireEvent.mouseDown(action)
    fireEvent.click(action, { detail: 1 })
    fireEvent.click(action, { detail: 1 })

    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(blockedContext.action)
  })

  it('keeps a neighboring deep-action click when the previously focused world action blurs', () => {
    const onAction = vi.fn()
    const onOpenDetails = vi.fn()
    render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
        onOpenDetails={onOpenDetails}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })
    const details = screen.getByRole('button', { name: 'Open Casting Room details' })
    action.focus()
    expect(action).toHaveFocus()

    fireEvent.pointerDown(details)
    fireEvent.blur(action, { relatedTarget: details })
    fireEvent.mouseDown(details)
    fireEvent.click(details, { detail: 1 })

    expect(onAction).not.toHaveBeenCalled()
    expect(onOpenDetails).toHaveBeenCalledOnce()
  })

  it('cancels hidden-tab input and later admits one fresh virtual activation', async () => {
    let hidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    const onAction = vi.fn()
    render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })

    fireEvent.pointerDown(action)
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    fireEvent.click(action, { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 5))
    fireEvent.click(action, { detail: 0 })
    fireEvent.click(action, { detail: 0 })
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('makes a disabled modal transition reject stale input and accepts a fresh pointer gesture', () => {
    const onAction = vi.fn()
    const view = render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Finish casting review' }))
    view.rerender(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
        disabled
      />,
    )
    expect(screen.getByRole('button', { name: 'Finish casting review' })).toBeDisabled()

    view.rerender(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })
    fireEvent.mouseDown(action)
    fireEvent.click(action, { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    fireEvent.pointerDown(action)
    fireEvent.click(action, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('drops a captured physical gesture on unmount', () => {
    const onAction = vi.fn()
    const view = render(
      <LotCastingReviewPanel
        inputBoundary={inputBoundary}
        context={blockedContext}
        onAction={onAction}
      />,
    )
    const action = screen.getByRole('button', { name: 'Finish casting review' })
    fireEvent.pointerDown(action)
    view.unmount()
    fireEvent.click(action, { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()
  })
})
