// Transform only the authenticated canonical TS module text; canonical IDs stay unchanged.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {transformWithEsbuild} from '/Users/zacheryspector/The-Movies-headless-program/node_modules/vitest/node_modules/vite/dist/node/index.js'
const PREFIX='\0m0-full-body/'
export function canonicalTypeScriptTransform(binding){
 let options
 return {
  name:'authenticated-canonical-typescript-transform',enforce:'pre',
  configResolved(config){
   assert.ok(config.esbuild&&typeof config.esbuild==='object','existing Vite esbuild configuration required')
   const {jsxInject,include,exclude,...esbuildTransformOptions}=config.esbuild
   assert.ok(!jsxInject,'admitted canonical TS graph has no JSX injection')
   // Exact Vite5 vite:esbuild transform options, applied explicitly to NUL IDs
   // which its ordinary createFilter excludes. Filename retains config lookup.
   options={target:'esnext',charset:'utf8',...esbuildTransformOptions,minify:false,
    minifyIdentifiers:false,minifySyntax:false,minifyWhitespace:false,treeShaking:false,
    keepNames:false,supported:{'dynamic-import':true,'import-meta':true,...esbuildTransformOptions.supported}}
  },
  async transform(code,id){
   if(!id.startsWith(PREFIX))return null
   const logical=id.slice(PREFIX.length),role=binding.derivatives[logical]||binding.sourceFiles[logical]
   assert.ok(role,'every canonical transform uses an admitted exact source role')
   const raw=Buffer.from(code,'utf8')
   assert.equal(raw.length,role.bytes);assert.equal(createHash('sha256').update(raw).digest('hex'),role.sha256)
   assert.ok(options,'existing Vite configuration resolved before canonical transform')
   const result=await transformWithEsbuild(code,role.path,options)
   for(const warning of result.warnings)this.warn(warning)
   return {code:result.code,map:result.map}
  }
 }
}
