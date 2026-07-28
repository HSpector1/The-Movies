// Shared helpers for the Asset Lab pipeline scripts. Pure Node, no external services.
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const p = (...s) => join(ROOT, ...s)

export const EXTRACTED = p('sources', 'extracted')
export const ARCHIVES = p('sources', 'original-archives')
export const PUBLIC_ASSETS = p('public', 'assets')
export const MANIFESTS = p('manifests')

/** Recursively list absolute file paths under `dir`. */
export function walk(dir) {
  const out = []
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else if (e.isFile()) out.push(full)
  }
  return out
}

export const ext = (f) => extname(f).toLowerCase().replace('.', '')

export function classify(e) {
  if (['gltf', 'glb', 'fbx', 'obj', 'msh'].includes(e)) return 'model3d'
  if (['png', 'jpg', 'jpeg', 'dds', 'hdr', 'tga', 'ktx2', 'exr', 'webp'].includes(e)) return 'texture'
  if (['txt', 'md', 'pdf', 'html'].includes(e)) return 'doc'
  if (['ini', 'inf', 'cam', 'json', 'cfg', 'db'].includes(e)) return 'config'
  return 'other'
}

/** Parse a DDS header (magic, dims, fourCC). Returns null if not a DDS. */
export function ddsInfo(file) {
  const b = readFileSync(file)
  if (b.length < 128 || b.toString('ascii', 0, 4) !== 'DDS ') return null
  const height = b.readUInt32LE(12)
  const width = b.readUInt32LE(16)
  const fourCC = b.toString('ascii', 84, 88).replace(/\0/g, '').trim()
  return { width, height, fourCC: fourCC || 'uncompressed' }
}

/** Detect FBX format + version from the file header. */
export function fbxInfo(file) {
  const b = readFileSync(file).subarray(0, 64)
  if (b.toString('binary', 0, 18) === 'Kaydara FBX Binary') {
    const version = b.readUInt32LE(23)
    return { format: 'binary', version }
  }
  const head = b.toString('utf8')
  if (head.includes('FBX')) return { format: 'ascii', version: null }
  return { format: 'unknown', version: null }
}

/** Scan a legacy .msh for embedded ASCII texture references (e.g. *.dds). */
export function mshTextureRefs(file) {
  const b = readFileSync(file)
  const s = b.toString('latin1')
  const refs = new Set()
  for (const m of s.matchAll(/[\w./-]+\.(dds|tga|png|bmp)/gi)) refs.add(m[0])
  return [...refs]
}

export const round = (n, d = 3) => (Number.isFinite(n) ? Number(n.toFixed(d)) : null)
export const fileBytes = (f) => statSync(f).size
