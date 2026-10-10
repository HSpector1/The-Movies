"""Publication-stage exact AQ staged-byte verifier. Root invokes after archive/docs staging."""
import hashlib,json,os,re,subprocess,sys
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).resolve().parent
PARENT='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8';SOURCE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
E='docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
A=E+'1370-aq-git-guard-repair-and-preservation-diagnostic/';REPORT=E+'1370-AQ-git-guard-repair-and-preservation-diagnostic.md'
WARNING_AUTHORITY_SHA='c904e5e30af2c27dc2e4b2194b06a7e50fbe3e93a584ab88d85ef443a949fd25'
def role(p):
 p=Path(p);assert p.is_absolute() and p.resolve(strict=True)==p and p.is_file() and p.stat().st_nlink==1;b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
def git(*args):
 env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')};env['GIT_OPTIONAL_LOCKS']='0'
 return subprocess.run(['git','--no-optional-locks','-c','gc.auto=0','-c','maintenance.auto=0',*args],cwd=R,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=60)
def get(*args):
 p=git(*args);assert p.returncode==0 and not p.stderr,(args,p.returncode,p.stderr);return p.stdout
def main():
 assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
 br=role(sys.argv[1]);assert br['sha256']==sys.argv[2];b=json.loads(Path(br['path']).read_bytes());assert b['status']=='ROOT_FINALIZED_AQ_ARCHIVE_AND_DOCS' and b['executionAuthorization'] is True
 assert b['archiveRelativeDirectory']==A and b['reportRelativePath']==REPORT and b['productionSourceTree']==SOURCE
 mr=role(R/A/'ARCHIVE-MANIFEST.json');assert b['archiveManifest']==mr;m=json.loads(Path(mr['path']).read_bytes())
 archived={A+x['archiveRelativePath']:x for x in m['files'] if x['archiveDisposition']=='COPIED_FINITE_PAYLOAD'};assert len(archived)==sum(x['archiveDisposition']=='COPIED_FINITE_PAYLOAD' for x in m['files'])
 expected=set(archived)|{A+'ARCHIVE-MANIFEST.json',A+'INVENTORY-FINAL.json',A+'ROOT-FINAL-CLAIM.txt','HANDOFF.md',REPORT}
 assert get('rev-parse','HEAD').decode().strip()==PARENT and get('rev-parse','HEAD:src').decode().strip()==SOURCE
 assert get('branch','--show-current').decode().strip()=='wip/headless-program-20260916-ts'
 paths=[os.fsdecode(x) for x in get('diff','--cached','--name-only','-z').split(b'\0') if x];assert len(paths)==len(set(paths)) and set(paths)==expected,{'missing':sorted(expected-set(paths)),'unexpected':sorted(set(paths)-expected)}
 assert not get('diff','--name-only','-z')
 staged={}
 for path in paths:
  assert path in ('HANDOFF.md',REPORT) or path.startswith(A)
  rr=role(R/path);assert get('show',':'+path)==(R/path).read_bytes();staged[path]=rr
  if path in archived:assert rr['bytes']==archived[path]['bytes'] and rr['sha256']==archived[path]['sha256']
 full=git('diff','--cached','--check');put(D/'DIFF-CHECK-COMPLETE.stdout',full.stdout);put(D/'DIFF-CHECK-COMPLETE.stderr',full.stderr);assert not full.stderr and full.returncode in (0,2)
 authorityPath=D/'PRESERVED-WHITESPACE-AUTHORITY.json';assert role(authorityPath)['sha256']==WARNING_AUTHORITY_SHA
 authority=json.loads(authorityPath.read_bytes());assert authority['archiveManifest']==mr and role(authority['observedDiffCheck']['path'])==authority['observedDiffCheck']
 lines=full.stdout.decode().splitlines();assert len(lines)%2==0;warnings=[]
 allowed={(x['path'],x['line']):x for x in authority['warnings']};assert len(allowed)==len(authority['warnings'])
 for i in range(0,len(lines),2):
  match=re.fullmatch(r'(.+):(\d+): trailing whitespace\.',lines[i]);assert match;path,n=match.group(1),int(match.group(2));assert (path,n) in allowed and path in archived
  approved=allowed[(path,n)];row=archived[path];source=Path(row['sourcePath']);data=(R/path).read_bytes();assert source.read_bytes()==data and role(source)==approved['preservedRole'] and hashlib.sha256(data).hexdigest()==row['sha256']
  literal=data.decode().splitlines()[n-1];assert literal==approved['literal'] and lines[i+1]==approved['display']=='+'+literal
  if approved['category'].startswith('prior-quoted-context-'):
   assert source.name.startswith('DIFF-CHECK-') and source.name.endswith('.stdout') and literal in ('+ ','++ ') and n>=2 and re.fullmatch(r'.+:\d+: trailing whitespace\.',data.decode().splitlines()[n-2])
  elif approved['category'].startswith('preserved-ndiff-'):assert path.endswith('.lossless.ndiff') and approved['category'] in ('preserved-ndiff-added-blank','preserved-ndiff-blank-context') and literal==('+ ' if approved['category']=='preserved-ndiff-added-blank' else '  ')
  else:
   assert path.endswith('.diff') and data.startswith(b'--- ') and b'\n+++ ' in data and b'\n@@ ' in data
   if approved['category'].startswith('unnamed-header-'):assert n in (1,2) and data.decode().splitlines()[:2]==['--- ','+++ '] and literal in ('--- ','+++ ')
   else:assert approved['category'] in ('preserved-context-1','preserved-context-2') and literal==(' ' if approved['category'].endswith('-1') else '  ')
  warnings.append(approved)
 assert warnings==authority['warnings'],'EXACT_DEMONSTRATED_WARNING_ROSTER'
 docs=git('diff','--cached','--check','--','HANDOFF.md',REPORT);assert docs.returncode==0 and not docs.stdout and not docs.stderr
 tree=get('write-tree').decode().strip();assert get('rev-parse',tree+':src').decode().strip()==SOURCE
 v={'schema':'1370-aq-index-verification/v1','status':'COMPLETE_AQ_INDEX_VERIFIED_PENDING_PUBLICATION','executionAuthorization':False,'binding':br,'archiveManifest':mr,'stagedFiles':len(paths),'expectedStagedFiles':len(expected),'stagedPaths':sorted(paths),'indexedTree':tree,'indexedSourceTree':SOURCE,'parent':PARENT,'manifestCoverageComplete':True,'allIndexedBytesEqualWorkingFiles':True,'currentDocsWhitespaceCheck':0,'wholeDiffWhitespaceCheck':full.returncode,'preservedDiffContextWarnings':warnings,'preservedWarningAuthority':role(authorityPath),'preservedWarningCategorizedCounts':authority['categorizedCounts'],'changedDocs':{k:staged[k] for k in ('HANDOFF.md',REPORT)},'indexedRoles':staged}
 rr=put(D/'INDEX-VERIFICATION-COMPLETE.json',(json.dumps(v,sort_keys=True,indent=2)+'\n').encode());print(json.dumps({'indexVerification':rr,'stagedFiles':len(paths)}))
if __name__=='__main__':main()
