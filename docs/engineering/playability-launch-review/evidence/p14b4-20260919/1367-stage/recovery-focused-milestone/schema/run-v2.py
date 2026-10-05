from pathlib import Path
import subprocess,json,hashlib,os,sys,time
s=Path(__file__).resolve().parent;t=s/'candidate';mode=sys.argv[1];assert mode in ['types','migration','period','pure'];out=s/(mode+'-'+sys.argv[2]);out.mkdir();raw=(s/'TEST-SOURCE-PINS-v2.json').read_bytes();pins=json.loads(raw);wrapper=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();extra=json.loads((s.parent/'1367-recovery-tests-integrated-prep/new-input-pins.json').read_text());root=Path('/Users/zacheryspector/The-Movies-headless-program')
def check():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 for n,h in extra.items():assert hashlib.sha256((root/n).read_bytes()).hexdigest()==h,n
 assert (s/'TEST-SOURCE-PINS-v2.json').read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==wrapper
check();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
cmd=['node','node_modules/typescript/bin/tsc','-p','tsconfig.schema-tests.json']
if mode!='types':
 choice={'migration':(['tests/p14d2-save46-migration.test.ts'],'^(?!.*a real disposal).*'),'period':(['tests/p13b-s8-old-era-period.test.ts'],None),'pure':(['tests/p14d2-rival-cost-cutting.test.ts'],'^(?!.*(?:the separately retained|retains a genuinely occupied|releases in employment)).*(?:1363 B1|1363 B3/B4)')}[mode]
 cmd=['node','node_modules/vitest/vitest.mjs','run','--project','core',*choice[0],'--maxWorkers=1','--minWorkers=1','--no-file-parallelism','--reporter=verbose']
 if choice[1] is not None:cmd+=['--testNamePattern',choice[1]]
cmd=['python3','/Users/zacheryspector/studio-scratch/1361-capture-runner/bounded-child.py','330',*cmd];start=time.monotonic()
with (out/'output.txt').open('x') as f:r=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
check();result={'mode':mode,'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'command':cmd,'pinsSha256':hashlib.sha256(raw).hexdigest(),'wrapperSha256':wrapper,'additionalFixturePins':extra,'allFilesExactBeforeAfter':True};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(r.returncode)
