import ast,difflib,hashlib,json,os,stat
from pathlib import Path
BASE=Path(__file__).parent;OUT=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-shared-fullpostflight-source-20261010-r7')
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(r):
 p=Path(r['path']);assert p.resolve(strict=True)==p and stat.S_ISREG(p.lstat().st_mode) and p.lstat().st_nlink==1 and p.stat().st_size<=16*1024*1024
 b=p.read_bytes();assert role(p)==r,(role(p),r)
 return b
def write(n,b):
 if isinstance(b,str):b=b.encode('utf-8')
 p=OUT/n;fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 try:os.write(fd,b);os.fsync(fd)
 finally:os.close(fd)
 assert p.read_bytes()==b
 return role(p)
def doc(n,d):return write(n,json.dumps(d,sort_keys=True,indent=2)+'\n')
data=json.loads((BASE/'INPUT.json').read_bytes());pins=json.loads(read(data['baseManifest']))
for r in pins['files'].values():read(r)
assert pins['schema']=='1370-fullfunction-shared-fullpostflight-source-pins/v1' and pins['executionAuthorization'] is False
if data['acceptedRootReviewRole'] is not None:
 review=json.loads(read(data['acceptedRootReviewRole']));assert data['acceptedRootReviewRole']['sha256']==data['acceptedRootReviewSha256'] and review['sourceManifest']==data['baseManifest'] and review['executionAuthorization'] is False and review['concreteFindings']==[]
failed=json.loads(read(data['failedPostAudit']));assert failed['qualification']['fullSharedPostflightAccepted'] is False and failed['observed']['actualFinalExit']==1 and failed['observed']['toolSessionId']==7509
OUT.mkdir(mode=0o700);files={};proofs={}
for name in ['launch-fullpostflight.py','read-fullpostflight.py']:
 original=read(pins['files'][name]).decode('utf-8','strict');updated=original
 for old,new in data['changes']:
  assert updated.count(old)==1 and new not in updated,(name,old,updated.count(old))
  updated=updated.replace(old,new)
 restored=updated
 for old,new in reversed(data['changes']):restored=restored.replace(new,old)
 assert restored==original
 helper=lambda s:{n.name:ast.dump(n,include_attributes=False) for n in ast.parse(s).body if isinstance(n,ast.FunctionDef)}
 assert helper(updated)==helper(original)
 files['BASELINE-'+name]=write('BASELINE-'+name,original);files[name]=write(name,updated)
 for suffix,a,b in [('forward.diff',original,updated),('inverse.diff',updated,original)]:files[name+'.'+suffix]=write(name+'.'+suffix,''.join(difflib.unified_diff(a.splitlines(keepends=True),b.splitlines(keepends=True),fromfile='accepted-r6/'+name,tofile='fresh-r7/'+name)))
 proofs[name]={'predecessorSource':pins['files'][name],'freshSource':files[name],'wholeLiteralInverseByteExact':True,'allFunctionsAstExact':True,'functionCount':len(helper(original)),'onlyTwoOneOccurrencePathLiteralChanges':True,'allOtherSourceBytesUnchanged':True}
files['SOURCE-PROOF.json']=doc('SOURCE-PROOF.json',{'schema':'1370-disk-recovery-fresh-original-shared-postflight-path-only-proof/v1','predecessorSourceManifest':data['baseManifest'],'predecessorAcceptedRootReviewSha256':data['acceptedRootReviewSha256'],'predecessorAcceptedRootReviewRole':data['acceptedRootReviewRole'],'reviewRoleQualification':'Root supplied exact accepted R6 review SHA; if the optional named review role is null no path/byte count has been fabricated. Root owns independent review of this fresh derivative before invocation.','exactLiteralChanges':data['changes'],'pairs':proofs,'failedPost7509Audit':data['failedPostAudit'],'originalProtocolChecksSourceConfigBaselineClocksUnchanged':True,'failedScanner35222AbsenceSeparateRootEvidenceNotInsertedIntoOriginalR4ReadbackOrPassedGroupArgs':True,'noAutomaticRetry':True,'futureActualRouteReadback':None,'futureGrant':None,'executionAuthorization':False,'candidateExecuted':False,'privateReads':False,'manifestByteCountsAndHashesFromFinalActualReadback':True})
recipe=json.loads(read(pins['files']['RECIPE.json']))
recipe['launcherArgv'][3]=str(OUT/'launch-fullpostflight.py');recipe['readerArgv'][3]=str(OUT/'read-fullpostflight.py');recipe['freshParentPath']='/Users/zacheryspector/studio-scratch/1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry';recipe['freshEvidenceLabel']='postflight-fullfunction-qualification-r4-disk-retry';recipe['failedPost7509Preserved']=True;recipe['sourceScope']='Path-only source preparation for a fresh separately granted original postflight after root-authorized disk recovery; no actual invocation or automatic retry.';recipe['failedScanner35222FreshAbsenceEvidence']='Separate root-owned actual before/after observation; original R4 route readback and passed owned groups remain unchanged.'
files['RECIPE.json']=doc('RECIPE.json',recipe)
files['LESSONS.txt']=write('LESSONS.txt','A mandatory protection scan can stop at its final disk floor even after earlier inventory calls. Empty stdout and no accepted snapshot are not full-map preservation. Preserve the failed7509 attempt; any recovery post uses fresh paths, unchanged original scanner/config/baseline/protocol and separate once authority. Root records failed-scanner absence separately; never invent it in the original R4 route readback. Prior cleanup and swap observations do not establish exclusive disk causality. Derive all UTF-8 manifest sizes/SHA from finalized retained bytes.\n')
manifest=doc('SOURCE-PINS.json',{'schema':'1370-fullfunction-shared-fullpostflight-source-pins/v1','files':files,'executionAuthorization':False})
for n,r in files.items():assert role(OUT/n)==r
seal=doc('SEAL.json',{'schema':'1370-fresh-disk-recovery-postflight-source-seal/v1','sourceManifest':manifest,'payloadCount':len(files),'readbackAllPayloadsVerified':True,'executionAuthorization':False})
for n in list(files)+['SOURCE-PINS.json','SEAL.json']:os.chmod(OUT/n,0o444)
os.chmod(OUT,0o555)
print(json.dumps({'sourceManifest':manifest,'launcher':files['launch-fullpostflight.py'],'reader':files['read-fullpostflight.py'],'sourceProof':files['SOURCE-PROOF.json'],'recipe':files['RECIPE.json'],'seal':seal}))
