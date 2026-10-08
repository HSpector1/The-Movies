"""Synthetic spec refusals only; no network, Git, or archive reads."""
import copy,json,os,tempfile
from pathlib import Path
from unittest import TestCase,main,mock
import audit as a

class SpecTests(TestCase):
 @classmethod
 def setUpClass(cls):
  src=Path('/Users/zacheryspector/studio-scratch/1370-c0-stage37-remote-audit-design-r1/SPEC-TEMPLATE.json')
  x=json.loads(src.read_text());a.TIP='0'*40;a.PUBLISH_RESULT_SHA='1'*64
  x.update(schema='1370-c0-stage37-fresh-https-remote-audit-spec-r2',
           classification='PUBLISHED_REMOTE_BYTES_PENDING',tip=a.TIP,
           publicationResultSha256=a.PUBLISH_RESULT_SHA)
  cls.good=x
 def rejected(self,change):
  x=copy.deepcopy(self.good);change(x)
  with self.assertRaises(RuntimeError):a.validate_spec(x)
 def test_good_roster(self):self.assertEqual(len(a.validate_spec(self.good)),191)
 def test_wrong_tip(self):self.rejected(lambda x:x.__setitem__('tip','2'*40))
 def test_wrong_parent(self):self.rejected(lambda x:x.__setitem__('parent','2'*40))
 def test_wrong_result_pin(self):self.rejected(lambda x:x.__setitem__('publicationResultSha256','2'*64))
 def test_wrong_source(self):self.rejected(lambda x:x.__setitem__('sourceHead','2'*40))
 def test_duplicate(self):self.rejected(lambda x:x['files'][1].__setitem__('path',x['files'][0]['path']))
 def test_traversal(self):self.rejected(lambda x:x['files'][0].__setitem__('path',x['prefix']+'../outside'))
 def test_bad_oid(self):self.rejected(lambda x:x['files'][0].__setitem__('gitBlob','z'*40))
 def test_wrong_byte_sum(self):self.rejected(lambda x:x['files'][0].__setitem__('bytes',0))
 def test_wrong_h_receipt(self):
  self.rejected(lambda x:next(r for r in x['files'] if r['path'].endswith('manifest-independent-review-r2/H-RECEIPT.json')).__setitem__('sha256','0'*64))
 def test_wrong_r8_stop(self):
  self.rejected(lambda x:next(r for r in x['files'] if r['path'].endswith('route-stop-r8-r1/RECEIPT.json')).__setitem__('sha256','0'*64))
 @mock.patch('audit.cmd')
 def test_source_guard_remote_ref_drift(self,cmd):
  def answer(*args,**_):
   if args[:3]==('git','rev-parse','HEAD'):return a.HEAD
   if args[:3]==('git','rev-parse','HEAD:src'):return a.TREE
   if args[:3]==('git','status','--porcelain=v1'):return ''
   if args[:4]==('git','remote','get-url','origin'):return a.ORIGIN
   if args[:3]==('git','ls-remote','origin'):return '2'*40+'\t'+a.PRODUCTION_REF
   raise AssertionError(args)
  cmd.side_effect=answer
  with self.assertRaisesRegex(RuntimeError,'production source or remote ref drift'):a.source_guard()
  self.assertTrue(any(c.args[:3]==('git','ls-remote','origin') for c in cmd.call_args_list))
 def test_dangling_alternates_symlink_refused(self):
  with tempfile.TemporaryDirectory(dir=a.S) as directory:
   work=Path(directory);info=work/'.git/objects/info';info.mkdir(parents=True)
   os.symlink(work/'missing-alternate',info/'alternates')
   self.assertFalse((info/'alternates').exists())
   with self.assertRaisesRegex(RuntimeError,'clone uses alternates'):a.no_alternates(work)
if __name__=='__main__':main()
