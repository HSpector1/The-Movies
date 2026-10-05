from pathlib import Path
import subprocess,json,hashlib,os,sys,time
p=Path(__file__).resolve().parent;s=p.parent;t=p/'candidate';root=Path('/Users/zacheryspector/The-Movies-headless-program')
mode=sys.argv[1];assert mode in ['types','period26','save45'];out=p/(mode+'-r2');out.mkdir()
raw=(p/'SOURCE-PINS-v2.json').read_bytes();pins=json.loads(raw);wrapper=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();extra=json.loads((s/'1367-recovery-tests-integrated-prep/new-input-pins.json').read_text())
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
head=git('rev-parse','HEAD');index=Path(git('rev-parse','--git-path','index'));index=index if index.is_absolute() else root/index;indexHash=hashlib.sha256(index.read_bytes()).hexdigest()
diffHash=hashlib.sha256(subprocess.check_output(['git','diff','--no-ext-diff','HEAD','--binary'],cwd=root)).hexdigest()
def check():
 for n,h in pins.items():assert hashlib.sha256((t/n).read_bytes()).hexdigest()==h,n
 for n,h in extra.items():assert hashlib.sha256((root/n).read_bytes()).hexdigest()==h,n
 assert (p/'SOURCE-PINS-v2.json').read_bytes()==raw
 assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==wrapper
 assert hashlib.sha256(subprocess.check_output(['git','diff','--no-ext-diff','HEAD','--binary'],cwd=root)).hexdigest()==diffHash
 assert git('rev-parse','HEAD')==head
 assert hashlib.sha256(index.read_bytes()).hexdigest()==indexHash
check();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
env.update({'P1368_MODE':mode, 'P1368_REPO':str(root), 'P1368_RECORDING_HEAD':head,
 'P1368_ARCHIVE':str(s/('1363-old-era-v26-archive-01' if mode=='period26' else '1367-recovery-integrated-candidate/base')),
 'P1368_ARCHIVE_SHA256':'942359540dafb615549c58df2cf1ea5067e1c7acd0d8df0dda24187241a67a14' if mode=='period26' else 'bc31af5423ef1912f258bcf34e887fa2f687d4675c5b3ac1e89d2eb7f21ac810',
 'P1368_QUALIFIER_SRC_SHA256':(p/'QUALIFIER-PIN.txt').read_text().strip(),
 'P1368_OUTPUT':str(s/('1368-recovery-witness-26-01' if mode=='period26' else '1368-recovery-witness-45-01'))})
cmd=['node','node_modules/typescript/bin/tsc','-p','tsconfig.1368-witness.json'] if mode=='types' else ['node','node_modules/vitest/vitest.mjs','run','--config','vitest.1368-witness.config.ts','tests/1368-recovery-witness-producer.test.ts','--reporter=verbose']
cmd=['python3',str(s/'1361-capture-runner/bounded-child.py'),'330',*cmd];start=time.monotonic()
with (out/'output.txt').open('x') as f:r=subprocess.run(cmd,cwd=t,env=env,stdout=f,stderr=subprocess.STDOUT)
check();result={'mode':mode,'producerEnvironment':{k:v for k,v in env.items() if k.startswith('P1368_')},'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'command':cmd,'pinsSha256':hashlib.sha256(raw).hexdigest(),'wrapperSha256':wrapper,'head':head,'indexSha256':indexHash,'liveDiffSha256':diffHash,'additionalFixturePins':extra,'allFilesExactBeforeAfter':True};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(r.returncode)
