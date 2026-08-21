import { spawn, type ChildProcess } from 'node:child_process'
import { once } from 'node:events'

import { afterEach, describe, expect, it } from 'vitest'

import {
  MAX_PROCESS_INCARNATION_BYTES,
  boundedProcessIncarnation,
  currentProcessIncarnation,
  inspectProcessIncarnation,
} from '../bridge/runtime/process-incarnation.ts'

const children: ChildProcess[] = []

afterEach(async () => {
  for (const child of children.splice(0).reverse()) {
    if (child.exitCode !== null || child.signalCode !== null) continue
    const exited = once(child, 'exit')
    child.kill('SIGKILL')
    await exited
  }
})

describe('process incarnation inspection', () => {
  it('normalizes and bounds portable process incarnation records', () => {
    expect(boundedProcessIncarnation('  ps-lstart:Fri\tAug  21 01:02:03 2026\n'))
      .toBe('ps-lstart:Fri Aug 21 01:02:03 2026')
    expect(boundedProcessIncarnation('x'.repeat(MAX_PROCESS_INCARNATION_BYTES)))
      .toBe('x'.repeat(MAX_PROCESS_INCARNATION_BYTES))
    expect(boundedProcessIncarnation('x'.repeat(MAX_PROCESS_INCARNATION_BYTES + 1))).toBeNull()
    expect(boundedProcessIncarnation('')).toBeNull()
    expect(boundedProcessIncarnation('process-\u00e9')).toBeNull()
  })

  it('reports the current process through the platform incarnation source', () => {
    const current = currentProcessIncarnation()
    const inspected = inspectProcessIncarnation(process.pid)

    expect(current).toMatch(/^(linux-proc|ps-lstart):/)
    expect(inspected).toEqual({ status: 'verified', incarnation: current })
  })

  it('distinguishes a live child incarnation from the same PID after exit', async () => {
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      stdio: 'ignore',
    })
    children.push(child)
    await once(child, 'spawn')
    if (child.pid === undefined) throw new Error('Spawned test process has no PID.')

    const live = inspectProcessIncarnation(child.pid)
    expect(live.status).toBe('verified')
    if (live.status !== 'verified') throw new Error('Live child process was not verifiable.')
    expect(live.incarnation).toMatch(/^(linux-proc|ps-lstart):/)

    const exited = once(child, 'exit')
    child.kill('SIGTERM')
    await exited
    expect(inspectProcessIncarnation(child.pid)).toEqual({ status: 'absent' })
  })

  it('fails closed for invalid PIDs and reports a definitely absent PID', () => {
    for (const pid of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(inspectProcessIncarnation(pid)).toEqual({ status: 'unverifiable' })
    }
    expect(inspectProcessIncarnation(2_147_483_647)).toEqual({ status: 'absent' })
  })
})
