import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'

const here = new URL('.', import.meta.url).pathname
const old = resolve(here, '../1370-c0-m0-feasibility-hook-overlay-r9-propagation-correction')
const current = here
const schema = 'c0-m0-market-decision/v2-step12'
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
function sourceOf(base) { return readFileSync(resolve(base, 'diagnostic.test.ts'), 'utf8') }
function finalBinding(source) {
  const ast = ts.createSourceFile('diagnostic.test.ts', source, ts.ScriptTarget.Latest, true)
  const constants = new Map()
  let m0 = null, validator = null, call = false
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer &&
        ['M0_MARKET_SCHEMA', 'OBSERVER_SCHEMA'].includes(node.name.text)) constants.set(node.name.text, node.initializer.getText(ast))
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'm0') m0 = node.initializer.getText(ast)
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'validateM0MarketRows') validator = node.getText(ast)
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'validateM0MarketRows' && node.arguments[0]?.getText(ast) === 'm0Rows') call = true
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return {constants, m0, validator, call}
}
const prior = finalBinding(sourceOf(old))
assert.equal(prior.m0?.includes("schema: 'c0-m0-market-decision/v1'"), true, 'r9 RED: mislabeled final.m0')
const now = finalBinding(sourceOf(current))
assert.equal(now.constants.get('M0_MARKET_SCHEMA'), `'${schema}'`)
assert.equal(now.constants.get('OBSERVER_SCHEMA'), "'c0-external-observer/v1'", 'external trace remains v1')
assert.ok(now.m0?.includes('schema: M0_MARKET_SCHEMA') && now.m0.includes('sha256: sha(m0Bytes)') && now.m0.includes('rows: m0Rows.length'), 'final consumer binding')
assert.equal(now.call, true, 'consumer validates rows before final write')
assert.ok(now.validator)
const js = ts.transpileModule(now.validator, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS}}).outputText
const context = {assert, M0_MARKET_SCHEMA: schema, endWeek: 416}
vm.runInNewContext(js + '\nthis.validateM0MarketRows = validateM0MarketRows', context)
const validate = context.validateM0MarketRows
for (const era of ['H', 'M0']) {
  const market = readFileSync(resolve(current, era === 'H' ? 'historical-talentMarket.ts' : 'modern-talentMarket.ts'), 'utf8')
  assert.ok(market.includes(`schema: '${schema}'`), `${era} producer row schema`)
  const rows = [
    {schema, sequence: 0, week: 196, phase: 'candidateFeasibility', era},
    {schema, sequence: 1, week: 208, phase: 'freezeStart', era},
  ]
  validate(rows)
  const bytes = rows.map(row => JSON.stringify(row)).join('\n') + '\n'
  const final = {m0: {schema, sha256: sha(bytes), rows: rows.length}}
  const readback = bytes.trimEnd().split('\n').map(JSON.parse)
  validate(readback)
  assert.equal(final.m0.schema, readback[0].schema)
  assert.equal(final.m0.rows, readback.length)
  assert.equal(final.m0.sha256, sha(bytes))
  assert.throws(() => validate([{...rows[0], schema: 'c0-m0-market-decision/v1'}]), /market decision row schema/)
  assert.throws(() => validate([{...rows[0], sequence: 1}]), /market decision row source sequence/)
  assert.throws(() => validate([]), /nonempty/)
  assert.throws(() => validate([null]), /row is an object/)
  assert.throws(() => validate([{...rows[0], week: 417}]), /row week/)
  assert.notEqual('c0-m0-market-decision/v1', final.m0.schema, 'prior trace label is not relabeled')
}
console.log('R10_SCHEMA_CONSUMER_RED_PASS_H_M0')
