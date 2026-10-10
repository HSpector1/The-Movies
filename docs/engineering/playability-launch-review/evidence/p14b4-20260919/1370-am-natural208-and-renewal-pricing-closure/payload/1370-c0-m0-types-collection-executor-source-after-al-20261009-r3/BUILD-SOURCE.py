import ast, difflib, hashlib, json, pathlib, stat
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
OLD=S/'1370-c0-m0-types-next-slice-after-ak-20261009-r1'
P=S/'1370-c0-m0-types-collection-executor-source-after-al-20261009-r3'
P.mkdir(mode=0o700)
b=json.loads((OLD/'BINDING-UNFILLED.json').read_text())
roles=b['sourceAuthorities']
def h(raw):return hashlib.sha256(raw).hexdigest()
def readrole(name):
 r=roles[name];raw=pathlib.Path(r['path']).read_bytes()
 assert len(raw)==r['bytes'] and h(raw)==r['sha256'],name
 return raw
runner=readrole('typeRunnerPattern').decode();supervisor=readrole('typeRecorderPattern').decode()
facts=json.loads(readrole('m0PhysicalFacts'));manifest=json.loads(readrole('sourceManifest'))
for n in ['m0CompleteParentAdoption','m0CopyParentAdoption','m0CompleteIndependentReview','sourceReview','typeObservedHStop','typeRunnerPatternReview','typeRecorderPatternReview','r5SourceBootstrap','h13ExactBootstrap','h13ExactBinding','m0BridgeInputs','parentScope']:
 readrole(n)
planroles={}
planpins=json.loads((OLD/'SOURCE-PINS.json').read_text())
for name in ['SOURCE-PINS.json','NEXT-STEPS.md','ROUTE-PROPOSAL.json','SOURCE-REUSE-MAPPING.json','BINDING-UNFILLED.json']:
 raw=(OLD/name).read_bytes();planroles[name]={'path':str(OLD/name),'bytes':len(raw),'sha256':h(raw)}
assert planroles['SOURCE-PINS.json']['sha256']=='4b38dbfad83af47d48f07470950693a3da95a46b71d9b9e96dfccd7fd29d30a8'
readback=S/'1370-al-checkpoint-root-finalization-20261009-r2/PUSH-READBACK.json'
assert h(readback.read_bytes())=='35e15f42b2cb99bd3e035f2061eb0cabe62142b09808fcf1b8153852ad032e04'
def put(name,data):
 if isinstance(data,str):data=data.encode()
 (P/name).write_bytes(data)
 return {'path':str(P/name),'bytes':len(data),'sha256':h(data)}
def js(obj):return json.dumps(obj,indent=2,sort_keys=True)+'\n'
def funcs(source):
 lines=source.splitlines(keepends=True)
 return {n.name:''.join(lines[n.lineno-1:n.end_lineno]) for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)}
rf=funcs(runner);sf=funcs(supervisor)
runid='20261009-m0-types-after-al-r1'
cfg={**b,'schema':'1370-m0-types-collection-source-config/v1','status':'HELD_SOURCE_ONLY_NO_RUNTIME_GRANT',
 'operationalProductionHead':'8cb704e2f18e6a635943893422c9cfdc206e106d','operationalAuthorityVerifiedThisSlice':True,
 'operationalReadback':{'path':str(readback),'bytes':len(readback.read_bytes()),'sha256':h(readback.read_bytes())},
 'productionRef':'refs/heads/wip/headless-program-20260916-ts','mainRef':'refs/heads/main','mainOid':'c902a704eb948cc576083d0973c8c23e59937dc1',
 'runId':runid,'outputRoot':str(S/'1370-c0-m0-types-collection-executor-results-after-al-20261009-r1'),
 'recorderResult':str(S/'1370-c0-m0-types-collection-recorder-results-after-al-20261009-r1'/f'{runid}.RECORDER-RESULT.json'),
 'laneLog':str(S/f'c0-m0-types-{runid}.lane.log'),'childWallSeconds':300,'recorderActiveSeconds':320,'recorderWallSeconds':330,
 'entryCap':len(facts['files'])+len(facts['directories'])-1+len(facts['symlinks']),
 'actualSourceReview':None,'currentProtectedScopeAdoption':None,'runtimeToolsAndPhysicalWrapperRoles':None,
 'freshSourceDependencyMetadataProof':None,'actualExecutionRoles':None,'actualGrant':None,
 'runtimeFieldsUnfilled':{'actualSourceReview':None,'currentProtectedScopeAdoption':None,'runtimeToolsAndPhysicalWrapperRoles':None,'actualGrant':None},
 'planningAuthorities':planroles,'claimLimit':'SOURCE_ONLY_TYPES_AND_COLLECTION_NO_GAME_OR_H_METADATA_WAIVER'}
configrole=put('CONFIG.json',js(cfg));put('check-deps.mjs',readrole('depsChecker'))
header=runner[:runner.index('def stop_current():')]
header=header[:header.index("OUT_ROOT=")]+f'''P=pathlib.Path({str(P)!r})
CONFIG_PATH=P/'CONFIG.json'
CONFIG_SHA={configrole['sha256']!r}
OUT_ROOT=pathlib.Path({cfg['outputRoot']!r})
MIRROR_ROOT=pathlib.Path({str(pathlib.Path(b['mirrorPath']).parent)!r})
CURRENT_HEAD={cfg['operationalProductionHead']!r}
TREE={cfg['productionSourceTree']!r}
REF={cfg['productionRef']!r}
MAIN_REF={cfg['mainRef']!r}
MAIN_OID={cfg['mainOid']!r}
ORIGIN='https://github.com/HSpector1/The-Movies.git'
LOCK_SHA='728ee1693d3d4f33d04fc731264e442cb5f00e922fb36943aee9db9bf2e7c5de'
DEPS_CHECK_SHA={roles['depsChecker']['sha256']!r}
NODE='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
MAX_CHILD_LOG=8*1024*1024
MAX_COLLECTION=1*1024*1024
MAX_RESULT=128*1024
WALL=300
FLOOR=3*1024**3
PREFLIGHT=int(3.5*1024**3)
START=globals().get('_BOOTSTRAP_START')
AUTHORITY=globals().get('_AUTHORITY')
CURRENT=None
GROUP_ALTERNATE_PROOFS=[]
CONFIG=None
M0_FACTS=None
'''
keep=['stop_current','on_signal','need','sha','remaining','fields','open_dir_chain','verify_dir_chain','close_chain','read_pin','clean_git_env','bounded_ps_snapshot','group_alive','signal_group','stop_group','guard_command_bytes','cmd','source_step','bounded_names','walk_meta','canonical_proof','stable_output','write_result','root_checkpoint','scratch_preimage_output','check_preimage_output','run_child']
guard='''def guard(run_id):
 remaining()
 need(CONFIG is not None and run_id==CONFIG['runId'],'wrong M0 run')
 lane=read_pin(S/'HEAVY-LANE-LOCK',AUTHORITY['laneLock']['sha256'],10000)
 need(pathlib.Path(CONFIG['laneLog']).name.encode() in lane,'wrong heavy lane')
 need(cmd(['pmset','-g','batt']).splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB disk floor')
 need(cmd(['git','rev-parse','HEAD'])==CURRENT_HEAD and cmd(['git','rev-parse','HEAD:src'])==TREE and
      cmd(['git','status','--porcelain=v1'])=='','production source drift')
 need(cmd(['git','remote','get-url','origin'])==ORIGIN,'origin URL drift')
 for ref,oid in ((REF,CURRENT_HEAD),(MAIN_REF,MAIN_OID)):
  need(cmd(['git','rev-parse',ref])==oid and cmd(['git','ls-remote','origin',ref])==oid+'\\t'+ref,'local/remote ref drift')
 for ref,oid in AUTHORITY.get('additionalRefs',{}).items():
  need(type(ref) is str and ref.startswith('refs/heads/') and re.fullmatch('[0-9a-f]{40}',oid),'additional ref type')
  need(cmd(['git','rev-parse',ref])==oid and cmd(['git','ls-remote','origin',ref])==oid+'\\t'+ref,'additional current ref drift')
'''
full='''def normalized(st):
 return (st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def full_source_check(mirror,manifest,run_id,allow_deps_link=False):
 """Exact admitted M0 roster, content and physical metadata through no-follow dirfds."""
 expected=M0_FACTS['files'];directories=M0_FACTS['directories'];links=M0_FACTS['symlinks']
 need(len(expected)==1740 and sum(r['bytes'] for r in expected.values())==119393120 and
      len(directories)==113 and set(links)=={'node_modules'},'M0 authenticated roster')
 overlays={r['destination']:r for r in manifest['files']}
 need(len(overlays)==5 and all(expected[k]['bytes']==v['bytes'] and expected[k]['sha256']==v['sha256'] for k,v in overlays.items()),'five M0 overlays')
 held=open_dir_chain(mirror);rootfd=held[-1];root_before=fields(os.fstat(rootfd))
 proof_rows={};metadata_rows={};seen_dirs=set();state={'entries':0};total=0;deps_link=None
 try:
  def descend(fd,prefix):
   nonlocal total,deps_link
   before=fields(os.fstat(fd));dirrel=prefix[:-1] if prefix else '.'
   need(dirrel in directories and normalized(os.fstat(fd))==tuple(directories[dirrel]),'admitted directory metadata '+dirrel)
   seen_dirs.add(dirrel);metadata_rows[dirrel]=list(before)
   for name in bounded_names(fd,state,CONFIG['entryCap'],run_id):
    source_step(run_id)
    need(name not in ('','.','..') and '/' not in name,'unsafe mirror name')
    rel=prefix+name;st=os.stat(name,dir_fd=fd,follow_symlinks=False)
    if stat.S_ISDIR(st.st_mode):
     need(rel in directories,'extra mirror directory '+rel)
     child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(child))==fields(st),'mirror directory open drift')
      descend(child,rel+'/')
      need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'mirror directory changed')
     finally:os.close(child)
    elif stat.S_ISLNK(st.st_mode):
     need(allow_deps_link and rel=='node_modules' and deps_link is None and st.st_nlink==1,'unexpected dependency link')
     target=os.readlink(name,dir_fd=fd)
     need(normalized(st)==tuple(links[rel]['identity']) and target==links[rel]['target']==str(REPO/'node_modules') and
          fields(st)==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency link changed')
     deps_link=fields(st)+(target,);metadata_rows[rel]=list(deps_link)
    else:
     need(rel in expected and rel not in proof_rows,'extra/duplicate mirror file '+rel)
     row=expected[rel];size=row['bytes']
     need(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size==size and normalized(st)==tuple(row['identity']),'admitted mirror file metadata '+rel)
     filefd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(filefd))==fields(st),'mirror open drift '+rel)
      blob=hashlib.sha1(f'blob {size}\\0'.encode());content=hashlib.sha256();count=0
      while True:
       source_step(run_id);chunk=os.read(filefd,1<<20)
       if not chunk:break
       count+=len(chunk);need(count<=size,'mirror file grew '+rel);blob.update(chunk);content.update(chunk)
      need(count==size and fields(os.fstat(filefd))==fields(st)==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'mirror file read drift '+rel)
     finally:os.close(filefd)
     got_oid=blob.hexdigest();got_sha=content.hexdigest();got_mode=stat.S_IMODE(st.st_mode)
     need(got_oid==row['gitBlobOid'] and got_sha==row['sha256'],'M0 file bytes '+rel)
     proof_rows[rel]=[rel,size,got_oid,got_sha,got_mode];metadata_rows[rel]=list(fields(st));total+=size
   need(fields(os.fstat(fd))==before,'mirror directory mutation')
  descend(rootfd,'')
  need(set(proof_rows)==set(expected) and seen_dirs==set(directories) and len(proof_rows)==1740 and total==119393120 and
       deps_link is not None and state['entries']==CONFIG['entryCap'],'M0 complete roster/count/bytes/link')
  need(fields(os.fstat(rootfd))==root_before,'mirror root mutation');verify_dir_chain(mirror,held)
  meta=b''.join(json.dumps([k,metadata_rows[k]],separators=(',',':')).encode()+b'\\n' for k in sorted(metadata_rows,key=lambda x:x.encode()))
  return {'fileProofDigestSha256':canonical_proof(proof_rows),'physicalMetadataSha256':sha(meta),
          'mirrorFiles':len(proof_rows),'mirrorBytes':total,'dependencyLink':list(deps_link),'traversedEntries':state['entries'],'mirrorRootIdentity':list(root_before)}
 finally:close_chain(held)
def load_m0_authorities():
 global M0_FACTS
 def role(name,cap=100000):
  r=CONFIG['sourceAuthorities'][name];return json.loads(read_pin(pathlib.Path(r['path']),r['sha256'],cap))
 copied=role('m0CopyParentAdoption');complete=role('m0CompleteParentAdoption');review=role('m0CompleteIndependentReview')
 need(copied['decision']=='ADOPT_OBSERVED_M0_SOURCE_ONLY_COPY_AND_FULL_POSTFLIGHT','M0 source copy adoption')
 need(complete['status']=='ROOT_ADOPTED_OBSERVED_M0_ADDITIVE_WITH_FULL_PROTECTION' and
      review['decision']=='ACCEPT_OBSERVED_M0_ADDITIVE_COMPLETE_WITH_FULL_PROTECTED_POSTFLIGHT','complete M0 adoption/review')
 need(complete['regularFiles']==1740 and complete['regularBytes']==119393120 and complete['bridgeFiles']==63 and
      complete['bridgeBytes']==1517743 and complete['dependencyLinks']==1 and complete['dependencyPackageRoles']==21,'M0 complete physical counts')
 need(complete['acceptedRoles']['facts']==CONFIG['sourceAuthorities']['m0PhysicalFacts'] and
      complete['acceptedRoles']['completeIndependentReview']==CONFIG['sourceAuthorities']['m0CompleteIndependentReview'] and
      complete['protectedPostflightAccepted'] is True and complete['fullImmutableEqualityAccepted'] is True and
      complete['original1677StrictPreservationAccepted'] is True,'complete M0 exact adopted facts/review/protection')
 M0_FACTS=role('m0PhysicalFacts',2*1024*1024)
 need(M0_FACTS['original1677StrictFileMetadataPreserved'] is True and M0_FACTS['actualRegularFiles']==1740 and
      M0_FACTS['actualRegularBytes']==119393120,'original source physical facts')
 manifest=role('sourceManifest');source_review=role('sourceReview');hstop=role('typeObservedHStop')
 need(manifest['arm']=='M0' and len(manifest['files'])==5 and source_review['decision']=='ACCEPT_STATIC_FULL_ERA_OBSERVER_ONLY' and
      source_review['sourceManifestSha256']==CONFIG['sourceAuthorities']['sourceManifest']['sha256'] and
      source_review['sourceCommit']==copied['sourceCommit']==CONFIG['historicalM0SourceCommit'] and
      copied['sourceTree']==CONFIG['productionSourceTree'],'M0 five-overlay authority')
 need(hstop['decision']=='ACCEPT_OBSERVED_STOP_H_TYPECHECK_COLLECTION_R13' and
      hstop['sourceStatus']=='STOP_POSTFLIGHT_DRIFT' and hstop['runtimeClaim']=='STOP_ONLY_NO_TYPE_GATE','H13 metadata STOP remains')
 return manifest
def full_dependency_check(root,run_id):
 held=open_dir_chain(root)
 try:
  before=fields(os.fstat(held[-1]));proof=walk_meta(root,run_id)
  need(fields(os.fstat(held[-1]))==before,'dependency root metadata mutation')
  verify_dir_chain(root,held);proof['rootIdentity']=list(before);return proof
 finally:close_chain(held)
def exact_package_roles(run_id):
 need(len(M0_FACTS['roleIdentities'])==21,'21 admitted dependency package roles')
 for path,row in M0_FACTS['roleIdentities'].items():
  source_step(run_id);p=pathlib.Path(path);held=open_dir_chain(p.parent)
  try:
   st=os.stat(p.name,dir_fd=held[-1],follow_symlinks=False)
   need(normalized(st)==tuple(row['identity']),'dependency package metadata drift '+path)
   raw=read_pin(p,row['sha256'],1024*1024)
   need(len(raw)==row['bytes'] and normalized(os.stat(p.name,dir_fd=held[-1],follow_symlinks=False))==tuple(row['identity']),'dependency package role drift '+path)
   verify_dir_chain(p.parent,held)
  finally:close_chain(held)
'''
# Retain the exact original four-command block, child boundary checks, failure traces,
# and collection parsing; only source path and final full-proof equality are adapted.
tail=runner[runner.index(' try:\n  guard(run_id)\n  node=NODE;'):]
tail=tail.replace("str(S/'1370-c0-h-m0-typecheck-collection-route-template-r1/check-deps.mjs')","str(P/'check-deps.mjs')")
tail=tail.replace("need(full_source_check(mirror,manifest,run_id,True)['fileProofDigestSha256']==source_before['fileProofDigestSha256'],'source changed during checks')","need(full_source_check(mirror,manifest,run_id,True)==source_before,'source content or metadata changed during checks')")
start=tail.index("   if (record['sourceAfter']['fileProofDigestSha256']")
end=tail.index("    record['status']='STOP_POSTFLIGHT_DRIFT'",start)
tail=tail[:start]+"   if record['sourceAfter']!=source_before or record['nodeModulesAfter']!=dep_before:\n"+tail[end:]
tail=tail.replace("'PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY'","'PASS_M0_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY'")
tail=tail.replace('walk_meta(prod_deps,run_id)','full_dependency_check(prod_deps,run_id)')
main='''def main():
 global CONFIG
 signal.signal(signal.SIGTERM,on_signal);signal.signal(signal.SIGINT,on_signal)
 need(type(AUTHORITY) is dict,'authenticated external execution authority required')
 CONFIG=json.loads(read_pin(CONFIG_PATH,CONFIG_SHA,100000))
 run_id=CONFIG['runId'];mirror=pathlib.Path(CONFIG['mirrorPath']);out=OUT_ROOT/run_id
 need(mirror==pathlib.Path(AUTHORITY['mirrorPath']) and not os.path.lexists(out),'mirror role/output collision')
 guard(run_id);need(shutil.disk_usage(S).free>=PREFLIGHT,'3.5 GiB preflight')
 manifest=load_m0_authorities()
 source_before=full_source_check(mirror,manifest,run_id,True)
 need(source_before==AUTHORITY['freshSourceProof'],'fresh admitted M0 source/metadata protection proof')
 prod_deps=REPO/'node_modules';need(prod_deps.is_dir() and not prod_deps.is_symlink(),'production deps root')
 exact_package_roles(run_id);dep_before=full_dependency_check(prod_deps,run_id)
 need(dep_before==AUTHORITY['freshDependencyProof'],'fresh full dependency content/metadata protection proof')
 OUT_ROOT.mkdir(mode=0o700,exist_ok=True);out.mkdir(mode=0o700)
 record={'schema':'1370-m0-types-collection-result/v1','status':'RUNNING','arm':'M0','runId':run_id,
         'productionHead':CURRENT_HEAD,'productionSourceTree':TREE,'sourceCommit':CONFIG['historicalM0SourceCommit'],
         'historicalDataAuthorityHead':CONFIG['historicalDataAuthorityHead'],
         'sourceManifestSha256':CONFIG['sourceAuthorities']['sourceManifest']['sha256'],
         'completeM0AdoptionSha256':CONFIG['sourceAuthorities']['m0CompleteParentAdoption']['sha256'],
         'physicalFactsSha256':CONFIG['sourceAuthorities']['m0PhysicalFacts']['sha256'],
         'h13MetadataStopSha256':CONFIG['sourceAuthorities']['typeObservedHStop']['sha256'],'h13MetadataStopWaived':False,
         'currentProtectionSha256':AUTHORITY['currentProtection']['sha256'],'actualGrantSha256':AUTHORITY['actualGrant']['sha256'],
         'sourceBefore':source_before,'nodeModulesBefore':dep_before,'children':[],'gameAccepted':False}
'''
newrunner=header+'\n'.join(rf[k]+'\n' for k in keep)+ '\nremaining()\nSOURCE_LAST_GUARD=float("-inf")\n'+guard+full+main+tail
newrunner=newrunner.replace('UNRUN proposal: H full-era dependency, types and diagnostic collection only.','HELD M0 dependency, types and diagnostic collection executor; no runtime grant embedded.')
runnerrole=put('runner.py',newrunner)
# Child bootstrap keeps the qualified no-follow pin reader and 300s timer unchanged.
boot=readrole('r5SourceBootstrap').decode()
prefix=boot[:boot.index("assert len(sys.argv)==3")]
readstart=boot.index('def ident(st):');readend=boot.index('raw={p:read_pin')
prefix=prefix.replace('H typecheck collection child bootstrap','M0 typecheck collection child bootstrap')
newboot=prefix+f'''assert len(sys.argv)==4,'exact context hash / context path / runner hash required'
P=pathlib.Path({str(P)!r})
runner=P/'runner.py'
context=pathlib.Path(sys.argv[2])
'''+boot[readstart:readend]+'''raw=read_pin(context,sys.argv[1],128*1024)
authority=json.loads(raw)
source=read_pin(runner,sys.argv[3],250000)
exec(compile(source,str(runner),'exec'),{'__name__':'__main__','__file__':str(runner),'_BOOTSTRAP_START':start,'_AUTHORITY':authority})
'''
bootrole=put('BOOTSTRAP.py',newboot)
# Qualified r5 supervisor timing, cleanup, result writer, Popen and finalization remain.
sh=supervisor[:supervisor.index('RESULT=')]+f'''P=pathlib.Path({str(P)!r})
RESULT=pathlib.Path({cfg['recorderResult']!r})
BOOTSTRAP=P/'BOOTSTRAP.py'
BOOTSTRAP_SHA={bootrole['sha256']!r}
RUNNER_SHA={runnerrole['sha256']!r}
AUTHORITY=globals()['_AUTHORITY']
CONTEXT=pathlib.Path(globals()['_CONTEXT_PATH'])
CONTEXT_SHA=globals()['_CONTEXT_SHA']
HELPER=globals()['_HELPER']
HEAD={cfg['operationalProductionHead']!r}
SRC={cfg['productionSourceTree']!r}
PRODUCTION_REF={cfg['productionRef']!r}
MAIN_REF={cfg['mainRef']!r}
MAIN_OID={cfg['mainOid']!r}
LANE_LOG={pathlib.Path(cfg['laneLog']).name!r}
ACTIVE=320
LIMIT=330
START=globals()['LAUNCH_START']
if type(START) not in (int,float) or not math.isfinite(START) or not 0<=time.monotonic()-START<ACTIVE:
 raise RuntimeError('invalid recorder loader start / elapsed bound')
CHILD=None
'''
skeeps=[k for k in sf if k not in ['main','preflight']]
preflight=sf['preflight'].replace('(EVIDENCE_REF,EVIDENCE)','(MAIN_REF,MAIN_OID)')
preflight=preflight.replace("read_pin(S/'HEAVY-LANE-LOCK',10000)","read_pin(S/'HEAVY-LANE-LOCK',10000,AUTHORITY['laneLock']['sha256'])")
sm=sf['main']
sm=sm.replace("need(type(BINDING_SHA) is str and len(BINDING_SHA)==64 and set(BINDING_SHA)<=set('0123456789abcdef'),'filled binding SHA')","need(hashlib.sha256(read_pin(CONTEXT,128*1024)).hexdigest()==CONTEXT_SHA,'filled context SHA')")
sm=sm.replace('1370-c0-h-typecheck-collection-recorder-result-r5','1370-m0-types-collection-recorder-result/v1')
sm=sm.replace("'sourceSha256':'946b3c88208db5128e30e668d0e322f11224235a71ff6994362acb124e0831b7'","'sourceSha256':RUNNER_SHA")
sm=sm.replace("'bindingSha256':BINDING_SHA","'contextSha256':CONTEXT_SHA")
sm=sm.replace("'staticReviewSha256':STATIC_SHA","'staticReviewSha256':AUTHORITY['sourceReview']['sha256']")
sm=sm.replace("'evidenceTip':EVIDENCE","'mainOid':MAIN_OID")
sm=sm.replace("'contextSha256':CONTEXT_SHA", "'contextSha256':CONTEXT_SHA,'helperPid':HELPER['pid'],'helperPgid':HELPER['pgid'],'helperSid':HELPER['sid']")
a=sm.index('  prior=json.loads(');z=sm.index('  bootstrap_source=',a)
sm=sm[:a]+"  need(AUTHORITY['configSha256']=="+repr(configrole['sha256'])+",'exact M0 source config')\n"+sm[z:]
sm=sm.replace('bootstrap_source,BINDING_SHA,STATIC_SHA','bootstrap_source,CONTEXT_SHA,str(CONTEXT),RUNNER_SHA')
newsuper=sh+'\n'.join(sf[k]+'\n' for k in skeeps)+preflight+'\n'+sm+"\nif __name__=='__main__':main()\n"
newsuper=newsuper.replace('UNRUN H full-era typecheck collection outer recorder; requires reviewed exact loader.','HELD M0 typecheck collection outer recorder; authenticated external review/protection/grant required.')
superrole=put('supervise.py',newsuper)
# Whole-launch loader authenticates all operational source roles and actual filled
# authority; config contains no mutable future grant or review fields.
exact=readrole('h13ExactBootstrap').decode()
estart=exact[:exact.index("S=pathlib.Path")]
er=exact[exact.index('def attrs(v):'):exact.index('raw={path:read_pin')]
launch=estart.replace('H type recorder','M0 type recorder')+'''import sys
assert len(sys.argv)==3,'context path and exact hash required'
context=pathlib.Path(sys.argv[1]);context_sha=sys.argv[2]
assert len(context_sha)==64 and set(context_sha)<=set('0123456789abcdef')
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpgrp()==os.getpid() and os.getsid(0)==os.getpid(),'launch helper must own its actual session/group'
HELPER_PID=os.getpid();HELPER_PGID=os.getpgrp();HELPER_SID=os.getsid(0)
'''+er+f'''P=pathlib.Path({str(P)!r})
config=json.loads(read_pin(P/'CONFIG.json',{configrole['sha256']!r},100000))
authority=json.loads(read_pin(context,context_sha,128*1024))
expected={{'runner.py':{runnerrole['sha256']!r},'BOOTSTRAP.py':{bootrole['sha256']!r},'supervise.py':{superrole['sha256']!r},'CONFIG.json':{configrole['sha256']!r},'check-deps.mjs':{roles['depsChecker']['sha256']!r}}}
assert authority['schema']=='1370-m0-types-execution-context/v1'
assert authority['configSha256']==expected['CONFIG.json'] and authority['runId']==config['runId'] and authority['mirrorPath']==config['mirrorPath']
def role(name,cap=100000):
 r=authority[name]
 assert type(r) is dict and set(r)=={{'path','bytes','sha256'}} and type(r['bytes']) is int and 0<r['bytes']<=cap
 raw=read_pin(pathlib.Path(r['path']),r['sha256'],cap);assert len(raw)==r['bytes'];return json.loads(raw)
review=role('sourceReview');protection=role('currentProtection');grant=role('actualGrant')
assert review['decision']=='ACCEPT_STATIC_M0_TYPES_COLLECTION_SOURCE_ONLY'
assert all(review['sourcePins'][k]['sha256']==v for k,v in expected.items())
launch_role=review['sourcePins']['LAUNCH.py']
launch_bytes=read_pin(P/'LAUNCH.py',launch_role['sha256'],250000)
assert launch_role['path']==str(P/'LAUNCH.py') and launch_role['bytes']==len(launch_bytes)
assert protection['schema']=='1370-root-current-m0-types-protection/v1' and protection['m0TypesProtectionAccepted'] is True
assert protection['productionHead']==config['operationalProductionHead'] and protection['productionSourceTree']==config['productionSourceTree']
assert protection['mirrorPath']==config['mirrorPath'] and protection['physicalFactsSha256']==config['sourceAuthorities']['m0PhysicalFacts']['sha256']
assert protection['completeM0AdoptionSha256']==config['sourceAuthorities']['m0CompleteParentAdoption']['sha256']
assert protection['fullProtectedPostflightAccepted'] is True and protection['soleLaneReleased'] is True
assert protection['freshSourceProof']==authority['freshSourceProof'] and protection['freshDependencyProof']==authority['freshDependencyProof']
assert protection['additionalRefs']==authority['additionalRefs']
assert grant['schema']=='1370-root-m0-types-execution-grant/v1' and grant['executionAuthorization'] is True
assert grant['contextWithoutGrantSha256']==hashlib.sha256(json.dumps({{k:v for k,v in authority.items() if k!='actualGrant'}},sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert grant['runId']==config['runId'] and grant['configSha256']==expected['CONFIG.json']
assert grant['sourceReviewSha256']==authority['sourceReview']['sha256'] and grant['currentProtectionSha256']==authority['currentProtection']['sha256']
assert grant['scope']=='M0_FOUR_COMMAND_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY' and grant['gameAuthorization'] is False
assert type(authority['additionalRefs']) is dict
assert set(authority['runtimeTools'])=={{'node','python','rootCompilerWrapper','uiCompilerWrapper','collectionWrapper'}}
def normalized(st):return [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
for name,r in authority['runtimeTools'].items():
 assert type(r['bytes']) is int and 0<r['bytes']<=128*1024*1024
 raw=read_pin(pathlib.Path(r['physicalPath']),r['sha256'],128*1024*1024)
 assert len(raw)==r['bytes'] and normalized(os.stat(r['physicalPath'],follow_symlinks=False))==r['physicalIdentity']
 for link in r['links']:
  st=os.stat(link['path'],follow_symlinks=False)
  assert stat.S_ISLNK(st.st_mode) and normalized(st)==link['identity'] and os.readlink(link['path'])==link['target']
 assert pathlib.Path(r['invokedPath']).resolve(strict=True)==pathlib.Path(r['physicalPath'])
assert authority['runtimeTools']['node']['invokedPath']=='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
assert authority['runtimeTools']['python']['invokedPath']=='/usr/local/bin/python3'
compiler=str(pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')/'node_modules/.bin'/'tsc')
collector=str(pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')/'node_modules/.bin'/'vitest')
assert authority['runtimeTools']['rootCompilerWrapper']['invokedPath']==compiler==authority['runtimeTools']['uiCompilerWrapper']['invokedPath']
assert authority['runtimeTools']['collectionWrapper']['invokedPath']==collector
source=read_pin(P/'supervise.py',expected['supervise.py'],250000)
for name,pin in expected.items():read_pin(P/name,pin,250000)
print(json.dumps({{'schema':'1370-m0-types-launch-helper-identity/v1','helperPid':HELPER_PID,'helperPgid':HELPER_PGID,'helperSid':HELPER_SID,'contextSha256':context_sha}}),flush=True)
exec(compile(source,str(P/'supervise.py'),'exec'),{{'__name__':'__main__','__file__':str(P/'supervise.py'),
 'LAUNCH_START':LAUNCH_START,'_AUTHORITY':authority,'_CONTEXT_PATH':str(context),'_CONTEXT_SHA':context_sha,
 '_HELPER':{{'pid':HELPER_PID,'pgid':HELPER_PGID,'sid':HELPER_SID}}}})
'''
launchrole=put('LAUNCH.py',launch)
# Parser-only validation; none of these generated modules is imported or executed.
for name in ['runner.py','BOOTSTRAP.py','supervise.py','LAUNCH.py']:ast.parse((P/name).read_text(),filename=name)
retained={}
for filename,old,new,functions in [('runner.py',runner,newrunner,keep),('supervise.py',supervisor,newsuper,skeeps),('BOOTSTRAP.py',boot,newboot,['remaining_from','ident','attrs','read_pin']),('LAUNCH.py',exact,launch,['attrs','identity','read_pin'])]:
 nf=funcs(new);of=funcs(old)
 assert all(nf[k]==of[k] for k in functions),filename
 retained[filename]={k:h(of[k].encode()) for k in functions}
 # Exact whole-byte forward/inverse patches with deterministic in-memory application.
 for suffix,source,target in [('forward',old,new),('inverse',new,old)]:
  diff=''.join(difflib.unified_diff(source.splitlines(keepends=True),target.splitlines(keepends=True),fromfile=filename,tofile=filename,n=3))
  put(filename+'.'+suffix+'.diff',diff)
  sl=source.splitlines(keepends=True);out=[];pos=0;rows=diff.splitlines(keepends=True);i=2
  import re
  while i<len(rows):
   m=re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@',rows[i]);assert m
   at=int(m[1])-1;out.extend(sl[pos:at]);pos=at;i+=1
   while i<len(rows) and not rows[i].startswith('@@ '):
    line=rows[i];i+=1
    if line[0] in ' -':assert sl[pos]==line[1:];pos+=1
    if line[0] in ' +':out.append(line[1:])
  out.extend(sl[pos:]);assert ''.join(out)==target
 # Prefix full baseline pinned source for inverse reconstruction without dependency writes.
 put('PREDECESSOR-'+filename,old)
oldcommands=runner[runner.index('  for name,argv in ['):runner.index('   before_child=root_checkpoint')]
newcommands=newrunner[newrunner.index('  for name,argv in ['):newrunner.index('   before_child=root_checkpoint')]
assert oldcommands==newcommands
for alias,role in {'copied':'m0CopyParentAdoption','complete':'m0CompleteParentAdoption','M0_FACTS':'m0PhysicalFacts','source_review':'sourceReview','hstop':'typeObservedHStop'}.items():
 obj=json.loads(readrole(role));keys={n.slice.value for n in ast.walk(ast.parse(newrunner)) if isinstance(n,ast.Subscript) and isinstance(n.value,ast.Name) and n.value.id==alias and isinstance(n.slice,ast.Constant) and isinstance(n.slice.value,str)}
 assert keys<=obj.keys(),(role,keys-obj.keys())
put('EXECUTION-CONTEXT-UNFILLED.json',js({'schema':'1370-m0-types-execution-context/v1','configSha256':configrole['sha256'],'runId':runid,
 'mirrorPath':b['mirrorPath'],'sourceReview':None,'currentProtection':None,'actualGrant':None,'freshSourceProof':None,'freshDependencyProof':None,
 'laneLock':None,'additionalRefs':{},'runtimeTools':None,'executionAuthorization':False}))
put('RECIPE.md',f'''# Held M0 types/collection executor

Source only. No execution is authorized by this package. Keep admitted mirror bytes and metadata unchanged. The historical H13 metadata STOP remains binding evidence of a failed H gate; this package does not waive it.

The four commands and their order are byte-identical to H13, except the dependency-checker source path points to the exact copied checker. All run from the admitted M0 mirror. Collection imports the diagnostic file with a fresh external PREIMAGE_OUTPUT and collects names only; it does not authorize test bodies or a game.

Minimum actual fills: (1) independent source review pin; (2) current AL M0 protection root role and its freshly admitted complete source/physical-metadata and full dependency proofs; (3) actual Node22/Python/compiler/collection physical file and symlink roles plus fresh lane-lock pin; (4) external root execution grant. The fresh proofs are provided by the current protection role and rechecked by this executor, not separately invented. Known current refs are AL working/main from 35e15; additional evidence refs are only supplied if current protection actually requires them. Historical 292d source and AJ full-admission authority stay distinct.

Create a new external context file by filling EXECUTION-CONTEXT-UNFILLED.json; never edit CONFIG.json. The independent review uses decision ACCEPT_STATIC_M0_TYPES_COLLECTION_SOURCE_ONLY and sourcePins entries with exact path/bytes/sha256 for all executable files including LAUNCH.py. Root protection and grant schemas are consumed exactly as documented in LAUNCH.py. The grant binds SHA256 of canonical compact sorted JSON context with only actualGrant omitted. The final context adds the grant role. This creates no hash cycle: package -> review/protection -> context without grant -> grant -> final context. Grant cannot include the final context hash.

After root owns the single lane and grants this precise route, invoke a distinct helper process using the exact physically admitted Python endpoint: python3 -I -B {P/'LAUNCH.py'} /absolute/final-context.json FINAL_CONTEXT_SHA256 . Parent must externally bound and record helper stdout/stderr and whole330s lifetime; the supervisor starts its child in a new session and retains its qualified320/330s cleanup/result behavior. No positive signals to unrelated groups are authorized. Root must record actual helper PID and PGID (never substitute PID for PGID), child PID/group, all direct exits, fresh scoped absence and final outputs. Runtime source-result128KiB, child streams8MiB each, collection1MiB, recorder result100000B and guard streams2MiB stay exact. Require independent observed admission after actual run and full protected postflight; no type acceptance from source or child exits alone.

Parent recorder/helper stderr retains the qualified historical warning policy, separately from producer sidecars. Failure may prevent a completed result under a hard deadline; never infer success from missing output. The final result must be PASS_M0_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY with four exact zero-exit children and complete source and dependency proof equality, and recorder CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW with childExit0/groupCleartrue. This source package is not an observed result.
''')
put('LESSONS.md','''# Recorded lessons

An admitted complete M0 physical facts document is the roster authority; copying H's 1402-file or four-overlay assumptions would silently invalidate the M0 gate. M0 has1740 regular files,113 directories,63 bridge files,one dependency link,21 package roles and five overlays. File/directory fact identities store permission bits; the runner normalizes those for comparisons while retaining full stat tuples in fresh proofs.

Matching bytes and zero child exits do not waive directory metadata drift. H13's actual metadata STOP remains. This executor compares every admitted file, directory and link identity, preserves all per-child root checks, and requires full pre/post metadata proof equality.

Current AL operational authority must be distinct from historical292d M0 source and AJ complete admission. Current protection and execution grant are real future fills. Historical full postflight cannot authorize a new run.

The final grant is outside frozen source configuration. It binds context with the grant field omitted, then the final context pins that grant. This is an acyclic hash graph, with source review and protection as actual records. Preparing source does not execute source, reconstruct a mirror, or claim a type/game/performance result.
''')
proof={'schema':'1370-m0-types-source-proof/v1','executionPerformed':False,'executionAuthorization':False,'runtimeClaim':None,
 'predecessors':{'runner.py':roles['typeRunnerPattern'],'supervise.py':roles['typeRecorderPattern']},
 'retainedByteIdenticalFunctions':retained,'parserOnlySyntaxValidation':True,'wholeByteForwardAndInverseVerified':True,
 'exactFourCommandRosterSha256':h(oldcommands.encode()),'adoptionLiteralFieldNamesVerifiedAgainstPinnedFacts':True,
 'preparationDraftsPreserved':['1370-c0-m0-types-collection-executor-source-after-al-20261009-r1','1370-c0-m0-types-collection-executor-source-after-al-20261009-r2'],
 'preparationAuditCorrections':['actual complete-adoption field is dependencyPackageRoles','fresh source proof tuples normalized to JSON arrays for exact runtime comparison','full dependency root metadata retained alongside unchanged qualified walk','actual helper owns a session and records PID/PGID/SID separately','LAUNCH own bytes authenticated by external review pin without a self-hash cycle'],
 'changes':['H-only authority graph replaced by admitted complete M0 facts,copy,overlay,full-review roles','current refs updated to exact AL/main readback, historical source/admission heads preserved','M0 complete no-follow roster cap1853 derived from1740 files+112 nonroot directories+1link; stream/time/disk caps unchanged','full physical metadata equality added to source proof, all per-child root checks retained','external acyclic review/protection/tools/grant context; no future role fabricated'],
 'remainingActualRoleFills':['independent source review','root current AL M0 full protection and fresh source/dependency proofs','physical runtime tools/wrappers and fresh lane-lock pin','root exact execution grant'],
 'sourcePreparationOnly':{'mirrorContentRead':False,'mirrorScan':False,'rematerialization':False,'productionRead':False,'gitOperation':False,'generatedSourceExecuted':False}}
put('SOURCE-PROOF.json',js(proof))
put('BUILD-SOURCE.py',pathlib.Path(__file__).read_bytes())
pins={p.name:{'path':str(p),'bytes':len(p.read_bytes()),'sha256':h(p.read_bytes())} for p in sorted(P.iterdir()) if p.is_file()}
pinrole=put('SOURCE-PINS.json',js({'schema':'1370-m0-types-executor-source-pins/v1','files':pins,'authorities':roles,'executionAuthorization':False}))
sealrole=put('SEAL.json',js({'schema':'1370-m0-types-source-seal/v1','status':'HELD_RUNNABLE_SOURCE_REVIEW_PACKAGE_ONLY','sourcePins':pinrole,'executionAuthorization':False,'executionPerformed':False,'actualControls':None,'actualTypes':None,'actualCollection':None,'actualGame':None,'actualGrant':None}))
for p in P.iterdir():p.chmod(0o444)
print(json.dumps({'package':str(P),'sourcePins':pinrole,'seal':sealrole,'runner':runnerrole,'supervisor':superrole,'bootstrap':bootrole,'launch':launchrole,'fileCount':len(list(P.iterdir()))},indent=2))
