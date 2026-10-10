// UNRUN pure candidate. No game imports, object-result cache or startup work.
import assert from 'node:assert/strict'
export const MAX = 16 * 1024**2
export function boundedJson(value, limit=MAX) {
  // Standard native Array/String/Buffer builtins are assumed. Fresh owned chunks only.
  const chunks=[]; let pending=[], pendingBytes=0, bytes=0, keyBytes=0; const visiting=new Set(), keys=new Map()
  const flush = () => { if(pending.length){chunks.push(Buffer.from(pending.join('')));pending=[];pendingBytes=0} }
  const add = (text, size) => {
    const next=bytes+size; const withinLimit=next<=limit;if(!withinLimit)assert.ok(withinLimit,'STOP_JSON_CAP'); bytes=next
    if(pending.length>=4096 || pendingBytes+size>65536)flush()
    if(size>65536){chunks.push(Buffer.from(text));return}
    pending.push(text);pendingBytes+=size
  }
  const stringToken = value => {
    const withinLimit=Buffer.byteLength(value)<=limit;if(!withinLimit)assert.ok(withinLimit,'STOP_STRING_CAP')
    if (!/[\u0080-\uffff]/.test(value)) return ['"' + value + '"', value.length + 2]
    const text=JSON.stringify(value); return [text,Buffer.byteLength(text)]
  }
  const atom = value => {
    const jsonAtom=typeof value!=='bigint' && typeof value!=='function' && typeof value!=='symbol';if(!jsonAtom)assert.ok(jsonAtom,'STOP_NON_JSON')
    if (typeof value==='string') {const token=stringToken(value);add(token[0],token[1]);return}
    if (typeof value==='number') {const finite=Number.isFinite(value);if(!finite)assert.ok(finite,'STOP_NON_FINITE');const text=String(value);add(text,text.length);return}
    if (value===null) {add('null',4);return}
    if (typeof value==='boolean') {add(value?'true':'false',value?4:5);return}
    // emit rejects undefined before atom; retain the baseline's remaining law.
    const text=JSON.stringify(value);add(text,Buffer.byteLength(text))
  }
  const key = value => {
    let token=keys.get(value)
    if (token!==undefined) {add(token[0],token[1]);return}
    token=stringToken(value);add(token[0],token[1])
    const next=keyBytes+token[1];const withinLimit=next<=limit;if(!withinLimit)assert.ok(withinLimit,'STOP_JSON_CAP');keyBytes=next;keys.set(value,token)
  }
  function emit(v) {
    if (v===null || typeof v!=='object') { const defined=v!==undefined;if(!defined)assert.notEqual(v,undefined); atom(v); return }
    const acyclic=!visiting.has(v);if(!acyclic)assert.ok(acyclic,'STOP_CYCLE'); visiting.add(v)
    const ordinary=!Object.hasOwn(v,'toJSON');if(!ordinary)assert.ok(ordinary,'STOP_CUSTOM_JSON')
    if (Array.isArray(v)) {
      add('[',1); for(let i=0;i<v.length;i++){if(i)add(',',1); if(v[i]===undefined)add('null',4);else emit(v[i])} add(']',1)
    } else {
      add('{',1);let count=0
      for(const name of Object.keys(v)){if(v[name]===undefined)continue;if(count++)add(',',1);key(name);add(':',1);emit(v[name])}add('}',1)
    }
    visiting.delete(v)
  }
  emit(value);flush();return Buffer.concat(chunks,bytes)
}
