import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LotScriptReviewPanel } from './LotScriptReviewPanel.tsx'
import type {
  LotScriptReviewAction,
  LotScriptReviewContext,
} from './snapshot/scriptReview.ts'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const firstDraftActions: LotScriptReviewAction[] = [
  {
    kind: 'acceptScript',
    projectId: 'script-midnight',
    label: 'Accept first draft',
  },
  {
    kind: 'requestScriptRewrite',
    projectId: 'script-midnight',
    label: 'Request final rewrite',
  },
]

const firstDraftContext: LotScriptReviewContext = {
  kind: 'script-review',
  projectId: 'script-midnight',
  title: 'A Fraction of Midnight',
  writer: {
    id: 'talent-octavia-long-name',
    name: 'Octavia Montgomery-Smythe',
    primaryRole: 'writer',
  },
  reviewState: 'first-draft',
  assessment: {
    label: 'Est.',
    score: 63.25,
    band: 'Promising',
    strengths: [
      'The screenplay estimate suggests a promising foundation.',
      'The central relationship gives the second act emotional momentum.',
    ],
    concerns: [
      'Some creative uncertainty remains before production.',
      'The final reveal may ask too much of a rushed production schedule.',
    ],
  },
  consequence:
    'Accepting is immediate. A final rewrite occupies one Development & Casting slot for one week.',
  blockers: [
    {
      kind: 'facility-capacity',
      headline: 'No rewrite slot is available',
      detail: 'A final rewrite needs one Development & Casting slot for one week.',
      remedy: 'Accept this draft now, or wait for a named task to release a slot.',
    },
    {
      kind: 'writer-assignment',
      headline: 'The writer is already assigned',
      detail: 'Octavia is attached to another screenplay task.',
      remedy: 'Wait for the named assignment to finish.',
    },
  ],
  legalActions: firstDraftActions,
  // C2a-M3 — this fixture is a MARKET premise, which is what the C1 surface always
  // showed: the studio bought the story and one of its writers drafted it. The
  // original-screenplay arm has its own fixture below.
  provenance: {
    origin: 'pool',
    label: 'Acquired from the open script market',
    writerName: null,
    generatedTitle: null,
    renamed: false,
  },
}

const inputBoundary = Object.freeze({ state: 'rendered-screenplay-review' })

function finalDraftContext(): LotScriptReviewContext {
  return {
    ...firstDraftContext,
    projectId: 'script-final',
    title: 'Final Light',
    writer: {
      id: 'talent-director-writer',
      name: 'Mara Voss',
      primaryRole: 'director',
    },
    reviewState: 'final-draft',
    assessment: {
      label: 'Est.',
      score: 78,
      band: 'Strong',
      strengths: ['The screenplay estimate suggests a strong creative foundation.'],
      concerns: [],
    },
    consequence:
      'The final rewrite is complete. Accepting is immediate and consumes no time, cash, capacity, or RNG.',
    blockers: [],
    legalActions: [
      {
        kind: 'acceptScript',
        projectId: 'script-final',
        label: 'Accept final draft',
      },
    ],
  }
}

describe('LotScriptReviewPanel', () => {
  it('renders every player-safe first-draft fact and keeps Core action order before deep detail', async () => {
    const onAction = vi.fn()
    const onOpenDetails = vi.fn()
    const headingRef = { current: null as HTMLHeadingElement | null }

    render(
      <LotScriptReviewPanel
        ref={headingRef}
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
        onOpenDetails={onOpenDetails}
      />,
    )

    const panel = screen.getByTestId('lot-script-review-panel')
    expect(panel).toHaveAttribute('data-project-id', 'script-midnight')
    expect(panel).toHaveAttribute('data-review-state', 'first-draft')
    expect(
      screen.getByRole('heading', { level: 3, name: 'A Fraction of Midnight' }),
    ).toBe(headingRef.current)
    expect(screen.getByTestId('lot-script-review-heading')).toBe(headingRef.current)
    // M-B: the header subtitle is now player language, and the id it used to print is
    // provenance only. Pinned in BOTH directions so the leak cannot come back.
    expect(screen.getByTestId('lot-script-review-project-id')).toHaveTextContent(
      'First draft · Writer Octavia Montgomery-Smythe',
    )
    expect(screen.getByTestId('lot-script-review-project-id').textContent ?? '').not.toContain(
      'script-midnight',
    )
    expect(screen.getByTestId('lot-script-review-writer')).toHaveTextContent(
      'Octavia Montgomery-Smythe',
    )
    expect(screen.getByTestId('lot-script-review-writer-role')).toHaveTextContent('Writer')
    expect(screen.getByTestId('lot-script-review-state')).toHaveTextContent('First draft')

    const estimate = screen.getByTestId('lot-script-review-estimate')
    expect(estimate).toHaveTextContent('Est.')
    expect(estimate).toHaveTextContent('63.3')
    expect(estimate).toHaveTextContent('Promising')
    expect(estimate.querySelector('data')).toHaveAttribute('value', '63.25')

    expect(
      within(screen.getByTestId('lot-script-review-strengths'))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(firstDraftContext.assessment.strengths)
    expect(
      within(screen.getByTestId('lot-script-review-concerns'))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(firstDraftContext.assessment.concerns)
    expect(screen.getByTestId('lot-script-review-consequence')).toHaveTextContent(
      firstDraftContext.consequence,
    )

    const blockers = screen.getAllByTestId('lot-script-review-blocker')
    expect(blockers).toHaveLength(2)
    for (const [index, blocker] of firstDraftContext.blockers.entries()) {
      expect(blockers[index]).toHaveTextContent(blocker.headline)
      expect(blockers[index]).toHaveTextContent(blocker.detail)
      expect(blockers[index]).toHaveTextContent(`Remedy: ${blocker.remedy}`)
    }

    const actionGroup = screen.getByRole('group', { name: 'Screenplay review actions' })
    const buttons = within(actionGroup).getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Accept first draft',
      'Request final rewrite',
      'Open Writers’ Room details',
    ])
    expect(buttons.every((button) => button.getAttribute('type') === 'button')).toBe(true)

    fireEvent.click(buttons[1]!)
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[1])
    await Promise.resolve()
    fireEvent.click(buttons[2]!)
    expect(onOpenDetails).toHaveBeenCalledOnce()
  })

  it('renders final-draft truth with only the exact legal action and no invented empty sections', () => {
    const context = finalDraftContext()
    const onAction = vi.fn()

    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={context}
        onAction={onAction}
      />,
    )

    expect(screen.getByTestId('lot-script-review-state')).toHaveTextContent('Final draft')
    expect(screen.getByTestId('lot-script-review-writer-role')).toHaveTextContent('Director')
    expect(screen.getByTestId('lot-script-review-estimate')).toHaveTextContent(
      'Est. 78 · Strong',
    )
    expect(screen.queryByTestId('lot-script-review-concerns')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-script-review-blockers')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-script-review-open-details')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Request final rewrite' }),
    ).not.toBeInTheDocument()

    const accept = screen.getByRole('button', { name: 'Accept final draft' })
    fireEvent.click(accept)
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(context.legalActions[0])
  })

  it('uses native disabled controls and presents exact success or error feedback semantically', () => {
    const onAction = vi.fn()
    const onOpenDetails = vi.fn()
    const view = render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
        onOpenDetails={onOpenDetails}
        disabled
        feedback={{ kind: 'success', message: 'Final Light is Ready to package.' }}
      />,
    )

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
      fireEvent.click(button)
    }
    expect(onAction).not.toHaveBeenCalled()
    expect(onOpenDetails).not.toHaveBeenCalled()

    const success = screen.getByTestId('lot-script-review-feedback')
    expect(success).toHaveTextContent('Final Light is Ready to package.')
    expect(success).not.toHaveAttribute('role')
    expect(success).not.toHaveAttribute('aria-live')
    expect(success).not.toHaveAttribute('aria-atomic')
    expect(success).toHaveAttribute('data-feedback-kind', 'success')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    view.rerender(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
        feedback={{
          kind: 'error',
          message: 'Studio event details changed. Review the current lot.',
        }}
      />,
    )
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('Studio event details changed. Review the current lot.')
    expect(error).toHaveAttribute('aria-atomic', 'true')
    expect(error).toHaveAttribute('data-feedback-kind', 'error')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('claims one semantic turn, rejects cancelled physical tails, and requires a fresh pointer boundary', async () => {
    const onAction = vi.fn()
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const accept = screen.getByRole('button', { name: 'Accept first draft' })

    ;(accept as HTMLButtonElement).click()
    ;(accept as HTMLButtonElement).click()
    expect(onAction).toHaveBeenCalledOnce()
    await Promise.resolve()

    fireEvent.pointerDown(accept)
    fireEvent.pointerCancel(accept)
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()

    await new Promise((resolve) => setTimeout(resolve, 0))
    fireEvent.mouseDown(accept)
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()

    fireEvent.pointerDown(accept)
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).toHaveBeenCalledTimes(2)
  })

  it('contains held/repeated and cross-key activation while preserving the native keyboard click', () => {
    const onAction = vi.fn()
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const accept = screen.getByRole('button', { name: 'Accept first draft' })
    const rewrite = screen.getByRole('button', { name: 'Request final rewrite' })

    fireEvent.keyDown(accept, { key: 'Enter', repeat: false })
    fireEvent.keyDown(accept, { key: 'Enter', repeat: true })
    fireEvent.keyDown(rewrite, { key: ' ', repeat: false })
    fireEvent.click(accept, { detail: 0 })
    fireEvent.click(rewrite, { detail: 0 })

    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[0])
  })

  it('admits one native Space world action and contains its held/repeated click tail', () => {
    const onAction = vi.fn()
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const rewrite = screen.getByRole('button', { name: 'Request final rewrite' })

    fireEvent.keyDown(rewrite, { key: ' ', repeat: false })
    fireEvent.keyDown(rewrite, { key: ' ', repeat: true })
    fireEvent.keyUp(rewrite, { key: ' ' })
    fireEvent.click(rewrite, { detail: 0 })
    fireEvent.click(rewrite, { detail: 0 })

    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[1])
  })

  it('rejects a physical gesture that crosses rendered-state or full-context authority', () => {
    const onAction = vi.fn()
    const stateA = { state: 'A' }
    const stateB = { state: 'B' }
    const changedContext: LotScriptReviewContext = {
      ...firstDraftContext,
      writer: {
        ...firstDraftContext.writer,
        name: 'Current Writer After Replacement',
      },
      consequence: 'Current replacement consequence.',
    }
    const view = render(
      <LotScriptReviewPanel
        inputBoundary={stateA}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Accept first draft' }))
    view.rerender(
      <LotScriptReviewPanel
        inputBoundary={stateB}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Accept first draft' }), { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Accept first draft' }))
    view.rerender(
      <LotScriptReviewPanel
        inputBoundary={stateB}
        context={changedContext}
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Accept first draft' }), { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    const currentAccept = screen.getByRole('button', { name: 'Accept first draft' })
    fireEvent.pointerDown(currentAccept)
    fireEvent.click(currentAccept, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[0])
  })

  it('dispatches a touch activation exactly once across its compatibility mouse and click tail', () => {
    const onAction = vi.fn()
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const accept = screen.getByRole('button', { name: 'Accept first draft' })

    fireEvent.touchStart(accept)
    fireEvent.mouseDown(accept)
    fireEvent.click(accept, { detail: 1 })
    fireEvent.click(accept, { detail: 1 })

    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[0])
  })

  it('keeps a neighboring action click when the previously focused button blurs', () => {
    const onAction = vi.fn()
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const accept = screen.getByRole('button', { name: 'Accept first draft' })
    const rewrite = screen.getByRole('button', { name: 'Request final rewrite' })
    accept.focus()
    expect(accept).toHaveFocus()

    fireEvent.pointerDown(rewrite)
    fireEvent.blur(accept, { relatedTarget: rewrite })
    fireEvent.mouseDown(rewrite)
    fireEvent.click(rewrite, { detail: 1 })

    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[1])
  })

  it('cancels a blurred pointer gesture and requires a fresh physical boundary', () => {
    const onAction = vi.fn()
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const accept = screen.getByRole('button', { name: 'Accept first draft' })

    fireEvent.pointerDown(accept)
    fireEvent.blur(accept)
    fireEvent.mouseDown(accept)
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    fireEvent.pointerDown(accept)
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[0])
  })

  it('cancels hidden-tab input and later admits one fresh virtual activation', async () => {
    let hidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    const onAction = vi.fn()
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const accept = screen.getByRole('button', { name: 'Accept first draft' })

    fireEvent.pointerDown(accept)
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 5))
    fireEvent.click(accept, { detail: 0 })
    fireEvent.click(accept, { detail: 0 })
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[0])
  })

  it('makes a disabled modal transition reject stale input and accepts a fresh pointer gesture', () => {
    const onAction = vi.fn()
    const view = render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Accept first draft' }))
    view.rerender(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
        disabled
      />,
    )
    expect(screen.getByRole('button', { name: 'Accept first draft' })).toBeDisabled()

    view.rerender(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={onAction}
      />,
    )
    const accept = screen.getByRole('button', { name: 'Accept first draft' })
    fireEvent.mouseDown(accept)
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).not.toHaveBeenCalled()

    fireEvent.pointerDown(accept)
    fireEvent.click(accept, { detail: 1 })
    expect(onAction).toHaveBeenCalledOnce()
    expect(onAction.mock.calls[0]![0]).toBe(firstDraftActions[0])
  })

  // ── C2a-M3 — the moment the writer hands it over (charter §3.5, §12-M3) ─────
  it('names the studio’s own writer, the picture they delivered, and what they first called it', () => {
    const original: LotScriptReviewContext = {
      ...firstDraftContext,
      title: 'The Long Way Down',
      provenance: {
        origin: 'original',
        label: 'An Original Screenplay by Octavia Montgomery-Smythe',
        writerName: 'Octavia Montgomery-Smythe',
        generatedTitle: 'A Fraction of Midnight',
        renamed: true,
      },
    }

    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={original}
        onAction={vi.fn()}
      />,
    )

    expect(screen.getByTestId('lot-script-review-delivery')).toHaveTextContent(
      'Octavia Montgomery-Smythe delivers ‘The Long Way Down’.',
    )
    expect(screen.getByTestId('lot-script-review-provenance-label')).toHaveTextContent(
      'An Original Screenplay by Octavia Montgomery-Smythe',
    )
    // The record of the working title stands; the rename did not erase it.
    expect(screen.getByTestId('lot-script-review-working-title')).toHaveTextContent(
      'Written as ‘A Fraction of Midnight’.',
    )
  })

  it('credits the market for a premise the studio bought, and claims no writer for the story', () => {
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={firstDraftContext}
        onAction={vi.fn()}
      />,
    )

    expect(screen.getByTestId('lot-script-review-provenance-label')).toHaveTextContent(
      'Acquired from the open script market',
    )
    expect(screen.queryByTestId('lot-script-review-delivery')).toBeNull()
    expect(screen.queryByTestId('lot-script-review-working-title')).toBeNull()
  })

  it('withholds the credit rather than guessing when provenance could not be resolved', () => {
    render(
      <LotScriptReviewPanel
        inputBoundary={inputBoundary}
        context={{ ...firstDraftContext, provenance: null }}
        onAction={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('lot-script-review-provenance')).toBeNull()
    // …and the DECISION is never withheld for want of a sentence.
    expect(
      screen.getByTestId('lot-script-review-action-acceptScript-script-midnight'),
    ).toBeTruthy()
  })
})
