// Pipeline script (contract §9: "asset validation"). Confirms every runtime asset in
// runtime-assets.json exists and actually parses: GLB via gltf-transform (>=1 mesh);
// FBX via binary-magic check. Writes manifests/validation.json; nonzero exit on any failure.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MANIFESTS, ROOT } from './lib.mjs'

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const manifest = JSON.parse(readFileSync(join(MANIFESTS, 'runtime-assets.json'), 'utf8'))
const abs = (u) => join(ROOT, 'public', u.replace(/^\//, ''))

const rows = []
for (const a of manifest.assets) {
  const file = abs(a.url)
  const r = { id: a.id, kind: a.kind, ok: false, detail: '' }
  if (!existsSync(file)) { r.detail = 'file missing'; rows.push(r); continue }
  try {
    if (a.kind === 'glb') {
      const doc = await io.read(file)
      const meshes = doc.getRoot().listMeshes().length
      if (meshes < 1) { r.detail = 'no meshes'; } else { r.ok = true; r.detail = `${meshes} mesh(es)` }
    } else if (a.kind === 'fbx') {
      const head = readFileSync(file).subarray(0, 18).toString('binary')
      if (head === 'Kaydara FBX Binary') { r.ok = true; r.detail = 'valid FBX binary' }
      else { r.detail = 'bad FBX magic' }
    }
  } catch (err) { r.detail = String(err && err.message || err) }
  rows.push(r)
}

const pass = rows.filter((r) => r.ok).length
writeFileSync(join(MANIFESTS, 'validation.json'), JSON.stringify({ tool: 'validate-assets', pass, fail: rows.length - pass, rows }, null, 2) + '\n')

console.log('id                                       kind   ok   detail')
for (const r of rows) console.log(r.id.padEnd(40), r.kind.padEnd(5), (r.ok ? 'OK' : 'XX').padEnd(4), r.detail)
console.log(`\nvalidation: ${pass}/${rows.length} passed`)
if (pass < rows.length) process.exitCode = 1
