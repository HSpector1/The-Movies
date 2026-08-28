import { randomUUID } from 'node:crypto'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { canonicalJson } from '../schema/canonical.ts'
import {
  boundedProcessIncarnation,
  currentProcessIncarnation,
  inspectProcessIncarnation,
} from '../runtime/process-incarnation.ts'

export const SUPERVISOR_LEASE_VERSION = 1
export const ACTIVE_SUPERVISOR_LEASE_NAME = 'active-supervisor-v1.json'
export const LAUNCH_LEASE_NAME = 'launch-lease-v1.json'
export const SUPERVISOR_OWNER_LOCK_NAME = 'supervisor-owner.lock'
export const BRIDGE_RUNTIME_DIRECTORY_NAME = 'bridge-runtime'
export const LAUNCHES_DIRECTORY_NAME = 'launches'
export const MAX_RETAINED_LAUNCH_DIRECTORIES = 5
export const MAX_RETAINED_LAUNCH_BYTES = 32 * 1024 * 1024

const MAX_LEASE_BYTES = 16 * 1024
const STALE_CHILD_TERM_TIMEOUT_MS = 3_000
const STALE_CHILD_KILL_TIMEOUT_MS = 2_000
const OWNER_LOCK_TIMEOUT_MS = 4_000
const OWNER_LOCK_WAIT_MS = 2_000
// macOS <sys/fcntl.h>: `#define O_EXLOCK 0x00000020`. @types/node does not
// declare fs.constants.O_EXLOCK, so the darwin holder uses the ABI value.
const DARWIN_O_EXLOCK = 0x20
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const LAUNCH_DIRECTORY_PATTERN = /^launch-\d{8}T\d{9}Z-[0-9a-f-]{36}$/

export type SupervisorChildKind = 'engine' | 'unity'

export type SupervisorProcessReference = {
  kind: SupervisorChildKind
  pid: number
  processGroupId: number
  processIncarnation: string
}

export type SupervisorLeasePhase = 'running' | 'starting' | 'stopped' | 'stopping'

export type SupervisorLeaseRecord = {
  version: 1
  launchId: string
  launchDirectory: string
  startedAt: string
  phase: SupervisorLeasePhase
  supervisor: {
    pid: number
    processIncarnation: string
  }
  engine: SupervisorProcessReference | null
  unity: SupervisorProcessReference | null
  fixedPort: number | null
  engineRestarts: number
}

export type SupervisorProfileLayout = {
  profileRoot: string
  bridgeRuntimeRoot: string
  launchesRoot: string
  activeLeasePath: string
  ownerLockPath: string
}

type FileIdentity = {
  dev: number
  ino: number
  size: number
  mtimeMs: number
}

type ReadLease = {
  record: SupervisorLeaseRecord
  identity: FileIdentity
}

function systemCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException | null)?.code
}

function lstatOrNull(filePath: string): fs.Stats | null {
  try {
    return fs.lstatSync(filePath)
  } catch (error) {
    if (systemCode(error) === 'ENOENT') return null
    throw error
  }
}

function currentUid(): number {
  if (typeof process.getuid !== 'function') {
    throw new Error('The Project: Studio supervisor requires a POSIX owner identity.')
  }
  return process.getuid()
}

function platformCanonicalPath(filePath: string): string {
  if (process.platform !== 'darwin') return filePath
  for (const alias of ['/var', '/tmp', '/etc']) {
    if (filePath !== alias && !filePath.startsWith(`${alias}${path.sep}`)) continue
    const target = fs.realpathSync.native(alias)
    return path.join(target, path.relative(alias, filePath))
  }
  return filePath
}

function assertPrivateDirectory(directoryPath: string, label: string): string {
  const stat = fs.lstatSync(directoryPath)
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`${label} must be a real directory: ${directoryPath}`)
  }
  if (stat.uid !== currentUid()) {
    throw new Error(`${label} must be owned by the current user: ${directoryPath}`)
  }
  const permissions = stat.mode & 0o777
  if (permissions !== 0o700) {
    throw new Error(
      `${label} must have mode 0700; found ${permissions.toString(8).padStart(4, '0')}: ${directoryPath}`,
    )
  }
  const canonical = fs.realpathSync.native(directoryPath)
  if (canonical !== platformCanonicalPath(directoryPath)) {
    throw new Error(`${label} must not traverse a symbolic link: ${directoryPath}`)
  }
  return canonical
}

export function ensurePrivateDirectory(directoryPath: string, label: string): string {
  if (!path.isAbsolute(directoryPath)) throw new Error(`${label} must be an absolute path.`)
  const normalized = path.normalize(directoryPath)
  const existing = lstatOrNull(normalized)
  if (existing !== null) return assertPrivateDirectory(normalized, label)

  const missing: string[] = []
  let ancestor = normalized
  while (lstatOrNull(ancestor) === null) {
    missing.unshift(path.basename(ancestor))
    const parent = path.dirname(ancestor)
    if (parent === ancestor) throw new Error(`${label} has no existing parent: ${normalized}`)
    ancestor = parent
  }
  const ancestorStat = fs.lstatSync(ancestor)
  if (ancestorStat.isSymbolicLink() || !ancestorStat.isDirectory()) {
    throw new Error(`${label} parent must be a real directory: ${ancestor}`)
  }
  const canonicalAncestor = fs.realpathSync.native(ancestor)
  if (canonicalAncestor !== platformCanonicalPath(ancestor)) {
    throw new Error(`${label} parent must not traverse a symbolic link: ${ancestor}`)
  }

  let current = canonicalAncestor
  for (const component of missing) {
    current = path.join(current, component)
    let created = false
    try {
      fs.mkdirSync(current, { mode: 0o700 })
      created = true
    } catch (error) {
      if (systemCode(error) !== 'EEXIST') throw error
    }
    const stat = fs.lstatSync(current)
    if (
      stat.isSymbolicLink() ||
      !stat.isDirectory() ||
      stat.uid !== currentUid() ||
      (!created && (stat.mode & 0o777) !== 0o700)
    ) {
      throw new Error(`${label} changed while it was being created: ${current}`)
    }
    if (created) fs.chmodSync(current, 0o700)
  }
  return assertPrivateDirectory(platformCanonicalPath(normalized), label)
}

export function prepareSupervisorProfile(profileRoot: string): SupervisorProfileLayout {
  const canonicalRoot = ensurePrivateDirectory(profileRoot, 'Studio profile root')
  const bridgeRuntimeRoot = ensurePrivateDirectory(
    path.join(canonicalRoot, BRIDGE_RUNTIME_DIRECTORY_NAME),
    'Bridge runtime root',
  )
  const launchesRoot = ensurePrivateDirectory(
    path.join(canonicalRoot, LAUNCHES_DIRECTORY_NAME),
    'Supervisor launches root',
  )
  return {
    profileRoot: canonicalRoot,
    bridgeRuntimeRoot,
    launchesRoot,
    activeLeasePath: path.join(canonicalRoot, ACTIVE_SUPERVISOR_LEASE_NAME),
    ownerLockPath: path.join(canonicalRoot, SUPERVISOR_OWNER_LOCK_NAME),
  }
}

function ensurePrivateLockFile(filePath: string): void {
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(
      filePath,
      fs.constants.O_WRONLY |
        fs.constants.O_CREAT |
        (fs.constants.O_NOFOLLOW ?? 0),
      0o600,
    )
    const stat = fs.fstatSync(descriptor)
    if (!stat.isFile() || stat.uid !== currentUid() || (stat.mode & 0o777) !== 0o600) {
      throw new Error(`Supervisor owner lock must be an owned mode-0600 file: ${filePath}`)
    }
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor)
  }
}

async function acquireOwnerLock(layout: SupervisorProfileLayout): Promise<ChildProcess> {
  ensurePrivateLockFile(layout.ownerLockPath)
  const holderTail = [
    "process.stdin.resume()",
    "process.stdin.once('end',()=>process.exit(0))",
    "process.stdout.write('project-studio-owner-lock\\n')",
  ]
  const holderScript = holderTail.join(';')
  // macOS has never shipped lockf(1) - it is a FreeBSD utility - so on darwin
  // the holder takes the same kernel lock lockf(1) would have taken, itself,
  // via O_EXLOCK. The semantics are preserved exactly: the lock lives on the
  // open file description, so it is released when the holder exits for ANY
  // reason (SIGKILL included), and a contended acquire retries for the same
  // two seconds `lockf -t 2` waited before giving up and exiting non-zero.
  // O_EXLOCK is deliberately NOT used on linux, where the kernel ignores it;
  // that branch keeps flock(1) exactly as it was.
  // hrtime is monotonic: a wall-clock step must not stretch the wait past the
  // parent's OWNER_LOCK_TIMEOUT_MS and turn a clean contention refusal into a
  // timeout + SIGKILL. The fd is deliberately never closed — the BSD lock lives
  // on the open file description and must outlive this statement.
  const darwinHolderScript = [
    "const f=require('fs')",
    'const p=process.argv[1]',
    `const deadline=process.hrtime.bigint()+BigInt(${OWNER_LOCK_WAIT_MS})*1000000n`,
    'for(;;){try{f.openSync(p,f.constants.O_RDWR|'
      + `${DARWIN_O_EXLOCK}`
      + '|f.constants.O_NONBLOCK);break}catch(e){'
      // ONLY EAGAIN means another supervisor holds the lock. Every other errno
      // (ENOENT, EACCES, EISDIR, ELOOP, a read-only volume) is a real fault and
      // is reported on stderr with a distinct exit code, never disguised as
      // contention. lockf(1) and flock(1) both said why they failed; so does this.
      + "if(e.code!=='EAGAIN'){f.writeSync(2,e.message);process.exit(76)}"
      + 'if(process.hrtime.bigint()>=deadline)process.exit(75);'
      + 'Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,25)}}',
    ...holderTail,
  ].join(';')
  const lockCommand = process.platform === 'darwin'
    ? {
        executable: process.execPath,
        arguments: ['-e', darwinHolderScript, layout.ownerLockPath],
        mechanism: 'O_EXLOCK',
      }
    : process.platform === 'linux'
      ? {
          executable: fs.existsSync('/usr/bin/flock') ? '/usr/bin/flock' : '/bin/flock',
          arguments: ['-w', String(OWNER_LOCK_WAIT_MS / 1_000), layout.ownerLockPath, process.execPath, '-e', holderScript],
          mechanism: 'flock',
        }
      : null
  if (
    lockCommand === null ||
    !fs.existsSync(lockCommand.executable) ||
    (fs.statSync(lockCommand.executable).mode & 0o111) === 0
  ) throw new Error(`No supported kernel owner-lock utility is available on ${process.platform}.`)
  const holder = spawn(
    lockCommand.executable,
    lockCommand.arguments,
    {
      detached: false,
      env: { LANG: 'C', LC_ALL: 'C', PATH: '/usr/bin:/bin' },
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    },
  )
  let stdout = ''
  let stderr = ''
  return await new Promise<ChildProcess>((resolve, reject) => {
    let settled = false
    const timeout = setTimeout(() => {
      if (settled) return
      settled = true
      holder.kill('SIGKILL')
      reject(new Error('Timed out acquiring the supervisor owner lock.'))
    }, OWNER_LOCK_TIMEOUT_MS)
    const fail = (message: string, cause?: unknown): void => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (holder.exitCode === null && holder.signalCode === null) holder.kill('SIGKILL')
      reject(new Error(message, cause === undefined ? undefined : { cause }))
    }
    holder.once('error', (error) => {
      fail(`Could not start ${lockCommand.executable}: ${error.message}`, error)
    })
    holder.once('exit', (code, signal) => {
      fail(
        code === 76
          ? `Supervisor owner lock could not be opened at ${layout.ownerLockPath} ` +
            `(${lockCommand.mechanism}${stderr.length === 0 ? '' : `: ${stderr}`}).`
          : `Another Project: Studio supervisor owns the profile ` +
            `(${lockCommand.mechanism} code=${String(code)} signal=${signal ?? '-'}${stderr.length === 0 ? '' : `: ${stderr}`}).`,
      )
    })
    holder.stderr?.on('data', (chunk: Buffer) => {
      if (stderr.length < 4_096) stderr += chunk.toString('utf8').slice(0, 4_096 - stderr.length)
    })
    holder.stdout?.on('data', (chunk: Buffer) => {
      if (settled) return
      stdout += chunk.toString('utf8')
      if (stdout.length > 256) {
        fail('Supervisor owner-lock handshake exceeded its byte bound.')
        return
      }
      if (stdout === 'project-studio-owner-lock\n') {
        settled = true
        clearTimeout(timeout)
        resolve(holder)
      } else if (stdout.includes('\n')) {
        fail('Supervisor owner-lock handshake was malformed.')
      }
    })
  })
}

function releaseOwnerLock(holder: ChildProcess): void {
  holder.stdin?.end()
  holder.stdout?.destroy()
  holder.stderr?.destroy()
  holder.unref()
}

function exactKeys(record: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(record).sort().join('\0') === [...expected].sort().join('\0')
}

function isProcessReference(
  value: unknown,
  expectedKind: SupervisorChildKind,
): value is SupervisorProcessReference {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return exactKeys(record, ['kind', 'pid', 'processGroupId', 'processIncarnation']) &&
    record['kind'] === expectedKind &&
    Number.isSafeInteger(record['pid']) &&
    (record['pid'] as number) > 0 &&
    record['processGroupId'] === record['pid'] &&
    typeof record['processIncarnation'] === 'string' &&
    boundedProcessIncarnation(record['processIncarnation']) === record['processIncarnation']
}

export function parseSupervisorLease(value: unknown): SupervisorLeaseRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Supervisor lease must be an object.')
  }
  const record = value as Record<string, unknown>
  if (!exactKeys(record, [
    'engine',
    'engineRestarts',
    'fixedPort',
    'launchDirectory',
    'launchId',
    'phase',
    'startedAt',
    'supervisor',
    'unity',
    'version',
  ])) throw new Error('Supervisor lease has unknown or missing fields.')
  const supervisor = record['supervisor']
  if (
    typeof supervisor !== 'object' ||
    supervisor === null ||
    Array.isArray(supervisor) ||
    !exactKeys(supervisor as Record<string, unknown>, ['pid', 'processIncarnation'])
  ) throw new Error('Supervisor lease owner is malformed.')
  const owner = supervisor as Record<string, unknown>
  if (
    !Number.isSafeInteger(owner['pid']) ||
    (owner['pid'] as number) <= 0 ||
    typeof owner['processIncarnation'] !== 'string' ||
    boundedProcessIncarnation(owner['processIncarnation']) !== owner['processIncarnation']
  ) throw new Error('Supervisor lease owner is malformed.')
  if (
    record['version'] !== SUPERVISOR_LEASE_VERSION ||
    typeof record['launchId'] !== 'string' ||
    !UUID_PATTERN.test(record['launchId']) ||
    typeof record['launchDirectory'] !== 'string' ||
    !LAUNCH_DIRECTORY_PATTERN.test(record['launchDirectory']) ||
    typeof record['startedAt'] !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record['startedAt']) ||
    !['running', 'starting', 'stopped', 'stopping'].includes(String(record['phase'])) ||
    !Number.isSafeInteger(record['engineRestarts']) ||
    (record['engineRestarts'] as number) < 0 ||
    (record['engineRestarts'] as number) > 10 ||
    (record['fixedPort'] !== null &&
      (!Number.isSafeInteger(record['fixedPort']) ||
        (record['fixedPort'] as number) <= 0 ||
        (record['fixedPort'] as number) > 65535)) ||
    (record['engine'] !== null && !isProcessReference(record['engine'], 'engine')) ||
    (record['unity'] !== null && !isProcessReference(record['unity'], 'unity'))
  ) throw new Error('Supervisor lease is malformed.')
  return record as SupervisorLeaseRecord
}

function identityOf(stat: fs.Stats): FileIdentity {
  return { dev: stat.dev, ino: stat.ino, size: stat.size, mtimeMs: stat.mtimeMs }
}

function sameIdentity(left: FileIdentity, right: FileIdentity): boolean {
  return left.dev === right.dev && left.ino === right.ino &&
    left.size === right.size && left.mtimeMs === right.mtimeMs
}

function removeExactLeasePath(filePath: string, expected: FileIdentity): boolean {
  const directory = path.dirname(filePath)
  const quarantine = path.join(
    directory,
    `.${path.basename(filePath)}.quarantine-${String(process.pid)}-${randomUUID()}`,
  )
  try {
    fs.renameSync(filePath, quarantine)
  } catch (error) {
    if (systemCode(error) === 'ENOENT') return false
    throw error
  }
  const moved = fs.lstatSync(quarantine)
  if (sameIdentity(identityOf(moved), expected)) {
    fs.unlinkSync(quarantine)
    fsyncDirectory(directory)
    return true
  }

  // A non-cooperating writer replaced the path between inspection and rename.
  // Restore exactly what was moved without overwriting any third-party claimant.
  if (moved.isSymbolicLink() || !moved.isFile()) {
    throw new Error('Supervisor lease changed to an unsafe file during reclamation.')
  }
  try {
    fs.linkSync(quarantine, filePath)
  } catch (error) {
    throw new Error('Supervisor lease changed and could not be restored safely.', { cause: error })
  }
  fs.unlinkSync(quarantine)
  fsyncDirectory(directory)
  return false
}

function plausibleTruncatedLease(bytes: Buffer): boolean {
  if (bytes.length === 0) return true
  const text = bytes.toString('utf8')
  if (!Buffer.from(text, 'utf8').equals(bytes) || !text.startsWith('{"engine":')) return false
  try {
    JSON.parse(text)
    return false
  } catch {
    // A complete but schema-invalid JSON document is corruption, not interruption.
  }
  const stack: string[] = []
  let inString = false
  let escaped = false
  for (const character of text) {
    const code = character.charCodeAt(0)
    if (code < 0x20 || code > 0x7e) return false
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === '"') {
        inString = false
      }
      continue
    }
    if (character === '"') {
      inString = true
      continue
    }
    if (character === '{' || character === '[') {
      stack.push(character)
      continue
    }
    if (character === '}' || character === ']') {
      const expected = character === '}' ? '{' : '['
      if (stack.pop() !== expected) return false
      continue
    }
    if (!/[\s,:0-9.truefalsn+\-eE]/.test(character)) return false
  }
  return inString || escaped || stack.length > 0
}

function recoverInterruptedLeasePublication(filePath: string): boolean {
  const before = lstatOrNull(filePath)
  if (
    before === null ||
    before.isSymbolicLink() ||
    !before.isFile() ||
    before.uid !== currentUid() ||
    (before.mode & 0o777) !== 0o600 ||
    before.size > MAX_LEASE_BYTES
  ) return false
  const descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
  try {
    const opened = fs.fstatSync(descriptor)
    if (!sameIdentity(identityOf(before), identityOf(opened))) return false
    const bytes = fs.readFileSync(descriptor)
    if (bytes.length !== opened.size || !plausibleTruncatedLease(bytes)) return false
    return removeExactLeasePath(filePath, identityOf(opened))
  } finally {
    fs.closeSync(descriptor)
  }
}

function readLease(filePath: string): ReadLease | null {
  const before = lstatOrNull(filePath)
  if (before === null) return null
  if (before.isSymbolicLink() || !before.isFile() || before.uid !== currentUid()) {
    throw new Error(`Supervisor lease must be an owned regular file: ${filePath}`)
  }
  if ((before.mode & 0o777) !== 0o600 || before.size > MAX_LEASE_BYTES) {
    throw new Error(`Supervisor lease has unsafe mode or size: ${filePath}`)
  }
  const descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
  try {
    const opened = fs.fstatSync(descriptor)
    if (!sameIdentity(identityOf(before), identityOf(opened))) {
      throw new Error('Supervisor lease changed while it was being opened.')
    }
    const bytes = fs.readFileSync(descriptor)
    if (bytes.length !== opened.size || bytes.length > MAX_LEASE_BYTES) {
      throw new Error('Supervisor lease changed while it was being read.')
    }
    let value: unknown
    try {
      value = JSON.parse(bytes.toString('utf8')) as unknown
    } catch (error) {
      throw new Error('Supervisor lease is not valid JSON.', { cause: error })
    }
    const record = parseSupervisorLease(value)
    if (canonicalJson(record) !== bytes.toString('utf8')) {
      throw new Error('Supervisor lease is not canonical JSON.')
    }
    return { record, identity: identityOf(opened) }
  } finally {
    fs.closeSync(descriptor)
  }
}

function fsyncDirectory(directoryPath: string): void {
  const descriptor = fs.openSync(
    directoryPath,
    fs.constants.O_RDONLY | (fs.constants.O_DIRECTORY ?? 0),
  )
  try {
    fs.fsyncSync(descriptor)
  } finally {
    fs.closeSync(descriptor)
  }
}

function writeExclusiveLease(filePath: string, record: SupervisorLeaseRecord): void {
  const directory = path.dirname(filePath)
  const candidate = path.join(
    directory,
    `.${path.basename(filePath)}.candidate-${String(process.pid)}-${randomUUID()}`,
  )
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(
      candidate,
      fs.constants.O_WRONLY |
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        (fs.constants.O_NOFOLLOW ?? 0),
      0o600,
    )
    fs.fchmodSync(descriptor, 0o600)
    fs.writeFileSync(descriptor, canonicalJson(record), 'utf8')
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = null
    // A hard-link publication is an O_EXCL compare-and-publish of an already
    // complete, synced inode. The authoritative path can never expose partial JSON.
    fs.linkSync(candidate, filePath)
    fsyncDirectory(directory)
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor)
    const stat = lstatOrNull(candidate)
    if (stat !== null && stat.isFile() && !stat.isSymbolicLink()) {
      fs.unlinkSync(candidate)
      fsyncDirectory(directory)
    }
  }
}

function writeAtomicLease(
  filePath: string,
  record: SupervisorLeaseRecord,
  requireOwner?: SupervisorLeaseRecord['supervisor'] & { launchId: string },
): void {
  if (requireOwner !== undefined) {
    const existing = readLease(filePath)
    if (
      existing === null ||
      existing.record.launchId !== requireOwner.launchId ||
      existing.record.supervisor.pid !== requireOwner.pid ||
      existing.record.supervisor.processIncarnation !== requireOwner.processIncarnation
    ) throw new Error('Supervisor lease ownership changed.')
  }
  const directory = path.dirname(filePath)
  const temporary = path.join(
    directory,
    `.${path.basename(filePath)}.write-${String(process.pid)}-${randomUUID()}`,
  )
  try {
    writeExclusiveLease(temporary, record)
    fs.renameSync(temporary, filePath)
    fsyncDirectory(directory)
  } finally {
    const stat = lstatOrNull(temporary)
    if (stat !== null && stat.isFile() && !stat.isSymbolicLink()) fs.unlinkSync(temporary)
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function processGroupPresence(processGroupId: number): 'absent' | 'present' | 'unverifiable' {
  try {
    process.kill(-processGroupId, 0)
    return 'present'
  } catch (error) {
    if (systemCode(error) === 'ESRCH') return 'absent'
    if (systemCode(error) === 'EPERM') {
      const members = inspectOwnedProcessGroupMembers(processGroupId)
      return members === null ? 'unverifiable' : members.length === 0 ? 'absent' : 'present'
    }
    return 'unverifiable'
  }
}

function inspectOwnedProcessGroupMembers(processGroupId: number): number[] | null {
  const uid = currentUid()
  const result = spawnSync('/bin/ps', ['-axo', 'pid=,pgid=,uid=,state='], {
    encoding: 'utf8',
    env: { LANG: 'C', LC_ALL: 'C', PATH: '/usr/bin:/bin' },
    maxBuffer: 1024 * 1024,
    timeout: 2_000,
  })
  if (result.error !== undefined || result.signal !== null || result.status !== 0) return null
  const members: number[] = []
  for (const line of result.stdout.split('\n')) {
    const match = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s*$/.exec(line)
    if (match === null || Number(match[2]) !== processGroupId) continue
    if (Number(match[3]) !== uid) return null
    if ((match[4] as string).startsWith('Z')) continue
    members.push(Number(match[1]))
  }
  return members
}

function signalOwnedProcessGroup(processGroupId: number, signal: NodeJS.Signals): void {
  try {
    process.kill(-processGroupId, signal)
    return
  } catch (error) {
    if (systemCode(error) === 'ESRCH') return
    if (systemCode(error) !== 'EPERM') throw error
  }
  const members = inspectOwnedProcessGroupMembers(processGroupId)
  if (members === null) throw new Error(`Cannot verify process group ${String(processGroupId)}.`)
  for (const pid of members) {
    try {
      process.kill(pid, signal)
    } catch (error) {
      if (systemCode(error) !== 'ESRCH') throw error
    }
  }
}

async function waitForProcessGroupExit(
  reference: SupervisorProcessReference,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  do {
    const presence = processGroupPresence(reference.processGroupId)
    if (presence === 'absent') return true
    if (presence === 'unverifiable') {
      throw new Error(`Cannot verify stale ${reference.kind} process group.`)
    }
    await delay(50)
  } while (Date.now() < deadline)
  return false
}

async function terminateExactStaleChild(reference: SupervisorProcessReference): Promise<void> {
  const inspection = inspectProcessIncarnation(reference.pid)
  const groupPresence = processGroupPresence(reference.processGroupId)
  if (groupPresence === 'unverifiable') {
    throw new Error(`Cannot verify stale ${reference.kind} process group.`)
  }
  if (inspection.status === 'absent' && groupPresence === 'absent') return
  if (inspection.status === 'unverifiable') {
    throw new Error(`Cannot verify stale ${reference.kind} process ${String(reference.pid)}.`)
  }
  if (
    inspection.status === 'verified' &&
    inspection.incarnation !== reference.processIncarnation
  ) return
  if (reference.pid === process.pid || reference.processGroupId !== reference.pid) {
    throw new Error(`Refusing unsafe stale ${reference.kind} process cleanup.`)
  }
  signalOwnedProcessGroup(reference.processGroupId, 'SIGTERM')
  if (await waitForProcessGroupExit(reference, STALE_CHILD_TERM_TIMEOUT_MS)) return
  signalOwnedProcessGroup(reference.processGroupId, 'SIGKILL')
  if (!(await waitForProcessGroupExit(reference, STALE_CHILD_KILL_TIMEOUT_MS))) {
    throw new Error(`Stale ${reference.kind} process group did not stop.`)
  }
}

function createLaunchDirectoryName(startedAt: string, launchId: string): string {
  return `launch-${startedAt.replace(/[-:.]/g, '')}-${launchId}`
}

function directoryBytes(directoryPath: string): number {
  const directoryStat = fs.lstatSync(directoryPath)
  if (
    directoryStat.isSymbolicLink() ||
    !directoryStat.isDirectory() ||
    directoryStat.uid !== currentUid() ||
    (directoryStat.mode & 0o777) !== 0o700
  ) throw new Error(`Retained launch path is unsafe: ${directoryPath}`)
  let bytes = 0
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name)
    const stat = fs.lstatSync(entryPath)
    if (entry.isSymbolicLink() || !entry.isFile() || stat.uid !== currentUid()) {
      throw new Error(`Retained launch directory contains an unsafe entry: ${entryPath}`)
    }
    bytes += stat.size
  }
  return bytes
}

export function pruneRetainedLaunchDirectories(
  layout: SupervisorProfileLayout,
  currentLaunchDirectory: string,
): void {
  const entries = fs.readdirSync(layout.launchesRoot, { withFileTypes: true })
    .filter((entry) => LAUNCH_DIRECTORY_PATTERN.test(entry.name))
    .map((entry) => {
      if (entry.isSymbolicLink() || !entry.isDirectory()) {
        throw new Error(`Launch history entry is unsafe: ${entry.name}`)
      }
      const directoryPath = path.join(layout.launchesRoot, entry.name)
      return { name: entry.name, path: directoryPath, bytes: directoryBytes(directoryPath) }
    })
    .sort((left, right) => left.name.localeCompare(right.name))

  let totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0)
  let retainedCount = entries.length
  for (const entry of entries) {
    if (
      retainedCount <= MAX_RETAINED_LAUNCH_DIRECTORIES &&
      totalBytes <= MAX_RETAINED_LAUNCH_BYTES
    ) break
    if (entry.name === currentLaunchDirectory) continue
    fs.rmSync(entry.path, { recursive: true })
    totalBytes -= entry.bytes
    retainedCount--
  }
  fsyncDirectory(layout.launchesRoot)
  if (
    retainedCount > MAX_RETAINED_LAUNCH_DIRECTORIES ||
    totalBytes > MAX_RETAINED_LAUNCH_BYTES
  ) throw new Error('Supervisor launch-log retention bound could not be satisfied safely.')
}

export class SupervisorLease {
  readonly layout: SupervisorProfileLayout
  readonly launchDirectory: string
  readonly launchLeasePath: string

  private record: SupervisorLeaseRecord
  private released = false

  private constructor(
    layout: SupervisorProfileLayout,
    launchDirectory: string,
    record: SupervisorLeaseRecord,
    private ownerLock: ChildProcess | null,
  ) {
    this.layout = layout
    this.launchDirectory = launchDirectory
    this.launchLeasePath = path.join(launchDirectory, LAUNCH_LEASE_NAME)
    this.record = record
  }

  static async acquire(
    profileRoot: string,
    report: (message: string) => void = () => {},
  ): Promise<SupervisorLease> {
    const layout = prepareSupervisorProfile(profileRoot)
    const ownerLock = await acquireOwnerLock(layout)
    let ownerLockTransferred = false
    try {
    const incarnation = currentProcessIncarnation()
    if (incarnation === null) {
      throw new Error('Cannot verify the supervisor process incarnation; refusing to launch.')
    }
    const startedAt = new Date().toISOString()
    const launchId = randomUUID()
    const launchDirectoryName = createLaunchDirectoryName(startedAt, launchId)
    const record: SupervisorLeaseRecord = {
      version: SUPERVISOR_LEASE_VERSION,
      launchId,
      launchDirectory: launchDirectoryName,
      startedAt,
      phase: 'starting',
      supervisor: { pid: process.pid, processIncarnation: incarnation },
      engine: null,
      unity: null,
      fixedPort: null,
      engineRestarts: 0,
    }

    for (let attempt = 0; attempt < 8; attempt++) {
      let claimed = false
      try {
        writeExclusiveLease(layout.activeLeasePath, record)
        claimed = true
      } catch (error) {
        if (systemCode(error) !== 'EEXIST') throw error
      }
      if (claimed) {
        try {
        const launchDirectory = ensurePrivateDirectory(
          path.join(layout.launchesRoot, launchDirectoryName),
          'Current launch directory',
        )
        const lease = new SupervisorLease(layout, launchDirectory, record, ownerLock)
        writeExclusiveLease(lease.launchLeasePath, record)
        pruneRetainedLaunchDirectories(layout, launchDirectoryName)
        ownerLockTransferred = true
        return lease
        } catch (error) {
          const owned = readLease(layout.activeLeasePath)
          if (
            owned !== null &&
            owned.record.launchId === record.launchId &&
            owned.record.supervisor.pid === record.supervisor.pid &&
            owned.record.supervisor.processIncarnation === record.supervisor.processIncarnation
          ) {
            removeExactLeasePath(layout.activeLeasePath, owned.identity)
          }
          throw error
        }
      }

      let existing: ReadLease | null
      try {
        existing = readLease(layout.activeLeasePath)
      } catch (error) {
        if (recoverInterruptedLeasePublication(layout.activeLeasePath)) {
          report('recovered an interrupted active-lease publication')
          continue
        }
        throw error
      }
      if (existing === null) continue
      const ownerInspection = inspectProcessIncarnation(existing.record.supervisor.pid)
      if (ownerInspection.status === 'unverifiable') {
        throw new Error('The existing supervisor owner cannot be verified; refusing reclamation.')
      }
      if (
        ownerInspection.status === 'verified' &&
        ownerInspection.incarnation === existing.record.supervisor.processIncarnation
      ) {
        throw new Error(
          `Project: Studio is already supervised by process ${String(existing.record.supervisor.pid)}.`,
        )
      }

      report(`reclaiming stale launch ${existing.record.launchId}`)
      if (existing.record.unity !== null) await terminateExactStaleChild(existing.record.unity)
      if (existing.record.engine !== null) await terminateExactStaleChild(existing.record.engine)
      removeExactLeasePath(layout.activeLeasePath, existing.identity)
    }
    throw new Error('Supervisor lease changed repeatedly during acquisition.')
    } finally {
      if (!ownerLockTransferred) releaseOwnerLock(ownerLock)
    }
  }

  snapshot(): SupervisorLeaseRecord {
    return structuredClone(this.record)
  }

  update(update: Partial<Pick<
    SupervisorLeaseRecord,
    'engine' | 'engineRestarts' | 'fixedPort' | 'phase' | 'unity'
  >>): void {
    if (this.released) throw new Error('Supervisor lease is already released.')
    const next = { ...this.record, ...update }
    const owner = { ...this.record.supervisor, launchId: this.record.launchId }
    try {
      writeAtomicLease(this.layout.activeLeasePath, next, owner)
    } catch (error) {
      const persisted = readLease(this.layout.activeLeasePath)
      if (persisted !== null && canonicalJson(persisted.record) === canonicalJson(next)) {
        this.record = next
      }
      throw error
    }
    // The active lease is recovery authority; never retain older in-memory ownership
    // after its durable state advanced, even if the diagnostic launch copy fails.
    this.record = next
    writeAtomicLease(this.launchLeasePath, next)
  }

  release(): void {
    if (this.released) return
    const stopped: SupervisorLeaseRecord = {
      ...this.record,
      phase: 'stopped',
      engine: null,
      unity: null,
    }
    writeAtomicLease(this.launchLeasePath, stopped)
    const existing = readLease(this.layout.activeLeasePath)
    if (
      existing === null ||
      existing.record.launchId !== this.record.launchId ||
      existing.record.supervisor.pid !== this.record.supervisor.pid ||
      existing.record.supervisor.processIncarnation !== this.record.supervisor.processIncarnation
    ) throw new Error('Supervisor lease ownership changed during release.')
    if (!removeExactLeasePath(this.layout.activeLeasePath, existing.identity)) {
      throw new Error('Supervisor lease changed during release.')
    }
    if (this.ownerLock !== null) {
      releaseOwnerLock(this.ownerLock)
      this.ownerLock = null
    }
    this.record = stopped
    this.released = true
  }

  abandonOwnerLock(): void {
    if (this.ownerLock === null) return
    releaseOwnerLock(this.ownerLock)
    this.ownerLock = null
  }
}

export async function inspectSpawnedProcess(
  kind: SupervisorChildKind,
  pid: number,
  timeoutMs: number = 1_000,
): Promise<SupervisorProcessReference> {
  const deadline = Date.now() + timeoutMs
  do {
    const inspection = inspectProcessIncarnation(pid)
    if (inspection.status === 'verified') {
      return {
        kind,
        pid,
        processGroupId: pid,
        processIncarnation: inspection.incarnation,
      }
    }
    if (inspection.status === 'absent') {
      throw new Error(`${kind} process exited before its incarnation could be recorded.`)
    }
    await delay(25)
  } while (Date.now() < deadline)
  throw new Error(`Cannot verify the spawned ${kind} process incarnation.`)
}
