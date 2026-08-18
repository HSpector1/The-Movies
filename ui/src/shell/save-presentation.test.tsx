// ── Save presentation, and the honesty of persistence (PF1-M3) ───────────────
//
// The engine's save layer is untouched. What is under test here is everything the PLAYER
// meets: a human card derived from live state, the envelope collapsed behind a disclosure
// but never unmounted, a file picker and a drop target that feed the SAME accept path as
// paste, a way to the vault from the Lot — and the Owner addendum:
//
//   AUTOSAVE FAILURE IS NEVER SILENT. The UI must never claim a save succeeded when it did
//   not, and a routine reload must not be announced as a rescue.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLayoutEffect, type ComponentProps } from 'react'
import type StudioLotScreenType from '../lot/StudioLotScreen.tsx'
import { App } from '../App.tsx'
import { Saves } from '../screens/Saves.tsx'
import { advanceWeek, exportSaveJson, newGame } from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import { ACTIVE_SESSION_KEY, saveActiveSession } from '../engine/session.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import { deriveSaveCard } from './saveCard.ts'

const persistence = vi.hoisted(() => ({ writesSucceed: true, storageAvailable: true }))

vi.mock('../engine/session.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/session.ts')>()
  return {
    ...actual,
    saveActiveSession(state: GameState) {
      if (!persistence.writesSucceed) return false
      return actual.saveActiveSession(state)
    },
  }
})

vi.mock('./persistence.ts', () => ({
  browserStorageAvailable: () => persistence.storageAvailable,
}))

type MockLotProps = ComponentProps<typeof StudioLotScreenType>

vi.mock('../lot/StudioLotScreen.tsx', () => ({
  default: (props: MockLotProps) => {
    useLayoutEffect(() => props.onPresentationMount?.(), [props.onPresentationMount])
    return (
      <main data-testid="lot-probe">
        <button
          type="button"
          data-testid="lot-saves-probe"
          onClick={() => props.onNavigate({ kind: 'saves' })}
        >
          Saves
        </button>
      </main>
    )
  },
}))

beforeEach(() => {
  persistence.writesSucceed = true
  persistence.storageAvailable = true
  localStorage.clear()
  setStudioLotOverviewOverride(false)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  setStudioLotOverviewOverride(false)
})

describe('PF1-M3 — the save surface leads with the studio, not the envelope', () => {
  it('derives the card from live state alone', () => {
    const state = advanceWeek(newFoundedGame('save-card-derivation')).next
    expect(deriveSaveCard(state)).toEqual({
      studioName: 'PROJECT: STUDIO',
      seed: state.seed,
      week: state.market.tick,
      cash: state.studio.cash,
      filmsReleased: state.studio.releasedFilms.length,
    })
  })

  it('shows the card first and keeps the raw envelope mounted behind a disclosure', () => {
    const state = newFoundedGame('save-card-ui')
    render(<Saves state={state} onLoad={() => {}} onNewGame={() => {}} onBack={() => {}} />)

    expect(screen.getByTestId('save-card-seed')).toHaveTextContent(state.seed)
    expect(screen.getByTestId('save-card-week')).toHaveTextContent(String(state.market.tick))
    expect(screen.getByTestId('save-card-films')).toHaveTextContent('0')

    // Collapsed, inert, and STILL THERE holding the exact bytes.
    const toggle = screen.getByTestId('saves-raw-toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('saves-raw-body')).toHaveAttribute('inert')
    expect((screen.getByTestId('export-text') as HTMLTextAreaElement).value).toBe(
      exportSaveJson(state),
    )

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('saves-raw-body')).not.toHaveAttribute('inert')
  })

  it('accepts a save from the file picker through the SAME path as paste', async () => {
    const state = newGame('save-file-open')
    let loaded: GameState | null = null
    render(
      <Saves
        state={newGame('save-file-open-current')}
        onLoad={(next) => {
          loaded = next
        }}
        onNewGame={() => {}}
        onBack={() => {}}
      />,
    )

    const file = new File([exportSaveJson(state)], 'studio.json', { type: 'application/json' })
    fireEvent.change(screen.getByTestId('saves-import-file'), { target: { files: [file] } })

    await waitFor(() => expect(loaded).not.toBeNull())
    expect(exportSaveJson(loaded!)).toBe(exportSaveJson(state))
  })

  it('accepts a dropped file, and rejects a bad one in the studio’s own voice', async () => {
    let loaded: GameState | null = null
    const { rerender } = render(
      <Saves
        state={newGame('save-drop-current')}
        onLoad={(next) => {
          loaded = next
        }}
        onNewGame={() => {}}
        onBack={() => {}}
      />,
    )

    const bad = new File(['{ not a save'], 'broken.json', { type: 'application/json' })
    fireEvent.drop(screen.getByTestId('saves-dropzone'), { dataTransfer: { files: [bad] } })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/rejected/i))
    expect(loaded).toBeNull()

    rerender(
      <Saves
        state={newGame('save-drop-current')}
        onLoad={(next) => {
          loaded = next
        }}
        onNewGame={() => {}}
        onBack={() => {}}
      />,
    )
    const good = new File([exportSaveJson(newGame('save-drop-good'))], 'good.json', {
      type: 'application/json',
    })
    fireEvent.drop(screen.getByTestId('saves-dropzone'), { dataTransfer: { files: [good] } })
    await waitFor(() => expect(loaded).not.toBeNull())
  })

  it('gives the Lot a way to the vault (the route existed; nothing emitted it)', async () => {
    setStudioLotOverviewOverride(true)
    saveActiveSession(newFoundedGame('lot-to-saves'))
    render(<App />)
    await screen.findByTestId('lot-probe')

    fireEvent.click(screen.getByTestId('lot-saves-probe'))
    expect(await screen.findByTestId('save-card')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('saves-back'))
    expect(await screen.findByTestId('lot-probe')).toBeInTheDocument()
  })
})

describe('PF1-M3 — autosave failure is never silent (Owner addendum)', () => {
  it('says so, persistently, while the studio is not being written down', async () => {
    saveActiveSession(newFoundedGame('persist-quota'))
    render(<App />)
    expect(screen.queryByTestId('persistence-notice')).toBeNull()

    persistence.writesSucceed = false
    fireEvent.click(screen.getByTestId('advance-week'))

    const notice = await screen.findByTestId('persistence-notice')
    expect(notice).toHaveAttribute('role', 'alert')
    expect(notice).toHaveTextContent(/not being written down/i)
    expect(notice).toHaveTextContent('Export a print')
    // A condition, not news: there is nothing to dismiss and nothing expires it.
    expect(screen.queryByTestId('app-notice-dismiss')).toBeNull()

    // …and it goes when the studio is genuinely being written down again.
    persistence.writesSucceed = true
    fireEvent.click(screen.getByTestId('release-continue')) // back to the studio
    fireEvent.click(screen.getByTestId('advance-week'))
    await waitFor(() => expect(screen.queryByTestId('persistence-notice')).toBeNull())
  })

  it('never claims a save succeeded: the stored bytes stay behind the live studio', () => {
    const founded = newFoundedGame('persist-bytes')
    saveActiveSession(founded)
    const bytesAtMount = localStorage.getItem(ACTIVE_SESSION_KEY)
    render(<App />)

    persistence.writesSucceed = false
    fireEvent.click(screen.getByTestId('advance-week'))

    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(bytesAtMount) // nothing was written
    expect(screen.getByTestId('persistence-notice')).toBeInTheDocument() // and it says so
  })

  it('covers private mode from first mount, without accusing itself before there is a studio', () => {
    persistence.storageAvailable = false
    persistence.writesSucceed = false
    render(<App />)

    // Nothing has been founded: "this studio is not being written down" would not be true yet.
    expect(screen.getByTestId('new-game')).toBeInTheDocument()
    expect(screen.queryByTestId('persistence-notice')).toBeNull()

    fireEvent.click(screen.getByTestId('new-game'))
    expect(screen.getByTestId('persistence-notice')).toBeInTheDocument()
  })
})

describe('PF1-M3 — the continuation banner is honest', () => {
  it('a routine same-format reload CONTINUES; it does not announce a rescue', () => {
    saveActiveSession(newFoundedGame('banner-routine'))
    render(<App />)
    const banner = screen.getByTestId('recovery-notice')
    expect(banner).toHaveAttribute('data-recovery', 'continuing')
    expect(banner).toHaveTextContent('Continuing your studio — Week 0.')
    expect(banner.textContent ?? '').not.toMatch(/recover/i)
  })

  it('a quarantined payload keeps the alarm — the one case that earned it', () => {
    localStorage.setItem(ACTIVE_SESSION_KEY, 'not a save at all')
    render(<App />)
    const banner = screen.getByTestId('recovery-notice')
    expect(banner).toHaveAttribute('data-recovery', 'corrupt')
    expect(banner).toHaveTextContent(/Could not recover your last studio/i)
  })
})
