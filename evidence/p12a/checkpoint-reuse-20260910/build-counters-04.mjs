import {readFileSync,writeFileSync,realpathSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {build} from '/Users/bruce/The Movies - P12A Living Hollywood TS/node_modules/esbuild/lib/main.js'
const root=realpathSync('/tmp/p12a-checkpoint-reuse-pzwj_tt6'), changed=['bridge/runtime-checkpoint.ts','bridge/session.ts','bridge/runtime/campaign-library.ts','bridge/runtime/runtime-coordinator.ts']
const bump=(name,key='')=>`(globalThis as any).__p12Counter?.(${JSON.stringify(name)}${key?','+key:''});`
const checkpointKey=`[value?.sessionId,value?.stateRevision,value?.currentStateDigest,value?.savedStateDigest,value?.journalDigest].join(':')`
for(const variant of ['baseline','patched']){
 const sourceHashes=[]
 await build({entryPoints:[root+'/counter-source.ts'],outfile:root+'/counter-'+variant+'-04.mjs',bundle:true,platform:'node',format:'esm',target:'node26',plugins:[{name:'private-exact-counter-instrumentation',setup(b){b.onLoad({filter:/\.(?:ts|js)$/},args=>{
  if(!args.path.startsWith(root+'/source/'))return
  const relative=args.path.slice((root+'/source/').length),path=variant==='baseline'&&changed.includes(relative)?root+'/base/'+relative:args.path
  let contents=readFileSync(path,'utf8');sourceHashes.push({path:relative,sha256:createHash('sha256').update(contents).digest('hex')})
  if(relative==='bridge/runtime-checkpoint.ts'){
   const declaration=variant==='baseline'?'export function hydrateBridgeRuntimeCheckpoint':'function hydrateAndEncodeBridgeRuntimeCheckpoint'
   const pos=contents.indexOf('  const limits = validateLimits(configuredLimits)',contents.indexOf(declaration))
   if(pos<0)throw Error('missing strict checkpoint counter seam')
   contents=contents.slice(0,pos)+'  '+bump('strictCheckpoint',checkpointKey)+'\n'+contents.slice(pos)
   contents=contents.replace('function digest(value: string): string {','function digest(value: string): string {'+bump('checkpointDigest'))
  }
  if(relative==='bridge/schema/canonical.ts')contents=contents.replace('export function canonicalJson(value: unknown): string {',`export function canonicalJson(value: unknown): string { ${bump('canonicalJson')} if((value as any)?.format==='project-studio-bridge-runtime-checkpoint'){${bump('canonicalCheckpoint',checkpointKey)}}`)
  if(relative==='bridge/schema/canonical.ts')contents=contents.replace('return JSON.stringify(canonicalize(value))', `const encoded=JSON.stringify(canonicalize(value)); if((value as any)?.format==='project-studio-bridge-runtime-checkpoint'){${bump('canonicalCheckpointExactBytes', "createHash('sha256').update(encoded+'\\n').digest('hex')")}} return encoded`)
  if(relative==='src/core/save.ts')for(const name of ['importSave','exportSave']){const pattern=new RegExp('(export function '+name+'\\([^)]*\\):[^\\{]+\\{)');if(!pattern.test(contents))throw Error('missing core seam '+name);contents=contents.replace(pattern,'$1'+bump(name))}
  return {contents,loader:relative.endsWith('.ts')?'ts':'js',resolveDir:args.path.slice(0,args.path.lastIndexOf('/'))}
 })}}]})
 if(sourceHashes.length<50)throw Error('Instrumentation did not bind imports');
 writeFileSync(root+'/counter-'+variant+'-sources-04.json',JSON.stringify(sourceHashes,null,2)+'\n',{mode:0o600})
}
