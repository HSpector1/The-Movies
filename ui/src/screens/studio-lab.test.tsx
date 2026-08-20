import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { newGame } from '../engine/adapter.ts'
import { Dashboard } from './Dashboard.tsx'

function renderDashboard() {
  render(
    <Dashboard
      state={newGame('studio-lab-test')}
      onAssemble={() => {}}
      onAdvance={() => {}}
      onCreateTalent={() => {}}
      onOpenHub={() => {}}
      onSaves={() => {}}
      onOpenAutopsy={() => {}}
    />,
  )
}

describe('3D research lab prototype', () => {
  it('turns a production brief into an explicit lot setup', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: '3D research lab' }))
    fireEvent.change(screen.getByTestId('scene-prompt'), {
      target: { value: 'Build a dusty western frontier scene' },
    })
    fireEvent.click(screen.getByTestId('compose-scene'))
    expect(screen.getByTestId('composer-result')).toHaveTextContent('Frontier unit staged')
  })

  it('answers from the selected location and advances embodied-agent state', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: '3D research lab' }))
    fireEvent.click(screen.getByTestId('ask-scene'))
    expect(screen.getByTestId('spatial-response')).toHaveTextContent('Administration is between')

    fireEvent.click(screen.getByTestId('call-action'))
    expect(screen.getByTestId('call-action')).toHaveTextContent('run take 2')
    expect(screen.getByText(/Take 1 is live/)).toBeInTheDocument()
  })
})
