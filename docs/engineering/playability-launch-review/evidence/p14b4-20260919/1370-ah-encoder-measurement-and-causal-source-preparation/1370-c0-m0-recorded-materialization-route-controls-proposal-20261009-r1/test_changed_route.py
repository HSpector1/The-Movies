#!/usr/bin/env python3
"""UNRUN changed-route controls. Only own scratch files and tiny stub children.
Root supplies exact independently accepted source package and grants execution.
"""
import argparse,copy,hashlib,importlib.util,json,os,stat,sys,time,unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

S=Path('/Users/zacheryspector/studio-scratch')
AUTH={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
def sha(raw):return hashlib.sha256(raw).hexdigest()
def canon(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
def put(p,v):p.write_bytes(canon(v)+b'\n');return sha(p.read_bytes())
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def prepare(args):
 source=Path(args.source_dir);root=Path(args.output_root)
 assert sys.dont_write_bytecode and not sys.flags.optimize
 assert source.is_absolute() and source.resolve(strict=True)==source
 pinsraw=(source/'SOURCE-PINS.json').read_bytes();assert sha(pinsraw)==args.source_pins_sha
 pins=json.loads(pinsraw)
 for name,role in pins['files'].items():
  digest=role if isinstance(role,str) else role['sha256'];assert sha((source/name).read_bytes())==digest,name
 reviewraw=Path(args.route_review).read_bytes();assert sha(reviewraw)==args.route_review_sha
 review=json.loads(reviewraw);assert review['decision'].startswith('ACCEPT_SOURCE_ONLY_UNRUN')
 assert review['recorderSha256']==sha((source/'record.py').read_bytes())
 assert review['supervisorSha256']==sha((source/'supervise.py').read_bytes())
 assert root.is_absolute() and root.parent==S and not os.path.lexists(root)
 root.mkdir(mode=0o700)
 return source,root,review

STUB='''import json,os,sys,time\nfrom pathlib import Path\nmode,specpath=sys.argv[1:];s=json.loads(Path(specpath).read_bytes());root=Path(s['scratchRoot']);root.mkdir(mode=0o700);leaf=Path(s['mirrorPath']);leaf.mkdir(mode=0o700)\n(leaf/'owned-partial.txt').write_text('owned control leaf only\\n');sys.stderr.write('owned stub stage before result\\n');sys.stderr.flush()\nif mode=='stop':raise SystemExit(2)\nif mode=='timeout':time.sleep(8);raise SystemExit(3)\nif mode=='cap':sys.stdout.buffer.write(b'x'*(32*1024**2+1));sys.stdout.buffer.flush();raise SystemExit(0)\nr={'status':'MIRROR_MATERIALIZED_SOURCE_ONLY','arm':'M0','runId':s['runId'],'mirrorPath':s['mirrorPath'],'sourceCommit':s['sourceSha'],'sourceTree':s['productionSourceTree'],'sourceManifestSha256':s['m0SourceManifestSha256'],'sourceReviewSha256':s['m0ObserverSourceReviewSha256'],'sourceBytes':117828630,'overlayFiles':s['expectedOverlayFiles']}\nif mode.startswith('bad-'):\n key=mode[4:]\n if key=='overlayFiles':r[key]=[]\n elif key=='sourceBytes':r[key]+=1\n else:r[key]='wrong'\np=Path(s['materializeReceiptPath']);p.write_text(json.dumps(r))\nimport hashlib\nprint(json.dumps({'status':'MIRROR_MATERIALIZED_SOURCE_ONLY','runId':s['runId'] if mode!='stdout-run' else 'wrong','receiptSha256':hashlib.sha256(p.read_bytes()).hexdigest() if mode!='stdout-sha' else '0'*64}))\n'''

class Controls(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.rec=load('m0_changed_recorder',SOURCE/'record.py');cls.sup=load('m0_changed_supervisor',SOURCE/'supervise.py')
  cls.template=json.loads((SOURCE/'BINDING-UNFILLED.json').read_bytes())
  cls.stub=ROOT/'stub.py';cls.stub.write_text(STUB);cls.seq=0
 def workspace(self,name):
  type(self).seq+=1;p=ROOT/(str(self.seq)+'-'+name);p.mkdir(mode=0o700);return p
 def accepted_mock_spec(self,w):
  s=copy.deepcopy(self.template);s.update(status='REVIEWED_FILLED_UNRUN',executionAuthorization=True,
   outputParent=str(w),outputRoot=str(w/'out'),scratchParent=str(w),scratchRoot=str(w/'mirror'),recorderLockPath=str(w/'lock'),
   routeSourceReviewPath=ARGS.route_review,routeSourceReviewSha256=ARGS.route_review_sha,
   routeSourceReviewDecision=REVIEW['decision'],preflightReviewPath=str(w/'preflight.json'),exactBindingReviewPath=str(w/'exact.json'),exactBindingReviewDecision='ACCEPT_EXACT_FILLED_UNRUN')
  # The accepted validated_spec has fixed one-shot materializer roles: admission
  # tests restore those fields; lane stub tests keep this owned workspace instead.
  return s
 def seal(self,s,w):
  core=sha(canon({k:v for k,v in s.items() if k not in AUTH|{'preflightReviewPath','preflightReviewSha256'}}))
  s['preflightReviewSha256']=put(w/'preflight.json',{'decision':'ACCEPT_M0_MATERIALIZATION_PREFLIGHT','guardCoreSha256':core,'productionHead':s['productionHead'],'freshProductionCommonFullProofAccepted':True,'r9PrivateRootReuseExplicitlyAccepted':True})
  semantic=sha(canon({k:v for k,v in s.items() if k not in AUTH}))
  s['exactBindingReviewSha256']=put(w/'exact.json',{'decision':'ACCEPT_EXACT_FILLED_UNRUN','bindingSemanticSha256':semantic})
  put(w/'binding.json',s);return w/'binding.json'
 def admission(self,change=None,reseal=False):
  w=self.workspace('admission');s=self.accepted_mock_spec(w)
  for k in ('scratchParent','scratchRoot','runId','mirrorPath','materializeReceiptPath'):s[k]=self.template[k]
  path=self.seal(s,w)
  if change:
   change(s)
   if reseal:path=self.seal(s,w)
   else:put(path,s)
  with patch.object(self.rec,'safe_parent'),patch.object(self.rec,'quick_guards'),patch.object(self.rec.shutil,'disk_usage',return_value=SimpleNamespace(free=9*1024**3)):
   return self.rec.validated_spec(path)
 def test_01_noncircular_admission_positive(self):
  self.assertEqual(self.admission()['productionHead'],self.template['productionHead'])
 def test_02_auth_source_review_semantic_reds(self):
  mutations=[lambda s:s.update(status='DRAFT'),lambda s:s.update(executionAuthorization=False),lambda s:s.update(materializerSha256='0'*64),lambda s:s.update(recorderSha256='0'*64),lambda s:s.update(supervisorSha256='0'*64),lambda s:s.update(routeSourceReviewSha256='0'*64),lambda s:s.update(sourceSha='0'*40),lambda s:s.update(exactBindingReviewSha256='0'*64),lambda s:s.update(materializerArgv=s['materializerArgv']+['wrong'])]
  for i,fn in enumerate(mutations):
   with self.subTest(i=i),self.assertRaises(self.rec.Stop):self.admission(fn)
 def test_03_full_semantic_and_guard_core_reds(self):
  # Core mutation invalidates full semantic. Updating only exact semantic then
  # still fails preflight core: both actual checks must run.
  with self.assertRaises(self.rec.Stop):self.admission(lambda s:s.update(noDetachedChildren=False))
  def old_core_new_exact(s):
   s['strictRootMetadata']={'wrong':[1]}
   value={'decision':'ACCEPT_EXACT_FILLED_UNRUN','bindingSemanticSha256':sha(canon({k:v for k,v in s.items() if k not in AUTH}))}
   s['exactBindingReviewSha256']=put(Path(s['exactBindingReviewPath']),value)
  with self.assertRaises(self.rec.Stop):self.admission(old_core_new_exact)
 def test_04_preflight_scope_reds(self):
  for field in ('guardCoreSha256','productionHead','freshProductionCommonFullProofAccepted','r9PrivateRootReuseExplicitlyAccepted'):
   w=self.workspace('preflight-red');s=self.accepted_mock_spec(w)
   for k in ('scratchParent','scratchRoot','runId','mirrorPath','materializeReceiptPath'):s[k]=self.template[k]
   path=self.seal(s,w);r=json.loads((w/'preflight.json').read_bytes());r[field]=False if isinstance(r[field],bool) else 'wrong';s['preflightReviewSha256']=put(w/'preflight.json',r)
   s['exactBindingReviewSha256']=put(w/'exact.json',{'decision':'ACCEPT_EXACT_FILLED_UNRUN','bindingSemanticSha256':sha(canon({k:v for k,v in s.items() if k not in AUTH}))});put(path,s)
   with self.subTest(field=field),patch.object(self.rec,'safe_parent'),patch.object(self.rec,'quick_guards'),patch.object(self.rec.shutil,'disk_usage',return_value=SimpleNamespace(free=9*1024**3)),self.assertRaises(self.rec.Stop):self.rec.validated_spec(path)
 def guard_spec(self):
  s=copy.deepcopy(self.template);h='/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2';s['retainedHLeafPath']=h+'/admitted-control-name'
  r9='/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materialized-r6-20261008-r1'
  roots={s['productionRoot'],s['commonGitRoot'],s['commonGitRoot']+'/objects',s['productionRoot']+'/node_modules',r9,r9+'/.git',r9+'/node_modules',h,s['retainedHLeafPath']}
  s['strictRootMetadata']={p:[1,2,0o700,3,4] for p in roots};s['ancestryIdentity']={str(p):[1,2,0o700] for root in roots for p in [Path(root),*Path(root).parents]}
  s['toolRoles']={p:{'identity':[1,2,0o755,76 if p=='/usr/bin/git' else 1],'sha256':'a'*64} for p in [s['pythonPath'],s['gitPath'],s['lsofPath'],'/usr/bin/pmset','/usr/sbin/sysctl']};return s
 def mock_quick(self,s):
  def attrs(p):
   if str(p) in s['toolRoles']:return SimpleNamespace(st_dev=1,st_ino=2,st_mode=stat.S_IFREG|0o755,st_nlink=76 if str(p)=='/usr/bin/git' else 1)
   return SimpleNamespace(st_dev=1,st_ino=2,st_mode=stat.S_IFDIR|0o700,st_mtime_ns=3,st_ctime_ns=4)
  def command(argv,**kw):
   if argv[-1]=='HEAD':return (s['productionHead']+'\n').encode()
   if argv[-1]=='HEAD:src':return (s['productionSourceTree']+'\n').encode()
   if argv[-1]=='kern.bootsessionuuid':return (s['bootSessionUuid']+'\n').encode()
   if 'status' in argv:return b''
   if 'ls-remote' in argv:return (s['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts\n').encode()
   if argv[0]=='/usr/bin/pmset':return b'AC Power'
   raise AssertionError(argv)
  with patch.object(Path,'resolve',lambda p,strict=False:p),patch.object(Path,'lstat',attrs),patch.object(self.rec,'file_sha',return_value='a'*64),patch.object(self.rec.os,'access',return_value=True),patch.object(self.rec.shutil,'disk_usage',return_value=SimpleNamespace(free=9*1024**3)),patch.object(self.rec._g,'command',side_effect=command),patch.object(self.rec._g,'assert_no_protected_writable_fds'):
   self.rec.quick_guards(s)
 def test_05_quick_roles_positive_and_reds(self):
  self.mock_quick(self.guard_spec())
  mutations=[lambda s:s.update(retainedHLeafPath='/wrong'),lambda s:s['strictRootMetadata'].pop(s['productionRoot']),lambda s:s.update(additionalFdScopes=[]),lambda s:s.update(gitPath='/wrong/git'),lambda s:s['toolRoles'].pop('/usr/bin/pmset'),lambda s:s['ancestryIdentity'].pop('/')]
  for i,fn in enumerate(mutations):
   s=self.guard_spec();fn(s)
   with self.subTest(i=i),self.assertRaises(self.rec.Stop):self.mock_quick(s)
 def test_06_supervisor_output_collisions_before_fork(self):
  w=self.workspace('no-detach-red');s=self.accepted_mock_spec(w);s['noDetachedChildren']=False;path=self.seal(s,w)
  with self.assertRaises(self.sup.Stop):self.sup.read_roles(path)
  for role in ('outputRoot','scratchRoot','recorderLockPath'):
   w=self.workspace('collision');s=self.accepted_mock_spec(w);s['outputParent']=s['scratchParent']=str(S)
   # read_roles has the accepted direct scratch parent; collision-only patch to
   # its PARENT is owned workspace, never a protected path.
   s['outputParent']=s['scratchParent']=str(w);Path(s[role]).mkdir();path=self.seal(s,w)
   with self.subTest(role=role),patch.object(self.sup,'PARENT',w),self.assertRaises(self.sup.Stop):self.sup.read_roles(path)
 def actual_stub(self,mode,timeout=False,final_cap=False):
  w=self.workspace(mode);s=self.accepted_mock_spec(w);s['mirrorPath']=s['scratchRoot']+'/owned-leaf';s['materializeReceiptPath']=s['scratchRoot']+'/owned-leaf.MATERIALIZE-RESULT.json';path=w/'binding.json';put(path,s)
  s['materializerArgv']=[s['pythonPath'],'-I','-B',str(self.stub),mode,str(path)]
  readfd,writefd=os.pipe();previous=os.environ.get('SPARSE_1370_SUPERVISOR_FD');os.environ['SPARSE_1370_SUPERVISOR_FD']=str(writefd)
  try:
   original_stat=Path.stat;original_waitpid=os.waitpid;reaped=[False]
   def controlled_waitpid(pid,flags):
    result=original_waitpid(pid,flags)
    if result[0]==pid:reaped[0]=True
    return result
   def controlled_stat(p,*a,**kw):
    actual=original_stat(p,*a,**kw)
    # Force the after-reap bound independently of monitor timing, while the
    # child actually writes the over-cap file and exits in its owned group.
    if final_cap and p.name in ('child.stdout','child.stderr') and not reaped[0]:return SimpleNamespace(st_size=0)
    return actual
   with patch.object(self.rec,'validated_spec',return_value=s),patch.object(self.rec,'quick_guards'),patch.object(self.rec,'MAX_WHOLE_SECONDS',0.5 if timeout else 8),patch.object(self.rec.os,'waitpid',side_effect=controlled_waitpid),patch.object(Path,'stat',controlled_stat):result=self.rec.lane(path)
  finally:
   os.close(writefd)
   if previous is None:os.environ.pop('SPARSE_1370_SUPERVISOR_FD',None)
   else:os.environ['SPARSE_1370_SUPERVISOR_FD']=previous
  report=os.read(readfd,256);os.close(readfd);self.assertEqual(report,str(result['childPid']).encode()+b'\n');self.assertTrue(result['groupClear']);self.assertFalse(self.rec.still_alive(result['childPid']));self.assertFalse(Path(s['recorderLockPath']).exists());self.assertTrue((Path(s['mirrorPath'])/'owned-partial.txt').is_file());self.assertIn(b'owned stub stage',(Path(s['outputRoot'])/'child.stderr').read_bytes())
  if mode=='success':self.assertEqual(result['status'],'MATERIALIZED_UNREVIEWED_UNRUN')
  else:self.assertEqual(result['status'],'STOP');self.assertTrue(result['partialMirrorPreserved'])
  if timeout:self.assertIn('deadline',result['stopReason'])
  if mode=='cap':self.assertIn('log cap',result['stopReason'])
  if final_cap:self.assertIn('final child-log cap',result['stopReason'])
  # Exercise changed supervisor retained-partial finalization using this actual
  # reaped child as a known cleared group; no live/unowned group is signaled.
  bound=(s,Path(s['outputRoot']),Path(s['scratchRoot']),Path(s['recorderLockPath']),sha(path.read_bytes()));observed={'childGroup':result['childPid'],'workerExit':2,'timedOut':False}
  final=self.sup.finalize_bound(path,bound,observed,result['childPid'],time.monotonic(),8,failure='owned control finalization STOP')
  self.assertEqual(final['status'],'STOP');self.assertTrue(final['partialMirrorPreserved']);self.assertTrue(Path(s['mirrorPath']).is_dir());self.assertTrue(final['workerGroupClear']);self.assertTrue(final['childGroupClear'])
  return result
 def test_07_actual_success_readygo_cleanup(self):self.actual_stub('success')
 def test_08_actual_stop_retains_stderr_leaf_cleanup(self):self.actual_stub('stop')
 def test_09_actual_timeout_cleanup(self):self.actual_stub('timeout',True)
 def test_10_actual_fast_exit_log_cap(self):self.actual_stub('cap')
 def test_11_actual_fast_exit_after_reap_cap(self):self.actual_stub('cap',final_cap=True)
 def test_12_child_stdout_role_reds(self):
  for mode in ('stdout-run','stdout-sha'):
   with self.subTest(mode=mode):self.actual_stub(mode)
 def test_13_child_sibling_role_reds(self):
  for key in ('arm','runId','mirrorPath','sourceCommit','sourceTree','sourceManifestSha256','sourceReviewSha256','sourceBytes','overlayFiles'):
   with self.subTest(field=key):self.actual_stub('bad-'+key)

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--source-dir',required=True);ap.add_argument('--source-pins-sha',required=True);ap.add_argument('--route-review',required=True);ap.add_argument('--route-review-sha',required=True);ap.add_argument('--output-root',required=True);ARGS=ap.parse_args();SOURCE,ROOT,REVIEW=prepare(ARGS)
 result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Controls))
 summary={'status':'CONTROLS_PASS' if result.wasSuccessful() else 'CONTROLS_STOP','sourceDir':str(SOURCE),'sourcePinsSha256':ARGS.source_pins_sha,'routeReviewPath':ARGS.route_review,'routeReviewSha256':ARGS.route_review_sha,'testsRun':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),'claimLimit':'Mocked admission plus owned stub controls only. No materialization/Git/game/dependency scan/protected mutation.'};put(ROOT/'RESULT.json',summary);print(json.dumps(summary,sort_keys=True));raise SystemExit(0 if result.wasSuccessful() else 1)
