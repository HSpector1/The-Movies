#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import net from 'node:net'

const CAPABILITY_ENV = 'PROJECT_STUDIO_BRIDGE_CAPABILITY'
const URL_ENV = 'PROJECT_STUDIO_BRIDGE_URL'
const CAPABILITY_HEADER = 'x-project-studio-capability'

function parseArguments(argv) {
  if (argv[0] !== '-logFile' || argv[1] !== '-') {
    throw new Error('Supervisor did not route the Unity-owned Player.log stream to stdout.')
  }
  const options = new Map()
  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Malformed fake Unity argument at index ${String(index)}.`)
    }
    options.set(key.slice(2), value)
  }
  return options
}

function required(options, name) {
  const value = options.get(name)
  if (value === undefined || value.length === 0) {
    throw new Error(`Fake Unity requires --${name}.`)
  }
  return value
}

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const observerPort = Number(required(options, 'observer-port'))
  const mode = options.get('mode') ?? 'exit'
  if (!Number.isSafeInteger(observerPort) || observerPort < 1 || observerPort > 65_535) {
    throw new Error('Fake Unity observer port is invalid.')
  }

  const endpoint = process.env[URL_ENV] ?? ''
  const capability = process.env[CAPABILITY_ENV] ?? ''
  const socket = net.createConnection({ host: '127.0.0.1', port: observerPort })
  socket.setNoDelay(true)
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve)
    socket.once('error', reject)
  })

  const report = (event, details = {}) => {
    socket.write(`${JSON.stringify({ event, ...details })}\n`)
  }
  let finishing = false
  const finish = (code) => {
    if (finishing) return
    finishing = true
    report('exiting', { code })
    socket.end(() => process.exit(code))
    setTimeout(() => process.exit(code), 250).unref()
  }

  let commands = ''
  socket.on('data', (chunk) => {
    commands += chunk.toString('utf8')
    while (true) {
      const newline = commands.indexOf('\n')
      if (newline < 0) break
      const line = commands.slice(0, newline)
      commands = commands.slice(newline + 1)
      const command = JSON.parse(line)
      if (command.command === 'exit') finish(Number(command.code ?? 0))
    }
  })

  process.once('SIGINT', () => {
    report('signal', { signal: 'SIGINT' })
    finish(130)
  })
  process.once('SIGTERM', () => {
    report('signal', { signal: 'SIGTERM' })
    finish(143)
  })

  if (options.get('helper') === 'ignore-term') {
    const helper = spawn(process.execPath, [
      '-e',
      "process.on('SIGTERM',()=>{});process.stdout.write('ready\\n');setInterval(()=>{},1000)",
    ], { stdio: ['ignore', 'pipe', 'ignore'] })
    await new Promise((resolve, reject) => {
      helper.once('error', reject)
      helper.stdout.once('data', resolve)
    })
    helper.stdout.destroy()
    helper.unref()
    report('helper', { pid: helper.pid })
  }

  report('started', {
    argvContainsCapability: process.argv.some((value) => value.includes(capability)),
    capability,
    capabilitySha256: sha256(capability),
    endpoint,
    inherited: {
      bridgePort: process.env.PROJECT_STUDIO_BRIDGE_PORT ?? null,
      bridgeRuntimeDir: process.env.PROJECT_STUDIO_BRIDGE_RUNTIME_DIR ?? null,
      postCommitResponse: process.env.PROJECT_STUDIO_BRIDGE_TEST_POST_COMMIT_RESPONSE ?? null,
      supervisorLease: process.env.PROJECT_STUDIO_SUPERVISOR_LEASE ?? null,
      unityApp: process.env.PROJECT_STUDIO_UNITY_APP ?? null,
      unityExecutable: process.env.PROJECT_STUDIO_UNITY_EXECUTABLE ?? null,
      unityProject: process.env.PROJECT_STUDIO_UNITY_PROJECT ?? null,
    },
    ownedLogFilePair: process.argv[2] === '-logFile' && process.argv[3] === '-',
    parentPid: process.ppid,
    pid: process.pid,
  })

  const unauthenticated = await fetch(`${endpoint}/health`, { redirect: 'manual' })
  const authenticated = await fetch(`${endpoint}/health`, {
    headers: { [CAPABILITY_HEADER]: capability },
    redirect: 'manual',
  })
  const health = await authenticated.json()
  report('health', {
    authenticatedStatus: authenticated.status,
    gameWeek: health.gameWeek,
    protocolVersion: health.protocolVersion,
    runtimeInstanceId: health.runtimeInstanceId,
    schemaId: health.schemaId,
    sessionId: health.sessionId,
    snapshotVersion: health.snapshotVersion,
    stateDigest: health.stateDigest,
    stateRevision: health.stateRevision,
    unauthenticatedStatus: unauthenticated.status,
  })

  // Exercise streaming redaction instead of printing a conveniently atomic token.
  const firstCut = Math.max(1, Math.floor(capability.length / 3))
  const secondCut = Math.max(firstCut + 1, Math.floor(capability.length * 2 / 3))
  process.stdout.write(`[fake-unity] output-redaction=${capability.slice(0, firstCut)}`)
  await delay(10)
  process.stdout.write(capability.slice(firstCut, secondCut))
  await delay(10)
  process.stdout.write(`${capability.slice(secondCut)}\n`)
  process.stderr.write(`[fake-unity] error-redaction=${capability.slice(0, secondCut)}`)
  await delay(10)
  process.stderr.write(`${capability.slice(secondCut)}\n`)

  if (mode === 'exit') {
    finish(Number(options.get('exit-code') ?? '0'))
    return
  }
  if (mode === 'observe-restart') {
    let observedOutage = false
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      await delay(50)
      try {
        const response = await fetch(`${endpoint}/health`, {
          headers: { [CAPABILITY_HEADER]: capability },
          redirect: 'manual',
          signal: AbortSignal.timeout(1_000),
        })
        if (!response.ok) continue
        const replacement = await response.json()
        if (replacement.runtimeInstanceId !== health.runtimeInstanceId) {
          report('replacement', {
            endpoint,
            observedOutage,
            runtimeInstanceId: replacement.runtimeInstanceId,
            sessionId: replacement.sessionId,
            stateDigest: replacement.stateDigest,
            stateRevision: replacement.stateRevision,
          })
          report('holding-after-replacement')
          setInterval(() => {}, 1_000)
          return
        }
      } catch {
        observedOutage = true
      }
    }
    report('failure', { message: 'Timed out waiting for an engine replacement.' })
    finish(70)
    return
  }
  if (mode !== 'hold') throw new Error(`Unsupported fake Unity mode ${mode}.`)

  report('holding')
  setInterval(() => {}, 1_000)
}

main().catch((error) => {
  process.stderr.write(`[fake-unity] fatal ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 71
})
