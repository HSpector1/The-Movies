#!/usr/bin/env node

import { resolve } from 'node:path'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  Cf09VerificationError,
  CURRENT_ACCEPTED_SAVE_VERSION,
  canonicalJson,
  createAttestation,
  verifyAttestation,
  verifyContractPair,
  verificationReport,
  writeCanonicalJsonAtomic,
  writeCanonicalJsonExclusive,
  type ContractPairRequest,
} from './bridge-contract-consumer-lock.ts'

interface CliOptions {
  readonly operation: 'verify' | 'attest' | 'verify-attestation'
  readonly typescriptRoot: string
  readonly typescriptCommit?: string | undefined
  readonly typescriptRef?: string | undefined
  readonly typescriptRemote?: string | undefined
  readonly unityRoot: string
  readonly unityCommit?: string | undefined
  readonly unityRef?: string | undefined
  readonly unityRemote?: string | undefined
  readonly verificationReport?: string | undefined
  readonly attestationOutput?: string | undefined
  readonly attestationPath?: string | undefined
  readonly editModeResult?: string | undefined
  readonly editModeLog?: string | undefined
  readonly evidenceRoot?: string | undefined
  readonly saveVersion: number
}

const VALUE_OPTIONS = new Set([
  '--typescript-root',
  '--typescript-commit',
  '--typescript-ref',
  '--typescript-remote',
  '--unity-root',
  '--unity-commit',
  '--unity-ref',
  '--unity-remote',
  '--verification-report',
  '--attestation-output',
  '--verify-attestation',
  '--editmode-result',
  '--editmode-log',
  '--evidence-root',
  '--save-version',
])

function usage(): string {
  return [
    'Seal verification:',
    '  vite-node scripts/verify-bridge-contract-consumer.ts --verify-only',
    '    --typescript-root <root> --typescript-commit <sha> --typescript-ref <refs/heads/...>',
    '    --unity-root <root> --unity-commit <sha> --unity-ref <refs/heads/...>',
    '    [--typescript-remote <name>] [--unity-remote <name>]',
    '    [--verification-report <external-path>]',
    '',
    'Attestation emission (after the authorized Unity pass):',
    '  ...same sealed arguments... --attestation-output <external-path>',
    '    --editmode-result <contract-gate-editmode.xml>',
    '    --editmode-log <contract-gate-editmode.log> --save-version 15',
    '',
    'Immutable re-verification:',
    '  vite-node scripts/verify-bridge-contract-consumer.ts',
    '    --verify-attestation <attestation-path>',
    '    --typescript-root <root> --unity-root <root> --evidence-root <root>',
  ].join('\n')
}

function argumentMap(argv: readonly string[]): Map<string, string> {
  const values = new Map<string, string>()
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index]!
    if (name === '--verify-only') {
      if (values.has(name)) throw new Error(`duplicate option ${name}`)
      values.set(name, 'true')
      continue
    }
    if (!VALUE_OPTIONS.has(name)) throw new Error(`unknown option ${name}`)
    if (values.has(name)) throw new Error(`duplicate option ${name}`)
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) throw new Error(`${name} requires a value`)
    values.set(name, value)
    index += 1
  }
  return values
}

function required(values: ReadonlyMap<string, string>, name: string): string {
  const value = values.get(name)
  if (value === undefined || value.length === 0) throw new Error(`${name} is required`)
  return value
}

export function parseCliOptions(argv: readonly string[]): CliOptions {
  const values = argumentMap(argv)
  const attestationPath = values.get('--verify-attestation')
  const attestationOutput = values.get('--attestation-output')
  const verifyOnly = values.has('--verify-only')
  const selected = Number(attestationPath !== undefined) + Number(attestationOutput !== undefined) + Number(verifyOnly)
  if (selected !== 1) {
    throw new Error('select exactly one of --verify-only, --attestation-output, or --verify-attestation')
  }
  const operation = attestationPath !== undefined
    ? 'verify-attestation'
    : attestationOutput !== undefined ? 'attest' : 'verify'
  const typescriptRoot = resolve(required(values, '--typescript-root'))
  const unityRoot = resolve(required(values, '--unity-root'))
  if (operation === 'verify-attestation') {
    if (values.has('--typescript-commit') || values.has('--unity-commit') || values.has('--typescript-ref') || values.has('--unity-ref')) {
      throw new Error('immutable verification reads commits and seal-time refs only from the attestation')
    }
    return {
      operation,
      typescriptRoot,
      unityRoot,
      typescriptRemote: values.get('--typescript-remote'),
      unityRemote: values.get('--unity-remote'),
      attestationPath: resolve(attestationPath!),
      evidenceRoot: resolve(required(values, '--evidence-root')),
      saveVersion: CURRENT_ACCEPTED_SAVE_VERSION,
    }
  }
  if (values.has('--evidence-root') || attestationPath !== undefined) {
    throw new Error('--evidence-root is valid only with --verify-attestation')
  }
  const rawSaveVersion = values.get('--save-version')
  const saveVersion = rawSaveVersion === undefined ? CURRENT_ACCEPTED_SAVE_VERSION : Number(rawSaveVersion)
  if (!Number.isSafeInteger(saveVersion) || saveVersion < 1) throw new Error('--save-version must be a positive integer')
  if (operation === 'attest' && (values.get('--editmode-result') === undefined || values.get('--editmode-log') === undefined)) {
    throw new Error('--attestation-output requires --editmode-result and --editmode-log')
  }
  if (operation === 'verify' && (values.has('--editmode-result') || values.has('--editmode-log') || values.has('--save-version'))) {
    throw new Error('EditMode evidence and --save-version are valid only with --attestation-output')
  }
  return {
    operation,
    typescriptRoot,
    typescriptCommit: required(values, '--typescript-commit'),
    typescriptRef: required(values, '--typescript-ref'),
    typescriptRemote: values.get('--typescript-remote'),
    unityRoot,
    unityCommit: required(values, '--unity-commit'),
    unityRef: required(values, '--unity-ref'),
    unityRemote: values.get('--unity-remote'),
    verificationReport: values.get('--verification-report') === undefined
      ? undefined
      : resolve(values.get('--verification-report')!),
    attestationOutput: attestationOutput === undefined ? undefined : resolve(attestationOutput),
    editModeResult: values.get('--editmode-result') === undefined ? undefined : resolve(values.get('--editmode-result')!),
    editModeLog: values.get('--editmode-log') === undefined ? undefined : resolve(values.get('--editmode-log')!),
    saveVersion,
  }
}

function pairRequest(options: CliOptions): ContractPairRequest {
  if (
    options.typescriptCommit === undefined
    || options.typescriptRef === undefined
    || options.unityCommit === undefined
    || options.unityRef === undefined
  ) throw new Error('sealed pair options are incomplete')
  return {
    mode: 'seal',
    typescriptRoot: options.typescriptRoot,
    typescriptCommit: options.typescriptCommit,
    typescriptRef: options.typescriptRef,
    typescriptRemote: options.typescriptRemote,
    unityRoot: options.unityRoot,
    unityCommit: options.unityCommit,
    unityRef: options.unityRef,
    unityRemote: options.unityRemote,
  }
}

export function runCli(argv: readonly string[]): unknown {
  const options = parseCliOptions(argv)
  const executingTypescriptRoot = realpathSync.native(resolve(fileURLToPath(import.meta.url), '../..'))
  const requestedTypescriptRoot = realpathSync.native(options.typescriptRoot)
  if (executingTypescriptRoot !== requestedTypescriptRoot) {
    throw new Error(
      `--typescript-root must be the checkout executing this verifier: expected ${executingTypescriptRoot}, received ${requestedTypescriptRoot}`,
    )
  }
  if (options.operation === 'verify-attestation') {
    return verifyAttestation({
      attestationPath: options.attestationPath!,
      typescriptRoot: options.typescriptRoot,
      typescriptRemote: options.typescriptRemote,
      unityRoot: options.unityRoot,
      unityRemote: options.unityRemote,
      evidenceRoot: options.evidenceRoot!,
    })
  }
  const pair = pairRequest(options)
  if (options.operation === 'attest') {
    const attestation = createAttestation({
      ...pair,
      saveVersion: options.saveVersion,
      attestationPath: options.attestationOutput!,
      editModeEvidence: {
        resultPath: options.editModeResult!,
        logPath: options.editModeLog!,
      },
    })
    writeCanonicalJsonExclusive(options.attestationOutput!, attestation, [
      options.typescriptRoot,
      options.unityRoot,
    ])
    return attestation
  }
  const facts = verifyContractPair(pair)
  const report = verificationReport(facts)
  if (options.verificationReport !== undefined) {
    writeCanonicalJsonAtomic(options.verificationReport, report, [options.typescriptRoot, options.unityRoot])
  }
  return report
}

function main(): void {
  if (process.argv.includes('--help')) {
    process.stdout.write(`${usage()}\n`)
    return
  }
  try {
    const result = runCli(process.argv.slice(2))
    process.stdout.write(canonicalJson(result))
  } catch (error) {
    if (error instanceof Cf09VerificationError) {
      process.stderr.write(canonicalJson(error.diagnostic))
    } else {
      process.stderr.write(canonicalJson({
        code: 'CF09_PATH_INVALID',
        observed: error instanceof Error ? error.message : 'invalid invocation',
        remediation: usage(),
        result: 'FAIL',
        stage: 'arguments',
      }))
    }
    process.exitCode = 1
  }
}

const invokedPath = process.argv[1] === undefined ? '' : resolve(process.argv[1])
const modulePath = resolve(fileURLToPath(import.meta.url))
const hasCliOperation = process.argv.some((argument) =>
  argument === '--help'
  || argument === '--verify-only'
  || argument === '--attestation-output'
  || argument === '--verify-attestation')
if (invokedPath === modulePath || hasCliOperation) main()
