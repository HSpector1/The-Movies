from pathlib import Path
import collections, datetime, hashlib, json, os, stat, tarfile
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
E=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
A=S/'1368-fifteenth-publication-prep-r1'
O=S/'1368-fifteenth-independent-archive-review-20261005'
manifest=json.loads((A/'MANIFEST.json').read_text())
archive=A/'evidence.tar.gz'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert manifest['archive']==str(archive)
assert archive.stat().st_size==manifest['archiveBytes']==3583411
assert sha(archive)==manifest['archiveSha256']=='edcfce58af00c8946819a46dcafcc212ecaa173e37fc6aa9c818ad97d482f2e4'
assert sha(A/'MANIFEST.json')=='28d330f673011e13e2a9742967f50ee967d8d08d58f3af3b357a6dbb818f646d'
rows=manifest['members']
assert len(rows)==manifest['memberCount']==136 and sum(x['bytes'] for x in rows)==manifest['logicalBytes']==33079477
indexed={r['member']:r for r in rows}
assert len(indexed)==len(rows)
source_names=[
 '1368-r8-integration-prep-r1/run-types-r2','1368-r8-integration-prep-r1/run-current-r1',
 '1368-r8-integration-prep-r1/run-helper-consumers-r1','1368-r8-integration-prep-r1/run-p15-r1',
 '1368-r8-attribution-prep-r3','1368-r8-attribution-current-r1','1368-r8-attribution-helper-consumers-r1',
 '1368-r8-attribution-p15-r1','1368-r8-attribution-r3-independent-review-20261005-a',
 '1368-r8-independent-review-20261005-a','1368-r8-explicit-landing-kit-20261005-a',
 '1368-ledger-lowspace-runner-proposal-r1','1368-ledger-lowspace-runner-proposal-r2',
 '1368-ledger-lowspace-independent-review-r1','1368-1363v-source-role-amendment-draft-20261005-r2',
 '1368-1363v-source-role-authority-r2-review-20261005','1368-r8-independent-formal-attribution-audit-20261005']
expected=set();counts={};symlinks=[]
for name in source_names:
 root=S/name;assert root.is_dir() and not root.is_symlink()
 count=0
 for base,dirs,files in os.walk(root,followlinks=False):
  current=Path(base)
  for child in dirs+files:
   p=current/child
   if p.is_symlink():symlinks.append(str(p))
  dirs[:]=[d for d in dirs if not (current/d).is_symlink()]
  for f in files:
   p=current/f
   if p.is_symlink():continue
   assert stat.S_ISREG(p.stat().st_mode)
   expected.add('studio-scratch/'+p.relative_to(S).as_posix());count+=1
 counts[name]=count
assert not symlinks,symlinks
for p in (S/'1368-r8-integration-prep-r1').iterdir():
 if p.is_file() and not p.is_symlink():expected.add('studio-scratch/'+p.relative_to(S).as_posix())
for relative in ['1368-save46-swept-proposal-r8/SOURCE-PINS.json','1368-save46-swept-proposal-r8/ASSEMBLY.json']:
 expected.add('studio-scratch/'+relative)
for stem in ['1368-r8-types-r2','1368-r8-current-r1','1368-r8-helper-consumers-r1','1368-r8-p15-formal-r1']:
 for suffix in ['.log','.log.meta']:expected.add('studio-scratch/heavy-queue/'+stem+suffix)
for stem in ['1368-swept-r8-types-r2','1368-swept-r8-current-r1','1368-swept-r8-helper-consumers-r1','1368-swept-r8-p15-r1']:
 for suffix in ['.json','.patch','.txt','-preflight.json','-postflight.json']:expected.add('formal-evidence/'+stem+suffix)
assert set(indexed)==expected,{'missing':sorted(expected-set(indexed)),'extra':sorted(set(indexed)-expected)}
for name,row in indexed.items():
 assert '..' not in Path(name).parts and not name.startswith('/') and '/tree/' not in name
 src=Path(row['source']);assert src.exists() and src.is_file() and not src.is_symlink()
 assert src.stat().st_size==row['bytes'] and sha(src)==row['sha256']
 if name.startswith('studio-scratch/'):assert src==S/name.removeprefix('studio-scratch/')
 else:assert name.startswith('formal-evidence/') and src==E/name.removeprefix('formal-evidence/')
with tarfile.open(archive,'r:gz') as tar:
 members=tar.getmembers();assert len(members)==len(rows)
 assert len({m.name for m in members})==len(members)
 assert {m.name for m in members}==set(indexed)
 for m in members:
  row=indexed[m.name]
  assert m.isfile() and not (m.issym() or m.islnk() or m.isdir() or m.isdev())
  assert m.size==row['bytes']
  data=tar.extractfile(m).read()
  assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
  assert data==Path(row['source']).read_bytes()
receipt={'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archiveSha256':sha(archive),'manifestSha256':sha(A/'MANIFEST.json'),'archiveBytes':archive.stat().st_size,'memberCount':len(rows),'logicalBytes':sum(x['bytes'] for x in rows),'enumeratedDirectoryRegularCounts':counts,'formalEvidenceMembers':sum(n.startswith('formal-evidence/') for n in indexed),'laneLogMembers':sum(n.startswith('studio-scratch/heavy-queue/') for n in indexed),'symlinkSources':symlinks,'archiveMemberTypes':'all regular','memberNamesExact':True,'sourceBytesExact':True,'tarReadbackExact':True,'frozenTreeMembers':0,'issues':[]}
(O/'RECEIPT.json').write_text(json.dumps(receipt,indent=2,sort_keys=True)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='enumeratedDirectoryRegularCounts'},indent=2))
