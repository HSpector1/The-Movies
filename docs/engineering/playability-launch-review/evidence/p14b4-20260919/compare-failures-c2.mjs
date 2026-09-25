// Failure identity comparison between two vitest run logs (the 772 .txt shape).
// usage: node compare-failures-c2.mjs <baseline.txt> <candidate.txt>
// Identity = the full " FAIL |project|  file > suite > test" header; cause = the first
// non-empty line after that header in the detailed error section. Prints NEW, VANISHED,
// RETAINED-SAME-CAUSE and RETAINED-CHANGED-CAUSE, never collapsing them into one count.
import { readFileSync } from 'node:fs'

function failures(path) {
  const lines = readFileSync(path, 'utf8').split('\n')
  const out = new Map()
  for (let i = 0; i < lines.length; i++) {
    const m = /^ FAIL \|(\w+)\|  (.+)$/.exec(lines[i])
    if (!m) continue
    const id = `${m[1]} :: ${m[2].trim()}`
    let cause = ''
    for (let j = i + 1; j < Math.min(lines.length, i + 8); j++) {
      const text = lines[j].trim()
      if (text === '' || text.startsWith('FAIL ')) continue
      cause = text.replace(/\/var\/folders\/\S+/g, '<tmp>').slice(0, 240)
      break
    }
    // The summary list repeats each header with no cause after it; keep a caused entry.
    if (!out.has(id) || (out.get(id) === '' && cause !== '')) out.set(id, cause)
  }
  return out
}

const [basePath, candPath] = process.argv.slice(2)
const base = failures(basePath)
const cand = failures(candPath)
const rows = { NEW: [], VANISHED: [], RETAINED_SAME_CAUSE: [], RETAINED_CHANGED_CAUSE: [] }
for (const [id, cause] of cand) {
  if (!base.has(id)) rows.NEW.push({ id, cause })
  else if (base.get(id) === cause) rows.RETAINED_SAME_CAUSE.push({ id })
  else rows.RETAINED_CHANGED_CAUSE.push({ id, before: base.get(id), after: cause })
}
for (const [id, cause] of base) if (!cand.has(id)) rows.VANISHED.push({ id, cause })
console.log(JSON.stringify({
  baseline: basePath, candidate: candPath, baselineCount: base.size, candidateCount: cand.size,
  counts: Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.length])), ...rows,
}, null, 2))
