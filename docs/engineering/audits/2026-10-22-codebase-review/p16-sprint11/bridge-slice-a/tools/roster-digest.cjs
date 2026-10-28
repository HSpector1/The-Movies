// Static roster digests: parse SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS literal pairs from a runtime-checkpoint.ts copy,
// resolve its named constants, exclude one era, sort by key and sha256(JSON.stringify(pairs)) (canonicalJson of an
// array of string tuples is JSON.stringify). Usage: node roster-digest.cjs <runtime-checkpoint.ts>
const fs=require('fs'),c=require('crypto')
const src=fs.readFileSync(process.argv[2],'utf8')
const consts=Object.fromEntries([...src.matchAll(/^(?:export )?const ([A-Z0-9_]+) =\s*'(sha256:[0-9a-f]{64})'/gm)].map(m=>[m[1],m[2]]))
const body=src.slice(src.indexOf('SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS: ReadonlyMap'),src.indexOf('])',src.indexOf('SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS: ReadonlyMap')))
const pairs=[...body.matchAll(/^\s*\[(?:'(sha256:[0-9a-f]{64})'|([A-Z0-9_]+)), '([^']+)'\],/gm)].map(m=>[m[1]??consts[m[2]],m[3]])
if(pairs.some(([k])=>!k))throw new Error('unresolved constant')
const ord=(a,b)=>a<b?-1:a>b?1:0
const digest=era=>{const older=pairs.filter(([,e])=>e!==era).sort(([a],[b])=>ord(a,b));return [older.length,c.createHash('sha256').update(JSON.stringify(older)).digest('hex')]}
console.log(JSON.stringify({total:pairs.length,excluding54:digest('projection-v54'),excluding55:digest('projection-v55')}))
