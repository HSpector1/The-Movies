export const NATIVE_ROW_SCHEMA = 'c0-m0-promise-feasibility/v3-native-canonical';
export class NativeObserverFormatError extends Error {
  constructor(code) { super(code); this.name = 'NativeObserverFormatError'; this.code = code; }
}
export function createObserverFailureLatch() {
  let failed = false, error;
  return Object.freeze({
    record(value) { if (!failed) { failed = true; error = value; } },
    throwIfFailed() { if (failed) throw error; },
    first() { return Object.freeze({ failed, error }); },
  });
}
export function boundedCanonicalBytes(text) {
  if (typeof text !== 'string') throw new NativeObserverFormatError('FORMAT_INVALID');
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) bytes++;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length
      && text.charCodeAt(i + 1) >= 0xdc00 && text.charCodeAt(i + 1) <= 0xdfff) { bytes += 4; i++; }
    else bytes += 3;
    if (bytes > 16384) return bytes;
  }
  return bytes;
}
function exactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new NativeObserverFormatError('FORMAT_INVALID');
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) throw new NativeObserverFormatError('FORMAT_INVALID');
  const names=Reflect.ownKeys(value);
  if(names.length!==keys.length || names.some(k=>typeof k!=='string'||!keys.includes(k)))throw new NativeObserverFormatError('FORMAT_INVALID');
  for(const k of names){const d=Object.getOwnPropertyDescriptor(value,k);
    if(!Object.hasOwn(d,'value')||!d.enumerable)throw new NativeObserverFormatError('FORMAT_INVALID');}
  if(proto&&Object.getOwnPropertyDescriptor(proto,'toJSON'))throw new NativeObserverFormatError('FORMAT_INVALID');
}
function boundedJSONSize(value, limit, maxDepth=64, maxNodes=16384) {
  let size = 0, nodes = 0; const ancestors = new Set();
  const add = n => { size += n; if (size > limit) throw new NativeObserverFormatError('CANONICAL_OVER_BOUND'); };
  const visit = (v, depth, keyOnly=false) => {
    if (!keyOnly && (++nodes > maxNodes || depth > maxDepth)) throw new NativeObserverFormatError('STRUCTURE_OVER_BOUND');
    if (v === null) { add(4); return; }
    if (typeof v === 'string') {
      if (v.length > limit) throw new NativeObserverFormatError('CANONICAL_OVER_BOUND');
      add(2);
      for (let i=0;i<v.length;i++) { const c=v.charCodeAt(i);
        if (c===34 || c===92 || [8,9,10,12,13].includes(c)) add(2);
        else if (c<32) add(6); else if(c<128)add(1);else if(c<2048)add(2);
        else if(c>=0xd800&&c<=0xdbff&&i+1<v.length&&v.charCodeAt(i+1)>=0xdc00&&v.charCodeAt(i+1)<=0xdfff){add(4);i++;}
        else if(c>=0xd800&&c<=0xdfff)add(6);else add(3);
      } return;
    }
    if(typeof v==='boolean'){add(v?4:5);return;}
    if(typeof v==='number'&&Number.isFinite(v)){add(JSON.stringify(v).length);return;}
    if(!v||typeof v!=='object'||ancestors.has(v))throw new NativeObserverFormatError('FORMAT_INVALID');
    const proto=Object.getPrototypeOf(v);
    if(proto!==Object.prototype&&proto!==Array.prototype&&proto!==null)throw new NativeObserverFormatError('FORMAT_INVALID');
    if(Object.getOwnPropertyDescriptor(v,'toJSON')||(proto&&Object.getOwnPropertyDescriptor(proto,'toJSON')))throw new NativeObserverFormatError('FORMAT_INVALID');
    const own=Reflect.ownKeys(v);
    if(own.length>16385)throw new NativeObserverFormatError('STRUCTURE_OVER_BOUND');
    if(own.some(k=>typeof k!=='string'))throw new NativeObserverFormatError('FORMAT_INVALID');
    for(const k of own){if(Array.isArray(v)&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(v,k);
      if(!d.enumerable||!Object.hasOwn(d,'value'))throw new NativeObserverFormatError('FORMAT_INVALID');}
    if(Array.isArray(v)&&own.length!==v.length+1)throw new NativeObserverFormatError('FORMAT_INVALID');
    ancestors.add(v);add(2);let first=true;
    if(Array.isArray(v)) {
      if(v.length>16384)throw new NativeObserverFormatError('STRUCTURE_OVER_BOUND');
      for(let i=0;i<v.length;i++){if(++nodes>maxNodes)throw new NativeObserverFormatError('STRUCTURE_OVER_BOUND');
        const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!Object.hasOwn(d,'value'))throw new NativeObserverFormatError('FORMAT_INVALID');
        if(i)add(1);visit(d.value,depth+1);}
    }else for(const k in v){if(!Object.hasOwn(v,k))continue;if(++nodes>maxNodes)throw new NativeObserverFormatError('STRUCTURE_OVER_BOUND');
      const d=Object.getOwnPropertyDescriptor(v,k);if(!Object.hasOwn(d,'value'))throw new NativeObserverFormatError('FORMAT_INVALID');
      if(!first)add(1);first=false;visit(k,depth+1,true);add(1);visit(d.value,depth+1);}
    ancestors.delete(v);
  };visit(value,1);return size;
}
function structure(value) {
  const stack = [{ value, depth: 1 }]; let visited = 0;
  while (stack.length) {
    const item = stack.pop();
    if (++visited > 16384 || item.depth > 64) throw new NativeObserverFormatError('STRUCTURE_OVER_BOUND');
    const v = item.value;
    if (v === null || typeof v === 'string' || typeof v === 'boolean') continue;
    if (typeof v === 'number') { if (!Number.isFinite(v)) throw new NativeObserverFormatError('FORMAT_INVALID'); continue; }
    if (!v || typeof v !== 'object') throw new NativeObserverFormatError('FORMAT_INVALID');
    // Parsed JSON is plain and bounded by 16 KiB. No caller objects enter this traversal.
    const keys = Object.keys(v);
    if (visited + keys.length > 16384) throw new NativeObserverFormatError('STRUCTURE_OVER_BOUND');
    visited += keys.length;
    for (let i = keys.length - 1; i >= 0; i--) stack.push({ value: v[keys[i]], depth: item.depth + 1 });
  }
}
function deepFreeze(value) {
  const stack = [value];
  while (stack.length) { const v = stack.pop(); if (!v || typeof v !== 'object') continue;
    for (const k of Object.keys(v)) stack.push(v[k]); Object.freeze(v); }
  return value;
}
export function freezeOwnedPhysicalRow(value) { return deepFreeze(value); }
export function createNativeRowCodec({ latch }) {
  const fail = code => { throw new NativeObserverFormatError(code); };
  const guarded = fn => (...args) => { latch.throwIfFailed(); try { return fn(...args); }
    catch (error) { latch.record(error); throw error; } };
  function encode(original) {
    exactKeys(original, ['canonicalInputs', 'inputBytes', 'inputsDigest']);
    const bytes = boundedCanonicalBytes(original.canonicalInputs);
    if (bytes > 16384) fail('CANONICAL_OVER_BOUND');
    if (!Number.isInteger(original.inputBytes) || original.inputBytes !== bytes
      || typeof original.inputsDigest !== 'string' || boundedCanonicalBytes(original.inputsDigest)>16384) fail('FORMAT_INVALID');
    const tuple = JSON.parse(original.canonicalInputs);
    if (!Array.isArray(tuple)) fail('FORMAT_INVALID');
    structure(tuple);
    if (JSON.stringify(tuple) !== original.canonicalInputs) fail('CANONICAL_ROUNDTRIP');
    return deepFreeze({ canonicalInputsEncoding: 'native-json-tuple/v1', canonicalInputsTuple: tuple,
      inputBytes: original.inputBytes, inputsDigest: original.inputsDigest });
  }
  function decode(native) {
    exactKeys(native, ['canonicalInputsEncoding', 'canonicalInputsTuple', 'inputBytes', 'inputsDigest']);
    if (native.canonicalInputsEncoding !== 'native-json-tuple/v1' || !Array.isArray(native.canonicalInputsTuple)
      || !Number.isInteger(native.inputBytes) || native.inputBytes < 0 || native.inputBytes > 16384
      || typeof native.inputsDigest !== 'string' || boundedCanonicalBytes(native.inputsDigest)>16384) fail('FORMAT_INVALID');
    boundedJSONSize(native.canonicalInputsTuple, 16384);
    // Only sink-owned immutable parsed rows are eligible; avoid accessor/toJSON execution.
    const stack = [{ value: native.canonicalInputsTuple, depth: 1 }]; let nodes = 0;
    while (stack.length) {
      const { value, depth } = stack.pop();
      if (++nodes > 16384 || depth > 64) fail('STRUCTURE_OVER_BOUND');
      if (value === null || ['string','boolean'].includes(typeof value)) continue;
      if (typeof value === 'number') { if (!Number.isFinite(value)) fail('FORMAT_INVALID'); continue; }
      if (!value || typeof value !== 'object') fail('FORMAT_INVALID');
      const ds = Object.getOwnPropertyDescriptors(value), keys = Object.keys(value);
      if (nodes + keys.length > 16384) fail('STRUCTURE_OVER_BOUND'); nodes += keys.length;
      for (const k of keys) { if (!Object.hasOwn(ds[k], 'value')) fail('FORMAT_INVALID'); stack.push({ value: ds[k].value, depth: depth + 1 }); }
    }
    const canonical = JSON.stringify(native.canonicalInputsTuple), bytes = boundedCanonicalBytes(canonical);
    if (bytes > 16384) fail('CANONICAL_OVER_BOUND');
    if (bytes !== native.inputBytes) fail('FORMAT_INVALID');
    return Object.freeze({ canonicalInputs: canonical, inputBytes: bytes, inputsDigest: native.inputsDigest });
  }
  function legacy(row) {
    exactKeys(row, ['schema','sequence','occurrence','context','kind','detail']);
    if (row.schema !== NATIVE_ROW_SCHEMA || !Number.isInteger(row.sequence) || row.sequence < 0
      || !Number.isInteger(row.occurrence) || row.occurrence < 0 || typeof row.kind !== 'string') fail('FORMAT_INVALID');
    if (boundedJSONSize(row, 16383, 66, 16512) + 1 > 16384) fail('FORMAT_INVALID');
    const physical = JSON.stringify(row) + '\n';
    if (new TextEncoder().encode(physical).length > 16384) fail('FORMAT_INVALID');
    return Object.freeze({ ...row, schema: 'c0-m0-feasibility/v1',
      detail: row.kind === 'inputTuple' ? decode(row.detail) : row.detail });
  }
  const diagnostic = fn => detail => {
    try {
      const first=latch.first();
      if(!first.failed || !(first.error instanceof Error) || first.error.name!=='Error'
        || first.error.message!=='M0 feasibility row byte bound exceeded') fail('FORMAT_INVALID');
      return fn(detail);
    } catch(error) { latch.record(error); throw error; }
  };
  return Object.freeze({ encodeInputDetail: guarded(encode), decodeInputDetail: guarded(decode), legacyRow: guarded(legacy),
    encodeInputDetailForDiagnostic: diagnostic(encode), decodeInputDetailForDiagnostic: diagnostic(decode) });
}
