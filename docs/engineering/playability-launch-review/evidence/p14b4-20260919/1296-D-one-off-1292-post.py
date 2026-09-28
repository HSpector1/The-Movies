from pathlib import Path
import hashlib,json,subprocess,datetime,os,gzip
E=Path('docs/engineering/playability-launch-review/evidence/p14b4-20260919');STEM='1292-scenery-capacity-runtime';env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(*a):return subprocess.check_output(['git',*a],env=env)
def dig(b):return {'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def pin(p):return {'path':str(p),**dig(Path(p).read_bytes())}
pre=json.loads((E/(STEM+'-preflight.json')).read_text());rec=json.loads((E/(STEM+'.json')).read_text())
head=git('rev-parse','HEAD').decode().strip();assert head==pre['head']==pre['remote']==rec['sourceSha']==rec['sourceShaAtEnd']=='d2f55dd93ca9e3f9c11ca1287bada47788b5cedf'
excludedPrefixes=('tests/fixtures/','ui/e2e/')
manual=pre['manual']
for r in manual:
 assert r['path'].startswith((str(E)+'/', 'tests/fixtures/p14/')),r['path']
 assert pin(r['path'])=={k:r[k] for k in ['path','bytes','sha256']},r['path']
 if 'raw' in r:assert dig(gzip.decompress(Path(r['path']).read_bytes()))==r['raw']
paths=sorted(git('ls-files','--',*pre['sourcePaths']).decode().splitlines())
assert len(paths)==pre['sourceFiles']==1693
excluded=[p for p in paths if p.startswith(excludedPrefixes)];allowed=[p for p in paths if not p.startswith(excludedPrefixes)]
files=[]
for p in allowed:
 b=Path(p).read_bytes();assert b==git('show',head+':'+p),p;files.append({'path':p,**dig(b)})
index=dig(Path(git('rev-parse','--git-path','index').decode().strip()).read_bytes());stage=dig(git('ls-files','--stage','-z'));assert index==pre['index'] and stage==pre['stageEntries']
assert rec['fixedSource'] and rec['exitCode']==0 and rec['error'] is None and rec['signal'] is None
now={'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'sourcePaths':pre['sourcePaths'],'sourceFiles':len(paths),'manual':manual,'index':index,'stageEntries':stage,'record':pin(E/(STEM+'.json')),'raw':pin(E/(STEM+'.txt')),'patch':pin(E/(STEM+'.patch')),'fixedSource':True,'exitCode':0,'allGuardsExact':False,'boundedGuardsExact':True,'guardScope':{'excludedAutomaticReadPrefixes':list(excludedPrefixes),'excludedPathCount':len(excluded),'excludedPaths':excluded,'verifiedFileCount':len(files),'verifiedFiles':files,'verifiedInventory':dig((json.dumps(files,sort_keys=True)+'\n').encode()),'comparison':'Each included working-tree file equals its complete executed-HEAD image; authorized manual pins and decoded P14 inputs match preflight; index and stage are exact.','unverified':'The original all-files preflight inventory was deliberately not recomputed; excluded payload content is not requalified. Original preflight already hashed these files, including Owner-derived fixtures. This access-boundary mistake is retained and disclosed, not erased by passing Q24.','legacyPreflightSourceInventory':pre['sourceInventory']}}
with (E/(STEM+'-postflight.json')).open('x') as f:json.dump(now,f,indent=2);f.write('\n')
print(json.dumps({'head':head,'exitCode':0,'boundedGuardsExact':True,'allGuardsExact':False,'manualPins':len(manual),'allowedFiles':len(allowed),'excludedPaths':len(excluded),'raw':now['raw'],'inventory':now['guardScope']['verifiedInventory']}))
