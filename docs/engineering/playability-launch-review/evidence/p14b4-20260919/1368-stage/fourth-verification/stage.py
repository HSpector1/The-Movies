from pathlib import Path
import hashlib,json,shutil,sys
s=Path('/Users/zacheryspector/studio-scratch');out=s/'1368-fourth-milestone-publication';assert not out.exists();out.mkdir()
rows=[]
def copy(src,dst):
 src=Path(src);dst=out/dst;assert src.is_file() and not src.is_symlink(),str(src);dst.parent.mkdir(parents=True,exist_ok=True);b=src.read_bytes();dst.write_bytes(b);rows.append({'path':dst.relative_to(out).as_posix(),'source':str(src),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
def tree(src,dst):
 for f in sorted(src.rglob('*')):
  if f.is_file() and not f.is_symlink():copy(f,Path(dst)/f.relative_to(src))
for name in ['1368-b-lowmarket-research-proposal','1368-b-lowmarket-research-prep','1368-recovery-measurement-prep-v2','1368-recovery-measurement-assembly-prep','1368-recovery-legacy-reuse-map','1368-original-lowmarket-integration-prep','1368-save46-fallout-prep']:
 tree(s/name,Path('prep')/name)
for name in ['b-updated-r2','public277-r2','types-r2','types-r3','lowmarket277-r3','types-r4','b-full-r4','adapter-r4']:
 tree(s/'1368-unified-candidate'/name,Path('unified')/name)
for name in ['SOURCE-PINS-v2.json','SOURCE-PINS-v3.json','run-v2.py','run-v3.py','SOURCE-PINS-v4.json','run-v4.py']:
 copy(s/'1368-unified-candidate'/name,Path('unified')/name)
for f in (s/'1368-c6-completion-exclusion').iterdir():
 if f.is_file():copy(f,Path('c6')/f.name)
tree(s/'1368-c6-completion-exclusion/c6-r1',Path('c6/c6-r1'))
for name in ['C6-COMPLETION-EXCLUSION-STATIC.md','C6-AND-B-FOLLOWUP-MEASURED.md','LOWMARKET277-STATIC.md','LOWMARKET277-MEASURED.md','CURRENT520-MEASUREMENT-STATIC.md','MEASUREMENT-ASSEMBLY-STATIC.md','ORIGINAL-LOWMARKET-WIRING.md','LOWMARKET-PREDECESSOR-ASSEMBLY.md','B-FULL-MEASURED.md','LOWMARKET-PREDECESSOR-MEASURED.md']:
 copy(s/'1368-independent-review'/name,Path('reviews')/name)
copy(s/'1368-recovery-measurement-arms-01/ASSEMBLY.json','measurement-types/ASSEMBLY.json');copy(s/'1368-recovery-measurement-arms-01/run-types.py','measurement-types/run-types.py');tree(s/'1368-recovery-measurement-arms-01/types-r1',Path('measurement-types/types-r1'))
for f in (s/'1368-lowmarket-predecessor').iterdir():
 if f.is_file():copy(f,Path('predecessor')/f.name)
for name in ['types-r1','b-full-r1']:tree(s/'1368-lowmarket-predecessor'/name,Path('predecessor')/name)
copy(Path(__file__),'stage.py')
(out/'MANIFEST.json').write_text(json.dumps({'format':'1368-fourth-verification/v1','files':rows},indent=2)+'\n');print(json.dumps({'files':len(rows),'bytes':sum(x['bytes'] for x in rows)}))
