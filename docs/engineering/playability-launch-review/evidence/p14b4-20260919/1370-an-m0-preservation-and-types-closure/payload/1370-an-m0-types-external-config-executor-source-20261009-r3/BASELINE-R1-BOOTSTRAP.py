#!/usr/bin/env python3
"""Unrun SHA-authenticated M0 typecheck collection child bootstrap; outer recorder required."""
import hashlib,json,math,os,pathlib,signal,stat,sys,time
start=time.monotonic()
def remaining_from(start, now):
 assert type(start) in (int,float) and math.isfinite(float(start)),'invalid launch start'
 elapsed=now-start
 assert math.isfinite(elapsed) and 0<=elapsed<300,'expired/future launch start'
 return 300-elapsed
signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('300-second whole-child typecheck')))
signal.setitimer(signal.ITIMER_REAL,remaining_from(start,time.monotonic()))
assert len(sys.argv)==4,'exact context hash / context path / runner hash required'
P=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-an-m0-types-external-config-executor-source-20261009-r1')
runner=P/'runner.py'
context=pathlib.Path(sys.argv[2])
def ident(st):return st.st_dev,st.st_ino,st.st_mode
def attrs(st):return st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns
def read_pin(path,pin,cap):
 assert path.is_absolute()
 parent=os.open('/',os.O_RDONLY|os.O_DIRECTORY)
 held=[parent]
 try:
  for part in path.parts[1:-1]:
   assert part not in ('','.','..')
   before=os.stat(part,dir_fd=parent,follow_symlinks=False)
   assert stat.S_ISDIR(before.st_mode)
   child=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
   assert ident(before)==ident(os.fstat(child))==ident(os.stat(part,dir_fd=parent,follow_symlinks=False))
   held.append(child);parent=child
  before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   assert attrs(before)==attrs(os.fstat(fd))
   data=bytearray()
   while True:
    assert time.monotonic()-start<300
    part=os.read(fd,min(65536,cap+1-len(data)))
    if not part:break
    data.extend(part)
    assert len(data)<=cap and len(data)<=before.st_size
   assert len(data)==before.st_size and attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False))
  finally:os.close(fd)
  for i,part in enumerate(path.parts[1:-1]):
   assert ident(os.fstat(held[i+1]))==ident(os.stat(part,dir_fd=held[i],follow_symlinks=False))
  raw=bytes(data)
  assert hashlib.sha256(raw).hexdigest()==pin,path
  return raw
 finally:
  for item in reversed(held):os.close(item)
raw=read_pin(context,sys.argv[1],128*1024)
authority=json.loads(raw)
source=read_pin(runner,sys.argv[3],250000)
exec(compile(source,str(runner),'exec'),{'__name__':'__main__','__file__':str(runner),'_BOOTSTRAP_START':start,'_AUTHORITY':authority})
