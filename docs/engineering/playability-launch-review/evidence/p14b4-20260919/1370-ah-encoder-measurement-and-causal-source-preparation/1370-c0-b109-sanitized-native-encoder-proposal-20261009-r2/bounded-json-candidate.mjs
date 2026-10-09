// UNRUN pure bounded sanitized-clone candidate. No original-container serialization.
import assert from 'node:assert/strict'
export const MAX = 16 * 1024**2
export function boundedJson(value, limit=MAX) {
  let bytes=0, keyBytes=0
  const visiting=new Set(), keys=new Map()
  const add = size => {bytes+=size;assert.ok(bytes<=limit,'STOP_JSON_CAP')}
  const stringSize = value => {
    assert.ok(Buffer.byteLength(value)<=limit,'STOP_STRING_CAP')
    return Buffer.byteLength(JSON.stringify(value))
  }
  const key = name => {
    let size=keys.get(name)
    if(size===undefined){size=stringSize(name);add(size);keyBytes+=size;assert.ok(keyBytes<=limit,'STOP_JSON_CAP');keys.set(name,size)}
    else add(size)
  }
  function emit(v) {
    if(v===null || typeof v!=='object') {
      assert.notEqual(v,undefined)
      assert.ok(typeof v!=='bigint' && typeof v!=='function' && typeof v!=='symbol','STOP_NON_JSON')
      if(typeof v==='string')add(stringSize(v))
      else if(typeof v==='number'){assert.ok(Number.isFinite(v),'STOP_NON_FINITE');add(String(v).length)}
      else if(v===null)add(4)
      else add(v?4:5)
      return v
    }
    assert.ok(!visiting.has(v),'STOP_CYCLE');visiting.add(v)
    assert.ok(!Object.hasOwn(v,'toJSON'),'STOP_CUSTOM_JSON')
    let clone
    if(Array.isArray(v)) {
      clone=[];Object.setPrototypeOf(clone,null)
      add(1)
      for(let i=0;i<v.length;i++){
        if(i)add(1)
        // Preserve the first undefined check and, only when defined, second read.
        let item
        if(v[i]===undefined){add(4);item=null}else item=emit(v[i])
        clone[i]=item
      }
      add(1)
    } else {
      clone=Object.create(null);add(1);let count=0;const emitted=[]
      for(const name of Object.keys(v)){
        if(v[name]===undefined)continue
        if(count++)add(1)
        key(name);add(1)
        clone[name]=emit(v[name]);emitted.push(name)
      }
      add(1)
      // Compare owned data only; native serialization never observes the source.
      const ordinary=Object.keys(clone)
      if(emitted.some((name,i)=>name!==ordinary[i])){
        const handler=Object.create(null)
        handler.ownKeys=()=>emitted
        clone=new Proxy(clone,handler)
      }
    }
    visiting.delete(v);return clone
  }
  const clone=emit(value)
  // Every output byte has been admitted before native container serialization.
  const text=JSON.stringify(clone)
  assert.equal(Buffer.byteLength(text),bytes,'STOP_CERTIFIED_SIZE_MISMATCH')
  return Buffer.from(text)
}
