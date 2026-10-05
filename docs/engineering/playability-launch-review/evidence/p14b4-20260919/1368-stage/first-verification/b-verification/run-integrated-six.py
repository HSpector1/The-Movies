from pathlib import Path
import subprocess,json,hashlib,os,sys,time
p=Path(__file__).resolve().parent;s=p.parent;t=s/'1367-recovery-integrated-candidate/candidate';root=Path('/Users/zacheryspector/The-Movies-headless-program')
mode='integrated-fixed-six';out=p/(mode+'-r1');out.mkdir()
raw=(p/'source-pins.json').read_bytes();pins=json.loads(raw);wrapper=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();extra=json.loads((s/'1367-part-a-candidate/MANUAL-week77.json').read_text());extra.update(json.loads((s/'1367-recovery-tests-integrated-prep/new-input-pins.json').read_text()))
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
head=git('rev-parse','HEAD');index=Path(git('rev-parse','--git-path','index'));index=index if index.is_absolute() else root/index;indexHash=hashlib.sha256(index.read_bytes()).hexdigest()
def check():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 for n,h in extra.items():assert hashlib.sha256((root/n).read_bytes()).hexdigest()==h,n
 assert (p/'source-pins.json').read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==wrapper
 assert git('rev-parse','HEAD')==head
 assert hashlib.sha256(index.read_bytes()).hexdigest()==indexHash
check();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
files=['tests/p14d1-rival-shelving.test.ts','tests/p14d2-binding-cash.test.ts','tests/p14d2-a8-binding-cash.test.ts','tests/p15c2-legacy-lens-shape.test.ts','tests/save-masked-downgrade-own-era.test.ts','tests/save-v36-extension-own-era.test.ts']
cmd=['python3',str(s/'1361-capture-runner/bounded-child.py'),'330','node','node_modules/vitest/vitest.mjs','run','--project','core',*files,'--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--reporter=verbose'];start=time.monotonic()
with (out/'output.txt').open('x') as f:r=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
check();result={'mode':mode,'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'command':cmd,'pinsSha256':hashlib.sha256(raw).hexdigest(),'wrapperSha256':wrapper,'head':head,'indexSha256':indexHash,'additionalFixturePins':extra,'allFilesExactBeforeAfter':True};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(r.returncode)
