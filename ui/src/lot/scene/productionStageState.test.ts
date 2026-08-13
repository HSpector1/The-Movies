import { describe, expect, it } from 'vitest'
import type { ProductionCard } from '../snapshot/StudioLotSnapshot'
import {
  productionStageStatusLabel,
  productionStageVisualState,
} from './productionStageState'

function card(overrides: Partial<ProductionCard> = {}): ProductionCard {
  return {
    id: 'prod-1',
    title: 'The Honest Stage',
    genre: 'Drama',
    stageId: 'stage-a',
    progress01: 0.5,
    weeksRemaining: 4,
    active: false,
    stageState: 'idle',
    ...overrides,
  }
}

describe('soundstage presentation authority', () => {
  it('keeps a rehearsal or capacity-held reservation visibly occupied with REC off', () => {
    const production = card()
    const state = productionStageVisualState(true, production)
    expect(state).toBe('reserved')
    expect(productionStageStatusLabel(production, state)).toBe('STAGE RESERVED')
  })

  it('renders a shooting command hold as a distinct decision state', () => {
    const production = card({ stageState: 'decision-required' })
    const state = productionStageVisualState(true, production)
    expect(state).toBe('decision-required')
    expect(productionStageStatusLabel(production, state)).toBe('DECISION REQUIRED')
  })

  it('lights REC only for an authoritative recording card', () => {
    expect(productionStageVisualState(true, card({ active: true, stageState: 'filming' }))).toBe(
      'recording',
    )
    expect(productionStageVisualState(true, null)).toBe('vacant')
    expect(productionStageVisualState(false, card({ active: true }))).toBe('closed')
  })
})
