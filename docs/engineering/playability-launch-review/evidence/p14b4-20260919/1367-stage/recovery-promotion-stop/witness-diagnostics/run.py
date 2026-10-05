from pathlib import Path
import subprocess,json,hashlib,os,sys,time
p=Path(__file__).resolve().parent;s=p.parent;owner,mode,attempt=sys.argv[1:];assert owner in ['schema','abc'] and mode in ['types','run'] and attempt in ['r1','r2'];out=p/'runs'/(owner+'-'+mode+'-'+attempt);out.mkdir()
name={'schema':'1367-recovery-schema-candidate','abc':'1367-recovery-integrated-candidate'}[owner];t=s/name/'candidate'
raw=(p/(owner+'-pins.json')).read_bytes();pins=json.loads(raw);wrapper=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();extra=json.loads((s/'1367-recovery-tests-integrated-prep/new-input-pins.json').read_text());root=Path('/Users/zacheryspector/The-Movies-headless-program')
def check():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 for n,h in extra.items():assert hashlib.sha256((root/n).read_bytes()).hexdigest()==h,n
 assert (p/(owner+'-pins.json')).read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==wrapper
check();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
file={'schema':'tests/p13b-s8-period312-diagnostic.test.ts','abc':'tests/p14d2-disposal-witness-diagnostic.test.ts'}[owner]
cmd=['node','node_modules/typescript/bin/tsc','-p','tsconfig.witness-diagnostic.json'] if mode=='types' else ['node','node_modules/vitest/vitest.mjs','run','--project','core',file,'--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--reporter=verbose']
cmd=['python3','/Users/zacheryspector/studio-scratch/1361-capture-runner/bounded-child.py','330',*cmd];start=time.monotonic()
with (out/'output.txt').open('x') as f:r=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
check();result={'owner':owner,'mode':mode,'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'command':cmd,'pinsSha256':hashlib.sha256(raw).hexdigest(),'wrapperSha256':wrapper,'additionalFixturePins':extra,'allFilesExactBeforeAfter':True};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(r.returncode)
