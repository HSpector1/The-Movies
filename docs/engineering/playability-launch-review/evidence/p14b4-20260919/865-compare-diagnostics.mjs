// Supplement compare-failures-c2.mjs with the complete primary diagnostic body.
// Usage: node 865-compare-diagnostics.mjs <baseline.txt> <candidate.txt>
// Raw logs are never edited. Adjacent FAIL headers can share one Vitest diagnostic.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const digest = text => createHash('sha256').update(text).digest('hex')

function failures(path) {
  const rows = new Map()
  let identities = []
  let body = []
  const flush = () => {
    if (identities.length === 0) return
    // The diagnostic ends at the first stack/source frame. Preserve every line of
    // its expected/received diff; source-line shifts are not changed causes.
    const frame = body.findIndex(line => /^\s*(?:❯\s|at\s)/u.test(line))
    const diagnostic = body.slice(0, frame === -1 ? undefined : frame)
      .map(line => line.trimEnd()).join('\n').trim()
    for (const identity of identities) {
      if (rows.has(identity)) throw new Error(`Duplicate detailed failure: ${identity}`)
      rows.set(identity, { diagnostic, diagnosticSha256: digest(diagnostic) })
    }
    identities = []
    body = []
  }
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const header = /^ FAIL \|(\w+)\|  (.+)$/.exec(line)
    if (header) {
      if (body.some(part => part.trim() !== '')) flush()
      identities.push(`${header[1]} :: ${header[2].trim()}`)
      continue
    }
    if (/^⎯.*\[\d+\/\d+\]/u.test(line) || /^ Test Files\s/u.test(line)) {
      flush()
      continue
    }
    if (identities.length > 0) body.push(line)
  }
  flush()
  return rows
}

const [baselinePath, candidatePath] = process.argv.slice(2)
if (!baselinePath || !candidatePath) throw new Error('Pass a completed baseline and candidate log.')
for (const path of [baselinePath, candidatePath]) {
  if (!/^ Test Files\s/mu.test(readFileSync(path, 'utf8'))) {
    throw new Error(`Refusing unfinished test log: ${path}`)
  }
}
const baseline = failures(baselinePath)
const candidate = failures(candidatePath)
const rows = { new: [], vanished: [], retainedIdenticalDiagnostic: [], retainedChangedDiagnostic: [] }
for (const [id, after] of candidate) {
  const before = baseline.get(id)
  if (before === undefined) rows.new.push({ id, ...after })
  else if (before.diagnostic === after.diagnostic) {
    rows.retainedIdenticalDiagnostic.push({ id, diagnosticSha256: after.diagnosticSha256 })
  } else rows.retainedChangedDiagnostic.push({ id, before, after })
}
for (const [id, before] of baseline) if (!candidate.has(id)) rows.vanished.push({ id, ...before })
console.log(JSON.stringify({ baselinePath, candidatePath, baselineCount: baseline.size,
  candidateCount: candidate.size, counts: Object.fromEntries(Object.entries(rows).map(([key, value]) => [key, value.length])),
  comparison: 'Complete primary diagnostics, excluding stack frames and following source excerpts; original logs retained.',
  ...rows }, null, 2))
