// ── P13B-S7 test 4: replacement descriptors, both technologies ──────────────
//
// Requirement-derived from "S7 — Forecast/replacement disclosure", the
// "Refinement" block: "`replacementLabel: string` — authored player text,
// CANDIDATE wording pending the companion: sound "Synchronized dialogue
// replaces the silent production method on the fitted stage and Post
// chain."; lighting "Controlled lighting replaces conventional setup on the
// fitted stage: two setup units instead of four." (S5-R07's 4 → 2 units)",
// `replacementDescriptor(entry) → entry.replacementLabel`, and the restated
// "Tests" item 4: "replacement descriptors on the purchase row and access
// rows for both technologies, derived from catalogue text."
//
// PINNING RULE (per task assignment): "the plan's CANDIDATE sentences are
// the expected values only if the plan states them as such — pin
// non-emptiness and the plan's own wording as `toBe` ONLY where the plan
// gives the exact sentence." The refinement gives BOTH sentences verbatim in
// quotes, so both are pinned exact (`toBe`) below — "CANDIDATE" there
// qualifies whether the companion will confirm this wording as FINAL, not
// whether the plan states it; this file tests the currently-authored,
// currently-accepted text, not a guess at what the companion might later
// say.
//
// RED-by-design: `src/core/technologyDisclosure.ts` does not exist yet.
// `replacementDescriptor` is the ONLY import from that new module — the
// whole file fails at module resolution before any test body runs. The only
// other import is the real, existing `technologyCatalogue.js`.
//
// INTERPRETATION NAMED: case 3 reads `entry.replacementLabel` through an
// inline forward-looking cast (`ForwardCatalogueEntry`), matching the
// established idiom (`tests/p13b-s6-save-v26.test.ts`'s cast pattern) for a
// field the CURRENT catalogue type does not carry yet — this directly tests
// the stated law "`replacementDescriptor(entry) → entry.replacementLabel`"
// as a read, not a derivation.

import { describe, expect, it } from 'vitest'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
// RED-by-design: src/core/technologyDisclosure.ts does not exist yet — see
// this file's header. `replacementDescriptor` is the ONLY import from the
// new module.
import { replacementDescriptor } from '../src/core/technologyDisclosure.js'

type ForwardCatalogueEntry = { replacementLabel: string }

const SOUND_SENTENCE = 'Synchronized dialogue replaces the silent production method on the fitted stage and Post chain.'
const LIGHTING_SENTENCE = 'Controlled lighting replaces conventional setup on the fitted stage: two setup units instead of four.'

describe('P13B-S7 replacement descriptors: player text, no engine vocabulary, both technologies (test 4)', () => {
  it("sound replacementDescriptor is the plan's own CANDIDATE sentence verbatim", () => {
    const entry = technologyEntry('synchronized-sound')
    expect(replacementDescriptor(entry)).toBe(SOUND_SENTENCE)
  })

  it("lighting replacementDescriptor is the plan's own CANDIDATE sentence verbatim", () => {
    const entry = technologyEntry('lighting-control-01')
    expect(replacementDescriptor(entry)).toBe(LIGHTING_SENTENCE)
  })

  it('replacementDescriptor is exactly entry.replacementLabel — a direct read, nothing derived, for both technologies', () => {
    const lightingEntry = technologyEntry('lighting-control-01')
    const soundEntry = technologyEntry('synchronized-sound')
    expect(replacementDescriptor(lightingEntry)).toBe((lightingEntry as unknown as ForwardCatalogueEntry).replacementLabel)
    expect(replacementDescriptor(soundEntry)).toBe((soundEntry as unknown as ForwardCatalogueEntry).replacementLabel)
  })

  it('non-empty player text for both technologies', () => {
    expect(replacementDescriptor(technologyEntry('lighting-control-01')).length).toBeGreaterThan(0)
    expect(replacementDescriptor(technologyEntry('synchronized-sound')).length).toBeGreaterThan(0)
  })

  it('carries no engine vocabulary — no catalogue ids, no TUNING, no blueprintId — for both technologies', () => {
    const forbidden = ['TUNING', 'blueprintId', 'lighting-control-01', 'synchronized-sound', 'stageInstallationId', 'postInstallationId']
    for (const id of ['lighting-control-01', 'synchronized-sound'] as const) {
      const descriptor = replacementDescriptor(technologyEntry(id))
      for (const term of forbidden) expect(descriptor).not.toContain(term)
    }
  })
})
