// ── PF1-M3 CONTRACT SUITE — saveActiveSession reports whether it saved ───────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M3 / §7 / §8 and from the
// frozen M3 interface, NOT from the implementation.
//
// Governing charter law proved by this file:
//   • "quota/storage failure surfaced in voice (fixing session.ts:40-42: 'The
//      studio vault is full — clear a shelf before filing another print.'),
//      including the private-mode 'this studio is not being saved' notice"(§5-M3)
//   • "New suites: … quota-failure surfacing."                              (§7)
//   • "Save shell: … quota exhaustion surfacing"                    (§8, red-team)
//
// The bug being closed: today `saveActiveSession` swallows a failed write and
// returns nothing, so the shell CANNOT tell the player their studio is not being
// kept. A silent failure is the one outcome the voice work cannot fix. From M3
// the function RETURNS a persistence status.
//
// WHAT IS PINNED (deliberately narrow — the exact shape is the implementer's):
//   1. the return value is TRUTHY exactly when the write succeeded;
//   2. it NEVER throws, whatever storage does;
//   3. a failed write does not damage what was already stored.
// A tolerant reader (`succeeded`, self-tested below) reads booleans, status
// objects and status strings alike, so `true`, `{ ok: true }` and
// `{ status: 'saved' }` all satisfy the contract while `{ ok: false, reason:
// 'quota' }` correctly reads as failure — an object that is truthy by JavaScript
// accident is NOT a success.
//
// EXPECTED RED at authoring time: `saveActiveSession` returns `undefined`, so the
// success assertions fail while every "never throws" assertion already passes.
//
// DETERMINISM: fixed seed, no Math.random, no Date.now, no timers. Every storage
// monkeypatch is restored in afterEach, including on a failing assertion.

import { afterEach, describe, expect, it } from 'vitest'
import { ACTIVE_SESSION_KEY, saveActiveSession } from '../../engine/session.ts'
import { exportSaveJson } from '../../engine/adapter.ts'
import type { GameState } from '../../engine/adapter.ts'
import { newFoundedGame } from '../founding.ts'

const SEED = 'pf1-session-status-001'
const state: GameState = newFoundedGame(SEED)

/** The words a status string may use to claim the write went through. */
const SUCCESS_WORDS = new Set(['ok', 'saved', 'success', 'succeeded', 'persisted', 'stored', 'wrote'])

/**
 * The tolerant reader. It answers ONE question — "does this returned value claim
 * the write succeeded?" — across every shape the frozen interface allows
 * ("boolean or a status object"). It never uses bare truthiness on an object,
 * because a failure object is truthy in JavaScript and that accident must not be
 * mistaken for a saved studio.
 */
function succeeded(status: unknown): boolean {
  if (typeof status === 'boolean') return status
  if (status === null || status === undefined) return false
  if (typeof status === 'string') return SUCCESS_WORDS.has(status.toLowerCase())
  if (typeof status === 'object') {
    const record = status as Record<string, unknown>
    for (const key of ['ok', 'saved', 'success', 'succeeded', 'persisted', 'wrote', 'stored']) {
      if (typeof record[key] === 'boolean') return record[key] as boolean
    }
    for (const key of ['status', 'kind', 'result', 'outcome', 'reason']) {
      const value = record[key]
      if (typeof value === 'string') return SUCCESS_WORDS.has(value.toLowerCase())
    }
    // An object with no readable verdict is not a claim of success.
    return false
  }
  return Boolean(status)
}

/** Call the function under test without letting `void` typing hide the value. */
function save(target: GameState = state): unknown {
  return saveActiveSession(target) as unknown
}

const originalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

afterEach(() => {
  if (originalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalStorageDescriptor)
  }
})

/** The storage global's ACCESS throws — private mode / a sandboxed iframe. */
function breakStorageAccess(): void {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('storage unavailable (contract test)')
    },
  })
}

/** There is no storage global at all. */
function removeStorage(): void {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined })
}

/**
 * The vault is full: setItem throws, everything else keeps working. Patched ON
 * the live storage object so what was already filed stays readable — that is the
 * scenario the player is actually in. Returns the restore function; afterEach
 * restores the whole descriptor as a second belt.
 */
function breakSetItem(): () => void {
  const store = localStorage
  const original = store.setItem
  store.setItem = () => {
    const error = new Error('QuotaExceededError (contract test)')
    error.name = 'QuotaExceededError'
    throw error
  }
  return () => {
    store.setItem = original
  }
}

describe('PF1-M3 contract — the tolerant reader itself', () => {
  it('reads a boolean status', () => {
    expect(succeeded(true)).toBe(true)
    expect(succeeded(false)).toBe(false)
  })

  it('reads a status OBJECT without falling for object truthiness', () => {
    expect(succeeded({ ok: true })).toBe(true)
    expect(succeeded({ ok: false, reason: 'quota' })).toBe(false)
    expect(succeeded({ saved: true })).toBe(true)
    expect(succeeded({ saved: false })).toBe(false)
    expect(succeeded({ status: 'ok' })).toBe(true)
    expect(succeeded({ status: 'quota' })).toBe(false)
    expect(succeeded({ status: 'unavailable' })).toBe(false)
  })

  it('reads a status STRING', () => {
    expect(succeeded('ok')).toBe(true)
    expect(succeeded('saved')).toBe(true)
    expect(succeeded('quota')).toBe(false)
    expect(succeeded('unavailable')).toBe(false)
  })

  it('treats "returned nothing" as failure — silence is not a saved studio', () => {
    expect(succeeded(undefined)).toBe(false)
    expect(succeeded(null)).toBe(false)
    expect(succeeded({})).toBe(false)
  })
})

describe('PF1-M3 contract — the success path', () => {
  it('returns a TRUTHY status when the write succeeds', () => {
    const status = save()
    expect(
      succeeded(status),
      `saveActiveSession must report success; it returned ${JSON.stringify(status) ?? String(status)}`,
    ).toBe(true)
  })

  it('the truthy status is not a lie — the payload really is in storage', () => {
    save()
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(exportSaveJson(state))
  })

  it('reports success on every repeat write (a status is not a one-shot)', () => {
    for (let call = 0; call < 3; call += 1) {
      expect(succeeded(save())).toBe(true)
    }
  })

  it('never throws on the happy path', () => {
    expect(() => save()).not.toThrow()
  })
})

describe('PF1-M3 contract — a full vault reports failure and does not crash', () => {
  it('returns a FALSY status when setItem throws (quota exhausted)', () => {
    const restore = breakSetItem()
    try {
      const status = save()
      expect(
        succeeded(status),
        `a failed write must not report success; it returned ${JSON.stringify(status) ?? String(status)}`,
      ).toBe(false)
    } finally {
      restore()
    }
  })

  it('does not throw when setItem throws — the in-memory studio is unaffected', () => {
    const restore = breakSetItem()
    try {
      expect(() => save()).not.toThrow()
    } finally {
      restore()
    }
  })

  it('a failed write leaves the previously filed print intact', () => {
    save()
    const filed = localStorage.getItem(ACTIVE_SESSION_KEY)
    expect(filed, 'fixture sanity: something was filed first').not.toBeNull()
    const restore = breakSetItem()
    try {
      save()
    } finally {
      restore()
    }
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(filed)
  })

  it('recovers: once storage works again, the very next write reports success', () => {
    const restore = breakSetItem()
    try {
      save()
    } finally {
      restore()
    }
    expect(succeeded(save())).toBe(true)
  })
})

describe('PF1-M3 contract — storage unavailable reports failure and does not crash', () => {
  it('returns a FALSY status when touching localStorage throws (private mode)', () => {
    breakStorageAccess()
    expect(succeeded(save())).toBe(false)
  })

  it('does not throw when touching localStorage throws', () => {
    breakStorageAccess()
    expect(() => save()).not.toThrow()
  })

  it('returns a FALSY status when there is no storage global at all', () => {
    removeStorage()
    expect(succeeded(save())).toBe(false)
  })

  it('does not throw when there is no storage global at all', () => {
    removeStorage()
    expect(() => save()).not.toThrow()
  })

  it('never throws for ANY hostile storage (the exhaustive no-crash sweep)', () => {
    const hostile: readonly { name: string; install: () => void }[] = [
      { name: 'access throws', install: breakStorageAccess },
      { name: 'absent', install: removeStorage },
      {
        name: 'every method throws',
        install: () => {
          const thrower = (): never => {
            throw new Error('storage method failed (contract test)')
          }
          Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            value: {
              get length(): number {
                return 0
              },
              clear: thrower,
              getItem: thrower,
              key: thrower,
              removeItem: thrower,
              setItem: thrower,
            } as unknown as Storage,
          })
        },
      },
      {
        name: 'setItem returns a rejected promise-like and throws',
        install: () => {
          Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            value: {
              get length(): number {
                return 0
              },
              clear: () => {},
              getItem: () => null,
              key: () => null,
              removeItem: () => {},
              setItem: () => {
                throw new DOMException('QuotaExceededError', 'QuotaExceededError')
              },
            } as unknown as Storage,
          })
        },
      },
    ]
    for (const { name, install } of hostile) {
      install()
      expect(() => save(), `hostile storage "${name}" must not crash the studio`).not.toThrow()
      expect(succeeded(save()), `hostile storage "${name}" must report failure`).toBe(false)
      if (originalStorageDescriptor) {
        Object.defineProperty(globalThis, 'localStorage', originalStorageDescriptor)
      }
    }
  })
})
