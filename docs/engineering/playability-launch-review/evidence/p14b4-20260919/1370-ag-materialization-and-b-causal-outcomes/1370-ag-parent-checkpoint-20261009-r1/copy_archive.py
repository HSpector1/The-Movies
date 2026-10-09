"""Parent-only exact archive copy. No source, dependency, or private Git copies."""
import hashlib, json, os, pathlib, stat, subprocess

ROOT = pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH = pathlib.Path('/Users/zacheryspector/studio-scratch')
PREP = SCRATCH / '1370-ag-checkpoint-backup-preparation-20261008-r3'
OUT = pathlib.Path(__file__).parent
REL = pathlib.Path('docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ag-materialization-and-b-causal-outcomes')
BASE = '4812bb123781632dd39e44f918eb85a6a2c12623'
SRC = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
def sha(b): return hashlib.sha256(b).hexdigest()
def blob(b): return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def git(*args):
    return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=ROOT).decode().strip()
def write_new(p,b,mode):
    p.parent.mkdir(parents=True,exist_ok=True)
    assert p.parent.resolve() == p.parent
    fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'wb') as f:
        os.fchmod(f.fileno(),mode); f.write(b); f.flush(); os.fsync(f.fileno())
    assert p.read_bytes()==b and stat.S_IMODE(p.stat().st_mode)==mode
assert git('rev-parse','HEAD')==BASE
assert git('rev-parse','HEAD:src')==SRC
assert not git('status','--porcelain')
assert not os.path.lexists(SCRATCH/'HEAVY-LANE-LOCK')
assert not os.path.lexists(ROOT/REL)
pinbytes=(PREP/'PREPARATION-PINS.json').read_bytes()
assert sha(pinbytes)=='9aa0c9063aef626c28bc2fa781392d106ff84adc1cdc20014f3840624f0a15ae'
pins=json.loads(pinbytes)
raw=(PREP/'BACKUP-MANIFEST-PROPOSED.json').read_bytes()
assert sha(raw)==pins['manifestSha256']
manifest=json.loads(raw)
assert manifest['baseCheckpointHead']==BASE and manifest['unchangedProductionSourceTree']==SRC
records=[]
for r in manifest['archiveCandidates']:
    src=pathlib.Path(r['source']); dest=ROOT/r['proposedRepositoryPath']
    assert src.is_relative_to(SCRATCH) and src.resolve()==src
    assert dest.is_relative_to(ROOT/REL) and '..' not in dest.parts
    st=src.lstat()
    assert stat.S_ISREG(st.st_mode)
    assert (st.st_dev,st.st_ino,st.st_nlink,stat.S_IMODE(st.st_mode),st.st_size)==(r['device'],r['inode'],r['links'],r['mode'],r['bytes'])
    b=src.read_bytes(); assert (len(b),sha(b),blob(b))==(r['bytes'],r['sha256'],r['gitBlobOid'])
    records.append((dest,b,r['mode']))
for name in manifest['proposalCompanionFiles']:
    src=PREP/name; b=src.read_bytes()
    assert src.resolve()==src and src.is_file()
    if name=='PREPARATION-PINS.json': mode=stat.S_IMODE(src.stat().st_mode)
    else:
        r=pins['files'][name]; mode=r['mode']
        assert (len(b),sha(b),blob(b),stat.S_IMODE(src.stat().st_mode))==(r['bytes'],r['sha256'],r['gitBlobOid'],mode)
    records.append((ROOT/REL/PREP.name/name,b,mode))
assert len({str(p) for p,b,m in records})==len(records)
assert all(not os.path.lexists(p) for p,b,m in records)
for p,b,mode in records: write_new(p,b,mode)
result={'status':'EXACT_ARCHIVE_COPY_VERIFIED','baseCheckpointHead':BASE,'unchangedProductionSourceTree':SRC,'candidateFiles':len(manifest['archiveCandidates']),'candidateBytes':sum(r['bytes'] for r in manifest['archiveCandidates']),'companionFiles':len(manifest['proposalCompanionFiles']),'rawMachineFilesCopied':0,'files':[{'repositoryPath':str(p.relative_to(ROOT)),'sha256':sha(b),'bytes':len(b),'gitBlobOid':blob(b),'mode':mode} for p,b,mode in records]}
write_new(OUT/'COPY-RESULT.json',(json.dumps(result,indent=2,sort_keys=True)+'\n').encode(),0o600)
print(json.dumps({k:v for k,v in result.items() if k!='files'}))
