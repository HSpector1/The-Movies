// Pipeline script (contract §9: "archive hashing"; §2: "Record SHA-256 hashes").
// Computes SHA-256 of every preserved archive and, when the Downloads original is
// still present, verifies the preserved copy is byte-identical (originals never modified).
// Output: manifests/source-archives.json  +  a printed table.
import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { ARCHIVES, MANIFESTS, fileBytes } from './lib.mjs'

const DOWNLOADS = '/Users/bruce/Downloads'
const sha256 = (f) => createHash('sha256').update(readFileSync(f)).digest('hex')

const zips = readdirSync(ARCHIVES).filter((f) => f.toLowerCase().endsWith('.zip')).sort()
const rows = []
for (const name of zips) {
  const copy = join(ARCHIVES, name)
  const hash = sha256(copy)
  const orig = join(DOWNLOADS, name)
  const hasOrig = existsSync(orig)
  const origMatches = hasOrig ? sha256(orig) === hash : null
  rows.push({ name, bytes: fileBytes(copy), sha256: hash, downloadsOriginalPresent: hasOrig, downloadsOriginalMatches: origMatches })
}

mkdirSync(MANIFESTS, { recursive: true })
writeFileSync(join(MANIFESTS, 'source-archives.json'), JSON.stringify({ tool: 'hash-archives', archives: rows }, null, 2) + '\n')

console.log('archive                                          bytes        sha256(head)      orig?  match?')
for (const r of rows) {
  console.log(
    r.name.padEnd(46),
    String(r.bytes).padStart(11),
    ' ' + r.sha256.slice(0, 16),
    ' ' + (r.downloadsOriginalPresent ? 'yes' : 'no ').padEnd(4),
    ' ' + (r.downloadsOriginalMatches === null ? 'n/a' : r.downloadsOriginalMatches ? 'OK' : 'MISMATCH'),
  )
}
const bad = rows.filter((r) => r.downloadsOriginalMatches === false)
if (bad.length) { console.error('\n** integrity failure: preserved copy differs from Downloads original **'); process.exit(1) }
console.log('\nwrote manifests/source-archives.json')
