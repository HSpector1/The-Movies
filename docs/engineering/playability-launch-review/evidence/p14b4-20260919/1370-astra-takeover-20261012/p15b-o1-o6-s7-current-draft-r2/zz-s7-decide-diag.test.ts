// Adapt1344 s7 decide diagnostic: REAL private branch outcomes, no copied v1 cash classifier.
// Standalone process after same-arm natural run; source patch is SCRATCH ONLY.
import { it } from 'vitest'
import { readFileSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import { tick } from '../src/core/index.js'
import { makeSave } from '../src/core/save.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import * as policy from '../src/core/hollywoodPolicy.js'
import * as privateTick from '../src/core/hollywoodTick.js'
import { isOperatingStudio } from '../src/core/operatingState.js'
import { canon, requireTree, runOutput, sha } from './zz-s7-lib.js'

it('s7 current final private decide diagnostic with same-arm observer neutrality', () => {
  if (process.env.S7_OBSERVER_MODE !== 'decide') throw new Error('wrong observer mode')
  const tree = requireTree(), out = runOutput(), started = Date.now()
  const summaryPath = process.env.S7_NATURAL_SUMMARY, summaryPin = process.env.S7_NATURAL_SUMMARY_SHA256
  if (!summaryPath || !isAbsolute(summaryPath) || !summaryPin?.match(/^[a-f0-9]{64}$/))
    throw new Error('Require exact preceding fresh same-arm natural s7.json path+SHA256')
  const raw = readFileSync(summaryPath)
  if (sha(raw) !== summaryPin) throw new Error('natural summary pin mismatch')
  const natural = JSON.parse(raw.toString())
  if (natural.meta.seed !== 'p13a-core-causal-01' || natural.meta.weeks !== 520 || natural.meta.tree !== tree ||
      natural.meta.summaryWeek !== 521 || natural.meta.candidateSourceIdentity !== process.env.S7_CANDIDATE_SOURCE_ID)
    throw new Error('natural reference scope/source mismatch')
  type ObserverRow = { inputWeek:number; resultingStateWeek:number; studioId:string; kind:string; [key:string]:unknown }
  const setter = (privateTick as unknown as {setS7DecideObserver?:(observer:((row:ObserverRow)=>void)|null)=>void}).setS7DecideObserver
  if (!setter) throw new Error('PREREQUISITE: reviewed scratch-only private decide observer patch absent')
  type RefusedRow = {key:string;negative:number;marketing:number;cashAvailable:number;score:number;holdOperatingMargin:number;expectedOperatingMargin:number;expectedIncrementalContribution:number;directorId:string;castIds:string[]}
  const costSetter = (policy as unknown as {setS7RefusedViableObserver?:(observer:((row:RefusedRow)=>void)|null)=>void}).setS7RefusedViableObserver
  if (!costSetter) throw new Error('PREREQUISITE: reviewed exact refused viable cost observer absent')
  let atWeek = -1
  let state = p13aGeneratedStudio('p13a-core-causal-01'), state520 = ''
  const rows: string[] = [], counts: Record<string,number> = {}
  let pending: ObserverRow[] = [], ordinal = 0
  setter(row => pending.push(row)) // No state refs, policy return, market submissions or gameplay writes.
  costSetter(row => pending.push({ ...row, kind:'refusedViablePackage',inputWeek:atWeek,resultingStateWeek:atWeek+1,studioId:row.key.split(':')[0]! }))
  try {
    // Preserve extra520→521 summary transition and its observer coverage separately.
    while (state.market.tick <= 520) {
      const at = state.market.tick
      atWeek = at
      if (!isOperatingStudio(state,state.hollywood!.playerStudioId)) throw new Error(`UNMET PREMISE: player terminal at${at}; no tick`)
      if (at === 520) { makeSave(state); state520 = canon(state) }
      const before = sha(canon(state))
      pending = []
      const next = tick(state)
      if (next.market.tick !== at + 1) throw new Error('ordinary clock mismatch')
      const after = sha(canon(next))
      for (const row of pending) {
        if (row.inputWeek !== at || row.resultingStateWeek !== at+1) throw new Error('observer phase mismatch')
        if (row.kind === 'refusedViablePackage' && !(Number(row.negative)+Number(row.marketing)>Number(row.cashAvailable) && Number(row.score)>Number(row.holdOperatingMargin))) throw new Error('actual refused viable package cost/viability premise fails')
        if (row.kind === 'evaluation' && row.outcome !== 'staffingBlocked' && row.outcome !== 'viable') {
          const a = Number(row.affordable), u = Number(row.unaffordable), v = Number(row.viable), uv = Number(row.unaffordableViable)
          if (![a,u,v,uv].every(n=>Number.isInteger(n)&&n>=0) || v>a || uv>u) throw new Error('actual search counters invalid')
          const costs = pending.filter(r=>r.kind==='refusedViablePackage' && r.key===`${row.studioId}:package:${row.scriptProjectId}`)
          if (costs.length!==uv) throw new Error('exact refused viable cost rows do not reconcile with actual search count')
          if ((uv>0?'cashBlocked':'economicRejection') !== row.outcome) throw new Error('actual v2 refusal classifier drift')
        }
        const key = `${row.kind}:${row.phase??''}:${row.outcome??row.reason??''}`
        counts[key] = (counts[key]??0)+1
        rows.push(JSON.stringify({ arm:tree,seed:'p13a-core-causal-01',observerOrdinal:ordinal++,
          scope:at===520?'legacy-summary-transition':'natural0-through519',inputStateSHA256:before,outputStateSHA256:after,...row }))
      }
      state = next
    }
  } finally { setter(null); costSetter(null) }
  const final520 = sha(state520), summary521 = sha(canon(state))
  if (final520 !== natural.meta.finalStateSha256 || summary521 !== natural.meta.summaryStateSha256)
    throw new Error('OBSERVER NEUTRALITY FAILED: actual520/521 states differ from unobserved same-arm natural replay')
  requireTree()
  out.write('decide-diag.jsonl',rows.join('\n')+'\n')
  out.write('decide-diag-summary.json',JSON.stringify({status:'final-arm-only-observed-not-full1363V',seed:'p13a-core-causal-01',weeks:520,tree,
    sourceManifestSHA256:process.env.S7_SOURCE_MANIFEST_SHA256,candidateSourceIdentity:process.env.S7_CANDIDATE_SOURCE_ID,naturalSourceManifestSHA256:natural.meta.sourceManifestSHA256,naturalSummarySHA256:summaryPin,
    rows:rows.length,counts,stateAtEndSha256:final520,summaryStateSha256:summary521,observerNeutrality520and521:true,
    gaps:['full staffing/private market/promise branch attribution not instrumented','current-control comparison not run',
      'five-seed/6240/pressure/GL/postrelease obligations not supplied'],ms:Date.now()-started},null,2)+'\n')
}, 3_600_000)
