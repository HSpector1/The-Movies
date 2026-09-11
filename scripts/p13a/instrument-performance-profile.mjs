import ts from 'typescript'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const [originalDirectory, outputDirectory] = process.argv.slice(2)
const originalPath = originalDirectory + '/performance-profile.mjs'
const original = readFileSync(originalPath, 'utf8')
const binding = JSON.parse(readFileSync(originalDirectory + '/performance-profile-binding.json', 'utf8'))
const sha = value => createHash('sha256').update(value).digest('hex')
if (sha(original) !== binding.bundleSha256) throw new Error('Original frozen diagnostic bundle changed')
const parsed = ts.createSourceFile(originalPath, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
const names = ['validateTechnology', 'validateSaveV20']
const edits = [], wrapped = []
for (const node of parsed.statements) {
  if (!ts.isFunctionDeclaration(node) || !node.name || !names.includes(node.name.text) || !node.body) continue
  const name = node.name.text
  const begin = node.body.getStart(parsed)+1, end = node.body.end-1
  edits.push({ start: begin, end, replacement: `
  const __p13ProfileStart = performance.now();
  try {${original.slice(begin,end)}
  } finally {
    const __p13ProfileElapsed = performance.now() - __p13ProfileStart;
    const __p13ProfileTotals = globalThis.__p13Perf02Components ??= {};
    const __p13ProfileKey = ${JSON.stringify(name)} + ':' + phase;
    const __p13ProfileRow = __p13ProfileTotals[__p13ProfileKey] ??= { functionName: ${JSON.stringify(name)}, phase, calls: 0, totalMs: 0, callMs: [] };
    __p13ProfileRow.calls++; __p13ProfileRow.totalMs += __p13ProfileElapsed; __p13ProfileRow.callMs.push(__p13ProfileElapsed);
  }
` })
  wrapped.push({ name, originalStart: begin, originalEnd: end, originalBodySha256: sha(original.slice(begin,end)) })
}
if (wrapped.length !== names.length || names.some(name => !wrapped.some(row => row.name === name))) throw new Error('Exact diagnostic functions not found once')
const reportWrite = 'writeFileSync(directory + "/profile-report.json", JSON.stringify(report, null, 2));'
const position = original.indexOf(reportWrite)
if (position < 0 || original.indexOf(reportWrite, position+1) !== -1) throw new Error('Exact final report write not found once')
edits.push({ start: position, end: position, replacement: 'report.componentInstrumentation = { qualification: "Diagnostic-only try/finally wall and call counts. Full validator contains technology validation; totals overlap and must not be summed. Same transformation is applied before/after. Not acceptance timing.", functions: Object.values(globalThis.__p13Perf02Components ?? {}) };\n  ' })
let instrumented = original
for (const edit of edits.sort((a,b) => b.start-a.start)) instrumented = instrumented.slice(0,edit.start)+edit.replacement+instrumented.slice(edit.end)
mkdirSync(outputDirectory, { recursive: true })
writeFileSync(outputDirectory + '/performance-profile.mjs', instrumented)
const result = { recordedAt: new Date().toISOString(), originalDirectory, originalBinding: binding,
  originalBundleSha256: sha(original), instrumenterSha256: sha(readFileSync(new URL(import.meta.url))), wrapped,
  instrumentedBundleSha256: sha(instrumented), instrumentedBundleBytes: Buffer.byteLength(instrumented),
  qualification: 'Only a copy of the emitted diagnostic executable was transformed. Product source and original frozen diagnostic bundles remain unchanged. No validation removed; try/finally preserves every return/throw. Nested totals are not additive; diagnostic instrumentation is excluded from acceptance benchmarks.' }
writeFileSync(outputDirectory + '/instrumentation-binding.json', JSON.stringify(result,null,2))
console.log(JSON.stringify({ outputDirectory, instrumentedBundleSha256: result.instrumentedBundleSha256, instrumentedBundleBytes: result.instrumentedBundleBytes, wrapped: wrapped.map(row => row.name) }))
