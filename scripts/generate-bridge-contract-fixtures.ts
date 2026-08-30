import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  BRIDGE_CONTRACT_FIXTURE_PROJECTION_VERSION,
  BRIDGE_CONTRACT_FIXTURE_PROTOCOL_VERSION,
  BRIDGE_CONTRACT_POSITIVE_FIXTURE_SCHEMA,
} from '../tests/fixtures/bridge-contract-union-fixtures.ts'
import { generateCsharpContract } from './bridge-contract-csharp.ts'

const TYPESCRIPT_FIXTURE_PATH = 'generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs'
const UNITY_FIXTURE_PATH = 'Assets/Studio/Tests/EditMode/Generated/StudioBridgeUnionFixtures.Generated.cs'

function argumentValue(name: string): string | null {
  const index = process.argv.indexOf(name)
  if (index < 0) return null
  const value = process.argv[index + 1]
  if (value === undefined || value.startsWith('--')) throw new Error(`${name} requires a path.`)
  return value
}

export function renderBridgeContractFixtures(): string {
  return generateCsharpContract({
    schema: BRIDGE_CONTRACT_POSITIVE_FIXTURE_SCHEMA,
    protocolVersion: BRIDGE_CONTRACT_FIXTURE_PROTOCOL_VERSION,
    projectionVersion: BRIDGE_CONTRACT_FIXTURE_PROJECTION_VERSION,
    namespace: 'ProjectStudio.Bridge.GeneratedFixtures',
    contractClassName: 'StudioBridgeUnionFixtureContract',
    generatorCommand: 'npm run generate:bridge-contract:fixtures',
    formatExceptionType: 'Studio.Runtime.Data.StudioSnapshotFormatException',
  })
}

async function checkOutput(path: string, expected: string): Promise<boolean> {
  let actual: string
  try {
    actual = await readFile(path, 'utf8')
  } catch {
    console.error(`missing generated fixture artifact: ${path}`)
    return false
  }
  if (actual !== expected) {
    console.error(`generated fixture artifact is stale: ${path}`)
    return false
  }
  console.log(`verified ${path}`)
  return true
}

interface StagedOutput {
  readonly target: string
  readonly temporary: string
}

async function stageOutput(target: string, expected: string): Promise<StagedOutput> {
  const directory = dirname(target)
  await mkdir(directory, { recursive: true })
  const temporary = resolve(directory, `.bridge-union-fixture-${randomUUID()}.tmp`)
  await writeFile(temporary, expected, 'utf8')
  return { target, temporary }
}

async function writeOutputs(outputs: readonly { readonly path: string; readonly content: string }[]): Promise<void> {
  const staged: StagedOutput[] = []
  try {
    for (const output of outputs) staged.push(await stageOutput(output.path, output.content))
    for (const output of staged) {
      await rename(output.temporary, output.target)
      console.log(`generated ${output.target}`)
    }
  } finally {
    await Promise.all(staged.map(async (output) => {
      await rm(output.temporary, { force: true })
    }))
  }
}

async function main(): Promise<void> {
  const root = process.cwd()
  const unityProject = argumentValue('--unity-project')
  const checkOnly = process.argv.includes('--check')

  // Render and analyze the complete aggregate before creating a directory or invoking an output sink.
  const rendered = renderBridgeContractFixtures()
  const outputs = [
    { path: resolve(root, TYPESCRIPT_FIXTURE_PATH), content: rendered },
    ...(unityProject === null
      ? []
      : [{ path: resolve(unityProject, UNITY_FIXTURE_PATH), content: rendered }]),
  ]

  if (!checkOnly) {
    await writeOutputs(outputs)
    return
  }
  const results = await Promise.all(outputs.map((output) => checkOutput(output.path, output.content)))
  if (results.some((result) => !result)) process.exitCode = 1
}

await main()
