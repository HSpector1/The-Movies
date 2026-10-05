#!/usr/bin/env python3
"""One fixed arm/seed/mode under the parent's sole heavy lane. No tree modifications.
Five recorder outputs plus data/ and the exact-test JSON. 330 s is an operational watchdog.
"""
import argparse, hashlib, json, os, re, shutil, signal, subprocess, time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--manifest-sha256',required=True);p.add_argument('--seed',required=True);p.add_argument('--mode',choices=['clean','observed','repeat'],required=True);p.add_argument('--output',required=True);a=p.parse_args()
SEEDS=['p13a-core-causal-01','seed-b','p13b-s8-bridge-probe-01','p13-public-commercial-adoption','p15a1-w2-market-01']
if a.seed not in SEEDS:raise SystemExit('fixed five seeds only')
sha=lambda b:hashlib.sha256(b).hexdigest()
def no_links(path):
 for x in [path,*path.parents]:
  if x.is_symlink():raise RuntimeError('symlink path refused: '+str(x))
mp=Path(a.manifest).absolute();no_links(mp);raw=mp.read_bytes()
if sha(raw)!=a.manifest_sha256:raise SystemExit('manifest pin mismatch')
m=json.loads(raw)
if m['arm'] not in ['C0','A','AB','ABC'] or m['pressure']!='as-authored' or m['saveVersion'] not in [45,46]:raise SystemExit('wrong arm manifest')
if not m.get('sourceIdentity') or not re.fullmatch('[0-9a-f]{40}',m['publishedHead']):raise SystemExit('exact source provenance required')
variant=m['clean'] if a.mode=='clean' else m['observed'];root=Path(variant['root']).absolute();no_links(root)
repo=Path(m['publicationRepo']).absolute();kit=Path(m['kitRoot']).absolute();out=Path(a.output).absolute();no_links(out)
if out.exists() or out.is_symlink():raise SystemExit('exclusive recorder output required')
if not out.parent.is_dir():raise SystemExit('existing external output parent required')
for consumed in [repo,kit,Path(m['clean']['root']).absolute(),Path(m['observed']['root']).absolute()]:
 no_links(consumed)
 if consumed==out or consumed in out.parents or out in consumed.parents:raise SystemExit('output overlaps publication/source/kit tree')
if shutil.disk_usage(out.parent).free<5*1024**3:raise SystemExit('5 GiB free disk required')
files=variant['files'];required={'package.json','tsconfig.json','tests/1368-natural-recovery.test.ts','tests/1368-measurement-observer.ts','vitest.1368-measurement.config.ts','vitest.1368-measurement.workspace.ts','tsconfig.1368-measurement.json'}
if not required<=files.keys():raise SystemExit('missing consumed config/driver pins')
for rel in files:
 if not (rel.startswith('src/') or rel in required or rel in ['package-lock.json','pnpm-lock.yaml','vitest.workspace.ts']):raise SystemExit('out-of-scope automatic read: '+rel)
 if '..' in Path(rel).parts or Path(rel).is_absolute():raise SystemExit('invalid relative pin path')
def source_inventory():
 actual=set()
 for d,dirs,names in os.walk(root/'src',followlinks=False):
  for name in dirs+names:
   if (Path(d)/name).is_symlink():raise RuntimeError('source symlink refused')
  for name in names:
   f=Path(d)/name
   if f.is_file():actual.add(f.relative_to(root).as_posix())
 if actual!={k for k in files if k.startswith('src/')}:raise RuntimeError('full source inventory mismatch')
 return sorted(actual)
node=Path(m['node']).absolute();entry=root/'node_modules/vitest/vitest.mjs'
if sha(node.read_bytes())!=m['nodeSha256'] or sha(entry.read_bytes())!=m['vitestEntrySha256']:raise SystemExit('runtime pin mismatch')
version=subprocess.check_output([str(node),'--version'],text=True).strip()
if version!='v20.20.2':raise SystemExit('Node v20.20.2 required')
gitenv={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(*args):return subprocess.check_output(['git','-C',str(repo),*args],env=gitenv)
# Exact established bounded recorder scope. Exclude payload paths BEFORE content reads.
SOURCE=['src','bridge','tests','ui','generated','scripts','package.json','package-lock.json','vitest.config.ts','vitest.workspace.ts','tsconfig.json','tsconfig.bridge.json','tsconfig.src.json']
EXCLUDED=('tests/fixtures/','ui/e2e/','ui/public/')
def publication_guard():
 head=git('rev-parse','HEAD').decode().strip()
 if head!=m['publishedHead']:raise RuntimeError('publication HEAD changed')
 paths=sorted(x for x in git('ls-files','--',*SOURCE).decode().splitlines() if not x.startswith(EXCLUDED))
 if not paths:raise RuntimeError('empty publication source inventory')
 diff=git('diff','HEAD','--binary','--',*paths)
 untracked=sorted(x for x in git('ls-files','--others','--exclude-standard','--',*SOURCE).decode().splitlines() if not x.startswith(EXCLUDED))
 if diff or untracked:raise RuntimeError('publication gameplay source must be clean; docs-only dirt is not gameplay')
 idx=Path(git('rev-parse','--git-path','index').decode().strip());idx=idx if idx.is_absolute() else repo/idx
 return {'head':head,'includedPaths':paths,'excludedAutomaticReadPrefixes':list(EXCLUDED),'boundedDiffSha256':sha(diff),'untrackedSource':untracked,'indexSha256':sha(idx.read_bytes()),'stageEntriesSha256':sha(git('ls-files','--stage','-z'))}
def guard():
 inventory=source_inventory();rows={};kitrows={}
 for rel,pin in m['kitPins'].items():
  if Path(rel).is_absolute() or '..' in Path(rel).parts:raise RuntimeError('invalid kit path')
  f=kit/rel;no_links(f);kitrows[rel]=sha(f.read_bytes())
  if kitrows[rel]!=pin:raise RuntimeError('producer/kit pin mismatch: '+rel)
 if Path(__file__).resolve()!=kit/'run-one.py':raise RuntimeError('wrong runner identity')
 for rel,pin in files.items():
  f=root/rel;no_links(f);rows[rel]=sha(f.read_bytes())
  if rows[rel]!=pin:raise RuntimeError('source pin mismatch: '+rel)
 if mp.read_bytes()!=raw:raise RuntimeError('manifest changed')
 return {'kitFiles':kitrows,'manifestSha256':sha(raw),'publication':publication_guard(),'sourceIdentity':m['sourceIdentity'],'inventory':inventory,'files':rows,'nodeVersion':version,'nodeSha256':sha(node.read_bytes()),'vitestEntrySha256':sha(entry.read_bytes())}
pre=guard();out.mkdir();(out/'source-pre.json').write_text(json.dumps(pre,indent=2)+'\n')
env=os.environ.copy();env.update(M1368_ARM=m['arm'],M1368_SEED=a.seed,M1368_MODE=a.mode,M1368_OUTPUT=str(out/'data'),M1368_ARM_MANIFEST=str(mp),M1368_ARM_MANIFEST_SHA256=sha(raw))
cmd=[str(node),str(entry),'run','--config','vitest.1368-measurement.config.ts','--workspace','vitest.1368-measurement.workspace.ts','--project','core','--no-cache','--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--pool=forks','--reporter=verbose','--reporter=json','--outputFile='+str(out/'test-report.json'),'tests/1368-natural-recovery.test.ts']
started=time.monotonic();timed_out=False;cleanup=[]
def group_alive(pgid):
 try:os.killpg(pgid,0);return True
 except ProcessLookupError:return False
def group_signal(pgid,sig):
 try:os.killpg(pgid,sig);cleanup.append(signal.Signals(sig).name)
 except ProcessLookupError:cleanup.append('already-exited')
with (out/'raw.txt').open('wb') as log:
 proc=subprocess.Popen(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
 try:code=proc.wait(timeout=330)
 except subprocess.TimeoutExpired:
  timed_out=True;group_signal(proc.pid,signal.SIGTERM);deadline=time.monotonic()+5
  while time.monotonic()<deadline and group_alive(proc.pid):
   proc.poll();time.sleep(.05)
  if group_alive(proc.pid):group_signal(proc.pid,signal.SIGKILL)
  code=proc.wait()
 # A normally-exited leader also cannot leave its owned worker group running.
 if group_alive(proc.pid):
  group_signal(proc.pid,signal.SIGTERM);deadline=time.monotonic()+5
  while time.monotonic()<deadline and group_alive(proc.pid):time.sleep(.05)
  if group_alive(proc.pid):group_signal(proc.pid,signal.SIGKILL)
 deadline=time.monotonic()+5
 while group_alive(proc.pid) and time.monotonic()<deadline:time.sleep(.05)
 group_remaining=group_alive(proc.pid)
exitrow={'groupRemainingAfterCleanup':group_remaining,'command':cmd,'cwd':str(root),'arm':m['arm'],'seed':a.seed,'mode':a.mode,'childExit':code,'timedOut':timed_out,'cleanupSignals':cleanup,'manifestSha256':sha(raw),'elapsedSeconds':time.monotonic()-started}
(out/'exit.json').write_text(json.dumps(exitrow,indent=2)+'\n')
try:post=guard();guard_error=None
except Exception as e:post={'error':str(e)};guard_error=str(e)
(out/'source-post.json').write_text(json.dumps(post,indent=2)+'\n')
selection=False;report_sha=None
selection_error=None
try:
 if (out/'test-report.json').is_file():
  reportbytes=(out/'test-report.json').read_bytes();report_sha=sha(reportbytes);report=json.loads(reportbytes)
  results=report.get('testResults',[]);assertions=[x for r in results for x in r.get('assertionResults',[])]
  selection=report.get('numTotalTests')==1 and len(results)==1 and len(assertions)==1 and results[0]['name']==str(root/'tests/1368-natural-recovery.test.ts') and assertions[0].get('title')=='1368 fixed natural recovery measurement'
except Exception as e:selection_error=str(e)
expected_data=['summary.json','weekly.jsonl','money.jsonl','receipts.jsonl','research.jsonl','annual.json','timing.json']+([] if a.mode=='clean' else ['branches.jsonl'])
data={}
for name in expected_data:
 f=out/'data'/name
 if f.is_file() and not f.is_symlink():b=f.read_bytes();data[name]={'sha256':sha(b),'bytes':len(b)}
passed=code==0 and not timed_out and not group_remaining and pre==post and selection and set(data)==set(expected_data)
result={**exitrow,'runnerSha256':sha(Path(__file__).read_bytes()),'allGuardsExact':pre==post,'guardError':guard_error,'exactOneTestSelected':selection,'selectionError':selection_error,'testReportSha256':report_sha,'dataFiles':data,'status':'MEASURED' if passed else 'EXECUTION-FAILURE-NOT-ABSENT','rawSha256':sha((out/'raw.txt').read_bytes()),'sourcePreSha256':sha((out/'source-pre.json').read_bytes()),'sourcePostSha256':sha((out/'source-post.json').read_bytes())}
(out/'result.json').write_text(json.dumps(result,indent=2)+'\n')
raise SystemExit(0 if passed else 1)
