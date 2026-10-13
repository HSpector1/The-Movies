// Diagnostic only: genuine267 versus constructed CURRENT budget-only variation.
// No replacement test, natural rival-policy claim, acceptance, or780/900 continuation.
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { accepted45 } from '/Users/zacheryspector/studio-specialists/p15b/tests/helpers/1368-recovery-witnesses.ts'
import { makeSave, stableStringify, validateSaveV48 } from '/Users/zacheryspector/studio-specialists/p15b/src/core/save.ts'
import { tick } from '/Users/zacheryspector/studio-specialists/p15b/src/core/tick.ts'
import { researchWeekQuote, studioContext } from '/Users/zacheryspector/studio-specialists/p15b/src/core/technology.ts'
import { technologyEntry } from '/Users/zacheryspector/studio-specialists/p15b/src/core/technologyCatalogue.ts'
import { technologyAnnouncements, technologyForecast } from '/Users/zacheryspector/studio-specialists/p15b/src/core/technologyDisclosure.ts'
import { isOperatingStudio } from '/Users/zacheryspector/studio-specialists/p15b/src/core/operatingState.ts'
import type { GameState } from '/Users/zacheryspector/studio-specialists/p15b/src/core/types.ts'

// performance.now is relative to process start: include loader/import time in the30s budget.
const started = 0, budgetMs = 30_000
const rootPin = '11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5'
const id = 'studio-aca408ec-r01:research:synchronized-sound', studioId = 'studio-aca408ec-r01'
const options = { develop: true } as const
const outputPath = process.env.P15B_NONLEAK267_DIAGNOSTIC_JSON
if (!outputPath || !isAbsolute(outputPath)) throw new Error('Set required absolute fresh P15B_NONLEAK267_DIAGNOSTIC_JSON.')
if (existsSync(outputPath) || !lstatSync(dirname(outputPath)).isDirectory()) throw new Error('Diagnostic output must be fresh in an existing directory.')
if ((process.env.P1368_ACCEPTED45_ROOT === undefined) !== (process.env.P1368_ACCEPTED45_MANIFEST_SHA256 === undefined)) throw new Error('Explicit1368 root and pin must be supplied together.')
if (process.env.P1368_ACCEPTED45_MANIFEST_SHA256 !== undefined && process.env.P1368_ACCEPTED45_MANIFEST_SHA256 !== rootPin) throw new Error('Only independently accepted1368 manifest pin is admitted.')
const bytes = (value: unknown) => stableStringify(value)
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
class Premise extends Error {}
function check(value: unknown, message: string): asserts value { if (!value) throw new Premise(message) }
function within(stage: string) { check(performance.now() - started <= budgetMs, `30-second total budget exceeded at ${stage}`) }
const result: Record<string, unknown> = {
  kind: 'non-leak267 current-budget-only counterfactual DIAGNOSTIC, not acceptance',
  status: 'STARTED', seed: 'p13a-core-causal-01', inputWeek: 267, targetProjectId: id, studioId,
  originalBudget: 40_000, constructedBudget: 20_000, naturallyChosenConstructedPolicy: false,
  inputChangesPermitted: ['target current budgetPerWeek ONLY'], options, totalBudgetMs: budgetMs,
  scope: 'one full tick per admitted arm, no780/900/seed search', ticksAttempted: 0,
  sourceDriverSHA256: sha(readFileSync(fileURLToPath(import.meta.url))),
  acceptedManifestSHA256: rootPin,
  acceptedRootMode: process.env.P1368_ACCEPTED45_ROOT === undefined ? 'default-repository1368' : 'explicit-paired1368-override',
  captureLoaderSHA256: sha(readFileSync('/Users/zacheryspector/studio-specialists/p15b/tests/helpers/1368-recovery-witnesses.ts')),
}
function admission(state: GameState, label: string): boolean {
  within(label + ':before-admission')
  const before = sha(bytes(state)); let error: string | null = null
  try { const saved = makeSave(state); check(validateSaveV48(saved) === saved, 'actual current reader failed envelope identity') }
  catch (caught) { error = (caught as Error).message }
  const after = sha(bytes(state)), admitted = error === null && before === after
  ;(result.admissions as unknown[]).push({ label, admitted, error, beforeSHA256: before, afterSHA256: after })
  within(label + ':after-admission'); return admitted
}
function project(state: GameState) {
  const p = state.technology.projects.find(p => p.id === id)
  check(p && p.studioId === studioId && p.technologyId === 'synchronized-sound', 'actual named research project absent/wrong owner')
  return p
}
function business(state: GameState) {
  const b = state.hollywood?.businesses.find(b => b.studioId === studioId)
  check(b, 'actual named rival business absent'); return b
}
function spend(state: GameState) { return business(state).account.periods.reduce((n, p) => n + p.movements.researchSpend, 0) }
function withoutCurrentBudget(state: GameState) {
  return { ...state, technology: { ...state.technology, projects: state.technology.projects.map(p => p.id === id ? { ...p, budgetPerWeek: null } : p) } }
}
function shared(state: GameState) {
  return { studio: state.studio, contracts: state.contracts, ledger: state.ledger,
    operations: state.operations, placement: state.placement, market: state.market, era: state.era, rngState: state.rngState,
    playerAccess: state.technology.access.filter(r => r.studioId === state.hollywood!.playerStudioId),
    access: state.technology.access, adoptions: state.technology.adoptions, chart: state.hollywood!.chart }
}
function disclosure(state: GameState) {
  return { sound: technologyForecast(technologyEntry('synchronized-sound'), state.market.tick),
    lighting: technologyForecast(technologyEntry('lighting-control-01'), state.market.tick),
    announcements: technologyAnnouncements(state.market.tick) }
}

result.admissions = []
try {
  within('load')
  const captured = accepted45('research') // genuine45 validator + public45→46→47→48; no clock/header retag
  result.capture = { week: captured.row.week, version: captured.row.version, rawSHA256: captured.row.rawSha256,
    gzipSHA256: captured.row.gzipSha256, qualification: captured.row.qualification }
  const original = captured.current.state
  check(original.seed === 'p13a-core-causal-01' && original.market.tick === 267, 'wrong exact capture seed/week')
  const p = project(original)
  check(isOperatingStudio(original, studioId), 'target actually closed')
  check(p.status === 'active' && p.budgetPerWeek === 40_000 && p.verifiedWork === 12 && p.expenditure === 80_000,
    'exact actual267 active40000/work12/spend80000 premise changed')
  check(p.seats.filter(s => s.releasedWeek === null).length === 4, 'exact actual267 four occupied seats absent')
  check(business(original).costCutting.since === null, 'target cutting; budget-only comparison would not retain intended ordinary policy premise')
  // Constructed state-variable variation, NOT a public rival-budget command or beginProject on active input.
  const constructed: GameState = { ...original, technology: { ...original.technology,
    projects: original.technology.projects.map(row => row.id === id ? { ...row, budgetPerWeek: 20_000 } : row) } }
  const beforeOriginal = sha(bytes(original)), beforeConstructed = sha(bytes(constructed))
  check(beforeOriginal !== beforeConstructed, 'counterfactual does not actually differ')
  const normalizedOriginal = sha(bytes(withoutCurrentBudget(original))), normalizedConstructed = sha(bytes(withoutCurrentBudget(constructed)))
  check(normalizedOriginal === normalizedConstructed, 'input differs beyond the ONE target current budget')
  result.inputComparison = { originalSHA256: beforeOriginal, constructedSHA256: beforeConstructed,
    normalizedOriginalSHA256: normalizedOriginal, normalizedConstructedSHA256: normalizedConstructed, soleCurrentBudgetDifference: true }
  const originalAdmitted = admission(original, 'original267'), constructedAdmitted = admission(constructed, 'constructed267-budget20000')
  check(originalAdmitted && constructedAdmitted, 'one or both arms rejected: NO tick permitted')
  const qOriginal = researchWeekQuote(original, p, studioContext(original, studioId))
  const qConstructed = researchWeekQuote(constructed, project(constructed), studioContext(constructed, studioId))
  result.quotes = { original: { spend: qOriginal.spend, output: qOriginal.output, seats: qOriginal.seats, bottleneck: qOriginal.bottleneck },
    constructed: { spend: qConstructed.spend, output: qConstructed.output, seats: qConstructed.seats, bottleneck: qConstructed.bottleneck } }
  check(sha(bytes(original)) === beforeOriginal && sha(bytes(constructed)) === beforeConstructed, 'quote mutated an input: NO tick permitted')
  check(qOriginal.spend > qConstructed.spend && qConstructed.spend > 0 && qOriginal.output > qConstructed.output && qConstructed.output > 0,
    'positive distinguishing budget-dependent work/spend quote not reached: NO tick permitted')
  check(bytes(shared(original)) === bytes(shared(constructed)) && bytes(disclosure(original)) === bytes(disclosure(constructed)), 'input shared/disclosure roots differ')
  const remaining = technologyEntry(p.technologyId).work - p.verifiedWork
  check(qOriginal.output < remaining && qConstructed.output < remaining, 'completion would confound this strictly one-week budget witness')
  within('first-full-tick')
  result.ticksAttempted = 1
  const nextOriginal = tick(original, options)
  check(sha(bytes(original)) === beforeOriginal, 'original input mutated by full tick')
  check(admission(nextOriginal, 'original268'), 'original full-tick successor rejected; constructed tick stopped')
  within('second-full-tick')
  result.ticksAttempted = 2
  const nextConstructed = tick(constructed, options)
  check(sha(bytes(constructed)) === beforeConstructed, 'constructed input mutated by full tick')
  check(admission(nextConstructed, 'constructed268'), 'constructed full-tick successor rejected')
  check(nextOriginal.market.tick === 268 && nextConstructed.market.tick === 268, 'full tick did not produce matched268 clocks')
  const outOriginal = project(nextOriginal), outConstructed = project(nextConstructed)
  const outcomes = [
    { arm: 'actual40000', quote: qOriginal, input: original, next: nextOriginal, out: outOriginal },
    { arm: 'constructed20000', quote: qConstructed, input: constructed, next: nextConstructed, out: outConstructed },
  ].map(({ arm, quote, input, next, out }) => ({ arm, verifiedWorkBefore: project(input).verifiedWork, verifiedWorkAfter: out.verifiedWork,
    workDelta: out.verifiedWork - project(input).verifiedWork, expenditureDelta: out.expenditure - project(input).expenditure,
    researchSpendMovementDelta: spend(next) - spend(input), rivalCashDelta: business(next).account.cash - business(input).account.cash,
    lastActualWeek: out.weeks.at(-1)?.week, lastActualSpend: out.weeks.at(-1)?.spend,
    expectedWorkDelta: quote.output, expectedSpend: quote.spend, successorSHA256: sha(bytes(next)) }))
  result.outcomes = outcomes
  for (const out of outcomes) {
    check(out.workDelta === out.expectedWorkDelta && out.expenditureDelta === out.expectedSpend, `${out.arm}: actual project work/spend differs from admitted quote`)
    check(out.lastActualWeek === 267 && out.lastActualSpend === out.expectedSpend, `${out.arm}: actual dated work receipt missing/different`)
    // Known named capture has only one project for this rival. Refuse if new research makes finance attribution ambiguous.
    check(out.researchSpendMovementDelta === -out.expectedSpend, `${out.arm}: actual rival research debit not exactly target spend`)
  }
  check(outOriginal.verifiedWork > outConstructed.verifiedWork && outOriginal.expenditure > outConstructed.expenditure, 'full ticks converged; no distinguishing research witness')
  const sharedOriginal = sha(bytes(shared(nextOriginal))), sharedConstructed = sha(bytes(shared(nextConstructed)))
  const publicOriginal = sha(bytes(disclosure(nextOriginal))), publicConstructed = sha(bytes(disclosure(nextConstructed)))
  result.outputComparisons = { sharedOriginalSHA256: sharedOriginal, sharedConstructedSHA256: sharedConstructed,
    disclosureOriginalSHA256: publicOriginal, disclosureConstructedSHA256: publicConstructed,
    sharedEqual: sharedOriginal === sharedConstructed, disclosureEqual: publicOriginal === publicConstructed }
  check(sharedOriginal === sharedConstructed && publicOriginal === publicConstructed, 'output player/shared/disclosure equality fails')
  check(sha(bytes(original)) === beforeOriginal && sha(bytes(constructed)) === beforeConstructed, 'input purity failed after both arms')
  within('complete')
  result.status = 'DISTINGUISHING_ONE_TICK_OBSERVED_NOT_ACCEPTANCE'
} catch (error) {
  result.status = error instanceof Premise ? 'UNMET_PREMISE_NOT_ACCEPTANCE' : 'DIAGNOSTIC_ERROR_NOT_ACCEPTANCE'
  result.error = (error as Error).message
  process.exitCode = error instanceof Premise ? 2 : 1
}
result.elapsedMs = performance.now() - started
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
process.stdout.write(JSON.stringify({ kind: result.kind, status: result.status, ticksAttempted: result.ticksAttempted,
  elapsedMs: result.elapsedMs, error: result.error ?? null, diagnosticSHA256: sha(readFileSync(outputPath)) }) + '\n')
