# Source construction only; does not import/execute Node/candidate/controls.
import pathlib,hashlib,json,difflib,re
S=pathlib.Path('/Users/zacheryspector/studio-scratch');P=S/'1370-c0-b109-ascii-independent-controls-after-al-20261009-r1';O=S/'1370-c0-b109-bounded-token-chunk-proposal-20261009-r1';C=S/'1370-c0-b109-ascii-string-source-after-al-20261009-r1'
def role(f):
 b=f.read_bytes();return {'path':str(f),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
original=(O/'test-encoder.mjs').read_text();old=(O/'bounded-json-candidate.mjs').read_text();candidate=(C/'bounded-json-candidate.mjs').read_text()
assert role(O/'test-encoder.mjs')['sha256']=='015326a19a12225b5fb736bbf85d637f8e925cf4c0f5bd00240061cf9cd880b4'
assert role(O/'bounded-json-candidate.mjs')['sha256']=='2529dc0b14a41b99c4e533be5ee444d1b94401f30b7623a51b6122ff1c6f6e4b'
assert role(C/'bounded-json-candidate.mjs')['sha256']=='f382fe6610a69a1c766134120e5382e86700ac6078a82d712547bf027f42810b'
rawline="    const withinLimit=Buffer.byteLength(value)<=limit;if(!withinLimit)assert.ok(withinLimit,'STOP_STRING_CAP')\n"
branch=next(line+'\n' for line in candidate.splitlines() if 'if (!/' in line)
assert len(branch.encode())==101 and candidate.replace(branch,'',1)==old
recipes={'escape':(branch,branch.replace(r'[\u0000-\u001f"\\\u0080-\uffff]',r'[\u0080-\uffff]')),'unicode':(branch,branch.replace(r'[\u0000-\u001f"\\\u0080-\uffff]',r'["\\]')),'precheck':(rawline,'')}
manifest={}
for name,(before,after) in recipes.items():
 assert candidate.count(before)==1 and before!=after;bad=candidate.replace(before,after,1);f=P/('mutant-'+name+'.mjs');f.write_text(bad)
 if after:assert bad.replace(after,before,1)==candidate
 else:assert bad.replace('  const stringToken = value => {\n','  const stringToken = value => {\n'+rawline,1)==candidate
 (P/('mutant-'+name+'.diff')).write_text(''.join(difflib.unified_diff(candidate.splitlines(True),bad.splitlines(True),fromfile='candidate',tofile=name)))
 (P/('mutant-'+name+'.inverse.diff')).write_text(''.join(difflib.unified_diff(bad.splitlines(True),candidate.splitlines(True),fromfile=name,tofile='candidate')))
 manifest[name]={'role':role(f),'before':before,'after':after,'wholeSourceInverseExact':True,'forward':role(P/('mutant-'+name+'.diff')),'inverse':role(P/('mutant-'+name+'.inverse.diff'))}
start=original.index('let groups=0,pairs=0;');end=original.index("process.stdout.write(JSON.stringify({status:'ENCODER_EQUIVALENCE_AND_REFUSALS_PASSED'")
block=original[start:end];assert len(re.findall(r"^test\('",block,re.M))==28
(P/'original28-block.mjs.txt').write_text(block)
header='''// HELD exact ASCII controls. CLI exact CONFIG SHA. No game/capture/write/launch activity.
import assert from 'node:assert/strict'
import {readFileSync,lstatSync,realpathSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
const hash=b=>createHash('sha256').update(b).digest('hex')
assert.equal(process.argv.length,3)
const configRaw=readFileSync(new URL('./CONFIG.json',import.meta.url));assert.equal(hash(configRaw),process.argv[2]);const config=JSON.parse(configRaw)
assert.equal(process.version,'v20.20.2');assert.equal(process.execPath,config.nodePath)
for(const r of Object.values(config.roles)){assert.equal(realpathSync(r.path),r.path);const st=lstatSync(r.path);assert.ok(st.isFile());assert.equal(st.nlink,1);const bytes=readFileSync(r.path);assert.equal(bytes.length,r.bytes);assert.equal(hash(bytes),r.sha256)}
const baseline=await import(pathToFileURL(config.roles.baseline.path)),candidate=await import(pathToFileURL(config.roles.candidate.path))
'''
# Preserve all original test/helper declaration bytes and original oracles. Only header/footer adapt.
controls=header+block+(P/'appended-controls.mjs').read_text();(P/'controls.mjs').write_text(controls)
origcfg=json.loads((O/'CONFIG.json').read_text());roles={k:origcfg['roles'][k] for k in ['baseline','referenceEncoder']}
roles.update({'candidate':role(C/'bounded-json-candidate.mjs'),'selectedReference':role(O/'bounded-json-candidate.mjs'),'controls':role(P/'controls.mjs'),'originalControls':role(O/'test-encoder.mjs'),'originalConfig':role(O/'CONFIG.json'),'node':{'path':origcfg['nodePath'],'bytes':pathlib.Path(origcfg['nodePath']).stat().st_size,'sha256':origcfg['nodeSha256']},'sourcePins':role(C/'SOURCE-PINS.json'),'sourceDesignAdoption':role(S/'1370-am-root-continuation-20261009-r1/B109-ASCII-DESIGN-ADOPTION.json'),'operationalReadback':role(S/'1370-al-checkpoint-root-finalization-20261009-r2/PUSH-READBACK.json')})
roles.update({'mutant_'+name:r['role'] for name,r in manifest.items()})
config={'schema':'1370-b109-ascii-independent-held-controls-config/v1','status':'HELD_SOURCE_ONLY_INDEPENDENT_REVIEW_AND_RECORDED_ROOT_GRANT_REQUIRED','executionAuthorization':False,'nodePath':origcfg['nodePath'],'roles':roles,'bounds':origcfg['bounds'],'b109BoundsUnchanged':origcfg['b109BoundsUnchanged'],'nativeBuiltinsAssumption':'Standard native RegExp/String/JSON/Array/Buffer; source getters/proxies/two reads/dynamic length and limit coercion checkpoints are compared. Internal primitive call-count equality is not claimed.','originalOraclesPreserved':True,'newOracle':'selected2529','expected':{'originalGroups':28,'originalPairs':321,'newGroups':6,'newPairs':344,'totalGroups':34,'totalPairs':665,'expectedRed':3,'unexpectedRed':0},'actualGrant':None,'actualOutcome':None,'game':False,'captureDecode':False,'performanceWin':False}
(P/'CONFIG.json').write_text(json.dumps(config,sort_keys=True,indent=2)+'\n')
(P/'MUTANTS.json').write_text(json.dumps(manifest,sort_keys=True,indent=2)+'\n')
print(json.dumps({'controls':role(P/'controls.mjs'),'config':role(P/'CONFIG.json'),'original28Block':role(P/'original28-block.mjs.txt'),'originalDeclarationCount':28,'newGroupPairRoster':[268,34,9,15,8,10],'plannedNewPairs':344,'mutantRoles':{k:v['role'] for k,v in manifest.items()}},indent=2))
