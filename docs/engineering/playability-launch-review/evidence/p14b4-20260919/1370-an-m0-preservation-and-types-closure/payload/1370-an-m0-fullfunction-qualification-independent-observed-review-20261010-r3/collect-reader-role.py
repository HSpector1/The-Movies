import os,json,hashlib
from pathlib import Path
base=Path(__file__).parent
p=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r3/READER-ACTUAL-TOOL.json')
b=p.read_bytes();data=json.loads((base/'POST-ROLES-PENDING.json').read_bytes())
reader=json.loads(b);assert reader['finalExit']==0 and reader['sessionId']==83295 and reader['allToolChunks'][-1]['exit_code']==0
data['roles']['readerActualTool']={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
encoded=(json.dumps(data,sort_keys=True,indent=2)+'\n').encode();out=base/'POST-EVIDENCE-INPUT.json'
fd=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
try:os.write(fd,encoded);os.fsync(fd)
finally:os.close(fd)
assert out.read_bytes()==encoded
print(json.dumps(data['roles']['readerActualTool']))
