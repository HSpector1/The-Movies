import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
P=S/'1370-c0-m0-types-r6-config-write-independent-source-proposal-after-al-20261009-r2/PROPOSAL.json'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(P)['sha256']=='3341dff99805dcd8a793116cc6466439971e6589f3ebfbbc4b1956257b07fcb2'
v=json.loads(P.read_bytes());assert v['actualCauseProven'] is False and v['executionAuthorization'] is False and v['installedVersions']=={'nestedVite':'5.4.21','topLevelVite':'6.4.3','vitest':'2.1.9'}
d={'schema':'1370-root-config-write-repair-direction-adoption/v1','status':'ROOT_ADOPTED_PROSPECTIVE_EXTERNAL_CONFIG_REPAIR_DIRECTION_ONLY','proposal':role(P),'actualR6MetadataStopReadback':role(S/'1370-c0-m0-types-parent-recorded-after-al-20261009-r6/READBACK.json'),'executionAuthorization':False,'actualCauseProven':False,'typesAccepted':False,'m0SourcePreservationAccepted':False,'historicalFailurePreserved':True,'timestampRestorationAllowed':False,'strictProtectionWaived':False,'automaticRetry':False,'nextWork':'Prepare and independently review a finite actual nested-loader disposable-fixture RED/GREEN route, then obtain its genuine recorded outcome. Separately verify complete M0 content/nonroot metadata and explicitly qualify known root drift before any changed M0 route. External root/workspace configs must preserve all original resolution and collection semantics.'}
p=A/'M0-CONFIG-WRITE-REPAIR-DIRECTION-ADOPTION.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
