import datetime, hashlib, json, os, shutil, subprocess, sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).parent
Q=S/'1370-c0-b109-bounded-token-chunk-proposal-20261009-r1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def role(p):
 p=Path(p);assert p.is_file() and not p.is_symlink()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True).strip()
mode=sys.argv[1];assert mode in ('controls','benchmark')
review=S/'1370-c0-b109-bounded-token-chunk-independent-source-review-20261009-r1/RECEIPT.json'
assert sha(review)=='b2d82e38b0f9ebf99681a77e58906f5348f4d7c1e95e822bcf76f6a686fd08c8'
assert json.loads(review.read_text())['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_BOUNDED_TOKEN_CHUNK'
assert sha(Q/'SOURCE-PINS.json')=='c9a590fcea32c857660ce60606592a691face6dd1dcd1f29b6ea24ec904f6db3'
roles=[role(review),role(Q/'SOURCE-PINS.json'),role(Path(__file__))]
for name,expected in json.loads((Q/'SOURCE-PINS.json').read_text()).items():
 assert role(Q/name)==expected,name
 roles.append(role(Q/name))
c=json.loads((Q/'CONFIG.json').read_text());recipe=json.loads((Q/'CONTROL-RECIPE.json').read_text())
for expected in c['roles'].values():
 assert role(expected['path'])==expected
 roles.append(role(expected['path']))
assert sha(c['nodePath'])==c['nodeSha256'];roles.append(role(c['nodePath']))
assert sha(recipe['helper']['path'])==recipe['helper']['sha256'];roles.append(role(recipe['helper']['path']))
chosen=next(r for r in recipe['recipes'] if r['mode']==mode)
assert sha(chosen['argv'][4])=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
roles.append(role(chosen['argv'][4]))
st=Path(c['capture']['path']).lstat()
actual={'dev':str(st.st_dev),'ino':str(st.st_ino),'mode':str(st.st_mode),'nlink':str(st.st_nlink),'size':str(st.st_size),'mtimeNs':str(st.st_mtime_ns),'ctimeNs':str(st.st_ctime_ns)}
assert actual==c['currentCaptureMetadata']
controls_review=None
if mode=='benchmark':
 controls_review=Path(sys.argv[2]);assert sha(controls_review)==sys.argv[3]
 cr=json.loads(controls_review.read_text());assert cr['decision'].startswith('ACCEPT_OBSERVED')
 roles.append(role(controls_review))
assert git('rev-parse','HEAD')=='02d50716fe787eaed425b40f822ce91f4463deba'
assert git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')=='02d50716fe787eaed425b40f822ce91f4463deba\trefs/heads/wip/headless-program-20260916-ts'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
for group in [17678,10372,10639,10655]:
 try:os.killpg(group,0)
 except ProcessLookupError:pass
 else:raise RuntimeError('known fullscan/materializer group still present '+str(group))
postflight=S/'1370-c0-m0-full-guard-parent-recorded-20261009-r1/POSTFLIGHT-TOOL-OUTCOME.json'
assert json.loads(postflight.read_text())['actualToolExit']==0
roles.append(role(postflight))
free=shutil.disk_usage(S).free;assert free>=3.5*1024**3
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True)
assert not os.path.lexists(chosen['outputPath']) and not os.path.lexists(chosen['parentCreatesPrivateFreshLaneDirectory'])
grant={'schema':'bounded-token-chunk-parent-grant/v1','status':'GRANT_EXACT_PURE_'+mode.upper()+'_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':mode,'roles':roles,'argv':chosen['argv'],'cwd':chosen['cwd'],'environment':recipe['requiredEnvironment'],'bounds':c['bounds'],'freeBytes':free,'acPower':True,'expectedControls':{'groups':28,'pairs':321},'controlsObservedReview':role(controls_review) if controls_review else None,'currentCaptureMetadata':actual,'wholeCaptureHashPriorProvenanceOnly':True,'timedReferenceSha256':c['roles']['referenceEncoder']['sha256'],'readerSha256':c['roles']['baseline']['sha256'],'rootPidBecomesHelperPid':os.getpid(),'unexpectedHelperWaitIsStop':True,'gameFull109IntegrationAuthorized':False}
gp=P/(mode.upper()+'-GRANT.json');fd=os.open(gp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
Path(chosen['parentCreatesPrivateFreshLaneDirectory']).mkdir(mode=0o700)
print(json.dumps({'grant':role(gp),'helperPid':os.getpid()}),flush=True)
os.chdir(R);os.execvpe(chosen['argv'][0],chosen['argv'],dict(os.environ,**recipe['requiredEnvironment']))
