#!/usr/bin/env python3
"""Static/fixture checks only. Never invokes the addendum or mutates the mirror."""
import ast,hashlib,importlib.util,io,json,os,pathlib,subprocess,tarfile,tempfile
ROOT=pathlib.Path(__file__).resolve().parent
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
inputs=json.loads((ROOT/'BRIDGE-INPUTS.json').read_bytes())
assert hashlib.sha256((ROOT/'BRIDGE-INPUTS.json').read_bytes()).hexdigest()=='2598b0c372eed48d9be04192eb7e33aa52e398a9323d4e2155c176e4cce5efaa'
ast.parse((ROOT/'add_bridge.py').read_text())
for arm,count,total in [('H',58,1357248),('M0',63,1517743)]:
 a=inputs['arms'][arm]
 assert a['fileCount']==count and a['totalBytes']==total
 assert len(a['files'])==count and sum(r['bytes'] for r in a['files'])==total
 assert all(r['mode']=='100644' and r['kind']=='blob' and r['path'].startswith('bridge/') and '..' not in pathlib.PurePosixPath(r['path']).parts for r in a['files'])
 p=subprocess.run(['git','rev-parse',a['sourceCommit']+':bridge'],cwd=REPO,capture_output=True,check=True)
 assert p.stdout.decode().strip()==a['bridgeTree']
 p=subprocess.run(['git','ls-tree','-rl','-z',a['sourceCommit'],'bridge'],cwd=REPO,capture_output=True,check=True)
 observed=[]
 for rec in p.stdout.split(b'\0'):
  if rec:
   head,path=rec.split(b'\t',1);mode,kind,oid,size=head.decode().split();observed.append({'path':path.decode(),'mode':mode,'kind':kind,'oid':oid,'bytes':int(size)})
 assert observed==a['files']
 if arm=='H':
  tar=subprocess.run(['git','archive','--format=tar',a['sourceCommit'],'bridge'],cwd=REPO,capture_output=True,check=True)
  file_rows=[];dirs=[]
  for member in tarfile.open(fileobj=io.BytesIO(tar.stdout)):
   if member.isdir():
    assert member.mode==0o775 and member.name.startswith('bridge/') or member.name=='bridge'
    dirs.append(member.name)
   else:
    assert member.isfile() and member.mode==0o664
    file_rows.append((member.name,member.size))
  assert file_rows==[(r['path'],r['bytes']) for r in a['files']]
  assert dirs==['bridge','bridge/runtime','bridge/schema','bridge/supervisor','bridge/testing']
spec=importlib.util.spec_from_file_location('bridge_addendum_static',ROOT/'add_bridge.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
with tempfile.TemporaryDirectory(prefix='bridge-addendum-static-',dir=ROOT) as tmp:
 t=pathlib.Path(tmp);(t/'real').mkdir();payload=t/'real/pin.json';payload.write_bytes(b'{"ok":true}\n')
 pin=hashlib.sha256(payload.read_bytes()).hexdigest()
 assert module.read_pin(payload,pin,100)==b'{"ok":true}\n'
 (t/'alias').symlink_to(t/'real',target_is_directory=True)
 for bad in [t/'alias/pin.json',t/'real/symlink.json']:
  if bad.name=='symlink.json':bad.symlink_to(payload)
  try:module.read_pin(bad,pin,100)
  except (OSError,RuntimeError):pass
  else:raise AssertionError('nofollow RED unexpectedly accepted '+str(bad))
 try:module.read_pin(payload,'0'*64,100)
 except RuntimeError:pass
 else:raise AssertionError('wrong SHA RED unexpectedly accepted')
 original_read=module.os.read
 try:
  module.os.read=lambda fd,count:b'x'*13
  try:module.read_pin(payload,pin,12)
  except RuntimeError as error:assert 'grew beyond cap' in str(error)
  else:raise AssertionError('stream growth RED unexpectedly accepted')
 finally:module.os.read=original_read
 (t/'mirror-parent').mkdir();(t/'mirror-parent/mirror').mkdir()
 real_mirror=t/'mirror-parent/mirror';module.MIRROR=real_mirror
 module.attach_mirror();module.mirror_guard()
 os.rename(t/'mirror-parent',t/'moved-parent')
 (t/'mirror-parent').symlink_to(t/'moved-parent',target_is_directory=True)
 try:module.mirror_guard()
 except (OSError,RuntimeError):pass
 else:raise AssertionError('mirror parent replacement RED unexpectedly accepted')
 os.close(module.MIRROR_FD);module.MIRROR_FD=None
os.environ['GIT_OBJECT_DIRECTORY']='injected'
assert 'GIT_OBJECT_DIRECTORY' not in module.clean_env()
del os.environ['GIT_OBJECT_DIRECTORY']
source=(ROOT/'add_bridge.py').read_text()
assert source.count('env=clean_env()')==2 and 'scrub_ambient_git()\n signal.signal' in source
assert 'proof[\'dependencyLink\']==tuple(prior[\'sourceAfter\'][\'dependencyLink\'])' in source
assert "dir_fd=out_parent" in source and 'same_parent(OUT,out_chain)' in source
assert 'fd=os.dup(MIRROR_FD)' in source and 'mirror_guard()' in source
print(json.dumps({'decision':'PASS_STATIC_FIXTURE_ONLY','H':{'files':58,'bytes':1357248},'M0':{'files':63,'bytes':1517743},'addendumUnrun':True},sort_keys=True))
