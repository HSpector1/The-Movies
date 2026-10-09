from pathlib import Path
import os,json,hashlib,stat,sys,datetime
S=Path('/Users/zacheryspector/studio-scratch');P=Path(__file__).resolve().parent;M=P/'BACKUP-MANIFEST-DRAFT.json';j=json.loads(M.read_text());assert len(sys.argv)==3
review=Path(sys.argv[1]);reviewraw=review.read_bytes();assert hashlib.sha256(reviewraw).hexdigest()==sys.argv[2];r=json.loads(reviewraw);assert 'STOP' in r['decision']
roots=[S/'1370-c0-b109-encoder-controls-parent-recorded-20261009-r2',S/'1370-c0-b109-encoder-recorder-red-original-r1-lane-20261009-r2',S/'1370-c0-b109-encoder-recorder-green-repaired-r2-lane-20261009-r2',S/'1370-c0-m0-market-observer-next-recorded-route-readiness-20261009-r1',review.parent,S/'1370-c0-three-employment-preimages-observed-independent-review-20261009-r1']
a=j['archiveCandidates'];local=j['localOnlyHashSize'];known={x['source'] for x in a+local};prefix='docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ag-materialization-and-b-causal-outcomes/'
for root in roots:
 for p in sorted(root.iterdir()):
  if str(p) in known:continue
  st=p.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1;raw=p.read_bytes();rel=str(p.relative_to(S));h=hashlib.sha256(raw).hexdigest()
  # Exact owned lane logs/source/facts allowed; actual machine-wide rows remain local.
  private=any(mark in raw for mark in [b'/Applications/Google Chrome',b'/Applications/Slack',b'/Applications/Spotify']) or any(mark in p.name.upper() for mark in ['LSOF','CURRENT-PS','COMM-ARGS','GLOBAL-PS'])
  if private:local.append({'source':str(p),'relativePath':rel,'sha256':h,'bytes':len(raw),'reason':'Actual raw machine-wide process/FD or unrelated application enumeration retained locally; hash/size only.'})
  else:a.append({'source':str(p),'relativePath':rel,'proposedRepositoryPath':prefix+rel,'sha256':h,'bytes':len(raw),'gitBlobOid':hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest(),'device':st.st_dev,'inode':st.st_ino,'mode':stat.S_IMODE(st.st_mode),'links':st.st_nlink})
for x in a:
 p=Path(x['source']);st=p.lstat();raw=p.read_bytes();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and not p.is_symlink();assert p.resolve(strict=True)==p
 x.update(sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw),gitBlobOid=hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest(),device=st.st_dev,inode=st.st_ino,mode=stat.S_IMODE(st.st_mode),links=st.st_nlink)
assert len({x['proposedRepositoryPath'] for x in a})==len(a)
for x in j['priorCheckpointReferences']:
 p=Path('/Users/zacheryspector/The-Movies-headless-program')/x['reuseFrom']['repositoryPath'];raw=p.read_bytes();assert hashlib.sha256(raw).hexdigest()==x['sha256'] and len(raw)==x['bytes'] and hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()==x['gitBlobOid']
for root in roots:
 vals=[x for x in a if str(Path(x['source']).parent)==str(root)];loc=[x for x in local if str(Path(x['source']).parent)==str(root)];d={'sourceRoot':str(root),'archiveFiles':len(vals),'archiveBytes':sum(x['bytes'] for x in vals),'localOnly':len(loc),'priorReferences':0};rec=next((x for x in j['sourceGroups'] if x['sourceRoot']==str(root)),None)
 if rec:rec.update(d)
 else:j['sourceGroups'].append(d)
j['RecorderControlsActualStop']={'parentOutcomePath':str(roots[0]/'PARENT-TOOL-OUTCOME.json'),'parentOutcomeSha256':'9b722312e2b5b3b25bffd0580136d47ebb64c2aee32fb5d048f5559acaf6bc51','independentReceiptPath':str(review),'independentReceiptSha256':sys.argv[2],'decision':r['decision'],'redCases':14,'redFailures':13,'greenCases':14,'greenFailures':1,'redActualExit':1,'greenActualExit':1,'encoderControlsRun':False,'benchmarkRun':False,'speedupObserved':False,'childStageCauseKnown':False}
j['M0Readiness']={'noteSha256':'3607bdbf47e30f4c413d66cb7e77c6f96b68bf82a7b7e51e8673d4d2e725a991','factsSha256':'d4ebf5989df8ed2732b95081a1d77d8c875c4905cf03c0a3ee4bddd73b04419c','scope':'Existing source route readiness only; HEAD/root/scope/types/collection/real wiring RED/neutral416/replay gates remain unfilled.'}
j['pending']=[];j['futureUnrunRoles']=['Encoder11 controls and pure benchmark: blocked by actual repaired recorder control STOP, not accepted performance','Existing M0 operational scope/HEAD/date/isolated-root/type/collection/wiring/neutral416/replay gates','Distinct H→aging quote and aging→M0 unmatched assignment causal traces'];j['status']='FINAL_PROPOSED_CHECKPOINT_AT_ACTUAL_RECORDER_CONTROL_STOP';j['utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
summary=json.loads((P/'INVENTORY-SUMMARY-DRAFT.json').read_text());summary.update(status=j['status'],archiveFiles=len(a),archiveBytes=sum(x['bytes'] for x in a),roots=len(j['sourceGroups']),pendingRoles=0,localOnlyFiles=len(local),newContentClassifiedLocalOnly=len(local)-25,addedArchiveFilesSinceR2=len(a)-623)
# Final companion hashes live in separate pins; never make the manifest self-referential.
final_names=['1370-AG-OUTCOME-PROPOSED.md','HANDOFF-PROPOSED.md','BACKUP-PLAN.md','BACKUP-MANIFEST-PROPOSED.json','INVENTORY-SUMMARY.json','PRIVACY-CONTENT-REVIEW.json','LESSONS.md']
drafts=sorted(p.name for p in P.iterdir() if p.is_file() and p.name.endswith('-DRAFT.json') or p.is_file() and p.name.endswith('-DRAFT.md'))
scripts=sorted(p.name for p in P.iterdir() if p.is_file() and p.suffix=='.py')
j['proposalCompanionFiles']=final_names+drafts+scripts+['PREPARATION-PINS.json'];j['proposalCompanionPolicy']='Archive the listed final r3 proposal companions and preserved r3 drafts/scripts separately alongside candidate files; PREPARATION-PINS binds exact companion bytes/modes/blob identities, excluding its own self-hash. No r2 filenames are implied present in r3.'
def write(name,value):
 raw=value if isinstance(value,bytes) else (json.dumps(value,sort_keys=True,indent=2)+'\n').encode();fd=os.open(P/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(raw)
write('BACKUP-MANIFEST-PROPOSED.json',j);write('INVENTORY-SUMMARY.json',summary)
pr=json.loads((P/'PRIVACY-CONTENT-REVIEW-DRAFT.json').read_text());pr.update(status='FINAL_CONTENT_CLASSIFIED_LOCAL_RAW_HASH_ONLY',localOnlyTotal=len(local),newLocalOnlyPaths=[x['relativePath'] for x in local[25:]]);write('PRIVACY-CONTENT-REVIEW.json',pr)
for src,dest in [('1370-AG-OUTCOME-DRAFT.md','1370-AG-OUTCOME-PROPOSED.md'),('HANDOFF-DRAFT.md','HANDOFF-PROPOSED.md'),('BACKUP-ACTIONS-DRAFT.md','BACKUP-PLAN.md'),('LESSONS-DRAFT.md','LESSONS.md')]:
 t=(P/src).read_text().replace('SCRATCH DRAFT.','SCRATCH FINAL PROPOSAL.').replace('Scratch proposal by Codex','Final scratch proposal by Codex').replace('read-only draft contains','final read-only proposal contains')
 import re
 t=re.sub(r'Current draft\d+files/[\d,]+bytes',f"Final archive{len(a)}files/{summary['archiveBytes']:,}bytes",t)
 t=re.sub(r'contains \d+ exact source/evidence files across \d+ selected groups \([\d,]+ bytes\)',f"contains {len(a)} exact source/evidence files across {summary['roots']} selected groups ({summary['archiveBytes']:,} bytes)",t)
 t=t.replace('including its independent review.','including independently qualified STOP receipt '+sys.argv[2]+'.')
 if dest in ['1370-AG-OUTCOME-PROPOSED.md','HANDOFF-PROPOSED.md']:t=t.replace('Parent9b722312.../grantdbe72e87... preserves exact logs/meta;','Parent9b722312.../grantdbe72e87... and independent STOP'+sys.argv[2][:12]+'... preserve exact logs/meta;')
 write(dest,t.encode())
records={}
for name in final_names+drafts+scripts:
 p=P/name;raw=p.read_bytes();st=p.lstat();records[name]={'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'mode':stat.S_IMODE(st.st_mode),'gitBlobOid':hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()}
write('PREPARATION-PINS.json',{'schema':'1370-ag-checkpoint-final-scratch-proposal-pins-r3','status':j['status'],'files':records,'manifestSha256':records['BACKUP-MANIFEST-PROPOSED.json']['sha256'],'archiveCandidateFiles':len(a),'archiveCandidateBytes':summary['archiveBytes'],'sourceGroups':summary['roots'],'priorCheckpointReferences':97,'localOnlyHashSizeFiles':len(local),'companionFilesExcludingPins':len(records),'companionBytesExcludingPins':sum(x['bytes'] for x in records.values()),'gameOrFullScanExecuted':False,'productionMutationExecuted':False,'scope':'Finite source/evidence copy/checkpoint proposal. Parent owns safe archive/doc/commit/push/readback; failures preserved and future launch gates unfilled.'})
print(json.dumps({'summary':summary,'pinsSha256':hashlib.sha256((P/'PREPARATION-PINS.json').read_bytes()).hexdigest(),'manifestSha256':records['BACKUP-MANIFEST-PROPOSED.json']['sha256'],'companions':len(records)+1,'companionBytesExcludingPins':sum(x['bytes'] for x in records.values())},sort_keys=True))
