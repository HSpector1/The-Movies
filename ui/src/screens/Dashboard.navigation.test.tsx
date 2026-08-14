import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { newFoundedGame } from '../test/founding.ts'
import { Dashboard } from './Dashboard.tsx'

afterEach(cleanup)

describe('Dashboard Lot navigation', () => {
  it('shows one exact return action for a Lot-rooted Dashboard and suppresses ordinary Lot entry', () => {
    const onOpenLot = vi.fn()
    const onReturnToLot = vi.fn()

    const view = render(
      <Dashboard
        state={newFoundedGame('dashboard-lot-return')}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onOpenLot={onOpenLot}
        onReturnToLot={onReturnToLot}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Back to Studio Lot' }))
    expect(onReturnToLot).toHaveBeenCalledOnce()
    expect(onOpenLot).not.toHaveBeenCalled()
    expect(screen.queryByTestId('open-studio-lot')).not.toBeInTheDocument()

    view.rerender(
      <Dashboard
        state={newFoundedGame('dashboard-lot-entry')}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onOpenLot={onOpenLot}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Back to Studio Lot' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('open-studio-lot'))
    expect(onOpenLot).toHaveBeenCalledOnce()
  })
})
