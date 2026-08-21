import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { TextDecoder } from 'node:util'

import {
  boundedProcessIncarnation,
  inspectProcessIncarnation,
} from './process-incarnation.ts'

export const DEFAULT_BRIDGE_CHECKPOINT_MAX_BYTES = 32 * 1024 * 1024

const LOCK_VERSION = 1
const MAX_LOCK_BYTES = 4 * 1024
const LOCK_ACQUIRE_ATTEMPTS = 8

export type BridgeCheckpointStoreErrorCode =
  | 'CLOSED'
  | 'FILE_CHANGED'
  | 'INVALID_PATH'
  | 'INVALID_UTF8'
  | 'LOCK_CORRUPT'
  | 'LOCK_HELD'
  | 'LOCK_OWNERSHIP'
  | 'NOT_REGULAR_FILE'
  | 'SYMLINK'
  | 'TOO_LARGE'

export class BridgeCheckpointStoreError extends Error {
  readonly code: BridgeCheckpointStoreErrorCode

  constructor(code: BridgeCheckpointStoreErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'BridgeCheckpointStoreError'
    this.code = code
  }
}

export type BridgeCheckpointStoreOptions = {
  runtimeRoot: string
  maxBytes?: number
}

export interface BridgeCheckpointStore {
  readonly checkpointPath: string
  read(): Promise<string | null>
  writeAtomic(text: string): Promise<void>
  close(): Promise<void>
}

type LockRecord = {
  version: 1
  pid: number
  ownerToken: string
  processIncarnation: string
}

type FileIdentity = {
  dev: number
  ino: number
  size: number
  mtimeMs: number
}

type BoundedFile = {
  bytes: Buffer
  identity: FileIdentity
}

type RuntimeLayout = {
  checkpointPath: string
  runtimeRoot: string
}

function systemCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException | null)?.code
}

function identityOf(stat: fs.Stats): FileIdentity {
  return {
    dev: stat.dev,
    ino: stat.ino,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
  }
}

function sameIdentity(left: FileIdentity, right: FileIdentity): boolean {
  return left.dev === right.dev &&
    left.ino === right.ino &&
    left.size === right.size &&
    left.mtimeMs === right.mtimeMs
}

function noFollowFlag(): number {
  return fs.constants.O_NOFOLLOW ?? 0
}

function directoryFlag(): number {
  return fs.constants.O_DIRECTORY ?? 0
}

function lstatOrNull(filePath: string): fs.Stats | null {
  try {
    return fs.lstatSync(filePath)
  } catch (error) {
    if (systemCode(error) === 'ENOENT') return null
    throw error
  }
}

function assertRegularFile(filePath: string, stat: fs.Stats, label: string): void {
  if (stat.isSymbolicLink()) {
    throw new BridgeCheckpointStoreError('SYMLINK', `${label} must not be a symbolic link: ${filePath}`)
  }
  if (!stat.isFile()) {
    throw new BridgeCheckpointStoreError('NOT_REGULAR_FILE', `${label} must be a regular file: ${filePath}`)
  }
}

function assertWithinBound(size: number, maxBytes: number, label: string): void {
  if (size > maxBytes) {
    throw new BridgeCheckpointStoreError(
      'TOO_LARGE',
      `${label} is ${String(size)} bytes; the maximum is ${String(maxBytes)} bytes.`,
    )
  }
}

function readBoundedRegularFile(
  filePath: string,
  maxBytes: number,
  label: string,
): BoundedFile | null {
  const before = lstatOrNull(filePath)
  if (before === null) return null
  assertRegularFile(filePath, before, label)
  assertWithinBound(before.size, maxBytes, label)

  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | noFollowFlag())
    const opened = fs.fstatSync(descriptor)
    assertRegularFile(filePath, opened, label)
    const beforeIdentity = identityOf(before)
    const openedIdentity = identityOf(opened)
    if (!sameIdentity(beforeIdentity, openedIdentity)) {
      throw new BridgeCheckpointStoreError('FILE_CHANGED', `${label} changed while it was being opened.`)
    }
    assertWithinBound(opened.size, maxBytes, label)

    const bytes = fs.readFileSync(descriptor)
    assertWithinBound(bytes.length, maxBytes, label)
    const afterIdentity = identityOf(fs.fstatSync(descriptor))
    if (!sameIdentity(openedIdentity, afterIdentity) || bytes.length !== afterIdentity.size) {
      throw new BridgeCheckpointStoreError('FILE_CHANGED', `${label} changed while it was being read.`)
    }
    return { bytes, identity: afterIdentity }
  } catch (error) {
    if (systemCode(error) === 'ELOOP') {
      throw new BridgeCheckpointStoreError('SYMLINK', `${label} must not be a symbolic link: ${filePath}`, error)
    }
    throw error
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor)
  }
}

function decodeUtf8(bytes: Uint8Array, label: string): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch (error) {
    throw new BridgeCheckpointStoreError('INVALID_UTF8', `${label} is not valid UTF-8.`, error)
  }
}

function currentUid(): number {
  if (typeof process.getuid !== 'function') {
    throw new BridgeCheckpointStoreError(
      'INVALID_PATH',
      'Bridge checkpoint storage requires a POSIX process owner identity.',
    )
  }
  return process.getuid()
}

function assertPrivateRuntimeRoot(runtimeRoot: string, stat: fs.Stats): void {
  if (stat.isSymbolicLink()) {
    throw new BridgeCheckpointStoreError(
      'SYMLINK',
      `Bridge runtime root must not be a symbolic link: ${runtimeRoot}`,
    )
  }
  if (!stat.isDirectory()) {
    throw new BridgeCheckpointStoreError(
      'INVALID_PATH',
      `Bridge runtime root must be a directory: ${runtimeRoot}`,
    )
  }
  if (stat.uid !== currentUid()) {
    throw new BridgeCheckpointStoreError(
      'INVALID_PATH',
      `Bridge runtime root must be owned by the current user: ${runtimeRoot}`,
    )
  }
  const permissions = stat.mode & 0o777
  if (permissions !== 0o700) {
    throw new BridgeCheckpointStoreError(
      'INVALID_PATH',
      `Bridge runtime root must already have mode 0700; found ${permissions.toString(8).padStart(4, '0')}: ${runtimeRoot}`,
    )
  }
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

function canonicalExistingPath(filePath: string, label: string): string {
  let canonical: string
  try {
    canonical = fs.realpathSync.native(filePath)
  } catch (error) {
    throw new BridgeCheckpointStoreError(
      'INVALID_PATH',
      `${label} must already exist: ${filePath}`,
      error,
    )
  }
  if (canonical !== platformCanonicalPath(filePath)) {
    throw new BridgeCheckpointStoreError(
      'SYMLINK',
      `${label} must not traverse a symbolic-link ancestor: ${filePath}`,
    )
  }
  return canonical
}

function ensurePrivateRuntimeRoot(configuredRoot: string): string {
  const existing = lstatOrNull(configuredRoot)
  if (existing !== null) {
    assertPrivateRuntimeRoot(configuredRoot, existing)
    return canonicalExistingPath(configuredRoot, 'Bridge runtime root')
  }

  const configuredParent = path.dirname(configuredRoot)
  const basename = path.basename(configuredRoot)
  const canonicalParent = canonicalExistingPath(configuredParent, 'Bridge runtime root parent')
  const parentStat = fs.lstatSync(canonicalParent)
  if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) {
    throw new BridgeCheckpointStoreError(
      'INVALID_PATH',
      `Bridge runtime root parent must be a directory: ${configuredParent}`,
    )
  }
  const canonicalRoot = path.join(canonicalParent, basename)
  let created = false
  try {
    fs.mkdirSync(canonicalRoot, { mode: 0o700 })
    created = true
  } catch (error) {
    if (systemCode(error) !== 'EEXIST') throw error
  }

  const rootStat = fs.lstatSync(canonicalRoot)
  if (created) {
    fs.chmodSync(canonicalRoot, 0o700)
    const secured = fs.lstatSync(canonicalRoot)
    if (!sameIdentity(identityOf(rootStat), identityOf(secured))) {
      throw new BridgeCheckpointStoreError(
        'FILE_CHANGED',
        `Bridge runtime root changed while it was being secured: ${canonicalRoot}`,
      )
    }
    assertPrivateRuntimeRoot(canonicalRoot, secured)
    fsyncDirectory(canonicalParent)
  } else {
    assertPrivateRuntimeRoot(canonicalRoot, rootStat)
  }
  return canonicalRoot
}

function prepareRuntimeLayout(checkpointPath: string, runtimeRoot: string): RuntimeLayout {
  if (checkpointPath.trim().length === 0) {
    throw new BridgeCheckpointStoreError('INVALID_PATH', 'Bridge checkpoint path is required.')
  }
  if (runtimeRoot.trim().length === 0) {
    throw new BridgeCheckpointStoreError('INVALID_PATH', 'Bridge runtime root is required.')
  }
  const configuredRoot = path.resolve(runtimeRoot)
  if (configuredRoot === path.parse(configuredRoot).root) {
    throw new BridgeCheckpointStoreError('INVALID_PATH', 'Filesystem root cannot be the bridge runtime root.')
  }
  const configuredCheckpoint = path.resolve(checkpointPath)
  if (
    configuredCheckpoint === configuredRoot ||
    path.dirname(configuredCheckpoint) !== configuredRoot
  ) {
    throw new BridgeCheckpointStoreError(
      'INVALID_PATH',
      'Bridge checkpoint must be a direct child of the configured runtime root.',
    )
  }

  const canonicalRoot = ensurePrivateRuntimeRoot(configuredRoot)
  const canonicalCheckpoint = path.join(canonicalRoot, path.basename(configuredCheckpoint))
  const checkpointStat = lstatOrNull(canonicalCheckpoint)
  if (checkpointStat !== null) assertRegularFile(canonicalCheckpoint, checkpointStat, 'Bridge checkpoint')
  return { checkpointPath: canonicalCheckpoint, runtimeRoot: canonicalRoot }
}

function fsyncDirectory(directoryPath: string): void {
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(
      directoryPath,
      fs.constants.O_RDONLY | directoryFlag() | noFollowFlag(),
    )
    const stat = fs.fstatSync(descriptor)
    if (!stat.isDirectory()) {
      throw new BridgeCheckpointStoreError(
        'INVALID_PATH',
        `Checkpoint parent stopped being a directory: ${directoryPath}`,
      )
    }
    fs.fsyncSync(descriptor)
  } catch (error) {
    if (systemCode(error) === 'ELOOP') {
      throw new BridgeCheckpointStoreError(
        'SYMLINK',
        `Checkpoint directory must not be a symbolic link: ${directoryPath}`,
        error,
      )
    }
    throw error
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor)
  }
}

function privateUniquePath(directoryPath: string, basename: string, purpose: string): string {
  const nonce = randomBytes(18).toString('base64url')
  return path.join(directoryPath, `.${basename}.${purpose}-${String(process.pid)}-${nonce}`)
}

function writeNewPrivateFile(filePath: string, bytes: Uint8Array): void {
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(
      filePath,
      fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY | noFollowFlag(),
      0o600,
    )
    fs.fchmodSync(descriptor, 0o600)
    fs.writeFileSync(descriptor, bytes)
    fs.fsyncSync(descriptor)
  } catch (error) {
    if (systemCode(error) === 'ELOOP') {
      throw new BridgeCheckpointStoreError(
        'SYMLINK',
        `Private checkpoint file must not be a symbolic link: ${filePath}`,
        error,
      )
    }
    throw error
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor)
  }
}

function unlinkOwnedTemporary(filePath: string): void {
  const stat = lstatOrNull(filePath)
  if (stat === null) return
  if (stat.isSymbolicLink() || !stat.isFile()) return
  fs.unlinkSync(filePath)
}

function serializeLock(record: LockRecord): Buffer {
  return Buffer.from(JSON.stringify(record), 'utf8')
}

function parseLock(file: BoundedFile, lockPath: string): LockRecord {
  let value: unknown
  try {
    value = JSON.parse(decodeUtf8(file.bytes, 'Bridge checkpoint lock')) as unknown
  } catch (error) {
    if (error instanceof BridgeCheckpointStoreError) throw error
    throw new BridgeCheckpointStoreError('LOCK_CORRUPT', `Bridge checkpoint lock is not JSON: ${lockPath}`, error)
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new BridgeCheckpointStoreError('LOCK_CORRUPT', `Bridge checkpoint lock is malformed: ${lockPath}`)
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  if (
    keys.join('\0') !== ['ownerToken', 'pid', 'processIncarnation', 'version'].join('\0') ||
    record.version !== LOCK_VERSION ||
    !Number.isSafeInteger(record.pid) ||
    (record.pid as number) <= 0 ||
    typeof record.ownerToken !== 'string' ||
    !/^[A-Za-z0-9_-]{32,}$/.test(record.ownerToken) ||
    typeof record.processIncarnation !== 'string' ||
    boundedProcessIncarnation(record.processIncarnation) !== record.processIncarnation
  ) {
    throw new BridgeCheckpointStoreError('LOCK_CORRUPT', `Bridge checkpoint lock is malformed: ${lockPath}`)
  }
  return {
    version: LOCK_VERSION,
    pid: record.pid as number,
    ownerToken: record.ownerToken,
    processIncarnation: record.processIncarnation,
  }
}

function readLock(lockPath: string): { record: LockRecord; identity: FileIdentity } | null {
  const file = readBoundedRegularFile(lockPath, MAX_LOCK_BYTES, 'Bridge checkpoint lock')
  return file === null ? null : { record: parseLock(file, lockPath), identity: file.identity }
}

function matchesPathIdentity(filePath: string, expected: FileIdentity): boolean {
  const stat = lstatOrNull(filePath)
  if (stat === null || stat.isSymbolicLink() || !stat.isFile()) return false
  return sameIdentity(identityOf(stat), expected)
}

class LockedBridgeCheckpointStore implements BridgeCheckpointStore {
  readonly checkpointPath: string
  private readonly directoryPath: string
  private readonly basename: string
  private readonly lockPath: string
  private readonly maxBytes: number
  private owner: LockRecord | null = null

  constructor(layout: RuntimeLayout, maxBytes: number) {
    this.checkpointPath = layout.checkpointPath
    this.directoryPath = layout.runtimeRoot
    this.basename = path.basename(this.checkpointPath)
    this.lockPath = `${this.checkpointPath}.lock`
    this.maxBytes = maxBytes
  }

  open(): void {
    const processInspection = inspectProcessIncarnation(process.pid)
    if (processInspection.status !== 'verified') {
      throw new BridgeCheckpointStoreError(
        'LOCK_OWNERSHIP',
        'The bridge could not verify its own process incarnation; refusing to create a checkpoint lock.',
      )
    }
    const owner: LockRecord = {
      version: LOCK_VERSION,
      pid: process.pid,
      ownerToken: randomBytes(32).toString('base64url'),
      processIncarnation: processInspection.incarnation,
    }
    const candidatePath = privateUniquePath(this.directoryPath, this.basename, 'lock-candidate')
    writeNewPrivateFile(candidatePath, serializeLock(owner))
    let claimed = false
    try {
      for (let attempt = 0; attempt < LOCK_ACQUIRE_ATTEMPTS; attempt++) {
        try {
          fs.linkSync(candidatePath, this.lockPath)
          claimed = true
          fsyncDirectory(this.directoryPath)
          this.owner = owner
          return
        } catch (error) {
          if (systemCode(error) !== 'EEXIST') throw error
        }

        const existing = readLock(this.lockPath)
        if (existing === null) continue
        const existingProcess = inspectProcessIncarnation(existing.record.pid)
        if (existingProcess.status === 'unverifiable') {
          throw new BridgeCheckpointStoreError(
            'LOCK_HELD',
            `Bridge checkpoint owner process ${String(existing.record.pid)} could not be verified; refusing unsafe lock reclamation.`,
          )
        }
        if (
          existingProcess.status === 'verified' &&
          existingProcess.incarnation === existing.record.processIncarnation
        ) {
          throw new BridgeCheckpointStoreError(
            'LOCK_HELD',
            `Bridge checkpoint is already owned by live process ${String(existing.record.pid)}.`,
          )
        }
        if (!matchesPathIdentity(this.lockPath, existing.identity)) continue
        fs.unlinkSync(this.lockPath)
        fsyncDirectory(this.directoryPath)
      }
      throw new BridgeCheckpointStoreError(
        'LOCK_HELD',
        'Bridge checkpoint lock changed repeatedly during acquisition.',
      )
    } catch (error) {
      if (claimed) {
        try {
          const existing = readLock(this.lockPath)
          if (existing?.record.ownerToken === owner.ownerToken) {
            fs.unlinkSync(this.lockPath)
            fsyncDirectory(this.directoryPath)
          }
        } catch {
          // Preserve the original acquisition error; the ownership token prevents unsafe cleanup.
        }
      }
      throw error
    } finally {
      try {
        unlinkOwnedTemporary(candidatePath)
        fsyncDirectory(this.directoryPath)
      } catch {
        // A complete lock never depends on the candidate hard link after acquisition.
      }
    }
  }

  async read(): Promise<string | null> {
    this.assertOwnership()
    const file = readBoundedRegularFile(this.checkpointPath, this.maxBytes, 'Bridge checkpoint')
    return file === null ? null : decodeUtf8(file.bytes, 'Bridge checkpoint')
  }

  async writeAtomic(text: string): Promise<void> {
    this.assertOwnership()
    const bytes = Buffer.from(text, 'utf8')
    assertWithinBound(bytes.length, this.maxBytes, 'Bridge checkpoint')
    decodeUtf8(bytes, 'Bridge checkpoint')
    this.replaceAtomically(bytes)
  }

  async close(): Promise<void> {
    const owner = this.owner
    if (owner === null) return
    const existing = readLock(this.lockPath)
    if (
      existing === null ||
      existing.record.pid !== owner.pid ||
      existing.record.ownerToken !== owner.ownerToken ||
      existing.record.processIncarnation !== owner.processIncarnation ||
      !matchesPathIdentity(this.lockPath, existing.identity)
    ) {
      throw new BridgeCheckpointStoreError(
        'LOCK_OWNERSHIP',
        'Bridge checkpoint lock ownership changed; refusing to remove it.',
      )
    }
    fs.unlinkSync(this.lockPath)
    this.owner = null
    fsyncDirectory(this.directoryPath)
  }

  private assertOwnership(): LockRecord {
    const owner = this.owner
    if (owner === null) {
      throw new BridgeCheckpointStoreError('CLOSED', 'Bridge checkpoint store is closed.')
    }
    const existing = readLock(this.lockPath)
    if (
      existing === null ||
      existing.record.pid !== owner.pid ||
      existing.record.ownerToken !== owner.ownerToken ||
      existing.record.processIncarnation !== owner.processIncarnation ||
      !matchesPathIdentity(this.lockPath, existing.identity)
    ) {
      throw new BridgeCheckpointStoreError(
        'LOCK_OWNERSHIP',
        'Bridge checkpoint lock ownership changed.',
      )
    }
    return owner
  }

  private replaceAtomically(bytes: Uint8Array): void {
    const original = lstatOrNull(this.checkpointPath)
    if (original !== null) assertRegularFile(this.checkpointPath, original, 'Bridge checkpoint')
    const originalIdentity = original === null ? null : identityOf(original)
    const temporaryPath = privateUniquePath(this.directoryPath, this.basename, 'write')
    const backupPath = privateUniquePath(this.directoryPath, this.basename, 'previous')
    let backupCreated = false
    let committed = false

    try {
      writeNewPrivateFile(temporaryPath, bytes)
      this.assertOwnership()

      const beforeCommit = lstatOrNull(this.checkpointPath)
      if (
        (originalIdentity === null && beforeCommit !== null) ||
        (originalIdentity !== null &&
          (beforeCommit === null ||
            beforeCommit.isSymbolicLink() ||
            !beforeCommit.isFile() ||
            !sameIdentity(originalIdentity, identityOf(beforeCommit))))
      ) {
        throw new BridgeCheckpointStoreError('FILE_CHANGED', 'Bridge checkpoint changed before commit.')
      }

      if (originalIdentity !== null) {
        fs.linkSync(this.checkpointPath, backupPath)
        backupCreated = true
        fsyncDirectory(this.directoryPath)
      }

      fs.renameSync(temporaryPath, this.checkpointPath)
      committed = true
      fsyncDirectory(this.directoryPath)
    } catch (error) {
      if (committed) {
        try {
          if (backupCreated) {
            fs.renameSync(backupPath, this.checkpointPath)
            backupCreated = false
          } else {
            const replacement = lstatOrNull(this.checkpointPath)
            if (replacement !== null && replacement.isFile() && !replacement.isSymbolicLink()) {
              fs.unlinkSync(this.checkpointPath)
            }
          }
          fsyncDirectory(this.directoryPath)
        } catch (restoreError) {
          throw new BridgeCheckpointStoreError(
            'FILE_CHANGED',
            'Checkpoint commit failed and the original could not be restored.',
            restoreError,
          )
        }
      }
      throw error
    } finally {
      try {
        unlinkOwnedTemporary(temporaryPath)
      } catch {
        // A unique incomplete temporary is never treated as a checkpoint.
      }
      if (backupCreated) {
        try {
          unlinkOwnedTemporary(backupPath)
          fsyncDirectory(this.directoryPath)
        } catch {
          // The committed checkpoint is already durable; an orphaned hard link is harmless.
        }
      }
    }
  }
}

export async function openBridgeCheckpointStore(
  checkpointPath: string,
  options: BridgeCheckpointStoreOptions,
): Promise<BridgeCheckpointStore> {
  const maxBytes = options.maxBytes ?? DEFAULT_BRIDGE_CHECKPOINT_MAX_BYTES
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new BridgeCheckpointStoreError('INVALID_PATH', 'Bridge checkpoint maxBytes must be a positive integer.')
  }
  const layout = prepareRuntimeLayout(checkpointPath, options.runtimeRoot)
  const store = new LockedBridgeCheckpointStore(layout, maxBytes)
  store.open()
  return store
}
