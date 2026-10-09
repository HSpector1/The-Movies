import pathlib,json,hashlib,subprocess,os,shutil,datetime,sys
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program'); S=pathlib.Path('/Users/zacheryspector/studio-scratch'); P=pathlib.Path(__file__).parent; Q=S/'1370-c0-m0-controls-bounded-parent-runner-proposal-20261009-r3'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def git(*a): return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*a],cwd=R,text=True).strip()
review=pathlib.Path(sys.argv[1]); assert sha(review)==sys.argv[2]; rv=json.loads(review.read_text()); assert rv['decision'].startswith('ACCEPT_SOURCE_ONLY_UNRUN')
expected='7e313645b9da63dafdac93e886e35c6a2cc7aef62f9da4e2974fdc7d07c8ac2a'; assert sha(Q/'SOURCE-PINS.json')==expected
pins=json.loads((Q/'SOURCE-PINS.json').read_text()); roles=[{'path':str(review),'sha256':sys.argv[2]},{'path':str(Q/'SOURCE-PINS.json'),'sha256':expected}]
for name,role in pins['files'].items(): roles.append({'path':str(Q/name),'sha256':role if isinstance(role,str) else role['sha256']})
c=json.loads((Q/'CONFIG.json').read_text()); roles.extend(c['roles'].values()); roles.append({'path':c['pythonPath'],'sha256':c['pythonSha256']})
for r in roles:
 p=pathlib.Path(r['path']); assert p.is_file() and not p.is_symlink() and sha(p)==r['sha256'],str(p);r['bytes']=p.stat().st_size
head='02d50716fe787eaed425b40f822ce91f4463deba'; src='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'; assert git('rev-parse','HEAD')==head and git('rev-parse','HEAD:src')==src and not git('status','--porcelain'); assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')==head+'\trefs/heads/wip/headless-program-20260916-ts'
assert not (S/'HEAVY-LANE-LOCK').exists(); free=shutil.disk_usage(S).free; assert free>=3.5*1024**3; assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True)
for pgid in (6563,3779):
 try: os.killpg(pgid,0)
 except ProcessLookupError: pass
 else: raise RuntimeError('prior owned group present')
r=json.loads((Q/'ARGV-TEMPLATE.json').read_text()); assert all(not os.path.lexists(p) for p in r['requiredFreshPaths']); argv=r['argv']; assert argv[-1]=='<EXACT_NEW_RUNNER_SOURCE_PINS_SHA>'; argv[-1]=expected
out={'status':'PARENT_ADOPTED_BOUNDED_RUNNER_AND_GRANTED_EXACT14_TINY_CONTROLS_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'sourceTree':src,'roles':roles,'reviewPath':str(review),'reviewSha256':sys.argv[2],'argv':argv,'environment':r['environment'],'cwd':str(R),'bounds':r['bounds'],'freeBytes':free,'acPower':True,'priorOwnedGroupsFreshlyAbsent':[6563,3779],'sourceReviewDecision':rv['decision'],'materializationGameFullscanAuthorized':False,'qualificationRequiresActual14Pass16DurableIdsFreshlyAbsentNoLateExitOrOverride':True}
f=P/'GRANT.json'; assert not f.exists(); f.write_text(json.dumps(out,indent=2,sort_keys=True)+'\n'); os.chmod(f,0o600); pathlib.Path(c['helperLog']).parent.mkdir(mode=0o700)
print(json.dumps({'grant':str(f),'sha256':sha(f),'roles':len(roles),'argv':argv}),flush=True)
env=dict(os.environ,**r['environment']);os.chdir(R);os.execvpe(argv[0],argv,env)
