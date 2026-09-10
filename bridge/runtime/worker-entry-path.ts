import {createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import {readFile,rm} from 'node:fs/promises'
import {dirname,join,resolve,relative,isAbsolute} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {promisify} from 'node:util'
declare const __PROJECT_STUDIO_RUNTIME_WORKER_SHA256__: string | undefined
const execute=promisify(execFile)
const sha=(bytes:Uint8Array):string=>createHash('sha256').update(bytes).digest('hex')
export async function prepareRuntimeWorkerEntry(serverModuleUrl:string):Promise<{entryUrl:URL;release:()=>Promise<void>}> {
 const modulePath=fileURLToPath(serverModuleUrl),sourceMode=modulePath.endsWith('.ts')
 const root=sourceMode?dirname(dirname(modulePath)):null
 let directory=dirname(modulePath),ownedDirectory:string|null=null
 if(root!==null){
  // Dev/vite-node gets a fresh source-bound bundle in a private temporary directory, never a stale dist artifact.
  const result=await execute(process.execPath,[join(root,'scripts','prepare-runtime-worker.mjs')],{cwd:root,env:{PATH:process.env.PATH??'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},maxBuffer:64*1024,timeout:30_000})
  const value=JSON.parse(result.stdout) as {directory:string}
  if(typeof value.directory!=='string'||!isAbsolute(value.directory))throw new Error('Worker preparation did not return a private absolute path.')
  directory=value.directory;ownedDirectory=directory
 }
 const release=async():Promise<void>=>{if(ownedDirectory!==null)await rm(ownedDirectory,{recursive:true,force:true})}
 try{
  const binding=JSON.parse(await readFile(join(directory,'runtime-worker-source.json'),'utf8')) as {version:number;sha256:string;sources:Array<{path:string;sha256:string}>}
  const entry=join(directory,'runtime-worker.mjs')
  const expected=typeof __PROJECT_STUDIO_RUNTIME_WORKER_SHA256__==='string'?__PROJECT_STUDIO_RUNTIME_WORKER_SHA256__:null
  if(root===null&&(expected===null||binding.sha256!==expected))throw new Error('Runtime worker binding does not belong to this emitted engine.')
  if(binding.version!==1||sha(await readFile(entry))!==binding.sha256)throw new Error('Runtime worker artifact differs from its build binding.')
  if(root!==null){
   if(!Array.isArray(binding.sources)||binding.sources.length===0)throw new Error('Runtime worker source binding is missing.')
   for(const source of binding.sources){const file=resolve(root,source.path),rel=relative(root,file);if(rel.startsWith('..')||isAbsolute(rel)||sha(await readFile(file))!==source.sha256)throw new Error('Runtime worker source changed after its build; retry the development launch.')}
  }
  return {entryUrl:pathToFileURL(entry),release}
 }catch(error){await release();throw error}
}
