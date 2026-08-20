#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const defaultAssetRoot = join(repositoryRoot, 'ui/public/spike3d')
const defaultOutput = join(repositoryRoot, '.tmp/3d-asset-audit.json')
const defaultAllowlist = join(scriptDirectory, '3d-asset-audit-allowlist.json')

const assetExtensions = new Set(['.glb', '.gltf', '.png', '.jpg', '.jpeg', '.webp'])
const rasterExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const categoryNames = new Set(['arch', 'characters', 'props', 'textures'])
const socketNames = ['hand_l', 'hand_r', 'head', 'root', 'door', 'wheel', 'camera', 'boom', 'socket', 'attach']
const glbLimitBytes = 25 * 1024 * 1024
const rasterLimitBytes = 16 * 1024 * 1024

function parseArguments(args) {
  const options = {
    assetRoot: defaultAssetRoot,
    output: defaultOutput,
    allowlist: defaultAllowlist,
    provenance: null,
    provenanceRegister: null,
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--asset-root') options.assetRoot = resolve(args[++index] ?? '')
    else if (argument === '--output') options.output = resolve(args[++index] ?? '')
    else if (argument === '--allowlist') options.allowlist = resolve(args[++index] ?? '')
    else if (argument === '--provenance') options.provenance = resolve(args[++index] ?? '')
    else if (argument === '--provenance-register') options.provenanceRegister = resolve(args[++index] ?? '')
    else if (argument === '--help') {
      console.log('Usage: node scripts/audit-3d-assets.mjs [--asset-root PATH] [--output PATH] [--allowlist PATH] [--provenance PATH]')
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }

  options.provenance ??= join(options.assetRoot, 'PROVENANCE-lab05h.json')
  options.provenanceRegister ??= join(options.assetRoot, 'PROVENANCE-REGISTER.md')
  return options
}

function walkFiles(directory) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(absolutePath))
    else if (entry.isFile()) files.push(absolutePath)
  }
  return files
}

function categoryFor(relativePath) {
  const topLevel = relativePath.split('/')[0]
  return categoryNames.has(topLevel) ? topLevel : 'other'
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function parseGlb(buffer, filePath) {
  if (buffer.length < 20 || buffer.readUInt32LE(0) !== 0x46546c67) {
    throw new Error(`${filePath} is not a GLB 2.0 file`)
  }
  if (buffer.readUInt32LE(4) !== 2) {
    throw new Error(`${filePath} is not a GLB 2.0 file`)
  }

  let offset = 12
  let json = null
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset)
    const chunkType = buffer.readUInt32LE(offset + 4)
    const chunkStart = offset + 8
    const chunkEnd = chunkStart + chunkLength
    if (chunkEnd > buffer.length) throw new Error(`${filePath} has a truncated GLB chunk`)
    if (chunkType === 0x4e4f534a) json = JSON.parse(buffer.subarray(chunkStart, chunkEnd).toString('utf8').replace(/\0+$/u, ''))
    offset = chunkEnd
  }
  if (!json) throw new Error(`${filePath} has no JSON chunk`)
  return json
}

function triangleCount(gltf) {
  const accessors = gltf.accessors ?? []
  let triangles = 0
  let complete = true
  for (const mesh of gltf.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      const accessorIndex = primitive.indices ?? primitive.attributes?.POSITION
      const count = typeof accessorIndex === 'number' ? accessors[accessorIndex]?.count : undefined
      if (typeof count !== 'number') {
        complete = false
        continue
      }
      const mode = primitive.mode ?? 4
      if (mode === 4) triangles += Math.floor(count / 3)
      else if (mode === 5 || mode === 6) triangles += Math.max(0, count - 2)
    }
  }
  return { triangles, complete }
}

function auditGlb(buffer, filePath) {
  const gltf = parseGlb(buffer, filePath)
  const nodes = gltf.nodes ?? []
  const sockets = nodes
    .flatMap((node, index) => {
      const name = typeof node.name === 'string' ? node.name : ''
      const lowerName = name.toLowerCase()
      const matches = socketNames.filter((socket) => lowerName.includes(socket))
      return matches.length ? [{ index, name, matches }] : []
    })
  const primitiveCount = (gltf.meshes ?? []).reduce((count, mesh) => count + (mesh.primitives?.length ?? 0), 0)
  const triangles = triangleCount(gltf)
  const hasSkinAttributes = (gltf.meshes ?? []).some((mesh) => mesh.primitives?.some((primitive) =>
    primitive.attributes && ('JOINTS_0' in primitive.attributes || 'WEIGHTS_0' in primitive.attributes),
  ))
  const animationClips = (gltf.animations ?? []).map((animation, index) => animation.name || `unnamed-animation-${index + 1}`)

  return {
    sceneCount: (gltf.scenes ?? []).length,
    nodeCount: nodes.length,
    meshCount: (gltf.meshes ?? []).length,
    primitiveCount,
    materialCount: (gltf.materials ?? []).length,
    textureCount: (gltf.textures ?? []).length,
    animationClips,
    animationClipCount: animationClips.length,
    approximateTriangleCount: triangles.triangles,
    approximateTriangleCountComplete: triangles.complete,
    containsSkinnedMeshes: (gltf.skins?.length ?? 0) > 0 || hasSkinAttributes,
    attachmentNodes: sockets,
  }
}

function normalizeAssetPath(value, assetRoot) {
  if (typeof value !== 'string') return null
  const slashPath = value.replaceAll('\\', '/')
  const rootMarker = 'ui/public/spike3d/'
  const markerIndex = slashPath.indexOf(rootMarker)
  if (markerIndex >= 0) return slashPath.slice(markerIndex + rootMarker.length)
  if (slashPath.startsWith('/')) return relative(assetRoot, slashPath).replaceAll('\\', '/')
  return slashPath.replace(/^\.\//u, '')
}

function collectProvenancePaths(value, assetRoot, paths = new Set()) {
  if (Array.isArray(value)) {
    for (const entry of value) collectProvenancePaths(entry, assetRoot, paths)
    return paths
  }
  if (!value || typeof value !== 'object') return paths

  for (const field of ['path', 'assetPath', 'relativePath', 'relative_path', 'file']) {
    const normalized = normalizeAssetPath(value[field], assetRoot)
    if (normalized) paths.add(normalized)
  }
  for (const field of ['assets', 'entries', 'provenance']) {
    if (field in value) collectProvenancePaths(value[field], assetRoot, paths)
  }
  return paths
}

function readJsonFile(path, label) {
  const raw = readFileSync(path, 'utf8').trim()
  if (!raw) return { value: [], status: 'empty' }
  try {
    return { value: JSON.parse(raw), status: 'parsed' }
  } catch (error) {
    throw new Error(`Unable to parse ${label} at ${path}: ${error.message}`)
  }
}

function readAllowlist(path) {
  const { value } = readJsonFile(path, 'asset audit allowlist')
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`Asset audit allowlist at ${path} must be a JSON object`)
  }
  return {
    glbOver25Mb: new Set(value.glbOver25Mb ?? []),
    rasterOver16Mb: new Set(value.rasterOver16Mb ?? []),
    duplicatePayloadSha256: new Set(value.duplicatePayloadSha256 ?? []),
  }
}

function characterReadiness(asset) {
  const structural = asset.glb
  const clips = structural?.animationClips ?? []
  const named = (pattern) => clips.some((clip) => pattern.test(clip))
  const evidence = (pattern) => named(pattern) ? 'YES' : 'UNKNOWN'
  return {
    filename: asset.relativePath.split('/').pop(),
    skinned: structural?.containsSkinnedMeshes ? 'YES' : 'NO',
    clips: structural?.animationClipCount ?? 0,
    clipNames: clips,
    likelyUsableForIdle: evidence(/idle/i),
    likelyUsableForWalk: evidence(/walk/i),
    likelyUsableForWork: evidence(/work|act|use|carry|hammer|type|film|operate/i),
    notes: structural
      ? clips.length === 0
        ? 'No animation clips embedded; readiness is UNKNOWN.'
        : 'Readiness is inferred only from embedded clip names.'
      : 'GLB structure was not readable; readiness is UNKNOWN.',
  }
}

function markdownTable(characters) {
  const cell = (value) => String(value).replaceAll('|', '\\|')
  const rows = [
    '| Filename | Skinned | Clips | Clip names | Idle | Walk | Work | Notes |',
    '| --- | --- | ---: | --- | --- | --- | --- | --- |',
    ...characters.map((character) => `| ${cell(character.filename)} | ${character.skinned} | ${character.clips} | ${cell(character.clipNames.join(', ') || '—')} | ${character.likelyUsableForIdle} | ${character.likelyUsableForWalk} | ${character.likelyUsableForWork} | ${cell(character.notes)} |`),
  ]
  return rows.join('\n')
}

export function runAudit(options) {
  const allowlist = readAllowlist(options.allowlist)
  const provenance = readJsonFile(options.provenance, 'provenance register')
  const provenancePaths = collectProvenancePaths(provenance.value, options.assetRoot)
  const registerText = readFileSync(options.provenanceRegister, 'utf8')
  const assets = []
  const structuralErrors = []

  for (const absolutePath of walkFiles(options.assetRoot)) {
    const extension = extname(absolutePath).toLowerCase()
    if (!assetExtensions.has(extension)) continue
    const relativePath = relative(options.assetRoot, absolutePath).replaceAll('\\', '/')
    const contents = readFileSync(absolutePath)
    const asset = {
      relativePath,
      byteSize: statSync(absolutePath).size,
      extension,
      category: categoryFor(relativePath),
      sha256: sha256(contents),
    }
    if (extension === '.glb') {
      try {
        asset.glb = auditGlb(contents, relativePath)
      } catch (error) {
        asset.glbStructuralError = error.message
        structuralErrors.push({ relativePath, error: error.message })
      }
    }
    assets.push(asset)
  }

  const violations = []
  const missingProvenance = assets
    .filter((asset) => !provenancePaths.has(asset.relativePath))
    .map((asset) => asset.relativePath)

  for (const asset of assets) {
    if (asset.extension === '.glb' && asset.byteSize > glbLimitBytes && !allowlist.glbOver25Mb.has(asset.relativePath)) {
      violations.push({ rule: 'glb-over-25-mb', paths: [asset.relativePath], byteSize: asset.byteSize })
    }
    if (rasterExtensions.has(asset.extension) && asset.byteSize > rasterLimitBytes && !allowlist.rasterOver16Mb.has(asset.relativePath)) {
      violations.push({ rule: 'raster-over-16-mb', paths: [asset.relativePath], byteSize: asset.byteSize })
    }
  }

  const assetsByHash = new Map()
  for (const asset of assets) {
    const group = assetsByHash.get(asset.sha256) ?? []
    group.push(asset.relativePath)
    assetsByHash.set(asset.sha256, group)
  }
  const duplicatePayloads = [...assetsByHash.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([sha256, paths]) => ({ sha256, paths: paths.sort() }))
  for (const duplicate of duplicatePayloads) {
    if (!allowlist.duplicatePayloadSha256.has(duplicate.sha256)) {
      violations.push({ rule: 'duplicate-sha256-payload', paths: duplicate.paths, sha256: duplicate.sha256 })
    }
  }
  if (missingProvenance.length) {
    violations.push({ rule: 'missing-provenance', paths: missingProvenance })
  }

  const characters = assets
    .filter((asset) => asset.category === 'characters' && asset.extension === '.glb')
    .map(characterReadiness)
  const totalsByExtension = Object.fromEntries([...assetExtensions].map((extension) => [extension, assets.filter((asset) => asset.extension === extension).length]))
  const totalsByCategory = Object.fromEntries(['arch', 'characters', 'props', 'textures', 'other'].map((category) => [category, assets.filter((asset) => asset.category === category).length]))

  return {
    generatedAt: new Date().toISOString(),
    assetRoot: options.assetRoot,
    provenance: {
      jsonPath: options.provenance,
      jsonStatus: provenance.status,
      matchingEntryCount: provenancePaths.size,
      markdownRegisterPath: options.provenanceRegister,
      markdownRegisterPresent: registerText.length > 0,
    },
    thresholds: { glbBytes: glbLimitBytes, rasterBytes: rasterLimitBytes },
    totals: { assetCount: assets.length, byExtension: totalsByExtension, byCategory: totalsByCategory },
    assets,
    glbStructuralErrors: structuralErrors,
    duplicatePayloads,
    missingProvenance,
    characterAnimationReadiness: characters,
    characterAnimationReadinessMarkdown: markdownTable(characters),
    violations,
    passed: violations.length === 0,
  }
}

function main() {
  const options = parseArguments(process.argv.slice(2))
  const report = runAudit(options)
  mkdirSync(dirname(options.output), { recursive: true })
  writeFileSync(options.output, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`3D asset audit: ${report.totals.assetCount} assets; ${report.violations.length} hard violation(s).`)
  console.log(`Report: ${options.output}`)
  if (report.missingProvenance.length) console.log(`Missing provenance: ${report.missingProvenance.length}`)
  if (report.glbStructuralErrors.length) console.log(`Unreadable GLBs: ${report.glbStructuralErrors.length}`)
  process.exitCode = report.passed ? 0 : 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
