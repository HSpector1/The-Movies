"""Tiny owned filesystem RED/GREEN only; no historical source/dependency copy."""
import hashlib,importlib.util,json,os,stat,sys,tempfile
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('materialize',Path(sys.argv[1])/'materialize.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
results=[]
def case(name,fn):
 try:fn();results.append({'name':name,'status':'PASS'})
 except Exception as e:results.append({'name':name,'status':'FAIL','exception':type(e).__name__,'message':str(e)})
def modecase(mask,wanted,explicit):
 prior=os.umask(mask)
 try:
  with tempfile.TemporaryDirectory(prefix='1370-r6-mode-') as t:
   p=Path(t)/'nested/payload';raw=b'tiny mode data'
   m.write_exclusive(p,raw,wanted) if explicit else m.write_exclusive(p,raw)
   assert stat.S_IMODE(p.lstat().st_mode)==wanted,(oct(mask),oct(stat.S_IMODE(p.lstat().st_mode)),oct(wanted))
   assert p.read_bytes()==raw and p.lstat().st_nlink==1
 finally:os.umask(prior)
def helper_manifest():
 prior=os.umask(0);os.umask(prior);assert prior==0o077,'must record through actual accepted helper077'
 with tempfile.TemporaryDirectory(prefix='1370-r6-manifest-') as t:
  root=Path(t);manifest={}
  for name,data in (('package.json',b'{}\n'),('src/core/example.ts',b'export const value=1\n'),('tests/tiny.fixture',b'\x00\xff\n')):
   m.write_exclusive(root/name,data);manifest[name]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'oid':hashlib.sha1(('blob '+str(len(data))+'\0').encode()+data).hexdigest(),'mode':'100644'}
  actual=m.physical_source_paths(root)
  expected={name:{'type':'regular','mode':0o644,'bytes':row['bytes'],'links':1,'sha256':row['sha256']} for name,row in manifest.items()}
  assert actual==expected,(actual,expected)
  if hasattr(m,'assert_physical_checkout'):m.assert_physical_checkout(actual,manifest)
def exclusive_existing():
 with tempfile.TemporaryDirectory(prefix='1370-r6-existing-') as t:
  p=Path(t)/'neighbor';p.write_bytes(b'keep');p.chmod(0o640);before=p.lstat()
  try:m.write_exclusive(p,b'overwrite')
  except FileExistsError:pass
  else:raise AssertionError('existing file admitted')
  assert p.read_bytes()==b'keep' and stat.S_IMODE(p.lstat().st_mode)==0o640 and p.lstat().st_ino==before.st_ino
 def failure_cleanup():pass
def fchmod_failure():
 with tempfile.TemporaryDirectory(prefix='1370-r6-failmode-') as t:
  root=Path(t);p=root/'new';neighbor=root/'keep';neighbor.write_bytes(b'neighbor');calls=[]
  def fail(fd,mode):calls.append(fd);raise OSError('injected chmod failure')
  with patch.object(m.os,'fchmod',side_effect=fail):
   try:m.write_exclusive(p,b'never visible success')
   except OSError:pass
   else:raise AssertionError('fchmod failure ignored')
  assert len(calls)==1 and not p.exists() and neighbor.read_bytes()==b'neighbor'
  try:os.fstat(calls[0])
  except OSError:pass
  else:raise AssertionError('exclusive fd leaked')
def bounded_diff():
 manifest={f'src/{i:02}.ts':{'bytes':3,'sha256':hashlib.sha256(b'abc').hexdigest(),'mode':'100644','oid':'irrelevant'} for i in range(12)}
 actual={name:{'type':'regular','mode':0o600,'bytes':3,'links':1,'sha256':item['sha256']} for name,item in manifest.items()}
 try:m.assert_physical_checkout(actual,manifest)
 except m.Stop as exc:
  text=str(exc);assert text.startswith('physical sparse checkout differs; first differences=')
  value=json.loads(text.split('=',1)[1]);assert value['totalDifferingPaths']==12 and len(value['first'])==8
  assert value['first'][0]['actual']['mode']==0o600 and value['first'][0]['expected']['mode']==0o644
  assert 'abc' not in text and all(set(row)=={'path','actual','expected'} for row in value['first'])
 else:raise AssertionError('physical mismatch admitted')
for mask in (0o077,0o022):
 for mode,explicit in ((0o644,False),(0o600,True)):case(f'mask_{mask:03o}_mode_{mode:03o}',lambda mask=mask,mode=mode,explicit=explicit:modecase(mask,mode,explicit))
for name,fn in [('actual_helper077_tiny_source_manifest',helper_manifest),('exclusive_existing_file_preserved',exclusive_existing),('fchmod_failure_closes_and_removes_only_owned_file',fchmod_failure),('bounded_metadata_only_physical_diff',bounded_diff)]:case(name,fn)
print(json.dumps({'sourceRoot':sys.argv[1],'passed':sum(r['status']=='PASS' for r in results),'total':len(results),'tests':results,'claimLimit':'Tiny owned source-control files only, no historical checkout/dependency copy, game, witness/native fixture or production/Git mutation.'},sort_keys=True,indent=2))
sys.exit(0 if all(r['status']=='PASS' for r in results) else 1)
