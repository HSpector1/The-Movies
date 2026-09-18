// ── P13B-S7 test 3: announcements are derived-only, never persisted ─────────
//
// Requirement-derived from "S7 — Forecast/replacement disclosure", the
// "Refinement" block's binding correction: "NO persisted announcement
// record... The announcement is a DETERMINISTIC CLOCK FACT: catalogue data +
// the current week, nothing else. Save version unchanged (V26 stays live);
// the technology root stays v4; no migration proof is owed", and the
// restated "Tests" item 3: "exactly one announcement row per technology with
// a non-degenerate window at/after its announce week, week = announce week,
// identical in a Save As world and after a V26 load."
//
// GENUINE V26 FIXTURE (tests/fixtures/p13b/PROVENANCE.md, "V26 fixtures
// (P13B-S7-T0, 2026-09-17)"): `legacy-v26-lighting-restored-795.json.gz`
// (sha256 `f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314`,
// week 795) — minted at the final V26 writer `83187c2` (S7-T0, before any S7
// source change), lighting cancelled at 793 with restoration ALREADY
// complete at week 795. Native week 795 < the lighting announce week 884, so
// this fixture is genuinely pre-announcement at load and must be advanced
// through the live engine to reach 884/900 — no market.tick is hand-jumped.
//
// RED-by-design: `src/core/technologyDisclosure.ts` does not exist yet.
// `technologyAnnouncements` is the ONLY import from that new module — the
// whole file fails at module resolution before any test body runs. Every
// other import is a real, existing module (`save.js`, the p13a harness).
//
// INTERPRETATION NAMED — "through the live migration": this fixture is
// ALREADY the live version (26), so `save.importSave` (the one entry point
// every load in this codebase uses) performs an identity validate, not a
// version step. That absence of a migration step IS part of what this file
// demonstrates: S7 owes no schema bump, so the live loader's behaviour for
// this genuine V26 save is unchanged from before S7 existed.
//
// SAVE AS — DOCUMENTED GAP (per task assignment, not invented around): a
// "Save As" copy is a bridge/campaign-library concept
// (`bridge/runtime/campaign-library.ts`), driven only through
// `BridgeRuntimeCoordinator`/`BridgeSession` (see
// `tests/bridge-p13b-s3-save-as.test.ts`, which needs a `Store`/checkpoint
// harness to exercise it). No engine-level (`src/core/`) equivalent exists;
// inventing an engine call named "saveAs" here would not be testing this
// repo's real Save As. What IS engine-testable, and what the final case
// below substitutes: `technologyAnnouncements` takes no save/GameState
// argument at all (test 2's independence law, `tests/p13b-s7-independence
// .test.ts`), so a genuine Save As copy — which duplicates the SAME save
// bytes into a second campaign-library slot — is GUARANTEED to publish
// identical rows for any given week by that same signature argument. The
// final case here builds the engine-level substitute this file CAN close:
// two independently-`importSave`d copies of the identical fixture bytes
// (simulating two campaign-library slots holding the same save) publish
// byte-identical announcement rows. The claim this file does NOT close: that
// the real `saveAs` bridge operation itself produces two such independent,
// uncorrupted slots — that is bridge-level scope belonging to a sibling
// bridge test file, out of scope for this core-only one.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
// RED-by-design: src/core/technologyDisclosure.ts does not exist yet — see
// this file's header. `technologyAnnouncements` is the ONLY import from the
// new module.
import { technologyAnnouncements } from '../src/core/technologyDisclosure.js'

const FIXTURE = {
  file: './fixtures/p13b/legacy-v26-lighting-restored-795.json.gz',
  sha256: 'f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314',
  week: 795,
}

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

/**
 * P13B-S8 sweep (26 -> 27): the live writer is V27, so a genuine V26 fixture is
 * LIFTED through the governed migration before the live engine runs on it — the
 * same path every real load takes. S7's own claim is unchanged: the announcement
 * is derived from the campaign clock and persists nowhere.
 */
const liveState = (json: string): GameState => save.migrateToV28(JSON.parse(json) as never).state as GameState

describe('P13B-S7 announcements persist nowhere: genuine V26 fixture, live load, advance past the announce week (test 3)', () => {
  it('LIVE_SAVE_VERSION is 27 (P13B-S8) — S7 itself changes no save', () => {
    expect(save.LIVE_SAVE_VERSION).toBe(28)
  })

  it('genuine V26 fixture at week 795 (before lighting announces at 884): sha256 matches, loads through the live path, no lighting announcement row', () => {
    const json = load(FIXTURE.file)
    assertSha256(json, FIXTURE.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.saveVersion).toBe(26)
    expect(parsed.state.market.tick).toBe(FIXTURE.week)

    const loaded = save.importSave(json)
    expect(loaded.saveVersion).toBe(26) // the FIXTURE's own version, unchanged
    const state = liveState(json)
    expect(state.market.tick).toBe(795)

    const rows = technologyAnnouncements(state.market.tick)
    expect(rows.find(r => r.technologyId === 'lighting-control-01')).toBeUndefined()
    expect(rows.find(r => r.technologyId === 'synchronized-sound')).toBeUndefined() // degenerate window: sound never appears
  })

  it('advanced to week 884: exactly one lighting announcement row, week 884; still no sound row', () => {
    const json = load(FIXTURE.file)
    const state = liveState(json)
    const at884 = advanceTo(state, 884)
    expect(at884.market.tick).toBe(884)
    const rows = technologyAnnouncements(at884.market.tick)
    expect(rows).toEqual([{ technologyId: 'lighting-control-01', week: 884 }])
  })

  it('advanced further to week 900: still exactly one lighting row, unchanged content (row week stays 884, not 900)', () => {
    const json = load(FIXTURE.file)
    const state = liveState(json)
    const at900 = advanceTo(state, 900)
    expect(at900.market.tick).toBe(900)
    const rows = technologyAnnouncements(at900.market.tick)
    expect(rows).toEqual([{ technologyId: 'lighting-control-01', week: 884 }])
  })

  it('the announcement is derived-only: the exported live save carries no announcement record, and round-trips cleanly at the unchanged live version', () => {
    const json = load(FIXTURE.file)
    const state = liveState(json)
    const at884 = advanceTo(state, 884)

    const exported = save.exportCurrentState(at884)
    expect(exported).not.toMatch(/technologyAnnounced/)
    expect(exported).not.toMatch(/"announcement/i)

    const reimported = save.importSave(exported)
    expect(reimported.saveVersion).toBe(28) // S7 added no save root; the live version is S8's
  })

  it('Save As proxy: two independently-loaded copies of the same genuine save publish byte-identical announcement rows at 884', () => {
    const jsonA = load(FIXTURE.file)
    const jsonB = load(FIXTURE.file) // independent read + parse, never a shared reference
    const stateA = advanceTo(liveState(jsonA), 884)
    const stateB = advanceTo(liveState(jsonB), 884)
    expect(stateA).toEqual(stateB) // same lineage, independently loaded — still equal, never linked
    expect(technologyAnnouncements(stateA.market.tick)).toEqual(technologyAnnouncements(stateB.market.tick))
    expect(technologyAnnouncements(stateA.market.tick)).toEqual([{ technologyId: 'lighting-control-01', week: 884 }])
  })
})
