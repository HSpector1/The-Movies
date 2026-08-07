// Governance tooling (NOT game/runtime code): generate and validate the identity of the
// eight-document Human-Artist Character Handoff packet in docs/handoff/.
//
// The packet-content SHA-256 is a NON-SELF-REFERENTIAL digest: every page embeds the same
// value, and the value is computed over the eight pages with that embedded value replaced by
// a fixed placeholder token. A Git commit cannot embed its own future SHA, so this digest --
// not the commit SHA -- is the in-document immutable packet identity. The live governing Git
// tip is a SEPARATE check (see docs/handoff/CHARACTER-TECHNICAL-CONTRACT.md).
//
//   VERIFY:  node tools/validate-handoff-packet.mjs            (npm run handoff:verify)
//   UPDATE:  node tools/validate-handoff-packet.mjs --update   (npm run handoff:update)
//            --root DIR   operate on a copy of the repo instead of this checkout
//
// Exits non-zero on any failure. Update mode rewrites ONLY the packet-digest line.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { ROOT as REPO_ROOT } from './lib.mjs'

// ---------------------------------------------------------------------------
// Canonical packet definition. Ordering is lexicographic by repo-relative path.
// ---------------------------------------------------------------------------
export const PACKET_FILES = [
  'docs/handoff/CHARACTER-ACCEPTANCE-TESTS.md',
  'docs/handoff/CHARACTER-ARTIST-HANDOFF-BRIEF.md',
  'docs/handoff/CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md',
  'docs/handoff/CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md',
  'docs/handoff/CHARACTER-KNOWN-DEFECTS.md',
  'docs/handoff/CHARACTER-SOURCE-AND-PROVENANCE.md',
  'docs/handoff/CHARACTER-TECHNICAL-CONTRACT.md',
  'docs/handoff/EVIDENCE-INDEX.md',
].sort()

/** The literal token the embedded digest is replaced by before hashing. */
export const NORMALIZED_TOKEN = '<NORMALIZED-PACKET-DIGEST>'

/** The one line whose value is normalized away before hashing. */
const DIGEST_LINE = /^(\s*>\s*-\s*Packet content SHA-256:).*$/gm

/** Identity fields that must be present exactly once and identical across all eight pages. */
const IDENTITY_FIELDS = [
  { key: 'packet', label: 'Packet', re: /^\s*>\s*-\s*Packet:\s*(.+?)\s*$/gm, fixed: '**Project: Studio Human-Artist Character Handoff**' },
  { key: 'version', label: 'Version', re: /^\s*>\s*-\s*Version:\s*(.+?)\s*$/gm },
  { key: 'revisionDate', label: 'Revision date', re: /^\s*>\s*-\s*Revision date:\s*(.+?)\s*$/gm },
  { key: 'governingBranch', label: 'Governing branch', re: /^\s*>\s*-\s*Governing branch:\s*(.+?)\s*$/gm, fixed: '`asset-lab-character-human-artist-handoff`' },
  { key: 'supersedesTip', label: 'Supersedes Git tip', re: /^\s*>\s*-\s*Supersedes Git tip:\s*(.+?)\s*$/gm },
]

const IDENTITY_BLOCK = /^\s*>\s*\*\*Governing packet identity\*\*\s*$/m
const EMBEDDED_DIGEST = /^\s*>\s*-\s*Packet content SHA-256:\s*`([0-9a-fA-F]{64})`\s*$/m

// ---------------------------------------------------------------------------
// Canonical normalization + digest
// ---------------------------------------------------------------------------

/** Step 2 of the contract: CRLF and lone CR both become LF. */
export const toLF = (text) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

const countMatches = (text, re) => [...text.matchAll(new RegExp(re.source, re.flags))].length

/**
 * LF-normalize, then replace the single packet-digest line's value with the fixed token.
 * Throws if the file does not carry exactly one packet-digest line.
 */
export function normalizeForDigest(text, rel) {
  const lf = toLF(text)
  const n = countMatches(lf, DIGEST_LINE)
  if (n !== 1) throw new Error(`${rel}: expected exactly 1 packet-digest line, found ${n}`)
  return lf.replace(new RegExp(DIGEST_LINE.source, DIGEST_LINE.flags), (_m, prefix) => `${prefix} ${NORMALIZED_TOKEN}`)
}

/**
 * SHA-256 over the concatenated, sorted, normalized packet. Per file:
 *   "===== FILE: <repo-relative-path> =====\n" + <normalized contents> + "\n"
 * No timestamps, no absolute paths, no filesystem metadata, no Git SHA.
 */
export function computePacketDigest(root) {
  const h = createHash('sha256')
  for (const rel of PACKET_FILES) {
    const norm = normalizeForDigest(readFileSync(join(root, rel), 'utf8'), rel)
    h.update(Buffer.from(`===== FILE: ${rel} =====\n`, 'utf8'))
    h.update(Buffer.from(norm, 'utf8'))
    h.update(Buffer.from('\n', 'utf8'))
  }
  return h.digest('hex')
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

function verify(root) {
  const errors = []
  const notes = []

  // --- missing packet files -------------------------------------------------
  const missing = PACKET_FILES.filter((rel) => !existsSync(join(root, rel)))
  for (const rel of missing) errors.push(`MISSING PACKET FILE: ${rel}`)
  const present = PACKET_FILES.filter((rel) => !missing.includes(rel))
  if (missing.length) {
    report(root, errors, notes, null, null)
    return 1
  }

  // --- per-file structural checks ------------------------------------------
  const texts = new Map()
  const fields = new Map(IDENTITY_FIELDS.map((f) => [f.key, new Map()]))
  const embedded = new Map()

  for (const rel of present) {
    const lf = toLF(readFileSync(join(root, rel), 'utf8'))
    texts.set(rel, lf)

    if (!IDENTITY_BLOCK.test(lf)) errors.push(`MISSING IDENTITY BLOCK: ${rel} (no "> **Governing packet identity**" line)`)

    // duplicate / missing digest field
    const nDigestLines = countMatches(lf, DIGEST_LINE)
    if (nDigestLines === 0) errors.push(`MISSING DIGEST FIELD: ${rel} has no "Packet content SHA-256:" line`)
    else if (nDigestLines > 1) errors.push(`DUPLICATE DIGEST FIELD: ${rel} has ${nDigestLines} "Packet content SHA-256:" lines (exactly 1 required)`)

    const m = lf.match(EMBEDDED_DIGEST)
    if (nDigestLines === 1 && !m) errors.push(`MALFORMED DIGEST FIELD: ${rel} digest is not a backtick-quoted 64-hex value`)
    if (m) {
      if (m[1] !== m[1].toLowerCase()) errors.push(`NON-LOWERCASE DIGEST: ${rel} embeds "${m[1]}"`)
      embedded.set(rel, m[1].toLowerCase())
    }

    // identity fields: exactly once each, and captured for cross-page comparison
    for (const f of IDENTITY_FIELDS) {
      const all = [...lf.matchAll(new RegExp(f.re.source, f.re.flags))]
      if (all.length !== 1) {
        errors.push(`IDENTITY FIELD "${f.label}": ${rel} has ${all.length} occurrences (exactly 1 required)`)
        continue
      }
      const value = all[0][1]
      fields.get(f.key).set(rel, value)
      if (f.fixed && value !== f.fixed) {
        errors.push(`FOREIGN PAGE: ${rel} ${f.label} is "${value}", expected "${f.fixed}"`)
      }
    }
  }

  // --- cross-page agreement -------------------------------------------------
  for (const f of IDENTITY_FIELDS) {
    const map = fields.get(f.key)
    const distinct = [...new Set(map.values())]
    if (distinct.length > 1) {
      const label = f.key === 'version' ? 'MIXED PACKET VERSIONS' : `MIXED ${f.label.toUpperCase()}`
      errors.push(`${label}: ${distinct.length} distinct values across the packet`)
      for (const [rel, v] of map) errors.push(`    ${rel}  ->  ${v}`)
    }
  }

  const distinctEmbedded = [...new Set(embedded.values())]
  if (distinctEmbedded.length > 1) {
    errors.push(`MIXED PACKET DIGESTS: ${distinctEmbedded.length} distinct embedded values across the packet`)
    for (const [rel, v] of embedded) errors.push(`    ${rel}  ->  ${v}`)
  }

  // --- recompute and compare ------------------------------------------------
  let computed = null
  try {
    computed = computePacketDigest(root)
  } catch (err) {
    errors.push(`DIGEST COMPUTATION FAILED: ${err.message}`)
  }

  if (computed && distinctEmbedded.length === 1 && distinctEmbedded[0] !== computed) {
    errors.push(`DIGEST MISMATCH: embedded ${distinctEmbedded[0]} != recomputed ${computed}`)
  }
  if (computed && distinctEmbedded.length === 0) {
    errors.push(`DIGEST MISMATCH: no embedded digest found; recomputed ${computed}`)
  }

  const version = [...new Set(fields.get('version').values())]
  if (version.length === 1) notes.push(`version:            ${version[0]}`)
  const date = [...new Set(fields.get('revisionDate').values())]
  if (date.length === 1) notes.push(`revision date:      ${date[0]}`)
  const tip = [...new Set(fields.get('supersedesTip').values())]
  if (tip.length === 1) notes.push(`supersedes Git tip: ${tip[0]}`)

  report(root, errors, notes, computed, distinctEmbedded)
  return errors.length ? 1 : 0
}

function report(root, errors, notes, computed, distinctEmbedded) {
  console.log(`packet root:        ${root}`)
  console.log(`packet files:       ${PACKET_FILES.length}`)
  for (const n of notes) console.log(n)
  if (computed) console.log(`recomputed digest:  ${computed}`)
  if (distinctEmbedded && distinctEmbedded.length === 1) console.log(`embedded digest:    ${distinctEmbedded[0]}`)
  if (errors.length) {
    console.error('\n** PACKET IDENTITY INVALID **')
    for (const e of errors) console.error('  ' + e)
    console.error(`\n${errors.length} problem(s). A mixed-version or mixed-digest packet is INVALID and must not be`)
    console.error('issued. Regenerate with:  node tools/validate-handoff-packet.mjs --update')
  } else {
    console.log('\nPACKET IDENTITY VERIFIED — eight pages agree and the digest reproduces.')
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

function update(root) {
  const missing = PACKET_FILES.filter((rel) => !existsSync(join(root, rel)))
  if (missing.length) {
    console.error('** cannot update: packet files missing **')
    for (const rel of missing) console.error('  MISSING PACKET FILE: ' + rel)
    return 1
  }

  // Digest is computed with every embedded value replaced by the placeholder, so it does not
  // depend on whatever digest happens to be embedded right now.
  let digest
  try {
    digest = computePacketDigest(root)
  } catch (err) {
    console.error('** cannot update: packet is not in a hashable state **')
    console.error('  ' + err.message)
    console.error('  Every page needs exactly one "> - Packet content SHA-256:" line before a digest can be built.')
    return 1
  }
  console.log(`computed digest:    ${digest}`)

  for (const rel of PACKET_FILES) {
    const file = join(root, rel)
    const original = readFileSync(file, 'utf8')
    const lf = toLF(original)
    // Rewrites ONLY the packet-digest line (plus line-ending normalization). Nothing else.
    const next = lf.replace(new RegExp(DIGEST_LINE.source, DIGEST_LINE.flags), (_m, prefix) => `${prefix} \`${digest}\``)
    if (next === original) { console.log(`  unchanged  ${rel}`); continue }
    writeFileSync(file, next, 'utf8')
    console.log(`  stamped    ${rel}`)
  }

  console.log('\nre-verifying after embedding:')
  return verify(root)
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const doUpdate = argv.includes('--update')
const rootFlag = argv.indexOf('--root')
const root = rootFlag !== -1 && argv[rootFlag + 1] ? argv[rootFlag + 1] : REPO_ROOT

process.exitCode = doUpdate ? update(root) : verify(root)
