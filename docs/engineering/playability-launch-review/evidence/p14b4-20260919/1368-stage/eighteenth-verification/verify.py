from pathlib import Path
import argparse,hashlib,json,os,stat,tarfile
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');E=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919';HERE=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--archive-root',required=True);a=ap.parse_args();P=Path(a.archive_root);A=P/'evidence.tar.gz';M=P/'MANIFEST.json'
 assert P.is_dir() and A.is_file() and M.is_file()
 m=json.loads(M.read_text());rows=m['members'];names=[x['member'] for x in rows]
 assert m['archive']==str(A) and m['archiveSha256']==sha(A) and m['archiveBytes']==A.stat().st_size
 assert len(rows)==m['memberCount'] and len(set(names))==len(rows) and names==sorted(names)
 assert sum(x['bytes'] for x in rows)==m['logicalBytes']
 dirs=m['includedDirectories'];assert len(dirs)==len(set(dirs))
 required={'1368-ledger-r6-state-capture-proposal-20261005-r1','1368-ledger-r7-exploratory-proposal-20261005-r1','1368-ledger-r7-exploratory-proposal-20261005-r2','1368-ledger-r6-clean-capture-independent-audit-20261005','1368-ledger-r7-exploratory-independent-review-20261005','1368-ledger-r7-types-clean-gate-independent-20261005','1368-ledger-r7-clean-observed-gate-independent-20261005','1368-ledger-r7-observed-independent-audit-20261005','1368-ledger-r7-descriptive-comparator-20261005-r3','1368-ledger-r7-descriptive-comparison-20261005-r3','1368-ledger-r7-comparator-independent-audit-20261005'}
 assert required.issubset(set(dirs)),sorted(required-set(dirs))
 runleaves=[('1368-ledger-recorded-runs-r6-capture-r1','ABC-types-source-r1'),('1368-ledger-recorded-runs-r6-capture-r1','ABC-clean-p13a-r1'),('1368-ledger-recorded-runs-r7-exploratory-r2','ABC-types-source-r1'),('1368-ledger-recorded-runs-r7-exploratory-r2','ABC-clean-p13a-r1'),('1368-ledger-recorded-runs-r7-exploratory-r2','ABC-observed-p13a-r1')]
 assert all(f'{root}/{leaf}' in dirs for root,leaf in runleaves)
 formal=['1368-ledger-r6-capture-r1-abc-types-source-r1','1368-ledger-r6-capture-r1-abc-clean-p13a-r1','1368-ledger-r7-exploratory-r2-abc-types-source-r1','1368-ledger-r7-exploratory-r2-abc-clean-p13a-r1','1368-ledger-r7-exploratory-r2-abc-observed-p13a-r1']
 logs=['1368-ledger-r6-capture-types-r1','1368-ledger-r6-capture-clean-p13a-r1','1368-ledger-r7-exploratory-r2-types-r1','1368-ledger-r7-exploratory-r2-clean-p13a-r1','1368-ledger-r7-exploratory-r2-observed-p13a-r1']
 expected=set();symlinks=[];caches=[]
 for name in dirs:
  root=S/name;assert root.is_dir() and not root.is_symlink(),root
  for base,subdirs,files in os.walk(root,followlinks=False):
   b=Path(base)
   for d in list(subdirs):
    q=b/d
    if q.is_symlink():symlinks.append(str(q));subdirs.remove(d)
    elif d in {'node_modules','__pycache__'}:caches.append(str(q));subdirs.remove(d)
   for fname in files:
    q=b/fname
    if q.is_symlink():symlinks.append(str(q));continue
    if fname.endswith('.pyc'):caches.append(str(q));continue
    assert q.is_file() and stat.S_ISREG(q.lstat().st_mode) and q.resolve()==q,q
    expected.add('studio-scratch/'+q.relative_to(S).as_posix())
 assert sorted(symlinks)==sorted(m['skippedSymlinks'])
 assert sorted(caches)==sorted(m['skippedCaches'])
 for stem in formal:
  for suffix in ['.json','.patch','.txt','-preflight.json','-postflight.json']:expected.add('formal-evidence/'+stem+suffix)
 for stem in logs:
  for suffix in ['.log','.log.meta']:expected.add('studio-scratch/heavy-queue/'+stem+suffix)
 expected.update({'studio-scratch/1368-seventeenth-publication-prep-r1/MANIFEST.json','studio-scratch/1368-seventeenth-independent-archive-review-20261005/REVIEW.md','studio-scratch/'+P.name+'/build_archive.py','studio-scratch/'+P.name+'/SCOPE.md'})
 assert expected==set(names),(len(expected-set(names)),len(set(names)-expected))
 assert len([n for n in names if n.startswith('formal-evidence/1368-ledger-r6-capture-r1-') or n.startswith('formal-evidence/1368-ledger-r7-exploratory-r2-')])==25
 assert len([n for n in names if n.startswith('studio-scratch/heavy-queue/1368-ledger-r6-capture-') or n.startswith('studio-scratch/heavy-queue/1368-ledger-r7-exploratory-r2-')])==10
 for pkg,count in [('1368-ledger-r6-state-capture-proposal-20261005-r1',216),('1368-ledger-r7-exploratory-proposal-20261005-r1',218),('1368-ledger-r7-exploratory-proposal-20261005-r2',219)]:
  pm=json.loads((S/pkg/'MANIFEST.json').read_text());assert len(pm['files'])==count
  assert all('studio-scratch/'+pkg+'/'+name in names for name in pm['files'])
  assert len([n for n in names if n.startswith('studio-scratch/'+pkg+'/arm/tree/')])==197
  assert len([n for n in names if n.startswith('studio-scratch/'+pkg+'/arm/tree/src/')])==188
 assert not any('/node_modules/' in n or '/__pycache__/' in n or n.endswith('.pyc') for n in names)
 with tarfile.open(A,'r:gz') as tf:
  entries=tf.getmembers();assert len(entries)==len(rows)
  for e,row in zip(entries,rows):
   assert e.isfile() and e.name==row['member'] and e.size==row['bytes']
   q=Path(row['source']);assert q.is_file() and not q.is_symlink() and q.stat().st_size==row['bytes'] and sha(q)==row['sha256'],q
   assert hashlib.sha256(tf.extractfile(e).read()).hexdigest()==row['sha256'],row['member']
 report={'decision':'ACCEPT','archive':str(A),'archiveSha256':sha(A),'manifest':str(M),'manifestSha256':sha(M),'membersVerified':len(rows),'logicalBytes':m['logicalBytes'],'directoriesComplete':len(dirs),'formalFiles':25,'laneFiles':10,'threePackageArmFiles':197,'threePackageProductionFiles':188,'skippedSymlinks':m['skippedSymlinks'],'skippedCaches':m['skippedCaches'],'sourceAndTarReadbackExact':True,'omittedIncludedRegularFiles':False}
 (HERE/'RECEIPT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if __name__=='__main__':main()
