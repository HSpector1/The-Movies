import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const repositoryRoot = process.cwd()
const auditScript = join(repositoryRoot, 'scripts/audit-3d-assets.mjs')
const temporaryDirectories: string[] = []

function minimalGlb() {
  const json = Buffer.from(JSON.stringify({ asset: { version: '2.0' }, scenes: [{}], nodes: [{ name: 'root_socket' }], meshes: [] }))
  const paddedLength = Math.ceil(json.length / 4) * 4
  const output = Buffer.alloc(12 + 8 + paddedLength, 0x20)
  output.writeUInt32LE(0x46546c67, 0)
  output.writeUInt32LE(2, 4)
  output.writeUInt32LE(output.length, 8)
  output.writeUInt32LE(paddedLength, 12)
  output.writeUInt32LE(0x4e4f534a, 16)
  json.copy(output, 20)
  return output
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), '3d-asset-audit-'))
  temporaryDirectories.push(root)
  const assetRoot = join(root, 'spike3d')
  mkdirSync(join(assetRoot, 'characters'), { recursive: true })
  writeFileSync(join(assetRoot, 'PROVENANCE-REGISTER.md'), '# fixture register\n')
  writeFileSync(join(assetRoot, 'PROVENANCE-lab05h.json'), JSON.stringify({ assets: [{ path: 'characters/crew.glb' }] }))
  writeFileSync(join(assetRoot, 'characters/crew.glb'), minimalGlb())
  writeFileSync(join(root, 'allowlist.json'), JSON.stringify({ glbOver25Mb: [], rasterOver16Mb: [], duplicatePayloadSha256: [] }))
  return { root, assetRoot, output: join(root, 'report.json'), allowlist: join(root, 'allowlist.json') }
}

function run({ assetRoot, output, allowlist }: ReturnType<typeof fixture>) {
  return execFileSync('node', [auditScript, '--asset-root', assetRoot, '--output', output, '--allowlist', allowlist], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })
}

afterEach(() => {
  while (temporaryDirectories.length) rmSync(temporaryDirectories.pop()!, { recursive: true, force: true })
})

describe('3D asset audit', () => {
  it('passes a provenance-backed asset and records structural metrics', () => {
    const paths = fixture()
    expect(run(paths)).toContain('0 hard violation')
    const report = JSON.parse(readFileSync(paths.output, 'utf8'))
    expect(report.passed).toBe(true)
    expect(report.assets[0]).toMatchObject({ relativePath: 'characters/crew.glb', category: 'characters' })
    expect(report.assets[0].glb).toMatchObject({ sceneCount: 1, nodeCount: 1, attachmentNodes: [{ name: 'root_socket' }] })
  })

  it('fails missing provenance and duplicate payloads unless allowlisted', () => {
    const paths = fixture()
    writeFileSync(join(paths.assetRoot, 'characters/crew-copy.glb'), minimalGlb())
    expect(() => run(paths)).toThrow()
    const report = JSON.parse(readFileSync(paths.output, 'utf8'))
    expect(report.missingProvenance).toEqual(['characters/crew-copy.glb'])
    expect(report.violations.map((violation: { rule: string }) => violation.rule)).toEqual(
      expect.arrayContaining(['missing-provenance', 'duplicate-sha256-payload']),
    )
  })

  it('enforces the GLB and raster size gates deterministically', () => {
    const paths = fixture()
    writeFileSync(join(paths.assetRoot, 'oversized.glb'), Buffer.alloc(25 * 1024 * 1024 + 1))
    writeFileSync(join(paths.assetRoot, 'oversized.png'), Buffer.alloc(16 * 1024 * 1024 + 1))
    const provenance = { assets: [
      { path: 'characters/crew.glb' },
      { path: 'oversized.glb' },
      { path: 'oversized.png' },
    ] }
    writeFileSync(join(paths.assetRoot, 'PROVENANCE-lab05h.json'), JSON.stringify(provenance))

    expect(() => run(paths)).toThrow()
    const report = JSON.parse(readFileSync(paths.output, 'utf8'))
    expect(report.violations.map((violation: { rule: string }) => violation.rule)).toEqual(
      expect.arrayContaining(['glb-over-25-mb', 'raster-over-16-mb']),
    )

    writeFileSync(paths.allowlist, JSON.stringify({
      glbOver25Mb: ['oversized.glb'],
      rasterOver16Mb: ['oversized.png'],
      duplicatePayloadSha256: [],
    }))
    expect(run(paths)).toContain('0 hard violation')
  })
})
