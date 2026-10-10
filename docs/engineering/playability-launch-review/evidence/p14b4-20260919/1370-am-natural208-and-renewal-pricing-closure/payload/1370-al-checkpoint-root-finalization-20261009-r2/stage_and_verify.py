import hashlib,json,os,subprocess
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program')
D=Path(__file__).parent
A=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-al-owned-cleanup-repair-and-a208-control-completion'
REPORT='docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-AL-owned-cleanup-repair-and-a208-control-completion.md'
HEAD='372d15e1ae53b898be2cf633a6bb8bb0058cb01f'
def git(*args,input=None):
 return subprocess.run(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,input=input,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True,timeout=120).stdout
assert git('rev-parse','HEAD').decode().strip()==HEAD
assert git('diff','--cached','--name-only')==b''
raw=(A/'ARCHIVE-MANIFEST.json').read_bytes();manifest=json.loads(raw)
assert manifest['headAuthenticated']==HEAD and manifest['summary']['roles']==483 and manifest['summary']['localHashSizeOnlyRoles']==2
paths=['HANDOFF.md',REPORT]+[str((A/n).relative_to(R)) for n in ('ARCHIVE-MANIFEST.json','INVENTORY-FINAL.json','ROOT-FINAL-CLAIM.txt')]
for row in manifest['files']:
 if row['archiveDisposition']=='COPIED_FINITE_PAYLOAD':
  p=A/row['archiveRelativePath'];b=p.read_bytes();assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256'];paths.append(str(p.relative_to(R)))
 elif row['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY':assert row['priorGitBlob'] is None and 'archiveRelativePath' not in row
 else:assert row['archiveDisposition']=='AUTHENTICATED_PRIOR_HEAD_BLOB'
assert len(paths)==len(set(paths))==393
expected={}
for name in paths:
 p=R/name;b=p.read_bytes();oid=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest();expected[name]={'oid':oid,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
git('add','-f','--',*paths)
changed=git('diff','--cached','--name-only','-z').decode().split('\0');assert set(filter(None,changed))==set(paths)
index={}
for entry in git('ls-files','--stage','-z','--',*paths).split(b'\0'):
 if not entry:continue
 meta,path=entry.split(b'\t',1);mode,oid,stage=meta.decode().split();assert stage=='0';name=os.fsdecode(path);assert oid==expected[name]['oid'];index[name]={'mode':mode,**expected[name]}
assert set(index)==set(paths)
objects={row['oid']:row for row in expected.values()}
batch=git('cat-file','--batch',input=('\n'.join(objects)+'\n').encode());pos=0
for oid,want in objects.items():
 end=batch.index(b'\n',pos);header=batch[pos:end].decode().split();assert header==[oid,'blob',str(want['bytes'])];pos=end+1;b=batch[pos:pos+want['bytes']];assert hashlib.sha256(b).hexdigest()==want['sha256'];pos+=want['bytes'];assert batch[pos:pos+1]==b'\n';pos+=1
assert pos==len(batch)
git('diff','--cached','--check','--','HANDOFF.md',REPORT)
git('diff','--cached','--quiet','--','src')
staged_tree=git('write-tree').decode().strip();assert git('rev-parse',staged_tree+':src').decode().strip()=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
v={'status':'EXACT_STAGED_CHECKPOINT_AND_GIT_BLOBS_VERIFIED','headBefore':HEAD,'sourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','manifestSha256':hashlib.sha256(raw).hexdigest(),'stagedPaths':len(paths),'uniqueGitBlobsReadBack':len(objects),'stagedTree':staged_tree,'files':index,'rawPaddingPublished':False}
p=D/'STAGED-READBACK.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
p.chmod(0o444)
print(json.dumps({k:v[k] for k in ('status','stagedPaths','uniqueGitBlobsReadBack','manifestSha256','sourceTree')}))
