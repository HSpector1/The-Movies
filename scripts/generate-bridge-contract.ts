import { createHash, randomUUID } from 'node:crypto'
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  BRIDGE_SCHEMA,
  PROJECTION_VERSION,
  PROTOCOL_VERSION,
} from '../bridge/schema/bridge-schema.ts'
import { canonicalJsonPretty, schemaIdentity } from '../bridge/schema/canonical.ts'
import { generateCsharpContract } from './bridge-contract-csharp.ts'

const CONTRACT_ID = 'project-studio-current-game-unity-bridge'
const GENERATOR_VERSION = 1
const TYPESCRIPT_GENERATED_CONTRACT_PATH = 'generated/unity/StudioBridgeDtos.Generated.cs'
const CONTRACT_MANIFEST_PATH = 'generated/unity/project-studio-bridge.contract-manifest.json'
const UNITY_CONSUMER_REPOSITORY = 'HSpector1/project-studio-unity-visual-spike'
const UNITY_GENERATED_CONTRACT_PATH =
  'Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs'
const SOURCE_BUNDLE_DOMAIN = 'PROJECT_STUDIO_CF09_SOURCE_BUNDLE_V1'
const GENERATOR_SOURCE_PATHS = [
  'bridge/schema/bridge-schema.ts',
  'bridge/schema/canonical.ts',
  'bridge/schema/dsl.ts',
  'package-lock.json',
  'package.json',
  'scripts/bridge-contract-csharp.ts',
  'scripts/generate-bridge-contract.ts',
] as const

type ContractManifest = {
  manifestVersion: 1
  contractId: string
  schemaId: string
  protocolVersion: number
  projectionVersion: number
  generatorVersion: number
  generatorSourceSha256: string
  typescriptGeneratedContractPath: string
  typescriptGeneratedContractSha256: string
  unityConsumerRepository: string
  unityGeneratedContractPath: string
  unityGeneratedContractSha256: string
}

type Output = Readonly<{
  path: string
  contents: string
}>

function argumentValue(name: string): string | null {
  const index = process.argv.indexOf(name)
  if (index < 0) return null
  const value = process.argv[index + 1]
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${name} requires a path.`)
  }
  return value
}

function ordinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function canonicalRelativePath(path: string): string {
  if (
    path.length === 0 ||
    path.startsWith('/') ||
    path.startsWith('\\') ||
    path.includes('\\') ||
    path.split('/').some((part) => part.length === 0 || part === '.' || part === '..')
  ) {
    throw new Error(`Noncanonical source-bundle path: ${JSON.stringify(path)}.`)
  }
  return path
}

function uint32(value: number): Buffer {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32BE(value)
  return buffer
}

function uint64(value: number): Buffer {
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(BigInt(value))
  return buffer
}

async function sourceBundleSha256(root: string, inputPaths: readonly string[]): Promise<string> {
  const paths = [...inputPaths].map(canonicalRelativePath).sort(ordinal)
  if (new Set(paths).size !== paths.length) {
    throw new Error('Source-bundle paths must be unique.')
  }
  const entries: Buffer[] = [
    Buffer.from(SOURCE_BUNDLE_DOMAIN, 'ascii'),
    Buffer.from([0]),
    uint32(paths.length),
  ]
  for (const path of paths) {
    const absolutePath = resolve(root, path)
    const stat = await lstat(absolutePath)
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`Source-bundle entry is not a regular file: ${path}.`)
    }
    const pathBytes = Buffer.from(path, 'utf8')
    const contents = await readFile(absolutePath)
    entries.push(uint32(pathBytes.length), pathBytes, uint64(contents.length), contents)
  }
  return createHash('sha256').update(Buffer.concat(entries)).digest('hex')
}

function sha256(contents: string | Buffer): string {
  return createHash('sha256').update(contents).digest('hex')
}

async function checkOutputs(outputs: readonly Output[]): Promise<boolean> {
  let passed = true
  for (const output of outputs) {
    let actual: string
    try {
      actual = await readFile(output.path, 'utf8')
    } catch {
      console.error(`missing generated artifact: ${output.path}`)
      passed = false
      continue
    }
    if (actual !== output.contents) {
      console.error(`generated artifact is stale: ${output.path}`)
      passed = false
      continue
    }
    console.log(`verified ${output.path}`)
  }
  return passed
}

async function publishOutputsAtomically(outputs: readonly Output[]): Promise<void> {
  const staged: Array<Readonly<{ target: string; temporary: string }>> = []
  try {
    for (const output of outputs) {
      await mkdir(dirname(output.path), { recursive: true })
      const temporary = `${output.path}.tmp-${String(process.pid)}-${randomUUID()}`
      await writeFile(temporary, output.contents, { encoding: 'utf8', flag: 'wx' })
      staged.push({ target: output.path, temporary })
    }
    for (const entry of staged) {
      await rename(entry.temporary, entry.target)
      console.log(`generated ${entry.target}`)
    }
  } finally {
    await Promise.all(staged.map(async ({ temporary }) => {
      await rm(temporary, { force: true })
    }))
  }
}

async function main(): Promise<void> {
  const root = process.cwd()
  const checkOnly = process.argv.includes('--check')
  const unityProject = argumentValue('--unity-project')

  // Complete every analysis and render before invoking any output check or sink.
  const schemaJson = canonicalJsonPretty(BRIDGE_SCHEMA)
  const csharp = generateCsharpContract({
    schema: BRIDGE_SCHEMA,
    protocolVersion: PROTOCOL_VERSION,
    projectionVersion: PROJECTION_VERSION,
  })
  const generatorSourceSha256 = await sourceBundleSha256(root, GENERATOR_SOURCE_PATHS)
  const generatedContractSha256 = sha256(csharp)
  const contractManifest: ContractManifest = {
    manifestVersion: 1,
    contractId: CONTRACT_ID,
    schemaId: schemaIdentity(BRIDGE_SCHEMA),
    protocolVersion: PROTOCOL_VERSION,
    projectionVersion: PROJECTION_VERSION,
    generatorVersion: GENERATOR_VERSION,
    generatorSourceSha256,
    typescriptGeneratedContractPath: TYPESCRIPT_GENERATED_CONTRACT_PATH,
    typescriptGeneratedContractSha256: generatedContractSha256,
    unityConsumerRepository: UNITY_CONSUMER_REPOSITORY,
    unityGeneratedContractPath: UNITY_GENERATED_CONTRACT_PATH,
    unityGeneratedContractSha256: generatedContractSha256,
  }
  const manifestJson = canonicalJsonPretty(contractManifest)

  const outputs: Output[] = [
    {
      path: resolve(root, 'bridge/schema/project-studio-bridge.schema.json'),
      contents: schemaJson,
    },
    {
      path: resolve(root, TYPESCRIPT_GENERATED_CONTRACT_PATH),
      contents: csharp,
    },
    {
      path: resolve(root, CONTRACT_MANIFEST_PATH),
      contents: manifestJson,
    },
  ]
  if (unityProject !== null) {
    outputs.push({
      path: resolve(unityProject, UNITY_GENERATED_CONTRACT_PATH),
      contents: csharp,
    })
  }

  if (checkOnly) {
    if (!await checkOutputs(outputs)) process.exitCode = 1
    return
  }
  await publishOutputsAtomically(outputs)
}

await main()
