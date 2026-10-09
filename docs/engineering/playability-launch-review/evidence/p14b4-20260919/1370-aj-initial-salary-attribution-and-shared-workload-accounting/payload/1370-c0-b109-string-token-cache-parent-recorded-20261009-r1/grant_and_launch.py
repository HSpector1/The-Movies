import datetime, hashlib, json, os, shutil, subprocess, sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).parent
Q=S/'1370-c0-b109-string-token-cache-proposal-20261009-r1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def role(p):
 p=Path(p);assert p.is_file() and not p.is_symlink()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True).strip()
mode=sys.argv[1];assert mode in ('controls','benchmark')
review=S/'1370-c0-b109-string-token-cache-independent-source-review-20261009-r1/RECEIPT.json'
assert sha(review)=='6b9939b91ccbe85d3bbbf7611dfd421d351b66a56652e9a64d4a6b52f318edfa'
assert json.loads(review.read_text())['decision']=='ACCEPT_SOURCE_ONLY_UNRUN'
assert sha(Q/'SOURCE-PINS.json')=='78912de56d420109c9934d44f748321c098f4712587c03133530383a155251f9'
roles=[role(review),role(Q/'SOURCE-PINS.json'),role(Path(__file__))]
source_pins=json.loads((Q/'SOURCE-PINS.json').read_text())
for expected in [*source_pins['files'].values(),*source_pins['externalRoles'].values()]:
 assert role(expected['path'])==expected
 roles.append(role(expected['path']))
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
 cr=json.loads(controls_review.read_text());assert cr['decision']=='ACCEPT_OBSERVED_STRING_TOKEN_CACHE_CONTROLS' and cr['sourcePinsSha256']=='78912de56d420109c9934d44f748321c098f4712587c03133530383a155251f9'
 roles.append(role(controls_review))
assert git('rev-parse','HEAD')=='282f8477e61a33bd5ec4a571b934829490adef73'
assert git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')=='282f8477e61a33bd5ec4a571b934829490adef73\trefs/heads/wip/headless-program-20260916-ts'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
for group in [17678,10372,10639,10655,71794,74268,14652,18122,28843]:
 try:os.killpg(group,0)
 except ProcessLookupError:pass
 else:raise RuntimeError('known fullscan/materializer group still present '+str(group))
free=shutil.disk_usage(S).free;assert free>=3.5*1024**3
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True)
assert not os.path.lexists(chosen['outputPath']) and not os.path.lexists(chosen['parentCreatesPrivateFreshLaneDirectory'])
grant={'schema':'string-token-cache-parent-grant/v1','status':'GRANT_EXACT_PURE_'+mode.upper()+'_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':mode,'roles':roles,'argv':chosen['argv'],'cwd':chosen['cwd'],'environment':recipe['requiredEnvironment'],'bounds':c['bounds'],'freeBytes':free,'acPower':True,'expectedControls':{'groups':33,'pairs':353},'controlsObservedReview':role(controls_review) if controls_review else None,'currentCaptureMetadata':actual,'wholeCaptureHashPriorProvenanceOnly':True,'timedReferenceSha256':c['roles']['referenceEncoder']['sha256'],'readerSha256':c['roles']['baseline']['sha256'],'rootPidBecomesHelperPid':os.getpid(),'unexpectedHelperWaitIsStop':True,'gameFull109IntegrationAuthorized':False}
gp=P/(mode.upper()+'-GRANT.json');fd=os.open(gp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
Path(chosen['parentCreatesPrivateFreshLaneDirectory']).mkdir(mode=0o700)
print(json.dumps({'grant':role(gp),'helperPid':os.getpid()}),flush=True)
os.chdir(R);os.execvpe(chosen['argv'][0],chosen['argv'],dict(os.environ,**recipe['requiredEnvironment']))
