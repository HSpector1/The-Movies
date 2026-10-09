// UNRUN pure candidate. No game imports, object-result cache or startup work.
import assert from 'node:assert/strict'
export const MAX = 16 * 1024**2
export function boundedJson(value, limit=MAX) {
  const pieces=[]; let bytes=0, keyBytes=0; const visiting=new Set(), keys=new Map()
  const add = (text, size) => { const next=bytes+size; assert.ok(next<=limit,'STOP_JSON_CAP'); bytes=next; pieces.push(text) }
  const stringToken = value => {
    assert.ok(Buffer.byteLength(value)<=limit,'STOP_STRING_CAP')
    const text=JSON.stringify(value); return [text,Buffer.byteLength(text)]
  }
  const atom = value => {
    assert.ok(typeof value!=='bigint' && typeof value!=='function' && typeof value!=='symbol','STOP_NON_JSON')
    if (typeof value==='string') {const token=stringToken(value);add(token[0],token[1]);return}
    if (typeof value==='number') {assert.ok(Number.isFinite(value),'STOP_NON_FINITE');const text=String(value);add(text,text.length);return}
    if (value===null) {add('null',4);return}
    if (typeof value==='boolean') {add(value?'true':'false',value?4:5);return}
    // emit rejects undefined before atom; retain the baseline's remaining law.
    const text=JSON.stringify(value);add(text,Buffer.byteLength(text))
  }
  const key = value => {
    let token=keys.get(value)
    if (token!==undefined) {add(token[0],token[1]);return}
    token=stringToken(value);add(token[0],token[1])
    const next=keyBytes+token[1];assert.ok(next<=limit,'STOP_JSON_CAP');keyBytes=next;keys.set(value,token)
  }
  function emit(v) {
    if (v===null || typeof v!=='object') { assert.notEqual(v,undefined); atom(v); return }
    assert.ok(!visiting.has(v),'STOP_CYCLE'); visiting.add(v)
    assert.ok(!Object.hasOwn(v,'toJSON'),'STOP_CUSTOM_JSON')
    if (Array.isArray(v)) {
      add('[',1); for(let i=0;i<v.length;i++){if(i)add(',',1); if(v[i]===undefined)add('null',4);else emit(v[i])} add(']',1)
    } else {
      add('{',1);let count=0
      for(const name of Object.keys(v)){if(v[name]===undefined)continue;if(count++)add(',',1);key(name);add(':',1);emit(v[name])}add('}',1)
    }
    visiting.delete(v)
  }
  emit(value);return Buffer.from(pieces.join(''))
}
