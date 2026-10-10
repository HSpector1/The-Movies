from pathlib import Path
import hashlib,json
P=Path(__file__).resolve().parent
S=P.parent/'1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r2'
def role(p):
 raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def write(name,data):(P/name).write_text(json.dumps(data,indent=2,sort_keys=True)+'\n')
cases=json.loads((P/'ORDERING-SOURCE-CASES.json').read_text())
for case in cases['cases']:
 if case['id']=='candidate-context-issuer-correlation-RED':
  case['assertion']='every actual evaluation binds an authenticated source-array projection'
write('ORDERING-SOURCE-CASES.json',cases)
proof=json.loads((P/'SOURCE-PROOF.json').read_text())
proof['consumerRepair']['sourceCases']=role(P/'ORDERING-SOURCE-CASES.json')
proof['consumerRepair']['sourceCaseMethod']=role(P/'ordering-source-controls.ts')
write('SOURCE-PROOF.json',proof)
for name in ['canonical-resolver.mjs','fixtures.ts','config.mjs','core.test.ts','controls/full-body-controls.ts',
 'derivative/src/core/talentMarket.ts','derivative/src/core/promises.ts','derivative/src/core/opportunityPromises.ts',
 'derivative/src/core/employment.ts','derivative/src/core/rng.ts','derivative/src/core/m0WiringProbe.ts',
 'mutants/typed-propagation-removed-talentMarket.ts']:
 assert (P/name).read_bytes()==(S/name).read_bytes(),name
files={str(p.relative_to(P)):role(p) for p in sorted(P.rglob('*')) if p.is_file() and p.name not in ('SOURCE-PINS.json','SEAL.json')}
pins=json.loads((P/'SOURCE-PINS.json').read_text());pins['files']=files;write('SOURCE-PINS.json',pins)
seal=json.loads((P/'SEAL.json').read_text());seal['sourcePins']=role(P/'SOURCE-PINS.json');seal['sourceProof']=role(P/'SOURCE-PROOF.json');seal['roles']=len(files);write('SEAL.json',seal)
for name,expected in files.items():assert role(P/name)==expected
for name in ['SOURCE-PINS.json','SEAL.json','SOURCE-PROOF.json','ordering.ts','ORDERING-SOURCE-CASES.json','ordering-source-controls.ts']:
 print(name,json.dumps(role(P/name)))
print(json.dumps({'allPayloadRolesAuthenticate':len(files),'protected12SourceRolesByteUnchanged':True,
 'unrunSyntheticGreen':2,'unrunSyntheticRed':16,'TSOrGameExecution':False}))
