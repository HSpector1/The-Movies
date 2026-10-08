#!/usr/bin/env python3
"""Unrun SHA-authenticated H typecheck collection child bootstrap; outer recorder required."""
import hashlib,json,math,os,pathlib,signal,stat,sys,time
start=time.monotonic()
def remaining_from(start, now):
 assert type(start) in (int,float) and math.isfinite(float(start)),'invalid launch start'
 elapsed=now-start
 assert math.isfinite(elapsed) and 0<=elapsed<300,'expired/future launch start'
 return 300-elapsed
signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('300-second whole-child typecheck')))
signal.setitimer(signal.ITIMER_REAL,remaining_from(start,time.monotonic()))
assert len(sys.argv)==3,'exact binding/review SHA arguments required'
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-h-typecheck-collection-runner-proposal-r13'
runner=P/'runner.py'
binding=S/'1370-c0-h-typecheck-collection-filled-exact-r13/BINDING.json'
review=S/'1370-c0-h-typecheck-r13-source-independent-static-review-r1/RECEIPT.json'
pins={runner:'946b3c88208db5128e30e668d0e322f11224235a71ff6994362acb124e0831b7',binding:sys.argv[1],review:sys.argv[2]}
assert all(len(v)==64 and set(v)<=set('0123456789abcdef') for v in pins.values()),'unfilled exact SHA pin'
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
raw={p:read_pin(p,h,250000) for p,h in pins.items()}
assert json.loads(raw[review])['decision']=='ACCEPT_STATIC_H_TYPECHECK_COLLECTION_SOURCE_ONLY'
assert json.loads(raw[review])['sourcePins']['runner.py']['sha256']==pins[runner]
assert json.loads(raw[binding])['fullReadbackObservedReceiptSha256']=='35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a'
assert json.loads(raw[binding])['runId']=='20261008-h-types-r11'
sys.argv=[str(runner),'--binding',str(binding),'--binding-sha',pins[binding]]
exec(compile(raw[runner],str(runner),'exec'),{'__name__':'__main__','__file__':str(runner),'_BOOTSTRAP_START':start})
