from pathlib import Path
import subprocess,json,hashlib,os,sys,time
p=Path(__file__).resolve().parent;s=p.parent;t=p/'candidate';root=Path('/Users/zacheryspector/The-Movies-headless-program')
mode=sys.argv[1];assert mode in ['types','behavior','adapter'];out=p/('consumer-'+mode+'-r1');out.mkdir()
raw=(p/'SOURCE-PINS-consumer.json').read_bytes();pins=json.loads(raw);wrapper=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();extra=json.loads((s/'1367-recovery-tests-integrated-prep/new-input-pins.json').read_text())
extra.update({ 'tests/fixtures/p14/genuine-v26-renewal196-1368/MANIFEST.json':'d377c3bd3ce25cc91ef9e0b6778f576a3df1274dcdd0daed706081b5a63205ca', 'tests/fixtures/p14/genuine-v26-renewal196-1368/genuine-v26-week196.json.gz':'195651d9501df2e65ca97eb736862e8ea5eab9433c780541ef79821ffdd20dd2'})
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
head=git('rev-parse','HEAD');index=Path(git('rev-parse','--git-path','index'));index=index if index.is_absolute() else root/index;indexHash=hashlib.sha256(index.read_bytes()).hexdigest()
diffHash=hashlib.sha256(subprocess.check_output(['git','diff','--no-ext-diff','HEAD','--binary'],cwd=root)).hexdigest()
def check():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 for n,h in extra.items():assert hashlib.sha256((root/n).read_bytes()).hexdigest()==h,n
 assert (p/'SOURCE-PINS-consumer.json').read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==wrapper
 assert hashlib.sha256(subprocess.check_output(['git','diff','--no-ext-diff','HEAD','--binary'],cwd=root)).hexdigest()==diffHash
 assert git('rev-parse','HEAD')==head
 assert hashlib.sha256(index.read_bytes()).hexdigest()==indexHash
check();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
cmd=['node','node_modules/typescript/bin/tsc','-p','tsconfig.renewal-consumer.json'] if mode=='types' else ['node','node_modules/vitest/vitest.mjs','run','--project','core','tests/p14d2-rival-cost-cutting'+('-adapter' if mode=='adapter' else '')+'.test.ts','--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--reporter=verbose']
if mode=='behavior':cmd+=['--testNamePattern','blocks a new renewal']
cmd=['python3',str(s/'1361-capture-runner/bounded-child.py'),'330',*cmd];start=time.monotonic()
with (out/'output.txt').open('x') as f:r=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
check();result={'mode':mode,'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'command':cmd,'pinsSha256':hashlib.sha256(raw).hexdigest(),'wrapperSha256':wrapper,'head':head,'indexSha256':indexHash,'liveDiffSha256':diffHash,'additionalFixturePins':extra,'allFilesExactBeforeAfter':True};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(r.returncode)
