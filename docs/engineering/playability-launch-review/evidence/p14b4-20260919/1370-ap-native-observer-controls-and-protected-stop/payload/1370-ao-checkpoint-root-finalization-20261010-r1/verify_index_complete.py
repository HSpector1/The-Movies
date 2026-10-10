import hashlib,json,re,subprocess
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).parent
E='docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
A=E+'1370-ao-observer-row-diagnostic-closure/'
def git(*args):
 return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
full=git('diff','--cached','--check')
(D/'DIFF-CHECK-COMPLETE.stdout').write_bytes(full.stdout)
(D/'DIFF-CHECK-COMPLETE.stderr').write_bytes(full.stderr)
assert not full.stderr and full.returncode==2
lines=full.stdout.decode().splitlines();assert len(lines)%2==0
exceptions=[]
for i in range(0,len(lines),2):
 match=re.fullmatch(r'(.+):(\d+): trailing whitespace\.',lines[i]);assert match and lines[i+1]=='+ '
 path,number=match.group(1),int(match.group(2))
 assert path.startswith(A+'payload/') and path.endswith(('.forward.diff','.inverse.diff'))
 assert (R/path).read_text().splitlines()[number-1]==' '
 exceptions.append({'path':path,'line':number,'reason':'Immutable authenticated unified-diff blank context line'})
docs=git('diff','--cached','--check','--','HANDOFF.md',E+'1370-AO-observer-row-diagnostic-closure.md')
assert docs.returncode==0 and not docs.stdout and not docs.stderr
names=git('diff','--cached','--name-only','-z');assert names.returncode==0
paths=[x.decode() for x in names.stdout.split(b'\0') if x]
manifest=json.loads((R/A/'ARCHIVE-MANIFEST.json').read_bytes())
expected={A+item['archiveRelativePath'] for item in manifest['files'] if item['archiveDisposition']=='COPIED_FINITE_PAYLOAD'}
expected.update({A+'ARCHIVE-MANIFEST.json',A+'INVENTORY-FINAL.json',A+'ROOT-FINAL-CLAIM.txt','HANDOFF.md',E+'1370-AO-observer-row-diagnostic-closure.md'})
assert set(paths)==expected and len(paths)==463, sorted(expected-set(paths))
for path in paths:
 assert path in ['HANDOFF.md',E+'1370-AO-observer-row-diagnostic-closure.md'] or path.startswith(A)
 blob=git('show',':'+path);assert blob.returncode==0 and not blob.stderr
 assert blob.stdout==(R/path).read_bytes(),path
tree=git('write-tree');assert tree.returncode==0
src=git('rev-parse',tree.stdout.decode().strip()+':src');assert src.returncode==0
assert src.stdout.decode().strip()=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
v={'schema':'1370-ao-index-verification/v2','stagedFiles':len(paths),'manifestCoverageComplete':True,'supersedesIncompleteIndexVerification':'51fff22f4053ab4ca0585b0e5838c97841161d513fc06605f23be0252c3fffd3','allIndexedBytesEqualWorkingFiles':True,'indexedSourceTree':src.stdout.decode().strip(),'currentDocsWhitespaceCheck':0,'wholeDiffWhitespaceCheck':full.returncode,'preservedDiffContextWarnings':exceptions,'indexedTree':tree.stdout.decode().strip()}
p=D/'INDEX-VERIFICATION-COMPLETE.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
print(json.dumps({'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'stagedFiles':len(paths),'preservedContextWarnings':len(exceptions),'sourceTree':v['indexedSourceTree']}))
