#!/usr/bin/env python3
"""One fixed arm/seed/mode, under the parent's sole heavy lane. Never assemble/modify a tree.
Five completed recorder outputs plus exclusive data/. 330 s operational watchdog is not an acceptance threshold.
"""
import argparse, hashlib, json, os, re, shutil, signal, subprocess, time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--manifest-sha256',required=True);p.add_argument('--seed',required=True);p.add_argument('--mode',choices=['clean','observed','repeat'],required=True);p.add_argument('--output',required=True);a=p.parse_args()
SEEDS=['p13a-core-causal-01','seed-b','p13b-s8-bridge-probe-01','p13-public-commercial-adoption','p15a1-w2-market-01']
if a.seed not in SEEDS: raise SystemExit('fixed five seeds only')
def sha(b):return hashlib.sha256(b).hexdigest()
def no_links(path):
 for x in [path,*path.parents]:
  if x.is_symlink():raise RuntimeError('symlink path refused: '+str(x))
mp=Path(a.manifest).absolute();no_links(mp);raw=mp.read_bytes()
if sha(raw)!=a.manifest_sha256:raise SystemExit('manifest pin mismatch')
m=json.loads(raw)
if m['arm'] not in ['C0','A','AB','ABC'] or m['pressure']!='as-authored' or m['saveVersion'] not in [45,46]:raise SystemExit('wrong arm manifest')
if not m.get('sourceIdentity') or not re.fullmatch('[0-9a-f]{40}',m['publishedHead']):raise SystemExit('exact source provenance required')
variant=m['clean'] if a.mode=='clean' else m['observed'];root=Path(variant['root']).absolute();no_links(root)
out=Path(a.output).absolute();no_links(out)
if out.exists() or out.is_symlink():raise SystemExit('exclusive recorder output required')
if not out.parent.is_dir():raise SystemExit('existing external output parent required')
if root==out or root in out.parents or out in root.parents:raise SystemExit('output must be outside consumed tree')
if shutil.disk_usage(out.parent).free<5*1024**3:raise SystemExit('5 GiB free disk required')
files=variant['files'];required={'package.json','tsconfig.json','tests/1368-natural-recovery.test.ts','tests/1368-measurement-observer.ts','vitest.1368-measurement.config.ts','tsconfig.1368-measurement.json'}
if not required<=files.keys():raise SystemExit('missing consumed config/driver pins')
for rel in files:
 if not (rel.startswith('src/') or rel in required or rel in ['package-lock.json','pnpm-lock.yaml','vitest.workspace.ts']):raise SystemExit('out-of-scope automatic read: '+rel)
 if '..' in Path(rel).parts or Path(rel).is_absolute():raise SystemExit('invalid relative pin path')
actual_source=set()
for d,dirs,names in os.walk(root/'src',followlinks=False):
 for name in dirs+names:
  if (Path(d)/name).is_symlink():raise SystemExit('source symlink refused')
 for name in names:
  f=Path(d)/name
  if f.is_file():actual_source.add(f.relative_to(root).as_posix())
if actual_source!={k for k in files if k.startswith('src/')}:raise SystemExit('full source inventory mismatch')
node=Path(m['node']).absolute();entry=root/'node_modules/vitest/vitest.mjs'
if sha(node.read_bytes())!=m['nodeSha256'] or sha(entry.read_bytes())!=m['vitestEntrySha256']:raise SystemExit('runtime pin mismatch')
version=subprocess.check_output([str(node),'--version'],text=True).strip()
if version!='v20.20.2':raise SystemExit('Node v20.20.2 required')
repo=Path(m['publicationRepo']).absolute()
def guard():
 rows={}
 kit=Path(m['kitRoot']);kitrows={}
 for rel,pin in m['kitPins'].items():
  f=kit/rel;no_links(f);kitrows[rel]=sha(f.read_bytes())
  if kitrows[rel]!=pin:raise RuntimeError('producer/kit pin mismatch: '+rel)
 if Path(__file__).resolve()!=kit/'run-one.py':raise RuntimeError('wrong runner identity')
 for rel,pin in files.items():
  f=root/rel;no_links(f);actual=sha(f.read_bytes());rows[rel]=actual
  if actual!=pin:raise RuntimeError('source pin mismatch: '+rel)
 if mp.read_bytes()!=raw:raise RuntimeError('manifest changed')
 head=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip()
 if head!=m['publishedHead']:raise RuntimeError('publication HEAD changed')
 return {'kitFiles':kitrows,'manifestSha256':sha(raw),'publishedHead':head,'sourceIdentity':m['sourceIdentity'],'files':rows,'nodeVersion':version,'nodeSha256':sha(node.read_bytes()),'vitestEntrySha256':sha(entry.read_bytes())}
pre=guard();out.mkdir();(out/'source-pre.json').write_text(json.dumps(pre,indent=2)+'\n')
env=os.environ.copy();env.update(M1368_ARM=m['arm'],M1368_SEED=a.seed,M1368_MODE=a.mode,M1368_OUTPUT=str(out/'data'),M1368_ARM_MANIFEST=str(mp),M1368_ARM_MANIFEST_SHA256=sha(raw))
cmd=[str(node),str(entry),'run','--config','vitest.1368-measurement.config.ts','--no-cache','tests/1368-natural-recovery.test.ts']
started=time.monotonic();timed_out=False
with (out/'raw.txt').open('wb') as log:
 proc=subprocess.Popen(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
 try:code=proc.wait(timeout=330)
 except subprocess.TimeoutExpired:
  timed_out=True;os.killpg(proc.pid,signal.SIGTERM)
  try:code=proc.wait(timeout=5)
  except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);code=proc.wait()
exitrow={'command':cmd,'cwd':str(root),'seed':a.seed,'mode':a.mode,'childExit':code,'timedOut':timed_out,'elapsedSeconds':time.monotonic()-started}
(out/'exit.json').write_text(json.dumps(exitrow,indent=2)+'\n')
try:post=guard();guard_error=None
except Exception as e:post={'error':str(e)};guard_error=str(e)
(out/'source-post.json').write_text(json.dumps(post,indent=2)+'\n')
passed=code==0 and not timed_out and pre==post and (out/'data/summary.json').is_file()
(out/'result.json').write_text(json.dumps({**exitrow,'allGuardsExact':pre==post,'guardError':guard_error,'status':'MEASURED' if passed else 'EXECUTION-FAILURE-NOT-ABSENT','rawSha256':sha((out/'raw.txt').read_bytes())},indent=2)+'\n')
raise SystemExit(0 if passed else 1)
