import ast,hashlib,json,os,re,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;N=S/'1370-ap-native-fullfunction-current-prelaunch-preparation-source-20261010-r3'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
def apply(old,diff):
 source=old.splitlines(keepends=True);lines=diff.splitlines(keepends=True);assert lines[0].startswith('--- ') and lines[1].startswith('+++ ')
 i=2;pos=0;out=[]
 while i<len(lines):
  m=re.fullmatch(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@.*\n',lines[i]);assert m
  start=int(m[1])-1;oc=int(m[2] or 1);nc=int(m[4] or 1);newstart=int(m[3])-1;assert start>=pos
  out.extend(source[pos:start]);pos=start;assert len(out)==newstart;i+=1;removed=added=0
  while i<len(lines) and not lines[i].startswith('@@ '):
   line=lines[i];assert line[0] in ' +-';kind=line[0];value=line[1:]
   if kind in ' -':assert source[pos]==value;pos+=1;removed+=1
   if kind in ' +':out.append(value);added+=1
   i+=1
  assert (removed,added)==(oc,nc)
 out.extend(source[pos:]);return ''.join(out)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
sp=role(N/'SOURCE-PINS.json');assert sp['sha256']=='82ec92a7bf9dd772b4b406760a1a3ff5e4a79bcf4c6ccda20e982750f036a8d1';pins=read(sp['path'])
for r in pins['files'].values():assert role(r['path'])==r
proof=read(N/'SOURCE-PROOF.json');assert role(proof['predecessorSourcePins']['path'])==proof['predecessorSourcePins'];oldpins=read(proof['predecessorSourcePins']['path'])
assert len(proof['applications'])==3;helpercounts=[]
for pair in proof['applications']:
 for k in ('source','baseline'):assert role(pair[k]['path'])==pair[k]
 old=Path(pair['baseline']['path']).read_text();new=Path(pair['source']['path']).read_text();name=Path(pair['source']['path']).name
 assert pair['baseline']==oldpins['files'][Path(pair['baseline']['path']).name]
 assert apply(old,(N/(name+'.forward.diff')).read_text())==new
 assert apply(new,(N/(name+'.inverse.diff')).read_text())==old
 def helpers(text):return {n.name:ast.get_source_segment(text,n) for n in ast.parse(text).body if isinstance(n,(ast.FunctionDef,ast.ClassDef)) and n.name!='main'}
 h=helpers(old);assert h==helpers(new);helpercounts.append(len(h))
assert helpercounts==[11,3,2]
c=read(N/'PRELAUNCH-CONFIG-UNFILLED.json');contract=read(N/'CONTRACT.json');argv=read(N/'EXACT-ARGV.json');am=read(N/'OPERATIONAL-SCOPE-AMENDMENT.json');protocol=read(A/'NATIVE-CONTROLS-OBSERVED-PROSPECTIVE-CONTRACT.json')
for k in ('protectedSnapshot','ownedPgids','outputPath'):assert c[k] is None
for k,v in c.items():
 if type(v) is dict and set(v)=={'path','bytes','sha256'}:assert role(v['path'])==v
ad=c['currentFullPreflightAdoption'];assert ad['sha256']=='e3804904e003a7178e98c3d6d83c52ff32194f1117cef780d24c3d1c88849552';v=read(ad['path']);assert c['baseline']==v['snapshot'] and c['guardConfig']==v['config'] and c['guardSource']==v['guardSource']
assert am['currentFullPreflightAdoption']==ad and am['snapshot']==v['snapshot'] and am['snapshotPhase']=='before-fill' and am['mandatoryFullPostflightAfterGameAgainstThisBaseline'] is True
assert am['executionAuthorization'] is False and am['capsHorizonsSourceIdentityProtectedRootsAcceptanceUnchanged'] is True
p=contract['nativeControlsProspectiveContract'];assert p['independentDecision']==protocol['independentObservedDecision'];assert p['rootSchema']==protocol['rootAdoptionSchema'] and p['rootStatus']==protocol['rootAdoptionStatus'];assert p['readbackSchema']==protocol['readbackSchema'] and p['readbackStatus']==protocol['readbackStatus']
assert [p[k] for k in ('caseCount','positiveCount','specificNegativeCount')]==[72,13,59]
launch=(N/'run_current_ao_prelaunch_once.py').read_text();reader=(N/'read_current_ao_prelaunch.py').read_text();scanner=(N/'current-ao-root-prelaunch.py').read_text()
assert "Q=Path('"+str(N)+"')" in launch
for text in (launch,reader):assert protocol['independentObservedSchema'] in text and protocol['independentObservedDecision'] in text
assert argv['launcherArgv'][3]==str(N/'run_current_ao_prelaunch_once.py') and argv['directScannerArgv'][3]==str(N/'current-ao-root-prelaunch.py') and argv['readerArgv'][3]==str(N/'read_current_ao_prelaunch.py')
assert str(N/'current-ao-root-prelaunch.py') in reader and str(Path(argv['parent']).name) in scanner
assert str(ad['path']) in scanner and ad['sha256'] in scanner and c['guardConfig']['sha256'] in scanner and c['guardSource']['sha256'] in scanner and c['baseline']['sha256'] in scanner
assert all(x is None for x in argv['launcherArgv'][4:]) and argv['actualOwnedGroups'] is None and argv['actualGrant'] is None
assert contract['perCommandTimeoutSeconds']==180 and contract['overallTimeoutAdded'] is False and contract['originalConfigFillsOnly']==['protectedSnapshot','ownedPgids','outputPath']
aliases={n:pins['files'][n] for n in contract['reviewAliasNames']}
review={'schema':'1370-current-ao-native-prelaunch-independent-source-review/v1','decision':'ACCEPT_STATIC_CURRENT_AO_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY','sourceManifest':sp,'sourcePins':aliases,'routeSourcePins':aliases,'reviewer':'/root','sourceAuthor':'/root/cleanup_independent_red','rootReviewSource':role(__file__),'sourceProof':role(N/'SOURCE-PROOF.json'),'scopeAmendment':role(N/'OPERATIONAL-SCOPE-AMENDMENT.json'),'currentAOFullPreflightAdoption':ad,'currentAOFullPreflightSnapshot':v['snapshot'],'prospectiveObservedProtocol':role(A/'NATIVE-CONTROLS-OBSERVED-PROSPECTIVE-CONTRACT.json'),'wholeIndependentDiffApplications':6,'byteExactOriginalHelperCounts':helpercounts,'concreteChecks':['Whole original scanner/launcher/reader source reviewed and forward/inverse patches independently applied','Only original three config fill fields remain null; actual controls adoption passed as external authenticated operands','Exact native72 labels/schema, actual worker matrix, reader roles and real PID/group provenance preserved','Current source/config/adoption/baseline paths and split path literals agree with exact argv','Before-fill reuse is explicitly amended; historical types/M0 proofs separate; mandatory original fullpost remains','Original current/boot/process/FD/refs/ancestry/disk/reserve/nine strict roots checks retained; original180 percommand, no new overall clock'],'concreteFindings':[],'executionAuthorization':False,'actualPrelaunchExecuted':False,'game':False}
rr=put(A/'NATIVE-PRELAUNCH-INDEPENDENT-SOURCE-REVIEW.json',review)
adopt={'schema':'1370-root-current-ao-native-prelaunch-source-and-operational-amendment-adoption/v1','status':'ROOT_ADOPTED_CURRENT_AO_NATIVE_PRELAUNCH_SOURCE_AND_EXPLICIT_BEFORE_FILL_REUSE_AMENDMENT','sourceManifest':sp,'independentSourceReview':rr,'scopeAmendment':review['scopeAmendment'],'currentAOFullPreflightAdoption':ad,'currentAOFullPreflightSnapshot':v['snapshot'],'explicitBeforeFillReuseAmendmentAdopted':True,'historicalTypesRemainHistorical':True,'originalM0BeforeAfterProofsRemainSeparate':True,'mandatoryOriginalFullPostflightAfterGame':True,'protectedFreezeContinues':True,'snapshotNotRelabeledPostflight':True,'capsHorizonsSourceIdentityProtectedRootsAcceptanceUnchanged':True,'rootAuthorizesOneReviewedShortPrelaunchAfterActualNativeControlsAdoption':True,'actualPrelaunch':None,'observerControlsAdoption':None,'fullfunctionExecutionAuthorization':False,'game':False,'executionAuthorization':False}
ar=put(A/'CURRENT-AO-NATIVE-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json',adopt);print(json.dumps({'review':rr,'adoption':ar}))
