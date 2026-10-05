from pathlib import Path
import subprocess,json,hashlib,os,sys,time
s=Path(__file__).resolve().parent;t=s/'candidate';out=s/'test-types-r1';out.mkdir();raw=(s/'TEST-SOURCE-PINS.json').read_bytes();pins=json.loads(raw);wrapper=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
def check():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 assert (s/'TEST-SOURCE-PINS.json').read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==wrapper
check();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
cmd=['python3','/Users/zacheryspector/studio-scratch/1361-capture-runner/bounded-child.py','330','node','node_modules/typescript/bin/tsc','-p','tsconfig.recovery-tests.json'];start=time.monotonic()
with (out/'output.txt').open('x') as f:r=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
check();result={'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'command':cmd,'pinsSha256':hashlib.sha256(raw).hexdigest(),'wrapperSha256':wrapper,'allFilesExactBeforeAfter':True};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(r.returncode)
