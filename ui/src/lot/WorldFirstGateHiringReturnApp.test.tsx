import type { ComponentProps } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import {
  advanceWeek,
  exportSaveJson,
  gateHiringEligibleCards,
  signOfferTruth,
  type CreativeRole,
  type GameState,
} from '../engine/adapter.ts'
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../engine/session.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import type StudioLotScreenType from './StudioLotScreen.tsx'
import type { GateCandidateOwnerIntent } from './snapshot/gateHiring.ts'
import * as gateSelector from './snapshot/gateHiring.ts'

type MockLotProps = ComponentProps<typeof StudioLotScreenType>

const gateProbe = vi.hoisted(() => ({
  acknowledgements: [] as Array<{
    action: 'profile' | 'hiring'
    accepted: boolean
  }>,
  mounts: 0,
}))

// This suite owns App's candidate/profile/Hiring navigation boundary. Phaser and the much
// larger Lot host stay out of it, while the mock preserves the production callback and typed
// entry props verbatim. Returned-candidate data is derived independently from current Hiring
// truth so the assertions can distinguish a retained visitor from a neutral Gate fallback.
vi.mock('./StudioLotScreen.tsx', async () => {
  const React = await vi.importActual<typeof import('react')>('react')
  const adapter = await vi.importActual<typeof import('../engine/adapter.ts')>(
    '../engine/adapter.ts',
  )

  return {
    default: (props: MockLotProps) => {
      React.useLayoutEffect(
        () => props.onPresentationMount?.(),
        [props.onPresentationMount],
      )
      React.useEffect(() => {
        gateProbe.mounts += 1
      }, [])

      const eligible = adapter.gateHiringEligibleCards(props.state)
      const exactCard = eligible?.[0] ?? null
      const exactIntent: GateCandidateOwnerIntent | null = exactCard === null
        ? null
        : {
            talentId: exactCard.profile.id,
            studioSeed: props.state.seed,
            name: exactCard.profile.name,
            creativeRole: exactCard.profile.role,
          }
      const returnedIntent = props.entryFocus === 'gate-candidate'
        ? props.entryGateCandidate ?? null
        : null
      const returnedMatches = returnedIntent === null || eligible === null
        ? []
        : eligible.filter((card) =>
            card.profile.id === returnedIntent.talentId &&
            card.profile.name === returnedIntent.name &&
            card.profile.role === returnedIntent.creativeRole &&
            props.state.seed === returnedIntent.studioSeed,
          )
      const restoredCandidate = returnedMatches.length === 1
        ? returnedMatches[0]!.profile.id
        : null

      const request = (
        action: 'profile' | 'hiring',
        intent: GateCandidateOwnerIntent,
      ) => {
        const accepted = action === 'profile'
          ? props.onOpenGateCandidateProfile?.(intent) ?? false
          : props.onOpenGateCandidateHiring?.(intent) ?? false
        gateProbe.acknowledgements.push({ action, accepted })
      }

      const changedRole = exactIntent?.creativeRole === 'actor' ? 'director' : 'actor'

      return (
        <main
          inert={props.worldInputSuspended}
          data-testid="gate-app-lot-probe"
          data-entry-focus={props.entryFocus}
          data-entry-candidate-id={returnedIntent?.talentId ?? 'none'}
          data-restored-candidate-id={restoredCandidate ?? 'none'}
          data-current-candidate-id={exactIntent?.talentId ?? 'none'}
          data-current-candidate-name={exactIntent?.name ?? 'none'}
          data-current-candidate-role={exactIntent?.creativeRole ?? 'none'}
          data-current-first-term={exactCard?.employment.offerOptions[0]?.termWeeks ?? 'none'}
          data-world-input-suspended={String(props.worldInputSuspended)}
          data-studio-seed={props.state.seed}
          data-week={props.state.market.tick}
        >
          <button
            type="button"
            disabled={exactIntent === null}
            data-testid="gate-app-open-profile-exact"
            onClick={() => {
              if (exactIntent !== null) request('profile', exactIntent)
            }}
          >
            Open exact Gate profile
          </button>
          <button
            type="button"
            disabled={exactIntent === null}
            data-testid="gate-app-open-hiring-exact"
            onClick={() => {
              if (exactIntent !== null) request('hiring', exactIntent)
            }}
          >
            Open exact Gate Hiring terms
          </button>
          <button
            type="button"
            disabled={exactIntent === null}
            data-testid="gate-app-open-stale-id"
            onClick={() => {
              if (exactIntent !== null) {
                request('profile', { ...exactIntent, talentId: 'missing-or-replaced-candidate' })
              }
            }}
          >
            Open stale candidate
          </button>
          <button
            type="button"
            disabled={exactIntent === null}
            data-testid="gate-app-open-renamed"
            onClick={() => {
              if (exactIntent !== null) {
                request('profile', { ...exactIntent, name: `${exactIntent.name} renamed` })
              }
            }}
          >
            Open renamed candidate
          </button>
          <button
            type="button"
            disabled={exactIntent === null}
            data-testid="gate-app-open-reroled"
            onClick={() => {
              if (exactIntent !== null) {
                request('hiring', { ...exactIntent, creativeRole: changedRole as CreativeRole })
              }
            }}
          >
            Open re-roled candidate
          </button>
          <button
            type="button"
            disabled={exactIntent === null}
            data-testid="gate-app-open-different-seed"
            onClick={() => {
              if (exactIntent !== null) {
                request('hiring', { ...exactIntent, studioSeed: `${exactIntent.studioSeed}-other` })
              }
            }}
          >
            Open candidate from another studio seed
          </button>
          <button
            type="button"
            data-testid="gate-app-open-saves"
            onClick={() => props.onNavigate({ kind: 'saves' })}
          >
            Open Saves
          </button>
        </main>
      )
    },
  }
})

function firstGateCandidate(state: GameState) {
  const eligible = gateHiringEligibleCards(state)
  if (eligible === null || eligible.length === 0) {
    throw new Error('expected at least one exact Gate-eligible candidate')
  }
  return eligible[0]!
}

async function restoreGateStudio(state: GameState) {
  const candidate = firstGateCandidate(state)
  saveActiveSession(state)
  render(<App />)
  const lot = await screen.findByTestId('gate-app-lot-probe')
  expect(lot).toHaveAttribute('data-entry-focus', 'studio-home')
  expect(lot).toHaveAttribute('data-current-candidate-id', candidate.profile.id)
  return { candidate, lot }
}

function currentSessionBytes(): string {
  const restored = loadActiveSession()
  expect(restored.ok).toBe(true)
  if (!restored.ok) throw new Error('expected the active session to remain valid')
  return exportSaveJson(restored.state)
}

beforeEach(() => {
  localStorage.clear()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
  gateProbe.acknowledgements.length = 0
  gateProbe.mounts = 0
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  localStorage.clear()
})

describe('World-First Studio Gate talent handoff — App owner boundary', () => {
  it('independently revalidates latest Engine truth and opens the canonical profile over one byte-neutral mounted Lot', async () => {
    const state = newFoundedGame('gate-app-profile-latest')
    const bytesBefore = exportSaveJson(state)
    const storageWrites = vi.spyOn(localStorage, 'setItem')
    const selector = vi.spyOn(gateSelector, 'gateHiringCandidateContext')
    const { candidate } = await restoreGateStudio(state)
    await waitFor(() => expect(gateProbe.mounts).toBe(1))
    const writesAfterMount = storageWrites.mock.calls.length

    const opener = screen.getByTestId('gate-app-open-profile-exact')
    opener.focus()
    fireEvent.click(opener)

    expect(gateProbe.acknowledgements).toEqual([{ action: 'profile', accepted: true }])
    expect(await screen.findByTestId('talent-profile')).toBeInTheDocument()
    expect(screen.getByTestId('talent-profile-name')).toHaveTextContent(candidate.profile.name)
    expect(screen.getByTestId('gate-app-lot-probe')).toHaveAttribute(
      'data-world-input-suspended',
      'true',
    )
    expect(gateProbe.mounts).toBe(1)
    expect(selector).toHaveBeenCalledTimes(1)
    expect(selector.mock.calls[0]?.[0]).toMatchObject({
      sceneSeed: state.seed,
      week: state.market.tick,
      gateHiringMarket: {
        candidates: expect.arrayContaining([
          expect.objectContaining({ talentId: candidate.profile.id }),
        ]),
      },
    })
    expect(selector.mock.calls[0]?.[1]).toBe(candidate.profile.id)

    fireEvent.click(screen.getByTestId('talent-profile-close'))
    await waitFor(() => expect(screen.queryByTestId('talent-profile')).not.toBeInTheDocument())
    await waitFor(() => expect(opener).toHaveFocus())
    expect(screen.getByTestId('gate-app-lot-probe')).toHaveAttribute(
      'data-world-input-suspended',
      'false',
    )
    expect(gateProbe.mounts).toBe(1)
    expect(currentSessionBytes()).toBe(bytesBefore)
    expect(storageWrites.mock.calls).toHaveLength(writesAfterMount)
  })

  it('opens exact focused Hiring terms and Back returns the retained typed visitor without changing a save byte', async () => {
    const state = newFoundedGame('gate-app-hiring-return-retained')
    const bytesBefore = exportSaveJson(state)
    const selector = vi.spyOn(gateSelector, 'gateHiringCandidateContext')
    const { candidate } = await restoreGateStudio(state)

    fireEvent.click(screen.getByTestId('gate-app-open-hiring-exact'))

    expect(gateProbe.acknowledgements).toEqual([{ action: 'hiring', accepted: true }])
    const focusedHeading = await screen.findByTestId(
      `hiring-card-heading-${candidate.profile.id}`,
    )
    await waitFor(() => expect(focusedHeading).toHaveFocus())
    expect(selector).toHaveBeenCalledTimes(1)
    expect(selector.mock.calls[0]?.[1]).toBe(candidate.profile.id)

    fireEvent.click(screen.getByTestId('hiring-back'))

    const returned = await screen.findByTestId('gate-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'gate-candidate')
    expect(returned).toHaveAttribute('data-entry-candidate-id', candidate.profile.id)
    expect(returned).toHaveAttribute('data-restored-candidate-id', candidate.profile.id)
    expect(currentSessionBytes()).toBe(bytesBefore)
  })

  it('rejects stale ID, rename, profession and content-seed provenance without leaving the mounted Lot or writing state', async () => {
    const state = newFoundedGame('gate-app-owner-intent-rejections')
    const bytesBefore = exportSaveJson(state)
    const storageWrites = vi.spyOn(localStorage, 'setItem')
    await restoreGateStudio(state)
    await waitFor(() => expect(gateProbe.mounts).toBe(1))
    const writesAfterMount = storageWrites.mock.calls.length

    for (const testId of [
      'gate-app-open-stale-id',
      'gate-app-open-renamed',
      'gate-app-open-reroled',
      'gate-app-open-different-seed',
    ]) {
      fireEvent.click(screen.getByTestId(testId))
      expect(screen.getByTestId('gate-app-lot-probe')).toBeInTheDocument()
      expect(screen.queryByTestId('talent-profile')).not.toBeInTheDocument()
      expect(screen.queryByTestId('hiring-contract-heading')).not.toBeInTheDocument()
    }

    expect(gateProbe.acknowledgements).toEqual([
      { action: 'profile', accepted: false },
      { action: 'profile', accepted: false },
      { action: 'hiring', accepted: false },
      { action: 'hiring', accepted: false },
    ])
    expect(gateProbe.mounts).toBe(1)
    expect(currentSessionBytes()).toBe(bytesBefore)
    expect(storageWrites.mock.calls).toHaveLength(writesAfterMount)
  })

  it('does not trust a rendered exact identity after the independent latest selector fails', async () => {
    const state = newFoundedGame('gate-app-selector-fails-closed')
    const bytesBefore = exportSaveJson(state)
    await restoreGateStudio(state)
    const selector = vi.spyOn(gateSelector, 'gateHiringCandidateContext').mockReturnValue(null)

    fireEvent.click(screen.getByTestId('gate-app-open-hiring-exact'))

    expect(selector).toHaveBeenCalledOnce()
    expect(gateProbe.acknowledgements).toEqual([{ action: 'hiring', accepted: false }])
    expect(screen.getByTestId('gate-app-lot-probe')).toBeInTheDocument()
    expect(screen.queryByTestId('hiring-contract-heading')).not.toBeInTheDocument()
    expect(currentSessionBytes()).toBe(bytesBefore)
  })

  it('returns an Engine-accepted signing to neutral Gate truth without selecting the next candidate', async () => {
    const base = newFoundedGame('gate-app-sign-removal')
    const state: GameState = {
      ...base,
      studio: { ...base.studio, cash: 1_000_000_000 },
      cashLedgerCheckpoint: {
        cash: 1_000_000_000,
        ledgerLength: base.ledger.length,
      },
    }
    const { candidate } = await restoreGateStudio(state)
    const offer = candidate.employment.offerOptions[0]!
    expect(signOfferTruth(state, offer).bonusAffordable).toBe(true)

    fireEvent.click(screen.getByTestId('gate-app-open-hiring-exact'))
    await screen.findByTestId(`hiring-card-heading-${candidate.profile.id}`)
    fireEvent.click(
      screen.getByTestId(`hiring-sign-${candidate.profile.id}-${offer.termWeeks}`),
    )

    await waitFor(() => expect(
      screen.queryByTestId(`hiring-card-${candidate.profile.id}`),
    ).not.toBeInTheDocument())
    expect(screen.getByTestId('hiring-contract-heading')).toHaveFocus()
    fireEvent.click(screen.getByTestId('hiring-back'))

    const returned = await screen.findByTestId('gate-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'gate-candidate')
    expect(returned).toHaveAttribute('data-entry-candidate-id', candidate.profile.id)
    expect(returned).toHaveAttribute('data-restored-candidate-id', 'none')
    expect(returned).not.toHaveAttribute('data-current-candidate-id', candidate.profile.id)
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(restored.state.contracts.some(
        (contract) => contract.talentId === candidate.profile.id,
      )).toBe(true)
    })
  })

  it.each([
    ['different-seed', false],
    ['same-seed', true],
  ] as const)(
    'accepted %s whole-studio replacement clears typed Gate return identity unconditionally',
    async (_label, reuseSeed) => {
      const initial = newFoundedGame(`gate-app-replacement-${reuseSeed ? 'same' : 'different'}`)
      const initialCandidate = firstGateCandidate(initial)
      const replacement = reuseSeed
        ? advanceWeek(newFoundedGame(initial.seed)).next
        : newFoundedGame('gate-app-replacement-other-studio')
      const replacementCandidate = firstGateCandidate(replacement)
      if (reuseSeed) {
        expect(replacement.seed).toBe(initial.seed)
        expect(replacementCandidate.profile.id).toBe(initialCandidate.profile.id)
        expect(replacement.market.tick).not.toBe(initial.market.tick)
      } else {
        expect(replacement.seed).not.toBe(initial.seed)
      }

      await restoreGateStudio(initial)
      fireEvent.click(screen.getByTestId('gate-app-open-hiring-exact'))
      await screen.findByTestId(`hiring-card-heading-${initialCandidate.profile.id}`)
      fireEvent.click(screen.getByTestId('hiring-back'))
      expect(await screen.findByTestId('gate-app-lot-probe')).toHaveAttribute(
        'data-entry-candidate-id',
        initialCandidate.profile.id,
      )

      fireEvent.click(screen.getByTestId('gate-app-open-saves'))
      fireEvent.change(await screen.findByTestId('saves-import-text'), {
        target: { value: exportSaveJson(replacement) },
      })
      fireEvent.click(screen.getByTestId('saves-import'))

      const replacedLot = await screen.findByTestId('gate-app-lot-probe')
      expect(replacedLot).toHaveAttribute('data-entry-focus', 'studio-home')
      expect(replacedLot).toHaveAttribute('data-entry-candidate-id', 'none')
      expect(replacedLot).toHaveAttribute('data-restored-candidate-id', 'none')
      expect(replacedLot).toHaveAttribute('data-studio-seed', replacement.seed)
      expect(replacedLot).toHaveAttribute('data-week', String(replacement.market.tick))
      expect(currentSessionBytes()).toBe(exportSaveJson(replacement))
    },
  )
})
