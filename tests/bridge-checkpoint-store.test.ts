import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  BridgeCheckpointStoreError,
  openBridgeCheckpointStore,
  type BridgeCheckpointStore,
} from '../bridge/runtime/checkpoint-store.ts'

const temporaryRoots: string[] = []
const openStores: BridgeCheckpointStore[] = []

function temporaryRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'project-studio-checkpoint-'))
  temporaryRoots.push(root)
  return root
}

function checkpointPath(root = temporaryRoot()): string {
  return path.join(root, 'runtime', 'bridge-checkpoint.json')
}

async function openStore(
  filePath: string,
  maxBytes?: number,
  runtimeRoot = path.dirname(filePath),
): Promise<BridgeCheckpointStore> {
  const store = await openBridgeCheckpointStore(
    filePath,
    maxBytes === undefined ? { runtimeRoot } : { runtimeRoot, maxBytes },
  )
  openStores.push(store)
  return store
}

function mode(filePath: string): number {
  return fs.statSync(filePath).mode & 0o777
}

function storeErrorCode(error: unknown): string | null {
  return error instanceof BridgeCheckpointStoreError ? error.code : null
}

afterEach(async () => {
  vi.restoreAllMocks()
  for (const store of openStores.splice(0).reverse()) {
    try {
      await store.close()
    } catch {
      // Ownership-tamper tests deliberately make normal release impossible.
    }
  }
  for (const root of temporaryRoots.splice(0).reverse()) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

describe('crash-safe bridge checkpoint store', () => {
  it('binds an exclusive private lock to the original live process incarnation', async () => {
    const filePath = checkpointPath()
    const first = await openStore(filePath)
    const lockPath = `${filePath}.lock`

    expect(mode(path.dirname(filePath))).toBe(0o700)
    expect(mode(lockPath)).toBe(0o600)
    await expect(openBridgeCheckpointStore(filePath, { runtimeRoot: path.dirname(filePath) }))
      .rejects.toMatchObject({ code: 'LOCK_HELD' })

    await first.close()
    await first.close()
    expect(fs.existsSync(lockPath)).toBe(false)

    const second = await openStore(filePath)
    await expect(second.read()).resolves.toBeNull()
  })

  it('rejects an existing non-private runtime root without mutating it', async () => {
    const root = temporaryRoot()
    const runtimeRoot = path.join(root, 'runtime')
    fs.mkdirSync(runtimeRoot, { mode: 0o755 })
    fs.chmodSync(runtimeRoot, 0o755)

    await expect(openBridgeCheckpointStore(
      path.join(runtimeRoot, 'bridge-checkpoint.json'),
      { runtimeRoot },
    )).rejects.toMatchObject({ code: 'INVALID_PATH' })

    expect(mode(runtimeRoot)).toBe(0o755)
    expect(fs.readdirSync(runtimeRoot)).toEqual([])
  })

  it('rejects the runtime root itself as the checkpoint without creating it', async () => {
    const root = temporaryRoot()
    const runtimeRoot = path.join(root, 'runtime')

    await expect(openBridgeCheckpointStore(runtimeRoot, { runtimeRoot }))
      .rejects.toMatchObject({ code: 'INVALID_PATH' })

    expect(fs.existsSync(runtimeRoot)).toBe(false)
  })

  it('rejects ancestor and child symlink escapes without mutating their targets', async () => {
    const root = temporaryRoot()
    const redirectedParent = path.join(root, 'redirected-parent')
    const ancestorAlias = path.join(root, 'ancestor-alias')
    fs.mkdirSync(redirectedParent, { mode: 0o700 })
    fs.chmodSync(redirectedParent, 0o700)
    fs.symlinkSync(redirectedParent, ancestorAlias)
    const escapedRoot = path.join(ancestorAlias, 'runtime')

    await expect(openBridgeCheckpointStore(
      path.join(escapedRoot, 'bridge-checkpoint.json'),
      { runtimeRoot: escapedRoot },
    )).rejects.toMatchObject({ code: 'SYMLINK' })
    expect(fs.readdirSync(redirectedParent)).toEqual([])
    expect(mode(redirectedParent)).toBe(0o700)

    const runtimeRoot = path.join(root, 'runtime')
    const childAlias = path.join(runtimeRoot, 'child-alias')
    fs.mkdirSync(runtimeRoot, { mode: 0o700 })
    fs.chmodSync(runtimeRoot, 0o700)
    fs.symlinkSync(redirectedParent, childAlias)

    await expect(openBridgeCheckpointStore(
      path.join(childAlias, 'bridge-checkpoint.json'),
      { runtimeRoot },
    )).rejects.toMatchObject({ code: 'INVALID_PATH' })
    expect(fs.readdirSync(redirectedParent)).toEqual([])
    expect(fs.readdirSync(runtimeRoot)).toEqual(['child-alias'])
  })

  it('reclaims a complete lock only after its recorded process is no longer alive', async () => {
    const filePath = checkpointPath()
    const lockPath = `${filePath}.lock`
    fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 })
    fs.chmodSync(path.dirname(filePath), 0o700)
    fs.writeFileSync(lockPath, JSON.stringify({
      version: 1,
      pid: 2_147_483_647,
      ownerToken: randomBytes(32).toString('base64url'),
      processIncarnation: 'test-dead-process-incarnation',
    }), { mode: 0o600 })

    const store = await openStore(filePath)
    const replacement = JSON.parse(fs.readFileSync(lockPath, 'utf8')) as {
      pid: number
      processIncarnation: string
    }
    expect(replacement.pid).toBe(process.pid)
    expect(replacement.processIncarnation).toMatch(/^(linux-proc|ps-lstart):/)
    await expect(store.read()).resolves.toBeNull()
  })

  it('reclaims a stale lock when its PID belongs to a different process incarnation', async () => {
    const filePath = checkpointPath()
    const lockPath = `${filePath}.lock`
    fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 })
    fs.chmodSync(path.dirname(filePath), 0o700)
    fs.writeFileSync(lockPath, JSON.stringify({
      version: 1,
      pid: process.pid,
      ownerToken: randomBytes(32).toString('base64url'),
      processIncarnation: 'test-stale-process-incarnation',
    }), { mode: 0o600 })

    const store = await openStore(filePath)
    const replacement = JSON.parse(fs.readFileSync(lockPath, 'utf8')) as {
      pid: number
      processIncarnation: string
    }
    expect(replacement.pid).toBe(process.pid)
    expect(replacement.processIncarnation).not.toBe('test-stale-process-incarnation')
    await expect(store.read()).resolves.toBeNull()
  })

  it('writes through a same-directory private temporary and fsyncs file and directory', async () => {
    const filePath = checkpointPath()
    const store = await openStore(filePath)
    const originalFsync = fs.fsyncSync.bind(fs)
    const fsyncKinds: string[] = []
    const fsyncSpy = vi.spyOn(fs, 'fsyncSync').mockImplementation((descriptor) => {
      fsyncKinds.push(fs.fstatSync(descriptor).isDirectory() ? 'directory' : 'file')
      originalFsync(descriptor)
    })
    const renameSpy = vi.spyOn(fs, 'renameSync')

    const text = JSON.stringify({ runtimeVersion: 1, title: 'The Reluctant Cornerstone' })
    await store.writeAtomic(text)

    expect(await store.read()).toBe(text)
    expect(mode(filePath)).toBe(0o600)
    expect(fsyncKinds).toContain('file')
    expect(fsyncKinds).toContain('directory')
    expect(fsyncSpy).toHaveBeenCalled()
    expect(renameSpy).toHaveBeenCalledTimes(1)
    const [temporary, destination] = renameSpy.mock.calls[0] as [string, string]
    expect(path.dirname(temporary)).toBe(path.dirname(destination))
    expect(destination).toBe(store.checkpointPath)
    expect(fs.readdirSync(path.dirname(filePath)).sort()).toEqual([
      'bridge-checkpoint.json',
      'bridge-checkpoint.json.lock',
    ])
  })

  it('bounds reads and preserves the previous checkpoint when a write is refused', async () => {
    const filePath = checkpointPath()
    const store = await openStore(filePath, 64)
    await store.writeAtomic('authoritative-v14')

    await expect(store.writeAtomic('x'.repeat(65))).rejects.toMatchObject({ code: 'TOO_LARGE' })
    expect(await store.read()).toBe('authoritative-v14')

    fs.writeFileSync(filePath, Buffer.alloc(65, 0x61))
    await expect(store.read()).rejects.toMatchObject({ code: 'TOO_LARGE' })
  })

  it('rejects invalid UTF-8 and checkpoint or lock symlinks without touching their targets', async () => {
    const root = temporaryRoot()
    const filePath = checkpointPath(root)
    const runtimeRoot = path.dirname(filePath)
    fs.mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 })
    fs.chmodSync(runtimeRoot, 0o700)
    const victim = path.join(root, 'victim.json')
    fs.writeFileSync(victim, 'untouched')
    fs.symlinkSync(victim, filePath)

    await expect(openBridgeCheckpointStore(filePath, { runtimeRoot }))
      .rejects.toMatchObject({ code: 'SYMLINK' })
    expect(fs.existsSync(`${filePath}.lock`)).toBe(false)
    expect(fs.readFileSync(victim, 'utf8')).toBe('untouched')

    fs.unlinkSync(filePath)
    const store = await openStore(filePath)
    fs.symlinkSync(victim, filePath)
    await expect(store.read()).rejects.toMatchObject({ code: 'SYMLINK' })
    await expect(store.writeAtomic('replacement')).rejects.toMatchObject({ code: 'SYMLINK' })
    expect(fs.readFileSync(victim, 'utf8')).toBe('untouched')

    fs.unlinkSync(filePath)
    fs.writeFileSync(filePath, Buffer.from([0xc3, 0x28]))
    await expect(store.read()).rejects.toMatchObject({ code: 'INVALID_UTF8' })
    await store.close()

    fs.unlinkSync(filePath)
    fs.symlinkSync(victim, `${filePath}.lock`)
    await expect(openBridgeCheckpointStore(filePath, { runtimeRoot }))
      .rejects.toMatchObject({ code: 'SYMLINK' })
    expect(fs.readFileSync(victim, 'utf8')).toBe('untouched')
  })

  it('rejects a symlink used as the checkpoint directory', async () => {
    const root = temporaryRoot()
    const realDirectory = path.join(root, 'real-runtime')
    const linkedDirectory = path.join(root, 'runtime')
    fs.mkdirSync(realDirectory, { mode: 0o755 })
    fs.chmodSync(realDirectory, 0o755)
    fs.symlinkSync(realDirectory, linkedDirectory)

    await expect(openBridgeCheckpointStore(
      path.join(linkedDirectory, 'checkpoint.json'),
      { runtimeRoot: linkedDirectory },
    ))
      .rejects.toMatchObject({ code: 'SYMLINK' })
    expect(mode(realDirectory)).toBe(0o755)
    expect(fs.readdirSync(realDirectory)).toEqual([])
  })

  it('restores the original if the directory durability barrier fails after rename', async () => {
    const filePath = checkpointPath()
    const store = await openStore(filePath)
    await store.writeAtomic('original')

    const originalFsync = fs.fsyncSync.bind(fs)
    let directoryFsyncs = 0
    vi.spyOn(fs, 'fsyncSync').mockImplementation((descriptor) => {
      if (fs.fstatSync(descriptor).isDirectory()) {
        directoryFsyncs++
        if (directoryFsyncs === 2) throw new Error('injected directory fsync failure')
      }
      originalFsync(descriptor)
    })

    await expect(store.writeAtomic('replacement')).rejects.toThrow('injected directory fsync failure')
    vi.restoreAllMocks()
    expect(await store.read()).toBe('original')
  })

  it('refuses to release a lock whose ownership token was replaced', async () => {
    const filePath = checkpointPath()
    const store = await openStore(filePath)
    const lockPath = `${filePath}.lock`
    const forged = {
      ...(JSON.parse(fs.readFileSync(lockPath, 'utf8')) as Record<string, unknown>),
      ownerToken: randomBytes(32).toString('base64url'),
    }
    fs.writeFileSync(lockPath, JSON.stringify(forged), { mode: 0o600 })

    await expect(store.close()).rejects.toSatisfy(
      (error: unknown) => storeErrorCode(error) === 'LOCK_OWNERSHIP',
    )
    expect(fs.existsSync(lockPath)).toBe(true)
  })
})
