NEUTRALITY_TYPES_AUDIT_SHA256='2c0b373753393dae964cb21aa30b02929e53749f40ab38751e530a8e1b3f328b' bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 '/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-r12-ag-p13a-clean-r12-ag-p13a-clean-20261007-1850.lane.log' python3 -I -B -c 'import time
start=time.monotonic()
import hashlib,json,os,signal,stat,sys
from pathlib import Path
assert sys.flags.isolated and sys.dont_write_bytecode
signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('"'"'external whole-leaf bootstrap deadline'"'"')))
signal.setitimer(signal.ITIMER_REAL,330)
manifest_pin,head,review_pin=sys.argv[1:4]
args=sys.argv[4:]
assert args.count('"'"'--seed'"'"')==1 and args.count('"'"'--stage'"'"')==1 and args.count('"'"'--arm'"'"')==1 and args.count('"'"'--run-id'"'"')==1
seed=args[args.index('"'"'--seed'"'"')+1];stage=args[args.index('"'"'--stage'"'"')+1]
assert seed in ('"'"'p13a-core-causal-01'"'"','"'"'p13-public-commercial-adoption'"'"') and stage in ('"'"'types'"'"','"'"'clean'"'"')
cap=330 if stage=='"'"'types'"'"' or seed=='"'"'p13a-core-causal-01'"'"' else 750
signal.setitimer(signal.ITIMER_REAL,max(.001,start+cap-time.monotonic()))
root=Path('"'"'/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-proposal-r12'"'"')
review=Path('"'"'/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-independent-review-r12/RECEIPT.json'"'"')
cmdpath=Path('"'"'/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-proposal-r12.EXACT-LANE-COMMANDS.txt'"'"')
sha=lambda raw:hashlib.sha256(raw).hexdigest()
assert not root.is_symlink()
mp=root/'"'"'MANIFEST.json'"'"';assert stat.S_ISREG(mp.lstat().st_mode) and mp.stat().st_nlink==1
mb=mp.read_bytes();assert sha(mb)==manifest_pin
m=json.loads(mb);assert m['"'"'schema'"'"']=='"'"'1370-ag-e0g-full-state-clean-r12'"'"' and m['"'"'head'"'"']==head
files={};dirs=[];links={};raw={}
for base,sub,names in os.walk(root,followlinks=False):
 folder=Path(base)
 for name in list(sub):
  p=folder/name;rel=p.relative_to(root).as_posix();mode=p.lstat().st_mode
  if stat.S_ISLNK(mode):links[rel]=os.readlink(p);sub.remove(name)
  else:assert stat.S_ISDIR(mode);dirs.append(rel)
 for name in names:
  p=folder/name;rel=p.relative_to(root).as_posix();mode=p.lstat().st_mode
  if stat.S_ISLNK(mode):links[rel]=os.readlink(p)
  else:
   assert stat.S_ISREG(mode) and p.stat().st_nlink==1
   if rel!='"'"'MANIFEST.json'"'"':
    data=p.read_bytes();files[rel]=sha(data)
    if rel=='"'"'outer.py'"'"':raw[rel]=data
assert {'"'"'files'"'"':files,'"'"'directories'"'"':sorted(dirs),'"'"'links'"'"':links}==m['"'"'inventory'"'"']
assert stat.S_ISREG(review.lstat().st_mode) and review.stat().st_nlink==1
rb=review.read_bytes();assert sha(rb)==review_pin
cmdsha=sha(cmdpath.read_bytes())
assert json.loads(rb)=={'"'"'decision'"'"':'"'"'ACCEPT_STATIC_CLEAN_ONLY'"'"','"'"'manifestSha256'"'"':manifest_pin,'"'"'runnerSha256'"'"':files['"'"'runner.py'"'"'],'"'"'outerSha256'"'"':files['"'"'outer.py'"'"'],'"'"'commandSha256'"'"':cmdsha}
os.environ.update({'"'"'NEUTRALITY_MANIFEST_SHA256'"'"':manifest_pin,'"'"'NEUTRALITY_REVIEW_SHA256'"'"':review_pin,'"'"'NEUTRALITY_COMMAND_SHA256'"'"':cmdsha})
sys.argv=[str(root/'"'"'outer.py'"'"'),*args]
exec(compile(raw['"'"'outer.py'"'"'],str(root/'"'"'outer.py'"'"'),'"'"'exec'"'"'),{'"'"'__name__'"'"':'"'"'__main__'"'"','"'"'__file__'"'"':str(root/'"'"'outer.py'"'"'),
 '"'"'_AUTHENTICATED_OUTER_BYTES'"'"':raw['"'"'outer.py'"'"'],'"'"'_AUTHENTICATED_MANIFEST_BYTES'"'"':mb,
 '"'"'_AUTHENTICATED_REVIEW_BYTES'"'"':rb,'"'"'_BOOTSTRAP_START'"'"':start})' ed8826f5cdf563c4aceee2fc6a22dbe2263f6f705f43ec622cff281a52d9f703 b995a83e5363a3843f9b902e08c2df4dd95840cb 'a18026f9e5bff44945d956a548c5f80c19771f82bfab4d70b564eee77d9a9896' --arm AG --seed p13a-core-causal-01 --stage clean --run-id 'r12-ag-p13a-clean-20261007-1850'
