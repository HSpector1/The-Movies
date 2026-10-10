import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;old=(A/'adopt_fullfunction_r4_protected_stop.py').read_text();assert hashlib.sha256(old.encode()).hexdigest()=='ba51af371d108f4944e0ce97442267b03aedac540e1bf0a643abfe92884eb5ee'
new=old
for a,b in [('len(sys.argv)==3','len(sys.argv)==4'),("f['toolSessionId']==7509","f['toolSessionId']==int(sys.argv[3])")]:assert new.count(a)==1;new=new.replace(a,b)
needle="assert not os.path.lexists(S/'HEAVY-LANE-LOCK')"
extra="""assert sys.argv[3].isdigit() and int(sys.argv[3])>1 and int(sys.argv[3])!=7509
assert role(f['actualTool']['path'])==f['actualTool']
actualPost=read(f['actualTool']['path']);assert actualPost['sessionId']==int(sys.argv[3]) and actualPost['finalExit']==0 and actualPost['allToolChunks'][-1]['exit_code']==0
failedPostRole=role(A/'FULLFUNCTION-R4-SHARED-POST-DISK-STOP-OBSERVED-ADOPTION.json');assert failedPostRole['sha256']=='317c5e580df7599c83c390b1269e1d2a64f34788b1622d89941c7b077a763307'
failedPost=read(failedPostRole['path']);assert failedPost['original7509RemainsFailure'] is True and failedPost['fullSharedPostflightAccepted'] is False and failedPost['executionAuthorization'] is False
failedScannerChecks=[]
for fn,kind in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(35222,0)
 except ProcessLookupError:failedScannerChecks.append({'kind':kind,'id':35222,'result':'ESRCH'})
 else:raise RuntimeError('Old failed post scanner remains')
"""+needle
assert new.count(needle)==1;new=new.replace(needle,extra)
needle2="p=A/'FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json'"
new=new.replace(needle2,"v.update({'failedSharedPostPreserved':failedPostRole,'failedPostScannerChecksAfterFreshPost':failedScannerChecks,'originalSharedPost7509RemainsFailure':True,'freshPassingSharedPostSession':int(sys.argv[3])})\n"+needle2)
compile(new,'adopt_fullfunction_r4_protected_stop_after_disk.py','exec');p=A/'adopt_fullfunction_r4_protected_stop_after_disk.py'
with p.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'path':str(p),'bytes':len(new.encode()),'sha256':hashlib.sha256(new.encode()).hexdigest(),'sourceOnly':True,'executionAuthorization':False,'oldUnrunAdopterExpectedFailedPost7509AndCannotAdmitIt':True,'newFutureArgument':'Genuine completed fresh post tool session ID, crosschecked exact retained actual envelope'}))
