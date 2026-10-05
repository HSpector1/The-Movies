from pathlib import Path
import subprocess,json,hashlib,os,sys,time
s=Path(__file__).resolve().parent;r=Path('/Users/zacheryspector/The-Movies-headless-program');mode=sys.argv[1];assert mode in ['types','control','part-a'];arm='part-a' if mode=='types' else mode;t=s/arm/'tree';out=s/arm/'out';stem=mode+'-r1'
raw=(s/arm/'PINS.json').read_bytes();pins=json.loads(raw);runnerSha=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
def guard():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 assert (s/arm/'PINS.json').read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==runnerSha
 idx=Path(subprocess.check_output(['git','rev-parse','--path-format=absolute','--git-path','index'],cwd=r,text=True).strip())
 return {'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip(),'indexSha256':hashlib.sha256(idx.read_bytes()).hexdigest(),'sourceDiffSha256':hashlib.sha256(subprocess.check_output(['git','diff','HEAD','--','src','tests','bridge','ui','generated','scripts'],cwd=r)).hexdigest()}
before=guard();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2';env['BOUNDARY_ARM']=arm;env['BOUNDARY_OUTPUT']=str(out/'boundaries.json');assert not Path(env['BOUNDARY_OUTPUT']).exists()
cmd=['node','node_modules/typescript/bin/tsc','-p','tsconfig.boundary.json'] if mode=='types' else ['node','node_modules/vitest/vitest.mjs','run','--workspace','boundary.workspace.ts','--project','boundary','--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--reporter=verbose']
cmd=['python3','/Users/zacheryspector/studio-scratch/1361-capture-runner/bounded-child.py','330',*cmd];start=time.monotonic()
with (out/(stem+'.txt')).open('x') as f:result=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
after=guard();assert before==after
report={'mode':mode,'arm':arm,'exitCode':result.returncode,'elapsedSeconds':time.monotonic()-start,'pinsSha256':hashlib.sha256(raw).hexdigest(),'runnerSha256':runnerSha,'before':before,'after':after,'allGuardsExact':True,'command':cmd}
(out/(stem+'.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));sys.exit(result.returncode)
