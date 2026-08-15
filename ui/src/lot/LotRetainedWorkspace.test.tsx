import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LotCommissionWorkspace } from './LotCommissionWorkspace'

describe('LotRetainedWorkspace', () => {
  it('contains focus, Escape, scroll, and scrim tails for the editing commission owner', async () => {
    const onCancel = vi.fn()
    const onOpenDetails = vi.fn()
    document.body.style.overflow = 'clip'
    document.body.style.overscrollBehavior = 'contain'

    const { unmount } = render(
      <LotCommissionWorkspace
        phase="editing"
        title="A Season of Archipelago"
        onCancel={onCancel}
        onOpenDetails={onOpenDetails}
      >
        <button type="button">Commission screenplay</button>
      </LotCommissionWorkspace>,
    )

    const layer = screen.getByTestId('lot-commission-workspace-layer')
    const dialog = screen.getByRole('dialog', { name: /commission screenplay/i })
    const details = screen.getByTestId('lot-commission-workspace-details')
    const submit = screen.getByRole('button', { name: 'Commission screenplay' })

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.overscrollBehavior).toBe('none')
    await waitFor(() => expect(details).toHaveFocus())

    submit.focus()
    fireEvent.keyDown(submit, { key: 'Tab' })
    expect(details).toHaveFocus()
    fireEvent.click(layer)
    expect(onCancel).not.toHaveBeenCalled()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)

    unmount()
    expect(document.body.style.overflow).toBe('clip')
    expect(document.body.style.overscrollBehavior).toBe('contain')
    document.body.style.overflow = ''
    document.body.style.overscrollBehavior = ''
  })

  it('makes a nested owner inert and keeps committed focus without a duplicate live success', async () => {
    const onCancel = vi.fn()
    const onOpenDetails = vi.fn()
    const { rerender } = render(
      <LotCommissionWorkspace
        phase="editing"
        title="The Fading Constellation"
        nestedModalOpen
        onCancel={onCancel}
        onOpenDetails={onOpenDetails}
      />,
    )

    const nestedLayer = screen.getByTestId('lot-commission-workspace-layer')
    expect(nestedLayer).toHaveAttribute('inert')
    expect(nestedLayer).toHaveAttribute('aria-hidden', 'true')
    fireEvent.keyDown(nestedLayer, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()

    rerender(
      <LotCommissionWorkspace
        phase="committed"
        title="The Fading Constellation"
        onCancel={onCancel}
        onOpenDetails={onOpenDetails}
      />,
    )

    const recording = screen.getByTestId('lot-commission-workspace-recording')
    expect(recording).toHaveTextContent(
      'Recording The Fading Constellation with the studio',
    )
    expect(recording).not.toHaveAttribute('role')
    expect(recording).not.toHaveAttribute('aria-live')
    expect(screen.queryByTestId('lot-commission-workspace-close')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-commission-workspace-details')).not.toBeInTheDocument()
    const committedDialog = screen.getByRole('dialog')
    await waitFor(() => expect(committedDialog).toHaveFocus())
    fireEvent.keyDown(committedDialog, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })
})
