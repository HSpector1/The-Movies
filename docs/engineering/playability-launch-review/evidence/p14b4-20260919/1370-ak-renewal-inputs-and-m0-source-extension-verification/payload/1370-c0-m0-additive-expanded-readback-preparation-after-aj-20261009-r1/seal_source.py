from pathlib import Path
import ast,hashlib,json,difflib
H=Path(__file__).parent
S=H.parent
P=S/'1370-c0-m0-additive-expanded-readback-verifier-proposal-after-aj-20261009-r1'
A=H/'PREFINAL-SOURCE-PACKAGE'
def role(p):
 b=p.read_bytes()
 return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def write(p,d):p.write_text(json.dumps(d,indent=2,sort_keys=True)+'\n')
prior=json.loads((A/'SOURCE-PINS.json').read_text())
assert role(A/'SOURCE-PINS.json')['sha256']=='1b6697695b838969590f47a1791dcb64e701a2ab91025029c4de27486be7b69b'
for n,r in prior['files'].items():assert role(A/n)['sha256']==r['sha256']
write(H/'PREFINAL-ARCHIVE-MANIFEST.json',{'status':'PREFINAL_ANNOUNCED_BYTES_PRESERVED_BEFORE_FINAL_PYTHON_LINKAGE','originalSourcePinsSha256':role(A/'SOURCE-PINS.json')['sha256'],'files':{p.name:role(p) for p in sorted(A.iterdir())},'originalRolePathsRemainHistorical':True})
pins=json.loads((P/'SOURCE-PINS.json').read_text())
for n,r in pins['files'].items():assert role(P/n)==r
cfg=json.loads((P/'CONFIG.json').read_text());assert cfg['futureAuthority'] is None and cfg['executionAuthorization'] is False
src=(P/'verify-expanded.py').read_text();tree=ast.parse(src)
original=(S/'1370-c0-m0-observed-copy-independent-review-20261009-r1/readback.py').read_text()
helpers=original[original.index('def req('):original.index('def obj(')]
start=src.index('def req(');assert src[start:start+len(helpers)]==helpers
assert all(x.module in {'pathlib'} for x in ast.walk(tree) if isinstance(x,ast.ImportFrom))
assert all(a.name in {'os','stat','json','hashlib','time','datetime','signal','sys','re'} for x in ast.walk(tree) if isinstance(x,ast.Import) for a in x.names)
assert not any(isinstance(x,ast.Call) and isinstance(x.func,ast.Attribute) and x.func.attr in {'fork','execv','execve','system','popen'} for x in ast.walk(tree))
delta=''.join(difflib.unified_diff((A/'verify-expanded.py').read_text().splitlines(keepends=True),src.splitlines(keepends=True),fromfile='announced-prefinal',tofile='final'))
(H/'FINAL-PYTHON-LINKAGE.diff').write_text(delta)
out={'status':'READY_SOURCE_ONLY_UNRUN_AUTHORITY_NULL','sourcePins':role(P/'SOURCE-PINS.json'),'verifier':role(P/'verify-expanded.py'),'config':role(P/'CONFIG.json'),'recipe':role(P/'RECIPE.json'),'finalFiles':{p.name:role(p) for p in sorted(P.iterdir())},'preservedPrefinal':role(H/'PREFINAL-ARCHIVE-MANIFEST.json'),'announcedPrefinalSourcePinsSha256':'1b6697695b838969590f47a1791dcb64e701a2ab91025029c4de27486be7b69b','sourceParsedOnly':True,'helperTextByteExact':True,'proposalImported':False,'proposalExecuted':False,'mirrorOrDependencyPayloadRead':False,'testsOrScanRun':False,'futureAuthority':None,'executionAuthorization':False,'authoringStop':role(H/'AUTHORING-SYNTAX-STOP.json'),'finalPythonLinkageDiff':role(H/'FINAL-PYTHON-LINKAGE.diff'),'claimLimit':'Author proposal, not independent acceptance. Root/m0 source review and later real observed authority fill plus separate grant required.'}
write(H/'READY.json',out)
write(H/'PREPARATION-PINS.json',{'status':'SOURCE_AUTHORING_PROVENANCE_ONLY','files':{n:role(H/n) for n in ['prepare.py','seal_source.py','AUTHORING-SYNTAX-STOP.json','PREFINAL-ARCHIVE-MANIFEST.json','FINAL-PYTHON-LINKAGE.diff','READY.json']}})
print(json.dumps({'ready':role(H/'READY.json'),'preparationPins':role(H/'PREPARATION-PINS.json'),**{k:out[k] for k in ['sourcePins','verifier','config','recipe']}}))
