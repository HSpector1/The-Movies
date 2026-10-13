// Diagnostic only: one20k week267, admitted current-budget restore40k at268, full ticks to780/900.
// Not originalp13b-s8 seed requalification, a natural policy claim, replacement tests or acceptance.
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
const outputPath = process.env.P15B_NONLEAK_SINGLE_WEEK_JSON
if (!outputPath || !isAbsolute(outputPath)) throw new Error('Set required absolute fresh P15B_NONLEAK_SINGLE_WEEK_JSON.')
if (existsSync(outputPath) || !lstatSync(dirname(outputPath)).isDirectory()) throw new Error('Diagnostic output must be fresh in an existing directory.')
if ((process.env.P1368_ACCEPTED45_ROOT === undefined) !== (process.env.P1368_ACCEPTED45_MANIFEST_SHA256 === undefined)) throw new Error('Explicit1368 root and pin must be supplied together.')
if (process.env.P1368_ACCEPTED45_MANIFEST_SHA256 !== undefined && process.env.P1368_ACCEPTED45_MANIFEST_SHA256 !== rootPin) throw new Error('Only independently accepted1368 manifest pin is admitted.')
const bytes = (value: unknown) => stableStringify(value)
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
class Premise extends Error {}
function check(value: unknown, message: string): asserts value { if (!value) throw new Premise(message) }
function within(stage: string) { check(performance.now() - started <= budgetMs, `30-second total budget exceeded at ${stage}`) }
const result: Record<string, unknown> = {
  kind: 'non-leak267 ONE-WEEK20k then restore40k at268 forward780/900 DIAGNOSTIC, constructed policy not originalseed/acceptance',
  status: 'STARTED', seed: 'p13a-core-causal-01', inputWeek: 267, targetProjectId: id, studioId,
  originalBudget: 40_000, constructedBudget: 20_000, restoredBudget: 40_000, restoreWeek: 268,
  constructedPolicy: '20k only for worked267; current40k restored at admitted268', naturallyChosenConstructedPolicy: false,
  inputChangesPermitted: ['target current budgetPerWeek ONLY'], options, totalBudgetMs: budgetMs,
  scope: 'same admitted267 pair, full ordinary develop:true ticks to780 then900, no seed search/terminal bypass', ticksAttempted: 0,
  sourceDriverSHA256: sha(readFileSync(fileURLToPath(import.meta.url))),
  acceptedManifestSHA256: rootPin,
  priorMeasuredOneTickDiagnosticSHA256: '77d5b73a966dabe12c172f3a9f0e73cb36ac2cdef0f9e826d4de45d206bb1aee', // retained supplied prior observation, not current run evidence
  originalInvalidFixtureSeedNotRequalified: 'p13b-s8-nonleak-01',
  endpoints: [],
  nextTick: null,
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
  result.oneTickReproduced = true
  // Current-policy restoration only: do not rewrite the earned267 debit/work/receipt or any history.
  check(nextConstructed.market.tick === 268 && project(nextConstructed).status === 'active'
    && project(nextConstructed).budgetPerWeek === 20_000, 'restore requires actual admitted active268 at20k')
  const beforeRestoreInput = sha(bytes(nextConstructed))
  const original268Input = sha(bytes(nextOriginal))
  const restored = { ...nextConstructed, technology: { ...nextConstructed.technology,
    projects: nextConstructed.technology.projects.map(p => p.id === id ? { ...p, budgetPerWeek: 40_000 } : p) } }
  check(bytes(withoutCurrentBudget(restored)) === bytes(withoutCurrentBudget(nextConstructed)), 'restore changed something beyond current budget: NO tick')
  check(sha(bytes(nextConstructed)) === beforeRestoreInput, 'restore constructor mutated admitted268 source')
  check(admission(restored, 'restored268-currentbudget40000'), 'restored input refused: NO later tick')
  const restoredInput = sha(bytes(restored))
  const actual268Quote = researchWeekQuote(nextOriginal, project(nextOriginal), studioContext(nextOriginal, studioId))
  check(sha(bytes(nextOriginal)) === original268Input, 'actual268 quote mutated input')
  const restoredQuote = researchWeekQuote(restored, project(restored), studioContext(restored, studioId))
  check(actual268Quote.output > 0 && actual268Quote.spend > 0
    && restoredQuote.output === actual268Quote.output && restoredQuote.spend === actual268Quote.spend,
    'restored268 current terms do not match positive actual268 terms')
  check(sha(bytes(restored)) === restoredInput, 'restored quote mutated input')
  result.restoration = { week: 268, previousCurrentBudget: 20_000, restoredCurrentBudget: 40_000,
    constructedCurrentPolicyOnly: true, historyChanged: false, wholeInputAdmitted: true,
    beforeInputSHA256: beforeRestoreInput, afterInputSHA256: restoredInput,
    quote: { actual268Output: actual268Quote.output, actual268Spend: actual268Quote.spend, restoredOutput: restoredQuote.output, restoredSpend: restoredQuote.spend },
    expectedCompletionIfSubsequentTermsRemain: 276, expectedFinalSpendIfSubsequentTermsRemain: 420_000,
    predictionIsNotMeasuredOrGameplayLaw: true }
  let actual = nextOriginal, counterfactual = restored
  // Each already admitted arm runs ordinary ticks. No deferPlayerClosure or funding action.
  for (const target of [780, 900]) {
    while (actual.market.tick < target || counterfactual.market.tick < target) {
      check(actual.market.tick === counterfactual.market.tick, 'continuation arm clocks diverged')
      const at = actual.market.tick
      for (const [arm, input] of [['actual40000', actual], ['constructed20000', counterfactual]] as const) {
        const own = input.hollywood!.playerStudioId
        if (!isOperatingStudio(input, own)) {
          const terminal = input.studioClosure.closures.find(c => c.studioId === own)!
          result.stop = { arm, week: at, target, playerClosureWeek: terminal.closureWeek, reason: 'actual player terminal BEFORE target; NO further tick' }
          admission(input, `${arm}-terminal${at}`)
          throw new Premise(`${arm}: actual player closed at${terminal.closureWeek} before target${target}; no terminal bypass`)
        }
      }
      if (at % 130 === 0) process.stdout.write(JSON.stringify({ progressWeek: at, target, ticksAttempted: result.ticksAttempted }) + '\n')
      within(`continuation${at}:before-actual`)
      result.nextTick = { arm: 'actual40000', fromWeek: at, target }
      result.ticksAttempted = Number(result.ticksAttempted) + 1
      const nextA = tick(actual, options)
      check(nextA.market.tick === at + 1, `actual40000 tick clock differs at${at}`)
      within(`continuation${at}:after-actual`)
      result.nextTick = { arm: 'constructed20000', fromWeek: at, target }
      result.ticksAttempted = Number(result.ticksAttempted) + 1
      const nextB = tick(counterfactual, options)
      check(nextB.market.tick === at + 1, `constructed20000 tick clock differs at${at}`)
      within(`continuation${at}:after-constructed`)
      actual = nextA; counterfactual = nextB
      result.lastCompletedPairWeek = at + 1
    }
    const admitA = admission(actual, `actual40000-endpoint${target}`)
    const admitB = admission(counterfactual, `constructed20000-endpoint${target}`)
    check(admitA && admitB, `endpoint${target} full admission rejected; no later continuation`)
    const a = project(actual), b = project(counterfactual)
    const earned = (p: typeof a) => ({ status: p.status, verifiedWork: p.verifiedWork, expenditure: p.expenditure,
      startedWeek: p.startedWeek, completedWeek: p.completedWeek, seats: p.seats, weeks: p.weeks, legacy: p.legacy })
    const historyA = sha(bytes(earned(a))), historyB = sha(bytes(earned(b)))
    const firstA = a.weeks.find(r => r.week === 267), firstB = b.weeks.find(r => r.week === 267)
    check(firstA?.spend === 40_000 && firstB?.spend === 20_000, `endpoint${target}: actual267 earned divergent spend missing`)
    check(historyA !== historyB && a.expenditure !== b.expenditure, `endpoint${target}: no retained earned research divergence beyond current budget`)
    const opA = sha(bytes(actual.operations)), opB = sha(bytes(counterfactual.operations))
    const placementA = sha(bytes(actual.placement)), placementB = sha(bytes(counterfactual.placement))
    const accessA = sha(bytes(actual.technology.access)), accessB = sha(bytes(counterfactual.technology.access))
    const adoptionA = sha(bytes(actual.technology.adoptions)), adoptionB = sha(bytes(counterfactual.technology.adoptions))
    const chartA = sha(bytes(actual.hollywood!.chart)), chartB = sha(bytes(counterfactual.hollywood!.chart))
    const beforeReadA = sha(bytes(actual)), beforeReadB = sha(bytes(counterfactual))
    const lightA = technologyForecast(technologyEntry('lighting-control-01'), actual.market.tick)
    const lightB = technologyForecast(technologyEntry('lighting-control-01'), counterfactual.market.tick)
    const announceA = technologyAnnouncements(actual.market.tick), announceB = technologyAnnouncements(counterfactual.market.tick)
    const expectedForecast = target === 780 ? { kind: 'window', fromWeek: 884, toWeek: 988 }
      : { kind: 'exact', commercialWeek: 936, announcedWeek: 884 }
    const expectedAnnouncements = target === 780 ? [] : [{ technologyId: 'lighting-control-01', week: 884 }]
    const endpoint = { week: target, admitted: true,
      actual: { currentBudgetPerWeek: a.budgetPerWeek, status: a.status, verifiedWork: a.verifiedWork, expenditure: a.expenditure, completedWeek: a.completedWeek,
        earnedHistorySHA256: historyA, first267Spend: firstA?.spend, first267Units: firstA?.units,
        targetActualClosedWeek: actual.studioClosure.closures.find(c => c.studioId === studioId)?.closureWeek ?? null,
        stateSHA256: beforeReadA },
      constructed: { currentBudgetPerWeek: b.budgetPerWeek, status: b.status, verifiedWork: b.verifiedWork, expenditure: b.expenditure, completedWeek: b.completedWeek,
        earnedHistorySHA256: historyB, first267Spend: firstB?.spend, first267Units: firstB?.units,
        targetActualClosedWeek: counterfactual.studioClosure.closures.find(c => c.studioId === studioId)?.closureWeek ?? null,
        stateSHA256: beforeReadB },
      operations: { actualSHA256: opA, constructedSHA256: opB, equal: opA === opB },
      placement: { actualSHA256: placementA, constructedSHA256: placementB, equal: placementA === placementB },
      original780Invariants: { access: { actualSHA256: accessA, constructedSHA256: accessB, equal: accessA === accessB },
        adoptions: { actualSHA256: adoptionA, constructedSHA256: adoptionB, equal: adoptionA === adoptionB },
        chart: { actualSHA256: chartA, constructedSHA256: chartB, equal: chartA === chartB } },
      lightingForecast: { actual: lightA, constructed: lightB, expected: expectedForecast },
      announcements: { actual: announceA, constructed: announceB, expected: expectedAnnouncements } }
    ;(result.endpoints as unknown[]).push(endpoint)
    if(target === 780) check(accessA === accessB && adoptionA === adoptionB && chartA === chartB,
      'original780 access/adoption/chart invariant differs: NO waiver or later continuation')
    check(sha(bytes(nextOriginal)) === original268Input && sha(bytes(nextConstructed)) === beforeRestoreInput
      && sha(bytes(restored)) === restoredInput, `endpoint${target}: admitted268 source/restored input mutated`)

    check(opA === opB && placementA === placementB, `endpoint${target}: player operations/placement diverged`)
    check(bytes(lightA) === bytes(lightB) && bytes(lightA) === bytes(expectedForecast), `endpoint${target}: lighting forecast equality/exact expected clause failed`)
    check(bytes(announceA) === bytes(announceB) && bytes(announceA) === bytes(expectedAnnouncements), `endpoint${target}: announcement equality/clock clause failed`)
    check(sha(bytes(actual)) === beforeReadA && sha(bytes(counterfactual)) === beforeReadB, `endpoint${target}: disclosure reads mutated input`)
    within(`endpoint${target}:complete`)
    process.stdout.write(JSON.stringify({ endpointWeek: target, admittedBoth: true, retainedEarnedResearchDifference: true, operationsPlacementEqual: true, disclosureEqualAndExpected: true }) + '\n')
  }
  check(sha(bytes(original)) === beforeOriginal && sha(bytes(constructed)) === beforeConstructed, 'original267 arms mutated during forward continuation')
  result.nextTick = null
  result.status = 'SINGLE_WEEK_RESTORED_FORWARD780_900_OBSERVED_NOT_ORIGINALSEED_OR_ACCEPTANCE'
} catch (error) {
  result.status = error instanceof Premise ? 'UNMET_PREMISE_NOT_ACCEPTANCE' : 'DIAGNOSTIC_ERROR_NOT_ACCEPTANCE'
  result.error = (error as Error).message
  process.exitCode = error instanceof Premise ? 2 : 1
}
result.elapsedMs = performance.now() - started
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
process.stdout.write(JSON.stringify({ kind: result.kind, status: result.status, ticksAttempted: result.ticksAttempted,
  elapsedMs: result.elapsedMs, error: result.error ?? null, diagnosticSHA256: sha(readFileSync(outputPath)) }) + '\n')
