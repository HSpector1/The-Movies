import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

export const MAX_PROCESS_INCARNATION_BYTES = 256

const MAX_PROCESS_STAT_BYTES = 4 * 1024

export type ProcessIncarnationInspection =
  | { status: 'absent' }
  | { status: 'unverifiable' }
  | { status: 'verified'; incarnation: string }

function systemCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException | null)?.code
}

function processPresence(pid: number): 'absent' | 'present' | 'unverifiable' {
  try {
    process.kill(pid, 0)
    return 'present'
  } catch (error) {
    if (systemCode(error) === 'ESRCH') return 'absent'
    if (systemCode(error) === 'EPERM') return 'present'
    return 'unverifiable'
  }
}

export function boundedProcessIncarnation(value: string): string | null {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (
    normalized.length === 0 ||
    Buffer.byteLength(normalized, 'utf8') > MAX_PROCESS_INCARNATION_BYTES ||
    !/^[\x20-\x7e]+$/.test(normalized)
  ) return null
  return normalized
}

function linuxProcessIncarnation(pid: number): string | null {
  try {
    const bootId = fs.readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim().toLowerCase()
    const processStat = fs.readFileSync(`/proc/${String(pid)}/stat`, 'utf8')
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(bootId) ||
      Buffer.byteLength(processStat, 'utf8') > MAX_PROCESS_STAT_BYTES
    ) return null
    const commandEnd = processStat.lastIndexOf(')')
    if (commandEnd < 0) return null
    const fieldsAfterCommand = processStat.slice(commandEnd + 1).trim().split(/\s+/)
    const startTicks = fieldsAfterCommand[19]
    if (startTicks === undefined || !/^\d+$/.test(startTicks)) return null
    return boundedProcessIncarnation(`linux-proc:${bootId}:${startTicks}`)
  } catch {
    return null
  }
}

function psProcessIncarnation(pid: number): string | null {
  const result = spawnSync(
    '/bin/ps',
    ['-o', 'lstart=', '-p', String(pid)],
    {
      encoding: 'utf8',
      env: { LANG: 'C', LC_ALL: 'C', PATH: '/usr/bin:/bin' },
      maxBuffer: 1024,
      timeout: 2_000,
    },
  )
  if (result.error !== undefined || result.signal !== null || result.status !== 0) return null
  return boundedProcessIncarnation(`ps-lstart:${result.stdout}`)
}

export function inspectProcessIncarnation(pid: number): ProcessIncarnationInspection {
  if (!Number.isSafeInteger(pid) || pid <= 0) return { status: 'unverifiable' }
  const before = processPresence(pid)
  if (before === 'absent') return { status: 'absent' }
  if (before === 'unverifiable') return { status: 'unverifiable' }

  const incarnation = process.platform === 'linux'
    ? linuxProcessIncarnation(pid) ?? psProcessIncarnation(pid)
    : psProcessIncarnation(pid)
  if (incarnation !== null) return { status: 'verified', incarnation }

  const after = processPresence(pid)
  return after === 'absent' ? { status: 'absent' } : { status: 'unverifiable' }
}

export function currentProcessIncarnation(): string | null {
  const inspection = inspectProcessIncarnation(process.pid)
  return inspection.status === 'verified' ? inspection.incarnation : null
}
