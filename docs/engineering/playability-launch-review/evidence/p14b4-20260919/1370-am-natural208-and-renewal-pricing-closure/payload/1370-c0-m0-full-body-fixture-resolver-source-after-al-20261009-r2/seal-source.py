from pathlib import Path
import hashlib,json
P=Path(__file__).resolve().parent
def role(path):
 raw=path.read_bytes();return {'path':str(path),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def put(name,value):
 with (P/name).open('x') as f:f.write(json.dumps(value,indent=2,sort_keys=True)+'\n')
binding=json.loads((P/'RESOLUTION-SOURCE-BINDING.json').read_text())
put('RECORDED-ROUTE-UNFILLED.json',{
 'schema':'1370-m0-full-body-recorded-route-held/v1','executionAuthorization':False,'executionPerformed':False,
 'operationalHead':'8cb704e2f18e6a635943893422c9cfdc206e106d',
 'productionSourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554',
 'cwd':str(P),'config':role(P/'config.mjs'),'entrypoint':role(P/'core.test.ts'),
 'resolution':role(P/'RESOLUTION-SOURCE-BINDING.json'),
 'fixtureProducer':role(P/'fixtures.ts'),'baselineMethods':role(P/'controls/full-body-controls.ts'),
 'mutant':binding['typedCatchMutant'],
 'childModes':['fixture-generation:baseline','controls:baseline','controls:typed-catch-mutant'],
 'existingHorizonAuthority':{'source':'4c4cec361c803e2f6600f60bb410f996329a88bb716c7dba3bd79829322058ba',
  'naturalWeeks':416,'requestedBoundaryWeeks':[196,197,208],'proposedPrefixThrough':208},
 'fixtureRole':None,'fixtureOutput':None,'fixtureReceipt':None,'fixtureArtifactBytes':None,
 'actualM0Types':None,'operationalProtection':None,
 'fixtureGenerationGrant':None,'controlExecutionGrant':None,
 'qualifiedClockAuthority':None,'proposedChildSeconds':300,'proposedRecorderSeconds':320,'proposedWholeSeconds':330,
 'clockSourceDesignIntent':{'path':'/Users/zacheryspector/studio-scratch/1370-c0-m0-real-full-body-wiring-next-slice-source-after-al-20261009-r2/NEXT-STEPS.md',
  'bytes':4700,'sha256':'43e7adea2828a1cdb0d1ce2de74d2f44005c4d9eba0a7f3f1991d51f53a94f3b'},
 'testTimeoutMs':None,'runtimeToolRoles':None,'supervisor':None,'outerRecorder':None,
 'launchArgv':None,'ownedGroupCleanup':None,'retainedStreamValidator':None,
 'expectedMutantRed':'independently specified exact typed-propagation assertion after successful earlier controls',
 'controlsReadyForRuntime':False,
 'blocker':'R2 source proposes separately reviewed qualified300/320/330; exact full-body recorder adaptation, tools, retained streams, group cleanup and full-state artifact bound remain unfilled. M0types clocks/outcome alone are not inherited.'})
roles={str(p.relative_to(P)):role(p) for p in sorted(P.rglob('*')) if p.is_file() and p.name not in ('SOURCE-PINS.json','SEAL.json')}
put('SOURCE-PINS.json',{'schema':'1370-m0-full-body-source-continuation-pins/v1',
 'executionAuthorization':False,'executionPerformed':False,'controlsReadyForRuntime':False,
 'actualM0Types':None,'operationalProtection':None,'fixtureRoles':None,
 'files':roles,'sourceOnlyMethodsNotRuntimeGrants':True})
put('SEAL.json',{'schema':'1370-m0-full-body-source-continuation-seal/v1','sourcePins':role(P/'SOURCE-PINS.json'),
 'sourceProof':role(P/'SOURCE-PROOF.json'),'roles':len(roles),'executionAuthorization':False,
 'claim':'HELD_SOURCE_INTEGRATION_PROPOSAL_WITH_DECLARED_RUNTIME_ROUTE_AND_FIXTURE_PREMISE_BLOCKERS'})
print(json.dumps({'sourcePins':role(P/'SOURCE-PINS.json'),'seal':role(P/'SEAL.json'),'roles':len(roles)},indent=2))
