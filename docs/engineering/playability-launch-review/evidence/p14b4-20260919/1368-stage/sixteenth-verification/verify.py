from pathlib import Path
import hashlib, json, os, stat, tarfile
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
E=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
P=S/'1368-sixteenth-publication-prep-r1'
M=P/'MANIFEST.json'; A=P/'evidence.tar.gz'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads(M.read_text()); rows=m['members']; names=[x['member'] for x in rows]
assert sha(A)==m['archiveSha256']=='8cca3370c901c21b33539b0ce48747738a5f1b98ae738120f0273848f109bfcb'
assert A.stat().st_size==m['archiveBytes']==1001119
assert len(rows)==m['memberCount']==154 and len(set(names))==len(rows)
assert sum(x['bytes'] for x in rows)==m['logicalBytes']==19215664
assert m['skippedSymlinks']==[] and names==sorted(names)
assert all('/tree/' not in n and not n.endswith('/tree') for n in names)
assert all((n.startswith('studio-scratch/') or n.startswith('formal-evidence/')) and '..' not in Path(n).parts for n in names)
assert all(x['source']==str(S/Path(x['member']).relative_to('studio-scratch')) if x['member'].startswith('studio-scratch/') else x['source']==str(E/Path(x['member']).relative_to('formal-evidence')) for x in rows)
run_leaves=['ABC-types-source-r1','ABC-clean-p13a-r1','ABC-observed-p13a-r1','C0-types-source-baseline-r1','C0-clean-p13a-baseline-r1']
formal_stems=['1368-ledger-r4-lowspace-r2-abc-types-source-r1','1368-ledger-r4-lowspace-r2-abc-clean-p13a-r1','1368-ledger-r4-lowspace-r2-abc-observed-p13a-r1','1368-ledger-r4-lowspace-r2-c0-types-source-baseline-r1','1368-ledger-r4-lowspace-r2-c0-clean-p13a-baseline-r1']
log_stems=['1368-ledger-r4-lowspace-r2-types-r1','1368-ledger-r4-lowspace-r2-clean-p13a-r1','1368-ledger-r4-lowspace-r2-observed-p13a-r1','1368-ledger-r4-lowspace-r2-c0-types-source-baseline-r1','1368-ledger-r4-lowspace-r2-c0-clean-p13a-baseline-r1']
required_dirs=['1368-ledger-lowspace-runner-proposal-r2','1368-ledger-lowspace-independent-review-r1','1368-ledger-r4-abc-clean-gate-independent-review-20261005','1368-ledger-r4-observed-timeout-review-20261005','1368-ledger-r4-two-clean-descriptive-20261005','1368-ledger-r4-c0-baseline-prep-20261005-r1','1368-ledger-r4-readiness-review-20261005-r1','1368-ledger-lowspace-r2-execution-plan-20261005-r1','1368-ledger-r5-observed-proposal-20261005-r1','1368-ledger-r5-observed-proposal-20261005-r2','1368-ledger-r5-observed-profile-design-20261005-r1','1368-ledger-r5-index-independent-review-20261005','1368-ledger-r4-c0-baseline-independent-audit-20261005']+[f'1368-ledger-recorded-runs-r4-lowspace-r2/{leaf}' for leaf in run_leaves]
assert set(required_dirs)==set(m['includedDirectories'])
expected=set()
for dirname in required_dirs:
 root=S/dirname
 assert root.is_dir() and not root.is_symlink()
 for base,dirs,files in os.walk(root,followlinks=False):
  for d in dirs: assert not (Path(base)/d).is_symlink(),Path(base)/d
  for f in files:
   p=Path(base)/f
   assert p.is_file() and not p.is_symlink() and stat.S_ISREG(p.stat().st_mode)
   expected.add('studio-scratch/'+p.relative_to(S).as_posix())
for stem in formal_stems:
 for suffix in ['.json','.patch','.txt','-preflight.json','-postflight.json']:
  expected.add('formal-evidence/'+stem+suffix)
for stem in log_stems:
 for suffix in ['.log','.log.meta']:
  expected.add('studio-scratch/heavy-queue/'+stem+suffix)
assert expected.issubset(set(names)),sorted(expected-set(names))
assert sum('formal-evidence/'+stem+suffix in names for stem in formal_stems for suffix in ['.json','.patch','.txt','-preflight.json','-postflight.json'])==25
assert len([n for n in names if n.startswith('studio-scratch/heavy-queue/1368-ledger-r4-lowspace-r2-')])==10
assert 'studio-scratch/1368-ledger-r5-index-independent-review-20261005/R2-REVIEW.md' in names
assert 'studio-scratch/1368-ledger-r5-index-independent-review-20261005/R2-RECEIPT.json' in names
with tarfile.open(A,'r:gz') as tf:
 entries=tf.getmembers()
 assert len(entries)==len(rows)
 for entry,row in zip(entries,rows):
  assert entry.name==row['member'] and entry.isfile() and entry.size==row['bytes']
  src=Path(row['source'])
  assert src.is_file() and not src.is_symlink() and src.stat().st_size==row['bytes']
  assert sha(src)==row['sha256']
  assert hashlib.sha256(tf.extractfile(entry).read()).hexdigest()==row['sha256']
report={'decision':'ACCEPT','archive':str(A),'archiveSha256':sha(A),'manifest':str(M),'manifestSha256':sha(M),'memberCount':len(rows),'logicalBytes':sum(r['bytes'] for r in rows),'formalFiles':25,'laneFiles':10,'runDirectories':run_leaves,'includedDirectories':len(required_dirs),'sourceAndTarReadbackExact':True,'symlinksOrTrees':False,'omittedIncludedRegularFiles':False,'optionalOmitted':m['optionalOmitted']}
out=Path(__file__).with_name('RECEIPT.json'); out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
