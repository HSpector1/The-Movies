import datetime,hashlib,json,os,pathlib,shutil,stat,subprocess,sys,time
P=pathlib.Path('/Users/zacheryspector/studio-scratch'); R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program'); D=P/'1370-c0-b-release-one-tick-exact-draft-20261008-r1'; S=P/'1370-c0-b-release-one-tick-source-proposal-20261008-r3'; E=P/'1370-c0-b-release-one-tick-independent-exact-review-20261008-r1'; started=time.monotonic()
def sha(raw):return hashlib.sha256(raw).hexdigest()
def raw(p):return pathlib.Path(p).read_bytes()
def readj(p):return json.loads(raw(p))
def checked(pin):
 p=pathlib.Path(pin['path']);s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1 and (not pin.get('bytes') or s.st_size==pin['bytes']);b=raw(p);assert sha(b)==pin['sha256'],str(p);return b
def cmd(argv,timeout=30):
 q=subprocess.run(argv,cwd=R,env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',PYTHONDONTWRITEBYTECODE='1'),capture_output=True,timeout=timeout);assert q.returncode==0,(argv,q.returncode,q.stderr[:300]);return q.stdout.decode()
old=raw(D/'BINDING-ORIGINAL-e0a31a76.json'); new=raw(D/'BINDING-DRAFT.json'); adoption=readj(D/'PARENT-ADOPTION.json'); plan=readj(E/'ADOPTION-AND-LAUNCH.json'); binding=json.loads(new); original=json.loads(old)
assert sha(old)=='e0a31a76c19a5c8f18a3f690cba4984f38c5a263920f5d8a573ea8858dda0003'
assert sha(new)=='1d961e6badb90588e304938b75d6b488a2e35188992e30232426f823b23f12d2' and len(new)==2691
assert sha(raw(D/'PARENT-ADOPTION.json'))=='6c346519876d1496cba0dcb3c620e715d48bf2a979cde214ba0755b98b11df41'
assert sha(raw(E/'ADOPTION-AND-LAUNCH.json'))=='d3f046aa92f6fdc80dc6c751adb8b1d2fa53e629a31b7da3d09f83f4aaefc8c1'
changed=sorted(k for k in set(binding)|set(original) if binding.get(k)!=original.get(k)); assert changed==['exactReview','executionAuthorization','status']
assert {k:binding[k] for k in changed}==plan['adoptionValues'];expected=original|plan['adoptionValues'];assert new==(json.dumps(expected,sort_keys=True,indent=2)+'\n').encode()
semantic={k:v for k,v in binding.items() if k not in changed};semantic_sha=sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode());assert semantic_sha==plan['bindingSemanticSha256']==adoption['bindingSemanticSha256']=='d652663a8eae344d5442306d135892aab73ac1596e7f24db92a9c1a9184952e2'
argv=adoption['argv'];assert argv==plan['argv']; lp=readj(D/'LAUNCH-PLAN.json');assert argv[:-1]==lp['argv'][:-1] and argv[-1]==sha(new)
assert argv[2]=='0' and argv[4]==binding['recorderPython']['path'] and argv[5:7]==['-I','-B'] and argv[7]==str(S/'run.py') and argv[8]==str(D/'BINDING-DRAFT.json')
exact=readj(binding['exactReview']['path']); checked(binding['exactReview']);assert exact['decision']=='ACCEPT_EXACT_B_RELEASE_ONE_TICK_UNRUN' and exact['bindingSemanticSha256']==semantic_sha
copyraw=raw(adoption['copyObservedReceiptPath']);assert sha(copyraw)==adoption['copyObservedReceiptSha256']=='3a43f85ec4bd0557b6ea6ef0a46d59bfc14570324ba1297e555dee3ff4d0767d';copy=json.loads(copyraw);assert copy['decision']=='ACCEPT_OBSERVED_MATERIALIZATION_COPY'
manifest_raw=raw(S/'MANIFEST.json');assert sha(manifest_raw)==binding['manifestSha256']=='36dcb154af74caad0803f9ae175a75693e13001fa9183efb7c70d8fdd4d8bab5';manifest=json.loads(manifest_raw)
assert manifest['caps']=={'combinedTestSeconds':60,'activeSeconds':75,'wholeRecorderSeconds':90,'totalOutputBytes':67108864,'singleJsonBytes':16777216,'childLogBytes':1048576}
verified=[]
for n,pin in manifest['files'].items():checked({'path':str(S/n),**pin});verified.append({'name':n,'sha256':pin['sha256']})
external={n:checked(pin) for n,pin in manifest['externalPins'].items()}
for k in ['sourceOnlyReview','observedSourceControls','independentObservedSourceControlsReview','acceptedLaneHelper','recorderPython','modeProof']:checked(binding[k])
rg={'__name__':'authenticated_runtime_guard'};exec(compile(external['runtimeGuard'],manifest['externalPins']['runtimeGuard']['path'],'exec'),rg)
aspace={'__name__':'authenticated_assembler','_AUTHENTICATED_RUNNER_BYTES':external['assembler'],'_AUTHENTICATED_MANIFEST_BYTES':external['routeManifest'],'_AUTHENTICATED_REVIEW_BYTES':external['sourceReview'],'_AUTHENTICATED_VERIFY_RUNTIME':rg['verify_runtime']};exec(compile(external['assembler'],manifest['externalPins']['assembler']['path'],'exec'),aspace)
route=json.loads(external['routeManifest']); inherited=aspace['verify_external_sources'](route);runtime=rg['verify_runtime'](S,route)
print('Adoption/source/runtime pins PASS; checking current Git, AC, paths, lane and protected FD/bytes.',file=sys.stderr,flush=True)
head=cmd(['/usr/bin/git','rev-parse','HEAD']).strip();source=cmd(['/usr/bin/git','rev-parse','HEAD:src']).strip();clean=cmd(['/usr/bin/git','status','--porcelain=v1','--untracked-files=all']);branch='refs/heads/wip/headless-program-20260916-ts';remote=cmd(['/usr/bin/git','ls-remote','--exit-code','origin',branch]).strip()
assert head==binding['productionHead']=='4812bb123781632dd39e44f918eb85a6a2c12623' and source==binding['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and clean=='' and remote==head+'\t'+branch
power=cmd(['/usr/bin/pmset','-g','batt']);assert "Now drawing from 'AC Power'" in power
free=shutil.disk_usage(P).free;minimum=3*1024**3+224*1024**2;assert free>=minimum
absent=[binding['outputRoot'],argv[3],argv[3]+'.meta',str(P/'HEAVY-LANE-LOCK'),str(P/'1370-c0-aging-era-sparse-r6-20261008-r1.lock')];assert all(not os.path.lexists(x) for x in absent)
ps=cmd(['/bin/ps','-axo','pid=,pgid=,comm=,args=']);heavy=[]
for line in ps.splitlines():
 parts=line.strip().split(None,3)
 if len(parts)<4:continue
 pid,pgid,comm,args=parts
 if pathlib.Path(comm).name=='node' and any(x in args for x in ['vitest','/bin/tsc','/lib/tsc.js']):heavy.append(line)
assert not heavy,heavy
rb=readj(P/'1370-c0-aging-era-sparse-materializer-r6-exact-draft-20261008-r1/BINDING-DRAFT.json');ms=raw(rb['materializerPath']);assert sha(ms)==rb['materializerSha256']=='2d63876297bc85a1ab5192491f4255d2cce7d17de048bfec65c21b479d1f0896';material={'__name__':'authenticated_materializer_read_functions'};exec(compile(ms,rb['materializerPath'],'exec'),material)
material['assert_no_protected_writable_fds'](rb)
rootfacts={}
for key in ['productionRoot','commonGitRoot']:
 p=pathlib.Path(rb[key]);s=p.lstat();assert stat.S_ISDIR(s.st_mode) and not p.is_symlink();rootfacts[key]={'path':str(p),'device':s.st_dev,'inode':s.st_ino,'mode':stat.S_IMODE(s.st_mode)}
protected_common=material['protected_snapshot'](pathlib.Path(rb['commonGitRoot']));protected_production=material['protected_snapshot'](R)
assert protected_common==copy['freshProtectedCommonSha256'] and protected_production==copy['freshProtectedProductionSha256']
material['assert_no_protected_writable_fds'](rb)
assert all(not os.path.lexists(x) for x in absent)
assert sha(raw(D/'BINDING-DRAFT.json'))==sha(new) and sha(raw(S/'MANIFEST.json'))==sha(manifest_raw)
facts={'schema':'1370-b-one-tick-adopted-independent-preflight-r1','decision':'ACCEPT_ADOPTED_EXACT_PREFLIGHT_UNRUN','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-started,'rawBindingSha256':sha(new),'originalArchiveSha256':sha(old),'parentAdoptionSha256':sha(raw(D/'PARENT-ADOPTION.json')),'onlyChangedFields':changed,'semanticSha256':semantic_sha,'exactArgv':argv,'cwd':str(R),'environment':{'PYTHONDONTWRITEBYTECODE':'1'},'caps':manifest['caps'],'head':head,'source':source,'remote':remote,'clean':True,'power':power,'diskFreeBytes':free,'diskMinimumBytes':minimum,'freshInheritedFiles':len(inherited['files']),'freshInheritedInventorySha256':sha(json.dumps(inherited,sort_keys=True).encode()),'runtime':runtime,'sourceManifestSha256':sha(manifest_raw),'sourceFilesVerified':verified,'absentPaths':absent,'heavyNodeConsumers':heavy,'protectedWritableFdGuardFresh':True,'protectedRoots':rootfacts,'protectedCommonSha256':protected_common,'protectedProductionSha256':protected_production,'copyObservedReceiptSha256':sha(copyraw),'launchPerformed':False,'testsRepeated':False,'claimLimit':'Adoption and point-in-time preflight only. Parent grants lane and launches exact argv; recorder independently rechecks guards. No game outcome or acceptance.'}
print(json.dumps(facts,sort_keys=True,indent=2))
