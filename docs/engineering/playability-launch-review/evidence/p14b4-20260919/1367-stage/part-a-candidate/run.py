from pathlib import Path
import subprocess,json,hashlib,os,sys,time
s=Path(__file__).resolve().parent;t=s/'tree';r=Path('/Users/zacheryspector/The-Movies-headless-program')
mode=sys.argv[1];assert mode in ['types','focused'];out=s/(mode+'-'+sys.argv[2]);out.mkdir()
pins=json.loads((s/'SOURCE-PINS.json').read_text())
manual=json.loads(Path('/Users/zacheryspector/studio-scratch/1367-regression-runner/new-input-pins.json').read_text())
def guard():
 for name,sha in pins['files'].items():assert hashlib.sha256((t/name).read_bytes()).hexdigest()==sha,name
 for name,sha in manual.items():assert hashlib.sha256((r/name).read_bytes()).hexdigest()==sha,name
 return {'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip(),'diff':hashlib.sha256(subprocess.check_output(['git','diff','HEAD','--','src','tests','generated','bridge','ui','scripts'],cwd=r)).hexdigest(),'index':hashlib.sha256(Path(subprocess.check_output(['git','rev-parse','--path-format=absolute','--git-path','index'],cwd=r,text=True).strip()).read_bytes()).hexdigest(),'candidatePinsSha256':hashlib.sha256((s/'SOURCE-PINS.json').read_bytes()).hexdigest(),'manual':manual}
before=guard();node='node'
files=['tests/p14d1-rival-shelving.test.ts','tests/p14d2-binding-cash.test.ts','tests/p14d2-a8-binding-cash.test.ts','tests/p15c2-legacy-lens-shape.test.ts','tests/save-masked-downgrade-own-era.test.ts','tests/save-v36-extension-own-era.test.ts']
cmd=[node,'node_modules/typescript/bin/tsc','-p','tsconfig.part-a.json'] if mode=='types' else [node,'node_modules/vitest/vitest.mjs','run','--project','core',*files,'--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--reporter=verbose']
cmd=['python3','/Users/zacheryspector/studio-scratch/1361-capture-runner/bounded-child.py','330',*cmd]
env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];start=time.monotonic()
with (out/'output.txt').open('x') as f:result=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
after=guard();assert before==after
(out/'result.json').write_text(json.dumps({'mode':mode,'command':cmd,'exitCode':result.returncode,'elapsedSeconds':time.monotonic()-start,'before':before,'after':after,'allGuardsExact':True,'sourceScope':'isolated Part A candidate; original published source remains unchanged'},indent=2)+'\n')
print(json.dumps({'mode':mode,'exitCode':result.returncode,'allGuardsExact':True,'result':str(out/'result.json')}));sys.exit(result.returncode)
