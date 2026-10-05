from pathlib import Path
import importlib.util,subprocess,json,os,hashlib,time,sys
r=Path(__file__).resolve().parent
p=r.parent/'1368-postrelease-prep-v2/run-delayed.py'
spec=importlib.util.spec_from_file_location('reviewed',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
pin='c3e4c708427906a6fac414ba5c3fbfde8e751277690e9b7a1c99b3b323869976'
before={'archive':m.verify_archive(),'helpers':m.verify_prep(pin)}
(r/'TYPE-SOURCE-PINS-v2-r2.json').write_text(json.dumps(before,indent=2)+'\n')
head=m.git('rev-parse','HEAD');idx=Path(m.git('rev-parse','--git-path','index').decode().strip());idx=idx if idx.is_absolute() else m.R/idx;ih=m.sha(idx);diff=m.git('diff','--no-ext-diff','HEAD','--binary');selfhash=m.sha(__file__)
out=r/'types-v2-r2';out.mkdir()
env=dict(os.environ,PATH=str(m.NODE)+os.pathsep+os.environ.get('PATH',''))
cmd=['python3',str(r.parent/'1361-capture-runner/bounded-child.py'),'330','./tree/node_modules/.bin/tsc','--project','tsconfig.postrelease.json','--noEmit'];start=time.monotonic()
with (out/'output.txt').open('x') as f:c=subprocess.run(cmd,cwd=r,env=env,stdout=f,stderr=subprocess.STDOUT)
assert before=={'archive':m.verify_archive(),'helpers':m.verify_prep(pin)}
assert head==m.git('rev-parse','HEAD') and ih==m.sha(idx) and diff==m.git('diff','--no-ext-diff','HEAD','--binary') and selfhash==m.sha(__file__)
result={'exitCode':c.returncode,'elapsedSeconds':time.monotonic()-start,'head':head.decode().strip(),'allGuardsExact':True,'command':cmd,'wrapperSha256':selfhash,'pinFileSha256':m.sha(r/'TYPE-SOURCE-PINS-v2-r2.json')}
(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(c.returncode)
