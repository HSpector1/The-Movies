#!/usr/bin/env python3
"""Unrun SHA-authenticated H bridge readback child bootstrap; outer recorder required."""
import hashlib,json,math,os,pathlib,signal,stat,sys,time
start=time.monotonic()
def remaining_from(start, now):
 assert type(start) in (int,float) and math.isfinite(float(start)),'invalid launch start'
 elapsed=now-start
 assert math.isfinite(elapsed) and 0<=elapsed<600,'expired/future launch start'
 return 600-elapsed
signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('600-second whole-child readback')))
signal.setitimer(signal.ITIMER_REAL,remaining_from(start,time.monotonic()))
assert len(sys.argv)==3,'exact binding/review SHA arguments required'
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-h-bridge-full-readback-runner-proposal-r4'
runner=P/'readback.py'
spec=P/'SPEC.json'
binding=S/'1370-c0-h-bridge-full-readback-filled-exact-r4/BINDING.json'
review=S/'1370-c0-h-bridge-full-readback-independent-static-review-r4/RECEIPT.json'
addendum=S/'1370-c0-h-bridge-addendum-independent-static-review-r3/RECEIPT.json'
pins={runner:'c66b395388c5d49527d719d454bf870291d908c582e02609dd4ec0306548ad94',spec:'ce31357835802a711b346e72b2293ee6ded86d09ed3ffa4b9a046d838d50a2c0',binding:sys.argv[1],review:sys.argv[2],addendum:'2d68b3686fea754398a76265b632a1c37bf58444169b9201f56982cfdc187eb6'}
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
    assert time.monotonic()-start<600
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
assert json.loads(raw[review])['decision']=='ACCEPT_STATIC_H_BRIDGE_FULL_READBACK_ONLY'
assert json.loads(raw[addendum])['decision']=='ACCEPT_STATIC_H_BRIDGE_ADDENDUM_ONLY'
assert json.loads(raw[binding])['bridgeStaticReviewSha256']==pins[addendum]
assert json.loads(raw[binding])['bridgeObservedReviewSha256']=='f2baf6d6f44b3582f3a70384c1c3acae2a328de254101dad076d428c9ea57a9d'
exec(compile(raw[runner],str(runner),'exec'),{'__name__':'__main__','__file__':str(runner),'_BOOTSTRAP_START':start,'_BINDING_PATH':str(binding)})
