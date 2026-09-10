// Development/test bootstrap only. The production graph never imports esbuild.
import {build} from 'esbuild'
import {createHash} from 'node:crypto'
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const directory=await mkdtemp(path.join(tmpdir(),'studio-runtime-worker-'))
try{
 const output=path.join(directory,'runtime-worker.mjs')
 const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
 const compiledSourceHashes=new Map()
 const sourceBindingPlugin={name:'bind-compiled-source',setup(build){
  build.onLoad({filter:/\.(?:[cm]?[jt]sx?|json)$/},async args=>{
   const contents=await readFile(args.path)
   compiledSourceHashes.set(path.relative(root,args.path),sha(contents))
   const extension=path.extname(args.path)
   const loader=extension==='.json'?'json':extension==='.tsx'?'tsx':extension==='.jsx'?'jsx':extension.endsWith('ts')?'ts':'js'
   return {contents,loader}
  })
 }}
 const result=await build({absWorkingDir:root,entryPoints:['bridge/runtime/worker-entry.ts'],outfile:output,bundle:true,platform:'node',format:'esm',target:'node24',metafile:true,logLevel:'silent',plugins:[sourceBindingPlugin]})
 const sources=[]
 for(const name of Object.keys(result.metafile.inputs).sort()){
  const sha256=compiledSourceHashes.get(name)
  if(!sha256||sha256!==sha(await readFile(path.join(root,name))))throw new Error('Worker source changed while building; retry the development launch after edits finish.')
  sources.push({path:name,sha256})
 }
 await writeFile(path.join(directory,'runtime-worker-source.json'),JSON.stringify({version:1,sha256:sha(await readFile(output)),sources}),{mode:0o600})
 console.log(JSON.stringify({directory}))
}catch(error){await rm(directory,{recursive:true,force:true});throw error}
