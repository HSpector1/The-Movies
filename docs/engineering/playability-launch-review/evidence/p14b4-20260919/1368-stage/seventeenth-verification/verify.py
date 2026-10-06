from pathlib import Path
import hashlib,json,os,stat,tarfile
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');E=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919';P=S/'1368-seventeenth-publication-prep-r1';A=P/'evidence.tar.gz';M=P/'MANIFEST.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(A)=='d0ff1fdb5afcf2c9dace670b098ca708f2220f6d73d7821dbc0c2d5bcffe73a2'
assert sha(M)=='5f71a7e0a55ebc62db54cad64746301e70eec93b28b9b8504a6790293edd1c7d'
m=json.loads(M.read_text());rows=m['members'];names=[x['member'] for x in rows]
assert len(rows)==m['memberCount']==304 and len(set(names))==len(rows) and names==sorted(names)
assert sum(x['bytes'] for x in rows)==m['logicalBytes']==15300326
assert A.stat().st_size==m['archiveBytes']==1978621 and m['archiveSha256']==sha(A)
required_dirs=['1368-ledger-r5-profile-proposal-20261005-r1','1368-ledger-r5-profile-independent-review-20261005','1368-ledger-r5-profile-clean-gate-independent-20261005','1368-ledger-r5-observed-profile-design-20261005-r1','1368-ledger-r5-snap-optimization-proposal-20261005-r1','1368-ledger-r5-snap-optimization-proposal-20261005-r2','1368-ledger-r5-snap-optimization-proposal-20261005-r3','1368-ledger-r5-snap-optimization-review-20261005-r1','1368-ledger-r5-profile-observed-independent-audit-20261005']
leaves=['ABC-types-source-r1','ABC-clean-p13a-r1','ABC-observed-p13a-r1']
required_dirs += ['1368-ledger-recorded-runs-r5-profile-r1/'+x for x in leaves]
assert m['includedDirectories']==required_dirs
assert m['skippedSymlinks']==[str(S/'1368-ledger-r5-profile-proposal-20261005-r1/arm/tree/node_modules')]
assert m['skippedCaches']==[str(S/'1368-ledger-r5-profile-proposal-20261005-r1/runner/__pycache__')]
assert (S/'1368-ledger-r5-profile-proposal-20261005-r1/arm/tree/node_modules').is_symlink()
assert (S/'1368-ledger-r5-profile-proposal-20261005-r1/runner/__pycache__').is_dir()
expected=set()
for dirname in required_dirs:
 root=S/dirname;assert root.is_dir() and not root.is_symlink()
 for base,dirs,files in os.walk(root,followlinks=False):
  for d in list(dirs):
   path=Path(base)/d
   if path.is_symlink() or d=='__pycache__':dirs.remove(d);continue
  for f in files:
   path=Path(base)/f
   assert path.is_file() and not path.is_symlink() and stat.S_ISREG(path.stat().st_mode),path
   expected.add('studio-scratch/'+path.relative_to(S).as_posix())
formal=['1368-ledger-r5-profile-r1-abc-types-source-r1','1368-ledger-r5-profile-r1-abc-clean-p13a-r1','1368-ledger-r5-profile-r1-abc-observed-p13a-r1']
logs=['1368-ledger-r5-profile-types-r1','1368-ledger-r5-profile-clean-p13a-r1','1368-ledger-r5-profile-observed-p13a-r1']
for stem in formal:
 for suffix in ['.json','.patch','.txt','-preflight.json','-postflight.json']:expected.add('formal-evidence/'+stem+suffix)
for stem in logs:
 for suffix in ['.log','.log.meta']:expected.add('studio-scratch/heavy-queue/'+stem+suffix)
expected.update(['studio-scratch/1368-sixteenth-publication-prep-r1/MANIFEST.json','studio-scratch/1368-sixteenth-independent-archive-review-20261005/REVIEW.md'])
assert set(names)==expected,(len(expected-set(names)),len(set(names)-expected))
assert len([n for n in names if n.startswith('studio-scratch/1368-ledger-r5-profile-proposal-20261005-r1/arm/tree/')])==197
assert len([n for n in names if n.startswith('studio-scratch/1368-ledger-r5-profile-proposal-20261005-r1/arm/tree/src/')])==188
assert not any('/node_modules/' in n or '/__pycache__/' in n for n in names)
with tarfile.open(A,'r:gz') as tf:
 entries=tf.getmembers();assert len(entries)==len(rows)
 for entry,row in zip(entries,rows):
  assert entry.isfile() and entry.name==row['member'] and entry.size==row['bytes']
  p=Path(row['source']);assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and sha(p)==row['sha256']
  assert hashlib.sha256(tf.extractfile(entry).read()).hexdigest()==row['sha256']
report={'decision':'ACCEPT','archiveSha256':sha(A),'manifestSha256':sha(M),'membersVerified':len(rows),'logicalBytes':m['logicalBytes'],'directoriesComplete':len(required_dirs),'formalFiles':15,'laneFiles':6,'armFiles':197,'productionFiles':188,'excludedSymlink':m['skippedSymlinks'],'excludedCache':m['skippedCaches'],'sourceAndTarReadbackExact':True,'omittedRegularFiles':False}
out=Path(__file__).with_name('RECEIPT.json');out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
