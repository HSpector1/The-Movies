// ── OPUS-REDTEAM (PF1-M4) — the preferences store, attacked ──────────────────
//
// Charter §8: "Prefs: corrupt/foreign payloads, quota exhaustion during prefs write,
// private mode, settings racing the OS media-query listener."
// Charter §2: presentation preferences live under ONE versioned key, corrupt-safe and
// storage-unavailable-safe.
//
// The KNOWN two-writer seam is attacked directly: `AudioService` persisted the WHOLE
// shared record from a snapshot taken at construction, and `SettingsOverlay` re-asserted
// the motion preference after every audio write to undo the damage. These tests hunted
// for an ordering the re-assertion did not cover — and found one.
//
// PF1-M4 FIX WAVE (OPUS-FIX): the service now re-reads the record immediately before every
// write, and the repair helper (`reassertMotionPref`) is deleted along with the defect it
// patched. The two FINDING tests below are re-pinned to the corrected behaviour: the store
// itself holds the invariant, so it holds for writers that never heard of the settings
// surface. Everything else in this file is unchanged.

import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PREFS_KEY, clampVolume, defaultPrefs, loadPrefs, savePrefs } from '../../prefs.ts'
import { initAudioService, getAudioService } from '../../audio/audioService.ts'
import { RecordingSink } from '../../audio/sink.ts'
import { SettingsOverlay } from '../../shell/SettingsOverlay.tsx'
import { readMotionPref, writeMotionPref } from '../../shell/motion.ts'

beforeEach(() => {
  localStorage.clear()
  initAudioService(new RecordingSink())
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function stored(): Record<string, unknown> | null {
  const raw = localStorage.getItem(PREFS_KEY)
  return raw === null ? null : (JSON.parse(raw) as Record<string, unknown>)
}

describe('REDTEAM — hostile prefs payloads', () => {
  const hostile: [string, string][] = [
    ['a bare open brace', '{'],
    ['the literal null', 'null'],
    ['an array', '[]'],
    ['a bare string', '"take over"'],
    ['a bare number', '42'],
    ['the empty string', ''],
    ['a future version', '{"version":99,"muted":true,"motion":"reduced"}'],
    ['a stringly version', '{"version":"1","muted":true,"motion":"reduced"}'],
    ['a missing version', '{"muted":true,"motion":"reduced"}'],
    ['volumes as an array', '{"version":1,"volumes":[1,1,1,1]}'],
    ['volumes as a string', '{"version":1,"volumes":"loud"}'],
    ['volumes as null', '{"version":1,"volumes":null}'],
    ['a NaN volume', '{"version":1,"volumes":{"master":null}}'],
    ['an infinite volume', '{"version":1,"volumes":{"master":1e999}}'],
    ['a negative volume', '{"version":1,"volumes":{"master":-5}}'],
    ['an oversized volume', '{"version":1,"volumes":{"master":9999}}'],
    ['a motion that is an object', '{"version":1,"motion":{"toString":"reduced"}}'],
    ['a motion nobody defined', '{"version":1,"motion":"cinematic"}'],
    ['a stringly mute', '{"version":1,"muted":"true"}'],
    ['a prototype-pollution shape', '{"version":1,"__proto__":{"pwned":true}}'],
    ['a constructor-prototype shape', '{"version":1,"constructor":{"prototype":{"pwned":true}}}'],
    ['a nested prototype in volumes', '{"version":1,"volumes":{"__proto__":{"master":1}}}'],
  ]

  it.each(hostile)('%s resolves to a legal Prefs record and never throws', (_label, payload) => {
    localStorage.setItem(PREFS_KEY, payload)
    const prefs = loadPrefs()
    expect(prefs.version).toBe(1)
    expect(typeof prefs.muted).toBe('boolean')
    expect(['system', 'reduced', 'full']).toContain(prefs.motion)
    for (const channel of ['master', 'music', 'ambience', 'effects'] as const) {
      const value = prefs.volumes[channel]
      expect(Number.isFinite(value), `${channel} is a finite number`).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('no hostile payload reaches Object.prototype', () => {
    for (const [, payload] of hostile) {
      localStorage.setItem(PREFS_KEY, payload)
      loadPrefs()
    }
    expect(({} as Record<string, unknown>).pwned).toBeUndefined()
    expect(Object.prototype).not.toHaveProperty('pwned')
  })

  it('a giant payload is rejected as fast as a small one and changes nothing', () => {
    localStorage.setItem(PREFS_KEY, `{"version":1,"motion":"${'r'.repeat(2_000_000)}"}`)
    const prefs = loadPrefs()
    expect(prefs.motion).toBe(defaultPrefs().motion)
  })

  it('a payload that survives partially keeps its GOOD fields (field-level tolerance)', () => {
    localStorage.setItem(
      PREFS_KEY,
      '{"version":1,"muted":true,"motion":"nonsense","volumes":{"master":0.25,"music":"loud"}}',
    )
    const prefs = loadPrefs()
    expect(prefs.muted, 'a good boolean survives a bad sibling').toBe(true)
    expect(prefs.volumes.master).toBe(0.25)
    expect(prefs.volumes.music).toBe(defaultPrefs().volumes.music)
    expect(prefs.motion).toBe('system')
  })

  it('clampVolume is total over every hostile number', () => {
    for (const value of [Number.NaN, Infinity, -Infinity, -1, 2, 1e308, -0]) {
      const out = clampVolume(value)
      expect(Number.isFinite(out)).toBe(true)
      expect(out).toBeGreaterThanOrEqual(0)
      expect(out).toBeLessThanOrEqual(1)
    }
  })
})

describe('REDTEAM — storage that refuses to cooperate', () => {
  it('a quota exception during a prefs write is reported to the caller, not swallowed', () => {
    // FIXED IN PART (PF1-M4). The finding was that a failed prefs write was invisible:
    // `savePrefs` returned void, so no caller could even ask. It now answers truthfully.
    // The Owner-facing half of the finding was RULED, not fixed: a lost preference is not
    // destructive — the studio, the save and the running session are untouched — so no
    // surface interrupts the player with it. Recorded as deliberate, not as an oversight.
    //
    // The UI test boundary installs a plain object as `localStorage`, so the spy goes on
    // the instance the product actually calls — not on Storage.prototype, which nothing
    // in this environment inherits from.
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(() => savePrefs({ ...defaultPrefs(), muted: true })).not.toThrow()
    expect(setItem).toHaveBeenCalled()
    expect(savePrefs(defaultPrefs()), 'a refused write answers false').toBe(false)
    setItem.mockRestore()
    expect(stored(), 'and it really did not land').toBeNull()
    expect(savePrefs(defaultPrefs()), 'a write that lands answers true').toBe(true)
  })

  it('a getItem that throws resolves to defaults rather than exploding', () => {
    savePrefs({ ...defaultPrefs(), muted: true, motion: 'reduced' })
    expect(loadPrefs().muted, 'the fixture really is non-default').toBe(true)
    const getItem = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('SecurityError')
    })
    expect(loadPrefs()).toEqual(defaultPrefs())
    expect(getItem).toHaveBeenCalled()
    getItem.mockRestore()
  })

  it('storage that is not there at all resolves to defaults and swallows the write', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')!
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('SecurityError: storage is disabled')
      },
    })
    try {
      expect(loadPrefs()).toEqual(defaultPrefs())
      expect(() => savePrefs(defaultPrefs())).not.toThrow()
      // PF1-M4: unreachable storage is a false, exactly like a refused write.
      expect(savePrefs(defaultPrefs())).toBe(false)
    } finally {
      Object.defineProperty(globalThis, 'localStorage', descriptor)
    }
  })
})

describe('REDTEAM — the two-writer seam (audio snapshot vs the motion preference)', () => {
  it('an audio write alone can no longer un-write a newer motion choice', () => {
    // FIXED (PF1-M4). This test pinned the defect: the service was constructed here with
    // motion 'system', and its later whole-record write carried that stale value back over
    // the player's newer choice. `setVolume` now re-reads the record first.
    const service = initAudioService(new RecordingSink())
    writeMotionPref('reduced')
    expect(readMotionPref()).toBe('reduced')

    service.setVolume('music', 0.1) // an audio write from outside the settings surface

    expect(
      readMotionPref(),
      'the service writes over a FRESH read of the shared record, not its own snapshot',
    ).toBe('reduced')
  })

  it('and both facts land: neither writer erases the other', () => {
    // FIXED (PF1-M4). This test used to prove the deleted `reassertMotionPref` repair.
    // The repair is gone; what it repaired is now impossible, and the volume still lands.
    const service = initAudioService(new RecordingSink())
    writeMotionPref('reduced')
    service.setVolume('music', 0.1)
    expect(readMotionPref()).toBe('reduced')
    expect(loadPrefs().volumes.music, 'and the volume is not collateral damage').toBe(0.1)
  })

  it('through the real settings surface: volume → motion → volume never regresses motion', () => {
    const { getByTestId } = render(<SettingsOverlay onClose={() => {}} />)

    fireEvent.change(getByTestId('settings-volume-music'), { target: { value: '0.35' } })
    expect(stored()?.motion).toBe('system')

    fireEvent.click(getByTestId('settings-motion-reduced'))
    expect(stored()?.motion).toBe('reduced')

    fireEvent.change(getByTestId('settings-volume-master'), { target: { value: '0.15' } })
    expect(stored()?.motion, 'the store, not a repair call, keeps the motion choice').toBe('reduced')

    fireEvent.change(getByTestId('settings-volume-ambience'), { target: { value: '0.05' } })
    expect(stored()?.motion).toBe('reduced')
    expect(stored()?.volumes).toMatchObject({ master: 0.15, music: 0.35, ambience: 0.05 })
  })

  it('through the real settings surface: a mute race never regresses motion either', () => {
    const { getByTestId } = render(<SettingsOverlay onClose={() => {}} />)
    fireEvent.click(getByTestId('settings-motion-reduced'))
    const mute = getByTestId('settings-mute')

    fireEvent.click(mute)
    expect(stored()).toMatchObject({ muted: true, motion: 'reduced' })
    fireEvent.click(mute)
    expect(stored()).toMatchObject({ muted: false, motion: 'reduced' })
    fireEvent.click(mute)
    expect(stored()).toMatchObject({ muted: true, motion: 'reduced' })
  })

  it('closing and reopening settings does not resurrect a stale motion value', () => {
    const first = render(<SettingsOverlay onClose={() => {}} />)
    fireEvent.click(first.getByTestId('settings-motion-reduced'))
    first.unmount()

    const second = render(<SettingsOverlay onClose={() => {}} />)
    fireEvent.change(second.getByTestId('settings-volume-effects'), { target: { value: '0.4' } })
    expect(stored()?.motion).toBe('reduced')
  })

  it('an audio write from OUTSIDE the settings surface does not regress motion either', () => {
    // FIXED (PF1-M4). This was the sharpest form of the finding: the invariant was held by
    // convention at exactly one call site rather than by the store, so the first audio
    // write shipped anywhere else would have silently un-written the player's choice. The
    // store holds it now, which is why this call site — which no surface owns — is safe.
    const { getByTestId } = render(<SettingsOverlay onClose={() => {}} />)
    fireEvent.click(getByTestId('settings-motion-reduced'))
    expect(stored()?.motion).toBe('reduced')

    getAudioService().setVolume('effects', 0.2)

    expect(stored()?.motion).toBe('reduced')
    expect(stored()?.volumes).toMatchObject({ effects: 0.2 })
  })
})

describe('REDTEAM — settings racing the OS media-query listener', () => {
  it('the OS wins outright while it asks, and the player’s choice is not destroyed', () => {
    const listeners: (() => void)[] = []
    let osReduced = false
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() { return osReduced && query.includes('prefers-reduced-motion') },
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: () => {},
    }))

    const { getByTestId } = render(<SettingsOverlay onClose={() => {}} />)
    fireEvent.click(getByTestId('settings-motion-full'))
    expect(stored()?.motion).toBe('full')
    expect(getByTestId('settings-motion-resolved').getAttribute('data-resolved')).toBe('full')

    osReduced = true
    expect(listeners.length, 'the hook really subscribed to the media query').toBeGreaterThan(0)
    act(() => {
      for (const fn of listeners) fn()
    })

    // The OS request strengthens the answer without erasing the stored choice.
    expect(getByTestId('settings-motion-resolved').getAttribute('data-resolved')).toBe('reduced')
    expect(stored()?.motion, 'the player’s own preference is untouched').toBe('full')
    expect((getByTestId('settings-motion-full') as HTMLInputElement).disabled).toBe(true)
    expect(getByTestId('settings-motion-full-blocked')).toBeInTheDocument()
  })

  it('an absent matchMedia is read as "the OS is not asking", never as a crash', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(() => render(<SettingsOverlay onClose={() => {}} />)).not.toThrow()
  })

  it('a matchMedia that throws is read the same way', () => {
    vi.stubGlobal('matchMedia', () => {
      throw new Error('hostile media query')
    })
    expect(() => render(<SettingsOverlay onClose={() => {}} />)).not.toThrow()
  })
})
