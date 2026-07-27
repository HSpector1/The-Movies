// ── D-11.D cycle-4 corrections — engine-level acceptance ─────────────────────
// The one engine-level change in Cycle 4A is the founding WRITER minimum: a second
// writer has no assignable role until persistent scripts, so the required starting
// roster becomes 3 actors / 1 director / 1 writer / 1 craft. (Sorting/filtering and the
// accessible autopsy are read-model concerns proven in the UI suite.)

import { describe, expect, it } from 'vitest'
import { TUNING, FOUNDING_MINIMUMS } from '../src/core/index.js'

describe('D-11.D: the founding WRITER minimum is ONE (a second writer is optional)', () => {
  it('the tuning constant and the derived founding minimum are both 1', () => {
    expect(TUNING.HIRING_MIN_WRITERS).toBe(1)
    expect(FOUNDING_MINIMUMS.writer).toBe(1)
  })

  it('the other founding minimums are unchanged (3 actors / 1 director / 1 craft)', () => {
    expect(FOUNDING_MINIMUMS.actor).toBe(3)
    expect(FOUNDING_MINIMUMS.director).toBe(1)
    expect(FOUNDING_MINIMUMS.craft).toBe(1)
  })
})
