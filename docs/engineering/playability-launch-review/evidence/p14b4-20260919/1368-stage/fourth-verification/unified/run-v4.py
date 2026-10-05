from pathlib import Path
import subprocess,json,hashlib,os,sys,time
p=Path(__file__).resolve().parent;s=p.parent;t=p/'tree';root=Path('/Users/zacheryspector/The-Movies-headless-program')
mode=sys.argv[1];assert mode in ['types','b-full','adapter'];out=p/(mode+'-r4');out.mkdir()
raw=(p/'SOURCE-PINS-v4.json').read_bytes();pins=json.loads(raw);wrapper=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();extra=json.loads((p/'FIXTURE-PINS.json').read_text())
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
head=git('rev-parse','HEAD');index=Path(git('rev-parse','--git-path','index'));index=index if index.is_absolute() else root/index;indexHash=hashlib.sha256(index.read_bytes()).hexdigest()
diffHash=hashlib.sha256(subprocess.check_output(['git','diff','--no-ext-diff','HEAD','--binary'],cwd=root)).hexdigest()
def check():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 for n,h in extra.items():assert hashlib.sha256((root/n).read_bytes()).hexdigest()==h,n
 assert (p/'SOURCE-PINS-v4.json').read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==wrapper
 assert hashlib.sha256(subprocess.check_output(['git','diff','--no-ext-diff','HEAD','--binary'],cwd=root)).hexdigest()==diffHash
 assert git('rev-parse','HEAD')==head
 assert hashlib.sha256(index.read_bytes()).hexdigest()==indexHash
check();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
env.update({'P1368_ACCEPTED45_ROOT':str(root/'tests/fixtures/p14/genuine-v45-recovery-witnesses-1368'),'P1368_ACCEPTED45_MANIFEST_SHA256':'11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5','P1368_ACCEPTED26_ROOT':str(root/'tests/fixtures/p13b/genuine-v26-period52-1368'),'P1368_ACCEPTED26_MANIFEST_SHA256':'8e40e51bb360ba6ff6c0d641a03e90aa8ed6f73f8c0b232a9a4b5861af358db4'})
files={'adapter':'tests/p14d2-rival-cost-cutting-adapter.test.ts','b-updated':'tests/p14d2-rival-cost-cutting.test.ts','public277':'tests/p14d2-b-public-research-1368.test.ts','b-full':'tests/p14d2-rival-cost-cutting.test.ts'}
cmd=['node','node_modules/typescript/bin/tsc','-p','tsconfig.1368-unified.json'] if mode=='types' else ['node','node_modules/vitest/vitest.mjs','run','--project','core',files[mode],'--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--reporter=verbose']
if mode=='b-updated':cmd+=['--testNamePattern','sets new Scientist staffing demand|continues an already active']
cmd=['python3',str(s/'1361-capture-runner/bounded-child.py'),'330',*cmd];start=time.monotonic()
with (out/'output.txt').open('x') as f:r=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
check();result={'mode':mode,'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'command':cmd,'pinsSha256':hashlib.sha256(raw).hexdigest(),'wrapperSha256':wrapper,'head':head,'indexSha256':indexHash,'liveDiffSha256':diffHash,'additionalFixturePins':extra,'fixtureOverrides':{k:v for k,v in env.items() if k.startswith('P1368_')},'allFilesExactBeforeAfter':True};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(r.returncode)
