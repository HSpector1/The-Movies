from pathlib import Path
import gzip,hashlib,json
A=Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012')
OUT=A/'p15b-final204-progress-export-r1'
assert not OUT.exists()
OUT.mkdir();rows=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def export(p,name,compress=False):
 assert p.is_file() and not p.is_symlink() and 'LOCAL' not in str(p.relative_to(A)).upper()
 assert not any(x in p.name.lower() for x in ('process','cmdline'))
 raw=p.read_bytes();b=gzip.compress(raw,mtime=0) if compress else raw
 target=OUT/name;target.parent.mkdir(parents=True,exist_ok=True)
 with target.open('xb') as f:f.write(b)
 rows.append(dict(file=name,source=str(p),sourceSHA256=sha(raw),sourceBytes=len(raw),exportSHA256=sha(b),exportBytes=len(b)))
for folder,expected in [('p15b-pending-families-r2-run',0),('p15b-reader-fallout-final-r1-run',2),('p15b-reader-fallout-final-r2-run',97)]:
 run=A/folder
 assert json.loads((run/'terminal.json').read_text())['overallExit']==expected
 assert (run/'metadata-checks-errors.log').read_bytes()==b''
 for name in ['terminal.json','results.jsonl','metadata-checks.jsonl','metadata-checks-errors.log','tsc-root.log','equipment-core.log','equipment-core.json','freeze.json','freeze-current.json']:
  p=run/name
  if p.exists():export(p,folder+'/'+name+'.gz',True)
 # Only known metadata receipt filenames, never arbitrary local/process files.
 for d in sorted(run.glob('metadata-*')):
  if d.is_dir():
   for name in ['HANDOFF.md','diff.patch','status.bin','snapshot.json','receipt.json','HANDOFF.raw','diff.raw','status.raw']:
    p=d/name
    if p.exists():export(p,folder+'/'+d.name+'/'+name+'.gz',True)
 stem=folder.removesuffix('-run')
 for suffix in ['-lane.log','-lane.log.meta']:
  p=A/(stem+suffix)
  if p.exists():export(p,folder+'/'+p.name+'.gz',True)
for folder,names in {
 'p15b-final204-r2':['PATCH.diff','MANIFEST.json'],
 'p15b-final-unused-helper-r1':['PATCH.diff','MANIFEST.json','INSTALL.json'],
 'p15b-qualified-family-replacement-install-r1':['RECEIPT.json'],
 'p15b-joint-invalid-leaf-replacement-draft-r1':['PATCH.diff','MANIFEST.json','COVERAGE-MAP.md'],
 'p15b-resumed-final-qualification':['CACHE-CLEANUP-RECEIPT.json.gz','CACHE-CLEANUP.md'],
}.items():
 for name in names:
  p=A/folder/name
  if p.exists():export(p,folder+'/'+name+('.gz' if name=='PATCH.diff' else ''),name=='PATCH.diff')
for name in ['P15B-PENDING-FAMILIES-R2-ACTUAL-REVIEW.md','P15B-JOINT-REMOVAL-CURRENT-PREIMAGE-CHECK.md','P15B-JOINT-LEAF-COVERAGE-SUPERSEDING-R2.md','P15B-FINAL-UNUSED-HELPER-R1-REVIEW.md','P15B-FINAL204-R2-ROOT-RESOURCE-ACTUAL-REVIEW.md','normal-chrome-quit-resume-r1.json']:
 p=A/name
 if p.exists():export(p,name)
export(Path(__file__),'EXPORTER.py')
brief='# Final204 progress checkpoint\n\nFive r2 pending-family controls completed terminal0/5PASS within the unchanged5s leaf budgets. The independently reviewed invalid joint leaf replacement/removal was installed; original failed evidence remains preserved.\n\nFinal qualification r1 stopped terminal2 on TS6133 before later checks. The minimal unused-helper cleanup was reviewed and installed. Current final204r2 MANIFEST and compressed PATCH are included.\n\nQualification r2 root compiler child0/41s, but its post-command disk-floor guard stopped wrapper/lane97. No later compiler/generator/reader-fallout checks ran. This is successful root compilation plus an abnormal resource stop, never final qualification pass. Independent root/resource review is included when present.\n\nCache cleanup receipt/public explanation and normal Chrome quit public-safe receipt preserve actual recovery actions. No LOCAL records, raw process/cmdline inventories or private fixture bodies are exported. Big reporter/freeze/raw metadata receipts are gzip compressed; source/export hashes are recorded. Original r1/r2 artifacts were not changed.\n\nP15B is not claimed landed, full-pass or live/Owner accepted. Earlier classified core/D16 failures and live acceptance obligations remain open. Parent reviews and owns publication and the next resource-qualified run.\n'
(OUT/'BRIEF.md').write_text(brief)
rows.append(dict(file='BRIEF.md',source='authored progress summary',exportSHA256=sha((OUT/'BRIEF.md').read_bytes()),exportBytes=(OUT/'BRIEF.md').stat().st_size))
for row in rows:assert sha((OUT/row['file']).read_bytes())==row['exportSHA256']
(OUT/'EXPORT-MANIFEST.json').write_text(json.dumps(dict(files=rows,fileCount=len(rows),exportBytes=sum(r['exportBytes'] for r in rows)),indent=2)+'\n')
print(json.dumps(dict(path=str(OUT),files=len(rows),bytes=sum(r['exportBytes'] for r in rows))))
