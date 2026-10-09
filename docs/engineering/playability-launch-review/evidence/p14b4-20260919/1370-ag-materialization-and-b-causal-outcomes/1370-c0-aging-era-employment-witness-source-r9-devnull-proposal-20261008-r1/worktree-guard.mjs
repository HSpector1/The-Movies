import { createHash } from 'node:crypto'
import { closeSync, constants, fstatSync, lstatSync, openSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const fail = name => { throw new Error(`STOP_${name}`) }
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const blobOid = bytes => createHash('sha1')
  .update(`blob ${bytes.length}\0`, 'utf8').update(bytes).digest('hex')

/** Check the actual checkout bytes, even when Git status hides skip-worktree changes. */
export function worktreeFile(root, path, blob, expectedSha256) {
  const target = join(root, path)
  const beforePath = lstatSync(target)
  if (!beforePath.isFile() || beforePath.isSymbolicLink() || beforePath.nlink !== 1 ||
      beforePath.size > 8 * 1024 * 1024 || !constants.O_NOFOLLOW) fail('WORKTREE_KIND')
  let fd
  try {
    fd = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW)
    const beforeFd = fstatSync(fd)
    if (!beforeFd.isFile() || beforeFd.dev !== beforePath.dev || beforeFd.ino !== beforePath.ino ||
        beforeFd.size !== beforePath.size || beforeFd.mtimeMs !== beforePath.mtimeMs ||
        beforeFd.ctimeMs !== beforePath.ctimeMs) fail('WORKTREE_OPEN_RACE')
    const bytes = readFileSync(fd)
    const afterFd = fstatSync(fd)
    const afterPath = lstatSync(target)
    if (!afterPath.isFile() || afterPath.isSymbolicLink() ||
        afterFd.dev !== beforeFd.dev || afterFd.ino !== beforeFd.ino ||
        afterFd.size !== beforeFd.size || afterFd.mtimeMs !== beforeFd.mtimeMs ||
        afterFd.ctimeMs !== beforeFd.ctimeMs ||
        afterPath.dev !== beforePath.dev || afterPath.ino !== beforePath.ino ||
        afterPath.size !== beforePath.size || afterPath.mtimeMs !== beforePath.mtimeMs ||
        afterPath.ctimeMs !== beforePath.ctimeMs || bytes.length !== beforeFd.size) fail('WORKTREE_READ_RACE')
    if (blobOid(bytes) !== blob || !bytes.equals(execFileSync('git', ['cat-file', 'blob', blob], {
      cwd: root, timeout: 15_000, maxBuffer: 8 * 1024 * 1024,
    })) || sha(bytes) !== expectedSha256) fail('WORKTREE_BYTES')
    return sha(bytes)
  } finally {
    if (fd !== undefined) closeSync(fd)
  }
}
