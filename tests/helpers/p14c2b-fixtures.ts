// P14C.2b T1 shared fixtures. Test-author owned (780/806). Loads the genuine T0 V35
// corpus (tests/fixtures/p14/genuine-v35-c2b-corpus/, records 807/808) and exposes the
// MANIFEST's own measured axis facts by reading MANIFEST.json directly at runtime
// (never transcribed by hand, so a copy/paste slip cannot silently diverge from the
// minted record — same discipline as p14c4-fixtures.ts's c4ContinuationFacts). Every
// loader re-verifies sha256 from disk, the c2a/c4 precedent.
//
// REPAIR (this revision, against implementation HEAD 8cf6bed2+; 810 §8 has the full
// finding->change ledger): `GameState` is now V36 live (806 §9 landed). `c2bFixture`
// alone returns the RAW V35 shape (no `extensionUsed`/`variant`); ticking or saving it
// under the live engine without migrating first throws loudly (F1). Every case that
// ticks or saves a corpus world now migrates it live first (`c2bLiveFixture`). The
// SYNTHETIC-BUT-LAWFUL graft helpers this file carried on the scaffold
// (`synthesizeV36`, `casesAsV36`, `recordsAsV36`, `withExtensionCase`,
// `withProposalFromDraft`, `extensionDraft`) are RETIRED as dead code (795 §8 F5): a
// genuine `retirementExtension` case is now reachable by the natural tick route alone
// (migrate, then `advanceTo` the person's own E-12), and a genuine proposal by calling
// the real `submitProposal` directly — nothing needs to be hand-built any more.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { convertV35ToV36, validateSaveV35, validateSaveV36 } from '../../src/core/save.js'
import type { SaveFileV35, SaveFileV36 } from '../../src/core/save.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './p14b2-fixtures.js'
export { advanceTo, fund, p13aGeneratedStudio, player }
import type { GameState, GameStateV35 } from '../../src/core/types.js'

const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

// ── the genuine outgoing V35 corpus (records 807/808; MANIFEST.json re-verified by hand) ──
export const C2B_CORPUS = {
  'genuine-v35-c2b-contract-gap-freeagent-expiry': { gz: 'f35bd6868904b9b6308e27400ce862d503951c904e4e8007ee25003f187ffee4', week: 52 },
  'genuine-v35-c2b-contract-at-effective-week': { gz: 'c339695f855e2daf97be959a7a0c75a6ccae72878dc070aef25da4890d694bf3', week: 52 },
  'genuine-v35-c2b-rival-incumbent-cohorts': { gz: 'afb89ad0a5f1e972564d1389c800fb544e5082e8a8dddb4bbd5a2a43520e085d', week: 2600 },
} as const
export type C2bCorpusName = keyof typeof C2B_CORPUS

/** The RAW, un-migrated V35 shape — the input every V35->V36 boundary function
 * expects. Never ticked or saved directly under the live (V36) engine (F1): every
 * caller that needs to tick or save a corpus world uses `c2bLiveFixture` instead. */
export function c2bFixture(name: C2bCorpusName): GameStateV35 {
  const path = `tests/fixtures/p14/genuine-v35-c2b-corpus/${name}.json.gz`
  expect(existsSync(path), `T0 NOT COMPLETE: genuine V35 C.2b artifact missing: ${path}`).toBe(true)
  const compressed = readFileSync(path)
  expect(sha256(compressed), `${name}: compressed bytes drifted from record 808's MANIFEST`).toBe(C2B_CORPUS[name].gz)
  const raw = gunzipSync(compressed).toString('utf8')
  const save = validateSaveV35(JSON.parse(raw))
  expect(save.state.market.tick, `${name}: week drifted from record 808's MANIFEST`).toBe(C2B_CORPUS[name].week)
  return save.state
}

/** A genuine, already-V35-shaped state wrapped in its own save envelope, so it can be
 * round-tripped through `validateSaveV35` or handed to a V35->V36 boundary function. */
export function liveEnvelope(state: GameStateV35): SaveFileV35 {
  return validateSaveV35({ saveVersion: 35, seed: state.seed, state, broadcastCache: state.broadcastItems })
}

/** F1: the genuine V36-migrated live state — ticks or saves under the NOW-LIVE V36
 * engine must start here, never from raw `c2bFixture` (which lacks `extensionUsed` and
 * throws loudly the moment discovery or settlement reads for it). */
export function c2bLiveFixture(name: C2bCorpusName): GameState {
  return convertV35ToV36(liveEnvelope(c2bFixture(name))).state
}

/** A genuine live (V36) state wrapped in its own save envelope, validated for real
 * (no more disclosed "never validated" caveat — `validateSaveV36` is a real function
 * now). */
export function liveEnvelopeV36(state: GameState): SaveFileV36 {
  return validateSaveV36({ saveVersion: 36, seed: state.seed, state, broadcastCache: state.broadcastItems })
}

/** MANIFEST.json's own `focus` block for one fixture, read fresh from disk (never
 * transcribed) — every measured axis fact 807/808 committed for that world. */
export function c2bManifestFocus(name: C2bCorpusName): Record<string, unknown> {
  const path = 'tests/fixtures/p14/genuine-v35-c2b-corpus/MANIFEST.json'
  expect(existsSync(path), 'T0 NOT COMPLETE: MANIFEST.json missing').toBe(true)
  const manifest = JSON.parse(readFileSync(path, 'utf8')) as { fixtures: { filename: string; focus: Record<string, unknown> }[] }
  const entry = manifest.fixtures.find((f) => f.filename === `${name}.json.gz`)
  expect(entry, `${name}: no MANIFEST entry`).toBeDefined()
  return entry!.focus
}
