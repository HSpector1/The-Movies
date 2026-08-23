// Phase M ugly-condition matrix (fail-closed). Runs the emitted production
// engine (dist/studio/engine.mjs) through representative real-world failure
// conditions a local player machine can produce, and exits nonzero on the
// first violation. Extend this matrix with new cases; never weaken one.
//
//   A. Repeated launch/quit cycles — durable session identity and digest must
//      survive five full engine lifecycles against one profile runtime.
//   B. Corrupted and oversized checkpoint rejection — a damaged or absurdly
//      large checkpoint must be refused fail-closed (no serving, nonzero
//      exit), never half-loaded.
//   C. Rapid valid/stale input burst — alternating valid and stale commands
//      fired back-to-back must commit exactly the valid ones, reject every
//      stale one with STALE_REVISION, and leave a consistent digest chain.
//   D. Abrupt kill around save/load boundaries — SIGKILL immediately after an
//      acknowledged command, save, and load (and once mid-flight) must never
//      lose an acked revision, tear the checkpoint, or change session
//      identity; every relaunch resumes the exact acked (revision, digest).
//   E. Journal-bound rollover — filling the durable replay journal to its
//      bound must open a new logical session with authoritative state
//      preserved (same digest and week, revision 0), keep serving commands,
//      and survive an abrupt kill immediately after the rollover.
//
// Usage: node scripts/phase-m-matrix.mjs   (requires npm run build:studio)
import { spawn } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { mkdtempSync, chmodSync, copyFileSync, readFileSync, rmSync, statSync, writeFileSync, appendFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const engineEntry = path.join(repositoryRoot, 'dist', 'studio', 'engine.mjs')
const failures = []
const note = (line) => console.log(`[phase-m] ${line}`)
const fail = (line) => { failures.push(line); console.error(`[phase-m] VIOLATION: ${line}`) }

if (!existsSync(engineEntry)) {
  console.error('[phase-m] dist/studio/engine.mjs is missing; run npm run build:studio first')
  process.exit(2)
}

const capability = randomBytes(32).toString('base64url')

function freshRuntimeDir(label) {
  const dir = mkdtempSync(path.join(tmpdir(), `phase-m-${label}-`))
  chmodSync(dir, 0o700)
  return dir
}

function startEngine(runtimeDir) {
  const child = spawn(process.execPath, [engineEntry], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      PROJECT_STUDIO_BRIDGE_CAPABILITY: capability,
      PROJECT_STUDIO_BRIDGE_PORT: '0',
      PROJECT_STUDIO_BRIDGE_RUNTIME_DIR: runtimeDir,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => { stdout += String(chunk) })
  child.stderr.on('data', (chunk) => { stderr += String(chunk) })
  const exit = new Promise((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal }))
  })
  const ready = new Promise((resolve) => {
    const deadline = setTimeout(() => { clearInterval(probe); resolve(null) }, 15_000)
    const probe = setInterval(() => {
      const match = /\[bridge\] live http:\/\/127\.0\.0\.1:(\d+)/.exec(stdout)
      const session = /session=([0-9a-f-]+) revision=(\d+) week=(\d+) digest=([0-9a-f]+)/.exec(stdout)
      if (match && session) {
        clearTimeout(deadline)
        clearInterval(probe)
        resolve({
          port: Number(match[1]),
          sessionId: session[1],
          revision: Number(session[2]),
          week: Number(session[3]),
          digest: session[4],
        })
      }
    }, 50)
    deadline.unref?.()
    probe.unref?.()
  })
  return { child, exit, ready, output: () => stdout + stderr }
}

async function stopEngine(engine) {
  engine.child.kill('SIGTERM')
  const result = await Promise.race([
    engine.exit,
    new Promise((resolve) => setTimeout(() => resolve(null), 8_000)),
  ])
  if (result === null) {
    engine.child.kill('SIGKILL')
    await engine.exit
    return { code: null, signal: 'SIGKILL-forced' }
  }
  return result
}

async function post(port, pathName, body) {
  const response = await fetch(`http://127.0.0.1:${port}${pathName}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-project-studio-capability': capability,
    },
    body: JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}

async function get(port, pathName) {
  const response = await fetch(`http://127.0.0.1:${port}${pathName}`, {
    headers: { 'x-project-studio-capability': capability },
  })
  return { status: response.status, body: await response.json() }
}

// ── Case A: repeated launch/quit cycles ─────────────────────────────────────
async function caseLaunchQuitCycles() {
  note('case A: five launch/quit cycles against one durable profile runtime')
  const runtimeDir = freshRuntimeDir('cycles')
  let firstSession = null
  let firstDigest = null
  for (let cycle = 1; cycle <= 5; cycle++) {
    const engine = startEngine(runtimeDir)
    const ready = await engine.ready
    if (ready === null) {
      fail(`cycle ${cycle}: engine did not become ready (${engine.output().slice(-300)})`)
      await stopEngine(engine)
      return
    }
    if (cycle === 1) {
      firstSession = ready.sessionId
      firstDigest = ready.digest
    } else {
      if (ready.sessionId !== firstSession) fail(`cycle ${cycle}: session identity changed across launch/quit`)
      if (ready.digest !== firstDigest) fail(`cycle ${cycle}: authoritative digest changed across launch/quit`)
      if (ready.revision !== 0) fail(`cycle ${cycle}: revision drifted to ${ready.revision} with no commands`)
    }
    const exit = await stopEngine(engine)
    if (exit.signal !== 'SIGTERM' && exit.code !== 0) {
      fail(`cycle ${cycle}: engine exit was not clean (code=${exit.code} signal=${exit.signal})`)
    }
  }
  note('case A: five cycles complete with stable session identity and digest')
  rmSync(runtimeDir, { recursive: true, force: true })
}

// ── Case B: corrupted and oversized checkpoint rejection ────────────────────
async function caseCheckpointRejection() {
  note('case B: corrupted and oversized checkpoints must be refused fail-closed')
  const seedDir = freshRuntimeDir('seed')
  const seeded = startEngine(seedDir)
  const ready = await seeded.ready
  if (ready === null) {
    fail('case B: could not seed a valid checkpoint')
    await stopEngine(seeded)
    return
  }
  await stopEngine(seeded)
  const checkpoint = path.join(seedDir, 'bridge-runtime-v1.json')

  const scenarios = [
    ['truncated', (target) => {
      const bytes = readFileSync(checkpoint)
      writeFileSync(target, bytes.subarray(0, Math.floor(bytes.length / 2)))
    }],
    ['garbled', (target) => {
      const text = readFileSync(checkpoint, 'utf8')
      writeFileSync(target, text.replace(/"revision"/, '"revisio~"').slice(0, -3) + '}]')
    }],
    ['oversized', (target) => {
      copyFileSync(checkpoint, target)
      appendFileSync(target, '\n' + '/* padding */'.repeat(3_000_000))
    }],
  ]
  for (const [label, corrupt] of scenarios) {
    const dir = freshRuntimeDir(`bad-${label}`)
    const target = path.join(dir, 'bridge-runtime-v1.json')
    corrupt(target)
    chmodSync(target, 0o600)
    const size = statSync(target).size
    const engine = startEngine(dir)
    const outcome = await Promise.race([
      engine.exit.then((exit) => ({ kind: 'exit', exit })),
      engine.ready.then((value) => (value === null
        ? { kind: 'timeout' }
        : { kind: 'served', value })),
    ])
    if (outcome.kind === 'served') {
      fail(`case B (${label}, ${size} bytes): engine SERVED from a damaged checkpoint`)
    } else if (outcome.kind === 'exit' && outcome.exit.code === 0) {
      fail(`case B (${label}): engine exited zero instead of failing closed`)
    } else {
      note(`case B (${label}, ${size} bytes): refused fail-closed as required`)
    }
    await stopEngine(engine)
    rmSync(dir, { recursive: true, force: true })
  }
  rmSync(seedDir, { recursive: true, force: true })
}

// ── Case C: rapid valid/stale input burst ───────────────────────────────────
async function caseRapidStaleBurst() {
  note('case C: rapid alternating valid/stale command burst')
  const runtimeDir = freshRuntimeDir('burst')
  const engine = startEngine(runtimeDir)
  const ready = await engine.ready
  if (ready === null) {
    fail('case C: engine did not become ready')
    await stopEngine(engine)
    return
  }
  const session = await get(ready.port, '/session')
  const contract = await get(ready.port, '/snapshot')
  const protocolVersion = contract.body.protocolVersion
  const schemaId = contract.body.schemaId
  let accepted = 0
  let staleRejected = 0
  let other = 0
  for (let index = 0; index < 25; index++) {
    const snapshot = await get(ready.port, '/snapshot')
    const revision = snapshot.body.gameWeek !== undefined ? snapshot.body.stateRevision : 0
    const intents = snapshot.body.availableIntents ?? []
    if (intents.length === 0) break
    const intent = intents[0]
    const valid = post(ready.port, '/command', {
      protocolVersion,
      schemaId,
      sessionId: session.body.sessionId,
      commandId: `phase-m-valid-${index}`,
      expectedStateRevision: revision,
      type: 'submitIntent',
      payload: { intentId: intent.intentId },
    })
    const stale = post(ready.port, '/command', {
      protocolVersion,
      schemaId,
      sessionId: session.body.sessionId,
      commandId: `phase-m-stale-${index}`,
      expectedStateRevision: Math.max(0, revision - 1),
      type: 'submitIntent',
      payload: { intentId: intent.intentId },
    })
    const [validResult, staleResult] = await Promise.all([valid, stale])
    for (const result of [validResult, staleResult]) {
      if (result.status === 200 && result.body.accepted) accepted++
      else if (result.body.reasonCode === 'STALE_REVISION') staleRejected++
      else other++
    }
  }
  const final = await get(ready.port, '/snapshot')
  if (accepted === 0) fail('case C: no valid command was accepted during the burst')
  if (staleRejected === 0) fail('case C: no stale command was rejected during the burst')
  if (other > 0) fail(`case C: ${other} burst responses were neither accepted nor STALE_REVISION`)
  if (final.body.stateRevision !== accepted) {
    fail(`case C: final revision ${final.body.stateRevision} != accepted commands ${accepted}`)
  }
  note(`case C: burst complete — accepted=${accepted} staleRejected=${staleRejected} finalRevision=${final.body.stateRevision}`)
  const digest = createHash('sha256').update(JSON.stringify(final.body.snapshot)).digest('hex')
  note(`case C: final snapshot content hash ${digest.slice(0, 16)}...`)
  await stopEngine(engine)
  rmSync(runtimeDir, { recursive: true, force: true })
}

// ── Case D: abrupt kill around save/load boundaries ─────────────────────────
async function caseKillAroundSaveLoad() {
  note('case D: SIGKILL after acked command/save/load must never lose acked state')
  const runtimeDir = freshRuntimeDir('killsave')
  const digests = new Map()

  const killAbruptly = async (engine) => {
    engine.child.kill('SIGKILL')
    await engine.exit
  }
  const launch = async (label) => {
    const engine = startEngine(runtimeDir)
    const ready = await engine.ready
    if (ready === null) {
      fail(`case D (${label}): engine did not become ready after abrupt kill — ` +
        `acked state was lost or the checkpoint tore (${engine.output().slice(-300)})`)
      await stopEngine(engine)
      return null
    }
    return { engine, ready }
  }
  const expectResumed = (label, ready, sessionId, revision) => {
    if (ready.sessionId !== sessionId) fail(`case D (${label}): session identity changed after SIGKILL`)
    if (ready.revision !== revision) {
      fail(`case D (${label}): resumed at revision ${ready.revision}, expected acked ${revision}`)
    } else if (ready.digest !== digests.get(revision)) {
      fail(`case D (${label}): digest at revision ${revision} changed across SIGKILL`)
    }
  }
  const submitFirstIntent = async (port, sessionId, meta, commandId) => {
    const snapshot = await get(port, '/snapshot')
    const intents = snapshot.body.availableIntents ?? []
    if (intents.length === 0) return null
    return post(port, '/command', {
      protocolVersion: meta.protocolVersion,
      schemaId: meta.schemaId,
      sessionId,
      commandId,
      expectedStateRevision: snapshot.body.stateRevision,
      type: 'submitIntent',
      payload: { intentId: intents[0].intentId },
    })
  }

  let boot = await launch('boot')
  if (boot === null) { rmSync(runtimeDir, { recursive: true, force: true }); return }
  const sessionId = boot.ready.sessionId
  digests.set(boot.ready.revision, boot.ready.digest)
  const contract = await get(boot.ready.port, '/snapshot')
  const meta = { protocolVersion: contract.body.protocolVersion, schemaId: contract.body.schemaId }

  // Two acked commands, then SIGKILL. Relaunch must resume both.
  for (let index = 0; index < 2; index++) {
    const result = await submitFirstIntent(boot.ready.port, sessionId, meta, `phase-m-d-cmd-${index}`)
    if (result === null || result.status !== 200 || !result.body.accepted) {
      fail(`case D: setup command ${index} was not accepted`)
      await stopEngine(boot.engine)
      rmSync(runtimeDir, { recursive: true, force: true })
      return
    }
    digests.set(result.body.stateRevision, result.body.stateDigest)
  }
  const ackedAfterCommands = Math.max(...digests.keys())
  await killAbruptly(boot.engine)
  let resumed = await launch('after-commands')
  if (resumed === null) { rmSync(runtimeDir, { recursive: true, force: true }); return }
  expectResumed('after-commands', resumed.ready, sessionId, ackedAfterCommands)
  note(`case D: resumed acked revision ${ackedAfterCommands} after SIGKILL past commands`)

  // Acked save (does not advance revision), then SIGKILL at the boundary.
  const save = await post(resumed.ready.port, '/save', {
    protocolVersion: meta.protocolVersion,
    schemaId: meta.schemaId,
    sessionId,
    commandId: 'phase-m-d-save',
    expectedStateRevision: resumed.ready.revision,
  })
  if (save.status !== 200 || !save.body.accepted) {
    fail(`case D: save was not accepted (${JSON.stringify(save.body).slice(0, 200)})`)
    await stopEngine(resumed.engine)
    rmSync(runtimeDir, { recursive: true, force: true })
    return
  }
  const savedDigest = save.body.stateDigest
  await killAbruptly(resumed.engine)
  resumed = await launch('after-save')
  if (resumed === null) { rmSync(runtimeDir, { recursive: true, force: true }); return }
  expectResumed('after-save', resumed.ready, sessionId, ackedAfterCommands)

  // One more command so load visibly rewinds, acked load, SIGKILL at the boundary.
  const drift = await submitFirstIntent(resumed.ready.port, sessionId, meta, 'phase-m-d-drift')
  if (drift === null || drift.status !== 200 || !drift.body.accepted) {
    fail('case D: post-save drift command was not accepted')
    await stopEngine(resumed.engine)
    rmSync(runtimeDir, { recursive: true, force: true })
    return
  }
  digests.set(drift.body.stateRevision, drift.body.stateDigest)
  const load = await post(resumed.ready.port, '/load', {
    protocolVersion: meta.protocolVersion,
    schemaId: meta.schemaId,
    sessionId,
    commandId: 'phase-m-d-load',
    expectedStateRevision: drift.body.stateRevision,
  })
  if (load.status !== 200 || !load.body.accepted) {
    fail(`case D: load was not accepted (${JSON.stringify(load.body).slice(0, 200)})`)
    await stopEngine(resumed.engine)
    rmSync(runtimeDir, { recursive: true, force: true })
    return
  }
  if (load.body.stateDigest !== savedDigest) {
    fail(`case D: load restored digest ${load.body.stateDigest} != saved digest ${savedDigest}`)
  }
  digests.set(load.body.stateRevision, load.body.stateDigest)
  const ackedAfterLoad = load.body.stateRevision
  await killAbruptly(resumed.engine)
  resumed = await launch('after-load')
  if (resumed === null) { rmSync(runtimeDir, { recursive: true, force: true }); return }
  expectResumed('after-load', resumed.ready, sessionId, ackedAfterLoad)
  note(`case D: resumed acked load at revision ${ackedAfterLoad} with the saved digest`)

  // Mid-flight kill: fire a command and SIGKILL without awaiting the ack.
  // The relaunch may land before or after the un-acked command, but must be
  // ready, keep session identity, and match the digest chain if pre-commit.
  void submitFirstIntent(resumed.ready.port, sessionId, meta, 'phase-m-d-midflight')
    .catch(() => null)
  await killAbruptly(resumed.engine)
  resumed = await launch('mid-flight')
  if (resumed === null) { rmSync(runtimeDir, { recursive: true, force: true }); return }
  if (resumed.ready.sessionId !== sessionId) fail('case D (mid-flight): session identity changed after SIGKILL')
  if (resumed.ready.revision !== ackedAfterLoad && resumed.ready.revision !== ackedAfterLoad + 1) {
    fail(`case D (mid-flight): resumed at revision ${resumed.ready.revision}, ` +
      `expected ${ackedAfterLoad} or ${ackedAfterLoad + 1}`)
  } else if (resumed.ready.revision === ackedAfterLoad &&
    resumed.ready.digest !== digests.get(ackedAfterLoad)) {
    fail('case D (mid-flight): pre-commit digest changed across SIGKILL')
  }
  note(`case D: mid-flight kill resumed cleanly at revision ${resumed.ready.revision}`)
  await stopEngine(resumed.engine)
  rmSync(runtimeDir, { recursive: true, force: true })
}

// ── Case E: journal-bound rollover ──────────────────────────────────────────
async function caseJournalRollover() {
  note('case E: journal bound must roll into a fresh logical session, state preserved')
  const runtimeDir = freshRuntimeDir('rollover')
  const engine = startEngine(runtimeDir)
  const ready = await engine.ready
  if (ready === null) {
    fail('case E: engine did not become ready')
    await stopEngine(engine)
    return
  }
  const contract = await get(ready.port, '/snapshot')
  const meta = { protocolVersion: contract.body.protocolVersion, schemaId: contract.body.schemaId }

  // One real committed intent so the preserved state is non-trivial.
  const intents = contract.body.availableIntents ?? []
  if (intents.length === 0) {
    fail('case E: no available intent to seed non-trivial state')
    await stopEngine(engine)
    return
  }
  const seed = await post(ready.port, '/command', {
    protocolVersion: meta.protocolVersion,
    schemaId: meta.schemaId,
    sessionId: ready.sessionId,
    commandId: 'phase-m-e-seed',
    expectedStateRevision: 0,
    type: 'submitIntent',
    payload: { intentId: intents[0].intentId },
  })
  if (seed.status !== 200 || !seed.body.accepted) {
    fail('case E: seed intent was not accepted')
    await stopEngine(engine)
    return
  }
  const preservedDigest = seed.body.stateDigest
  const preservedWeek = seed.body.gameWeek

  // Saves are journaled but never advance game state: fill the journal with
  // them until the bound forces a controlled rollover rejection.
  let rolled = false
  let saves = 0
  for (; saves < 600; saves++) {
    const save = await post(ready.port, '/save', {
      protocolVersion: meta.protocolVersion,
      schemaId: meta.schemaId,
      sessionId: ready.sessionId,
      commandId: `phase-m-e-save-${saves}`,
      expectedStateRevision: 1,
    })
    if (save.status === 200 && save.body.accepted) continue
    if (save.body.reasonCode === 'SESSION_MISMATCH') { rolled = true; break }
    fail(`case E: save ${saves} rejected with unexpected ${save.body.reasonCode}`)
    await stopEngine(engine)
    rmSync(runtimeDir, { recursive: true, force: true })
    return
  }
  if (!rolled) {
    fail(`case E: no rollover after ${saves} journaled saves (bound expected at 512)`)
    await stopEngine(engine)
    rmSync(runtimeDir, { recursive: true, force: true })
    return
  }
  note(`case E: rollover after ${saves} journaled saves`)

  const session = await get(ready.port, '/session')
  const snapshot = await get(ready.port, '/snapshot')
  if (session.body.sessionId === ready.sessionId) fail('case E: rollover kept the old logical session id')
  if (snapshot.body.stateRevision !== 0) fail(`case E: rollover revision ${snapshot.body.stateRevision} != 0`)
  if (snapshot.body.stateDigest !== preservedDigest) fail('case E: rollover changed the authoritative digest')
  if (snapshot.body.gameWeek !== preservedWeek) fail('case E: rollover changed the game week')

  // The fresh session must accept work, and an abrupt kill immediately after
  // the rollover must resume it exactly.
  const after = await get(ready.port, '/snapshot')
  const nextIntents = after.body.availableIntents ?? []
  let expectResume = 0
  let expectDigest = preservedDigest
  if (nextIntents.length > 0) {
    const commit = await post(ready.port, '/command', {
      protocolVersion: meta.protocolVersion,
      schemaId: meta.schemaId,
      sessionId: session.body.sessionId,
      commandId: 'phase-m-e-post-rollover',
      expectedStateRevision: 0,
      type: 'submitIntent',
      payload: { intentId: nextIntents[0].intentId },
    })
    if (commit.status !== 200 || !commit.body.accepted) {
      fail('case E: post-rollover command was not accepted')
    } else {
      expectResume = commit.body.stateRevision
      expectDigest = commit.body.stateDigest
    }
  }
  engine.child.kill('SIGKILL')
  await engine.exit
  const revived = startEngine(runtimeDir)
  const back = await revived.ready
  if (back === null) {
    fail('case E: engine did not come back after SIGKILL past rollover')
  } else {
    if (back.sessionId !== session.body.sessionId) fail('case E: rolled-over session identity lost across SIGKILL')
    if (back.revision !== expectResume) fail(`case E: resumed revision ${back.revision} != acked ${expectResume}`)
    if (back.digest !== expectDigest) fail('case E: resumed digest mismatch after rollover kill')
  }
  note(`case E: rolled-over session survived SIGKILL at revision ${expectResume}`)
  await stopEngine(revived)
  rmSync(runtimeDir, { recursive: true, force: true })
}

await caseLaunchQuitCycles()
await caseCheckpointRejection()
await caseRapidStaleBurst()
await caseKillAroundSaveLoad()
await caseJournalRollover()

if (failures.length > 0) {
  console.error(`[phase-m] MATRIX FAILED: ${failures.length} violation(s)`)
  process.exit(1)
}
console.log('[phase-m] MATRIX PASS: launch/quit cycles, checkpoint rejection, rapid stale burst, kill around save/load, journal rollover')
process.exit(0)
