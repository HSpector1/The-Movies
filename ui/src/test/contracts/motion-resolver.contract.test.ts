// ── PF1-M3 CONTRACT SUITE — the motion precedence resolver ───────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M3 and §7 and from the frozen
// M3 interface, NOT from the implementation. It is expected to fail to COLLECT
// until OPUS-SHELL lands `ui/src/shell/motion.ts`; that red is contract-first
// behaviour, not a defect in this file.
//
// Governing charter law proved by this file:
//   • "motion preference (System / Reduced / Full) with the precedence law stated
//      once — the setting only ever *strengthens* the OS reduced-motion signal,
//      never weakens accessibility; when the OS itself requests reduced motion,
//      'Full' is presented as unavailable-with-reason … never as a live control
//      that does nothing."                                              (§5-M3)
//   • "New suites: … motion precedence (System/Reduced/Full × OS matches
//      true/false …)"                                                      (§7)
//
// FROZEN SIGNATURE UNDER TEST:
//   resolveMotion(pref: MotionPref, osReduced: boolean): 'reduced' | 'full'
//
// The resolver is a PURE function of its two arguments. It is deliberately NOT
// the thing that reads `matchMedia` or `loadPrefs` — the caller supplies both
// facts — and two assertions below prove exactly that by breaking those globals
// and demanding the resolver keep answering.
//
// DETERMINISM: no Math.random, no Date.now, no timers, no DOM rendering.

import { afterEach, describe, expect, it } from 'vitest'
import { resolveMotion } from '../../shell/motion.ts'
import type { MotionPref } from '../../prefs.ts'

type Resolved = 'reduced' | 'full'

const RESOLVED_VALUES: readonly Resolved[] = ['reduced', 'full']

/**
 * The whole precedence law as one table.
 *
 * TYPE CLOSURE (the compile-time half of this suite): the table is typed
 * `Record<MotionPref, …>`, so if the motion vocabulary ever gains, loses or
 * renames a member, `tsc -p ui/tsconfig.json` fails HERE — a new preference
 * cannot be shipped without a ruling on both of its OS cells. The values are
 * typed `Resolved`, so the table can never claim an outcome outside the closed
 * return union either.
 */
const PRECEDENCE: Record<MotionPref, { osReducedTrue: Resolved; osReducedFalse: Resolved }> = {
  // Follow the OS in both directions — the default.
  system: { osReducedTrue: 'reduced', osReducedFalse: 'full' },
  // The player asked for less motion. The OS saying "full" never overrides that.
  reduced: { osReducedTrue: 'reduced', osReducedFalse: 'reduced' },
  // The player asked for full motion — honoured ONLY when the OS has not asked
  // for less. This is the strengthen-only law: the setting never weakens the OS.
  full: { osReducedTrue: 'reduced', osReducedFalse: 'full' },
}

const PREFS = Object.keys(PRECEDENCE) as MotionPref[]

/** Every (pref × osReduced) cell, flattened, for the loops below. */
const CELLS: readonly { pref: MotionPref; osReduced: boolean; expected: Resolved }[] = PREFS.flatMap(
  (pref) => [
    { pref, osReduced: true, expected: PRECEDENCE[pref].osReducedTrue },
    { pref, osReduced: false, expected: PRECEDENCE[pref].osReducedFalse },
  ],
)

const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'matchMedia')
const originalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

afterEach(() => {
  if (originalMatchMediaDescriptor) {
    Object.defineProperty(globalThis, 'matchMedia', originalMatchMediaDescriptor)
  } else {
    Reflect.deleteProperty(globalThis, 'matchMedia')
  }
  if (originalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalStorageDescriptor)
  }
})

describe('PF1-M3 contract — the six precedence cells', () => {
  it('covers exactly six cells (three preferences × two OS states)', () => {
    expect(PREFS.sort()).toEqual(['full', 'reduced', 'system'])
    expect(CELLS.length).toBe(6)
  })

  for (const { pref, osReduced, expected } of CELLS) {
    it(`pref '${pref}' with osReduced=${osReduced} resolves to '${expected}'`, () => {
      expect(resolveMotion(pref, osReduced)).toBe(expected)
    })
  }
})

describe('PF1-M3 contract — the strengthen-only law, stated three ways', () => {
  it('the OS always wins to reduced: no preference can produce full motion under osReduced=true', () => {
    for (const pref of PREFS) {
      expect(resolveMotion(pref, true), `pref '${pref}' weakened the OS signal`).toBe('reduced')
    }
  })

  it("'reduced' is never weakened by an OS that is not asking for reduced motion", () => {
    expect(resolveMotion('reduced', false)).toBe('reduced')
  })

  it("'full' is honoured only when the OS has not asked for less", () => {
    expect(resolveMotion('full', false)).toBe('full')
    expect(resolveMotion('full', true)).toBe('reduced')
  })

  it("'system' is a pass-through in both directions", () => {
    expect(resolveMotion('system', true)).toBe('reduced')
    expect(resolveMotion('system', false)).toBe('full')
  })

  it('full motion is reachable ONLY with osReduced=false (the setting cannot manufacture it)', () => {
    const fullCells = CELLS.filter((cell) => cell.expected === 'full')
    expect(fullCells.length, 'the table is not vacuously all-reduced').toBeGreaterThan(0)
    for (const cell of fullCells) expect(cell.osReduced).toBe(false)
  })
})

describe('PF1-M3 contract — the return type is a closed set', () => {
  it("every cell returns exactly 'reduced' or 'full' — never a boolean, null or a pref name", () => {
    for (const { pref, osReduced } of CELLS) {
      const out: string = resolveMotion(pref, osReduced)
      expect(RESOLVED_VALUES as readonly string[], `resolveMotion('${pref}', ${osReduced})`).toContain(
        out,
      )
    }
  })

  it('both members of the return set actually occur (the resolver is not a constant)', () => {
    const seen = new Set(CELLS.map(({ pref, osReduced }) => resolveMotion(pref, osReduced)))
    expect([...seen].sort()).toEqual(['full', 'reduced'])
  })

  // The ACCESSIBILITY FLOOR for input outside the vocabulary. The frozen law
  // "osReduced always wins to 'reduced'" is stated unconditionally, so a value
  // the type system forbids must still never yield FULL motion under an OS that
  // asked for less. This asserts only the floor (never 'full'), NOT that garbage
  // resolves to 'reduced' — a table-lookup implementation legitimately returns
  // undefined for an input its type excludes, and that is not an accessibility
  // regression. AMBIGUITY (flagged, not resolved): the frozen interface does not
  // say what an out-of-vocabulary pref should return.
  it('an out-of-vocabulary preference can never produce full motion under osReduced=true', () => {
    for (const hostile of ['sideways', '', 'SYSTEM', 'Full', 'none']) {
      expect(resolveMotion(hostile as MotionPref, true)).not.toBe('full')
    }
  })
})

describe('PF1-M3 contract — the resolver is pure and self-contained', () => {
  it('is stable under repetition (same arguments → same answer, every time)', () => {
    for (const { pref, osReduced, expected } of CELLS) {
      for (let call = 0; call < 5; call += 1) {
        expect(resolveMotion(pref, osReduced)).toBe(expected)
      }
    }
  })

  it('order of calls does not matter (no hidden state between calls)', () => {
    const forward = CELLS.map(({ pref, osReduced }) => resolveMotion(pref, osReduced))
    const backward = [...CELLS].reverse().map(({ pref, osReduced }) => resolveMotion(pref, osReduced))
    expect(backward.reverse()).toEqual(forward)
  })

  it('does not consult matchMedia itself — the OS fact is an ARGUMENT', () => {
    Object.defineProperty(globalThis, 'matchMedia', {
      configurable: true,
      value: () => {
        throw new Error('resolveMotion must not call matchMedia (contract test)')
      },
    })
    for (const { pref, osReduced, expected } of CELLS) {
      expect(() => resolveMotion(pref, osReduced)).not.toThrow()
      expect(resolveMotion(pref, osReduced)).toBe(expected)
    }
  })

  it('does not read the preferences store itself — the preference is an ARGUMENT', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('resolveMotion must not touch storage (contract test)')
      },
    })
    for (const { pref, osReduced, expected } of CELLS) {
      expect(() => resolveMotion(pref, osReduced)).not.toThrow()
      expect(resolveMotion(pref, osReduced)).toBe(expected)
    }
  })
})
