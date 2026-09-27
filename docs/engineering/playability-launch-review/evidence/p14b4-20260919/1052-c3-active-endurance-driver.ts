// Independent active-player endurance under1052-A/B,1056,1083. Parent alone runs.
// One variant per invocation. No import-time world, filesystem or gameplay work.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { applyActions } from '../../../../../src/core/actions.ts'
import { assignmentRefusal, contractEndRefusal, retirementRecordFor } from '../../../../../src/core/careerLifecycle.ts'
import { activeContract, busyTalentIds, canAfford, hiringMarketIds, renewalWindowOpen } from '../../../../../src/core/employment.ts'
import { initializeHollywood } from '../../../../../src/core/hollywood.ts'
import { GENRE_ORDER } from '../../../../../src/core/index.ts'
import { attachPromise, promiseFeasibility, type PromiseAttachment } from '../../../../../src/core/promises.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, stableStringify, validateSaveV38 } from '../../../../../src/core/save.ts'
import { nextStudioDecision, scriptProjectsReadModel } from '../../../../../src/core/scriptReadModel.ts'
import { commissionSetRefusal, productionBoundToSet, repairSetRefusal, setMountedOn, strikeSetRefusal } from '../../../../../src/core/sets.ts'
import { resolveShape } from '../../../../../src/core/shape.ts'
import { caseForTalent, marketEligibility, openMarketCaseFor, playerOffer, proposalDraft, submitProposal,
  type ProposalIntent } from '../../../../../src/core/talentMarket.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { TUNING } from '../../../../../src/core/tuning.ts'
import { generateWorld } from '../../../../../src/core/worldgen.ts'
import type { Action, CustomTalentInput, FilmCreativeRole, GameState, Talent } from '../../../../../src/core/types.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { observeC3EnduranceReads, observeC3EnduranceRuntime } from '../../../../../bridge/testing/c3-active-endurance-observer.ts'

export type EnduranceVariant = 'A' | 'B' | 'C' | 'D'
export type ByteIdentity = { bytes: number; sha256: string }
export type ObservationTiming = { phase: string; kind: 'operation' | 'inspection'; elapsedMs: number }
export type ObservationFailure = { phase: string; message: string }
export type ReadObservationRequest = {
  variant: EnduranceVariant; week: number; ordinal: number; saveJson: string; saveSha256: string
  order: 'forward' | 'reverse'; focusPersonIds: readonly string[]
}
export type RuntimeObservationRequest = {
  variant: 'A'; week: 0 | 3120 | 6240; saveJson: string; saveSha256: string
  runtimeRoot: string; checkpointPath: string
}
export type ReadObservationResult = {
  status: 'PASS' | 'FAIL'; failure: ObservationFailure | null; week: number
  input: ByteIdentity; isolatedAfter: ByteIdentity | null
  counts: { snapshots: number; people: number; calendars: number; industry: number; market: number; profilesChecked: number }
  reads: readonly { key: string; surface: string; targetId: string | null; page: number | null
    pageSize: number | null; totalRows: number | null; pageCount: number | null; rows: number
    repeated: boolean; identity: ByteIdentity; elapsedMs: number }[]
  privacyChecks: number; schemaChecks: number; timings: readonly ObservationTiming[]
}
export type RuntimeObservationResult = {
  status: 'PASS' | 'FAIL'; failure: ObservationFailure | null; cleanupFailure: string | null; week: 0 | 3120 | 6240
  input: ByteIdentity; checkpointPath: string; dispatchAttempts: number; firstSeen: number; replayed: number
  campaignAttempts: number; reopenCount: number; rolloverCount: number; freshSessionCalls: number; actualTicks: 0
  limits: { maxCheckpointBytes: number; maxJournalBytes: number; maxJournalEntries: number
    maxLibraryBytes: number; maxRecords: number; maxDecodedLibraryBytes: number }
  boundaries: readonly { phase: string; encodedLibrary: ByteIdentity; decodedCellsBytes: number
    workingCheckpoint: ByteIdentity; currentSave: ByteIdentity; savedSave: ByteIdentity | null
    journalEntries: number; journalBytes: number; recordCount: number; receiptCount: number; sessionId: string; revision: number }[]
  requests: readonly { phase: string; route: 'save' | 'load'; commandId: string; accepted: boolean
    firstSeen: boolean; rolledOver: boolean; request: ByteIdentity; response: ByteIdentity }[]
  store: { reads: number; writes: number; closes: number; readMs: number; writeMs: number; closeMs: number }
  timings: readonly ObservationTiming[]
}

const SEED = 'p14c3-active-endurance-6240-01'
const SCHEMA = 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d'
const HORIZON = 6240, COMPACT_CAP = 16 * 1024 ** 2, ARTIFACT_CAP = 256 * 1024 ** 2, DIRECTORY_CAP = 1024 ** 3
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const codePoint = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const identity = (text: string | Uint8Array): ByteIdentity => ({ bytes: Buffer.byteLength(text),
  sha256: createHash('sha256').update(text).digest('hex') })
const equal = (a: unknown, b: unknown, message: string) => assert.ok(stableStringify(a) === stableStringify(b), message)
const six = (value: number) => [value, value, value, value, value, value]
function creator(name: string, role: FilmCreativeRole, age: number, secondary?: 'directing' | 'writing'): CustomTalentInput {
  const skills = { acting: six(20), directing: six(20), writing: six(20), craft: six(20), research: six(1) }
  skills[role === 'actor' ? 'acting' : role === 'director' ? 'directing' : role === 'writer' ? 'writing' : 'craft'] = six(75)
  if (secondary) skills[secondary] = six(80)
  return { name, role, age, workEthic: 55, fame: 25, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, skills }
}
function creators(): CustomTalentInput[] { return [
  creator('Endurance Actor D', 'actor', 68, 'directing'), creator('Endurance Actor W', 'actor', 68, 'writing'),
  creator('Endurance initial Director', 'director', 30), creator('Endurance initial Writer', 'writer', 30),
  creator('Endurance support Actor', 'actor', 30), creator('Endurance Craft', 'craft', 30),
] }
type Command = { kind: 'action'; action: Action } | { kind: 'initializeHollywood' }
  | { kind: 'proposal'; proposal: ProposalIntent }
  | { kind: 'attachPromise'; talentId: string; issuerStudioId: string; attachment: PromiseAttachment }
type Trace = { week: number; ordinal: number; purpose: string; command: Command
  status: 'ACCEPTED' | 'REFUSED_PUBLICLY' | 'FAILED'; reason: string | null; elapsedMs: number; engineInvoked: boolean }
type Slot = { ordinal: number; opening: number; closes: number; commissionWeek: number | null
  mintedOrdinal: number | null; commissionQueue: number | null; projectId: string | null
  greenlightQueue: number | null; productionId: string | null; releaseWeek: number | null }
type Counters = { ticks: number; tickAttempts: number; commands: number; engineCalls: number; creators: number; commissions: number
  greenlights: number; releases: number; setMaintenance: number; attachments: number; reads: number; runtimeSamples: number }
type Checkpoint = { week: number; save: ByteIdentity; roots: Record<string, ByteIdentity>; counts: Record<string, number>
  focus: unknown; rss: number; maxRSS: number }
type RunMetadata = { status: 'PASS' | 'FAIL'; variant: EnduranceVariant; seed: string; source: ReturnType<typeof sourceIdentity>
  producer: ByteIdentity; initial: { generated: string; funded: string; sourceCash: number; delta: number }
  initialCheckpoint: string | null; counters: Counters; files: { path: string; identity: ByteIdentity }[] }
type Options = { variant: EnduranceVariant; output: string; sourceSha: string; baseline: string | null; predecessor: string | null }
function sourceIdentity(root: string) {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  return { head: git('rev-parse', 'HEAD').trim(), diff: identity(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...SOURCE)),
    tracked: identity(git('ls-files', '--stage', '--', ...SOURCE)), untracked: git('ls-files', '--others', '--exclude-standard', '--', ...SOURCE).trim() }
}
const COMPACT_FILES = ['commands.jsonl', 'observations.jsonl', 'checkpoints.jsonl', 'failure.json', 'metadata.json']
function artifactInventory(directory: string): { path: string; identity: ByteIdentity }[] {
  const result: { path: string; identity: ByteIdentity }[] = []
  const visit = (current: string) => { for (const name of readdirSync(current).sort(codePoint)) {
    const path = resolve(current, name), stat = lstatSync(path), local = relative(directory, path)
    assert.equal(stat.isSymbolicLink(), false, 'artifact symlink refused')
    if (stat.isDirectory()) { assert.equal(local, 'runtime', 'only declared runtime subdirectory'); visit(path) }
    else {
      assert.ok(stat.isFile())
      const compact = COMPACT_FILES.includes(local)
      assert.ok(compact || ['authority-3120.json', 'authority-6240.json', 'authority-failure.json'].includes(local)
        || /^runtime\/week-(0|3120|6240)\.library\.json$/.test(local), `undeclared artifact${local}`)
      assert.ok(stat.size <= (compact ? COMPACT_CAP : ARTIFACT_CAP), `artifact cap${local}`)
      result.push({ path: local, identity: identity(readFileSync(path)) })
    }
  } }
  visit(directory); assert.ok(result.length <= 10, 'ten persistent files per variant')
  assert.ok(result.reduce((n, row) => n + row.identity.bytes, 0) <= DIRECTORY_CAP, '1GiB directory cap')
  return result
}
class Artifacts {
  constructor(readonly directory: string) {
    assert.equal(existsSync(directory), false, 'exclusive new output directory; no overwrite/cleanup')
    mkdirSync(directory, { mode: 0o700 })
    for (const name of ['commands.jsonl', 'observations.jsonl', 'checkpoints.jsonl']) writeFileSync(resolve(directory, name), '', { flag: 'wx' })
  }
  inventory(): { path: string; identity: ByteIdentity }[] {
    return artifactInventory(this.directory)
  }
  private capacity(additional: number, newFiles = 0) {
    // Count bytes without reading/hashing every previous artifact on each append.
    let bytes = 0, files = 0
    const visit = (directory: string) => { for (const name of readdirSync(directory)) {
      const stat = lstatSync(resolve(directory, name)); assert.equal(stat.isSymbolicLink(), false)
      if (stat.isDirectory()) visit(resolve(directory, name)); else { bytes += stat.size; files++ }
    } }
    visit(this.directory); assert.ok(files + newFiles <= 10 && bytes + additional <= DIRECTORY_CAP, 'artifact directory bound')
  }
  append(name: 'commands.jsonl' | 'observations.jsonl' | 'checkpoints.jsonl', value: unknown) {
    const text = JSON.stringify(value) + '\n', path = resolve(this.directory, name), bytes = Buffer.byteLength(text)
    assert.ok(lstatSync(path).size + bytes <= COMPACT_CAP, `${name}16MiB cap`)
    this.capacity(bytes); appendFileSync(path, text)
  }
  write(name: string, text: string, authority = false) {
    const path = resolve(this.directory, name)
    assert.equal(dirname(path), this.directory, 'only declared flat producer artifact')
    assert.ok(Buffer.byteLength(text) <= (authority ? ARTIFACT_CAP : COMPACT_CAP), `${name} size cap`)
    assert.equal(existsSync(path), false); this.capacity(Buffer.byteLength(text), 1)
    writeFileSync(path, text, { flag: 'wx' })
  }
}
function parseOptions(args: string[], root: string): Options {
  const values = new Map<string, string>()
  assert.equal(args.length % 2, 0, 'CLI requires flag/value pairs')
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]!, value = args[i + 1]!
    assert.ok(['--variant', '--output', '--source-sha', '--baseline', '--predecessor'].includes(key) && !values.has(key))
    values.set(key, value)
  }
  const variant = values.get('--variant'); assert.ok(variant === 'A' || variant === 'B' || variant === 'C' || variant === 'D')
  const outputArg = values.get('--output'), sourceSha = values.get('--source-sha')
  assert.ok(outputArg && sourceSha && /^[a-f0-9]{40}$/.test(sourceSha))
  const output = resolve(root, outputArg), evidence = resolve(root, 'docs/engineering/playability-launch-review/evidence/p14b4-20260919')
  assert.equal(dirname(output), evidence)
  assert.ok(new RegExp(`^1052-c3-endurance-${variant}-[a-z0-9-]+$`).test(basename(output)), 'fixed exclusively owned output namespace')
  const baseline = values.get('--baseline'), predecessor = values.get('--predecessor')
  assert.equal(Boolean(baseline), variant !== 'A'); assert.equal(Boolean(predecessor), variant !== 'A')
  return { variant, output, sourceSha, baseline: baseline ? resolve(root, baseline) : null, predecessor: predecessor ? resolve(root, predecessor) : null }
}

class Endurance {
  state: GameState
  readonly counts: Counters = { ticks: 0, tickAttempts: 0, commands: 0, engineCalls: 0, creators: 0, commissions: 0,
    greenlights: 0, releases: 0, setMaintenance: 0, attachments: 0, reads: 0, runtimeSamples: 0 }
  readonly slots: Slot[] = [...[0, 26, 52, 78, 104, 130], ...Array.from({ length: 116 }, (_, n) => 208 + 52 * n)]
    .map((opening, ordinal, all) => ({ ordinal, opening, closes: all[ordinal + 1] ?? HORIZON,
      commissionWeek: null, mintedOrdinal: null, commissionQueue: null, projectId: null,
      greenlightQueue: null, productionId: null, releaseWeek: null }))
  readonly ids: string[] = []
  readonly attemptedCases = new Set<string>()
  readonly tickMs: number[] = []
  readonly comparison: Map<number, Checkpoint>
  readonly baselineTrace: Trace[]
  readonly readWeeks = new Set<number>()
  readonly decisionBlocks = new Set<number>()
  readonly initial: RunMetadata['initial']
  baselineCursor = 0; weekAttempts = 0; startup = 0
  lastQualified: { week: number; raw: string } | null = null
  initialCheckpoint: string | null = null
  phase = 'fresh-generation'; peakRss = 0
  constructor(readonly options: Options, readonly artifacts: Artifacts, readonly baseline: RunMetadata | null,
    baselineTrace: Trace[], checkpoints: Checkpoint[]) {
    this.baselineTrace = baselineTrace; this.comparison = new Map(checkpoints.map(row => [row.week, row]))
    const generatedState = generateWorld(SEED)
    assert.equal(generatedState.market.tick, 0); assert.equal(generatedState.foundingRegime, 'endowed')
    const generated = this.save(generatedState, 'initial-generated')
    const sourceCash = generatedState.studio.cash, delta = 2_000_000_000 - sourceCash
    assert.ok(delta > 0, 'fixed positive endowment; no adaptive funding arrangement')
    this.state = { ...generatedState, studio: { ...generatedState.studio, cash: 2_000_000_000 }, ledger: [...generatedState.ledger,
      { week: 0, kind: 'studioRevenue', amount: delta, note: 'C3 generated endurance initial endowment; not earned film revenue' }] }
    equal({ ...this.state, studio: generatedState.studio, ledger: generatedState.ledger }, generatedState,
      'only initial cash and one exact balancing ledger suffix change')
    const funded = this.save(this.state, 'initial-funded')
    this.initial = { generated, funded, sourceCash, delta }
    if (baseline) { assert.ok(generated === baseline.initial.generated); assert.ok(funded === baseline.initial.funded) }
  }
  record(value: unknown) { this.artifacts.append('observations.jsonl', value) }
  save(state: GameState, phase: string): string {
    const start = performance.now(), envelope = makeSave(state)
    // makeSave is itself the whole38 validating writer; avoid a redundant third
    // validation beyond that writer and the public export boundary.
    assert.equal(envelope.saveVersion, 38)
    const raw = exportSave(envelope)
    this.record({ kind: 'timing', phase, week: state.market.tick, category: 'save-validation-export', elapsedMs: performance.now() - start })
    return raw
  }
  person(id: string): Talent { const p = this.state.talent.find(row => row.id === id); assert.ok(p); return p }
  issuer(): string { assert.ok(this.state.hollywood); return this.state.hollywood.playerStudioId }
  room(): boolean { return this.weekAttempts < 16 && this.counts.commands < 12480 }
  term(id: string, start = this.state.market.tick): number | null {
    return [...TUNING.CONTRACT_TERM_OPTIONS].filter(term => term <= 208)
      .sort((a, b) => b - a).find(term => contractEndRefusal(this.state, id, start + term) === null) ?? null
  }
  publicRefusal(command: Command): string | null {
    const state = this.state, week = state.market.tick
    if (command.kind === 'initializeHollywood') return null
    if (command.kind === 'proposal') {
      const p = command.proposal, view = caseForTalent(state, p.talentId), raw = openMarketCaseFor(state, p.talentId)
      if (!view || !raw || raw.variant !== 'expiry') return 'ordinary proposal has no current ordinary case'
      if (!marketEligibility(state, p.talentId).proposers.includes(p.issuerStudioId)) return 'issuer is not publicly eligible'
      const lifecycle = contractEndRefusal(state, p.talentId, view.decisionWeek + p.termWeeks)
      if (lifecycle) return lifecycle
      const price = proposalDraft(state, p.issuerStudioId, p.talentId, p.termWeeks, p.premiumTier)
      const afford = canAfford(state, price.signingBonus); return afford.ok ? null : afford.reason
    }
    if (command.kind === 'attachPromise') {
      const p = state.talentMarket.proposals.find(row => row.talentId === command.talentId && row.issuerStudioId === command.issuerStudioId)
      assert.ok(p)
      const f = promiseFeasibility(state, { ...command.attachment, issuerStudioId: command.issuerStudioId,
        beneficiaryPersonId: command.talentId, startWeek: p.startWeek, termWeeks: p.termWeeks }, week)
      return f.classification === 'REASONABLY_ACHIEVABLE' ? null : stableStringify(f)
    }
    const action = command.action
    if (action.kind === 'signContract' || action.kind === 'renewContract') {
      const old = activeContract(state, action.talentId), start = week
      const reason = contractEndRefusal(state, action.talentId, start + action.termWeeks)
      if (reason) return reason
      if (action.kind === 'signContract' && !hiringMarketIds(state).includes(action.talentId)) return 'not in the actual hiring market'
      if (action.kind === 'renewContract' && (!old || !renewalWindowOpen(old, week) || openMarketCaseFor(state, action.talentId)))
        return 'ordinary immediate renewal is not available outside a case'
      const offer = playerOffer(state, action.talentId, action.termWeeks, start)
      const afford = canAfford(state, offer.signingBonus); return afford.ok ? null : afford.reason
    }
    if (action.kind === 'repairSet') { const r = repairSetRefusal(state, action.setId); return r ? stableStringify(r) : null }
    if (action.kind === 'strikeSet') { const r = strikeSetRefusal(state, action.setId); return r ? stableStringify(r) : null }
    if (action.kind === 'commissionSet') { const r = commissionSetRefusal(state, action.commission); return r ? stableStringify(r) : null }
    if (action.kind === 'commissionOriginalScreenplay') {
      const model = scriptProjectsReadModel(state), writer = model.commission.writers.find(row => row.id === action.screenplay.writerId)
      if (!model.commission.canSubmitOriginalIntent || !writer?.available) return stableStringify(model.commission.blockers)
      return assignmentRefusal(state, action.screenplay.writerId, week, 'writer')
    }
    if (action.kind === 'greenlightScriptProject') {
      const p = action.production, model = scriptProjectsReadModel(state).packages.find(row => row.projectId === p.projectId)
      if (!model?.availability.canSubmitGreenlightIntent) return stableStringify(model?.availability.blockers ?? ['package unavailable'])
      for (const [id, role] of [[p.directorId, 'director'], ...Object.values(p.cast).map(id => [id, 'actor']),
        ...p.craftIds.map(id => [id, 'craft'])] as [string, FilmCreativeRole][]) {
        const reason = assignmentRefusal(state, id, week, role); if (reason) return reason
      }
      const afford = canAfford(state, p.budget.negative + p.budget.marketing); return afford.ok ? null : afford.reason
    }
    return null
  }
  execute(command: Command, purpose: string, expected?: Trace): boolean {
    assert.ok(this.room(), '16 weekly/12480 total attempt bounds')
    const week = this.state.market.tick, ordinal = this.counts.commands
    this.weekAttempts++; this.counts.commands++
    const action = command.kind === 'action' ? command.action : null
    if (action?.kind === 'createCustomTalent') assert.ok(++this.counts.creators <= 6)
    if (action?.kind === 'commissionOriginalScreenplay') assert.ok(++this.counts.commissions <= 122)
    if (action?.kind === 'greenlightScriptProject') assert.ok(++this.counts.greenlights <= 122)
    if (action && ['repairSet', 'strikeSet', 'commissionSet'].includes(action.kind)) assert.ok(++this.counts.setMaintenance <= 96)
    if (command.kind === 'attachPromise') assert.ok(++this.counts.attachments <= 128)
    const reference = expected ?? (this.options.variant === 'C' ? this.baselineTrace[this.baselineCursor] : undefined)
    if (reference) equal({ week, ordinal, purpose, command }, { week: reference.week, ordinal: reference.ordinal,
      purpose: reference.purpose, command: reference.command }, 'independent derived command sequence differs before dispatch')
    const started = performance.now(), before = this.state
    this.phase = `week${week}/command${ordinal}/${purpose}`
    let refusal: string | null, invoked = false
    try {
    // Capture the complete canonical state before the first quote/refusal read;
    // a shared reference or a snapshot taken afterward cannot prove its purity.
    const unchanged = stableStringify(before)
    refusal = this.publicRefusal(command)
    assert.ok(stableStringify(this.state) === unchanged, 'first public refusal read changes no authority')
    if (refusal !== null) {
      assert.equal(this.publicRefusal(command), refusal, 'public refusal is stable')
      assert.ok(stableStringify(this.state) === unchanged, 'refused public attempt changes no authority')
    } else {
      this.counts.engineCalls++; invoked = true
      if (command.kind === 'action') {
        // Accepted p13a fresh-industry setup explicitly engages the endowed economy.
        const input = command.action.kind === 'activateStudioOperations' ? { ...before, economyEngagedEver: true } : before
        this.state = applyActions(input, [command.action])
      } else if (command.kind === 'initializeHollywood') this.state = initializeHollywood(before, 'fresh')
      else if (command.kind === 'proposal') this.state = submitProposal(before, command.proposal)
      else this.state = attachPromise(before, command.talentId, command.issuerStudioId, command.attachment)
      assert.equal(this.state.market.tick, week, 'public commands never hide a tick')
      this.afterCommand(command, purpose, before)
    }
    } catch (error) {
      this.artifacts.append('commands.jsonl', { week, ordinal, purpose, command, status: 'FAILED',
        reason: (error instanceof Error ? error.message : String(error)).slice(0, 6000), elapsedMs: performance.now() - started,
        engineInvoked: invoked } satisfies Trace)
      throw error
    }
    const row: Trace = { week, ordinal, purpose, command, status: refusal === null ? 'ACCEPTED' : 'REFUSED_PUBLICLY',
      reason: refusal, elapsedMs: performance.now() - started, engineInvoked: refusal === null }
    this.artifacts.append('commands.jsonl', row)
    if (reference) {
      equal({ ...row, elapsedMs: 0 }, { ...reference, elapsedMs: 0 }, 'replayed/derived status or causal command differs')
      this.baselineCursor++
    }
    return refusal === null
  }
  afterCommand(command: Command, purpose: string, before: GameState) {
    if (purpose.startsWith('startup-')) this.startup++
    if (command.kind === 'proposal') {
      const view = openMarketCaseFor(before, command.proposal.talentId); assert.ok(view)
      this.attemptedCases.add(stableStringify([view.talentId, view.subjectStudioId, view.contractId, view.openedWeek]))
    }
    if (command.kind !== 'action') return
    const action = command.action
    if (action.kind === 'createCustomTalent') {
      assert.equal(this.state.talent.length, before.talent.length + 1)
      const person = this.state.talent.at(-1)!; assert.equal(person.name, action.talent.name)
      assert.equal(before.talent.some(row => row.id === person.id), false)
      equal(this.state.talent.slice(0, before.talent.length), before.talent, 'creator preserves all existing people')
      assert.ok(Object.values(person.workHistory).every(count => count === 0)); this.ids.push(person.id)
      assert.equal(this.state.firstTakes.some(row => row.directorId === person.id || Object.values(row.cast).includes(person.id)), false)
      assert.equal(this.state.careerLifecycle.professionChanges.some(row => row.personId === person.id), false)
      equal(this.state.careerLifecycle.professionAnchors.at(-1),
        { personId: person.id, profession: person.role, kind: 'entrant', recordedWeek: before.market.tick }, 'actual public entrant anchor')
    }
    if (action.kind === 'signContract' || action.kind === 'renewContract') {
      const quoted = playerOffer(before, action.talentId, action.termWeeks, before.market.tick)
      equal(activeContract(this.state, action.talentId), quoted, 'actual contract equals public quoted paid terms')
      assert.equal(this.state.studio.cash, before.studio.cash - quoted.signingBonus)
      equal(this.state.ledger.slice(before.ledger.length).map(row => ({ kind: row.kind, amount: row.amount,
        talentId: row.talentId, week: row.week })), [{ kind: 'signingBonus', amount: -quoted.signingBonus,
        talentId: action.talentId, week: before.market.tick }], 'actual signing payment')
    }
    const match = /^slot-(\d+)-(commission|greenlight)$/.exec(purpose)
    if (match) {
      const slot = this.slots[Number(match[1])]!; assert.ok(slot)
      if (match[2] === 'commission') {
        assert.equal(slot.commissionWeek, null); slot.commissionWeek = before.market.tick
        slot.mintedOrdinal = before.originalScreenplays.nextOrdinal
        const queue = this.state.productionQueue.filter(row => !before.productionQueue.some(old => old.ordinal === row.ordinal))
        assert.ok(queue.length <= 1); slot.commissionQueue = queue[0]?.ordinal ?? null
      } else {
        const queue = this.state.productionQueue.filter(row => !before.productionQueue.some(old => old.ordinal === row.ordinal))
        assert.ok(queue.length <= 1); slot.greenlightQueue = queue[0]?.ordinal ?? null
      }
      this.refreshSlots()
    }
  }
  refreshSlots() {
    for (const slot of this.slots) {
      if (slot.commissionWeek === null) continue
      const blueprint = this.state.originalScreenplays.blueprints.find(row => row.ordinal === slot.mintedOrdinal)
      if (blueprint) {
        if (slot.projectId !== null) assert.equal(slot.projectId, blueprint.projectId)
        slot.projectId = blueprint.projectId
      } else assert.ok(slot.commissionQueue !== null && this.state.productionQueue.some(row => row.ordinal === slot.commissionQueue),
        `slot${slot.ordinal}: accepted commission lost its actual queue before mint`)
      const project = slot.projectId ? this.state.scriptDevelopment.projects.find(row => row.id === slot.projectId) : null
      if (project?.productionId) { if (slot.productionId) assert.equal(slot.productionId, project.productionId); slot.productionId = project.productionId }
      if (slot.greenlightQueue !== null && !slot.productionId)
        assert.ok(this.state.productionQueue.some(row => row.ordinal === slot.greenlightQueue), 'actual greenlight queue did not expire silently')
      if (slot.productionId) {
        const film = this.state.studio.releasedFilms.find(row => row.productionId === slot.productionId)
        if (film && slot.releaseWeek === null) {
          slot.releaseWeek = film.releaseTick; assert.ok(++this.counts.releases <= 122)
          if (slot.ordinal < 6) {
            assert.ok(film.participants)
            const lead = this.ids[slot.ordinal % 2]!, other = this.ids[1 - slot.ordinal % 2]!
            assert.equal(film.participants.cast.lead.talentId, lead)
            assert.ok(Object.values(film.participants.cast).some(row => row.talentId === other))
            assert.equal(film.participants.director.talentId, this.ids[2]); assert.equal(film.participants.writer.talentId, this.ids[3])
          }
          this.record({ kind: 'release', week: this.state.market.tick, slot: slot.ordinal, film: film.productionId,
            releaseWeek: film.releaseTick, participants: film.participants })
        }
      }
    }
    assert.ok(this.state.studio.activeProductions.length <= 1, 'one unfinished player film')
    assert.ok(this.slots.filter(row => row.commissionWeek !== null && row.releaseWeek === null).length <= 1,
      'one outstanding screenplay/film; queued identity counts')
  }
  startupPolicy() {
    const inputs = creators()
    while (this.room() && this.startup < 17) {
      let command: Command
      if (this.startup === 0) command = { kind: 'action', action: { kind: 'activateStudioOperations' } }
      else if (this.startup === 1) command = { kind: 'initializeHollywood' }
      else if (this.startup < 14) {
        const index = Math.floor((this.startup - 2) / 2)
        command = (this.startup - 2) % 2 === 0
          ? { kind: 'action', action: { kind: 'createCustomTalent', talent: inputs[index]! } }
          : { kind: 'action', action: { kind: 'signContract', talentId: this.ids[index]!, termWeeks: 208 } }
      } else if (this.startup === 14) command = { kind: 'action', action: { kind: 'activateScriptDevelopment' } }
      else if (this.startup === 15) {
        for (const id of [STAGE, 'facility-soundstage-12']) {
          const facility = this.state.operations.facilities.find(row => row.id === id)
          assert.ok(facility && facility.capability === 'soundstage' && facility.capacity > 0)
          assert.ok(this.state.property.structures.some(row => row.providesFacilityIds.includes(id)), 'real endowed stage exists')
        }
        const mounted = setMountedOn(this.state.sets, STAGE); assert.ok(mounted)
        assert.equal(productionBoundToSet(this.state, mounted.id), null)
        command = { kind: 'action', action: { kind: 'strikeSet', setId: mounted.id } }
      } else command = { kind: 'action', action: { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } } }
      assert.equal(this.execute(command, `startup-${this.startup}`), true, 'fixed startup public premise')
    }
  }
  decide() {
    for (let i = 0; i < 8 && this.room(); i++) {
      const decision = nextStudioDecision(this.state)
      if (!decision) return
      let action: Action
      if (decision.kind === 'scriptReview') {
        const card = scriptProjectsReadModel(this.state).sections.needsReview.find(row => row.projectId === decision.projectId)
        assert.ok(card && card.assessment)
        const rewrite = decision.legalActions.find(row => row.kind === 'requestScriptRewrite')
        action = card.rewriteCount === 0 && card.assessment.score < 55 && rewrite
          ? { kind: 'requestScriptRewrite', projectId: decision.projectId }
          : { kind: 'acceptScript', projectId: decision.projectId }
        assert.ok(decision.legalActions.some(row => row.kind === action.kind))
      } else if (decision.kind === 'castingReview') action = { kind: 'acknowledgeCastingSession', sessionId: decision.sessionId }
      else if (decision.kind === 'productionOperation') action = decision.command
      else action = { kind: 'commitPictureToRelease', productionId: decision.productionId }
      assert.equal(this.execute({ kind: 'action', action }, `decision-${decision.kind}`), true, 'actual offered decision must commit')
    }
  }
  usable(role: FilmCreativeRole): Talent[] {
    return this.state.talent.filter(person => person.role === role && activeContract(this.state, person.id)
      && assignmentRefusal(this.state, person.id, this.state.market.tick, role) === null)
      .sort((a, b) => codePoint(a.id, b.id))
  }
  hireCrew() {
    for (const [role, number] of [['writer', 1], ['director', 1], ['actor', 3], ['craft', 1]] as const) {
      for (let vacancy = this.usable(role).length; vacancy < number && this.room(); vacancy++) {
        const preferred = role === 'writer' ? this.ids[1] : role === 'director' ? this.ids[0] : undefined
        const market = new Set(hiringMarketIds(this.state))
        const candidates = this.state.talent.filter(person => person.role === role && market.has(person.id)
          && !activeContract(this.state, person.id) && !busyTalentIds(this.state).has(person.id)
          && assignmentRefusal(this.state, person.id, this.state.market.tick, role) === null
          && marketEligibility(this.state, person.id).status === 'free_agent')
          .sort((a, b) => Number(b.id === preferred) - Number(a.id === preferred) || codePoint(a.id, b.id)).slice(0, 12)
          .map(person => ({ person, term: this.term(person.id) })).filter((row): row is { person: Talent; term: number } => row.term !== null)
          .map(row => ({ ...row, price: playerOffer(this.state, row.person.id, row.term) }))
          .sort((a, b) => Number(b.person.id === preferred) - Number(a.person.id === preferred)
            || a.price.annualSalary - b.price.annualSalary || codePoint(a.person.id, b.person.id))
        const candidate = candidates[0]
        if (!candidate) { this.record({ kind: 'availability', week: this.state.market.tick, role, vacancy, reason: 'no eligible public candidate in bounded scan' }); break }
        if (!this.execute({ kind: 'action', action: { kind: 'signContract', talentId: candidate.person.id, termWeeks: candidate.term } }, `hire-${role}-${vacancy}`)) break
      }
    }
  }
  renewCrew() {
    for (const person of this.state.talent) {
      if (!this.room()) return
      const contract = activeContract(this.state, person.id)
      if (!contract || !renewalWindowOpen(contract, this.state.market.tick)) continue
      // The initial nonfocus Writer/Director deliberately yield their first208 seats.
      if ([this.ids[2], this.ids[3]].includes(person.id) && contract.startWeek === 0 && contract.endWeekExclusive === 208) continue
      if (retirementRecordFor(this.state, person.id)) continue // decline every extension; no notice postponement
      const raw = openMarketCaseFor(this.state, person.id), view = caseForTalent(this.state, person.id)
      if (raw) {
        if (raw.variant !== 'expiry' || !view) continue
        const key = stableStringify([raw.talentId, raw.subjectStudioId, raw.contractId, raw.openedWeek])
        if (this.attemptedCases.has(key)) continue
        const term = this.term(person.id, view.decisionWeek); if (term === null) continue
        // Reserve this dated case even if public affordability refuses; no resubmission loop.
        this.attemptedCases.add(key)
        this.execute({ kind: 'proposal', proposal: { talentId: person.id, issuerStudioId: this.issuer(), termWeeks: term, premiumTier: 1.25 } }, 'ordinary-renewal-proposal')
      } else {
        const term = this.term(person.id); if (term !== null)
          this.execute({ kind: 'action', action: { kind: 'renewContract', talentId: person.id, termWeeks: term } }, 'outside-case-renewal')
      }
    }
  }
  maintainSet() {
    if (!this.room()) return
    // Startup strike and commission count in the same one-per-week maintenance budget.
    if (this.startup < 17 || this.startup === 17 && this.state.market.tick <= 1) return
    const set = setMountedOn(this.state.sets, STAGE)
    if (set === null) {
      const commission = { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE }
      if (commissionSetRefusal(this.state, commission) === null)
        this.execute({ kind: 'action', action: { kind: 'commissionSet', commission } }, 'set-replacement')
    } else if (set.status === 'standing' && set.condition <= 44 && productionBoundToSet(this.state, set.id) === null
      && repairSetRefusal(this.state, set.id) === null)
      this.execute({ kind: 'action', action: { kind: 'repairSet', setId: set.id } }, 'set-repair')
  }
  filmPolicy() {
    if (!this.room()) return
    this.refreshSlots()
    const pending = this.slots.find(row => row.commissionWeek !== null && row.releaseWeek === null)
    if (pending) {
      if (!pending.projectId || pending.productionId || pending.greenlightQueue !== null) return
      const project = this.state.scriptDevelopment.projects.find(row => row.id === pending.projectId)
      if (project?.status !== 'ready') return
      const busy = busyTalentIds(this.state), initial = pending.ordinal < 6
      const available = (role: FilmCreativeRole) => this.usable(role).filter(p => !busy.has(p.id) && p.id !== project.writerId)
      const director = initial ? available('director').find(p => p.id === this.ids[2])
        : available('director').sort((a, b) => Number(b.id === this.ids[0]) - Number(a.id === this.ids[0]) || codePoint(a.id, b.id))[0]
      const craft = available('craft')[0], actors = available('actor')
      const lead = initial ? actors.find(p => p.id === this.ids[pending.ordinal % 2]) : actors[0]
      const antagonist = initial ? actors.find(p => p.id === this.ids[1 - pending.ordinal % 2]) : actors[1]
      const support = initial ? actors.find(p => p.id === this.ids[4]) : actors[2]
      if (!director || !craft || !lead || !antagonist || !support) {
        this.record({ kind: 'availability', week: this.state.market.tick, slot: pending.ordinal, reason: 'actual package staffing unavailable' }); return
      }
      if (initial) assert.equal(project.writerId, this.ids[3])
      const concept = this.state.concepts.find(row => row.id === project.conceptId); assert.ok(concept)
      this.execute({ kind: 'action', action: { kind: 'greenlightScriptProject', production: {
        projectId: project.id, directorId: director.id, craftIds: [craft.id],
        cast: { lead: lead.id, antagonist: antagonist.id, support: support.id },
        budget: { negative: concept.baseNegativeCost * resolveShape(project.shape).budgetDemandMultiplier * this.state.era.costScale, marketing: 0 },
      } } }, `slot-${pending.ordinal}-greenlight`)
      return
    }
    const slot = this.slots.find(row => row.opening <= this.state.market.tick && this.state.market.tick < row.closes)
    if (!slot || slot.commissionWeek !== null) return
    const model = scriptProjectsReadModel(this.state)
    if (!model.commission.canSubmitOriginalIntent) return
    const available = new Set(model.commission.writers.filter(row => row.available).map(row => row.id))
    const writers = this.usable('writer').filter(p => available.has(p.id))
      .sort((a, b) => Number(b.id === this.ids[1]) - Number(a.id === this.ids[1]) || codePoint(a.id, b.id))
    const writer = slot.ordinal < 6 ? writers.find(row => row.id === this.ids[3]) : writers[0]
    if (!writer) return
    const genre = GENRE_ORDER[slot.ordinal % GENRE_ORDER.length]!
    this.execute({ kind: 'action', action: { kind: 'commissionOriginalScreenplay', screenplay: {
      writerId: writer.id, genre, shape: SHAPE, promise: { genre, intendedSegments: ['adult', 'prestige'],
        ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } },
    } } }, `slot-${slot.ordinal}-commission`)
  }
  promises() {
    for (const proposal of this.state.talentMarket.proposals) {
      if (!this.room() || this.counts.attachments >= 128) return
      if (proposal.issuerStudioId !== this.issuer() || proposal.submittedWeek !== this.state.market.tick || proposal.promises.length
        || this.person(proposal.talentId).role !== 'actor' || openMarketCaseFor(this.state, proposal.talentId)?.variant !== 'expiry') continue
      const attachment: PromiseAttachment = { family: 'APPEARANCE_COUNT', predicate: { count: 1 },
        windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + proposal.termWeeks }
      const receipt = promiseFeasibility(this.state, { ...attachment, issuerStudioId: proposal.issuerStudioId,
        beneficiaryPersonId: proposal.talentId, startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }, this.state.market.tick)
      this.record({ kind: 'promise-feasibility', week: this.state.market.tick, talentId: proposal.talentId,
        classification: receipt.classification, receipt })
      if (receipt.classification === 'REASONABLY_ACHIEVABLE') this.execute({ kind: 'attachPromise', talentId: proposal.talentId,
        issuerStudioId: proposal.issuerStudioId, attachment }, 'P1-attachment')
    }
  }
  policy() {
    this.startupPolicy()
    if (this.startup < 17) return
    this.decide(); this.hireCrew(); this.renewCrew(); this.maintainSet(); this.filmPolicy(); this.promises()
  }
  activity() {
    const week = this.state.market.tick
    if (week >= 208) {
      assert.ok(this.slots.slice(0, 6).every(row => row.releaseWeek !== null && row.releaseWeek <= 208),
        'first six actual releases must be present by attained208')
      for (const id of this.ids.slice(0, 2)) {
        assert.ok(this.state.firstTakes.filter(row => row.studioId === this.issuer() && Object.values(row.cast).includes(id)).length >= 3,
          'each focus has at least three real recorded acting first takes')
        assert.ok(this.state.studio.releasedFilms.filter(film => film.participants?.writer.talentId === this.ids[3]
          && Object.values(film.participants.cast).some(row => row.talentId === id)).length >= 3, 'real released Writer collaboration')
      }
    }
    if (week >= 416) for (const [index, role] of [[0, 'director'], [1, 'writer']] as const) {
      const id = this.ids[index]!, changes = this.state.careerLifecycle.professionChanges.filter(row => row.personId === id)
      assert.equal(changes.length, 1, 'actual focus transition required, no synthetic alternate')
      assert.equal(changes[0]!.from, 'actor'); assert.equal(changes[0]!.to, role)
      assert.ok(this.state.studio.releasedFilms.some(film => film.releaseTick <= 416
        && film.releaseTick >= changes[0]!.week && film.participants?.[role].talentId === id),
      `actual new-${role} release required by416`)
    }
    if (week >= 208) {
      const releases = this.slots.flatMap(row => row.releaseWeek === null ? [] : [row.releaseWeek]).sort((a, b) => a - b)
      assert.ok(releases.length >= 6)
      assert.ok(week - releases.at(-1)! <= 104, 'no passive release gap over104 weeks after startup')
      for (let i = 1; i < releases.length; i++) assert.ok(releases[i]! - releases[i - 1]! <= 104)
      if (week >= 520 && (week - 416) % 104 === 0)
        assert.ok(releases.some(released => released >= week - 104 && released < week), 'each subsequent104-week block has actual release')
    }
  }
  boundaryCounts(): Record<string, number> {
    const s = this.state, h = s.hollywood
    const counts: Record<string, number> = { people: s.talent.length, playerContracts: s.contracts.length,
      activeProductions: s.studio.activeProductions.length, releasedFilms: s.studio.releasedFilms.length,
      scriptProjects: s.scriptDevelopment.projects.length, queue: s.productionQueue.length, firstTakes: s.firstTakes.length,
      promises: s.promises.length, relationships: s.relationships.length, studioEvents: s.studioEvents.rows.length,
      studioHistory: s.studioHistory.rows.length, careerEvents: s.careerEvents.length,
      hollywoodFilms: h?.films.length ?? 0, hollywoodEmployment: h?.employment.length ?? 0,
      currentlyEmployed: h?.employment.filter(row => row.terms.startWeek <= s.market.tick
        && row.terms.endWeekExclusive > s.market.tick && (row.endedWeek === null || row.endedWeek > s.market.tick)).length ?? 0 }
    for (const [key, value] of Object.entries(s.careerLifecycle)) if (Array.isArray(value)) counts[`careerLifecycle.${key}`] = value.length
    for (const [key, value] of Object.entries(s.talentMarket)) if (Array.isArray(value)) counts[`talentMarket.${key}`] = value.length
    counts.relationshipRecentDrivers = s.relationships.reduce((n, edge) => n + edge.recent.length, 0)
    return counts
  }
  focusFacts() {
    return this.ids.slice(0, 2).map(id => ({ id, role: this.person(id).role, age: this.person(id).age,
      workHistory: this.person(id).workHistory, skills: this.person(id).skills,
      retirement: this.state.careerLifecycle.records.filter(row => row.personId === id),
      changes: this.state.careerLifecycle.professionChanges.filter(row => row.personId === id),
      finality: this.state.careerLifecycle.industryRetirements.filter(row => row.personId === id),
      due: this.state.careerLifecycle.transitionDue.filter(row => row.personId === id) }))
  }
  checkpoint(raw: string) {
    const week = this.state.market.tick, parsed = JSON.parse(raw) as { state: Record<string, unknown> }
    const started = performance.now(), roots: Record<string, ByteIdentity> = {}
    for (const [key, value] of Object.entries(parsed.state)) roots[key] = identity(stableStringify(value))
    const save = identity(raw)
    this.record({ kind: 'timing', phase: 'independent-full-save-and-root-hash', week, elapsedMs: performance.now() - started })
    this.peakRss = Math.max(this.peakRss, process.memoryUsage().rss)
    const row: Checkpoint = { week, save, roots, counts: this.boundaryCounts(), focus: this.focusFacts(),
      rss: process.memoryUsage().rss, maxRSS: process.resourceUsage().maxRSS }
    this.artifacts.append('checkpoints.jsonl', row)
    if (this.baseline) {
      const expected = this.comparison.get(week); assert.ok(expected, 'baseline owns every52 boundary')
      const differingRoots = Object.keys(roots).filter(key => stableStringify(roots[key]) !== stableStringify(expected.roots[key]))
      if (save.sha256 !== expected.save.sha256) this.record({ kind: 'checkpoint-mismatch', week,
        actual: save, expected: expected.save, differingRoots, actualRoots: roots, expectedRoots: expected.roots,
        serializer: 'complete canonical Save38; historical953 parity defect is not normalized' })
      equal(save, expected.save, `complete canonical Save38 identity differs at${week}`)
      equal(roots, expected.roots, `per-root identities differ at${week}`)
      equal(row.counts, expected.counts, 'complete checkpoint root counts differ')
      equal(row.focus, expected.focus, 'recorded focus facts differ')
      if (week === 0) assert.ok(raw === this.baseline.initialCheckpoint, 'literal complete retained week0 bytes')
      if (week === 3120 || week === 6240) {
        const file = resolve(this.options.baseline!, week === 3120 ? 'authority-3120.json' : 'authority-6240.json')
        assert.ok(raw === readFileSync(file, 'utf8'), `literal complete retained${week} bytes`)
      }
    }
    if (week === 0) this.initialCheckpoint = raw
    if (week === 3120 || week === 6240) this.artifacts.write(`authority-${week}.json`, raw, true)
    this.lastQualified = { week, raw }
  }
  observeReads(raw: string, reason: 'regular' | 'decision') {
    const week = this.state.market.tick
    if (this.readWeeks.has(week)) return
    assert.ok(this.counts.reads < (this.options.variant === 'D' ? 601 : 121), 'finite fixed read-schedule cap')
    const ordinal = this.counts.reads++, before = raw
    this.phase = `week${week}/observer-${reason}`
    const observation = observeC3EnduranceReads({ variant: this.options.variant, week, ordinal, saveJson: raw,
      saveSha256: identity(raw).sha256, order: ordinal % 2 === 0 ? 'forward' : 'reverse', focusPersonIds: this.ids.slice(0, 2) })
    assert.ok(Buffer.byteLength(JSON.stringify(observation)) <= 256 * 1024, 'read observation256KiB cap')
    this.record({ kind: 'read-observation', reason, observation })
    assert.equal(observation.status, 'PASS', observation.failure?.message ?? 'read observation must pass')
    assert.equal(observation.failure, null); equal(observation.input, identity(raw), 'observer exact input identity')
    equal(observation.isolatedAfter, identity(raw), 'isolated read graph unchanged')
    assert.ok(observation.counts.snapshots <= 2 && observation.counts.people <= 1 && observation.counts.calendars <= 1
      && observation.counts.industry <= 18 && observation.counts.market <= 6 && observation.counts.profilesChecked <= 4)
    assert.ok(observation.reads.length <= 32 && observation.timings.length <= 64)
    assert.ok(this.save(this.state, 'read-authority-after') === before, 'observer never changes authoritative game bytes')
    this.readWeeks.add(week)
  }
  async runtime(raw: string, week: 0 | 3120 | 6240) {
    assert.equal(this.options.variant, 'A'); assert.equal(this.state.market.tick, week)
    assert.ok(this.counts.runtimeSamples < 3); this.counts.runtimeSamples++
    const runtimeRoot = resolve(this.options.output, 'runtime')
    if (!existsSync(runtimeRoot)) mkdirSync(runtimeRoot, { mode: 0o700 })
    const checkpointPath = resolve(runtimeRoot, `week-${week}.library.json`)
    assert.equal(existsSync(checkpointPath), false)
    this.phase = `week${week}/runtime-sample`
    const result = await observeC3EnduranceRuntime({ variant: 'A', week, saveJson: raw, saveSha256: identity(raw).sha256, runtimeRoot, checkpointPath })
    assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 256 * 1024)
    this.record({ kind: 'runtime-observation', result })
    assert.equal(result.status, 'PASS', result.failure?.message ?? 'runtime observation must pass'); assert.equal(result.failure, null); assert.equal(result.cleanupFailure, null)
    assert.equal(result.actualTicks, 0); assert.ok(result.dispatchAttempts <= 8)
    assert.equal(result.campaignAttempts, 1); assert.equal(result.reopenCount, 1); assert.equal(result.freshSessionCalls, 1)
    equal(result.limits, { maxCheckpointBytes: 201326592, maxJournalBytes: 67108864, maxJournalEntries: 512,
      maxLibraryBytes: 268435456, maxRecords: 32, maxDecodedLibraryBytes: 1073741824 }, 'unchanged real runtime limits')
    equal(result.input, identity(raw), 'runtime sample exact input')
    assert.ok(this.save(this.state, 'runtime-authority-after') === raw, 'runtime graph never shares authoritative state')
    this.artifacts.inventory()
  }
  reload() {
    const week = this.state.market.tick, before = this.save(this.state, 'cadence-export'), start = performance.now()
    const parsed = importSave(before)
    assert.equal(parsed.saveVersion, 38)
    const accepted = validateSaveV38(parsed)
    assert.equal(accepted.state.market.tick, week)
    assert.ok(exportSave(accepted) === before, 'actual cadence import preserves exact canonical bytes')
    this.state = accepted.state
    this.record({ kind: 'timing', phase: 'cadence-actual-import-replacement', week, elapsedMs: performance.now() - start })
  }
  advance() {
    assert.ok(this.counts.tickAttempts < HORIZON && this.state.market.tick < HORIZON)
    const before = this.state, week = before.market.tick
    assert.equal(week, this.counts.ticks)
    this.phase = `tick-${week}-to-${week + 1}`; this.counts.tickAttempts++
    const started = performance.now()
    try { this.state = tick(before, { develop: true }) }
    finally {
      const elapsedMs = performance.now() - started; this.tickMs.push(elapsedMs)
      this.record({ kind: 'tick-timing', from: week, to: week + 1, elapsedMs,
        returnedWeek: this.state.market.tick, rootsBefore: { people: before.talent.length,
          due: before.careerLifecycle.transitionDue.filter(row => row.week === week + 1).length,
          marketCases: before.talentMarket.cases.filter(row => row.closedWeek === null).length } })
    }
    assert.equal(this.state.market.tick, week + 1); this.counts.ticks++
    assert.ok(this.state.talent.length >= before.talent.length)
    assert.equal(new Set(this.state.talent.map(row => row.id)).size, this.state.talent.length)
    for (let i = 0; i < before.talent.length; i++) assert.equal(this.state.talent[i]!.id, before.talent[i]!.id, 'append-only person identity')
    assert.equal(this.state.talentProvenance.rows.length, this.state.talent.length)
    assert.equal(this.state.careerLifecycle.professionAnchors.length, this.state.talent.length)
    if (this.state.talent.length > before.talent.length) this.record({ kind: 'actual-people-append', week: this.state.market.tick,
      rows: this.state.talent.slice(before.talent.length).map(person => ({ id: person.id, role: person.role,
        provenance: this.state.talentProvenance.rows.find(row => row.personId === person.id),
        anchor: this.state.careerLifecycle.professionAnchors.find(row => row.personId === person.id) })) })
    if (this.state.careerLifecycle.cohorts.length > before.careerLifecycle.cohorts.length)
      this.record({ kind: 'actual-cohort', week: this.state.market.tick, rows: this.state.careerLifecycle.cohorts.slice(before.careerLifecycle.cohorts.length) })
    for (const key of ['records', 'professionChanges', 'transitionEvaluations', 'industryRetirements'] as const)
      if (before.careerLifecycle[key] !== this.state.careerLifecycle[key]
        && stableStringify(before.careerLifecycle[key]) !== stableStringify(this.state.careerLifecycle[key]))
        this.record({ kind: 'lifecycle-boundary', week: this.state.market.tick, root: key,
          count: this.state.careerLifecycle[key].length, focus: this.focusFacts() })
    this.refreshSlots()
  }
  async run() {
    for (;;) {
      const week = this.state.market.tick
      this.weekAttempts = 0
      if (this.options.variant === 'C' && week > 0 && (week <= 104 || week <= 3120 && week % 26 === 0 || week > 3120 && week % 52 === 0)) this.reload()
      if (week < HORIZON) {
        const block = Math.floor(week / 52)
        if (this.options.variant === 'D' && !this.decisionBlocks.has(block) && nextStudioDecision(this.state)) {
          this.decisionBlocks.add(block); this.observeReads(this.save(this.state, 'decision-read-input'), 'decision')
        }
        if (this.options.variant === 'B' || this.options.variant === 'D') {
          while (this.baselineTrace[this.baselineCursor]?.week === week) {
            const row = this.baselineTrace[this.baselineCursor]!
            this.execute(structuredClone(row.command), row.purpose, row)
          }
          assert.ok(this.baselineCursor === this.baselineTrace.length || this.baselineTrace[this.baselineCursor]!.week > week,
            'replay cannot omit or postpone baseline command')
        } else {
          this.policy()
          if (this.options.variant === 'C') assert.ok(this.baselineCursor === this.baselineTrace.length
            || this.baselineTrace[this.baselineCursor]!.week > week, 'derived cadence omitted a baseline command')
        }
      }
      this.activity()
      const isCheckpoint = week % 52 === 0, regularRead = this.options.variant === 'D' ? week % 13 === 0 : isCheckpoint
      if (isCheckpoint || regularRead && !this.readWeeks.has(week)) {
        const raw = this.save(this.state, 'scheduled-boundary')
        if (isCheckpoint) this.checkpoint(raw)
        if (regularRead) this.observeReads(raw, 'regular')
        if (this.options.variant === 'A' && (week === 0 || week === 3120 || week === 6240)) await this.runtime(raw, week)
        if (isCheckpoint) console.log(JSON.stringify({ marker: 'C3_ENDURANCE_BOUNDARY_QUALIFIED', variant: this.options.variant,
          week, ticks: this.counts.ticks, commands: this.counts.commands, readGroups: this.counts.reads,
          runtimeSamples: this.counts.runtimeSamples }))
      }
      if (week === HORIZON) break
      this.advance()
    }
    assert.equal(this.counts.ticks, HORIZON); assert.equal(this.counts.tickAttempts, HORIZON)
    assert.equal(this.counts.creators, 6); assert.equal(this.startup, 17)
    if (this.baseline) assert.equal(this.baselineCursor, this.baselineTrace.length)
    if (this.options.variant === 'A') assert.equal(this.counts.runtimeSamples, 3)
  }
}

function loadReference(directory: string, variant: EnduranceVariant, producer: ByteIdentity,
  source: ReturnType<typeof sourceIdentity>): RunMetadata {
  const metadata = JSON.parse(readFileSync(resolve(directory, 'metadata.json'), 'utf8')) as RunMetadata
  assert.equal(metadata.status, 'PASS', 'a failed predecessor cannot authorize any following variant')
  assert.equal(metadata.variant, variant); assert.equal(metadata.seed, SEED)
  equal(metadata.producer, producer, 'same frozen producer across variants')
  equal(metadata.source.diff, source.diff, 'same consumed patch across variants')
  equal(metadata.source.tracked, source.tracked, 'same consumed tracked source across variants')
  assert.equal(metadata.source.untracked, '')
  assert.equal(metadata.counters.ticks, HORIZON); assert.equal(metadata.counters.tickAttempts, HORIZON)
  const failure = JSON.parse(readFileSync(resolve(directory, 'failure.json'), 'utf8'))
  assert.equal(failure.status, 'PASS'); assert.equal(failure.failure, null); assert.equal(failure.guardFailure, null)
  const inventory = artifactInventory(directory)
  equal(inventory.filter(file => file.path !== 'metadata.json'), metadata.files, 'complete pinned reference inventory; no omitted file')
  const required = [...COMPACT_FILES, 'authority-3120.json', 'authority-6240.json',
    ...(variant === 'A' ? [0, 3120, 6240].map(week => `runtime/week-${week}.library.json`) : [])].sort(codePoint)
  equal(inventory.map(file => file.path).sort(codePoint), required, 'exact completed-variant file set')
  for (const file of metadata.files) {
    const path = resolve(directory, file.path), sub = relative(directory, path)
    assert.ok(sub && !sub.startsWith('..') && !lstatSync(path).isSymbolicLink(), 'reference-owned regular file only')
    equal(identity(readFileSync(path)), file.identity, 'reference artifact byte pin')
  }
  return metadata
}
function jsonLines<T>(path: string): T[] {
  const raw = readFileSync(path, 'utf8'); assert.ok(Buffer.byteLength(raw) <= COMPACT_CAP)
  assert.ok(raw.endsWith('\n'))
  return raw.trimEnd().split('\n').map(line => JSON.parse(line) as T)
}
function percentiles(values: number[]) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b), value = (p: number) => sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)]!
  return { count: values.length, medianMs: value(0.5), p95Ms: value(0.95), p99Ms: value(0.99), maxMs: sorted.at(-1)!,
    worstTickInvocation: values.indexOf(sorted.at(-1)!) + 1 }
}
async function main() {
  const root = fileURLToPath(new URL('../../../../../', import.meta.url)), options = parseOptions(process.argv.slice(2), root)
  const source = sourceIdentity(root), producerPath = fileURLToPath(import.meta.url), producer = identity(readFileSync(producerPath))
  assert.equal(source.head, options.sourceSha); assert.equal(source.untracked, '', 'record every consumed source file before execution')
  assert.equal(LIVE_SAVE_VERSION, 38); assert.equal(PROTOCOL_VERSION, 4); assert.equal(PROJECTION_VERSION, 53); assert.equal(SCHEMA_ID, SCHEMA)
  const priorPins: { path: string; identity: ByteIdentity }[] = []
  const pin = (path: string) => priorPins.push({ path, identity: identity(readFileSync(path)) })
  let baseline: RunMetadata | null = null, trace: Trace[] = [], checkpoints: Checkpoint[] = []
  if (options.variant !== 'A') {
    assert.ok(options.baseline && options.predecessor)
    const evidence = dirname(options.output)
    for (const directory of [options.baseline, options.predecessor]) {
      assert.equal(dirname(directory), evidence); assert.notEqual(directory, options.output)
      assert.equal(lstatSync(directory).isSymbolicLink(), false)
      pin(resolve(directory, 'metadata.json'))
    }
    baseline = loadReference(options.baseline, 'A', producer, source)
    loadReference(options.predecessor, options.variant === 'B' ? 'A' : options.variant === 'C' ? 'B' : 'C', producer, source)
    for (const name of ['commands.jsonl', 'checkpoints.jsonl', 'authority-3120.json', 'authority-6240.json']) pin(resolve(options.baseline, name))
    trace = jsonLines<Trace>(resolve(options.baseline, 'commands.jsonl'))
    checkpoints = jsonLines<Checkpoint>(resolve(options.baseline, 'checkpoints.jsonl'))
    assert.equal(trace.length, baseline.counters.commands); assert.ok(trace.length <= 12480)
    assert.equal(checkpoints.length, 121)
    checkpoints.forEach((row, index) => assert.equal(row.week, index * 52))
    trace.forEach((row, index) => { assert.equal(row.ordinal, index); assert.ok(row.week >= 0 && row.week < HORIZON)
      if (index) assert.ok(row.week >= trace[index - 1]!.week) })
  }
  const artifacts = new Artifacts(options.output), startedAt = new Date().toISOString(), started = performance.now()
  let run: Endurance | null = null, failure: ObservationFailure | null = null, guardFailure: string | null = null
  const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 6000)
  try {
    run = new Endurance(options, artifacts, baseline, trace, checkpoints)
    await run.run()
  } catch (error) {
    failure = { phase: run?.phase ?? 'initialization', message: errorText(error) }
  }
  // No retry or following variant. Every failure retains the attempted route.
  try {
    equal(sourceIdentity(root), source, 'source/HEAD/index drift during variant')
    equal(identity(readFileSync(producerPath)), producer, 'docs producer drift during variant')
    for (const file of priorPins) equal(identity(readFileSync(file.path)), file.identity, 'comparison input drift')
  } catch (error) { guardFailure = errorText(error) }
  const passed = failure === null && guardFailure === null && run !== null
  let artifactFailure: string | null = null
  try {
    if (!passed && run) {
      const inventory = artifacts.inventory(), authorityCount = inventory.filter(row => row.path.startsWith('authority-') || row.path.startsWith('runtime/')).length
      if (authorityCount < 5) artifacts.write('authority-failure.json', JSON.stringify({
        label: 'Failure evidence; unvalidatedStateJson is not alleged to be an accepted save',
        lastQualifiedWeek: run.lastQualified?.week ?? null, lastQualifiedSaveJson: run.lastQualified?.raw ?? null,
        observedWeek: run.state.market.tick, unvalidatedStateJson: JSON.stringify(run.state),
        normalization: 'JSON preserves serializable state; signed zero is canonicalized by JSON. No production state was normalized or repaired.',
      }) + '\n', true)
    }
    artifacts.write('failure.json', JSON.stringify({ status: passed ? 'PASS' : 'FAIL', failure, guardFailure,
      phase: run?.phase ?? 'initialization', week: run?.state.market.tick ?? null, counters: run?.counts ?? null }) + '\n')
    const files = artifacts.inventory()
    artifacts.write('metadata.json', JSON.stringify({ status: passed ? 'PASS' : 'FAIL', variant: options.variant, seed: SEED,
      source, producer, startedAt, finishedAt: new Date().toISOString(), elapsedMs: performance.now() - started,
      schema: { save: 38, protocol: 4, projection: 53, schemaId: SCHEMA },
      initial: run?.initial ?? null, initialCheckpoint: run?.initialCheckpoint ?? null,
      counters: run?.counts ?? null, tickTiming: percentiles(run?.tickMs ?? []), peakObservedRssBytes: run?.peakRss ?? null,
      processMaxRSSKiB: process.resourceUsage().maxRSS, lastQualifiedWeek: run?.lastQualified?.week ?? null,
      readWeeks: run ? [...run.readWeeks].sort((a, b) => a - b) : [], decisionBlocks: run ? [...run.decisionBlocks].sort((a, b) => a - b) : [],
      slots: run?.slots ?? [], files, failure, guardFailure,
      environment: { node: process.version, platform: process.platform, arch: process.arch },
      policy: { endowment: 2_000_000_000, laterFunding: false, maxTicks: 6240, maxCommands: 12480, maxWeeklyAttempts: 16,
        maxCreators: 6, maxCommissions: 122, maxGreenlights: 122, maxReleases: 122, maxSetMaintenance: 96, maxAttachments: 128,
        maxReadGroups: options.variant === 'D' ? 601 : 121, maxRuntimeSamples: options.variant === 'A' ? 3 : 0 },
      coverageLimits: ['Funded generated active policy; not profitability or normal affordability',
        'Complete canonical SHA256 and per-root identities at121 boundaries; raw equality only for retained0/3120/6240 authority',
        'Three attained-scale persistence samples only; not6240 weeks of durable journal I/O or default journal exhaustion',
        'Actual stress counts only; no fabricated Annex population/event envelope, alternate compaction, native or Owner-library claim',
        'Promise attachments may remain zero; no promised coverage from unqualified proposals',
        'Canonical098 passive Writer-work and original R8 Vitest timeouts keep their independent unresolved evidence'],
    }) + '\n')
    // metadata is the final authoritative write. Its size and new file count
    // are preflighted by write(); no fallible artifact check follows a PASS.
  } catch (error) { artifactFailure = errorText(error) }
  const success = passed && artifactFailure === null
  console.log(JSON.stringify({ marker: success ? 'C3_ENDURANCE_VARIANT_COMPLETED' : 'C3_ENDURANCE_STOPPED_AT_FIRST_FAILURE',
    variant: options.variant, output: options.output, source, producer, elapsedMs: performance.now() - started,
    counters: run?.counts ?? null, failure, guardFailure, artifactFailure }))
  if (!success) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch(error => {
    console.error(JSON.stringify({ marker: 'C3_ENDURANCE_PRECONDITION_FAILURE', message: String(error).slice(0, 6000) }))
    process.exitCode = 1
  })
}
