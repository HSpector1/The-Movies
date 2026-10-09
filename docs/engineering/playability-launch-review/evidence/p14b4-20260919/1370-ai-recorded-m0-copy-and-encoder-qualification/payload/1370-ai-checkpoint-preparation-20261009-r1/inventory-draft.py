"""Finite archive-planning hashes only. No repo writes, Git, source import or launch."""
from pathlib import Path
import hashlib,json,os,stat
S=Path('/Users/zacheryspector/studio-scratch');OUT=S/'1370-ai-checkpoint-preparation-20261009-r1';selection=json.loads((OUT/'SELECTED-DIRECTORIES.json').read_bytes());records=[];summaries=[]
def snap(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def file_role(path,package,relative,evidence_role=None,expected=None):
 p=Path(path);before=p.lstat();assert stat.S_ISREG(before.st_mode) and p.resolve(strict=True)==p and not p.is_symlink();assert before.st_size<=64*1024**2
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert snap(os.fstat(fd))==snap(before);digest=hashlib.sha256();size=0
  while True:
   block=os.read(fd,65536)
   if not block:break
   size+=len(block);digest.update(block)
  assert snap(os.fstat(fd))==snap(before)==snap(p.lstat());assert size==before.st_size
 finally:os.close(fd)
 sha=digest.hexdigest();assert expected is None or expected==sha
 rawmachine=('PS' in p.name.upper() or 'LSOF' in p.name.upper()) and ('PS' in p.name.upper().replace('PINS','') or 'LSOF' in p.name.upper())
 # Only actual machine raw dump suffixes; source/scripts and PINS are never classified by loose PS matching.
 rawmachine=bool(('LSOF' in p.name.upper() or p.name.upper() in {'BEFORE-PS.TXT','AFTER-PS.TXT','PS.TXT','PS.BIN','RAW-PS.TXT'}) and p.suffix.lower() in {'.bin','.txt'})
 synthetic=size>1024**2 and ('synthetic' in relative.lower() or 'padding' in relative.lower()) and evidence_role is None
 action='LOCAL_HASH_SIZE_ONLY' if rawmachine or synthetic else 'COPY_FINITE_PAYLOAD'
 record={'sourcePath':str(p),'package':package,'relativePath':relative,'mode':format(stat.S_IMODE(before.st_mode),'04o'),'bytes':size,'sha256':sha,'nlink':before.st_nlink,'preservationAction':action,'reason':'Raw machine process/FD dump; local only' if rawmachine else 'Identified synthetic control padding over1MiB; local only' if synthetic else 'Finite completed source/evidence payload','priorGitBlob':'NOT_QUERIED_NO_GIT_OPERATIONS','evidenceRole':evidence_role}
 records.append(record);return record
for name in selection['directoryNames']:
 root=S/name;entries=[]
 def walk(path,depth=0):
  assert depth<=5
  for e in sorted(os.scandir(path),key=lambda e:e.name):
   assert e.name not in {'.git','node_modules'} and not e.is_symlink()
   if e.is_dir(follow_symlinks=False):walk(Path(e.path),depth+1)
   else:assert e.is_file(follow_symlinks=False);entries.append(file_role(e.path,name,str(Path(e.path).relative_to(root))))
 walk(root);summaries.append({'sourceDirectory':str(root),'mode':format(stat.S_IMODE(root.lstat().st_mode),'04o'),'regularFileCount':len(entries),'emptyDirectoryEvidence':not entries})
# Precisely named finite H/F1 quote-proof inputs, not weekly/capture/whole private roots.
ip=Path('/Users/zacheryspector/studio-scratch/1370-c0-remaining-employment-quote-next-slice-independent-20261009-r1/INPUT-PINS.json');assert hashlib.sha256(ip.read_bytes()).hexdigest()=='b23846669624467a16a2b111f7df806760e1f595338e7c6161a99d9c7a1c35a6';inputs=json.loads(ip.read_bytes())
for role in ['H_result','H_context','F1_result','F1_context','F1_trace']:
 q=inputs[role];r=file_role(q['path'],'remaining38-finite-observed-inputs',role+'/'+Path(q['path']).name,role,q['sha256']);assert r['bytes']==q['bytes'];assert r['preservationAction']=='COPY_FINITE_PAYLOAD'
# The accepted row0 full bridge is a finite prerequisite package referenced by INPUT-PINS.
reviewpath=Path(inputs['row0_review']['path']);reviewraw=reviewpath.read_bytes();assert hashlib.sha256(reviewraw).hexdigest()==inputs['row0_review']['sha256'];review=json.loads(reviewraw)
bridge_root=Path(inputs['source_pins']['path']).parent
bridge_entries=[q for q in review['pins'] if Path(q['path']).parent==bridge_root]
for q in bridge_entries:file_role(q['path'],'remaining38-accepted-row0-source-bridge',Path(q['path']).name,'acceptedRow0Bridge',q['sha256'])
file_role(reviewpath,'remaining38-accepted-row0-independent-review','RECEIPT.json','row0_review',inputs['row0_review']['sha256'])
assert len(records)<600
manifest={'schema':'1370-ai-checkpoint-finite-backup-inventory-draft-r1','status':'DRAFT_BACKUP_PLAN_NOT_CHECKPOINT_OR_ADMISSION','selectedDirectorySummaries':summaries,'files':records,'summary':{'selectedCompletedDirectories':len(summaries),'regularFiniteFiles':len(records),'payloadBytes':sum(x['bytes'] for x in records if x['preservationAction']=='COPY_FINITE_PAYLOAD'),'localHashSizeOnlyBytes':sum(x['bytes'] for x in records if x['preservationAction']=='LOCAL_HASH_SIZE_ONLY'),'localHashSizeOnlyFiles':sum(x['preservationAction']=='LOCAL_HASH_SIZE_ONLY' for x in records),'priorGitCoverage':'Not queried; root may deduplicate using explicit read-only Git later.'},'exclusions':['actual M0/H mirrors, dependencies, private Git','currently in-flight M0 exact candidate/fill preparation','phase profiler','weekly.ndjson and compressed whole capture','raw machine PS/LSOF bytes and identified >1MiB synthetic control padding'],'scopeLimit':'Immediate requested directory-name selection plus bounded recursion within literal selected dirs and exact INPUT-PINS finite prerequisite roles only. No wholeS/repo traversal, Git, source imports, tests, materializer or heavy subprocess. Root finalizes only after guard-dependent chain.'}
(OUT/'INVENTORY-DRAFT.json').write_text(json.dumps(manifest,sort_keys=True,indent=2)+'\n');print(json.dumps(manifest['summary'],sort_keys=True))
