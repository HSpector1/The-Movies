// ── P10A W1b/W4 — deterministic Visual Oracle fixtures for the PERSON route ──
//
// The person inspector, retained Profile, and Roster are proven on projection 18, so their
// checkpoints must carry the projection-18 schema (createBridgeRuntimeCheckpoint stamps the
// current SCHEMA_ID). Rather than re-derive an endowed studio, this re-envelopes the ACCEPTED
// P09 migrated-endowed state (60 talent; six on-lot, contracted, locatable people; the same
// state s1-p09-migrated-endowed-unchanged already proves untouched) as a projection-18
// checkpoint with the p10 session identity the runner gates on. The state is real and
// unmodified — only the projection envelope and the session id are new.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { createBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { exportSaveJson, importSaveJson } from '../ui/src/engine/adapter.ts'
import {
  applyActions,
  beginFounding,
  contractOffer,
  facilityDemolitionRefusal,
  FOUNDING_MINIMUMS,
  generateWorld,
  renewalWindowOpen,
  tick,
} from '../src/core/index.ts'
import type { CreativeRole, GameState } from '../src/core/index.ts'
import { playNextMovieThroughAvailableIntents } from '../bridge/session.ts'
import { availableConceptId, availableWriterId, commissionPayload, minimalManagedStudio, withCash } from '../tests/contracts/_contractFixtures.ts'
import { castingPackageReadModel } from '../src/core/castingPackageReadModel.ts'

// ── CLOSE-GATES-01 fixtures: every state below is reached through ORDINARY authoritative
// actions (found, sign, place, tick, commission, greenlight, release) — never by editing a
// save. Each fixture records the game week the runner gates on.
function foundMinimum(state: GameState, termWeeks: number): GameState {
  let next = beginFounding(state)
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants
      .filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, termWeeks) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks }])
    }
  }
  return applyActions(next, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

/** P10-R1: an endowed studio whose founding contracts (52 weeks) have reached their renewal window. */
function contractActionsState(): GameState {
  let state = foundMinimum(generateWorld('p10-close-gates-contract-actions', { regime: 'endowed' }), 52)
  for (let guard = 0; guard < 80; guard++) {
    if (state.contracts.some((c) => renewalWindowOpen(c, state.market.tick))) return state
    state = tick(state)
  }
  throw new Error('gen-p10: no contract reached its renewal window')
}

/** P10-R4: the accepted first-film state played, through the bridge's OWN published intents
 *  (the exact commands a player clicks: commission → accept → auditions → greenlight → advance
 *  → release), to a SECOND real release whose participants freeze genuine career events. */
function careerLinkedState(): GameState {
  const outcome = importSaveJson((JSON.parse(readFileSync(P09_FIRST_FILM, 'utf8')) as { currentSaveJson: string }).currentSaveJson)
  if (!outcome.ok) throw new Error(`gen-p10: first-film import failed: ${outcome.error}`)
  const played = playNextMovieThroughAvailableIntents(outcome.state as GameState)
  if (played.state.careerEvents.length === 0) throw new Error('gen-p10: no career event was recorded')
  return played.state
}

/** P08-R2 / P09-REQ-040: a bare lot that built, opened, and then demolished a facility — the
 *  history carries Construction started / Opened / Demolished with exact placement identity. */
function facilityHistoryState(): GameState {
  let state = applyActions(foundMinimum(generateWorld('p10-close-gates-facility-history', { regime: 'bare-lot' }), 104), [
    { kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } },
  ])
  for (let week = 0; week < 14; week++) state = tick(state)
  state = applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId: 'scenery-shop', origin: { gx: 16, gy: 14 } } }])
  const shop = state.placement.facilities.find((f) => f.blueprintId === 'scenery-shop')!
  for (let guard = 0; guard < 40 && state.placement.facilities.find((f) => f.id === shop.id)!.status !== 'operational'; guard++) state = tick(state)
  const refusal = facilityDemolitionRefusal(state, { placementId: shop.id })
  if (refusal !== null) throw new Error(`gen-p10: the shop cannot be demolished: ${refusal.code}`)
  return applyActions(state, [{ kind: 'demolishFacility', demolition: { placementId: shop.id } }])
}

/** P10-R2: the accepted P05A.3 "player floor" — one greenlight later the next Ready picture is a
 *  NAMED actor-staffing shortage (the only shortage authority the product has). */
function shortageState(): GameState {
  let state = withCash(minimalManagedStudio('p10-close-gates-shortage'), 50_000_000)
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(state, availableConceptId(state), availableWriterId(state)) }])
  const first = state.scriptDevelopment.projects[0]!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: first }])
  const view = castingPackageReadModel(state).projects.find((p) => p.projectId === first)!
  const director = view.pools.find((p) => p.role === 'director')!.candidates.find((c) => c.available)!
  const craft = view.pools.find((p) => p.role === 'craftLead')!.candidates.find((c) => c.available)!
  const chosen: string[] = []
  for (const role of ['lead', 'antagonist', 'support']) {
    const pool = view.pools.find((p) => p.role === role)!
    chosen.push(pool.candidates.find((c) => c.available && !chosen.includes(c.talentId))!.talentId)
  }
  state = applyActions(state, [{
    kind: 'greenlightScriptProject',
    production: {
      projectId: first, directorId: director.talentId, craftIds: [craft.talentId],
      cast: { lead: chosen[0]!, antagonist: chosen[1]!, support: chosen[2]! },
      budget: { negative: view.negativeOptions[0]!.amount, marketing: view.marketingOptions[0]!.amount },
    },
  }])
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(state, availableConceptId(state), availableWriterId(state)) }])
  const second = state.scriptDevelopment.projects.find((p) => p.id !== first)!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: second }])
  const blocked = castingPackageReadModel(state).projects.find((p) => p.projectId === second)!
  if (!blocked.readiness.blockers.some((b) => b.code === 'package-staffing')) throw new Error('gen-p10: no staffing shortage')
  return state
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

const P09_ENDOWED = 'ui/e2e/p09-visual-oracle-v1/s1-p09-migrated-endowed-unchanged.checkpoint.json'
const OUT_DIR = 'ui/e2e/p10-visual-oracle-v1'

type P10Fixture = { scenarioId: string; sessionId: string; sourceSaveJson: string; source: string }

const P09_FIRST_FILM = 'ui/e2e/p09-visual-oracle-v1/s10-p09-first-film-released.checkpoint.json'

const fixtures: P10Fixture[] = [
  {
    scenarioId: 'person-inspector',
    sessionId: 'p10-oracle-p10-person-inspector',
    sourceSaveJson: (JSON.parse(readFileSync(P09_ENDOWED, 'utf8')) as { currentSaveJson: string }).currentSaveJson,
    source: P09_ENDOWED,
  },
  {
    // The cross-stack person<->history adapters need a studio with a released film and captured
    // participants. The accepted P09 first-film-released state has exactly that (six credited
    // people in P08 history, each a partial-provenance credit without a frozen career event).
    scenarioId: 'person-history',
    sessionId: 'p10-oracle-p10-person-history',
    sourceSaveJson: (JSON.parse(readFileSync(P09_FIRST_FILM, 'utf8')) as { currentSaveJson: string }).currentSaveJson,
    source: P09_FIRST_FILM,
  },
  { scenarioId: 'contract-actions', sessionId: 'p10-oracle-p10-contract-actions', sourceSaveJson: exportSaveJson(contractActionsState()), source: 'ordinary actions: endowed founding at 52-week terms, ticked into the renewal window' },
  { scenarioId: 'career-linked', sessionId: 'p10-oracle-p10-career-linked', sourceSaveJson: exportSaveJson(careerLinkedState()), source: `${P09_FIRST_FILM} driven by its own decisions to a release with frozen career events` },
  { scenarioId: 'facility-history', sessionId: 'p10-oracle-p10-facility-history', sourceSaveJson: exportSaveJson(facilityHistoryState()), source: 'ordinary actions: bare lot; office built+opened; scenery shop built+opened+demolished' },
  { scenarioId: 'shortage-roster', sessionId: 'p10-oracle-p10-shortage-roster', sourceSaveJson: exportSaveJson(shortageState()), source: 'ordinary actions: the P05A.3 player floor at the staffing wall' },
]

mkdirSync(OUT_DIR, { recursive: true })
const manifest = fixtures.map((fixture, index) => {
  const ordinal = index + 1
  // The checkpoint's own hydrate validates the reused save under the current save path.
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: fixture.sessionId,
    stateRevision: 0,
    currentSaveJson: fixture.sourceSaveJson,
    savedSaveJson: null,
    journal: [],
  })
  const checkpointJson = encodeBridgeRuntimeCheckpoint(checkpoint)
  const checkpointName = `s${ordinal}-p10-${fixture.scenarioId}.checkpoint.json`
  writeFileSync(join(OUT_DIR, checkpointName), checkpointJson)
  return {
    ordinal,
    scenarioId: `p10-${fixture.scenarioId}`,
    file: checkpointName,
    byteLength: Buffer.byteLength(checkpointJson),
    sha256: sha256(checkpointJson),
    sessionId: fixture.sessionId,
    schemaId: checkpoint.schemaId,
    protocolVersion: checkpoint.protocolVersion,
    stateDigest: checkpoint.currentStateDigest,
    source: fixture.source,
    gameWeek: (JSON.parse(fixture.sourceSaveJson) as { state: { market: { tick: number } } }).state.market.tick,
  }
})
writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify({ generatedFrom: 'scripts/gen-p10-visual-oracle-fixtures.mts', fixtures: manifest }, null, 2) + '\n')
for (const m of manifest) console.log(`[gen-p10] ${m.file} week=${String(m.gameWeek)} schema=${m.schemaId.slice(0, 20)} protocol=${m.protocolVersion} session=${m.sessionId} sha=${m.sha256.slice(0, 12)}`)
