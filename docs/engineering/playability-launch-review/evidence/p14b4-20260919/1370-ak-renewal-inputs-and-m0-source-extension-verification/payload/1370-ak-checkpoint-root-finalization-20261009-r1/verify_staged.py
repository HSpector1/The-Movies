from pathlib import Path
import subprocess,json,hashlib,stat
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).parent
rel=Path('docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ak-renewal-inputs-and-m0-source-extension-verification')
A=R/rel
G=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks']
def git(*a,stdin=None):return subprocess.check_output(G+list(a),cwd=R,input=stdin)
def h(b):return hashlib.sha256(b).hexdigest()
def oid(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
assert git('rev-parse','HEAD').decode().strip()=='f0fb818fe7534c3e3784206d16728b015c7f059a'
assert git('rev-parse','HEAD:src').decode().strip()=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
git('diff','--cached','--quiet','HEAD','--','src')
m=json.loads((A/'ARCHIVE-MANIFEST.json').read_text())
assert m['summary']['roles']==len(m['files']) and m['summary']['localHashSizeOnlyRoles']==18
assert m['headAuthenticated']=='f0fb818fe7534c3e3784206d16728b015c7f059a'
copies=[r for r in m['files'] if r['archiveDisposition']=='COPIED_FINITE_PAYLOAD']
assert len(copies)>0 and sum(r['bytes'] for r in copies)==m['summary']['copiedPayloadBytes']
assert sum(r['archiveDisposition']=='AUTHENTICATED_PRIOR_HEAD_BLOB' for r in m['files'])==m['summary']['priorGitBlobRoles']
expected={str(rel/r['archiveRelativePath']) for r in copies}|{str(rel/n) for n in ['ARCHIVE-MANIFEST.json','INVENTORY-FINAL.json','ROOT-FINAL-CLAIM.txt']}|{'HANDOFF.md','docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-AK-renewal-inputs-and-m0-source-extension-verification.md'}
staged={x.decode() for x in git('diff','--cached','--name-only','-z').split(b'\0') if x}
assert staged==expected,(len(staged),len(expected))
idx={}
for rec in git('ls-files','-s','-z').split(b'\0'):
 if rec:
  meta,path=rec.split(b'\t',1);mode,ob,stage=meta.decode().split();idx[path.decode()]=(mode,ob,stage)
objects={}
for p in sorted(expected):
 file=R/p;b=file.read_bytes();mode,ob,stage=idx[p]
 assert stage=='0' and ob==oid(b) and mode==('100755' if file.stat().st_mode&0o111 else '100644'),p
 objects[ob]=b
for r in copies:
 p=A/r['archiveRelativePath'];b=p.read_bytes()
 assert len(b)==r['bytes'] and h(b)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==int(r['mode'],8)
for r in m['files']:
 if r['archiveDisposition']=='AUTHENTICATED_PRIOR_HEAD_BLOB':
  b=Path(r['sourcePath']).read_bytes();ob=r['priorGitBlob']['oid']
  assert len(b)==r['bytes'] and h(b)==r['sha256'] and oid(b)==ob
  objects[ob]=b
 elif r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY':assert 'archiveRelativePath' not in r and r['priorGitBlob'] is None and r['preservationAction']=='LOCAL_HASH_SIZE_ONLY'
raw=git('cat-file','--batch',stdin=('\n'.join(objects)+'\n').encode());pos=0
for ob,b in objects.items():
 end=raw.index(b'\n',pos);assert raw[pos:end].decode().split()==[ob,'blob',str(len(b))];pos=end+1
 assert raw[pos:pos+len(b)]==b;pos+=len(b);assert raw[pos:pos+1]==b'\n';pos+=1
assert pos==len(raw)
git('diff','--cached','--check','--','HANDOFF.md','docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-AK-renewal-inputs-and-m0-source-extension-verification.md');assert git('diff','--name-only')==b''
a={'status':'EXACT_STAGED_PATHS_BYTES_MODES_AND_PRIOR_GIT_BLOBS_VERIFIED','baseHead':'f0fb818fe7534c3e3784206d16728b015c7f059a','sourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','manifestSha256':h((A/'ARCHIVE-MANIFEST.json').read_bytes()),'stagedPaths':len(staged),'newPayloadFiles':len(copies),'newPayloadBytes':sum(r['bytes'] for r in copies),'priorGitBlobRoles':m['summary']['priorGitBlobRoles'],'hashSizeOnlyRoles':18,'actualGitBlobObjectsReadBack':len(objects),'stagedPathsList':sorted(staged),'productionSourceChanged':False}
with (P/'STAGED-VERIFICATION.json').open('x') as f:json.dump(a,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({k:v for k,v in a.items() if k!='stagedPathsList'}))
