from pathlib import Path
import hashlib,json,subprocess,datetime,os,gzip,sys
E=Path('docs/engineering/playability-launch-review/evidence/p14b4-20260919')
MODE,STEM=sys.argv[1:3]
CAP=int(sys.argv[3]) if len(sys.argv)>3 else 0
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(*args):return subprocess.check_output(['git',*args],env=env)
def digest(b):return {'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def pin(p):return {'path':str(p),**digest(Path(p).read_bytes())}
def write(p,d):
 with p.open('x') as f:json.dump(d,f,indent=2);f.write('\n')
old=json.loads((E/'1233-core-draft-preflight.json').read_text());source=old['sourcePaths']
# Payload paths are excluded before content reads. Explicit P14 manual pins below remain authorized.
excludedPrefixes=('tests/fixtures/','ui/e2e/','ui/public/')
def allowed(p):return not p.startswith(excludedPrefixes)

if MODE=='post':
 manual=json.loads((E/(STEM+'-preflight.json')).read_text())['manual']
else:
 manual=old['manual'][:]
 for pattern in ['1231-B-*','1231-C-*','1231-D-*','1232-C-*','1232-D-*','1232-E-*','1232-p4p5-*','1234-A-*','1234-B-*','1235-*','1236-A-*','1236-B-*','1236-C-*','1236-D-*','1236-E-*','1236-F-*','1236-G-*','1236-H-*','1236-I-*','1236-J-*','1236-K-*','1236-L-*','1249-A-*','1249-B-*','1249-C-*','1249-D-*','1249-E-*','1249-F-*','1249-G-*','1249-H-*','1249-I-*','1249-J-*','1249-K-*','1254-*','1254-status-stage/tests/*.ts','1257-*','1257-receipt-stage/tests/*.ts','1257-type-stage/tests/*.ts','1260-*','1260-*/tests/*.ts','1263-*','1263-*/tests/*.ts','1266-*','1266-*/tests/*.ts','1269-*','1269-*/tests/*.ts','1272-*','1272-*/tests/*.ts','1275-*','1275-*/tests/*.ts','1278-*','1278-*/tests/*.ts','1281-*','1281-*/tests/*.ts','1284-*','1284-*/tests/*.ts','1287-*','1287-*/tests/*.ts','1290-*','1290-*/tests/*.ts','1293-*','1293-*/tests/*.ts','1249-readonly-facts-manifest.json','1249-readonly-facts.patch','1249-retained-controls-manifest.json','1249-retained-controls.patch','1236-save-response-manifest.json','1236-save-response.patch','1236-bridge-source-manifest.json','1236-bridge-tests.patch','1239-A-*','1239-B-*','1239-C-*','1240-A-*','1240-B-*','1240-C-*','1240-D-*','1240-bridge55-*','1242-*']:
  for p in sorted(E.glob(pattern)):
   if p.is_file() and str(p) not in [v['path'] for v in manual]:manual.append(pin(p))
 for p in [E/n for n in ['975-A-c3-historical-controls-producer.ts','978-c3-historical-controls.json','978-c3-historical-controls.txt','978-c3-historical-controls.patch']]:
  if str(p) not in [v['path'] for v in manual]:manual.append(pin(p))
 for name in ['MANIFEST.json','genuine-v31-bound-open-p1.provenance.json','genuine-v31-bound-open-p1.json.gz']:
  p=Path('tests/fixtures/p14/genuine-v31-pre-b7')/name
  if str(p) not in [v['path'] for v in manual]:
   item=pin(p)
   if p.suffix=='.gz':item['raw']=digest(gzip.decompress(p.read_bytes()))
   manual.append(item)
 for name in ['MANIFEST.json','genuine-v38-p3-natural-week208.json.gz']:
  p=Path('tests/fixtures/p14/genuine-v38-pre-p3')/name
  if str(p) not in [v['path'] for v in manual]:
   item=pin(p)
   if p.suffix=='.gz':item['raw']=digest(gzip.decompress(p.read_bytes()))
   manual.append(item)
 for p in [Path('tests/fixtures/p14/genuine-pre38-validation-controls/MANIFEST.json'),Path('tests/fixtures/p14/genuine-pre38-validation-controls/reproduced-v35-c4-all-statuses-week312.json.gz'),Path('tests/fixtures/p14/genuine-v34-c4-corpus/genuine-v34-c4-all-statuses.provenance.json')]:
  if str(p) not in [v['path'] for v in manual]:
   item=pin(p)
   if p.suffix=='.gz':item['raw']=digest(gzip.decompress(p.read_bytes()))
   manual.append(item)
 manual.append(pin(E/'1052-c3-active-endurance-driver.ts'))
for p in [E/'run-bounded-source-c2.mjs',E/'run-bounded-source-guards.py']:
 if MODE=='pre' and str(p) not in [v['path'] for v in manual]:manual.append(pin(p))
for r in manual:
 assert r['path'].startswith((str(E)+'/', 'tests/fixtures/p14/')),r['path']
 assert pin(r['path'])=={k:r[k] for k in ['path','bytes','sha256']},r['path']
 if 'raw' in r:assert digest(gzip.decompress(Path(r['path']).read_bytes()))==r['raw'],r['path']
allPaths=sorted(git('ls-files','--',*source).decode().splitlines())
allowedPaths=[p for p in allPaths if allowed(p)];assert allowedPaths
files=[pin(p) for p in allowedPaths]
scope={'excludedAutomaticReadPrefixes':list(excludedPrefixes),'excludedPaths':[p for p in allPaths if not allowed(p)],'trackedPathCount':len(allPaths),'includedPathCount':len(allowedPaths),'authorizedManualInputsSeparate':True}
now={'guardScope':scope,'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':git('rev-parse','HEAD').decode().strip(),'sourcePaths':source,'sourceFiles':len(files),'sourceInventory':digest((json.dumps(files,sort_keys=True)+'\n').encode()),'manual':manual,'index':digest(Path(git('rev-parse','--git-path','index').decode().strip()).read_bytes()),'stageEntries':digest(git('ls-files','--stage','-z'))}
if MODE=='pre':
 assert git('diff','HEAD','--',*allowedPaths)==b''
 assert [p for p in git('ls-files','--others','--exclude-standard','--',*source).decode().splitlines() if allowed(p)]==[]
 now['remote']=git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts').decode().split()[0];assert now['remote']==now['head']
 now['advanceCap']=CAP
 write(E/(STEM+'-preflight.json'),now)
 print(json.dumps({k:now[k] for k in ['head','remote','sourceFiles','sourceInventory','advanceCap']}))
else:
 before=json.loads((E/(STEM+'-preflight.json')).read_text())
 for k in ['guardScope','head','sourcePaths','sourceFiles','sourceInventory','manual','index','stageEntries']:assert now[k]==before[k],k
 record=json.loads((E/(STEM+'.json')).read_text());assert record['fixedSource'] and record['sourceSha']==now['head'] and record['sourceShaAtEnd']==now['head']
 now.update({'record':pin(E/(STEM+'.json')),'raw':pin(E/(STEM+'.txt')),'patch':pin(E/(STEM+'.patch')),'fixedSource':True,'exitCode':record['exitCode'],'allGuardsExact':True})
 write(E/(STEM+'-postflight.json'),now)
 print(json.dumps({k:now[k] for k in ['head','fixedSource','exitCode','allGuardsExact','raw']}))
