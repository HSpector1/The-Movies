// Shared helpers for the r6 fix-verification probes. Reads the clone only; writes nothing but stdout.
export const C = '/Users/zacheryspector/studio-specialists/founding'
export const { applyActions } = await import(`${C}/src/core/actions.ts`)
export const { beginFounding, beginFoundingHistoricalControl, FOUNDING_MINIMUMS } = await import(`${C}/src/core/employment.ts`)
export const { contractOfferOptions, hiringMarketView } = await import(`${C}/src/core/index.ts`)
export const save = await import(`${C}/src/core/save.ts`)
export const { tick } = await import(`${C}/src/core/tick.ts`)
export const { TUNING } = await import(`${C}/src/core/tuning.ts`)
export const { generateWorld } = await import(`${C}/src/core/worldgen.ts`)
export const ff = await import(`${C}/src/core/foundingFunding.ts`)
export const adapter = await import(`${C}/ui/src/engine/adapter.ts`)
import { readFileSync } from 'node:fs'

export type S = any
export const out = (label: string, value?: unknown) => console.log(label, value === undefined ? '' : typeof value === 'string' ? value : JSON.stringify(value))
export const attempt = <T,>(f: () => T): { ok: true; value: T } | { ok: false; error: string } => {
  try { return { ok: true, value: f() } } catch (e) { return { ok: false, error: (e as Error).message } }
}
export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
export const canon = (v: unknown): string => save.stableStringify(JSON.parse(JSON.stringify(v)))
export const landmarks = (s: S): number[] => s.studioHistory.rows.filter((r: any) => r.kind === 'studioFounded').map((r: any) => r.week)
export const fundOf = (s: S) => s.foundingFunding?.fund ?? null
export const liveText = (s: S): string => save.stableStringify({ saveVersion: save.LIVE_SAVE_VERSION, seed: s.seed, state: s, broadcastCache: s.broadcastItems })
export const short = (m: string) => m.length > 330 ? m.slice(0, 330) + '…' : m

/** The reader (validateSaveV47 = validateLiveSave) and the real adapter import, on the same bytes. */
export function judge(label: string, s: S, opts: { importToo?: boolean } = {}): boolean {
  const text = liveText(s)
  const parsed = JSON.parse(text)
  const r = attempt(() => save.validateSaveV47(parsed))
  const untouched = canon(parsed) === canon(JSON.parse(text))
  let imp = ''
  if (opts.importToo !== false) {
    const o = adapter.importSaveJson(text)
    imp = o.ok ? 'IMPORT-ACCEPTED' : `IMPORT-REFUSED: ${short(o.error)}`
  }
  out(`${label} =>`, r.ok ? `ACCEPTED (validateSaveV47) | ${imp} | parsed untouched ${untouched}` : `REFUSED: ${short(r.error)} | ${imp}`)
  return r.ok
}

/** The four r6 reader rules evaluated independently (not in reader order), from the raw state. */
export function rules(s: S): Record<string, unknown> {
  const raw = JSON.parse(liveText(s)).state
  const fund = raw.foundingFunding.fund
  const R = raw.foundingFunding.recordedFromWeek
  const founded = landmarks(raw)
  const charges = raw.ledger.filter((r: any) => (r.kind === 'payroll' || r.kind === 'overhead'))
  const before = charges.filter((r: any) => r.week < (fund === null ? Infinity : R))
  const h = raw.hollywood
  let employed = null
  if (fund !== null && h) employed = h.employment.slice(0, fund.openingEmploymentCount).reduce((a: number, e: any) => a + (e.studioId === h.playerStudioId ? e.terms.signingBonus : 0), 0)
  const closed = fund !== null && fund.closedWeek !== null
  return {
    fund: fund === null ? null : { prov: fund.provenance, R, closed: fund.closedWeek, sAR: fund.spentAtRecording, sB: fund.spentBonus, open: fund.openingEmploymentCount, alloc: fund.allocations.length },
    tick: raw.market.tick, draft: raw.founding !== null, origin: h?.origin, landmarks: founded,
    L_landmark: fund === null ? null : closed ? !(founded.length === 1 && founded[0] === fund.closedWeek) : founded.length > 0,
    O_openedNotMigration: fund === null ? null : fund.provenance === 'opened' && h?.origin !== 'migration',
    Ch_chargeBefore: before.length > 0 ? `${before.length} rows, first ${before[0].kind}@${before[0].week}` : false,
    E_employed: fund === null ? null : employed! > fund.spentAtRecording ? `${employed} > ${fund.spentAtRecording}` : false,
    chargesInsideFundLife: fund === null ? null : charges.filter((r: any) => r.week >= R && r.week < (fund.closedWeek ?? raw.market.tick)).length,
  }
}

export function signMinimum(start: S): S {
  let state = start
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    let count = 0
    for (const id of start.founding.applicantIds) {
      if (count === FOUNDING_MINIMUMS[role]) break
      if (state.talent.find((t: any) => t.id === id).role !== role) continue
      const offer = contractOfferOptions(state, id)[0]
      if (offer === undefined) continue
      state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: offer.termWeeks }])
      count++
    }
    if (count !== FOUNDING_MINIMUMS[role]) throw new Error(`premise: no lawful ${role}`)
  }
  return state
}
export const foundManaged = (s: S): S => applyActions(s, [{ kind: 'foundStudio' }, { kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
export const ticks = (s: S, until: number): S => { let x = s; while (x.market.tick < until) x = tick(x); return x }

export function weekZeroFounded(seed: string): { founded: S; week30: S } {
  const founded = foundManaged(signMinimum(beginFounding(generateWorld(seed))))
  return { founded, week30: ticks(founded, 30) }
}
/** The test file's injectSecondGrant (tests/p1364-late-founding.test.ts:540). */
export function injectSecondGrant(founded: S): { open: S; closed: S; talentId: string } {
  const h = founded.hollywood
  const busy = new Set(h.activeEmploymentOrdinals.map((i: number) => h.employment[i].terms.talentId))
  const talentId = founded.talent.find((t: any) => !busy.has(t.id) && !founded.contracts.some((c: any) => c.talentId === t.id) && contractOfferOptions(founded, t.id).length > 0)?.id
  if (talentId === undefined) throw new Error('premise: a free signable talent')
  const reopened = { ...founded, founding: { applicantIds: [talentId], budget: TUNING.HIRING_FOUNDING_BUDGET, spentBonus: 0 } }
  const funded = { ...reopened, foundingFunding: ff.recordFoundingFund(reopened, 'opened') }
  const open = applyActions(funded, [{ kind: 'signContract', talentId, termWeeks: contractOfferOptions(funded, talentId)[0].termWeeks }])
  return { open, closed: applyActions(open, [{ kind: 'foundStudio' }]), talentId }
}

// ── edits ──────────────────────────────────────────────────────────────────────────
export const keepLandmarks = (s: S, keep: (w: number) => boolean): S => ({ ...s, studioHistory: { ...s.studioHistory, rows: s.studioHistory.rows.filter((r: any) => r.kind !== 'studioFounded' || keep(r.week)) } })
export const withFund = (s: S, edit: (f: any, root: any) => void): S => { const root = clone(s.foundingFunding); edit(root.fund, root); return { ...s, foundingFunding: root } }
export const employedBefore = (s: S): number => { const h = s.hollywood; const f = fundOf(s); return h.employment.slice(0, f.openingEmploymentCount).reduce((a: number, e: any) => a + (e.studioId === h.playerStudioId ? e.terms.signingBonus : 0), 0) }
/** Re-date every payroll/overhead row dated before `from` to `to` (ledger order kept, cash unchanged). */
export const redateCharges = (s: S, from: number, to: number): S => ({ ...s, ledger: s.ledger.map((r: any) => (r.kind === 'payroll' || r.kind === 'overhead') && r.week < from ? { ...r, week: to } : r) })
export const fixture = (name: string): string => readFileSync(`${C}/tests/fixtures/${name}`, 'utf8')
