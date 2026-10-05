import { it, expect } from 'vitest'
import { lstatSync, mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { loadArchivedEngine, sha256, ordinaryPath } from './helpers/1368-archived-route.js'
import { validateSaveV26, migrateToV46, validateSaveV46, makeSave, stableStringify, exportSave, importSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'

// One fixed, genuine pre-market route. No cash, contract, case, date or history edit.
it('captures original V26 week196 only after actual public migration and paid renewal', async () => {
  const out = '/Users/zacheryspector/studio-scratch/1368-b-witness-prep/renewal196-capture-01'
  ordinaryPath('/Users/zacheryspector/studio-scratch/1368-b-witness-prep')
  let exists = true
  try { lstatSync(out) } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') exists = false; else throw error }
  expect(exists, 'exclusive new output; never overwrite even a dangling symlink').toBe(false)
  const repo = '/Users/zacheryspector/The-Movies-headless-program'
  const old = await loadArchivedEngine(repo, '/Users/zacheryspector/studio-scratch/1363-old-era-v26-archive-01', 26,
    '942359540dafb615549c58df2cf1ea5067e1c7acd0d8df0dda24187241a67a14')
  let original = old.genesis('p13a-core-causal-01')
  const genesisBefore = old.save.stableStringify(original)
  old.save.makeSave(original)
  expect(old.save.stableStringify(original)).toBe(genesisBefore)
  for (let i = 0; i < 196; i++) original = old.tick(original, { develop: true })
  const originalBefore = old.save.stableStringify(original)
  const historical = old.save.makeSave(original), raw = old.save.exportSave(historical)
  expect(old.save.stableStringify(original)).toBe(originalBefore)
  const parsed: unknown = JSON.parse(raw), beforeHistorical = stableStringify(parsed)
  const admitted = validateSaveV26(parsed)
  expect(admitted.state.market.tick).toBe(196)
  expect(stableStringify(parsed)).toBe(beforeHistorical)
  expect(exportSave(admitted)).toBe(raw)
  expect(validateSaveV26(importSave(raw))).toEqual(admitted)
  const migrated = migrateToV46(admitted), beforeMigrated = stableStringify(migrated)
  expect(stableStringify(parsed)).toBe(beforeHistorical)
  const live = validateSaveV46(migrated).state
  expect(stableStringify(migrated)).toBe(beforeMigrated)
  const beforeLive = stableStringify(live)
  expect(live.talentMarket.cases).toHaveLength(0)
  expect(live.talentMarket.proposals).toHaveLength(0)
  expect(live.hollywood!.businesses.every(b => b.costCutting.since === null)).toBe(true)
  makeSave(live)
  expect(stableStringify(live)).toBe(beforeLive)
  const before = stableStringify(live), next = tick(live)
  makeSave(next)
  expect(stableStringify(live)).toBe(before)
  const renewed = next.hollywood!.employment.slice(live.hollywood!.employment.length).filter(e => e.reason === 'renewal')
  const facts = renewed.map(e => {
    const prior = live.hollywood!.employment.find(p => p.studioId === e.studioId && p.terms.talentId === e.terms.talentId && p.endedWeek === null)!
    expect(prior).toBeDefined()
    expect(prior.terms.endWeekExclusive).toBe(208)
    expect(e.terms.startWeek).toBe(196)
    expect(next.hollywood!.employment.find(p => p.contractId === prior.contractId)!.endedWeek).toBe(196)
    const receipts = next.hollywood!.receipts.slice(live.hollywood!.receipts.length).filter(r => r.kind === 'employment' && r.contractId === e.contractId && r.reason === 'renewal')
    expect(receipts).toHaveLength(1)
    return { studioId: e.studioId, personId: e.terms.talentId, oldContractId: prior.contractId, newContractId: e.contractId,
      signingBonus: e.terms.signingBonus, priorEnd: prior.terms.endWeekExclusive, startWeek: e.terms.startWeek,
      productionCount: live.hollywood!.businesses.find(b => b.studioId === e.studioId)!.productions.length,
      runCount: live.hollywood!.businesses.find(b => b.studioId === e.studioId)!.runs.length }
  })
  // A missing positive witness is a failed prerequisite, not an accepted capture.
  console.log('1368_RENEWAL196_CONTROL', JSON.stringify({ week: live.market.tick, renewals: facts }))
  expect(facts.length, 'actual paid renewal required before mint').toBeGreaterThan(0)
  expect(stableStringify(parsed)).toBe(beforeHistorical)
  old.postflight()
  mkdirSync(out) // exclusive; never overwrite a prior attempt
  const compressed = gzipSync(raw, { level: 9 })
  writeFileSync(out + '/genuine-v26-week196.json.gz', compressed, { flag: 'wx' })
  writeFileSync(out + '/MANIFEST.json', JSON.stringify({ format: '1368-original26-renewal196/v1', generatingHead: old.pre.head,
    archiveSha256: old.pre.sha256, seed: 'p13a-core-causal-01', ticks: 196, tickOptions: { develop: true },
    week: 196, sourceSaveVersion: 26, capture: { name: 'genuine-v26-week196.json.gz', gzipBytes: compressed.length,
      rawBytes: Buffer.byteLength(raw), gzipSha256: sha256(compressed), rawSha256: sha256(raw) },
    liveSaveVersion: 46, paidRenewalControls: facts, historicalInputNeutral: true, migratedInputNeutral: true,
    claim: 'genuine historical capture with paid current renewal; synthetic cutting/adapter assertions not yet run' }, null, 2) + '\n', { flag: 'wx' })
}, 120_000)
