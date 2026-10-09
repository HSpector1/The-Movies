// Pure bounded artifact helpers. No game imports or startup side effects.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { constants, openSync, closeSync, fstatSync, lstatSync, realpathSync, readdirSync, readSync, writeSync, fsyncSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync, inflateRawSync } from 'node:zlib'
export const MAX = 16 * 1024**2
export const TOTAL = 256 * 1024**2
export const RESERVE = 128 * 1024
export const sha = raw => createHash('sha256').update(raw).digest('hex')
const identity = s => [s.dev,s.ino,s.size,s.mtimeMs,s.ctimeMs,s.mode,s.nlink]
export function boundedJson(value, limit=MAX) {
  const pieces=[]; let bytes=0; const visiting=new Set()
  const add = text => { bytes+=Buffer.byteLength(text); assert.ok(bytes<=limit,'STOP_JSON_CAP'); pieces.push(text) }
  const atom = value => {
    assert.ok(typeof value!=='bigint' && typeof value!=='function' && typeof value!=='symbol','STOP_NON_JSON')
    if (typeof value==='string') assert.ok(Buffer.byteLength(value)<=limit,'STOP_STRING_CAP')
    if (typeof value==='number') assert.ok(Number.isFinite(value),'STOP_NON_FINITE')
    return JSON.stringify(value)
  }
  function emit(v) {
    if (v===null || typeof v!=='object') { assert.notEqual(v,undefined); add(atom(v)); return }
    assert.ok(!visiting.has(v),'STOP_CYCLE'); visiting.add(v)
    assert.ok(!Object.hasOwn(v,'toJSON'),'STOP_CUSTOM_JSON')
    if (Array.isArray(v)) {
      add('['); for(let i=0;i<v.length;i++){if(i)add(','); if(v[i]===undefined)add('null');else emit(v[i])} add(']')
    } else {
      add('{');let count=0
      for(const key of Object.keys(v)){if(v[key]===undefined)continue;if(count++)add(',');add(atom(key));add(':');emit(v[key])}add('}')
    }
    visiting.delete(v)
  }
  emit(value);return Buffer.from(pieces.join(''))
}
export function jsonLine(value) {const raw=boundedJson(value,MAX-1);return Buffer.concat([raw,Buffer.from('\n')])}
export function openRegular(path) {
  assert.equal(realpathSync(path),path,'STOP_PHYSICAL_INPUT');const before=lstatSync(path)
  assert.ok(before.isFile() && before.nlink===1 && constants.O_NOFOLLOW,'STOP_REGULAR_INPUT')
  const fd=openSync(path,constants.O_RDONLY|constants.O_NOFOLLOW);try{assert.deepEqual(identity(fstatSync(fd)),identity(before),'STOP_OPEN_RACE');return fd}catch(error){closeSync(fd);throw error}
}
export function boundedFile(path) {
  const fd=openRegular(path)
  try {const s=fstatSync(fd);assert.ok(s.size<=MAX,'STOP_SINGLE_JSON_CAP');const raw=Buffer.alloc(s.size);let got=0
    while(got<raw.length){const n=readSync(fd,raw,got,raw.length-got,got);assert.ok(n>0,'STOP_TRUNCATED');got+=n}
    assert.deepEqual(identity(fstatSync(fd)),identity(s),'STOP_READ_RACE');assert.deepEqual(identity(lstatSync(path)),identity(s),'STOP_PATH_RACE');return raw
  } finally {closeSync(fd)}
}
export function fileSha(path) {
  const fd=openRegular(path);const hash=createHash('sha256');const chunk=Buffer.alloc(1024**2)
  try {const before=fstatSync(fd);let n;while((n=readSync(fd,chunk,0,chunk.length,null)))hash.update(chunk.subarray(0,n));assert.deepEqual(identity(fstatSync(fd)),identity(before));assert.deepEqual(identity(lstatSync(path)),identity(before));return hash.digest('hex')}finally{closeSync(fd)}
}
const CRC_TABLE = Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);return c>>>0})
export function crc32(raw) {let crc=0xffffffff;for(const b of raw)crc=(crc>>>8)^CRC_TABLE[(crc^b)&255];return (crc^0xffffffff)>>>0}
export function decodeMember(compressed) {
  assert.ok(compressed.length>18 && compressed.length<=MAX,'STOP_COMPRESSED_MEMBER_CAP')
  // Both authenticated original observer and this writer use gzipSync: fixed
  // ten-byte no-option header. Unsupported headers refuse, never get repinned.
  assert.ok(compressed[0]===31 && compressed[1]===139 && compressed[2]===8 && compressed[3]===0,'STOP_GZIP_HEADER')
  const info=inflateRawSync(compressed.subarray(10),{maxOutputLength:MAX,info:true})
  const raw=info.buffer;const used=info.engine.bytesWritten
  assert.ok(raw.length<=MAX && used>0 && 10+used+8===compressed.length,'STOP_GZIP_SINGLE_MEMBER_OR_TAIL')
  assert.equal(compressed.readUInt32LE(10+used),crc32(raw),'STOP_GZIP_CRC')
  assert.equal(compressed.readUInt32LE(14+used),raw.length>>>0,'STOP_GZIP_LENGTH')
  assert.ok(raw.length>0 && raw[raw.length-1]===10 && raw.indexOf(10)===raw.length-1,'STOP_SINGLE_JSON_LINE')
  return raw
}
export function readMember(fd, locator) {
  const before=fstatSync(fd);const start=locator.gzipOffsetStart,end=locator.gzipOffsetEnd
  assert.ok(Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&end>start&&end<=before.size&&end-start<=MAX,'STOP_LOCATOR')
  const compressed=Buffer.alloc(end-start);let got=0
  while(got<compressed.length){const n=readSync(fd,compressed,got,compressed.length-got,start+got);assert.ok(n>0,'STOP_MEMBER_TRUNCATED');got+=n}
  assert.deepEqual(identity(fstatSync(fd)),identity(before),'STOP_MEMBER_READ_RACE')
  const raw=decodeMember(compressed);assert.equal(raw.length,locator.bytes,'STOP_MEMBER_BYTES');assert.equal(sha(raw),locator.sha256,'STOP_MEMBER_HASH');return raw
}
export function parseRow(raw,week,role,seed) {
  assert.ok(raw.length<=MAX);const row=JSON.parse(raw.toString('utf8'))
  assert.equal(row.boundary,week);assert.equal(row.week,week);assert.equal(row.role,role);assert.equal(row.seed,seed)
  assert.equal(row.save.saveVersion,46);assert.equal(sha(boundedJson(row.originalState)),row.originalStateSha256)
  assert.deepEqual(row.save.state,row.originalState);return row
}
export function countedBytes(root) {
  let bytes=0
  function walk(folder,top=false){for(const name of readdirSync(folder)){const path=join(folder,name);const s=lstatSync(path)
    assert.ok(!s.isSymbolicLink(),'STOP_OUTPUT_SYMLINK')
    if(s.isDirectory()){if(top&&(name==='baseline-tree'||name==='intervention-tree'))continue;walk(path)}
    else {assert.ok(s.isFile()&&s.nlink===1,'STOP_OUTPUT_KIND');if(name.endsWith('.json'))assert.ok(s.size<=MAX,'STOP_SINGLE_JSON_CAP');bytes+=s.size;assert.ok(bytes<=TOTAL,'STOP_OUTPUT_CAP')}
  }}walk(root,true);return bytes
}
export function budget(root,additional=0){assert.ok(countedBytes(root)+additional<=TOTAL-RESERVE,'STOP_OUTPUT_CAP')}
export function emitJson(path,value,root){const raw=jsonLine(value);budget(root,raw.length);const fd=openSync(path,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);try{writeAll(fd,raw);fsyncSync(fd)}finally{closeSync(fd)}budget(root);return sha(raw)}
function writeAll(fd,raw){let n=0;while(n<raw.length){const wrote=writeSync(fd,raw,n,raw.length-n);assert.ok(wrote>0);n+=wrote}}
export class CaptureWriter {
  constructor(path,root,role,seed){this.path=path;this.root=root;this.role=role;this.seed=seed;this.fd=openSync(path,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);this.offset=0;this.records=[];this.hash=createHash('sha256');this.closed=false}
  append(row){assert.ok(!this.closed&&this.records.length<110);assert.equal(row.boundary,307+this.records.length);assert.equal(row.role,this.role);assert.equal(row.seed,this.seed)
    const raw=jsonLine(row),compressed=gzipSync(raw);assert.ok(compressed.length<=MAX);budget(this.root,compressed.length)
    writeAll(this.fd,compressed);this.hash.update(compressed)
    this.records.push({member:row.boundary,gzipOffsetStart:this.offset,gzipOffsetEnd:this.offset+compressed.length,bytes:raw.length,sha256:sha(raw)})
    this.offset+=compressed.length;budget(this.root);return raw
  }
  close(indexPath){assert.equal(this.records.length,110);fsyncSync(this.fd);closeSync(this.fd);this.closed=true
    const index={role:this.role,seed:this.seed,capturePath:this.path,compressedSha256:this.hash.digest('hex'),bytes:this.offset,members:this.records};emitJson(indexPath,index,this.root);return index
  }
  abort(){if(!this.closed){closeSync(this.fd);this.closed=true}}
}
export function validateIndex(index,path,role,seed){assert.equal(index.capturePath,path);assert.equal(index.role,role);assert.equal(index.seed,seed);assert.equal(index.members.length,110)
  let offset=0;for(let i=0;i<110;i++){const x=index.members[i];assert.equal(x.member,307+i);assert.equal(x.gzipOffsetStart,offset);assert.ok(x.gzipOffsetEnd>x.gzipOffsetStart&&x.gzipOffsetEnd-x.gzipOffsetStart<=MAX&&x.bytes>0&&x.bytes<=MAX);offset=x.gzipOffsetEnd}assert.equal(offset,index.bytes);assert.equal(lstatSync(path).size,offset);assert.equal(fileSha(path),index.compressedSha256)
}
export function fullDifferences(left,right){const result=[];let bytes=2
  function add(value){bytes+=boundedJson(value).length+1;assert.ok(bytes<=MAX,'STOP_DIFFERENCE_MEMBER_CAP');result.push(value)}
  function visit(a,b,path){if(Object.is(a,b))return
    if(typeof a!==typeof b||a===null||b===null||typeof a!=='object'||Array.isArray(a)!==Array.isArray(b)){add({path,left:a,right:b});return}
    for(const key of new Set([...Object.keys(a),...Object.keys(b)])){const child=Array.isArray(a)?`${path}[${key}]`:`${path}.${key}`
      if(!Object.hasOwn(a,key)||!Object.hasOwn(b,key))add({path:child,leftPresent:Object.hasOwn(a,key),rightPresent:Object.hasOwn(b,key),...(Object.hasOwn(a,key)?{left:a[key]}:{}),...(Object.hasOwn(b,key)?{right:b[key]}:{})})
      else visit(a[key],b[key],child)
    }if(Array.isArray(a)&&a.length!==b.length)add({path:`${path}.length`,left:a.length,right:b.length})
  }visit(left,right,'$');return result
}
export const optional = (row,key) => Object.hasOwn(row,key)?['VALUE',row[key]]:['MISSING']
export function joinRows(left,right,keyOf){
  function keyed(rows){const counts=new Map(),order=[];const map=new Map();rows.forEach((row,ordinal)=>{const base=keyOf(row),key=boundedJson(base).toString();const occurrence=counts.get(key)??0;counts.set(key,occurrence+1);const identity=[...base,occurrence],id=boundedJson(identity).toString();map.set(id,{identity,ordinal,row});order.push(id)});return {map,order}}
  const a=keyed(left),b=keyed(right),records=[]
  for(const id of new Set([...a.order,...b.order])){const l=a.map.get(id),r=b.map.get(id);const status=!l?'RIGHT_ONLY':!r?'LEFT_ONLY':boundedJson(l.row).equals(boundedJson(r.row))?'MATCHED':'CHANGED'
    records.push({identity:(l??r).identity,status,leftOrdinal:l?.ordinal??null,rightOrdinal:r?.ordinal??null,...(status!=='MATCHED'?{...(l?{left:l.row}:{}),...(r?{right:r.row}:{})}:{leftRowSha256:sha(boundedJson(l.row)),rightRowSha256:sha(boundedJson(r.row))})})
  }return {leftCount:left.length,rightCount:right.length,leftOrder:a.order,rightOrder:b.order,records}
}
export function classifyCount(found,total=6){assert.ok(Number.isInteger(found)&&found>=0&&found<=total);return found===0?'NONE':found===total?'ALL':'PARTIAL'}
