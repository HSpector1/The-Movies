from pathlib import Path
import subprocess,json,hashlib,os,time,sys
p=Path(__file__).resolve().parent;r=Path('/Users/zacheryspector/The-Movies-headless-program');s=p.parent
raw=(p/'ASSEMBLY.json').read_bytes();a=json.loads(raw);sha=lambda b:hashlib.sha256(b).hexdigest();wrapper=sha(Path(__file__).read_bytes())
def git(*args):return subprocess.check_output(['git',*args],cwd=r)
head=git('rev-parse','HEAD');idx=Path(git('rev-parse','--git-path','index').decode().strip());idx=idx if idx.is_absolute() else r/idx;ix=sha(idx.read_bytes());diff=sha(git('diff','--no-ext-diff','HEAD','--binary'))
def check():
 assert (p/'ASSEMBLY.json').read_bytes()==raw and sha(Path(__file__).read_bytes())==wrapper
 assert git('rev-parse','HEAD')==head and sha(idx.read_bytes())==ix and sha(git('diff','--no-ext-diff','HEAD','--binary'))==diff
 for variants in a['arms'].values():
  for v in variants.values():
   for n,h in v['files'].items():assert sha((Path(v['root'])/n).read_bytes())==h,n
check();out=p/'types-r1';out.mkdir();env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+env['PATH'];assert subprocess.check_output(['node','--version'],env=env,text=True).strip()=='v20.20.2'
rows=[]
for arm,variants in a['arms'].items():
 for mode,v in variants.items():
  check();cmd=['python3',str(s/'1361-capture-runner/bounded-child.py'),'330','node','node_modules/typescript/bin/tsc','-p','tsconfig.1368-measurement.json'];start=time.monotonic();name=arm+'-'+mode+'.txt'
  with (out/name).open('x') as f:child=subprocess.run(cmd,cwd=v['root'],env=env,stdout=f,stderr=subprocess.STDOUT)
  check();row={'arm':arm,'mode':mode,'exitCode':child.returncode,'seconds':time.monotonic()-start,'raw':name,'rawSha256':sha((out/name).read_bytes()),'command':cmd};rows.append(row);print(json.dumps(row),flush=True)
check();result={'assemblySha256':sha(raw),'wrapperSha256':wrapper,'head':head.decode().strip(),'indexSha256':ix,'diffSha256':diff,'allFilesExactBeforeAfter':True,'rows':rows};(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');sys.exit(0 if all(x['exitCode']==0 for x in rows) else 1)
