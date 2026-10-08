bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 '/Users/zacheryspector/studio-scratch/1370-ebg-adoption-archive-builder-20261008-ebg-adoption-archive-r1.lane.log' python3 -I -B -c 'import hashlib,signal,stat,sys,time
from pathlib import Path
start=time.monotonic()
signal.signal(signal.SIGALRM,lambda *_: (_ for _ in ()).throw(TimeoutError("archive bootstrap deadline")))
signal.setitimer(signal.ITIMER_REAL,300)
root=Path("/Users/zacheryspector/studio-scratch/1370-ebg-adoption-archive-builder-proposal-r1")
mp=root/"MANIFEST.json";sp=root/"builder.py"
assert sys.flags.isolated and sys.dont_write_bytecode and not root.is_symlink()
for p in (mp,sp):
 s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1
mb=mp.read_bytes();source=sp.read_bytes()
assert hashlib.sha256(mb).hexdigest()=="693ef4a1616997a0a1f553d4470fa061569ce002d55dbe46cb831752c9e3213c"
assert hashlib.sha256(source).hexdigest()=="7593d3becb3958b64bb3aba5708c0d3b22702fa7b7a7aa498d8390428e8494a8"
sys.argv=[str(sp),"--run-id",sys.argv[1],"--review-sha",sys.argv[2]]
exec(compile(source,str(sp),"exec"),{"__name__":"__main__","__file__":str(sp),
 "_BOOTSTRAP_START":start,"_AUTHENTICATED_SOURCE_BYTES":source,"_AUTHENTICATED_MANIFEST_BYTES":mb})
' '20261008-ebg-adoption-archive-r1' 'ce901c33ffa0033c354a1006dcb8c14dd0b4b63115369fb6d3163a24e889b36b'
