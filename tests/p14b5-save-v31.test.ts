// 654-T (record 653 NEXT653; plan T1 "independent test-author RED against accepted predecessor").
// P14B.5 First Shared-Work Bond Core — the FROZEN SAVE / MIGRATION RED: family 9 ONLY (B4 plan :391-393
// "separate files for frozen save/migration and reader-admitted synthetic variants"; 647-B R4; record 653
// ruling (4) moved the one-edge refusal to the synthetic file). Authored at HEAD 74bd325b on a clean tree.
//
// Law (plan scope (10)): `validateSaveV31` validates the envelope, `Object.hasOwn(raw, 'relationships')`, the
// root, then strips `relationships` and delegates to `validateSaveV30` (the `stripV29Roots` device);
// `convertV30ToV31` opens the root EMPTY and recomputes NOTHING (Q3 — OPEN 2 stays open; a campaign written
// before edges existed formed none; `convertV28ToV29`'s comment :8620-8628); `convertV31ToV30` is lossless
// exactly when the root is empty; `migrateToV31` is the live route; every older `migrateToVn` gains the 31
// route line; `LIVE_SAVE_VERSION` moves to the V31 the writer stamps through `makeSave`.
//
// RED MECHANISM: this file imports NOTHING from the absent `src/core/relationships.ts` (nothing synthetic
// lives here), so it LOADS today; the four V31 save exports it calls do not exist on `save.ts` yet and bind
// to `undefined` (memory rule), so the first case of every RED `describe` asserts each is a function and every
// call site throws until T2 lands the V31 block. The FROZEN SIDE is GREEN today and moves only at the T2
// values-only sweep (R-VERSION class): `LIVE_SAVE_VERSION` 30, the genuine V30/V29/V28 bytes and their
// frozen chains. V31 is NOT allocated by this RED: the V31 law is asserted RELATIVE to `LIVE_SAVE_VERSION`
// (the lifted envelope carries the live version; the sentinel is `LIVE_SAVE_VERSION + 1`), never as a
// guessed literal.

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  LIVE_SAVE_VERSION, convertV30ToV29, convertV30ToV31, convertV31ToV30, convertV31ToV32, exportSave, importSave, loadSave, makeSave,
  migrateToV26, migrateToV27, migrateToV28, migrateToV29, migrateToV30, migrateToV31, validateSave, validateSaveV29,
  validateSaveV30, validateSaveV31,
} from '../src/core/save.js'

// ── the T0 corpus: tests/fixtures/p14/genuine-v30-pre-b5 (MANIFEST.json written last; pins copied from it at HEAD) ──
const V30_NAMES = [
  'empty', 'current-p1', 'bound-open-p1', 'bound-open-p2-lead', 'bound-open-p2-lead-or-antagonist', 'kept-and-broken',
  'rival-current-p1-and-p2', 'rival-shared-take-terminal', 'first-take-at-five', 'legacy-count-only-p2-current-draft',
] as const
type V30Name = typeof V30_NAMES[number]
const V30_PINS: Record<V30Name, { gz: string; raw: string; week: number; bytes: number }> = {
  empty: { gz: '7c237fef11cbc7c1f8e41b3ca8a4d3fad076f3e5df53ad72af2be1d37f2c2d9a', raw: '34f772fb643c0df0c63882511a396bcc296b7e327096c5970bc6f4a107be0525', week: 0, bytes: 383776 },
  'current-p1': { gz: 'a13704632d58909b9edc330f2f6d946f3e3fe7bfc1d9d2adb3ab2a430fd540fd', raw: 'b7a32680df6f002c10829e7edd644a394b9b0cdac1427a7af0aef5395501aebe', week: 45, bytes: 675654 },
  'bound-open-p1': { gz: '48962fd2c47d0b6557a8c68d281d11ed3b7528ddc1ad075372981dab40516bae', raw: 'afca923d2979caad72ffe660d069849e9e08f4eddf8642162c09ed8bd0f48c33', week: 52, bytes: 729829 },
  'bound-open-p2-lead': { gz: '4966e51b75bf2ae7fcabf67bc27fd50781a42ce3833d0eb83847ed5573b59f7b', raw: '68651875e6382887050e7057c4d30f2b6251a9070cb71dcef41c9213c63ec702', week: 52, bytes: 726927 },
  'bound-open-p2-lead-or-antagonist': { gz: '14508b4bdf5cb1242fb5f7891c92da13ed9c0719f4a1282d59850c4d17832ebe', raw: 'ab53968320371d261d0ec4c7083691512283e2af7365905914ebdc3a11408077', week: 52, bytes: 726939 },
  'kept-and-broken': { gz: '5c55f3ac3f510643ce72405d65f0391fcf096a7ee64ad014d2ebd10851c716f5', raw: '6336f7560f1cb7896cb62162908f80d412bf87370b0df002b2f80cf9ceea2e36', week: 61, bytes: 796283 },
  'rival-current-p1-and-p2': { gz: 'e2e8ac939875a1b23bd898c10773f707f8c64d77d476802499a591961d2316c1', raw: 'c155f636a8758f33e6ee002f124e5da2f51ffb5f37404cbbcf9d7cea736a52a1', week: 196, bytes: 1133174 },
  'rival-shared-take-terminal': { gz: '0430ea318f96efaae373c1010eb0a9fc24f24de4b20a358fbe2b1f795f71ab3c', raw: 'a90f97cefd7031bbec526f94c1f6b714f54d6e5c4c89cf510ad3670bbe5a9eb6', week: 213, bytes: 1131552 },
  'first-take-at-five': { gz: '62df3d07eee0a01da767203f51b0ce89edfdb281177511f848a740293ca4ceb7', raw: '3eab4f7af55917d3a011776850f129dc5dc135da8215d8ebec6845dfb8db620d', week: 60, bytes: 779578 },
  'legacy-count-only-p2-current-draft': { gz: 'e7b33115f37605656649df2544885418680679b0dd5548afaaaeee52bcb4f174', raw: '3c46a87473dea1c231dfad248d5af483ed4331bc9ba6787262bba442a993a494', week: 45, bytes: 676337 },
}
const V30_AUTHORITY = {
  phase: 'qualified P14B.4 logic closeout / exact last-V30 upstream before B.5',
  testedSourceSha: '61833f0df4ffdb5673903d5a81680b2d37ba254b', textOnlySourceSha: '651fea8ba28450ad20dccf45f209bde6ab058aaa',
  publishedRecoverySha: 'd6c11b9b4809d361e356ef74495e731f9296acc2',
  schemaId: 'sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538',
  projectionVersion: 47, protocolVersion: 4, saveVersion: 30, promiseRulesVersion: 4,
} as const
// The genuine outgoing V29 corpus (tests/fixtures/p14/genuine-v29-pre-p2; the accepted pins of
// tests/p14b4-save-v30-compatibility.test.ts, the frozen chain's own authority).
const V29_NAMES = ['empty', 'current-p1', 'replaced-p1', 'withdrawn-p1', 'bound-open-p1', 'kept-and-broken-p1', 'rival-current-p1',
  'rival-shared-take-terminal-p1', 'refused-p2-count-only-current-draft'] as const
type V29Name = typeof V29_NAMES[number]
const V29_PINS: Record<V29Name, string> = {
  empty: '2ca7733a9e7d60f13c0fc46d3646e6bb4711962d394523684717a5503afaea6a',
  'current-p1': '03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca',
  'replaced-p1': '7d5dba1e1dcf78c361c42ccfe5637578a33e64e943662a6e201d699656eb9950',
  'withdrawn-p1': '95a01ac1e86772fc7e0e338fdc167261a244fb09e2b15d8c73e8ba4cd7a0bae7',
  'bound-open-p1': '9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9',
  'kept-and-broken-p1': 'd4ddc01941f4a814cf992ad101a3a03b0b64aaa0043953d2108fa234a0475c4c',
  'rival-current-p1': '4902a1b2151529336091ffa30c488f2b6f2ecd818add1596eb8f37fbc81cb555',
  'rival-shared-take-terminal-p1': '51cb83b5a9cbbc8aa08fdd1e66a269d2e57ff77a98e88d08e134f5d6a16d7918',
  'refused-p2-count-only-current-draft': '7f7529cb05ab29d2b27bb2855448d2b72e69b5b222b6b351698da0ec7632a253',
}
const V28_FILES = ['legacy-v28-shooting-5', 'legacy-v28-open-case-45', 'legacy-v28-settled-208', 'legacy-v28-legacy-terminations-20'] as const
// The genuine projection-47 runtime checkpoint (tests/fixtures/p14/genuine-projection47-runtime/MANIFEST.json).
const CHECKPOINT = {
  gz: '38275e91d083651f232a2845b1bd8b738ac996c63523c65203c4ca8f72703d11', raw: 'c7e3cd2a56ef0871b8a8754ce1a75b06d095916f9aeb71e57229fc2aeee6496b',
  current: '6788225135a0c7a2eca94faaf6d0d068b8dac1ba00e7b6b8ad29c7d4338c7388', saved: 'b7a32680df6f002c10829e7edd644a394b9b0cdac1427a7af0aef5395501aebe',
  journal: '5cad726588c2caf2514c13bf75de5eaa66747b345441a20c83ad9e620b3f7d99', sessionId: 'p14b5-genuine-outgoing47', week: 45,
} as const

const p14 = (path: string) => new URL('./fixtures/p14/' + path, import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
type V30Save = ReturnType<typeof validateSaveV30>
type StateRecord = Record<string, unknown>
const rootsOf = (state: object): StateRecord => state as StateRecord

function v30(name: V30Name): { raw: string; save: V30Save } {
  const file = `genuine-v30-${name}.json.gz`
  for (const suffix of ['.json.gz', '.provenance.json']) {
    assert.ok(existsSync(p14('genuine-v30-pre-b5/genuine-v30-' + name + suffix)), 'T0 NOT COMPLETE: genuine V30 artifact missing: ' + name + suffix)
  }
  const compressed = readFileSync(p14('genuine-v30-pre-b5/' + file))
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed)).toBe(V30_PINS[name].gz)
  expect(sha(raw)).toBe(V30_PINS[name].raw)
  expect(Buffer.byteLength(raw, 'utf8')).toBe(V30_PINS[name].bytes)
  const provenance = JSON.parse(readFileSync(p14('genuine-v30-pre-b5/genuine-v30-' + name + '.provenance.json'), 'utf8'))
  const manifest = JSON.parse(readFileSync(p14('genuine-v30-pre-b5/MANIFEST.json'), 'utf8'))
  expect(provenance).toMatchObject({ filename: file, compressedSha256: V30_PINS[name].gz, uncompressedSha256: V30_PINS[name].raw, seed: 'p13a-core-causal-01', week: V30_PINS[name].week, saveVersion: 30 })
  expect(provenance.authority).toMatchObject(V30_AUTHORITY)
  expect(provenance.observedHeadSha).toBe(V30_AUTHORITY.publishedRecoverySha)
  expect(manifest.authority).toEqual(provenance.authority)
  expect(manifest.fixtures).toHaveLength(10)
  expect(manifest.fixtures.map((row: { filename: string }) => row.filename).sort()).toEqual(V30_NAMES.map((n) => `genuine-v30-${n}.json.gz`).sort())
  expect(manifest.fixtures).toContainEqual(expect.objectContaining({ filename: file, compressedSha256: V30_PINS[name].gz, uncompressedSha256: V30_PINS[name].raw }))
  const save = validateSaveV30(JSON.parse(raw)) // the genuine FROZEN validator first
  expect(save.saveVersion).toBe(30)
  expect(save.state.market.tick).toBe(V30_PINS[name].week)
  expect(exportSave(save)).toBe(raw)
  expect(Object.hasOwn(save.state, 'relationships')).toBe(false) // a V30 file never carries the B.5 root
  return { raw, save }
}
function v29(name: V29Name) {
  const compressed = readFileSync(p14('genuine-v29-pre-p2/genuine-v29-' + name + '.json.gz'))
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(raw)).toBe(V29_PINS[name])
  const save = validateSaveV29(JSON.parse(raw))
  expect(exportSave(save)).toBe(raw)
  return { raw, save }
}
function v28(name: typeof V28_FILES[number]) {
  const raw = gunzipSync(readFileSync(p14(name + '.json.gz'))).toString('utf8')
  const save = validateSave(JSON.parse(raw))
  expect(save.saveVersion).toBe(28)
  expect(exportSave(save)).toBe(raw)
  return { raw, save }
}
function checkpoint() {
  const compressed = readFileSync(p14('genuine-projection47-runtime/genuine-projection47-runtime.checkpoint.json.gz'))
  expect(sha(compressed)).toBe(CHECKPOINT.gz)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(raw)).toBe(CHECKPOINT.raw)
  const prior = JSON.parse(raw) as { schemaId: string; sessionId: string; currentSaveJson: string; savedSaveJson: string; journalDigest: string }
  expect(prior).toMatchObject({ schemaId: V30_AUTHORITY.schemaId, sessionId: CHECKPOINT.sessionId, journalDigest: CHECKPOINT.journal })
  expect(sha(prior.currentSaveJson)).toBe(CHECKPOINT.current)
  expect(sha(prior.savedSaveJson)).toBe(CHECKPOINT.saved)
  return prior
}

/** Family 9's byte law on ONE lifted envelope: the root opens EMPTY, every other root is byte-identical,
 * the live routes accept it, the writer restamps it and the empty-root downgrade reproduces the V30 bytes. */
function liftsLosslessly(raw: string, save: V30Save) {
  const before = JSON.stringify(save)
  const lifted = migrateToV31(save)
  // 735-T (P14B.7): migrateToV31 lifts exactly to V31, frozen — P14B.7 later
  // introduced V32 as the live boundary, one governed step beyond what this
  // function reaches, so this no longer equals LIVE_SAVE_VERSION.
  expect(lifted.saveVersion).toBe(31)
  expect(lifted.saveVersion).not.toBe(30) // and V30 is the OUTGOING identity
  const state = rootsOf(lifted.state)
  expect(state['relationships']).toEqual([])
  expect(Object.keys(state).sort()).toEqual([...Object.keys(save.state), 'relationships'].sort())
  for (const key of Object.keys(save.state)) {
    expect(JSON.stringify(state[key])).toBe(JSON.stringify(rootsOf(save.state)[key])) // NOTHING is recomputed (Q3; scope (10))
  }
  expect(lifted.seed).toBe(save.seed)
  expect(JSON.stringify(lifted.broadcastCache)).toBe(JSON.stringify(save.broadcastCache))
  expect(validateSaveV31(lifted)).toEqual(lifted)
  expect(validateSave(lifted)).toEqual(lifted)
  expect(loadSave(lifted)).toEqual(lifted)
  expect(importSave(exportSave(lifted))).toEqual(lifted)
  // 735-T (P14B.7): the live writer now stamps V32, one governed step beyond
  // migrateToV31. Re-expressed at the live boundary rather than weakened: the
  // live writer, fed this V31 envelope's own further-governed V32 lift,
  // reproduces that V32 envelope exactly (supersededByPromiseId:null on every
  // promise, nothing else moved) — the same invariant, one step further out.
  const liveEnvelope = convertV31ToV32(lifted)
  expect(makeSave(liveEnvelope.state)).toEqual(liveEnvelope)
  expect(convertV30ToV31(save)).toEqual(lifted)
  // lossless when empty: both downgrade routes reproduce the V30 bytes
  for (const downgraded of [convertV31ToV30(lifted), migrateToV30(lifted)]) {
    expect(downgraded.saveVersion).toBe(30)
    expect(validateSaveV30(downgraded)).toEqual(save)
    expect(exportSave(downgraded)).toBe(raw)
  }
  expect(JSON.stringify(save)).toBe(before) // copy-on-write: the source envelope is untouched
  return lifted
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('P14B.5 frozen side — the OUTGOING identities and the T0 corpus (GREEN today; moves only at the T2 values-only sweep)', () => {
  it('LIVE_SAVE_VERSION is the literal 32 the live writer stamps; 30 is the OUTGOING identity (R-VERSION class, re-expressed by 735-T after P14B.7 landed V32)', () => {
    expect(LIVE_SAVE_VERSION).toBe(32)
    expect(V30_AUTHORITY.saveVersion).toBe(30)
  })

  it('the dispatch sentinel is LIVE_SAVE_VERSION + 1, refused with the handled range "1 through <LIVE_SAVE_VERSION> only" (the law, stable across the bump)', () => {
    const { save } = v30('empty')
    const forged = { ...save, saveVersion: LIVE_SAVE_VERSION + 1 }
    expect(() => validateSave(forged)).toThrow(new RegExp(`versions 1 through ${String(LIVE_SAVE_VERSION)} only`))
    expect(() => loadSave(forged)).toThrow(new RegExp(`versions 1 through ${String(LIVE_SAVE_VERSION)} only`))
  })

  it.each(V30_NAMES)('genuine V30 %s: pins, provenance, the frozen V30 validator first, byte-stable export, and V29 downgrade law unchanged', (name) => {
    const { raw, save } = v30(name)
    expect(exportSave(loadSave(JSON.parse(raw)))).toBe(raw)
    expect(exportSave(importSave(raw))).toBe(raw)
    const tagged = save.state.promises.some((p) => Object.hasOwn(p.predicate, 'kind'))
    if (tagged) expect(() => convertV30ToV29(save)).toThrow(/cannot downgrade SaveFileV30 or discard a tagged promise predicate/)
    else expect(exportSave(migrateToV30(convertV30ToV29(save)))).toBe(raw)
  })

  it.each(V29_NAMES)('genuine V29 %s reaches V30 through the frozen chain byte-identically (the accepted P14B.4 law)', (name) => {
    const { save } = v29(name)
    const migrated = migrateToV30(save)
    expect(migrated).toEqual({ ...save, saveVersion: 30 })
    expect(exportSave(validateSaveV30(migrated))).toBe(exportSave(migrated))
  })

  it.each(V28_FILES)('legacy %s reaches V29 and V30 through the frozen chain with empty P14 roots', (name) => {
    const { save } = v28(name)
    const lifted = migrateToV30(save)
    expect(lifted.saveVersion).toBe(30)
    expect(lifted.state.firstTakes).toEqual([])
    expect(lifted.state.promises).toEqual([])
    expect(migrateToV29(save)).toEqual({ ...lifted, saveVersion: 29 })
  })

  it('the genuine projection-47 checkpoint embeds two genuine V30 saves; the saved slot IS the current-p1 raw', () => {
    const prior = checkpoint()
    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      const save = validateSaveV30(JSON.parse(prior[slot]))
      expect(save.state.market.tick).toBe(CHECKPOINT.week)
      expect(exportSave(save)).toBe(prior[slot])
    }
    expect(prior.savedSaveJson).toBe(v30('current-p1').raw)
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 9 — every genuine V30 case migrates through migrateToV31 with an EMPTY root, otherwise byte-identical; lossless downgrade when empty', () => {
  it('the four V31 save exports exist (RED until T2 lands the V31 block; never a spurious pass on an undefined binding)', () => {
    for (const fn of [validateSaveV31, migrateToV31, convertV30ToV31, convertV31ToV30]) expect(typeof fn).toBe('function')
  })

  it.each(V30_NAMES)('genuine V30 %s', (name) => {
    const { raw, save } = v30(name)
    liftsLosslessly(raw, save)
    // the version-dispatched readers land on their own declared version, never on the outgoing 30
    for (const loaded of [loadSave(JSON.parse(raw)), importSave(raw)]) {
      expect(loaded.saveVersion).toBe(30) // the FROZEN reader still recognises its own bytes …
      expect(migrateToV31(loaded).saveVersion).toBe(31) // … and migrateToV31 lifts them exactly to V31 (frozen; not LIVE_SAVE_VERSION since P14B.7)
    }
  })

  it('the older routes see a lifted V31 exactly as they saw its V30 source (each migrateToVn gained the 31 route line)', () => {
    for (const name of ['empty', 'current-p1', 'bound-open-p2-lead', 'rival-shared-take-terminal'] as const) {
      const { save } = v30(name)
      const lifted = migrateToV31(save)
      for (const older of [migrateToV29, migrateToV28, migrateToV27, migrateToV26]) {
        let fromV30: unknown, fromV31: unknown
        try { fromV30 = older(save) } catch (error) { fromV30 = { threw: (error as Error).message } }
        try { fromV31 = older(lifted) } catch (error) { fromV31 = { threw: (error as Error).message.replace(/SaveFileV31|the relationship record/g, '') } }
        if (typeof fromV30 === 'object' && fromV30 !== null && 'threw' in fromV30) {
          expect(fromV31).toHaveProperty('threw')
          expect(String((fromV31 as { threw: string }).threw)).toMatch(/cannot downgrade/)
        } else {
          expect(fromV31).toEqual(fromV30)
        }
      }
    }
  })
})

describe('family 9 — the V29 and V28 corpora reach V31 through their frozen chains unchanged (R4 through migrateToV31)', () => {
  it('migrateToV31 exists', () => { expect(typeof migrateToV31).toBe('function') })

  it.each(V29_NAMES)('genuine V29 %s', (name) => {
    const { save } = v29(name)
    const viaV30 = migrateToV30(save)
    const lifted = migrateToV31(save)
    expect(lifted).toEqual(migrateToV31(viaV30))
    expect(lifted.saveVersion).toBe(31) // migrateToV31 lifts exactly to V31 (frozen; not LIVE_SAVE_VERSION since P14B.7)
    expect(rootsOf(lifted.state)['relationships']).toEqual([])
    for (const key of Object.keys(save.state)) expect(JSON.stringify(rootsOf(lifted.state)[key])).toBe(JSON.stringify(rootsOf(save.state)[key]))
    expect(exportSave(migrateToV30(lifted))).toBe(exportSave(viaV30))
  })

  it.each(V28_FILES)('legacy %s', (name) => {
    const { save } = v28(name)
    const viaV30 = migrateToV30(save)
    const lifted = migrateToV31(save)
    expect(lifted.saveVersion).toBe(31) // migrateToV31 lifts exactly to V31 (frozen; not LIVE_SAVE_VERSION since P14B.7)
    expect(rootsOf(lifted.state)['relationships']).toEqual([])
    for (const key of Object.keys(viaV30.state)) expect(JSON.stringify(rootsOf(lifted.state)[key])).toBe(JSON.stringify(rootsOf(viaV30.state)[key]))
    expect(exportSave(migrateToV30(lifted))).toBe(exportSave(viaV30))
  })
})

describe('family 9 — the projection-47 checkpoint\'s embedded saves load through the live route', () => {
  it('migrateToV31 exists', () => { expect(typeof migrateToV31).toBe('function') })

  it.each(['currentSaveJson', 'savedSaveJson'] as const)('%s lifts with an empty root and every other root byte-identical to its own genuine V30 bytes', (slot) => {
    const prior = checkpoint()
    const old = validateSaveV30(JSON.parse(prior[slot]))
    const lifted = liftsLosslessly(prior[slot], old)
    expect(lifted.state.market.tick).toBe(CHECKPOINT.week)
    expect(lifted.state.promises).toEqual(old.state.promises)
    expect(lifted.state.firstTakes).toEqual(old.state.firstTakes)
    expect(lifted.state.talentMarket).toEqual(old.state.talentMarket)
    expect(lifted.state.hollywood).toEqual(old.state.hollywood)
  })
})

describe('family 9 — the V31 validator\'s own boundary (envelope law only; edge faults are the synthetic file\'s)', () => {
  it('validateSaveV31 exists', () => { expect(typeof validateSaveV31).toBe('function') })

  it('refuses a V30 envelope (no root) and a lifted envelope whose root was removed, without repairing either', () => {
    const { save } = v30('current-p1')
    expect(() => validateSaveV31(save)).toThrow(/validateSaveV31/)
    const lifted = migrateToV31(save)
    const stripped = { ...lifted, state: Object.fromEntries(Object.entries(rootsOf(lifted.state)).filter(([key]) => key !== 'relationships')) }
    expect(() => validateSaveV31(stripped)).toThrow(/relationships/)
    expect(() => validateSaveV31({ ...lifted, saveVersion: 30 })).toThrow(/validateSaveV31/)
    expect(() => validateSaveV30(lifted)).toThrow(/validateSaveV30/) // the frozen V30 validator is never taught the new root
  })
})
