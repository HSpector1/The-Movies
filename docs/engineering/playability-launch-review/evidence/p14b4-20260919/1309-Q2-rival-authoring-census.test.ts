import { it, vi } from 'vitest'
import * as promiseModule from '../src/core/promises.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
it('census', () => {
  const evaluate = promiseModule.promiseFeasibility
  const rows: Record<string, { week: number; role: string; proven: boolean; reads: string[] }> = {}
  const spy = vi.spyOn(promiseModule, 'promiseFeasibility').mockImplementation((input, draft, week) => {
    const receipt = evaluate(input, draft, week)
    if (draft.promiseId !== undefined || input.hollywood === null || draft.issuerStudioId === input.hollywood.playerStudioId) return receipt
    const p = input.talentMarket.proposals.find(x => x.talentId === draft.beneficiaryPersonId && x.issuerStudioId === draft.issuerStudioId)
    if (p === undefined || p.promises.length !== 0) return receipt
    const t = input.talent.find(x => x.id === draft.beneficiaryPersonId)!
    const key = `${week}:${draft.issuerStudioId}:${draft.beneficiaryPersonId}`
    rows[key] ??= { week, role: t.role, proven: careerIdentity(t).identityDisciplines.length > 0 || t.age >= 30, reads: [] }
    rows[key]!.reads.push(`${draft.family}${'kind' in draft.predicate ? '/' + (draft.predicate as { kind: string }).kind : ''}=${receipt.classification}`)
    return receipt
  })
  let s = p13aGeneratedStudio()
  for (let i = 0; i < 220; i++) s = tick(s)
  spy.mockRestore()
  const summary: Record<string, number> = {}
  for (const r of Object.values(rows)) {
    const chosen = r.reads.find(x => x.endsWith('=REASONABLY_ACHIEVABLE')) ?? 'neither'
    const k = `${r.role}|${r.proven ? 'proven' : 'unproven'}|first=${r.reads[0]}|chosen=${chosen}`
    summary[k] = (summary[k] ?? 0) + 1
  }
  console.log('CENSUS', Object.keys(rows).length)
  for (const [k, n] of Object.entries(summary).sort()) console.log('CENSUS', n, k)
}, 600_000)
