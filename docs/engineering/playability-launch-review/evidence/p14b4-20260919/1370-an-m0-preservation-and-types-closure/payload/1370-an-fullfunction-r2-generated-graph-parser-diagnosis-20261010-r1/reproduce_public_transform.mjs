import fs from 'node:fs';import crypto from 'node:crypto';import {createRequire} from 'node:module';
import {transformWithEsbuild} from '/Users/zacheryspector/The-Movies-headless-program/node_modules/vitest/node_modules/vite/dist/node/index.js';
const D='/Users/zacheryspector/studio-scratch/1370-an-fullfunction-r2-generated-graph-parser-diagnosis-20261010-r1';
const input=JSON.parse(fs.readFileSync(D+'/INPUTS.json'));const sha=b=>crypto.createHash('sha256').update(b).digest('hex');const read=r=>{const b=fs.readFileSync(r.path);if(b.length!==r.bytes||sha(b)!==r.sha256)throw Error('PIN');return b};
const require=createRequire(import.meta.url),ts=require(input.parser.path);const rows=[];
const options={target:'esnext',charset:'utf8',minify:false,minifyIdentifiers:false,minifySyntax:false,minifyWhitespace:false,treeShaking:false,keepNames:false,supported:{'dynamic-import':true,'import-meta':true}};
fs.mkdirSync(D+'/transformed');
for(let i=0;i<input.files.length;i++){
 const source=input.files[i],raw=read(source);if(source.path.endsWith('.mjs'))continue;
 const transformed=await transformWithEsbuild(raw.toString('utf8'),source.path,options);
 const ast=ts.createSourceFile(source.path+'.js',transformed.code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 const diagnostics=ast.parseDiagnostics.map(d=>({code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,'\n')}));
 const artifact=D+'/transformed/'+String(i).padStart(2,'0')+'.js';fs.writeFileSync(artifact,transformed.code,{flag:'wx'});const b=fs.readFileSync(artifact);
 rows.push({source,artifact:{path:artifact,bytes:b.length,sha256:sha(b)},warnings:transformed.warnings,diagnostics,executed:false});
}
for(const r of input.files)read(r);
const result={schema:'1370-public-authenticated-ts-to-js-transform-reproduction/v1',options,rows,fileCount:rows.length,diagnosticCount:rows.reduce((n,r)=>n+r.diagnostics.length,0),warningCount:rows.reduce((n,r)=>n+r.warnings.length,0),scope:'PUBLIC_VITE_TRANSFORM_AND_JS_SYNTAX_PARSE_ONLY_NO_GENERATED_MODULE_IMPORT_OR_EXECUTION',privateInventory:false,game:false};
fs.writeFileSync(D+'/TRANSFORM-RESULT.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({fileCount:result.fileCount,diagnosticCount:result.diagnosticCount,warningCount:result.warningCount}));
