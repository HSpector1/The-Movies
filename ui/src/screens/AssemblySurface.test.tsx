import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { newFoundedGame } from '../test/founding.ts'
import { Assembly } from './Assembly.tsx'

afterEach(cleanup)

describe('Assembly presentation surface', () => {
  it('keeps the canonical wizard inside one Lot-local scroll owner with embedded chrome', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo')
    const onStateChange = vi.fn()
    const { container } = render(
      <Assembly
        state={newFoundedGame('assembly-lot-workspace-surface')}
        surface="lot-workspace"
        onGreenlit={() => {}}
        onCancel={() => {}}
        onStateChange={onStateChange}
      />,
    )

    expect(screen.getByTestId('assembly-surface')).toHaveAttribute(
      'data-surface',
      'lot-workspace',
    )
    expect(container.querySelector('.app-shell')).toBeNull()
    expect(container.querySelector('.topbar')).toBeNull()
    const localScroll = screen.getByTestId('assembly-workspace-scroll')
    expect(localScroll).toHaveClass('assembly-workspace-scroll')
    expect(screen.getByTestId('step-concept')).toHaveAttribute('aria-current', 'step')

    fireEvent.click(within(screen.getByTestId('concept-grid')).getAllByRole('button')[0]!)
    localScroll.scrollTop = 73
    fireEvent.click(screen.getByTestId('assembly-next'))
    expect(screen.getByTestId('step-shape')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByTestId('step-concept')).not.toHaveAttribute('aria-current')
    expect(localScroll.scrollTop).toBe(0)
    expect(scrollTo).not.toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('assembly-next'))
    fireEvent.click(screen.getByTestId('assembly-next'))
    expect(screen.getByTestId('step-talent')).toHaveAttribute('aria-current', 'step')
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
    for (const select of container.querySelectorAll<HTMLSelectElement>(
      'select[data-testid^="picker-"]',
    )) {
      expect(select).toHaveAccessibleName()
    }
    expect(
      screen.getByRole('combobox', { name: 'Writer: sort candidates' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('talent-step-create'))
    expect(screen.getByTestId('talent-creator-surface')).toHaveAttribute(
      'data-surface',
      'lot-workspace',
    )
    expect(screen.getByTestId('talent-creator-workspace-scroll')).toBeInTheDocument()
    expect(screen.getByTestId('talent-creator-back')).toHaveTextContent('Back to package')
    expect(screen.getByTestId('creator-mode-balanced')).toHaveFocus()
    expect(container.querySelector('.app-shell')).toBeNull()
    expect(container.querySelector('.topbar')).toBeNull()

    fireEvent.click(screen.getByTestId('talent-creator-back'))
    expect(screen.getByTestId('step-talent')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByTestId('assembly-workspace-scroll')).toBeInTheDocument()
    expect(screen.getByTestId('talent-step-create')).toHaveFocus()

    fireEvent.click(screen.getByTestId('talent-step-create'))
    expect(screen.getByTestId('creator-mode-balanced')).toHaveFocus()
    fireEvent.change(screen.getByTestId('talent-name'), {
      target: { value: 'Lot Workspace Talent' },
    })
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByTestId('balanced-next'))
    }
    fireEvent.click(screen.getByTestId('create-talent'))
    expect(onStateChange).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('step-talent')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByTestId('talent-step-create')).toHaveFocus()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('preserves standalone page chrome by default', () => {
    const { container } = render(
      <Assembly
        state={newFoundedGame('assembly-standalone-surface')}
        onGreenlit={() => {}}
        onCancel={() => {}}
      />,
    )

    expect(screen.getByTestId('assembly-surface')).toHaveAttribute('data-surface', 'standalone')
    expect(container.querySelector('.app-shell')).not.toBeNull()
    expect(container.querySelector('.topbar')).not.toBeNull()
    expect(screen.queryByTestId('assembly-workspace-scroll')).not.toBeInTheDocument()
    expect(screen.getByTestId('step-concept')).toHaveAttribute('aria-current', 'step')
  })
})
