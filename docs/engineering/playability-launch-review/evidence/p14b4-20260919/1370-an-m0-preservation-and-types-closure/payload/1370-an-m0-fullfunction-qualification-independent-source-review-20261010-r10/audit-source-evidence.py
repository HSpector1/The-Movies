import json,hashlib,os,stat
from pathlib import Path
B=Path(__file__).parent
def need(v,m):
 if not v:raise RuntimeError(m)
def pairs(rows):
 out={}
 for k,v in rows:need(k not in out,'duplicate key');out[k]=v
 return out
def decode(raw):return json.loads(raw.decode('utf-8','strict'),object_pairs_hook=pairs,parse_constant=lambda x: (_ for _ in ()).throw(ValueError(x)))
def read(r):
 p=Path(r['path']);need(p.is_absolute() and str(p).startswith('/Users/zacheryspector/studio-scratch/') and p.resolve(strict=True)==p,'named scratch physical artifact')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);need(stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=2*1024*1024,'finite source cap')
  chunks=[];total=0;h=hashlib.sha256()
  while True:
   q=os.read(fd,65536)
   if not q:break
   total+=len(q);need(total<=2*1024*1024,'cap');h.update(q);chunks.append(q)
  z=os.fstat(fd);need((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'artifact race')
  need({'path':str(p),'bytes':total,'sha256':h.hexdigest()}==r,'role mismatch '+p.name);return b''.join(chunks)
 finally:os.close(fd)
i=decode((B/'EVIDENCE-INPUT.json').read_bytes());raw={k:read(r) for k,r in i['roles'].items()}
pins=decode(raw['sourceManifest']);c=decode(raw['source:CONFIG.json']);recipe=decode(raw['source:RECIPE.json']);prior=decode(raw['predecessorManifest']);review=decode(raw['predecessorReview'])
need(review['sourceManifest']==i['roles']['predecessorManifest'] and review['decision']=='ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY' and review['executionAuthorization'] is False and review['concreteFindings']==[],'genuine predecessor')
need(len(pins['files'])==132 and len(recipe['routeSourcePins'])==10,'role counts')
for n,r in recipe['routeSourcePins'].items():need(r==pins['files'][n],'ten review role aliases')
for n in ['CORE-TEST-TEMPLATE.ts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs']:
 need(pins['files'][n]['bytes']==prior['files'][n]['bytes'] and pins['files'][n]['sha256']==prior['files'][n]['sha256'],'unchanged candidate/parser '+n)
for n in ['exact-json.mjs','run-parser-controls.mjs']:need(pins['files'][n]==c['parserInputs'][n]==prior['files'][n],'same actually tested external parser')
need(c['bounds']==decode(raw['source:R9-BASELINE-CONFIG.json'])['bounds'],'original bounds')
record=raw['source:record-fullfunction.py'].decode();controller=raw['source:run-fullfunction.py'].decode();worker=raw['source:run-fullfunction.mjs'].decode()
need("SCRATCH/'1370-an-m0-fullfunction-qualification-recorder-results-20261010-r3'" in record and c['recorderOutputPath'].endswith('-20261010-r3') and c['outputPath'].endswith('-20261010-r3') and c['runId']=='20261010-m0-fullfunction-after-an-r3' and c['laneLog'].endswith('-20261010-r3.lane.log'),'fresh actual runtime selectors')
need(c['bounds']==recipe['bounds'],'recipe bounds')
need(c['transformTools']['viteImplementation']['bytes']<=2*1024*1024,'transform cap')
need("for r in c['transformTools'].values():read(r,2*1024**2)" in controller and 'for(const r of Object.values(c.transformTools))readRole(r,2*1024*1024);' in worker,'tool authority gates')
parse=decode(raw['diagnosis:RESULT.json']);transform=decode(raw['diagnosis:TRANSFORM-RESULT.json']);delta=decode(raw['diagnosis:R10-DELTA-PARSE.json']);diagnosis=decode(raw['diagnosis:DIAGNOSIS.json'])
need(parse['fileCount']==16 and parse['diagnosticCount']==0 and len(parse['rows'])==16 and all(x['diagnostics']==[] for x in parse['rows']),'retained16 raw parse')
need(transform['fileCount']==15 and transform['diagnosticCount']==transform['warningCount']==0 and len(transform['rows'])==15 and all(x['warnings']==x['diagnostics']==[] and x['executed'] is False for x in transform['rows']),'retained15 transforms')
need(len(delta['rows'])==2 and delta['diagnosticCount']==0 and all(x['diagnostics']==[] for x in delta['rows']) and delta['candidateImportedOrExecuted'] is False,'retained2 changed parse')
need(diagnosis['exactFailedVirtualModuleOrTokenCaptured'] is False and diagnosis['gameplayAcceptance'] is False,'honest diagnosis limits')
need(c['transformTools']['viteImplementation']==diagnosis['installedViteSourceObserved'],'same recorded transform implementation')
report={'schema':'1370-finite-r10-source-evidence-audit/v1','roles':i['roles'],'allExactRetainedRolesMatched':True,'manifestPayloadCount':len(pins['files']),'tenReviewAliasesExact':True,'unchangedParserControlsAndControlBodies':True,'freshExecutedSelectorsR3':True,'originalBoundsUnchanged':True,'retainedRawParserCases':16,'retainedPublicTransforms':15,'retainedChangedParserCases':2,'allRetainedDiagnosticsAndWarningsZero':True,'exactFailedVirtualModuleCaptured':False,'reviewerCandidateImportedOrExecuted':False,'privateInventory':False,'publicInstalledToolsRehashedByReviewer':False}
encoded=(json.dumps(report,sort_keys=True,indent=2)+'\n').encode();p=B/'EVIDENCE-READBACK.json';fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(p),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest(),'allChecksPassed':True}))

