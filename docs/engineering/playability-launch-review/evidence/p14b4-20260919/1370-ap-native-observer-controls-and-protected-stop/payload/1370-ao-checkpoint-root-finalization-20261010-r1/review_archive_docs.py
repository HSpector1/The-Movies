from pathlib import Path
import hashlib,json,os,stat,subprocess,re
S=Path('/Users/zacheryspector/studio-scratch');D=S/'1370-ao-checkpoint-root-finalization-20261010-r1';R=Path('/Users/zacheryspector/The-Movies-headless-program')
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(x):assert role(x['path'])==x,x['path'];return Path(x['path']).read_bytes()
def pairs(xs):
 d={}
 for k,v in xs:assert k not in d;d[k]=v
 return d
def load(p):return json.loads(Path(p).read_bytes(),object_pairs_hook=pairs)
def git(*args):
 p=subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false',*args],cwd=R,env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',GIT_CONFIG_NOSYSTEM='1'),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE);return p.stdout
rb=load(D/'ARCHIVE-ROOT-READBACK.json')
for x in ('manifest','inventory','claim','report','handoff'):auth(rb[x])
m=load(rb['manifest']['path']);inv=load(rb['inventory']['path']);A=Path(rb['manifest']['path']).parent;HEAD='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'
assert m['headAuthenticated']==git('rev-parse','HEAD').decode().strip()==HEAD and m['noGitMutation'] is True
assert m['inventorySha256']==rb['inventory']['sha256'] and m['rootClaimSha256']==rb['claim']['sha256'] and m['rootClaim']==auth(rb['claim']).decode()
assert len(m['files'])==len(inv['files'])==531 and inv['summary']['completeInventory'] is True and inv['pendingAdditions']==[]
ir={x['sourcePath']:x for x in inv['files']};assert len(ir)==531
tree={}
for entry in git('ls-tree','-r','-z',HEAD).split(b'\0'):
 if not entry:continue
 meta,path=entry.split(b'\t',1);mode,typ,oid=meta.decode().split();tree[os.fsdecode(path)]=(mode,typ,oid)
copied=[];local=[];prior=[];blobs={};semantic=set();declared=set()
for row in m['files']:
 old=ir[row['sourcePath']]
 for k,v in old.items():
  if k!='priorGitBlob':assert row[k]==v,(k,row['sourcePath'])
 src=Path(row['sourcePath']);st=src.lstat();assert src.resolve(strict=True)==src and stat.S_ISREG(st.st_mode) and st.st_nlink==row['nlink']==1
 assert stat.S_IMODE(st.st_mode)==int(row['mode'],8)
 data=src.read_bytes();assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
 assert src.is_relative_to(S) and not any(x in ('.git','node_modules','__pycache__') for x in src.relative_to(S).parts)
 if src.name.startswith('RAW-LOCAL-ONLY-') and src.suffix=='.json':
  j=json.loads(data);semantic.update(x['path'] for x in j.get('roles',j.get('rawLocalOnly',[])))
 elif src.name=='PREFLIGHT.json':semantic.update(x['path'] for x in json.loads(data).get('rawLocalOnly',[]))
 action=row['archiveDisposition']
 if action=='COPIED_FINITE_PAYLOAD':
  dest=A/row['archiveRelativePath'];assert dest.resolve(strict=True)==dest and dest.read_bytes()==data
  assert row['preservationAction']=='COPY_FINITE_PAYLOAD' and row['priorGitBlob'] is None
  copied.append(row);declared.add(str(dest))
 elif action=='LOCAL_HASH_SIZE_ONLY':
  assert row['preservationAction']=='LOCAL_HASH_SIZE_ONLY' and row['priorGitBlob'] is None and 'archiveRelativePath' not in row
  assert not (A/'payload'/row['package']/row['relativePath']).exists();local.append(row)
 elif action=='AUTHENTICATED_PRIOR_HEAD_BLOB':
  assert row['preservationAction']=='COPY_FINITE_PAYLOAD' and 'archiveRelativePath' not in row
  b=row['priorGitBlob'];assert b['head']==HEAD and b['sourcePath']==str(src) and b['sourceMode']==row['mode']
  oid=hashlib.sha1(('blob '+str(len(data))+'\0').encode()+data).hexdigest();assert oid==b['oid']
  for ref in b['sourceMappings']:assert tree[ref['path']]==(ref['mode'],'blob',ref['oid']) and ref['oid']==oid
  if oid not in blobs:blobs[oid]=git('cat-file','blob',oid)
  assert blobs[oid]==data;prior.append(row)
 else:raise AssertionError(action)
assert len(copied)==458 and len(prior)==61 and len(local)==12 and sum(x['bytes'] for x in copied)==22706854
assert semantic=={x['sourcePath'] for x in local}
assert all(x['preservationAction']=='LOCAL_HASH_SIZE_ONLY' for x in m['files'] if any('node-compile-cache' in part for part in Path(x['sourcePath']).parts))
actualFiles={str(Path(os.fsdecode(x))) for x in subprocess.check_output(['rg','--files','--hidden','--no-ignore',str(A)]).splitlines()}
expectedFiles=declared|{rb[x]['path'] for x in ('manifest','inventory','claim')};assert actualFiles==expectedFiles
plan=load(D/'INPUT-PACKAGES-FINAL.json');assert set(plan['localRawPaths'])==semantic
selection=set(plan['paths']);assert str(S/'1370-an-checkpoint-root-finalization-20261009-r1') in selection and str(D) not in selection
aoNames={str(x) for x in S.iterdir() if x.name.startswith('1370-ao-') and x!=D};assert aoNames<=selection|set(plan['emptyNamedPackagesNoFiles'])
wholeAN={str(Path(os.fsdecode(x))) for x in subprocess.check_output(['rg','--files','--hidden','--no-ignore',str(S/'1370-an-checkpoint-root-finalization-20261009-r1')]).splitlines()};assert wholeAN<={x['sourcePath'] for x in m['files']}
handoff=auth(rb['handoff']).decode();oldhandoff=(S/'1370-an-checkpoint-root-finalization-20261009-r1/HANDOFF-FINAL.md').read_text()
def auto(x):return re.search(r'<!-- AUTO:BEGIN[^\n]*-->[\s\S]*?<!-- AUTO:END -->',x).group()
assert auto(handoff)==auto(oldhandoff)
lessons=next(x for x in m['files'] if x['package']=='1370-ao-root-continuation-20261010-r1' and x['relativePath']=='LESSONS-r11.md');assert lessons['bytes']==3710 and lessons['sha256']=='122c03160371c683af4b5bc323edeb9c894d9f09baf0c499bbfccc92b96c281f'
design=next(x for x in m['files'] if x['relativePath']=='NATIVE-CANONICAL-OBSERVER-DESIGN-ADOPTION.json');assert design['sha256']=='0c5c6760436ac5d3a254e8b412028891608520d2f3e85c9719dfb119563da229'
docpaths={str(Path(rb[x]['path']).relative_to(R)) for x in ('manifest','inventory','claim','report','handoff')}|{str(Path(p).relative_to(R)) for p in declared}
indexRows={}
for line in git('ls-files','--stage','-z').split(b'\0'):
 if not line:continue
 meta,path=line.split(b'\t',1);mode,oid,stage=meta.decode().split();assert stage=='0';indexRows[os.fsdecode(path)]=(mode,oid)
assert docpaths<=set(indexRows),(docpaths-set(indexRows))
changed=set(os.fsdecode(x) for x in git('diff','--cached','--name-only','-z').split(b'\0') if x);assert changed==docpaths
for rel in docpaths:assert git('cat-file','blob',indexRows[rel][1])==(R/rel).read_bytes()
indexV=load(D/'INDEX-VERIFICATION-COMPLETE.json');assert indexV['indexedSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
warnings=indexV['preservedDiffContextWarnings'];assert len(warnings)==26 and len({x['path'] for x in warnings})==14
for w in warnings:assert (R/w['path']).read_bytes().splitlines()[w['line']-1]==b' ' and w['path'] in docpaths
assert indexV['currentDocsWhitespaceCheck']==0 and indexV['wholeDiffWhitespaceCheck']==2
assert git('rev-parse','HEAD').decode().strip()==HEAD
result={'schema':'1370-ao-checkpoint-documents-and-finite-archive-independent-review/v1','decision':'ACCEPT_INDEPENDENT_AO_CHECKPOINT_DOCUMENTS_AND_FINITE_ARCHIVE_ONLY','independentReviewer':'/root/b109_focused_route_review','rootDocumentAndArchiveAuthor':'/root','concreteFindings':[],'findings':[],'executionAuthorization':False,'archiveRootReadback':role(D/'ARCHIVE-ROOT-READBACK.json'),'manifest':rb['manifest'],'inventory':rb['inventory'],'rootClaim':rb['claim'],'report':rb['report'],'handoff':rb['handoff'],'archiveSummary':m['summary'],'copiedPayloadRoles':458,'copiedPayloadBytes':22706854,'priorHeadBlobRoles':61,'priorHeadBlobsAndTreeMappingsIndependentlyAuthenticated':True,'localHashSizeOnlyRoles':12,'completeSourceAndArchiveCoverage':True,'producerSemanticRawLocalCoverageExact':True,'rawPSFDBytesNeverExported':True,'nodeCompileCachePayloadExcluded':True,'wholeLateANFinalizationCovered':True,'allActualSelectedAOPackagesCovered':True,'AUTOByteExactToRetainedANHandoff':True,'documentsPreserveCorrectedCaptureEnabledFixtureUnknownScope':True,'documentsPreserveStopNullAfterProofsAndUnrunMutant':True,'documentsPreserveActual945aAndSupplementalE957Distinction':True,'documentsNativeDesignOnlyNoFitOrImplementationOrRuntimeClaim':True,'unchangedGoverningOrderP17P18PendingNoOwnerDecision':True,'publicationEndsPriorFreezeAndFutureRuntimeNeedsFreshAPIdentityAndProtection':True,'lateExcludedFinalizationEvidenceMustCarryNextCheckpoint':True,'lessons':{k:lessons[k] for k in ('sourcePath','bytes','sha256')},'nativeDesignAdoption':{k:design[k] for k in ('sourcePath','bytes','sha256')},'initialStagingCoverageFinding':role(D/'ARCHIVE-STAGING-COVERAGE-INITIAL-FINDING.json'),'indexVerificationComplete':role(D/'INDEX-VERIFICATION-COMPLETE.json'),'indexedAndExpectedFiles':463,'allExpectedPayloadAndDocumentIndexBlobsByteExact':True,'whitespaceException':{'wholeDiffCheckExit':2,'warnings':26,'files':14,'onlyImmutableUnifiedDiffSingleSpaceContextLines':True,'originalPayloadsPreserved':True,'currentDocsCheckExit':0,'allDiffChecksCleanClaim':False},'authorshipBoundary':'Builder literal adaptation self-audited separately; this root claim/docs/actual archive/index review is independent.','reviewerRepoGitOrSourceMutation':False,'candidateOrGameRuntimeExecuted':False,'fullFunctionQualificationAccepted':False}
out=D/'INDEPENDENT-DOCS-ARCHIVE-REVIEW.json';assert not out.exists();out.write_bytes((json.dumps(result,indent=2,sort_keys=True)+'\n').encode());out.chmod(0o444);print(json.dumps(role(out)))
