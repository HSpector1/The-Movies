import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'
const root='/Users/zacheryspector/studio-scratch/1370-c0-h-m0-corrected-overlay-source-manifest-r1'
const seen=new Set()
for(const arm of ['H','M0']){
 const m=JSON.parse(fs.readFileSync(root+'/'+arm+'-SOURCE-MANIFEST.json','utf8'))
 for(const row of m.files){
  const source=fs.readFileSync(row.source,'utf8')
  const ast=ts.createSourceFile(row.destination,source,ts.ScriptTarget.Latest,true)
  assert.equal(ast.parseDiagnostics.length,0,arm+' '+row.destination+' TS parse')
  seen.add(row.source)
 }
}
assert.equal(seen.size,7,'two markets, two promises, one opportunity, witness and test share count')
console.log('OVERLAY_TYPESCRIPT_PARSE_PASS',seen.size,'distinct source files across H/M0')
