"""Focused bounded source RED/GREEN only. No historical copy or dependency execution."""
import hashlib, importlib.util, json, os, subprocess, sys, tempfile
from pathlib import Path
from unittest.mock import patch
ROOT=Path(sys.argv[1])
spec=importlib.util.spec_from_file_location('materialize',ROOT/'materialize.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
B={'xattrPath':'/usr/bin/xattr','lsPath':'/bin/ls','lsofPath':'/usr/sbin/lsof','productionRoot':'/protected/production','commonGitRoot':'/protected/common.git'}
results=[]
def case(name,fn):
 try: fn(); results.append({'name':name,'status':'PASS'})
 except Exception as e: results.append({'name':name,'status':'FAIL','exception':type(e).__name__,'message':str(e)})
def stop(fn):
 try: fn()
 except m.Stop: return
 raise AssertionError('expected STOP')
def actual_inventory():
 with tempfile.TemporaryDirectory(prefix='1370-r5-xattr-') as t:
  root=Path(t); f=root/'payload'; f.write_bytes(b'payload'); link=root/'contained-link'; link.symlink_to('payload')
  subprocess.run(['/usr/bin/xattr','-w','-x','com.example.r5binary','00ff1020',str(f)],check=True,capture_output=True)
  subprocess.run(['/usr/bin/xattr','-w','com.example.r5empty','',str(f)],check=True,capture_output=True)
  inv=m.inventory(root,B)
  assert inv['payload']['xattrs']['com.example.r5binary']==hashlib.sha256(b'\x00\xff\x10\x20').hexdigest()
  assert inv['payload']['xattrs']['com.example.r5empty']==hashlib.sha256(b'').hexdigest()
  assert 'com.example.r5binary' not in inv['contained-link']['xattrs'], 'link followed target attrs'
  assert inv['contained-link']['target']=='payload'
def mock_xattr():
 calls=[]
 def command(argv,**kwargs):
  calls.append(argv)
  return b'com.example.z\ncom.example.a\n' if '-p' not in argv else (b'00 FF 10\n' if 'com.example.z' in argv else b'')
 with patch.object(m,'command',side_effect=command):
  got=m.xattr_snapshot(Path('/scratch/link'),B)
 assert got=={'com.example.a':hashlib.sha256(b'').hexdigest(),'com.example.z':hashlib.sha256(b'\x00\xff\x10').hexdigest()}
 assert all('-s' in argv for argv in calls) and all(argv[0]=='/usr/bin/xattr' for argv in calls)
def malformed_xattr():
 for listing in (b'name\nname\n',b'name\x00\n',b'\xff\n',b'name',b'\n',b'-option\n'):
  with patch.object(m,'command',return_value=listing): stop(lambda:m.xattr_snapshot(Path('/scratch/file'),B))
 for value in (b'0',b'zz',b'00(offset)',b'00\x00',b'0x00'):
  with patch.object(m,'command',side_effect=[b'name\n',value]): stop(lambda:m.xattr_snapshot(Path('/scratch/file'),B))
 with patch.object(m,'command',side_effect=m.Stop('command failed')): stop(lambda:m.xattr_snapshot(Path('/scratch/file'),B))
def access_fields():
 for access in (b'u',b'w'):
  with patch.object(m,'command',return_value=b'p91\0\nf3\0a'+access+b'\0tREG\0n/protected/production/file\0'):
   stop(lambda:m.assert_no_protected_writable_fds(B))
 with patch.object(m,'command',return_value=b'p91\0\nf3\0ar\0tREG\0n/protected/production/file\0'):
  m.assert_no_protected_writable_fds(B)
 for access in (b'',b'a?\0'):
  with patch.object(m,'command',return_value=b'p91\0\nf3\0'+access+b'tREG\0n/protected/production/file\0'):
   stop(lambda:m.assert_no_protected_writable_fds(B))
 with patch.object(m,'command',return_value=b'p91\0\nf3\0au\0tREG\0n/unprotected/file\0f4\0ar\0tREG\0n/protected/production/file\0'):
  m.assert_no_protected_writable_fds(B)
def actual_owned_fd():
 with tempfile.TemporaryDirectory(prefix='1370-r5-fd-') as t:
  root=Path(t); other=root/'other'; other.mkdir(); prod=root/'protected'; prod.mkdir()
  binding=dict(B,productionRoot=str(prod),commonGitRoot=str(other))
  with (prod/'own-canary').open('wb') as f:
   f.write(b'tiny'); f.flush(); stop(lambda:m.assert_no_protected_writable_fds(binding))
  m.assert_no_protected_writable_fds(binding)
for name,fn in [('actual_darwin_binary_empty_attrs_link_nofollow',actual_inventory),('xattr_parser_exact_bytes_and_nofollow_argv',mock_xattr),('xattr_malformed_and_command_failures_stop',malformed_xattr),('lsof_explicit_access_without_fd_suffix',access_fields),('real_owned_scratch_writable_fd',actual_owned_fd)]: case(name,fn)
print(json.dumps({'sourceRoot':str(ROOT),'tests':results,'passed':sum(r['status']=='PASS' for r in results),'total':len(results),'claimLimit':'Tiny owned scratch/CLI source controls; no historical materialization, game/native fixture or dependency execution.'},sort_keys=True,indent=2))
sys.exit(0 if all(r['status']=='PASS' for r in results) else 1)
