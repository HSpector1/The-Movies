#!/usr/bin/env node
// Living Lot campaign profile builder (LL-CP6 seal tooling; recreates the lost
// scratchpad/llcp6-make-shooting-profile.mjs and generalizes it).
//
// Builds a durable engine profile by driving a fresh raw-founding world through
// the authoritative founding prelude (first-listed signing offer x7, then
// foundStudio — the same deterministic selection as the Unity automation
// prelude) and then the first-movie journey's own next-step guide, stopping at
// a named target state. The engine's checkpoint under <profile-dir> is the
// deliverable; the builder never touches game state by any path other than
// POST /command submitIntent.
//
// Targets:
//   shooting  — stop when a production operation reports phase=="shooting" and
//               the journey reports no blocker (LL-CP6 shooting-week profile).
//   load-in   — stop the moment a production operation carries an unresolved
//               "scenery-load-in" blocker (LL-CP5 delivery-week profile; the
//               blocker is deliberately left unresolved — the stage's LoadIn
//               truth requires it present).
//
// Usage:
//   node scripts/living-lot-profile.mjs --target shooting --profile-dir /abs/path

import { spawn } from 'node:child_process'
import { mkdirSync, chmodSync, existsSync } from 'node:fs'
import { randomBytes, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const readArg = (name) => {
  const index = args.indexOf(name)
  return index >= 0 && index + 1 < args.length ? args[index + 1] : undefined
}

const target = readArg('--target')
const profileDir = readArg('--profile-dir')
const enginePath = readArg('--engine') ?? join(here, '..', 'dist', 'studio', 'engine.mjs')
const maxIntents = Number(readArg('--max-intents') ?? '200')

if (!['shooting', 'load-in'].includes(target ?? '')) {
  console.error('living-lot-profile: --target must be shooting or load-in')
  process.exit(2)
}
if (!profileDir || !profileDir.startsWith('/')) {
  console.error('living-lot-profile: --profile-dir must be an absolute path')
  process.exit(2)
}
if (!existsSync(enginePath)) {
  console.error(`living-lot-profile: engine bundle missing at ${enginePath} — run npm run build:studio`)
  process.exit(2)
}

mkdirSync(profileDir, { recursive: true, mode: 0o700 })
chmodSync(profileDir, 0o700)

const capability = randomBytes(32).toString('base64url')
const engine = spawn(process.execPath, [enginePath], {
  env: {
    ...process.env,
    PROJECT_STUDIO_BRIDGE_CAPABILITY: capability,
    PROJECT_STUDIO_BRIDGE_PORT: '0',
    PROJECT_STUDIO_BRIDGE_RUNTIME_DIR: profileDir,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let engineLog = ''
const port = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`engine never reported live; log so far:\n${engineLog}`)), 15000)
  const onData = (chunk) => {
    engineLog += chunk.toString()
    const match = engineLog.match(/\[bridge\] live http:\/\/127\.0\.0\.1:(\d+)/)
    if (match) {
      clearTimeout(timer)
      resolve(Number(match[1]))
    }
  }
  engine.stdout.on('data', onData)
  engine.stderr.on('data', onData)
  engine.on('exit', (code) => reject(new Error(`engine exited early (${code}); log:\n${engineLog}`)))
})

const base = `http://127.0.0.1:${port}`
const headers = { 'x-project-studio-capability': capability }
const get = async (path) => {
  const response = await fetch(`${base}${path}`, { headers })
  if (!response.ok) throw new Error(`GET ${path} -> ${response.status}: ${await response.text()}`)
  return response.json()
}

const session = await get('/session')
const post = async (envelope, intent) => {
  const body = {
    protocolVersion: session.protocolVersion,
    schemaId: session.schemaId,
    sessionId: envelope.sessionId,
    commandId: `living-lot-profile-${randomUUID()}`,
    expectedStateRevision: envelope.stateRevision,
    type: 'submitIntent',
    payload: { intentId: intent.intentId },
  }
  const response = await fetch(`${base}/command`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const parsed = await response.json()
  if (!response.ok || parsed.accepted !== true) {
    throw new Error(`command ${intent.kind} (${intent.label}) rejected: ${response.status} ${JSON.stringify(parsed).slice(0, 400)}`)
  }
  return parsed
}

const journeyOf = (envelope) => envelope.snapshot?.journeyNotices?.firstFilmJourney ?? null
const phases = (envelope) => (envelope.snapshot?.productions?.productionOperations ?? []).map((op) => op.phase)

const reached = (envelope) => {
  const journey = journeyOf(envelope)
  if (target === 'load-in') {
    return (envelope.snapshot?.productions?.productionOperations ?? [])
      .some((op) => op.blocker?.kind === 'scenery-load-in')
  }
  return phases(envelope).includes('shooting') && (journey?.blocked ?? null) === null
}

const selectIntent = (envelope) => {
  const candidates = (envelope.availableIntents ?? []).filter((option) => option.kind !== 'startConstruction')
  const signing = candidates.find((option) => option.kind === 'signFoundingContract')
  if (signing !== undefined) return signing
  const founding = candidates.find((option) => option.kind === 'foundStudio')
  if (founding !== undefined) return founding
  const journey = journeyOf(envelope)
  if (journey?.next === null || journey?.next === undefined) return undefined
  const project = (kind) => candidates.find(
    (option) => option.kind === kind && option.projectId === journey.scriptProjectId,
  )
  switch (journey.next.kind) {
    case 'commission': return candidates.find((option) => option.kind === 'commissionScreenplay')
    case 'advance-week': return candidates.find((option) => option.kind === 'advanceWeek')
    case 'script-review': return project('acceptScreenplay') ?? project('requestRewrite')
    case 'plan-auditions': return project('startAuditions')
    case 'audition-review': return project('acknowledgeAuditions')
    case 'open-package': return project('greenlightPicture')
    case 'resolve-production': return candidates.find(
      (option) => option.kind === 'resolveProductionBlocker' && option.productionId === journey.productionId,
    )
    default: return undefined
  }
}

let envelope = await get('/snapshot')
const applied = []
try {
  for (let guard = 0; guard < maxIntents; guard++) {
    if (reached(envelope)) break
    const intent = selectIntent(envelope)
    if (intent === undefined) {
      const journey = journeyOf(envelope)
      throw new Error(`no intent selectable at week ${envelope.gameWeek} (beat ${journey?.beat}, headline ${journey?.headline})`)
    }
    await post(envelope, intent)
    envelope = await get('/snapshot')
    applied.push({ kind: intent.kind, label: intent.label, revision: envelope.stateRevision, week: envelope.gameWeek })
  }
  if (!reached(envelope)) throw new Error(`target ${target} not reached within ${maxIntents} intents`)
} finally {
  engine.kill('SIGTERM')
  await new Promise((resolve) => engine.on('exit', resolve))
}

const journey = journeyOf(envelope)
console.log(JSON.stringify({
  target,
  profileDir,
  sessionId: envelope.sessionId,
  stateRevision: envelope.stateRevision,
  gameWeek: envelope.gameWeek,
  stateDigest: envelope.stateDigest,
  beat: journey?.beat ?? null,
  blocked: journey?.blocked ?? null,
  waiting: journey?.waiting ?? null,
  productionPhases: phases(envelope),
  pictureTitle: journey?.pictureTitle ?? null,
  acceptedIntents: applied.length,
  intentKinds: applied.map((entry) => entry.kind),
}, null, 2))
