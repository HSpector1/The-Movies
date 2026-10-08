/bin/bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/c0-h-types-20261008-h-types-r11.lane.log /usr/local/bin/python3 -I -B -c 'import hashlib,json,math,os,pathlib,signal,stat,time
LAUNCH_START=time.monotonic()
def early_alarm(*_):raise TimeoutError('"'"'330-second H type recorder whole deadline before supervisor load'"'"')
signal.signal(signal.SIGALRM,early_alarm)
elapsed=time.monotonic()-LAUNCH_START
assert math.isfinite(elapsed) and 0<=elapsed<330
signal.setitimer(signal.ITIMER_REAL,330-elapsed)
S=pathlib.Path('"'"'/Users/zacheryspector/studio-scratch'"'"')
source=S/'"'"'1370-c0-h-typecheck-collection-recorder-proposal-r4/supervise.py'"'"'
review=S/'"'"'1370-c0-h-typecheck-recorder-r4-independent-static-review-r1/RECEIPT.json'"'"'
binding=S/'"'"'1370-c0-h-typecheck-collection-filled-exact-r13/BINDING.json'"'"'
pins={source:'"'"'cb7044bfc5ead3c1c80ebf96256e9bc3d873ca963a9e480082088411b00d61f2'"'"',
      review:'"'"'1e994441aa3b9ae409f1242a9fe46e4beec219b111a9d0d5171325904b9f9390'"'"',
      binding:'"'"'d9bb8b6fd4227e43b191003e3a98182404024f269933cc8de277473b0fb61cf9'"'"'}
assert all(len(x)==64 and set(x)<=set('"'"'0123456789abcdef'"'"') for x in pins.values())
def attrs(v):return v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns
def identity(v):return v.st_dev,v.st_ino,v.st_mode
def read_pin(path,pin,cap):
 assert path.is_absolute()
 parent=os.open('"'"'/'"'"',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);held=[parent]
 try:
  for component in path.parts[1:-1]:
   assert component not in ('"'"''"'"','"'"'.'"'"','"'"'..'"'"')
   before=os.stat(component,dir_fd=parent,follow_symlinks=False)
   child=os.open(component,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
   assert stat.S_ISDIR(before.st_mode) and identity(before)==identity(os.fstat(child))
   held.append(child);parent=child
  before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   assert attrs(before)==attrs(os.fstat(fd))
   pieces=[];count=0
   while piece:=os.read(fd,65536):
    assert 0<=time.monotonic()-LAUNCH_START<330
    count+=len(piece);assert count<=cap and count<=before.st_size
    pieces.append(piece)
   raw=b'"'"''"'"'.join(pieces)
   assert count==before.st_size and attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False))
  finally:os.close(fd)
  for i,component in enumerate(path.parts[1:-1]):
   assert identity(os.fstat(held[i+1]))==identity(os.stat(component,dir_fd=held[i],follow_symlinks=False))
  assert hashlib.sha256(raw).hexdigest()==pin
  return raw
 finally:
  for item in reversed(held):os.close(item)
raw={path:read_pin(path,pin,100000 if path!=source else 250000) for path,pin in pins.items()}
accepted=json.loads(raw[review])
assert accepted['"'"'decision'"'"']=='"'"'ACCEPT_STATIC_RECORDER_ONLY'"'"'
assert accepted['"'"'sourcePins'"'"']['"'"'supervise.py'"'"']==pins[source]
assert accepted['"'"'sourcePins'"'"']['"'"'BOOTSTRAP.py'"'"']=='"'"'7a63a2d8028ae5c2abb5b2b1b5bdf79a83887b8c809de7d7866f2a9a7dd5f223'"'"'
assert accepted['"'"'priorRecorderStaticReceiptSha256'"'"']=='"'"'14ac6279df85de332262d54e69726d185cdd4fe7806944d709350553998bbb6a'"'"'
assert accepted['"'"'hR13SourceStaticReceiptSha256'"'"']=='"'"'17514022b90852f03fa215d6748875d45eef0ae17270517cc2f55e1c8ba1cf08'"'"'
assert accepted['"'"'r11ObservedStopReceiptSha256'"'"']=='"'"'9b8e6587d415db0d0bbd12ecdff3d67eeb87b39928d70b84baed8ad61600cbb0'"'"'
bound=json.loads(raw[binding])
assert bound['"'"'runId'"'"']=='"'"'20261008-h-types-r11'"'"'
assert bound['"'"'fullReadbackObservedReceiptSha256'"'"']=='"'"'35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a'"'"'
assert bound['"'"'childWallSeconds'"'"']==300 and bound['"'"'recorderWallSeconds'"'"']==330
exec(compile(raw[source],str(source),'"'"'exec'"'"'),{'"'"'__name__'"'"':'"'"'__main__'"'"','"'"'__file__'"'"':str(source),
                                            '"'"'LAUNCH_START'"'"':LAUNCH_START,'"'"'BINDING_SHA'"'"':pins[binding]})
'
