// Strict CLI for the deterministic Week-208 roster-wall observatory.

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertRosterWallAcceptedArtifactsByteIdentical,
  validateRosterWallRunName,
  verifyRosterWallAcceptedArtifactDirectory,
} from './roster-wall/artifacts.js'
import type { RosterWallArtifactProfile } from './roster-wall/artifacts.js'
import { generateRosterWallCorpus } from './roster-wall/corpus.js'
import { discoverRosterWallRepoRoot } from './roster-wall/provenance.js'

export type RosterWallCliCommand =
  | { command: 'generate'; profile: RosterWallArtifactProfile; runName: string }
  | { command: 'verify'; runName: string }
  | { command: 'compare'; leftRunName: string; rightRunName: string }

function flagMap(argv: readonly string[], allowed: ReadonlySet<string>): Map<string, string> {
  const result = new Map<string, string>()
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index]!
    if (!flag.startsWith('--')) {
      throw new Error(`run-roster-wall-observatory: unexpected positional argument ${JSON.stringify(flag)}`)
    }
    if (!allowed.has(flag)) {
      throw new Error(`run-roster-wall-observatory: unknown flag ${JSON.stringify(flag)}`)
    }
    if (result.has(flag)) {
      throw new Error(`run-roster-wall-observatory: duplicate flag ${JSON.stringify(flag)}`)
    }
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`run-roster-wall-observatory: ${flag} requires a value`)
    }
    result.set(flag, value)
    index++
  }
  return result
}

function required(values: ReadonlyMap<string, string>, flag: string): string {
  const value = values.get(flag)
  if (value === undefined) {
    throw new Error(`run-roster-wall-observatory: ${flag} is required`)
  }
  return value
}

/** Unknown subcommands, flags, duplicates, positionals, and omitted values fail. */
export function parseRosterWallArgs(argv: readonly string[]): RosterWallCliCommand {
  const [command, ...rest] = argv
  if (command === undefined || command.startsWith('--')) {
    throw new Error('run-roster-wall-observatory: expected generate, verify, or compare')
  }
  if (command === 'generate') {
    const values = flagMap(rest, new Set(['--profile', '--run-name']))
    const profile = required(values, '--profile')
    if (profile !== 'smoke' && profile !== 'complete') {
      throw new Error('run-roster-wall-observatory: --profile must be smoke or complete')
    }
    return {
      command,
      profile,
      runName: validateRosterWallRunName(required(values, '--run-name')),
    }
  }
  if (command === 'verify') {
    const values = flagMap(rest, new Set(['--run-name']))
    return {
      command,
      runName: validateRosterWallRunName(required(values, '--run-name')),
    }
  }
  if (command === 'compare') {
    const values = flagMap(rest, new Set(['--left', '--right']))
    const leftRunName = validateRosterWallRunName(required(values, '--left'))
    const rightRunName = validateRosterWallRunName(required(values, '--right'))
    if (leftRunName === rightRunName) {
      throw new Error('run-roster-wall-observatory: compare requires two distinct runs')
    }
    return { command, leftRunName, rightRunName }
  }
  throw new Error(`run-roster-wall-observatory: unknown command ${JSON.stringify(command)}`)
}

export type RosterWallCliResult = {
  command: RosterWallCliCommand['command']
  byteIdentical: boolean | null
  runNames: string[]
  profile: RosterWallArtifactProfile | null
  files: number
  rows: number
  entries: number
}

export function runRosterWallCli(
  argv: readonly string[],
  repoRoot = discoverRosterWallRepoRoot(),
): RosterWallCliResult {
  const command = parseRosterWallArgs(argv)
  if (command.command === 'generate') {
    const result = generateRosterWallCorpus({
      repoRoot,
      runName: command.runName,
      profile: command.profile,
    })
    return {
      command: 'generate',
      byteIdentical: null,
      runNames: [command.runName],
      profile: result.profile,
      files: result.files.length,
      rows: result.rowCount,
      entries: result.entryCount,
    }
  }
  if (command.command === 'verify') {
    const result = verifyRosterWallAcceptedArtifactDirectory(repoRoot, command.runName)
    return {
      command: 'verify',
      byteIdentical: null,
      runNames: [command.runName],
      profile: result.profile,
      files: result.files.length,
      rows: result.rowCount,
      entries: result.entryCount,
    }
  }
  const comparison = assertRosterWallAcceptedArtifactsByteIdentical(
    repoRoot,
    command.leftRunName,
    command.rightRunName,
  )
  return {
    command: 'compare',
    byteIdentical: comparison.byteIdentical,
    runNames: [command.leftRunName, command.rightRunName],
    profile: comparison.left.profile,
    files: comparison.left.files.length,
    rows: comparison.left.rowCount,
    entries: comparison.left.entryCount,
  }
}

const invokedPath = process.argv[1] === undefined ? null : resolve(process.argv[1])
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = runRosterWallCli(process.argv.slice(2))
  process.stderr.write(`${JSON.stringify(result)}\n`)
}
