// ── Settings and the motion law (PF1-M3) ─────────────────────────────────────
//
// Settings is a modal component, not a screen. On the Lot it is hosted by the retained
// workspace host so the renderer stays MOUNTED and the world is suspended rather than torn
// down; on the Dashboard the same component sits in the shell's dialog. Both entries are
// proven here, along with the one law this milestone must not get wrong:
//
//   THE PLAYER MAY ONLY EVER STRENGTHEN THE OS REDUCED-MOTION SIGNAL.
//
// When the OS asks for reduced motion, "Full" is unavailable WITH A REASON — never a live
// control that does nothing.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLayoutEffect, type ComponentProps } from 'react'
import type StudioLotScreenType from '../lot/StudioLotScreen.tsx'
import { App } from '../App.tsx'
import { saveActiveSession } from '../engine/session.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { PREFS_KEY, loadPrefs } from '../prefs.ts'
import { newFoundedGame } from '../test/founding.ts'
import { initAudioService } from '../audio/audioService.ts'
import { RecordingSink } from '../audio/sink.ts'
import { resolveMotion } from './motion.ts'

type MockLotProps = ComponentProps<typeof StudioLotScreenType>

vi.mock('../lot/StudioLotScreen.tsx', () => ({
  default: (props: MockLotProps) => {
    useLayoutEffect(() => props.onPresentationMount?.(), [props.onPresentationMount])
    return (
      <main
        data-testid="lot-probe"
        data-suspended={props.worldInputSuspended ? 'true' : 'false'}
      >
        <button
          type="button"
          data-testid="lot-settings-probe"
          onClick={() => props.onOpenSettings?.()}
        >
          Settings
        </button>
      </main>
    )
  },
}))

// The OS signal, controllable. Listeners are kept so a LIVE change can be delivered.
const media = { reduced: false, listeners: new Set<() => void>() }

function installMatchMedia() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    // A getter, like the real MediaQueryList: `matches` must reflect the CURRENT system
    // setting when the change listener reads it, not the value at subscription time.
    get matches() {
      return query.includes('prefers-reduced-motion') ? media.reduced : false
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => media.listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => media.listeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

function setOsReduced(next: boolean) {
  act(() => {
    media.reduced = next
    for (const listener of [...media.listeners]) listener()
  })
}

beforeEach(() => {
  media.reduced = false
  media.listeners.clear()
  installMatchMedia()
  localStorage.clear()
  document.documentElement.removeAttribute('data-motion')
  initAudioService(new RecordingSink())
  setStudioLotOverviewOverride(false)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
  document.documentElement.removeAttribute('data-motion')
  setStudioLotOverviewOverride(false)
})

describe('PF1-M3 — the motion resolver is the only place the rule lives', () => {
  it('the OS wins outright; the player may only add reduction', () => {
    expect(resolveMotion('system', false)).toBe('full')
    expect(resolveMotion('full', false)).toBe('full')
    expect(resolveMotion('reduced', false)).toBe('reduced')
    expect(resolveMotion('system', true)).toBe('reduced')
    expect(resolveMotion('reduced', true)).toBe('reduced')
    expect(resolveMotion('full', true)).toBe('reduced') // the player cannot weaken it
  })
})

describe('PF1-M3 — settings on the Dashboard', () => {
  function openSettings() {
    saveActiveSession(newFoundedGame('settings-dashboard'))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-settings'))
    return screen.getByTestId('settings-dialog')
  }

  it('opens as a focus-trapped dialog, not a route', () => {
    const dialog = openSettings()
    expect(dialog).toHaveAttribute('role', 'dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByTestId('settings-overlay')).toBeInTheDocument()
    // The studio is still the studio underneath: no navigation happened.
    expect(screen.getByTestId('dash-week')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('settings-close'))
    expect(screen.queryByTestId('settings-dialog')).toBeNull()
  })

  it('writes volumes and mute through the audio service, under the one prefs key', () => {
    openSettings()
    fireEvent.change(screen.getByTestId('settings-volume-music'), { target: { value: '0.25' } })
    fireEvent.click(screen.getByTestId('settings-mute'))

    expect(screen.getByTestId('settings-volume-music-value')).toHaveTextContent('25%')
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY)!)
    expect(stored.volumes.music).toBe(0.25)
    expect(stored.muted).toBe(true)
    // No second preferences key was invented for any of it.
    const prefKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null && key.startsWith('project-studio.prefs')) prefKeys.push(key)
    }
    expect(prefKeys).toEqual([PREFS_KEY])
  })

  it('a motion choice survives a later volume write (one shared record, two writers)', () => {
    openSettings()
    fireEvent.click(screen.getByTestId('settings-motion-reduced'))
    expect(loadPrefs().motion).toBe('reduced')

    // The audio service persists the whole record from its own snapshot; the shell must
    // put the player's motion choice back or a volume drag silently undoes it.
    fireEvent.change(screen.getByTestId('settings-volume-master'), { target: { value: '0.3' } })
    expect(loadPrefs().motion).toBe('reduced')
    expect(loadPrefs().volumes.master).toBe(0.3)
  })

  it('publishes the resolved motion on the document element and holds it across a reload', () => {
    openSettings()
    expect(document.documentElement.getAttribute('data-motion')).toBe('full')
    fireEvent.click(screen.getByTestId('settings-motion-reduced'))
    expect(document.documentElement.getAttribute('data-motion')).toBe('reduced')

    cleanup()
    render(<App />)
    expect(document.documentElement.getAttribute('data-motion')).toBe('reduced')
  })
})

describe('PF1-M3 — the OS request is never weakened', () => {
  it('presents Full as unavailable WITH A REASON when the system asks for reduced motion', () => {
    media.reduced = true
    saveActiveSession(newFoundedGame('settings-os-reduced'))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-settings'))

    const full = screen.getByTestId('settings-motion-full')
    expect(full).toBeDisabled()
    const reason = screen.getByTestId('settings-motion-full-blocked')
    // Fact, reason, way forward — the blocked-state grammar, in that order.
    expect(reason).toHaveTextContent('Your system asks for reduced motion.')
    expect(reason).toHaveTextContent('The studio honors it')
    expect(reason).toHaveTextContent('change your system setting to allow full motion')
    expect(full).toHaveAttribute('aria-describedby', reason.id)

    // And the product actually behaves that way, whatever the stored preference says.
    expect(document.documentElement.getAttribute('data-motion')).toBe('reduced')
    expect(screen.getByTestId('settings-motion-resolved')).toHaveAttribute('data-resolved', 'reduced')
  })

  it('follows a LIVE change to the system setting without a reload', async () => {
    saveActiveSession(newFoundedGame('settings-os-live'))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-settings'))
    expect(screen.getByTestId('settings-motion-full')).toBeEnabled()

    setOsReduced(true)
    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-motion')).toBe('reduced'),
    )
    expect(screen.getByTestId('settings-motion-full')).toBeDisabled()
    expect(screen.getByTestId('settings-motion-full-blocked')).toBeInTheDocument()
  })
})

describe('PF1-M3 — settings over the living Lot', () => {
  async function openLotSettings() {
    setStudioLotOverviewOverride(true)
    saveActiveSession(newFoundedGame('settings-lot'))
    render(<App />)
    await screen.findByTestId('lot-probe')
    fireEvent.click(screen.getByTestId('lot-settings-probe'))
  }

  it('keeps the Lot MOUNTED and suspends its input instead of routing away', async () => {
    await openLotSettings()
    // The world did not unmount — this is the whole reason settings is not a Screen.
    expect(screen.getByTestId('lot-probe')).toBeInTheDocument()
    expect(screen.getByTestId('lot-probe')).toHaveAttribute('data-suspended', 'true')
    expect(screen.getByTestId('settings-dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByTestId('lot-settings-layer')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('settings-close'))
    expect(screen.queryByTestId('settings-dialog')).toBeNull()
    expect(screen.getByTestId('lot-probe')).toHaveAttribute('data-suspended', 'false')
  })

  it('makes the notices above the world inert while it is open', async () => {
    await openLotSettings()
    expect(screen.getByTestId('recovery-notice')).toHaveAttribute('inert')
    expect(screen.getByTestId('recovery-notice')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(screen.getByTestId('settings-close'))
    expect(screen.getByTestId('recovery-notice')).not.toHaveAttribute('inert')
  })
})
