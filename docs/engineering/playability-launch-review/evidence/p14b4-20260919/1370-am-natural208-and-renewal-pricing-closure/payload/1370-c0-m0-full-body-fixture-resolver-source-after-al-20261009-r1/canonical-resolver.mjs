// Source-only. No installation or load occurs until a separately recorded route.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {posix, relative, resolve, sep} from 'node:path'
const PREFIX='\0m0-full-body/'
export function canonicalM0Resolver(binding) {
  const roots=[binding.mirrorRoot,binding.derivativeRoot]
  const table=binding.sourceFiles
  const special=binding.derivatives
  const hash=raw=>createHash('sha256').update(raw).digest('hex')
  const physicalLogical=physical=>{
    for(const root of roots){
      const rel=relative(root,physical).split(sep).join('/')
      if(rel!==''&&!rel.startsWith('../')&&!rel.startsWith('/'))return rel
    }
    return null
  }
  function canonical(logical){
    logical=posix.normalize(logical)
    assert.ok(!logical.startsWith('../')&&!logical.startsWith('/'),'logical module stays in admitted tree')
    if(logical.endsWith('.js'))logical=logical.slice(0,-3)+'.ts'
    if(!posix.extname(logical))logical+='.ts'
    assert.ok(special[logical]||table[logical],`unadmitted module ${logical}`)
    return PREFIX+logical
  }
  return {
    name:'canonical-m0-full-body',enforce:'pre',
    resolveId(source,importer){
      if(source.startsWith(PREFIX))return canonical(source.slice(PREFIX.length))
      if(source.startsWith('m0:'))return canonical(source.slice(3))
      if(importer?.startsWith(PREFIX)&&source.startsWith('.')){
        return canonical(posix.join(posix.dirname(importer.slice(PREFIX.length)),source))
      }
      if(source.startsWith('/')){
        const logical=physicalLogical(resolve(source))
        if(logical!==null)return canonical(logical)
      }
      if(importer&&source.startsWith('.')){
        const logical=physicalLogical(resolve(posix.dirname(importer),source))
        if(logical!==null)return canonical(logical)
      }
      return null // platform/test-runner imports follow the qualified dependency resolver
    },
    load(id){
      if(!id.startsWith(PREFIX))return null
      const logical=id.slice(PREFIX.length),role=special[logical]||table[logical]
      assert.ok(role,'every loaded module has an authenticated exact role')
      const raw=readFileSync(role.path)
      assert.equal(raw.length,role.bytes);assert.equal(hash(raw),role.sha256)
      return raw.toString('utf8')
    },
  }
}
