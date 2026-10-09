// Deterministic source identity for durable D-17B evidence artifacts.
// Analysis-only: production code never imports this module.

import { execFileSync } from 'node:child_process'

function git(args: readonly string[]): string {
  return execFileSync('git', [...args], { encoding: 'utf8' }).trim()
}

export type SourceProvenance = {
  sourceCommit: string
  sourceTree: string
  worktreeDirty: boolean
  runtime: string
}

/**
 * Stamp the executable source, not an output timestamp. Final evidence is required to have
 * `worktreeDirty: false`; emitting the flag makes an accidental pre-commit run self-invalidating.
 */
export function sourceProvenance(): SourceProvenance {
  return {
    sourceCommit: git(['rev-parse', 'HEAD']),
    sourceTree: git(['rev-parse', 'HEAD^{tree}']),
    worktreeDirty: git(['status', '--porcelain', '--untracked-files=no']) !== '',
    runtime: `node ${process.version}`,
  }
}
