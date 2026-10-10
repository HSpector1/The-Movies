import hashlib,json,os,subprocess
from pathlib import Path
D=Path(__file__).parent;R=Path('/Users/zacheryspector/The-Movies-headless-program');prefix='docs/engineering/playability-launch-review/evidence/p14b4-20260919/';arc=prefix+'1370-an-m0-preservation-and-types-closure'
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R)
assert git('rev-parse','HEAD').decode().strip()=='7087f116cf998fd86e33fb8e004df628e0686dbd'
m=json.loads((R/arc/'ARCHIVE-MANIFEST.json').read_bytes())
expected={'HANDOFF.md',prefix+'1370-AN-m0-preservation-and-types-closure.md',*(arc+'/'+name for name in ('ARCHIVE-MANIFEST.json','INVENTORY-FINAL.json','ROOT-FINAL-CLAIM.txt'))}
expected.update(arc+'/'+r['archiveRelativePath'] for r in m['files'] if r['archiveDisposition']=='COPIED_FINITE_PAYLOAD')
actual={os.fsdecode(x) for x in git('diff','--cached','--name-only','-z').split(b'\0') if x};assert actual==expected and len(actual)==2654
index={}
for row in git('ls-files','--stage','-z','--','HANDOFF.md',prefix+'1370-AN-m0-preservation-and-types-closure.md',arc).split(b'\0'):
 if not row:continue
 head,name=row.split(b'\t',1);mode,oid,stage=head.decode().split();assert stage=='0';index[os.fsdecode(name)]=(mode,oid)
assert set(index)==expected
for name,(mode,oid) in index.items():
 p=R/name;assert p.is_file() and not p.is_symlink();b=p.read_bytes();assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==oid
 assert mode==('100755' if p.stat().st_mode&0o111 else '100644')
assert git('diff','--name-only')==b''
v={'schema':'1370-an-final-index-verification/v1','status':'EXACT_REVIEWED_ARCHIVE_AND_DOCUMENTS_STAGED','head':'7087f116cf998fd86e33fb8e004df628e0686dbd','files':len(expected),'wholeStagedBlobBytesEqualFilesystem':True,'onlyExpectedPaths':True,'unstagedTrackedChanges':False,'srcTreeUnchanged':git('rev-parse','HEAD:src').decode().strip(),'noCommitOrPushClaim':True}
p=D/'INDEX-READBACK.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
p.chmod(0o444);print(json.dumps(v))
